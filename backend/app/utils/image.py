import os
import uuid
from datetime import datetime
from PIL import Image
from fastapi import UploadFile
from app.core.config import settings

def save_and_compress_image(file: UploadFile) -> str:
    # Ensure static upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate a unique secure filename to prevent collision
    unique_id = uuid.uuid4().hex[:8]
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    output_filename = f"img_{timestamp}_{unique_id}.webp"
    file_path = os.path.join(settings.UPLOAD_DIR, output_filename)
    
    # Open image using Pillow
    image = Image.open(file.file)
    
    # Convert image mode if needed, preserving transparency
    if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
        if image.mode != "RGBA":
            image = image.convert("RGBA")
    else:
        image = image.convert("RGB")
        
    # Save image as compressed WebP with high quality (preserving original resolution)
    image.save(file_path, "WEBP", quality=90)
    
    # Return the relative public path
    return f"/static/uploads/{output_filename}"
