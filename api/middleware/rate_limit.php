<?php
/**
 * Rate Limiting Middleware — File-based brute force + abuse protection
 *
 * Limits per action (per IP, per time window):
 *   login    — 5  attempts / 15 min
 *   checkout — 10 attempts / 60 min
 *   coupon   — 15 attempts / 15 min
 *   default  — 60 attempts / 60 min
 */

define('RATE_LIMIT_DIR', __DIR__ . '/../storage/rate_limits');

$RATE_LIMIT_CONFIG = [
    'login'          => ['max' => 5,  'window' => 900],
    'checkout'       => ['max' => 10, 'window' => 3600],
    'coupon'         => ['max' => 15, 'window' => 900],
    'contact_submit' => ['max' => 5,  'window' => 300],
    'review_submit'  => ['max' => 3,  'window' => 3600],
    'default'        => ['max' => 60, 'window' => 3600],
];

function checkRateLimit(string $action = 'default'): void {
    global $RATE_LIMIT_CONFIG;

    if (!is_dir(RATE_LIMIT_DIR)) {
        mkdir(RATE_LIMIT_DIR, 0755, true);
    }

    $cfg    = $RATE_LIMIT_CONFIG[$action] ?? $RATE_LIMIT_CONFIG['default'];
    $max    = $cfg['max'];
    $window = $cfg['window'];

    $ip   = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $key  = hash('sha256', $ip . '_' . $action); // sha256 > md5 for key safety
    $file = RATE_LIMIT_DIR . '/' . $key . '.json';

    $attempts = [];
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        if (is_array($data)) {
            $cutoff   = time() - $window;
            $attempts = array_values(array_filter($data, fn($t) => $t > $cutoff));
        }
    }

    if (count($attempts) >= $max) {
        require_once __DIR__ . '/../helpers/security.php';
        logSecurityEvent('rate_limited', ['action' => $action, 'ip' => $ip]);
        http_response_code(429);
        echo json_encode([
            'error'       => 'Too many attempts. Please try again later.',
            'retry_after' => $window,
        ]);
        exit;
    }

    $attempts[] = time();
    file_put_contents($file, json_encode($attempts), LOCK_EX);
}

function clearRateLimit(string $action = 'default'): void {
    $ip   = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $key  = hash('sha256', $ip . '_' . $action);
    $file = RATE_LIMIT_DIR . '/' . $key . '.json';
    if (file_exists($file)) unlink($file);
}
