package com.tamdao.service;

import com.tamdao.authorization.AuthorizationProfile;
import com.tamdao.authorization.AuthorizationSnapshot;
import com.tamdao.authorization.ScopeType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.Set;

public interface AuthorizationService {

    AuthorizationSnapshot getSnapshotByEmail(String email);

    AuthorizationSnapshot getSnapshotByUserId(Long userId);

    AuthorizationProfile getProfile(String email);

    Set<GrantedAuthority> getAuthorities(AuthorizationSnapshot snapshot);

    boolean hasPermission(Authentication authentication, String permissionCode);

    boolean hasPermission(Authentication authentication, String permissionCode, ScopeType targetScope,
                          Long storeId, Long branchId, Long subjectUserId);

    TokenIdentity getTokenIdentity(String email);

    void invalidate(Long userId);

    record TokenIdentity(Long userId, String email, String legacyRoleCode, long authorizationVersion) {
    }
}
