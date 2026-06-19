import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nông Sản Sạch API"
    API_V1_STR: str = "/api"
    
    # Security
    # In production, change this to a random secret key
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secure-random-secret-key-123456789")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///nongsan.db")
    
    # Assets
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "static/uploads")
    
    # Default Admin (initialized on startup if not exists)
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")

    # Cloudflare API Configuration
    CLOUDFLARE_ZONE_ID: str = os.getenv("CLOUDFLARE_ZONE_ID", "")
    CLOUDFLARE_API_TOKEN: str = os.getenv("CLOUDFLARE_API_TOKEN", "")

    class Config:
        case_sensitive = True

settings = Settings()
