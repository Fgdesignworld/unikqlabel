<?php
/**
 * Order Controller — Checkout order submission + Admin listing + Analytics
 */

require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../middleware/auth.php';

class OrderController {

    /**
     * POST /api/checkout — Public: submit order
     */
    public static function store(): void {
        require_once __DIR__ . '/../middleware/rate_limit.php';
        checkRateLimit('checkout');

        $input = json_decode(file_get_contents('php://input'), true);

        $requiredFields = ['customer_name', 'phone', 'address', 'city', 'pincode', 'cart_items', 'delivery'];
        foreach ($requiredFields as $field) {
            if ($field === 'delivery' && !isset($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '{$field}' is required"]);
                return;
            }
            if ($field !== 'delivery' && empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '{$field}' is required"]);
                return;
            }
        }

        if (!preg_match('/^\d{10}$/', $input['phone'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Phone must be a 10-digit number']);
            return;
        }

        if (!preg_match('/^\d{6}$/', $input['pincode'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Pincode must be a 6-digit number']);
            return;
        }

        if (!is_array($input['cart_items']) || count($input['cart_items']) === 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Cart must contain at least one item']);
            return;
        }

        // Validate delivery is numeric
        $proposedDelivery = isset($input['delivery']) ? (float) $input['delivery'] : null;
        if ($proposedDelivery === null || $proposedDelivery < 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid delivery fee']);
            return;
        }

        $items = [];
        foreach ($input['cart_items'] as $cartItem) {
            if (empty($cartItem['name']) || empty($cartItem['price']) || empty($cartItem['quantity'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Each cart item must have name, price, and quantity']);
                return;
            }

            $items[] = [
                'product_id'   => $cartItem['product_id'] ?? null,
                'product_name' => $cartItem['name'],
                'weight'       => $cartItem['weight'] ?? '1kg',
                'qty'          => (int) $cartItem['quantity'],
                'price'        => (float) $cartItem['price'],
            ];
        }

        $orderData = [
            'customer_name' => $input['customer_name'],
            'phone'         => $input['phone'],
            'address'       => $input['address'],
            'city'          => $input['city'],
            'pincode'       => $input['pincode'],
            'notes'         => $input['notes'] ?? '',
        ];

        try {
            $result = Order::create($orderData, $items, $proposedDelivery);
            http_response_code(201);
            echo json_encode([
                'success'        => true,
                'message'        => 'Order placed successfully',
                'order_id'       => $result['id'],
                'invoice_number' => $result['invoice_number'],
                'subtotal'       => $result['subtotal'],
                'delivery'       => $result['delivery'],
                'total'          => $result['total'],
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * GET /api/admin/orders — Admin: list paginated/filtered orders
     * Query params:
     *   filter=today|week|month|all
     *   status=pending|confirmed|processing|shipped|delivered|cancelled
     *   payment_method=upi|phonepay|gpay|cod|card
     *   search=name|phone|invoice
     *   date_from=YYYY-MM-DD  date_to=YYYY-MM-DD
     *   page=N
     *   trash=1  (show soft-deleted)
     */
    public static function adminIndex(): void {
        requireAuth();

        $filter = in_array($_GET['filter'] ?? '', ['today', 'week', 'month', 'all'])
            ? $_GET['filter']
            : 'all';
        $page = max(1, (int) ($_GET['page'] ?? 1));

        $opts = [];
        if (!empty($_GET['status']))         $opts['status']         = $_GET['status'];
        if (!empty($_GET['payment_method'])) $opts['payment_method'] = $_GET['payment_method'];
        if (!empty($_GET['search']))         $opts['search']         = trim($_GET['search']);
        if (!empty($_GET['date_from']))      $opts['date_from']      = $_GET['date_from'];
        if (!empty($_GET['date_to']))        $opts['date_to']        = $_GET['date_to'];
        if (!empty($_GET['trash']))          $opts['trash']          = true;

        $result = Order::getAll($filter, $page, 15, $opts);

        foreach ($result['orders'] as &$order) {
            $order['id']       = (int)   $order['id'];
            $order['subtotal'] = (float) $order['subtotal'];
            $order['delivery'] = (float) $order['delivery'];
            $order['total']    = (float) $order['total'];
        }

        echo json_encode($result);
    }

    /**
     * GET /api/admin/orders/analytics — Summary stats
     */
    public static function adminAnalytics(): void {
        requireAuth();
        echo json_encode(Order::getAnalytics());
    }

    /**
     * GET /api/admin/orders/chart — Daily chart data (last 14 days)
     */
    public static function adminChart(): void {
        requireAuth();
        $days = min(90, max(7, (int) ($_GET['days'] ?? 14)));
        echo json_encode(['chart' => Order::getDailyChart($days)]);
    }

    /**
     * GET /api/admin/orders/{id} — Admin: get order detail
     */
    public static function adminShow(int $id): void {
        requireAuth();
        $order = Order::getWithItems($id);

        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
            return;
        }

        echo json_encode(['order' => $order]);
    }

    /**
     * PUT /api/admin/orders/{id}/status — Admin: update order status
     */
    public static function updateStatus(int $id): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);
        $status = $input['status'] ?? '';

        $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!in_array($status, $validStatuses)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid status']);
            return;
        }

        Order::updateStatus($id, $status);
        echo json_encode(['success' => true, 'message' => 'Status updated']);
    }

    /**
     * DELETE /api/admin/orders/{id} — Soft-delete
     */
    public static function adminDelete(int $id): void {
        requireAuth();
        $ok = Order::softDelete($id);
        if (!$ok) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found or already deleted']);
            return;
        }
        echo json_encode(['success' => true, 'message' => 'Order moved to trash']);
    }

    /**
     * PUT /api/admin/orders/{id}/restore — Restore soft-deleted order
     */
    public static function adminRestore(int $id): void {
        requireAuth();
        Order::restore($id);
        echo json_encode(['success' => true, 'message' => 'Order restored']);
    }

    /**
     * DELETE /api/admin/orders/{id}/force — Hard delete (permanent, from trash only)
     */
    public static function adminForceDelete(int $id): void {
        requireAuth();
        Order::hardDelete($id);
        echo json_encode(['success' => true, 'message' => 'Order permanently deleted']);
    }

    /**
     * PUT /api/admin/orders/{id}/payment — Update payment method/ref
     */
    public static function updatePayment(int $id): void {
        requireAuth();
        $input  = json_decode(file_get_contents('php://input'), true);
        $method = trim($input['payment_method'] ?? '');
        $ref    = trim($input['payment_ref'] ?? '') ?: null;

        $validMethods = ['cod', 'upi', 'gpay', 'phonepay', 'card', 'netbanking', 'other'];
        if (!in_array($method, $validMethods)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid payment method']);
            return;
        }

        Order::updatePayment($id, $method, $ref);
        echo json_encode(['success' => true]);
    }
}
