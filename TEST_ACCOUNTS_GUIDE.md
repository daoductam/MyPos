# Hướng dẫn Kiểm thử Hệ thống DMart POS & Danh sách Tài khoản Test

Tài liệu này cung cấp danh sách đầy đủ các tài khoản mẫu đã được cấu hình và sinh tự động bởi hệ thống (`DataInitializationComponent`), kèm kịch bản kiểm thử (Test Scenarios) chi tiết cho từng vai trò người dùng trong hệ sinh thái **DMart POS** (Multi-tenant SaaS).

---

## 1. Môi trường khởi chạy
- **Frontend (React 19 + Vite):** [http://localhost:5173](http://localhost:5173)
- **Backend (Spring Boot 3.5+):** [http://localhost:5000](http://localhost:5000)
- **Cơ sở dữ liệu:** MySQL (Port `3306`), Redis (Port `6379`)
- **Trang đăng nhập chung:** [http://localhost:5173/auth/login](http://localhost:5173/auth/login)

---

## 2. Bảng Danh Sách Tài Khoản Mẫu (Test Accounts)

| Vai trò (Role) | Email đăng nhập | Mật khẩu | Cấp bậc / Phạm vi | Đường dẫn sau đăng nhập |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `tam@gmail.com` | `tam123456` | Quản trị viên tối cao toàn sàn SaaS | `/super-admin` |
| **Store Admin** | `store.admin@dmart.com` | `StoreAdmin@123` | Chủ chuỗi cửa hàng (*D Mart HN*) | `/store` |
| **Store Manager** | `store.manager@dmart.com` | `StoreManager@123` | Quản lý vận hành toàn chuỗi | `/store` |
| **Branch Manager** | `branch.manager@dmart.com` | `BranchManager@123` | Quản lý chi nhánh (*D Mart Cầu Giấy*) | `/branch` |
| **Branch Admin** | `branch.admin@dmart.com` | `BranchAdmin@123` | Quản trị kỹ thuật & quầy tại chi nhánh | `/branch` |
| **Branch Cashier** | `cashier@dmart.com` | `Cashier@123` | Thu ngân tại quầy bán lẻ | `/cashier` |
| **Customer** | `customer@gmail.com` | `Customer@123` | Khách hàng thành viên tích điểm | `/` |

---

## 3. Kịch bản Kiểm thử theo Vai trò (Test Scenarios)

### 🛒 1. Thu Ngân Chi Nhánh (`ROLE_BRANCH_CASHIER`)
- **Tài khoản:** `cashier@dmart.com` / `Cashier@123`
- **Mục tiêu:** Kiểm tra quy trình bán lẻ trực tiếp tại quầy POS, xử lý đổi trả và chốt ca làm việc.
- **Kịch bản kiểm thử:**
  1. **Tạo đơn hàng POS (`/cashier`):**
     - Tìm kiếm sản phẩm theo tên hoặc barcode.
     - Tăng/giảm số lượng món, áp dụng chiết khấu/mã giảm giá (nếu có).
     - Tra cứu thông tin khách hàng thành viên (`/cashier/customers`) để tích điểm.
     - Chọn phương thức thanh toán: Tiền mặt, Thẻ, hoặc Quét mã QR thanh toán.
     - Nhấn hoàn tất đơn hàng và xem bản xem trước / in hóa đơn (`react-to-print`).
  2. **Tra cứu lịch sử đơn hàng (`/cashier/orders`):**
     - Tìm lại đơn hàng vừa thanh toán theo mã đơn hàng hoặc thời gian tạo.
  3. **Xử lý yêu cầu đổi trả hàng (`/cashier/returns`):**
     - Nhập mã hóa đơn cũ, chọn các món khách hàng muốn trả lại và tạo phiếu hoàn tiền.
  4. **Báo cáo kết ca / Chốt ca (`/cashier/shift-summary`):**
     - Xem tổng kết doanh số bán trong ca (tiền mặt thu được, tiền thanh toán thẻ/chuyển khoản).
     - Thực hiện đối soát số dư tiền mặt đầu ca - cuối ca và kết thúc ca làm việc.

---

### 🏪 2. Quản Lý Chi Nhánh (`ROLE_BRANCH_MANAGER` & `ROLE_BRANCH_ADMIN`)
- **Tài khoản:** `branch.manager@dmart.com` (hoặc `branch.admin@dmart.com`) / `BranchManager@123`
- **Mục tiêu:** Vận hành hoạt động kinh doanh, nhân sự và quản lý kho hàng tại chi nhánh Cầu Giấy.
- **Kịch bản kiểm thử:**
  1. **Dashboard chi nhánh (`/branch/dashboard`):**
     - Theo dõi chỉ số doanh thu trong ngày/tuần/tháng, số lượng đơn bán và giá trị trung bình mỗi đơn.
  2. **Quản lý kho tồn (`/branch/inventory`):**
     - Xem số lượng tồn kho từng mặt hàng tại chi nhánh.
     - Cập nhật định mức tồn kho tối thiểu, kiểm tra cảnh báo sắp hết hàng.
  3. **Kiểm soát đơn hàng & duyệt hoàn tiền (`/branch/orders`, `/branch/refunds`):**
     - Xem chi tiết toàn bộ các đơn hàng do các thu ngân trong chi nhánh tạo ra.
     - Phê duyệt hoặc từ chối các yêu cầu hoàn tiền/đổi trả từ quầy thu ngân.
  4. **Quản lý nhân viên chi nhánh (`/branch/employees`):**
     - Xem danh sách thu ngân của chi nhánh, theo dõi trạng thái hoạt động hoặc phân ca.
  5. **Báo cáo chi nhánh (`/branch/reports`):**
     - Xem báo cáo doanh thu theo mặt hàng bán chạy, khung giờ cao điểm và hiệu suất thu ngân.

---

### 🏢 3. Chủ Chuỗi & Quản Lý Chuỗi (`ROLE_STORE_ADMIN` & `ROLE_STORE_MANAGER`)
- **Tài khoản:** `store.admin@dmart.com` (hoặc `store.manager@dmart.com`) / `StoreAdmin@123`
- **Mục tiêu:** Thiết lập Master Data toàn chuỗi, mở rộng chi nhánh và quản lý gói cước SaaS.
- **Kịch bản kiểm thử:**
  1. **Tổng quan toàn chuỗi (`/store/dashboard`):**
     - Xem biểu đồ tổng doanh thu toàn chuỗi, tỷ trọng đóng góp doanh số giữa các chi nhánh.
  2. **Quản lý chi nhánh (`/store/branches`):**
     - Xem danh sách chi nhánh hiện có (*D Mart Cầu Giấy*).
     - Bấm thêm mới chi nhánh (ví dụ: *D Mart Đống Đa*), cấu hình địa chỉ, hotline, giờ mở/đóng cửa và chỉ định Quản lý chi nhánh.
  3. **Danh mục & Danh mục hàng hóa (`/store/categories`, `/store/products`):**
     - Thêm mới danh mục hàng (ví dụ: *Bánh kẹo*, *Nước giải khát*, *Gia vị*).
     - Thêm mới sản phẩm: Nhập tên, mã vạch (Barcode), giá vốn, giá niêm yết, đơn vị tính và ảnh đại diện.
  4. **Quản lý nhân sự cấp chuỗi (`/store/employees`):**
     - Tạo tài khoản nhân viên mới, phân quyền vào chi nhánh cụ thể hoặc cấp quyền quản lý.
  5. **Báo cáo chuỗi & Cảnh báo (`/store/reports`, `/store/alerts`):**
     - So sánh hiệu quả kinh doanh giữa các chi nhánh, theo dõi hàng tồn đọng.
  6. **Nâng cấp gói dịch vụ SaaS (`/store/upgrade`):**
     - Kiểm tra gói dịch vụ hiện tại và hạn mức (số chi nhánh tối đa, số nhân viên tối đa).
     - Trải nghiệm quy trình thanh toán nâng cấp gói cước (*Professional* hoặc *Enterprise*) thông qua Stripe/Razorpay.

---

### 👑 4. Quản Trị Tối Cao Hệ Thống (`ROLE_ADMIN`)
- **Tài khoản:** `tam@gmail.com` / `tam123456`
- **Mục tiêu:** Quản trị toàn bộ nền tảng POS đa khách hàng (SaaS Platform Owner).
- **Kịch bản kiểm thử:**
  1. **Dashboard toàn sàn (`/super-admin/dashboard`):**
     - Thống kê tổng số khách hàng doanh nghiệp (chuỗi cửa hàng), tổng người dùng toàn hệ thống và doanh thu từ các gói thuê bao SaaS.
  2. **Quản lý chuỗi cửa hàng (`/super-admin/stores`):**
     - Xem danh sách tất cả các chuỗi cửa hàng (*D Mart HN*, v.v.).
     - Xem thông tin chi tiết từng chuỗi, kích hoạt (Activate) hoặc tạm dừng (Deactivate) một chuỗi.
  3. **Phê duyệt yêu cầu mở cửa hàng mới (`/super-admin/requests`):**
     - Xem và duyệt các đơn đăng ký mở gian hàng mới trên hệ sinh thái.
  4. **Quản lý gói cước thuê bao (`/super-admin/subscriptions`):**
     - Cấu hình các gói: *Starter* (300.000đ/tháng), *Professional* (900.000đ/tháng), *Enterprise* (2.500.000đ/tháng).
     - Điều chỉnh các giới hạn: số chi nhánh, số người dùng tối đa, tính năng nâng cao.

---

## 4. Các lưu ý khi kiểm thử
- **Đổi tài khoản:** Sau khi kiểm thử một vai trò, bấm nút **Logout** ở góc trên bên phải thanh điều hướng hoặc làm mới localStorage (`jwt`) để đăng nhập tài khoản khác.
- **Ràng buộc chi nhánh:** Thu ngân (`ROLE_BRANCH_CASHIER`) và Quản lý chi nhánh (`ROLE_BRANCH_MANAGER`) chỉ thao tác trên dữ liệu thuộc chi nhánh được gán (*D Mart Cầu Giấy*).
- **Dữ liệu thời gian thực:** Cơ sở dữ liệu MySQL đã kích hoạt `hibernate.ddl-auto: update`, mọi thao tác thêm/sửa/xóa đều được lưu trữ trực tiếp vào database `pos`.
