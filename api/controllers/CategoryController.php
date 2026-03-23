<?php
/**
 * Category Controller — Public listing + Admin CRUD
 * Module 1: Dynamic Category Management
 */

require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../middleware/auth.php';

class CategoryController {

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
     * GET /api/categories — Public active categories
     */
    public static function index(): void {
        $categories = Category::getActive();
        self::ok(['categories' => $categories]);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/categories
     */
    public static function adminIndex(): void {
        requireAuth();
        $categories = Category::getAll();
        self::ok(['categories' => $categories]);
    }

    /**
     * GET /api/admin/categories/{id}
     */
    public static function adminShow(int $id): void {
        requireAuth();
        $cat = Category::findById($id);
        if (!$cat) {
            self::error('Category not found', 404);
            return;
        }
        self::ok(['category' => $cat]);
    }

    /**
     * POST /api/admin/categories
     */
    public static function store(): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);

        $name = trim($input['name'] ?? '');
        if (empty($name)) {
            self::error('Category name is required');
            return;
        }
        if (strlen($name) > 100) {
            self::error('Category name must be 100 characters or less');
            return;
        }

        // Auto-generate slug if not provided
        $input['slug'] = !empty($input['slug'])
            ? Category::generateSlug(trim($input['slug']))
            : Category::generateSlug($name);

        try {
            $id  = Category::create($input);
            $cat = Category::findById($id);
            self::ok(['category' => $cat], 'Category created successfully');
        } catch (Exception $e) {
            self::error('Failed to create category', 500);
        }
    }

    /**
     * PUT /api/admin/categories/{id}
     */
    public static function update(int $id): void {
        requireAuth();

        $cat = Category::findById($id);
        if (!$cat) {
            self::error('Category not found', 404);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (isset($input['name'])) {
            $name = trim($input['name']);
            if (empty($name)) {
                self::error('Category name cannot be empty');
                return;
            }
            if (strlen($name) > 100) {
                self::error('Category name must be 100 characters or less');
                return;
            }
        }

        // Auto-regen slug if name changed and slug not explicitly provided
        if (isset($input['name']) && !isset($input['slug'])) {
            $input['slug'] = Category::generateSlug($input['name']);
        }

        try {
            Category::update($id, $input);
            $updated = Category::findById($id);
            self::ok(['category' => $updated], 'Category updated successfully');
        } catch (Exception $e) {
            self::error('Failed to update category', 500);
        }
    }

    /**
     * DELETE /api/admin/categories/{id}
     */
    public static function destroy(int $id): void {
        requireAuth();

        $cat = Category::findById($id);
        if (!$cat) {
            self::error('Category not found', 404);
            return;
        }

        try {
            Category::delete($id);
            self::ok([], 'Category deleted successfully');
        } catch (Exception $e) {
            self::error('Failed to delete category', 500);
        }
    }

    /**
     * PUT /api/admin/categories/{id}/toggle — Toggle active/inactive
     */
    public static function toggle(int $id): void {
        requireAuth();

        $newStatus = Category::toggleStatus($id);
        if ($newStatus === null) {
            self::error('Category not found', 404);
            return;
        }

        self::ok(['status' => $newStatus], "Category set to $newStatus");
    }

    /**
     * POST /api/admin/categories/upload-image — Upload category image
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

        if ($file['size'] > 5 * 1024 * 1024) {
            self::error('File too large. Max size is 5 MB.');
            return;
        }

        $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
        $safeName = 'cat_' . uniqid() . '.' . strtolower($ext);
        $destDir  = __DIR__ . '/../uploads/categories/';

        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        $dest = $destDir . $safeName;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            self::error('Failed to save image', 500);
            return;
        }

        self::ok(['url' => '/uploads/categories/' . $safeName], 'Image uploaded successfully');
    }
}
