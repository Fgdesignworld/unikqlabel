<?php
/**
 * Razorpay API Helper — Pure cURL, no external SDK required.
 *
 * Credentials are read from the database (settings table) first,
 * then fall back to .env environment variables.
 *
 * DB settings keys:
 *   razorpay_key_id     — public key (rzp_live_... / rzp_test_...)
 *   razorpay_key_secret — private key (never sent to frontend)
 *
 * Fallback .env keys:
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 *
 * Functions:
 *   razorpayGetKeyId()        — Returns the public key ID
 *   razorpayCreateOrder()     — Creates a Razorpay order via REST API
 *   razorpayVerifySignature() — Verifies HMAC-SHA256 payment signature
 */

require_once __DIR__ . '/../models/Settings.php';

define('RAZORPAY_API_BASE', 'https://api.razorpay.com/v1');
define('RAZORPAY_SECRET_MASK', '••••••••');

/**
 * Get the Razorpay public Key ID.
 * DB value takes precedence over .env.
 */
function razorpayGetKeyId(): string
{
    $fromDb = Settings::get('razorpay_key_id');
    if (!empty($fromDb)) return $fromDb;
    return $_ENV['RAZORPAY_KEY_ID'] ?? '';
}

/**
 * Get the Razorpay Key Secret (private — never expose to frontend).
 * DB value takes precedence over .env.
 */
function razorpayGetKeySecret(): string
{
    $fromDb = Settings::get('razorpay_key_secret');
    if (!empty($fromDb)) return $fromDb;
    return $_ENV['RAZORPAY_KEY_SECRET'] ?? '';
}

/**
 * Create a Razorpay order.
 *
 * @param  int    $amountInPaise  Amount in paise (1 INR = 100 paise). Min 100 (₹1).
 * @param  string $receipt        Unique receipt ID (invoice number works well).
 * @param  array  $notes          Optional metadata (max 15 key-value pairs).
 * @return array  Full Razorpay order object (contains id, amount, currency, etc.)
 * @throws RuntimeException on network failure or API error.
 */
function razorpayCreateOrder(int $amountInPaise, string $receipt, array $notes = []): array
{
    $keyId     = razorpayGetKeyId();
    $keySecret = razorpayGetKeySecret();

    if (empty($keyId) || empty($keySecret)) {
        throw new RuntimeException('Razorpay credentials are not configured. Please set them in Admin → Settings → Payment.');
    }

    $payload = json_encode([
        'amount'   => $amountInPaise,
        'currency' => 'INR',
        'receipt'  => substr($receipt, 0, 40), // Razorpay max receipt length = 40
        'notes'    => $notes,
    ]);

    $ch = curl_init(RAZORPAY_API_BASE . '/orders');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_USERPWD        => $keyId . ':' . $keySecret,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);

    $response  = curl_exec($ch);
    $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log('[Razorpay] cURL error: ' . $curlError);
        throw new RuntimeException('Payment gateway connection failed. Please try again.');
    }

    $data = json_decode($response, true);

    if ($httpCode !== 200 || empty($data['id'])) {
        $errMsg = $data['error']['description'] ?? ('Unexpected response (HTTP ' . $httpCode . ')');
        error_log("[Razorpay] Order creation failed (HTTP {$httpCode}): {$errMsg}");
        throw new RuntimeException('Payment gateway error: ' . $errMsg);
    }

    return $data;
}

/**
 * Verify a Razorpay payment signature (HMAC-SHA256).
 *
 * Razorpay signs the string:
 *   "<razorpay_order_id>|<razorpay_payment_id>"
 * using your key_secret as the HMAC key.
 *
 * Uses hash_equals() for constant-time comparison (timing-attack safe).
 *
 * @param  string $razorpayOrderId   The order_id from order creation.
 * @param  string $razorpayPaymentId The payment_id from the client callback.
 * @param  string $signature         The signature from the client callback.
 * @return bool   true if the signature matches; false otherwise.
 * @throws RuntimeException if key_secret is not configured.
 */
function razorpayVerifySignature(
    string $razorpayOrderId,
    string $razorpayPaymentId,
    string $signature
): bool {
    $keySecret = razorpayGetKeySecret();

    if (empty($keySecret)) {
        throw new RuntimeException('Razorpay key secret is not configured. Please set it in Admin → Settings → Payment.');
    }

    $payload  = $razorpayOrderId . '|' . $razorpayPaymentId;
    $expected = hash_hmac('sha256', $payload, $keySecret);

    // Constant-time comparison prevents timing attacks
    return hash_equals($expected, $signature);
}
