-- ============================================================
-- Subcategory Support Migration
-- Adds parent_id to categories for 2-level hierarchy
-- (Main Category → Subcategory)
-- ============================================================

ALTER TABLE categories
  ADD COLUMN parent_id INT UNSIGNED NULL DEFAULT NULL AFTER id;

ALTER TABLE categories
  ADD INDEX idx_categories_parent_id (parent_id);

ALTER TABLE categories
  ADD CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;
