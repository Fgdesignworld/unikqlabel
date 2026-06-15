-- ============================================================
-- Remove clothing-brand specific tables and columns
-- Run manually. All operations use IF EXISTS for safety.
-- ============================================================

-- 1. Drop tables with foreign key dependencies first
DROP TABLE IF EXISTS `product_color_images`;
DROP TABLE IF EXISTS `size_variants`;

-- 2. Drop parent tables
DROP TABLE IF EXISTS `color_library`;
DROP TABLE IF EXISTS `size_variant_sets`;

-- 3. Remove clothing-specific columns from products table
ALTER TABLE `products`
  DROP COLUMN IF EXISTS `variant_set_id`,
  DROP COLUMN IF EXISTS `enable_variants`,
  DROP COLUMN IF EXISTS `enable_colors`,
  DROP COLUMN IF EXISTS `color_variants_json`;

-- NOTE: variants_json is intentionally kept.
-- It stores weight/size options (e.g. "100g=₹399") used by the
-- Razorpay payment flow for server-side price resolution.
