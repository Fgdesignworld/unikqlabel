<?php
/**
 * Settings Controller — Global site settings (key-value store)
 * Module 3: Global Settings System
 */

require_once __DIR__ . '/../models/Settings.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../helpers/security.php';
require_once __DIR__ . '/../helpers/razorpay.php';

class SettingsController {

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static function ok(array $data = [], string $message = 'Success'): void {
        echo json_encode(['status' => 'success', 'message' => $message, 'data' => $data]);
    }

    private static function error(string $message, int $code = 400): void {
        http_response_code($code);
        echo json_encode(['status' => 'error', 'message' => $message, 'data' => null]);
    }

    // ─── Public ──────────────────────────────────────────────────────────────

    /**
     * GET /api/settings — All settings as flat key-value (public, cached-friendly)
     * Security: Razorpay secret and key_id are NEVER exposed to the public.
     */
    public static function index(): void {
        $settings = Settings::getAll();
        // Strip payment credentials — they must never reach the frontend
        unset($settings['razorpay_key_secret']);
        unset($settings['razorpay_key_id']);
        self::ok(['settings' => $settings]);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/settings/grouped — Grouped by setting_group
     * Security: razorpay_key_secret is masked as placeholder if set.
     */
    public static function adminGrouped(): void {
        requireAuth();
        $grouped = Settings::getAllGrouped();
        // Mask secret so it never leaves the server in plaintext
        if (!empty($grouped['payment']['razorpay_key_secret'])) {
            $grouped['payment']['razorpay_key_secret'] = RAZORPAY_SECRET_MASK;
        }
        self::ok(['settings' => $grouped]);
    }

    /**
     * POST /api/admin/settings — Batch upsert
     * Body: { settings: { key: value, ... } }
     */
    public static function bulkUpdate(): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);
        $data  = $input['settings'] ?? [];

        if (!is_array($data) || empty($data)) {
            self::error('settings object is required');
            return;
        }

        // Sanitize keys — only allow alphanumeric + underscore
        $clean = [];
        foreach ($data as $key => $value) {
            $safeKey = preg_replace('/[^a-z0-9_]/', '', strtolower($key));
            if (empty($safeKey)) continue;
            // Never overwrite the secret with the masked placeholder sent by the UI
            if ($safeKey === 'razorpay_key_secret' && $value === RAZORPAY_SECRET_MASK) continue;
            $clean[$safeKey] = $value !== null ? (string) $value : null;
        }

        if (empty($clean)) {
            self::error('No valid settings keys provided');
            return;
        }

        try {
            Settings::setMany($clean);
            $updated = Settings::getAll();
            self::ok(['settings' => $updated], 'Settings saved successfully');
        } catch (Exception $e) {
            error_log('Settings save error: ' . $e->getMessage());
            self::error('Failed to save settings. Please try again.', 500);
        }
    }

    /**
     * POST /api/admin/settings/upload-logo — Upload logo/favicon
     */
    public static function uploadLogo(): void {
        requireAuth();

        if (empty($_FILES['logo'])) {
            self::error('No file provided');
            return;
        }

        // SVG is deliberately excluded — it can carry inline JavaScript (XSS vector)
        $result = secureUploadImage(
            $_FILES['logo'],
            __DIR__ . '/../uploads/branding/',
            'logo_',
            2 * 1024 * 1024  // 2 MB limit for logos
        );

        if (!$result['ok']) {
            self::error($result['error']);
            return;
        }

        self::ok(['url' => '/api' . $result['path']], 'Logo uploaded');
    }
}
