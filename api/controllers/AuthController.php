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

        // Configure session to persist for 8 hours (cookie survives browser close)
        $lifetime = 28800; // 8 hours in seconds
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.gc_maxlifetime', $lifetime);
            ini_set('session.cookie_lifetime', $lifetime);
            session_start();
        }
        // Regenerate session for security (prevents session fixation)
        session_regenerate_id(true);
        // Push the cookie expiry forward to 8 hours from now
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(), session_id(), time() + $lifetime,
                $params['path'], $params['domain'],
                $params['secure'], true  // httponly always on
            );
        }

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
            // Must match lifetime set at login so PHP's GC doesn't expire early
            ini_set('session.gc_maxlifetime', 28800);
            ini_set('session.cookie_lifetime', 28800);
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

    /**
     * POST /api/admin/account/change-password
     * Body: { current_password, new_password, confirm_password }
     */
    public static function changePassword(): void {
        require_once __DIR__ . '/../middleware/auth.php';
        requireAuth();

        $adminId = (int) $_SESSION['admin_id'];
        $input   = json_decode(file_get_contents('php://input'), true);

        $currentPassword  = $input['current_password']  ?? '';
        $newPassword      = $input['new_password']      ?? '';
        $confirmPassword  = $input['confirm_password']  ?? '';

        // ---------- Validation ----------
        if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
            http_response_code(400);
            echo json_encode(['error' => 'All fields are required']);
            return;
        }

        // DoS guard — never bcrypt excessively long strings
        if (strlen($currentPassword) > 1024 || strlen($newPassword) > 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
            return;
        }

        if ($newPassword !== $confirmPassword) {
            http_response_code(400);
            echo json_encode(['error' => 'New password and confirmation do not match']);
            return;
        }

        // Password strength: min 8 chars, at least one letter + one digit
        if (strlen($newPassword) < 8 ||
            !preg_match('/[A-Za-z]/', $newPassword) ||
            !preg_match('/[0-9]/', $newPassword)) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 8 characters with at least one letter and one number']);
            return;
        }

        // Fetch admin record (need hash for verification)
        $admin = Admin::findByEmail($_SESSION['admin_email']);
        if (!$admin || !Admin::verifyPassword($currentPassword, $admin['password_hash'])) {
            logSecurityEvent('change_password_failed', ['admin_id' => $adminId, 'reason' => 'wrong_current']);
            http_response_code(401);
            echo json_encode(['error' => 'Current password is incorrect']);
            return;
        }

        // Disallow reusing the same password
        if (Admin::verifyPassword($newPassword, $admin['password_hash'])) {
            http_response_code(400);
            echo json_encode(['error' => 'New password must differ from your current password']);
            return;
        }

        if (!Admin::updatePassword($adminId, $newPassword)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update password. Please try again.']);
            return;
        }

        logSecurityEvent('change_password_success', ['admin_id' => $adminId]);

        // Invalidate session so the admin is forced to re-login (security best-practice)
        session_regenerate_id(true);

        echo json_encode(['success' => true, 'message' => 'Password changed successfully. Please log in again.', 'relogin' => true]);
    }

    /**
     * POST /api/admin/account/change-email
     * Body: { current_password, new_email }
     */
    public static function changeEmail(): void {
        require_once __DIR__ . '/../middleware/auth.php';
        requireAuth();

        $adminId = (int) $_SESSION['admin_id'];
        $input   = json_decode(file_get_contents('php://input'), true);

        $currentPassword = $input['current_password'] ?? '';
        $newEmail        = sanitizeInput($input['new_email'] ?? '', 254);

        // ---------- Validation ----------
        if (empty($currentPassword) || empty($newEmail)) {
            http_response_code(400);
            echo json_encode(['error' => 'Password and new email are required']);
            return;
        }

        if (strlen($currentPassword) > 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
            return;
        }

        if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address format']);
            return;
        }

        // Verify current password
        $admin = Admin::findByEmail($_SESSION['admin_email']);
        if (!$admin || !Admin::verifyPassword($currentPassword, $admin['password_hash'])) {
            logSecurityEvent('change_email_failed', ['admin_id' => $adminId, 'reason' => 'wrong_password']);
            http_response_code(401);
            echo json_encode(['error' => 'Current password is incorrect']);
            return;
        }

        // Same email?
        if (strtolower($newEmail) === strtolower($admin['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'New email must differ from your current email']);
            return;
        }

        // Duplicate check
        if (Admin::emailExists($newEmail, $adminId)) {
            http_response_code(409);
            echo json_encode(['error' => 'That email address is already in use']);
            return;
        }

        if (!Admin::updateEmail($adminId, $newEmail)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update email. Please try again.']);
            return;
        }

        logSecurityEvent('change_email_success', ['admin_id' => $adminId, 'new_email' => $newEmail]);

        // Update session so the sidebar reflects the new email immediately
        $_SESSION['admin_email'] = $newEmail;

        echo json_encode(['success' => true, 'message' => 'Email updated successfully.', 'new_email' => $newEmail]);
    }
}
