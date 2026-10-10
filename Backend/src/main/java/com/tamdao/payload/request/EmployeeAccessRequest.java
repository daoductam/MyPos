package com.tamdao.payload.request;

import jakarta.validation.constraints.NotNull;

public record EmployeeAccessRequest(@NotNull Boolean enabled) {
}
