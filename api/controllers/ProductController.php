<?php
/**
 * Product Controller — Public listing + Admin CRUD
 */

require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/Inventory.php';
require_once __DIR__ . '/../middleware/auth.php';

class ProductController {

    /**
     * GET /api/products — Public: active products (with optional filters)
     */
    public static function index(): void {
        $filters = [];
        if (!empty($_GET['category']))  $filters['category']  = $_GET['category'];
        if (isset($_GET['veg']))        $filters['is_veg']    = $_GET['veg'] === 'true' ? 1 : 0;
        if (isset($_GET['min_price'])) $filters['min_price'] = $_GET['min_price'];
        if (isset($_GET['max_price'])) $filters['max_price'] = $_GET['max_price'];

        $products     = Product::getActive($filters);
        $stockSummary = Inventory::getAllStockSummary();

        foreach ($products as &$p) {
            self::normalizeProduct($p);
            $pid   = (int) $p['id'];
            $stats = $stockSummary[$pid] ?? null;
            if ($stats !== null) {
                $p['total_stock'] = $stats['total_stock'];
            } else {
                $p['total_stock'] = null;
            }
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

        $file = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB

        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Only JPEG, PNG, and WebP images are allowed']);
            return;
        }

        if ($file['size'] > $maxSize) {
            http_response_code(400);
            echo json_encode(['error' => 'Image must be less than 5MB']);
            return;
        }

        $uploadDir = __DIR__ . '/../uploads/products/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('product_') . '.' . $ext;
        $destination = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            echo json_encode([
                'success'  => true,
                'filename' => $filename,
                'path'     => '/api/uploads/products/' . $filename,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to upload image']);
        }
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
        $p['rating']         = (float) ($p['rating'] ?? 4.5);
    }
}
