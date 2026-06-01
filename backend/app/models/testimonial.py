from typing import Optional
from sqlmodel import Field, SQLModel

class TestimonialBase(SQLModel):
    name: str = Field(index=True)
    content: str
    content_en: Optional[str] = Field(default=None)
    content_zh: Optional[str] = Field(default=None)
    rating: int = Field(default=5)
    region: Optional[str] = Field(default=None)
    region_en: Optional[str] = Field(default=None)
    region_zh: Optional[str] = Field(default=None)
    avatar_url: Optional[str] = Field(default=None)

class Testimonial(TestimonialBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class TestimonialCreate(TestimonialBase):
    pass

class TestimonialUpdate(SQLModel):
    name: Optional[str] = None
    content: Optional[str] = None
    content_en: Optional[str] = None
    content_zh: Optional[str] = None
    rating: Optional[int] = None
    region: Optional[str] = None
    region_en: Optional[str] = None
    region_zh: Optional[str] = None
    avatar_url: Optional[str] = None

class TestimonialPublic(TestimonialBase):
    id: int
