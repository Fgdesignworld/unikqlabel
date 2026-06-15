<?php
require_once __DIR__ . '/../config/database.php';
$db = getDB();

$sql = file_get_contents(__DIR__ . '/add_subcategory_support.sql');
// Strip comment lines for PDO compatibility
$lines = explode("\n", $sql);
$statements = [];
$current = '';
foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || strpos($line, '--') === 0) continue;
    $current .= ' ' . $line;
    if (str_ends_with(rtrim($line), ';')) {
        $statements[] = trim($current);
        $current = '';
    }
}

foreach ($statements as $stmt) {
    if (empty($stmt)) continue;
    try {
        $db->exec($stmt);
        echo "OK: " . substr($stmt, 0, 60) . "...\n";
    } catch (PDOException $e) {
        echo "SKIP/ERR: " . $e->getMessage() . "\n";
    }
}

echo "\nDone.\n";
