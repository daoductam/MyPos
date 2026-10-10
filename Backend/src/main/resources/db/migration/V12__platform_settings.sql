CREATE TABLE IF NOT EXISTS platform_settings (
    setting_key VARCHAR(100) NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_platform_settings PRIMARY KEY (setting_key)
) ENGINE = InnoDB COMMENT = 'Global platform settings managed by platform administrators';
