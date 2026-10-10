INSERT INTO permissions (code, resource, action, scope_type, description, active)
VALUES
    ('platform.settings.read', 'platform', 'settings.read', 'PLATFORM', 'Read global platform settings', TRUE),
    ('platform.settings.update', 'platform', 'settings.update', 'PLATFORM', 'Update global platform settings', TRUE)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    active = VALUES(active);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('platform.settings.read', 'platform.settings.update')
WHERE r.code = 'ROLE_ADMIN';

UPDATE users u
JOIN user_role_assignments a ON a.user_id = u.id AND a.active = TRUE
JOIN roles r ON r.id = a.role_id AND r.code = 'ROLE_ADMIN'
SET u.authorization_version = u.authorization_version + 1
WHERE u.deleted = FALSE;
