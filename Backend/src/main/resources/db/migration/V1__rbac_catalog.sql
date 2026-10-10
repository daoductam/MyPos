-- RBAC v2 additive schema.
-- This migration intentionally keeps users.role, users.store_id, and users.branch_id.

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal role identifier',
    code VARCHAR(64) NOT NULL COMMENT 'Stable canonical role code',
    display_name VARCHAR(120) NOT NULL COMMENT 'Human-readable role name',
    description VARCHAR(500) NULL COMMENT 'Administrative role description',
    is_system BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether the role is managed by the platform',
    active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether the role can be assigned',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Creation timestamp in UTC',
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Last update timestamp in UTC',
    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uk_roles_code UNIQUE (code)
) ENGINE = InnoDB COMMENT = 'Canonical RBAC role catalog';

CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal permission identifier',
    code VARCHAR(120) NOT NULL COMMENT 'Stable permission code such as order.read',
    resource VARCHAR(64) NOT NULL COMMENT 'Permission resource domain',
    action VARCHAR(64) NOT NULL COMMENT 'Permission action',
    scope_type VARCHAR(16) NOT NULL COMMENT 'Maximum catalog scope: PLATFORM, STORE, BRANCH, or SELF',
    description VARCHAR(500) NULL COMMENT 'Human-readable permission description',
    active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether the permission can be evaluated',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Creation timestamp in UTC',
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Last update timestamp in UTC',
    CONSTRAINT pk_permissions PRIMARY KEY (id),
    CONSTRAINT uk_permissions_code UNIQUE (code),
    CONSTRAINT chk_permissions_scope CHECK (scope_type IN ('PLATFORM', 'STORE', 'BRANCH', 'SELF'))
) ENGINE = InnoDB COMMENT = 'Canonical RBAC permission catalog';

CREATE INDEX idx_permissions_resource_scope
    ON permissions (resource, scope_type, active);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL COMMENT 'Role bundle identifier',
    permission_id BIGINT NOT NULL COMMENT 'Permission catalog identifier',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Mapping creation timestamp in UTC',
    CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE RESTRICT
) ENGINE = InnoDB COMMENT = 'Role to permission bundle mappings';

CREATE INDEX idx_role_permissions_permission
    ON role_permissions (permission_id, role_id);

CREATE TABLE IF NOT EXISTS user_role_assignments (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Role assignment identifier',
    user_id BIGINT NOT NULL COMMENT 'Subject user identifier',
    role_id BIGINT NOT NULL COMMENT 'Assigned role identifier',
    scope_type VARCHAR(16) NOT NULL COMMENT 'Assignment scope: PLATFORM, STORE, BRANCH, or SELF',
    store_id BIGINT NULL COMMENT 'Store scope identifier when applicable',
    branch_id BIGINT NULL COMMENT 'Branch scope identifier when applicable',
    scope_key VARCHAR(128) NOT NULL COMMENT 'Canonical scope key such as BRANCH:52',
    active_scope_key VARCHAR(128) NULL COMMENT 'Scope key while active; null after revoke for reassignment history',
    active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether the assignment is currently active',
    starts_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Assignment effective start in UTC',
    ends_at DATETIME(6) NULL COMMENT 'Optional assignment expiry in UTC',
    assigned_by BIGINT NULL COMMENT 'User that created the assignment',
    reason VARCHAR(500) NOT NULL COMMENT 'Business reason for the assignment',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Creation timestamp in UTC',
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Last update timestamp in UTC',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'Optimistic locking version',
    CONSTRAINT pk_user_role_assignments PRIMARY KEY (id),
    CONSTRAINT fk_ura_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_ura_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT,
    CONSTRAINT fk_ura_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE RESTRICT,
    CONSTRAINT fk_ura_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE RESTRICT,
    CONSTRAINT fk_ura_assigned_by FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_ura_scope CHECK (
        (scope_type IN ('PLATFORM', 'SELF') AND store_id IS NULL AND branch_id IS NULL)
        OR (scope_type = 'STORE' AND store_id IS NOT NULL AND branch_id IS NULL)
        OR (scope_type = 'BRANCH' AND store_id IS NOT NULL AND branch_id IS NOT NULL)
    ),
    CONSTRAINT chk_ura_active_scope_key CHECK (
        (active = TRUE AND active_scope_key IS NOT NULL)
        OR (active = FALSE AND active_scope_key IS NULL)
    ),
    CONSTRAINT chk_ura_dates CHECK (ends_at IS NULL OR ends_at > starts_at)
) ENGINE = InnoDB COMMENT = 'Normalized user role assignments with explicit scope';

CREATE UNIQUE INDEX uk_ura_active_scope
    ON user_role_assignments (user_id, role_id, active_scope_key);

CREATE INDEX idx_ura_user_active
    ON user_role_assignments (user_id, active, starts_at, ends_at);

CREATE INDEX idx_ura_scope_active
    ON user_role_assignments (scope_type, store_id, branch_id, active);

CREATE TABLE IF NOT EXISTS user_permission_overrides (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Permission override identifier',
    user_id BIGINT NOT NULL COMMENT 'Subject user identifier',
    assignment_id BIGINT NULL COMMENT 'Optional assignment this override belongs to',
    permission_id BIGINT NOT NULL COMMENT 'Permission catalog identifier',
    effect VARCHAR(8) NOT NULL COMMENT 'Override effect: GRANT or DENY',
    scope_type VARCHAR(16) NOT NULL COMMENT 'Override scope: PLATFORM, STORE, BRANCH, or SELF',
    store_id BIGINT NULL COMMENT 'Store scope identifier when applicable',
    branch_id BIGINT NULL COMMENT 'Branch scope identifier when applicable',
    scope_key VARCHAR(128) NOT NULL COMMENT 'Canonical override scope key',
    active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether the override is active',
    expires_at DATETIME(6) NULL COMMENT 'Optional override expiry in UTC',
    assigned_by BIGINT NOT NULL COMMENT 'User that created the override',
    reason VARCHAR(500) NOT NULL COMMENT 'Mandatory override justification',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Creation timestamp in UTC',
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Last update timestamp in UTC',
    CONSTRAINT pk_user_permission_overrides PRIMARY KEY (id),
    CONSTRAINT fk_upo_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_upo_assignment FOREIGN KEY (assignment_id) REFERENCES user_role_assignments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_upo_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE RESTRICT,
    CONSTRAINT fk_upo_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE RESTRICT,
    CONSTRAINT fk_upo_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE RESTRICT,
    CONSTRAINT fk_upo_assigned_by FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_upo_effect CHECK (effect IN ('GRANT', 'DENY')),
    CONSTRAINT chk_upo_scope CHECK (
        (scope_type IN ('PLATFORM', 'SELF') AND store_id IS NULL AND branch_id IS NULL)
        OR (scope_type = 'STORE' AND store_id IS NOT NULL AND branch_id IS NULL)
        OR (scope_type = 'BRANCH' AND store_id IS NOT NULL AND branch_id IS NOT NULL)
    )
) ENGINE = InnoDB COMMENT = 'Bounded per-user or assignment permission overrides';

CREATE INDEX idx_upo_user_active_expiry
    ON user_permission_overrides (user_id, active, expires_at);

CREATE INDEX idx_upo_assignment_active
    ON user_permission_overrides (assignment_id, active, expires_at);

CREATE INDEX idx_upo_scope_active
    ON user_permission_overrides (scope_type, store_id, branch_id, active);

CREATE TABLE IF NOT EXISTS authorization_audit_events (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Authorization audit event identifier',
    actor_user_id BIGINT NULL COMMENT 'Authenticated actor; null for anonymous failures',
    action VARCHAR(120) NOT NULL COMMENT 'Audited action such as authorization.denied',
    permission_code VARCHAR(120) NULL COMMENT 'Permission evaluated for the action',
    resource_type VARCHAR(80) NULL COMMENT 'Resource domain or type',
    resource_id VARCHAR(128) NULL COMMENT 'Resource identifier without sensitive payload',
    scope_type VARCHAR(16) NULL COMMENT 'Evaluated scope type',
    scope_id BIGINT NULL COMMENT 'Store or branch scope identifier',
    decision VARCHAR(16) NOT NULL COMMENT 'ALLOW, DENY, or MUTATION',
    reason_code VARCHAR(80) NOT NULL COMMENT 'Stable machine-readable reason',
    request_id VARCHAR(128) NOT NULL COMMENT 'HTTP/request correlation identifier',
    metadata_json JSON NULL COMMENT 'Sanitized structured metadata without secrets or unnecessary PII',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Event timestamp in UTC',
    CONSTRAINT pk_authorization_audit_events PRIMARY KEY (id),
    CONSTRAINT fk_aae_actor FOREIGN KEY (actor_user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_aae_decision CHECK (decision IN ('ALLOW', 'DENY', 'MUTATION'))
) ENGINE = InnoDB COMMENT = 'Immutable RBAC authorization audit events';

CREATE INDEX idx_aae_created_at
    ON authorization_audit_events (created_at);

CREATE INDEX idx_aae_actor_created_at
    ON authorization_audit_events (actor_user_id, created_at);

CREATE INDEX idx_aae_decision_created_at
    ON authorization_audit_events (decision, created_at);

CREATE TABLE IF NOT EXISTS authorization_migration_quarantine (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Quarantined legacy authorization row identifier',
    source_table VARCHAR(64) NOT NULL COMMENT 'Legacy source table name',
    source_id BIGINT NOT NULL COMMENT 'Legacy source row identifier',
    legacy_role VARCHAR(64) NULL COMMENT 'Legacy role value when available',
    reason_code VARCHAR(80) NOT NULL COMMENT 'Stable reason for quarantine',
    details_json JSON NULL COMMENT 'Sanitized migration details without secrets',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Quarantine timestamp in UTC',
    resolved_at DATETIME(6) NULL COMMENT 'Resolution timestamp in UTC',
    CONSTRAINT pk_authorization_migration_quarantine PRIMARY KEY (id)
) ENGINE = InnoDB COMMENT = 'Invalid legacy authorization rows held for manual remediation';

CREATE INDEX idx_amq_source
    ON authorization_migration_quarantine (source_table, source_id);

CREATE INDEX idx_amq_unresolved
    ON authorization_migration_quarantine (resolved_at, created_at);

ALTER TABLE users
    ADD COLUMN authorization_version BIGINT NOT NULL DEFAULT 1
        COMMENT 'Incremented whenever effective role assignments or permission overrides change';
