<?php
/**
 * HeroSlideController — Admin CRUD + Public API for Hero Slides
 */

require_once __DIR__ . '/../models/HeroSlide.php';
require_once __DIR__ . '/../middleware/auth.php';

class HeroSlideController {

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
     * GET /api/hero-slides — Active slides for the frontend carousel
     */
    public static function publicIndex(): void {
        $slides = HeroSlide::getPublic();
        self::ok(['slides' => $slides]);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/hero-slides — All slides
     */
    public static function index(): void {
        requireAuth();
        $slides = HeroSlide::getAll();
        self::ok(['slides' => $slides]);
    }

    /**
     * GET /api/admin/hero-slides/{id}
     */
    public static function show(int $id): void {
        requireAuth();
        $slide = HeroSlide::findById($id);
        if (!$slide) { self::error('Slide not found', 404); return; }
        self::ok(['slide' => $slide]);
    }

    /**
     * POST /api/admin/hero-slides
     */
    public static function store(): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $title = trim($input['title'] ?? '');

        if (empty($title)) {
            self::error('Slide title is required');
            return;
        }
        if (strlen($title) > 255) {
            self::error('Title must be 255 characters or less');
            return;
        }

        try {
            $id    = HeroSlide::create($input);
            $slide = HeroSlide::findById($id);
            self::ok(['slide' => $slide], 'Hero slide created successfully');
        } catch (Exception $e) {
            self::error('Failed to create slide: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/admin/hero-slides/{id}
     */
    public static function update(int $id): void {
        requireAuth();

        $slide = HeroSlide::findById($id);
        if (!$slide) { self::error('Slide not found', 404); return; }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        if (isset($input['title']) && strlen(trim($input['title'])) === 0) {
            self::error('Title cannot be empty');
            return;
        }

        try {
            HeroSlide::update($id, $input);
            $updated = HeroSlide::findById($id);
            self::ok(['slide' => $updated], 'Hero slide updated successfully');
        } catch (Exception $e) {
            self::error('Failed to update slide: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/admin/hero-slides/{id}
     */
    public static function destroy(int $id): void {
        requireAuth();

        $slide = HeroSlide::findById($id);
        if (!$slide) { self::error('Slide not found', 404); return; }

        try {
            HeroSlide::delete($id);
            self::ok([], 'Slide deleted successfully');
        } catch (Exception $e) {
            self::error('Failed to delete slide', 500);
        }
    }

    /**
     * PUT /api/admin/hero-slides/{id}/toggle
     */
    public static function toggleStatus(int $id): void {
        requireAuth();

        $slide = HeroSlide::findById($id);
        if (!$slide) { self::error('Slide not found', 404); return; }

        HeroSlide::toggleActive($id);
        $updated = HeroSlide::findById($id);
        self::ok(['is_active' => $updated['is_active']], 'Status updated');
    }

    /**
     * POST /api/admin/hero-slides/reorder
     * Body: { order: [{ id: int, sort_order: int }, ...] }
     */
    public static function reorder(): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $order = $input['order'] ?? [];

        if (empty($order) || !is_array($order)) {
            self::error('order array is required');
            return;
        }

        try {
            HeroSlide::reorder($order);
            self::ok([], 'Order updated successfully');
        } catch (Exception $e) {
            self::error('Failed to reorder slides', 500);
        }
    }

    /**
     * POST /api/admin/hero-slides/upload-image
     */
    public static function uploadImage(): void {
        requireAuth();

        if (empty($_FILES['image'])) {
            self::error('No image file provided');
            return;
        }

        $file      = $_FILES['image'];
        $allowedMt = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $mime      = mime_content_type($file['tmp_name']);

        if (!in_array($mime, $allowedMt)) {
            self::error('Invalid file type. Only JPEG, PNG, WebP, GIF allowed.');
            return;
        }

        if ($file['size'] > 8 * 1024 * 1024) {
            self::error('File too large. Max size is 8 MB.');
            return;
        }

        $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $safeName = 'hero_' . uniqid() . '.' . $ext;
        $destDir  = __DIR__ . '/../uploads/hero/';

        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        $dest = $destDir . $safeName;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            self::error('Failed to save image', 500);
            return;
        }

        self::ok(['url' => '/uploads/hero/' . $safeName], 'Image uploaded successfully');
    }
}
