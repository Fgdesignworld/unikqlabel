<?php
/**
 * Inventory Model — Stock management per product/size/color variant
 */
require_once __DIR__ . '/../config/database.php';

class Inventory {

    /**
     * Get all inventory rows for a product, ordered by size then color
     */
    public static function getForProduct(int $productId): array {
        $db = getDB();
        $stmt = $db->prepare("
            SELECT id, product_id, size, color, stock, sku
            FROM product_variant_inventory
            WHERE product_id = :pid
            ORDER BY COALESCE(size,''), COALESCE(color,'')
        ");
        $stmt->execute(['pid' => $productId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) {
            $r['stock'] = (int) $r['stock'];
            $r['id']    = (int) $r['id'];
        }
        return $rows;
    }

    /**
     * Does this product have any inventory rows configured?
     */
    public static function hasInventory(int $productId): bool {
        $db = getDB();
        $stmt = $db->prepare("SELECT 1 FROM product_variant_inventory WHERE product_id = :pid LIMIT 1");
        $stmt->execute(['pid' => $productId]);
        return (bool) $stmt->fetch();
    }

    /**
     * Check stock level with priority cascade:
     *   1. size + color (exact)
     *   2. size only
     *   3. color only
     *   4. product-level fallback (size=NULL, color=NULL)
     *
     * Returns null if no inventory is configured.
     */
    public static function checkStock(int $productId, ?string $size, ?string $color): ?int {
        $db   = getDB();
        $size  = ($size  && trim($size)  !== '') ? trim($size)  : null;
        $color = ($color && trim($color) !== '') ? trim($color) : null;

        // All rows for this product loaded in one query
        $stmt = $db->prepare("
            SELECT size, color, stock
            FROM product_variant_inventory
            WHERE product_id = :pid
        ");
        $stmt->execute(['pid' => $productId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) return null; // No inventory configured

        $exact = $sizeOnly = $colorOnly = $fallback = null;

        foreach ($rows as $r) {
            $rs = ($r['size']  && trim($r['size'])  !== '') ? trim($r['size'])  : null;
            $rc = ($r['color'] && trim($r['color']) !== '') ? trim($r['color']) : null;

            if ($rs === $size && $rc === $color) {
                $exact = (int) $r['stock'];
            } elseif ($rs === $size && $rc === null && $color !== null) {
                $sizeOnly = (int) $r['stock'];
            } elseif ($rc === $color && $rs === null && $size !== null) {
                $colorOnly = (int) $r['stock'];
            } elseif ($rs === null && $rc === null) {
                $fallback = (int) $r['stock'];
            }
        }

        return $exact ?? $sizeOnly ?? $colorOnly ?? $fallback;
    }

    /**
     * Bulk-save inventory rows for a product.
     *
     * WHY DELETE + INSERT instead of ON DUPLICATE KEY UPDATE:
     * MySQL/MariaDB UNIQUE constraints treat NULL as distinct from every other
     * NULL, so (product_id, 'xs', NULL) is never equal to another row with the
     * same values and ON DUPLICATE KEY UPDATE silently INSERTs duplicates.
     * Deleting all rows for the product and re-inserting is the only reliable
     * solution without changing the schema.
     *
     * The operation is wrapped in an explicit transaction so it is atomic —
     * either all rows are saved or none are.
     */
    public static function upsertBulk(int $productId, array $rows): void {
        if (empty($rows)) return;

        $db = getDB();
        $db->beginTransaction();
        try {
            // 1. Remove all existing rows for this product (prevents duplicates)
            $db->prepare("DELETE FROM product_variant_inventory WHERE product_id = :pid")
               ->execute(['pid' => $productId]);

            // 2. Insert the fresh set of rows
            $stmt = $db->prepare("
                INSERT INTO product_variant_inventory (product_id, size, color, stock, sku)
                VALUES (:pid, :size, :color, :stock, :sku)
            ");

            foreach ($rows as $row) {
                $size  = (!isset($row['size'])  || trim((string)$row['size'])  === '') ? null : trim((string)$row['size']);
                $color = (!isset($row['color']) || trim((string)$row['color']) === '') ? null : trim((string)$row['color']);
                $stock = max(0, (int) ($row['stock'] ?? 0));
                $sku   = !empty($row['sku']) ? trim($row['sku']) : null;

                $stmt->execute([
                    'pid'   => $productId,
                    'size'  => $size,
                    'color' => $color,
                    'stock' => $stock,
                    'sku'   => $sku,
                ]);
            }

            $db->commit();
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }

    /**
     * Increment stock (e.g. when an order is cancelled/refunded).
     * Uses the same priority cascade as decrement to find the right row.
     */
    public static function increment(int $productId, ?string $size, ?string $color, int $qty): void {
        $db    = getDB();
        $size  = ($size  && trim($size)  !== '') ? trim($size)  : null;
        $color = ($color && trim($color) !== '') ? trim($color) : null;

        $stmt = $db->prepare("SELECT id, size, color FROM product_variant_inventory WHERE product_id = :pid");
        $stmt->execute(['pid' => $productId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) return;

        $exactId = $sizeOnlyId = $colorOnlyId = $fallbackId = null;

        foreach ($rows as $r) {
            $rs = ($r['size']  && trim($r['size'])  !== '') ? trim($r['size'])  : null;
            $rc = ($r['color'] && trim($r['color']) !== '') ? trim($r['color']) : null;

            if ($rs === $size && $rc === $color)                    $exactId     = (int)$r['id'];
            elseif ($rs === $size && $rc===null && $color!==null)   $sizeOnlyId  = (int)$r['id'];
            elseif ($rc === $color && $rs===null && $size!==null)   $colorOnlyId = (int)$r['id'];
            elseif ($rs === null && $rc === null)                   $fallbackId  = (int)$r['id'];
        }

        $targetId = $exactId ?? $sizeOnlyId ?? $colorOnlyId ?? $fallbackId;
        if ($targetId === null) return;

        $db->prepare("
            UPDATE product_variant_inventory
            SET stock = stock + :qty, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ")->execute(['qty' => $qty, 'id' => $targetId]);
    }

    /**
     * Decrement stock safely — never goes below 0.
     * Returns false if the row doesn't exist or stock is insufficient.
     */
    public static function decrement(int $productId, ?string $size, ?string $color, int $qty): bool {
        $db    = getDB();
        $size  = ($size  && trim($size)  !== '') ? trim($size)  : null;
        $color = ($color && trim($color) !== '') ? trim($color) : null;

        // Build the same priority query to find which row to decrement
        $stmt = $db->prepare("
            SELECT id, size, color, stock FROM product_variant_inventory WHERE product_id = :pid
        ");
        $stmt->execute(['pid' => $productId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) return true; // No inventory = skip

        $targetId = null;

        // Priority: exact, size-only, color-only, fallback
        $exactId = $sizeOnlyId = $colorOnlyId = $fallbackId = null;

        foreach ($rows as $r) {
            $rs = ($r['size']  && trim($r['size'])  !== '') ? trim($r['size'])  : null;
            $rc = ($r['color'] && trim($r['color']) !== '') ? trim($r['color']) : null;

            if ($rs === $size && $rc === $color)            $exactId     = (int)$r['id'];
            elseif ($rs === $size && $rc===null&&$color!==null) $sizeOnlyId  = (int)$r['id'];
            elseif ($rc === $color && $rs===null&&$size!==null) $colorOnlyId = (int)$r['id'];
            elseif ($rs === null && $rc === null)           $fallbackId  = (int)$r['id'];
        }

        $targetId = $exactId ?? $sizeOnlyId ?? $colorOnlyId ?? $fallbackId;
        if ($targetId === null) return true; // Row not found — skip

        $upd = $db->prepare("
            UPDATE product_variant_inventory
            SET stock = GREATEST(0, stock - :qty), updated_at = CURRENT_TIMESTAMP
            WHERE id = :id AND stock >= :min_qty
        ");
        return $upd->execute(['qty' => $qty, 'min_qty' => $qty, 'id' => $targetId]);
    }

    /**
     * Get a minimal stock summary for ALL products in a single query.
     * Returns [product_id => ['total_stock' => int, 'oos_count' => int, 'low_count' => int]]
     */
    public static function getAllStockSummary(int $lowThreshold = 10): array {
        $db = getDB();
        $stmt = $db->prepare("
            SELECT
                product_id,
                SUM(stock) AS total_stock,
                SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS oos_count,
                SUM(CASE WHEN stock > 0 AND stock <= :thr THEN 1 ELSE 0 END) AS low_count
            FROM product_variant_inventory
            GROUP BY product_id
        ");
        $stmt->execute(['thr' => $lowThreshold]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $result = [];
        foreach ($rows as $r) {
            $result[(int) $r['product_id']] = [
                'total_stock' => (int) $r['total_stock'],
                'oos_count'   => (int) $r['oos_count'],
                'low_count'   => (int) $r['low_count'],
            ];
        }
        return $result;
    }
}
