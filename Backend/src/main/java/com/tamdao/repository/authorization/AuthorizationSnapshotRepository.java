package com.tamdao.repository.authorization;

import com.tamdao.authorization.AuthorizationSnapshot;

public interface AuthorizationSnapshotRepository {

    AuthorizationIdentity findIdentityByEmail(String email);

    AuthorizationIdentity findIdentityByUserId(Long userId);

    AuthorizationUserProfile findUserProfile(Long userId);

    AuthorizationSnapshot loadSnapshot(AuthorizationIdentity identity);

    record AuthorizationIdentity(
            Long userId,
            String email,
            String legacyRoleCode,
            long authorizationVersion
    ) {
    }

    record AuthorizationUserProfile(
            Long id,
            String email,
            String fullName,
            String phone,
            boolean active
    ) {
    }
}
