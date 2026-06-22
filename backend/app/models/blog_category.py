from typing import Optional
from sqlmodel import Field, SQLModel

class BlogCategoryBase(SQLModel):
    name: str = Field(index=True, unique=True)
    name_en: Optional[str] = Field(default=None)
    name_zh: Optional[str] = Field(default=None)
    slug: str = Field(index=True, unique=True)
    position: int = Field(default=0)
    show_in_navbar: bool = Field(default=False)
    short_description: Optional[str] = Field(default=None)
    short_description_en: Optional[str] = Field(default=None)
    short_description_zh: Optional[str] = Field(default=None)

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
    show_in_navbar: Optional[bool] = None
    short_description: Optional[str] = None
    short_description_en: Optional[str] = None
    short_description_zh: Optional[str] = None

class BlogCategoryPublic(BlogCategoryBase):
    id: int
