<?php
/**
 * CSRF Middleware — Token generation, validation, and rotation
 */

function generateCsrfToken(): string {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

/**
 * Rotate CSRF token — call after successful state-changing requests.
 * Returns the new token so the client can update its cached copy.
 */
function rotateCsrfToken(): string {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf_token'];
}

function validateCsrfToken(): bool {
    // Skip CSRF for safe methods
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (in_array($method, ['GET', 'HEAD', 'OPTIONS'])) {
        return true;
    }

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    
    if (empty($token) && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $key => $val) {
            if (strcasecmp($key, 'X-CSRF-Token') === 0) {
                $token = $val;
                break;
            }
        }
    }
    
    if (empty($token) || empty($_SESSION['csrf_token'])) {
        return false;
    }

    return hash_equals($_SESSION['csrf_token'], $token);
}

function requireCsrf(): void {
    if (!validateCsrfToken()) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid or missing CSRF token']);
        exit;
    }
    // Rotate token after successful validation for state-changing requests
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
        $newToken = rotateCsrfToken();
        // Send new token in response header so frontend can update
        header('X-CSRF-Token: ' . $newToken);
    }
}
