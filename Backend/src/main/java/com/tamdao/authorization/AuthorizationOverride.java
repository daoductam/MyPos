package com.tamdao.authorization;

import java.time.LocalDateTime;

public record AuthorizationOverride(
        Long id,
        Long assignmentId,
        String permissionCode,
        String effect,
        ScopeType scopeType,
        Long storeId,
        Long branchId,
        String scopeKey,
        LocalDateTime expiresAt
) {
}
