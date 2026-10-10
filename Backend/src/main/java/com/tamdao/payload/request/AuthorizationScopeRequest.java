package com.tamdao.payload.request;

import com.tamdao.authorization.ScopeType;

public record AuthorizationScopeRequest(
        ScopeType type,
        Long storeId,
        Long branchId
) {
}
