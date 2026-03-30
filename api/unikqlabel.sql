-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 25, 2026 at 05:51 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laxmihome_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `password_hash`, `created_at`) VALUES
(1, 'Admin', 'admin@gmail.com', '$2y$10$GuPylriCZiE2k6B0riXfa.QfVquL9Ol.G6IQEWvaX2cxEaQgtdg8m', '2026-03-06 18:12:16');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `sort_order` int(10) UNSIGNED DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `image`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Snacks', 'snacks', NULL, 'active', 1, '2026-03-23 13:37:03', '2026-03-25 06:48:21'),
(2, 'Pickles', 'pickles', NULL, 'active', 2, '2026-03-23 13:37:03', '2026-03-23 13:51:53'),
(3, 'Spices', 'spices', NULL, 'active', 3, '2026-03-23 13:37:03', '2026-03-23 13:37:03'),
(4, 'Sweets', 'sweets', NULL, 'active', 4, '2026-03-23 13:37:03', '2026-03-23 13:37:03');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_rules`
--

CREATE TABLE `delivery_rules` (
  `id` int(10) UNSIGNED NOT NULL,
  `min_order_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Minimum cart total to allow checkout',
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 40.00 COMMENT 'Flat delivery fee applied',
  `free_delivery_above` decimal(10,2) NOT NULL DEFAULT 500.00 COMMENT 'No delivery fee above this amount',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `delivery_rules`
--

INSERT INTO `delivery_rules` (`id`, `min_order_amount`, `delivery_fee`, `free_delivery_above`, `is_active`, `updated_at`) VALUES
(1, 0.00, 60.00, 1000.00, 1, '2026-03-25 12:43:59');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'new_order',
  `reference_id` int(10) UNSIGNED DEFAULT NULL,
  `message` varchar(500) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `reference_id`, `message`, `is_read`, `created_at`) VALUES
(1, 'new_order', 5, 'New order #LHF-883746 from Fg designs — ₹797', 1, '2026-03-07 11:42:26'),
(2, 'new_order', 6, 'New order #LHF-287387 from hlloe — ₹700', 0, '2026-03-23 17:36:27'),
(3, 'new_order', 7, 'New order #LHF-287747 from saih — ₹740', 1, '2026-03-23 17:42:27'),
(4, 'new_order', 8, 'New order #LHF-290194 from hello — ₹700', 1, '2026-03-23 18:23:14'),
(5, 'new_order', 9, 'New order #LHF-442890 from hello  — ₹778', 0, '2026-03-25 12:48:10');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `invoice_number` varchar(20) NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `notes` text DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `delivery` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_ref` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `invoice_number`, `customer_name`, `phone`, `address`, `city`, `pincode`, `notes`, `subtotal`, `delivery`, `total`, `status`, `created_at`, `updated_at`, `deleted_at`, `payment_method`, `payment_ref`) VALUES
(1, 'LHF-865924', 'sai kuamr', '9100800265', 'hello', 'hdyeatadab', '523155', '', 1400.00, 0.00, 1400.00, 'processing', '2026-03-07 06:45:24', '2026-03-25 12:53:37', NULL, NULL, NULL),
(2, 'LHF-866328', 'Fg designs', '8886968658', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 1350.00, 0.00, 1350.00, 'pending', '2026-03-07 06:52:08', '2026-03-07 06:52:08', NULL, NULL, NULL),
(3, 'LHF-878340', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 3074.00, 0.00, 3074.00, 'delivered', '2026-03-07 10:12:20', '2026-03-25 11:32:35', NULL, 'gpay', NULL),
(4, 'LHF-878508', 'Fg designs', '8886968658', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 1200.00, 0.00, 1200.00, 'pending', '2026-03-07 10:15:08', '2026-03-07 10:15:08', NULL, NULL, NULL),
(5, 'LHF-883746', 'Fg designs', '8586898585', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 797.00, 0.00, 797.00, 'pending', '2026-03-02 11:42:26', '2026-03-07 12:59:57', NULL, NULL, NULL),
(6, 'LHF-287387', 'hlloe', '9100800265', 'hello', 'hy', '562555', 'davkj', 700.00, 0.00, 700.00, 'pending', '2026-03-23 17:36:27', '2026-03-25 11:27:28', '2026-03-25 11:27:28', NULL, NULL),
(7, 'LHF-287747', 'saih', '9100800265', 'scahcshg', 'dasd', '546464', '', 740.00, 0.00, 740.00, 'pending', '2026-03-23 17:42:27', '2026-03-25 11:27:18', '2026-03-25 11:27:18', NULL, NULL),
(8, 'LHF-290194', 'hello', '9100800265', 'helodks', 'hy', '910080', '', 700.00, 0.00, 700.00, 'pending', '2026-03-23 18:23:14', '2026-03-25 11:27:10', '2026-03-25 11:27:10', NULL, NULL),
(9, 'LHF-442890', 'hello ', '9100800265', 'hello', 'hyde', '910080', '', 718.00, 60.00, 778.00, 'pending', '2026-03-25 12:48:10', '2026-03-25 12:48:10', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `weight` varchar(50) NOT NULL,
  `qty` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `weight`, `qty`, `price`, `total`) VALUES
(1, 1, NULL, 'Gavalu', '250g', 1, 200.00, 200.00),
(2, 1, NULL, 'Chakralu', '250g', 1, 200.00, 200.00),
(3, 1, NULL, 'Karam Bundhi', '250g', 1, 200.00, 200.00),
(4, 1, NULL, 'Ribbon Pakoda', '250g', 1, 200.00, 200.00),
(5, 1, NULL, 'Palli Pakodi (Peanut)', '250g', 1, 200.00, 200.00),
(6, 1, NULL, 'Minapa Chakralu', '250g', 1, 200.00, 200.00),
(7, 1, NULL, 'Sanna Karampusa', '250g', 1, 200.00, 200.00),
(8, 2, NULL, 'Chicken with Bone', '250g', 1, 300.00, 300.00),
(9, 2, NULL, 'Dry Fruit Healthy Laddu', '250g', 1, 400.00, 400.00),
(10, 2, NULL, 'Nethi Sunnunda', '250g', 1, 300.00, 300.00),
(11, 2, NULL, 'Chicken Boneless', '250g', 1, 350.00, 350.00),
(12, 3, NULL, 'pasupu', '250g', 1, 140.00, 140.00),
(13, 3, NULL, 'KarvePaku Karam', '250g', 1, 219.00, 219.00),
(14, 3, NULL, 'Masala karam', '250g', 1, 219.00, 219.00),
(15, 3, NULL, 'Mutton pickle', '250g', 1, 600.00, 600.00),
(16, 3, NULL, 'Chicken Boneless', '250g', 1, 350.00, 350.00),
(17, 3, NULL, 'Chicken with Bone', '500g', 1, 550.00, 550.00),
(18, 3, NULL, 'Mango Pickle', '1kg', 1, 596.00, 596.00),
(19, 3, NULL, 'Vankaya Pickle', '500g', 1, 400.00, 400.00),
(20, 4, NULL, 'Dry Fruit Healthy Laddu', '250g', 3, 400.00, 1200.00),
(21, 5, NULL, 'KarvePaku Karam', '250g', 1, 219.00, 219.00),
(22, 5, NULL, 'pasupu', '250g', 1, 140.00, 140.00),
(23, 5, NULL, 'Masala karam', '250g', 1, 219.00, 219.00),
(24, 5, NULL, 'Munagaku Karam', '250g', 1, 219.00, 219.00),
(25, 6, NULL, 'Chicken with Bone', '250g', 1, 300.00, 300.00),
(26, 6, NULL, 'Dry Fruit Healthy Laddu', '250g', 1, 400.00, 400.00),
(27, 7, NULL, 'pasupu', '250g', 1, 140.00, 140.00),
(28, 7, NULL, 'Mutton pickle', '250g', 1, 600.00, 600.00),
(29, 8, NULL, 'Dry Fruit Healthy Laddu', '250g', 1, 400.00, 400.00),
(30, 8, NULL, 'Nethi Sunnunda', '250g', 1, 300.00, 300.00),
(31, 9, NULL, 'Munagaku Karam', '250g', 2, 219.00, 438.00),
(32, 9, NULL, 'pasupu', '250g', 2, 140.00, 280.00);

-- --------------------------------------------------------

--
-- Table structure for table `popups`
--

CREATE TABLE `popups` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_link` varchar(500) DEFAULT NULL,
  `delay_seconds` int(10) UNSIGNED DEFAULT 2 COMMENT 'seconds after page load before showing',
  `is_active` tinyint(1) DEFAULT 0,
  `price` decimal(8,2) UNSIGNED DEFAULT NULL COMMENT 'combo offer price',
  `header_background` varchar(100) DEFAULT '#b91c1c' COMMENT 'header bg color (red, blue, green, etc)',
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'array of {id, name, weight, image} for combo items' CHECK (json_valid(`items`)),
  `views` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `clicks` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `popups`
--

INSERT INTO `popups` (`id`, `title`, `description`, `image`, `button_text`, `button_link`, `delay_seconds`, `is_active`, `price`, `header_background`, `items`, `views`, `clicks`, `created_at`, `updated_at`) VALUES
(1, 'hello', '', '/uploads/popups/popup_69c17e651c75e.png', 'buy now', '/prodcuts', 2, 0, 899.00, '#b91c1c', '[{\"id\":1774288430868,\"name\":\"Nethi Sunnunda\",\"weight\":\"250 g\",\"image\":\"\"},{\"id\":1774288447665,\"name\":\"Karam Bundhi\",\"weight\":\"250 g\",\"image\":\"\"},{\"id\":1774288455904,\"name\":\"Kotimera Pickle\",\"weight\":\"250 g\",\"image\":\"\"},{\"id\":1774288468831,\"name\":\"Tamota Pickle\",\"weight\":\"250 g\",\"image\":\"\"}]', 15, 0, '2026-03-23 17:55:12', '2026-03-23 19:05:46');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('snacks','pickles','spices','sweets') NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `weight` varchar(50) NOT NULL DEFAULT '1kg',
  `price` decimal(10,2) NOT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `gallery_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery_images`)),
  `rating` decimal(2,1) DEFAULT 4.5,
  `bestseller` tinyint(1) DEFAULT 0,
  `is_veg` tinyint(1) DEFAULT 1,
  `is_homemade` tinyint(1) DEFAULT 1,
  `variants` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variants`)),
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `category`, `category_id`, `weight`, `price`, `discount_price`, `image`, `gallery_images`, `rating`, `bestseller`, `is_veg`, `is_homemade`, `variants`, `status`, `created_at`, `updated_at`, `sort_order`) VALUES
(3, 'Nethi Sunnunda', 'nethi-sunnunda', 'Traditional urad dal sweet with pure ghee', 'sweets', 4, '1kg', 1000.00, NULL, '/images/nethi-sunnunda.jpg', NULL, 4.9, 1, 1, 1, '[{\"weight\":\"250g\",\"price\":300},{\"weight\":\"500g\",\"price\":550},{\"weight\":\"1kg\",\"price\":1000}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 37),
(4, 'Nethi Sunnunda with Badham', 'nethi-sunnunda-badam', 'Premium sunnunda enriched with almond pieces', 'sweets', 4, '1kg', 1100.00, NULL, '/images/badam-sunnunda.jpg', NULL, 4.9, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":350},{\"weight\":\"500g\",\"price\":600},{\"weight\":\"1kg\",\"price\":1100}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 36),
(5, 'Seeds with Dry Fruits Bite', 'dry-fruit-bite', 'Healthy energy bars made with seeds and dry fruits', 'sweets', 4, '1kg', 1200.00, NULL, '/images/dry-fruit-bite.jpg', NULL, 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":400},{\"weight\":\"500g\",\"price\":700},{\"weight\":\"1kg\",\"price\":1200}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 35),
(6, 'Dry Fruit Healthy Laddu', 'dry-fruit-laddu', 'Power-packed laddu with mixed dry fruits', 'sweets', 4, '1kg', 1200.00, NULL, '/images/dry-fruit-laddu.jpg', NULL, 4.9, 1, 1, 1, '[{\"weight\":\"250g\",\"price\":400},{\"weight\":\"500g\",\"price\":700},{\"weight\":\"1kg\",\"price\":1200}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 34),
(7, 'Raggi Nethi Laddu', 'ragi-nethi-laddu', 'Healthy finger millet laddu with pure ghee', 'sweets', 4, '1kg', 900.00, NULL, '/images/ragi-nethi-laddu.jpg', NULL, 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":300},{\"weight\":\"500g\",\"price\":500},{\"weight\":\"1kg\",\"price\":900}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 33),
(8, 'Nuvvula Chikki', 'nuvvula-chikki', 'Nutritious sesame seed chikki', 'sweets', 4, '1kg', 600.00, NULL, '/images/nuvvula-chikki.jpg', NULL, 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 32),
(9, 'Nuvvula Laddu', 'nuvvula-laddu', 'Health-conscious sesame balls', 'sweets', 4, '1kg', 750.00, NULL, '/images/nuvvula-laddu.jpg', NULL, 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":250},{\"weight\":\"500g\",\"price\":450},{\"weight\":\"1kg\",\"price\":750}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 31),
(10, 'Palli Chikki', 'palli-chikki', 'Classic peanut brittle', 'sweets', 4, '1kg', 600.00, NULL, '/images/palli-chikki.jpg', NULL, 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 30),
(11, 'Boondhi Chikki', 'boondhi-chikki', 'Crispy sweet boondhi bars', 'sweets', 4, '1kg', 600.00, NULL, '/images/boondhi-chikki.jpg', NULL, 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 29),
(12, 'Kajji Kayalu', 'kajji-kayalu', 'Crispy fried sweet dumplings with coconut filling', 'sweets', 4, '1kg', 800.00, NULL, '/images/kajji-kayalu.jpg', NULL, 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":250},{\"weight\":\"500g\",\"price\":450},{\"weight\":\"1kg\",\"price\":800}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 28),
(13, 'Gavalu', 'gavalu', 'Sweet shell-shaped traditional treats', 'snacks', 1, '1kg', 600.00, NULL, '/images/gavalu-v3.jpg', NULL, 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 27),
(14, 'Ribbon Pakoda', 'ribbon-pakoda', 'Crispy, ribbon-shaped savory snack', 'snacks', 1, '1kg', 500.00, NULL, '/images/ribbon-pakodi.jpg', NULL, 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":350},{\"weight\":\"1kg\",\"price\":500}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 26),
(15, 'Chakralu', 'chakralu', 'Traditional crunch spiral snacks', 'snacks', 1, '1kg', 500.00, NULL, '/images/chakralu.jpg', NULL, 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":350},{\"weight\":\"1kg\",\"price\":500}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 25),
(16, 'Karam Bundhi', 'karam-bundhi', 'Spicy and crispy boondhi', 'snacks', 1, '1kg', 500.00, NULL, '/images/kaju-bundhi.jpg', NULL, 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":350},{\"weight\":\"1kg\",\"price\":500}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 24),
(17, 'Sanna Karampusa', 'sanna-karampusa', 'Thin, spicy gram flour sev', 'snacks', 1, '1kg', 600.00, NULL, '/images/sanna-karam-pusa.jpg', NULL, 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 23),
(18, 'Minapa Chakralu', 'minapa-chakralu', 'Crispy urad dal spirals', 'snacks', 1, '1kg', 500.00, NULL, '/images/minapa-chakralu.jpg', NULL, 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":350},{\"weight\":\"1kg\",\"price\":500}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 22),
(19, 'Palli Pakodi (Peanut)', 'palli-pakodi', 'Spicy peanut pakodi', 'snacks', 1, '1kg', 600.00, NULL, '/images/palli-pakodi-v2.jpg', NULL, 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 21),
(20, 'Kakarakaya Pickle', 'kakarakaya-pickle', 'Traditional bitter gourd pickle', 'pickles', 2, '1kg', 596.00, NULL, '/images/kakaragaya-pickle.jpg', NULL, 4.5, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 20),
(21, 'Kotimeera Pickle', 'kotimeera-pickle', 'Flavorful coriander leaves pickle', 'pickles', 2, '1kg', 596.00, NULL, '/images/kotimera-pickle.jpg', NULL, 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 19),
(22, 'Pandu Mirchi Pickle', 'pandu-mirchi-pickle', 'Fiery red chili pickle', 'pickles', 2, '1kg', 596.00, NULL, '/images/pandu-mirchi.jpg', NULL, 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 18),
(23, 'Tomato Pickle', 'tomato-pickle', 'Tangy and spicy tomato pickle', 'pickles', 2, '1kg', 596.00, NULL, '/images/tamota-pickle.jpg', NULL, 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 17),
(24, 'Gongura Pickle', 'gongura-pickle', 'Classic Andhra sorrel leaves pickle', 'pickles', 2, '1kg', 596.00, NULL, '/images/gongura-pickle.jpg', NULL, 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 16),
(25, 'Vankaya Pickle', 'vankaya-pickle', 'Unique and spicy brinjal (eggplant) pickle', 'pickles', 2, '1kg', 596.00, NULL, '/images/vankaya-pickle.jpg', NULL, 4.5, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 15),
(26, 'Mango Pickle', 'mango-pickle', 'Zesty raw mango pickle', 'pickles', 2, '1kg', 596.00, NULL, '/images/mango-pickle.jpg', NULL, 4.9, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 14),
(27, 'Mamidi Alam', 'mamidi-alam', 'Mango-ginger blend pickle', 'pickles', 2, '1kg', 596.00, NULL, '/images/ginger-pickle.jpg', NULL, 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 13),
(28, 'Alam Pickle', 'alam-pickle', 'Zesty ginger pickle', 'pickles', 2, '1kg', 596.00, NULL, '/images/ginger-pickle.jpg', NULL, 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 12),
(29, 'Chicken with Bone', 'chicken-bone-pickle', 'Spicy chicken pickle with bone pieces', 'pickles', 2, '1kg', 1040.00, NULL, '/images/chicken-pickle.jpg', NULL, 4.9, 1, 0, 1, '[{\"weight\":\"250g\",\"price\":300},{\"weight\":\"500g\",\"price\":550},{\"weight\":\"1kg\",\"price\":1040}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 11),
(30, 'Chicken Boneless', 'chicken-boneless-pickle', 'Premium boneless chicken pickle', 'pickles', 2, '1kg', 1200.00, NULL, '/images/chicken-pickle.jpg', NULL, 5.0, 1, 0, 1, '[{\"weight\":\"250g\",\"price\":350},{\"weight\":\"500g\",\"price\":650},{\"weight\":\"1kg\",\"price\":1200}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 10),
(31, 'Chicken Gongura Pickle', 'chicken-gongura-pickle', 'Combo of spicy chicken and tangy gongura', 'pickles', 2, '1kg', 1396.00, NULL, '/images/chicken-pickle.jpg', NULL, 4.9, 0, 0, 1, '[{\"weight\":\"250g\",\"price\":450},{\"weight\":\"500g\",\"price\":750},{\"weight\":\"1kg\",\"price\":1396}]', 'active', '2026-03-07 06:32:32', '2026-03-23 18:34:35', 9),
(32, 'Prawn Gongura Pickle', 'prawn-gongura-pickle', 'Exotic prawn pickle with gongura flavor', 'pickles', 2, '1kg', 1960.00, NULL, '/images/non-veg-pickles.jpg', NULL, 4.9, 0, 0, 1, '[{\"weight\":\"250g\",\"price\":550},{\"weight\":\"500g\",\"price\":1000},{\"weight\":\"1kg\",\"price\":1960}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 8),
(33, 'Prawn Pickle', 'prawn-pickle', 'Delicious and spicy prawn pickle', 'pickles', 2, '1kg', 1800.00, NULL, '/images/non-veg-pickles.jpg', NULL, 4.8, 0, 0, 1, '[{\"weight\":\"250g\",\"price\":500},{\"weight\":\"500g\",\"price\":950},{\"weight\":\"1kg\",\"price\":1800}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 7),
(34, 'Mutton pickle', 'mutton-pickle', 'Premium mutton pickle with rich spices', 'pickles', 2, '1kg', 2076.00, NULL, '/images/non-veg-pickles.jpg', NULL, 5.0, 0, 0, 1, '[{\"weight\":\"250g\",\"price\":600},{\"weight\":\"500g\",\"price\":1100},{\"weight\":\"1kg\",\"price\":2076}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 6),
(35, 'Kobbari Karam', 'kobbari-karam', 'Coconut spice powder', 'spices', 3, '250g', 219.00, NULL, '/images/kobbari-karam.jpg', NULL, 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":219}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 5),
(36, 'Nalla Karam', 'nalla-karam', 'Black spice powder with secret ingredients', 'spices', 3, '250g', 219.00, NULL, '/images/nalla-karam.jpg', NULL, 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":219}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 4),
(37, 'KarvePaku Karam', 'karivepaku-karam', 'Nutritious curry leaves spice powder', 'spices', 3, '250g', 219.00, NULL, '/images/karivepaku-karam.jpg', NULL, 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":219}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 3),
(38, 'Masala karam', 'masala-karam', 'Rich blended spice powder', 'spices', 3, '250g', 219.00, NULL, '/images/guntur-karam.jpg', '[\"\\/api\\/uploads\\/products\\/product_69c3888ab7296.jpg\",\"\\/api\\/uploads\\/products\\/product_69c3888ac0ab0.jpg\",\"\\/api\\/uploads\\/products\\/product_69c3888ac8edb.jpg\"]', 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":219}]', 'active', '2026-03-07 06:32:32', '2026-03-25 07:02:38', 1),
(39, 'Munagaku Karam', 'munagaku-karam', 'Healthy drumstick leaves spice powder', 'spices', 3, '250g', 219.00, NULL, '/images/munagaku-karam.jpg', '[\"\\/api\\/uploads\\/products\\/product_69c18f97ad2aa.png\",\"\\/api\\/uploads\\/products\\/product_69c18f97bc044.png\",\"\\/api\\/uploads\\/products\\/product_69c18f97cb2fa.png\"]', 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":219}]', 'active', '2026-03-07 06:32:32', '2026-03-23 19:11:51', 0),
(42, 'Chilly powder', 'chilly-powder', 'High-quality spice chilly powder', 'spices', 3, '250g', 189.00, NULL, '/images/guntur-karam.jpg', NULL, 4.9, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":189}]', 'active', '2026-03-07 06:32:32', '2026-03-23 13:37:27', 38),
(43, 'pasupu', 'pasupu', 'Pure and traditional turmeric powder', 'spices', 3, '250g', 140.00, NULL, '/api/uploads/products/product_69abee49090e7.jpg', NULL, 4.5, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":140}]', 'active', '2026-03-07 09:22:20', '2026-03-23 13:37:27', 2);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `rating` tinyint(4) NOT NULL DEFAULT 5,
  `comment` text NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verification_token` varchar(64) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `name`, `email`, `rating`, `comment`, `image`, `status`, `is_verified`, `verified_at`, `verification_token`, `ip_address`, `created_at`, `updated_at`) VALUES
(5, 39, 'hello', 'hello@gmail.com', 5, 'htellekennndnfid', NULL, 'approved', 1, '2026-03-25 10:27:22', NULL, '::1', '2026-03-25 10:23:38', '2026-03-25 10:27:22'),
(6, 39, 'super', 'super@gmial.com', 5, 'hello how are you', NULL, 'approved', 1, '2026-03-25 10:28:16', '077528fdc4a7e820a6cb5af6fe980fec8e6c5670076cfdff2d0ab232f4af889a', '::1', '2026-03-25 10:28:04', '2026-03-25 10:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `seo`
--

CREATE TABLE `seo` (
  `id` int(10) UNSIGNED NOT NULL,
  `page_type` enum('home','product','category','page') NOT NULL,
  `page_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'product/category id; NULL for home/page',
  `page_slug` varchar(200) DEFAULT NULL COMMENT 'for static pages like about, contact',
  `meta_title` varchar(160) DEFAULT NULL,
  `meta_description` varchar(320) DEFAULT NULL,
  `meta_keywords` varchar(500) DEFAULT NULL,
  `og_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `seo`
--

INSERT INTO `seo` (`id`, `page_type`, `page_id`, `page_slug`, `meta_title`, `meta_description`, `meta_keywords`, `og_image`, `created_at`, `updated_at`) VALUES
(1, 'home', NULL, 'home', 'Lakshmi Home Foods Authentic Homemade Pickles, Snacks Spices', 'Order authentic homemade pickles, snacks, spices and sweets from Lakshmi Home Foods. Fresh, traditional recipes delivered to your door.', 'homemade pickles, snacks, spices, sweets, traditional food, Lakshmi Home Foods', 'https://lakshmihomefoods.com/api/uploads/products/product_69bbe7500287a.png', '2026-03-23 13:44:54', '2026-03-25 16:20:21'),
(2, 'page', NULL, 'about', 'about', 'about', 'about', NULL, '2026-03-23 15:48:57', '2026-03-23 15:48:57'),
(3, 'page', NULL, 'contact', 'contact ', 'contact ', 'contact ', NULL, '2026-03-23 15:49:06', '2026-03-23 15:49:06'),
(4, 'page', NULL, 'products', 'prodcut', 'prodcut', 'prodcut', NULL, '2026-03-23 15:49:18', '2026-03-23 15:49:18'),
(5, 'page', NULL, 'pickles', 'pickles', 'pickles', 'pickles', NULL, '2026-03-23 15:49:36', '2026-03-23 15:49:36'),
(6, 'page', NULL, 'snacks', 'snacks', 'snacks', 'snacks', NULL, '2026-03-23 15:49:48', '2026-03-23 15:49:48'),
(7, 'page', NULL, 'spices', 'spices', 'spices', 'spices', NULL, '2026-03-23 15:49:56', '2026-03-23 15:49:56'),
(8, 'page', NULL, 'checkout', 'cehckout', 'cehckout', 'cehckout', NULL, '2026-03-23 15:50:04', '2026-03-23 15:50:04');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_group` varchar(50) DEFAULT 'general' COMMENT 'general|contact|social|branding|typography',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `updated_at`) VALUES
(1, 'site_name', 'Lakshmi Home Foods', 'general', '2026-03-23 15:42:03'),
(2, 'site_tagline', 'Pure Taste of Tradition', 'general', '2026-03-23 15:42:03'),
(3, 'currency_symbol', '₹', 'general', '2026-03-23 17:15:00'),
(4, 'logo_url', '/uploads/branding/logo_69c15fb1392c4.png', 'general', '2026-03-23 15:43:53'),
(5, 'favicon_url', '/uploads/branding/logo_69c15fb5c573a.png', 'general', '2026-03-23 15:43:53'),
(6, 'phone', '+91 8639424039', 'contact', '2026-03-23 17:01:51'),
(7, 'whatsapp', '+91 8639424039', 'contact', '2026-03-23 15:46:15'),
(8, 'email', NULL, 'contact', '2026-03-23 13:52:54'),
(9, 'address', 'Andhra Pradesh, India', 'contact', '2026-03-23 15:46:15'),
(10, 'social_facebook', 'www.instagram.com/lakshmihomefoods01?igsh=Z3B2dWs4eTkyeXo5', 'social', '2026-03-23 15:44:57'),
(11, 'social_instagram', 'www.instagram.com/lakshmihomefoods01?igsh=Z3B2dWs4eTkyeXo5', 'social', '2026-03-23 15:44:57'),
(12, 'social_youtube', 'https://www.youtube.com/@Lakshmihomefoods01', 'social', '2026-03-23 15:44:57'),
(13, 'social_twitter', NULL, 'social', '2026-03-23 13:52:54'),
(14, 'theme_color', '#f59e0b', 'branding', '2026-03-23 13:52:54'),
(15, 'header_bg', NULL, 'branding', '2026-03-23 13:52:54'),
(16, 'footer_bg', NULL, 'branding', '2026-03-23 13:52:54'),
(17, 'font_heading', 'Playfair Display', 'typography', '2026-03-23 17:06:47'),
(18, 'font_body', 'Poppins', 'typography', '2026-03-23 13:52:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `delivery_rules`
--
ALTER TABLE `delivery_rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `idx_invoice` (`invoice_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_payment_method` (`payment_method`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_order_id` (`order_id`);

--
-- Indexes for table `popups`
--
ALTER TABLE `popups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_price` (`price`),
  ADD KEY `idx_is_veg` (`is_veg`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email_product` (`email`,`product_id`),
  ADD KEY `idx_product_status` (`product_id`,`status`,`is_verified`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `seo`
--
ALTER TABLE `seo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_seo` (`page_type`,`page_id`,`page_slug`),
  ADD KEY `idx_type_id` (`page_type`,`page_id`),
  ADD KEY `idx_type_slug` (`page_type`,`page_slug`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_key` (`setting_key`),
  ADD KEY `idx_group` (`setting_group`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `delivery_rules`
--
ALTER TABLE `delivery_rules`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `popups`
--
ALTER TABLE `popups`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `seo`
--
ALTER TABLE `seo`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=274;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
