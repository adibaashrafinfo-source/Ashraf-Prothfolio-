<?php

/**
 * CRM tables. Kept as PHP (not a .sql file) so the statements can't be
 * fetched over the web, and so the live database upgrades itself the first
 * time any CRM endpoint is hit — no phpMyAdmin import needed after deploy.
 * The same statements are mirrored in schema.sql for fresh installs.
 */
function crm_schema_statements(): array
{
    return [
        "CREATE TABLE IF NOT EXISTS crm_clients (
          id CHAR(36) NOT NULL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          company VARCHAR(255) NULL,
          email VARCHAR(255) NULL,
          phone VARCHAR(50) NULL,
          whatsapp VARCHAR(50) NULL,
          address TEXT NULL,
          website VARCHAR(500) NULL,
          industry VARCHAR(255) NULL,
          source VARCHAR(100) NULL,
          status ENUM('active','inactive','prospect') NOT NULL DEFAULT 'active',
          notes TEXT NULL,
          lead_id CHAR(36) NULL,
          portal_enabled TINYINT(1) NOT NULL DEFAULT 0,
          password_hash VARCHAR(255) NULL,
          last_login_at DATETIME NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY crm_clients_email_uq (email),
          CONSTRAINT fk_crm_clients_lead FOREIGN KEY (lead_id)
            REFERENCES contact_submissions (id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS crm_projects (
          id CHAR(36) NOT NULL PRIMARY KEY,
          client_id CHAR(36) NOT NULL,
          title VARCHAR(255) NOT NULL,
          service_type VARCHAR(100) NOT NULL DEFAULT 'Website Development',
          description TEXT NULL,
          status ENUM('not_started','running','on_hold','review','completed','cancelled')
            NOT NULL DEFAULT 'not_started',
          priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
          stages JSON NOT NULL,
          progress INT NOT NULL DEFAULT 0,
          total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
          currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
          start_date DATE NULL,
          deadline DATE NULL,
          completed_at DATE NULL,
          live_url VARCHAR(500) NULL,
          staging_url VARCHAR(500) NULL,
          client_note TEXT NULL,
          internal_notes TEXT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX crm_projects_client_idx (client_id),
          INDEX crm_projects_status_idx (status),
          CONSTRAINT fk_crm_projects_client FOREIGN KEY (client_id)
            REFERENCES crm_clients (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS crm_payments (
          id CHAR(36) NOT NULL PRIMARY KEY,
          project_id CHAR(36) NOT NULL,
          client_id CHAR(36) NOT NULL,
          amount DECIMAL(12, 2) NOT NULL,
          currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
          type ENUM('advance','installment','final','refund') NOT NULL DEFAULT 'installment',
          method VARCHAR(50) NOT NULL DEFAULT 'Cash',
          paid_at DATE NOT NULL,
          reference VARCHAR(255) NULL,
          note TEXT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX crm_payments_project_idx (project_id),
          INDEX crm_payments_client_idx (client_id),
          INDEX crm_payments_paid_idx (paid_at),
          CONSTRAINT fk_crm_payments_project FOREIGN KEY (project_id)
            REFERENCES crm_projects (id) ON DELETE CASCADE,
          CONSTRAINT fk_crm_payments_client FOREIGN KEY (client_id)
            REFERENCES crm_clients (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS crm_activity (
          id CHAR(36) NOT NULL PRIMARY KEY,
          client_id CHAR(36) NULL,
          project_id CHAR(36) NULL,
          type VARCHAR(30) NOT NULL DEFAULT 'note',
          message TEXT NOT NULL,
          visible_to_client TINYINT(1) NOT NULL DEFAULT 0,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX crm_activity_created_idx (created_at),
          INDEX crm_activity_project_idx (project_id),
          INDEX crm_activity_client_idx (client_id),
          CONSTRAINT fk_crm_activity_project FOREIGN KEY (project_id)
            REFERENCES crm_projects (id) ON DELETE CASCADE,
          CONSTRAINT fk_crm_activity_client FOREIGN KEY (client_id)
            REFERENCES crm_clients (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS crm_files (
          id CHAR(36) NOT NULL PRIMARY KEY,
          project_id CHAR(36) NOT NULL,
          client_id CHAR(36) NOT NULL,
          category ENUM('deliverable','client_asset') NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          url VARCHAR(500) NOT NULL,
          size INT NOT NULL,
          mime VARCHAR(150) NOT NULL,
          note VARCHAR(500) NULL,
          uploaded_by ENUM('admin','client') NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX crm_files_project_idx (project_id),
          CONSTRAINT fk_crm_files_project FOREIGN KEY (project_id)
            REFERENCES crm_projects (id) ON DELETE CASCADE,
          CONSTRAINT fk_crm_files_client FOREIGN KEY (client_id)
            REFERENCES crm_clients (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS crm_stage_approvals (
          id CHAR(36) NOT NULL PRIMARY KEY,
          project_id CHAR(36) NOT NULL,
          client_id CHAR(36) NOT NULL,
          stage_id VARCHAR(40) NOT NULL,
          stage_name VARCHAR(100) NOT NULL,
          round INT NOT NULL DEFAULT 1,
          status ENUM('pending','approved','changes_requested') NOT NULL DEFAULT 'pending',
          message TEXT NULL,
          client_comment TEXT NULL,
          requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          resolved_at DATETIME NULL,
          INDEX crm_stage_approvals_project_idx (project_id),
          CONSTRAINT fk_crm_approvals_project FOREIGN KEY (project_id)
            REFERENCES crm_projects (id) ON DELETE CASCADE,
          CONSTRAINT fk_crm_approvals_client FOREIGN KEY (client_id)
            REFERENCES crm_clients (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    ];
}

function crm_ensure_schema(PDO $pdo): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    // crm_stage_approvals is created last, so its presence means every table exists —
    // including ones added after a site's first deploy (CREATE TABLE IF NOT EXISTS
    // makes re-running the earlier statements on an existing DB harmless).
    if ($pdo->query("SHOW TABLES LIKE 'crm_stage_approvals'")->fetchColumn() !== false) {
        return;
    }
    foreach (crm_schema_statements() as $sql) {
        $pdo->exec($sql);
    }
}
