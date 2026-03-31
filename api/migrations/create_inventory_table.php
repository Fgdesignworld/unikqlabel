<?php
/**
 * Migration: Create product_variant_inventory table
 * Run: php api/migrations/create_inventory_table.php
 */
require_once __DIR__ . '/../config/database.php';

$db = getDB();

$exists = $db->query("SHOW TABLES LIKE 'product_variant_inventory'")->rowCount();
if ($exists) {
    echo "[SKIP] product_variant_inventory already exists\n";
    exit(0);
}

$db->exec("
    CREATE TABLE product_variant_inventory (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        product_id   INT NOT NULL,
        size         VARCHAR(50)  DEFAULT NULL,
        color        VARCHAR(100) DEFAULT NULL,
        stock        INT NOT NULL DEFAULT 0,
        sku          VARCHAR(100) DEFAULT NULL,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_variant (product_id, size, color),
        INDEX idx_product (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

echo "[OK] product_variant_inventory table created\n";
