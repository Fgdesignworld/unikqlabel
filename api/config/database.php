<?php
/**
 * Database Configuration — UNIKQ LABEL
 * 
 * Update these credentials for your environment.
 */

// define('DB_HOST', 'localhost');
// define('DB_NAME', 'cgqyspyd_unikqlabel');
// define('DB_USER', 'cgqyspyd_unikqlabel');
// define('DB_PASS', 'Ni();.M^gBP7=eqN');
// define('DB_CHARSET', 'utf8mb4');

define('DB_HOST', 'localhost');
define('DB_NAME', 'unikqlabel');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Get PDO connection instance (singleton)
 */
function getDB(): PDO {
    static $pdo = null;
    
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
    }
    
    return $pdo;
}
