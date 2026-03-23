<?php
/**
 * Settings Model — Key-value store for global site settings
 * Module 3: Global Settings System
 */

require_once __DIR__ . '/../config/database.php';

class Settings {

    /**
     * Get all settings as associative array: key => value
     */
    public static function getAll(): array {
        $db   = getDB();
        $stmt = $db->query("SELECT setting_key, setting_value, setting_group FROM settings ORDER BY setting_group, id");
        $rows = $stmt->fetchAll();

        $result = [];
        foreach ($rows as $row) {
            $result[$row['setting_key']] = $row['setting_value'];
        }
        return $result;
    }

    /**
     * Get all settings grouped by setting_group
     */
    public static function getAllGrouped(): array {
        $db   = getDB();
        $stmt = $db->query("SELECT setting_key, setting_value, setting_group FROM settings ORDER BY setting_group, id");
        $rows = $stmt->fetchAll();

        $result = [];
        foreach ($rows as $row) {
            $result[$row['setting_group']][$row['setting_key']] = $row['setting_value'];
        }
        return $result;
    }

    /**
     * Get a single setting value
     */
    public static function get(string $key, ?string $default = null): ?string {
        $db   = getDB();
        $stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = :key LIMIT 1");
        $stmt->execute(['key' => $key]);
        $row = $stmt->fetch();
        return $row ? $row['setting_value'] : $default;
    }

    /**
     * Upsert a single key
     */
    public static function set(string $key, ?string $value): bool {
        $db   = getDB();
        $stmt = $db->prepare(
            "INSERT INTO settings (setting_key, setting_value)
             VALUES (:key, :value)
             ON DUPLICATE KEY UPDATE setting_value = :value"
        );
        return $stmt->execute(['key' => $key, 'value' => $value]);
    }

    /**
     * Upsert multiple key-value pairs (batch)
     */
    public static function setMany(array $data): bool {
        $db = getDB();
        $db->beginTransaction();
        try {
            $stmt = $db->prepare(
                "INSERT INTO settings (setting_key, setting_value)
                 VALUES (:key, :value1)
                 ON DUPLICATE KEY UPDATE setting_value = :value2"
            );
            foreach ($data as $key => $value) {
                if (!$stmt->execute(['key' => $key, 'value1' => $value, 'value2' => $value])) {
                    $error = $stmt->errorInfo();
                    throw new Exception("Failed to insert/update setting '$key': " . json_encode($error));
                }
            }
            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            error_log('Settings setMany error: ' . $e->getMessage());
            throw $e;
        }
    }
}
