<?php
/**
 * Delivery Controller — Manage delivery fee rules
 * Module 5: Delivery & Order Rule System
 */

require_once __DIR__ . '/../models/DeliveryRule.php';
require_once __DIR__ . '/../middleware/auth.php';

class DeliveryController {

    private static function ok(array $data = [], string $message = 'Success'): void {
        echo json_encode(['status' => 'success', 'message' => $message, 'data' => $data]);
    }

    private static function error(string $message, int $code = 400): void {
        http_response_code($code);
        echo json_encode(['status' => 'error', 'message' => $message, 'data' => null]);
    }

    // ─── Public ──────────────────────────────────────────────────────────────

    /**
     * GET /api/delivery-rules — Returns active rule for frontend
     */
    public static function getActive(): void {
        $rule = DeliveryRule::getActive();
        self::ok(['rule' => $rule]);
    }

    /**
     * POST /api/delivery-calculate — Calculates delivery for a given subtotal
     * Body: { subtotal: float }
     */
    public static function calculate(): void {
        $input    = json_decode(file_get_contents('php://input'), true);
        $subtotal = (float) ($input['subtotal'] ?? 0);

        if ($subtotal < 0) {
            self::error('subtotal must be >= 0');
            return;
        }

        $result = DeliveryRule::calculate($subtotal);
        self::ok($result);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/delivery-rules
     */
    public static function adminGet(): void {
        requireAuth();
        $rule = DeliveryRule::getActive();
        self::ok(['rule' => $rule]);
    }

    /**
     * POST /api/admin/delivery-rules — Upsert rule
     */
    public static function adminUpdate(): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);

        // Validation
        $minOrder  = $input['min_order_amount']    ?? null;
        $fee       = $input['delivery_fee']        ?? null;
        $freeAbove = $input['free_delivery_above'] ?? null;

        if (!is_numeric($minOrder) || !is_numeric($fee) || !is_numeric($freeAbove)) {
            self::error('min_order_amount, delivery_fee, and free_delivery_above are required numbers');
            return;
        }
        if ((float) $minOrder < 0 || (float) $fee < 0 || (float) $freeAbove < 0) {
            self::error('Values must be >= 0');
            return;
        }
        if ((float) $freeAbove > 0 && (float) $freeAbove <= (float) $minOrder) {
            self::error('free_delivery_above must be greater than min_order_amount');
            return;
        }

        try {
            DeliveryRule::upsert($input);
            $rule = DeliveryRule::getActive();
            self::ok(['rule' => $rule], 'Delivery rules updated');
        } catch (Exception $e) {
            self::error('Failed to update delivery rules', 500);
        }
    }
}
