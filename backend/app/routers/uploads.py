from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.routers.auth import get_current_user, require_role_write
from app.models.user import User
from app.utils.image import save_and_compress_image

router = APIRouter(prefix="/uploads", tags=["uploads"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def upload_image(
    current_user: Annotated[User, Depends(require_role_write(["super_admin", "admin", "product_manager", "content_editor"]))],
    file: UploadFile = File(...)
):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Định dạng file không hợp lệ. Chỉ chấp nhận các đuôi: JPG, JPEG, PNG, WEBP."
        )

    # Validate file size (Max 5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dung lượng file vượt quá giới hạn cho phép (tối đa 5MB)."
        )
        
    try:
        url = save_and_compress_image(file)
        return {"url": url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xử lý lưu trữ hình ảnh: {str(e)}"
        )
