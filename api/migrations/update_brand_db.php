<?php
/**
 * Migration: Update site name and tagline to Koffee Kup
 */

$configPath = dirname(__DIR__) . '/config/database.php';
require_once $configPath;

if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json');
}

try {
    $pdo = getDB();

    $stmt = $pdo->prepare("
        UPDATE `settings` 
        SET `setting_value` = 'Koffee Kup' 
        WHERE `setting_key` = 'site_name'
    ");
    $stmt->execute();

    $stmt2 = $pdo->prepare("
        UPDATE `settings` 
        SET `setting_value` = 'Ancient Wellness • Modern Indulgence' 
        WHERE `setting_key` = 'site_tagline'
    ");
    $stmt2->execute();

    echo json_encode(['success' => true, 'message' => 'site_name and site_tagline updated to Koffee Kup successfully']);
} catch (PDOException $e) {
    if (php_sapi_name() !== 'cli') {
        http_response_code(500);
    }
    echo json_encode(['error' => $e->getMessage()]);
}
