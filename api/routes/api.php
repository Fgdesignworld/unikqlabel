<?php
/**
 * API Router — Maps URLs to controller methods
 */

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../controllers/OrderController.php';
require_once __DIR__ . '/../controllers/NotificationController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../controllers/SeoController.php';
require_once __DIR__ . '/../controllers/SettingsController.php';
require_once __DIR__ . '/../controllers/PopupController.php';
require_once __DIR__ . '/../controllers/DeliveryController.php';

function handleRequest(): void {
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    // Strip /api prefix if present
    $uri = preg_replace('#^/api#', '', $uri);
    $uri = rtrim($uri, '/');

    // Apply global security middleware
    require_once __DIR__ . '/../middleware/rate_limit.php';
    require_once __DIR__ . '/../middleware/csrf.php';
    
    // CSRF Protection for state-changing methods
    if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
        requireCsrf();
    }

    // If empty, show API info
    if ($uri === '' || $uri === '/') {
        echo json_encode([
            'name'    => 'Lakshmi Home Foods API',
            'version' => '1.0.0',
            'status'  => 'running'
        ]);
        return;
    }

    // ========================================
    // PUBLIC ROUTES
    // ========================================

    // GET /products
    if ($method === 'GET' && $uri === '/products') {
        ProductController::index();
        return;
    }

    // GET /categories — Public active categories
    if ($method === 'GET' && $uri === '/categories') {
        CategoryController::index();
        return;
    }

    // GET /seo — Public SEO for any page
    if ($method === 'GET' && $uri === '/seo') {
        SeoController::getForPage();
        return;
    }

    // GET /settings — Public flat settings
    if ($method === 'GET' && $uri === '/settings') {
        SettingsController::index();
        return;
    }

    // GET /popup — Public active popup
    if ($method === 'GET' && $uri === '/popup') {
        PopupController::getActive();
        return;
    }

    // POST /popup/track — Public analytics (view/click)
    if ($method === 'POST' && $uri === '/popup/track') {
        PopupController::track();
        return;
    }

    // GET /delivery-rules — Public active delivery rule
    if ($method === 'GET' && $uri === '/delivery-rules') {
        DeliveryController::getActive();
        return;
    }

    // POST /delivery-calculate — Public fee calculator
    if ($method === 'POST' && $uri === '/delivery-calculate') {
        DeliveryController::calculate();
        return;
    }

    // POST /checkout
    if ($method === 'POST' && $uri === '/checkout') {
        OrderController::store();
        return;
    }

    // GET /csrf-token
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

    // GET /admin/products/{id}
    if ($method === 'GET' && preg_match('#^/admin/products/(\d+)$#', $uri, $matches)) {
        ProductController::show((int) $matches[1]);
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

    // GET /admin/orders/analytics
    if ($method === 'GET' && $uri === '/admin/orders/analytics') {
        OrderController::adminAnalytics();
        return;
    }

    // GET /admin/orders/chart
    if ($method === 'GET' && $uri === '/admin/orders/chart') {
        OrderController::adminChart();
        return;
    }

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
    // ADMIN NOTIFICATION ROUTES
    // ========================================

    // GET /admin/notifications
    if ($method === 'GET' && $uri === '/admin/notifications') {
        NotificationController::getAll();
        return;
    }

    // PUT /admin/notifications/read-all
    if ($method === 'PUT' && $uri === '/admin/notifications/read-all') {
        NotificationController::markAllRead();
        return;
    }

    // PUT /admin/notifications/{id}/read
    if ($method === 'PUT' && preg_match('#^/admin/notifications/(\d+)/read$#', $uri, $matches)) {
        NotificationController::markRead((int) $matches[1]);
        return;
    }

    // ========================================
    // ADMIN CATEGORY ROUTES
    // ========================================

    // GET /admin/categories
    if ($method === 'GET' && $uri === '/admin/categories') {
        CategoryController::adminIndex();
        return;
    }

    // POST /admin/categories/upload-image
    if ($method === 'POST' && $uri === '/admin/categories/upload-image') {
        CategoryController::uploadImage();
        return;
    }

    // GET /admin/categories/{id}
    if ($method === 'GET' && preg_match('#^/admin/categories/(\d+)$#', $uri, $matches)) {
        CategoryController::adminShow((int) $matches[1]);
        return;
    }

    // POST /admin/categories
    if ($method === 'POST' && $uri === '/admin/categories') {
        CategoryController::store();
        return;
    }

    // PUT /admin/categories/{id}/toggle
    if ($method === 'PUT' && preg_match('#^/admin/categories/(\d+)/toggle$#', $uri, $matches)) {
        CategoryController::toggle((int) $matches[1]);
        return;
    }

    // PUT /admin/categories/{id}
    if ($method === 'PUT' && preg_match('#^/admin/categories/(\d+)$#', $uri, $matches)) {
        CategoryController::update((int) $matches[1]);
        return;
    }

    // DELETE /admin/categories/{id}
    if ($method === 'DELETE' && preg_match('#^/admin/categories/(\d+)$#', $uri, $matches)) {
        CategoryController::destroy((int) $matches[1]);
        return;
    }

    // ========================================
    // ADMIN SEO ROUTES
    // ========================================

    // GET /admin/seo
    if ($method === 'GET' && $uri === '/admin/seo') {
        SeoController::adminIndex();
        return;
    }

    // GET /admin/seo/{id}
    if ($method === 'GET' && preg_match('#^/admin/seo/(\d+)$#', $uri, $matches)) {
        SeoController::adminShow((int) $matches[1]);
        return;
    }

    // POST /admin/seo — upsert
    if ($method === 'POST' && $uri === '/admin/seo') {
        SeoController::upsert();
        return;
    }

    // DELETE /admin/seo/{id}
    if ($method === 'DELETE' && preg_match('#^/admin/seo/(\d+)$#', $uri, $matches)) {
        SeoController::destroy((int) $matches[1]);
        return;
    }

    // ========================================
    // ADMIN SETTINGS ROUTES
    // ========================================

    // GET /admin/settings/grouped
    if ($method === 'GET' && $uri === '/admin/settings/grouped') {
        SettingsController::adminGrouped();
        return;
    }

    // POST /admin/settings/upload-logo
    if ($method === 'POST' && $uri === '/admin/settings/upload-logo') {
        SettingsController::uploadLogo();
        return;
    }

    // POST /admin/settings
    if ($method === 'POST' && $uri === '/admin/settings') {
        SettingsController::bulkUpdate();
        return;
    }

    // ========================================
    // ADMIN POPUP ROUTES
    // ========================================

    // GET /admin/popups
    if ($method === 'GET' && $uri === '/admin/popups') {
        PopupController::adminIndex();
        return;
    }

    // POST /admin/popups/upload-image
    if ($method === 'POST' && $uri === '/admin/popups/upload-image') {
        PopupController::uploadImage();
        return;
    }

    // GET /admin/popups/{id}
    if ($method === 'GET' && preg_match('#^/admin/popups/(\d+)$#', $uri, $matches)) {
        PopupController::adminShow((int) $matches[1]);
        return;
    }

    // POST /admin/popups
    if ($method === 'POST' && $uri === '/admin/popups') {
        PopupController::store();
        return;
    }

    // PUT /admin/popups/{id}/toggle
    if ($method === 'PUT' && preg_match('#^/admin/popups/(\d+)/toggle$#', $uri, $matches)) {
        PopupController::toggle((int) $matches[1]);
        return;
    }

    // PUT /admin/popups/{id}
    if ($method === 'PUT' && preg_match('#^/admin/popups/(\d+)$#', $uri, $matches)) {
        PopupController::update((int) $matches[1]);
        return;
    }

    // DELETE /admin/popups/{id}
    if ($method === 'DELETE' && preg_match('#^/admin/popups/(\d+)$#', $uri, $matches)) {
        PopupController::destroy((int) $matches[1]);
        return;
    }

    // ========================================
    // ADMIN DELIVERY ROUTES
    // ========================================

    // GET /admin/delivery-rules
    if ($method === 'GET' && $uri === '/admin/delivery-rules') {
        DeliveryController::adminGet();
        return;
    }

    // POST /admin/delivery-rules
    if ($method === 'POST' && $uri === '/admin/delivery-rules') {
        DeliveryController::adminUpdate();
        return;
    }

    // ========================================
    // 404 — Not Found
    // ========================================
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}
