<?php
/**
 * SizeVariantSet Model — manages size_variant_sets + size_variants tables
 */
require_once __DIR__ . '/../config/database.php';

class SizeVariantSet {

    /** Get all sets */
    public static function getAll(): array {
        $db   = getDB();
        $stmt = $db->query("SELECT * FROM size_variant_sets ORDER BY id ASC");
        return $stmt->fetchAll();
    }

    /** Get all active sets (public/product form dropdown) */
    public static function getActive(): array {
        $db   = getDB();
        $stmt = $db->query("SELECT * FROM size_variant_sets WHERE is_active = 1 ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    /** Find set by ID */
    public static function findById(int $id): ?array {
        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM size_variant_sets WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    /** Create a new set */
    public static function create(array $data): int {
        $db   = getDB();
        $stmt = $db->prepare("INSERT INTO size_variant_sets (name, is_active) VALUES (:name, :is_active)");
        $stmt->execute([
            'name'      => $data['name'],
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        ]);
        return (int)$db->lastInsertId();
    }

    /** Update a set */
    public static function update(int $id, array $data): bool {
        $db   = getDB();
        $stmt = $db->prepare("UPDATE size_variant_sets SET name = :name, is_active = :is_active, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
        return $stmt->execute([
            'id'        => $id,
            'name'      => $data['name'],
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        ]);
    }

    /** Delete a set (cascades to size_variants) */
    public static function delete(int $id): bool {
        $db   = getDB();
        $stmt = $db->prepare("DELETE FROM size_variant_sets WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    // ── Variants within a set ──────────────────────────────

    /** Get all variants for a set, ordered */
    public static function getVariants(int $setId): array {
        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM size_variants WHERE set_id = :set_id ORDER BY sort_order ASC, id ASC");
        $stmt->execute(['set_id' => $setId]);
        return $stmt->fetchAll();
    }

    /** Get active variants for a set (used by frontend/product API) */
    public static function getActiveVariants(int $setId): array {
        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM size_variants WHERE set_id = :set_id AND is_active = 1 ORDER BY sort_order ASC, id ASC");
        $stmt->execute(['set_id' => $setId]);
        return $stmt->fetchAll();
    }

    /** Upsert variants for a set — replaces all variants in one clean call */
    public static function saveVariants(int $setId, array $variants): void {
        $db = getDB();
        // Delete existing
        $db->prepare("DELETE FROM size_variants WHERE set_id = :set_id")->execute(['set_id' => $setId]);
        // Re-insert
        $stmt = $db->prepare("INSERT INTO size_variants (set_id, label, price_adjustment, sort_order, is_active) VALUES (:set_id, :label, :price_adjustment, :sort_order, :is_active)");
        foreach ($variants as $i => $v) {
            $stmt->execute([
                'set_id'           => $setId,
                'label'            => $v['label'] ?? '',
                'price_adjustment' => isset($v['price_adjustment']) && $v['price_adjustment'] !== '' ? (float)$v['price_adjustment'] : null,
                'sort_order'       => $i,
                'is_active'        => isset($v['is_active']) ? (int)$v['is_active'] : 1,
            ]);
        }
    }

    /** Add a single variant */
    public static function addVariant(int $setId, array $v): int {
        $db   = getDB();
        $count = (int)$db->prepare("SELECT COUNT(*) FROM size_variants WHERE set_id = :s")->execute(['s' => $setId]);
        $stmt = $db->prepare("INSERT INTO size_variants (set_id, label, price_adjustment, sort_order, is_active) VALUES (:set_id, :label, :price_adjustment, :sort_order, :is_active)");
        $stmt->execute([
            'set_id'           => $setId,
            'label'            => $v['label'] ?? '',
            'price_adjustment' => isset($v['price_adjustment']) && $v['price_adjustment'] !== '' ? (float)$v['price_adjustment'] : null,
            'sort_order'       => $v['sort_order'] ?? $count,
            'is_active'        => isset($v['is_active']) ? (int)$v['is_active'] : 1,
        ]);
        return (int)$db->lastInsertId();
    }

    /** Update a single variant by ID */
    public static function updateVariant(int $variantId, array $v): bool {
        $db   = getDB();
        $stmt = $db->prepare("UPDATE size_variants SET label = :label, price_adjustment = :price_adjustment, sort_order = :sort_order, is_active = :is_active, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
        return $stmt->execute([
            'id'               => $variantId,
            'label'            => $v['label'] ?? '',
            'price_adjustment' => isset($v['price_adjustment']) && $v['price_adjustment'] !== '' ? (float)$v['price_adjustment'] : null,
            'sort_order'       => $v['sort_order'] ?? 0,
            'is_active'        => isset($v['is_active']) ? (int)$v['is_active'] : 1,
        ]);
    }

    /** Delete a single variant by ID */
    public static function deleteVariant(int $variantId): bool {
        $db   = getDB();
        return $db->prepare("DELETE FROM size_variants WHERE id = :id")->execute(['id' => $variantId]);
    }
}
