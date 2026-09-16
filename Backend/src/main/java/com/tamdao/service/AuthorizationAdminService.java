package com.tamdao.service;

import com.tamdao.authorization.AuthorizationAssignmentView;
import com.tamdao.authorization.AuthorizationOverrideView;
import com.tamdao.payload.request.AuthorizationAssignmentRequest;
import com.tamdao.payload.request.AuthorizationOverrideRequest;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface AuthorizationAdminService {

    List<AuthorizationAssignmentView> listAssignments(Authentication actor, Long userId, Long storeId);

    AuthorizationAssignmentView createAssignment(Authentication actor, AuthorizationAssignmentRequest request);

    AuthorizationAssignmentView updateAssignment(Authentication actor, Long assignmentId,
                                                 AuthorizationAssignmentRequest request);

    void revokeAssignment(Authentication actor, Long assignmentId, String reason);

    List<AuthorizationOverrideView> listOverrides(Authentication actor, Long userId, Long storeId);

    AuthorizationOverrideView createOverride(Authentication actor, AuthorizationOverrideRequest request);

    void revokeOverride(Authentication actor, Long overrideId, String reason);
}
