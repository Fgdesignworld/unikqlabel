<?php
/**
 * One-time cleanup: remove duplicate product_variant_inventory rows.
 * MySQL NULL != NULL in UNIQUE constraints caused ON DUPLICATE KEY UPDATE
 * to INSERT duplicates instead of updating. This script deduplicates by
 * keeping the row with the highest id (most recent save) for each
 * (product_id, size, color) combination.
 */
require_once __DIR__ . '/../config/database.php';

$db = getDB();

// Count duplicates before
$before = (int) $db->query('SELECT COUNT(*) FROM product_variant_inventory')->fetchColumn();
echo "Rows before cleanup: $before\n";

// Delete all but the latest row for each (product_id, COALESCE(size,''), COALESCE(color,''))
$db->exec("
    DELETE pvi
    FROM product_variant_inventory pvi
    INNER JOIN (
        SELECT MAX(id) AS keep_id,
               product_id,
               COALESCE(size,  '') AS s,
               COALESCE(color, '') AS c
        FROM product_variant_inventory
        GROUP BY product_id, COALESCE(size, ''), COALESCE(color, '')
        HAVING COUNT(*) > 1
    ) dupes
    ON  pvi.product_id            = dupes.product_id
    AND COALESCE(pvi.size,  '')   = dupes.s
    AND COALESCE(pvi.color, '')   = dupes.c
    AND pvi.id                   != dupes.keep_id
");

$after = (int) $db->query('SELECT COUNT(*) FROM product_variant_inventory')->fetchColumn();
$deleted = $before - $after;
echo "Deleted $deleted duplicate row(s).\n";
echo "Rows after cleanup: $after\n\n";

// Show final state
$rows = $db->query(
    'SELECT id, product_id, size, color, stock FROM product_variant_inventory ORDER BY product_id, COALESCE(size,""), COALESCE(color,"")'
)->fetchAll(PDO::FETCH_ASSOC);

echo "Current inventory:\n";
foreach ($rows as $r) {
    printf(
        "  id=%-4d  pid=%-4d  size=%-8s  color=%-10s  stock=%d\n",
        $r['id'], $r['product_id'],
        $r['size']  ?? 'NULL',
        $r['color'] ?? 'NULL',
        $r['stock']
    );
}
echo "\nDone.\n";
