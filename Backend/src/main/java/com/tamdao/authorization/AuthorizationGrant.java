package com.tamdao.authorization;

public record AuthorizationGrant(
        Long assignmentId,
        String roleCode,
        String permissionCode,
        ScopeType assignmentScope,
        Long storeId,
        Long branchId
) {
}
