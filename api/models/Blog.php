<?php
/**
 * Blog Model — Full CRUD for blog_posts table
 */

require_once __DIR__ . '/../config/database.php';

class Blog {

    // ── Public queries ─────────────────────────────────────────────────────

    /**
     * Get all published posts (public listing), optional category filter
     */
    public static function getPublished(array $filters = []): array {
        $db     = getDB();
        $where  = ["status = 'published'"];
        $params = [];

        if (!empty($filters['category'])) {
            $where[]              = 'category = :category';
            $params['category']   = $filters['category'];
        }
        if (!empty($filters['search'])) {
            $where[]            = '(title LIKE :search OR excerpt LIKE :search)';
            $params['search']   = '%' . $filters['search'] . '%';
        }
        if (!empty($filters['featured'])) {
            $where[]  = 'featured = 1';
        }

        $limit  = min((int)($filters['limit']  ?? 20), 100);
        $offset = max((int)($filters['offset'] ?? 0), 0);

        $sql  = 'SELECT id, title, slug, excerpt, cover_image, author, category, tags,
                        status, featured, views, read_time, published_at, created_at, updated_at
                 FROM blog_posts';
        $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY published_at DESC, id DESC';
        $sql .= " LIMIT {$limit} OFFSET {$offset}";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $posts = $stmt->fetchAll();

        foreach ($posts as &$p) {
            self::normalize($p);
        }
        return $posts;
    }

    /**
     * Count published posts (for pagination)
     */
    public static function countPublished(array $filters = []): int {
        $db     = getDB();
        $where  = ["status = 'published'"];
        $params = [];

        if (!empty($filters['category'])) {
            $where[]            = 'category = :category';
            $params['category'] = $filters['category'];
        }
        if (!empty($filters['search'])) {
            $where[]          = '(title LIKE :search OR excerpt LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        $sql  = 'SELECT COUNT(*) FROM blog_posts WHERE ' . implode(' AND ', $where);
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    /**
     * Find a published post by slug (increments view counter)
     */
    public static function findBySlug(string $slug, bool $incrementViews = false): ?array {
        $db   = getDB();
        $stmt = $db->prepare(
            "SELECT * FROM blog_posts WHERE slug = :slug AND status = 'published' LIMIT 1"
        );
        $stmt->execute(['slug' => $slug]);
        $post = $stmt->fetch();
        if (!$post) return null;

        if ($incrementViews) {
            $db->prepare("UPDATE blog_posts SET views = views + 1 WHERE id = :id")
               ->execute(['id' => $post['id']]);
            $post['views']++;
        }

        self::normalize($post);
        return $post;
    }

    /**
     * Get distinct published categories
     */
    public static function getPublishedCategories(): array {
        $db   = getDB();
        $stmt = $db->query(
            "SELECT DISTINCT category FROM blog_posts WHERE status = 'published' ORDER BY category ASC"
        );
        return $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }

    // ── Admin queries ──────────────────────────────────────────────────────

    /**
     * Get all posts (admin) — any status, newest first
     */
    public static function getAll(array $filters = []): array {
        $db     = getDB();
        $where  = [];
        $params = [];

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $where[]          = 'status = :status';
            $params['status'] = $filters['status'];
        }
        if (!empty($filters['search'])) {
            $where[]          = '(title LIKE :search OR author LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        $sql  = 'SELECT id, title, slug, excerpt, cover_image, author, category, tags,
                        status, featured, views, read_time, published_at, created_at, updated_at
                 FROM blog_posts';
        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY created_at DESC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $posts = $stmt->fetchAll();

        foreach ($posts as &$p) {
            self::normalize($p);
        }
        return $posts;
    }

    /**
     * Find a post by ID (admin — any status)
     */
    public static function findById(int $id): ?array {
        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM blog_posts WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $post = $stmt->fetch();
        if (!$post) return null;
        self::normalize($post);
        return $post;
    }

    /**
     * Create a new post — returns the new ID
     */
    public static function create(array $data): int {
        $db   = getDB();
        $slug = self::uniqueSlug($data['slug'] ?? self::toSlug($data['title']), 0);

        $stmt = $db->prepare("
            INSERT INTO blog_posts
                (title, slug, excerpt, content, cover_image, author, category, tags,
                 status, featured, read_time, meta_title, meta_desc, published_at)
            VALUES
                (:title, :slug, :excerpt, :content, :cover_image, :author, :category, :tags,
                 :status, :featured, :read_time, :meta_title, :meta_desc, :published_at)
        ");
        $stmt->execute([
            'title'        => mb_substr(trim($data['title']), 0, 300),
            'slug'         => $slug,
            'excerpt'      => !empty($data['excerpt'])     ? mb_substr(trim($data['excerpt']), 0, 1000) : null,
            'content'      => $data['content']             ?? null,
            'cover_image'  => $data['cover_image']         ?? null,
            'author'       => mb_substr(trim($data['author'] ?? 'Admin'), 0, 150),
            'category'     => mb_substr(trim($data['category'] ?? 'General'), 0, 100),
            'tags'         => !empty($data['tags'])        ? json_encode($data['tags']) : null,
            'status'       => in_array($data['status'] ?? 'draft', ['draft','published']) ? $data['status'] : 'draft',
            'featured'     => empty($data['featured'])     ? 0 : 1,
            'read_time'    => !empty($data['read_time'])   ? (int)$data['read_time'] : null,
            'meta_title'   => !empty($data['meta_title'])  ? mb_substr(trim($data['meta_title']),  0, 300) : null,
            'meta_desc'    => !empty($data['meta_desc'])   ? mb_substr(trim($data['meta_desc']),   0, 500) : null,
            'published_at' => ($data['status'] ?? 'draft') === 'published'
                ? ($data['published_at'] ?? date('Y-m-d H:i:s'))
                : null,
        ]);
        return (int) $db->lastInsertId();
    }

    /**
     * Update an existing post
     */
    public static function update(int $id, array $data): void {
        $db      = getDB();
        $current = self::findById($id);
        if (!$current) return;

        // Re-slug only if the slug field changed
        $newSlug = !empty($data['slug']) ? $data['slug'] : $current['slug'];
        if ($newSlug !== $current['slug']) {
            $newSlug = self::uniqueSlug($newSlug, $id);
        }

        // Set published_at when transitioning to published (once)
        $newStatus = $data['status'] ?? $current['status'];
        $publishedAt = $current['published_at'];
        if ($newStatus === 'published' && !$publishedAt) {
            $publishedAt = $data['published_at'] ?? date('Y-m-d H:i:s');
        }

        $stmt = $db->prepare("
            UPDATE blog_posts SET
                title        = :title,
                slug         = :slug,
                excerpt      = :excerpt,
                content      = :content,
                cover_image  = :cover_image,
                author       = :author,
                category     = :category,
                tags         = :tags,
                status       = :status,
                featured     = :featured,
                read_time    = :read_time,
                meta_title   = :meta_title,
                meta_desc    = :meta_desc,
                published_at = :published_at
            WHERE id = :id
        ");
        $stmt->execute([
            'id'           => $id,
            'title'        => mb_substr(trim($data['title']  ?? $current['title']),  0, 300),
            'slug'         => $newSlug,
            'excerpt'      => !empty($data['excerpt'])
                                ? mb_substr(trim($data['excerpt']), 0, 1000)
                                : $current['excerpt'],
            'content'      => $data['content']     ?? $current['content'],
            'cover_image'  => array_key_exists('cover_image', $data) ? $data['cover_image'] : $current['cover_image'],
            'author'       => mb_substr(trim($data['author']   ?? $current['author']),   0, 150),
            'category'     => mb_substr(trim($data['category'] ?? $current['category']), 0, 100),
            'tags'         => !empty($data['tags'])
                                ? json_encode($data['tags'])
                                : $current['tags'],
            'status'       => in_array($newStatus, ['draft','published']) ? $newStatus : $current['status'],
            'featured'     => isset($data['featured']) ? (empty($data['featured']) ? 0 : 1) : $current['featured'],
            'read_time'    => !empty($data['read_time'])  ? (int)$data['read_time']  : $current['read_time'],
            'meta_title'   => array_key_exists('meta_title', $data)
                                ? (!empty($data['meta_title']) ? mb_substr(trim($data['meta_title']), 0, 300) : null)
                                : $current['meta_title'],
            'meta_desc'    => array_key_exists('meta_desc', $data)
                                ? (!empty($data['meta_desc'])  ? mb_substr(trim($data['meta_desc']),  0, 500) : null)
                                : $current['meta_desc'],
            'published_at' => $newStatus === 'published' ? $publishedAt : null,
        ]);
    }

    /**
     * Toggle draft/published
     */
    public static function toggleStatus(int $id): string {
        $db      = getDB();
        $current = self::findById($id);
        if (!$current) return 'draft';

        $newStatus = $current['status'] === 'published' ? 'draft' : 'published';
        $pub = $newStatus === 'published' && !$current['published_at']
            ? date('Y-m-d H:i:s') : $current['published_at'];

        $db->prepare("UPDATE blog_posts SET status = :s, published_at = :p WHERE id = :id")
           ->execute(['s' => $newStatus, 'p' => $pub, 'id' => $id]);
        return $newStatus;
    }

    /**
     * Delete a post
     */
    public static function delete(int $id): void {
        $db = getDB();
        $db->prepare("DELETE FROM blog_posts WHERE id = :id")->execute(['id' => $id]);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    /**
     * Normalize a row fetched from PDO: cast types, decode JSON.
     */
    private static function normalize(array &$row): void {
        $row['id']       = (int)  $row['id'];
        $row['featured'] = (bool) $row['featured'];
        $row['views']    = (int)  $row['views'];
        if (isset($row['read_time'])) $row['read_time'] = (int) $row['read_time'];

        // Decode tags JSON back to array
        if (!empty($row['tags'])) {
            $decoded = json_decode($row['tags'], true);
            $row['tags'] = is_array($decoded) ? $decoded : [];
        } else {
            $row['tags'] = [];
        }
    }

    /**
     * Convert a title to a URL slug
     */
    public static function toSlug(string $title): string {
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9\s\-]/', '', $slug);
        $slug = preg_replace('/[\s\-]+/', '-', $slug);
        return trim($slug, '-');
    }

    /**
     * Ensure slug is unique — appends -2, -3 … as needed
     */
    private static function uniqueSlug(string $slug, int $excludeId = 0): string {
        $db       = getDB();
        $base     = $slug;
        $counter  = 1;

        while (true) {
            $stmt = $db->prepare(
                "SELECT COUNT(*) FROM blog_posts WHERE slug = :slug AND id != :id"
            );
            $stmt->execute(['slug' => $slug, 'id' => $excludeId]);
            if ((int)$stmt->fetchColumn() === 0) break;
            $counter++;
            $slug = $base . '-' . $counter;
        }
        return $slug;
    }
}
