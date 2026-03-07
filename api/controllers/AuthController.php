<?php
/**
 * Auth Controller — Admin login, logout, status
 */

require_once __DIR__ . '/../models/Admin.php';
require_once __DIR__ . '/../middleware/csrf.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

class AuthController {

    /**
     * POST /api/admin/login
     */
    public static function login(): void {
        checkRateLimit('login');

        $input = json_decode(file_get_contents('php://input'), true);

        $email    = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

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

        // Find admin
        $admin = Admin::findByEmail($email);

        if (!$admin || !Admin::verifyPassword($password, $admin['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }

        // Clear rate limit on successful login
        clearRateLimit('login');

        // Regenerate session for security
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_regenerate_id(true);

        $_SESSION['admin_id']    = $admin['id'];
        $_SESSION['admin_name']  = $admin['name'];
        $_SESSION['admin_email'] = $admin['email'];

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

        $_SESSION = [];
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
