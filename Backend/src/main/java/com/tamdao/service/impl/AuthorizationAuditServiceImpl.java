package com.tamdao.service.impl;

import com.tamdao.authorization.ScopeType;
import com.tamdao.configurations.RequestIdFilter;
import com.tamdao.repository.authorization.AuthorizationAuditRepository;
import com.tamdao.service.AuthorizationAuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class AuthorizationAuditServiceImpl implements AuthorizationAuditService {

    private final AuthorizationAuditRepository auditRepository;

    @Override
    public void recordMutation(Long actorUserId, String action, String permissionCode,
                               String resourceType, String resourceId, ScopeType scopeType,
                               Long scopeId, String reasonCode, String metadataJson) {
        auditRepository.insertMutation(
                actorUserId,
                action,
                permissionCode,
                resourceType,
                resourceId,
                scopeType,
                scopeId,
                reasonCode,
                requestId(),
                metadataJson);
    }

    private String requestId() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return "system";
        }
        HttpServletRequest request = attributes.getRequest();
        Object requestId = request.getAttribute(RequestIdFilter.HEADER);
        return requestId == null ? "system" : String.valueOf(requestId);
    }
}
