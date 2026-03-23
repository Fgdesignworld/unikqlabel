<?php
/**
 * DeliveryRule Model — Delivery fee & order minimum rules
 * Module 5: Delivery & Order Rule System
 */

require_once __DIR__ . '/../config/database.php';

class DeliveryRule {

    /**
     * Get the active rule (always returns row ID=1 or the first active rule)
     */
    public static function getActive(): ?array {
        $db   = getDB();
        $stmt = $db->query("SELECT * FROM delivery_rules WHERE is_active = 1 ORDER BY id ASC LIMIT 1");
        $row  = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Update the delivery rule (upserts ID=1 by convention)
     */
    public static function upsert(array $data): bool {
        $db = getDB();

        // Check if row exists
        $exists = $db->query("SELECT id FROM delivery_rules LIMIT 1")->fetch();

        if ($exists) {
            $stmt = $db->prepare(
                "UPDATE delivery_rules
                 SET min_order_amount    = :min_order,
                     delivery_fee        = :delivery_fee,
                     free_delivery_above = :free_above,
                     is_active           = :is_active
                 WHERE id = :id"
            );
            return $stmt->execute([
                'min_order'    => (float) ($data['min_order_amount']    ?? 0),
                'delivery_fee' => (float) ($data['delivery_fee']        ?? 40),
                'free_above'   => (float) ($data['free_delivery_above'] ?? 500),
                'is_active'    => (int)   ($data['is_active']           ?? 1),
                'id'           => $exists['id'],
            ]);
        }

        // Insert first record
        $stmt = $db->prepare(
            "INSERT INTO delivery_rules (min_order_amount, delivery_fee, free_delivery_above, is_active)
             VALUES (:min_order, :delivery_fee, :free_above, :is_active)"
        );
        return $stmt->execute([
            'min_order'    => (float) ($data['min_order_amount']    ?? 0),
            'delivery_fee' => (float) ($data['delivery_fee']        ?? 40),
            'free_above'   => (float) ($data['free_delivery_above'] ?? 500),
            'is_active'    => (int)   ($data['is_active']           ?? 1),
        ]);
    }

    /**
     * Calculate delivery fee for a given cart subtotal
     * Returns: ['delivery' => float, 'is_free' => bool, 'order_blocked' => bool, 'min_order' => float]
     */
    public static function calculate(float $subtotal): array {
        $rule = self::getActive();

        if (!$rule) {
            // No rule configured → free delivery, no minimum
            return [
                'delivery'      => 0.0,
                'is_free'       => true,
                'order_blocked' => false,
                'min_order'     => 0.0,
            ];
        }

        $minOrder  = (float) $rule['min_order_amount'];
        $fee       = (float) $rule['delivery_fee'];
        $freeAbove = (float) $rule['free_delivery_above'];

        $blocked = $minOrder > 0 && $subtotal < $minOrder;
        $isFree  = $subtotal >= $freeAbove;

        return [
            'delivery'      => $isFree ? 0.0 : $fee,
            'is_free'       => $isFree,
            'order_blocked' => $blocked,
            'min_order'     => $minOrder,
            'free_above'    => $freeAbove,
        ];
    }
}
