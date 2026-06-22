from datetime import datetime, timezone
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from app.core.database import get_db
from app.models.product import Product, ProductCreate, ProductUpdate, ProductPublic
from app.routers.auth import get_current_user, require_role_write
from app.models.user import User

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[ProductPublic])
def read_products(
    db: Annotated[Session, Depends(get_db)],
    category: Optional[str] = None,
    only_available: bool = False,
    offset: int = 0,
    limit: int = 100
):
    statement = select(Product)
    if category:
        statement = statement.where(Product.category == category)
    if only_available:
        statement = statement.where(Product.is_available == True)
    
    statement = statement.offset(offset).limit(limit).order_by(Product.created_at.desc())
    products = db.exec(statement).all()
    return products

@router.get("/{slug}", response_model=ProductPublic)
def read_product_by_slug(slug: str, db: Annotated[Session, Depends(get_db)]):
    statement = select(Product).where(Product.slug == slug)
    product = db.exec(statement).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sản phẩm"
        )
    return product

@router.post("/", response_model=ProductPublic, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    current_user: Annotated[User, Depends(require_role_write(["super_admin", "admin", "product_manager"]))],
    db: Annotated[Session, Depends(get_db)]
):
    # Check if slug already exists
    existing = db.exec(select(Product).where(Product.slug == product_in.slug)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đường dẫn tĩnh (slug) đã tồn tại. Vui lòng chọn slug khác."
        )
    
    db_product = Product.model_validate(product_in)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=ProductPublic)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    current_user: Annotated[User, Depends(require_role_write(["super_admin", "admin", "product_manager"]))],
    db: Annotated[Session, Depends(get_db)]
):
    db_product = db.get(Product, product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sản phẩm để cập nhật"
        )
        
    product_data = product_in.model_dump(exclude_unset=True)
    
    # If slug is changing, verify unique index
    if "slug" in product_data and product_data["slug"] != db_product.slug:
        existing = db.exec(select(Product).where(Product.slug == product_data["slug"])).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Đường dẫn tĩnh (slug) đã tồn tại. Vui lòng chọn slug khác."
            )
            
    for key, value in product_data.items():
        setattr(db_product, key, value)
        
    db_product.updated_at = datetime.now(timezone.utc)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_user: Annotated[User, Depends(require_role_write(["super_admin", "admin", "product_manager"]))],
    db: Annotated[Session, Depends(get_db)]
):
    db_product = db.get(Product, product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sản phẩm để xóa"
        )
    db.delete(db_product)
    db.commit()
    return None
