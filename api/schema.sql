-- ============================================
-- Lakshmi Home Foods — Database Schema
-- MySQL 5.7+ / MariaDB 10.3+
-- ============================================

CREATE DATABASE IF NOT EXISTS `laxmihome_db` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `laxmihome_db`;

-- ============================================
-- 1. ADMINS
-- ============================================
CREATE TABLE IF NOT EXISTS `admins` (
  `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`          VARCHAR(100) NOT NULL,
  `email`         VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB;

-- Default admin (password: Admin@123)
INSERT INTO `admins` (`name`, `email`, `password_hash`) VALUES
('Admin', 'admin@laxmihomefoods.com', '$2y$10$fMf9Ywf7LyoGDXTZCyOgmOr9CyevJaJMym3GLeWlTn1VOwpn5S6HC');

-- ============================================
-- 2. PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS `products` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`        VARCHAR(200) NOT NULL,
  `slug`        VARCHAR(200) NOT NULL UNIQUE,
  `description` TEXT,
  `category`    ENUM('snacks', 'pickles', 'spices', 'sweets') NOT NULL,
  `weight`      VARCHAR(50) NOT NULL DEFAULT '1kg',
  `price`       DECIMAL(10,2) NOT NULL,
  `image`       VARCHAR(500) DEFAULT NULL,
  `rating`      DECIMAL(2,1) DEFAULT 4.5,
  `bestseller`  TINYINT(1) DEFAULT 0,
  `is_veg`      TINYINT(1) DEFAULT 1,
  `is_homemade` TINYINT(1) DEFAULT 1,
  `variants`    JSON DEFAULT NULL,
  `status`      ENUM('active', 'inactive') DEFAULT 'active',
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB;

-- ============================================
-- 3. ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `invoice_number`  VARCHAR(20) NOT NULL UNIQUE,
  `customer_name`   VARCHAR(150) NOT NULL,
  `phone`           VARCHAR(15) NOT NULL,
  `address`         TEXT NOT NULL,
  `city`            VARCHAR(100) NOT NULL,
  `pincode`         VARCHAR(10) NOT NULL,
  `notes`           TEXT DEFAULT NULL,
  `subtotal`        DECIMAL(10,2) NOT NULL,
  `delivery`        DECIMAL(10,2) DEFAULT 0.00,
  `total`           DECIMAL(10,2) NOT NULL,
  `status`          ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_invoice` (`invoice_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB;

-- ============================================
-- 4. ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id`      INT UNSIGNED NOT NULL,
  `product_id`    INT UNSIGNED DEFAULT NULL,
  `product_name`  VARCHAR(200) NOT NULL,
  `weight`        VARCHAR(50) NOT NULL,
  `size_label`    VARCHAR(50) NULL DEFAULT NULL,
  `color_name`    VARCHAR(100) NULL DEFAULT NULL,
  `image_url`     VARCHAR(500) NULL DEFAULT NULL,
  `qty`           INT UNSIGNED NOT NULL DEFAULT 1,
  `price`         DECIMAL(10,2) NOT NULL,
  `total`         DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
  INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB;
