<?php
/**
 * SizeVariantController — CRUD for size variant sets & their variants
 */
require_once __DIR__ . '/../models/SizeVariantSet.php';
require_once __DIR__ . '/../middleware/auth.php';

class SizeVariantController {

    // ── Sets ──────────────────────────────────────────────

    /** GET /admin/variant-sets */
    public function index(): void {
        requireAuth();
        $sets = SizeVariantSet::getAll();
        // Attach variants to each set
        foreach ($sets as &$set) {
            $set['variants'] = SizeVariantSet::getVariants((int)$set['id']);
        }
        echo json_encode(['success' => true, 'sets' => $sets]);
    }

    /** GET /variant-sets  (public — active only, used by product form) */
    public function publicIndex(): void {
        $sets = SizeVariantSet::getActive();
        foreach ($sets as &$set) {
            $set['variants'] = SizeVariantSet::getActiveVariants((int)$set['id']);
        }
        echo json_encode(['success' => true, 'sets' => $sets]);
    }

    /** GET /admin/variant-sets/{id}/variants */
    public function variants(int $setId): void {
        requireAuth();
        $set = SizeVariantSet::findById($setId);
        if (!$set) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Variant set not found']);
            return;
        }
        $variants = SizeVariantSet::getVariants($setId);
        echo json_encode(['success' => true, 'variants' => $variants]);
    }

    /** POST /admin/variant-sets */
    public function store(): void {
        requireAuth();
        $input = $this->getJson();
        $name  = trim($input['name'] ?? '');

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name is required']);
            return;
        }

        $id  = SizeVariantSet::create(['name' => $name, 'is_active' => $input['is_active'] ?? 1]);
        $set = SizeVariantSet::findById($id);
        $set['variants'] = [];

        echo json_encode(['success' => true, 'set' => $set]);
    }

    /** PUT /admin/variant-sets/{id} */
    public function update(int $id): void {
        requireAuth();
        $input = $this->getJson();

        $set = SizeVariantSet::findById($id);
        if (!$set) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Variant set not found']);
            return;
        }

        SizeVariantSet::update($id, [
            'name'      => trim($input['name'] ?? $set['name']),
            'is_active' => $input['is_active'] ?? $set['is_active'],
        ]);

        $updated = SizeVariantSet::findById($id);
        $updated['variants'] = SizeVariantSet::getVariants($id);

        echo json_encode(['success' => true, 'set' => $updated]);
    }

    /** DELETE /admin/variant-sets/{id} */
    public function destroy(int $id): void {
        requireAuth();
        $set = SizeVariantSet::findById($id);
        if (!$set) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Variant set not found']);
            return;
        }
        SizeVariantSet::delete($id);
        echo json_encode(['success' => true]);
    }

    /** POST /admin/variant-sets/{id}/variants  (bulk save) */
    public function saveVariants(int $setId): void {
        requireAuth();
        $set = SizeVariantSet::findById($setId);
        if (!$set) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Variant set not found']);
            return;
        }

        $input    = $this->getJson();
        $variants = $input['variants'] ?? [];

        if (!is_array($variants)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'variants must be an array']);
            return;
        }

        SizeVariantSet::saveVariants($setId, $variants);
        $saved = SizeVariantSet::getVariants($setId);

        echo json_encode(['success' => true, 'variants' => $saved]);
    }

    // ── helpers ───────────────────────────────────────────

    private function getJson(): array {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }
}
