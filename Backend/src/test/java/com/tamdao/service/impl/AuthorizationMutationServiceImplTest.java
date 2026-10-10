package com.tamdao.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tamdao.authorization.ScopeType;
import com.tamdao.modal.User;
import com.tamdao.repository.authorization.AuthorizationAssignmentRepository;
import com.tamdao.service.AuthorizationAuditService;
import com.tamdao.service.AuthorizationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorizationMutationServiceImplTest {

    @Mock
    private AuthorizationAssignmentRepository assignmentRepository;

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private AuthorizationAuditService auditService;

    @Test
    void serializesAuditReasonAsValidJson() throws Exception {
        User user = mock(User.class);
        when(user.getId()).thenReturn(42L);
        when(assignmentRepository.hasActiveAssignment(42L, "ROLE_CASHIER", "BRANCH:7", null))
                .thenReturn(false);
        when(assignmentRepository.findRoleId("ROLE_CASHIER")).thenReturn(5L);

        AuthorizationMutationServiceImpl service = new AuthorizationMutationServiceImpl(
                assignmentRepository, authorizationService, auditService, new ObjectMapper());

        service.ensureAssignment(user, "ROLE_CASHIER", ScopeType.BRANCH,
                3L, 7L, "reason \"with\" quotes");

        ArgumentCaptor<String> metadataCaptor = ArgumentCaptor.forClass(String.class);
        verify(auditService).recordMutation(
                org.mockito.ArgumentMatchers.isNull(),
                org.mockito.ArgumentMatchers.eq("authorization.assignment.created"),
                org.mockito.ArgumentMatchers.isNull(),
                org.mockito.ArgumentMatchers.eq("user_role_assignment"),
                org.mockito.ArgumentMatchers.eq("42"),
                org.mockito.ArgumentMatchers.eq(ScopeType.BRANCH),
                org.mockito.ArgumentMatchers.eq(7L),
                org.mockito.ArgumentMatchers.eq("ASSIGNMENT_MUTATION"),
                metadataCaptor.capture());

        JsonNode metadata = new ObjectMapper().readTree(metadataCaptor.getValue());
        assertEquals("reason \"with\" quotes", metadata.get("reason").asText());
    }
}
