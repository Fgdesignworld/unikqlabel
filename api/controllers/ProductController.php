<?php
/**
 * Product Controller — Public listing + Admin CRUD
 */

require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/Inventory.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../helpers/security.php';

class ProductController {

    /**
     * GET /api/products — Public: active products (with optional filters)
     */
    public static function index(): void {
        $filters = [];
        // Sanitize/validate every query parameter — never pass raw GET values to the model
        if (!empty($_GET['category']))  $filters['category']  = sanitizeInput($_GET['category'], 50);
        if (isset($_GET['veg']))        $filters['is_veg']    = $_GET['veg'] === 'true' ? 1 : 0;
        if (isset($_GET['min_price']))  $filters['min_price'] = validateFloat($_GET['min_price'], 0, 1000000) ?? 0;
        if (isset($_GET['max_price']))  $filters['max_price'] = validateFloat($_GET['max_price'], 0, 1000000) ?? 1000000;

        $products        = Product::getActive($filters);
        $stockSummary    = Inventory::getAllStockSummary();
        $allVariantRows  = Inventory::getAllInventoryRows();

        foreach ($products as &$p) {
            self::normalizeProduct($p);
            $pid   = (int) $p['id'];
            $stats = $stockSummary[$pid] ?? null;
            if ($stats !== null) {
                $p['total_stock'] = $stats['total_stock'];
            } else {
                $p['total_stock'] = null;
            }
            // Per-variant stock so the frontend can check OOS for specific size/color combos
            $p['variant_inventory'] = $allVariantRows[$pid] ?? null;
        }

        echo json_encode(['products' => $products]);
    }

    /**
     * GET /api/products/{slug} — Public: single product detail by slug
     */
    public static function showPublic(string $slug): void {
        $product = Product::findBySlug($slug);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }
        self::normalizeProduct($product);
        // Include inventory so frontend can show stock status
        $product['inventory'] = Inventory::getForProduct((int) $product['id']);
        echo json_encode(['product' => $product]);
    }

    /**
     * GET /api/admin/products — Admin: all products
     */
    public static function adminIndex(): void {
        requireAuth();
        $products = Product::getAll();

        foreach ($products as &$p) {
            self::normalizeProduct($p);
        }

        echo json_encode(['products' => $products]);
    }

    /**
     * POST /api/admin/products — Create product
     */
    public static function store(): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);

        // Validation
        $required = ['name', 'category', 'price'];
        foreach ($required as $field) {
            if (empty($input[$field]) && $input[$field] !== 0 && $input[$field] !== '0') {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                return;
            }
        }

        // Safe Defaults
        if (empty($input['weight'])) {
            $input['weight'] = '';
        }
        $input['price'] = (float) $input['price'];

        $validCategories = ['snacks', 'pickles', 'spices', 'sweets'];
        // Build valid category list dynamically from the categories table
        $dbCategories = Category::getActive();
        if (!empty($dbCategories)) {
            $validCategories = array_column($dbCategories, 'slug');
        }
        if (!in_array($input['category'], $validCategories)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid category']);
            return;
        }

        try {
            $id = Product::create($input);
            $product = Product::findById($id);
            self::normalizeProduct($product);
            echo json_encode(['success' => true, 'product' => $product]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create product']);
        }
    }

    /**
     * GET /api/admin/products/{id} — Fetch single product
     */
    public static function show(int $id): void {
        requireAuth();

        $product = Product::findById($id);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }

        self::normalizeProduct($product);
        echo json_encode(['product' => $product]);
    }

    /**
     * PUT /api/admin/products/{id} — Update product
     */
    public static function update(int $id): void {
        requireAuth();

        $product = Product::findById($id);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate category if provided
        if (!empty($input['category'])) {
            $dbCategories = Category::getActive();
            $validCategories = !empty($dbCategories)
                ? array_column($dbCategories, 'slug')
                : ['snacks', 'pickles', 'spices', 'sweets'];
            if (!in_array($input['category'], $validCategories)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid category']);
                return;
            }
        }

        // Safe Defaults
        if (isset($input['weight']) && empty($input['weight'])) {
            $input['weight'] = '';
        }
        if (isset($input['price'])) {
            $input['price'] = (float) $input['price'];
        }

        try {
            Product::update($id, $input);
            $updated = Product::findById($id);
            self::normalizeProduct($updated);
            echo json_encode(['success' => true, 'product' => $updated]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update product']);
        }
    }

    /**
     * POST /api/admin/products/reorder — Reorder products
     */
    public static function reorder(): void {
        requireAuth();
        
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode(['error' => 'Expected JSON array']);
            return;
        }

        try {
            Product::updateSortOrder($input);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to reorder products']);
        }
    }

    /**
     * DELETE /api/admin/products/{id} — Delete product
     */
    public static function destroy(int $id): void {
        requireAuth();

        $product = Product::findById($id);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }

        // Delete image file if exists
        if (!empty($product['image'])) {
            $imagePath = __DIR__ . '/../uploads/products/' . basename($product['image']);
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        Product::delete($id);
        echo json_encode(['success' => true, 'message' => 'Product deleted']);
    }

    /**
     * POST /api/admin/products/upload-image — Upload product image
     */
    public static function uploadImage(): void {
        requireAuth();

        if (empty($_FILES['image'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No image file provided']);
            return;
        }

        $result = secureUploadImage(
            $_FILES['image'],
            __DIR__ . '/../uploads/products/',
            'product_'
        );

        if (!$result['ok']) {
            http_response_code(400);
            echo json_encode(['error' => $result['error']]);
            return;
        }

        echo json_encode([
            'success'  => true,
            'filename' => basename($result['path']),
            'path'     => '/api' . $result['path'],
        ]);
    }

    /**
     * Shared normalizer — parse JSON fields + cast booleans/floats
     */
    private static function normalizeProduct(array &$p): void {
        if (!empty($p['variants']) && is_string($p['variants'])) {
            $p['variants'] = json_decode($p['variants'], true);
        }
        if (isset($p['gallery_images']) && is_string($p['gallery_images'])) {
            $p['gallery_images'] = json_decode($p['gallery_images'], true);
        } else {
            $p['gallery_images'] = $p['gallery_images'] ?? null;
        }
        // Size variants (new)
        $p['variants_json'] = isset($p['variants_json'])
            ? (is_string($p['variants_json']) ? json_decode($p['variants_json'], true) : $p['variants_json'])
            : null;
        // Color variants (new)
        $p['color_variants_json'] = isset($p['color_variants_json'])
            ? (is_string($p['color_variants_json']) ? json_decode($p['color_variants_json'], true) : $p['color_variants_json'])
            : null;
        $p['bestseller']     = (bool)  $p['bestseller'];
        $p['is_veg']         = (bool)  $p['is_veg'];
        $p['is_homemade']    = (bool)  $p['is_homemade'];
        $p['price']          = (float) $p['price'];
        $p['discount_price'] = isset($p['discount_price']) && $p['discount_price'] !== null
            ? (float) $p['discount_price']
            : null;
        $p['rating']         = (float) ($p['rating'] ?? 0);
    }
}
