<?php
/**
 * Notification Model — Admin order notifications
 */
require_once __DIR__ . '/../config/database.php';

class Notification {

    /**
     * Create a new notification
     */
    public static function create(string $type, int $referenceId, string $message): int {
        $pdo = getDB();
        $stmt = $pdo->prepare(
            "INSERT INTO notifications (type, reference_id, message, is_read, created_at)
             VALUES (:type, :reference_id, :message, 0, NOW())"
        );
        $stmt->execute([
            'type'         => $type,
            'reference_id' => $referenceId,
            'message'      => $message,
        ]);
        return (int) $pdo->lastInsertId();
    }

    /**
     * Get all notifications (newest first, limit 50)
     */
    public static function getAll(): array {
        $pdo = getDB();
        $stmt = $pdo->query(
            "SELECT id, type, reference_id, message, is_read, created_at
             FROM notifications
             ORDER BY created_at DESC
             LIMIT 50"
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Count of unread notifications
     */
    public static function countUnread(): int {
        $pdo = getDB();
        $stmt = $pdo->query("SELECT COUNT(*) FROM notifications WHERE is_read = 0");
        return (int) $stmt->fetchColumn();
    }

    /**
     * Mark a single notification as read
     */
    public static function markRead(int $id): void {
        $pdo = getDB();
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    /**
     * Mark all notifications as read
     */
    public static function markAllRead(): void {
        $pdo = getDB();
        $pdo->exec("UPDATE notifications SET is_read = 1 WHERE is_read = 0");
    }
}
