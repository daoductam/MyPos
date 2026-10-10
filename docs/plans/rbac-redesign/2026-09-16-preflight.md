Started at: 2026/09/16 23:11:48
Finished at: 2026/09/16 23:15:22
Total time: 4 minutes
---

# RBAC Redesign — Milestone 0 Preflight

## Status

**Complete with security remediation applied.** RBAC migrations are now present, but no production migration or data mutation has been executed.

## Baseline verification

| Check | Result |
|---|---|
| Backend `mvnw.cmd test-compile` | Passed |
| Frontend `npm.cmd run build` | Passed |
| Frontend PowerShell `npm run build` | Blocked by local execution policy; `npm.cmd` is the working command |
| Backend tests | Only the application context smoke test exists; no RBAC matrix tests yet |
| Frontend RBAC tests | No dedicated capability/route authorization tests found |
| Backend migration tool | Flyway configured with additive `V1`-`V4` migrations; production rehearsal still pending |
| JPA schema mode | `ddl-auto=validate`; Flyway owns authorization/customer-scope schema changes |
| Frontend bundle | Build succeeds; Vite warns that the main chunk is approximately 3.9 MB |

## Client and role inventory

Current frontend consumers still depend on legacy role strings in:

- `Frontend/src/App.jsx` route protection.
- `Frontend/src/routes/ProtectedRoute.jsx` local role checks.
- `Frontend/src/pages/common/Auth/Login.jsx` post-login redirects.
- `Frontend/src/utils/userRole.js` role groups.
- Store employee forms and branch employee deletion controls.
- Redux thunks that call `/api/v1` resource endpoints with caller-supplied store/branch IDs.

Current backend consumers still depend on legacy role strings in:

- `UserRole.java` and `SecurityConfig.java`.
- Controller `@PreAuthorize` expressions.
- `SecurityUtil`, service-level role branches, employee creation, and cashier queries.
- Demo data initialization and repository role filters.

The migration must therefore use a compatibility adapter and cannot remove legacy enum values in the first implementation pass.

## Security remediation applied

The preflight found credential defaults in configuration and hardcoded demo passwords in the startup seed component. The following changes were applied:

- Removed default DB password and JWT secret fallbacks from `application.yml`.
- Moved mail, Razorpay, and Stripe credentials to required environment-backed properties.
- Changed Docker Compose to require database passwords through environment variables.
- Disabled demo user seeding by default.
- Demo seeding now requires all demo passwords through environment-backed properties and fails closed if enabled without them.

Actual credentials that may have used the old values must still be rotated outside the repository.

## Files changed in this milestone

- `Backend/src/main/resources/application.yml`
- `Backend/src/main/resources/docker-compose.yml`
- `Backend/src/main/java/com/tamdao/service/impl/DataInitializationComponent.java`
- `docs/roles_api_mapping.md`
- `Backend/pom.xml`
- `Backend/src/main/resources/db/migration/V1__rbac_catalog.sql`
- `Backend/src/main/resources/db/migration/V2__rbac_seed_roles_permissions.sql`
- `Backend/src/main/resources/db/migration/V3__rbac_backfill_assignments.sql`
- `Backend/src/main/resources/db/migration/V4__customer_scope.sql`

## Implementation preconditions

Before Milestone 1, provide environment values for local development or use a managed secret store:

```text
DB_PASSWORD
JWT_SECRET
MAIL_USERNAME
MAIL_PASSWORD
RAZORPAY_API_KEY
RAZORPAY_API_SECRET
STRIPE_API_KEY
APP_DEMO_SEED_ENABLED=false
```

If demo seeding is intentionally enabled, provide the corresponding `APP_DEMO_PASSWORDS_*` environment variables for every seeded account. Do not commit them to `.env`, YAML, source code, or documentation.

## Remaining pre-production gates

- Rehearse Flyway baseline/migrations against a disposable MySQL 8.0 instance and review the quarantine report.
- Add the role/scope/BOLA integration matrix and migration idempotence tests.
- Keep `users.role`, `users.store_id`, and `users.branch_id` until parity approval and a separately approved cleanup release.
