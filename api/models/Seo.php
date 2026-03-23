<?php
/**
 * SEO Model — Manage meta tags per page
 * Module 2: SEO Management System
 */

require_once __DIR__ . '/../config/database.php';

class Seo {

    /**
     * Get SEO record for a specific page
     *
     * @param string      $pageType  home|product|category|page
     * @param int|null    $pageId    For product/category context
     * @param string|null $pageSlug  For static pages (about, contact, …)
     */
    public static function getForPage(string $pageType, ?int $pageId = null, ?string $pageSlug = null): ?array {
        $db   = getDB();
        $sql  = "SELECT * FROM seo WHERE page_type = :page_type";
        $bind = ['page_type' => $pageType];

        if ($pageId !== null) {
            $sql .= " AND page_id = :page_id";
            $bind['page_id'] = $pageId;
        } else {
            $sql .= " AND page_id IS NULL";
        }

        if ($pageSlug !== null) {
            $sql .= " AND page_slug = :page_slug";
            $bind['page_slug'] = $pageSlug;
        } else {
            $sql .= " AND page_slug IS NULL";
        }

        $sql .= " LIMIT 1";
        $stmt = $db->prepare($sql);
        $stmt->execute($bind);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Get all SEO records (admin)
     */
    public static function getAll(): array {
        $db   = getDB();
        $stmt = $db->query(
            "SELECT s.*,
                    CASE
                        WHEN s.page_type = 'product'  THEN p.name
                        WHEN s.page_type = 'category' THEN c.name
                        ELSE NULL
                    END AS related_name
             FROM seo s
             LEFT JOIN products   p ON p.id = s.page_id AND s.page_type = 'product'
             LEFT JOIN categories c ON c.id = s.page_id AND s.page_type = 'category'
             ORDER BY s.page_type, s.id"
        );
        return $stmt->fetchAll();
    }

    /**
     * Find by ID
     */
    public static function findById(int $id): ?array {
        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM seo WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Upsert — insert or update by unique key
     */
    public static function upsert(array $data): int {
        $db = getDB();

        $pageType = $data['page_type'];
        $pageId   = isset($data['page_id']) ? (int) $data['page_id'] : null;
        $pageSlug = $data['page_slug'] ?? null;

        $existing = self::getForPage($pageType, $pageId, $pageSlug);

        if ($existing) {
            self::update($existing['id'], $data);
            return $existing['id'];
        }

        $stmt = $db->prepare(
            "INSERT INTO seo (page_type, page_id, page_slug, meta_title, meta_description, meta_keywords, og_image)
             VALUES (:page_type, :page_id, :page_slug, :meta_title, :meta_description, :meta_keywords, :og_image)"
        );
        $stmt->execute([
            'page_type'        => $pageType,
            'page_id'          => $pageId,
            'page_slug'        => $pageSlug,
            'meta_title'       => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'meta_keywords'    => $data['meta_keywords'] ?? null,
            'og_image'         => $data['og_image'] ?? null,
        ]);
        return (int) $db->lastInsertId();
    }

    /**
     * Update by ID
     */
    public static function update(int $id, array $data): bool {
        $db     = getDB();
        $fields = [];
        $params = ['id' => $id];

        $allowed = ['meta_title', 'meta_description', 'meta_keywords', 'og_image'];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (empty($fields)) return false;

        $stmt = $db->prepare("UPDATE seo SET " . implode(', ', $fields) . " WHERE id = :id");
        return $stmt->execute($params);
    }

    /**
     * Delete by ID
     */
    public static function delete(int $id): bool {
        $db   = getDB();
        $stmt = $db->prepare("DELETE FROM seo WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
