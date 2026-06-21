import os
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_db
from app.core.config import settings
from app.routers.auth import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])

CLOUDFLARE_GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql"

def query_cloudflare(query: str, variables: dict, token: str) -> dict:
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    req = urllib.request.Request(CLOUDFLARE_GRAPHQL_URL, data=payload, headers=headers, method="POST")
    
    with urllib.request.urlopen(req, timeout=8) as response:
        result = json.loads(response.read().decode("utf-8"))
        if result.get("errors"):
            raise ValueError(result["errors"][0].get("message", "Cloudflare GraphQL API error"))
        return result

@router.get("/")
def get_analytics(
    current_user: Annotated[User, Depends(require_role(["super_admin", "admin"]))],
    db: Annotated[Session, Depends(get_db)]
):
    # Determine the time ranges (last 7 days)
    end_date_dt = datetime.now(timezone.utc)
    start_date_dt = end_date_dt - timedelta(days=6)
    
    start_date = start_date_dt.strftime("%Y-%m-%d")
    end_date = end_date_dt.strftime("%Y-%m-%d")
    
    # For Free tier zones, adaptive logs are limited to a 24-hour window
    start_time = (end_date_dt - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
    end_time = end_date_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    zone_id = settings.CLOUDFLARE_ZONE_ID
    api_token = settings.CLOUDFLARE_API_TOKEN
    
    # Check if Cloudflare settings are configured
    if not zone_id or not api_token:
        return generate_mock_data(start_date_dt, configured=False)
        
    # GraphQL Query definition
    query = """
    query ($zoneId: String!, $startDate: String!, $endDate: String!, $startTime: String!, $endTime: String!) {
      viewer {
        zones(filter: { zoneTag: $zoneId }) {
          daily: httpRequests1dGroups(
            limit: 7
            filter: { date_geq: $startDate, date_leq: $endDate }
            orderBy: [date_ASC]
          ) {
            dimensions {
              date
            }
            sum {
              requests
              pageViews
            }
          }
          devices: httpRequestsAdaptiveGroups(
            limit: 5
            filter: { datetime_geq: $startTime, datetime_leq: $endTime }
            orderBy: [count_DESC]
          ) {
            dimensions {
              clientDeviceType
            }
            count
          }
          countries: httpRequestsAdaptiveGroups(
            limit: 5
            filter: { datetime_geq: $startTime, datetime_leq: $endTime }
            orderBy: [count_DESC]
          ) {
            dimensions {
              clientCountryName
            }
            count
          }
        }
      }
    }
    """
    
    variables = {
      "zoneId": zone_id,
      "startDate": start_date,
      "endDate": end_date,
      "startTime": start_time,
      "endTime": end_time
    }
    
    try:
        cf_response = query_cloudflare(query, variables, api_token)
        zones_data = cf_response.get("data", {}).get("viewer", {}).get("zones", [])
        
        if not zones_data:
            raise ValueError("No data returned for the configured Zone ID.")
            
        data = zones_data[0]
        
        # 1. Map daily stats
        daily_list = data.get("daily", [])
        daily_stats = []
        total_views = 0
        total_requests = 0
        
        # Prepopulate all 7 days with 0s to guarantee clean lines in chart even with empty days
        day_map = {}
        for i in range(7):
            d_str = (start_date_dt + timedelta(days=i)).strftime("%Y-%m-%d")
            day_map[d_str] = {"date": d_str, "views": 0, "requests": 0}
            
        for d in daily_list:
            date_str = d.get("dimensions", {}).get("date")
            views = int(d.get("sum", {}).get("pageViews", 0))
            reqs = int(d.get("sum", {}).get("requests", 0))
            total_views += views
            total_requests += reqs
            if date_str in day_map:
                day_map[date_str] = {"date": date_str, "views": views, "requests": reqs}
                
        daily_stats = [day_map[k] for k in sorted(day_map.keys())]
        
        # 2. Map referrers
        referrers_list = data.get("referrers", [])
        referrers = []
        ref_total = sum(int(r.get("count", 0)) for r in referrers_list)
        for r in referrers_list:
            host = r.get("dimensions", {}).get("clientRefererHost", "") or "Direct / Unknown"
            count = int(r.get("count", 0))
            percentage = round((count / ref_total) * 100) if ref_total > 0 else 0
            # Clean up referrer host names
            if host.startswith("www."):
                host = host[4:]
            referrers.append({"source": host, "count": count, "percentage": percentage})
            
        # 3. Map devices
        devices_list = data.get("devices", [])
        devices = []
        dev_total = sum(int(d.get("count", 0)) for d in devices_list)
        for d in devices_list:
            dev_type = d.get("dimensions", {}).get("clientDeviceType", "") or "Other"
            count = int(d.get("count", 0))
            percentage = round((count / dev_total) * 100) if dev_total > 0 else 0
            # Translate device names
            dev_label = "Desktop" if dev_type == "desktop" else "Mobile" if dev_type == "mobile" else "Tablet" if dev_type == "tablet" else dev_type.capitalize()
            devices.append({"device": dev_label, "count": count, "percentage": percentage})
            
        # 4. Map countries
        countries_list = data.get("countries", [])
        countries = []
        c_total = sum(int(c.get("count", 0)) for c in countries_list)
        for c in countries_list:
            country = c.get("dimensions", {}).get("clientCountryName", "") or "Unknown"
            count = int(c.get("count", 0))
            percentage = round((count / c_total) * 100) if c_total > 0 else 0
            # Translate common country names
            c_label = "Việt Nam" if country == "VN" or country == "Vietnam" else "Mỹ (USA)" if country == "US" or country == "United States" else "Singapore" if country == "SG" else country
            countries.append({"country": c_label, "count": count, "percentage": percentage})
            
        return {
            "configured": True,
            "total_views": total_views,
            "total_requests": total_requests,
            "daily_stats": daily_stats,
            "referrers": referrers or [{"source": "Direct / Unknown", "count": total_requests, "percentage": 100}],
            "devices": devices or [{"device": "Desktop", "count": total_requests, "percentage": 100}],
            "countries": countries or [{"country": "Việt Nam", "count": total_requests, "percentage": 100}]
        }
    except Exception as e:
        print(f"Error querying Cloudflare API: {e}. Falling back to mock data.")
        return generate_mock_data(start_date_dt, configured=False, error=str(e))

def generate_mock_data(start_date_dt, configured=False, error=None):
    daily_stats = []
    total_views = 0
    total_requests = 0
    
    # Beautiful mockup traffic pattern
    base_views = [1420, 1250, 1680, 1890, 2450, 2120, 2300]
    base_reqs = [4260, 3750, 5040, 5670, 7350, 6360, 6900]
    
    for i in range(7):
        day_dt = start_date_dt + timedelta(days=i)
        views = base_views[i]
        reqs = base_reqs[i]
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
            {"source": "google.com", "count": 7890, "percentage": 48},
            {"source": "Direct / Bookmarks", "count": 4270, "percentage": 26},
            {"source": "facebook.com", "count": 2960, "percentage": 18},
            {"source": "t.co (Twitter)", "count": 820, "percentage": 5},
            {"source": "Others", "count": 490, "percentage": 3}
        ],
        "devices": [
            {"device": "Mobile", "count": 9860, "percentage": 60},
            {"device": "Desktop", "count": 5750, "percentage": 35},
            {"device": "Tablet", "count": 820, "percentage": 5}
        ],
        "countries": [
            {"country": "Việt Nam", "count": 11500, "percentage": 70},
            {"country": "Mỹ (USA)", "count": 2460, "percentage": 15},
            {"country": "Singapore", "count": 1640, "percentage": 10},
            {"country": "Khác", "count": 830, "percentage": 5}
        ]
    }
