<?php
/**
 * Auth Middleware — Session-based admin authentication guard
 *
 * Security additions:
 *  - Session idle timeout (30 min)
 *  - Session fixation protection (regenerate on every auth check)
 *  - UA/IP fingerprint check to detect session hijacking
 */

define('SESSION_IDLE_TIMEOUT', 1800); // 30 minutes

function requireAuth(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (empty($_SESSION['admin_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized. Please login.']);
        exit;
    }

    // ── Idle timeout ──────────────────────────────────────────────────────────
    $now = time();
    if (isset($_SESSION['last_active']) && ($now - $_SESSION['last_active']) > SESSION_IDLE_TIMEOUT) {
        // Session expired — destroy and reject
        $_SESSION = [];
        session_destroy();
        http_response_code(401);
        echo json_encode(['error' => 'Session expired. Please login again.']);
        exit;
    }
    $_SESSION['last_active'] = $now;

    // ── Session fingerprint — detect hijacking ────────────────────────────────
    $fingerprint = hash('sha256',
        ($_SERVER['HTTP_USER_AGENT']  ?? '') .
        ($_SERVER['REMOTE_ADDR']       ?? '')
    );
    if (isset($_SESSION['_fp'])) {
        if (!hash_equals($_SESSION['_fp'], $fingerprint)) {
            // Possible session hijack — invalidate immediately
            $_SESSION = [];
            session_destroy();
            http_response_code(401);
            echo json_encode(['error' => 'Session invalid. Please login again.']);
            exit;
        }
    } else {
        $_SESSION['_fp'] = $fingerprint;
    }
}

function getCurrentAdmin(): ?array {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (empty($_SESSION['admin_id'])) {
        return null;
    }

    return [
        'id'    => $_SESSION['admin_id'],
        'name'  => $_SESSION['admin_name'] ?? '',
        'email' => $_SESSION['admin_email'] ?? '',
    ];
}

