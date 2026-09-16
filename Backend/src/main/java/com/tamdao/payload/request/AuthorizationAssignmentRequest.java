package com.tamdao.payload.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AuthorizationAssignmentRequest(
        @NotNull Long userId,
        @NotBlank String roleCode,
        @NotNull @Valid AuthorizationScopeRequest scope,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        @NotBlank String reason
) {
}
