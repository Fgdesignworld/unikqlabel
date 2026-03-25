<?php
/**
 * Review Controller — Public submission + email verification + admin moderation
 *
 * Set APP_URL below to match your deployment domain so verification links work.
 */

define('APP_URL', 'http://localhost:3000');   // ← change to live domain in production

require_once __DIR__ . '/../models/Review.php';
require_once __DIR__ . '/../middleware/auth.php';

class ReviewController {

    // ─── PUBLIC ──────────────────────────────────────────────────────────────

    /**
     * GET /reviews?product_id=X
     * Returns approved + verified reviews + stats
     */
    public static function index(): void {
        $productId = isset($_GET['product_id']) ? (int) $_GET['product_id'] : 0;
        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'product_id is required']);
            return;
        }

        $reviews = Review::getApproved($productId);
        $stats   = Review::getStats($productId);

        // Cast types
        foreach ($reviews as &$r) {
            $r['id']          = (int)  $r['id'];
            $r['product_id']  = (int)  $r['product_id'];
            $r['rating']      = (int)  $r['rating'];
            $r['is_verified'] = (bool) $r['is_verified'];
        }

        echo json_encode([
            'reviews' => $reviews,
            'stats'   => [
                'total'   => (int)   $stats['total'],
                'average' => (float) $stats['average'],
                'breakdown' => [
                    5 => (int) $stats['r5'],
                    4 => (int) $stats['r4'],
                    3 => (int) $stats['r3'],
                    2 => (int) $stats['r2'],
                    1 => (int) $stats['r1'],
                ],
            ],
        ]);
    }

    /**
     * POST /reviews
     * Submit a new review (pending, unverified) and send verification email
     */
    public static function store(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        // --- Validate required fields ---
        $name      = trim($input['name'] ?? '');
        $email     = trim($input['email'] ?? '');
        $comment   = trim($input['comment'] ?? '');
        $rating    = (int) ($input['rating'] ?? 0);
        $productId = (int) ($input['product_id'] ?? 0);

        if (!$name || !$email || !$comment || !$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'name, email, comment, and product_id are required']);
            return;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address']);
            return;
        }
        if ($rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(['error' => 'Rating must be between 1 and 5']);
            return;
        }
        // Sanitize text inputs (prevent XSS)
        $name    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
        $comment = htmlspecialchars($comment, ENT_QUOTES, 'UTF-8');

        // --- IP rate limit: max 5 reviews per hour ---
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        if (Review::countRecentByIp($ip, 60) >= 5) {
            http_response_code(429);
            echo json_encode(['error' => 'Too many review submissions. Please wait a while.']);
            return;
        }

        // --- Duplicate check: 1 review per email per product ---
        if (Review::existsByEmailAndProduct($email, $productId)) {
            http_response_code(409);
            echo json_encode(['error' => 'You have already submitted a review for this product. Check your email to verify it.']);
            return;
        }

        // --- Save review ---
        $token = bin2hex(random_bytes(32));
        $id = Review::create([
            'product_id'         => $productId,
            'name'               => $name,
            'email'              => $email,
            'rating'             => $rating,
            'comment'            => $comment,
            'image'              => null,
            'verification_token' => $token,
            'ip_address'         => $ip,
        ]);

        // --- Send verification email ---
        self::sendVerificationEmail($email, $name, $token);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Review submitted! Please check your email to verify your submission.',
        ]);
    }

    /**
     * GET /reviews/verify?token=XYZ
     * Verify email token and mark review as verified
     */
    public static function verify(): void {
        $token = trim($_GET['token'] ?? '');
        if (!$token) {
            http_response_code(400);
            echo json_encode(['error' => 'Token is required']);
            return;
        }

        $review = Review::findByToken($token);
        if (!$review) {
            http_response_code(404);
            echo json_encode(['error' => 'Invalid or expired verification token']);
            return;
        }

        if ((int) $review['is_verified'] === 1) {
            echo json_encode(['success' => true, 'message' => 'Already verified']);
            return;
        }

        Review::verify((int) $review['id']);
        echo json_encode([
            'success' => true,
            'message' => 'Thank you! Your review has been verified and is pending admin approval.',
        ]);
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    /**
     * GET /admin/reviews
     */
    public static function adminIndex(): void {
        requireAuth();
        $filters = [];
        if (!empty($_GET['status']))       $filters['status']       = $_GET['status'];
        if (isset($_GET['is_verified']))   $filters['is_verified']  = $_GET['is_verified'];
        if (!empty($_GET['product_id']))   $filters['product_id']   = $_GET['product_id'];

        $reviews = Review::adminGetAll($filters);
        foreach ($reviews as &$r) {
            $r['id']          = (int)  $r['id'];
            $r['product_id']  = (int)  $r['product_id'];
            $r['rating']      = (int)  $r['rating'];
            $r['is_verified'] = (bool) $r['is_verified'];
        }
        echo json_encode(['reviews' => $reviews]);
    }

    /**
     * PUT /admin/reviews/{id}/approve
     */
    public static function approve(int $id): void {
        requireAuth();
        $review = Review::findById($id);
        if (!$review) {
            http_response_code(404);
            echo json_encode(['error' => 'Review not found']);
            return;
        }
        Review::updateStatus($id, 'approved');
        // If the review was not verified earlier, mark it verified now (admin approval implies verification)
        if ((int) $review['is_verified'] === 0) {
            Review::verify($id);
        }
        echo json_encode(['success' => true]);
    }

    /**
     * PUT /admin/reviews/{id}/reject
     */
    public static function reject(int $id): void {
        requireAuth();
        $review = Review::findById($id);
        if (!$review) {
            http_response_code(404);
            echo json_encode(['error' => 'Review not found']);
            return;
        }
        Review::updateStatus($id, 'rejected');
        echo json_encode(['success' => true]);
    }

    /**
     * DELETE /admin/reviews/{id}
     */
    public static function destroy(int $id): void {
        requireAuth();
        $review = Review::findById($id);
        if (!$review) {
            http_response_code(404);
            echo json_encode(['error' => 'Review not found']);
            return;
        }
        Review::delete($id);
        echo json_encode(['success' => true]);
    }

    /**
     * POST /admin/reviews
     * Admin creates a review directly (no email flow)
     */
    public static function adminStore(): void {
        requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $name      = trim($input['name'] ?? '');
        $email     = trim($input['email'] ?? '');
        $comment   = trim($input['comment'] ?? '');
        $rating    = (int) ($input['rating'] ?? 5);
        $productId = (int) ($input['product_id'] ?? 0);

        if (!$name || !$email || !$comment || !$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'name, email, comment, and product_id are required']);
            return;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address']);
            return;
        }
        if ($rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(['error' => 'Rating must be between 1 and 5']);
            return;
        }

        $name    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
        $comment = htmlspecialchars($comment, ENT_QUOTES, 'UTF-8');

        $id = Review::adminCreate([
            'product_id'  => $productId,
            'name'        => $name,
            'email'       => $email,
            'rating'      => $rating,
            'comment'     => $comment,
            'status'      => $input['status'] ?? 'approved',
            'is_verified' => isset($input['is_verified']) ? (int) $input['is_verified'] : 1,
        ]);

        $review = Review::findById($id);
        http_response_code(201);
        echo json_encode(['success' => true, 'review' => $review]);
    }

    /**
     * PUT /admin/reviews/{id}
     * Admin edits any field of a review
     */
    public static function adminUpdate(int $id): void {
        requireAuth();
        $review = Review::findById($id);
        if (!$review) {
            http_response_code(404);
            echo json_encode(['error' => 'Review not found']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        // Sanitize text inputs if present
        if (isset($input['name']))    $input['name']    = htmlspecialchars(trim($input['name']), ENT_QUOTES, 'UTF-8');
        if (isset($input['comment'])) $input['comment'] = htmlspecialchars(trim($input['comment']), ENT_QUOTES, 'UTF-8');
        if (isset($input['email']) && !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address']);
            return;
        }
        if (isset($input['rating']) && ((int)$input['rating'] < 1 || (int)$input['rating'] > 5)) {
            http_response_code(400);
            echo json_encode(['error' => 'Rating must be between 1 and 5']);
            return;
        }

        Review::adminUpdate($id, $input);
        echo json_encode(['success' => true, 'review' => Review::findById($id)]);
    }

    // ─── PRIVATE ─────────────────────────────────────────────────────────────

    /**
     * Send verification email via PHP mail()
     * For production: configure SMTP in php.ini or use a mailer library
     */
    private static function sendVerificationEmail(string $toEmail, string $name, string $token): void {
        $verifyUrl  = APP_URL . '/verify-review?token=' . urlencode($token);
        $subject    = 'Verify your review — Lakshmi Home Foods';
        $fromEmail  = 'noreply@lakshmihomefoods.com';
        $fromName   = 'Lakshmi Home Foods';

        $htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#0f0f0f;color:#fef3e2;margin:0;padding:0;">
  <div style="max-width:520px;margin:40px auto;background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #333;">
    <div style="background:#d97706;padding:24px;text-align:center;">
      <h1 style="margin:0;color:#0f0f0f;font-size:22px;font-weight:900;">Lakshmi Home Foods</h1>
      <p style="margin:4px 0 0;color:#0f0f0f;font-size:12px;opacity:.8;">Pure Taste of Tradition</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#fef3e2;font-size:18px;margin:0 0 12px;">Hi {$name}, verify your review!</h2>
      <p style="color:#fef3e2;opacity:.7;line-height:1.6;">
        Thank you for your feedback. Please click the button below to verify your email and submit your review.
        Your review will appear after admin approval.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="{$verifyUrl}"
           style="display:inline-block;background:#d97706;color:#0f0f0f;font-weight:900;font-size:15px;
                  padding:14px 32px;border-radius:50px;text-decoration:none;letter-spacing:.5px;">
          ✓ Verify My Review
        </a>
      </div>
      <p style="color:#fef3e2;opacity:.4;font-size:12px;text-align:center;">
        Link expires in 7 days. If you did not submit a review, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
HTML;

        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$fromName} <{$fromEmail}>\r\n";
        $headers .= "Reply-To: {$fromEmail}\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        // mail() may silently fail on local dev without SMTP configured — that's expected.
        @mail($toEmail, $subject, $htmlBody, $headers);
    }
}
