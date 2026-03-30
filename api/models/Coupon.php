<?php
/**
 * Coupon Model — CRUD + validation logic
 */

require_once __DIR__ . '/../config/database.php';

class Coupon {

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static function db(): PDO {
        return getDB();
    }

    // ─── Finders ─────────────────────────────────────────────────────────────

    public static function getAll(): array {
        $stmt = self::db()->query("
            SELECT * FROM coupons ORDER BY created_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function findById(int $id): ?array {
        $stmt = self::db()->prepare("SELECT * FROM coupons WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function findByCode(string $code): ?array {
        $stmt = self::db()->prepare("SELECT * FROM coupons WHERE code = :code LIMIT 1");
        $stmt->execute(['code' => strtoupper(trim($code))]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    // ─── Validation ──────────────────────────────────────────────────────────

    /**
     * Validate a coupon against a cart total.
     * Returns ['valid' => bool, 'discount_amount' => float, 'final_total' => float, 'message' => string]
     */
    public static function validate(array $coupon, float $cartTotal): array {
        // Active?
        if (!(bool) $coupon['is_active']) {
            return ['valid' => false, 'discount_amount' => 0, 'final_total' => $cartTotal, 'message' => 'This coupon is inactive.'];
        }

        // Expired?
        if (!empty($coupon['expires_at'])) {
            $expiry = strtotime($coupon['expires_at']);
            if ($expiry !== false && $expiry < time()) {
                return ['valid' => false, 'discount_amount' => 0, 'final_total' => $cartTotal, 'message' => 'This coupon has expired.'];
            }
        }

        // Usage limit?
        if (!is_null($coupon['usage_limit']) && (int) $coupon['used_count'] >= (int) $coupon['usage_limit']) {
            return ['valid' => false, 'discount_amount' => 0, 'final_total' => $cartTotal, 'message' => 'This coupon has reached its usage limit.'];
        }

        // Minimum order amount?
        if (!is_null($coupon['min_order_amount']) && $cartTotal < (float) $coupon['min_order_amount']) {
            $min = (float) $coupon['min_order_amount'];
            return [
                'valid'           => false,
                'discount_amount' => 0,
                'final_total'     => $cartTotal,
                'message'         => "Minimum order amount of ₹{$min} required for this coupon.",
            ];
        }

        // Calculate discount
        $discount = 0.0;
        $value    = (float) $coupon['value'];

        if ($coupon['type'] === 'percentage') {
            $discount = ($cartTotal * $value) / 100;
            // Apply max_discount cap
            if (!is_null($coupon['max_discount']) && $discount > (float) $coupon['max_discount']) {
                $discount = (float) $coupon['max_discount'];
            }
        } else {
            // fixed
            $discount = $value;
        }

        // Prevent negative total
        $discount   = min($discount, $cartTotal);
        $finalTotal = max(0, $cartTotal - $discount);

        return [
            'valid'           => true,
            'discount_amount' => round($discount, 2),
            'final_total'     => round($finalTotal, 2),
            'message'         => 'Coupon applied successfully!',
            'coupon'          => [
                'code'  => $coupon['code'],
                'type'  => $coupon['type'],
                'value' => $value,
            ],
        ];
    }

    // ─── Usage ───────────────────────────────────────────────────────────────

    /**
     * Atomically increment used_count for a coupon.
     */
    public static function incrementUsage(string $code): void {
        $stmt = self::db()->prepare("
            UPDATE coupons SET used_count = used_count + 1 WHERE code = :code
        ");
        $stmt->execute(['code' => strtoupper(trim($code))]);
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    public static function create(array $data): array {
        $db = self::db();
        $stmt = $db->prepare("
            INSERT INTO coupons
                (code, type, value, min_order_amount, max_discount, usage_limit, user_limit, expires_at, is_active)
            VALUES
                (:code, :type, :value, :min_order, :max_discount, :usage_limit, :user_limit, :expires_at, :is_active)
        ");
        $stmt->execute([
            'code'        => strtoupper(trim($data['code'])),
            'type'        => $data['type'],
            'value'       => (float) $data['value'],
            'min_order'   => isset($data['min_order_amount']) && $data['min_order_amount'] !== '' ? (float) $data['min_order_amount'] : null,
            'max_discount'=> isset($data['max_discount'])     && $data['max_discount']     !== '' ? (float) $data['max_discount']     : null,
            'usage_limit' => isset($data['usage_limit'])      && $data['usage_limit']      !== '' ? (int)   $data['usage_limit']      : null,
            'user_limit'  => isset($data['user_limit'])       && $data['user_limit']       !== '' ? (int)   $data['user_limit']       : null,
            'expires_at'  => !empty($data['expires_at']) ? $data['expires_at'] : null,
            'is_active'   => isset($data['is_active']) ? (int) $data['is_active'] : 1,
        ]);
        return self::findById((int) $db->lastInsertId());
    }

    public static function update(int $id, array $data): ?array {
        $stmt = self::db()->prepare("
            UPDATE coupons SET
                code           = :code,
                type           = :type,
                value          = :value,
                min_order_amount = :min_order,
                max_discount   = :max_discount,
                usage_limit    = :usage_limit,
                user_limit     = :user_limit,
                expires_at     = :expires_at,
                is_active      = :is_active
            WHERE id = :id
        ");
        $stmt->execute([
            'id'          => $id,
            'code'        => strtoupper(trim($data['code'])),
            'type'        => $data['type'],
            'value'       => (float) $data['value'],
            'min_order'   => isset($data['min_order_amount']) && $data['min_order_amount'] !== '' ? (float) $data['min_order_amount'] : null,
            'max_discount'=> isset($data['max_discount'])     && $data['max_discount']     !== '' ? (float) $data['max_discount']     : null,
            'usage_limit' => isset($data['usage_limit'])      && $data['usage_limit']      !== '' ? (int)   $data['usage_limit']      : null,
            'user_limit'  => isset($data['user_limit'])       && $data['user_limit']       !== '' ? (int)   $data['user_limit']       : null,
            'expires_at'  => !empty($data['expires_at']) ? $data['expires_at'] : null,
            'is_active'   => isset($data['is_active']) ? (int) $data['is_active'] : 1,
        ]);
        return self::findById($id);
    }

    public static function toggle(int $id): ?array {
        $stmt = self::db()->prepare("
            UPDATE coupons SET is_active = NOT is_active WHERE id = :id
        ");
        $stmt->execute(['id' => $id]);
        return self::findById($id);
    }

    public static function delete(int $id): void {
        $stmt = self::db()->prepare("DELETE FROM coupons WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
