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
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
