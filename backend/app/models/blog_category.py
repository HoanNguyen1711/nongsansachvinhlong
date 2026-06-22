from typing import Optional
from sqlmodel import Field, SQLModel

class BlogCategoryBase(SQLModel):
    name: str = Field(index=True, unique=True)
    name_en: Optional[str] = Field(default=None)
    name_zh: Optional[str] = Field(default=None)
    slug: str = Field(index=True, unique=True)
    position: int = Field(default=0)

class BlogCategory(BlogCategoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class BlogCategoryCreate(BlogCategoryBase):
    pass

class BlogCategoryUpdate(SQLModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    name_zh: Optional[str] = None
    slug: Optional[str] = None
    position: Optional[int] = None

class BlogCategoryPublic(BlogCategoryBase):
    id: int
