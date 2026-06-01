from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserCreate, UserChangePassword, UserPublic
from app.routers.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[UserPublic])
def list_users(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập danh sách nhân viên."
        )
    statement = select(User).order_by(User.username.asc())
    users = db.exec(statement).all()
    return users

@router.post("/", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền tạo tài khoản nhân viên mới."
        )
    
    # Check if username already exists
    statement = select(User).where(User.username == user_in.username)
    existing_user = db.exec(statement).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập đã tồn tại."
        )
    
    db_user = User(
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
        is_superuser=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/change-password")
def change_password(
    password_in: UserChangePassword,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if not verify_password(password_in.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu cũ không chính xác."
        )
    
    current_user.hashed_password = get_password_hash(password_in.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Đổi mật khẩu thành công."}

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa tài khoản nhân viên."
        )
    
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn không thể tự xóa tài khoản của chính mình."
        )
    
    db_user = db.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản nhân viên."
        )
        
    db.delete(db_user)
    db.commit()
    return {"message": "Đã xóa tài khoản thành công."}
