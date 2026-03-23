-- ============================================
-- MODULE 4: Popups / Offers Table
-- Lakshmi Home Foods
-- ============================================

CREATE TABLE IF NOT EXISTS `popups` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title`        VARCHAR(200) NOT NULL,
  `description`  TEXT DEFAULT NULL,
  `image`        VARCHAR(500) DEFAULT NULL,
  `button_text`  VARCHAR(100) DEFAULT NULL,
  `button_link`  VARCHAR(500) DEFAULT NULL,
  `delay_seconds` INT UNSIGNED DEFAULT 2 COMMENT 'seconds after page load before showing',
  `is_active`    TINYINT(1) DEFAULT 0,
  `price`        DECIMAL(8, 2) UNSIGNED DEFAULT NULL COMMENT 'combo offer price',
  `header_background` VARCHAR(100) DEFAULT '#b91c1c' COMMENT 'header bg color (red, blue, green, etc)',
  `items`        JSON DEFAULT NULL COMMENT 'array of {id, name, weight, image} for combo items',
  `views`        INT UNSIGNED NOT NULL DEFAULT 0,
  `clicks`       INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
