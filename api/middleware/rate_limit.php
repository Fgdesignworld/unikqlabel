<?php
/**
 * Rate Limiting Middleware — File-based brute force protection
 * 
 * Limits: 5 attempts per 15 minutes per IP
 */

define('RATE_LIMIT_DIR', __DIR__ . '/../storage/rate_limits');
define('RATE_LIMIT_MAX', 5);
define('RATE_LIMIT_WINDOW', 900); // 15 minutes

function checkRateLimit(string $action = 'login'): void {
    if (!is_dir(RATE_LIMIT_DIR)) {
        mkdir(RATE_LIMIT_DIR, 0755, true);
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $key = md5($ip . '_' . $action);
    $file = RATE_LIMIT_DIR . '/' . $key . '.json';

    $attempts = [];

    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        if (is_array($data)) {
            // Filter out expired attempts
            $cutoff = time() - RATE_LIMIT_WINDOW;
            $attempts = array_filter($data, fn($t) => $t > $cutoff);
        }
    }

    if (count($attempts) >= RATE_LIMIT_MAX) {
        http_response_code(429);
        echo json_encode([
            'error' => 'Too many attempts. Please try again later.',
            'retry_after' => RATE_LIMIT_WINDOW
        ]);
        exit;
    }

    // Record this attempt
    $attempts[] = time();
    file_put_contents($file, json_encode(array_values($attempts)));
}

function clearRateLimit(string $action = 'login'): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $key = md5($ip . '_' . $action);
    $file = RATE_LIMIT_DIR . '/' . $key . '.json';
    
    if (file_exists($file)) {
        unlink($file);
    }
}
