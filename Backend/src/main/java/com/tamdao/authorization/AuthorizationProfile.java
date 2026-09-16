package com.tamdao.authorization;

import java.util.List;
import java.util.Set;

public record AuthorizationProfile(
        ProfileUser user,
        List<RoleScope> roles,
        List<String> capabilities,
        long authorizationVersion
) {
    public record ProfileUser(
            Long id,
            String email,
            String fullName,
            String phone,
            boolean active
    ) {
    }

    public record RoleScope(
            String code,
            CapabilityScope scope
    ) {
    }

    public record CapabilityScope(
            ScopeType type,
            List<Long> storeIds,
            List<Long> branchIds
    ) {
    }
}
