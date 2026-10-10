package com.tamdao.authorization;

import java.time.LocalDateTime;

public record AuthorizationAssignment(
        Long id,
        String roleCode,
        ScopeType scopeType,
        Long storeId,
        Long branchId,
        String scopeKey,
        LocalDateTime startsAt,
        LocalDateTime endsAt
) {
}
