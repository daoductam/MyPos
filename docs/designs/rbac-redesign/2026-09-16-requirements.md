# Requirements: RBAC v2 cho DMart POS

Started at: 2026/09/16 22:27:46  
Finished at: 2026/09/16 22:29:56  
Total time: 2 phút

---

## Source

- **Vision:** [2026-09-16-vision.md](./2026-09-16-vision.md)
- **Current role mapping:** [docs/roles_api_mapping.md](../../roles_api_mapping.md)
- **Current auth configuration:** Backend/src/main/java/com/tamdao/configurations/SecurityConfig.java

## Decisions From Vision Review

| Chủ đề | Quyết định v1 |
|---|---|
| Role model | Dùng 6 role chuẩn: ROLE_ADMIN, ROLE_STORE_ADMIN, ROLE_STORE_MANAGER, ROLE_BRANCH_MANAGER, ROLE_CASHIER, ROLE_CUSTOMER. |
| Legacy roles | ROLE_BRANCH_ADMIN ánh xạ tạm thời sang ROLE_BRANCH_MANAGER + permission bổ sung; ROLE_BRANCH_CASHIER là alias của ROLE_CASHIER trong migration. |
| Store/branch membership | Giữ invariant tương thích dữ liệu hiện tại: employee thuộc một store; branch-level employee thuộc một branch. Thiết kế authorization không được hard-code invariant này để có thể mở rộng membership sau v1. |
| Customer | Có self-service tối thiểu cho profile và lịch sử đơn hàng; e-commerce/loyalty nâng cao không thuộc phase này. |
| Permission customization | V1 dùng permission bundle cố định và permission override có kiểm soát; chưa cho tenant tự tạo permission tùy ý. |
| API compatibility | /api/v1 là contract chuẩn. Endpoint legacy /api chỉ được giữ alias nếu inventory xác nhận có client đang sử dụng. |
| Migration tool | Không dùng ddl-auto=update cho migration authorization production; Architecture phase phải chọn Flyway hoặc Liquibase. |

## Functional Requirements

### Use Cases

| # | Actor | Action | System Response |
|---|---|---|---|
| UC-01 | ROLE_ADMIN | Xem và quản trị tenant/store trên toàn platform | Cho phép dashboard platform, moderate store và quản lý subscription plan trong scope PLATFORM. |
| UC-02 | ROLE_STORE_ADMIN | Quản lý một store/tenant | Cho phép cấu hình store, lifecycle branch, nhân sự cấp store, sản phẩm, danh mục, tồn kho và subscription trong scope STORE. |
| UC-03 | ROLE_STORE_MANAGER | Vận hành store | Cho phép nhân sự vận hành, product/category/inventory và báo cáo store; không mặc nhiên có quyền lifecycle branch hoặc subscription/payment. |
| UC-04 | ROLE_BRANCH_MANAGER | Điều hành branch | Cho phép nhân sự branch, đơn hàng, tồn kho, analytics, ca và refund trong scope BRANCH; quyền xóa đặc biệt chỉ có khi được cấp permission. |
| UC-05 | ROLE_CASHIER | Thực hiện POS tại branch | Chỉ tạo order, payment, mở/đóng ca và tạo refund request cho branch được gán; không truy cập dữ liệu branch khác. |
| UC-06 | ROLE_CUSTOMER | Tự phục vụ tài khoản | Chỉ xem/sửa dữ liệu profile được phép và xem order của chính mình trong scope SELF. |
| UC-07 | Any authenticated user | Gọi API | Backend xác thực JWT, đánh giá permission và scope; frontend route guard chỉ hỗ trợ UX, không phải lớp bảo mật. |
| UC-08 | Store/platform administrator | Cấp hoặc thu hồi permission override | Hệ thống kiểm tra actor có quyền quản trị assignment, ghi audit event và áp dụng thay đổi từ request tiếp theo. |
| UC-09 | Platform/operator | Migrate account legacy | Ánh xạ role cũ sang role/permission mới, giữ audit và rollback plan, không tạo tài khoản mất quyền ngoài ý muốn. |
| UC-10 | Security/operator | Điều tra access decision | Có audit event cho access denied và các thao tác nhạy cảm, không ghi password, access token hoặc secret. |

### Permission Domains

Permission phải dùng naming ổn định theo dạng RESOURCE_ACTION, không rải string literal theo controller.

| Domain | Permission tiêu biểu | Scope hợp lệ |
|---|---|---|
| Platform | PLATFORM_STORE_READ, PLATFORM_STORE_MODERATE, PLATFORM_PLAN_MANAGE | PLATFORM |
| Store | STORE_READ, STORE_UPDATE, STORE_EMPLOYEE_MANAGE, STORE_REPORT_READ | STORE |
| Branch lifecycle | BRANCH_CREATE, BRANCH_UPDATE, BRANCH_DELETE, BRANCH_RESTORE | STORE |
| Branch operations | BRANCH_EMPLOYEE_READ, BRANCH_EMPLOYEE_MANAGE, BRANCH_EMPLOYEE_DELETE, BRANCH_REPORT_READ | BRANCH |
| Catalog/inventory | PRODUCT_MANAGE, CATEGORY_MANAGE, INVENTORY_READ, INVENTORY_ADJUST | STORE hoặc BRANCH theo resource |
| Sales | ORDER_CREATE, ORDER_READ, ORDER_DELETE, REFUND_CREATE, REFUND_READ, REFUND_DELETE | BRANCH, STORE hoặc SELF |
| Shift | SHIFT_START, SHIFT_END, SHIFT_READ_SELF, SHIFT_READ_BRANCH, SHIFT_DELETE | SELF hoặc BRANCH |
| Subscription | SUBSCRIPTION_READ, SUBSCRIPTION_MANAGE, PAYMENT_LINK_CREATE | STORE hoặc PLATFORM |
| Customer | CUSTOMER_PROFILE_READ_SELF, CUSTOMER_PROFILE_UPDATE_SELF, CUSTOMER_ORDER_READ_SELF | SELF |

### Role Bundles

Role là bundle mặc định; permission override phải được cấp riêng và có audit.

| Role | Default scope | Quyền đặc trưng |
|---|---|---|
| ROLE_ADMIN | PLATFORM | Platform dashboard, store moderation, plan management |
| ROLE_STORE_ADMIN | STORE | Store administration, branch lifecycle, store subscription/payment, staff management |
| ROLE_STORE_MANAGER | STORE | Catalog, inventory, store operations, reports, staff operations |
| ROLE_BRANCH_MANAGER | BRANCH | Branch operations, staff management, analytics, orders, refunds, shifts |
| ROLE_CASHIER | BRANCH + SELF | POS order, current shift, cashier history, refund request |
| ROLE_CUSTOMER | SELF | Own profile and own order history |

### Business Rules

| # | Rule | Rationale |
|---|---|---|
| BR-01 | Deny by default; chỉ endpoint public được khai báo explicit permit. | Tránh endpoint mới vô tình mở cho mọi authenticated user. |
| BR-02 | Authentication failure trả 401; authenticated nhưng thiếu permission/scope trả 403. | Phân biệt lỗi xác thực và phân quyền. |
| BR-03 | Có role đúng nhưng sai scope vẫn bị từ chối. | Ngăn IDOR/cross-tenant access. |
| BR-04 | ROLE_ADMIN là platform role, không tự động có quyền tenant mutation nếu chưa có contract rõ ràng. | Tách platform governance khỏi nghiệp vụ tenant. |
| BR-05 | Branch role chỉ được thao tác branch mà user được gán; cashier chỉ thao tác branch hiện hành và shift của mình. | Bảo vệ dữ liệu và dòng tiền tại branch. |
| BR-06 | Customer chỉ được truy cập resource có owner là chính mình; không tin customerId từ URL nếu không kiểm tra ownership. | Bảo vệ dữ liệu cá nhân. |
| BR-07 | Mọi response public/API đều dùng DTO; không trả trực tiếp entity User, password hash hoặc token. | Ngăn data exposure và giữ data-layer isolation. |
| BR-08 | Permission override không thể cấp quyền vượt quá scope của actor cấp quyền. | Ngăn privilege escalation. |
| BR-09 | Legacy role phải được ánh xạ deterministic và có thể rollback. | Đảm bảo migration an toàn. |
| BR-10 | Frontend không được coi localStorage/JWT hoặc route guard là nguồn bảo mật duy nhất. | Client có thể bị sửa bởi người dùng. |
| BR-11 | Access denied và sensitive mutation phải có audit event với actor, action, resource, scope và correlation/request ID. | Hỗ trợ điều tra và compliance. |
| BR-12 | Permission catalogue là nguồn chuẩn; controller/service không tự định nghĩa role string riêng. | Tránh drift giữa backend, frontend và tài liệu. |

### Integration Points

- JWT authentication: access token phải được mở rộng hoặc chuyển đổi để mang role, permission version và scope context tối thiểu; không đưa dữ liệu nhạy cảm vào token.
- Redis token service: tiếp tục hỗ trợ revoke/blacklist; thay đổi permission phải có chiến lược invalidate hoặc version check.
- React frontend: profile response cung cấp role/permission/scope đã chuẩn hóa để route/navigation và action visibility dùng cùng contract.
- MySQL: lưu role/permission assignment, scope reference, migration state và audit metadata.
- Existing POS modules: order, refund, shift, inventory và employee phải gọi authorization layer chung thay vì tự so sánh enum role.

## Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| Security | Authorization fail-closed và enforce ở backend | 100% endpoint nhạy cảm có permission + scope test |
| Security | Tenant/branch isolation | 0 cross-scope access trong negative integration tests |
| Security | Sensitive response protection | 0 password/token/entity nội bộ trong response contract |
| Security | Password/token handling | Password chỉ lưu hash; token không ghi log hoặc trả trong DTO không cần thiết |
| Performance | Permission evaluation | Không phát sinh N+1 query; cached/static permission check không thêm quá 10ms p95 |
| Scalability | Permission catalogue | Thêm permission/role bundle không cần sửa logic ở mọi controller |
| Availability | Auth failure behavior | Nếu permission store/cache lỗi, request nhạy cảm phải fail closed; không fallback allow |
| Observability | Authorization audit | Structured log có actor/action/resource/scope/decision/request ID; mask PII |
| Maintainability | Centralized policy | Permission constants, policy service và matrix được quản lý tập trung |
| Compatibility | Legacy migration | Hỗ trợ mapping role cũ trong một release migration; có rollback và reconciliation report |
| Privacy | Customer data | Customer chỉ đọc dữ liệu self; audit/log không chứa password, token hoặc dữ liệu nhạy cảm không cần thiết |
| Operations | Audit retention | Audit authorization giữ tối thiểu 180 ngày ở production, retention configurable |

## Constraints

| Type | Constraint | Impact |
|---|---|---|
| Technology | Java 21, Spring Boot 3.5+, Spring Security, JPA, MySQL 8 | Giữ kiến trúc backend hiện tại; dùng method security/policy service native Spring. |
| Technology | React 19, Vite, Redux Toolkit, React Router | Frontend chỉ consume permission contract; không thay thế backend authorization. |
| Authentication | Stateless JWT + refresh token/Redis blacklist hiện tại | Cần versioning/invalidation khi permission assignment thay đổi. |
| Data | Schema hiện tại có users.role, store_id, branch_id và soft delete | Migration phải backward-compatible và kiểm tra orphan/invalid assignments. |
| API | Canonical prefix /api/v1 | Cập nhật mapping/documentation; legacy alias chỉ giữ nếu inventory xác nhận cần thiết. |
| Architecture | Không thêm identity provider hoặc microservice trong v1 | Permission policy nằm trong backend monolith, có abstraction để tách sau. |
| Database migration | Hiện chưa có Flyway/Liquibase trong build | Architecture phase phải chọn migration tool; không dùng ddl-auto=update cho production authorization schema. |
| Code conventions | Controller/service dùng DTO và global exception handler | Không leak entity; lỗi 401/403 phải theo response format thống nhất. |
| Delivery | Thiết kế phải triển khai theo phase, không breaking migration một lần | Legacy mapping, feature flag hoặc dual-read cần được xem xét trong roadmap. |
| Compliance | Chưa có yêu cầu luật định cụ thể được cung cấp | Thiết kế mặc định có audit, PII masking và retention cấu hình được. |

## Domain Skills Referenced

- api-design: REST authorization, JWT, status code 401/403, versioning và error contract.
- database-design: MySQL schema, permission assignment, indexes, migration/rollback và tenant-scope access.
- code-reviewer: xác định gap hiện tại trong method security, data exposure, role overlap và IDOR risk.
- log-processing: yêu cầu structured authorization audit; không áp dụng refactor logging trong phase này.
