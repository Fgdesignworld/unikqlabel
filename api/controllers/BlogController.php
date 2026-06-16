<?php
/**
 * Blog Controller — Public listing + Admin CRUD
 */

require_once __DIR__ . '/../models/Blog.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../helpers/security.php';

class BlogController {

    // ── Helpers ───────────────────────────────────────────────────────────

    private static function ok(array $data = []): void {
        echo json_encode(['status' => 'success', 'data' => $data]);
    }

    private static function error(string $message, int $code = 400): void {
        http_response_code($code);
        echo json_encode(['status' => 'error', 'message' => $message]);
    }

    // ── Public ────────────────────────────────────────────────────────────

    /**
     * GET /api/blog — published posts with optional filters
     * Query params: category, search, limit, offset, featured
     */
    public static function publicIndex(): void {
        $filters = [];
        if (!empty($_GET['category'])) $filters['category'] = sanitizeInput($_GET['category'], 100);
        if (!empty($_GET['search']))   $filters['search']   = sanitizeInput($_GET['search'], 100);
        if (!empty($_GET['featured'])) $filters['featured'] = true;

        $limit  = validateInt($_GET['limit']  ?? 12, 1, 100) ?? 12;
        $offset = validateInt($_GET['offset'] ?? 0,  0)      ?? 0;
        $filters['limit']  = $limit;
        $filters['offset'] = $offset;

        $posts = Blog::getPublished($filters);
        $total = Blog::countPublished($filters);

        self::ok([
            'posts'       => $posts,
            'total'       => $total,
            'limit'       => $limit,
            'offset'      => $offset,
            'has_more'    => ($offset + $limit) < $total,
        ]);
    }

    /**
     * GET /api/blog/categories — distinct published categories
     */
    public static function publicCategories(): void {
        $categories = Blog::getPublishedCategories();
        self::ok(['categories' => $categories]);
    }

    /**
     * GET /api/blog/{slug} — single published post (increments views)
     */
    public static function publicShow(string $slug): void {
        $post = Blog::findBySlug($slug, true);
        if (!$post) {
            self::error('Post not found', 404);
            return;
        }
        self::ok(['post' => $post]);
    }

    // ── Admin ─────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/blog — all posts
     */
    public static function adminIndex(): void {
        requireAuth();
        $filters = [];
        if (!empty($_GET['status']) && $_GET['status'] !== 'all') {
            $filters['status'] = sanitizeInput($_GET['status'], 20);
        }
        if (!empty($_GET['search'])) {
            $filters['search'] = sanitizeInput($_GET['search'], 100);
        }
        $posts = Blog::getAll($filters);
        self::ok(['posts' => $posts]);
    }

    /**
     * GET /api/admin/blog/{id}
     */
    public static function adminShow(int $id): void {
        requireAuth();
        $post = Blog::findById($id);
        if (!$post) {
            self::error('Post not found', 404);
            return;
        }
        self::ok(['post' => $post]);
    }

    /**
     * POST /api/admin/blog — create post
     */
    public static function store(): void {
        requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);

        $title = trim($input['title'] ?? '');
        if (empty($title)) {
            self::error('Title is required');
            return;
        }

        // Build slug from title if not provided
        if (empty($input['slug'])) {
            $input['slug'] = Blog::toSlug($title);
        }

        // Sanitize content (allow safe HTML from editor)
        if (!empty($input['content'])) {
            $input['content'] = sanitizeHtml($input['content']);
        }

        // Tags: accept array or comma-separated string
        if (!empty($input['tags']) && is_string($input['tags'])) {
            $input['tags'] = array_filter(array_map('trim', explode(',', $input['tags'])));
        }

        try {
            $id   = Blog::create($input);
            $post = Blog::findById($id);
            self::ok(['post' => $post]);
        } catch (\Exception $e) {
            self::error('Failed to create post', 500);
        }
    }

    /**
     * PUT /api/admin/blog/{id} — update post
     */
    public static function update(int $id): void {
        requireAuth();
        $post = Blog::findById($id);
        if (!$post) {
            self::error('Post not found', 404);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (isset($input['title']) && empty(trim($input['title']))) {
            self::error('Title cannot be empty');
            return;
        }

        // Sanitize content
        if (isset($input['content'])) {
            $input['content'] = sanitizeHtml($input['content']);
        }

        // Tags: accept array or comma-separated string
        if (!empty($input['tags']) && is_string($input['tags'])) {
            $input['tags'] = array_filter(array_map('trim', explode(',', $input['tags'])));
        }

        try {
            Blog::update($id, $input);
            $updated = Blog::findById($id);
            self::ok(['post' => $updated]);
        } catch (\Exception $e) {
            self::error('Failed to update post', 500);
        }
    }

    /**
     * PUT /api/admin/blog/{id}/toggle — toggle draft/published
     */
    public static function toggle(int $id): void {
        requireAuth();
        $post = Blog::findById($id);
        if (!$post) {
            self::error('Post not found', 404);
            return;
        }
        $newStatus = Blog::toggleStatus($id);
        self::ok(['status' => $newStatus]);
    }

    /**
     * DELETE /api/admin/blog/{id}
     */
    public static function destroy(int $id): void {
        requireAuth();
        $post = Blog::findById($id);
        if (!$post) {
            self::error('Post not found', 404);
            return;
        }
        Blog::delete($id);
        self::ok(['message' => 'Post deleted']);
    }

    /**
     * POST /api/admin/blog/upload-image — upload cover image
     */
    public static function uploadImage(): void {
        requireAuth();

        if (empty($_FILES['image'])) {
            self::error('No image file received');
            return;
        }

        $destDir = __DIR__ . '/../uploads/blog';
        $result  = secureUploadImage($_FILES['image'], $destDir, 'blog_', 8 * 1024 * 1024);

        if (!$result['ok']) {
            self::error($result['error'] ?? 'Upload failed');
            return;
        }

        self::ok(['url' => $result['path']]);
    }
}
