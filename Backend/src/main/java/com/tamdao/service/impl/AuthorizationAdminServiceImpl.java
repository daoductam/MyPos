package com.tamdao.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tamdao.authorization.AuthorizationAssignmentView;
import com.tamdao.authorization.AuthorizationOverrideView;
import com.tamdao.authorization.ScopeType;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.payload.request.AuthorizationAssignmentRequest;
import com.tamdao.payload.request.AuthorizationOverrideRequest;
import com.tamdao.payload.request.AuthorizationScopeRequest;
import com.tamdao.repository.authorization.AuthorizationAssignmentRepository;
import com.tamdao.repository.authorization.AuthorizationAssignmentRepository.AssignmentTarget;
import com.tamdao.repository.authorization.AuthorizationAssignmentRepository.OverrideTarget;
import com.tamdao.repository.authorization.AuthorizationScopeRepository;
import com.tamdao.repository.authorization.AuthorizationScopeRepository.UserScope;
import com.tamdao.service.AuthorizationAdminService;
import com.tamdao.service.AuthorizationAuditService;
import com.tamdao.service.AuthorizationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthorizationAdminServiceImpl implements AuthorizationAdminService {

    private final AuthorizationAssignmentRepository assignmentRepository;
    private final AuthorizationScopeRepository scopeRepository;
    private final AuthorizationService authorizationService;
    private final AuthorizationAuditService authorizationAuditService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public List<AuthorizationAssignmentView> listAssignments(Authentication actor, Long userId, Long storeId) {
        boolean platform = canManagePlatform(actor);
        Long actorStoreId = platform ? null : actorStoreId(actor);
        if (!platform && actorStoreId == null) {
            throw denied();
        }

        return assignmentRepository.findAssignments(userId, storeId, actorStoreId, platform);
    }

    @Override
    @Transactional
    public AuthorizationAssignmentView createAssignment(Authentication actor,
                                                        AuthorizationAssignmentRequest request) {
        String roleCode = normalizeRole(request.roleCode());
        AuthorizationScopeRequest scope = requireScope(request.scope());
        validateRole(roleCode);
        validateScope(scope);
        validateScopeReference(scope);
        requireTargetUserInScope(request.userId(), scope);
        requireCanManage(actor, scope);

        LocalDateTime startsAt = request.startsAt() == null ? LocalDateTime.now() : request.startsAt();
        LocalDateTime endsAt = request.endsAt();
        if (endsAt != null && !endsAt.isAfter(startsAt)) {
            throw invalid("endsAt must be after startsAt");
        }

        String scopeKey = scopeKey(scope, request.userId());
        if (assignmentRepository.hasActiveAssignment(request.userId(), roleCode, scopeKey, null)) {
            throw new BusinessException(ErrorCode.DATA_INTEGRITY_VIOLATION,
                    "An active assignment already exists for this user, role, and scope");
        }

        Long roleId = assignmentRepository.findRoleId(roleCode);
        if (roleId == null) {
            throw invalid("Unknown or inactive role code");
        }
        Long actorId = actorId(actor);
        Long assignmentId = assignmentRepository.insertAssignment(
                request.userId(), roleId, scope, scopeKey, startsAt, endsAt, actorId, request.reason().trim());
        touchAuthorization(request.userId());
        audit(actorId, "authorization.assignment.created", "user_role_assignment", assignmentId,
                scope, "ASSIGNMENT_CREATED", Map.of("roleCode", roleCode, "reason", request.reason().trim()));
        return findAssignment(assignmentId);
    }

    @Override
    @Transactional
    public AuthorizationAssignmentView updateAssignment(Authentication actor, Long assignmentId,
                                                        AuthorizationAssignmentRequest request) {
        AssignmentTarget existing = findAssignmentTarget(assignmentId);
        if (!existing.active() || !existing.userId().equals(request.userId())) {
            throw invalid("Only an active assignment for the same subject can be updated");
        }
        String roleCode = normalizeRole(request.roleCode());
        AuthorizationScopeRequest scope = requireScope(request.scope());
        validateRole(roleCode);
        validateScope(scope);
        validateScopeReference(scope);
        requireTargetUserInScope(request.userId(), scope);
        requireCanManage(actor, existing.scope());
        requireCanManage(actor, scope);

        LocalDateTime startsAt = request.startsAt() == null ? LocalDateTime.now() : request.startsAt();
        if (request.endsAt() != null && !request.endsAt().isAfter(startsAt)) {
            throw invalid("endsAt must be after startsAt");
        }
        String scopeKey = scopeKey(scope, request.userId());
        if (assignmentRepository.hasActiveAssignment(request.userId(), roleCode, scopeKey, assignmentId)) {
            throw new BusinessException(ErrorCode.DATA_INTEGRITY_VIOLATION,
                    "An active assignment already exists for this user, role, and scope");
        }
        Long roleId = assignmentRepository.findRoleId(roleCode);
        if (roleId == null) {
            throw invalid("Unknown or inactive role code");
        }
        assignmentRepository.updateAssignment(
                assignmentId, roleId, scope, scopeKey, startsAt, request.endsAt(), request.reason().trim());
        Long actorId = actorId(actor);
        touchAuthorization(request.userId());
        audit(actorId, "authorization.assignment.updated", "user_role_assignment", assignmentId,
                scope, "ASSIGNMENT_UPDATED", Map.of("roleCode", roleCode, "reason", request.reason().trim()));
        return findAssignment(assignmentId);
    }

    @Override
    @Transactional
    public void revokeAssignment(Authentication actor, Long assignmentId, String reason) {
        AssignmentTarget target = findAssignmentTarget(assignmentId);
        requireCanManage(actor, target.scope());
        Long actorId = actorId(actor);
        int updated = assignmentRepository.revokeAssignment(assignmentId);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Active assignment not found");
        }
        touchAuthorization(target.userId());
        audit(actorId, "authorization.assignment.revoked", "user_role_assignment", assignmentId,
                target.scope(), "ASSIGNMENT_REVOKED", Map.of("reason", requiredReason(reason)));
    }

    @Override
    @Transactional
    public List<AuthorizationOverrideView> listOverrides(Authentication actor, Long userId, Long storeId) {
        boolean platform = canManagePlatform(actor);
        Long actorStoreId = platform ? null : actorStoreId(actor);
        if (!platform && actorStoreId == null) {
            throw denied();
        }
        return assignmentRepository.findOverrides(userId, storeId, actorStoreId, platform);
    }

    @Override
    @Transactional
    public AuthorizationOverrideView createOverride(Authentication actor,
                                                    AuthorizationOverrideRequest request) {
        String permissionCode = request.permissionCode().trim().toLowerCase(Locale.ROOT);
        String effect = request.effect().trim().toUpperCase(Locale.ROOT);
        AuthorizationScopeRequest scope = requireScope(request.scope());
        validateScope(scope);
        validatePermission(permissionCode);
        if (!"GRANT".equals(effect) && !"DENY".equals(effect)) {
            throw invalid("effect must be GRANT or DENY");
        }
        if (request.expiresAt() == null && !canManagePlatform(actor)) {
            throw invalid("expiresAt is required for non-platform overrides");
        }
        if (request.expiresAt() != null && !request.expiresAt().isAfter(LocalDateTime.now())) {
            throw invalid("expiresAt must be in the future");
        }
        validateScopeReference(scope);
        requireTargetUserInScope(request.userId(), scope);
        requireCanManage(actor, scope);

        if (request.assignmentId() != null) {
            AssignmentTarget assignment = findAssignmentTarget(request.assignmentId());
            if (!assignment.userId().equals(request.userId()) || !assignment.active()
                    || !scopeWithin(assignment.scope(), scope)) {
                throw invalid("Override scope must belong to the active target assignment");
            }
        }

        Long permissionId = assignmentRepository.findPermissionId(permissionCode);
        if (permissionId == null) {
            throw invalid("Unknown or inactive permission code");
        }
        Long actorId = actorId(actor);
        String scopeKey = scopeKey(scope, request.userId());
        Long overrideId = assignmentRepository.insertOverride(
                request.userId(), request.assignmentId(), permissionId, effect, scope, scopeKey,
                request.expiresAt(), actorId, request.reason().trim());
        touchAuthorization(request.userId());
        audit(actorId, "authorization.override.created", "user_permission_override", overrideId,
                scope, "OVERRIDE_CREATED", Map.of("permissionCode", permissionCode, "effect", effect,
                        "reason", request.reason().trim()));
        return findOverride(overrideId);
    }

    @Override
    @Transactional
    public void revokeOverride(Authentication actor, Long overrideId, String reason) {
        OverrideTarget target = findOverrideTarget(overrideId);
        requireCanManage(actor, target.scope());
        Long actorId = actorId(actor);
        int updated = assignmentRepository.revokeOverride(overrideId);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Active override not found");
        }
        touchAuthorization(target.userId());
        audit(actorId, "authorization.override.revoked", "user_permission_override", overrideId,
                target.scope(), "OVERRIDE_REVOKED", Map.of("reason", requiredReason(reason)));
    }

    private void validateRole(String roleCode) {
        if (roleCode.startsWith("ROLE_BRANCH_") && !roleCode.equals("ROLE_BRANCH_MANAGER")) {
            throw invalid("Legacy role aliases cannot be assigned");
        }
        if (!assignmentRepository.roleExists(roleCode)) {
            throw invalid("Unknown or inactive role code");
        }
    }

    private void validatePermission(String permissionCode) {
        if (!assignmentRepository.permissionExists(permissionCode)) {
            throw invalid("Unknown or inactive permission code");
        }
    }

    private void validateScope(AuthorizationScopeRequest scope) {
        if (scope == null || scope.type() == null) {
            throw invalid("scope.type is required");
        }
        boolean valid = switch (scope.type()) {
            case PLATFORM, SELF -> scope.storeId() == null && scope.branchId() == null;
            case STORE -> scope.storeId() != null && scope.branchId() == null;
            case BRANCH -> scope.storeId() != null && scope.branchId() != null;
        };
        if (!valid) {
            throw invalid("Scope identifiers do not match scope.type");
        }
    }

    private void validateScopeReference(AuthorizationScopeRequest scope) {
        if (scope.type() == ScopeType.STORE) {
            if (!scopeRepository.storeExists(scope.storeId())) {
                throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found");
            }
        } else if (scope.type() == ScopeType.BRANCH) {
            Long actualStoreId = scopeRepository.branchStoreId(scope.branchId());
            if (!scope.storeId().equals(actualStoreId)) {
                throw invalid("Branch does not belong to the requested store");
            }
        }
    }

    private void requireTargetUserInScope(Long userId, AuthorizationScopeRequest scope) {
        UserScope user = scopeRepository.userScope(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Target user not found");
        }
        boolean valid = switch (scope.type()) {
            case PLATFORM, SELF -> true;
            case STORE -> scope.storeId().equals(user.storeId());
            case BRANCH -> scope.branchId().equals(user.branchId()) && scope.storeId().equals(user.storeId());
        };
        if (!valid) {
            throw denied();
        }
    }

    private boolean scopeWithin(AuthorizationScopeRequest parent, AuthorizationScopeRequest child) {
        return switch (parent.type()) {
            case PLATFORM -> true;
            case STORE -> child.type() == ScopeType.STORE && parent.storeId().equals(child.storeId())
                    || child.type() == ScopeType.BRANCH && parent.storeId().equals(child.storeId());
            case BRANCH -> child.type() == ScopeType.BRANCH
                    && parent.storeId().equals(child.storeId()) && parent.branchId().equals(child.branchId());
            case SELF -> child.type() == ScopeType.SELF;
        };
    }

    private void requireCanManage(Authentication actor, AuthorizationScopeRequest scope) {
        if (canManagePlatform(actor)) {
            return;
        }
        boolean allowed = scope.type() == ScopeType.STORE
                ? authorizationService.hasPermission(actor, "store.rbac.manage", ScopeType.STORE,
                scope.storeId(), null, null)
                : scope.type() == ScopeType.BRANCH
                && authorizationService.hasPermission(actor, "store.rbac.manage", ScopeType.BRANCH,
                scope.storeId(), scope.branchId(), null);
        if (!allowed) {
            throw denied();
        }
    }

    private boolean canManagePlatform(Authentication actor) {
        return authorizationService.hasPermission(actor, "platform.rbac.manage", ScopeType.PLATFORM,
                null, null, null);
    }

    private void touchAuthorization(Long userId) {
        assignmentRepository.incrementAuthorizationVersion(userId);
        authorizationService.invalidate(userId);
    }

    private void audit(Long actorId, String action, String resourceType, Long resourceId,
                       AuthorizationScopeRequest scope, String reasonCode, Map<String, String> metadata) {
        authorizationAuditService.recordMutation(actorId, action, null, resourceType,
                String.valueOf(resourceId), scope.type(), scope.branchId() != null ? scope.branchId() : scope.storeId(),
                reasonCode, toJson(metadata));
    }

    private AuthorizationAssignmentView findAssignment(Long id) {
        AuthorizationAssignmentView assignment = assignmentRepository.findAssignment(id);
        if (assignment == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Assignment not found");
        }
        return assignment;
    }

    private AuthorizationOverrideView findOverride(Long id) {
        AuthorizationOverrideView override = assignmentRepository.findOverride(id);
        if (override == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Override not found");
        }
        return override;
    }

    private AssignmentTarget findAssignmentTarget(Long id) {
        AssignmentTarget target = assignmentRepository.findAssignmentTarget(id);
        if (target == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Assignment not found");
        }
        return target;
    }

    private OverrideTarget findOverrideTarget(Long id) {
        OverrideTarget target = assignmentRepository.findOverrideTarget(id);
        if (target == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Override not found");
        }
        return target;
    }

    private Long actorId(Authentication actor) {
        if (actor != null && actor.getDetails() instanceof com.tamdao.authorization.AuthorizationSnapshot snapshot) {
            return snapshot.userId();
        }
        return actor == null ? null : scopeRepository.userIdByEmail(actor.getName());
    }

    private Long actorStoreId(Authentication actor) {
        return scopeRepository.userStoreId(actorId(actor));
    }

    private String normalizeRole(String roleCode) {
        return AuthorizationServiceImpl.canonicalRole(roleCode.trim().toUpperCase(Locale.ROOT));
    }

    private String scopeKey(AuthorizationScopeRequest scope, Long userId) {
        return switch (scope.type()) {
            case PLATFORM -> "PLATFORM:*";
            case STORE -> "STORE:" + scope.storeId();
            case BRANCH -> "BRANCH:" + scope.branchId();
            case SELF -> "SELF:" + userId;
        };
    }

    private AuthorizationScopeRequest requireScope(AuthorizationScopeRequest scope) {
        if (scope == null) {
            throw invalid("scope is required");
        }
        return scope;
    }

    private String requiredReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw invalid("reason is required");
        }
        return reason.trim();
    }

    private BusinessException invalid(String message) {
        return new BusinessException(ErrorCode.INVALID_REQUEST, message);
    }

    private BusinessException denied() {
        return new BusinessException(ErrorCode.AUTHORIZATION_DENIED,
                "You do not have permission to manage this authorization scope");
    }

    private String toJson(Map<String, String> metadata) {
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException ex) {
            return "{}";
        }
    }

}
