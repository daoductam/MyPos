-- Bootstrap schema for a new local MySQL database.
-- Existing non-empty databases are baselined at version 0 and skip this migration.

CREATE TABLE IF NOT EXISTS branch_working_days (
    branch_id BIGINT NOT NULL COMMENT 'Branch owning the configured working day',
    working_days VARCHAR(255) COMMENT 'Working day value stored by the branch schedule collection'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Branch working day collection';

CREATE TABLE IF NOT EXISTS branches (
    close_time TIME(6) COMMENT 'Daily closing time of the branch',
    deleted BIT NOT NULL COMMENT 'Whether the branch has been soft deleted',
    open_time TIME(6) COMMENT 'Daily opening time of the branch',
    created_at DATETIME(6) COMMENT 'Timestamp when the branch was created',
    created_by BIGINT COMMENT 'User identifier that created the branch',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the branch was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the branch',
    id BIGINT NOT NULL COMMENT 'Internal branch identifier',
    manager_id BIGINT COMMENT 'User identifier of the branch manager',
    store_id BIGINT COMMENT 'Store owning the branch',
    updated_at DATETIME(6) COMMENT 'Timestamp when the branch was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the branch',
    address VARCHAR(255) COMMENT 'Branch physical address',
    email VARCHAR(255) COMMENT 'Branch contact email',
    name VARCHAR(255) COMMENT 'Branch display name',
    phone VARCHAR(255) COMMENT 'Branch contact phone number',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Retail branch';

CREATE TABLE IF NOT EXISTS branches_seq (
    next_val BIGINT COMMENT 'Next identifier value for branch sequence allocation'
) ENGINE = InnoDB COMMENT = 'Hibernate branch identifier sequence';
INSERT INTO branches_seq (next_val) VALUES (1);

CREATE TABLE IF NOT EXISTS categories (
    deleted BIT NOT NULL COMMENT 'Whether the category has been soft deleted',
    created_at DATETIME(6) COMMENT 'Timestamp when the category was created',
    created_by BIGINT COMMENT 'User identifier that created the category',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the category was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the category',
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal category identifier',
    store_id BIGINT COMMENT 'Store owning the category',
    updated_at DATETIME(6) COMMENT 'Timestamp when the category was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the category',
    name VARCHAR(255) COMMENT 'Category display name',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Product category';

CREATE TABLE IF NOT EXISTS customer (
    deleted BIT NOT NULL COMMENT 'Whether the customer has been soft deleted',
    loyalty_points INT COMMENT 'Customer loyalty point balance',
    created_at DATETIME(6) COMMENT 'Timestamp when the customer was created',
    created_by BIGINT COMMENT 'User identifier that created the customer',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the customer was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the customer',
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal customer identifier',
    updated_at DATETIME(6) COMMENT 'Timestamp when the customer was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the customer',
    email VARCHAR(255) COMMENT 'Customer email address',
    full_name VARCHAR(255) NOT NULL COMMENT 'Customer full name',
    phone VARCHAR(255) COMMENT 'Customer phone number',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Retail customer';

CREATE TABLE IF NOT EXISTS inventories (
    deleted BIT NOT NULL COMMENT 'Whether the inventory record has been soft deleted',
    quantity INT NOT NULL COMMENT 'Current quantity available at the branch',
    branch_id BIGINT NOT NULL COMMENT 'Branch holding the inventory',
    created_at DATETIME(6) COMMENT 'Timestamp when the inventory record was created',
    created_by BIGINT COMMENT 'User identifier that created the inventory record',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the inventory record was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the inventory record',
    id BIGINT NOT NULL COMMENT 'Internal inventory identifier',
    last_updated DATETIME(6) COMMENT 'Timestamp when the quantity was last adjusted',
    product_id BIGINT NOT NULL COMMENT 'Product represented by the inventory record',
    updated_at DATETIME(6) COMMENT 'Timestamp when the inventory record was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the inventory record',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Branch product inventory';

CREATE TABLE IF NOT EXISTS inventories_seq (
    next_val BIGINT COMMENT 'Next identifier value for inventory sequence allocation'
) ENGINE = InnoDB COMMENT = 'Hibernate inventory identifier sequence';
INSERT INTO inventories_seq (next_val) VALUES (1);

CREATE TABLE IF NOT EXISTS order_items (
    deleted BIT NOT NULL COMMENT 'Whether the order item has been soft deleted',
    price FLOAT(53) COMMENT 'Unit price captured at checkout',
    quantity INT COMMENT 'Quantity of the product in the order',
    created_at DATETIME(6) COMMENT 'Timestamp when the order item was created',
    created_by BIGINT COMMENT 'User identifier that created the order item',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the order item was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the order item',
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal order item identifier',
    order_id BIGINT COMMENT 'Order containing the item',
    product_id BIGINT COMMENT 'Product sold in the item',
    updated_at DATETIME(6) COMMENT 'Timestamp when the order item was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the order item',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Line item in a customer order';

CREATE TABLE IF NOT EXISTS orders (
    deleted BIT NOT NULL COMMENT 'Whether the order has been soft deleted',
    payment_type TINYINT COMMENT 'Payment type selected for the order',
    status TINYINT COMMENT 'Current order lifecycle status',
    total_amount FLOAT(53) COMMENT 'Total order amount',
    branch_id BIGINT COMMENT 'Branch where the order was created',
    cashier_id BIGINT COMMENT 'Cashier who processed the order',
    created_at DATETIME(6) COMMENT 'Timestamp when the order was created',
    created_by BIGINT COMMENT 'User identifier that created the order',
    customer_id BIGINT COMMENT 'Customer associated with the order',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the order was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the order',
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal order identifier',
    updated_at DATETIME(6) COMMENT 'Timestamp when the order was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the order',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Point of sale order';

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    deleted BIT NOT NULL COMMENT 'Whether the reset token has been soft deleted',
    created_at DATETIME(6) COMMENT 'Timestamp when the token was created',
    created_by BIGINT COMMENT 'User identifier that created the token',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the token was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the token',
    expiry_date DATETIME(6) NOT NULL COMMENT 'Time after which the token is invalid',
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal reset token identifier',
    updated_at DATETIME(6) COMMENT 'Timestamp when the token was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the token',
    user_id BIGINT NOT NULL COMMENT 'User requesting the password reset',
    token VARCHAR(255) NOT NULL COMMENT 'Password reset token value',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Password reset token';

CREATE UNIQUE INDEX uk_password_reset_tokens_token ON password_reset_tokens (token);

CREATE TABLE IF NOT EXISTS payment_order_seq (
    next_val BIGINT COMMENT 'Next identifier value for payment order sequence allocation'
) ENGINE = InnoDB COMMENT = 'Hibernate payment order identifier sequence';
INSERT INTO payment_order_seq (next_val) VALUES (1);

CREATE TABLE IF NOT EXISTS payment_order (
    amount FLOAT(53) COMMENT 'Payment amount requested',
    deleted BIT NOT NULL COMMENT 'Whether the payment order has been soft deleted',
    payment_method TINYINT COMMENT 'Payment method selected by the customer',
    status TINYINT COMMENT 'Current payment order status',
    created_at DATETIME(6) COMMENT 'Timestamp when the payment order was created',
    created_by BIGINT COMMENT 'User identifier that created the payment order',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the payment order was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the payment order',
    id BIGINT NOT NULL COMMENT 'Internal payment order identifier',
    plan_id BIGINT NOT NULL COMMENT 'Subscription plan being purchased',
    updated_at DATETIME(6) COMMENT 'Timestamp when the payment order was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the payment order',
    user_id BIGINT COMMENT 'User who owns the payment order',
    payment_link_id VARCHAR(255) COMMENT 'External payment provider link identifier',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Subscription payment order';

CREATE TABLE IF NOT EXISTS products (
    deleted BIT NOT NULL COMMENT 'Whether the product has been soft deleted',
    mrp FLOAT(53) NOT NULL COMMENT 'Maximum retail price of the product',
    selling_price FLOAT(53) NOT NULL COMMENT 'Current selling price of the product',
    category_id BIGINT COMMENT 'Category assigned to the product',
    created_at DATETIME(6) COMMENT 'Timestamp when the product was created',
    created_by BIGINT COMMENT 'User identifier that created the product',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the product was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the product',
    id BIGINT NOT NULL COMMENT 'Internal product identifier',
    store_id BIGINT NOT NULL COMMENT 'Store owning the product catalog record',
    updated_at DATETIME(6) COMMENT 'Timestamp when the product was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the product',
    brand VARCHAR(255) COMMENT 'Product brand name',
    description VARCHAR(255) COMMENT 'Product description',
    image TEXT COMMENT 'Product image URL or encoded image reference',
    name VARCHAR(255) NOT NULL COMMENT 'Product display name',
    sku VARCHAR(255) NOT NULL COMMENT 'Stock keeping unit code',
    PRIMARY KEY (id),
    CONSTRAINT uk_products_sku_deleted UNIQUE (sku, deleted)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Store product catalog item';

CREATE TABLE IF NOT EXISTS products_seq (
    next_val BIGINT COMMENT 'Next identifier value for product sequence allocation'
) ENGINE = InnoDB COMMENT = 'Hibernate product identifier sequence';
INSERT INTO products_seq (next_val) VALUES (1);

CREATE TABLE IF NOT EXISTS refund (
    amount FLOAT(53) COMMENT 'Refund amount',
    deleted BIT NOT NULL COMMENT 'Whether the refund has been soft deleted',
    payment_type TINYINT COMMENT 'Payment type used for the refund',
    branch_id BIGINT COMMENT 'Branch where the refund was processed',
    cashier_id BIGINT COMMENT 'Cashier who processed the refund',
    created_at DATETIME(6) COMMENT 'Timestamp when the refund was created',
    created_by BIGINT COMMENT 'User identifier that created the refund',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the refund was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the refund',
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal refund identifier',
    order_id BIGINT COMMENT 'Order being refunded',
    shift_report_id BIGINT COMMENT 'Shift report containing the refund',
    updated_at DATETIME(6) COMMENT 'Timestamp when the refund was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the refund',
    reason VARCHAR(255) COMMENT 'Reason supplied for the refund',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Order refund';

CREATE TABLE IF NOT EXISTS shift_report (
    deleted BIT NOT NULL COMMENT 'Whether the shift report has been soft deleted',
    net_sales FLOAT(53) COMMENT 'Net sales after refunds for the shift',
    total_orders INT NOT NULL COMMENT 'Number of orders in the shift',
    total_refunds FLOAT(53) COMMENT 'Total refunds in the shift',
    total_sales FLOAT(53) COMMENT 'Gross sales in the shift',
    branch_id BIGINT COMMENT 'Branch where the shift took place',
    cashier_id BIGINT COMMENT 'Cashier responsible for the shift',
    created_at DATETIME(6) COMMENT 'Timestamp when the shift report was created',
    created_by BIGINT COMMENT 'User identifier that created the shift report',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the shift report was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the shift report',
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal shift report identifier',
    shift_end DATETIME(6) COMMENT 'Time when the shift ended',
    shift_start DATETIME(6) COMMENT 'Time when the shift started',
    updated_at DATETIME(6) COMMENT 'Timestamp when the shift report was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the shift report',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Cashier shift report';

CREATE TABLE IF NOT EXISTS shift_report_recent_orders (
    recent_orders_id BIGINT NOT NULL COMMENT 'Order included in the recent-order collection',
    shift_report_id BIGINT NOT NULL COMMENT 'Shift report owning the recent-order collection',
    UNIQUE KEY uk_shift_report_recent_orders_order (recent_orders_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Shift report recent orders';

CREATE TABLE IF NOT EXISTS shift_report_top_selling_products (
    shift_report_id BIGINT NOT NULL COMMENT 'Shift report owning the top-product collection',
    top_selling_products_id BIGINT NOT NULL COMMENT 'Product included in the top-product collection',
    UNIQUE KEY uk_shift_report_top_selling_products_product (top_selling_products_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Shift report top selling products';

CREATE TABLE IF NOT EXISTS stores (
    deleted BIT NOT NULL COMMENT 'Whether the store has been soft deleted',
    status TINYINT COMMENT 'Current store lifecycle status',
    created_at DATETIME(6) COMMENT 'Timestamp when the store was created',
    created_by BIGINT COMMENT 'User identifier that created the store',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the store was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the store',
    id BIGINT NOT NULL COMMENT 'Internal store identifier',
    store_admin_id BIGINT COMMENT 'User who administers the store',
    updated_at DATETIME(6) COMMENT 'Timestamp when the store was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the store',
    address VARCHAR(255) COMMENT 'Store contact address',
    brand VARCHAR(255) NOT NULL COMMENT 'Store brand name',
    description VARCHAR(255) COMMENT 'Store description',
    email VARCHAR(255) COMMENT 'Store contact email',
    phone VARCHAR(255) COMMENT 'Store contact phone number',
    store_type VARCHAR(255) COMMENT 'Store business type',
    PRIMARY KEY (id),
    UNIQUE KEY uk_stores_store_admin (store_admin_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Retail store tenant';

CREATE TABLE IF NOT EXISTS stores_seq (
    next_val BIGINT COMMENT 'Next identifier value for store sequence allocation'
) ENGINE = InnoDB COMMENT = 'Hibernate store identifier sequence';
INSERT INTO stores_seq (next_val) VALUES (1);

CREATE TABLE IF NOT EXISTS subscription_plans (
    active BIT NOT NULL COMMENT 'Whether the subscription plan can be selected',
    billing_cycle TINYINT NOT NULL COMMENT 'Billing cycle for the plan',
    deleted BIT NOT NULL COMMENT 'Whether the plan has been soft deleted',
    enable_advanced_reports BIT COMMENT 'Whether advanced reports are enabled',
    enable_ecommerce BIT COMMENT 'Whether ecommerce integration is enabled',
    enable_integrations BIT COMMENT 'Whether external integrations are enabled',
    enable_inventory BIT COMMENT 'Whether inventory management is enabled',
    enable_invoice_branding BIT COMMENT 'Whether invoice branding is enabled',
    enable_multi_location BIT COMMENT 'Whether multiple locations are enabled',
    max_branches INT NOT NULL COMMENT 'Maximum number of branches allowed',
    max_products INT NOT NULL COMMENT 'Maximum number of products allowed',
    max_users INT NOT NULL COMMENT 'Maximum number of users allowed',
    price FLOAT(53) NOT NULL COMMENT 'Plan price for the billing cycle',
    priority_support BIT COMMENT 'Whether priority support is enabled',
    created_at DATETIME(6) COMMENT 'Timestamp when the plan was created',
    created_by BIGINT COMMENT 'User identifier that created the plan',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the plan was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the plan',
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal subscription plan identifier',
    updated_at DATETIME(6) COMMENT 'Timestamp when the plan was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the plan',
    description VARCHAR(255) NOT NULL COMMENT 'Plan description',
    name VARCHAR(255) NOT NULL COMMENT 'Plan display name',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'SaaS subscription plan';

CREATE TABLE IF NOT EXISTS subscription_plan_extra_features (
    subscription_plan_id BIGINT NOT NULL COMMENT 'Subscription plan owning the feature',
    extra_features VARCHAR(255) COMMENT 'Additional feature description for the plan'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Subscription plan feature collection';

CREATE TABLE IF NOT EXISTS subscriptions (
    deleted BIT NOT NULL COMMENT 'Whether the subscription has been soft deleted',
    end_date DATE NOT NULL COMMENT 'Subscription end date',
    payment_status TINYINT NOT NULL COMMENT 'Current subscription payment status',
    start_date DATE NOT NULL COMMENT 'Subscription start date',
    created_at DATETIME(6) COMMENT 'Timestamp when the subscription was created',
    created_by BIGINT COMMENT 'User identifier that created the subscription',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the subscription was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the subscription',
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal subscription identifier',
    plan_id BIGINT NOT NULL COMMENT 'Plan selected by the store',
    store_id BIGINT NOT NULL COMMENT 'Store owning the subscription',
    updated_at DATETIME(6) COMMENT 'Timestamp when the subscription was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the subscription',
    payment_gateway VARCHAR(255) COMMENT 'Payment gateway used for the subscription',
    transaction_id VARCHAR(255) COMMENT 'External payment transaction identifier',
    status ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL') COMMENT 'Current subscription lifecycle status',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Store subscription';

CREATE TABLE IF NOT EXISTS users (
    deleted BIT NOT NULL COMMENT 'Whether the user has been soft deleted',
    role TINYINT NOT NULL COMMENT 'Legacy user role value retained for compatibility',
    verified BIT NOT NULL COMMENT 'Whether the user account is verified',
    branch_id BIGINT COMMENT 'Branch assigned to the user',
    created_at DATETIME(6) COMMENT 'Timestamp when the user was created',
    created_by BIGINT COMMENT 'User identifier that created the account',
    deleted_at DATETIME(6) COMMENT 'Timestamp when the user was soft deleted',
    deleted_by BIGINT COMMENT 'User identifier that soft deleted the account',
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Internal user identifier',
    last_login DATETIME(6) COMMENT 'Timestamp of the user last successful login',
    store_id BIGINT COMMENT 'Store assigned to the user',
    updated_at DATETIME(6) COMMENT 'Timestamp when the user was last updated',
    updated_by BIGINT COMMENT 'User identifier that last updated the account',
    email VARCHAR(255) NOT NULL COMMENT 'User email address used for login',
    full_name VARCHAR(255) NOT NULL COMMENT 'User full name',
    password VARCHAR(255) COMMENT 'Password hash; never store a plaintext password',
    phone VARCHAR(255) COMMENT 'User phone number',
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email_deleted (email, deleted)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Application user account';

ALTER TABLE branches
    ADD CONSTRAINT fk_branches_manager FOREIGN KEY (manager_id) REFERENCES users (id),
    ADD CONSTRAINT fk_branches_store FOREIGN KEY (store_id) REFERENCES stores (id);

ALTER TABLE branch_working_days
    ADD CONSTRAINT fk_branch_working_days_branch FOREIGN KEY (branch_id) REFERENCES branches (id);

ALTER TABLE categories
    ADD CONSTRAINT fk_categories_store FOREIGN KEY (store_id) REFERENCES stores (id);

ALTER TABLE inventories
    ADD CONSTRAINT fk_inventories_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    ADD CONSTRAINT fk_inventories_product FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE order_items
    ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id),
    ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE orders
    ADD CONSTRAINT fk_orders_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    ADD CONSTRAINT fk_orders_cashier FOREIGN KEY (cashier_id) REFERENCES users (id),
    ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customer (id);

ALTER TABLE password_reset_tokens
    ADD CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE payment_order
    ADD CONSTRAINT fk_payment_order_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans (id),
    ADD CONSTRAINT fk_payment_order_user FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE products
    ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id),
    ADD CONSTRAINT fk_products_store FOREIGN KEY (store_id) REFERENCES stores (id);

ALTER TABLE refund
    ADD CONSTRAINT fk_refund_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    ADD CONSTRAINT fk_refund_cashier FOREIGN KEY (cashier_id) REFERENCES users (id),
    ADD CONSTRAINT fk_refund_order FOREIGN KEY (order_id) REFERENCES orders (id),
    ADD CONSTRAINT fk_refund_shift_report FOREIGN KEY (shift_report_id) REFERENCES shift_report (id);

ALTER TABLE shift_report
    ADD CONSTRAINT fk_shift_report_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    ADD CONSTRAINT fk_shift_report_cashier FOREIGN KEY (cashier_id) REFERENCES users (id);

ALTER TABLE shift_report_recent_orders
    ADD CONSTRAINT fk_shift_recent_orders_order FOREIGN KEY (recent_orders_id) REFERENCES orders (id),
    ADD CONSTRAINT fk_shift_recent_orders_report FOREIGN KEY (shift_report_id) REFERENCES shift_report (id);

ALTER TABLE shift_report_top_selling_products
    ADD CONSTRAINT fk_shift_top_products_product FOREIGN KEY (top_selling_products_id) REFERENCES products (id),
    ADD CONSTRAINT fk_shift_top_products_report FOREIGN KEY (shift_report_id) REFERENCES shift_report (id);

ALTER TABLE stores
    ADD CONSTRAINT fk_stores_admin FOREIGN KEY (store_admin_id) REFERENCES users (id);

ALTER TABLE subscription_plan_extra_features
    ADD CONSTRAINT fk_subscription_plan_features_plan FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans (id);

ALTER TABLE subscriptions
    ADD CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans (id),
    ADD CONSTRAINT fk_subscriptions_store FOREIGN KEY (store_id) REFERENCES stores (id);

ALTER TABLE users
    ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches (id),
    ADD CONSTRAINT fk_users_store FOREIGN KEY (store_id) REFERENCES stores (id);
