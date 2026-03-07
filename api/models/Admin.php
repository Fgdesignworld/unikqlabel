<?php
/**
 * Admin Model — Authentication and user management
 */

require_once __DIR__ . '/../config/database.php';

class Admin {
    
    /**
     * Find admin by email
     */
    public static function findByEmail(string $email): ?array {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM admins WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        $admin = $stmt->fetch();
        return $admin ?: null;
    }

    /**
     * Verify password against hash
     */
    public static function verifyPassword(string $password, string $hash): bool {
        return password_verify($password, $hash);
    }

    /**
     * Get admin by ID
     */
    public static function findById(int $id): ?array {
        $db = getDB();
        $stmt = $db->prepare("SELECT id, name, email, created_at FROM admins WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $admin = $stmt->fetch();
        return $admin ?: null;
    }

    /**
     * Update admin password
     */
    public static function updatePassword(int $id, string $newPassword): bool {
        $db = getDB();
        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $db->prepare("UPDATE admins SET password_hash = :hash WHERE id = :id");
        return $stmt->execute(['hash' => $hash, 'id' => $id]);
    }
}
