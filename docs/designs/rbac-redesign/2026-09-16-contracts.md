Started at: 2026/09/16 22:35:56
Finished at: 2026/09/16 22:42:39
Total time: 7 minutes
---

# RBAC v2 API and Data Contracts

## 1. Source and contract status

- **Vision:** [2026-09-16-vision.md](./2026-09-16-vision.md)
- **Requirements:** [2026-09-16-requirements.md](./2026-09-16-requirements.md)
- **Architecture:** [2026-09-16-architecture.md](./2026-09-16-architecture.md)
- **Status:** Draft — awaiting approval
- **Canonical API prefix:** `/api/v1`
- **Compatibility policy:** Keep existing paths during migration where practical; do not treat legacy role names as canonical in new code.

This document is an implementation contract. It defines the authorization vocabulary, role bundles, API behavior, database shape, migration identifiers, and shared frontend types. Business-resource DTOs remain the existing module contracts unless explicitly called out here.

## 2. Contract conventions

### 2.1 HTTP and JSON

- Content type: `application/json`.
- JSON field naming: `camelCase`, matching the existing frontend.
- All timestamps are ISO-8601 UTC strings.
- IDs remain `Long`/JSON integer values in v1 for compatibility with existing entities.
- Controllers return DTOs or primitive response DTOs only. Entities such as `User`, `Customer`, `Subscription`, and `ShiftReport` must not cross the HTTP boundary.
- The generic success envelope is the existing `ApiResponse<T>` shape:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Operation completed",
  "data": {},
  "timestamp": "2026-09-16T15:35:56Z",
  "requestId": "req_01J..."
}
```

`requestId` is an additive field and must be included for new error and audit-sensitive responses. Existing clients may ignore it during migration.

### 2.2 Authentication header

Protected requests use:

```http
Authorization: Bearer <access-token>
```

The refresh token is preferably an `HttpOnly`, `Secure`, `SameSite=Lax` cookie. A request-body refresh token remains accepted only for existing clients during the compatibility window. Tokens must never be placed in URLs or audit metadata.

### 2.3 HTTP status contract

| Status | Meaning |
|---:|---|
| `200` | Successful read/update/action |
| `201` | Successful creation |
| `204` | Successful deletion/restore with no response body |
| `400` | Invalid request or validation failure |
| `401` | Missing, invalid, expired, revoked, or stale authentication |
| `403` | Authenticated but permission or scope denied |
| `404` | Resource does not exist |
| `409` | State or uniqueness conflict |
| `429` | Rate limit exceeded, where enabled |
| `500` | Unexpected server failure |

### 2.4 Standard error envelope

```json
{
  "success": false,
  "code": "AUTHORIZATION_DENIED",
  "message": "You do not have permission to perform this action.",
  "data": null,
  "errors": [],
  "timestamp": "2026-09-16T15:35:56Z",
  "requestId": "req_01J..."
}
```

Canonical error codes:

| Code | HTTP | Use |
|---|---:|---|
| `AUTHENTICATION_REQUIRED` | 401 | No usable bearer token |
| `TOKEN_INVALID` | 401 | Invalid signature or malformed token |
| `TOKEN_REVOKED` | 401 | Blacklisted session/token |
| `AUTHORIZATION_DENIED` | 403 | Permission is absent |
| `SCOPE_VIOLATION` | 403 | Resource is outside the resolved store/branch/self scope |
| `VALIDATION_FAILED` | 400 | Request field validation failed |
| `RESOURCE_NOT_FOUND` | 404 | Resource is not present |
| `DATA_CONFLICT` | 409 | Duplicate or invalid state transition |
| `INTERNAL_ERROR` | 500 | Unexpected failure |

For validation errors, `errors` contains `{ field, message }`. For authorization failures, the response must not reveal another tenant's resource existence, ownership, or permission configuration.

### 2.5 Pagination

New administrative and authorization list APIs use offset pagination:

```text
?page=0&size=20&sort=createdAt,desc
```

Rules:

- `page` defaults to `0`.
- `size` defaults to `20`, maximum `100`.
- Response data uses `PageResponse<T>` with `items`, `page`, `size`, `totalItems`, and `totalPages`.
- High-volume order/audit APIs may add cursor pagination later; v1 preserves the existing list shape for resource endpoints to avoid an unnecessary frontend break.

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalItems": 0,
  "totalPages": 0
}
```

## 3. Scope and permission vocabulary

### 3.1 Scope types

| Scope | Resolution rule |
|---|---|
| `PLATFORM` | Entire SaaS platform; only platform administration capabilities use this scope |
| `STORE` | Actor and target resource belong to the same store |
| `BRANCH` | Actor and target resource belong to the same branch and its store |
| `SELF` | Target is the authenticated principal or a resource explicitly owned by that principal |

The client may request a store/branch ID, but that value is only a lookup hint. The server resolves and verifies the actor's assignment before querying or mutating data.

### 3.2 Permission naming

Permission codes use `<resource>.<action>` and are stable API/data identifiers. Role names are not used as permission identifiers.

| Permission | Supported scope | Contract meaning |
|---|---|---|
| `platform.dashboard.read` | `PLATFORM` | Read platform dashboard and growth statistics |
| `platform.store.read` | `PLATFORM` | Read stores across the platform |
| `platform.store.moderate` | `PLATFORM` | Approve, block, or reject store status |
| `platform.subscription_plan.manage` | `PLATFORM` | Create, update, read, and delete SaaS plans |
| `platform.subscription.read` | `PLATFORM` | Read platform-wide subscription metrics |
| `platform.audit.read` | `PLATFORM` | Read authorization audit events |
| `platform.rbac.manage` | `PLATFORM` | Manage platform-level role assignments and overrides |
| `store.read` | `STORE` | Read the actor's store profile |
| `store.update` | `STORE` | Update store configuration |
| `store.delete` | `STORE` | Deactivate/delete the actor's store |
| `branch.read` | `STORE` or `BRANCH` | Read branch information within allowed scope |
| `branch.create` | `STORE` | Create a branch in the actor's store |
| `branch.update` | `STORE` | Update a branch in the actor's store |
| `branch.delete` | `STORE` | Soft-delete a branch in the actor's store |
| `branch.restore` | `STORE` | Restore a deleted branch in the actor's store |
| `employee.read` | `STORE` or `BRANCH` | Read employee profile without credentials |
| `employee.create` | `STORE` or `BRANCH` | Create an employee with an allowed operational role |
| `employee.update` | `STORE` or `BRANCH` | Update employee profile or assignment within scope |
| `employee.delete` | `STORE` or `BRANCH` | Deactivate an employee within scope |
| `employee.restore` | `STORE` | Restore a deleted employee |
| `store.rbac.manage` | `STORE` | Manage store-level role assignments and overrides within actor scope |
| `category.read` | `STORE` | Read categories in a store |
| `category.write` | `STORE` | Create or update categories in a store |
| `category.delete` | `STORE` | Delete a category in a store |
| `product.read` | `STORE` or `BRANCH` | Read products in allowed store scope |
| `product.write` | `STORE` | Create or update products |
| `product.delete` | `STORE` | Delete a product |
| `product.restore` | `STORE` | Restore a deleted product |
| `inventory.read` | `STORE` or `BRANCH` | Read inventory in allowed scope |
| `inventory.write` | `STORE` | Create or adjust inventory |
| `inventory.delete` | `STORE` | Delete an inventory record |
| `order.create` | `BRANCH` | Create an order for the current branch |
| `order.read` | `STORE` or `BRANCH` | Read orders in allowed scope |
| `order.read_own` | `SELF` | Read orders created by the actor or owned by the customer |
| `order.delete` | `STORE` | Delete/cancel an order under store policy |
| `refund.create` | `BRANCH` | Create a refund for an order in the current branch |
| `refund.read` | `STORE` or `BRANCH` | Read refunds in allowed scope |
| `refund.read_own` | `SELF` | Read refunds created by/owned by the actor |
| `refund.delete` | `STORE` or `BRANCH` | Delete a refund under store policy |
| `shift.start` | `BRANCH` | Start the actor's shift in the assigned branch |
| `shift.end` | `SELF` | End the actor's current shift |
| `shift.read` | `STORE` or `BRANCH` | Read shift reports in allowed scope |
| `shift.read_own` | `SELF` | Read the actor's own shifts |
| `shift.delete` | `STORE` or `BRANCH` | Delete a shift report under store policy |
| `analytics.read` | `STORE`, `BRANCH`, or `PLATFORM` | Read analytics only inside resolved scope |
| `payment.manage` | `STORE` | Create or update store subscription/payment actions |
| `subscription.read` | `STORE` or `PLATFORM` | Read subscriptions in allowed scope |
| `subscription.manage` | `STORE` | Subscribe, upgrade, or manage the actor's store subscription |
| `customer.read` | `STORE` or `BRANCH` | Read customer records in operating scope |
| `customer.write` | `STORE` or `BRANCH` | Create/update customer records in operating scope |
| `customer.delete` | `STORE` or `BRANCH` | Deactivate customer records in operating scope |
| `customer.restore` | `STORE` or `BRANCH` | Restore customer records in operating scope |
| `profile.read_own` | `SELF` | Read the authenticated user's profile |
| `profile.update_own` | `SELF` | Update permitted fields on the authenticated user's profile |

For a permission whose catalog scope is `STORE`, a branch-scoped assignment may use it only after the policy evaluator narrows the request to that branch. A child scope never expands a permission. Platform and store RBAC administration deliberately use separate permission codes.

## 4. Canonical roles and bundles

### 4.1 Role definitions

| Role code | Default scope | Business owner | Notes |
|---|---|---|---|
| `ROLE_ADMIN` | `PLATFORM` | SaaS operator | Platform governance only by default; no implicit tenant operational access |
| `ROLE_STORE_ADMIN` | `STORE` | Merchant owner | Full operational control of the assigned store, excluding platform governance |
| `ROLE_STORE_MANAGER` | `STORE` | Store operator | Day-to-day catalog, inventory, staff, sales, and reporting |
| `ROLE_BRANCH_MANAGER` | `BRANCH` | Branch operator | Branch operations, staff, sales, shifts, refunds, and branch reports |
| `ROLE_CASHIER` | `BRANCH` | Branch cashier | Current shift, checkout, own work history, and controlled refunds |
| `ROLE_CUSTOMER` | `SELF` | End customer | Own profile and own order history only |

### 4.2 Role-to-permission matrix

The table lists the default bundle. A role does not bypass the scope column on the permission catalog.

| Role | Default permissions |
|---|---|
| `ROLE_ADMIN` | `platform.dashboard.read`, `platform.store.read`, `platform.store.moderate`, `platform.subscription_plan.manage`, `platform.subscription.read`, `platform.audit.read`, `platform.rbac.manage` |
| `ROLE_STORE_ADMIN` | `store.read`, `store.update`, `store.delete`, `branch.read`, `branch.create`, `branch.update`, `branch.delete`, `branch.restore`, `employee.read`, `employee.create`, `employee.update`, `employee.delete`, `employee.restore`, `store.rbac.manage`, `category.read`, `category.write`, `category.delete`, `product.read`, `product.write`, `product.delete`, `product.restore`, `inventory.read`, `inventory.write`, `inventory.delete`, `order.read`, `order.delete`, `refund.read`, `refund.delete`, `shift.read`, `shift.delete`, `analytics.read`, `payment.manage`, `subscription.read`, `subscription.manage`, `customer.read`, `customer.write`, `customer.delete`, `customer.restore`, `profile.read_own`, `profile.update_own` |
| `ROLE_STORE_MANAGER` | `store.read`, `branch.read`, `employee.read`, `employee.create`, `employee.update`, `category.read`, `category.write`, `category.delete`, `product.read`, `product.write`, `product.delete`, `product.restore`, `inventory.read`, `inventory.write`, `inventory.delete`, `order.read`, `order.delete`, `refund.read`, `shift.read`, `analytics.read`, `customer.read`, `customer.write`, `profile.read_own`, `profile.update_own` |
| `ROLE_BRANCH_MANAGER` | `branch.read`, `employee.read`, `employee.create`, `employee.update`, `order.read`, `refund.read`, `shift.read`, `analytics.read`, `product.read`, `inventory.read`, `customer.read`, `customer.write`, `profile.read_own`, `profile.update_own` |
| `ROLE_CASHIER` | `branch.read`, `employee.read` only for operational lookup where needed, `product.read`, `inventory.read`, `order.create`, `order.read_own`, `order.read`, `refund.create`, `refund.read_own`, `shift.start`, `shift.end`, `shift.read_own`, `profile.read_own`, `profile.update_own` |
| `ROLE_CUSTOMER` | `profile.read_own`, `profile.update_own`, `order.read_own` |

The `ROLE_CASHIER` bundle grants branch order read only for the explicitly defined cashier views (today/current branch) and still requires branch equality. It does not grant arbitrary store order access.

### 4.3 Legacy aliases

| Legacy code | Canonical code | Compatibility behavior |
|---|---|---|
| `ROLE_BRANCH_ADMIN` | `ROLE_BRANCH_MANAGER` | Backfill to branch manager plus temporary branch-scoped `GRANT` overrides for `employee.delete`, `refund.delete`, and `shift.delete`; no new code may depend on the legacy string |
| `ROLE_BRANCH_CASHIER` | `ROLE_CASHIER` | Read and token compatibility alias during the client deprecation window |
| Other existing role codes | Same code | Preserve during backfill, then validate against the six canonical roles |

The legacy alias is not a second role. It is a migration mapping and must have an expiry/review date.

## 5. Authorization profile contract

### 5.1 `GET /api/v1/authorization/me`

Returns the server-resolved authorization profile used by the frontend. Required permission: authenticated user; the endpoint is self-scoped.

```json
{
  "user": {
    "id": 42,
    "email": "cashier@example.com",
    "fullName": "Example Cashier",
    "phone": null,
    "active": true
  },
  "roles": [
    {
      "code": "ROLE_CASHIER",
      "scope": {
        "type": "BRANCH",
        "storeIds": [10],
        "branchIds": [52]
      }
    }
  ],
  "capabilities": [
    "branch.read",
    "product.read",
    "order.create",
    "order.read_own",
    "refund.create",
    "shift.start",
    "shift.end",
    "shift.read_own",
    "profile.read_own",
    "profile.update_own"
  ],
  "authorizationVersion": 7
}
```

No password, password hash, JWT, refresh token, permission override reason, or internal database entity is returned. `capabilities` is a UX contract; the backend re-evaluates every protected request.

### 5.2 Authorization administration endpoints

These endpoints are new contracts and must not accept an arbitrary role/permission code without catalog validation.

| Method | Path | Required permission | Scope |
|---|---|---|---|
| `GET` | `/api/v1/authorization/me` | Authenticated | `SELF` |
| `GET` | `/api/v1/authorization/assignments` | `platform.rbac.manage` or `store.rbac.manage` | Actor's platform/store scope |
| `POST` | `/api/v1/authorization/assignments` | `platform.rbac.manage` or `store.rbac.manage` | Target must be inside actor scope |
| `PATCH` | `/api/v1/authorization/assignments/{assignmentId}` | `platform.rbac.manage` or `store.rbac.manage` | Assignment scope |
| `DELETE` | `/api/v1/authorization/assignments/{assignmentId}` | `platform.rbac.manage` or `store.rbac.manage` | Assignment scope |
| `GET` | `/api/v1/authorization/overrides` | `platform.rbac.manage` or `store.rbac.manage` | Actor's platform/store scope |
| `POST` | `/api/v1/authorization/overrides` | `platform.rbac.manage` or `store.rbac.manage` | Target assignment scope |
| `DELETE` | `/api/v1/authorization/overrides/{overrideId}` | `platform.rbac.manage` or `store.rbac.manage` | Override scope |

Assignment request:

```json
{
  "userId": 88,
  "roleCode": "ROLE_BRANCH_MANAGER",
  "scope": {
    "type": "BRANCH",
    "storeId": 10,
    "branchId": 52
  },
  "startsAt": "2026-09-16T15:35:56Z",
  "endsAt": null,
  "reason": "Promoted to branch manager"
}
```

Override request:

```json
{
  "userId": 88,
  "permissionCode": "refund.delete",
  "effect": "DENY",
  "scope": {
    "type": "BRANCH",
    "storeId": 10,
    "branchId": 52
  },
  "expiresAt": "2026-10-01T00:00:00Z",
  "reason": "Temporary segregation of duties"
}
```

Rules:

- A store administrator cannot assign `ROLE_ADMIN` or modify another store.
- A branch manager cannot use the RBAC assignment endpoint to promote themselves or grant a broader scope.
- An override must name an active catalog permission, must have a reason, and must expire unless explicitly approved by platform policy.
- `DENY` overrides `GRANT` at the same or narrower scope.
- Every create/update/revoke operation increments the subject user's `authorizationVersion`, invalidates Redis, and emits an audit event.

## 6. Existing API authorization matrix

This matrix is the target mapping for current controllers. Paths are shown with the canonical `/api/v1` prefix. Query/path IDs are always scope-checked.

### 6.1 Authentication and user profile

| Method | Path | Target permission | Notes |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | New account defaults to `ROLE_CUSTOMER`; staff creation is not public signup |
| `POST` | `/auth/login` | Public | Returns access token, refresh cookie, user, and authorization profile/version |
| `POST` | `/auth/refresh` | Public + valid refresh session | Rotate refresh token and return access token |
| `POST` | `/auth/logout` | Authenticated/session token | Revoke access/refresh session and clear cookie |
| `POST` | `/auth/forgot-password` | Public | Always use non-enumerating response |
| `POST` | `/auth/reset-password` | Public + reset token | Increment authorization version and revoke active sessions |
| `GET` | `/users/profile` | `profile.read_own` | Use authenticated principal, not a caller-selected user ID |
| `GET` | `/users/{userId}` | `employee.read` or `profile.read_own` | Self or actor's allowed store/branch scope |
| `GET` | `/users/customer` | `customer.read` | Store/branch scope; return `UserDTO` only |
| `GET` | `/users/cashier` | `employee.read` | Store/branch scope; return `UserDTO` only |
| `GET` | `/users/list` | `employee.read` | Must never return `User` entity or password hash |

### 6.2 Platform administration

| Method | Path | Target permission | Scope |
|---|---|---|---|
| `GET` | `/super-admin/dashboard/summary` | `platform.dashboard.read` | `PLATFORM` |
| `GET` | `/super-admin/dashboard/store-registrations` | `platform.dashboard.read` | `PLATFORM` |
| `GET` | `/super-admin/dashboard/store-status-distribution` | `platform.dashboard.read` | `PLATFORM` |
| `GET` | `/stores` | `platform.store.read` | `PLATFORM`; store list must not be public |
| `PUT` | `/stores/{storeId}/moderate` | `platform.store.moderate` | `PLATFORM` |
| `POST` | `/super-admin/subscription-plans` | `platform.subscription_plan.manage` | `PLATFORM` |
| `PUT` | `/super-admin/subscription-plans/{id}` | `platform.subscription_plan.manage` | `PLATFORM` |
| `GET` | `/super-admin/subscription-plans` | `platform.subscription_plan.manage` | `PLATFORM` |
| `GET` | `/super-admin/subscription-plans/{id}` | `platform.subscription_plan.manage` | `PLATFORM` |
| `DELETE` | `/super-admin/subscription-plans/{id}` | `platform.subscription_plan.manage` | `PLATFORM` |

### 6.3 Store and branch administration

| Method | Path | Target permission | Scope |
|---|---|---|---|
| `POST` | `/stores` | Approved onboarding policy | Public signup or authenticated onboarding; must not trust owner ID |
| `GET` | `/stores/{id}` | `store.read` | Same store or platform permission |
| `PUT` | `/stores/{id}` | `store.update` | Same store |
| `DELETE` | `/stores` | `store.delete` | Authenticated store owner context |
| `GET` | `/stores/admin` | `store.read` | Current principal's store |
| `GET` | `/stores/employee` | `store.read` | Current principal's store |
| `POST` | `/branches` | `branch.create` | `STORE` |
| `GET` | `/branches/{id}` | `branch.read` | Store/branch scope |
| `GET` | `/branches/store/{storeId}` | `branch.read` | `STORE` |
| `PUT` | `/branches/{id}` | `branch.update` | `STORE` |
| `DELETE` | `/branches/{id}` | `branch.delete` | `STORE` |
| `GET` | `/branches/store/{storeId}/trash` | `branch.read` | `STORE` |
| `PATCH` | `/branches/restore/{id}` | `branch.restore` | `STORE` |

### 6.4 Employees and staff

| Method | Path | Target permission | Scope and role restriction |
|---|---|---|---|
| `POST` | `/employees/store/{storeId}` | `employee.create` | Store scope; allowed roles exclude platform admin and store admin unless explicitly approved |
| `POST` | `/employees/branch/{branchId}` | `employee.create` | Branch scope; branch manager may create cashier only |
| `PUT` | `/employees/{employeeId}` | `employee.update` | Same store/branch; cannot self-escalate |
| `DELETE` | `/employees/{employeeId}` | `employee.delete` | Same store/branch; cannot delete final store admin |
| `GET` | `/employees/{employeeId}` | `employee.read` | Same scope |
| `GET` | `/employees/store/{storeId}` | `employee.read` | Store scope |
| `GET` | `/employees/branch/{branchId}` | `employee.read` | Branch scope |
| `GET` | `/employees/store/{storeId}/trash` | `employee.read` | Store scope |
| `PATCH` | `/employees/restore/{id}` | `employee.restore` | Store scope |
| `GET` | `/stores/{storeId}/employee/list` | `employee.read` | Store scope |
| `POST` | `/stores/add/employee` | `employee.create` | Store scope resolved from actor, not request body |

### 6.5 Catalog and inventory

| Method | Path | Target permission | Scope |
|---|---|---|---|
| `POST` | `/categories` | `category.write` | `STORE` |
| `GET` | `/categories/store/{storeId}` | `category.read` | `STORE` |
| `PUT` | `/categories/{id}` | `category.write` | Resource's store |
| `DELETE` | `/categories/{id}` | `category.delete` | Resource's store |
| `POST` | `/products` | `product.write` | `STORE` |
| `GET` | `/products/{id}` | `product.read` | Store/branch scope |
| `PATCH` | `/products/{id}` | `product.write` | Resource's store |
| `DELETE` | `/products/{id}` | `product.delete` | Resource's store |
| `GET` | `/products/store/{storeId}` | `product.read` | `STORE` |
| `GET` | `/products/store/{storeId}/search` | `product.read` | `STORE` |
| `GET` | `/products/store/{storeId}/trash` | `product.read` | `STORE` |
| `PATCH` | `/products/restore/{id}` | `product.restore` | Resource's store |
| `POST` | `/inventories` | `inventory.write` | `STORE` |
| `GET` | `/inventories/{id}` | `inventory.read` | Store/branch scope |
| `GET` | `/inventories/product/{productId}` | `inventory.read` | Product's store |
| `GET` | `/inventories/branch/{branchId}` | `inventory.read` | Branch scope |
| `PUT` | `/inventories/{id}` | `inventory.write` | Resource's store |
| `DELETE` | `/inventories/{id}` | `inventory.delete` | Resource's store |

### 6.6 Sales, refunds, and shifts

| Method | Path | Target permission | Scope |
|---|---|---|---|
| `POST` | `/orders` | `order.create` | Current cashier branch; actor branch is authoritative |
| `GET` | `/orders/{id}` | `order.read` or `order.read_own` | Resource branch/store or customer ownership |
| `GET` | `/orders/branch/{branchId}` | `order.read` | `BRANCH` |
| `GET` | `/orders/cashier/{cashierId}` | `order.read_own` or `order.read` | Self for cashier; manager scope for staff reports |
| `GET` | `/orders/today/branch/{branchId}` | `order.read` | `BRANCH`; cashier may read current branch only |
| `GET` | `/orders/customer/{customerId}` | `order.read_own` or `customer.read` | Customer self or allowed operating scope |
| `GET` | `/orders/recent/{branchId}` | `order.read` | `BRANCH` |
| `DELETE` | `/orders/{id}` | `order.delete` | `STORE`; retain audit record and business-state rules |
| `POST` | `/refunds` | `refund.create` | Current branch and original order scope |
| `GET` | `/refunds` | `refund.read` | `STORE` |
| `GET` | `/refunds/cashier/{cashierId}` | `refund.read_own` or `refund.read` | Self or branch/store manager scope |
| `GET` | `/refunds/branch/{branchId}` | `refund.read` | `BRANCH` |
| `GET` | `/refunds/shift/{shiftReportId}` | `refund.read` | Shift branch scope |
| `GET` | `/refunds/cashier/{cashierId}/range` | `refund.read_own` or `refund.read` | Self or manager scope |
| `GET` | `/refunds/{id}` | `refund.read` or `refund.read_own` | Resource scope |
| `DELETE` | `/refunds/{id}` | `refund.delete` | Store/branch scope and policy check |
| `POST` | `/shift-reports/start` | `shift.start` | Current branch; actor can have one open shift |
| `PATCH` | `/shift-reports/end` | `shift.end` | Current actor's open shift only |
| `GET` | `/shift-reports/current` | `shift.read_own` | Current actor's open shift |
| `GET` | `/shift-reports/cashier/{cashierId}/by-date` | `shift.read_own` or `shift.read` | Self or manager scope |
| `GET` | `/shift-reports/cashier/{cashierId}` | `shift.read_own` or `shift.read` | Self or manager scope |
| `GET` | `/shift-reports/branch/{branchId}` | `shift.read` | `BRANCH` |
| `GET` | `/shift-reports` | `shift.read` | `STORE` |
| `GET` | `/shift-reports/{id}` | `shift.read` or `shift.read_own` | Resource scope |
| `DELETE` | `/shift-reports/{id}` | `shift.delete` | Store/branch scope |

### 6.7 Customers, analytics, subscriptions, and payments

| Method | Path | Target permission | Scope |
|---|---|---|---|
| `POST` | `/customers` | `customer.write` | Store/branch; staff only |
| `PUT` | `/customers/{id}` | `customer.write` or `profile.update_own` | Staff scope or customer self |
| `DELETE` | `/customers/{id}` | `customer.delete` | Store/branch |
| `GET` | `/customers/{id}` | `customer.read` or `profile.read_own` | Staff scope or self |
| `GET` | `/customers` | `customer.read` | Store/branch; never global by default |
| `GET` | `/customers/trash` | `customer.read` | Store/branch |
| `PATCH` | `/customers/restore/{id}` | `customer.restore` | Store/branch |
| `GET` | `/branch-analytics/*` | `analytics.read` | Branch resource must match actor branch |
| `GET` | `/store/analytics/{storeId}/*` | `analytics.read` | Store resource must match actor store |
| `POST` | `/subscriptions/subscribe` | `subscription.manage` | Actor's store; `storeId` is verified, not trusted |
| `POST` | `/subscriptions/upgrade` | `subscription.manage` | Actor's store |
| `PUT` | `/subscriptions/{id}/activate` | Platform subscription permission | `PLATFORM` |
| `PUT` | `/subscriptions/{id}/cancel` | `subscription.manage` or platform policy | Owner store or platform |
| `PUT` | `/subscriptions/{id}/payment-status` | `payment.manage` or platform policy | Owner store or platform |
| `GET` | `/subscriptions/store/{storeId}` | `subscription.read` | Owner store or platform |
| `GET` | `/subscriptions/admin` | `platform.subscription.read` | `PLATFORM` |
| `GET` | `/subscriptions/admin/expiring` | `platform.subscription.read` | `PLATFORM` |
| `GET` | `/subscriptions/admin/count` | `platform.subscription.read` | `PLATFORM` |
| `POST` | `/payments/create` | `payment.manage` | `STORE` |
| `PATCH` | `/payments/proceed` | Authenticated checkout/payment policy | Order's branch/store scope |

The wildcard notation above is only documentation shorthand. Each concrete analytics handler must declare the same permission and enforce the resource scope.

## 7. Authentication and authorization response contracts

### 7.1 Login/signup response

The existing `AuthResponse` remains compatible, with an additive `authorization` field:

```json
{
  "jwt": "<access-token>",
  "refreshToken": null,
  "tokenType": "Bearer",
  "expiresIn": 900,
  "message": "Login successful",
  "user": {
    "id": 42,
    "email": "cashier@example.com",
    "fullName": "Example Cashier",
    "role": "ROLE_CASHIER",
    "storeId": 10,
    "branchId": 52
  },
  "authorization": {
    "capabilities": ["order.create", "shift.start"],
    "authorizationVersion": 7
  }
}
```

The refresh token is not serialized when the cookie flow is used. If returned for a legacy client, it must be explicitly marked deprecated and must not be logged.

### 7.2 JWT claims

Canonical v2 access token claims:

```json
{
  "sub": "42",
  "email": "cashier@example.com",
  "role": "ROLE_CASHIER",
  "authz_version": 7,
  "jti": "session-id",
  "iat": 1789572956,
  "exp": 1789573856
}
```

The `authorities` claim may be read for legacy tokens during migration but is not authoritative for v2 authorization. The server resolves permissions from the database/cache and verifies `authz_version`.

### 7.3 Authorization decision model

Internal policy evaluation returns:

```json
{
  "allowed": true,
  "permission": "order.read",
  "scopeType": "BRANCH",
  "scopeId": 52,
  "reasonCode": "ROLE_BUNDLE_MATCH",
  "authorizationVersion": 7
}
```

This object is internal and is not returned to normal clients. Denied decisions are written to audit logs with sanitized fields.

## 8. Data contracts

All new tables use MySQL 8/InnoDB, `BIGINT` identifiers, `DATETIME(6)` UTC timestamps, foreign keys, and comments/remarks for each column. `created_at` and `updated_at` are mandatory on mutable authorization records.

### 8.1 `roles`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Internal role ID |
| `code` | `VARCHAR(64)` | NOT NULL, UNIQUE | Stable canonical role code |
| `display_name` | `VARCHAR(120)` | NOT NULL | Localizable display label |
| `description` | `VARCHAR(500)` | NULL | Administrative description |
| `is_system` | `BOOLEAN` | NOT NULL DEFAULT `TRUE` | Prevents uncontrolled deletion of built-in roles |
| `active` | `BOOLEAN` | NOT NULL DEFAULT `TRUE` | Soft-disable flag |
| `created_at` | `DATETIME(6)` | NOT NULL | Creation time |
| `updated_at` | `DATETIME(6)` | NOT NULL | Last update time |

### 8.2 `permissions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Internal permission ID |
| `code` | `VARCHAR(120)` | NOT NULL, UNIQUE | Stable permission code |
| `resource` | `VARCHAR(64)` | NOT NULL | Resource domain |
| `action` | `VARCHAR(64)` | NOT NULL | Action within the resource |
| `scope_type` | `VARCHAR(16)` | NOT NULL | Maximum catalog scope: `PLATFORM`, `STORE`, `BRANCH`, or `SELF` |
| `description` | `VARCHAR(500)` | NULL | Human-readable policy description |
| `active` | `BOOLEAN` | NOT NULL DEFAULT `TRUE` | Catalog lifecycle flag |
| `created_at` | `DATETIME(6)` | NOT NULL | Creation time |
| `updated_at` | `DATETIME(6)` | NOT NULL | Last update time |

### 8.3 `role_permissions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `role_id` | `BIGINT` | PK part, FK `roles.id` | Role bundle |
| `permission_id` | `BIGINT` | PK part, FK `permissions.id` | Permission in the bundle |
| `created_at` | `DATETIME(6)` | NOT NULL | Mapping creation time |

Primary key: `(role_id, permission_id)`. The mapping is idempotently seeded and cannot reference inactive/nonexistent catalog records.

### 8.4 `user_role_assignments`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Assignment ID |
| `user_id` | `BIGINT` | NOT NULL, FK `users.id` | Subject user |
| `role_id` | `BIGINT` | NOT NULL, FK `roles.id` | Assigned role |
| `scope_type` | `VARCHAR(16)` | NOT NULL | Assignment scope |
| `store_id` | `BIGINT` | NULL, FK `stores.id` | Required for `STORE`/`BRANCH` scope |
| `branch_id` | `BIGINT` | NULL, FK `branches.id` | Required for `BRANCH` scope |
| `scope_key` | `VARCHAR(128)` | NOT NULL | Canonical uniqueness key, e.g. `BRANCH:52` |
| `active_scope_key` | `VARCHAR(128)` | NULL | Equals `scope_key` while active and is null after revoke; supports safe re-assignment history |
| `active` | `BOOLEAN` | NOT NULL DEFAULT `TRUE` | Assignment status |
| `starts_at` | `DATETIME(6)` | NOT NULL | Effective start |
| `ends_at` | `DATETIME(6)` | NULL | Optional expiry |
| `assigned_by` | `BIGINT` | NULL, FK `users.id` | Administrative actor |
| `reason` | `VARCHAR(500)` | NOT NULL | Audit/business reason |
| `created_at` | `DATETIME(6)` | NOT NULL | Creation time |
| `updated_at` | `DATETIME(6)` | NOT NULL | Last update time |
| `version` | `BIGINT` | NOT NULL DEFAULT `0` | Optimistic locking version |

Application and database checks must enforce:

- `PLATFORM` and `SELF`: no store/branch reference.
- `STORE`: store reference required, branch reference absent.
- `BRANCH`: both store and branch references required, and branch must belong to store.
- Assignment actor cannot grant a scope broader than the actor's own administrative scope.
- At most one active assignment with the same `(user_id, role_id, scope_key)`.

### 8.5 `user_permission_overrides`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Override ID |
| `user_id` | `BIGINT` | NOT NULL, FK `users.id` | Subject user |
| `assignment_id` | `BIGINT` | NULL, FK `user_role_assignments.id` | Optional assignment this override is attached to |
| `permission_id` | `BIGINT` | NOT NULL, FK `permissions.id` | Catalog permission |
| `effect` | `VARCHAR(8)` | NOT NULL | `GRANT` or `DENY` |
| `scope_type` | `VARCHAR(16)` | NOT NULL | Scope of exception |
| `store_id` | `BIGINT` | NULL, FK `stores.id` | Store scope reference |
| `branch_id` | `BIGINT` | NULL, FK `branches.id` | Branch scope reference |
| `scope_key` | `VARCHAR(128)` | NOT NULL | Canonical scope uniqueness key |
| `active` | `BOOLEAN` | NOT NULL DEFAULT `TRUE` | Override status |
| `expires_at` | `DATETIME(6)` | NULL | Expiry; expired overrides are ignored |
| `assigned_by` | `BIGINT` | NOT NULL, FK `users.id` | Administrative actor |
| `reason` | `VARCHAR(500)` | NOT NULL | Mandatory justification |
| `created_at` | `DATETIME(6)` | NOT NULL | Creation time |
| `updated_at` | `DATETIME(6)` | NOT NULL | Last update time |

An override must target either the subject user directly or one of the subject's active assignments. Unique active overrides use `(user_id, assignment_id, permission_id, effect, scope_key)` at the service transaction boundary. `DENY` wins when grant and deny overlap.

### 8.6 `authorization_audit_events`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PK, auto-increment | Audit event ID |
| `actor_user_id` | `BIGINT` | NULL, FK `users.id` | Authenticated actor, null for anonymous failures |
| `action` | `VARCHAR(120)` | NOT NULL | Action such as `authorization.denied` |
| `permission_code` | `VARCHAR(120)` | NULL | Evaluated permission |
| `resource_type` | `VARCHAR(80)` | NULL | Resource class/domain |
| `resource_id` | `VARCHAR(128)` | NULL | Resource reference without sensitive payload |
| `scope_type` | `VARCHAR(16)` | NULL | Evaluated scope |
| `scope_id` | `BIGINT` | NULL | Store/branch scope reference |
| `decision` | `VARCHAR(16)` | NOT NULL | `ALLOW`, `DENY`, or `MUTATION` |
| `reason_code` | `VARCHAR(80)` | NOT NULL | Stable machine-readable reason |
| `request_id` | `VARCHAR(128)` | NOT NULL | HTTP/request correlation ID |
| `metadata_json` | `JSON` | NULL | Sanitized structured metadata |
| `created_at` | `DATETIME(6)` | NOT NULL | Event time in UTC |

Never store passwords, password hashes, bearer tokens, refresh tokens, authorization headers, payment secrets, or raw customer PII in `metadata_json`.

### 8.7 Existing `users` expansion

Add the following column during expansion:

| Column | Type | Default | Description |
|---|---|---|---|
| `authorization_version` | `BIGINT` | `1` | Incremented whenever effective assignments/overrides change |

Existing `role`, `store_id`, and `branch_id` remain during migration. They are legacy compatibility fields, not the v2 source of truth.

## 9. Index and constraint contract

| Table | Index/constraint | Columns | Purpose |
|---|---|---|---|
| `roles` | `uk_roles_code` | `code` | Stable catalog lookup |
| `permissions` | `uk_permissions_code` | `code` | Stable catalog lookup |
| `permissions` | `idx_permissions_resource_scope` | `resource, scope_type, active` | Policy/catalog queries |
| `role_permissions` | `pk_role_permissions` | `role_id, permission_id` | Unique mapping and role lookup |
| `role_permissions` | `idx_role_permissions_permission` | `permission_id, role_id` | Reverse permission lookup |
| `user_role_assignments` | `idx_ura_user_active` | `user_id, active, starts_at, ends_at` | Effective subject snapshot |
| `user_role_assignments` | `idx_ura_scope_active` | `scope_type, store_id, branch_id, active` | Scope verification |
| `user_role_assignments` | `uk_ura_active_scope` | `user_id, role_id, active_scope_key` | One active logical assignment while preserving revoked assignment history |
| `user_permission_overrides` | `idx_upo_user_active_expiry` | `user_id, active, expires_at` | Effective override lookup |
| `user_permission_overrides` | `idx_upo_assignment_active` | `assignment_id, active, expires_at` | Assignment-bound override lookup |
| `user_permission_overrides` | `idx_upo_scope_active` | `scope_type, store_id, branch_id, active` | Scope-limited override lookup |
| `authorization_audit_events` | `idx_aae_created_at` | `created_at` | Retention/reporting |
| `authorization_audit_events` | `idx_aae_actor_created_at` | `actor_user_id, created_at` | Actor audit trail |
| `authorization_audit_events` | `idx_aae_decision_created_at` | `decision, created_at` | Denial monitoring |

Foreign keys must use explicit names and `RESTRICT`/application-controlled soft deletion for authorization records. Do not cascade-delete audit events.

## 10. Flyway migration contract

Flyway becomes the production schema owner after the existing database is baselined. Production must not use `spring.jpa.hibernate.ddl-auto=update` for these tables.

| Version | File | Purpose | Rollback/reconciliation |
|---|---|---|---|
| `V1` | `V1__rbac_catalog.sql` | Create catalog, assignment, override, audit tables and `users.authorization_version` | Restore backup or apply a forward corrective migration; no destructive down migration |
| `V2` | `V2__rbac_seed_roles_permissions.sql` | Idempotently seed six roles, permissions, and role mappings | Seed script is rerunnable; record checksum and row counts |
| `V3` | `V3__rbac_backfill_assignments.sql` | Map legacy user role/store/branch into assignments | Quarantine invalid rows and emit parity report; no broad-scope fallback |
| `V4` | `V4__rbac_enforcement_support.sql` | Add compatibility indexes/flags needed by application enforcement | Disable feature flag and retain normalized data |
| `V5` | `V5__rbac_stop_legacy_writes.sql` | Stop writing legacy fields after parity is proven | Re-enable compatibility writes only through reviewed emergency migration |
| `V6` | `V6__rbac_remove_legacy_columns.sql` | Remove legacy columns after deprecation and client inventory | Separate release with backup and approved rollback plan |

Migration requirements:

- Use one transaction where MySQL DDL permits; otherwise split DDL and data operations with explicit checkpoints.
- Seed operations use `INSERT ... ON DUPLICATE KEY UPDATE` or equivalent idempotent logic.
- Backfill is deterministic and reports users with missing store/branch references, unsupported roles, or conflicting assignments.
- Record pre/post row counts and a per-user permission parity report.
- Do not run `V6` in the same release as `V3`.

## 11. Integration contracts

There is no new external message broker or microservice in v1. Authorization changes use a synchronous database transaction followed by an internal application event for cache/session effects.

### `AuthorizationChanged.v1`

Producer: authorization assignment/override service. Consumers: Redis invalidation, session revocation policy, audit writer, metrics.

```json
{
  "eventType": "AuthorizationChanged.v1",
  "eventId": "evt_01J...",
  "occurredAt": "2026-09-16T15:35:56Z",
  "requestId": "req_01J...",
  "actorUserId": 7,
  "subjectUserId": 88,
  "authorizationVersion": 8,
  "changeType": "ASSIGNMENT_UPDATED",
  "assignmentId": 1002
}
```

The event contains no password, token, full permission snapshot, or sensitive customer data. If a future deployment introduces multiple services, this event must move to an outbox before being published externally.

### Frontend shared type contract

The frontend should define these types centrally and use Redux selectors:

```ts
type ScopeType = 'PLATFORM' | 'STORE' | 'BRANCH' | 'SELF';

type CapabilityScope = {
  type: ScopeType;
  storeIds?: number[];
  branchIds?: number[];
};

type AuthorizationProfile = {
  user: {
    id: number;
    email: string;
    fullName: string;
    phone?: string | null;
    active: boolean;
  };
  roles: Array<{ code: string; scope: CapabilityScope }>;
  capabilities: string[];
  authorizationVersion: number;
};
```

Frontend route/action checks are capability checks only. The backend remains authoritative, and a centralized `403` handler must clear or refresh stale capability state when the authorization version changes.

## 12. Contract acceptance tests

- A request without a token to a protected route returns `401` with `AUTHENTICATION_REQUIRED`.
- A customer token calling employee, branch analytics, or store-wide endpoints returns `403`.
- A branch manager cannot access another branch by changing `branchId` in the URL.
- A store manager cannot access another store by changing `storeId` in the URL.
- A customer can read only their own profile and order history.
- `ROLE_BRANCH_ADMIN` and `ROLE_BRANCH_CASHIER` legacy tokens map to canonical capabilities during migration.
- Assignment/override mutation increments `authorizationVersion` and invalidates the old Redis snapshot.
- A stale token or authorization snapshot is rejected or refreshed before a protected mutation.
- `/users/list` and every employee endpoint cannot serialize `password`, `authorization`, JWT, refresh token, or entity associations.
- Catalog seed and backfill migrations are idempotent and produce no duplicate active assignments.
- Permission denial and sensitive role/override mutations write an audit event with actor, permission/action, resource/scope, decision, reason code, and request ID.

## 13. Deferred implementation details

- Exact Java annotation name and method-security evaluator implementation.
- Concrete SQL comments, check-constraint syntax, and Flyway configuration values.
- Full OpenAPI generation for every existing business DTO.
- Customer portal UI design and advanced loyalty/e-commerce permissions.
- Opaque public IDs, if required after the v1 compatibility period.
