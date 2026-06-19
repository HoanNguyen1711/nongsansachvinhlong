from typing import Annotated, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_db
from app.models.setting import Setting, SettingUpdate, SettingPublic
from app.routers.auth import get_current_user, require_role_write
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/", response_model=Dict[str, str])
def read_settings(db: Annotated[Session, Depends(get_db)]):
    statement = select(Setting)
    settings_list = db.exec(statement).all()
    # Return as key-value dictionary for easy frontend consumption
    return {s.key: s.value for s in settings_list}

@router.get("/{key}", response_model=SettingPublic)
def read_setting_by_key(key: str, db: Annotated[Session, Depends(get_db)]):
    db_setting = db.get(Setting, key)
    if not db_setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy cấu hình '{key}'"
        )
    return db_setting

@router.put("/", response_model=Dict[str, str])
def update_settings(
    settings_in: Dict[str, str],
    current_user: Annotated[User, Depends(require_role_write(["super_admin", "admin"]))],
    db: Annotated[Session, Depends(get_db)]
):
    for key, value in settings_in.items():
        db_setting = db.get(Setting, key)
        if db_setting:
            db_setting.value = value
            db.add(db_setting)
        else:
            new_setting = Setting(key=key, value=value)
            db.add(new_setting)
            
    db.commit()
    
    # Return all updated settings
    statement = select(Setting)
    settings_list = db.exec(statement).all()
    return {s.key: s.value for s in settings_list}
