package com.tamdao.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettingsDTO {
    private Boolean maintenanceMode;
    private Boolean newStore;
    private Boolean subscriptionRenewal;
    private Boolean systemAlerts;
}
