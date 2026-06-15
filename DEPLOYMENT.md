# Production Deployment Checklist

## 1. Upload Files to Production Server

Make sure these directories and files exist on your production server:

```
/public_html/
├── .env                          ← UPDATE with production credentials
├── .htaccess                     ← MUST be present
├── index.html
├── dist/                         ← React build output
└── api/
    ├── .htaccess                 ← CRITICAL: API routing rules
    ├── index.php                 ← API entry point
    ├── config/
    ├── controllers/
    ├── helpers/
    ├── middleware/
    ├── migrations/
    ├── models/
    ├── routes/
    ├── storage/
    └── uploads/
```

## 2. Update Production .env File

Replace the .env file on your server with production credentials:

```env
DB_HOST=localhost
DB_NAME=cgqyspyd_koffeekup
DB_USER=cgqyspyd_koffeekup
DB_PASS=Ni();.M^gBP7=eqN
DB_CHARSET=utf8mb4

APP_URL=https://koffeekup.com

CORS_ORIGIN=https://koffeekup.com
```

## 3. Apache Configuration (CRITICAL for fixing 403 errors)

### Enable mod_rewrite

Ask your hosting provider to enable `mod_rewrite` module or check if it's already enabled:

```bash
# SSH into server and run:
a2enmod rewrite
systemctl restart apache2
```

### Verify .htaccess Files Are Present

**Root .htaccess** (`/public_html/.htaccess`):
- Handles React routing (rewrites to index.html)
- Sets security headers

**API .htaccess** (`/public_html/api/.htaccess`):
- Routes all API requests to index.php
- Blocks direct access to PHP files and directories

### Check File Permissions

```bash
chmod 644 /public_html/.env          # Config file
chmod 644 /public_html/.htaccess     # Root routing
chmod 755 /public_html/api/          # API directory
chmod 644 /public_html/api/.htaccess # API routing
chmod 755 /public_html/api/storage/  # Rate limit storage
chmod 755 /public_html/api/uploads/  # File uploads
```

## 4. Verify Deployment

### Test Diagnostic Endpoint

Upload `api/test.php` and visit:
```
https://koffeekup.com/api/test.php
```

This will show:
- ✅ mod_rewrite status
- ✅ File permissions
- ✅ .env loading
- ✅ Database connection

### Test API Endpoints

Once diagnostic passes, test in browser console:

```javascript
// Test public API (should return data)
fetch('https://koffeekup.com/api/products')
  .then(r => r.json())
  .then(d => console.log('✅ Products:', d.length))
  .catch(e => console.error('❌ Error:', e.message));

// Test CORS (should return data with proper CORS headers)
fetch('https://koffeekup.com/api/hero-slides')
  .then(r => r.json())
  .then(d => console.log('✅ Hero Slides:', d.length))
  .catch(e => console.error('❌ Error:', e.message));
```

## 5. If Still Getting 403 Errors

If you still see 403 Forbidden after checking everything above:

1. **Check server error logs:**
   ```bash
   tail -f /var/log/apache2/error.log
   # or through cPanel/hosting panel
   ```

2. **Verify mod_rewrite is REALLY enabled:**
   ```php
   <?php
   if (function_exists('apache_get_modules')) {
       echo in_array('mod_rewrite', apache_get_modules()) ? 'YES' : 'NO';
   }
   ?>
   ```

3. **Check if .htaccess is being read:**
   - Add invalid syntax to test (should trigger 500 error)
   - If no 500 error, .htaccess isn't being processed

4. **Last resort - use DirectoryIndex:**
   Add to root `.htaccess`:
   ```apache
   DirectoryIndex index.html index.php
   ```

## 6. Important Notes

- ⚠️ Do NOT commit `.env` to Git
- ⚠️ Do NOT expose database credentials in frontend code
- ⚠️ Ensure `api/uploads/` and `api/storage/` directories are writable
- ⚠️ SSL certificate must be valid for CORS to work
- ⚠️ Production DB credentials must match your hosting provider's setup

## 7. Troubleshooting 403 Errors

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| 403 on all `/api/` routes | mod_rewrite disabled | Enable mod_rewrite |
| 403 only on some routes | Directory permissions | `chmod 755 api/` |
| 403 with "Order Deny,Allow" | Old .htaccess syntax | Update to `Require all granted` |
| CORS errors despite 200 OK | Wrong CORS_ORIGIN in .env | Verify CORS_ORIGIN matches domain |

