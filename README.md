# Nông Sản Sạch - Website Giới Thiệu & Quản Lý Nông Sản

Hệ thống giới thiệu và quản lý nông sản sạch tiêu chuẩn VietGAP. Dự án được phát triển theo kiến trúc hiện đại, đóng gói hoàn toàn bằng Docker để chạy môi trường phát triển và sản xuất dễ dàng.

---

## 🏗️ Kiến Trúc Hệ Thống

Dự án bao gồm 3 thành phần chính hoạt động trong mạng lưới Docker:

1. **Frontend (Next.js):** 
   - Sử dụng Next.js App Router (React), Tailwind CSS, Lucide Icons.
   - Giao diện thân thiện, hiện đại, tối ưu SEO, hỗ trợ Responsive đầy đủ trên mobile và desktop.
   - Tải nhanh nhờ cơ chế kết hợp Server Components (SSR) và Incremental Static Regeneration (ISR).

2. **Backend (FastAPI):**
   - Viết bằng FastAPI (Python 3.13), SQLModel (kết hợp SQLAlchemy và Pydantic), SQLite.
   - Cung cấp các API quản lý sản phẩm, bài viết, danh mục, cấu hình hotline hệ thống và đăng nhập admin bảo mật bằng JWT (JSON Web Tokens).

3. **Web Server & Reverse Proxy (Caddy):**
   - Sử dụng Caddy để nhận và điều hướng toàn bộ request (Port 80/443).
   - Đảm nhiệm nén phản hồi (Gzip/Zstd), nén ảnh WebP nông sản và lưu cache tĩnh cho hiệu năng phản hồi tối ưu nhất.

---

## ✨ Các Tính Năng Chính

### 🌐 Trang Công Cộng (Người Dùng)
- **Trang chủ:** Banner giới thiệu, sản phẩm nổi bật, quy trình sản xuất và các đánh giá từ khách hàng.
- **Danh mục nông sản:** Lọc sản phẩm động theo danh mục lấy từ cơ sở dữ liệu.
- **Chi tiết sản phẩm:** Xem hình ảnh, mô tả, chứng nhận VietGAP, nguồn gốc, giá bán và liên kết tư vấn/mua nhanh.
- **Câu chuyện nhà vườn:** Nơi chia sẻ các bài viết kinh nghiệm canh tác hữu cơ.
- **Liên hệ nhanh:** Hỗ trợ form liên hệ nhanh và kết nối trực tiếp đến Zalo của chủ vườn.
- **Hotline & Zalo động:** Toàn bộ hotline và link chat Zalo trên website tự động đồng bộ theo số điện thoại được thiết lập trong Admin.

### 🔒 Trang Quản Trị (Admin Panel - `/ns-admin-portal-2026`)
- **Tổng quan (Dashboard):** Xem số liệu thống kê tổng sản phẩm và bài viết.
- **Quản lý sản phẩm (CRUD):** Thêm, sửa, xóa sản phẩm, giá bán, mô tả, tải lên ảnh sản phẩm động.
- **Danh mục sản phẩm (CRUD):** Quản lý động các danh mục sản phẩm (như trái cây tươi, hạt dinh dưỡng, đồ uống...).
- **Quản lý bài viết (CRUD):** Quản lý các bài viết cẩm nang nông nghiệp chia sẻ trên website.
- **Cấu hình hệ thống:** Quản lý số điện thoại hotline/Zalo của nhà vườn.

---

## 🚀 Hướng Dẫn Cài Đặt Và Khởi Chạy

### Yêu Cầu Hệ Thống
- Đã cài đặt **Docker** và **Docker Compose**.
- Đảm bảo cổng `80` và `443` trên máy chủ không bị chiếm dụng bởi dịch vụ khác (như Nginx hay Apache).

### Khởi Chạy
Bạn chỉ cần mở terminal tại thư mục gốc của dự án và chạy lệnh sau:

```bash
docker compose up -d --build
```

Lệnh này sẽ tự động:
1. Tải các Base Image cần thiết (Node 22, Python 3.13, Caddy).
2. Xây dựng môi trường ảo (Virtualenv) cho FastAPI bằng công cụ `uv` siêu tốc.
3. Build và khởi chạy các container: `backend`, `frontend`, và `caddy`.
4. Tự động khởi tạo cấu trúc bảng SQLite và nạp dữ liệu mẫu (Seeding) bao gồm: Tài khoản Admin mặc định, các danh mục, sản phẩm và bài viết mẫu để bạn có thể trải nghiệm ngay mà không cần cấu hình thủ công.

### Truy Cập Website
- **Trang chủ khách hàng:** [http://localhost](http://localhost)
- **Trang đăng nhập Admin:** [http://localhost/ns-login-portal-2026](http://localhost/ns-login-portal-2026)
- **Trang quản trị Admin:** [http://localhost/ns-admin-portal-2026](http://localhost/ns-admin-portal-2026) *(tự động chuyển hướng sau khi đăng nhập thành công)*

### Tài Khoản Admin Mặc Định
- **Tài khoản:** `admin`
- **Mật khẩu:** `admin123`

*(Bạn có thể thay đổi các giá trị mặc định này trước khi dựng container trong phần `environment` của file `docker-compose.yml`)*

---

## 🛠️ Cấu Trúc Thư Mục Dự Án

```text
├── backend/            # Mã nguồn FastAPI
│   ├── app/
│   │   ├── core/       # Database, Config, Security
│   │   ├── models/     # Định nghĩa các bảng dữ liệu (User, Product, Category, Setting, Blog)
│   │   ├── routers/    # API endpoints (Auth, Products, Categories, Settings, Blogs, Uploads)
│   │   └── main.py     # Điểm chạy FastAPI chính
│   ├── Dockerfile      # Dockerfile tối ưu đa tầng (Multi-stage) chạy Python 3.13
│   └── pyproject.toml  # Quản lý dependencies (FastAPI, SQLModel, Uvicorn, Pillow)
│
├── frontend/           # Mã nguồn Next.js
│   ├── app/            # Next.js App Router (Public & Admin layouts/pages)
│   ├── components/     # UI Components dùng chung (Navbar, Footer, Floating Buttons)
│   ├── lib/            # API client wrapper
│   └── Dockerfile      # Dockerfile chạy Next.js tối ưu chế độ standalone
│
├── Caddyfile           # Cấu hình Web Server Caddy
└── docker-compose.yml  # File điều phối Docker Compose toàn dự án
```

---

## 🚢 Triển khai (Deployment) & CI/CD

Dự án được tích hợp sẵn luồng CI/CD tự động bằng **GitHub Actions** để đóng gói và triển khai nhanh lên máy chủ VPS qua kết nối SSH bảo mật.

### 1. Luồng Hoạt Động (CI/CD Workflow)
Khi bạn thực hiện lệnh `git push` lên nhánh `main`, GitHub Actions sẽ tự động kích hoạt:
1. Đăng nhập vào Docker Hub tài khoản của bạn.
2. Build song song 2 Docker Image (`backend` & `frontend`) dạng tối ưu cache đa tầng.
3. Push các image lên kho chứa công khai/riêng tư: `hoan171188/nongsanlongan:backend` và `hoan171188/nongsanlongan:frontend`.
4. SSH bảo mật vào VPS, tự động chạy lệnh pull các image mới nhất và khởi chạy lại hệ thống bằng Docker Compose ở chế độ chạy ngầm (detached mode).

### 2. Thiết lập trên Github Repository (Secrets)
Truy cập vào trang quản lý của dự án trên GitHub: **Settings > Secrets and variables > Actions** và khai báo các khóa sau:

| Tên Secret | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `DOCKERHUB_TOKEN` | Token bảo mật tạo từ tài khoản Docker Hub của bạn (để login) | `dckr_pat_...` |
| `SSH_HOST` | Địa chỉ IP tĩnh của VPS chạy Production | `123.45.67.89` |
| `SSH_USERNAME` | Tên tài khoản đăng nhập SSH của VPS | `root` hoặc `ubuntu` |
| `SSH_PRIVATE_KEY` | Nội dung khóa riêng tư SSH Private Key để xác thực đăng nhập | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### 3. Cấu hình môi trường (`.env`) trên VPS
Để đảm bảo bảo mật và không bị lộ mật khẩu khi lưu trữ mã nguồn, file cấu hình `.env` **chỉ được tạo thủ công một lần duy nhất** trực tiếp trên đĩa của VPS.

1. SSH vào VPS và chuyển đến thư mục deploy (Ví dụ: `/home/hoan/app/`).
2. Tạo file cấu hình môi trường `.env`:
   ```bash
   nano .env
   ```
3. Nhập các tham số cấu hình production thực tế của bạn:
   ```ini
   DATABASE_URL=sqlite:///data/nongsan.db
   UPLOAD_DIR=/app/static/uploads
   JWT_SECRET=thay_the_bang_chuoi_random_dai_va_bao_mat_cua_ban
   ADMIN_USERNAME=hoan_admin_prod
   ADMIN_PASSWORD=mat_khau_sieu_kho_cua_ban_123
   ```
4. Đảm bảo trên VPS đã có sẵn file `Caddyfile` và `docker-compose.yml` phiên bản production để chạy. Khi luồng GitHub Actions SSH vào chạy lệnh deploy, Docker Compose sẽ tự động kết hợp các image tải từ Docker Hub với file `.env` cục bộ này để vận hành website một cách an toàn nhất.

