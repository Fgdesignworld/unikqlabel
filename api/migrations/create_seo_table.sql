-- ============================================
-- MODULE 2: SEO Table
-- Lakshmi Home Foods
-- ============================================

CREATE TABLE IF NOT EXISTS `seo` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `page_type`        ENUM('home','product','category','page') NOT NULL,
  `page_id`          INT UNSIGNED DEFAULT NULL COMMENT 'product/category id; NULL for home/page',
  `page_slug`        VARCHAR(200) DEFAULT NULL COMMENT 'for static pages like about, contact',
  `meta_title`       VARCHAR(160) DEFAULT NULL,
  `meta_description` VARCHAR(320) DEFAULT NULL,
  `meta_keywords`    VARCHAR(500) DEFAULT NULL,
  `og_image`         VARCHAR(500) DEFAULT NULL,
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_seo` (`page_type`, `page_id`, `page_slug`),
  INDEX `idx_type_id`   (`page_type`, `page_id`),
  INDEX `idx_type_slug` (`page_type`, `page_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default home page SEO
INSERT IGNORE INTO `seo` (`page_type`, `page_id`, `page_slug`, `meta_title`, `meta_description`, `meta_keywords`)
VALUES ('home', NULL, 'home',
        'Lakshmi Home Foods — Authentic Homemade Pickles, Snacks & Spices',
        'Order authentic homemade pickles, snacks, spices and sweets from Lakshmi Home Foods. Fresh, traditional recipes delivered to your door.',
        'homemade pickles, snacks, spices, sweets, traditional food, Lakshmi Home Foods');
