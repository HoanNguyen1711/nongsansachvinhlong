import os
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy import func
from app.core.database import get_db
from app.core.config import settings
from app.routers.auth import get_current_user, require_role
from app.models.user import User
from app.models.analytics import ZoneDailyAnalytics, ZoneCountryAnalytics, ZoneDeviceAnalytics

router = APIRouter(prefix="/analytics", tags=["analytics"])

def generate_mock_data(start_date_dt, configured=False, error=None, days=7):
    daily_stats = []
    total_views = 0
    total_requests = 0
    
    # Beautiful mockup traffic pattern with stable random seed
    import random
    random.seed(42)
    
    for i in range(days):
        day_dt = start_date_dt + timedelta(days=i)
        # Add some variance but keep it realistic
        views = int(1500 + 400 * random.uniform(-1, 1) + (100 * (i % 7)))
        reqs = int(views * 3.1 + random.randint(100, 300))
        total_views += views
        total_requests += reqs
        
        daily_stats.append({
            "date": day_dt.strftime("%Y-%m-%d"),
            "views": views,
            "requests": reqs
        })
        
    return {
        "configured": configured,
        "error": error,
        "total_views": total_views,
        "total_requests": total_requests,
        "daily_stats": daily_stats,
        "referrers": [
            {"source": "google.com", "count": int(total_requests * 0.48), "percentage": 48},
            {"source": "Direct / Bookmarks", "count": int(total_requests * 0.26), "percentage": 26},
            {"source": "facebook.com", "count": int(total_requests * 0.18), "percentage": 18},
            {"source": "t.co (Twitter)", "count": int(total_requests * 0.05), "percentage": 5},
            {"source": "Others", "count": int(total_requests * 0.03), "percentage": 3}
        ],
        "devices": [
            {"device": "Mobile", "count": int(total_requests * 0.60), "percentage": 60},
            {"device": "Desktop", "count": int(total_requests * 0.35), "percentage": 35},
            {"device": "Tablet", "count": int(total_requests * 0.05), "percentage": 5}
        ],
        "countries": [
            {"country": "Việt Nam", "count": int(total_requests * 0.70), "percentage": 70},
            {"country": "Mỹ (USA)", "count": int(total_requests * 0.15), "percentage": 15},
            {"country": "Singapore", "count": int(total_requests * 0.10), "percentage": 10},
            {"country": "Khác", "count": int(total_requests * 0.05), "percentage": 5}
        ],
        "last_synced": datetime.now(timezone.utc).isoformat(),
        "total_views_alltime": total_views  # mock: use period total as proxy
    }

@router.get("/")
def get_analytics(
    current_user: Annotated[User, Depends(require_role(["super_admin", "admin"]))],
    db: Annotated[Session, Depends(get_db)],
    days: int = 7
):
    # Validate the days parameter
    if days not in [7, 14, 30]:
        days = 7

    # Determine the time ranges
    end_date_dt = datetime.now(timezone.utc)
    start_date_dt = end_date_dt - timedelta(days=days - 1)
    
    start_date = start_date_dt.date()
    end_date = end_date_dt.date()
    
    zone_id = settings.CLOUDFLARE_ZONE_ID
    api_token = settings.CLOUDFLARE_API_TOKEN
    
    # Check if Cloudflare settings are configured
    if not zone_id or not api_token:
        return generate_mock_data(start_date_dt, configured=False, days=days)
        
    # Query database for daily stats
    daily_records = db.exec(
        select(ZoneDailyAnalytics)
        .where(ZoneDailyAnalytics.date >= start_date)
        .where(ZoneDailyAnalytics.date <= end_date)
        .order_by(ZoneDailyAnalytics.date.asc())
    ).all()
    
    # If no records exist in the database, attempt an initial sync
    if not daily_records:
        try:
            from app.core.analytics_worker import sync_cloudflare_data
            sync_cloudflare_data(db)
            daily_records = db.exec(
                select(ZoneDailyAnalytics)
                .where(ZoneDailyAnalytics.date >= start_date)
                .where(ZoneDailyAnalytics.date <= end_date)
                .order_by(ZoneDailyAnalytics.date.asc())
            ).all()
        except Exception as e:
            print(f"Error during initial synchronous Cloudflare sync: {e}")
            return generate_mock_data(start_date_dt, configured=True, error=str(e), days=days)
            
    # If still no records after sync attempt, fallback to mock data
    if not daily_records:
        return generate_mock_data(start_date_dt, configured=True, error="No analytics data in database.", days=days)
        
    # Get last synced timestamp
    max_updated = db.exec(select(func.max(ZoneDailyAnalytics.updated_at))).first()
    last_synced_str = None
    if max_updated:
        if max_updated.tzinfo is None:
            max_updated = max_updated.replace(tzinfo=timezone.utc)
        last_synced_str = max_updated.isoformat()
        
    # Map daily stats, filling in gaps if any
    day_map = {}
    for i in range(days):
        d_val = start_date + timedelta(days=i)
        d_str = d_val.strftime("%Y-%m-%d")
        day_map[d_str] = {"date": d_str, "views": 0, "requests": 0}
        
    for r in daily_records:
        r_str = r.date.strftime("%Y-%m-%d")
        if r_str in day_map:
            day_map[r_str] = {
                "date": r_str,
                "views": r.page_views,
                "requests": r.requests
            }
            
    daily_stats = [day_map[k] for k in sorted(day_map.keys())]
    total_views = sum(item["views"] for item in daily_stats)
    total_requests = sum(item["requests"] for item in daily_stats)
    
    # Query devices
    devices_stmt = select(
        ZoneDeviceAnalytics.device_type, 
        func.sum(ZoneDeviceAnalytics.requests)
    ).where(
        ZoneDeviceAnalytics.date >= start_date
    ).group_by(
        ZoneDeviceAnalytics.device_type
    ).order_by(
        func.sum(ZoneDeviceAnalytics.requests).desc()
    ).limit(5)
    
    devices_results = db.exec(devices_stmt).all()
    
    devices = []
    dev_total = sum(row[1] for row in devices_results)
    for d_type, count in devices_results:
        percentage = round((count / dev_total) * 100) if dev_total > 0 else 0
        dev_label = "Desktop" if d_type.lower() == "desktop" else "Mobile" if d_type.lower() == "mobile" else "Tablet" if d_type.lower() == "tablet" else d_type.capitalize()
        devices.append({"device": dev_label, "count": count, "percentage": percentage})
        
    if not devices:
        devices = [{"device": "Desktop", "count": 0, "percentage": 100}]
        
    # Query countries
    countries_stmt = select(
        ZoneCountryAnalytics.country_code, 
        func.sum(ZoneCountryAnalytics.requests)
    ).where(
        ZoneCountryAnalytics.date >= start_date
    ).group_by(
        ZoneCountryAnalytics.country_code
    ).order_by(
        func.sum(ZoneCountryAnalytics.requests).desc()
    ).limit(5)
    
    countries_results = db.exec(countries_stmt).all()
    
    countries = []
    c_total = sum(row[1] for row in countries_results)
    for c_code, count in countries_results:
        percentage = round((count / c_total) * 100) if c_total > 0 else 0
        c_label = "Việt Nam" if c_code in ["VN", "Vietnam"] else "Mỹ (USA)" if c_code in ["US", "United States"] else "Singapore" if c_code == "SG" else c_code
        countries.append({"country": c_label, "count": count, "percentage": percentage})
        
    if not countries:
        countries = [{"country": "Việt Nam", "count": 0, "percentage": 100}]
        
    # Query all-time total page views (no date filter)
    total_views_alltime = db.exec(
        select(func.sum(ZoneDailyAnalytics.page_views))
    ).first() or 0

    return {
        "configured": True,
        "total_views": total_views,
        "total_requests": total_requests,
        "total_views_alltime": int(total_views_alltime),
        "daily_stats": daily_stats,
        "referrers": [{"source": "Direct / Unknown", "count": total_requests, "percentage": 100}],
        "devices": devices,
        "countries": countries,
        "last_synced": last_synced_str
    }

@router.post("/sync")
def trigger_sync(
    current_user: Annotated[User, Depends(require_role(["super_admin", "admin"]))],
    db: Annotated[Session, Depends(get_db)]
):
    # Cooldown check
    max_updated = db.exec(select(func.max(ZoneDailyAnalytics.updated_at))).first()
    if max_updated:
        now_utc = datetime.now(timezone.utc)
        if max_updated.tzinfo is None:
            max_updated = max_updated.replace(tzinfo=timezone.utc)
        elapsed = now_utc - max_updated
        if elapsed < timedelta(minutes=5):
            remaining_seconds = int(300 - elapsed.total_seconds())
            raise HTTPException(
                status_code=429,
                detail=f"Yêu cầu làm mới quá nhanh. Vui lòng thử lại sau {remaining_seconds} giây."
            )
            
    # Trigger sync
    try:
        from app.core.analytics_worker import sync_cloudflare_data
        sync_cloudflare_data(db)
        return {"status": "success", "message": "Đồng bộ dữ liệu thành công."}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi đồng bộ dữ liệu từ Cloudflare: {str(e)}"
        )
