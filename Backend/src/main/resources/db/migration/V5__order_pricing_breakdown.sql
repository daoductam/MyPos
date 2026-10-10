ALTER TABLE orders
    ADD COLUMN tax_amount FLOAT(53) NULL COMMENT 'VAT amount charged for the order',
    ADD COLUMN discount_amount FLOAT(53) NULL COMMENT 'Discount amount applied to the order';
