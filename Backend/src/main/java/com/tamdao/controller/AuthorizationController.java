package com.tamdao.controller;

import com.tamdao.authorization.AuthorizationProfile;
import com.tamdao.authorization.AuthorizationAssignmentView;
import com.tamdao.authorization.AuthorizationOverrideView;
import com.tamdao.payload.response.ApiResponse;
import com.tamdao.payload.request.AuthorizationAssignmentRequest;
import com.tamdao.payload.request.AuthorizationOverrideRequest;
import com.tamdao.service.AuthorizationAdminService;
import com.tamdao.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/authorization")
@RequiredArgsConstructor
public class AuthorizationController {

    private final AuthorizationService authorizationService;
    private final AuthorizationAdminService authorizationAdminService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthorizationProfile>> currentProfile(Authentication authentication) {
        AuthorizationProfile profile = authorizationService.getProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/assignments")
    @org.springframework.security.access.prepost.PreAuthorize("@authorizationGuard.hasPermission(authentication, 'platform.rbac.manage') or @authorizationGuard.hasPermission(authentication, 'store.rbac.manage')")
    public ResponseEntity<ApiResponse<java.util.List<AuthorizationAssignmentView>>> listAssignments(
            Authentication authentication,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long storeId) {
        return ResponseEntity.ok(ApiResponse.success(
                authorizationAdminService.listAssignments(authentication, userId, storeId)));
    }

    @PostMapping("/assignments")
    @org.springframework.security.access.prepost.PreAuthorize("@authorizationGuard.hasPermission(authentication, 'platform.rbac.manage') or @authorizationGuard.hasPermission(authentication, 'store.rbac.manage')")
    public ResponseEntity<ApiResponse<AuthorizationAssignmentView>> createAssignment(
            Authentication authentication,
            @Valid @RequestBody AuthorizationAssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                authorizationAdminService.createAssignment(authentication, request)));
    }

    @PatchMapping("/assignments/{assignmentId}")
    @org.springframework.security.access.prepost.PreAuthorize("@authorizationGuard.hasPermission(authentication, 'platform.rbac.manage') or @authorizationGuard.hasPermission(authentication, 'store.rbac.manage')")
    public ResponseEntity<ApiResponse<AuthorizationAssignmentView>> updateAssignment(
            Authentication authentication,
            @PathVariable Long assignmentId,
            @Valid @RequestBody AuthorizationAssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                authorizationAdminService.updateAssignment(authentication, assignmentId, request)));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    @org.springframework.security.access.prepost.PreAuthorize("@authorizationGuard.hasPermission(authentication, 'platform.rbac.manage') or @authorizationGuard.hasPermission(authentication, 'store.rbac.manage')")
    public ResponseEntity<Void> revokeAssignment(
            Authentication authentication,
            @PathVariable Long assignmentId,
            @RequestParam String reason) {
        authorizationAdminService.revokeAssignment(authentication, assignmentId, reason);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/overrides")
    @org.springframework.security.access.prepost.PreAuthorize("@authorizationGuard.hasPermission(authentication, 'platform.rbac.manage') or @authorizationGuard.hasPermission(authentication, 'store.rbac.manage')")
    public ResponseEntity<ApiResponse<java.util.List<AuthorizationOverrideView>>> listOverrides(
            Authentication authentication,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long storeId) {
        return ResponseEntity.ok(ApiResponse.success(
                authorizationAdminService.listOverrides(authentication, userId, storeId)));
    }

    @PostMapping("/overrides")
    @org.springframework.security.access.prepost.PreAuthorize("@authorizationGuard.hasPermission(authentication, 'platform.rbac.manage') or @authorizationGuard.hasPermission(authentication, 'store.rbac.manage')")
    public ResponseEntity<ApiResponse<AuthorizationOverrideView>> createOverride(
            Authentication authentication,
            @Valid @RequestBody AuthorizationOverrideRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                authorizationAdminService.createOverride(authentication, request)));
    }

    @DeleteMapping("/overrides/{overrideId}")
    @org.springframework.security.access.prepost.PreAuthorize("@authorizationGuard.hasPermission(authentication, 'platform.rbac.manage') or @authorizationGuard.hasPermission(authentication, 'store.rbac.manage')")
    public ResponseEntity<Void> revokeOverride(
            Authentication authentication,
            @PathVariable Long overrideId,
            @RequestParam String reason) {
        authorizationAdminService.revokeOverride(authentication, overrideId, reason);
        return ResponseEntity.noContent().build();
    }
}
