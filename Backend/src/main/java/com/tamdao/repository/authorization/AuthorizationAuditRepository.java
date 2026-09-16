package com.tamdao.repository.authorization;

import com.tamdao.authorization.ScopeType;

public interface AuthorizationAuditRepository {

    void insertMutation(Long actorUserId, String action, String permissionCode,
                        String resourceType, String resourceId, ScopeType scopeType,
                        Long scopeId, String reasonCode, String requestId, String metadataJson);
}
