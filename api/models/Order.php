<?php
/**
 * Order Model — Order creation with transaction safety
 */

require_once __DIR__ . '/../config/database.php';

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
     * Get all orders (admin)
     */
    public static function getAll(): array {
        $db = getDB();
        $stmt = $db->query("SELECT * FROM orders ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    /**
     * Get order with items
     */
    public static function getWithItems(int $id): ?array {
        $db = getDB();
        
        $stmt = $db->prepare("SELECT * FROM orders WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $order = $stmt->fetch();

        if (!$order) return null;

        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = :order_id ORDER BY id");
        $itemStmt->execute(['order_id' => $id]);
        $order['items'] = $itemStmt->fetchAll();

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
}
