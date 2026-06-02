import os
import sys
from sqlalchemy import text
from sqlmodel import create_engine, Session, select, SQLModel

# Add the root directory to path to import app modules
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.core.config import settings
from app.models.user import User
from app.models.product import Product
from app.models.blog import Blog
from app.models.category import Category
from app.models.setting import Setting
from app.models.testimonial import Testimonial

# Configuration
# Default source to local SQLite file path (can override with env variable)
SQLITE_URL = os.getenv("SQLITE_URL", "sqlite:///nongsan.db")
# Default target to settings DATABASE_URL (which should be PostgreSQL on prod/dev)
POSTGRES_URL = os.getenv("POSTGRES_URL", settings.DATABASE_URL)

def migrate():
    print("--- KHỞI ĐẦU QUÁ TRÌNH DI TRÚ DỮ LIỆU ---")
    print(f"Nguồn (SQLite): {SQLITE_URL}")
    print(f"Đích (PostgreSQL): {POSTGRES_URL}")
    
    if not POSTGRES_URL.startswith("postgresql"):
        print("LỖI: Cơ sở dữ liệu đích phải là PostgreSQL!")
        sys.exit(1)
        
    # Tạo engine kết nối
    sqlite_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
    postgres_engine = create_engine(POSTGRES_URL)
    
    # Danh sách các Model cần di trú dữ liệu
    models = [
        ("User", User),
        ("Category", Category),
        ("Product", Product),
        ("Blog", Blog),
        ("Setting", Setting),
        ("Testimonial", Testimonial),
    ]
    
    # 1. Đọc và chèn dữ liệu
    for name, model in models:
        print(f"\nĐang di chuyển bảng: {name}...")
        
        # Đọc dữ liệu từ SQLite
        with Session(sqlite_engine) as sqlite_session:
            records = sqlite_session.exec(select(model)).all()
            print(f"-> Tìm thấy {len(records)} bản ghi trong SQLite.")
            
            if not records:
                print("-> Bảng trống, bỏ qua.")
                continue
                
        # Ghi dữ liệu vào Postgres
        with Session(postgres_engine) as postgres_session:
            # Xóa sạch dữ liệu cũ trong bảng đích nếu có để tránh trùng lặp
            postgres_session.exec(text(f'TRUNCATE TABLE "{model.__tablename__}" CASCADE'))
            postgres_session.commit()
            
            # Chèn các bản ghi mới
            count = 0
            for record in records:
                # Tạo đối tượng mới có cùng thuộc tính để thêm vào Postgres session
                # (Sử dụng SQLModel.model_validate để nhân bản thực thể)
                cloned_record = model.model_validate(record)
                postgres_session.add(cloned_record)
                count += 1
                
            postgres_session.commit()
            print(f"-> Đã di chuyển thành công {count} bản ghi vào PostgreSQL.")
            
    # 2. Reset Auto-increment Sequences trong PostgreSQL
    # PostgreSQL sử dụng sequences để đếm ID tự tăng. Sau khi chèn bản ghi với ID có sẵn,
    # chúng ta phải đồng bộ lại sequence để tránh lỗi trùng ID (Duplicate Key) khi thêm mới bản ghi sau này.
    print("\nĐang thiết lập lại (reset) các Sequence ID tự tăng trong PostgreSQL...")
    tables_with_sequences = ["user", "category", "product", "blog", "testimonial"]
    
    with postgres_engine.begin() as conn:
        for table in tables_with_sequences:
            try:
                # Câu lệnh SQL thiết lập lại sequence về giá trị MAX(id) hiện tại
                query = f"""
                    SELECT setval(
                        pg_get_serial_sequence('{table}', 'id'), 
                        COALESCE(MAX(id), 1), 
                        MAX(id) IS NOT NULL
                    ) FROM "{table}"
                """
                conn.execute(text(query))
                print(f"-> Đã reset thành công sequence cho bảng '{table}'.")
            except Exception as e:
                print(f"-> Lỗi reset sequence cho bảng '{table}': {e}")
                
    print("\n--- HOÀN TẤT DI TRÚ DỮ LIỆU THÀNH CÔNG ---")

if __name__ == "__main__":
    migrate()
