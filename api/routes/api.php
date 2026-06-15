<?php
/**
 * API Router — Maps URLs to controller methods
 */

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/HeroSlideController.php';
require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../controllers/OrderController.php';
require_once __DIR__ . '/../controllers/NotificationController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../controllers/SeoController.php';
require_once __DIR__ . '/../controllers/SettingsController.php';
require_once __DIR__ . '/../controllers/PopupController.php';
require_once __DIR__ . '/../controllers/DeliveryController.php';
require_once __DIR__ . '/../controllers/ReviewController.php';
require_once __DIR__ . '/../controllers/ContactController.php';
require_once __DIR__ . '/../controllers/CouponController.php';
require_once __DIR__ . '/../controllers/InventoryController.php';
require_once __DIR__ . '/../controllers/PaymentController.php';

function handleRequest(): void {
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    // Strip /api prefix if present
    $uri = preg_replace('#^/api#', '', $uri);
    $uri = rtrim($uri, '/');

    // Apply global security middleware
    require_once __DIR__ . '/../middleware/rate_limit.php';
    require_once __DIR__ . '/../middleware/csrf.php';
    
    // Global rate limit — only on state-changing requests (POST/PUT/DELETE).
    // GET requests are NOT globally rate-limited here; sensitive actions
    // (login, checkout, coupon, contact) have their own tighter limits below.
    if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
        checkRateLimit('default');
    }

    // CSRF Protection for state-changing methods
    if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
        requireCsrf();
    }

    // If empty, show minimal API info (no sensitive details)
    if ($uri === '' || $uri === '/') {
        echo json_encode([
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

    // GET /products/{slug} — Public product detail
    if ($method === 'GET' && preg_match('#^/products/([a-z0-9\-]+)$#', $uri, $m)) {
        ProductController::showPublic($m[1]);
        return;
    }

    // GET /categories/tree — Public hierarchical category tree
    if ($method === 'GET' && $uri === '/categories/tree') {
        CategoryController::tree();
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

    // GET /hero-slides — Public active slides for hero carousel
    if ($method === 'GET' && $uri === '/hero-slides') {
        HeroSlideController::publicIndex();
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

    // POST /checkout (COD orders — existing flow unchanged)
    if ($method === 'POST' && $uri === '/checkout') {
        OrderController::store();
        return;
    }

    // ── Razorpay Online Payment Routes ──────────────────────────────────────

    // POST /payment/create-order — Create pending order + Razorpay order
    if ($method === 'POST' && $uri === '/payment/create-order') {
        PaymentController::createOrder();
        return;
    }

    // POST /payment/verify — Verify Razorpay signature + mark order paid
    if ($method === 'POST' && $uri === '/payment/verify') {
        PaymentController::verifyPayment();
        return;
    }

    // POST /payment/cancel — Mark pending payment order as failed (popup dismissed)
    if ($method === 'POST' && $uri === '/payment/cancel') {
        PaymentController::cancelOrder();
        return;
    }

    // POST /coupons/validate — Public coupon validation
    if ($method === 'POST' && $uri === '/coupons/validate') {
        CouponController::validateCoupon();
        return;
    }

    // GET /orders/track — Public order tracking by phone or invoice
    if ($method === 'GET' && $uri === '/orders/track') {
        OrderController::track();
        return;
    }

    // ========================================
    // PUBLIC REVIEW ROUTES
    // ========================================

    // GET /reviews?product_id=X
    if ($method === 'GET' && $uri === '/reviews') {
        ReviewController::index();
        return;
    }

    // GET /reviews/verify?token=XYZ
    if ($method === 'GET' && $uri === '/reviews/verify') {
        ReviewController::verify();
        return;
    }

    // POST /reviews
    if ($method === 'POST' && $uri === '/reviews') {
        ReviewController::store();
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

    // POST /admin/account/change-password
    if ($method === 'POST' && $uri === '/admin/account/change-password') {
        AuthController::changePassword();
        return;
    }

    // POST /admin/account/change-email
    if ($method === 'POST' && $uri === '/admin/account/change-email') {
        AuthController::changeEmail();
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
    // ADMIN INVENTORY ROUTES
    // ========================================

    // GET /admin/inventory/all — every row across all products
    if ($method === 'GET' && $uri === '/admin/inventory/all') {
        InventoryController::showAll();
        return;
    }

    // GET /admin/inventory/{product_id}
    if ($method === 'GET' && preg_match('#^/admin/inventory/(\d+)$#', $uri, $matches)) {
        InventoryController::show((int) $matches[1]);
        return;
    }

    // PUT /admin/inventory/{product_id}
    if ($method === 'PUT' && preg_match('#^/admin/inventory/(\d+)$#', $uri, $matches)) {
        InventoryController::update((int) $matches[1]);
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

    // PUT /admin/orders/{id}/restore
    if ($method === 'PUT' && preg_match('#^/admin/orders/(\d+)/restore$#', $uri, $matches)) {
        OrderController::adminRestore((int) $matches[1]);
        return;
    }

    // PUT /admin/orders/{id}/payment
    if ($method === 'PUT' && preg_match('#^/admin/orders/(\d+)/payment$#', $uri, $matches)) {
        OrderController::updatePayment((int) $matches[1]);
        return;
    }

    // DELETE /admin/orders/{id}/force
    if ($method === 'DELETE' && preg_match('#^/admin/orders/(\d+)/force$#', $uri, $matches)) {
        OrderController::adminForceDelete((int) $matches[1]);
        return;
    }

    // DELETE /admin/orders/{id}
    if ($method === 'DELETE' && preg_match('#^/admin/orders/(\d+)$#', $uri, $matches)) {
        OrderController::adminDelete((int) $matches[1]);
        return;
    }

    // ========================================
    // ADMIN CUSTOMER ROUTES
    // ========================================

    // GET /admin/customers — list customers (grouped by phone)
    if ($method === 'GET' && $uri === '/admin/customers') {
        OrderController::adminCustomers();
        return;
    }

    // GET /admin/customers/{phone}/orders — orders for a customer
    if ($method === 'GET' && preg_match('#^/admin/customers/([0-9]+)/orders$#', $uri, $matches)) {
        OrderController::adminCustomerOrders($matches[1]);
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
    // ADMIN REVIEW ROUTES
    // ========================================

    // GET /admin/reviews
    if ($method === 'GET' && $uri === '/admin/reviews') {
        ReviewController::adminIndex();
        return;
    }

    // PUT /admin/reviews/{id}/approve
    if ($method === 'PUT' && preg_match('#^/admin/reviews/(\d+)/approve$#', $uri, $matches)) {
        ReviewController::approve((int) $matches[1]);
        return;
    }

    // PUT /admin/reviews/{id}/reject
    if ($method === 'PUT' && preg_match('#^/admin/reviews/(\d+)/reject$#', $uri, $matches)) {
        ReviewController::reject((int) $matches[1]);
        return;
    }

    // DELETE /admin/reviews/{id}
    if ($method === 'DELETE' && preg_match('#^/admin/reviews/(\d+)$#', $uri, $matches)) {
        ReviewController::destroy((int) $matches[1]);
        return;
    }

    // POST /admin/reviews  (admin direct create)
    if ($method === 'POST' && $uri === '/admin/reviews') {
        ReviewController::adminStore();
        return;
    }

    // PUT /admin/reviews/{id}  (admin edit)
    if ($method === 'PUT' && preg_match('#^/admin/reviews/(\d+)$#', $uri, $matches)) {
        ReviewController::adminUpdate((int) $matches[1]);
        return;
    }

    // ========================================
    // ADMIN HERO SLIDE ROUTES
    // ========================================

    // GET /admin/hero-slides
    if ($method === 'GET' && $uri === '/admin/hero-slides') {
        HeroSlideController::index();
        return;
    }

    // POST /admin/hero-slides/upload-image
    if ($method === 'POST' && $uri === '/admin/hero-slides/upload-image') {
        HeroSlideController::uploadImage();
        return;
    }

    // POST /admin/hero-slides/reorder
    if ($method === 'POST' && $uri === '/admin/hero-slides/reorder') {
        HeroSlideController::reorder();
        return;
    }

    // GET /admin/hero-slides/{id}
    if ($method === 'GET' && preg_match('#^/admin/hero-slides/(\d+)$#', $uri, $matches)) {
        HeroSlideController::show((int) $matches[1]);
        return;
    }

    // POST /admin/hero-slides
    if ($method === 'POST' && $uri === '/admin/hero-slides') {
        HeroSlideController::store();
        return;
    }

    // PUT /admin/hero-slides/{id}/toggle
    if ($method === 'PUT' && preg_match('#^/admin/hero-slides/(\d+)/toggle$#', $uri, $matches)) {
        HeroSlideController::toggleStatus((int) $matches[1]);
        return;
    }

    // PUT /admin/hero-slides/{id}
    if ($method === 'PUT' && preg_match('#^/admin/hero-slides/(\d+)$#', $uri, $matches)) {
        HeroSlideController::update((int) $matches[1]);
        return;
    }

    // DELETE /admin/hero-slides/{id}
    if ($method === 'DELETE' && preg_match('#^/admin/hero-slides/(\d+)$#', $uri, $matches)) {
        HeroSlideController::destroy((int) $matches[1]);
        return;
    }

    // ========================================
    // PUBLIC CONTACT / LEAD ROUTES
    // ========================================

    // POST /contact/submit
    if ($method === 'POST' && $uri === '/contact/submit') {
        ContactController::submit();
        return;
    }

    // ========================================
    // ADMIN LEADS ROUTES
    // ========================================

    // GET /admin/leads/upcoming
    if ($method === 'GET' && $uri === '/admin/leads/upcoming') {
        ContactController::upcoming();
        return;
    }

    // GET /admin/leads/daily-stats
    if ($method === 'GET' && $uri === '/admin/leads/daily-stats') {
        ContactController::dailyStats();
        return;
    }

    // GET /admin/leads/stats
    if ($method === 'GET' && $uri === '/admin/leads/stats') {
        ContactController::stats();
        return;
    }

    // GET /admin/leads/export
    if ($method === 'GET' && $uri === '/admin/leads/export') {
        ContactController::export();
        return;
    }

    // GET /admin/leads
    if ($method === 'GET' && $uri === '/admin/leads') {
        ContactController::index();
        return;
    }

    // GET /admin/leads/{id}
    if ($method === 'GET' && preg_match('#^/admin/leads/(\d+)$#', $uri, $matches)) {
        ContactController::show((int) $matches[1]);
        return;
    }

    // PATCH /admin/leads/{id}/status
    if ($method === 'PATCH' && preg_match('#^/admin/leads/(\d+)/status$#', $uri, $matches)) {
        ContactController::updateStatus((int) $matches[1]);
        return;
    }

    // POST /admin/leads/{id}/followup
    if ($method === 'POST' && preg_match('#^/admin/leads/(\d+)/followup$#', $uri, $matches)) {
        ContactController::addFollowup((int) $matches[1]);
        return;
    }

    // DELETE /admin/leads/{id}
    if ($method === 'DELETE' && preg_match('#^/admin/leads/(\d+)$#', $uri, $matches)) {
        ContactController::destroy((int) $matches[1]);
        return;
    }

    // ========================================
    // ADMIN COUPON ROUTES
    // ========================================

    // GET /admin/coupons
    if ($method === 'GET' && $uri === '/admin/coupons') {
        CouponController::adminIndex();
        return;
    }

    // GET /admin/coupons/{id}
    if ($method === 'GET' && preg_match('#^/admin/coupons/(\d+)$#', $uri, $matches)) {
        CouponController::adminShow((int) $matches[1]);
        return;
    }

    // POST /admin/coupons
    if ($method === 'POST' && $uri === '/admin/coupons') {
        CouponController::adminStore();
        return;
    }

    // PUT /admin/coupons/{id}/toggle
    if ($method === 'PUT' && preg_match('#^/admin/coupons/(\d+)/toggle$#', $uri, $matches)) {
        CouponController::adminToggle((int) $matches[1]);
        return;
    }

    // PUT /admin/coupons/{id}
    if ($method === 'PUT' && preg_match('#^/admin/coupons/(\d+)$#', $uri, $matches)) {
        CouponController::adminUpdate((int) $matches[1]);
        return;
    }

    // DELETE /admin/coupons/{id}
    if ($method === 'DELETE' && preg_match('#^/admin/coupons/(\d+)$#', $uri, $matches)) {
        CouponController::adminDestroy((int) $matches[1]);
        return;
    }

    // ========================================
    // 404 — Not Found
    // ========================================
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}
