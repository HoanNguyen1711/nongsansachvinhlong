import time
import json
import urllib.request
import threading
from datetime import datetime, date, timedelta, timezone
from sqlmodel import Session, select
from app.core.config import settings
from app.core.database import engine
from app.models.analytics import ZoneDailyAnalytics, ZoneCountryAnalytics, ZoneDeviceAnalytics

def upsert_daily(db: Session, date_val: date, requests: int, page_views: int):
    statement = select(ZoneDailyAnalytics).where(ZoneDailyAnalytics.date == date_val)
    existing = db.exec(statement).first()
    if existing:
        existing.requests = requests
        existing.page_views = page_views
        existing.updated_at = datetime.now(timezone.utc)
        db.add(existing)
    else:
        new_record = ZoneDailyAnalytics(
            date=date_val,
            requests=requests,
            page_views=page_views,
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_record)

def upsert_device(db: Session, date_val: date, device_type: str, requests: int):
    statement = select(ZoneDeviceAnalytics).where(
        ZoneDeviceAnalytics.date == date_val,
        ZoneDeviceAnalytics.device_type == device_type
    )
    existing = db.exec(statement).first()
    if existing:
        existing.requests = requests
        existing.updated_at = datetime.now(timezone.utc)
        db.add(existing)
    else:
        new_record = ZoneDeviceAnalytics(
            date=date_val,
            device_type=device_type,
            requests=requests,
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_record)

def upsert_country(db: Session, date_val: date, country_code: str, requests: int):
    statement = select(ZoneCountryAnalytics).where(
        ZoneCountryAnalytics.date == date_val,
        ZoneCountryAnalytics.country_code == country_code
    )
    existing = db.exec(statement).first()
    if existing:
        existing.requests = requests
        existing.updated_at = datetime.now(timezone.utc)
        db.add(existing)
    else:
        new_record = ZoneCountryAnalytics(
            date=date_val,
            country_code=country_code,
            requests=requests,
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_record)

def sync_cloudflare_data(db: Session):
    zone_id = settings.CLOUDFLARE_ZONE_ID
    api_token = settings.CLOUDFLARE_API_TOKEN
    
    if not zone_id or not api_token:
        print("Cloudflare credentials not configured in settings. Skipping sync.")
        return

    # Determine time ranges
    end_date_dt = datetime.now(timezone.utc)
    # Fetch last 30 days of daily stats to keep gaps filled
    start_date_dt = end_date_dt - timedelta(days=29)
    
    # Adaptive stats (devices, countries) are limited to a 24-hour window on Free plan
    start_time_adaptive = (end_date_dt - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
    end_time_adaptive = end_date_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    start_date = start_date_dt.strftime("%Y-%m-%d")
    end_date = end_date_dt.strftime("%Y-%m-%d")
    
    query = """
    query ($zoneId: String!, $startDate: String!, $endDate: String!, $startTime: String!, $endTime: String!) {
      viewer {
        zones(filter: { zoneTag: $zoneId }) {
          daily: httpRequests1dGroups(
            limit: 30
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
      "startTime": start_time_adaptive,
      "endTime": end_time_adaptive
    }
    
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    try:
        payload = json.dumps({"query": query, "variables": variables}).encode("utf-8")
        req = urllib.request.Request("https://api.cloudflare.com/client/v4/graphql", data=payload, headers=headers, method="POST")
        
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode("utf-8"))
            if res.get("errors"):
                raise ValueError(res["errors"][0].get("message", "Cloudflare API Error"))
                
            zones_data = res.get("data", {}).get("viewer", {}).get("zones", [])
            if not zones_data:
                raise ValueError("No data returned for the configured Zone ID.")
                
            data = zones_data[0]
            today_date = end_date_dt.date()
            
            # 1. Sync daily stats (last 30 days)
            daily_list = data.get("daily", [])
            for d in daily_list:
                date_str = d.get("dimensions", {}).get("date")
                try:
                    date_val = datetime.strptime(date_str, "%Y-%m-%d").date()
                    views = int(d.get("sum", {}).get("pageViews", 0))
                    reqs = int(d.get("sum", {}).get("requests", 0))
                    upsert_daily(db, date_val, reqs, views)
                except Exception as e_d:
                    print(f"Error parsing daily record {date_str}: {e_d}")
            
            # 2. Sync device stats (today's slice)
            devices_list = data.get("devices", [])
            for d in devices_list:
                dev_type = d.get("dimensions", {}).get("clientDeviceType", "") or "other"
                count = int(d.get("count", 0))
                upsert_device(db, today_date, dev_type, count)
                
            # 3. Sync country stats (today's slice)
            countries_list = data.get("countries", [])
            for c in countries_list:
                country_code = c.get("dimensions", {}).get("clientCountryName", "") or "Unknown"
                count = int(c.get("count", 0))
                upsert_country(db, today_date, country_code, count)
                
            db.commit()
            print(f"Successfully synchronized Cloudflare analytics data at {datetime.now(timezone.utc)}")
            
    except Exception as e:
        print(f"Error executing Cloudflare analytics sync: {e}")
        db.rollback()
        raise e

def start_analytics_scheduler():
    def run():
        # Wait a short period on startup to let DB migrations run and connection pools settle
        time.sleep(10)
        print("Starting background Cloudflare analytics sync daemon...")
        while True:
            try:
                with Session(engine) as db:
                    sync_cloudflare_data(db)
            except Exception as e:
                print(f"Daemon Cloudflare sync failed: {e}")
            
            # Sleep for 2 hours
            time.sleep(2 * 3600)
            
    thread = threading.Thread(target=run, daemon=True)
    thread.start()
