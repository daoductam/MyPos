package com.tamdao.authorization;

import java.time.LocalDateTime;

public record AuthorizationAssignmentView(
        Long id,
        Long userId,
        String roleCode,
        ScopeType scopeType,
        Long storeId,
        Long branchId,
        String scopeKey,
        boolean active,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        Long assignedBy,
        String reason
) {
}
