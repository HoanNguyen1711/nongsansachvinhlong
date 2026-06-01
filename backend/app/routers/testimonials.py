from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_db
from app.models.testimonial import Testimonial, TestimonialCreate, TestimonialUpdate, TestimonialPublic
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/testimonials", tags=["testimonials"])

@router.get("/", response_model=List[TestimonialPublic])
def read_testimonials(db: Annotated[Session, Depends(get_db)]):
    statement = select(Testimonial).order_by(Testimonial.id.desc())
    testimonials = db.exec(statement).all()
    return testimonials

@router.post("/", response_model=TestimonialPublic, status_code=status.HTTP_201_CREATED)
def create_testimonial(
    testimonial_in: TestimonialCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if testimonial_in.rating < 1 or testimonial_in.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đánh giá phải từ 1 đến 5 sao."
        )
    db_testimonial = Testimonial.model_validate(testimonial_in)
    db.add(db_testimonial)
    db.commit()
    db.refresh(db_testimonial)
    return db_testimonial

@router.put("/{testimonial_id}", response_model=TestimonialPublic)
def update_testimonial(
    testimonial_id: int,
    testimonial_in: TestimonialUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    db_testimonial = db.get(Testimonial, testimonial_id)
    if not db_testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy ý kiến khách hàng để cập nhật."
        )
    
    testimonial_data = testimonial_in.model_dump(exclude_unset=True)
    if "rating" in testimonial_data:
        rating = testimonial_data["rating"]
        if rating < 1 or rating > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Đánh giá phải từ 1 đến 5 sao."
            )
            
    for key, value in testimonial_data.items():
        setattr(db_testimonial, key, value)
        
    db.add(db_testimonial)
    db.commit()
    db.refresh(db_testimonial)
    return db_testimonial

@router.delete("/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_testimonial(
    testimonial_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    db_testimonial = db.get(Testimonial, testimonial_id)
    if not db_testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy ý kiến khách hàng để xóa."
        )
    db.delete(db_testimonial)
    db.commit()
    return None
