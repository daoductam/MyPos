package com.tamdao.service;

import com.tamdao.authorization.ScopeType;
import com.tamdao.modal.User;

public interface AuthorizationMutationService {

    void ensureAssignment(User user, String roleCode, ScopeType scopeType,
                          Long storeId, Long branchId, String reason);

    void replaceAssignments(User user, String roleCode, ScopeType scopeType,
                            Long storeId, Long branchId, String reason);

    void revokeAssignments(User user, String reason);
}
