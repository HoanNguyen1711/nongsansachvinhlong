import datetime as dt
from typing import Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import UniqueConstraint

class ZoneDailyAnalytics(SQLModel, table=True):
    __tablename__ = "zone_daily_analytics"
    id: Optional[int] = Field(default=None, primary_key=True)
    date: dt.date = Field(unique=True, index=True)
    requests: int = Field(default=0)
    page_views: int = Field(default=0)
    updated_at: dt.datetime = Field(default_factory=lambda: dt.datetime.now(dt.timezone.utc))

class ZoneCountryAnalytics(SQLModel, table=True):
    __tablename__ = "zone_country_analytics"
    id: Optional[int] = Field(default=None, primary_key=True)
    date: dt.date = Field(index=True)
    country_code: str = Field(max_length=10)
    requests: int = Field(default=0)
    updated_at: dt.datetime = Field(default_factory=lambda: dt.datetime.now(dt.timezone.utc))

    __table_args__ = (
        UniqueConstraint("date", "country_code", name="uq_zone_country_date_code"),
    )

class ZoneDeviceAnalytics(SQLModel, table=True):
    __tablename__ = "zone_device_analytics"
    id: Optional[int] = Field(default=None, primary_key=True)
    date: dt.date = Field(index=True)
    device_type: str = Field(max_length=20)
    requests: int = Field(default=0)
    updated_at: dt.datetime = Field(default_factory=lambda: dt.datetime.now(dt.timezone.utc))

    __table_args__ = (
        UniqueConstraint("date", "device_type", name="uq_zone_device_date_type"),
    )
