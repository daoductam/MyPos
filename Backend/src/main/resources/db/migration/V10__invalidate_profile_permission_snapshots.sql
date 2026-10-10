-- Role permission changes must invalidate cached authorization snapshots.
UPDATE users u
JOIN user_role_assignments a ON a.user_id = u.id AND a.active = TRUE
JOIN roles r ON r.id = a.role_id AND r.code = 'ROLE_ADMIN'
SET u.authorization_version = u.authorization_version + 1
WHERE u.deleted = FALSE;
