<?php
/**
 * ColorLibraryController — CRUD for global color library + per-product color images
 */
require_once __DIR__ . '/../models/ColorLibrary.php';
require_once __DIR__ . '/../middleware/auth.php';

class ColorLibraryController {

    // ── Color Library ─────────────────────────────────────

    /** GET /admin/colors */
    public function index(): void {
        requireAuth();
        $colors = ColorLibrary::getAll();
        echo json_encode(['success' => true, 'colors' => $colors]);
    }

    /** GET /colors  (public — active only, used by product form) */
    public function publicIndex(): void {
        $colors = ColorLibrary::getActive();
        echo json_encode(['success' => true, 'colors' => $colors]);
    }

    /** POST /admin/colors */
    public function store(): void {
        requireAuth();
        $input = $this->getJson();
        $name  = trim($input['name'] ?? '');
        $hex   = trim($input['hex_code'] ?? '#000000');

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name is required']);
            return;
        }

        $id    = ColorLibrary::create(['name' => $name, 'hex_code' => $hex, 'is_active' => $input['is_active'] ?? 1]);
        $color = ColorLibrary::findById($id);
        echo json_encode(['success' => true, 'color' => $color]);
    }

    /** PUT /admin/colors/{id} */
    public function update(int $id): void {
        requireAuth();
        $input = $this->getJson();
        $color = ColorLibrary::findById($id);

        if (!$color) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Color not found']);
            return;
        }

        ColorLibrary::update($id, [
            'name'      => trim($input['name'] ?? $color['name']),
            'hex_code'  => trim($input['hex_code'] ?? $color['hex_code']),
            'is_active' => $input['is_active'] ?? $color['is_active'],
        ]);

        $updated = ColorLibrary::findById($id);
        echo json_encode(['success' => true, 'color' => $updated]);
    }

    /** DELETE /admin/colors/{id} */
    public function destroy(int $id): void {
        requireAuth();
        $color = ColorLibrary::findById($id);
        if (!$color) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Color not found']);
            return;
        }
        ColorLibrary::delete($id);
        echo json_encode(['success' => true]);
    }

    // ── Per-Product Color Images ──────────────────────────

    /** GET /admin/products/{productId}/color-images */
    public function getProductColors(int $productId): void {
        requireAuth();
        $colors = ColorLibrary::getProductColors($productId);
        echo json_encode(['success' => true, 'colors' => $colors]);
    }

    /**
     * POST /admin/products/{productId}/color-images
     * Body: { colors: [{ color_id: 2, images: ['/path1'] }] }
     */
    public function saveProductColors(int $productId): void {
        requireAuth();
        $input  = $this->getJson();
        $colors = $input['colors'] ?? [];

        if (!is_array($colors)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'colors must be an array']);
            return;
        }

        ColorLibrary::saveProductColors($productId, $colors);

        // Re-build color_variants_json and persist to products table
        $db      = getDB();
        $cvJson  = ColorLibrary::buildColorVariantsJson($productId);
        $stmt    = $db->prepare("UPDATE products SET color_variants_json = :cv WHERE id = :id");
        $stmt->execute([
            'cv' => json_encode($cvJson),
            'id' => $productId,
        ]);

        $saved = ColorLibrary::getProductColors($productId);
        echo json_encode(['success' => true, 'colors' => $saved]);
    }

    // ── helpers ───────────────────────────────────────────

    private function getJson(): array {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }
}
