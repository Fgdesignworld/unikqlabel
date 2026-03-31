<?php
/**
 * Secure File Upload Helper
 *
 * Centralised, MIME-verified upload used by every controller.
 * Rules enforced:
 *   - MIME checked against the actual file bytes (not extension / Content-Type header)
 *   - Extension derived from MIME, never from the original filename
 *   - Filename is a random UUID — original name is discarded
 *   - Size capped (default 5 MB)
 *   - Upload directory stays outside web-root or is guarded by index.php path-traversal check
 *   - SVG is rejected (XSS vector when served inline)
 */

/** Allowed MIME → safe extension map (NO svg/gif/bmp allowed) */
const ALLOWED_IMAGE_MIMES = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
];

/**
 * Validate and save an uploaded image file.
 *
 * @param  array  $file       Entry from $_FILES (e.g. $_FILES['image'])
 * @param  string $destDir    Absolute directory path (will be created if absent)
 * @param  string $prefix     Filename prefix (e.g. 'product_', 'hero_')
 * @param  int    $maxBytes   Max allowed size in bytes (default 5 MB)
 * @return array  ['ok' => bool, 'path' => '/uploads/…/filename.ext', 'error' => '…']
 */
function secureUploadImage(
    array  $file,
    string $destDir,
    string $prefix   = 'img_',
    int    $maxBytes = 5 * 1024 * 1024
): array {
    // 1. Check upload error code first
    if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
        $msgs = [
            UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload limit.',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds form upload limit.',
            UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded.',
            UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Server temporary directory is missing.',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
            UPLOAD_ERR_EXTENSION  => 'Upload stopped by extension.',
        ];
        $code = $file['error'] ?? UPLOAD_ERR_NO_FILE;
        return ['ok' => false, 'error' => $msgs[$code] ?? 'Unknown upload error.'];
    }

    // 2. Must be a genuine HTTP upload (not a local file path trick)
    if (!is_uploaded_file($file['tmp_name'])) {
        return ['ok' => false, 'error' => 'Invalid upload.'];
    }

    // 3. Size check
    if ($file['size'] > $maxBytes) {
        $mb = round($maxBytes / 1024 / 1024);
        return ['ok' => false, 'error' => "File too large. Maximum is {$mb} MB."];
    }

    // 4. MIME detection from actual file bytes — not from $_FILES['type'] or extension
    $mime = mime_content_type($file['tmp_name']);
    if (!array_key_exists($mime, ALLOWED_IMAGE_MIMES)) {
        $allowed = implode(', ', array_keys(ALLOWED_IMAGE_MIMES));
        return ['ok' => false, 'error' => "Invalid file type ({$mime}). Allowed: {$allowed}."];
    }

    // 5. Derive safe extension from MIME — discard original filename entirely
    $ext = ALLOWED_IMAGE_MIMES[$mime];

    // 6. Generate unpredictable filename
    $filename = $prefix . bin2hex(random_bytes(12)) . '.' . $ext;

    // 7. Ensure destination directory exists and is not world-writable
    if (!is_dir($destDir)) {
        mkdir($destDir, 0755, true);
    }

    $dest = rtrim($destDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $filename;

    // 8. Move (atomic on most OS)
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        return ['ok' => false, 'error' => 'Failed to save file.'];
    }

    // 9. Build relative URL path (everything under /api/uploads/ is served by index.php)
    //    Strip the absolute api directory prefix to get the portable relative URL
    $apiDir   = realpath(__DIR__ . '/../');
    $destReal = realpath($dest);
    $relPath  = '/' . ltrim(str_replace($apiDir, '', $destReal), '/\\');
    $urlPath  = str_replace(DIRECTORY_SEPARATOR, '/', $relPath);

    return ['ok' => true, 'path' => $urlPath, 'error' => ''];
}

/**
 * Delete an uploaded file safely (prevents path traversal).
 * Pass the relative URL path (e.g. '/uploads/products/img_xxx.jpg').
 */
function secureDeleteUpload(string $relativePath): void {
    if (empty($relativePath)) return;

    $apiDir  = realpath(__DIR__ . '/../');
    $absPath = realpath($apiDir . DIRECTORY_SEPARATOR . ltrim($relativePath, '/\\'));

    // Ensure the resolved path is still inside the api/uploads directory
    $uploadsDir = realpath($apiDir . '/uploads');
    if ($absPath && $uploadsDir && strpos($absPath, $uploadsDir) === 0 && is_file($absPath)) {
        unlink($absPath);
    }
}
