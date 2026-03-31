<?php
/**
 * Settings Controller — Global site settings (key-value store)
 * Module 3: Global Settings System
 */

require_once __DIR__ . '/../models/Settings.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../helpers/security.php';

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
     */
    public static function index(): void {
        $settings = Settings::getAll();
        self::ok(['settings' => $settings]);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/settings/grouped — Grouped by setting_group
     */
    public static function adminGrouped(): void {
        requireAuth();
        $grouped = Settings::getAllGrouped();
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
            self::error('Failed to save settings: ' . $e->getMessage(), 500);
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
