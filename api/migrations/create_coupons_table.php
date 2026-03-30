<?php
/**
 * Migration: Create coupons table + add coupon columns to orders
 * Run once: php api/migrations/create_coupons_table.php
 */

require_once __DIR__ . '/../config/database.php';

$db = getDB();

echo "Running coupon migration...\n";

// ─── 1. Create coupons table ─────────────────────────────────────────────────
try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS `coupons` (
            `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `code`             VARCHAR(50)        NOT NULL UNIQUE,
            `type`             ENUM('percentage','fixed') NOT NULL DEFAULT 'percentage',
            `value`            DECIMAL(10,2)      NOT NULL,
            `min_order_amount` DECIMAL(10,2)      DEFAULT NULL,
            `max_discount`     DECIMAL(10,2)      DEFAULT NULL,
            `usage_limit`      INT UNSIGNED       DEFAULT NULL,
            `used_count`       INT UNSIGNED       NOT NULL DEFAULT 0,
            `user_limit`       INT UNSIGNED       DEFAULT NULL,
            `expires_at`       DATETIME           DEFAULT NULL,
            `is_active`        TINYINT(1)         NOT NULL DEFAULT 1,
            `created_at`       DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at`       DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "[OK] coupons table created (or already exists)\n";
} catch (PDOException $e) {
    echo "[FAIL] coupons table: " . $e->getMessage() . "\n";
    exit(1);
}

// ─── 2. Add coupon_code column to orders (safe — ignore if exists) ────────────
try {
    $db->exec("ALTER TABLE `orders` ADD COLUMN `coupon_code` VARCHAR(50) DEFAULT NULL");
    echo "[OK] orders.coupon_code column added\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false || strpos($e->getMessage(), 'already exists') !== false) {
        echo "[SKIP] orders.coupon_code already exists\n";
    } else {
        echo "[FAIL] orders.coupon_code: " . $e->getMessage() . "\n";
        exit(1);
    }
}

// ─── 3. Add discount_amount column to orders (safe — ignore if exists) ────────
try {
    $db->exec("ALTER TABLE `orders` ADD COLUMN `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00");
    echo "[OK] orders.discount_amount column added\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false || strpos($e->getMessage(), 'already exists') !== false) {
        echo "[SKIP] orders.discount_amount already exists\n";
    } else {
        echo "[FAIL] orders.discount_amount: " . $e->getMessage() . "\n";
        exit(1);
    }
}

echo "\nMigration complete.\n";
