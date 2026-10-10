Started at: 2026/09/16 23:01:20
Finished at: 2026/09/16 23:02:35
Total time: 2 minutes
---

# RBAC Redesign — Final Design Result

## 1. Design review

### Review scope

The review covers the four approved design artifacts and their direct implementation dependencies:

- [Vision](./2026-09-16-vision.md)
- [Requirements](./2026-09-16-requirements.md)
- [Architecture](./2026-09-16-architecture.md)
- [Contracts](./2026-09-16-contracts.md)
- Current `SecurityConfig`, JWT filter/provider, role enum, controllers, user entity, and API response conventions

### Verdict

**YELLOW — APPROVED WITH WARNINGS**

The design is coherent and implementation-ready. No unresolved architectural contradiction remains after the contract review. The warnings are implementation preconditions caused by the current codebase, not reasons to redesign the target model.

### Summary

The final model has six canonical roles, a central permission catalog, explicit store/branch/self scope, normalized assignments, bounded overrides, backend enforcement, DTO boundaries, Redis authorization-version caching, and Flyway migration. `ROLE_BRANCH_ADMIN` and `ROLE_BRANCH_CASHIER` are migration aliases rather than permanent additional roles.

### Warnings before implementation

| # | Area | Finding | Required treatment |
|---:|---|---|---|
| 1 | Backend security | Current method-level annotations are not sufficient until method security is explicitly enabled and tested | Enable method security before endpoint rollout; add `401/403` integration tests |
| 2 | Data exposure | Existing endpoints include direct entity responses and a user list path that can expose credential fields | Migrate sensitive controllers to DTO-only responses before declaring RBAC complete |
| 3 | Scope isolation | Several current services trust `storeId`, `branchId`, or resource IDs from the request | Make scope-aware repository queries mandatory; add BOLA/cross-tenant negative tests |
| 4 | Schema migration | Current production configuration uses `ddl-auto=update` and has no Flyway history | Baseline carefully, deploy additive migrations first, and do not remove legacy columns with the initial release |
| 5 | Legacy compatibility | The existence of `/api` clients and old role names is not yet proven by a client inventory | Confirm consumers before enabling aliases and set a deprecation deadline |
| 6 | Legacy branch admin | Temporary destructive permissions for migrated `ROLE_BRANCH_ADMIN` users need an explicit sunset date | Track the override as migration data and review/revoke it before cleanup |

## 2. Final role design

| Canonical role | Scope | Responsibility | Deliberately excluded |
|---|---|---|---|
| `ROLE_ADMIN` | `PLATFORM` | SaaS dashboard, tenant moderation, subscription plans, platform audit, platform RBAC | Implicit access to tenant POS data |
| `ROLE_STORE_ADMIN` | `STORE` | Store lifecycle, branches, staff, RBAC within the store, catalog, inventory, sales, subscription | Platform governance |
| `ROLE_STORE_MANAGER` | `STORE` | Daily store operations, staff operations, catalog, inventory, reports | Branch lifecycle, subscription/payment administration, destructive branch permissions by default |
| `ROLE_BRANCH_MANAGER` | `BRANCH` | Branch staff operations, orders, refunds, shifts, analytics, branch inventory/product reads | Destructive employee/refund/shift actions by default |
| `ROLE_CASHIER` | `BRANCH` | Checkout, current shift, own work history, controlled refund creation | Staff administration, arbitrary store reporting, role management |
| `ROLE_CUSTOMER` | `SELF` | Own profile and own order history | Other customer, store, branch, and operational data |

### Legacy mapping

- `ROLE_BRANCH_ADMIN` becomes `ROLE_BRANCH_MANAGER` plus temporary branch-scoped grants for `employee.delete`, `refund.delete`, and `shift.delete`.
- `ROLE_BRANCH_CASHIER` becomes `ROLE_CASHIER`.
- No new endpoint, frontend guard, database seed, or business service may introduce either legacy code.
- Temporary grants require an expiry/review date and must be removed or converted into a formally approved permission policy before legacy cleanup.

## 3. Approved target architecture

```text
React capability UI
        |
        v
JWT authentication -> Authorization context/policy -> Scope-aware resource services
        |                       |                         |
        |                       +--> Redis versioned cache |
        |                       +--> MySQL assignments      |
        |                                                 |
        +-------------------- DTO boundary <--------------+
                                  |
                                  v
                           Audit and metrics
```

The application remains a modular monolith. MySQL is the authorization source of truth; Redis accelerates effective snapshots and revocation effects. Roles are bundles only. Resource services request permissions and resolved scopes, not role-name conditions.

## 4. Implementation roadmap

### Milestone 0 — Preflight and safety baseline

**Deliverables**

- Inventory frontend/backend consumers of `/api`, `/api/v1`, old role strings, and store/branch IDs.
- Take a database backup and record current row counts for users, stores, branches, and role values.
- Add feature flags for normalized authorization mode, legacy token reading, and legacy writes.
- Establish integration fixtures for all six canonical roles and both legacy aliases.
- Decide the Flyway baseline procedure for existing environments.

**Acceptance:** A rollback runbook exists, client compatibility is known, and invalid legacy users are reportable without receiving broader access.

### Milestone 1 — Authorization schema and catalog

**Deliverables**

- Add Flyway `V1`–`V3` migrations from the Contracts document.
- Create roles, permissions, role mappings, assignments, overrides, audit events, and `users.authorization_version`.
- Seed the six canonical roles and permission catalog idempotently.
- Backfill valid users; quarantine missing or conflicting store/branch references.
- Produce a per-user legacy-to-canonical parity report.

**Acceptance:** Migrations are repeatable, foreign keys/indexes are present, no duplicate active assignment exists, and parity mismatches are reviewed.

### Milestone 2 — Authorization domain module

**Deliverables**

- Implement permission catalog and normalized assignment repositories.
- Implement `AuthorizationContext`, `ScopeResolver`, and `PolicyEvaluator`.
- Implement grant/deny override precedence and administrative-scope checks.
- Add Redis snapshot keys using `authz:user:{userId}:version:{version}`.
- Increment authorization version and invalidate snapshots on every assignment/override mutation.

**Acceptance:** Unit tests cover role bundles, scope narrowing, deny precedence, expired overrides, invalid assignments, and cache invalidation.

### Milestone 3 — Security pipeline and response boundary

**Deliverables**

- Enable Spring method security explicitly.
- Extend the principal/JWT with user ID, `authz_version`, `jti`, and canonical role compatibility data.
- Resolve permissions server-side; do not trust the legacy `authorities` claim for v2 decisions.
- Implement consistent `401`, `403`, scope violation, and request ID handling.
- Add authorization profile endpoint and additive login response contract.
- Remove direct entity responses from user/employee/authentication paths.

**Acceptance:** Anonymous requests receive `401`, authenticated unauthorized requests receive `403`, stale/revoked tokens are rejected, and no response contains password hashes or tokens.

### Milestone 4 — Resource scope hardening

Migrate endpoint groups in this order so high-risk isolation is proven early:

1. Users, employees, stores, branches, and customers.
2. Orders, refunds, shifts, and payment actions.
3. Products, categories, and inventory.
4. Branch/store analytics and subscriptions.

For each group:

- Replace role-string guards with permission contracts.
- Resolve scope from the authenticated principal and resource ownership.
- Replace unchecked `findById`/ID-based mutations with scope-aware repository methods.
- Add allow/deny tests for every role and cross-store/cross-branch ID.
- Emit audit records for sensitive mutations and denied decisions.

**Acceptance:** The endpoint matrix covers 100% of `/api/v1`; changing a URL/query ID cannot cross a store or branch boundary.

### Milestone 5 — Frontend capability contract

**Deliverables**

- Add the shared `AuthorizationProfile` type and Redux selectors.
- Replace route/action checks based on role arrays with capability checks.
- Add customer self-service routes only for profile/order-history capabilities.
- Centralize `401` refresh/logout behavior and `403` capability refresh behavior.
- Keep legacy role aliases only in a compatibility adapter with a removal flag.

**Acceptance:** Frontend navigation matches the profile contract, but direct API calls with a modified client still receive backend authorization decisions.

### Milestone 6 — Controlled rollout and legacy cleanup

**Deliverables**

- Enable normalized authorization in shadow/monitoring mode and compare legacy vs normalized decisions.
- Roll out by endpoint group behind the feature flag.
- Stop legacy writes after parity is stable.
- Remove legacy aliases and columns only after client inventory, audit review, and rollback approval.
- Establish audit retention of at least 180 days, configurable by deployment policy.

**Acceptance:** No unresolved parity mismatch, no cross-scope authorization failure, all migration rollback checks are documented, and legacy cleanup is a separate release.

## 5. Verification plan

### Security and authorization

- Endpoint matrix test for every protected route.
- Role matrix test for every canonical role.
- `401`/`403` contract tests.
- Cross-store and cross-branch BOLA tests for every path/query/resource ID.
- Self-scope tests for customer, cashier, and shift endpoints.
- Privilege-escalation tests for role assignment and overrides.

### Data and migration

- Flyway checksum and idempotence tests.
- Backfill parity and invalid-data quarantine tests.
- Active assignment uniqueness and revoke/reassign tests.
- Redis invalidation/version tests.
- Audit retention, masking, and immutable-event tests.

### API and frontend

- DTO serialization tests for users, employees, customers, subscriptions, and shifts.
- JWT/profile compatibility tests for canonical and legacy tokens.
- `ApiResponse` error/request ID tests.
- Frontend capability selector, route guard, and centralized `403` tests.

## 6. Definition of done

The RBAC redesign is complete only when:

1. All `/api/v1` endpoints have a documented permission and scope.
2. Backend method and object-level authorization are enforced in production mode.
3. Cross-tenant and cross-branch access is denied by tests and repository predicates.
4. No sensitive entity, password, token, or internal authorization data leaks through API responses/logs.
5. Canonical roles and permission seeds are managed by Flyway.
6. Legacy mappings are measurable, reversible, and have a deprecation deadline.
7. Assignment changes invalidate authorization snapshots immediately.
8. Audit events contain actor, action, permission, resource/scope, decision, reason, timestamp, and request ID.
9. Frontend uses the shared capability contract without being treated as a security boundary.
10. Operational runbooks cover migration, rollback, cache failure, and emergency permission revocation.

## 7. Final decision

The role redesign is approved for implementation with the warnings and milestone gates above. The model is suitable for a real multi-tenant POS project because it keeps the role set small, represents exceptions as permissions, enforces tenant boundaries independently of UI routing, and preserves a controlled migration path from the current seven-role implementation.

Implementation should begin at Milestone 0. No production authorization code or destructive database migration should be merged before the schema parity report and security integration tests are in place.
