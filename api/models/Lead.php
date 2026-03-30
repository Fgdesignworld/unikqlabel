<?php
/**
 * Lead Model — CRM leads, follow-ups, activities
 */

require_once __DIR__ . '/../config/database.php';

class Lead {

    // ─── Public: Create lead ──────────────────────────────────────────────────

    public static function create(array $data): array {
        $db = getDB();

        $stmt = $db->prepare("
            INSERT INTO leads
                (name, phone, email, inquiry_type, message, preferred_contact, source, file_path, honeypot, spam, lead_score)
            VALUES
                (:name, :phone, :email, :inquiry_type, :message, :preferred_contact, :source, :file_path, :honeypot, :spam, :lead_score)
        ");

        $isSpam = !empty($data['honeypot']) ? 1 : 0;

        // Simple lead scoring
        $score = 'warm';
        if (in_array($data['inquiry_type'] ?? '', ['bulk', 'custom_design'])) {
            $score = 'hot';
        } elseif ($data['inquiry_type'] === 'support') {
            $score = 'cold';
        }

        $stmt->execute([
            'name'              => substr(trim($data['name']), 0, 120),
            'phone'             => substr(trim($data['phone']), 0, 20),
            'email'             => !empty($data['email']) ? substr(trim($data['email']), 0, 180) : null,
            'inquiry_type'      => $data['inquiry_type'] ?? 'other',
            'message'           => trim($data['message']),
            'preferred_contact' => $data['preferred_contact'] ?? 'whatsapp',
            'source'            => $data['source'] ?? 'website',
            'file_path'         => $data['file_path'] ?? null,
            'honeypot'          => $data['honeypot'] ?? null,
            'spam'              => $isSpam,
            'lead_score'        => $score,
        ]);

        $leadId = (int) $db->lastInsertId();

        // Log activity
        self::logActivity($leadId, 'created', ['source' => $data['source'] ?? 'website']);

        return ['id' => $leadId, 'invoice' => 'LDR-' . str_pad($leadId, 5, '0', STR_PAD_LEFT)];
    }

    // ─── Admin: Paginated list ────────────────────────────────────────────────

    public static function getAll(int $page = 1, int $perPage = 20, array $filters = []): array {
        $db          = getDB();
        $conditions  = ["deleted_at IS NULL", "spam = 0"];
        $params      = [];

        if (!empty($filters['status'])) {
            $conditions[] = "status = :status";
            $params[':status'] = $filters['status'];
        }
        if (!empty($filters['inquiry_type'])) {
            $conditions[] = "inquiry_type = :inquiry_type";
            $params[':inquiry_type'] = $filters['inquiry_type'];
        }
        if (!empty($filters['lead_score'])) {
            $conditions[] = "lead_score = :lead_score";
            $params[':lead_score'] = $filters['lead_score'];
        }
        if (!empty($filters['search'])) {
            $conditions[] = "(name LIKE :search OR phone LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }
        if (!empty($filters['date_from'])) {
            $conditions[] = "DATE(created_at) >= :date_from";
            $params[':date_from'] = $filters['date_from'];
        }
        if (!empty($filters['date_to'])) {
            $conditions[] = "DATE(created_at) <= :date_to";
            $params[':date_to'] = $filters['date_to'];
        }

        $where  = 'WHERE ' . implode(' AND ', $conditions);
        $offset = ($page - 1) * $perPage;

        $countStmt = $db->prepare("SELECT COUNT(*) FROM leads $where");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $db->prepare("SELECT * FROM leads $where ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':limit',  $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset,  PDO::PARAM_INT);
        $stmt->execute();

        return [
            'leads'     => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'total'     => $total,
            'page'      => $page,
            'per_page'  => $perPage,
            'last_page' => max(1, (int) ceil($total / $perPage)),
        ];
    }

    // ─── Admin: Single lead ───────────────────────────────────────────────────

    public static function findById(int $id): ?array {
        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM leads WHERE id = :id AND deleted_at IS NULL");
        $stmt->execute([':id' => $id]);
        $lead = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$lead) return null;

        // Attach follow-ups
        $fStmt = $db->prepare("SELECT * FROM lead_followups WHERE lead_id = :id ORDER BY created_at DESC");
        $fStmt->execute([':id' => $id]);
        $lead['followups'] = $fStmt->fetchAll(PDO::FETCH_ASSOC);

        // Attach activities
        $aStmt = $db->prepare("SELECT * FROM lead_activities WHERE lead_id = :id ORDER BY created_at DESC");
        $aStmt->execute([':id' => $id]);
        $lead['activities'] = $aStmt->fetchAll(PDO::FETCH_ASSOC);

        return $lead;
    }

    // ─── Admin: Update status / score ────────────────────────────────────────

    public static function updateStatus(int $id, string $status, ?string $score = null): bool {
        $db    = getDB();
        $valid = ['new', 'contacted', 'converted', 'closed'];
        if (!in_array($status, $valid)) return false;

        $sql    = "UPDATE leads SET status = :status";
        $params = [':status' => $status, ':id' => $id];

        if ($score && in_array($score, ['hot', 'warm', 'cold'])) {
            $sql .= ", lead_score = :score";
            $params[':score'] = $score;
        }

        $sql .= " WHERE id = :id";
        $db->prepare($sql)->execute($params);
        self::logActivity($id, 'status_changed', ['to' => $status]);
        return true;
    }

    // ─── Admin: Add follow-up ─────────────────────────────────────────────────

    public static function addFollowup(int $leadId, array $data): int {
        $db   = getDB();
        $stmt = $db->prepare("
            INSERT INTO lead_followups (lead_id, type, notes, next_followup_date)
            VALUES (:lead_id, :type, :notes, :next_date)
        ");
        $stmt->execute([
            ':lead_id'   => $leadId,
            ':type'      => $data['type']  ?? 'note',
            ':notes'     => trim($data['notes']),
            ':next_date' => !empty($data['next_followup_date']) ? $data['next_followup_date'] : null,
        ]);
        $fId = (int) $db->lastInsertId();
        self::logActivity($leadId, 'followup_added', ['type' => $data['type'] ?? 'note']);

        // Move status to contacted if still new
        $checkStmt = $db->prepare("SELECT status FROM leads WHERE id = :id");
        $checkStmt->execute([':id' => $leadId]);
        $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
        if ($row && $row['status'] === 'new') {
            $db->prepare("UPDATE leads SET status = 'contacted' WHERE id = :id")
               ->execute([':id' => $leadId]);
        }

        return $fId;
    }

    // ─── Admin: Soft delete ───────────────────────────────────────────────────

    public static function softDelete(int $id): void {
        $db = getDB();
        $db->prepare("UPDATE leads SET deleted_at = NOW() WHERE id = :id")
           ->execute([':id' => $id]);
    }

    // ─── Admin: Stats for dashboard ──────────────────────────────────────────

    public static function getStats(): array {
        $db  = getDB();
        $row = $db->query("
            SELECT
                COUNT(*)                                           AS total,
                SUM(status = 'new')                               AS new_count,
                SUM(status = 'contacted')                         AS contacted_count,
                SUM(status = 'converted')                         AS converted_count,
                SUM(lead_score = 'hot')                           AS hot_count,
                COUNT(CASE WHEN DATE(created_at)=CURDATE() THEN 1 END) AS today_count
            FROM leads WHERE deleted_at IS NULL AND spam = 0
        ")->fetch(PDO::FETCH_ASSOC);

        return array_map('intval', $row);
    }

    // ─── Admin: Export CSV ───────────────────────────────────────────────────

    public static function exportCsv(): array {
        $db   = getDB();
        $stmt = $db->query("SELECT id,name,phone,email,inquiry_type,message,preferred_contact,status,lead_score,source,tags,created_at FROM leads WHERE deleted_at IS NULL AND spam=0 ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ─── Admin: Upcoming followups (next N days grouped by date) ────────────────

    public static function getUpcomingFollowups(int $days = 7): array {
        $db = getDB();
        $stmt = $db->prepare("
            SELECT
                f.id, f.lead_id, f.type, f.notes, f.next_followup_date, f.created_at,
                l.name, l.phone, l.email, l.status, l.lead_score, l.inquiry_type
            FROM lead_followups f
            INNER JOIN leads l ON l.id = f.lead_id
            WHERE f.next_followup_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL :span DAY)
              AND l.deleted_at IS NULL AND l.spam = 0
            ORDER BY f.next_followup_date ASC, f.id DESC
        ");
        $stmt->execute([':span' => $days - 1]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $grouped = [];
        foreach ($rows as $row) {
            $date = $row['next_followup_date'];
            if (!isset($grouped[$date])) $grouped[$date] = [];
            $grouped[$date][] = $row;
        }
        return $grouped;
    }

    // ─── Admin: Daily new lead counts (last N days) ───────────────────────────────

    public static function getDailyStats(int $days = 14): array {
        $db = getDB();
        $stmt = $db->prepare("
            SELECT DATE(created_at) AS date, COUNT(*) AS count
            FROM leads
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
              AND deleted_at IS NULL AND spam = 0
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ");
        $stmt->execute([':days' => $days]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Back-fill missing days with zero
        $byDate = [];
        foreach ($rows as $row) $byDate[$row['date']] = (int) $row['count'];

        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $d = date('Y-m-d', strtotime("-{$i} days"));
            $result[] = ['date' => $d, 'count' => $byDate[$d] ?? 0];
        }
        return $result;
    }

    // ─── Internal: Activity log ───────────────────────────────────────────────

    private static function logActivity(int $leadId, string $action, array $meta = []): void {
        try {
            $db   = getDB();
            $stmt = $db->prepare("INSERT INTO lead_activities (lead_id, action, meta_json) VALUES (:lead_id, :action, :meta)");
            $stmt->execute([
                ':lead_id' => $leadId,
                ':action'  => $action,
                ':meta'    => !empty($meta) ? json_encode($meta) : null,
            ]);
        } catch (\Exception $e) {
            // Non-fatal — don't break the flow
        }
    }
}
