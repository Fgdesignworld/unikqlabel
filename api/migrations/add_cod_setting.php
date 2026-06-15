<?php
/**
 * Migration: Add cod_enabled setting
 */

$configPath = dirname(__DIR__) . '/config/database.php';
require_once $configPath;

if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json');
}

try {
    $pdo = getDB();

    $sql = "
    INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_group`)
    VALUES ('cod_enabled', '1', 'payment')
    ON DUPLICATE KEY UPDATE `setting_group` = 'payment';
    ";

    $pdo->exec($sql);
    echo json_encode(['success' => true, 'message' => 'cod_enabled setting seeded successfully']);
} catch (PDOException $e) {
    if (php_sapi_name() !== 'cli') {
        http_response_code(500);
    }
    echo json_encode(['error' => $e->getMessage()]);
}
