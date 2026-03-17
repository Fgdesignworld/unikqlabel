<?php
/**
 * Migration: Add notifications table
 * Run once via: php api/migrations/add_notifications_table.php
 */

require_once __DIR__ . '/../config/database.php';

$pdo = Database::getConnection();

$sql = "
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `type`         VARCHAR(50) NOT NULL DEFAULT 'new_order',
  `reference_id` INT UNSIGNED DEFAULT NULL,
  `message`      VARCHAR(500) NOT NULL,
  `is_read`      TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $pdo->exec($sql);
    echo json_encode(['success' => true, 'message' => 'notifications table created']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
