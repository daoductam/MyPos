package com.tamdao.repository.authorization;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class JdbcAuthorizationScopeRepository implements AuthorizationScopeRepository {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public boolean storeExists(Long storeId) {
        Integer count = one("SELECT COUNT(*) FROM stores WHERE id = ? AND deleted = FALSE", Integer.class, storeId);
        return count != null && count > 0;
    }

    @Override
    public Long branchStoreId(Long branchId) {
        return one("SELECT store_id FROM branches WHERE id = ? AND deleted = FALSE", Long.class, branchId);
    }

    @Override
    public UserScope userScope(Long userId) {
        return query("""
                SELECT store_id, branch_id FROM users
                WHERE id = ? AND deleted = FALSE
                """, (rs, rowNum) -> new UserScope(
                rs.getObject("store_id", Long.class),
                rs.getObject("branch_id", Long.class)), userId);
    }

    @Override
    public Long userIdByEmail(String email) {
        return one("SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND deleted = FALSE",
                Long.class, email);
    }

    @Override
    public Long userStoreId(Long userId) {
        return one("SELECT store_id FROM users WHERE id = ? AND deleted = FALSE", Long.class, userId);
    }

    @Override
    public CustomerScope customerScope(Long customerId) {
        return query("""
                SELECT store_id, branch_id FROM customer
                WHERE id = ? AND deleted = FALSE
                """, (rs, rowNum) -> new CustomerScope(
                rs.getObject("store_id", Long.class),
                rs.getObject("branch_id", Long.class)), customerId);
    }

    @Override
    public Long productStoreId(Long productId) {
        return one("SELECT store_id FROM products WHERE id = ? AND deleted = FALSE", Long.class, productId);
    }

    @Override
    public Long categoryStoreId(Long categoryId) {
        return one("SELECT store_id FROM categories WHERE id = ? AND deleted = FALSE", Long.class, categoryId);
    }

    @Override
    public Long inventoryStoreId(Long inventoryId) {
        return one("""
                SELECT p.store_id
                FROM inventories i
                JOIN products p ON p.id = i.product_id
                WHERE i.id = ? AND i.deleted = FALSE AND p.deleted = FALSE
                """, Long.class, inventoryId);
    }

    @Override
    public Long orderStoreId(Long orderId) {
        return one("""
                SELECT b.store_id
                FROM orders o
                JOIN branches b ON b.id = o.branch_id
                WHERE o.id = ? AND o.deleted = FALSE AND b.deleted = FALSE
                """, Long.class, orderId);
    }

    @Override
    public Long orderBranchId(Long orderId) {
        return one("""
                SELECT o.branch_id
                FROM orders o
                JOIN branches b ON b.id = o.branch_id
                WHERE o.id = ? AND o.deleted = FALSE AND b.deleted = FALSE
                """, Long.class, orderId);
    }

    @Override
    public Long orderCashierId(Long orderId) {
        return one("SELECT cashier_id FROM orders WHERE id = ? AND deleted = FALSE", Long.class, orderId);
    }

    @Override
    public Long storeIdByAdminId(Long adminUserId) {
        return one("SELECT id FROM stores WHERE store_admin_id = ? AND deleted = FALSE", Long.class, adminUserId);
    }

    @Override
    public Long refundStoreId(Long refundId) {
        return one("""
                SELECT b.store_id
                FROM refund r
                JOIN branches b ON b.id = r.branch_id
                WHERE r.id = ? AND r.deleted = FALSE AND b.deleted = FALSE
                """, Long.class, refundId);
    }

    @Override
    public Long refundBranchId(Long refundId) {
        return one("""
                SELECT r.branch_id
                FROM refund r
                JOIN branches b ON b.id = r.branch_id
                WHERE r.id = ? AND r.deleted = FALSE AND b.deleted = FALSE
                """, Long.class, refundId);
    }

    @Override
    public Long refundCashierId(Long refundId) {
        return one("SELECT cashier_id FROM refund WHERE id = ? AND deleted = FALSE", Long.class, refundId);
    }

    @Override
    public Long shiftStoreId(Long shiftId) {
        return one("""
                SELECT b.store_id
                FROM shift_report s
                JOIN branches b ON b.id = s.branch_id
                WHERE s.id = ? AND s.deleted = FALSE AND b.deleted = FALSE
                """, Long.class, shiftId);
    }

    @Override
    public Long shiftBranchId(Long shiftId) {
        return one("""
                SELECT s.branch_id
                FROM shift_report s
                JOIN branches b ON b.id = s.branch_id
                WHERE s.id = ? AND s.deleted = FALSE AND b.deleted = FALSE
                """, Long.class, shiftId);
    }

    @Override
    public Long shiftCashierId(Long shiftId) {
        return one("SELECT cashier_id FROM shift_report WHERE id = ? AND deleted = FALSE", Long.class, shiftId);
    }

    @Override
    public Long customerStoreId(Long customerId) {
        return one("SELECT store_id FROM customer WHERE id = ? AND deleted = FALSE", Long.class, customerId);
    }

    @Override
    public Long customerBranchId(Long customerId) {
        return one("SELECT branch_id FROM customer WHERE id = ? AND deleted = FALSE", Long.class, customerId);
    }

    @Override
    public Long subscriptionStoreId(Long subscriptionId) {
        return one("SELECT store_id FROM subscriptions WHERE id = ? AND deleted = FALSE", Long.class, subscriptionId);
    }

    private <T> T one(String sql, Class<T> type, Object id) {
        if (id == null) {
            return null;
        }
        return queryForObject(sql, type, id);
    }

    private <T> T queryForObject(String sql, Class<T> type, Object... args) {
        try {
            return jdbcTemplate.queryForObject(sql, type, args);
        } catch (DataAccessException ex) {
            return null;
        }
    }

    private <T> T query(String sql, org.springframework.jdbc.core.RowMapper<T> mapper, Object... args) {
        try {
            return jdbcTemplate.queryForObject(sql, mapper, args);
        } catch (DataAccessException ex) {
            return null;
        }
    }
}
