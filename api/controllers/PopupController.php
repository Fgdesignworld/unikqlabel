<?php
/**
 * Popup Controller — Manage promotional popups
 * Module 4: Dynamic Popup / Offer System
 */

require_once __DIR__ . '/../models/Popup.php';
require_once __DIR__ . '/../middleware/auth.php';

class PopupController {

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
     * GET /api/popup — Return active popup (or null)
     */
    public static function getActive(): void {
        $popup = Popup::getActive();
        self::ok(['popup' => $popup]);
    }

    /**
     * POST /api/popup/track — Increment view or click counter
     * Body: { id: int, event: 'view'|'click' }
     */
    public static function track(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        $id    = (int) ($input['id'] ?? 0);
        $event = $input['event'] ?? '';

        if ($id <= 0 || !in_array($event, ['view', 'click'], true)) {
            self::error('Invalid tracking payload');
            return;
        }

        if ($event === 'view') {
            Popup::incrementViews($id);
        } else {
            Popup::incrementClicks($id);
        }

        self::ok([], 'Tracked');
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/popups
     */
    public static function adminIndex(): void {
        requireAuth();
        $popups = Popup::getAll();
        // Normalize booleans
        foreach ($popups as &$p) {
            $p['is_active'] = (bool) $p['is_active'];
        }
        self::ok(['popups' => $popups]);
    }

    /**
     * GET /api/admin/popups/{id}
     */
    public static function adminShow(int $id): void {
        requireAuth();
        $popup = Popup::findById($id);
        if (!$popup) { self::error('Popup not found', 404); return; }
        $popup['is_active'] = (bool) $popup['is_active'];
        self::ok(['popup' => $popup]);
    }

    /**
     * POST /api/admin/popups
     */
    public static function store(): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);
        $title = trim($input['title'] ?? '');

        if (empty($title)) {
            self::error('Popup title is required');
            return;
        }
        if (strlen($title) > 200) {
            self::error('Title must be 200 characters or less');
            return;
        }

        // If activating, deactivate others first
        if (!empty($input['is_active'])) {
            Popup::deactivateAll();
        }

        try {
            $id    = Popup::create($input);
            $popup = Popup::findById($id);
            $popup['is_active'] = (bool) $popup['is_active'];
            self::ok(['popup' => $popup], 'Popup created');
        } catch (Exception $e) {
            self::error('Failed to create popup', 500);
        }
    }

    /**
     * PUT /api/admin/popups/{id}
     */
    public static function update(int $id): void {
        requireAuth();

        $popup = Popup::findById($id);
        if (!$popup) { self::error('Popup not found', 404); return; }

        $input = json_decode(file_get_contents('php://input'), true);

        if (isset($input['title'])) {
            $title = trim($input['title']);
            if (empty($title)) { self::error('Title cannot be empty'); return; }
        }

        // If activating, deactivate others first
        if (!empty($input['is_active'])) {
            Popup::deactivateAll();
        }

        try {
            Popup::update($id, $input);
            $updated = Popup::findById($id);
            $updated['is_active'] = (bool) $updated['is_active'];
            self::ok(['popup' => $updated], 'Popup updated');
        } catch (Exception $e) {
            self::error('Failed to update popup', 500);
        }
    }

    /**
     * DELETE /api/admin/popups/{id}
     */
    public static function destroy(int $id): void {
        requireAuth();

        $popup = Popup::findById($id);
        if (!$popup) { self::error('Popup not found', 404); return; }

        Popup::delete($id);
        self::ok([], 'Popup deleted');
    }

    /**
     * PUT /api/admin/popups/{id}/toggle
     */
    public static function toggle(int $id): void {
        requireAuth();

        $newState = Popup::toggle($id);
        if ($newState === null) { self::error('Popup not found', 404); return; }

        self::ok(['is_active' => (bool) $newState], $newState ? 'Popup activated' : 'Popup deactivated');
    }

    /**
     * POST /api/admin/popups/upload-image
     */
    public static function uploadImage(): void {
        requireAuth();

        if (empty($_FILES['image'])) { self::error('No file provided'); return; }

        $file = $_FILES['image'];
        $mime = mime_content_type($file['tmp_name']);
        if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'])) {
            self::error('Invalid file type');
            return;
        }
        if ($file['size'] > 5 * 1024 * 1024) { self::error('Max 5 MB'); return; }

        $ext     = pathinfo($file['name'], PATHINFO_EXTENSION);
        $name    = 'popup_' . uniqid() . '.' . strtolower($ext);
        $destDir = __DIR__ . '/../uploads/popups/';
        if (!is_dir($destDir)) mkdir($destDir, 0755, true);

        if (!move_uploaded_file($file['tmp_name'], $destDir . $name)) {
            self::error('Failed to save file', 500);
            return;
        }

        self::ok(['url' => '/uploads/popups/' . $name], 'Image uploaded');
    }
}
