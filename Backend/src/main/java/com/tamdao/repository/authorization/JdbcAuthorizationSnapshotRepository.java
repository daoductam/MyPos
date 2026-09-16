package com.tamdao.repository.authorization;

import com.tamdao.authorization.AuthorizationAssignment;
import com.tamdao.authorization.AuthorizationGrant;
import com.tamdao.authorization.AuthorizationOverride;
import com.tamdao.authorization.AuthorizationSnapshot;
import com.tamdao.authorization.ScopeType;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class JdbcAuthorizationSnapshotRepository implements AuthorizationSnapshotRepository {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public AuthorizationIdentity findIdentityByEmail(String email) {
        try {
            return jdbcTemplate.queryForObject(
                    """
                    SELECT id, email, CAST(role AS CHAR) AS legacy_role, authorization_version
                    FROM users
                    WHERE LOWER(email) = LOWER(?) AND deleted = FALSE
                    """,
                    (rs, rowNum) -> mapIdentity(rs),
                    email.trim());
        } catch (EmptyResultDataAccessException ex) {
            throw new UsernameNotFoundException("User does not exist");
        }
    }

    @Override
    public AuthorizationIdentity findIdentityByUserId(Long userId) {
        try {
            return jdbcTemplate.queryForObject(
                    """
                    SELECT id, email, CAST(role AS CHAR) AS legacy_role, authorization_version
                    FROM users
                    WHERE id = ? AND deleted = FALSE
                    """,
                    (rs, rowNum) -> mapIdentity(rs),
                    userId);
        } catch (EmptyResultDataAccessException ex) {
            throw new UsernameNotFoundException("User does not exist");
        }
    }

    @Override
    public AuthorizationUserProfile findUserProfile(Long userId) {
        return jdbcTemplate.queryForObject(
                """
                SELECT id, email, full_name, phone, deleted
                FROM users
                WHERE id = ?
                """,
                (rs, rowNum) -> new AuthorizationUserProfile(
                        rs.getLong("id"),
                        rs.getString("email"),
                        rs.getString("full_name"),
                        rs.getString("phone"),
                        !rs.getBoolean("deleted")),
                userId);
    }

    @Override
    public AuthorizationSnapshot loadSnapshot(AuthorizationIdentity identity) {
        List<AuthorizationAssignment> assignments = jdbcTemplate.query(
                """
                SELECT a.id, r.code AS role_code, a.scope_type, a.store_id, a.branch_id,
                       a.scope_key, a.starts_at, a.ends_at
                FROM user_role_assignments a
                JOIN roles r ON r.id = a.role_id AND r.active = TRUE
                WHERE a.user_id = ?
                  AND a.active = TRUE
                  AND a.starts_at <= CURRENT_TIMESTAMP(6)
                  AND (a.ends_at IS NULL OR a.ends_at > CURRENT_TIMESTAMP(6))
                ORDER BY a.id
                """,
                this::mapAssignment,
                identity.userId());

        List<AuthorizationGrant> grants = jdbcTemplate.query(
                """
                SELECT a.id AS assignment_id, r.code AS role_code, p.code AS permission_code,
                       a.scope_type, a.store_id, a.branch_id
                FROM user_role_assignments a
                JOIN roles r ON r.id = a.role_id AND r.active = TRUE
                JOIN role_permissions rp ON rp.role_id = r.id
                JOIN permissions p ON p.id = rp.permission_id AND p.active = TRUE
                WHERE a.user_id = ?
                  AND a.active = TRUE
                  AND a.starts_at <= CURRENT_TIMESTAMP(6)
                  AND (a.ends_at IS NULL OR a.ends_at > CURRENT_TIMESTAMP(6))
                ORDER BY a.id, p.code
                """,
                this::mapGrant,
                identity.userId());

        List<AuthorizationOverride> overrides = jdbcTemplate.query(
                """
                SELECT o.id, o.assignment_id, p.code AS permission_code, o.effect,
                       o.scope_type, o.store_id, o.branch_id, o.scope_key, o.expires_at
                FROM user_permission_overrides o
                JOIN permissions p ON p.id = o.permission_id AND p.active = TRUE
                WHERE o.user_id = ?
                  AND o.active = TRUE
                  AND (o.expires_at IS NULL OR o.expires_at > CURRENT_TIMESTAMP(6))
                ORDER BY o.id
                """,
                this::mapOverride,
                identity.userId());

        return new AuthorizationSnapshot(
                identity.userId(),
                identity.email(),
                identity.legacyRoleCode(),
                identity.authorizationVersion(),
                assignments,
                grants,
                overrides);
    }

    private AuthorizationIdentity mapIdentity(ResultSet rs) throws SQLException {
        return new AuthorizationIdentity(
                rs.getLong("id"),
                rs.getString("email"),
                normalizeLegacyRole(rs.getString("legacy_role")),
                rs.getLong("authorization_version"));
    }

    private AuthorizationAssignment mapAssignment(ResultSet rs, int rowNum) throws SQLException {
        return new AuthorizationAssignment(
                rs.getLong("id"),
                rs.getString("role_code"),
                ScopeType.valueOf(rs.getString("scope_type")),
                nullableLong(rs, "store_id"),
                nullableLong(rs, "branch_id"),
                rs.getString("scope_key"),
                nullableDateTime(rs, "starts_at"),
                nullableDateTime(rs, "ends_at"));
    }

    private AuthorizationGrant mapGrant(ResultSet rs, int rowNum) throws SQLException {
        return new AuthorizationGrant(
                rs.getLong("assignment_id"),
                rs.getString("role_code"),
                rs.getString("permission_code"),
                ScopeType.valueOf(rs.getString("scope_type")),
                nullableLong(rs, "store_id"),
                nullableLong(rs, "branch_id"));
    }

    private AuthorizationOverride mapOverride(ResultSet rs, int rowNum) throws SQLException {
        return new AuthorizationOverride(
                rs.getLong("id"),
                nullableLong(rs, "assignment_id"),
                rs.getString("permission_code"),
                rs.getString("effect"),
                ScopeType.valueOf(rs.getString("scope_type")),
                nullableLong(rs, "store_id"),
                nullableLong(rs, "branch_id"),
                rs.getString("scope_key"),
                nullableDateTime(rs, "expires_at"));
    }

    private static String normalizeLegacyRole(String rawRole) {
        if (rawRole == null) {
            return null;
        }
        return switch (rawRole.trim()) {
            case "0", "ROLE_ADMIN" -> "ROLE_ADMIN";
            case "1", "ROLE_STORE_ADMIN" -> "ROLE_STORE_ADMIN";
            case "2", "ROLE_STORE_MANAGER" -> "ROLE_STORE_MANAGER";
            case "3", "ROLE_BRANCH_MANAGER" -> "ROLE_BRANCH_MANAGER";
            case "4", "ROLE_BRANCH_ADMIN" -> "ROLE_BRANCH_ADMIN";
            case "5", "ROLE_BRANCH_CASHIER" -> "ROLE_BRANCH_CASHIER";
            case "6", "ROLE_CUSTOMER" -> "ROLE_CUSTOMER";
            case "7", "ROLE_CASHIER" -> "ROLE_CASHIER";
            default -> rawRole.trim();
        };
    }

    private static Long nullableLong(ResultSet rs, String column) throws SQLException {
        long value = rs.getLong(column);
        return rs.wasNull() ? null : value;
    }

    private static LocalDateTime nullableDateTime(ResultSet rs, String column) throws SQLException {
        java.sql.Timestamp value = rs.getTimestamp(column);
        return value == null ? null : value.toLocalDateTime();
    }
}
