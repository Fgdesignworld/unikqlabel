-- ============================================================
-- VARIANT & COLOR SYSTEM MIGRATION
-- Run this once against your MySQL database
-- Safe: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- ============================================================

-- ── Size Variant Sets (master list e.g. "Clothing Sizes") ──
CREATE TABLE IF NOT EXISTS size_variant_sets (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    is_active   TINYINT(1)  NOT NULL DEFAULT 1,
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Size Variants (sizes belonging to a set) ──
CREATE TABLE IF NOT EXISTS size_variants (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    set_id           INT            NOT NULL,
    label            VARCHAR(50)    NOT NULL,
    price_adjustment DECIMAL(10,2)  NULL COMMENT 'Override price when this size selected. NULL = use product base price',
    sort_order       INT            NOT NULL DEFAULT 0,
    is_active        TINYINT(1)     NOT NULL DEFAULT 1,
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sv_set FOREIGN KEY (set_id) REFERENCES size_variant_sets(id) ON DELETE CASCADE
);

-- ── Global Color Library ──
CREATE TABLE IF NOT EXISTS color_library (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    hex_code   VARCHAR(7)   NOT NULL DEFAULT '#000000',
    is_active  TINYINT(1)   NOT NULL DEFAULT 1,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Per-product color → image mapping ──
-- CREATE TABLE IF NOT EXISTS product_color_images (
--     id          INT AUTO_INCREMENT PRIMARY KEY,
--     product_id  INT  NOT NULL,
--     color_id    INT  NOT NULL,
--     images_json TEXT NULL COMMENT 'JSON array of image paths',
--     created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     CONSTRAINT fk_pci_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
--     CONSTRAINT fk_pci_color   FOREIGN KEY (color_id)   REFERENCES color_library(id) ON DELETE CASCADE,
--     UNIQUE KEY uq_product_color (product_id, color_id)
-- );


CREATE TABLE product_color_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    color_id INT NOT NULL,
    images_json TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_pci_product FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pci_color FOREIGN KEY (color_id)
        REFERENCES color_library(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_product_color (product_id, color_id)
) ENGINE=InnoDB;

-- ── Extend products table (safe — only adds if missing) ──
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS variant_set_id INT     NULL COMMENT 'FK to size_variant_sets',
    ADD COLUMN IF NOT EXISTS enable_variants TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Show/hide size variants on frontend',
    ADD COLUMN IF NOT EXISTS enable_colors   TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Show/hide color variants on frontend';

-- ── Seed some starter data ──
INSERT IGNORE INTO size_variant_sets (id, name, is_active) VALUES
    (1, 'Clothing Sizes', 1),
    (2, 'Shoe Sizes',     1);

INSERT IGNORE INTO size_variants (set_id, label, price_adjustment, sort_order, is_active) VALUES
    (1, 'XS', NULL, 1, 1),
    (1, 'S',  NULL, 2, 1),
    (1, 'M',  NULL, 3, 1),
    (1, 'L',  NULL, 4, 1),
    (1, 'XL', NULL, 5, 1),
    (1, 'XXL',NULL, 6, 1);

INSERT IGNORE INTO color_library (name, hex_code, is_active) VALUES
    ('Black',  '#000000', 1),
    ('White',  '#FFFFFF', 1),
    ('Navy',   '#1B2A4A', 1),
    ('Olive',  '#556B2F', 1),
    ('Red',    '#DC2626', 1),
    ('Grey',   '#6B7280', 1);
