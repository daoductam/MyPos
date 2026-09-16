package com.tamdao.authorization;

import java.util.List;

public record AuthorizationSnapshot(
        Long userId,
        String email,
        String legacyRoleCode,
        long authorizationVersion,
        List<AuthorizationAssignment> assignments,
        List<AuthorizationGrant> grants,
        List<AuthorizationOverride> overrides
) {
    public AuthorizationSnapshot {
        assignments = assignments == null ? List.of() : List.copyOf(assignments);
        grants = grants == null ? List.of() : List.copyOf(grants);
        overrides = overrides == null ? List.of() : List.copyOf(overrides);
    }
}
