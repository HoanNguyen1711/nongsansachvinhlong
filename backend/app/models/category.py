from typing import Optional
from sqlmodel import Field, SQLModel

class CategoryBase(SQLModel):
    name: str = Field(index=True, unique=True)
    name_en: Optional[str] = Field(default=None)
    name_zh: Optional[str] = Field(default=None)
    slug: str = Field(index=True, unique=True)

class Category(CategoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    name_zh: Optional[str] = None
    slug: Optional[str] = None

class CategoryPublic(CategoryBase):
    id: int
