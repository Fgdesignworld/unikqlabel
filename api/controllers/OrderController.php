<?php
/**
 * Order Controller — Checkout order submission + Admin listing
 */

require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../middleware/auth.php';

class OrderController {

    /**
     * POST /api/checkout — Public: submit order
     */
    public static function store(): void {
        require_once __DIR__ . '/../middleware/rate_limit.php';
        checkRateLimit('checkout'); // Limit: 5 per 15 mins (defined in middleware)

        $input = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $requiredFields = ['customer_name', 'phone', 'address', 'city', 'pincode', 'cart_items'];
        foreach ($requiredFields as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                return;
            }
        }

        // Validate phone (10 digits)
        if (!preg_match('/^\d{10}$/', $input['phone'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Phone must be a 10-digit number']);
            return;
        }

        // Validate pincode (6 digits)
        if (!preg_match('/^\d{6}$/', $input['pincode'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Pincode must be a 6-digit number']);
            return;
        }

        // Validate cart items
        if (!is_array($input['cart_items']) || count($input['cart_items']) === 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Cart must contain at least one item']);
            return;
        }

        // Map cart items to order_items format
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
            $result = Order::create($orderData, $items);

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
            http_response_code(500);
            echo json_encode(['error' => 'Failed to process order. Please try again.']);
        }
    }

    /**
     * GET /api/admin/orders — Admin: list all orders
     */
    public static function adminIndex(): void {
        requireAuth();
        $orders = Order::getAll();

        foreach ($orders as &$order) {
            $order['subtotal'] = (float) $order['subtotal'];
            $order['delivery'] = (float) $order['delivery'];
            $order['total']    = (float) $order['total'];
        }

        echo json_encode(['orders' => $orders]);
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
}
