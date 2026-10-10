package com.tamdao.service;

import com.tamdao.payload.dto.PlatformSettingsDTO;
import com.tamdao.payload.request.PlatformSettingsUpdateRequest;

public interface PlatformSettingsService {
    PlatformSettingsDTO getSettings();

    PlatformSettingsDTO updateSettings(PlatformSettingsUpdateRequest request);
}
