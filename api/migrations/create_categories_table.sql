-- ============================================
-- MODULE 1: Categories Table
-- Lakshmi Home Foods — Run in laxmihome_db
-- ============================================

CREATE TABLE IF NOT EXISTS `categories` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`        VARCHAR(100) NOT NULL,
  `slug`        VARCHAR(100) NOT NULL UNIQUE,
  `image`       VARCHAR(500) DEFAULT NULL,
  `status`      ENUM('active', 'inactive') DEFAULT 'active',
  `sort_order`  INT UNSIGNED DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug`   (`slug`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default categories matching existing product ENUM
INSERT IGNORE INTO `categories` (`name`, `slug`, `status`, `sort_order`) VALUES
('Snacks',  'snacks',  'active', 1),
('Pickles', 'pickles', 'active', 2),
('Spices',  'spices',  'active', 3),
('Sweets',  'sweets',  'active', 4);

-- Add category_id FK to products (non-breaking — nullable, existing rows stay NULL)
ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `category_id` INT UNSIGNED DEFAULT NULL AFTER `category`,
  ADD INDEX IF NOT EXISTS `idx_category_id` (`category_id`);

-- Try adding the FK (will silently fail if categories table didn't exist before)
-- Run separately if needed:
-- ALTER TABLE `products` ADD CONSTRAINT `fk_products_category`
--   FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL;

-- Backfill category_id from string category column
UPDATE `products` p
JOIN `categories` c ON c.`slug` = CONVERT(p.`category` USING utf8mb4) COLLATE utf8mb4_unicode_ci
SET p.`category_id` = c.`id`
WHERE p.`category_id` IS NULL;
