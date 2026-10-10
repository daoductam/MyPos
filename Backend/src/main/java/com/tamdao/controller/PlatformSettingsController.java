package com.tamdao.controller;

import com.tamdao.payload.dto.PlatformSettingsDTO;
import com.tamdao.payload.request.PlatformSettingsUpdateRequest;
import com.tamdao.service.PlatformSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/platform/settings")
@RequiredArgsConstructor
public class PlatformSettingsController {

    private final PlatformSettingsService platformSettingsService;

    @GetMapping
    @PreAuthorize("@authorizationGuard.hasPlatformPermission(authentication, 'platform.settings.read')")
    public ResponseEntity<PlatformSettingsDTO> getSettings() {
        return ResponseEntity.ok(platformSettingsService.getSettings());
    }

    @PatchMapping
    @PreAuthorize("@authorizationGuard.hasPlatformPermission(authentication, 'platform.settings.update')")
    public ResponseEntity<PlatformSettingsDTO> updateSettings(
            @RequestBody PlatformSettingsUpdateRequest request) {
        return ResponseEntity.ok(platformSettingsService.updateSettings(request));
    }
}
