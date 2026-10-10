-- RBAC v2 catalog seed.
-- The canonical catalog is intentionally independent from the legacy users.role column.

INSERT INTO roles (code, display_name, description, is_system, active)
VALUES
    ('ROLE_ADMIN', 'Platform Administrator', 'Platform governance and SaaS administration', TRUE, TRUE),
    ('ROLE_STORE_ADMIN', 'Store Administrator', 'Full operational control for an assigned store', TRUE, TRUE),
    ('ROLE_STORE_MANAGER', 'Store Manager', 'Day-to-day store operations and reporting', TRUE, TRUE),
    ('ROLE_BRANCH_MANAGER', 'Branch Manager', 'Branch operations, staff, sales, and reporting', TRUE, TRUE),
    ('ROLE_CASHIER', 'Cashier', 'Current-branch checkout and own work history', TRUE, TRUE),
    ('ROLE_CUSTOMER', 'Customer', 'Own profile and own order history', TRUE, TRUE)
ON DUPLICATE KEY UPDATE
    display_name = VALUES(display_name),
    description = VALUES(description),
    is_system = VALUES(is_system),
    active = VALUES(active);

INSERT INTO permissions (code, resource, action, scope_type, description, active)
VALUES
    ('platform.dashboard.read', 'platform', 'dashboard.read', 'PLATFORM', 'Read platform dashboard and growth statistics', TRUE),
    ('platform.store.read', 'platform', 'store.read', 'PLATFORM', 'Read stores across the platform', TRUE),
    ('platform.store.moderate', 'platform', 'store.moderate', 'PLATFORM', 'Moderate store lifecycle and platform compliance', TRUE),
    ('platform.subscription_plan.manage', 'platform', 'subscription_plan.manage', 'PLATFORM', 'Manage subscription plan catalog', TRUE),
    ('platform.subscription.read', 'platform', 'subscription.read', 'PLATFORM', 'Read platform subscription information', TRUE),
    ('platform.audit.read', 'platform', 'audit.read', 'PLATFORM', 'Read platform audit information', TRUE),
    ('platform.rbac.manage', 'platform', 'rbac.manage', 'PLATFORM', 'Manage platform role assignments and overrides', TRUE),
    ('store.read', 'store', 'read', 'STORE', 'Read an allowed store', TRUE),
    ('store.update', 'store', 'update', 'STORE', 'Update an allowed store', TRUE),
    ('store.delete', 'store', 'delete', 'STORE', 'Deactivate an allowed store', TRUE),
    ('branch.read', 'branch', 'read', 'STORE', 'Read branches in an allowed store or branch scope', TRUE),
    ('branch.create', 'branch', 'create', 'STORE', 'Create a branch in an allowed store', TRUE),
    ('branch.update', 'branch', 'update', 'STORE', 'Update a branch in an allowed store', TRUE),
    ('branch.delete', 'branch', 'delete', 'STORE', 'Deactivate a branch in an allowed store', TRUE),
    ('branch.restore', 'branch', 'restore', 'STORE', 'Restore a branch in an allowed store', TRUE),
    ('employee.read', 'employee', 'read', 'STORE', 'Read employees in an allowed store or branch scope', TRUE),
    ('employee.create', 'employee', 'create', 'STORE', 'Create an employee in an allowed operating scope', TRUE),
    ('employee.update', 'employee', 'update', 'STORE', 'Update an employee in an allowed operating scope', TRUE),
    ('employee.delete', 'employee', 'delete', 'STORE', 'Deactivate an employee in an allowed operating scope', TRUE),
    ('employee.restore', 'employee', 'restore', 'STORE', 'Restore an employee in an allowed store', TRUE),
    ('store.rbac.manage', 'store', 'rbac.manage', 'STORE', 'Manage store role assignments and overrides', TRUE),
    ('category.read', 'category', 'read', 'STORE', 'Read categories in an allowed store', TRUE),
    ('category.write', 'category', 'write', 'STORE', 'Create or update categories in an allowed store', TRUE),
    ('category.delete', 'category', 'delete', 'STORE', 'Delete categories in an allowed store', TRUE),
    ('product.read', 'product', 'read', 'STORE', 'Read products in an allowed store or branch scope', TRUE),
    ('product.write', 'product', 'write', 'STORE', 'Create or update products in an allowed store', TRUE),
    ('product.delete', 'product', 'delete', 'STORE', 'Delete products in an allowed store', TRUE),
    ('product.restore', 'product', 'restore', 'STORE', 'Restore products in an allowed store', TRUE),
    ('inventory.read', 'inventory', 'read', 'STORE', 'Read inventory in an allowed store or branch scope', TRUE),
    ('inventory.write', 'inventory', 'write', 'STORE', 'Create or adjust inventory in an allowed store', TRUE),
    ('inventory.delete', 'inventory', 'delete', 'STORE', 'Delete inventory in an allowed store', TRUE),
    ('order.create', 'order', 'create', 'BRANCH', 'Create an order for the current branch', TRUE),
    ('order.read', 'order', 'read', 'STORE', 'Read orders in an allowed store or branch scope', TRUE),
    ('order.read_own', 'order', 'read_own', 'SELF', 'Read orders created by or owned by the actor', TRUE),
    ('order.delete', 'order', 'delete', 'STORE', 'Delete or cancel an order under store policy', TRUE),
    ('refund.create', 'refund', 'create', 'BRANCH', 'Create a refund in the current branch', TRUE),
    ('refund.read', 'refund', 'read', 'STORE', 'Read refunds in an allowed store or branch scope', TRUE),
    ('refund.read_own', 'refund', 'read_own', 'SELF', 'Read refunds created by or owned by the actor', TRUE),
    ('refund.delete', 'refund', 'delete', 'STORE', 'Delete a refund under store policy', TRUE),
    ('shift.start', 'shift', 'start', 'BRANCH', 'Start a shift in the current branch', TRUE),
    ('shift.end', 'shift', 'end', 'SELF', 'End the current actor shift', TRUE),
    ('shift.read', 'shift', 'read', 'STORE', 'Read shifts in an allowed store or branch scope', TRUE),
    ('shift.read_own', 'shift', 'read_own', 'SELF', 'Read the current actor own shifts', TRUE),
    ('shift.delete', 'shift', 'delete', 'STORE', 'Delete a shift report under store policy', TRUE),
    ('analytics.read', 'analytics', 'read', 'PLATFORM', 'Read analytics inside the resolved scope', TRUE),
    ('payment.manage', 'payment', 'manage', 'STORE', 'Manage store payment actions', TRUE),
    ('subscription.read', 'subscription', 'read', 'PLATFORM', 'Read subscriptions in an allowed store or platform scope', TRUE),
    ('subscription.manage', 'subscription', 'manage', 'STORE', 'Manage the actor store subscription', TRUE),
    ('customer.read', 'customer', 'read', 'STORE', 'Read customers in an allowed operating scope', TRUE),
    ('customer.write', 'customer', 'write', 'STORE', 'Create or update customers in an allowed operating scope', TRUE),
    ('customer.delete', 'customer', 'delete', 'STORE', 'Deactivate customers in an allowed operating scope', TRUE),
    ('customer.restore', 'customer', 'restore', 'STORE', 'Restore customers in an allowed operating scope', TRUE),
    ('profile.read_own', 'profile', 'read_own', 'SELF', 'Read the authenticated user profile', TRUE),
    ('profile.update_own', 'profile', 'update_own', 'SELF', 'Update permitted fields on the authenticated profile', TRUE)
ON DUPLICATE KEY UPDATE
    resource = VALUES(resource),
    action = VALUES(action),
    scope_type = VALUES(scope_type),
    description = VALUES(description),
    active = VALUES(active);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'ROLE_ADMIN'
  AND p.code IN (
      'platform.dashboard.read', 'platform.store.read', 'platform.store.moderate',
      'platform.subscription_plan.manage', 'platform.subscription.read', 'platform.audit.read',
      'platform.rbac.manage'
  );

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'ROLE_STORE_ADMIN'
  AND p.code IN (
      'store.read', 'store.update', 'store.delete', 'branch.read', 'branch.create', 'branch.update',
      'branch.delete', 'branch.restore', 'employee.read', 'employee.create', 'employee.update',
      'employee.delete', 'employee.restore', 'store.rbac.manage', 'category.read', 'category.write',
      'category.delete', 'product.read', 'product.write', 'product.delete', 'product.restore',
      'inventory.read', 'inventory.write', 'inventory.delete', 'order.read', 'order.delete',
      'refund.read', 'refund.delete', 'shift.read', 'shift.delete', 'analytics.read', 'payment.manage',
      'subscription.read', 'subscription.manage', 'customer.read', 'customer.write', 'customer.delete',
      'customer.restore', 'profile.read_own', 'profile.update_own'
  );

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'ROLE_STORE_MANAGER'
  AND p.code IN (
      'store.read', 'branch.read', 'employee.read', 'employee.create', 'employee.update',
      'category.read', 'category.write', 'category.delete', 'product.read', 'product.write',
      'product.delete', 'product.restore', 'inventory.read', 'inventory.write', 'inventory.delete',
      'order.read', 'order.delete', 'refund.read', 'shift.read', 'analytics.read', 'customer.read',
      'customer.write', 'profile.read_own', 'profile.update_own'
  );

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'ROLE_BRANCH_MANAGER'
  AND p.code IN (
      'branch.read', 'employee.read', 'employee.create', 'employee.update', 'order.read', 'refund.read',
      'shift.read', 'analytics.read', 'product.read', 'inventory.read', 'customer.read', 'customer.write',
      'profile.read_own', 'profile.update_own'
  );

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'ROLE_CASHIER'
  AND p.code IN (
      'branch.read', 'employee.read', 'product.read', 'inventory.read', 'order.create', 'order.read_own',
      'order.read', 'refund.create', 'refund.read_own', 'shift.start', 'shift.end', 'shift.read_own',
      'profile.read_own', 'profile.update_own'
  );

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'ROLE_CUSTOMER'
  AND p.code IN ('profile.read_own', 'profile.update_own', 'order.read_own');
