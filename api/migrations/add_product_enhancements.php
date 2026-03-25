<?php
/**
 * Migration: Add discount_price, gallery_images, and sort_order to products table
 * Safe to run multiple times (uses ADD COLUMN IF NOT EXISTS / ALTER IGNORE).
 *
 * Run via CLI: php api/migrations/add_product_enhancements.php
 */

require_once __DIR__ . '/../config/database.php';

$db = getDB();

$migrations = [
    // Discount / sale price (null = no discount)
    "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS
        `discount_price` DECIMAL(10,2) DEFAULT NULL AFTER `price`",

    // Gallery images as JSON array of path strings
    "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS
        `gallery_images` JSON DEFAULT NULL AFTER `image`",

    // Sort order (already referenced in queries — add if missing)
    "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS
        `sort_order` INT UNSIGNED DEFAULT 0 AFTER `status`",

    // Index on price for fast range filters
    "ALTER TABLE `products` ADD INDEX IF NOT EXISTS `idx_price` (`price`)",

    // Index on is_veg for fast dietary filter
    "ALTER TABLE `products` ADD INDEX IF NOT EXISTS `idx_is_veg` (`is_veg`)",
];

$errors = 0;
foreach ($migrations as $sql) {
    try {
        $db->exec($sql);
        echo "✓ OK\n";
    } catch (PDOException $e) {
        // MySQL < 8.0 doesn't support IF NOT EXISTS on ALTER TABLE ADD COLUMN
        // Fall back to checking INFORMATION_SCHEMA
        if (str_contains($e->getMessage(), 'Duplicate column name')) {
            echo "  (column already exists — skipped)\n";
        } elseif (str_contains($e->getMessage(), 'Duplicate key name')) {
            echo "  (index already exists — skipped)\n";
        } else {
            echo "✗ ERROR: " . $e->getMessage() . "\n";
            $errors++;
        }
    }
}

echo $errors === 0
    ? "\nMigration complete — all columns/indexes are in place.\n"
    : "\nMigration finished with {$errors} error(s). Review above.\n";
