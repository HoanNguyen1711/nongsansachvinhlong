from datetime import datetime, timezone
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from app.core.database import get_db
from app.models.blog import Blog, BlogCreate, BlogUpdate, BlogPublic
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/blogs", tags=["blogs"])

@router.get("/", response_model=List[BlogPublic])
def read_blogs(
    db: Annotated[Session, Depends(get_db)],
    only_published: bool = True,
    offset: int = 0,
    limit: int = 100
):
    statement = select(Blog)
    if only_published:
        statement = statement.where(Blog.is_published == True)
        
    statement = statement.offset(offset).limit(limit).order_by(Blog.created_at.desc())
    blogs = db.exec(statement).all()
    return blogs

@router.get("/{slug}", response_model=BlogPublic)
def read_blog_by_slug(slug: str, db: Annotated[Session, Depends(get_db)]):
    statement = select(Blog).where(Blog.slug == slug)
    blog = db.exec(statement).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài viết"
        )
    return blog

@router.post("/", response_model=BlogPublic, status_code=status.HTTP_201_CREATED)
def create_blog(
    blog_in: BlogCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    # Check if slug exists
    existing = db.exec(select(Blog).where(Blog.slug == blog_in.slug)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đường dẫn tĩnh (slug) đã tồn tại. Vui lòng chọn slug khác."
        )
        
    db_blog = Blog.model_validate(blog_in)
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog

@router.put("/{blog_id}", response_model=BlogPublic)
def update_blog(
    blog_id: int,
    blog_in: BlogUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    db_blog = db.get(Blog, blog_id)
    if not db_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài viết để cập nhật"
        )
        
    blog_data = blog_in.model_dump(exclude_unset=True)
    
    # Verify slug uniqueness if changed
    if "slug" in blog_data and blog_data["slug"] != db_blog.slug:
        existing = db.exec(select(Blog).where(Blog.slug == blog_data["slug"])).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Đường dẫn tĩnh (slug) đã tồn tại. Vui lòng chọn slug khác."
            )
            
    for key, value in blog_data.items():
        setattr(db_blog, key, value)
        
    db_blog.updated_at = datetime.now(timezone.utc)
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog

@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(
    blog_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    db_blog = db.get(Blog, blog_id)
    if not db_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài viết để xóa"
        )
    db.delete(db_blog)
    db.commit()
    return None
