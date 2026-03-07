<?php
/**
 * API Router — Maps URLs to controller methods
 */

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../controllers/OrderController.php';

function handleRequest(): void {
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    // Strip /api prefix if present
    $uri = preg_replace('#^/api#', '', $uri);
    $uri = rtrim($uri, '/');

    // Apply global security middleware
    require_once __DIR__ . '/../middleware/rate_limit.php';
    require_once __DIR__ . '/../middleware/csrf.php';
    
    // 1. Rate limiting (General API limit: 60 requests per minute)
    // checkRateLimit('api'); // Standard limit for all routes
    
    // 2. CSRF Protection for state-changing methods
    if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
        requireCsrf();
    }

    // If empty, show API info
    if ($uri === '' || $uri === '/') {
        echo json_encode([
            'name' => 'Lakshmi Home Foods API',
            'version' => '1.0.0',
            'status' => 'running'
        ]);
        return;
    }

    // ========================================
    // PUBLIC ROUTES
    // ========================================

    // GET /products — Public product listing
    if ($method === 'GET' && $uri === '/products') {
        ProductController::index();
        return;
    }

    // POST /checkout — Submit order
    if ($method === 'POST' && $uri === '/checkout') {
        OrderController::store();
        return;
    }

    // GET /csrf-token — Get CSRF token
    if ($method === 'GET' && $uri === '/csrf-token') {
        AuthController::csrfToken();
        return;
    }

    // ========================================
    // ADMIN AUTH ROUTES
    // ========================================

    // POST /admin/login
    if ($method === 'POST' && $uri === '/admin/login') {
        AuthController::login();
        return;
    }

    // POST /admin/logout
    if ($method === 'POST' && $uri === '/admin/logout') {
        AuthController::logout();
        return;
    }

    // GET /admin/status
    if ($method === 'GET' && $uri === '/admin/status') {
        AuthController::status();
        return;
    }

    // ========================================
    // ADMIN PRODUCT ROUTES
    // ========================================

    // GET /admin/products
    if ($method === 'GET' && $uri === '/admin/products') {
        ProductController::adminIndex();
        return;
    }

    // POST /admin/products
    if ($method === 'POST' && $uri === '/admin/products') {
        ProductController::store();
        return;
    }

    // POST /admin/products/upload-image
    if ($method === 'POST' && $uri === '/admin/products/upload-image') {
        ProductController::uploadImage();
        return;
    }

    // PUT /admin/products/{id}
    if ($method === 'PUT' && preg_match('#^/admin/products/(\d+)$#', $uri, $matches)) {
        ProductController::update((int) $matches[1]);
        return;
    }

    // POST /admin/products/reorder
    if ($method === 'POST' && $uri === '/admin/products/reorder') {
        ProductController::reorder();
        return;
    }

    // DELETE /admin/products/{id}
    if ($method === 'DELETE' && preg_match('#^/admin/products/(\d+)$#', $uri, $matches)) {
        ProductController::destroy((int) $matches[1]);
        return;
    }

    // ========================================
    // ADMIN ORDER ROUTES
    // ========================================

    // GET /admin/orders
    if ($method === 'GET' && $uri === '/admin/orders') {
        OrderController::adminIndex();
        return;
    }

    // GET /admin/orders/{id}
    if ($method === 'GET' && preg_match('#^/admin/orders/(\d+)$#', $uri, $matches)) {
        OrderController::adminShow((int) $matches[1]);
        return;
    }

    // PUT /admin/orders/{id}/status
    if ($method === 'PUT' && preg_match('#^/admin/orders/(\d+)/status$#', $uri, $matches)) {
        OrderController::updateStatus((int) $matches[1]);
        return;
    }

    // ========================================
    // 404 — Not Found
    // ========================================
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}
