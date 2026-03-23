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
        return $row ?: null;
    }

    /**
     * Get all popups (admin)
     */
    public static function getAll(): array {
        $db   = getDB();
        $stmt = $db->query("SELECT * FROM popups ORDER BY id DESC");
        return $stmt->fetchAll();
    }

    /**
     * Find by ID
     */
    public static function findById(int $id): ?array {
        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM popups WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row  = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Create popup
     */
    public static function create(array $data): int {
        $db   = getDB();
        $stmt = $db->prepare(
            "INSERT INTO popups (title, description, image, button_text, button_link, delay_seconds, is_active)
             VALUES (:title, :description, :image, :button_text, :button_link, :delay_seconds, :is_active)"
        );
        $stmt->execute([
            'title'         => trim($data['title']),
            'description'   => $data['description'] ?? null,
            'image'         => $data['image'] ?? null,
            'button_text'   => $data['button_text'] ?? null,
            'button_link'   => $data['button_link'] ?? null,
            'delay_seconds' => (int) ($data['delay_seconds'] ?? 2),
            'is_active'     => (int) ($data['is_active'] ?? 0),
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

        $allowed = ['title', 'description', 'image', 'button_text', 'button_link', 'delay_seconds', 'is_active'];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $field === 'is_active' || $field === 'delay_seconds'
                    ? (int) $data[$field]
                    : $data[$field];
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
}
