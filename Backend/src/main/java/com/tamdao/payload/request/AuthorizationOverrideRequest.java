package com.tamdao.payload.request;

import com.tamdao.authorization.ScopeType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AuthorizationOverrideRequest(
        @NotNull Long userId,
        Long assignmentId,
        @NotBlank String permissionCode,
        @NotBlank String effect,
        @NotNull @Valid AuthorizationScopeRequest scope,
        LocalDateTime expiresAt,
        @NotBlank String reason
) {
}
