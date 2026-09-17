-- Attach customer records to an operating tenant so customer APIs can enforce
-- store/branch scope instead of returning a global customer list.
ALTER TABLE customer
    ADD COLUMN store_id BIGINT NULL,
    ADD COLUMN branch_id BIGINT NULL;

CREATE INDEX idx_customer_store_scope ON customer (store_id, deleted);
CREATE INDEX idx_customer_branch_scope ON customer (branch_id, deleted);

ALTER TABLE customer
    ADD CONSTRAINT fk_customer_store_scope
        FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_customer_branch_scope
        FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE RESTRICT;

-- Backfill only unambiguous legacy customers. Customers with no order history
-- or cross-tenant history stay NULL and remain fail-closed until remediated.
UPDATE customer c
JOIN (
    SELECT o.customer_id,
           MIN(b.store_id) AS store_id,
           CASE WHEN COUNT(DISTINCT b.id) = 1 THEN MIN(b.id) ELSE NULL END AS branch_id
    FROM orders o
    JOIN branches b ON b.id = o.branch_id
    WHERE o.customer_id IS NOT NULL
      AND o.deleted = FALSE
      AND b.deleted = FALSE
    GROUP BY o.customer_id
    HAVING COUNT(DISTINCT b.store_id) = 1
) scoped ON scoped.customer_id = c.id
SET c.store_id = scoped.store_id,
    c.branch_id = scoped.branch_id
WHERE c.store_id IS NULL AND c.branch_id IS NULL;
