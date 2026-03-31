<?php
/**
 * Inventory Controller — Admin CRUD for product variant stock
 */
require_once __DIR__ . '/../models/Inventory.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../middleware/auth.php';

class InventoryController {

    /**
     * GET /api/admin/inventory/{product_id}
     * Returns all inventory rows for a product.
     */
    public static function show(int $productId): void {
        requireAuth();

        $product = Product::findById($productId);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }

        $raw = Inventory::getForProduct($productId);
        $rows = array_map(function ($r) {
            return [
                'id'         => (int) $r['id'],
                'product_id' => (int) $r['product_id'],
                'size'       => $r['size'],
                'color'      => $r['color'],
                'stock'      => (int) $r['stock'],
                'sku'        => $r['sku'],
            ];
        }, $raw);
        echo json_encode(['inventory' => $rows]);
    }

    /**
     * GET /api/admin/inventory/all
     * Returns every inventory row across all products, cast to correct types.
     */
    public static function showAll(): void {
        requireAuth();

        try {
            $db   = getDB();
            $stmt = $db->query(
                'SELECT id, product_id, size, color, stock, sku
                 FROM product_variant_inventory
                 ORDER BY product_id, size, color'
            );
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $inventory = array_map(function ($r) {
                return [
                    'id'         => (int) $r['id'],
                    'product_id' => (int) $r['product_id'],
                    'size'       => $r['size'],
                    'color'      => $r['color'],
                    'stock'      => (int) $r['stock'],
                    'sku'        => $r['sku'],
                ];
            }, $rows);

            echo json_encode(['inventory' => $inventory]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * PUT /api/admin/inventory/{product_id}
     * Bulk upsert inventory rows.
     * Body: { rows: [{size, color, stock, sku?}] }
     */
    public static function update(int $productId): void {
        requireAuth();

        $product = Product::findById($productId);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['rows']) || !is_array($input['rows'])) {
            http_response_code(400);
            echo json_encode(['error' => 'rows array is required']);
            return;
        }

        // Validate each row
        foreach ($input['rows'] as $row) {
            if (!isset($row['stock']) || !is_numeric($row['stock'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Each row must have a numeric stock value']);
                return;
            }
        }

        try {
            Inventory::upsertBulk($productId, $input['rows']);
            $rows = Inventory::getForProduct($productId);
            echo json_encode(['success' => true, 'inventory' => $rows]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save inventory']);
        }
    }
}
