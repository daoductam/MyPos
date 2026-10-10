package com.tamdao.service.impl;

import com.tamdao.modal.PlatformSetting;
import com.tamdao.payload.dto.PlatformSettingsDTO;
import com.tamdao.payload.request.PlatformSettingsUpdateRequest;
import com.tamdao.repository.PlatformSettingRepository;
import com.tamdao.service.PlatformSettingsService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlatformSettingsServiceImpl implements PlatformSettingsService {

    private static final Map<String, Boolean> DEFAULTS = Map.of(
            "maintenanceMode", false,
            "newStore", true,
            "subscriptionRenewal", true,
            "systemAlerts", false
    );

    private final PlatformSettingRepository platformSettingRepository;

    @Override
    public PlatformSettingsDTO getSettings() {
        Map<String, Boolean> values = readValues();
        return toDto(values);
    }

    @Override
    @Transactional
    public PlatformSettingsDTO updateSettings(PlatformSettingsUpdateRequest request) {
        saveIfPresent("maintenanceMode", request.getMaintenanceMode());
        saveIfPresent("newStore", request.getNewStore());
        saveIfPresent("subscriptionRenewal", request.getSubscriptionRenewal());
        saveIfPresent("systemAlerts", request.getSystemAlerts());
        return getSettings();
    }

    private Map<String, Boolean> readValues() {
        Map<String, Boolean> values = new HashMap<>(DEFAULTS);
        platformSettingRepository.findAll().forEach(setting ->
                values.put(setting.getKey(), Boolean.parseBoolean(setting.getValue())));
        return values;
    }

    private void saveIfPresent(String key, Boolean value) {
        if (value == null) {
            return;
        }
        platformSettingRepository.save(PlatformSetting.builder()
                .key(key)
                .value(Boolean.toString(value))
                .build());
    }

    private PlatformSettingsDTO toDto(Map<String, Boolean> values) {
        return PlatformSettingsDTO.builder()
                .maintenanceMode(values.get("maintenanceMode"))
                .newStore(values.get("newStore"))
                .subscriptionRenewal(values.get("subscriptionRenewal"))
                .systemAlerts(values.get("systemAlerts"))
                .build();
    }
}
