-- ============================================================
-- Razorpay Payment Fields Migration
-- Safe to run on existing data — uses IF NOT EXISTS guards.
-- Adds 5 new columns to the orders table; never destroys data.
-- ============================================================

-- 1. Online payment status (NULL = COD order, not applicable)
ALTER TABLE `orders`
    ADD COLUMN IF NOT EXISTS `payment_status`
        ENUM('pending','paid','failed') DEFAULT NULL
        COMMENT 'NULL=COD; pending/paid/failed=Razorpay online payment'
        AFTER `status`;

-- 2. Razorpay-generated order ID (e.g. "order_ABC123XYZ")
ALTER TABLE `orders`
    ADD COLUMN IF NOT EXISTS `razorpay_order_id`
        VARCHAR(100) DEFAULT NULL
        COMMENT 'Razorpay order ID created via orders API'
        AFTER `payment_ref`;

-- 3. Razorpay payment ID captured after successful payment
ALTER TABLE `orders`
    ADD COLUMN IF NOT EXISTS `razorpay_payment_id`
        VARCHAR(100) DEFAULT NULL
        COMMENT 'Razorpay payment ID from checkout callback'
        AFTER `razorpay_order_id`;

-- 4. HMAC-SHA256 signature from Razorpay (used for verification)
ALTER TABLE `orders`
    ADD COLUMN IF NOT EXISTS `razorpay_signature`
        VARCHAR(255) DEFAULT NULL
        COMMENT 'HMAC-SHA256 signature verified server-side'
        AFTER `razorpay_payment_id`;

-- 5. Timestamp of successful payment confirmation
ALTER TABLE `orders`
    ADD COLUMN IF NOT EXISTS `paid_at`
        TIMESTAMP NULL DEFAULT NULL
        COMMENT 'UTC timestamp when payment was confirmed'
        AFTER `razorpay_signature`;

-- Index: fast lookup by Razorpay order ID during verification
CREATE INDEX IF NOT EXISTS `idx_orders_razorpay_order_id`
    ON `orders` (`razorpay_order_id`);

-- Index: filter orders by payment status in admin panel
CREATE INDEX IF NOT EXISTS `idx_orders_payment_status`
    ON `orders` (`payment_status`);
