<?php
/**
 * SEO Controller — Get/Upsert SEO records
 * Module 2: SEO Management System
 */

require_once __DIR__ . '/../models/Seo.php';
require_once __DIR__ . '/../middleware/auth.php';

class SeoController {

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
     * GET /api/seo?page_type=home
     * GET /api/seo?page_type=product&page_id=5
     * GET /api/seo?page_type=page&page_slug=about
     */
    public static function getForPage(): void {
        $pageType = $_GET['page_type'] ?? '';
        $pageId   = isset($_GET['page_id']) ? (int) $_GET['page_id'] : null;
        $pageSlug = $_GET['page_slug'] ?? null;

        $validTypes = ['home', 'product', 'category', 'page'];
        if (!in_array($pageType, $validTypes)) {
            self::error('Invalid page_type');
            return;
        }

        $seo = Seo::getForPage($pageType, $pageId, $pageSlug);
        self::ok(['seo' => $seo]);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/seo — All SEO records
     */
    public static function adminIndex(): void {
        requireAuth();
        $records = Seo::getAll();
        self::ok(['seo' => $records]);
    }

    /**
     * GET /api/admin/seo/{id}
     */
    public static function adminShow(int $id): void {
        requireAuth();
        $record = Seo::findById($id);
        if (!$record) {
            self::error('SEO record not found', 404);
            return;
        }
        self::ok(['seo' => $record]);
    }

    /**
     * POST /api/admin/seo — Upsert SEO record
     */
    public static function upsert(): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);

        $validTypes = ['home', 'product', 'category', 'page'];
        $pageType   = $input['page_type'] ?? '';
        if (!in_array($pageType, $validTypes)) {
            self::error('Invalid page_type. Must be: home, product, category, page');
            return;
        }

        // Validate string lengths
        if (!empty($input['meta_title']) && strlen($input['meta_title']) > 160) {
            self::error('meta_title must be 160 characters or less');
            return;
        }
        if (!empty($input['meta_description']) && strlen($input['meta_description']) > 320) {
            self::error('meta_description must be 320 characters or less');
            return;
        }

        try {
            $id  = Seo::upsert($input);
            $seo = Seo::findById($id);
            self::ok(['seo' => $seo], 'SEO saved successfully');
        } catch (Exception $e) {
            self::error('Failed to save SEO record', 500);
        }
    }

    /**
     * DELETE /api/admin/seo/{id}
     */
    public static function destroy(int $id): void {
        requireAuth();

        $record = Seo::findById($id);
        if (!$record) {
            self::error('SEO record not found', 404);
            return;
        }

        Seo::delete($id);
        self::ok([], 'SEO record deleted');
    }
}
