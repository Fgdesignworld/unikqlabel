-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 23, 2026 at 02:03 PM
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
(1, 'Admin', 'admin@laxmihomefoods.com', '$2y$10$GuPylriCZiE2k6B0riXfa.QfVquL9Ol.G6IQEWvaX2cxEaQgtdg8m', '2026-03-06 18:12:16');

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
(1, 'new_order', 5, 'New order #LHF-883746 from Fg designs — ₹797', 1, '2026-03-07 11:42:26');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `invoice_number`, `customer_name`, `phone`, `address`, `city`, `pincode`, `notes`, `subtotal`, `delivery`, `total`, `status`, `created_at`, `updated_at`) VALUES
(1, 'LHF-865924', 'sai kuamr', '9100800265', 'hello', 'hdyeatadab', '523155', '', 1400.00, 0.00, 1400.00, 'delivered', '2026-03-07 06:45:24', '2026-03-07 06:57:20'),
(2, 'LHF-866328', 'Fg designs', '8886968658', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 1350.00, 0.00, 1350.00, 'pending', '2026-03-07 06:52:08', '2026-03-07 06:52:08'),
(3, 'LHF-878340', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 3074.00, 0.00, 3074.00, 'delivered', '2026-03-07 10:12:20', '2026-03-07 13:04:26'),
(4, 'LHF-878508', 'Fg designs', '8886968658', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 1200.00, 0.00, 1200.00, 'pending', '2026-03-07 10:15:08', '2026-03-07 10:15:08'),
(5, 'LHF-883746', 'Fg designs', '8586898585', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 797.00, 0.00, 797.00, 'pending', '2026-03-02 11:42:26', '2026-03-07 12:59:57');

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
(24, 5, NULL, 'Munagaku Karam', '250g', 1, 219.00, 219.00);

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
  `weight` varchar(50) NOT NULL DEFAULT '1kg',
  `price` decimal(10,2) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
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

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `category`, `weight`, `price`, `image`, `rating`, `bestseller`, `is_veg`, `is_homemade`, `variants`, `status`, `created_at`, `updated_at`, `sort_order`) VALUES
(3, 'Nethi Sunnunda', 'nethi-sunnunda', 'Traditional urad dal sweet with pure ghee', 'sweets', '1kg', 1000.00, '/images/nethi-sunnunda.jpg', 4.9, 1, 1, 1, '[{\"weight\":\"250g\",\"price\":300},{\"weight\":\"500g\",\"price\":550},{\"weight\":\"1kg\",\"price\":1000}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 37),
(4, 'Nethi Sunnunda with Badham', 'nethi-sunnunda-badam', 'Premium sunnunda enriched with almond pieces', 'sweets', '1kg', 1100.00, '/images/badam-sunnunda.jpg', 4.9, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":350},{\"weight\":\"500g\",\"price\":600},{\"weight\":\"1kg\",\"price\":1100}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 36),
(5, 'Seeds with Dry Fruits Bite', 'dry-fruit-bite', 'Healthy energy bars made with seeds and dry fruits', 'sweets', '1kg', 1200.00, '/images/dry-fruit-bite.jpg', 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":400},{\"weight\":\"500g\",\"price\":700},{\"weight\":\"1kg\",\"price\":1200}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 35),
(6, 'Dry Fruit Healthy Laddu', 'dry-fruit-laddu', 'Power-packed laddu with mixed dry fruits', 'sweets', '1kg', 1200.00, '/images/dry-fruit-laddu.jpg', 4.9, 1, 1, 1, '[{\"weight\":\"250g\",\"price\":400},{\"weight\":\"500g\",\"price\":700},{\"weight\":\"1kg\",\"price\":1200}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 34),
(7, 'Raggi Nethi Laddu', 'ragi-nethi-laddu', 'Healthy finger millet laddu with pure ghee', 'sweets', '1kg', 900.00, '/images/ragi-nethi-laddu.jpg', 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":300},{\"weight\":\"500g\",\"price\":500},{\"weight\":\"1kg\",\"price\":900}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 33),
(8, 'Nuvvula Chikki', 'nuvvula-chikki', 'Nutritious sesame seed chikki', 'sweets', '1kg', 600.00, '/images/nuvvula-chikki.jpg', 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 32),
(9, 'Nuvvula Laddu', 'nuvvula-laddu', 'Health-conscious sesame balls', 'sweets', '1kg', 750.00, '/images/nuvvula-laddu.jpg', 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":250},{\"weight\":\"500g\",\"price\":450},{\"weight\":\"1kg\",\"price\":750}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 31),
(10, 'Palli Chikki', 'palli-chikki', 'Classic peanut brittle', 'sweets', '1kg', 600.00, '/images/palli-chikki.jpg', 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 30),
(11, 'Boondhi Chikki', 'boondhi-chikki', 'Crispy sweet boondhi bars', 'sweets', '1kg', 600.00, '/images/boondhi-chikki.jpg', 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 29),
(12, 'Kajji Kayalu', 'kajji-kayalu', 'Crispy fried sweet dumplings with coconut filling', 'sweets', '1kg', 800.00, '/images/kajji-kayalu.jpg', 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":250},{\"weight\":\"500g\",\"price\":450},{\"weight\":\"1kg\",\"price\":800}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 28),
(13, 'Gavalu', 'gavalu', 'Sweet shell-shaped traditional treats', 'snacks', '1kg', 600.00, '/images/gavalu-v3.jpg', 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 27),
(14, 'Ribbon Pakoda', 'ribbon-pakoda', 'Crispy, ribbon-shaped savory snack', 'snacks', '1kg', 500.00, '/images/ribbon-pakodi.jpg', 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":350},{\"weight\":\"1kg\",\"price\":500}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 26),
(15, 'Chakralu', 'chakralu', 'Traditional crunch spiral snacks', 'snacks', '1kg', 500.00, '/images/chakralu.jpg', 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":350},{\"weight\":\"1kg\",\"price\":500}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 25),
(16, 'Karam Bundhi', 'karam-bundhi', 'Spicy and crispy boondhi', 'snacks', '1kg', 500.00, '/images/kaju-bundhi.jpg', 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":350},{\"weight\":\"1kg\",\"price\":500}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 24),
(17, 'Sanna Karampusa', 'sanna-karampusa', 'Thin, spicy gram flour sev', 'snacks', '1kg', 600.00, '/images/sanna-karam-pusa.jpg', 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 23),
(18, 'Minapa Chakralu', 'minapa-chakralu', 'Crispy urad dal spirals', 'snacks', '1kg', 500.00, '/images/minapa-chakralu.jpg', 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":350},{\"weight\":\"1kg\",\"price\":500}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 22),
(19, 'Palli Pakodi (Peanut)', 'palli-pakodi', 'Spicy peanut pakodi', 'snacks', '1kg', 600.00, '/images/palli-pakodi-v2.jpg', 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":600}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 21),
(20, 'Kakarakaya Pickle', 'kakarakaya-pickle', 'Traditional bitter gourd pickle', 'pickles', '1kg', 596.00, '/images/kakaragaya-pickle.jpg', 4.5, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 20),
(21, 'Kotimeera Pickle', 'kotimeera-pickle', 'Flavorful coriander leaves pickle', 'pickles', '1kg', 596.00, '/images/kotimera-pickle.jpg', 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 19),
(22, 'Pandu Mirchi Pickle', 'pandu-mirchi-pickle', 'Fiery red chili pickle', 'pickles', '1kg', 596.00, '/images/pandu-mirchi.jpg', 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 18),
(23, 'Tomato Pickle', 'tomato-pickle', 'Tangy and spicy tomato pickle', 'pickles', '1kg', 596.00, '/images/tamota-pickle.jpg', 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 17),
(24, 'Gongura Pickle', 'gongura-pickle', 'Classic Andhra sorrel leaves pickle', 'pickles', '1kg', 596.00, '/images/gongura-pickle.jpg', 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 16),
(25, 'Vankaya Pickle', 'vankaya-pickle', 'Unique and spicy brinjal (eggplant) pickle', 'pickles', '1kg', 596.00, '/images/vankaya-pickle.jpg', 4.5, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 15),
(26, 'Mango Pickle', 'mango-pickle', 'Zesty raw mango pickle', 'pickles', '1kg', 596.00, '/images/mango-pickle.jpg', 4.9, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 14),
(27, 'Mamidi Alam', 'mamidi-alam', 'Mango-ginger blend pickle', 'pickles', '1kg', 596.00, '/images/ginger-pickle.jpg', 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 13),
(28, 'Alam Pickle', 'alam-pickle', 'Zesty ginger pickle', 'pickles', '1kg', 596.00, '/images/ginger-pickle.jpg', 4.6, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":200},{\"weight\":\"500g\",\"price\":400},{\"weight\":\"1kg\",\"price\":596}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 12),
(29, 'Chicken with Bone', 'chicken-bone-pickle', 'Spicy chicken pickle with bone pieces', 'pickles', '1kg', 1040.00, '/images/chicken-pickle.jpg', 4.9, 1, 0, 1, '[{\"weight\":\"250g\",\"price\":300},{\"weight\":\"500g\",\"price\":550},{\"weight\":\"1kg\",\"price\":1040}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 11),
(30, 'Chicken Boneless', 'chicken-boneless-pickle', 'Premium boneless chicken pickle', 'pickles', '1kg', 1200.00, '/images/chicken-pickle.jpg', 5.0, 1, 0, 1, '[{\"weight\":\"250g\",\"price\":350},{\"weight\":\"500g\",\"price\":650},{\"weight\":\"1kg\",\"price\":1200}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 10),
(31, 'Chicken Gongura Pickle', 'chicken-gongura-pickle', 'Combo of spicy chicken and tangy gongura', 'pickles', '1kg', 1396.00, '/images/chicken-pickle.jpg', 4.9, 0, 0, 1, '[{\"weight\":\"250g\",\"price\":400},{\"weight\":\"500g\",\"price\":750},{\"weight\":\"1kg\",\"price\":1396}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 9),
(32, 'Prawn Gongura Pickle', 'prawn-gongura-pickle', 'Exotic prawn pickle with gongura flavor', 'pickles', '1kg', 1960.00, '/images/non-veg-pickles.jpg', 4.9, 0, 0, 1, '[{\"weight\":\"250g\",\"price\":550},{\"weight\":\"500g\",\"price\":1000},{\"weight\":\"1kg\",\"price\":1960}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 8),
(33, 'Prawn Pickle', 'prawn-pickle', 'Delicious and spicy prawn pickle', 'pickles', '1kg', 1800.00, '/images/non-veg-pickles.jpg', 4.8, 0, 0, 1, '[{\"weight\":\"250g\",\"price\":500},{\"weight\":\"500g\",\"price\":950},{\"weight\":\"1kg\",\"price\":1800}]', 'active', '2026-03-07 06:32:32', '2026-03-07 11:00:19', 7),
(34, 'Mutton pickle', 'mutton-pickle', 'Premium mutton pickle with rich spices', 'pickles', '1kg', 2076.00, '/images/non-veg-pickles.jpg', 5.0, 0, 0, 1, '[{\"weight\":\"250g\",\"price\":600},{\"weight\":\"500g\",\"price\":1100},{\"weight\":\"1kg\",\"price\":2076}]', 'active', '2026-03-07 06:32:32', '2026-03-07 11:00:19', 6),
(35, 'Kobbari Karam', 'kobbari-karam', 'Coconut spice powder', 'spices', '250g', 219.00, '/images/kobbari-karam.jpg', 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":219}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 5),
(36, 'Nalla Karam', 'nalla-karam', 'Black spice powder with secret ingredients', 'spices', '250g', 219.00, '/images/nalla-karam.jpg', 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":219}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 4),
(37, 'KarvePaku Karam', 'karivepaku-karam', 'Nutritious curry leaves spice powder', 'spices', '250g', 219.00, '/images/karivepaku-karam.jpg', 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":219}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 3),
(38, 'Masala karam', 'masala-karam', 'Rich blended spice powder', 'spices', '250g', 219.00, '/images/guntur-karam.jpg', 4.8, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":219}]', 'active', '2026-03-07 06:32:32', '2026-03-07 11:04:20', 1),
(39, 'Munagaku Karam', 'munagaku-karam', 'Healthy drumstick leaves spice powder', 'spices', '250g', 219.00, '/images/munagaku-karam.jpg', 4.7, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":219}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 0),
(42, 'Chilly powder', 'chilly-powder', 'High-quality spice chilly powder', 'spices', '250g', 189.00, '/images/guntur-karam.jpg', 4.9, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":189}]', 'active', '2026-03-07 06:32:32', '2026-03-07 09:49:13', 38),
(43, 'pasupu', 'pasupu', 'Pure and traditional turmeric powder', 'spices', '250g', 140.00, '/api/uploads/products/product_69abee49090e7.jpg', 4.5, 0, 1, 1, '[{\"weight\":\"250g\",\"price\":140}]', 'active', '2026-03-07 09:22:20', '2026-03-07 11:04:20', 2);

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
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_order_id` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_slug` (`slug`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

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
