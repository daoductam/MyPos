package com.tamdao.repository.authorization;

import com.tamdao.authorization.AuthorizationAssignmentView;
import com.tamdao.authorization.AuthorizationOverrideView;
import com.tamdao.authorization.ScopeType;
import com.tamdao.payload.request.AuthorizationScopeRequest;

import java.time.LocalDateTime;
import java.util.List;

public interface AuthorizationAssignmentRepository {

    List<AuthorizationAssignmentView> findAssignments(Long userId, Long storeId,
                                                      Long actorStoreId, boolean platform);

    List<AuthorizationOverrideView> findOverrides(Long userId, Long storeId,
                                                   Long actorStoreId, boolean platform);

    boolean hasActiveAssignment(Long userId, String roleCode, String scopeKey, Long excludedId);

    Long findRoleId(String roleCode);

    Long findPermissionId(String permissionCode);

    Long insertAssignment(Long userId, Long roleId, AuthorizationScopeRequest scope,
                          String scopeKey, LocalDateTime startsAt, LocalDateTime endsAt,
                          Long assignedBy, String reason);

    int updateAssignment(Long assignmentId, Long roleId, AuthorizationScopeRequest scope,
                         String scopeKey, LocalDateTime startsAt, LocalDateTime endsAt,
                         String reason);

    int revokeAssignment(Long assignmentId);

    Long insertOverride(Long userId, Long assignmentId, Long permissionId,
                        String effect, AuthorizationScopeRequest scope, String scopeKey,
                        LocalDateTime expiresAt, Long assignedBy, String reason);

    int revokeOverride(Long overrideId);

    AuthorizationAssignmentView findAssignment(Long id);

    AuthorizationOverrideView findOverride(Long id);

    AssignmentTarget findAssignmentTarget(Long id);

    OverrideTarget findOverrideTarget(Long id);

    boolean roleExists(String roleCode);

    boolean permissionExists(String permissionCode);

    int incrementAuthorizationVersion(Long userId);

    int deactivateCustomerAssignments(Long userId);

    int revokeOtherAssignments(Long userId, String roleCode, String scopeKey);

    int revokeAllAssignments(Long userId);

    record AssignmentTarget(Long userId, AuthorizationScopeRequest scope, boolean active) {
    }

    record OverrideTarget(Long userId, AuthorizationScopeRequest scope) {
    }
}
