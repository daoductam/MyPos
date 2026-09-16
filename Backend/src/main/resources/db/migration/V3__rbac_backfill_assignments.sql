-- RBAC v2 legacy backfill.
-- Legacy role values are read as text so this supports the current JPA ordinal mapping
-- as well as environments that already persisted enum names.

CREATE TEMPORARY TABLE rbac_legacy_user_mapping (
    user_id BIGINT NOT NULL,
    legacy_role VARCHAR(64) NULL,
    canonical_role VARCHAR(64) NULL,
    legacy_store_id BIGINT NULL,
    legacy_branch_id BIGINT NULL,
    scope_type VARCHAR(16) NULL,
    store_id BIGINT NULL,
    branch_id BIGINT NULL,
    scope_key VARCHAR(128) NULL,
    deleted BOOLEAN NOT NULL,
    created_at DATETIME(6) NULL,
    source_valid BOOLEAN NOT NULL DEFAULT FALSE,
    reason_code VARCHAR(80) NULL,
    PRIMARY KEY (user_id)
) ENGINE = InnoDB;

INSERT INTO rbac_legacy_user_mapping (
    user_id,
    legacy_role,
    canonical_role,
    legacy_store_id,
    legacy_branch_id,
    scope_type,
    store_id,
    branch_id,
    scope_key,
    deleted,
    created_at
)
SELECT
    u.id,
    CAST(u.role AS CHAR),
    CASE
        WHEN CAST(u.role AS CHAR) IN ('0', 'ROLE_ADMIN') THEN 'ROLE_ADMIN'
        WHEN CAST(u.role AS CHAR) IN ('1', 'ROLE_STORE_ADMIN') THEN 'ROLE_STORE_ADMIN'
        WHEN CAST(u.role AS CHAR) IN ('2', 'ROLE_STORE_MANAGER') THEN 'ROLE_STORE_MANAGER'
        WHEN CAST(u.role AS CHAR) IN ('3', 'ROLE_BRANCH_MANAGER') THEN 'ROLE_BRANCH_MANAGER'
        WHEN CAST(u.role AS CHAR) IN ('4', 'ROLE_BRANCH_ADMIN') THEN 'ROLE_BRANCH_MANAGER'
        WHEN CAST(u.role AS CHAR) IN ('5', '7', 'ROLE_BRANCH_CASHIER', 'ROLE_CASHIER') THEN 'ROLE_CASHIER'
        WHEN CAST(u.role AS CHAR) IN ('6', 'ROLE_CUSTOMER') THEN 'ROLE_CUSTOMER'
        ELSE NULL
    END,
    u.store_id,
    u.branch_id,
    CASE
        WHEN CAST(u.role AS CHAR) IN ('0', 'ROLE_ADMIN') THEN 'PLATFORM'
        WHEN CAST(u.role AS CHAR) IN ('1', 'ROLE_STORE_ADMIN', '2', 'ROLE_STORE_MANAGER') THEN 'STORE'
        WHEN CAST(u.role AS CHAR) IN ('3', 'ROLE_BRANCH_MANAGER', '4', 'ROLE_BRANCH_ADMIN', '5', '7', 'ROLE_BRANCH_CASHIER', 'ROLE_CASHIER') THEN 'BRANCH'
        WHEN CAST(u.role AS CHAR) IN ('6', 'ROLE_CUSTOMER') THEN 'SELF'
        ELSE NULL
    END,
    CASE
        WHEN CAST(u.role AS CHAR) IN ('1', 'ROLE_STORE_ADMIN', '2', 'ROLE_STORE_MANAGER', '3', 'ROLE_BRANCH_MANAGER', '4', 'ROLE_BRANCH_ADMIN', '5', '7', 'ROLE_BRANCH_CASHIER', 'ROLE_CASHIER') THEN u.store_id
        ELSE NULL
    END,
    CASE
        WHEN CAST(u.role AS CHAR) IN ('3', 'ROLE_BRANCH_MANAGER', '4', 'ROLE_BRANCH_ADMIN', '5', '7', 'ROLE_BRANCH_CASHIER', 'ROLE_CASHIER') THEN u.branch_id
        ELSE NULL
    END,
    CASE
        WHEN CAST(u.role AS CHAR) IN ('0', 'ROLE_ADMIN') THEN 'PLATFORM:*'
        WHEN CAST(u.role AS CHAR) IN ('6', 'ROLE_CUSTOMER') THEN CONCAT('SELF:', u.id)
        WHEN CAST(u.role AS CHAR) IN ('1', 'ROLE_STORE_ADMIN', '2', 'ROLE_STORE_MANAGER') THEN CONCAT('STORE:', u.store_id)
        WHEN CAST(u.role AS CHAR) IN ('3', 'ROLE_BRANCH_MANAGER', '4', 'ROLE_BRANCH_ADMIN', '5', '7', 'ROLE_BRANCH_CASHIER', 'ROLE_CASHIER') THEN CONCAT('BRANCH:', u.branch_id)
        ELSE NULL
    END,
    COALESCE(u.deleted, FALSE),
    u.created_at
FROM users u;

UPDATE rbac_legacy_user_mapping m
LEFT JOIN stores s
    ON s.id = m.legacy_store_id
   AND s.deleted = FALSE
LEFT JOIN branches b
    ON b.id = m.legacy_branch_id
   AND b.deleted = FALSE
SET
    m.source_valid = CASE
        WHEN m.canonical_role IS NULL THEN FALSE
        WHEN m.scope_type = 'PLATFORM'
            THEN m.legacy_store_id IS NULL AND m.legacy_branch_id IS NULL
        WHEN m.scope_type = 'SELF'
            THEN m.legacy_store_id IS NULL AND m.legacy_branch_id IS NULL
        WHEN m.scope_type = 'STORE'
            THEN m.legacy_store_id IS NOT NULL
             AND m.legacy_branch_id IS NULL
             AND s.id IS NOT NULL
        WHEN m.scope_type = 'BRANCH'
            THEN m.legacy_store_id IS NOT NULL
             AND m.legacy_branch_id IS NOT NULL
             AND s.id IS NOT NULL
             AND b.id IS NOT NULL
             AND b.store_id = m.legacy_store_id
        ELSE FALSE
    END,
    m.reason_code = CASE
        WHEN m.canonical_role IS NULL THEN 'UNKNOWN_LEGACY_ROLE'
        WHEN m.scope_type IN ('PLATFORM', 'SELF')
             AND (m.legacy_store_id IS NOT NULL OR m.legacy_branch_id IS NOT NULL)
            THEN 'UNEXPECTED_TENANT_SCOPE'
        WHEN m.scope_type = 'STORE' AND m.legacy_store_id IS NULL
            THEN 'MISSING_STORE_SCOPE'
        WHEN m.scope_type = 'STORE' AND m.legacy_branch_id IS NOT NULL
            THEN 'UNEXPECTED_BRANCH_SCOPE'
        WHEN m.scope_type = 'BRANCH'
             AND (m.legacy_store_id IS NULL OR m.legacy_branch_id IS NULL)
            THEN 'MISSING_BRANCH_SCOPE'
        WHEN m.scope_type IN ('STORE', 'BRANCH')
             AND (s.id IS NULL OR (m.scope_type = 'BRANCH' AND (b.id IS NULL OR b.store_id <> m.legacy_store_id)))
            THEN 'INVALID_SCOPE_REFERENCE'
        ELSE NULL
    END;

INSERT INTO authorization_migration_quarantine (
    source_table,
    source_id,
    legacy_role,
    reason_code,
    details_json
)
SELECT
    'users',
    m.user_id,
    m.legacy_role,
    m.reason_code,
    JSON_OBJECT(
        'canonicalRole', m.canonical_role,
        'storeId', m.legacy_store_id,
        'branchId', m.legacy_branch_id
    )
FROM rbac_legacy_user_mapping m
WHERE m.source_valid = FALSE
  AND NOT EXISTS (
      SELECT 1
      FROM authorization_migration_quarantine q
      WHERE q.source_table = 'users'
        AND q.source_id = m.user_id
        AND q.reason_code = m.reason_code
        AND q.resolved_at IS NULL
  );

INSERT IGNORE INTO user_role_assignments (
    user_id,
    role_id,
    scope_type,
    store_id,
    branch_id,
    scope_key,
    active_scope_key,
    active,
    starts_at,
    ends_at,
    assigned_by,
    reason,
    version
)
SELECT
    m.user_id,
    r.id,
    m.scope_type,
    m.store_id,
    m.branch_id,
    m.scope_key,
    CASE WHEN m.deleted = FALSE THEN m.scope_key ELSE NULL END,
    CASE WHEN m.deleted = FALSE THEN TRUE ELSE FALSE END,
    COALESCE(m.created_at, CURRENT_TIMESTAMP(6)),
    NULL,
    NULL,
    'V3_LEGACY_ROLE_BACKFILL',
    0
FROM rbac_legacy_user_mapping m
JOIN roles r ON r.code = m.canonical_role AND r.active = TRUE
WHERE m.source_valid = TRUE;

INSERT INTO authorization_migration_quarantine (
    source_table,
    source_id,
    legacy_role,
    reason_code,
    details_json
)
SELECT
    'users',
    m.user_id,
    m.legacy_role,
    'MISSING_MIGRATION_ACTOR',
    JSON_OBJECT('canonicalRole', m.canonical_role, 'scopeType', m.scope_type, 'scopeId', m.branch_id)
FROM rbac_legacy_user_mapping m
WHERE m.source_valid = TRUE
  AND m.legacy_role IN ('4', 'ROLE_BRANCH_ADMIN')
  AND NOT EXISTS (
      SELECT 1
      FROM users platform_admin
      WHERE CAST(platform_admin.role AS CHAR) IN ('0', 'ROLE_ADMIN')
        AND platform_admin.deleted = FALSE
  )
  AND NOT EXISTS (
      SELECT 1
      FROM authorization_migration_quarantine q
      WHERE q.source_table = 'users'
        AND q.source_id = m.user_id
        AND q.reason_code = 'MISSING_MIGRATION_ACTOR'
        AND q.resolved_at IS NULL
  );

INSERT IGNORE INTO user_permission_overrides (
    user_id,
    assignment_id,
    permission_id,
    effect,
    scope_type,
    store_id,
    branch_id,
    scope_key,
    active,
    expires_at,
    assigned_by,
    reason
)
SELECT
    m.user_id,
    ura.id,
    p.id,
    'GRANT',
    'BRANCH',
    m.store_id,
    m.branch_id,
    m.scope_key,
    TRUE,
    DATE_ADD(CURRENT_TIMESTAMP(6), INTERVAL 90 DAY),
    migration_actor.id,
    'V3_LEGACY_BRANCH_ADMIN_COMPATIBILITY'
FROM rbac_legacy_user_mapping m
JOIN user_role_assignments ura
    ON ura.user_id = m.user_id
   AND ura.scope_key = m.scope_key
   AND ura.active = TRUE
JOIN permissions p
    ON p.code IN ('employee.delete', 'refund.delete', 'shift.delete')
   AND p.active = TRUE
JOIN users migration_actor
    ON migration_actor.id = (
        SELECT MIN(platform_admin.id)
        FROM users platform_admin
        WHERE CAST(platform_admin.role AS CHAR) IN ('0', 'ROLE_ADMIN')
          AND platform_admin.deleted = FALSE
    )
WHERE m.source_valid = TRUE
  AND m.legacy_role IN ('4', 'ROLE_BRANCH_ADMIN')
  AND m.deleted = FALSE
  AND NOT EXISTS (
      SELECT 1
      FROM user_permission_overrides existing_override
      WHERE existing_override.user_id = m.user_id
        AND existing_override.assignment_id = ura.id
        AND existing_override.permission_id = p.id
        AND existing_override.effect = 'GRANT'
        AND existing_override.scope_key = m.scope_key
        AND existing_override.active = TRUE
  );

DROP TEMPORARY TABLE rbac_legacy_user_mapping;
