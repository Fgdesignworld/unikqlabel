<?php
/**
 * Product Model — CRUD operations for products
 */

require_once __DIR__ . '/../config/database.php';

class Product {

    /**
     * Get all active products (public)
     */
    public static function getActive(): array {
        $db = getDB();
        $stmt = $db->query("SELECT * FROM products WHERE status = 'active' ORDER BY category, name");
        return $stmt->fetchAll();
    }

    /**
     * Get all products (admin)
     */
    public static function getAll(): array {
        $db = getDB();
        $stmt = $db->query("SELECT * FROM products ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    /**
     * Find product by ID
     */
    public static function findById(int $id): ?array {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM products WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $product = $stmt->fetch();
        return $product ?: null;
    }

    /**
     * Create a new product
     */
    public static function create(array $data): int {
        $db = getDB();
        $stmt = $db->prepare("
            INSERT INTO products (name, slug, description, category, weight, price, image, rating, bestseller, is_veg, is_homemade, variants, status)
            VALUES (:name, :slug, :description, :category, :weight, :price, :image, :rating, :bestseller, :is_veg, :is_homemade, :variants, :status)
        ");

        $stmt->execute([
            'name'        => $data['name'],
            'slug'        => $data['slug'] ?? self::createSlug($data['name']),
            'description' => $data['description'] ?? null,
            'category'    => $data['category'],
            'weight'      => $data['weight'] ?? '1kg',
            'price'       => $data['price'],
            'image'       => $data['image'] ?? null,
            'rating'      => $data['rating'] ?? 4.5,
            'bestseller'  => $data['bestseller'] ?? 0,
            'is_veg'      => $data['is_veg'] ?? 1,
            'is_homemade' => $data['is_homemade'] ?? 1,
            'variants'    => isset($data['variants']) ? json_encode($data['variants']) : null,
            'status'      => $data['status'] ?? 'active',
        ]);

        return (int) $db->lastInsertId();
    }

    /**
     * Update a product
     */
    public static function update(int $id, array $data): bool {
        $db = getDB();
        
        $fields = [];
        $params = ['id' => $id];

        $allowedFields = ['name', 'slug', 'description', 'category', 'weight', 'price', 'image', 'rating', 'bestseller', 'is_veg', 'is_homemade', 'variants', 'status'];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $value = $data[$field];
                if ($field === 'variants' && is_array($value)) {
                    $value = json_encode($value);
                }
                $fields[] = "`$field` = :$field";
                $params[$field] = $value;
            }
        }

        if (empty($fields)) return false;

        $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Delete a product
     */
    public static function delete(int $id): bool {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM products WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Generate URL-safe slug from name
     */
    public static function createSlug(string $name): string {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');
        return $slug;
    }
}
