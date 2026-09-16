package com.tamdao.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tamdao.authorization.ScopeType;
import com.tamdao.modal.User;
import com.tamdao.repository.authorization.AuthorizationAssignmentRepository;
import com.tamdao.service.AuthorizationAuditService;
import com.tamdao.service.AuthorizationMutationService;
import com.tamdao.service.AuthorizationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthorizationMutationServiceImpl implements AuthorizationMutationService {

    private final AuthorizationAssignmentRepository assignmentRepository;
    private final AuthorizationService authorizationService;
    private final AuthorizationAuditService authorizationAuditService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void ensureAssignment(User user, String roleCode, ScopeType scopeType,
                                 Long storeId, Long branchId, String reason) {
        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("A persisted user is required for an authorization assignment");
        }

        String scopeKey = scopeKey(scopeType, user.getId(), storeId, branchId);
        boolean changed = false;

        if ("ROLE_STORE_ADMIN".equals(roleCode)) {
            changed = assignmentRepository.deactivateCustomerAssignments(user.getId()) > 0;
        }

        if (!assignmentRepository.hasActiveAssignment(user.getId(), roleCode, scopeKey, null)) {
            Long roleId = assignmentRepository.findRoleId(roleCode);
            if (roleId == null) {
                throw new IllegalArgumentException("Unknown authorization role: " + roleCode);
            }
            assignmentRepository.insertAssignment(
                    user.getId(), roleId,
                    new com.tamdao.payload.request.AuthorizationScopeRequest(scopeType, storeId, branchId),
                    scopeKey, LocalDateTime.now(), null, null, reason);
            changed = true;
        }

        if (changed) {
            assignmentRepository.incrementAuthorizationVersion(user.getId());
            authorizationService.invalidate(user.getId());
            authorizationAuditService.recordMutation(
                    null,
                    "authorization.assignment.created",
                    null,
                    "user_role_assignment",
                    String.valueOf(user.getId()),
                    scopeType,
                    branchId != null ? branchId : storeId,
                    "ASSIGNMENT_MUTATION",
                    toJson(Map.of("roleCode", roleCode, "reason", String.valueOf(reason))));
        }
    }

    @Override
    @Transactional
    public void replaceAssignments(User user, String roleCode, ScopeType scopeType,
                                   Long storeId, Long branchId, String reason) {
        String scopeKey = scopeKey(scopeType, user.getId(), storeId, branchId);
        int revoked = assignmentRepository.revokeOtherAssignments(user.getId(), roleCode, scopeKey);
        if (revoked > 0) {
            assignmentRepository.incrementAuthorizationVersion(user.getId());
            authorizationService.invalidate(user.getId());
            authorizationAuditService.recordMutation(null,
                    "authorization.assignment.reconciled", null,
                    "user_role_assignment", String.valueOf(user.getId()), scopeType,
                    branchId != null ? branchId : storeId, "ASSIGNMENT_RECONCILED",
                    toJson(Map.of("reason", "EMPLOYEE_ROLE_CHANGED")));
        }
        ensureAssignment(user, roleCode, scopeType, storeId, branchId, reason);
    }

    @Override
    @Transactional
    public void revokeAssignments(User user, String reason) {
        int revoked = assignmentRepository.revokeAllAssignments(user.getId());
        if (revoked > 0) {
            assignmentRepository.incrementAuthorizationVersion(user.getId());
            authorizationService.invalidate(user.getId());
            authorizationAuditService.recordMutation(null,
                    "authorization.assignment.revoked", null,
                    "user_role_assignment", String.valueOf(user.getId()), null,
                    null, "ASSIGNMENTS_REVOKED",
                    toJson(Map.of("reason", String.valueOf(reason))));
        }
    }

    private String scopeKey(ScopeType scopeType, Long userId, Long storeId, Long branchId) {
        return switch (scopeType) {
            case PLATFORM -> "PLATFORM:*";
            case STORE -> "STORE:" + require(storeId, "storeId");
            case BRANCH -> "BRANCH:" + require(branchId, "branchId");
            case SELF -> "SELF:" + userId;
        };
    }

    private Long require(Long value, String name) {
        if (value == null) {
            throw new IllegalArgumentException(name + " is required for this authorization scope");
        }
        return value;
    }

    private String toJson(Map<String, String> metadata) {
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException ex) {
            return "{}";
        }
    }
}
