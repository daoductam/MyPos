package com.tamdao.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tamdao.authorization.AuthorizationAssignment;
import com.tamdao.authorization.AuthorizationGrant;
import com.tamdao.authorization.AuthorizationOverride;
import com.tamdao.authorization.AuthorizationProfile;
import com.tamdao.authorization.AuthorizationSnapshot;
import com.tamdao.authorization.AuthorizationUnavailableException;
import com.tamdao.authorization.ScopeType;
import com.tamdao.repository.authorization.AuthorizationSnapshotRepository;
import com.tamdao.repository.authorization.AuthorizationSnapshotRepository.AuthorizationIdentity;
import com.tamdao.repository.authorization.AuthorizationSnapshotRepository.AuthorizationUserProfile;
import com.tamdao.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorizationServiceImpl implements AuthorizationService {

    private static final String SNAPSHOT_KEY_PREFIX = "authz:v2:";
    private static final long SNAPSHOT_TTL_MINUTES = 5L;

    private final AuthorizationSnapshotRepository snapshotRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public AuthorizationSnapshot getSnapshotByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new UsernameNotFoundException("Email is required");
        }
        AuthorizationIdentity identity = snapshotRepository.findIdentityByEmail(email);
        return getSnapshot(identity);
    }

    @Override
    public AuthorizationSnapshot getSnapshotByUserId(Long userId) {
        AuthorizationIdentity identity = snapshotRepository.findIdentityByUserId(userId);
        return getSnapshot(identity);
    }

    @Override
    public AuthorizationProfile getProfile(String email) {
        AuthorizationSnapshot snapshot = getSnapshotByEmail(email);
        AuthorizationUserProfile user = snapshotRepository.findUserProfile(snapshot.userId());

        List<AuthorizationProfile.RoleScope> roles = snapshot.assignments().stream()
                .map(assignment -> new AuthorizationProfile.RoleScope(
                        assignment.roleCode(),
                        new AuthorizationProfile.CapabilityScope(
                                assignment.scopeType(),
                                assignment.storeId() == null ? List.of() : List.of(assignment.storeId()),
                                assignment.branchId() == null ? List.of() : List.of(assignment.branchId()))))
                .distinct()
                .toList();

        Set<String> candidateCapabilities = new TreeSet<>();
        snapshot.grants().stream()
                .map(AuthorizationGrant::permissionCode)
                .forEach(candidateCapabilities::add);
        snapshot.overrides().stream()
                .map(AuthorizationOverride::permissionCode)
                .forEach(candidateCapabilities::add);
        List<String> capabilities = candidateCapabilities.stream()
                .filter(permission -> hasPermission(snapshot, permission, null, null, null, null))
                .toList();

        return new AuthorizationProfile(
                new AuthorizationProfile.ProfileUser(user.id(), user.email(), user.fullName(), user.phone(), user.active()),
                roles,
                List.copyOf(capabilities),
                snapshot.authorizationVersion());
    }

    @Override
    public Set<GrantedAuthority> getAuthorities(AuthorizationSnapshot snapshot) {
        Set<String> authorityNames = new LinkedHashSet<>();

        if (snapshot.legacyRoleCode() != null) {
            authorityNames.add(snapshot.legacyRoleCode());
            String canonicalRoleCode = canonicalRole(snapshot.legacyRoleCode());
            if (canonicalRoleCode != null) {
                authorityNames.add(canonicalRoleCode);
            }
        }
        snapshot.assignments().stream()
                .map(AuthorizationAssignment::roleCode)
                .filter(Objects::nonNull)
                .forEach(authorityNames::add);

        snapshot.grants().stream()
                .map(AuthorizationGrant::permissionCode)
                .filter(permission -> hasPermission(snapshot, permission, null, null, null, null))
                .forEach(authorityNames::add);

        snapshot.overrides().stream()
                .filter(override -> "GRANT".equalsIgnoreCase(override.effect()))
                .map(AuthorizationOverride::permissionCode)
                .filter(permission -> hasPermission(snapshot, permission, null, null, null, null))
                .forEach(authorityNames::add);

        return authorityNames.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public boolean hasPermission(Authentication authentication, String permissionCode) {
        if (authentication == null || authentication.getName() == null) {
            return false;
        }
        try {
            return hasPermission(getSnapshotByEmail(authentication.getName()), permissionCode,
                    null, null, null, null);
        } catch (RuntimeException ex) {
            log.warn("Authorization lookup failed for protected permission evaluation");
            return false;
        }
    }

    @Override
    public boolean hasPermission(Authentication authentication, String permissionCode, ScopeType targetScope,
                                 Long storeId, Long branchId, Long subjectUserId) {
        if (authentication == null || authentication.getName() == null) {
            return false;
        }
        try {
            return hasPermission(getSnapshotByEmail(authentication.getName()), permissionCode,
                    targetScope, storeId, branchId, subjectUserId);
        } catch (RuntimeException ex) {
            log.warn("Scoped authorization lookup failed for protected permission evaluation");
            return false;
        }
    }

    @Override
    public TokenIdentity getTokenIdentity(String email) {
        AuthorizationIdentity identity = snapshotRepository.findIdentityByEmail(email);
        return new TokenIdentity(identity.userId(), identity.email(), identity.legacyRoleCode(), identity.authorizationVersion());
    }

    @Override
    public void invalidate(Long userId) {
        if (userId == null) {
            return;
        }
        try {
            Set<String> keys = redisTemplate.keys(SNAPSHOT_KEY_PREFIX + userId + ":*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (DataAccessException ex) {
            log.warn("Could not invalidate authorization snapshot for user {}", userId);
        }
    }

    private AuthorizationSnapshot getSnapshot(AuthorizationIdentity identity) {
        String cacheKey = SNAPSHOT_KEY_PREFIX + identity.userId() + ":" + identity.authorizationVersion();
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null && !cached.isBlank()) {
                return objectMapper.readValue(cached, AuthorizationSnapshot.class);
            }
        } catch (Exception ex) {
            log.warn("Authorization snapshot cache unavailable; falling back to database");
        }

        try {
            AuthorizationSnapshot snapshot = snapshotRepository.loadSnapshot(identity);
            try {
                redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(snapshot),
                        SNAPSHOT_TTL_MINUTES, TimeUnit.MINUTES);
            } catch (Exception ex) {
                log.warn("Could not write authorization snapshot cache for user {}", identity.userId());
            }
            return snapshot;
        } catch (DataAccessException ex) {
            throw new AuthorizationUnavailableException("Authorization data is unavailable", ex);
        }
    }

    private boolean hasPermission(AuthorizationSnapshot snapshot, String permissionCode, ScopeType targetScope,
                                  Long storeId, Long branchId, Long subjectUserId) {
        if (permissionCode == null || permissionCode.isBlank()) {
            return false;
        }
        String normalizedCode = permissionCode.trim().toLowerCase();
        List<AuthorizationGrant> matchingGrants = snapshot.grants().stream()
                .filter(grant -> normalizedCode.equals(grant.permissionCode().toLowerCase()))
                .filter(grant -> targetScope == null || scopeAllows(
                        grant.assignmentScope(), grant.storeId(), grant.branchId(),
                        targetScope, storeId, branchId, subjectUserId, snapshot.userId()))
                .toList();

        List<AuthorizationOverride> matchingOverrides = snapshot.overrides().stream()
                .filter(override -> normalizedCode.equals(override.permissionCode().toLowerCase()))
                .filter(override -> targetScope == null || scopeAllows(
                        override.scopeType(), override.storeId(), override.branchId(),
                        targetScope, storeId, branchId, subjectUserId, snapshot.userId()))
                .filter(override -> override.assignmentId() == null || snapshot.assignments().stream()
                        .anyMatch(assignment -> Objects.equals(assignment.id(), override.assignmentId())))
                .toList();

        boolean denied = matchingOverrides.stream().anyMatch(override -> "DENY".equalsIgnoreCase(override.effect()));
        if (denied) {
            return false;
        }
        return matchingGrants.stream().anyMatch(grant -> true)
                || matchingOverrides.stream().anyMatch(override -> "GRANT".equalsIgnoreCase(override.effect()));
    }

    private boolean scopeAllows(ScopeType grantedScope, Long grantedStoreId, Long grantedBranchId,
                                ScopeType targetScope, Long targetStoreId, Long targetBranchId,
                                Long subjectUserId, Long snapshotUserId) {
        if (targetScope == null) {
            return true;
        }
        return switch (grantedScope) {
            case PLATFORM -> true;
            case STORE -> (targetScope == ScopeType.STORE || targetScope == ScopeType.BRANCH
                    || targetScope == ScopeType.SELF)
                    && (targetScope == ScopeType.SELF
                    || Objects.equals(grantedStoreId, targetStoreId));
            case BRANCH -> (targetScope == ScopeType.BRANCH
                    && Objects.equals(grantedBranchId, targetBranchId))
                    || (targetScope == ScopeType.SELF
                    && Objects.equals(subjectUserId, snapshotUserId));
            case SELF -> targetScope == ScopeType.SELF
                    && (subjectUserId == null || Objects.equals(subjectUserId, snapshotUserId));
        };
    }

    public static String canonicalRole(String roleCode) {
        if ("ROLE_BRANCH_ADMIN".equals(roleCode)) {
            return "ROLE_BRANCH_MANAGER";
        }
        if ("ROLE_BRANCH_CASHIER".equals(roleCode)) {
            return "ROLE_CASHIER";
        }
        return roleCode;
    }

}
