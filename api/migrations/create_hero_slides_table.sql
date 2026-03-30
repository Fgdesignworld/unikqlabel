-- Hero Slides Table Migration
-- Run this SQL in your MySQL database to create the hero_slides table.

CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id`                   INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title`                VARCHAR(255) NOT NULL,
  `subtitle`             TEXT         NULL,
  `tagline`              VARCHAR(255) NULL COMMENT 'e.g. Luxury Streetwear · Est. 2024',
  `cta_primary_text`     VARCHAR(100) NULL,
  `cta_primary_link`     VARCHAR(255) NULL,
  `cta_secondary_text`   VARCHAR(100) NULL,
  `cta_secondary_link`   VARCHAR(255) NULL,
  `image`                VARCHAR(500) NULL,
  `mobile_image`         VARCHAR(500) NULL,
  `badge_text`           VARCHAR(100) NULL COMMENT 'e.g. Limited Drops',
  `badge_icon`           VARCHAR(100) NULL COMMENT 'lucide icon name e.g. Crown, Zap',
  `category`             ENUM('men','women','unisex','trending','limited') NOT NULL DEFAULT 'unisex',
  `product_ids`          JSON         NULL COMMENT 'Array of linked product IDs',
  `price_label`          VARCHAR(100) NULL,
  `is_active`            TINYINT(1)   NOT NULL DEFAULT 1,
  `sort_order`           INT          NOT NULL DEFAULT 0,
  `start_date`           DATETIME     NULL,
  `end_date`             DATETIME     NULL,
  `created_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_is_active`  (`is_active`),
  INDEX `idx_sort_order` (`sort_order`),
  INDEX `idx_category`   (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed with one default slide so the admin list is not empty
INSERT INTO `hero_slides`
  (title, subtitle, tagline, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link, badge_text, badge_icon, category, is_active, sort_order)
VALUES
  ('Where Kings & Queens Reign', 'Bold. Structured. Built for kings who lead the streets.', 'Luxury Streetwear · Est. 2024', 'Shop Now', '/products', 'Explore Collections', '/#collections', 'New Arrivals', 'Crown', 'men', 1, 0);
