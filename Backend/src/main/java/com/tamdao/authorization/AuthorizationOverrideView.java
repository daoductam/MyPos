package com.tamdao.authorization;

import java.time.LocalDateTime;

public record AuthorizationOverrideView(
        Long id,
        Long userId,
        Long assignmentId,
        String permissionCode,
        String effect,
        ScopeType scopeType,
        Long storeId,
        Long branchId,
        String scopeKey,
        boolean active,
        LocalDateTime expiresAt,
        Long assignedBy,
        String reason
) {
}
