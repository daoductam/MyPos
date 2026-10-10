# RBAC v2 Architecture Design

**Design:** RBAC Redesign  
**Phase:** 3 — Architecture Design  
**Status:** Draft — awaiting approval  
**Started:** 2026/09/16 22:32:14  
**Finished:** 2026/09/16 22:33:57  
**Scope:** Complete RBAC subsystem for the backend, data layer, JWT/API contract, and frontend capability model

## 1. Design inputs

This architecture is derived from:

- [Vision](./2026-09-16-vision.md)
- [Requirements](./2026-09-16-requirements.md)
- Existing Spring Boot, MySQL, Redis, JWT, and React modules in this repository
- The current migration constraint: `users.role`, `users.store_id`, and `users.branch_id` are already used by the application

The target is a modular monolith. The design does not introduce a new identity provider or split authorization into a microservice in v1.

## 2. Architectural decisions

| Area | Decision | Rationale |
|---|---|---|
| Application shape | Modular monolith | Keeps authorization transactionally close to business data and matches the current Spring Boot deployment |
| Authorization model | Permission + scope, with roles as bundles | Prevents role explosion while preserving a simple operator experience |
| Scope model | `PLATFORM`, `STORE`, `BRANCH`, `SELF` | Expresses tenant and branch boundaries explicitly instead of relying on role names |
| Database | Existing MySQL 8/InnoDB | No additional operational datastore is required for the source of truth |
| Schema migration | Flyway, versioned expand/contract migrations | Fits a single Java service and makes production schema changes reviewable and repeatable |
| Authorization cache | Redis with versioned user authorization snapshots | Avoids permission queries on every request while allowing immediate invalidation after changes |
| Identity IDs | Retain existing `BIGINT` identifiers in v1 | Avoids a risky cross-module foreign-key rewrite; opaque public identifiers can be added later |
| Audit storage | MySQL authorization audit table plus structured application logs | Provides queryable business evidence and operational correlation by request ID |
| Partitioning | No partitioning for RBAC tables in v1 | Role/permission tables are small; audit partitioning is only justified by measured volume |

## 3. Component architecture

```text
React capability UI
        |
        | JWT + API requests
        v
Spring Security filter chain
        |
        +--> Authentication/JWT module
        |       - validates signature, expiry, revocation, authz version
        |       - creates an authenticated principal
        |
        +--> Authorization module
        |       - PermissionCatalog
        |       - AuthorizationContext
        |       - ScopeResolver
        |       - PolicyEvaluator
        |       - Redis authorization snapshot cache
        |
        +--> Resource modules
        |       - stores, branches, employees
        |       - catalog, inventory, sales, shifts
        |       - customers, subscriptions, analytics
        |       - repositories require resolved scope predicates
        |
        +--> DTO/response boundary
        |       - no entity or credential exposure
        |
        +--> Audit module
                - authorization decisions
                - permission changes
                - sensitive resource mutations

MySQL is the source of truth. Redis is a disposable cache and revocation accelerator.
```

### 3.1 Authentication and JWT module

Responsibilities:

- Authenticate credentials and issue access/refresh tokens.
- Validate signature, issuer, audience, expiry, and revocation state.
- Build a principal containing the internal user ID, email, active status, and authorization version.
- Keep token contents minimal. The token may include the primary legacy-compatible role for transition and routing, but permissions remain server-resolved.
- Reject a token when the user authorization version is stale or the session is revoked.

The access token should contain these logical claims:

```text
sub              user ID
email            authenticated email, if needed by current clients
role             transition-only primary role
authz_version    authorization snapshot version
iat / exp        issued-at and expiry
jti              token/session identifier for revocation
```

Store and branch IDs should not be treated as trusted authorization claims. They are useful context only after the server verifies the current assignment. This prevents a caller from changing a URL or replaying a token to cross a tenant boundary.

### 3.2 Authorization module

The module exposes application-level decisions rather than role-string checks:

```text
authorize(actor, permission, resource)
resolveScope(actor, permission, requestedResource)
hasPermission(actor, permission)
```

Its internal responsibilities are:

- Load the active role assignments and permission overrides.
- Resolve the effective permissions from the central catalog.
- Apply deny-by-default and deny-overrides-grant precedence.
- Resolve the actor's effective store/branch scope from database assignments, not from a request parameter.
- Validate the requested resource's store/branch ownership before a repository query returns data.
- Cache the effective authorization snapshot in Redis under a versioned key.
- Fail closed for protected requests when authorization state cannot be reliably resolved.

The module is the only place that translates roles into permission bundles. Resource modules should ask for capabilities such as `employee.read` or `order.create`, not inspect `ROLE_BRANCH_ADMIN` directly.

### 3.3 Method and endpoint enforcement

The security layer will enable Spring method security and provide a consistent permission annotation/interceptor, for example:

```java
@RequirePermission(value = "employee.read", scope = ScopeType.STORE)
```

The exact annotation/API contract is deferred to Phase 4. The enforcement order is:

1. No valid authentication: return `401`.
2. Valid authentication but no permission: return `403`.
3. Permission exists but requested store/branch/resource is outside the actor's resolved scope: return `403`.
4. Authorized request: invoke the resource service with an authorization context.

Existing `@PreAuthorize` expressions may be supported during migration, but new code must not add role-name expressions as the primary policy mechanism.

### 3.4 Resource modules and repositories

Every resource module remains responsible for its business rules, while the authorization module owns access decisions. A service must not trust `storeId`, `branchId`, `userId`, or resource IDs supplied by the client.

Repositories should expose scope-aware operations, such as:

```text
findOrdersForScope(scope, filters)
findEmployeeForUpdate(id, scope)
findCustomerSelf(actorId, id)
```

This makes object-level authorization part of the data access path and prevents an endpoint guard from being bypassed by a different service method. A direct `findById(id)` followed by an unchecked update is not sufficient for scoped resources.

### 3.5 Frontend capability module

The frontend receives a normalized authorization profile after login or session refresh:

```text
user: { id, email, ... }
roles: [ ... ]
capabilities: [ "order.create", "shift.start", ... ]
scope: { type, storeIds, branchIds }
authorizationVersion
```

Redux selectors and route/action guards use capabilities for navigation and user experience. They never replace backend authorization. A `403` response must be handled centrally and must not be converted into a silent success state.

## 4. Authorization request flow

```text
Client request
  -> JWT filter validates token and revocation
  -> principal + authz version created
  -> policy evaluator loads versioned snapshot from Redis or MySQL
  -> scope resolver validates actor assignment and requested resource
  -> controller/service executes business operation
  -> scope-aware repository reads/writes only permitted rows
  -> DTO mapper removes credentials and internal fields
  -> audit event emitted for denied or sensitive operations
```

The authorization snapshot cache key is conceptually:

```text
authz:user:{userId}:version:{authzVersion}
```

The cache has a bounded TTL, and all assignment/override changes increment the user authorization version and evict old snapshots. Permission changes must not require waiting for a normal TTL to expire. Redis is not the source of truth; a cache miss is safe, but an unavailable authorization source must fail closed for protected operations.

## 5. Data architecture

### 5.1 Target logical model

```text
users (existing identity)
  1 ─── * user_role_assignments * ─── 1 roles
                                      1 ─── * role_permissions * ─── 1 permissions

user_role_assignments 1 ─── * user_permission_overrides

user_role_assignments
  -> optional store scope
  -> optional branch scope
  -> effective dates and active state

authorization_audit_events
  -> actor, action, resource, scope, decision, request correlation
```

### 5.2 Tables and ownership

The exact SQL schema and DTO/API contract are deferred to the next phase. The logical tables are:

#### `roles`

System and future tenant-visible role definitions. The v1 system records are `ROLE_ADMIN`, `ROLE_STORE_ADMIN`, `ROLE_STORE_MANAGER`, `ROLE_BRANCH_MANAGER`, `ROLE_CASHIER`, and `ROLE_CUSTOMER`. Include a stable code, display name, system flag, active flag, and timestamps.

#### `permissions`

The central catalog of stable permission codes. Each record has a resource, action, supported scope type, active flag, and timestamps. Permission codes are API-independent and must not be inferred from controller names.

#### `role_permissions`

Many-to-many mapping between roles and permissions. Use a unique role/permission constraint and foreign keys with indexes on both directions.

#### `user_role_assignments`

The normalized replacement for the singular role relationship. It references a user and role, supports platform/store/branch scope, active state, effective dates, and assignment metadata. During v1 migration, the current one-role-per-user invariant can be enforced for active assignments while keeping the model extensible.

Current `users.role`, `users.store_id`, and `users.branch_id` remain readable during the expand/contract migration. They are not deleted until all consumers and rollback checks have moved to assignments.

#### `user_permission_overrides`

Bounded per-user or per-assignment exceptions with `GRANT`/`DENY` effect, optional scope, optional expiry, reason, and assigning actor. Deny takes precedence. The actor may create an override only within the actor's own administrative scope and only from the approved permission catalog.

#### `authorization_audit_events`

Immutable authorization evidence with actor ID, action, resource type/ID, scope type/ID, decision, reason code, request ID, timestamp, and sanitized metadata. Do not store passwords, JWTs, refresh tokens, raw authorization headers, or unnecessary customer PII.

### 5.3 Integrity and indexing

- Use InnoDB foreign keys and unique constraints for role/permission and active assignment invariants.
- Index active assignment lookup by `(user_id, active)` and scope lookup by `(store_id, branch_id, active)`.
- Index permission lookup by `(role_id, permission_id)` and `(permission_id, role_id)`.
- Index audit queries by `(created_at)`, `(actor_user_id, created_at)`, and `(decision, created_at)`.
- Keep `BIGINT` IDs for compatibility with existing entities and foreign keys.
- Add database comments/remarks for every new table and column in the migration contract.
- Do not use `ddl-auto=update` for production authorization schema evolution; Flyway owns the schema after baseline.

### 5.4 Partitioning and retention

RBAC catalog and assignment tables remain unpartitioned in v1. The audit table should use normal indexed storage first. If measured volume exceeds operational thresholds, introduce time-based range partitioning in a separately reviewed migration, with an explicit retention/archive policy. Partitioning is not a substitute for indexes or query predicates.

## 6. Migration strategy

Migration uses an expand/contract sequence and must be reversible at every deploy boundary.

### Stage A — Schema and catalog expansion

1. Baseline the existing database in Flyway without changing business behavior.
2. Add role, permission, role-permission, assignment, override, and audit tables.
3. Seed the six canonical roles and the permission catalog idempotently.
4. Add application feature flags for authorization mode and legacy compatibility.

### Stage B — Backfill and dual read

1. Map existing roles deterministically:
   - `ROLE_BRANCH_ADMIN` -> `ROLE_BRANCH_MANAGER` plus its approved extra permission set.
   - `ROLE_BRANCH_CASHIER` -> `ROLE_CASHIER`.
   - Other canonical roles map to themselves.
2. Backfill store/branch scope from the existing user columns.
3. Detect and quarantine invalid users (missing store/branch, inactive owner, or conflicting references) instead of silently granting access.
4. Read the normalized assignment first and compare against the legacy columns in monitoring mode.

### Stage C — Backend enforcement

1. Enable method security and central exception handling.
2. Protect endpoints by permission and scope, starting with employee, branch, order, refund, shift, analytics, and user APIs.
3. Replace direct entity responses with DTOs, especially user and employee responses.
4. Add cross-scope tests and audit events.
5. Roll out by feature flag so an authorization mismatch can fail closed or be rolled back without data loss.

### Stage D — Frontend contract

1. Expose the normalized authorization profile.
2. Replace route guards based on role arrays with capability selectors and scope-aware navigation.
3. Add the customer self-service route only for the agreed v1 customer capabilities.
4. Keep a compatibility mapping for legacy role names while older clients are active.

### Stage E — Contract and cleanup

1. Remove legacy role checks from application code.
2. Stop writing legacy columns after reconciliation proves assignment parity.
3. Remove legacy columns and aliases only after the deprecation window, client inventory, and rollback plan are approved.

No destructive migration is allowed in the same release as the initial backfill. A pre-migration backup, row-count reconciliation, permission parity report, and rollback procedure are required.

## 7. Security boundaries and failure behavior

- Authentication is separate from authorization: a valid JWT is not permission to access every API.
- The backend is the only security authority.
- URL/query IDs are untrusted input and must be checked against the authorization context.
- `401` is for missing/invalid authentication; `403` is for authenticated but unauthorized access.
- Missing authorization data, stale version, or policy evaluation failure results in denial for protected operations.
- User, employee, authentication, and audit responses use DTOs; entities never cross controller boundaries.
- Password hashes, JWTs, refresh tokens, and secrets are never serialized or written to audit logs.
- Every denied decision and sensitive permission/role mutation includes a correlation/request ID and a reason code.

## 8. Testing and observability architecture

Required test layers:

- Unit tests for permission bundles, scope resolution, override precedence, and legacy role mapping.
- Spring security integration tests proving `401`, `403`, allowed access, and cross-store/cross-branch denial.
- Object-level/BOLA tests for every endpoint accepting resource IDs.
- Repository tests proving scope predicates are applied to reads, updates, and deletes.
- Migration tests for idempotent seed/backfill, invalid-data quarantine, parity, and rollback readiness.
- API contract tests for JWT/profile/capabilities and legacy aliases.
- Frontend tests for capability-based routes/actions and centralized `403` handling.
- Serialization tests proving passwords, tokens, and internal authorization fields cannot appear in responses.

Operational metrics should include authorization allow/deny counts by permission and reason code, policy evaluation latency, cache hit/miss rate, stale-token rejections, migration parity mismatches, and cross-scope denial attempts. Logs must be structured and must not contain secrets or unnecessary PII.

## 9. Architecture risks and mitigations

| Risk | Mitigation |
|---|---|
| Existing endpoints assume a single role | Use normalized assignment abstraction while preserving a compatibility read path |
| Method annotations are currently not reliably enforced | Enable method security early and add endpoint-level integration tests before rollout |
| BOLA through direct IDs | Require scope-aware repository methods and negative tests for every ID-based endpoint |
| Stale permissions in JWT/cache | Keep permissions server-resolved, include `authzVersion`, invalidate Redis on changes |
| Sensitive entity serialization | Enforce DTO-only controller boundaries and serialization regression tests |
| Invalid legacy users | Quarantine and report; never infer a broader scope to make migration pass |
| Audit data growth | Index first, establish retention, and consider time partitions only after measurement |
| Frontend and backend contract drift | Versioned authorization profile and API contract tests |

## 10. ADR candidates for approval

1. Modular monolith instead of a separate authorization service for v1.
2. Permission and scope as the enforcement model; roles are bundles only.
3. Flyway as the production schema migration tool.
4. Redis as a versioned cache/revocation accelerator, never the authorization source of truth.
5. Preserve existing `BIGINT` IDs and legacy role columns during expand/contract migration.
6. Defer partitioning until measured audit volume requires it.

## 11. Deferred artifacts

The following belong in Phase 4 — Contracts, not this architecture gate:

- Exact permission catalog and role-to-permission matrix.
- SQL migration definitions, constraints, column types, and seed data.
- Java interfaces/annotations and error response schema.
- JWT/profile JSON examples and frontend TypeScript types.
- Endpoint-by-endpoint authorization matrix.

Sequence diagrams are deferred until the contract phase, where the login/refresh, protected resource access, and role-assignment mutation flows can be tied to final API contracts.
