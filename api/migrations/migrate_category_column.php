<?php
/**
 * Migration: Convert products.category from ENUM to VARCHAR
 * and fix all existing products that have invalid/empty categories.
 * 
 * Run: php api/migrations/migrate_category_column.php
 */

require_once __DIR__ . '/../config/database.php';
$db = getDB();

echo "Step 1: ALTER products.category from ENUM to VARCHAR(100)...\n";
$db->exec("ALTER TABLE products MODIFY COLUMN category VARCHAR(100) NOT NULL DEFAULT 'men'");
echo "  Done.\n";

echo "Step 2: Get first real active category (skip test entries)...\n";
$stmt = $db->prepare("SELECT slug FROM categories WHERE status = 'active' AND slug IN ('men','women','unisex','limited') ORDER BY sort_order ASC LIMIT 1");
$stmt->execute();
$defaultCat = $stmt->fetchColumn() ?: 'men';
echo "  Default = $defaultCat\n";

echo "Step 3: Fix products with empty/null/old categories...\n";
$oldFoodCats = ['snacks', 'pickles', 'spices', 'sweets'];
$placeholders = implode(',', array_fill(0, count($oldFoodCats), '?'));

// Fix empty/null
$n1 = $db->exec("UPDATE products SET category = '$defaultCat' WHERE category IS NULL OR TRIM(category) = ''");
echo "  Fixed $n1 products with empty/null category.\n";

// Fix old food categories
$stmt = $db->prepare("UPDATE products SET category = '$defaultCat' WHERE category IN ($placeholders)");
$stmt->execute($oldFoodCats);
$n2 = $stmt->rowCount();
echo "  Fixed $n2 products with old food categories.\n";

echo "Step 4: Final product list:\n";
$rows = $db->query("SELECT id, name, category FROM products ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo "  [{$r['id']}] {$r['name']}  category={$r['category']}\n";
}

echo "\nMigration complete.\n";
