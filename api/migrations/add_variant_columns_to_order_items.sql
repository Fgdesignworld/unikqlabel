-- ============================================================
-- Add size_label and color_name to order_items
-- Run once: mysql -u root your_db < api/migrations/add_variant_columns_to_order_items.sql
-- Safe: uses ADD COLUMN IF NOT EXISTS
-- ============================================================

ALTER TABLE `order_items`
  ADD COLUMN IF NOT EXISTS `size_label`  VARCHAR(50)  NULL DEFAULT NULL COMMENT 'Selected size variant label (e.g. M, XL)' AFTER `weight`,
  ADD COLUMN IF NOT EXISTS `color_name`  VARCHAR(100) NULL DEFAULT NULL COMMENT 'Selected color variant name (e.g. Navy, Black)' AFTER `size_label`,
  ADD COLUMN IF NOT EXISTS `image_url`   VARCHAR(500) NULL DEFAULT NULL COMMENT 'Product image URL at time of order' AFTER `color_name`;
