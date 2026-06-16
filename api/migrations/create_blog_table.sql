-- ============================================
-- Blog Posts Table
-- Run in your application database
-- ============================================

CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id`           INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  `title`        VARCHAR(300)     NOT NULL,
  `slug`         VARCHAR(300)     NOT NULL UNIQUE,
  `excerpt`      TEXT             DEFAULT NULL,
  `content`      LONGTEXT         DEFAULT NULL,
  `cover_image`  VARCHAR(500)     DEFAULT NULL,
  `author`       VARCHAR(150)     NOT NULL DEFAULT 'Admin',
  `category`     VARCHAR(100)     NOT NULL DEFAULT 'General',
  `tags`         TEXT             DEFAULT NULL,          -- JSON array: ["tag1","tag2"]
  `status`       ENUM('draft','published') NOT NULL DEFAULT 'draft',
  `featured`     TINYINT(1)       NOT NULL DEFAULT 0,
  `views`        INT UNSIGNED     NOT NULL DEFAULT 0,
  `read_time`    TINYINT UNSIGNED DEFAULT NULL,          -- estimated minutes
  `meta_title`   VARCHAR(300)     DEFAULT NULL,
  `meta_desc`    TEXT             DEFAULT NULL,
  `published_at` TIMESTAMP        NULL DEFAULT NULL,
  `created_at`   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_slug`      (`slug`),
  INDEX `idx_status`    (`status`),
  INDEX `idx_featured`  (`featured`),
  INDEX `idx_published` (`published_at`),
  INDEX `idx_category`  (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
