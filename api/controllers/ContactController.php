<?php
/**
 * Contact / Lead Controller
 */

require_once __DIR__ . '/../models/Lead.php';
require_once __DIR__ . '/../middleware/auth.php';

class ContactController {

    // ─── PUBLIC: POST /contact/submit ─────────────────────────────────────────

    public static function submit(): void {
        require_once __DIR__ . '/../middleware/rate_limit.php';
        checkRateLimit('contact_submit', 5, 300); // 5 per 5 min

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        // Honeypot spam check (invisible field — bots fill it)
        if (!empty($input['website'])) {
            // Quietly accept but mark spam
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Thank you! We will get back to you.']);
            // Still store with spam flag
            $input['honeypot'] = $input['website'];
        }

        // Validate required
        $errors = [];
        if (empty(trim($input['name'] ?? '')))    $errors[] = 'Name is required';
        if (empty(trim($input['phone'] ?? '')))   $errors[] = 'Phone is required';
        if (empty(trim($input['message'] ?? ''))) $errors[] = 'Message is required';

        if (!preg_match('/^\+?[\d\s\-]{8,20}$/', $input['phone'] ?? '')) {
            $errors[] = 'Please enter a valid phone number';
        }

        if (!empty($input['email']) && !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Please enter a valid email address';
        }

        $validInquiry = ['order', 'bulk', 'support', 'custom_design', 'other'];
        if (!empty($input['inquiry_type']) && !in_array($input['inquiry_type'], $validInquiry)) {
            $input['inquiry_type'] = 'other';
        }

        if (!empty($errors)) {
            http_response_code(422);
            echo json_encode(['error' => $errors[0], 'errors' => $errors]);
            return;
        }

        $result = Lead::create([
            'name'              => $input['name'],
            'phone'             => $input['phone'],
            'email'             => $input['email'] ?? null,
            'inquiry_type'      => $input['inquiry_type']      ?? 'other',
            'message'           => $input['message'],
            'preferred_contact' => $input['preferred_contact'] ?? 'whatsapp',
            'source'            => 'website',
            'honeypot'          => $input['honeypot'] ?? null,
        ]);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Thank you! We will contact you within 24 hours.',
            'lead_id' => $result['id'],
        ]);
    }

    // ─── ADMIN: GET /admin/leads ──────────────────────────────────────────────

    public static function index(): void {
        requireAuth();

        $page    = max(1, (int) ($_GET['page']     ?? 1));
        $perPage = min(50, max(10, (int) ($_GET['per_page'] ?? 20)));

        $filters = [];
        foreach (['status', 'inquiry_type', 'lead_score', 'search', 'date_from', 'date_to'] as $f) {
            if (!empty($_GET[$f])) $filters[$f] = trim($_GET[$f]);
        }

        $data = Lead::getAll($page, $perPage, $filters);

        echo json_encode(['success' => true, 'data' => $data]);
    }

    // ─── ADMIN: GET /admin/leads/{id} ─────────────────────────────────────────

    public static function show(int $id): void {
        requireAuth();

        $lead = Lead::findById($id);
        if (!$lead) {
            http_response_code(404);
            echo json_encode(['error' => 'Lead not found']);
            return;
        }

        echo json_encode(['success' => true, 'data' => ['lead' => $lead]]);
    }

    // ─── ADMIN: PATCH /admin/leads/{id}/status ────────────────────────────────

    public static function updateStatus(int $id): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $ok    = Lead::updateStatus($id, $input['status'] ?? '', $input['lead_score'] ?? null);

        if (!$ok) {
            http_response_code(422);
            echo json_encode(['error' => 'Invalid status']);
            return;
        }

        echo json_encode(['success' => true]);
    }

    // ─── ADMIN: POST /admin/leads/{id}/followup ───────────────────────────────

    public static function addFollowup(int $id): void {
        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty(trim($input['notes'] ?? ''))) {
            http_response_code(422);
            echo json_encode(['error' => 'Notes are required']);
            return;
        }

        $fId = Lead::addFollowup($id, $input);
        echo json_encode(['success' => true, 'followup_id' => $fId]);
    }

    // ─── ADMIN: DELETE /admin/leads/{id} ─────────────────────────────────────

    public static function destroy(int $id): void {
        requireAuth();

        Lead::softDelete($id);
        echo json_encode(['success' => true]);
    }

    // ─── ADMIN: GET /admin/leads/stats ───────────────────────────────────────

    public static function stats(): void {
        requireAuth();

        echo json_encode(['success' => true, 'data' => ['stats' => Lead::getStats()]]);
    }

    // ─── ADMIN: GET /admin/leads/upcoming ──────────────────────────────────────

    public static function upcoming(): void {
        requireAuth();
        $days = min(30, max(7, (int) ($_GET['days'] ?? 7)));
        $grouped = Lead::getUpcomingFollowups($days);
        echo json_encode(['success' => true, 'data' => ['followups' => $grouped]]);
    }

    // ─── ADMIN: GET /admin/leads/daily-stats ──────────────────────────────────

    public static function dailyStats(): void {
        requireAuth();
        $days = min(90, max(7, (int) ($_GET['days'] ?? 14)));
        $stats = Lead::getDailyStats($days);
        echo json_encode(['success' => true, 'data' => ['stats' => $stats]]);
    }

    // ─── ADMIN: GET /admin/leads/export ──────────────────────────────────────

    public static function export(): void {
        requireAuth();

        $rows = Lead::exportCsv();

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="leads-' . date('Y-m-d') . '.csv"');

        $out = fopen('php://output', 'w');
        if (!empty($rows)) {
            fputcsv($out, array_keys($rows[0]));
            foreach ($rows as $row) fputcsv($out, $row);
        }
        fclose($out);
        exit;
    }
}
