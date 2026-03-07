<?php
/**
 * API Entry Point — Lakshmi Home Foods
 * 
 * All requests are routed through this file.
 */

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Session config (secure)
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', '1');

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Load middleware
require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/middleware/csrf.php';

// Handle CORS
handleCors();

// Check if this is a request for a static file (e.g., product images)
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize URI by removing /api if present (Vite rewrite should do this, but let's be safe)
$cleanUri = preg_replace('#^/api#', '', $uri);

// Build absolute path to file in the uploads directory
$pathParts = explode('/', ltrim($cleanUri, '/'));
$filePath = __DIR__ . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $pathParts);

if (strpos($cleanUri, '/uploads/') === 0 && file_exists($filePath) && is_file($filePath)) {
    $mime = mime_content_type($filePath);
    // Clear any previous content-type
    header_remove('Content-Type');
    header('Content-Type: ' . $mime);
    header('Cache-Control: public, max-age=86400');
    readfile($filePath);
    exit;
}

// Default to JSON for API responses
header('Content-Type: application/json; charset=UTF-8');

// Load router
require_once __DIR__ . '/routes/api.php';

// Route the request
handleRequest();
