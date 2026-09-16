package com.tamdao.service;

import com.tamdao.authorization.ScopeType;

public interface AuthorizationAuditService {

    void recordMutation(Long actorUserId, String action, String permissionCode,
                        String resourceType, String resourceId, ScopeType scopeType,
                        Long scopeId, String reasonCode, String metadataJson);
}
