from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_db
from app.models.category import Category, CategoryCreate, CategoryUpdate, CategoryPublic
from app.routers.auth import get_current_user, require_role_write
from app.models.user import User

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryPublic])
def read_categories(db: Annotated[Session, Depends(get_db)]):
    statement = select(Category).order_by(Category.name.asc())
    categories = db.exec(statement).all()
    return categories

@router.post("/", response_model=CategoryPublic, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    current_user: Annotated[User, Depends(require_role_write(["super_admin", "admin", "product_manager"]))],
    db: Annotated[Session, Depends(get_db)]
):
    # Check if slug or name already exists
    existing_name = db.exec(select(Category).where(Category.name == category_in.name)).first()
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên danh mục đã tồn tại."
        )
    existing_slug = db.exec(select(Category).where(Category.slug == category_in.slug)).first()
    if existing_slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đường dẫn tĩnh (slug) của danh mục đã tồn tại."
        )
    
    db_category = Category.model_validate(category_in)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=CategoryPublic)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    current_user: Annotated[User, Depends(require_role_write(["super_admin", "admin", "product_manager"]))],
    db: Annotated[Session, Depends(get_db)]
):
    db_category = db.get(Category, category_id)
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy danh mục để cập nhật"
        )
        
    category_data = category_in.model_dump(exclude_unset=True)
    
    # Validations
    if "name" in category_data and category_data["name"] != db_category.name:
        existing = db.exec(select(Category).where(Category.name == category_data["name"])).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tên danh mục đã tồn tại."
            )
            
    if "slug" in category_data and category_data["slug"] != db_category.slug:
        existing = db.exec(select(Category).where(Category.slug == category_data["slug"])).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Đường dẫn tĩnh (slug) của danh mục đã tồn tại."
            )
            
    for key, value in category_data.items():
        setattr(db_category, key, value)
        
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    current_user: Annotated[User, Depends(require_role_write(["super_admin", "admin", "product_manager"]))],
    db: Annotated[Session, Depends(get_db)]
):
    db_category = db.get(Category, category_id)
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy danh mục để xóa"
        )
    db.delete(db_category)
    db.commit()
    return None
