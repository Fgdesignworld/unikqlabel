-- Reviews table migration
-- Run once to create the reviews table

CREATE TABLE IF NOT EXISTS reviews (
    id                  INT AUTO_INCREMENT PRIMARY KEY,

    product_id          INT NOT NULL,

    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL,

    rating              TINYINT NOT NULL DEFAULT 5,
    comment             TEXT NOT NULL,

    image               VARCHAR(500) DEFAULT NULL,

    status              ENUM('pending', 'approved', 'rejected')
                            NOT NULL DEFAULT 'pending',

    is_verified         TINYINT(1) NOT NULL DEFAULT 0,
    verified_at         TIMESTAMP NULL DEFAULT NULL,

    verification_token  VARCHAR(64) DEFAULT NULL,
    ip_address          VARCHAR(45) DEFAULT NULL,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_email_product (email, product_id),

    INDEX idx_product_status (product_id, status, is_verified),
    INDEX idx_email (email)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;