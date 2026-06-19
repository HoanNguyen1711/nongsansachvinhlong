from typing import Optional
from sqlmodel import Field, SQLModel
from pydantic import BaseModel

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    role: str = Field(default="content_editor")
    readonly: bool = Field(default=False)

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "content_editor"
    readonly: bool = False

class UserChangePassword(BaseModel):
    old_password: str
    new_password: str

class UserPublic(BaseModel):
    id: Optional[int] = None
    username: str
    is_active: bool
    is_superuser: bool
    role: str
    readonly: bool

