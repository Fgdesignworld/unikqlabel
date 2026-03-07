<?php
require_once __DIR__ . '/config/database.php';
$db = getDB();
try {
    $db->exec("ALTER TABLE products ADD COLUMN sort_order INT DEFAULT 0");
    echo "Column sort_order added successfully.\n";
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Column already exists.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
