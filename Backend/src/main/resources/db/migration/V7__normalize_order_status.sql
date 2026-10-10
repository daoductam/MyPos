UPDATE orders
SET status = 0
WHERE status IS NULL;
