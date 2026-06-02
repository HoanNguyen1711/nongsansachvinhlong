# Nông Sản Sạch - Website Giới Thiệu & Quản Lý Nông Sản

Hệ thống giới thiệu và quản lý nông sản sạch tiêu chuẩn VietGAP. Dự án được phát triển theo kiến trúc hiện đại, đóng gói hoàn toàn bằng Docker để chạy môi trường phát triển và sản xuất dễ dàng.

---

## 🏗️ Kiến Trúc Hệ Thống

Dự án bao gồm 4 thành phần chính hoạt động trong mạng lưới Docker:

1. **Frontend (Next.js):** 
   - Sử dụng Next.js App Router (React), Tailwind CSS, Lucide Icons.
   - Giao diện thân thiện, hiện đại, tối ưu SEO, hỗ trợ Responsive đầy đủ trên mobile và desktop.
   - Tải nhanh nhờ cơ chế kết hợp Server Components (SSR) và Incremental Static Regeneration (ISR).

2. **Backend (FastAPI):**
   - Viết bằng FastAPI (Python 3.13), SQLModel (kết hợp SQLAlchemy và Pydantic), Postgres 18.
   - Quản lý database bằng **Alembic** cho phép tự động nâng cấp cấu trúc cơ sở dữ liệu trên startup.
   - Cung cấp các API quản lý sản phẩm, bài viết, danh mục, cấu hình hotline hệ thống và đăng nhập admin bảo mật bằng JWT (JSON Web Tokens).

3. **Cơ sở dữ liệu (PostgreSQL 18):**
   - Sử dụng **PostgreSQL 18-alpine** chính thức từ Docker Hub.
   - Cấu hình tối ưu tài nguyên mạng (giới hạn bộ nhớ tối đa **256MB RAM**, tối đa 50 kết nối đồng thời) để chạy mượt mà ngay trên các dòng VPS yếu (1 CPU / 2GB RAM) mà không lo tràn bộ nhớ.

4. **Web Server & Reverse Proxy (Caddy):**
   - Sử dụng Caddy để nhận và điều hướng toàn bộ request (Port 80/443).
   - Đảm nhiệm nén phản hồi (Gzip/Zstd), nén ảnh WebP nông sản và lưu cache tĩnh cho hiệu năng phản hồi tối ưu nhất.
   - Sử dụng biến môi trường động để dễ dàng thay đổi cấu hình SSL và Domain giữa môi trường Dev và Production mà không cần đổi mã nguồn.

---

## 🛠️ Quản Lý Cơ Sở Dữ Liệu & Migrations (Alembic)

Dự án sử dụng **Alembic** để quản lý cấu trúc bảng. 

* Khi container backend khởi động, hàm [init_db](file:///home/hoan/Dev/web2/backend/app/core/database.py#L8) sẽ tự động chạy lệnh nâng cấp `command.upgrade(alembic_cfg, "head")` để đảm bảo cơ sở dữ liệu luôn ở phiên bản mới nhất.
* **Driver PostgreSQL:** Sử dụng thư viện `pg8000` (driver PostgreSQL viết bằng Python thuần) để loại bỏ hoàn toàn các lỗi Segment Fault do xung đột thư viện `musl` trên Alpine Linux.

### Lệnh tạo migrations mới khi thay đổi Model (Dev):
Khi bạn thêm, sửa đổi thuộc tính của model trong thư mục `app/models/`, hãy chạy lệnh sau ở folder `backend` để tự sinh file migration mới:
```bash
# Sử dụng cơ sở dữ liệu in-memory để so sánh schema chuẩn xác
DATABASE_URL=sqlite:///:memory: uv run alembic revision --autogenerate -m "Mô tả thay đổi"
```

---

## 🚀 Hướng Dẫn Cài Đặt Và Khởi Chạy

### Yêu Cầu Hệ Thống
- Đã cài đặt **Docker** và **Docker Compose**.
- Đảm bảo cổng `80` và `443` trên máy chủ không bị chiếm dụng bởi dịch vụ khác (như Nginx hay Apache).

### Bước 1: Thiết lập cấu hình `.env`
Tạo tệp `.env` tại thư mục gốc của dự án:
```env
# Tên miền phục vụ (Local hoặc VPS)
# - Dưới local: DOMAIN_NAME=localhost
# - Trên VPS: DOMAIN_NAME=nongsansachvietnam.com, www.nongsansachvietnam.com
DOMAIN_NAME=localhost

# Cấu hình PostgreSQL 18
POSTGRES_USER=nongsan_user
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=nongsan_db

# Mã bảo mật JWT
JWT_SECRET=super-secure-random-secret-key-123456789
```

### Bước 2: Khởi Chạy Hệ Thống
Mở terminal tại thư mục gốc của dự án và chạy lệnh sau:
```bash
docker compose up -d --build
```
Lệnh này sẽ tự động tải các base image, xây dựng môi trường ảo FastAPI, khởi chạy PostgreSQL 18 và Caddy. Đồng thời tự tạo database schema và nạp dữ liệu mẫu (Seeding).

### Truy Cập Website (Môi trường local)
- **Trang chủ khách hàng:** [http://localhost](http://localhost)
- **Trang đăng nhập Admin:** [http://localhost/ns-login-portal-2026](http://localhost/ns-login-portal-2026)
- **Trang quản trị Admin:** [http://localhost/ns-admin-portal-2026](http://localhost/ns-admin-portal-2026)
- **Tài khoản Admin Mặc Định:** Tài khoản: `admin` / Mật khẩu: `admin123`

---

## 🚚 Di Trú Dữ Liệu SQLite Cũ Sang Postgres 18 trên VPS (Downtime ~30 giây)

Nếu hệ thống cũ của bạn đang chạy SQLite và chứa dữ liệu thực tế của khách hàng, hãy thực hiện theo quy trình sau để di chuyển dữ liệu sang Postgres 18 trên VPS:

1. **Sao lưu dữ liệu SQLite cũ trên VPS:**
   ```bash
   mkdir -p ~/db_backups
   docker cp $(docker compose ps -q backend):/app/data/nongsan.db ~/db_backups/nongsan_prod_backup.db
   ```
2. **Cập nhật mã nguồn và chỉnh sửa `.env` trên VPS:**
   Đảm bảo tệp `.env` trên VPS đã cấu hình tên miền thực tế và thông tin đăng nhập PostgreSQL mong muốn.
3. **Khởi chạy hệ thống PostgreSQL 18 mới:**
   ```bash
   docker compose down
   docker compose pull
   docker compose up -d --build
   ```
4. **Copy tệp SQLite đã backup vào container backend và chạy script di trú:**
   ```bash
   # Copy file db cũ vào container backend
   docker cp ~/db_backups/nongsan_prod_backup.db $(docker compose ps -q backend):/app/nongsan.db
   
   # Chạy script di trú dữ liệu
   docker compose exec backend python -m app.utils.migrate_db
   ```
   *Script [migrate_db.py](file:///home/hoan/Dev/web2/backend/app/utils/migrate_db.py) sẽ tự động xóa các dữ liệu seed trống, sao chép toàn bộ dữ liệu từ SQLite sang PostgreSQL 18 và đồng bộ hóa các bộ đếm ID tự tăng (sequences).*
