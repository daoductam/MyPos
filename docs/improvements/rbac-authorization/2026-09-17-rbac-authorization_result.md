# Improvement Result: RBAC Authorization Persistence

Started at:  2026/09/17 02:23:00
Finished at: 2026/09/17 02:31:00
Total time: 8 minutes
---

## Verification Verdict

**YELLOW — Approved with known deployment warnings.**

The refactor removed persistence coupling from the authorization policy layer without changing RBAC contracts. Backend tests and frontend production build pass. Remaining warnings are environment/test-depth concerns, not regressions introduced by this change.

## Phase References

- [Scope](./2026-09-17-scope.md)
- [Analysis](./2026-09-17-analysis.md)
- [Walkthrough](./2026-09-17-walkthrough.md)

## Code Review Comparison

| Issue | Before | After | Status |
|---|---|---|---|
| SQL in `AuthorizationGuard` | Guard queried stores, branches, users, and customers directly. | Guard depends on `AuthorizationScopeRepository`; no SQL in guard. | Resolved |
| SQL in policy services | Snapshot/admin/mutation/audit services owned SQL and row mapping. | SQL and mapping are in JDBC repository adapters. | Resolved |
| Dynamic scope-column SQL | `SELECT " + column + " FROM users` in guard. | Typed store/branch scope methods. | Resolved |
| Audit JSON escaping | Metadata built by string concatenation. | `ObjectMapper` produces valid JSON. | Resolved |
| Insert identity lookup | Insert followed by business-column lookup. | `GeneratedKeyHolder` returns inserted assignment/override ID. | Resolved |
| Authorization behavior tests | Only Spring context test existed. | Guard fail-closed tests, self-scope test, audit JSON test, and context regression test. | Improved |

## Success Criteria Comparison

| # | Criterion | Before | After | Status |
|---|---|---|---|---|
| 1 | Policy classes contain no persistence SQL. | SQL in guard, resolver, and services. | Static scan found no SQL/JdbcTemplate outside `repository/authorization`. | Met |
| 2 | Authorization behavior remains working. | Existing behavior was covered mainly by context startup. | Backend test suite passes with 6 tests and 0 failures/errors. | Met for local test profile |
| 3 | Security remains fail-closed. | Ad hoc database handling across policy code. | Guard returns denial for missing resources and repository failures; stale-version path remains unchanged. | Met by unit coverage; MySQL path pending |
| 4 | Mutations remain atomic. | Transactional service methods with direct SQL. | Repository writes remain inside existing `@Transactional` service methods; version/cache/audit sequence preserved. | Met by code review and regression test |
| 5 | API/database contracts unchanged. | Baseline RBAC contracts. | No controller route, DTO, permission code, scope enum, or migration changed in this refactor. | Met |
| 6 | Project remains runnable. | Baseline build passed. | `mvnw test -q` exit 0; Vite build completed; `git diff --check` clean. | Met |

## Test Results

### Backend

```text
Tests run: 6
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Covered subjects:

- Store scope resource absence denies access.
- Branch scope resolves the owning store before permission evaluation.
- Scope repository failure denies access.
- Self permission cannot target another user.
- Audit reason containing quotes remains valid JSON.
- Full Spring context startup regression.

### Frontend

- Vite production build completed successfully.
- 3344 modules transformed.
- Existing warning remains: main bundle is approximately 3.9 MB before gzip.

### Static checks

- No direct authorization SQL outside `Backend/src/main/java/com/tamdao/repository/authorization/`.
- No `hasRole`/`hasAuthority` guard in controllers.
- `git diff --check` passed; Git only reported existing LF/CRLF normalization warnings.

## Remaining Gates

- Run Flyway V1–V4 against a real MySQL staging copy before production rollout.
- Add repository integration tests using the RBAC schema; the current test profile disables Flyway and creates only JPA entities.
- Add endpoint-level RBAC/BOLA matrix tests for every resource controller.
- Address existing non-blocking warnings separately: JPA open-in-view, Mockito dynamic agent, and Lombok builder defaults.

## Final Assessment

The project remains runnable after the improvement. The architecture is cleaner: `JdbcTemplate` is still used where it is appropriate for RBAC SQL, but SQL is now behind repository boundaries and the policy layer is easier to test and maintain. No Git commit was created.
