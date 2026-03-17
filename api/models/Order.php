<?php
/**
 * Order Model — Order creation with transaction safety + Analytics
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Notification.php';

class Order {

    /**
     * Create an order with items (atomic transaction)
     */
    public static function create(array $orderData, array $items): array {
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
            $delivery = $subtotal >= 500 ? 0 : 50;
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
                Notification::create(
                    'new_order',
                    $orderId,
                    "New order #{$invoiceNumber} from {$customerName} — ₹{$total}"
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
     * Get all orders (admin) with optional filter and pagination
     * @param string $filter  today|week|month|all
     * @param int    $page    Page number (1-based)
     * @param int    $perPage Items per page
     */
    public static function getAll(string $filter = 'all', int $page = 1, int $perPage = 10): array {
        $db = getDB();

        $where = self::buildFilterWhere($filter);
        $offset = ($page - 1) * $perPage;

        $countStmt = $db->prepare("SELECT COUNT(*) FROM orders {$where['clause']}");
        $countStmt->execute($where['params']);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $db->prepare(
            "SELECT * FROM orders {$where['clause']} ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
        );
        foreach ($where['params'] as $key => $val) {
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
            'last_page' => (int) ceil($total / $perPage),
        ];
    }

    /**
     * Get order with items
     */
    public static function getWithItems(int $id): ?array {
        $db = getDB();
        
        $stmt = $db->prepare("SELECT * FROM orders WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) return null;

        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = :order_id ORDER BY id");
        $itemStmt->execute(['order_id' => $id]);
        $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

        return $order;
    }

    /**
     * Update order status
     */
    public static function updateStatus(int $id, string $status): bool {
        $db = getDB();
        $stmt = $db->prepare("UPDATE orders SET status = :status WHERE id = :id");
        return $stmt->execute(['status' => $status, 'id' => $id]);
    }

    /**
     * Get analytics: count + revenue for today/week/month/total
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
                "SELECT COUNT(*) as cnt, COALESCE(SUM(total), 0) as revenue FROM orders WHERE {$condition}"
            );
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $result[$key] = [
                'count'   => (int) $row['cnt'],
                'revenue' => (float) $row['revenue'],
            ];
        }
        return $result;
    }

    /**
     * Get daily order/revenue chart data for the last N days
     */
    public static function getDailyChart(int $days = 14): array {
        $db = getDB();
        $stmt = $db->prepare(
            "SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
             FROM orders
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
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

    // ─────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────

    private static function buildFilterWhere(string $filter): array {
        switch ($filter) {
            case 'today':
                return ['clause' => "WHERE DATE(created_at) = CURDATE()", 'params' => []];
            case 'week':
                return ['clause' => "WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)", 'params' => []];
            case 'month':
                return ['clause' => "WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)", 'params' => []];
            default:
                return ['clause' => "", 'params' => []];
        }
    }
}
