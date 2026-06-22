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
        
    # Resize image if it exceeds max-width of 2048px
    max_width = 2048
    if image.width > max_width:
        ratio = max_width / float(image.width)
        new_height = int(float(image.height) * float(ratio))
        image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
    # Save image as compressed WebP
    image.save(file_path, "WEBP", quality=85)
    
    # Return the relative public path
    return f"/static/uploads/{output_filename}"
