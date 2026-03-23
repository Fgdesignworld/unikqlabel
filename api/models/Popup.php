<?php
/**
 * Popup Model — Promotional popup / offer management
 * Module 4: Dynamic Popup / Offer System
 */

require_once __DIR__ . '/../config/database.php';

class Popup {

    /**
     * Get the one active popup (for public display)
     */
    public static function getActive(): ?array {
        $db   = getDB();
        $stmt = $db->query("SELECT * FROM popups WHERE is_active = 1 ORDER BY id DESC LIMIT 1");
        $row  = $stmt->fetch();
        if (!$row) return null;
        return self::normalizeRow($row);
    }

    /**
     * Get all popups (admin)
     */
    public static function getAll(): array {
        $db   = getDB();
        $stmt = $db->query("SELECT * FROM popups ORDER BY id DESC");
        $rows = $stmt->fetchAll();
        return array_map(fn($r) => self::normalizeRow($r), $rows);
    }

    /**
     * Find by ID
     */
    public static function findById(int $id): ?array {
        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM popups WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row  = $stmt->fetch();
        return $row ? self::normalizeRow($row) : null;
    }

    /**
     * Normalize row data — parse JSON fields, convert types
     */
    private static function normalizeRow(array $row): array {
        // JSON decode items
        if (!empty($row['items']) && is_string($row['items'])) {
            $row['items'] = json_decode($row['items'], true) ?? [];
        }
        // Convert numeric fields
        $row['price'] = isset($row['price']) ? (float) $row['price'] : null;
        $row['delay_seconds'] = (int) $row['delay_seconds'];
        $row['views'] = (int) ($row['views'] ?? 0);
        $row['clicks'] = (int) ($row['clicks'] ?? 0);
        return $row;
    }

    /**
     * Create popup
     */
    public static function create(array $data): int {
        $db   = getDB();
        $stmt = $db->prepare(
            "INSERT INTO popups (title, description, image, button_text, button_link, delay_seconds, is_active, price, header_background, items)
             VALUES (:title, :description, :image, :button_text, :button_link, :delay_seconds, :is_active, :price, :header_background, :items)"
        );
        
        // Handle JSON encoding for items
        $items = null;
        if (!empty($data['items']) && is_array($data['items'])) {
            $items = json_encode($data['items']);
        }
        
        $stmt->execute([
            'title'               => trim($data['title']),
            'description'         => $data['description'] ?? null,
            'image'               => $data['image'] ?? null,
            'button_text'         => $data['button_text'] ?? null,
            'button_link'         => $data['button_link'] ?? null,
            'delay_seconds'       => (int) ($data['delay_seconds'] ?? 2),
            'is_active'           => (int) ($data['is_active'] ?? 0),
            'price'               => isset($data['price']) ? (float) $data['price'] : null,
            'header_background'   => $data['header_background'] ?? '#b91c1c',
            'items'               => $items,
        ]);
        return (int) $db->lastInsertId();
    }

    /**
     * Update popup
     */
    public static function update(int $id, array $data): bool {
        $db     = getDB();
        $fields = [];
        $params = ['id' => $id];

        $allowed = ['title', 'description', 'image', 'button_text', 'button_link', 'delay_seconds', 'is_active', 'price', 'header_background', 'items'];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                if ($field === 'items') {
                    // JSON encode items
                    $fields[] = "$field = :$field";
                    $params[$field] = is_array($data[$field]) ? json_encode($data[$field]) : $data[$field];
                } elseif ($field === 'price') {
                    $fields[] = "$field = :$field";
                    $params[$field] = isset($data[$field]) ? (float) $data[$field] : null;
                } elseif ($field === 'is_active' || $field === 'delay_seconds') {
                    $fields[] = "$field = :$field";
                    $params[$field] = (int) $data[$field];
                } else {
                    $fields[] = "$field = :$field";
                    $params[$field] = $data[$field];
                }
            }
        }

        if (empty($fields)) return false;
        $stmt = $db->prepare("UPDATE popups SET " . implode(', ', $fields) . " WHERE id = :id");
        return $stmt->execute($params);
    }

    /**
     * Delete popup
     */
    public static function delete(int $id): bool {
        $db   = getDB();
        $stmt = $db->prepare("DELETE FROM popups WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Deactivate all, then activate the given one
     */
    public static function setActive(int $id): bool {
        $db = getDB();
        $db->exec("UPDATE popups SET is_active = 0");
        $stmt = $db->prepare("UPDATE popups SET is_active = 1 WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Deactivate all
     */
    public static function deactivateAll(): void {
        getDB()->exec("UPDATE popups SET is_active = 0");
    }

    /**
     * Toggle active state
     */
    public static function toggle(int $id): ?int {
        $popup = self::findById($id);
        if (!$popup) return null;

        if ($popup['is_active']) {
            // Turning OFF
            self::update($id, ['is_active' => 0]);
            return 0;
        } else {
            // Turning ON — deactivate others first
            self::setActive($id);
            return 1;
        }
    }

    // ─── Analytics ──────────────────────────────────────────────────────────

    /**
     * Increment the view counter for a popup.
     * Safely adds the column if it doesn't exist yet (zero-migration approach).
     */
    public static function incrementViews(int $id): void {
        try {
            $db = getDB();
            // Ensure column exists (idempotent)
            $db->exec("ALTER TABLE popups ADD COLUMN IF NOT EXISTS views INT UNSIGNED NOT NULL DEFAULT 0");
            $db->prepare("UPDATE popups SET views = views + 1 WHERE id = :id")->execute(['id' => $id]);
        } catch (\Throwable $e) {
            error_log('Popup::incrementViews error: ' . $e->getMessage());
        }
    }

    /**
     * Increment the click counter for a popup.
     */
    public static function incrementClicks(int $id): void {
        try {
            $db = getDB();
            $db->exec("ALTER TABLE popups ADD COLUMN IF NOT EXISTS clicks INT UNSIGNED NOT NULL DEFAULT 0");
            $db->prepare("UPDATE popups SET clicks = clicks + 1 WHERE id = :id")->execute(['id' => $id]);
        } catch (\Throwable $e) {
            error_log('Popup::incrementClicks error: ' . $e->getMessage());
        }
    }
}
