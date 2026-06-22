from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, update
from app.core.database import get_db
from app.models.blog_category import BlogCategory, BlogCategoryCreate, BlogCategoryUpdate, BlogCategoryPublic
from app.models.blog import Blog
from app.routers.auth import get_current_user, require_role_write
from app.models.user import User

router = APIRouter(prefix="/blog-categories", tags=["blog-categories"])

@router.get("/", response_model=List[BlogCategoryPublic])
def read_blog_categories(db: Annotated[Session, Depends(get_db)]):
    statement = select(BlogCategory).order_by(BlogCategory.position.asc(), BlogCategory.name.asc())
    categories = db.exec(statement).all()
    return categories

@router.post("/", response_model=BlogCategoryPublic, status_code=status.HTTP_201_CREATED)
def create_blog_category(
    category_in: BlogCategoryCreate,
    current_user: Annotated[User, Depends(require_role_write(["super_admin", "admin", "content_editor"]))],
    db: Annotated[Session, Depends(get_db)]
):
    # Check if slug or name already exists
    existing_name = db.exec(select(BlogCategory).where(BlogCategory.name == category_in.name)).first()
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên chuyên mục đã tồn tại."
        )
    existing_slug = db.exec(select(BlogCategory).where(BlogCategory.slug == category_in.slug)).first()
    if existing_slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đường dẫn tĩnh (slug) của chuyên mục đã tồn tại."
        )
    
    db_category = BlogCategory.model_validate(category_in)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=BlogCategoryPublic)
def update_blog_category(
    category_id: int,
    category_in: BlogCategoryUpdate,
    current_user: Annotated[User, Depends(require_role_write(["super_admin", "admin", "content_editor"]))],
    db: Annotated[Session, Depends(get_db)]
):
    db_category = db.get(BlogCategory, category_id)
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyên mục để cập nhật"
        )
        
    category_data = category_in.model_dump(exclude_unset=True)
    
    # Validations
    if "name" in category_data and category_data["name"] != db_category.name:
        existing = db.exec(select(BlogCategory).where(BlogCategory.name == category_data["name"])).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tên chuyên mục đã tồn tại."
            )
            
    if "slug" in category_data and category_data["slug"] != db_category.slug:
        existing = db.exec(select(BlogCategory).where(BlogCategory.slug == category_data["slug"])).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Đường dẫn tĩnh (slug) của chuyên mục đã tồn tại."
            )
    
    old_name = db_category.name
    
    for key, value in category_data.items():
        setattr(db_category, key, value)
        
    db.add(db_category)
    
    # Cascade updates to existing Blog table records
    new_name = db_category.name
    new_name_en = db_category.name_en
    new_name_zh = db_category.name_zh
    
    db.exec(
        update(Blog)
        .where(Blog.category == old_name)
        .values(category=new_name, category_en=new_name_en, category_zh=new_name_zh)
    )
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog_category(
    category_id: int,
    current_user: Annotated[User, Depends(require_role_write(["super_admin", "admin", "content_editor"]))],
    db: Annotated[Session, Depends(get_db)]
):
    db_category = db.get(BlogCategory, category_id)
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyên mục để xóa"
        )
    
    old_name = db_category.name
    db.delete(db_category)
    
    # Nullify category fields in referencing Blog table records
    db.exec(
        update(Blog)
        .where(Blog.category == old_name)
        .values(category=None, category_en=None, category_zh=None)
    )
    
    db.commit()
    return None
