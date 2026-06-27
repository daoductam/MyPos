# Danh Sách Vai Trò và Phân Quyền API (SaaS POS System)

Tài liệu này liệt kê toàn bộ các vai trò (`UserRole`) có trong hệ thống và các Endpoint API tương ứng mà mỗi vai trò có quyền truy cập.

---

## 1. Bản Đồ Tổng Quan Các Vai Trò (User Roles Overview)

Hệ thống hỗ trợ 7 vai trò chính:
- **`ROLE_ADMIN`** (Super Admin): Quản trị viên tối cao của toàn hệ thống SaaS.
- **`ROLE_STORE_ADMIN`** (Store Admin): Chủ chuỗi cửa hàng / Chủ doanh nghiệp (Tenant).
- **`ROLE_STORE_MANAGER`** (Store Manager): Quản lý cấp chuỗi cửa hàng.
- **`ROLE_BRANCH_ADMIN`** (Branch Admin): Quản trị viên chi nhánh cụ thể.
- **`ROLE_BRANCH_MANAGER`** (Branch Manager): Quản lý chi nhánh cụ thể.
- **`ROLE_BRANCH_CASHIER`** (Cashier): Nhân viên thu ngân tại chi nhánh.
- **`ROLE_CUSTOMER`** (Customer): Khách hàng thành viên.

---

## 2. Chi Tiết Chức Năng & Danh Sách API Theo Từng Vai Trò

### 🔑 ROLE_ADMIN (Super Admin)
Quản trị viên toàn hệ thống, chịu trách nhiệm phê duyệt cửa hàng mới, quản lý các gói đăng ký dịch vụ (Subscription Plans) và xem thống kê tăng trưởng của toàn hệ thống.

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/super-admin/dashboard/summary` | Xem tổng hợp số liệu (tổng số cửa hàng, trạng thái hoạt động) |
| `GET` | `/api/super-admin/dashboard/store-registrations` | Lấy biểu đồ lượt đăng ký cửa hàng trong 7 ngày gần nhất |
| `GET` | `/api/super-admin/dashboard/store-status-distribution` | Thống kê tỷ lệ phân bổ trạng thái cửa hàng (Active, Blocked, Pending) |
| `GET` | `/api/stores` | Xem danh sách tất cả các cửa hàng trong hệ thống (lọc theo trạng thái) |
| `PUT` | `/api/stores/{storeId}/moderate` | Phê duyệt hoặc từ chối yêu cầu đăng ký cửa hàng mới |
| `POST` | `/api/subscription-plans` | Tạo gói dịch vụ SaaS mới |
| `PUT` | `/api/subscription-plans/{id}` | Cập nhật gói dịch vụ |
| `DELETE` | `/api/subscription-plans/{id}` | Xóa gói dịch vụ |

---

### 🏪 ROLE_STORE_ADMIN (Store Admin / Merchant Owner)
Quản trị viên của một chuỗi cửa hàng. Đây là tài khoản đăng ký dịch vụ SaaS. Có quyền cao nhất trong phạm vi doanh nghiệp/cửa hàng của họ.

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/stores/admin` | Lấy thông tin chi tiết cửa hàng do Admin sở hữu |
| `PUT` | `/api/stores/{id}` | Cập nhật thông tin cấu hình cửa hàng |
| `DELETE` | `/api/stores` | Yêu cầu xóa/ngừng kích hoạt cửa hàng |
| `POST` | `/api/employees/store/{storeId}` | Tuyển dụng / Tạo tài khoản nhân viên cấp chuỗi |
| `GET` | `/api/stores/{storeId}/employee/list` | Xem danh sách toàn bộ nhân viên của chuỗi |
| `POST` | `/api/stores/add/employee` | Thêm nhân viên vào cửa hàng |
| `DELETE` | `/api/employees/{employeeId}` | Sa thải / Xóa tài khoản nhân viên |
| `GET` | `/api/employees/{employeeId}` | Xem chi tiết thông tin nhân viên |
| `GET` | `/api/employees/store/{storeId}` | Tìm danh sách nhân viên của cửa hàng |
| `DELETE` | `/api/orders/{id}` | Xóa đơn hàng (Chỉ Store Admin và Store Manager được phép) |
| `POST` | `/api/subscriptions` | Mua / Gia hạn gói dịch vụ SaaS |

---

### 👔 ROLE_STORE_MANAGER (Store Manager)
Quản lý vận hành cấp chuỗi cửa hàng, chịu trách nhiệm quản lý danh mục sản phẩm, tồn kho và theo dõi báo cáo doanh thu nhưng không có quyền cấu hình hệ thống nâng cao.

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/employees/store/{storeId}` | Tạo tài khoản nhân viên cấp chuỗi |
| `GET` | `/api/employees/{employeeId}` | Xem chi tiết thông tin nhân viên |
| `GET` | `/api/employees/store/{storeId}` | Xem danh sách nhân viên của cửa hàng |
| `GET` | `/api/stores/{storeId}/employee/list` | Xem danh sách toàn bộ nhân viên |
| `POST` | `/api/stores/add/employee` | Thêm nhân viên |
| `POST` | `/api/categories` | Tạo danh mục sản phẩm mới |
| `PUT` | `/api/categories/{id}` | Cập nhật danh mục sản phẩm |
| `DELETE` | `/api/categories/{id}` | Xóa danh mục sản phẩm |
| `POST` | `/api/products` | Thêm sản phẩm mới vào hệ thống |
| `PUT` | `/api/products/{id}` | Cập nhật thông tin sản phẩm |
| `DELETE` | `/api/products/{id}` | Xóa sản phẩm khỏi hệ thống |
| `POST` | `/api/inventory` | Khởi tạo kho hàng |
| `PUT` | `/api/inventory/{id}` | Cập nhật số lượng hàng tồn kho |
| `DELETE` | `/api/orders/{id}` | Hủy / Xóa đơn hàng |

---

### 🏢 ROLE_BRANCH_ADMIN (Branch Admin)
Quản trị viên của một chi nhánh cụ thể. Quản lý cấu hình, thiết bị và nhân sự trực thuộc chi nhánh đó.

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/employees/branch/{branchId}` | Tuyển dụng / Tạo tài khoản nhân viên cho chi nhánh |
| `PUT` | `/api/employees/{employeeId}` | Cập nhật thông tin nhân viên chi nhánh |
| `DELETE` | `/api/employees/{employeeId}` | Xóa nhân viên khỏi chi nhánh |
| `GET` | `/api/employees/{employeeId}` | Xem chi tiết thông tin nhân viên |
| `GET` | `/api/employees/branch/{branchId}` | Xem danh sách nhân viên chi nhánh |
| `GET` | `/api/orders/recent/{branchId}` | Xem các đơn hàng gần đây của chi nhánh |
| `GET` | `/api/branch-analytics/**` | Xem các báo cáo phân tích, doanh thu của chi nhánh |

---

### 📋 ROLE_BRANCH_MANAGER (Branch Manager)
Quản lý điều hành một chi nhánh cụ thể, phụ trách doanh thu, quản lý thu ngân và hàng hóa tại chi nhánh đó.

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/employees/branch/{branchId}` | Tạo tài khoản nhân viên chi nhánh |
| `PUT` | `/api/employees/{employeeId}` | Cập nhật thông tin nhân viên chi nhánh |
| `GET` | `/api/employees/{employeeId}` | Xem thông tin chi tiết nhân viên |
| `GET` | `/api/employees/branch/{branchId}` | Xem danh sách nhân viên chi nhánh |
| `GET` | `/api/orders/recent/{branchId}` | Xem 5 đơn hàng gần đây nhất của chi nhánh |
| `GET` | `/api/branch-analytics/**` | Theo dõi phân tích doanh thu của chi nhánh |

---

### 💵 ROLE_BRANCH_CASHIER (hoặc Authority: ROLE_CASHIER)
Thu ngân tại quầy chi nhánh. Vai trò trực tiếp tạo đơn hàng và thanh toán cho khách hàng.

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/orders` | Tạo đơn hàng mới và thực hiện thanh toán (Checkout) |
| `GET` | `/api/orders/cashier/{cashierId}` | Tìm danh sách đơn hàng do thu ngân này thực hiện |
| `GET` | `/api/orders/today/branch/{branchId}` | Xem các đơn hàng phát sinh trong ngày tại chi nhánh |
| `POST` | `/api/refunds` | Tạo yêu cầu hoàn tiền cho khách hàng |

---

### 👤 ROLE_CUSTOMER (Customer)
Khách hàng thành viên của hệ thống. Tra cứu thông tin cá nhân và lịch sử giao dịch mua sắm.

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/orders/customer/{customerId}` | Tra cứu danh sách đơn hàng đã mua |
| `GET` | `/api/customers/profile` | Xem thông tin tài khoản thành viên và điểm tích lũy |
