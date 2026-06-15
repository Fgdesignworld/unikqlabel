-- ============================================================
-- Add Razorpay payment gateway settings to the settings table
-- Run once. ON DUPLICATE KEY UPDATE is safe to re-run.
-- ============================================================

INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_group`)
VALUES
  ('razorpay_display_name', NULL, 'payment'),
  ('razorpay_key_id',       NULL, 'payment'),
  ('razorpay_key_secret',   NULL, 'payment')
ON DUPLICATE KEY UPDATE `setting_group` = 'payment';

-- NOTE:
--   razorpay_display_name — shown in the Razorpay checkout popup (e.g. "Koffeekup")
--   razorpay_key_id       — public key (starts with rzp_live_ or rzp_test_)
--   razorpay_key_secret   — private key; NEVER exposed to the frontend
