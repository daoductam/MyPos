package com.tamdao.authorization;

import com.tamdao.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import com.tamdao.repository.authorization.AuthorizationScopeRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Method-security entry points for resource scope checks.
 *
 * Permission authorities answer "may this actor perform this action?".
 * This guard additionally resolves the resource's tenant scope from the
 * database so a caller cannot widen access by changing a path/query ID.
 */
@Component
@RequiredArgsConstructor
public class AuthorizationGuard {

    private final AuthorizationService authorizationService;
    private final AuthorizationScopeRepository scopeRepository;

    public boolean hasPermission(Authentication authentication, String permissionCode) {
        return authorizationService.hasPermission(authentication, permissionCode);
    }

    public boolean hasPlatformPermission(Authentication authentication, String permissionCode) {
        return authorizationService.hasPermission(
                authentication, permissionCode, ScopeType.PLATFORM, null, null, null);
    }

    public boolean hasStorePermission(Authentication authentication, String permissionCode, Long storeId) {
        if (storeId == null) {
            return false;
        }
        return scopeRepository.storeExists(storeId)
                && authorizationService.hasPermission(
                authentication, permissionCode, ScopeType.STORE, storeId, null, null);
    }

    public boolean hasBranchPermission(Authentication authentication, String permissionCode, Long branchId) {
        if (branchId == null) {
            return false;
        }
        try {
            Long storeId = scopeRepository.branchStoreId(branchId);
            return storeId != null && authorizationService.hasPermission(
                    authentication, permissionCode, ScopeType.BRANCH, storeId, branchId, null);
        } catch (RuntimeException ex) {
            return false;
        }
    }

    public boolean hasUserScopePermission(Authentication authentication, String permissionCode, Long userId) {
        if (userId == null) {
            return false;
        }
        try {
            AuthorizationScopeRepository.UserScope scope = scopeRepository.userScope(userId);
            if (scope == null) {
                return false;
            }
            if (scope.branchId() != null) {
                return authorizationService.hasPermission(
                        authentication, permissionCode, ScopeType.BRANCH,
                        scope.storeId(), scope.branchId(), userId);
            }
            return scope.storeId() != null && authorizationService.hasPermission(
                    authentication, permissionCode, ScopeType.STORE,
                    scope.storeId(), null, userId);
        } catch (RuntimeException ex) {
            return false;
        }
    }

    public boolean hasSelfPermission(Authentication authentication, String permissionCode, Long subjectUserId) {
        if (subjectUserId == null || authentication == null) {
            return false;
        }
        try {
            Long actorId = actorId(authentication);
            return actorId != null && actorId.equals(subjectUserId)
                    && authorizationService.hasPermission(
                    authentication, permissionCode, ScopeType.SELF, null, null, subjectUserId);
        } catch (RuntimeException ex) {
            return false;
        }
    }

    public boolean hasCurrentUserSelfPermission(Authentication authentication, String permissionCode) {
        if (authentication == null) {
            return false;
        }
        try {
            Long actorId = actorId(authentication);
            return actorId != null && authorizationService.hasPermission(
                    authentication, permissionCode, ScopeType.SELF, null, null, actorId);
        } catch (RuntimeException ex) {
            return false;
        }
    }

    public boolean hasCurrentUserBranchPermission(Authentication authentication, String permissionCode) {
        Long branchId = currentUserBranchId(authentication);
        return hasBranchPermission(authentication, permissionCode, branchId);
    }

    public boolean hasCurrentUserStorePermission(Authentication authentication, String permissionCode) {
        Long storeId = currentUserStoreId(authentication);
        return hasStorePermission(authentication, permissionCode, storeId);
    }

    public boolean hasCustomerPermission(Authentication authentication, String permissionCode, Long customerId) {
        if (customerId == null) {
            return false;
        }
        try {
            AuthorizationScopeRepository.CustomerScope scope = scopeRepository.customerScope(customerId);
            if (scope == null) {
                return false;
            }
            if (scope.branchId() != null && authorizationService.hasPermission(
                    authentication, permissionCode, ScopeType.BRANCH,
                    scope.storeId(), scope.branchId(), null)) {
                return true;
            }
            return scope.storeId() != null && authorizationService.hasPermission(
                    authentication, permissionCode, ScopeType.STORE,
                    scope.storeId(), null, null);
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private Long actorId(Authentication authentication) {
        if (authentication.getDetails() instanceof AuthorizationSnapshot snapshot) {
            return snapshot.userId();
        }
        return scopeRepository.userIdByEmail(authentication.getName());
    }

    private Long currentUserBranchId(Authentication authentication) {
        try {
            Long actorId = actorId(authentication);
            AuthorizationScopeRepository.UserScope scope = actorId == null
                    ? null : scopeRepository.userScope(actorId);
            return scope == null ? null : scope.branchId();
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private Long currentUserStoreId(Authentication authentication) {
        try {
            Long actorId = actorId(authentication);
            AuthorizationScopeRepository.UserScope scope = actorId == null
                    ? null : scopeRepository.userScope(actorId);
            return scope == null ? null : scope.storeId();
        } catch (RuntimeException ex) {
            return null;
        }
    }
}
