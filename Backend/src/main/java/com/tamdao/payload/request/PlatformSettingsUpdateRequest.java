package com.tamdao.payload.request;

import lombok.Data;

@Data
public class PlatformSettingsUpdateRequest {
    private Boolean maintenanceMode;
    private Boolean newStore;
    private Boolean subscriptionRenewal;
    private Boolean systemAlerts;
}
