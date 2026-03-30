-- ============================================================
-- Leads / CRM Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(120)  NOT NULL,
    phone            VARCHAR(20)   NOT NULL,
    email            VARCHAR(180)  DEFAULT NULL,
    inquiry_type     ENUM('order','bulk','support','custom_design','other') NOT NULL DEFAULT 'other',
    message          TEXT          NOT NULL,
    preferred_contact ENUM('call','whatsapp','email') NOT NULL DEFAULT 'whatsapp',
    status           ENUM('new','contacted','converted','closed') NOT NULL DEFAULT 'new',
    lead_score       ENUM('hot','warm','cold') NOT NULL DEFAULT 'warm',
    source           VARCHAR(60)   NOT NULL DEFAULT 'website',
    tags             VARCHAR(255)  DEFAULT NULL,
    file_path        VARCHAR(255)  DEFAULT NULL,
    honeypot         VARCHAR(60)   DEFAULT NULL,
    spam             TINYINT(1)    NOT NULL DEFAULT 0,
    deleted_at       DATETIME      DEFAULT NULL,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status  (status),
    INDEX idx_phone   (phone),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lead_followups (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    lead_id          INT          NOT NULL,
    type             ENUM('call','whatsapp','email','meeting','note') NOT NULL DEFAULT 'note',
    notes            TEXT         NOT NULL,
    next_followup_date DATE       DEFAULT NULL,
    created_by       VARCHAR(80)  DEFAULT 'admin',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead   (lead_id),
    INDEX idx_next   (next_followup_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lead_activities (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    lead_id     INT          NOT NULL,
    action      VARCHAR(80)  NOT NULL,
    meta_json   JSON         DEFAULT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead (lead_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
