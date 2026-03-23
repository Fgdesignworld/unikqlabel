<?php
/**
 * Category Model — CRUD for product categories
 * Module 1: Dynamic Category Management
 */

require_once __DIR__ . '/../config/database.php';

class Category {

    /**
     * Get all active categories (public)
     */
    public static function getActive(): array {
        $db = getDB();
        $stmt = $db->query(
            "SELECT id, name, slug, image, status, sort_order
             FROM categories
             WHERE status = 'active'
             ORDER BY sort_order ASC, name ASC"
        );
        return $stmt->fetchAll();
    }

    /**
     * Get all categories (admin)
     */
    public static function getAll(): array {
        $db = getDB();
        $stmt = $db->query(
            "SELECT c.id, c.name, c.slug, c.image, c.status, c.sort_order, c.created_at,
                    COUNT(p.id) AS product_count
             FROM categories c
             LEFT JOIN products p ON p.category_id = c.id
             GROUP BY c.id
             ORDER BY c.sort_order ASC, c.id DESC"
        );
        return $stmt->fetchAll();
    }

    /**
     * Find category by ID
     */
    public static function findById(int $id): ?array {
        $db = getDB();
        $stmt = $db->prepare(
            "SELECT * FROM categories WHERE id = :id LIMIT 1"
        );
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Find category by slug
     */
    public static function findBySlug(string $slug): ?array {
        $db = getDB();
        $stmt = $db->prepare(
            "SELECT * FROM categories WHERE slug = :slug LIMIT 1"
        );
        $stmt->execute(['slug' => $slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Create a new category
     */
    public static function create(array $data): int {
        $db = getDB();
        $slug = $data['slug'] ?? self::generateSlug($data['name']);

        // Ensure slug is unique
        $slug = self::uniqueSlug($slug);

        $stmt = $db->prepare(
            "INSERT INTO categories (name, slug, image, status, sort_order)
             VALUES (:name, :slug, :image, :status, :sort_order)"
        );
        $stmt->execute([
            'name'       => trim($data['name']),
            'slug'       => $slug,
            'image'      => $data['image'] ?? null,
            'status'     => in_array($data['status'] ?? '', ['active', 'inactive']) ? $data['status'] : 'active',
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ]);
        return (int) $db->lastInsertId();
    }

    /**
     * Update a category
     */
    public static function update(int $id, array $data): bool {
        $db = getDB();

        $fields = [];
        $params = ['id' => $id];

        if (isset($data['name'])) {
            $fields[] = 'name = :name';
            $params['name'] = trim($data['name']);
        }
        if (isset($data['slug'])) {
            $newSlug = self::uniqueSlug(trim($data['slug']), $id);
            $fields[] = 'slug = :slug';
            $params['slug'] = $newSlug;
        }
        if (array_key_exists('image', $data)) {
            $fields[] = 'image = :image';
            $params['image'] = $data['image'];
        }
        if (isset($data['status']) && in_array($data['status'], ['active', 'inactive'])) {
            $fields[] = 'status = :status';
            $params['status'] = $data['status'];
        }
        if (isset($data['sort_order'])) {
            $fields[] = 'sort_order = :sort_order';
            $params['sort_order'] = (int) $data['sort_order'];
        }

        if (empty($fields)) return false;

        $sql = "UPDATE categories SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Delete a category
     */
    public static function delete(int $id): bool {
        $db = getDB();
        // Nullify category_id on products (non-breaking)
        $db->prepare("UPDATE products SET category_id = NULL WHERE category_id = :id")
           ->execute(['id' => $id]);
        $stmt = $db->prepare("DELETE FROM categories WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Toggle status
     */
    public static function toggleStatus(int $id): ?string {
        $db = getDB();
        $cat = self::findById($id);
        if (!$cat) return null;

        $newStatus = $cat['status'] === 'active' ? 'inactive' : 'active';
        $db->prepare("UPDATE categories SET status = :status WHERE id = :id")
           ->execute(['status' => $newStatus, 'id' => $id]);
        return $newStatus;
    }

    /**
     * Auto-generate slug from name
     */
    public static function generateSlug(string $name): string {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        return trim($slug, '-');
    }

    /**
     * Ensure slug uniqueness (append -N if conflict)
     */
    private static function uniqueSlug(string $base, int $excludeId = 0): string {
        $db = getDB();
        $slug = $base;
        $i = 1;

        while (true) {
            $stmt = $db->prepare(
                "SELECT id FROM categories WHERE slug = :slug AND id != :exclude LIMIT 1"
            );
            $stmt->execute(['slug' => $slug, 'exclude' => $excludeId]);
            if (!$stmt->fetch()) break;
            $slug = $base . '-' . $i;
            $i++;
        }

        return $slug;
    }
}
