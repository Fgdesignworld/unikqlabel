<?php
/**
 * Order Controller — Checkout order submission + Admin listing + Analytics
 */

require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/Inventory.php';
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

        $phone = trim($input['phone']);
        // Strip country code prefix only when number is longer than 10 digits
        if (strlen($phone) > 10) {
            $phone = preg_replace('/^(\+91|91)/', '', $phone);
        }
        if (!preg_match('/^\d{10}$/', $phone)) {
            http_response_code(400);
            echo json_encode(['error' => 'Phone must be a 10-digit number']);
            return;
        }
        $input['phone'] = $phone;

        if (!preg_match('/^\d{6}$/', trim($input['pincode']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Pincode must be a 6-digit number']);
            return;
        }

        $input['pincode'] = trim($input['pincode']);

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
                'product_id'       => $cartItem['product_id'] ?? null,
                'product_name'     => $cartItem['name'],
                'weight'           => $cartItem['weight'] ?? '',
                'size_label'       => isset($cartItem['size'])  ? trim($cartItem['size'])  : null,
                'color_name'       => isset($cartItem['color']) ? trim($cartItem['color']) : null,
                'image_url'        => isset($cartItem['image']) ? trim($cartItem['image']) : null,
                'qty'              => (int) $cartItem['quantity'],
                'price'            => (float) $cartItem['price'],
                'original_price'   => isset($cartItem['originalPrice']) ? (float) $cartItem['originalPrice'] : null,
                'discount_percent' => isset($cartItem['discountPercent']) ? (float) $cartItem['discountPercent'] : null,
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

        // Optional coupon fields (backend re-validates everything)
        $couponCode       = !empty($input['coupon_code']) ? trim($input['coupon_code']) : null;
        $proposedDiscount = isset($input['discount_amount']) ? (float) $input['discount_amount'] : 0.0;

        try {
            $result = Order::create($orderData, $items, $proposedDelivery, $couponCode, $proposedDiscount);
            http_response_code(201);
            echo json_encode([
                'success'         => true,
                'message'         => 'Order placed successfully',
                'order_id'        => $result['id'],
                'invoice_number'  => $result['invoice_number'],
                'subtotal'        => $result['subtotal'],
                'delivery'        => $result['delivery'],
                'discount_amount' => $result['discount_amount'],
                'coupon_code'     => $result['coupon_code'],
                'total'           => $result['total'],
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
     * Restores stock if transitioning TO cancelled.
     * Re-decrements stock if transitioning FROM cancelled to an active status.
     */
    public static function updateStatus(int $id): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);
        $newStatus = $input['status'] ?? '';

        $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!in_array($newStatus, $validStatuses)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid status']);
            return;
        }

        // Fetch current order + items before mutating
        $order = Order::getWithItems($id);
        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
            return;
        }
        $oldStatus = $order['status'];

        // Update status in DB
        Order::updateStatus($id, $newStatus);

        // ---------------------------------------------------------------------------
        // Inventory sync: only act when transitioning between cancelled and active
        // ---------------------------------------------------------------------------
        $wasCancelled  = ($oldStatus  === 'cancelled');
        $nowCancelled  = ($newStatus  === 'cancelled');

        if (!$wasCancelled && $nowCancelled) {
            // Order is being cancelled → restore (increment) stock
            $items = $order['items'] ?? [];
            foreach ($items as $item) {
                $pid = isset($item['product_id']) ? (int)$item['product_id'] : null;
                if (!$pid) continue;
                if (!Inventory::hasInventory($pid)) continue;
                Inventory::increment(
                    $pid,
                    $item['size_label'] ?? null,
                    $item['color_name']  ?? null,
                    (int)($item['qty']  ?? $item['quantity'] ?? 1)
                );
            }
        } elseif ($wasCancelled && !$nowCancelled) {
            // Order un-cancelled → re-decrement stock
            $items = $order['items'] ?? [];
            foreach ($items as $item) {
                $pid = isset($item['product_id']) ? (int)$item['product_id'] : null;
                if (!$pid) continue;
                if (!Inventory::hasInventory($pid)) continue;
                Inventory::decrement(
                    $pid,
                    $item['size_label'] ?? null,
                    $item['color_name']  ?? null,
                    (int)($item['qty']  ?? $item['quantity'] ?? 1)
                );
            }
        }

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

    /**
     * GET /api/admin/customers — Admin: customer list (grouped by phone)
     * Query: search=name|phone  sort=orders|spent|recent  page=N
     */
    public static function adminCustomers(): void {
        requireAuth();

        $search = trim($_GET['search'] ?? '');
        $sort   = in_array($_GET['sort'] ?? '', ['orders', 'spent', 'recent', 'name']) ? $_GET['sort'] : 'recent';
        $page   = max(1, (int) ($_GET['page'] ?? 1));
        $limit  = 20;
        $offset = ($page - 1) * $limit;

        $db = getDB();

        $where = "o.deleted_at IS NULL";
        $params = [];

        if ($search !== '') {
            $where .= " AND (o.customer_name LIKE :s OR o.phone LIKE :s2)";
            $params['s']  = '%' . $search . '%';
            $params['s2'] = '%' . $search . '%';
        }

        $orderBy = match($sort) {
            'orders' => 'order_count DESC',
            'spent'  => 'total_spent DESC',
            'name'   => 'customer_name ASC',
            default  => 'last_order DESC',
        };

        $countSql = "SELECT COUNT(DISTINCT o.phone) FROM orders o WHERE {$where}";
        $countStmt = $db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql = "
            SELECT
                o.phone,
                MAX(o.customer_name) AS customer_name,
                MAX(o.city)          AS city,
                MAX(o.address)       AS address,
                MAX(o.pincode)       AS pincode,
                COUNT(o.id)          AS order_count,
                COALESCE(SUM(o.total), 0) AS total_spent,
                MAX(o.created_at)    AS last_order,
                MIN(o.created_at)    AS first_order
            FROM orders o
            WHERE {$where}
            GROUP BY o.phone
            ORDER BY {$orderBy}
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $db->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue(":$k", $v);
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($customers as &$c) {
            $c['order_count'] = (int)   $c['order_count'];
            $c['total_spent'] = (float) $c['total_spent'];
        }

        echo json_encode([
            'customers' => $customers,
            'total'     => $total,
            'page'      => $page,
            'last_page' => max(1, (int) ceil($total / $limit)),
        ]);
    }

    /**
     * GET /api/admin/customers/{phone}/orders — Orders for one customer (admin)
     */
    public static function adminCustomerOrders(string $phone): void {
        requireAuth();
        $db = getDB();
        $stmt = $db->prepare("
            SELECT id, invoice_number, created_at, status, total, payment_method, city
            FROM orders
            WHERE phone = :phone AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 50
        ");
        $stmt->execute(['phone' => $phone]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($orders as &$o) {
            $o['id']    = (int)   $o['id'];
            $o['total'] = (float) $o['total'];
        }
        echo json_encode(['orders' => $orders]);
    }

    /**
     * GET /api/orders/track — PUBLIC order tracking
     * ?phone=9876543210  → returns all orders for that phone (max 20)
     * ?invoice=UNI-XXXX  → returns single order by invoice number
     */
    public static function track(): void {        require_once __DIR__ . '/../middleware/rate_limit.php';
        checkRateLimit('order_track');

        $phone   = trim($_GET['phone']   ?? '');
        $invoice = trim($_GET['invoice'] ?? '');

        if ($phone) {
            $phone = preg_replace('/\D/', '', $phone);
            if (!preg_match('/^\d{10}$/', $phone)) {
                http_response_code(400);
                echo json_encode(['error' => 'Phone must be a 10-digit number']);
                return;
            }
            $orders = Order::trackByPhone($phone);
            echo json_encode(['success' => true, 'orders' => $orders, 'count' => count($orders)]);
            return;
        }

        if ($invoice) {
            $invoice = strtoupper(preg_replace('/[^A-Z0-9\-]/', '', strtoupper($invoice)));
            if (strlen($invoice) < 3 || strlen($invoice) > 30) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid invoice number format']);
                return;
            }
            $order = Order::trackByInvoice($invoice);
            if (!$order) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found. Please check the invoice number.']);
                return;
            }
            echo json_encode(['success' => true, 'orders' => [$order], 'count' => 1]);
            return;
        }

        http_response_code(400);
        echo json_encode(['error' => 'Provide a phone number or invoice number to search.']);
    }
}
