# Hướng Dẫn Sử Dụng Trang Quản Trị (Admin Usage Guide)

Tài liệu này hướng dẫn nhân viên cách sử dụng các phân hệ chức năng trên trang quản trị hệ thống Nông Sản Sạch, tương ứng với các mục menu và tab hiển thị trong hệ thống.

---

## 🔑 1. Đường Dẫn Truy Cập
*   **Trang đăng nhập**: [http://localhost/ns-login-portal-2026](http://localhost/ns-login-portal-2026)
*   **Trang quản trị chính**: [http://localhost/ns-admin-portal-2026](http://localhost/ns-admin-portal-2026)

---

## 👥 2. Phân Quyền Vai Trò Người Dùng

Hệ thống quản lý nội bộ bao gồm 3 vai trò chính. Tùy thuộc vào tài khoản của bạn, một số menu hoặc tab chức năng có thể bị ẩn đi:

1.  **Quản trị viên (Admin)**: 
    *   Truy cập tất cả các menu: **Tổng quan** (bao gồm cả tab *Thống kê truy cập*), **Quản lý sản phẩm**, **Quản lý nội dung**, **Cấu hình hệ thống**, và **Đổi mật khẩu**.
2.  **Quản lý sản phẩm (Product Manager)**: 
    *   Chỉ truy cập được menu: **Tổng quan** (không có tab *Thống kê truy cập*), **Quản lý sản phẩm**, và **Đổi mật khẩu**.
3.  **Biên tập viên (Content Editor)**: 
    *   Chỉ truy cập được menu: **Tổng quan** (không có tab *Thống kê truy cập*), **Quản lý nội dung**, và **Đổi mật khẩu**.

### 🚫 Chế độ Chỉ xem (Read-only Mode)
Nếu tài khoản của bạn được thiết lập ở chế độ **Chỉ xem**:
*   Bạn chỉ có quyền duyệt xem thông tin thuộc phân hệ của mình.
*   Tất cả các nút **Thêm mới**, **Thêm bài viết**, **Thêm sản phẩm**, **Sửa (biểu tượng bút chì)**, **Xóa (biểu tượng thùng rác)**, và **Cập nhật** sẽ tự động bị ẩn.
*   Hệ thống sẽ chặn mọi thao tác lưu thông tin từ tài khoản của bạn.

---

## 📂 3. Hướng Dẫn Chi Tiết Các Menu & Tab Chức Năng

### A. Menu: Tổng quan
*Dành cho: Tất cả vai trò (riêng tab Thống kê truy cập chỉ dành cho Admin)*

Menu này là màn hình chào mừng và tổng hợp tình hình hoạt động của hệ thống.

#### 1. Tab: Tổng quan
*   Hiển thị số lượng **Sản phẩm** và **Bài viết/Tin tức** hiện có trên hệ thống kèm đường dẫn nhanh đến trang quản lý.
*   Cung cấp khu vực **Thao tác nhanh** giúp tạo mới sản phẩm hoặc bài viết chỉ bằng một cú nhấp chuột.

#### 2. Tab: Thống kê truy cập (Chỉ Admin xem được)
*   **Mục đích**: Theo dõi lượng lưu lượng người dùng truy cập vào website từ dịch vụ Cloudflare.
*   **Cách dùng**:
    *   **Chọn khoảng thời gian**: Lọc dữ liệu hiển thị theo **7 ngày**, **14 ngày** hoặc **30 ngày**.
    *   **Xem biểu đồ**: Theo dõi biểu đồ đường về số lượng **Lượt yêu cầu (Requests)** và số **Lượt xem trang (Page Views)** qua từng ngày.
    *   **Thống kê khu vực & thiết bị**: Xem tỷ lệ truy cập từ các quốc gia (Country Traffic) và các loại thiết bị như Mobile, Desktop (Device Traffic).
    *   **Nút Làm mới (Sync)**: Bấm để đồng bộ dữ liệu mới nhất từ Cloudflare (giới hạn tần suất bấm tối thiểu 5 phút một lần để tránh quá tải).

---

### B. Menu: Quản lý sản phẩm
*Dành cho: Admin, Product Manager*

Giúp quản lý thông tin các mặt hàng nông sản sạch VietGAP hiển thị trên website.

#### 1. Tab: Danh sách sản phẩm
*   **Cách dùng**:
    *   Xem danh sách các sản phẩm đang bán kèm hình ảnh và giá cả.
    *   Sử dụng thanh công cụ để tìm kiếm và lọc sản phẩm theo danh mục.
    *   **Thêm sản phẩm**: Bấm nút **Thêm sản phẩm**, tải lên ảnh sản phẩm, điền tên tiếng Việt/Anh/Trung, giá bán, mô tả sản phẩm và thiết lập trạng thái ẩn/hiện.
    *   **Sửa/Xóa**: Thực hiện qua biểu tượng ✏️ và 🗑️ trên thẻ sản phẩm tương ứng.

#### 2. Tab: Danh mục sản phẩm
*   **Cách dùng**: Phân chia nhóm nông sản (rau củ, trái cây, nấm...). Có thể thêm danh mục mới hoặc sửa/xóa các danh mục cũ.

---

### C. Menu: Quản lý nội dung
*Dành cho: Admin, Content Editor*

Biên tập nội dung chia sẻ kinh nghiệm nông nghiệp và ý kiến đánh giá từ khách hàng.

#### 1. Tab: Danh sách bài viết
*   **Cách dùng**:
    *   Duyệt danh sách các câu chuyện nông sản, bài viết kỹ thuật gieo trồng.
    *   Lọc nhanh các bài viết theo chuyên mục tương ứng.
    *   **Thêm bài viết**: Bấm **Thêm bài viết**, tải lên hình ảnh banner bìa, điền tiêu đề, tóm tắt và sử dụng trình soạn thảo văn bản để viết nội dung chi tiết. Hỗ trợ dịch ngôn ngữ (Tiếng Anh/Tiếng Trung) qua các tab ngôn ngữ.
    *   **Sửa/Xóa**: Bấm nút sửa/xóa ở cuối mỗi dòng bài viết.

#### 2. Tab: Chuyên mục bài viết
*   **Cách dùng**: Quản lý các nhóm chủ đề bài viết (ví dụ: *Kỹ thuật chăm sóc*, *Cẩm nang ẩm thực*).
*   **Đặc tả nâng cao**:
    *   **Ghim lên thanh điều hướng (Navbar)**: Bạn có thể chọn ghim tối đa **1** chuyên mục bài viết lên thanh điều hướng chính của trang web công cộng.
    *   **Mô tả ngắn (Short description)**: Mỗi chuyên mục bài viết có thể điền thông tin Mô tả ngắn (hỗ trợ 3 ngôn ngữ: Tiếng Việt, Tiếng Anh, Tiếng Trung). Khi người dùng duyệt xem chuyên mục đó trên giao diện công cộng, banner của trang sẽ tự động hiển thị mô tả ngắn này làm phụ đề (subtitle) thay cho thông tin mặc định.

#### 3. Tab: Ý kiến khách hàng
*   **Cách dùng**: Quản lý nhận xét của người mua hàng để làm tư liệu tin cậy ở trang chủ. Có thể nhập tên khách hàng, ảnh đại diện, đánh giá số sao (từ 1 đến 5) và nội dung phản hồi.

---

### D. Menu: Cấu hình hệ thống
*Dành cho: Admin*

Cấu hình các thông tin liên hệ tĩnh dùng chung trên toàn bộ các trang của hệ thống.

*   **Cách dùng**:
    *   Nhập số điện thoại **Hotline / Zalo** hiển thị tại Header & Footer.
    *   Nhập số điện thoại **WhatsApp** (định dạng quốc tế, ví dụ: 84901234567, không kèm dấu + hoặc khoảng trắng) hiển thị tại Footer, trang liên hệ và kích hoạt nút Chat nổi ở góc phải màn hình.
    *   Đường dẫn **Zalo chat nhanh** để khách hàng liên hệ trực tiếp.
    *   Địa chỉ email, thông tin chân trang (Footer), bản đồ và các đường dẫn mạng xã hội của doanh nghiệp.
    *   Bấm **Lưu cấu hình** để áp dụng thay đổi lập tức lên trang giao diện chính.

---

### E. Menu: Đổi mật khẩu
*Dành cho: Tất cả vai trò*

Tài khoản cá nhân của bạn nên được thay đổi mật khẩu định kỳ để đảm bảo tính an toàn.

*   **Cách dùng**: Nhập mật khẩu hiện tại đang dùng, sau đó nhập mật khẩu mới và xác nhận mật khẩu mới để tiến hành cập nhật.
