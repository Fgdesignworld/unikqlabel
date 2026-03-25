-- ============================================================
-- Order Enhancements: soft-delete + payment method tracking
-- Run: mysql -u root laxmihome_db < api/migrations/add_order_enhancements.sql
-- ============================================================

-- Soft-delete column (NULL = active, timestamp = deleted)
ALTER TABLE `orders`
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  ADD INDEX IF NOT EXISTS `idx_deleted_at` (`deleted_at`);

-- Payment method tracking (UPI/GPay/PhonePe/COD/Card/etc.)
ALTER TABLE `orders`
  ADD COLUMN IF NOT EXISTS `payment_method` VARCHAR(50) NULL DEFAULT NULL AFTER `notes`,
  ADD COLUMN IF NOT EXISTS `payment_ref`    VARCHAR(100) NULL DEFAULT NULL AFTER `payment_method`;

-- Index to filter by payment method
ALTER TABLE `orders`
  ADD INDEX IF NOT EXISTS `idx_payment_method` (`payment_method`);
