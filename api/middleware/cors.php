<?php
/**
 * CORS Middleware — Restrict origins to known domains only
 *
 * Add your production domain to $allowedOrigins before going live.
 */
function handleCors(): void {
    $allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        // TODO: add production URL e.g. 'https://unikqlabel.com'
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Unknown origin — do not reflect it back
        header('Access-Control-Allow-Origin: null');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
