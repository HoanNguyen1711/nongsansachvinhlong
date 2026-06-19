import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db
from app.routers import auth, products, blogs, uploads, categories, blog_categories, users, testimonials, analytics
from app.routers.settings import router as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Initialize database schemas and default administrator
    init_db()
    yield
    # Shutdown actions (if any)

# Ensure static uploads directory exists before mounting StaticFiles
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API cho website giới thiệu và quản lý nông sản",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development and production
# In production, restrict this to your domain for security
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route API handlers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(blog_categories.router, prefix=settings.API_V1_STR)
app.include_router(blogs.router, prefix=settings.API_V1_STR)
app.include_router(uploads.router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(testimonials.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

# Mount directory to serve uploaded static files/images
# Example: http://localhost:8000/static/uploads/img_name.webp
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return {
        "message": f"Chào mừng bạn đến với {settings.PROJECT_NAME}",
        "docs": "/docs"
    }
