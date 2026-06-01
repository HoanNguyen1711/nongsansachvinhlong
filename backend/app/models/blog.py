from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel

class BlogBase(SQLModel):
    title: str = Field(index=True)
    title_en: Optional[str] = Field(default=None)
    title_zh: Optional[str] = Field(default=None)
    slug: str = Field(unique=True, index=True)
    summary: Optional[str] = Field(default=None)
    summary_en: Optional[str] = Field(default=None)
    summary_zh: Optional[str] = Field(default=None)
    content: str
    content_en: Optional[str] = Field(default=None)
    content_zh: Optional[str] = Field(default=None)
    image_url: Optional[str] = Field(default=None)
    is_published: bool = Field(default=True)
    tag: Optional[str] = Field(default=None)
    tag_en: Optional[str] = Field(default=None)
    tag_zh: Optional[str] = Field(default=None)
    tag_color: Optional[str] = Field(default="emerald")

class Blog(BlogBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogCreate(BlogBase):
    pass

class BlogUpdate(SQLModel):
    title: Optional[str] = None
    title_en: Optional[str] = None
    title_zh: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    summary_en: Optional[str] = None
    summary_zh: Optional[str] = None
    content: Optional[str] = None
    content_en: Optional[str] = None
    content_zh: Optional[str] = None
    image_url: Optional[str] = None
    is_published: Optional[bool] = None
    tag: Optional[str] = None
    tag_en: Optional[str] = None
    tag_zh: Optional[str] = None
    tag_color: Optional[str] = None

class BlogPublic(BlogBase):
    id: int
    created_at: datetime
    updated_at: datetime
