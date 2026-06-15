<?php
/**
 * Coupon Controller — validate (public) + full CRUD (admin)
 */

require_once __DIR__ . '/../models/Coupon.php';
require_once __DIR__ . '/../middleware/auth.php';

class CouponController {

    // ─── Response helpers ─────────────────────────────────────────────────────

    private static function ok(array $data = [], string $message = 'Success'): void {
        echo json_encode(['status' => 'success', 'message' => $message, 'data' => $data]);
    }

    private static function error(string $message, int $code = 400): void {
        http_response_code($code);
        echo json_encode(['status' => 'error', 'message' => $message, 'data' => null]);
    }

    // ─── Public: validate coupon ──────────────────────────────────────────────

    /**
     * POST /api/coupons/validate
     * Body: { code: string, cart_total: float }
     */
    public static function validateCoupon(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        $code      = trim($input['code'] ?? '');
        $cartTotal = (float) ($input['cart_total'] ?? 0);

        if (empty($code)) {
            self::error('Coupon code is required.');
            return;
        }

        if ($cartTotal <= 0) {
            self::error('Invalid cart total.');
            return;
        }

        $coupon = Coupon::findByCode($code);

        if (!$coupon) {
            self::error('Invalid coupon code.');
            return;
        }

        $result = Coupon::validate($coupon, $cartTotal);

        if (!$result['valid']) {
            self::error($result['message']);
            return;
        }

        self::ok([
            'discount_amount' => $result['discount_amount'],
            'final_total'     => $result['final_total'],
            'coupon'          => $result['coupon'],
        ], $result['message']);
    }

    // ─── Admin: list all ──────────────────────────────────────────────────────

    /**
     * GET /api/admin/coupons
     */
    public static function adminIndex(): void {
        requireAuth();
        $coupons = Coupon::getAll();

        // Cast numeric fields
        foreach ($coupons as &$c) {
            $c['id']               = (int)   $c['id'];
            $c['value']            = (float) $c['value'];
            $c['min_order_amount'] = $c['min_order_amount'] !== null ? (float) $c['min_order_amount'] : null;
            $c['max_discount']     = $c['max_discount']     !== null ? (float) $c['max_discount']     : null;
            $c['usage_limit']      = $c['usage_limit']      !== null ? (int)   $c['usage_limit']      : null;
            $c['used_count']       = (int)   $c['used_count'];
            $c['user_limit']       = $c['user_limit']       !== null ? (int)   $c['user_limit']       : null;
            $c['is_active']        = (bool)  $c['is_active'];
        }
        unset($c);

        self::ok(['coupons' => $coupons]);
    }

    /**
     * GET /api/admin/coupons/{id}
     */
    public static function adminShow(int $id): void {
        requireAuth();
        $coupon = Coupon::findById($id);
        if (!$coupon) {
            self::error('Coupon not found.', 404);
            return;
        }
        $coupon['is_active'] = (bool) $coupon['is_active'];
        self::ok(['coupon' => $coupon]);
    }

    // ─── Admin: create ────────────────────────────────────────────────────────

    /**
     * POST /api/admin/coupons
     */
    public static function adminStore(): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);
        $err   = self::validateInput($input);
        if ($err) { self::error($err); return; }

        // Duplicate code check
        $existing = Coupon::findByCode($input['code']);
        if ($existing) {
            self::error('A coupon with this code already exists.');
            return;
        }

        try {
            $coupon = Coupon::create($input);
            $coupon['is_active'] = (bool) $coupon['is_active'];
            self::ok(['coupon' => $coupon], 'Coupon created successfully.');
        } catch (Exception $e) {
            error_log('Coupon create error: ' . $e->getMessage());
            self::error('Failed to create coupon. Please try again.');
        }
    }

    // ─── Admin: update ────────────────────────────────────────────────────────

    /**
     * PUT /api/admin/coupons/{id}
     */
    public static function adminUpdate(int $id): void {
        requireAuth();

        $coupon = Coupon::findById($id);
        if (!$coupon) {
            self::error('Coupon not found.', 404);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $err   = self::validateInput($input);
        if ($err) { self::error($err); return; }

        // Duplicate code check (excluding current)
        $existing = Coupon::findByCode($input['code']);
        if ($existing && (int) $existing['id'] !== $id) {
            self::error('A coupon with this code already exists.');
            return;
        }

        try {
            $updated = Coupon::update($id, $input);
            $updated['is_active'] = (bool) $updated['is_active'];
            self::ok(['coupon' => $updated], 'Coupon updated successfully.');
        } catch (Exception $e) {
            error_log('Coupon update error: ' . $e->getMessage());
            self::error('Failed to update coupon. Please try again.');
        }
    }

    // ─── Admin: toggle active ─────────────────────────────────────────────────

    /**
     * PUT /api/admin/coupons/{id}/toggle
     */
    public static function adminToggle(int $id): void {
        requireAuth();

        $coupon = Coupon::findById($id);
        if (!$coupon) {
            self::error('Coupon not found.', 404);
            return;
        }

        $updated = Coupon::toggle($id);
        $updated['is_active'] = (bool) $updated['is_active'];
        $status = $updated['is_active'] ? 'activated' : 'deactivated';
        self::ok(['coupon' => $updated], "Coupon {$status}.");
    }

    // ─── Admin: delete ────────────────────────────────────────────────────────

    /**
     * DELETE /api/admin/coupons/{id}
     */
    public static function adminDestroy(int $id): void {
        requireAuth();

        $coupon = Coupon::findById($id);
        if (!$coupon) {
            self::error('Coupon not found.', 404);
            return;
        }

        Coupon::delete($id);
        self::ok([], 'Coupon deleted.');
    }

    // ─── Input validation ─────────────────────────────────────────────────────

    private static function validateInput(?array $input): ?string {
        if (!$input) return 'Invalid JSON body.';

        $code  = trim($input['code'] ?? '');
        $type  = $input['type']  ?? '';
        $value = $input['value'] ?? null;

        if (empty($code)) return 'Coupon code is required.';
        if (!preg_match('/^[A-Z0-9_\-]{2,30}$/', strtoupper($code))) {
            return 'Coupon code must be 2-30 alphanumeric characters (A-Z, 0-9, _, -).';
        }
        if (!in_array($type, ['percentage', 'fixed'])) return 'Type must be "percentage" or "fixed".';
        if (!is_numeric($value) || (float) $value <= 0) return 'Value must be a positive number.';

        if ($type === 'percentage' && (float) $value > 100) {
            return 'Percentage value cannot exceed 100.';
        }

        if (isset($input['min_order_amount']) && $input['min_order_amount'] !== '' && (float) $input['min_order_amount'] < 0) {
            return 'Minimum order amount cannot be negative.';
        }
        if (isset($input['max_discount']) && $input['max_discount'] !== '' && (float) $input['max_discount'] <= 0) {
            return 'Max discount must be positive.';
        }
        if (isset($input['usage_limit']) && $input['usage_limit'] !== '' && (int) $input['usage_limit'] < 1) {
            return 'Usage limit must be at least 1.';
        }
        if (!empty($input['expires_at'])) {
            $ts = strtotime($input['expires_at']);
            if ($ts === false) return 'Invalid expiry date format.';
        }

        return null;
    }
}
