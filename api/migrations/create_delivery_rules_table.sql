-- ============================================
-- MODULE 5: Delivery Rules Table
-- Lakshmi Home Foods
-- ============================================

CREATE TABLE IF NOT EXISTS `delivery_rules` (
  `id`                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `min_order_amount`    DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT 'Minimum cart total to allow checkout',
  `delivery_fee`        DECIMAL(10,2) NOT NULL DEFAULT 40.00 COMMENT 'Flat delivery fee applied',
  `free_delivery_above` DECIMAL(10,2) NOT NULL DEFAULT 500.00 COMMENT 'No delivery fee above this amount',
  `is_active`           TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at`          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default rule
INSERT IGNORE INTO `delivery_rules` (id, min_order_amount, delivery_fee, free_delivery_above, is_active)
VALUES (1, 0.00, 40.00, 500.00, 1);
