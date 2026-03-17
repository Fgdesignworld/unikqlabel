<?php
/**
 * Notification Controller — Admin broadcast notifications
 */
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../middleware/auth.php';

class NotificationController {

    /**
     * GET /api/admin/notifications — List all notifications + unread count
     */
    public static function getAll(): void {
        requireAuth();
        $notifications = Notification::getAll();
        $unread = Notification::countUnread();
        echo json_encode([
            'notifications' => $notifications,
            'unread_count'  => $unread,
        ]);
    }

    /**
     * PUT /api/admin/notifications/{id}/read — Mark single notification as read
     */
    public static function markRead(int $id): void {
        requireAuth();
        if ($id < 1) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid notification ID']);
            return;
        }
        Notification::markRead($id);
        echo json_encode(['success' => true, 'unread_count' => Notification::countUnread()]);
    }

    /**
     * PUT /api/admin/notifications/read-all — Mark all as read
     */
    public static function markAllRead(): void {
        requireAuth();
        Notification::markAllRead();
        echo json_encode(['success' => true, 'unread_count' => 0]);
    }
}
