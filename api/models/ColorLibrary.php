<?php
/**
 * ColorLibrary Model — manages color_library + product_color_images tables
 */
require_once __DIR__ . '/../config/database.php';

class ColorLibrary {

    // ── Color Library CRUD ─────────────────────────────────

    /** Get all colors */
    public static function getAll(): array {
        $db   = getDB();
        $stmt = $db->query("SELECT * FROM color_library ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    /** Get all active colors */
    public static function getActive(): array {
        $db   = getDB();
        $stmt = $db->query("SELECT * FROM color_library WHERE is_active = 1 ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    /** Find by ID */
    public static function findById(int $id): ?array {
        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM color_library WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    /** Create a color */
    public static function create(array $data): int {
        $db   = getDB();
        $stmt = $db->prepare("INSERT INTO color_library (name, hex_code, is_active) VALUES (:name, :hex_code, :is_active)");
        $stmt->execute([
            'name'      => $data['name'],
            'hex_code'  => $data['hex_code'] ?? '#000000',
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        ]);
        return (int)$db->lastInsertId();
    }

    /** Update a color */
    public static function update(int $id, array $data): bool {
        $db   = getDB();
        $stmt = $db->prepare("UPDATE color_library SET name = :name, hex_code = :hex_code, is_active = :is_active, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
        return $stmt->execute([
            'id'        => $id,
            'name'      => $data['name'],
            'hex_code'  => $data['hex_code'] ?? '#000000',
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        ]);
    }

    /** Delete a color */
    public static function delete(int $id): bool {
        $db = getDB();
        return $db->prepare("DELETE FROM color_library WHERE id = :id")->execute(['id' => $id]);
    }

    // ── Product → Color Image Mapping ─────────────────────

    /** Get all color mappings for a product */
    public static function getProductColors(int $productId): array {
        $db   = getDB();
        $stmt = $db->prepare("
            SELECT pci.id, pci.product_id, pci.color_id, pci.images_json,
                   cl.name AS color_name, cl.hex_code
            FROM product_color_images pci
            JOIN color_library cl ON cl.id = pci.color_id
            WHERE pci.product_id = :product_id
            AND cl.is_active = 1
            ORDER BY cl.name ASC
        ");
        $stmt->execute(['product_id' => $productId]);
        $rows = $stmt->fetchAll();

        // Decode images_json
        foreach ($rows as &$row) {
            $row['images'] = json_decode($row['images_json'] ?? '[]', true) ?: [];
        }
        return $rows;
    }

    /**
     * Save all color mappings for a product in one call.
     * $colors = [ ['color_id' => 2, 'images' => ['/path1', '/path2']], ... ]
     */
    public static function saveProductColors(int $productId, array $colors): void {
        $db = getDB();

        // Delete all existing mappings for this product
        $db->prepare("DELETE FROM product_color_images WHERE product_id = :pid")->execute(['pid' => $productId]);

        if (empty($colors)) return;

        $stmt = $db->prepare("
            INSERT INTO product_color_images (product_id, color_id, images_json)
            VALUES (:product_id, :color_id, :images_json)
        ");

        foreach ($colors as $c) {
            if (empty($c['color_id'])) continue;
            $images = is_array($c['images'] ?? null) ? $c['images'] : [];
            $stmt->execute([
                'product_id'  => $productId,
                'color_id'    => (int)$c['color_id'],
                'images_json' => json_encode($images),
            ]);
        }
    }

    /**
     * Build a color_variants_json-compatible array from product_color_images.
     * Shape: [{ color: "Black", hex: "#000000", images: [...] }]
     */
    public static function buildColorVariantsJson(int $productId): array {
        $rows = self::getProductColors($productId);
        return array_values(array_map(fn($r) => [
            'color'  => $r['color_name'],
            'hex'    => $r['hex_code'],
            'images' => $r['images'],
        ], $rows));
    }
}
