<?php
/**
 * Security Helpers
 *
 * - sanitizeInput()  — strip tags + trim for plain-text fields
 * - sanitizeHtml()   — allow a safe subset of HTML for CMS content
 * - validateInt()    — cast + range check
 * - validateFloat()  — cast + range check
 * - validateEnum()   — ensure value is in allowed list
 * - logSecurityEvent() — append to security.log (never sent to client)
 */

/**
 * Strip HTML tags and trim a plain-text string.
 * Use for names, addresses, phone numbers, etc.
 */
function sanitizeInput(mixed $value, int $maxLen = 500): string {
    if ($value === null || $value === false) return '';
    $str = is_string($value) ? $value : (string) $value;
    $str = strip_tags($str);
    $str = trim($str);
    // Limit length to prevent DB overflow / DoS via huge strings
    if (mb_strlen($str) > $maxLen) {
        $str = mb_substr($str, 0, $maxLen);
    }
    return $str;
}

/**
 * Allow a very limited set of HTML tags for CMS blocks.
 * Strips anything not in the allowlist. Multi-layer XSS defence.
 */
function sanitizeHtml(mixed $value, int $maxLen = 50000): string {
    if ($value === null) return '';
    $str = is_string($value) ? $value : (string) $value;
    // strip_tags allowlist — no script, no style, no event attributes
    $allowed = '<p><br><b><strong><i><em><ul><ol><li><h2><h3><h4><a><img><blockquote><hr><span>';
    $str = strip_tags($str, $allowed);
    // Remove ALL event handler attributes (onclick, onerror, onload, etc.)
    // Handles whitespace/newline obfuscation: on\s*error, on\n*click, etc.
    $str = preg_replace('/\bon\w[\w\-]*\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)/si', '', $str);
    // Remove javascript:, vbscript:, data: URI schemes in href/src attributes
    $str = preg_replace('/(href|src|action)\s*=\s*["\']?\s*(javascript|vbscript|data)\s*:/si', '$1="#"', $str);
    // Remove expression() in style attributes (IE CSS expression attack)
    $str = preg_replace('/style\s*=\s*["\'][^"\']*expression\s*\([^"\']*["\']/si', '', $str);
    // Remove style attributes containing url() (CSS injection vector)
    $str = preg_replace('/style\s*=\s*["\'][^"\']*url\s*\([^"\']*["\']/si', '', $str);
    return mb_substr(trim($str), 0, $maxLen);
}

/**
 * Cast to int and optionally enforce min/max.
 * Returns null if the value is not numeric.
 */
function validateInt(mixed $value, ?int $min = null, ?int $max = null): ?int {
    if ($value === null || $value === '') return null;
    if (!is_numeric($value)) return null;
    $int = (int) $value;
    if ($min !== null && $int < $min) return null;
    if ($max !== null && $int > $max) return null;
    return $int;
}

/**
 * Cast to float and optionally enforce min/max.
 * Returns null if invalid.
 */
function validateFloat(mixed $value, float $min = 0.0, ?float $max = null): ?float {
    if ($value === null || $value === '') return null;
    if (!is_numeric($value)) return null;
    $f = (float) $value;
    if ($f < $min) return null;
    if ($max !== null && $f > $max) return null;
    return $f;
}

/**
 * Ensure a value is in an explicit allowed list.
 * Returns null if not found.
 */
function validateEnum(mixed $value, array $allowed): mixed {
    return in_array($value, $allowed, true) ? $value : null;
}

/**
 * Append a structured line to storage/security.log.
 * Never throws — logging must never break the request.
 *
 * @param string $event   e.g. 'login_failed', 'coupon_abuse', 'rate_limited'
 * @param array  $context Additional data to record
 */
function logSecurityEvent(string $event, array $context = []): void {
    try {
        $logDir  = __DIR__ . '/../storage/';
        $logFile = $logDir . 'security.log';

        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $ip      = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $ua      = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200);
        $uri     = $_SERVER['REQUEST_URI'] ?? '';
        $ts      = date('Y-m-d H:i:s');

        $line = json_encode([
            'ts'      => $ts,
            'event'   => $event,
            'ip'      => $ip,
            'uri'     => $uri,
            'ua'      => $ua,
            'context' => $context,
        ]) . PHP_EOL;

        // Rotate if > 10 MB
        if (file_exists($logFile) && filesize($logFile) > 10 * 1024 * 1024) {
            rename($logFile, $logFile . '.' . date('Ymd-His') . '.bak');
        }

        file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
    } catch (\Throwable $e) {
        // Silently swallow — logging must never crash the app
        error_log('Security log write failed: ' . $e->getMessage());
    }
}
