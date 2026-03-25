<?php
/**
 * Order Model — Order creation with transaction safety + Analytics
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../models/DeliveryRule.php';

class Order {

    /**
     * Create an order with items (atomic transaction)
     */
    public static function create(array $orderData, array $items, ?float $proposedDelivery = null): array {
        $db = getDB();
        
        try {
            $db->beginTransaction();

            // Generate invoice number
            $invoiceNumber = 'LHF-' . substr(time(), -6);

            // Calculate totals
            $subtotal = 0;
            foreach ($items as $item) {
                $subtotal += ($item['price'] * $item['qty']);
            }
            
            // Get active delivery rule from database
            $activeRule = DeliveryRule::getActive();
            
            // Calculate delivery fee based on rule
            $delivery = self::calculateDelivery($subtotal, $activeRule);
            
            // Validate proposed delivery matches calculated (security check)
            if ($proposedDelivery !== null && abs($delivery - $proposedDelivery) > 0.01) {
                throw new Exception('Delivery fee mismatch. Please refresh and try again.');
            }
            
            $total = $subtotal + $delivery;

            // Insert order
            $stmt = $db->prepare("
                INSERT INTO orders (invoice_number, customer_name, phone, address, city, pincode, notes, subtotal, delivery, total)
                VALUES (:invoice, :name, :phone, :address, :city, :pincode, :notes, :subtotal, :delivery, :total)
            ");

            $stmt->execute([
                'invoice'  => $invoiceNumber,
                'name'     => htmlspecialchars($orderData['customer_name'], ENT_QUOTES, 'UTF-8'),
                'phone'    => htmlspecialchars($orderData['phone'], ENT_QUOTES, 'UTF-8'),
                'address'  => htmlspecialchars($orderData['address'], ENT_QUOTES, 'UTF-8'),
                'city'     => htmlspecialchars($orderData['city'], ENT_QUOTES, 'UTF-8'),
                'pincode'  => htmlspecialchars($orderData['pincode'], ENT_QUOTES, 'UTF-8'),
                'notes'    => htmlspecialchars($orderData['notes'] ?? '', ENT_QUOTES, 'UTF-8'),
                'subtotal' => $subtotal,
                'delivery' => $delivery,
                'total'    => $total,
            ]);

            $orderId = (int) $db->lastInsertId();

            // Insert order items
            $itemStmt = $db->prepare("
                INSERT INTO order_items (order_id, product_id, product_name, weight, qty, price, total)
                VALUES (:order_id, :product_id, :product_name, :weight, :qty, :price, :total)
            ");

            foreach ($items as $item) {
                $itemStmt->execute([
                    'order_id'     => $orderId,
                    'product_id'   => $item['product_id'] ?? null,
                    'product_name' => htmlspecialchars($item['product_name'], ENT_QUOTES, 'UTF-8'),
                    'weight'       => htmlspecialchars($item['weight'], ENT_QUOTES, 'UTF-8'),
                    'qty'          => (int) $item['qty'],
                    'price'        => (float) $item['price'],
                    'total'        => (float) ($item['price'] * $item['qty']),
                ]);
            }

            $db->commit();

            // Trigger notification for admin (non-critical)
            try {
                $customerName = htmlspecialchars($orderData['customer_name'], ENT_QUOTES, 'UTF-8');
                $currency = '₹';
                Notification::create(
                    'new_order',
                    $orderId,
                    "New order #{$invoiceNumber} from {$customerName} — {$currency}{$total}"
                );
            } catch (Exception $ne) {
                error_log('Notification creation failed: ' . $ne->getMessage());
            }

            return [
                'id'             => $orderId,
                'invoice_number' => $invoiceNumber,
                'subtotal'       => $subtotal,
                'delivery'       => $delivery,
                'total'          => $total,
            ];

        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    /**
     * Calculate delivery fee based on subtotal and delivery rule
     */
    private static function calculateDelivery(float $subtotal, ?array $rule): float {
        if (!$rule || !$rule['is_active']) {
            return 0;
        }

        // Check if order is below minimum
        if ($rule['min_order_amount'] > 0 && $subtotal < $rule['min_order_amount']) {
            return 0; // Would be blocked at validation level
        }

        // Check if eligible for free delivery
        if ($rule['free_delivery_above'] > 0 && $subtotal >= $rule['free_delivery_above']) {
            return 0;
        }

        // Apply standard delivery fee
        return (float) $rule['delivery_fee'];
    }

    /**
     * Get all orders (admin) with optional filter, search, status, payment, trash, and pagination
     *
     * @param string $filter          today|week|month|all|date (date = use date_from/date_to)
     * @param int    $page
     * @param int    $perPage
     * @param array  $opts            Extra filtering: status, payment_method, search, date_from, date_to, trash
     */
    public static function getAll(string $filter = 'all', int $page = 1, int $perPage = 15, array $opts = []): array {
        $db = getDB();

        $conditions = [];
        $params     = [];

        // ── Soft-delete scope ──────────────────────────────────────
        $trash = !empty($opts['trash']);
        if ($trash) {
            $conditions[] = "deleted_at IS NOT NULL";
        } else {
            $conditions[] = "deleted_at IS NULL";
        }

        // ── Date / Period filter ───────────────────────────────────
        if (!empty($opts['date_from']) && !empty($opts['date_to'])) {
            $conditions[] = "DATE(created_at) BETWEEN :date_from AND :date_to";
            $params[':date_from'] = $opts['date_from'];
            $params[':date_to']   = $opts['date_to'];
        } else {
            switch ($filter) {
                case 'today':
                    $conditions[] = "DATE(created_at) = CURDATE()";
                    break;
                case 'week':
                    $conditions[] = "created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
                    break;
                case 'month':
                    $conditions[] = "created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
                    break;
            }
        }

        // ── Status filter ──────────────────────────────────────────
        $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!empty($opts['status']) && in_array($opts['status'], $validStatuses)) {
            $conditions[] = "status = :status";
            $params[':status'] = $opts['status'];
        }

        // ── Payment method filter ──────────────────────────────────
        if (!empty($opts['payment_method'])) {
            $conditions[] = "payment_method = :payment_method";
            $params[':payment_method'] = $opts['payment_method'];
        }

        // ── Search (name / phone / invoice) ───────────────────────
        if (!empty($opts['search'])) {
            $conditions[] = "(customer_name LIKE :search OR phone LIKE :search OR invoice_number LIKE :search)";
            $params[':search'] = '%' . $opts['search'] . '%';
        }

        $where = $conditions ? "WHERE " . implode(' AND ', $conditions) : "";
        $offset = ($page - 1) * $perPage;

        $countStmt = $db->prepare("SELECT COUNT(*) FROM orders {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $db->prepare(
            "SELECT * FROM orders {$where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
        );
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'orders'    => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'total'     => $total,
            'page'      => $page,
            'per_page'  => $perPage,
            'last_page' => max(1, (int) ceil($total / $perPage)),
        ];
    }

    /**
     * Get order with items (excludes soft-deleted by default)
     */
    public static function getWithItems(int $id, bool $includeTrashed = false): ?array {
        $db = getDB();
        $deletedClause = $includeTrashed ? "" : "AND deleted_at IS NULL";
        $stmt = $db->prepare("SELECT * FROM orders WHERE id = :id {$deletedClause} LIMIT 1");
        $stmt->execute(['id' => $id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) return null;

        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = :order_id ORDER BY id");
        $itemStmt->execute(['order_id' => $id]);
        $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

        return $order;
    }

    /**
     * Soft-delete an order
     */
    public static function softDelete(int $id): bool {
        $db = getDB();
        $stmt = $db->prepare("UPDATE orders SET deleted_at = NOW() WHERE id = :id AND deleted_at IS NULL");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Restore a soft-deleted order
     */
    public static function restore(int $id): bool {
        $db = getDB();
        $stmt = $db->prepare("UPDATE orders SET deleted_at = NULL WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Permanently delete an order (hard delete, only from trash)
     */
    public static function hardDelete(int $id): bool {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM orders WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Update order status
     */
    public static function updateStatus(int $id, string $status): bool {
        $db = getDB();
        $stmt = $db->prepare("UPDATE orders SET status = :status WHERE id = :id AND deleted_at IS NULL");
        return $stmt->execute(['status' => $status, 'id' => $id]);
    }

    /**
     * Update payment method / ref (admin can set this manually or from checkout)
     */
    public static function updatePayment(int $id, string $method, ?string $ref = null): bool {
        $db = getDB();
        $stmt = $db->prepare("UPDATE orders SET payment_method = :method, payment_ref = :ref WHERE id = :id");
        return $stmt->execute(['method' => $method, 'ref' => $ref, 'id' => $id]);
    }

    /**
     * Get analytics: count + revenue for today/week/month/total (excludes soft-deleted)
     */
    public static function getAnalytics(): array {
        $db = getDB();

        $periods = [
            'today' => "DATE(created_at) = CURDATE()",
            'week'  => "created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)",
            'month' => "created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)",
            'total' => "1=1",
        ];

        $result = [];
        foreach ($periods as $key => $condition) {
            $stmt = $db->query(
                "SELECT COUNT(*) as cnt, COALESCE(SUM(total), 0) as revenue FROM orders WHERE deleted_at IS NULL AND {$condition}"
            );
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $result[$key] = [
                'count'   => (int) $row['cnt'],
                'revenue' => (float) $row['revenue'],
            ];
        }

        // Per-status counts (for calendar/badge display)
        $statusStmt = $db->query(
            "SELECT status, COUNT(*) as cnt FROM orders WHERE deleted_at IS NULL GROUP BY status"
        );
        $statusCounts = [];
        foreach ($statusStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $statusCounts[$row['status']] = (int) $row['cnt'];
        }
        $result['by_status'] = $statusCounts;

        // Per-payment-method counts
        $pmStmt = $db->query(
            "SELECT COALESCE(payment_method, 'unknown') as method, COUNT(*) as cnt FROM orders WHERE deleted_at IS NULL GROUP BY payment_method"
        );
        $pmCounts = [];
        foreach ($pmStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $pmCounts[$row['method']] = (int) $row['cnt'];
        }
        $result['by_payment'] = $pmCounts;

        // Trashed count
        $trashStmt = $db->query("SELECT COUNT(*) FROM orders WHERE deleted_at IS NOT NULL");
        $result['trashed'] = (int) $trashStmt->fetchColumn();

        return $result;
    }

    /**
     * Get daily order/revenue chart data for the last N days (excludes soft-deleted)
     */
    public static function getDailyChart(int $days = 14): array {
        $db = getDB();
        $stmt = $db->prepare(
            "SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
             FROM orders
             WHERE deleted_at IS NULL AND created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
             GROUP BY DATE(created_at)
             ORDER BY date ASC"
        );
        $stmt->execute(['days' => $days]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Pre-fill all dates to ensure no gaps in chart
        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-{$i} days"));
            $data[$date] = [
                'date'    => $date,
                'day'     => date('D d', strtotime($date)),
                'orders'  => 0,
                'revenue' => 0.0,
            ];
        }
        foreach ($rows as $row) {
            if (isset($data[$row['date']])) {
                $data[$row['date']]['orders']  = (int) $row['orders'];
                $data[$row['date']]['revenue'] = (float) $row['revenue'];
            }
        }

        return array_values($data);
    }

}
