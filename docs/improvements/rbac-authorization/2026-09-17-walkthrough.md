# Improvement Walkthrough: RBAC Authorization Persistence

Started at:  2026/09/17 02:08:00
Finished at: 2026/09/17 02:23:00
Total time: 15 minutes
---

## Execution Summary

- **Scope:** [2026-09-17-scope.md](./2026-09-17-scope.md)
- **Analysis:** [2026-09-17-analysis.md](./2026-09-17-analysis.md)
- **Items approved:** 5
- **Items implemented:** 5
- **Items skipped:** 0
- **Git commit:** None; repository changes remain in the working tree as requested.

## Implementation Log

### Item 1: Extract authorization persistence behind repository ports

- **Category:** Refactoring
- **Status:** Completed
- **Files modified/created:**
  - `Backend/src/main/java/com/tamdao/repository/authorization/AuthorizationSnapshotRepository.java`
  - `Backend/src/main/java/com/tamdao/repository/authorization/JdbcAuthorizationSnapshotRepository.java`
  - `Backend/src/main/java/com/tamdao/repository/authorization/AuthorizationScopeRepository.java`
  - `Backend/src/main/java/com/tamdao/repository/authorization/JdbcAuthorizationScopeRepository.java`
  - `Backend/src/main/java/com/tamdao/repository/authorization/AuthorizationAssignmentRepository.java`
  - `Backend/src/main/java/com/tamdao/repository/authorization/JdbcAuthorizationAssignmentRepository.java`
  - `Backend/src/main/java/com/tamdao/repository/authorization/AuthorizationAuditRepository.java`
  - `Backend/src/main/java/com/tamdao/repository/authorization/JdbcAuthorizationAuditRepository.java`
  - `AuthorizationServiceImpl.java`, `AuthorizationAdminServiceImpl.java`, `AuthorizationGuard.java`, `ResourceScopeResolver.java`, `AuthorizationMutationServiceImpl.java`, `AuthorizationAuditServiceImpl.java`
- **Approach:** Kept `JdbcTemplate` for RBAC SQL but moved query strings and row mapping into JDBC repository adapters. Policy services and the guard now depend on repository interfaces.
- **Maps to success criteria:** 1, 2, 5

### Item 2: Serialize mutation audit metadata safely

- **Category:** Robustness
- **Status:** Completed
- **Files modified:** `Backend/src/main/java/com/tamdao/service/impl/AuthorizationMutationServiceImpl.java`
- **Approach:** Replaced hand-built JSON strings with `ObjectMapper` serialization so quotes, slashes, and other characters in a reason remain valid JSON.
- **Maps to success criteria:** 3, 4

### Item 3: Remove dynamic scope-column SQL from the guard

- **Category:** Security/Edge Cases
- **Status:** Completed
- **Files modified:** `Backend/src/main/java/com/tamdao/authorization/AuthorizationGuard.java`, `AuthorizationScopeRepository.java`, `JdbcAuthorizationScopeRepository.java`
- **Approach:** Added typed `userScope`, `userStoreId`, and resource scope methods. The guard no longer concatenates a column name into SQL and returns false on scope lookup failures.
- **Maps to success criteria:** 1, 3

### Item 4: Use generated keys for assignment and override inserts

- **Category:** Database
- **Status:** Completed
- **Files modified:** `JdbcAuthorizationAssignmentRepository.java`, `AuthorizationAdminServiceImpl.java`
- **Approach:** Insert methods use `GeneratedKeyHolder`, removing follow-up queries based on mutable business columns.
- **Maps to success criteria:** 2, 4

### Item 5: Add focused authorization tests

- **Category:** Test Coverage
- **Status:** Completed
- **Files created:**
  - `Backend/src/test/java/com/tamdao/authorization/AuthorizationGuardTest.java`
  - `Backend/src/test/java/com/tamdao/service/impl/AuthorizationMutationServiceImplTest.java`
- **Approach:** Covered missing resources, branch-to-store resolution, scope repository failure, self-scope denial, and audit JSON escaping. Existing Spring context regression test remains enabled.
- **Maps to success criteria:** 2, 3, 6

## Deviations from Backlog

| # | Item | Planned Approach | Actual Approach | Reason |
|---|---|---|---|---|
| 1 | Repository persistence | Split persistence by snapshot/scope/assignment/audit concerns. | Implemented four repository ports with JDBC adapters. | Preserves low-level SQL performance while improving layering without introducing JPA entities. |
| 2 | Integration tests | Add full repository/database tests. | Added unit tests plus the existing Spring context test. | Current test profile disables Flyway and creates only JPA entities, so a full RBAC schema fixture requires a separate MySQL/H2 migration test setup. |

## Known Limitations

- MySQL/Flyway repository integration has not been rehearsed against a real MySQL instance in this environment.
- Existing Lombok builder and Mockito agent warnings remain outside this improvement scope.
- Redis snapshot invalidation still uses the existing key-pattern behavior and was intentionally deferred.
