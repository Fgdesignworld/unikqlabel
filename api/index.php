<?php
/**
 * API Entry Point — KoffeeKup
 * 
 * All requests are routed through this file.
 */

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Load .env from project root BEFORE middleware (so CORS_ORIGIN is available)
(function () {
    $envFile = dirname(__DIR__) . '/.env';
    if (!file_exists($envFile)) {
        return;
    }
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key   = trim($key);
        $value = trim($value);
        // Strip optional surrounding quotes
        if (strlen($value) >= 2 && in_array($value[0], ['"', "'"], true) && $value[0] === $value[-1]) {
            $value = substr($value, 1, -1);
        }
        if (!array_key_exists($key, $_ENV)) {
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
})();

// Security Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
}
header('Content-Security-Policy: default-src \'none\'; script-src \'self\' \'unsafe-inline\' https://www.googletagmanager.com https://checkout.razorpay.com https://static.cloudflareinsights.com; connect-src \'self\' https://www.google-analytics.com https://stats.g.doubleclick.net https://api.razorpay.com https://lumberjack.razorpay.com; img-src \'self\' data: https://www.google-analytics.com https://www.googletagmanager.com https://cdn.razorpay.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com https://checkout.razorpay.com; font-src https://fonts.gstatic.com https://checkout.razorpay.com; frame-src https://api.razorpay.com https://checkout.razorpay.com;');

// Session config (secure)
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', '1');
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    ini_set('session.cookie_secure', '1');
} else {
    ini_set('session.cookie_secure', '0');
}

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Load middleware
require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/middleware/csrf.php';
require_once __DIR__ . '/helpers/security.php';
require_once __DIR__ . '/helpers/upload.php';

// Handle CORS
handleCors();

// Check if this is a request for a static file (e.g., product images)
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize URI by removing /api if present
$cleanUri = preg_replace('#^/api#', '', $uri);

// Build absolute path to file in the uploads directory
$pathParts = explode('/', ltrim($cleanUri, '/'));
$baseUploads = realpath(__DIR__ . '/uploads');
$filePath = realpath(__DIR__ . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $pathParts));

// Prevent Path Traversal by ensuring the file is within the uploads directory
if (strpos($cleanUri, '/uploads/') === 0 && $filePath && strpos($filePath, $baseUploads) === 0 && is_file($filePath)) {
    $mime = mime_content_type($filePath);
    
    // Only serve image MIME types — block everything else
    $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/x-icon'];
    if (!in_array($mime, $allowedMimes, true)) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden file type']);
        exit;
    }

    header_remove('Content-Type');
    header('Content-Type: ' . $mime);
    header('Cache-Control: public, max-age=86400');
    header('Content-Disposition: inline');
    // Tighten CSP for images instead of removing it entirely
    header('Content-Security-Policy: default-src \'none\'; img-src \'self\'; style-src \'none\'; script-src \'none\'');
    readfile($filePath);
    exit;
}

// Default to JSON for API responses
header('Content-Type: application/json; charset=UTF-8');

// Load router
require_once __DIR__ . '/routes/api.php';

// Route the request
handleRequest();
