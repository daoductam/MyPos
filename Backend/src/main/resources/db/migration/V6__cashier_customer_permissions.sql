-- Cashiers need customer lookup and creation for the POS customer workflow.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'ROLE_CASHIER'
  AND p.code IN ('customer.read', 'customer.write');

-- Invalidate cached authorization snapshots after changing role capabilities.
UPDATE users u
JOIN user_role_assignments a ON a.user_id = u.id AND a.active = TRUE
JOIN roles r ON r.id = a.role_id AND r.code = 'ROLE_CASHIER'
SET u.authorization_version = u.authorization_version + 1;
