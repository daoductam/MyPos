package com.tamdao.repository.authorization;

import com.tamdao.authorization.ScopeType;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class JdbcAuthorizationAuditRepository implements AuthorizationAuditRepository {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void insertMutation(Long actorUserId, String action, String permissionCode,
                               String resourceType, String resourceId, ScopeType scopeType,
                               Long scopeId, String reasonCode, String requestId, String metadataJson) {
        jdbcTemplate.update(
                """
                INSERT INTO authorization_audit_events (
                    actor_user_id, action, permission_code, resource_type, resource_id,
                    scope_type, scope_id, decision, reason_code, request_id, metadata_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'MUTATION', ?, ?, ?)
                """,
                actorUserId,
                action,
                permissionCode,
                resourceType,
                resourceId,
                scopeType == null ? null : scopeType.name(),
                scopeId,
                reasonCode,
                requestId,
                metadataJson);
    }
}
