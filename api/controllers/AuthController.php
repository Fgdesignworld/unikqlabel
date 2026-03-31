<?php
/**
 * Auth Controller — Admin login, logout, status
 */

require_once __DIR__ . '/../models/Admin.php';
require_once __DIR__ . '/../middleware/csrf.php';
require_once __DIR__ . '/../middleware/rate_limit.php';
require_once __DIR__ . '/../helpers/security.php';

class AuthController {

    /**
     * POST /api/admin/login
     */
    public static function login(): void {
        checkRateLimit('login');

        $input = json_decode(file_get_contents('php://input'), true);

        $email    = sanitizeInput($input['email']    ?? '', 254);
        $password = $input['password'] ?? '';   // never sanitize passwords — check raw

        // Validation
        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email format']);
            return;
        }

        // Reject absurdly long passwords before any hashing (DoS via bcrypt)
        if (strlen($password) > 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        // Find admin
        $admin = Admin::findByEmail($email);

        if (!$admin || !Admin::verifyPassword($password, $admin['password_hash'])) {
            logSecurityEvent('login_failed', ['email' => $email]);
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }

        // Clear rate limit on successful login
        clearRateLimit('login');

        // Regenerate session for security (prevents session fixation)
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_regenerate_id(true);

        $_SESSION['admin_id']    = $admin['id'];
        $_SESSION['admin_name']  = $admin['name'];
        $_SESSION['admin_email'] = $admin['email'];
        $_SESSION['last_active'] = time();
        // Store fingerprint for hijack detection (used by requireAuth)
        $_SESSION['_fp'] = hash('sha256',
            ($_SERVER['HTTP_USER_AGENT'] ?? '') .
            ($_SERVER['REMOTE_ADDR']      ?? '')
        );

        logSecurityEvent('login_success', ['admin_id' => $admin['id']]);

        echo json_encode([
            'success' => true,
            'admin'   => [
                'id'    => $admin['id'],
                'name'  => $admin['name'],
                'email' => $admin['email'],
            ]
        ]);
    }

    /**
     * POST /api/admin/logout
     */
    public static function logout(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $adminId = $_SESSION['admin_id'] ?? null;
        if ($adminId) {
            logSecurityEvent('logout', ['admin_id' => $adminId]);
        }

        $_SESSION = [];

        // Expire the session cookie immediately
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(), '', time() - 42000,
                $params['path'], $params['domain'],
                $params['secure'], $params['httponly']
            );
        }

        session_destroy();

        echo json_encode(['success' => true, 'message' => 'Logged out']);
    }


    /**
     * GET /api/admin/status
     */
    public static function status(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!empty($_SESSION['admin_id'])) {
            echo json_encode([
                'authenticated' => true,
                'admin' => [
                    'id'    => $_SESSION['admin_id'],
                    'name'  => $_SESSION['admin_name'],
                    'email' => $_SESSION['admin_email'],
                ]
            ]);
        } else {
            echo json_encode(['authenticated' => false]);
        }
    }

    /**
     * GET /api/csrf-token
     */
    public static function csrfToken(): void {
        $token = generateCsrfToken();
        echo json_encode(['csrf_token' => $token]);
    }
}
