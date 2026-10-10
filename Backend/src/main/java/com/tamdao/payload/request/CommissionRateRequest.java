package com.tamdao.payload.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record CommissionRateRequest(
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0") Double rate
) {
}
