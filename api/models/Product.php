<?php
/**
 * Product Model — CRUD operations for products
 */

require_once __DIR__ . '/../config/database.php';

class Product {

    /**
     * Get all active products (public), optionally filtered
     */
    public static function getActive(array $filters = []): array {
        $db = getDB();

        $where  = ["status = 'active'"];
        $params = [];

        if (!empty($filters['category'])) {
            $where[]            = 'category = :category';
            $params['category'] = $filters['category'];
        }
        if (isset($filters['is_veg']) && $filters['is_veg'] !== '') {
            $where[]          = 'is_veg = :is_veg';
            $params['is_veg'] = (int) $filters['is_veg'];
        }
        if (isset($filters['min_price'])) {
            $where[]              = 'price >= :min_price';
            $params['min_price']  = (float) $filters['min_price'];
        }
        if (isset($filters['max_price'])) {
            $where[]              = 'price <= :max_price';
            $params['max_price']  = (float) $filters['max_price'];
        }

        $sql  = 'SELECT * FROM products';
        $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY sort_order ASC, name ASC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Get all products (admin view)
     */
    public static function getAll(): array {
        $db = getDB();
        $stmt = $db->query("SELECT * FROM products ORDER BY sort_order ASC, id DESC");
        $products = $stmt->fetchAll();
        return $products;
    }

    /**
     * Find product by slug (public)
     */
    public static function findBySlug(string $slug): ?array {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM products WHERE slug = :slug AND status = 'active' LIMIT 1");
        $stmt->execute(['slug' => $slug]);
        $product = $stmt->fetch();
        return $product ?: null;
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
            INSERT INTO products (name, slug, description, category, weight, price, discount_price, image, gallery_images, rating, bestseller, is_veg, is_homemade, variants, status)
            VALUES (:name, :slug, :description, :category, :weight, :price, :discount_price, :image, :gallery_images, :rating, :bestseller, :is_veg, :is_homemade, :variants, :status)
        ");

        $stmt->execute([
            'name'          => $data['name'],
            'slug'          => $data['slug'] ?? self::createSlug($data['name']),
            'description'   => $data['description'] ?? null,
            'category'      => $data['category'],
            'weight'        => $data['weight'] ?? '',
            'price'         => $data['price'],
            'discount_price'=> isset($data['discount_price']) ? (float)$data['discount_price'] : null,
            'image'         => $data['image'] ?? null,
            'gallery_images'=> isset($data['gallery_images']) ? json_encode($data['gallery_images']) : null,
            'rating'        => $data['rating'] ?? 0,
            'bestseller'    => $data['bestseller'] ?? 0,
            'is_veg'        => $data['is_veg'] ?? 1,
            'is_homemade'   => $data['is_homemade'] ?? 1,
            'variants'      => isset($data['variants']) ? json_encode($data['variants']) : null,
            'status'        => $data['status'] ?? 'active',
        ]);

        // Set new variant columns immediately after insert
        $id = (int) $db->lastInsertId();
        if (array_key_exists('variants_json', $data) || array_key_exists('color_variants_json', $data)) {
            $cols   = [];
            $params = ['id' => $id];
            if (array_key_exists('variants_json', $data)) {
                $cols[] = 'variants_json = :variants_json';
                $params['variants_json'] = is_array($data['variants_json']) ? json_encode($data['variants_json']) : null;
            }
            if (array_key_exists('color_variants_json', $data)) {
                $cols[] = 'color_variants_json = :color_variants_json';
                $params['color_variants_json'] = is_array($data['color_variants_json']) ? json_encode($data['color_variants_json']) : null;
            }
            if (!empty($cols)) {
                $db->prepare('UPDATE products SET ' . implode(', ', $cols) . ' WHERE id = :id')->execute($params);
            }
        }
        return $id;
    }

    /**
     * Update a product
     */
    public static function update(int $id, array $data): bool {
        $db = getDB();
        
        $fields = [];
        $params = ['id' => $id];

        $allowedFields = ['name', 'slug', 'description', 'category', 'weight', 'price', 'discount_price', 'image', 'gallery_images', 'rating', 'bestseller', 'is_veg', 'is_homemade', 'variants', 'variants_json', 'color_variants_json', 'status'];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $value = $data[$field];
                if ($field === 'variants' && is_array($value)) {
                    $value = json_encode($value);
                }
                if ($field === 'variants_json' && is_array($value)) {
                    $value = json_encode($value);
                }
                if ($field === 'color_variants_json' && is_array($value)) {
                    $value = json_encode($value);
                }
                if ($field === 'gallery_images' && is_array($value)) {
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
     * Update product sort order
     */
    public static function updateSortOrder(array $items): bool {
        $db = getDB();
        
        try {
            $db->beginTransaction();
            $stmt = $db->prepare("UPDATE products SET sort_order = :sort_order WHERE id = :id");
            
            foreach ($items as $item) {
                if (isset($item['id']) && isset($item['sort_order'])) {
                    $stmt->execute([
                        'id' => $item['id'],
                        'sort_order' => $item['sort_order']
                    ]);
                }
            }
            
            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
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
