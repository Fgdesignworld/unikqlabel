<?php
/**
 * Payment Controller — Razorpay Online Payment Integration
 *
 * POST /api/payment/create-order
 *   Creates a local pending order + Razorpay order.
 *   Returns the Razorpay checkout payload to the frontend.
 *
 * POST /api/payment/verify
 *   Verifies the HMAC-SHA256 signature from Razorpay.
 *   On success: decrements stock, marks order as paid/confirmed.
 *
 * POST /api/payment/cancel
 *   Marks a pending-payment order as failed (user dismissed popup).
 */

require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/Inventory.php';
require_once __DIR__ . '/../helpers/security.php';
require_once __DIR__ . '/../helpers/razorpay.php';
require_once __DIR__ . '/../config/database.php';

class PaymentController
{
    // =========================================================================
    // POST /api/payment/create-order
    // =========================================================================

    public static function createOrder(): void
    {
        require_once __DIR__ . '/../middleware/rate_limit.php';
        checkRateLimit('checkout'); // Reuse checkout rate limit

        $input = json_decode(file_get_contents('php://input'), true);

        // ── Required field validation ─────────────────────────────────────────
        $required = ['customer_name', 'phone', 'address', 'city', 'pincode', 'cart_items'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '{$field}' is required"]);
                return;
            }
        }

        // ── Phone validation ──────────────────────────────────────────────────
        $phone = trim($input['phone']);
        if (strlen($phone) > 10) {
            $phone = preg_replace('/^(\+91|91)/', '', $phone);
        }
        if (!preg_match('/^\d{10}$/', $phone)) {
            http_response_code(400);
            echo json_encode(['error' => 'Phone must be a valid 10-digit number']);
            return;
        }

        // ── Pincode validation ────────────────────────────────────────────────
        if (!preg_match('/^\d{6}$/', trim($input['pincode']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Pincode must be a valid 6-digit number']);
            return;
        }

        if (!is_array($input['cart_items']) || count($input['cart_items']) === 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Cart must contain at least one item']);
            return;
        }

        // ── Build items with server-side price calculation ────────────────────
        $items = [];
        foreach ($input['cart_items'] as $cartItem) {
            if (empty($cartItem['name']) || empty($cartItem['quantity'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Each cart item requires name and quantity']);
                return;
            }

            $qty = max(1, (int) $cartItem['quantity']);

            // Server-side price lookup for products in the DB
            $price         = null;
            $originalPrice = null;
            $discountPct   = null;

            if (!empty($cartItem['product_id'])) {
                $pid = (int) $cartItem['product_id'];
                $dbPricing = self::fetchProductPricing(
                    $pid,
                    isset($cartItem['size']) ? trim($cartItem['size']) : null
                );
                if ($dbPricing !== null) {
                    $price         = $dbPricing['price'];
                    $originalPrice = $dbPricing['original_price'];
                    $discountPct   = $dbPricing['discount_percent'];
                }
            }

            // Fallback to client price only if no DB product found
            // (handles custom / weight-based items with no product_id)
            if ($price === null) {
                $clientPrice = isset($cartItem['price']) ? (float) $cartItem['price'] : 0;
                if ($clientPrice <= 0) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid price for: ' .
                        htmlspecialchars($cartItem['name'], ENT_QUOTES, 'UTF-8')]);
                    return;
                }
                $price         = $clientPrice;
                $originalPrice = isset($cartItem['originalPrice']) ? (float) $cartItem['originalPrice'] : null;
                $discountPct   = isset($cartItem['discountPercent']) ? (float) $cartItem['discountPercent'] : null;
            }

            $items[] = [
                'product_id'       => !empty($cartItem['product_id']) ? (int) $cartItem['product_id'] : null,
                'product_name'     => $cartItem['name'],
                'weight'           => $cartItem['weight'] ?? '',
                'size_label'       => isset($cartItem['size'])  ? trim($cartItem['size'])  : null,
                'color_name'       => isset($cartItem['color']) ? trim($cartItem['color']) : null,
                'image_url'        => isset($cartItem['image']) ? trim($cartItem['image']) : null,
                'qty'              => $qty,
                'price'            => $price,
                'original_price'   => $originalPrice,
                'discount_percent' => $discountPct,
            ];
        }

        $orderData = [
            'customer_name' => sanitizeInput($input['customer_name'], 200),
            'phone'         => $phone,
            'address'       => sanitizeInput($input['address'], 500),
            'city'          => sanitizeInput($input['city'], 100),
            'pincode'       => trim($input['pincode']),
            'notes'         => sanitizeInput($input['notes'] ?? '', 1000),
        ];

        $couponCode       = !empty($input['coupon_code'])    ? trim($input['coupon_code'])          : null;
        $proposedDiscount = isset($input['discount_amount']) ? (float) $input['discount_amount']    : 0.0;
        $proposedDelivery = isset($input['delivery'])        ? (float) $input['delivery']           : null;

        try {
            // ── 1. Create local pending order (no stock decrement yet) ─────────
            $localOrder = Order::createPending(
                $orderData,
                $items,
                $proposedDelivery,
                $couponCode,
                $proposedDiscount
            );

            // ── 2. Validate minimum amount for Razorpay (₹1 = 100 paise) ──────
            $amountInPaise = (int) round($localOrder['total'] * 100);
            if ($amountInPaise < 100) {
                Order::cancelPendingPayment($localOrder['id']);
                http_response_code(400);
                echo json_encode(['error' => 'Order total must be at least ₹1 for online payment']);
                return;
            }

            // ── 3. Create Razorpay order via API ──────────────────────────────
            $rzpOrder = razorpayCreateOrder(
                $amountInPaise,
                $localOrder['invoice_number'],
                [
                    'invoice_number' => $localOrder['invoice_number'],
                    'customer_name'  => $orderData['customer_name'],
                    'customer_phone' => $orderData['phone'],
                ]
            );

            // ── 4. Store razorpay_order_id on local order ─────────────────────
            Order::setRazorpayOrderId($localOrder['id'], $rzpOrder['id']);

            // ── 5. Return checkout payload ────────────────────────────────────
            http_response_code(200);
            echo json_encode([
                'success'         => true,
                'order_id'        => $localOrder['id'],
                'invoice_number'  => $localOrder['invoice_number'],
                'subtotal'        => $localOrder['subtotal'],
                'delivery'        => $localOrder['delivery'],
                'discount_amount' => $localOrder['discount_amount'],
                'coupon_code'     => $localOrder['coupon_code'],
                'total'           => $localOrder['total'],
                // Razorpay checkout config
                'rzp_order_id'    => $rzpOrder['id'],
                'rzp_amount'      => $amountInPaise,
                'rzp_key'         => razorpayGetKeyId(),
                'rzp_currency'    => 'INR',
            ]);

        } catch (Exception $e) {
            error_log('[PaymentController::createOrder] ' . $e->getMessage());
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    // =========================================================================
    // POST /api/payment/verify
    // =========================================================================

    public static function verifyPayment(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        // ── Required field check ──────────────────────────────────────────────
        foreach (['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'order_id'] as $f) {
            if (empty($input[$f])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing required field: {$f}"]);
                return;
            }
        }

        $rzpOrderId   = trim($input['razorpay_order_id']);
        $rzpPaymentId = trim($input['razorpay_payment_id']);
        $rzpSignature = trim($input['razorpay_signature']);
        $localOrderId = (int) $input['order_id'];

        // ── Input length guards (Razorpay IDs are well-defined lengths) ───────
        if (strlen($rzpOrderId) > 100 || strlen($rzpPaymentId) > 100 || strlen($rzpSignature) > 255) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid payment data']);
            return;
        }
        if ($localOrderId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid order_id']);
            return;
        }

        // ── 1. HMAC-SHA256 signature verification ─────────────────────────────
        // This is the critical security check — do it first.
        try {
            $signatureValid = razorpayVerifySignature($rzpOrderId, $rzpPaymentId, $rzpSignature);
        } catch (Exception $e) {
            error_log('[PaymentController::verifyPayment] Signature check error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Payment verification system error']);
            return;
        }

        if (!$signatureValid) {
            error_log("[PaymentController] INVALID signature for order {$localOrderId} | rzp_order={$rzpOrderId}");
            http_response_code(400);
            echo json_encode(['error' => 'Payment signature is invalid. Possible tamper attempt.']);
            return;
        }

        // ── 2. Fetch local order ──────────────────────────────────────────────
        $order = Order::getById($localOrderId);
        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
            return;
        }

        // ── 3. Ensure razorpay_order_id matches (anti-replay attack) ──────────
        if ($order['razorpay_order_id'] !== $rzpOrderId) {
            error_log("[PaymentController] Order ID mismatch: local {$localOrderId} expected '{$order['razorpay_order_id']}' got '{$rzpOrderId}'");
            http_response_code(400);
            echo json_encode(['error' => 'Razorpay order ID does not match this order']);
            return;
        }

        // ── 4. Idempotency: already paid → return success without re-processing
        if ($order['payment_status'] === 'paid') {
            echo json_encode([
                'success'        => true,
                'message'        => 'Payment already confirmed',
                'invoice_number' => $order['invoice_number'],
                'order_id'       => $localOrderId,
            ]);
            return;
        }

        // ── 5. Reject cancelled/failed orders ─────────────────────────────────
        if (in_array($order['payment_status'], ['failed'], true)) {
            http_response_code(400);
            echo json_encode(['error' => 'This order has been cancelled. Please start a new order.']);
            return;
        }

        // ── 6. Mark paid: decrement stock, update order, notify ───────────────
        try {
            Order::markPaid($localOrderId, $rzpPaymentId, $rzpSignature);

            echo json_encode([
                'success'        => true,
                'message'        => 'Payment verified and order confirmed',
                'invoice_number' => $order['invoice_number'],
                'order_id'       => $localOrderId,
            ]);

        } catch (Exception $e) {
            error_log('[PaymentController::verifyPayment] markPaid error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error'   => 'Payment recorded but order confirmation failed. ' .
                             'Please contact support with invoice: ' . $order['invoice_number'],
                'invoice' => $order['invoice_number'],
            ]);
        }
    }

    // =========================================================================
    // POST /api/payment/cancel
    // =========================================================================

    /**
     * Called when user dismisses the Razorpay popup without paying.
     * Marks the pending order as failed so it can be identified in admin.
     */
    public static function cancelOrder(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $localOrderId = isset($input['order_id']) ? (int) $input['order_id'] : 0;
        if ($localOrderId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing order_id']);
            return;
        }

        $order = Order::getById($localOrderId);
        if (!$order || $order['payment_status'] !== 'pending') {
            // Already handled or not a valid pending order — silent success
            echo json_encode(['success' => true]);
            return;
        }

        Order::cancelPendingPayment($localOrderId);
        echo json_encode(['success' => true]);
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    /**
     * Fetch the effective selling price for a product (+ size variant) from the DB.
     *
     * Price resolution:
     *   1. Check variants_json for size-specific price (if size_label provided)
     *   2. Fall back to base `price`
     *   3. Apply discount_price (treated as discount PERCENTAGE if > 0 and <= 100)
     *
     * Returns null if product is not found or inactive.
     */
    private static function fetchProductPricing(int $productId, ?string $sizeLabel): ?array
    {
        $db   = getDB();
        $stmt = $db->prepare(
            "SELECT price, discount_price, variants_json
             FROM products
             WHERE id = :id AND status = 'active'
             LIMIT 1"
        );
        $stmt->execute(['id' => $productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            return null;
        }

        $basePrice     = (float) $product['price'];
        $discountPrice = isset($product['discount_price']) && $product['discount_price'] !== null ? (float) $product['discount_price'] : null;

        // ── Size-variant price override ────────────────────────────────────
        $variantPrice = null;
        if ($sizeLabel && !empty($product['variants_json'])) {
            $variants = json_decode($product['variants_json'], true);
            if (is_array($variants)) {
                foreach ($variants as $v) {
                    if (
                        isset($v['label']) &&
                        strtolower(trim($v['label'])) === strtolower(trim($sizeLabel)) &&
                        isset($v['price']) &&
                        (float) $v['price'] > 0
                    ) {
                        $variantPrice = (float) $v['price'];
                        break;
                    }
                }
            }
        }

        $effectiveBase = $variantPrice ?? $basePrice;

        // ── Apply discount logic (discount_price is direct offer price) ───
        $finalPrice = $effectiveBase;
        $discountPct = null;

        if ($discountPrice !== null && $discountPrice > 0 && $discountPrice < $basePrice) {
            // Calculate percentage discount from base price and offer price
            $discountPct = (($basePrice - $discountPrice) / $basePrice) * 100;
            // Apply calculated percentage discount to effective base (variant or base price)
            $finalPrice = round($effectiveBase * (1 - $discountPct / 100), 2);
        }

        $originalPrice = ($finalPrice < $effectiveBase) ? $effectiveBase : null;

        return [
            'price'            => $finalPrice,
            'original_price'   => $originalPrice,
            'discount_percent' => $discountPct,
        ];
    }
}
