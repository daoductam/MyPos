# DMart POS API List & TDD Coverage Map

This document lists all the Backend controllers and their active API endpoints mapped using **CodeGraph**.

### Summary: Found **19 Controllers** with a total of **113 API Endpoints**.

| Controller | File Path | Total APIs |
| :--- | :--- | :--- |
| [AdminDashboardController](#admindashboardcontroller) | [`Backend/src/main/java/com/tamdao/controller/AdminDashboardController.java`](file:///Backend/src/main/java/com/tamdao/controller/AdminDashboardController.java) | 3 |
| [AuthController](#authcontroller) | [`Backend/src/main/java/com/tamdao/controller/AuthController.java`](file:///Backend/src/main/java/com/tamdao/controller/AuthController.java) | 4 |
| [BranchAnalyticsController](#branchanalyticscontroller) | [`Backend/src/main/java/com/tamdao/controller/BranchAnalyticsController.java`](file:///Backend/src/main/java/com/tamdao/controller/BranchAnalyticsController.java) | 6 |
| [BranchController](#branchcontroller) | [`Backend/src/main/java/com/tamdao/controller/BranchController.java`](file:///Backend/src/main/java/com/tamdao/controller/BranchController.java) | 5 |
| [CategoryController](#categorycontroller) | [`Backend/src/main/java/com/tamdao/controller/CategoryController.java`](file:///Backend/src/main/java/com/tamdao/controller/CategoryController.java) | 4 |
| [CustomerController](#customercontroller) | [`Backend/src/main/java/com/tamdao/controller/CustomerController.java`](file:///Backend/src/main/java/com/tamdao/controller/CustomerController.java) | 5 |
| [EmployeeController](#employeecontroller) | [`Backend/src/main/java/com/tamdao/controller/EmployeeController.java`](file:///Backend/src/main/java/com/tamdao/controller/EmployeeController.java) | 7 |
| [HomeController](#homecontroller) | [`Backend/src/main/java/com/tamdao/controller/HomeController.java`](file:///Backend/src/main/java/com/tamdao/controller/HomeController.java) | 1 |
| [InventoryController](#inventorycontroller) | [`Backend/src/main/java/com/tamdao/controller/InventoryController.java`](file:///Backend/src/main/java/com/tamdao/controller/InventoryController.java) | 6 |
| [OrderController](#ordercontroller) | [`Backend/src/main/java/com/tamdao/controller/OrderController.java`](file:///Backend/src/main/java/com/tamdao/controller/OrderController.java) | 8 |
| [PaymentController](#paymentcontroller) | [`Backend/src/main/java/com/tamdao/controller/PaymentController.java`](file:///Backend/src/main/java/com/tamdao/controller/PaymentController.java) | 2 |
| [ProductController](#productcontroller) | [`Backend/src/main/java/com/tamdao/controller/ProductController.java`](file:///Backend/src/main/java/com/tamdao/controller/ProductController.java) | 6 |
| [RefundController](#refundcontroller) | [`Backend/src/main/java/com/tamdao/controller/RefundController.java`](file:///Backend/src/main/java/com/tamdao/controller/RefundController.java) | 8 |
| [ShiftReportController](#shiftreportcontroller) | [`Backend/src/main/java/com/tamdao/controller/ShiftReportController.java`](file:///Backend/src/main/java/com/tamdao/controller/ShiftReportController.java) | 9 |
| [StoreAnalyticsController](#storeanalyticscontroller) | [`Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java`](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java) | 10 |
| [StoreController](#storecontroller) | [`Backend/src/main/java/com/tamdao/controller/StoreController.java`](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java) | 10 |
| [SubscriptionController](#subscriptioncontroller) | [`Backend/src/main/java/com/tamdao/controller/SubscriptionController.java`](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionController.java) | 9 |
| [SubscriptionPlanController](#subscriptionplancontroller) | [`Backend/src/main/java/com/tamdao/controller/SubscriptionPlanController.java`](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionPlanController.java) | 5 |
| [UserController](#usercontroller) | [`Backend/src/main/java/com/tamdao/controller/UserController.java`](file:///Backend/src/main/java/com/tamdao/controller/UserController.java) | 5 |

---

## AdminDashboardController
**File:** [`Backend/src/main/java/com/tamdao/controller/AdminDashboardController.java`](file:///Backend/src/main/java/com/tamdao/controller/AdminDashboardController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/super-admin/dashboard/summary` | `getDashboardSummary` | [L29](file:///Backend/src/main/java/com/tamdao/controller/AdminDashboardController.java#L29) |
| `GET` | `/api/super-admin/dashboard/store-registrations` | `getLast7DayRegistrationStats` | [L38](file:///Backend/src/main/java/com/tamdao/controller/AdminDashboardController.java#L38) |
| `GET` | `/api/super-admin/dashboard/store-status-distribution` | `getStoreStatusDistribution` | [L50](file:///Backend/src/main/java/com/tamdao/controller/AdminDashboardController.java#L50) |

---

## AuthController
**File:** [`Backend/src/main/java/com/tamdao/controller/AuthController.java`](file:///Backend/src/main/java/com/tamdao/controller/AuthController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | `signupHandler` | [L43](file:///Backend/src/main/java/com/tamdao/controller/AuthController.java#L43) |
| `POST` | `/auth/login` | `loginHandler` | [L55](file:///Backend/src/main/java/com/tamdao/controller/AuthController.java#L55) |
| `POST` | `/auth/forgot-password` | `forgotPassword` | [L67](file:///Backend/src/main/java/com/tamdao/controller/AuthController.java#L67) |
| `POST` | `/auth/reset-password` | `resetPassword` | [L80](file:///Backend/src/main/java/com/tamdao/controller/AuthController.java#L80) |

---

## BranchAnalyticsController
**File:** [`Backend/src/main/java/com/tamdao/controller/BranchAnalyticsController.java`](file:///Backend/src/main/java/com/tamdao/controller/BranchAnalyticsController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/branch-analytics/daily-sales` | `getDailySalesChart` | [L30](file:///Backend/src/main/java/com/tamdao/controller/BranchAnalyticsController.java#L30) |
| `GET` | `/api/branch-analytics/top-products` | `getTopProductsByQuantity` | [L42](file:///Backend/src/main/java/com/tamdao/controller/BranchAnalyticsController.java#L42) |
| `GET` | `/api/branch-analytics/top-cashiers` | `getTopCashiersByRevenue` | [L53](file:///Backend/src/main/java/com/tamdao/controller/BranchAnalyticsController.java#L53) |
| `GET` | `/api/branch-analytics/category-sales` | `getCategoryWiseSalesBreakdown` | [L64](file:///Backend/src/main/java/com/tamdao/controller/BranchAnalyticsController.java#L64) |
| `GET` | `/api/branch-analytics/today-overview` | `getTodayOverview` | [L73](file:///Backend/src/main/java/com/tamdao/controller/BranchAnalyticsController.java#L73) |
| `GET` | `/api/branch-analytics/payment-breakdown` | `getPaymentBreakdown` | [L82](file:///Backend/src/main/java/com/tamdao/controller/BranchAnalyticsController.java#L82) |

---

## BranchController
**File:** [`Backend/src/main/java/com/tamdao/controller/BranchController.java`](file:///Backend/src/main/java/com/tamdao/controller/BranchController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/branches` | `createBranch` | [L27](file:///Backend/src/main/java/com/tamdao/controller/BranchController.java#L27) |
| `GET` | `/api/branches/{id}` | `getBranch` | [L37](file:///Backend/src/main/java/com/tamdao/controller/BranchController.java#L37) |
| `GET` | `/api/branches/store/{storeId}` | `getAllBranches` | [L43](file:///Backend/src/main/java/com/tamdao/controller/BranchController.java#L43) |
| `PUT` | `/api/branches/{id}` | `updateBranch` | [L54](file:///Backend/src/main/java/com/tamdao/controller/BranchController.java#L54) |
| `DELETE` | `/api/branches/{id}` | `deleteBranch` | [L65](file:///Backend/src/main/java/com/tamdao/controller/BranchController.java#L65) |

---

## CategoryController
**File:** [`Backend/src/main/java/com/tamdao/controller/CategoryController.java`](file:///Backend/src/main/java/com/tamdao/controller/CategoryController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/categories` | `createCategory` | [L22](file:///Backend/src/main/java/com/tamdao/controller/CategoryController.java#L22) |
| `GET` | `/api/categories/store/{storeId}` | `getCategories` | [L27](file:///Backend/src/main/java/com/tamdao/controller/CategoryController.java#L27) |
| `PUT` | `/api/categories/{id}` | `updateCategory` | [L33](file:///Backend/src/main/java/com/tamdao/controller/CategoryController.java#L33) |
| `DELETE` | `/api/categories/{id}` | `deleteCategory` | [L40](file:///Backend/src/main/java/com/tamdao/controller/CategoryController.java#L40) |

---

## CustomerController
**File:** [`Backend/src/main/java/com/tamdao/controller/CustomerController.java`](file:///Backend/src/main/java/com/tamdao/controller/CustomerController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/customers` | `create` | [L20](file:///Backend/src/main/java/com/tamdao/controller/CustomerController.java#L20) |
| `PUT` | `/api/customers/{id}` | `update` | [L26](file:///Backend/src/main/java/com/tamdao/controller/CustomerController.java#L26) |
| `DELETE` | `/api/customers/{id}` | `delete` | [L34](file:///Backend/src/main/java/com/tamdao/controller/CustomerController.java#L34) |
| `GET` | `/api/customers/{id}` | `getById` | [L42](file:///Backend/src/main/java/com/tamdao/controller/CustomerController.java#L42) |
| `GET` | `/api/customers` | `getAll` | [L49](file:///Backend/src/main/java/com/tamdao/controller/CustomerController.java#L49) |

---

## EmployeeController
**File:** [`Backend/src/main/java/com/tamdao/controller/EmployeeController.java`](file:///Backend/src/main/java/com/tamdao/controller/EmployeeController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/employees/store/{storeId}` | `createStoreEmployee` | [L25](file:///Backend/src/main/java/com/tamdao/controller/EmployeeController.java#L25) |
| `POST` | `/api/employees/branch/{branchId}` | `createBranchEmployee` | [L33](file:///Backend/src/main/java/com/tamdao/controller/EmployeeController.java#L33) |
| `PUT` | `/api/employees/{employeeId}` | `updateEmployee` | [L40](file:///Backend/src/main/java/com/tamdao/controller/EmployeeController.java#L40) |
| `DELETE` | `/api/employees/{employeeId}` | `deleteEmployee` | [L47](file:///Backend/src/main/java/com/tamdao/controller/EmployeeController.java#L47) |
| `GET` | `/api/employees/{employeeId}` | `findEmployeeById` | [L54](file:///Backend/src/main/java/com/tamdao/controller/EmployeeController.java#L54) |
| `GET` | `/api/employees/store/{storeId}` | `findStoreEmployees` | [L61](file:///Backend/src/main/java/com/tamdao/controller/EmployeeController.java#L61) |
| `GET` | `/api/employees/branch/{branchId}` | `findBranchEmployees` | [L68](file:///Backend/src/main/java/com/tamdao/controller/EmployeeController.java#L68) |

---

## HomeController
**File:** [`Backend/src/main/java/com/tamdao/controller/HomeController.java`](file:///Backend/src/main/java/com/tamdao/controller/HomeController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | `HomeControllerHandler` | [L13](file:///Backend/src/main/java/com/tamdao/controller/HomeController.java#L13) |

---

## InventoryController
**File:** [`Backend/src/main/java/com/tamdao/controller/InventoryController.java`](file:///Backend/src/main/java/com/tamdao/controller/InventoryController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventories` | `create` | [L24](file:///Backend/src/main/java/com/tamdao/controller/InventoryController.java#L24) |
| `PUT` | `/api/inventories/{id}` | `update` | [L30](file:///Backend/src/main/java/com/tamdao/controller/InventoryController.java#L30) |
| `DELETE` | `/api/inventories/{id}` | `delete` | [L37](file:///Backend/src/main/java/com/tamdao/controller/InventoryController.java#L37) |
| `GET` | `/api/inventories/{id}` | `getById` | [L43](file:///Backend/src/main/java/com/tamdao/controller/InventoryController.java#L43) |
| `GET` | `/api/inventories/product/{productId}` | `getInventoryByProduct` | [L48](file:///Backend/src/main/java/com/tamdao/controller/InventoryController.java#L48) |
| `GET` | `/api/inventories/branch/{branchId}` | `getByBranch` | [L56](file:///Backend/src/main/java/com/tamdao/controller/InventoryController.java#L56) |

---

## OrderController
**File:** [`Backend/src/main/java/com/tamdao/controller/OrderController.java`](file:///Backend/src/main/java/com/tamdao/controller/OrderController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | `createOrder` | [L24](file:///Backend/src/main/java/com/tamdao/controller/OrderController.java#L24) |
| `GET` | `/api/orders/{id}` | `getOrder` | [L29](file:///Backend/src/main/java/com/tamdao/controller/OrderController.java#L29) |
| `GET` | `/api/orders/branch/{branchId}` | `getOrdersByBranch` | [L35](file:///Backend/src/main/java/com/tamdao/controller/OrderController.java#L35) |
| `GET` | `/api/orders/cashier/{cashierId}` | `getOrdersByCashier` | [L52](file:///Backend/src/main/java/com/tamdao/controller/OrderController.java#L52) |
| `GET` | `/api/orders/today/branch/{branchId}` | `getTodayOrders` | [L57](file:///Backend/src/main/java/com/tamdao/controller/OrderController.java#L57) |
| `GET` | `/api/orders/customer/{customerId}` | `getCustomerOrders` | [L62](file:///Backend/src/main/java/com/tamdao/controller/OrderController.java#L62) |
| `GET` | `/api/orders/recent/{branchId}` | `getRecentOrders` | [L68](file:///Backend/src/main/java/com/tamdao/controller/OrderController.java#L68) |
| `DELETE` | `/api/orders/{id}` | `deleteOrder` | [L75](file:///Backend/src/main/java/com/tamdao/controller/OrderController.java#L75) |

---

## PaymentController
**File:** [`Backend/src/main/java/com/tamdao/controller/PaymentController.java`](file:///Backend/src/main/java/com/tamdao/controller/PaymentController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create` | `createPaymentLink` | [L28](file:///Backend/src/main/java/com/tamdao/controller/PaymentController.java#L28) |
| `PATCH` | `/api/payments/proceed` | `proceedPayment` | [L48](file:///Backend/src/main/java/com/tamdao/controller/PaymentController.java#L48) |

---

## ProductController
**File:** [`Backend/src/main/java/com/tamdao/controller/ProductController.java`](file:///Backend/src/main/java/com/tamdao/controller/ProductController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/products` | `create` | [L28](file:///Backend/src/main/java/com/tamdao/controller/ProductController.java#L28) |
| `GET` | `/api/products/{id}` | `getById` | [L37](file:///Backend/src/main/java/com/tamdao/controller/ProductController.java#L37) |
| `PATCH` | `/api/products/{id}` | `update` | [L44](file:///Backend/src/main/java/com/tamdao/controller/ProductController.java#L44) |
| `DELETE` | `/api/products/{id}` | `delete` | [L54](file:///Backend/src/main/java/com/tamdao/controller/ProductController.java#L54) |
| `GET` | `/api/products/store/{storeId}` | `getByStore` | [L62](file:///Backend/src/main/java/com/tamdao/controller/ProductController.java#L62) |
| `GET` | `/api/products/store/{storeId}/search` | `searchByKeyword` | [L67](file:///Backend/src/main/java/com/tamdao/controller/ProductController.java#L67) |

---

## RefundController
**File:** [`Backend/src/main/java/com/tamdao/controller/RefundController.java`](file:///Backend/src/main/java/com/tamdao/controller/RefundController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/refunds` | `createRefund` | [L29](file:///Backend/src/main/java/com/tamdao/controller/RefundController.java#L29) |
| `GET` | `/api/refunds` | `getAllRefunds` | [L38](file:///Backend/src/main/java/com/tamdao/controller/RefundController.java#L38) |
| `GET` | `/api/refunds/cashier/{cashierId}` | `getRefundsByCashier` | [L48](file:///Backend/src/main/java/com/tamdao/controller/RefundController.java#L48) |
| `GET` | `/api/refunds/branch/{branchId}` | `getRefundsByBranch` | [L59](file:///Backend/src/main/java/com/tamdao/controller/RefundController.java#L59) |
| `GET` | `/api/refunds/shift/{shiftReportId}` | `getRefundsByShift` | [L69](file:///Backend/src/main/java/com/tamdao/controller/RefundController.java#L69) |
| `GET` | `/api/refunds/cashier/{cashierId}/range` | `getRefundsByCashierAndDateRange` | [L79](file:///Backend/src/main/java/com/tamdao/controller/RefundController.java#L79) |
| `GET` | `/api/refunds/{id}` | `getRefundById` | [L93](file:///Backend/src/main/java/com/tamdao/controller/RefundController.java#L93) |
| `DELETE` | `/api/refunds/{id}` | `deleteRefund` | [L101](file:///Backend/src/main/java/com/tamdao/controller/RefundController.java#L101) |

---

## ShiftReportController
**File:** [`Backend/src/main/java/com/tamdao/controller/ShiftReportController.java`](file:///Backend/src/main/java/com/tamdao/controller/ShiftReportController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/shift-reports/start` | `startShift` | [L31](file:///Backend/src/main/java/com/tamdao/controller/ShiftReportController.java#L31) |
| `PATCH` | `/api/shift-reports/end` | `endShift` | [L47](file:///Backend/src/main/java/com/tamdao/controller/ShiftReportController.java#L47) |
| `GET` | `/api/shift-reports/current` | `getCurrentShiftProgress` | [L60](file:///Backend/src/main/java/com/tamdao/controller/ShiftReportController.java#L60) |
| `GET` | `/api/shift-reports/cashier/{cashierId}/by-date` | `getShiftReportByDate` | [L71](file:///Backend/src/main/java/com/tamdao/controller/ShiftReportController.java#L71) |
| `GET` | `/api/shift-reports/cashier/{cashierId}` | `getShiftsByCashier` | [L87](file:///Backend/src/main/java/com/tamdao/controller/ShiftReportController.java#L87) |
| `GET` | `/api/shift-reports/branch/{branchId}` | `getShiftsByBranch` | [L102](file:///Backend/src/main/java/com/tamdao/controller/ShiftReportController.java#L102) |
| `GET` | `/api/shift-reports` | `getAllShifts` | [L116](file:///Backend/src/main/java/com/tamdao/controller/ShiftReportController.java#L116) |
| `GET` | `/api/shift-reports/{id}` | `getShiftById` | [L128](file:///Backend/src/main/java/com/tamdao/controller/ShiftReportController.java#L128) |
| `DELETE` | `/api/shift-reports/{id}` | `deleteShift` | [L139](file:///Backend/src/main/java/com/tamdao/controller/ShiftReportController.java#L139) |

---

## StoreAnalyticsController
**File:** [`Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java`](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/store/analytics/{storeAdminId}/overview` | `getStoreOverview` | [L19](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java#L19) |
| `GET` | `/api/store/analytics/{storeAdminId}/sales-trends` | `getSalesTrends` | [L25](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java#L25) |
| `GET` | `/api/store/analytics/{storeAdminId}/sales/monthly` | `getMonthlySales` | [L32](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java#L32) |
| `GET` | `/api/store/analytics/{storeAdminId}/sales/daily` | `getDailySales` | [L38](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java#L38) |
| `GET` | `/api/store/analytics/{storeAdminId}/sales/category` | `getSalesByCategory` | [L44](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java#L44) |
| `GET` | `/api/store/analytics/{storeAdminId}/sales/payment-method` | `getSalesByPaymentMethod` | [L50](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java#L50) |
| `GET` | `/api/store/analytics/{storeAdminId}/sales/branch` | `getSalesByBranch` | [L56](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java#L56) |
| `GET` | `/api/store/analytics/{storeAdminId}/payments` | `getPaymentBreakdown` | [L62](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java#L62) |
| `GET` | `/api/store/analytics/{storeAdminId}/branch-performance` | `getBranchPerformance` | [L68](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java#L68) |
| `GET` | `/api/store/analytics/{storeAdminId}/alerts` | `getStoreAlerts` | [L74](file:///Backend/src/main/java/com/tamdao/controller/StoreAnalyticsController.java#L74) |

---

## StoreController
**File:** [`Backend/src/main/java/com/tamdao/controller/StoreController.java`](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/stores` | `createStore` | [L33](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java#L33) |
| `GET` | `/api/stores/{id}` | `getStoreById` | [L41](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java#L41) |
| `PUT` | `/api/stores/{id}` | `updateStore` | [L49](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java#L49) |
| `DELETE` | `/api/stores` | `deleteStore` | [L59](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java#L59) |
| `GET` | `/api/stores/admin` | `getStoresByAdminId` | [L69](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java#L69) |
| `GET` | `/api/stores/employee` | `getStoresByEmployee` | [L78](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java#L78) |
| `GET` | `/api/stores/{storeId}/employee/list` | `getStoreEmployeeList` | [L85](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java#L85) |
| `POST` | `/api/stores/add/employee` | `addEmployee` | [L93](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java#L93) |
| `GET` | `/api/stores` | `getAllStores` | [L103](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java#L103) |
| `PUT` | `/api/stores/{storeId}/moderate` | `moderateStore` | [L116](file:///Backend/src/main/java/com/tamdao/controller/StoreController.java#L116) |

---

## SubscriptionController
**File:** [`Backend/src/main/java/com/tamdao/controller/SubscriptionController.java`](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/subscriptions/subscribe` | `createSubscription` | [L22](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionController.java#L22) |
| `POST` | `/api/subscriptions/upgrade` | `upgradePlan` | [L35](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionController.java#L35) |
| `PUT` | `/api/subscriptions/{subscriptionId}/activate` | `activateSubscription` | [L47](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionController.java#L47) |
| `PUT` | `/api/subscriptions/{subscriptionId}/cancel` | `cancelSubscription` | [L53](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionController.java#L53) |
| `PUT` | `/api/subscriptions/{subscriptionId}/payment-status` | `updatePaymentStatus` | [L59](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionController.java#L59) |
| `GET` | `/api/subscriptions/store/{storeId}` | `getStoreSubscriptions` | [L68](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionController.java#L68) |
| `GET` | `/api/subscriptions/admin` | `getAllSubscriptions` | [L77](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionController.java#L77) |
| `GET` | `/api/subscriptions/admin/expiring` | `getExpiringSubscriptions` | [L85](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionController.java#L85) |
| `GET` | `/api/subscriptions/admin/count` | `countByStatus` | [L93](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionController.java#L93) |

---

## SubscriptionPlanController
**File:** [`Backend/src/main/java/com/tamdao/controller/SubscriptionPlanController.java`](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionPlanController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/super-admin/subscription-plans` | `createPlan` | [L24](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionPlanController.java#L24) |
| `PUT` | `/api/super-admin/subscription-plans/{id}` | `updatePlan` | [L34](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionPlanController.java#L34) |
| `GET` | `/api/super-admin/subscription-plans` | `getAllPlans` | [L45](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionPlanController.java#L45) |
| `GET` | `/api/super-admin/subscription-plans/{id}` | `getPlanById` | [L53](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionPlanController.java#L53) |
| `DELETE` | `/api/super-admin/subscription-plans/{id}` | `deletePlan` | [L61](file:///Backend/src/main/java/com/tamdao/controller/SubscriptionPlanController.java#L61) |

---

## UserController
**File:** [`Backend/src/main/java/com/tamdao/controller/UserController.java`](file:///Backend/src/main/java/com/tamdao/controller/UserController.java)

| HTTP Method | Path | Method Name | Line |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | `getUserProfileFromJwtHandler` | [L40](file:///Backend/src/main/java/com/tamdao/controller/UserController.java#L40) |
| `GET` | `/api/users/customer` | `getCustomerList` | [L49](file:///Backend/src/main/java/com/tamdao/controller/UserController.java#L49) |
| `GET` | `/api/users/cashier` | `getCashierList` | [L58](file:///Backend/src/main/java/com/tamdao/controller/UserController.java#L58) |
| `GET` | `/users/list` | `getUsersListHandler` | [L67](file:///Backend/src/main/java/com/tamdao/controller/UserController.java#L67) |
| `GET` | `/users/{userId}` | `getUserByIdHandler` | [L75](file:///Backend/src/main/java/com/tamdao/controller/UserController.java#L75) |

---
