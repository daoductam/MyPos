package com.tamdao.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank @Size(max = 255) String fullName,
        @Size(max = 255) String phone) {
}
