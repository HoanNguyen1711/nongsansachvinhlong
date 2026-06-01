from typing import Optional
from sqlmodel import Field, SQLModel

class SettingBase(SQLModel):
    key: str = Field(primary_key=True, index=True)
    value: str

class Setting(SettingBase, table=True):
    pass

class SettingCreate(SettingBase):
    pass

class SettingUpdate(SQLModel):
    value: str

class SettingPublic(SettingBase):
    pass
