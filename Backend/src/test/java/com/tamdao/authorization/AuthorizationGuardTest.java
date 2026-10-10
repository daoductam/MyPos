package com.tamdao.authorization;

import com.tamdao.repository.authorization.AuthorizationScopeRepository;
import com.tamdao.service.AuthorizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorizationGuardTest {

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private AuthorizationScopeRepository scopeRepository;

    @Mock
    private Authentication authentication;

    private AuthorizationGuard guard;

    @BeforeEach
    void setUp() {
        guard = new AuthorizationGuard(authorizationService, scopeRepository);
    }

    @Test
    void deniesStorePermissionWhenStoreDoesNotExist() {
        when(scopeRepository.storeExists(10L)).thenReturn(false);

        assertFalse(guard.hasStorePermission(authentication, "inventory.update", 10L));
        verify(authorizationService, never()).hasPermission(
                authentication, "inventory.update", ScopeType.STORE, 10L, null, null);
    }

    @Test
    void checksBranchPermissionAgainstResolvedStore() {
        when(scopeRepository.branchStoreId(20L)).thenReturn(10L);
        when(authorizationService.hasPermission(
                authentication, "inventory.update", ScopeType.BRANCH, 10L, 20L, null))
                .thenReturn(true);

        assertTrue(guard.hasBranchPermission(authentication, "inventory.update", 20L));
    }

    @Test
    void allowsBranchReaderToReadStoreResourceInSameStore() {
        when(scopeRepository.storeExists(10L)).thenReturn(true);
        when(authorizationService.hasPermission(
                authentication, "product.read", ScopeType.STORE, 10L, null, null))
                .thenReturn(false);
        when(authentication.getDetails()).thenReturn(new AuthorizationSnapshot(
                15L, "cashier@example.com", "ROLE_CASHIER", 1L, null, null, null));
        when(scopeRepository.userScope(15L))
                .thenReturn(new AuthorizationScopeRepository.UserScope(10L, 20L));
        when(scopeRepository.branchStoreId(20L)).thenReturn(10L);
        when(authorizationService.hasPermission(
                authentication, "product.read", ScopeType.BRANCH, 10L, 20L, null))
                .thenReturn(true);

        assertTrue(guard.hasStoreOrBranchPermission(authentication, "product.read", 10L));
    }

    @Test
    void failsClosedWhenScopeRepositoryThrows() {
        when(scopeRepository.customerScope(30L)).thenThrow(new IllegalStateException("database unavailable"));

        assertFalse(guard.hasCustomerPermission(authentication, "customer.read", 30L));
        verify(authorizationService, never()).hasPermission(
                authentication, "customer.read", ScopeType.STORE, null, null, null);
    }

    @Test
    void selfPermissionCannotBeUsedForAnotherUser() {
        when(authentication.getDetails()).thenReturn(new AuthorizationSnapshot(
                15L, "cashier@example.com", "ROLE_CASHIER", 1L, null, null, null));

        assertFalse(guard.hasSelfPermission(authentication, "profile.update_own", 16L));
        verify(authorizationService, never()).hasPermission(
                authentication, "profile.update_own", ScopeType.SELF, null, null, 16L);
    }
}
