<?php
/**
 * HeroSlide Model — Hero Section CMS
 */

require_once __DIR__ . '/../config/database.php';

class HeroSlide {

    // ─── Public ──────────────────────────────────────────────────────────────

    /**
     * Get active slides for public display, filtered by date, sorted by sort_order.
     */
    public static function getPublic(): array {
        $db   = getDB();
        $now  = date('Y-m-d H:i:s');
        $stmt = $db->prepare(
            "SELECT * FROM hero_slides
             WHERE is_active = 1
               AND (start_date IS NULL OR start_date <= :now1)
               AND (end_date   IS NULL OR end_date   >= :now2)
             ORDER BY sort_order ASC, id ASC"
        );
        $stmt->execute(['now1' => $now, 'now2' => $now]);
        $rows = $stmt->fetchAll();
        return array_map(fn($r) => self::normalizeRow($r), $rows);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    /**
     * Get all slides (admin, no date filter).
     */
    public static function getAll(): array {
        $db   = getDB();
        $stmt = $db->query("SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();
        return array_map(fn($r) => self::normalizeRow($r), $rows);
    }

    /**
     * Find by ID.
     */
    public static function findById(int $id): ?array {
        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM hero_slides WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row  = $stmt->fetch();
        return $row ? self::normalizeRow($row) : null;
    }

    /**
     * Create slide — returns new ID.
     */
    public static function create(array $data): int {
        $db   = getDB();
        $stmt = $db->prepare(
            "INSERT INTO hero_slides
               (title, subtitle, tagline, cta_primary_text, cta_primary_link,
                cta_secondary_text, cta_secondary_link, image, mobile_image,
                badge_text, badge_icon, category, product_ids, price_label,
                is_active, sort_order, start_date, end_date)
             VALUES
               (:title, :subtitle, :tagline, :cta_primary_text, :cta_primary_link,
                :cta_secondary_text, :cta_secondary_link, :image, :mobile_image,
                :badge_text, :badge_icon, :category, :product_ids, :price_label,
                :is_active, :sort_order, :start_date, :end_date)"
        );
        $stmt->execute(self::buildParams($data));
        return (int) $db->lastInsertId();
    }

    /**
     * Update slide.
     */
    public static function update(int $id, array $data): bool {
        $db     = getDB();
        $fields = [];
        $params = self::buildParams($data);
        $params['id'] = $id;

        $allowed = [
            'title','subtitle','tagline','cta_primary_text','cta_primary_link',
            'cta_secondary_text','cta_secondary_link','image','mobile_image',
            'badge_text','badge_icon','category','product_ids','price_label',
            'is_active','sort_order','start_date','end_date',
        ];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $params)) {
                $fields[] = "$f = :$f";
            }
        }
        if (empty($fields)) return false;

        $sql  = "UPDATE hero_slides SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Toggle is_active.
     */
    public static function toggleActive(int $id): bool {
        $db   = getDB();
        $stmt = $db->prepare("UPDATE hero_slides SET is_active = NOT is_active WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Reorder slides.  $order = [['id' => 1, 'sort_order' => 0], ...]
     */
    public static function reorder(array $order): void {
        $db   = getDB();
        $stmt = $db->prepare("UPDATE hero_slides SET sort_order = :sort_order WHERE id = :id");
        foreach ($order as $item) {
            $stmt->execute(['id' => (int)$item['id'], 'sort_order' => (int)$item['sort_order']]);
        }
    }

    /**
     * Delete slide.
     */
    public static function delete(int $id): bool {
        $db   = getDB();
        $stmt = $db->prepare("DELETE FROM hero_slides WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static function normalizeRow(array $row): array {
        $row['id']          = (int)  $row['id'];
        $row['is_active']   = (bool) $row['is_active'];
        $row['sort_order']  = (int)  $row['sort_order'];
        if (isset($row['product_ids']) && is_string($row['product_ids'])) {
            $row['product_ids'] = json_decode($row['product_ids'], true) ?? [];
        }
        return $row;
    }

    private static function buildParams(array $data): array {
        $validCategories = ['men','women','unisex','trending','limited'];
        return [
            'title'               => trim($data['title'] ?? ''),
            'subtitle'            => $data['subtitle'] ?? null,
            'tagline'             => $data['tagline'] ?? null,
            'cta_primary_text'    => $data['cta_primary_text'] ?? null,
            'cta_primary_link'    => $data['cta_primary_link'] ?? null,
            'cta_secondary_text'  => $data['cta_secondary_text'] ?? null,
            'cta_secondary_link'  => $data['cta_secondary_link'] ?? null,
            'image'               => $data['image'] ?? null,
            'mobile_image'        => $data['mobile_image'] ?? null,
            'badge_text'          => $data['badge_text'] ?? null,
            'badge_icon'          => $data['badge_icon'] ?? null,
            'category'            => in_array($data['category'] ?? '', $validCategories) ? $data['category'] : 'unisex',
            'product_ids'         => isset($data['product_ids']) ? json_encode(array_map('intval', (array)$data['product_ids'])) : null,
            'price_label'         => $data['price_label'] ?? null,
            'is_active'           => (int) ($data['is_active'] ?? 1),
            'sort_order'          => (int) ($data['sort_order'] ?? 0),
            'start_date'          => !empty($data['start_date']) ? $data['start_date'] : null,
            'end_date'            => !empty($data['end_date'])   ? $data['end_date']   : null,
        ];
    }
}
