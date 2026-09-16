package com.tamdao.repository.authorization;

import com.tamdao.authorization.AuthorizationAssignmentView;
import com.tamdao.authorization.AuthorizationOverrideView;
import com.tamdao.authorization.ScopeType;
import com.tamdao.payload.request.AuthorizationScopeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class JdbcAuthorizationAssignmentRepository implements AuthorizationAssignmentRepository {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public List<AuthorizationAssignmentView> findAssignments(Long userId, Long storeId,
                                                              Long actorStoreId, boolean platform) {
        String visibility = platform ? "" : " AND (a.store_id = ? OR b.store_id = ?)";
        String optionalStore = " AND (? IS NULL OR a.store_id = ? OR b.store_id = ? )";
        String sql = """
                SELECT a.id, a.user_id, r.code AS role_code, a.scope_type, a.store_id, a.branch_id,
                       a.scope_key, a.active, a.starts_at, a.ends_at, a.assigned_by, a.reason
                FROM user_role_assignments a
                JOIN roles r ON r.id = a.role_id
                LEFT JOIN branches b ON b.id = a.branch_id
                WHERE (? IS NULL OR a.user_id = ?)
                """ + visibility + optionalStore + " ORDER BY a.id DESC";

        List<Object> params = new ArrayList<>();
        params.add(userId);
        params.add(userId);
        if (!platform) {
            params.add(actorStoreId);
            params.add(actorStoreId);
        }
        params.add(storeId);
        params.add(storeId);
        params.add(storeId);
        return jdbcTemplate.query(sql, this::mapAssignmentView, params.toArray());
    }

    @Override
    public List<AuthorizationOverrideView> findOverrides(Long userId, Long storeId,
                                                          Long actorStoreId, boolean platform) {
        String visibility = platform ? "" : " AND (o.store_id = ? OR b.store_id = ?)";
        String optionalStore = " AND (? IS NULL OR o.store_id = ? OR b.store_id = ? )";
        String sql = """
                SELECT o.id, o.user_id, o.assignment_id, p.code AS permission_code, o.effect,
                       o.scope_type, o.store_id, o.branch_id, o.scope_key, o.active,
                       o.expires_at, o.assigned_by, o.reason
                FROM user_permission_overrides o
                JOIN permissions p ON p.id = o.permission_id
                LEFT JOIN branches b ON b.id = o.branch_id
                WHERE (? IS NULL OR o.user_id = ?)
                """ + visibility + optionalStore + " ORDER BY o.id DESC";

        List<Object> params = new ArrayList<>();
        params.add(userId);
        params.add(userId);
        if (!platform) {
            params.add(actorStoreId);
            params.add(actorStoreId);
        }
        params.add(storeId);
        params.add(storeId);
        params.add(storeId);
        return jdbcTemplate.query(sql, this::mapOverrideView, params.toArray());
    }

    @Override
    public boolean hasActiveAssignment(Long userId, String roleCode, String scopeKey, Long excludedId) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM user_role_assignments a
                JOIN roles r ON r.id = a.role_id
                WHERE a.user_id = ? AND r.code = ? AND a.active = TRUE
                  AND a.active_scope_key = ? AND (? IS NULL OR a.id <> ?)
                """, Integer.class, userId, roleCode, scopeKey, excludedId, excludedId);
        return count != null && count > 0;
    }

    @Override
    public Long findRoleId(String roleCode) {
        return findId("SELECT id FROM roles WHERE code = ? AND active = TRUE", roleCode);
    }

    @Override
    public Long findPermissionId(String permissionCode) {
        return findId("SELECT id FROM permissions WHERE code = ? AND active = TRUE", permissionCode);
    }

    @Override
    public Long insertAssignment(Long userId, Long roleId, AuthorizationScopeRequest scope,
                                 String scopeKey, LocalDateTime startsAt, LocalDateTime endsAt,
                                 Long assignedBy, String reason) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                    INSERT INTO user_role_assignments (
                        user_id, role_id, scope_type, store_id, branch_id, scope_key,
                        active_scope_key, active, starts_at, ends_at, assigned_by, reason, version
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?, 0)
                    """, Statement.RETURN_GENERATED_KEYS);
            statement.setObject(1, userId);
            statement.setObject(2, roleId);
            statement.setString(3, scope.type().name());
            setNullableLong(statement, 4, scope.storeId());
            setNullableLong(statement, 5, scope.branchId());
            statement.setString(6, scopeKey);
            statement.setString(7, scopeKey);
            statement.setObject(8, startsAt);
            statement.setObject(9, endsAt);
            setNullableLong(statement, 10, assignedBy);
            statement.setString(11, reason);
            return statement;
        }, keyHolder);
        return generatedId(keyHolder);
    }

    @Override
    public int updateAssignment(Long assignmentId, Long roleId, AuthorizationScopeRequest scope,
                                String scopeKey, LocalDateTime startsAt, LocalDateTime endsAt,
                                String reason) {
        return jdbcTemplate.update("""
                UPDATE user_role_assignments
                SET role_id = ?, scope_type = ?, store_id = ?, branch_id = ?, scope_key = ?,
                    active_scope_key = ?, starts_at = ?, ends_at = ?, reason = ?,
                    updated_at = CURRENT_TIMESTAMP(6), version = version + 1
                WHERE id = ? AND active = TRUE
                """, roleId, scope.type().name(), scope.storeId(), scope.branchId(), scopeKey,
                scopeKey, startsAt, endsAt, reason, assignmentId);
    }

    @Override
    public int revokeAssignment(Long assignmentId) {
        return jdbcTemplate.update("""
                UPDATE user_role_assignments
                SET active = FALSE, active_scope_key = NULL,
                    ends_at = COALESCE(ends_at, CURRENT_TIMESTAMP(6)),
                    updated_at = CURRENT_TIMESTAMP(6), version = version + 1
                WHERE id = ? AND active = TRUE
                """, assignmentId);
    }

    @Override
    public Long insertOverride(Long userId, Long assignmentId, Long permissionId,
                               String effect, AuthorizationScopeRequest scope, String scopeKey,
                               LocalDateTime expiresAt, Long assignedBy, String reason) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                    INSERT INTO user_permission_overrides (
                        user_id, assignment_id, permission_id, effect, scope_type,
                        store_id, branch_id, scope_key, active, expires_at, assigned_by, reason
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            statement.setObject(1, userId);
            setNullableLong(statement, 2, assignmentId);
            statement.setObject(3, permissionId);
            statement.setString(4, effect);
            statement.setString(5, scope.type().name());
            setNullableLong(statement, 6, scope.storeId());
            setNullableLong(statement, 7, scope.branchId());
            statement.setString(8, scopeKey);
            statement.setObject(9, expiresAt);
            setNullableLong(statement, 10, assignedBy);
            statement.setString(11, reason);
            return statement;
        }, keyHolder);
        return generatedId(keyHolder);
    }

    @Override
    public int revokeOverride(Long overrideId) {
        return jdbcTemplate.update(
                "UPDATE user_permission_overrides SET active = FALSE, updated_at = CURRENT_TIMESTAMP(6) WHERE id = ? AND active = TRUE",
                overrideId);
    }

    @Override
    public AuthorizationAssignmentView findAssignment(Long id) {
        return jdbcTemplate.queryForObject("""
                SELECT a.id, a.user_id, r.code AS role_code, a.scope_type, a.store_id, a.branch_id,
                       a.scope_key, a.active, a.starts_at, a.ends_at, a.assigned_by, a.reason
                FROM user_role_assignments a JOIN roles r ON r.id = a.role_id WHERE a.id = ?
                """, this::mapAssignmentView, id);
    }

    @Override
    public AuthorizationOverrideView findOverride(Long id) {
        return jdbcTemplate.queryForObject("""
                SELECT o.id, o.user_id, o.assignment_id, p.code AS permission_code, o.effect,
                       o.scope_type, o.store_id, o.branch_id, o.scope_key, o.active,
                       o.expires_at, o.assigned_by, o.reason
                FROM user_permission_overrides o JOIN permissions p ON p.id = o.permission_id WHERE o.id = ?
                """, this::mapOverrideView, id);
    }

    @Override
    public AssignmentTarget findAssignmentTarget(Long id) {
        try {
            return jdbcTemplate.queryForObject("""
                    SELECT user_id, scope_type, store_id, branch_id, active
                    FROM user_role_assignments WHERE id = ?
                    """, (rs, rowNum) -> new AssignmentTarget(
                    rs.getLong("user_id"), scope(rs), rs.getBoolean("active")), id);
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    @Override
    public OverrideTarget findOverrideTarget(Long id) {
        try {
            return jdbcTemplate.queryForObject("""
                    SELECT user_id, scope_type, store_id, branch_id
                    FROM user_permission_overrides WHERE id = ?
                    """, (rs, rowNum) -> new OverrideTarget(rs.getLong("user_id"), scope(rs)), id);
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    @Override
    public boolean roleExists(String roleCode) {
        return exists("SELECT COUNT(*) FROM roles WHERE code = ? AND active = TRUE", roleCode);
    }

    @Override
    public boolean permissionExists(String permissionCode) {
        return exists("SELECT COUNT(*) FROM permissions WHERE code = ? AND active = TRUE", permissionCode);
    }

    @Override
    public int incrementAuthorizationVersion(Long userId) {
        return jdbcTemplate.update(
                "UPDATE users SET authorization_version = authorization_version + 1 WHERE id = ?", userId);
    }

    @Override
    public int deactivateCustomerAssignments(Long userId) {
        return jdbcTemplate.update("""
                UPDATE user_role_assignments ura
                JOIN roles r ON r.id = ura.role_id
                SET ura.active = FALSE, ura.active_scope_key = NULL,
                    ura.updated_at = CURRENT_TIMESTAMP(6), ura.version = ura.version + 1
                WHERE ura.user_id = ? AND ura.active = TRUE AND r.code = 'ROLE_CUSTOMER'
                """, userId);
    }

    @Override
    public int revokeOtherAssignments(Long userId, String roleCode, String scopeKey) {
        return jdbcTemplate.update("""
                UPDATE user_role_assignments ura
                JOIN roles r ON r.id = ura.role_id
                SET ura.active = FALSE, ura.active_scope_key = NULL,
                    ura.ends_at = COALESCE(ura.ends_at, CURRENT_TIMESTAMP(6)),
                    ura.updated_at = CURRENT_TIMESTAMP(6), ura.version = ura.version + 1
                WHERE ura.user_id = ? AND ura.active = TRUE
                  AND NOT (r.code = ? AND ura.active_scope_key = ?)
                """, userId, roleCode, scopeKey);
    }

    @Override
    public int revokeAllAssignments(Long userId) {
        return jdbcTemplate.update("""
                UPDATE user_role_assignments
                SET active = FALSE, active_scope_key = NULL,
                    ends_at = COALESCE(ends_at, CURRENT_TIMESTAMP(6)),
                    updated_at = CURRENT_TIMESTAMP(6), version = version + 1
                WHERE user_id = ? AND active = TRUE
                """, userId);
    }

    private Long findId(String sql, String code) {
        try {
            return jdbcTemplate.queryForObject(sql, Long.class, code);
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    private boolean exists(String sql, String code) {
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, code);
        return count != null && count > 0;
    }

    private AuthorizationAssignmentView mapAssignmentView(ResultSet rs, int rowNum) throws SQLException {
        return new AuthorizationAssignmentView(rs.getLong("id"), rs.getLong("user_id"),
                rs.getString("role_code"), ScopeType.valueOf(rs.getString("scope_type")),
                nullableLong(rs, "store_id"), nullableLong(rs, "branch_id"), rs.getString("scope_key"),
                rs.getBoolean("active"), dateTime(rs, "starts_at"), dateTime(rs, "ends_at"),
                nullableLong(rs, "assigned_by"), rs.getString("reason"));
    }

    private AuthorizationOverrideView mapOverrideView(ResultSet rs, int rowNum) throws SQLException {
        return new AuthorizationOverrideView(rs.getLong("id"), rs.getLong("user_id"),
                nullableLong(rs, "assignment_id"), rs.getString("permission_code"), rs.getString("effect"),
                ScopeType.valueOf(rs.getString("scope_type")), nullableLong(rs, "store_id"),
                nullableLong(rs, "branch_id"), rs.getString("scope_key"), rs.getBoolean("active"),
                dateTime(rs, "expires_at"), nullableLong(rs, "assigned_by"), rs.getString("reason"));
    }

    private AuthorizationScopeRequest scope(ResultSet rs) throws SQLException {
        return new AuthorizationScopeRequest(ScopeType.valueOf(rs.getString("scope_type")),
                nullableLong(rs, "store_id"), nullableLong(rs, "branch_id"));
    }

    private static void setNullableLong(PreparedStatement statement, int index, Long value) throws SQLException {
        if (value == null) {
            statement.setNull(index, Types.BIGINT);
        } else {
            statement.setLong(index, value);
        }
    }

    private static Long generatedId(KeyHolder keyHolder) {
        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Database did not return a generated authorization id");
        }
        return key.longValue();
    }

    private static Long nullableLong(ResultSet rs, String column) throws SQLException {
        long value = rs.getLong(column);
        return rs.wasNull() ? null : value;
    }

    private static LocalDateTime dateTime(ResultSet rs, String column) throws SQLException {
        java.sql.Timestamp value = rs.getTimestamp(column);
        return value == null ? null : value.toLocalDateTime();
    }
}
