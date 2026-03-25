<?php
/**
 * Review Model — Email-verified, moderation-based reviews
 */

class Review {

    /**
     * Get approved + verified reviews for a product (public)
     */
    public static function getApproved(int $productId): array {
        $db = getDB();
        $stmt = $db->prepare(
            "SELECT id, product_id, name, rating, comment, image, is_verified, created_at
             FROM reviews
             WHERE product_id = :product_id
               AND status = 'approved'
             ORDER BY created_at DESC"
        );
        $stmt->execute(['product_id' => $productId]);
        return $stmt->fetchAll();
    }

    /**
     * Get aggregate stats for a product (avg, count, breakdown)
     */
    public static function getStats(int $productId): array {
        $db = getDB();
        $stmt = $db->prepare(
            "SELECT
                COUNT(*) AS total,
                ROUND(AVG(rating), 1) AS average,
                SUM(rating = 5) AS r5,
                SUM(rating = 4) AS r4,
                SUM(rating = 3) AS r3,
                SUM(rating = 2) AS r2,
                SUM(rating = 1) AS r1
             FROM reviews
             WHERE product_id = :product_id
               AND status = 'approved'
               AND is_verified = 1"
        );
        $stmt->execute(['product_id' => $productId]);
        $row = $stmt->fetch();
        return $row ?: ['total' => 0, 'average' => 0, 'r5'=>0,'r4'=>0,'r3'=>0,'r2'=>0,'r1'=>0];
    }

    /**
     * Create a new review (status=pending, is_verified=0)
     */
    public static function create(array $data): int {
        $db = getDB();
        $stmt = $db->prepare(
            "INSERT INTO reviews (product_id, name, email, rating, comment, image, status, is_verified, verification_token, ip_address)
             VALUES (:product_id, :name, :email, :rating, :comment, :image, 'pending', 0, :token, :ip)"
        );
        // Ensure verification token is NULL if empty or missing (avoid storing empty string)
        $token = isset($data['verification_token']) && $data['verification_token'] !== '' ? $data['verification_token'] : null;
        $stmt->execute([
            'product_id' => (int) $data['product_id'],
            'name'       => $data['name'],
            'email'      => $data['email'],
            'rating'     => (int) $data['rating'],
            'comment'    => $data['comment'],
            'image'      => $data['image'] ?? null,
            'token'      => $token,
            'ip'         => $data['ip_address'] ?? null,
        ]);
        return (int) $db->lastInsertId();
    }

    /**
     * Find by verification token
     */
    public static function findByToken(string $token): ?array {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM reviews WHERE verification_token = :token LIMIT 1");
        $stmt->execute(['token' => $token]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Mark review as verified (sets verified_at timestamp, keeps verification_token for records)
     */
    public static function verify(int $id): void {
        $db = getDB();
        $stmt = $db->prepare(
            "UPDATE reviews SET is_verified = 1, verified_at = NOW(), updated_at = NOW() WHERE id = :id"
        );
        $stmt->execute(['id' => $id]);
    }

    /**
     * Admin: create a review directly (bypasses email verification flow)
     */
    public static function adminCreate(array $data): int {
        $db = getDB();
        $isVerified = isset($data['is_verified']) ? (int) $data['is_verified'] : 1;
        $stmt = $db->prepare(
            "INSERT INTO reviews
                (product_id, name, email, rating, comment, image, status, is_verified, verified_at, ip_address)
             VALUES
                (:product_id, :name, :email, :rating, :comment, :image, :status, :is_verified, :verified_at, :ip)"
        );
        $stmt->execute([
            'product_id'  => (int) $data['product_id'],
            'name'        => $data['name'],
            'email'       => $data['email'],
            'rating'      => (int) $data['rating'],
            'comment'     => $data['comment'],
            'image'       => $data['image'] ?? null,
            'status'      => $data['status'] ?? 'approved',
            'is_verified' => $isVerified,
            'verified_at' => $isVerified ? date('Y-m-d H:i:s') : null,
            'ip'          => null,
        ]);
        return (int) $db->lastInsertId();
    }

    /**
     * Admin: update an existing review
     */
    public static function adminUpdate(int $id, array $data): void {
        $db = getDB();
        $fields = [];
        $params = ['id' => $id];

        // Load current row to make safe decisions (avoid clearing token unintentionally)
        $current = null;
        try {
            $stmtCur = $db->prepare("SELECT is_verified, verification_token FROM reviews WHERE id = :id LIMIT 1");
            $stmtCur->execute(['id' => $id]);
            $current = $stmtCur->fetch();
        } catch (Exception $e) {
            $current = null;
        }

        $allowed = ['name', 'email', 'rating', 'comment', 'status', 'image', 'is_verified'];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[]  = "{$f} = :{$f}";
                $params[$f] = ($f === 'rating' || $f === 'is_verified') ? (int) $data[$f] : $data[$f];
            }
        }

        // Keep verified_at in sync with is_verified
        if (array_key_exists('is_verified', $data)) {
            $newVerified = (int) $data['is_verified'];
            if ($newVerified === 1) {
                $fields[] = "verified_at = IF(verified_at IS NULL, NOW(), verified_at)";
                // Only clear verification_token when transitioning from unverified -> verified
                if ($current && (int) ($current['is_verified'] ?? 0) === 0) {
                    $fields[] = "verification_token = NULL";
                }
            } else {
                $fields[] = "verified_at = NULL";
            }
        }

        if (empty($fields)) return;
        $fields[] = "updated_at = NOW()";

        $sql = "UPDATE reviews SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
    }

    /**
     * Update status (approved/rejected)
     */
    public static function updateStatus(int $id, string $status): void {
        $db = getDB();
        $stmt = $db->prepare("UPDATE reviews SET status = :status, updated_at = NOW() WHERE id = :id");
        $stmt->execute(['status' => $status, 'id' => $id]);
    }

    /**
     * Admin: get all reviews with optional filters
     */
    public static function adminGetAll(array $filters = []): array {
        $db = getDB();
        $where = [];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = "r.status = :status";
            $params['status'] = $filters['status'];
        }
        if (isset($filters['is_verified']) && $filters['is_verified'] !== '') {
            $where[] = "r.is_verified = :is_verified";
            $params['is_verified'] = (int) $filters['is_verified'];
        }
        if (!empty($filters['product_id'])) {
            $where[] = "r.product_id = :product_id";
            $params['product_id'] = (int) $filters['product_id'];
        }

        $sql = "SELECT r.*, p.name AS product_name
                FROM reviews r
                LEFT JOIN products p ON p.id = r.product_id";
        if ($where) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        $sql .= " ORDER BY r.created_at DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Find by ID
     */
    public static function findById(int $id): ?array {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM reviews WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Delete a review
     */
    public static function delete(int $id): void {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM reviews WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    /**
     * Check if email already submitted for this product
     */
    public static function existsByEmailAndProduct(string $email, int $productId): bool {
        $db = getDB();
        $stmt = $db->prepare(
            "SELECT 1 FROM reviews WHERE email = :email AND product_id = :product_id LIMIT 1"
        );
        $stmt->execute(['email' => $email, 'product_id' => $productId]);
        return (bool) $stmt->fetch();
    }

    /**
     * Count submissions from an IP in the last hour (rate limit)
     */
    public static function countRecentByIp(string $ip, int $minutes = 60): int {
        $db = getDB();
        $stmt = $db->prepare(
            "SELECT COUNT(*) FROM reviews WHERE ip_address = :ip AND created_at > DATE_SUB(NOW(), INTERVAL :mins MINUTE)"
        );
        $stmt->execute(['ip' => $ip, 'mins' => $minutes]);
        return (int) $stmt->fetchColumn();
    }
}
