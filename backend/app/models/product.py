from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel

class ProductBase(SQLModel):
    name: str = Field(index=True)
    name_en: Optional[str] = Field(default=None)
    name_zh: Optional[str] = Field(default=None)
    slug: str = Field(unique=True, index=True)
    description: Optional[str] = Field(default=None)
    description_en: Optional[str] = Field(default=None)
    description_zh: Optional[str] = Field(default=None)
    price: Optional[float] = Field(default=None)
    original_price: Optional[float] = Field(default=None)
    image_url: Optional[str] = Field(default=None)
    category: str = Field(index=True)
    is_available: bool = Field(default=True)

class Product(ProductBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(ProductBase):
    pass

class ProductUpdate(SQLModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    name_zh: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    description_zh: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_available: Optional[bool] = None

class ProductPublic(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
