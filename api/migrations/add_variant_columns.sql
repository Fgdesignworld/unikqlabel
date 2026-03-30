-- Add size variants and color variants columns to products table
-- Run once in MySQL

ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `variants_json`       JSON NULL COMMENT 'Size-based pricing: [{label, price}]'        AFTER `variants`,
  ADD COLUMN IF NOT EXISTS `color_variants_json` JSON NULL COMMENT 'Color+images: [{color, hex, images:[]}]'     AFTER `variants_json`;
