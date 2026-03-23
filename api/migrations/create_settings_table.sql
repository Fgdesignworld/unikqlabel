-- ============================================
-- MODULE 3: Settings Table (Key-Value Store)
-- Lakshmi Home Foods
-- ============================================

CREATE TABLE IF NOT EXISTS `settings` (
  `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key`   VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT DEFAULT NULL,
  `setting_group` VARCHAR(50) DEFAULT 'general' COMMENT 'general|contact|social|branding|typography',
  `updated_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_key`   (`setting_key`),
  INDEX `idx_group` (`setting_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Default settings seed ───────────────────────────────────────────────────
INSERT IGNORE INTO `settings` (`setting_key`, `setting_value`, `setting_group`) VALUES
-- General
('site_name',          'Lakshmi Home Foods',             'general'),
('site_tagline',       'Authentic Homemade Goodness',    'general'),
('currency_symbol',    '₹',                              'general'),
('logo_url',           NULL,                             'general'),
('favicon_url',        NULL,                             'general'),

-- Contact
('phone',              NULL,                             'contact'),
('whatsapp',           NULL,                             'contact'),
('email',              NULL,                             'contact'),
('address',            NULL,                             'contact'),

-- Social
('social_facebook',    NULL,                             'social'),
('social_instagram',   NULL,                             'social'),
('social_youtube',     NULL,                             'social'),
('social_twitter',     NULL,                             'social'),

-- Branding / Theme
('theme_color',        '#f59e0b',                        'branding'),
('header_bg',          NULL,                             'branding'),
('footer_bg',          NULL,                             'branding'),

-- Typography
('font_heading',       'Playfair Display',               'typography'),
('font_body',          'Poppins',                        'typography');
