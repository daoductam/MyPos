-- Platform administrators must be able to manage their own profile and password.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'ROLE_ADMIN'
  AND p.code IN ('profile.read_own', 'profile.update_own');
