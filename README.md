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
Khi bạn thêm hoặc sửa đổi thuộc tính của model trong thư mục `app/models/`, hãy chạy lệnh sau ở folder `backend` để tự sinh file migration mới:
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
```bash
nano .env
```

Nhập và điều chỉnh các tham số cấu hình sau:

```env
# 1. Tên miền phục vụ (Domain names cho Caddy)
# - Dưới local: DOMAIN_NAME=localhost
# - Trên VPS: DOMAIN_NAME=nongsansachvietnam.com, www.nongsansachvietnam.com
DOMAIN_NAME=localhost

# 2. Cấu hình kết nối SQLAlchemy/SQLModel tới PostgreSQL 18
# Định dạng: postgresql+pg8000://<username>:<password>@db:5432/<database_name>
# Lưu ý quan trọng: Nếu mật khẩu có ký tự đặc biệt "@", bạn phải mã hóa (URL encode) thành "%40"
# Ví dụ: mật khẩu là "P@ssw0rd" thì nhập vào chuỗi là "P%40ssw0rd"
DATABASE_URL=postgresql+pg8000://nongsan_user:secure_password_here@db:5432/nongsan_db

# 3. Cấu hình khởi tạo Database PostgreSQL 18
POSTGRES_USER=nongsan_user
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=nongsan_db

# 4. Thư mục tải lên hình ảnh tĩnh (Mặc định trong container)
UPLOAD_DIR=/app/static/uploads

# 5. Mã bảo mật JWT (Nên tạo một chuỗi ngẫu nhiên dài để bảo mật ở Production)
JWT_SECRET=super-secure-random-secret-key-123456789

# 6. Tài khoản quản trị mặc định (Tự động khởi tạo ở lần chạy đầu tiên nếu chưa có)
ADMIN_USERNAME=adminnongsan
ADMIN_PASSWORD=admin_password_here
```

### Bước 2: Khởi Chạy Hệ Thống
Mở terminal tại thư mục gốc của dự án và chạy lệnh sau:
```bash
docker compose up -d --build
```
Lệnh này sẽ tự động tải các base image, xây dựng môi trường ảo FastAPI, khởi chạy PostgreSQL 18 và Caddy. Đồng thời tự tạo database schema và nạp dữ liệu mẫu (Seeding) lên Postgres.

### Truy Cập Website (Môi trường local)
- **Trang chủ khách hàng:** [http://localhost](http://localhost)
- **Trang đăng nhập Admin:** [http://localhost/ns-login-portal-2026](http://localhost/ns-login-portal-2026)
- **Trang quản trị Admin:** [http://localhost/ns-admin-portal-2026](http://localhost/ns-admin-portal-2026)

---

## 🚢 Triển khai (Deployment) & CI/CD

Dự án được tích hợp sẵn luồng CI/CD tự động bằng **GitHub Actions** để đóng gói và triển khai nhanh lên máy chủ VPS qua kết nối SSH bảo mật.

### 1. Luồng Hoạt Động (CI/CD Workflow)
Khi bạn thực hiện lệnh `git push` lên nhánh `main`, GitHub Actions sẽ tự động kích hoạt:
1. Đăng nhập vào Docker Hub tài khoản của bạn.
2. Build song song 2 Docker Image (`backend` & `frontend`) dạng tối ưu cache đa tầng.
3. Push các image lên Docker Hub: `hoan171188/nongsanlongan:backend` và `hoan171188/nongsanlongan:frontend`.
4. SSH vào VPS, tự động chạy lệnh pull các image mới nhất, kết hợp với file `.env` cục bộ trên VPS và khởi chạy lại hệ thống bằng Docker Compose ở chế độ chạy ngầm (detached mode).

### 2. Thiết lập trên Github Repository (Secrets)
Truy cập vào trang quản lý của dự án trên GitHub: **Settings > Secrets and variables > Actions** và khai báo các khóa sau:

| Tên Secret | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `DOCKERHUB_TOKEN` | Token bảo mật tạo từ tài khoản Docker Hub của bạn (để login) | `dckr_pat_...` |
| `SSH_HOST` | Địa chỉ IP tĩnh của VPS chạy Production | `123.45.67.89` |
| `SSH_USERNAME` | Tên tài khoản đăng nhập SSH của VPS | `root` hoặc `ubuntu` |
| `SSH_PRIVATE_KEY` | Nội dung khóa riêng tư SSH Private Key để xác thực đăng nhập | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
