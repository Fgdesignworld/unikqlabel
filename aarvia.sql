-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 13, 2026 at 07:03 AM
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
-- Database: `aarvia`
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
(1, 'Admin', 'admin@gmail.com', '$2y$10$sjUeWO16Og8Ju1HwXEXjFuV2o45seBDn6gzvE/AtPzfcccADS7SBW', '2026-03-06 18:12:16');

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(300) NOT NULL,
  `slug` varchar(300) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `author` varchar(150) NOT NULL DEFAULT 'Admin',
  `category` varchar(100) NOT NULL DEFAULT 'General',
  `tags` text DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `views` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `read_time` tinyint(3) UNSIGNED DEFAULT NULL,
  `meta_title` varchar(300) DEFAULT NULL,
  `meta_desc` text DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `category`, `tags`, `status`, `featured`, `views`, `read_time`, `meta_title`, `meta_desc`, `published_at`, `created_at`, `updated_at`) VALUES
(1, 'something', 'something', 'dgasjk gdasgjdkg askjgdjkasgdjkgasjkdgajkag \ndas daosihdoiash', '<p><strong>dhas dvaskdvasd</strong></p><p>ksav dhvaskjdvjk</p><p>jas djkvasjkdvajksvd</p>', '/uploads/blog/blog_a5a397c8aca83be0eb5f0627.jpg', 'Admin', 'Wellness', 'Array', 'published', 0, 4, NULL, 'hghsgav hdvashvdhjv', 'vhv dsahvdhvasvdhsvas', '2026-06-16 03:06:23', '2026-06-16 06:36:23', '2026-06-16 08:59:24');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
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

INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `image`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Home Wellness', 'home-wellness', NULL, 'active', 0, '2026-06-05 13:32:33', '2026-06-15 14:01:29'),
(13, NULL, 'Personal Care', 'personal-care', NULL, 'active', 1, '2026-06-05 18:18:33', '2026-06-15 14:01:55'),
(14, 1, 'Cleaning Essentials', 'cleaning-essentials', '/api/uploads/categories/cat_51d35282643599f9e800b9d5.png', 'active', 0, '2026-06-15 14:02:26', '2026-07-13 05:01:58'),
(15, 1, 'Home Fragrance', 'home-fragrance', '/api/uploads/categories/cat_7bc121a578a1f4581fd1c103.png', 'active', 0, '2026-06-15 14:04:11', '2026-07-13 05:01:18'),
(16, 1, 'Wellness Kits', 'wellness-kits', NULL, 'active', 0, '2026-06-15 14:04:26', '2026-06-30 16:13:46'),
(17, 13, 'Hair Care', 'hair-care', '/api/uploads/categories/cat_fd8cd9e50dc857ccbad70ab6.png', 'active', 0, '2026-06-15 14:05:41', '2026-07-13 05:01:44'),
(18, 13, 'Skin Care', 'skin-care', NULL, 'active', 0, '2026-06-15 14:05:54', '2026-06-15 14:05:54'),
(19, 13, 'Bath & Body Care', 'bath-body-care', '/api/uploads/categories/cat_a357365085f6340a6d458299.png', 'active', 0, '2026-06-15 14:06:09', '2026-07-13 05:00:42'),
(20, 13, 'Wellness Kits', 'wellness-kits-1', NULL, 'active', 0, '2026-06-15 14:06:25', '2026-06-15 14:06:25');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(10) UNSIGNED DEFAULT NULL,
  `used_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `user_limit` int(10) UNSIGNED DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `type`, `value`, `min_order_amount`, `max_discount`, `usage_limit`, `used_count`, `user_limit`, `expires_at`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'SAVE20', 'percentage', 10.00, NULL, NULL, 5, 3, NULL, NULL, 1, '2026-03-30 17:56:52', '2026-06-12 17:39:36');

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
-- Table structure for table `hero_slides`
--

CREATE TABLE `hero_slides` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `tagline` varchar(255) DEFAULT NULL COMMENT 'e.g. Luxury Streetwear · Est. 2024',
  `cta_primary_text` varchar(100) DEFAULT NULL,
  `cta_primary_link` varchar(255) DEFAULT NULL,
  `cta_secondary_text` varchar(100) DEFAULT NULL,
  `cta_secondary_link` varchar(255) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `mobile_image` varchar(500) DEFAULT NULL,
  `badge_text` varchar(100) DEFAULT NULL COMMENT 'e.g. Limited Drops',
  `badge_icon` varchar(100) DEFAULT NULL COMMENT 'lucide icon name e.g. Crown, Zap',
  `category` enum('men','women','unisex','trending','limited') NOT NULL DEFAULT 'unisex',
  `product_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of linked product IDs' CHECK (json_valid(`product_ids`)),
  `price_label` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hero_slides`
--

INSERT INTO `hero_slides` (`id`, `title`, `subtitle`, `tagline`, `cta_primary_text`, `cta_primary_link`, `cta_secondary_text`, `cta_secondary_link`, `image`, `mobile_image`, `badge_text`, `badge_icon`, `category`, `product_ids`, `price_label`, `is_active`, `sort_order`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
(1, 'BOTANICAL WELLNESS • INSPIRED BY NATURE', 'Premium botanical home and personal care crafted for healthier everyday living.', NULL, 'Shop Now', '/products', 'Explore Collections', '/#collections', '/api/uploads/hero/hero_96a895a32df6e09ce3cf90db.webp', NULL, 'New Arrivals', 'Crown', 'men', NULL, NULL, 1, 0, NULL, NULL, '2026-03-27 20:11:43', '2026-06-30 20:59:21'),
(2, 'AARVIA™ • PURE BOTANICAL CARE', 'Plant-powered essentials for your home and family.', '', 'Shop Now', '/products', 'Explore Collections', '/#collections', '/api/uploads/hero/hero_ee5f5a522ef723ed0d9b532c.webp', NULL, '', 'Timer', 'women', '[]', '', 1, 1, NULL, NULL, '2026-03-27 21:49:03', '2026-06-30 21:00:04');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(180) DEFAULT NULL,
  `inquiry_type` enum('order','bulk','support','custom_design','other') NOT NULL DEFAULT 'other',
  `message` text NOT NULL,
  `preferred_contact` enum('call','whatsapp','email') NOT NULL DEFAULT 'whatsapp',
  `status` enum('new','contacted','converted','closed') NOT NULL DEFAULT 'new',
  `lead_score` enum('hot','warm','cold') NOT NULL DEFAULT 'warm',
  `source` varchar(60) NOT NULL DEFAULT 'website',
  `tags` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `honeypot` varchar(60) DEFAULT NULL,
  `spam` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `name`, `phone`, `email`, `inquiry_type`, `message`, `preferred_contact`, `status`, `lead_score`, `source`, `tags`, `file_path`, `honeypot`, `spam`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Fg designs', '+918886968658', 'fgdesignworld@gmail.com', 'other', 'hello how aree you', 'whatsapp', 'contacted', 'warm', 'website', NULL, NULL, NULL, 0, NULL, '2026-03-28 11:27:01', '2026-03-28 11:53:40'),
(2, 'Fg designs', '+918886968658', 'fgdesignworld@gmail.com', 'other', 'hello', 'call', 'contacted', 'warm', 'website', NULL, NULL, NULL, 0, NULL, '2026-03-28 12:03:15', '2026-03-28 12:04:30');

-- --------------------------------------------------------

--
-- Table structure for table `lead_activities`
--

CREATE TABLE `lead_activities` (
  `id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `action` varchar(80) NOT NULL,
  `meta_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta_json`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lead_activities`
--

INSERT INTO `lead_activities` (`id`, `lead_id`, `action`, `meta_json`, `created_at`) VALUES
(1, 1, 'created', '{\"source\":\"website\"}', '2026-03-28 11:27:01'),
(2, 1, 'followup_added', '{\"type\":\"note\"}', '2026-03-28 11:27:48'),
(3, 1, 'status_changed', '{\"to\":\"closed\"}', '2026-03-28 11:28:54'),
(4, 1, 'status_changed', '{\"to\":\"contacted\"}', '2026-03-28 11:53:40'),
(5, 1, 'followup_added', '{\"type\":\"note\"}', '2026-03-28 11:55:58'),
(6, 2, 'created', '{\"source\":\"website\"}', '2026-03-28 12:03:15'),
(7, 2, 'followup_added', '{\"type\":\"whatsapp\"}', '2026-03-28 12:04:30');

-- --------------------------------------------------------

--
-- Table structure for table `lead_followups`
--

CREATE TABLE `lead_followups` (
  `id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `type` enum('call','whatsapp','email','meeting','note') NOT NULL DEFAULT 'note',
  `notes` text NOT NULL,
  `next_followup_date` date DEFAULT NULL,
  `created_by` varchar(80) DEFAULT 'admin',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lead_followups`
--

INSERT INTO `lead_followups` (`id`, `lead_id`, `type`, `notes`, `next_followup_date`, `created_by`, `created_at`) VALUES
(1, 1, 'note', 'follow uap next dat', '2026-03-29', 'admin', '2026-03-28 11:27:48'),
(2, 1, 'note', 'he will call gain', '2026-03-31', 'admin', '2026-03-28 11:55:58'),
(3, 2, 'whatsapp', 'this was made', '2026-03-29', 'admin', '2026-03-28 12:04:30');

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
(26, 'new_order', 30, 'New order #LHF-689212 from Saikumar Goli — ₹2654', 1, '2026-03-28 09:13:32'),
(27, 'new_order', 31, 'New order #LHF-689287 from Fg designs — ₹2698', 1, '2026-03-28 09:14:47'),
(28, 'new_order', 32, 'New order #LHF-689338 from Fg designs — ₹1349', 1, '2026-03-28 09:15:38'),
(29, 'new_order', 33, 'New order #LHF-689395 from Fg designs — ₹2963', 1, '2026-03-28 09:16:35'),
(30, 'new_order', 34, 'New order #LHF-699987 from Fg designs — ₹4203', 1, '2026-03-28 12:13:07'),
(31, 'new_order', 35, 'New order #LHF-700064 from Fg designs — ₹3654', 1, '2026-03-28 12:14:24'),
(32, 'new_order', 36, 'New order #LHF-700154 from Fg designs — ₹3689', 1, '2026-03-28 12:15:54'),
(33, 'new_order', 37, 'New order #LHF-700301 from Fg designs — ₹4003', 1, '2026-03-28 12:18:21'),
(34, 'new_order', 38, 'New order #LHF-700385 from Fg designs — ₹3154', 1, '2026-03-28 12:19:45'),
(35, 'new_order', 39, 'New order #LHF-701119 from Fg designs — ₹4203', 1, '2026-03-28 12:31:59'),
(36, 'new_order', 40, 'New order #UNI-873713 from Fg designs — ₹1060', 1, '2026-03-30 12:28:33'),
(37, 'new_order', 41, 'New order #UNI-874790 from Fg designs — ₹2154', 1, '2026-03-30 12:46:30'),
(38, 'new_order', 42, 'New order #UNI-875784 from Fg designs — ₹1938.6', 1, '2026-03-30 13:03:04'),
(39, 'new_order', 43, 'New order #UNI-876385 from Fg designs — ₹2082.6', 1, '2026-03-30 13:13:05'),
(40, 'new_order', 44, 'New order #UNI-894357 from Fg designs — ₹660', 1, '2026-03-30 18:12:37'),
(41, 'new_order', 45, 'New order #UNI-894618 from Fg designs — ₹546', 1, '2026-03-30 18:16:58'),
(42, 'new_order', 47, 'New order #UNI-901763 from Fg designs — ₹2698', 1, '2026-03-30 20:16:03'),
(43, 'new_order', 48, 'New order #UNI-902303 from Fg designs — ₹5396', 1, '2026-03-30 20:25:03'),
(44, 'new_order', 49, 'New order #UNI-902784 from Fg designs — ₹5396', 1, '2026-03-30 20:33:04'),
(45, 'new_order', 50, 'New order #UNI-903400 from Fg designs — ₹4047', 1, '2026-03-30 20:43:20'),
(46, 'new_order', 51, 'New order #UNI-903681 from Fg designs — ₹3758', 1, '2026-03-30 20:48:01'),
(47, 'new_order', 52, 'New order #UNI-927725 from Fg designs — ₹855', 1, '2026-03-31 03:28:45'),
(48, 'new_order', 53, 'New order #UNI-928043 from Fg designs — ₹600', 1, '2026-03-31 03:34:03'),
(49, 'new_order', 54, 'New order #UNI-934564 from Fg designs — ₹1660', 1, '2026-03-31 05:22:44'),
(50, 'new_order', 55, 'New order #UNI-939915 from Fg designs — ₹1610', 1, '2026-03-31 06:51:55'),
(51, 'new_order', 56, 'New order #UNI-940200 from Fg designs — ₹1025', 1, '2026-03-31 06:56:40'),
(52, 'new_order', 57, 'New order #UNI-940652 from Fg designs — ₹855', 1, '2026-03-31 07:04:12'),
(53, 'new_order', 58, 'New order #UNI-974072 from Fg designs — ₹2500', 1, '2026-03-31 16:21:12'),
(54, 'new_order', 59, 'New order #UNI-626720 from Fg designs — ₹1349', 1, '2026-04-08 05:38:40'),
(55, 'new_order', 60, 'New order #UNI-627290 from Fg designs — ₹1614', 1, '2026-04-08 05:48:10'),
(56, 'new_order', 61, 'New order #UNI-627409 from Fg designs — ₹1040', 1, '2026-04-08 05:50:09'),
(57, 'new_order', 62, 'New order #UNI-627838 from Fg designs — ₹1879', 1, '2026-04-08 05:57:18'),
(58, 'new_order', 63, 'New order #UNI-190565 from Fg designs — ₹2963', 1, '2026-04-26 08:02:45'),
(59, 'new_order', 64, 'Paid order #UNI-326896 from Nikhil Donimiddela — ₹325.00', 1, '2026-06-01 15:15:38'),
(60, 'new_order', 65, 'Paid order #UNI-409936 from Nikhil Donimiddela — ₹285.00', 1, '2026-06-02 14:19:39'),
(61, 'new_order', 67, 'Paid order #UNI-766779 from Nikhil Donimiddela — ₹1,598.00', 0, '2026-06-06 17:26:47'),
(62, 'new_order', 68, 'Paid order #KK-767504 from Nikhil Donimiddela — ₹859.00', 0, '2026-06-06 17:38:50'),
(63, 'new_order', 71, 'Paid order #KK-835642 from Nikhil Donimiddela — ₹1,598.00', 0, '2026-06-30 16:07:54');

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
  `payment_status` enum('pending','paid','failed') DEFAULT NULL COMMENT 'NULL=COD; pending/paid/failed=Razorpay online payment',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_ref` varchar(100) DEFAULT NULL,
  `razorpay_order_id` varchar(100) DEFAULT NULL COMMENT 'Razorpay order ID created via orders API',
  `razorpay_payment_id` varchar(100) DEFAULT NULL COMMENT 'Razorpay payment ID from checkout callback',
  `razorpay_signature` varchar(255) DEFAULT NULL COMMENT 'HMAC-SHA256 signature verified server-side',
  `paid_at` timestamp NULL DEFAULT NULL COMMENT 'UTC timestamp when payment was confirmed',
  `coupon_code` varchar(50) DEFAULT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `invoice_number`, `customer_name`, `phone`, `address`, `city`, `pincode`, `notes`, `subtotal`, `delivery`, `total`, `status`, `payment_status`, `created_at`, `updated_at`, `deleted_at`, `payment_method`, `payment_ref`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `paid_at`, `coupon_code`, `discount_amount`) VALUES
(39, 'LHF-701119', 'Fg designs', '8886968625', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 4203.00, 0.00, 4203.00, 'pending', NULL, '2026-03-28 12:31:59', '2026-06-05 13:13:51', '2026-06-05 13:13:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(40, 'UNI-873713', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 1060.00, 0.00, 1060.00, 'pending', NULL, '2026-03-30 12:28:33', '2026-06-05 13:13:57', '2026-06-05 13:13:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(41, 'UNI-874790', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 2154.00, 0.00, 2154.00, 'pending', NULL, '2026-03-30 12:46:30', '2026-06-05 12:55:40', '2026-06-05 12:55:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(42, 'UNI-875784', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 2154.00, 0.00, 1938.60, 'pending', NULL, '2026-03-30 13:03:04', '2026-06-05 12:55:47', '2026-06-05 12:55:47', NULL, NULL, NULL, NULL, NULL, NULL, 'SAVE20', 215.40),
(43, 'UNI-876385', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 2314.00, 0.00, 2082.60, 'pending', NULL, '2026-03-30 13:13:05', '2026-06-05 12:55:53', '2026-06-05 12:55:53', NULL, NULL, NULL, NULL, NULL, NULL, 'SAVE20', 231.40),
(44, 'UNI-894357', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 600.00, 60.00, 660.00, 'pending', NULL, '2026-03-30 18:12:37', '2026-06-05 12:55:59', '2026-06-05 12:55:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(45, 'UNI-894618', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 540.00, 60.00, 546.00, 'delivered', NULL, '2026-03-30 18:16:58', '2026-06-05 12:56:04', '2026-06-05 12:56:04', NULL, NULL, NULL, NULL, NULL, NULL, 'SAVE20', 54.00),
(47, 'UNI-901763', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 2698.00, 0.00, 2698.00, 'cancelled', NULL, '2026-03-30 20:16:03', '2026-06-05 12:56:09', '2026-06-05 12:56:09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(48, 'UNI-902303', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 5396.00, 0.00, 5396.00, 'pending', NULL, '2026-03-30 20:25:03', '2026-06-05 12:56:14', '2026-06-05 12:56:14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(49, 'UNI-902784', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 5396.00, 0.00, 5396.00, 'delivered', NULL, '2026-03-30 20:33:04', '2026-06-05 12:56:20', '2026-06-05 12:56:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(50, 'UNI-903400', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 4047.00, 0.00, 4047.00, 'pending', NULL, '2026-03-30 20:43:20', '2026-06-05 12:56:25', '2026-06-05 12:56:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(51, 'UNI-903681', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 3758.00, 0.00, 3758.00, 'pending', NULL, '2026-03-30 20:48:01', '2026-06-05 12:54:10', '2026-06-05 12:54:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(52, 'UNI-927725', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 795.00, 60.00, 855.00, 'pending', NULL, '2026-03-31 03:28:45', '2026-06-05 12:54:20', '2026-06-05 12:54:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(53, 'UNI-928043', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 540.00, 60.00, 600.00, 'pending', NULL, '2026-03-31 03:34:03', '2026-06-05 12:54:29', '2026-06-05 12:54:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(54, 'UNI-934564', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 1660.00, 0.00, 1660.00, 'pending', NULL, '2026-03-31 05:22:44', '2026-06-05 12:54:37', '2026-06-05 12:54:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(55, 'UNI-939915', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 1610.00, 0.00, 1610.00, 'cancelled', NULL, '2026-03-31 06:51:55', '2026-06-05 12:54:43', '2026-06-05 12:54:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(56, 'UNI-940200', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 965.00, 60.00, 1025.00, 'cancelled', NULL, '2026-03-31 06:56:40', '2026-06-05 12:54:49', '2026-06-05 12:54:49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(57, 'UNI-940652', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 795.00, 60.00, 855.00, 'cancelled', NULL, '2026-03-31 07:04:12', '2026-06-05 12:54:55', '2026-06-05 12:54:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(58, 'UNI-974072', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 2500.00, 0.00, 2500.00, 'cancelled', NULL, '2026-03-31 16:21:12', '2026-06-05 12:55:03', '2026-06-05 12:55:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(59, 'UNI-626720', 'Fg designs', '8886968655', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 1349.00, 0.00, 1349.00, 'cancelled', NULL, '2026-04-08 05:38:40', '2026-06-05 12:55:08', '2026-06-05 12:55:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(60, 'UNI-627290', 'Fg designs', '8886968658', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 1614.00, 0.00, 1614.00, 'cancelled', NULL, '2026-04-08 05:48:10', '2026-06-05 12:56:32', '2026-06-05 12:56:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(61, 'UNI-627409', 'Fg designs', '8886968658', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 1040.00, 0.00, 1040.00, 'cancelled', NULL, '2026-04-08 05:50:09', '2026-06-05 12:56:37', '2026-06-05 12:56:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(62, 'UNI-627838', 'Fg designs', '8886968658', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '500038', '', 1879.00, 0.00, 1879.00, 'pending', NULL, '2026-04-08 05:57:18', '2026-06-05 12:56:43', '2026-06-05 12:56:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(63, 'UNI-190565', 'Fg designs', '9100800265', 'H.No: 94/B\nBK Guda Rd\nnear Community Hall\nSanjeeva Reddy Nagar', 'Hyderabad', '523155', '', 2963.00, 0.00, 2963.00, 'pending', NULL, '2026-04-26 08:02:45', '2026-06-05 12:56:51', '2026-06-05 12:56:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00),
(64, 'UNI-326896', 'Nikhil Donimiddela', '9100800265', 'hydebad', 'hyderabd', '523155', 'hello', 265.00, 60.00, 325.00, 'confirmed', 'paid', '2026-06-01 15:14:56', '2026-06-05 12:56:57', '2026-06-05 12:56:57', 'razorpay', NULL, 'order_SwPegJs6rdGJpp', 'pay_SwPf4VRI5GEtZk', '1d95e57e834b85f69947289ae2f68a66739ddf258f2e11b863fb5c083ec0d676', '2026-06-01 15:15:38', NULL, 0.00),
(65, 'UNI-409936', 'Nikhil Donimiddela', '9100800265', 'hydebad', 'hyderabd', '523155', 'hello', 225.00, 60.00, 285.00, 'confirmed', 'paid', '2026-06-02 14:18:56', '2026-06-05 12:57:02', '2026-06-05 12:57:02', 'razorpay', NULL, 'order_SwnEbryFZAnkPb', 'pay_SwnF3jbce2FfuV', '5f61bfee5f04bbd71a089b7a584388c9507713b2e08585d22760f0ef3e252774', '2026-06-02 14:19:39', NULL, 0.00),
(66, 'UNI-766327', 'Nikhil Donimiddela', '9100800265', 'hydebad', 'hyderabd', '532155', 'hello', 1598.00, 0.00, 1598.00, 'cancelled', 'failed', '2026-06-06 17:18:47', '2026-06-06 17:19:02', NULL, 'razorpay', NULL, 'order_SyQR2s1iP5BdBh', NULL, NULL, NULL, NULL, 0.00),
(67, 'UNI-766779', 'Nikhil Donimiddela', '9100800265', 'hydebad', 'hyderabd', '532155', 'hello', 1598.00, 0.00, 1598.00, 'confirmed', 'paid', '2026-06-06 17:26:19', '2026-06-06 17:26:47', NULL, 'razorpay', NULL, 'order_SyQZ0182UbIjMa', 'pay_SyQZ8jom96veAo', '7564953b52e19bc2b4715298b7aa1ae0e423cfdf9aa9ca4b945ddd5fda018308', '2026-06-06 17:26:47', NULL, 0.00),
(68, 'KK-767504', 'Nikhil Donimiddela', '9100800265', 'hydebad', 'hyderabd', '523155', '', 799.00, 60.00, 859.00, 'confirmed', 'paid', '2026-06-06 17:38:24', '2026-06-06 17:38:50', NULL, 'razorpay', NULL, 'order_SyQlmP7zMcbk5V', 'pay_SyQlwKJj9M6Nrc', '5d2b9279aab6980c032ade4ec1cc5d8100b8b8a1a16dd8d738030515d988aa1a', '2026-06-06 17:38:50', NULL, 0.00),
(70, 'KK-843580', 'Nikhil Donimiddela', '9100800265', 'hydebad', 'hyderabd', '532155', '', 799.00, 60.00, 859.00, 'pending', 'pending', '2026-06-07 14:46:20', '2026-06-07 14:46:21', NULL, 'razorpay', NULL, 'order_SymN8Kso1YUVOW', NULL, NULL, NULL, NULL, 0.00),
(71, 'KK-835642', 'Nikhil Donimiddela', '9100800265', 'hydebad', 'hyderabd', '532155', '', 1598.00, 0.00, 1598.00, 'confirmed', 'paid', '2026-06-30 16:07:22', '2026-06-30 16:07:54', NULL, 'razorpay', NULL, 'order_T7u2YW6ape72Q3', 'pay_T7u2o6nCe3RENZ', 'aafcbbccceab4700d86d2083dccb97f465059ba3ced119476d7adbdfdd144a16', '2026-06-30 16:07:54', NULL, 0.00);

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
  `size_label` varchar(50) DEFAULT NULL COMMENT 'Selected size variant label (e.g. M, XL)',
  `color_name` varchar(100) DEFAULT NULL COMMENT 'Selected color variant name (e.g. Navy, Black)',
  `image_url` varchar(500) DEFAULT NULL COMMENT 'Product image URL at time of order',
  `qty` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `weight`, `size_label`, `color_name`, `image_url`, `qty`, `price`, `original_price`, `discount_percent`, `total`) VALUES
(135, 39, NULL, 'sai kuamr', 'XS', NULL, NULL, '/api/uploads/products/product_69c6de1a25ff8.jpeg', 2, 1349.00, NULL, NULL, 2698.00),
(136, 39, NULL, 'somes', 'M', NULL, NULL, '/api/uploads/products/product_69c6cbec419ec.png', 1, 265.00, NULL, NULL, 265.00),
(137, 39, NULL, 'lovely', 'xs', NULL, NULL, '/api/uploads/products/product_69c6b8c51ef9d.jpg', 1, 540.00, NULL, NULL, 540.00),
(138, 39, NULL, 'hello how are ', 'md', NULL, NULL, '/api/uploads/products/product_69c5808cbc4ac.jpeg', 1, 700.00, NULL, NULL, 700.00),
(139, 40, NULL, 'somes', 'S', NULL, NULL, '/api/uploads/products/product_69c6cbec419ec.png', 2, 265.00, NULL, NULL, 530.00),
(140, 40, NULL, 'somes', 'sm', NULL, NULL, '/api/uploads/products/product_69c6cbec419ec.png', 1, 265.00, NULL, NULL, 265.00),
(141, 40, NULL, 'somes', 'sm', 'S', NULL, '/api/uploads/products/product_69c6cbec419ec.png', 1, 265.00, NULL, NULL, 265.00),
(142, 41, NULL, 'somes', 'S', NULL, NULL, '/api/uploads/products/product_69c6cbec419ec.png', 1, 265.00, NULL, NULL, 265.00),
(143, 41, NULL, 'sai kuamr', 'XS', NULL, NULL, '/api/uploads/products/product_69c6de1a25ff8.jpeg', 1, 1349.00, NULL, NULL, 1349.00),
(144, 41, NULL, 'lovely', 'ls', NULL, NULL, '/api/uploads/products/product_69c6b8c51ef9d.jpg', 1, 540.00, NULL, NULL, 540.00),
(145, 42, NULL, 'sai kuamr', 'XS/Black', NULL, NULL, '/api/uploads/products/product_69c6de3a60b6c.jpg', 1, 1349.00, NULL, NULL, 1349.00),
(146, 42, NULL, 'somes', 'M/ehl', NULL, NULL, '/api/uploads/products/product_69c6d6e7b28a4.jpg', 1, 265.00, NULL, NULL, 265.00),
(147, 42, NULL, 'lovely', 'ls', NULL, NULL, '/api/uploads/products/product_69c6b8c51ef9d.jpg', 1, 540.00, NULL, NULL, 540.00),
(148, 43, NULL, 'sai kuamr', 'XS/Black', NULL, NULL, '/api/uploads/products/product_69c6de3a60b6c.jpg', 1, 1349.00, 1499.00, 10.00, 1349.00),
(149, 43, NULL, 'somes', 'xs/Grey', NULL, NULL, '/api/uploads/products/product_69c6d6ecf2d53.png', 1, 265.00, NULL, NULL, 265.00),
(150, 43, NULL, 'hello how are ', 'md', NULL, NULL, '/api/uploads/products/product_69c5808cbc4ac.jpeg', 1, 700.00, NULL, NULL, 700.00),
(151, 44, NULL, 'hello how are ', 'xs', NULL, NULL, '/api/uploads/products/product_69c5808cbc4ac.jpeg', 1, 600.00, NULL, NULL, 600.00),
(152, 45, NULL, 'lovely', 'xs', NULL, NULL, '/api/uploads/products/product_69c6b8c51ef9d.jpg', 1, 540.00, 600.00, 10.00, 540.00),
(154, 47, NULL, 'sai kuamr', '1kg', 'XS', 'Black', '/api/uploads/products/product_69c6de3a60b6c.jpg', 2, 1349.00, 1499.00, 10.00, 2698.00),
(155, 48, NULL, 'sai kuamr', '1kg', 'XS', 'Black', '/api/uploads/products/product_69c6de3a60b6c.jpg', 4, 1349.00, 1499.00, 10.00, 5396.00),
(156, 49, NULL, 'sai kuamr', '1kg', 'XS', 'Black', '/api/uploads/products/product_69c6de3a60b6c.jpg', 4, 1349.00, 1499.00, 10.00, 5396.00),
(157, 50, NULL, 'sai kuamr', '1kg', 'S', 'ehl', '/api/uploads/products/product_69c6de414fe3d.jpg', 1, 1349.00, 1499.00, 10.00, 1349.00),
(158, 50, NULL, 'sai kuamr', '1kg', 'S', 'Black', '/api/uploads/products/product_69c6de3a60b6c.jpg', 2, 1349.00, 1499.00, 10.00, 2698.00),
(159, 51, NULL, 'sai kuamr', '1kg', 'S', 'Black', '/api/uploads/products/product_69c6de3a60b6c.jpg', 2, 1349.00, 1499.00, 10.00, 2698.00),
(160, 51, NULL, 'somes', 'sm', 'xs', 'white', '/api/uploads/products/product_69c6cbd5261d5.png', 4, 265.00, NULL, NULL, 1060.00),
(161, 52, NULL, 'somes', 'sm', 'xs', 'white', '/api/uploads/products/product_69c6cbd5261d5.png', 1, 265.00, NULL, NULL, 265.00),
(162, 52, NULL, 'somes', 'sm', 'xs', 'Grey', '/api/uploads/products/product_69c6d6ecf2d53.png', 2, 265.00, NULL, NULL, 530.00),
(163, 53, NULL, 'lovely', 'sm', 'ls', NULL, '/api/uploads/products/product_69c6b8c51ef9d.jpg', 1, 540.00, 600.00, 10.00, 540.00),
(164, 54, NULL, 'hello how are ', 'sm', 'xs', 'Black', '/api/uploads/products/product_69c6b2adb570c.png', 1, 600.00, NULL, NULL, 600.00),
(165, 54, NULL, 'somes', 'sm', 'xs', 'white', '/api/uploads/products/product_69c6cbd5261d5.png', 4, 265.00, NULL, NULL, 1060.00),
(166, 55, NULL, 'somes', 'sm', 'xs', 'ehl', '/api/uploads/products/product_69c6d6e7b28a4.jpg', 2, 265.00, NULL, NULL, 530.00),
(167, 55, NULL, 'lovely', 'sm', 'ls', NULL, '/api/uploads/products/product_69c6b8c51ef9d.jpg', 2, 540.00, 600.00, 10.00, 1080.00),
(168, 56, NULL, 'somes', 'sm', 'xs', 'Grey', '/api/uploads/products/product_69c6d6ecf2d53.png', 1, 265.00, NULL, NULL, 265.00),
(169, 56, NULL, 'hello how are ', 'sm', 'md', NULL, '/api/uploads/products/product_69c5808cbc4ac.jpeg', 1, 700.00, NULL, NULL, 700.00),
(170, 57, NULL, 'somes', 'sm', 'xs', 'white', '/api/uploads/products/product_69c6cbd5261d5.png', 2, 265.00, NULL, NULL, 530.00),
(171, 57, NULL, 'somes', 'sm', 'xs', 'ehl', '/api/uploads/products/product_69c6d6e7b28a4.jpg', 1, 265.00, NULL, NULL, 265.00),
(172, 58, NULL, 'cloths', '1kg', 'S', NULL, '/api/uploads/products/product_69c56e3ab3519.jpeg', 5, 500.00, NULL, NULL, 2500.00),
(173, 59, NULL, 'sai kuamr', '1kg', 'XS', 'ehl', '/api/uploads/products/product_69c6de414fe3d.jpg', 1, 1349.00, 1499.00, 10.00, 1349.00),
(174, 60, NULL, 'sai kuamr', '1kg', 'XS', 'Black', '/api/uploads/products/product_69c6de3a60b6c.jpg', 1, 1349.00, 1499.00, 10.00, 1349.00),
(175, 60, NULL, 'somes', 'sm', 'xs', 'Grey', '/api/uploads/products/product_69c6d6ecf2d53.png', 1, 265.00, NULL, NULL, 265.00),
(176, 61, NULL, 'lovely', 'sm', 'ls', NULL, '/api/uploads/products/product_69c6b8c51ef9d.jpg', 1, 540.00, 600.00, 10.00, 540.00),
(177, 61, NULL, 'cloths', '1kg', 'XS', NULL, '/api/uploads/products/product_69c56e3ab3519.jpeg', 1, 500.00, NULL, NULL, 500.00),
(178, 62, NULL, 'sai kuamr', '1kg', 'XS', 'ehl', '/api/uploads/products/product_69c6de414fe3d.jpg', 1, 1349.00, 1499.00, 10.00, 1349.00),
(179, 62, NULL, 'somes', 'sm', 'xs', 'ehl', '/api/uploads/products/product_69c6d6e7b28a4.jpg', 1, 265.00, NULL, NULL, 265.00),
(180, 62, NULL, 'somes', 'sm', 'xs', 'white', '/api/uploads/products/product_69c6cbd5261d5.png', 1, 265.00, NULL, NULL, 265.00),
(181, 63, NULL, 'sai kuamr', '1kg', 'S', 'ehl', '/api/uploads/products/product_69c6de414fe3d.jpg', 2, 1349.00, 1499.00, 10.00, 2698.00),
(182, 63, NULL, 'somes', 'sm', 'xs', 'ehl', '/api/uploads/products/product_69c6d6e7b28a4.jpg', 1, 265.00, NULL, NULL, 265.00),
(183, 64, NULL, 'somes', 'sm', 'xs', 'white', '/api/uploads/products/product_69c6cbd5261d5.png', 1, 265.00, NULL, NULL, 265.00),
(184, 65, NULL, 'sai kuamr', '1kg', '250', NULL, '/api/uploads/products/product_69c6de1a25ff8.jpeg', 1, 225.00, 250.00, 10.00, 225.00),
(185, 66, 50, 'Ashwagandha Cookies', '', NULL, NULL, '/api/uploads/products/product_0283a572f6af8fd1d9f8ef7c.png', 2, 799.00, 1299.00, 38.49, 1598.00),
(186, 67, 50, 'Ashwagandha Cookies', '', NULL, NULL, '/api/uploads/products/product_0283a572f6af8fd1d9f8ef7c.png', 2, 799.00, 1299.00, 38.49, 1598.00),
(187, 68, 50, 'Ashwagandha Cookies', '', NULL, NULL, '/api/uploads/products/product_0283a572f6af8fd1d9f8ef7c.png', 1, 799.00, 1299.00, 38.49, 799.00),
(189, 70, 50, 'Ashwagandha Cookies', '', NULL, NULL, '/api/uploads/products/product_0283a572f6af8fd1d9f8ef7c.png', 1, 799.00, 1299.00, 38.49, 799.00),
(190, 71, 50, 'Ashwagandha Cookies', '', NULL, NULL, '/api/uploads/products/product_0283a572f6af8fd1d9f8ef7c.png', 2, 799.00, 1299.00, 38.49, 1598.00);

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

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'men',
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
  `variants_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Size-based pricing: [{label, price}]' CHECK (json_valid(`variants_json`)),
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `category`, `category_id`, `weight`, `price`, `discount_price`, `image`, `gallery_images`, `rating`, `bestseller`, `is_veg`, `is_homemade`, `variants`, `variants_json`, `status`, `created_at`, `updated_at`, `sort_order`) VALUES
(49, 'Shilajit Cookies', 'shilajit-cookies', '<p>Shilajit Cookies</p><p><strong>Premium Shilajit Wellness Cookies</strong></p><p>Experience the power of nature with our Shilajit Cookies, crafted using premium ingredients and enriched with authentic Shilajit. Designed to support daily vitality, stamina, and overall wellness while delivering a delicious crunchy taste.</p><p><strong>Benefits:</strong></p><ul><li><p>Supports energy and endurance</p></li><li><p>Rich in natural nutrients</p></li><li><p>No refined sugar</p></li><li><p>Premium wellness snack</p></li></ul><p></p>', 'cleaning-essentials', NULL, '', 1499.00, 999.00, '/api/uploads/products/product_a561d71061347cfa406b2a6c.jpg', NULL, 0.0, 1, 1, 1, NULL, NULL, 'active', '2026-06-05 18:01:41', '2026-06-30 15:41:43', 0),
(50, 'Ashwagandha Cookies', 'ashwagandha-cookies', '<p>Ashwagandha Cookies</p><p><strong>Premium Ashwagandha Wellness Cookies</strong></p><p>A perfect blend of taste and wellness, these cookies are infused with Ashwagandha, a renowned adaptogenic herb known for supporting stress management and mental balance. Enjoy a wholesome snack that nourishes both body and mind.</p><p><strong>Benefits:</strong></p><ul><li><p>Supports stress management</p></li><li><p>Helps maintain focus and balance</p></li><li><p>Made with premium ingredients</p></li><li><p>Healthy guilt-free snacking</p></li></ul><p></p>', 'cleaning-essentials', NULL, '', 1299.00, 799.00, '/api/uploads/products/product_d0f0fe520a854b4d596154fe.jpg', NULL, 0.0, 1, 1, 1, NULL, NULL, 'active', '2026-06-05 18:21:14', '2026-06-30 15:41:14', 0),
(51, 'floor cleaner', 'whey-protein-cookies', '<p>Whey Protein Cookies</p><p><strong>Premium Whey Protein Cookies</strong></p><p>Fuel your active lifestyle with protein-rich cookies crafted for fitness enthusiasts and health-conscious individuals. Packed with quality whey protein, these cookies help support muscle recovery while satisfying your cravings.</p><p><strong>Benefits:</strong></p><ul><li><p>High-quality whey protein</p></li><li><p>Supports muscle recovery</p></li><li><p>Great post-workout snack</p></li><li><p>Delicious and nutritious</p></li></ul><p></p>', 'cleaning-essentials', NULL, '', 1499.00, 999.00, '/api/uploads/products/product_709d07ab1914a6eaf01430fd.jpg', NULL, 0.0, 1, 1, 1, NULL, NULL, 'active', '2026-06-05 18:23:59', '2026-06-30 15:40:45', 0);

-- --------------------------------------------------------

--
-- Table structure for table `product_variant_inventory`
--

CREATE TABLE `product_variant_inventory` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size` varchar(50) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `sku` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_variant_inventory`
--

INSERT INTO `product_variant_inventory` (`id`, `product_id`, `size`, `color`, `stock`, `sku`, `created_at`, `updated_at`) VALUES
(107, 46, 'ls', NULL, 8, NULL, '2026-03-30 18:54:52', '2026-04-08 05:55:51'),
(108, 46, 'xs', NULL, 5, NULL, '2026-03-30 18:54:52', '2026-03-30 18:54:52'),
(109, 46, 'sd', NULL, 0, NULL, '2026-03-30 18:54:52', '2026-03-30 18:54:52'),
(138, 45, 'xs', 'Black', 4, NULL, '2026-03-30 19:00:33', '2026-03-31 05:22:44'),
(139, 45, 'xs', 'Green', 0, NULL, '2026-03-30 19:00:33', '2026-03-30 19:00:33'),
(140, 45, 'md', 'Black', 0, NULL, '2026-03-30 19:00:33', '2026-03-30 19:00:33'),
(141, 45, 'md', 'Green', 0, NULL, '2026-03-30 19:00:33', '2026-03-30 19:00:33'),
(142, 45, 'ls', 'Black', 0, NULL, '2026-03-30 19:00:33', '2026-03-30 19:00:33'),
(143, 45, 'ls', 'Green', 0, NULL, '2026-03-30 19:00:33', '2026-03-30 19:00:33'),
(144, 45, 'cm', 'Black', 0, NULL, '2026-03-30 19:00:33', '2026-03-30 19:00:33'),
(145, 45, 'cm', 'Green', 0, NULL, '2026-03-30 19:00:33', '2026-03-30 19:00:33'),
(146, 45, 'lm', 'Black', 0, NULL, '2026-03-30 19:00:33', '2026-03-30 19:00:33'),
(147, 45, 'lm', 'Green', 0, NULL, '2026-03-30 19:00:33', '2026-03-30 19:00:33'),
(149, 44, NULL, NULL, 5, NULL, '2026-03-30 19:01:11', '2026-03-30 19:01:11'),
(150, 44, 'XS', NULL, 5, NULL, '2026-03-30 19:01:11', '2026-04-08 05:55:19'),
(151, 44, 'S', NULL, 5, NULL, '2026-03-30 19:01:11', '2026-04-08 05:55:36'),
(184, 47, 'xs', 'white', 8, NULL, '2026-03-31 07:02:27', '2026-06-01 15:15:38'),
(185, 47, 'xs', 'ehl', 3, NULL, '2026-03-31 07:02:27', '2026-04-26 08:02:45'),
(186, 47, 'xs', 'Grey', 3, NULL, '2026-03-31 07:02:27', '2026-04-08 05:55:45'),
(187, 47, 'S', 'white', 0, NULL, '2026-03-31 07:02:27', '2026-03-31 07:02:27'),
(188, 47, 'S', 'ehl', 0, NULL, '2026-03-31 07:02:27', '2026-03-31 07:02:27'),
(189, 47, 'S', 'Grey', 0, NULL, '2026-03-31 07:02:27', '2026-03-31 07:02:27'),
(190, 47, 'M', 'white', 0, NULL, '2026-03-31 07:02:27', '2026-03-31 07:02:27'),
(191, 47, 'M', 'ehl', 0, NULL, '2026-03-31 07:02:27', '2026-03-31 07:02:27'),
(192, 47, 'M', 'Grey', 0, NULL, '2026-03-31 07:02:27', '2026-03-31 07:02:27'),
(193, 47, 'L', 'white', 0, NULL, '2026-03-31 07:02:27', '2026-03-31 07:02:27'),
(194, 47, 'L', 'ehl', 0, NULL, '2026-03-31 07:02:27', '2026-03-31 07:02:27'),
(195, 47, 'L', 'Grey', 0, NULL, '2026-03-31 07:02:27', '2026-03-31 07:02:27'),
(196, 48, 'S', 'Black', 5, NULL, '2026-06-01 16:27:15', '2026-06-01 16:27:15'),
(197, 48, 'S', 'ehl', 2, NULL, '2026-06-01 16:27:15', '2026-06-01 16:27:15'),
(198, 48, 'XS', 'Black', 10, NULL, '2026-06-01 16:27:15', '2026-06-01 16:27:15'),
(199, 48, 'XS', 'ehl', 9, NULL, '2026-06-01 16:27:15', '2026-06-01 16:27:15'),
(200, 48, '250', NULL, 99, NULL, '2026-06-01 16:27:15', '2026-06-02 14:19:39'),
(201, 49, NULL, NULL, 100, NULL, '2026-06-05 18:06:38', '2026-06-05 18:06:38'),
(202, 50, NULL, NULL, 95, NULL, '2026-06-05 18:21:29', '2026-06-30 16:07:54'),
(203, 52, NULL, NULL, 100, NULL, '2026-06-06 14:16:46', '2026-06-06 14:16:46'),
(207, 51, NULL, NULL, 100, NULL, '2026-06-30 15:04:25', '2026-06-30 15:04:25'),
(208, 51, '100 g', NULL, 100, NULL, '2026-06-30 15:04:25', '2026-06-30 15:04:25');

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
(10, 50, 'hello', 'hello@gmail.com', 5, 'djd dydyufu vhkvhjgvhjcudtux', NULL, 'pending', 0, NULL, '581a5d52a0577dd9ed1352b25b8b51dffc09361986824eed093dcc5260f80453', '::1', '2026-06-30 16:02:08', '2026-06-30 16:02:08');

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
(1, 'site_name', 'AARVIA', 'general', '2026-06-15 13:45:46'),
(2, 'site_tagline', 'Ancient Wellness • Modern Indulgence', 'general', '2026-06-06 17:35:58'),
(3, 'currency_symbol', '₹', 'general', '2026-03-23 17:15:00'),
(4, 'logo_url', '/api/uploads/branding/logo_d0920b2598fd48f640c7bbc6.png', 'general', '2026-06-15 09:00:10'),
(5, 'favicon_url', '/api/uploads/branding/logo_43ddd53edb2373a457e1aff0.png', 'general', '2026-06-15 09:00:53'),
(6, 'phone', '+91 949 420 3632', 'contact', '2026-06-05 17:13:48'),
(7, 'whatsapp', '+91 949 420 3632', 'contact', '2026-06-05 17:13:48'),
(8, 'email', 'info@koffeekup.in', 'contact', '2026-06-05 17:13:48'),
(9, 'address', '1st Floor, Oriental Plaza, SBH Colony, Sri Nagar, Yousufguda, Hyderabad, Telangana, India - 500073.', 'contact', '2026-06-05 17:13:48'),
(10, 'social_facebook', 'http://localhost:3000/shop', 'social', '2026-06-15 13:44:43'),
(11, 'social_instagram', 'http://localhost:3000/shop', 'social', '2026-06-15 13:44:43'),
(12, 'social_youtube', 'http://localhost:3000/shop', 'social', '2026-06-15 13:44:43'),
(13, 'social_twitter', 'http://localhost:3000/shop', 'social', '2026-06-15 13:44:43'),
(14, 'theme_color', '#fab700', 'branding', '2026-06-15 08:44:18'),
(15, 'header_bg', NULL, 'branding', '2026-03-23 13:52:54'),
(16, 'footer_bg', NULL, 'branding', '2026-03-23 13:52:54'),
(17, 'font_heading', 'Playfair Display', 'typography', '2026-03-23 17:06:47'),
(18, 'font_body', 'Poppins', 'typography', '2026-03-23 13:52:54'),
(472, 'razorpay_display_name', 'Koffekup', 'payment', '2026-06-02 14:18:21'),
(473, 'razorpay_key_id', 'rzp_test_SwOS7AwOBuOPUM', 'payment', '2026-06-02 14:18:21'),
(474, 'razorpay_key_secret', 'xXq982NwF9EtKkxmcpaYPYwp', 'payment', '2026-06-02 14:18:21'),
(576, 'cod_enabled', '0', 'payment', '2026-06-06 17:25:45');

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
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_featured` (`featured`),
  ADD KEY `idx_published` (`published_at`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_categories_parent_id` (`parent_id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `delivery_rules`
--
ALTER TABLE `delivery_rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hero_slides`
--
ALTER TABLE `hero_slides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_sort_order` (`sort_order`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `lead_activities`
--
ALTER TABLE `lead_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lead` (`lead_id`);

--
-- Indexes for table `lead_followups`
--
ALTER TABLE `lead_followups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lead` (`lead_id`),
  ADD KEY `idx_next` (`next_followup_date`);

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
  ADD KEY `idx_payment_method` (`payment_method`),
  ADD KEY `idx_orders_razorpay_order_id` (`razorpay_order_id`),
  ADD KEY `idx_orders_payment_status` (`payment_status`);

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
-- Indexes for table `product_variant_inventory`
--
ALTER TABLE `product_variant_inventory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_variant` (`product_id`,`size`,`color`),
  ADD KEY `idx_product` (`product_id`);

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
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `delivery_rules`
--
ALTER TABLE `delivery_rules`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hero_slides`
--
ALTER TABLE `hero_slides`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lead_activities`
--
ALTER TABLE `lead_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `lead_followups`
--
ALTER TABLE `lead_followups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=191;

--
-- AUTO_INCREMENT for table `popups`
--
ALTER TABLE `popups`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `product_variant_inventory`
--
ALTER TABLE `product_variant_inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=209;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `seo`
--
ALTER TABLE `seo`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=724;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lead_activities`
--
ALTER TABLE `lead_activities`
  ADD CONSTRAINT `lead_activities_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_followups`
--
ALTER TABLE `lead_followups`
  ADD CONSTRAINT `lead_followups_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

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
