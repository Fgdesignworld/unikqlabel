<?php
require_once __DIR__ . '/../config/database.php';
$db = getDB();

// Check PDO error mode
echo "PDO error mode: " . $db->getAttribute(PDO::ATTR_ERRMODE) . "\n";

// Check triggers
$triggers = $db->query("SHOW TRIGGERS LIKE 'products'")->fetchAll(PDO::FETCH_ASSOC);
echo "Triggers: " . count($triggers) . "\n";
foreach ($triggers as $t) { print_r($t); }

// Check CREATE TABLE
$create = $db->query("SHOW CREATE TABLE products")->fetch(PDO::FETCH_ASSOC);
echo "\n" . ($create['Create Table'] ?? '') . "\n";
