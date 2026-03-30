<?php
/**
 * Migration: Add original_price and discount_percent to order_items
 * Run once: php api/migrations/add_original_price_to_order_items.php
 */
require_once __DIR__ . '/../config/database.php';

$db = getDB();

$checks = $db->query("SHOW COLUMNS FROM order_items LIKE 'original_price'")->fetchAll();

if (empty($checks)) {
    $db->exec("ALTER TABLE order_items
        ADD COLUMN original_price DECIMAL(10,2) NULL DEFAULT NULL AFTER price,
        ADD COLUMN discount_percent DECIMAL(5,2) NULL DEFAULT NULL AFTER original_price
    ");
    echo "[OK] original_price and discount_percent columns added to order_items\n";
} else {
    echo "[SKIP] Columns already exist\n";
}
