-- Ashraful Islam Portfolio — MySQL schema (for cPanel / shared hosting MySQL)
-- Import once via phpMyAdmin (or `mysql -u USER -p DBNAME < schema.sql`).
-- Safe to re-run: every CREATE uses IF NOT EXISTS.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. Admin login (replaces Supabase Auth)
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. Content tables
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(20) NOT NULL PRIMARY KEY DEFAULT 'default',
  name VARCHAR(255) NOT NULL DEFAULT 'Ashraful Islam',
  short_name VARCHAR(100) NOT NULL DEFAULT 'Arif',
  title VARCHAR(255) NOT NULL DEFAULT 'Founder & CEO, Abrar IT',
  tagline TEXT NOT NULL,
  short_bio TEXT NOT NULL,
  about TEXT NOT NULL,
  years_experience INT NOT NULL DEFAULT 0,
  projects_completed INT NOT NULL DEFAULT 0,
  happy_clients INT NOT NULL DEFAULT 0,
  awards_won INT NOT NULL DEFAULT 0,
  location VARCHAR(255) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(50) NOT NULL DEFAULT '',
  resume_url VARCHAR(500) NOT NULL DEFAULT '/cv.pdf',
  map_embed_src TEXT NOT NULL,
  logo_text VARCHAR(100) NOT NULL DEFAULT 'Md. Ashraful Islam Arif',
  logo_image_url VARCHAR(500) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO site_settings (id, tagline, short_bio, about, location, email, phone, map_embed_src)
VALUES (
  'default',
  'I help brands grow with design, code, and marketing that convert.',
  'Founder of Abrar IT, based in Dhaka — I design brands, build fast web products, and run growth campaigns that turn attention into real business results.',
  'I''m Ashraful Islam, founder and CEO of Abrar IT — a creative technology studio based in Dhaka.',
  'Dhaka, Bangladesh',
  'asrafulislam2000@gmail.com',
  '01719-686459',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d234550.7!2d90.35!3d23.78!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8aac6bc0e51%3A0x8fdb2782f04ff859!2sDhaka!5e0!3m2!1sen!2sbd'
);

CREATE TABLE IF NOT EXISTS social_links (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon ENUM('facebook','linkedin','instagram','github','whatsapp','twitter','youtube','mail','globe') NOT NULL,
  href VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category ENUM('E-Commerce','SaaS Dashboard','Business Website','Apps','Software') NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  project_url VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
  id CHAR(36) NOT NULL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_role VARCHAR(255) NOT NULL,
  client_avatar_url VARCHAR(500) NULL,
  message TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Client logos for the scrolling strip under the hero.
CREATE TABLE IF NOT EXISTS client_logos (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500) NOT NULL,
  website_url VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. Leads (contact form submissions + CRM fields)
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new','contacted','in_progress','confirmed','converted','important','cancelled')
    NOT NULL DEFAULT 'new',
  phone VARCHAR(50) NULL,
  company VARCHAR(255) NULL,
  project_name VARCHAR(255) NULL,
  project_type VARCHAR(255) NULL,
  progress INT NOT NULL DEFAULT 0,
  project_cost DECIMAL(12, 2) NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
  next_follow_up DATE NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. Quotations and invoices
-- ============================================================
-- One table holds both; `kind` separates them and `source_quotation_id` links
-- an invoice back to the quotation it was generated from. Line items live in
-- a JSON array: [{ id, title, description, quantity, unit_price }].

CREATE TABLE IF NOT EXISTS business_documents (
  id CHAR(36) NOT NULL PRIMARY KEY,
  kind ENUM('quotation','invoice') NOT NULL,
  doc_number VARCHAR(50) NOT NULL,
  lead_id CHAR(36) NULL,
  source_quotation_id CHAR(36) NULL,
  client_name VARCHAR(255) NOT NULL,
  client_company VARCHAR(255) NULL,
  client_email VARCHAR(255) NULL,
  client_phone VARCHAR(50) NULL,
  client_address TEXT NULL,
  project_title VARCHAR(255) NOT NULL,
  project_details TEXT NULL,
  items JSON NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  terms TEXT NULL,
  notes TEXT NULL,
  issue_date DATE NOT NULL,
  valid_until DATE NULL,
  due_date DATE NULL,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  template VARCHAR(20) NOT NULL DEFAULT 'modern',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX business_documents_kind_idx (kind, created_at DESC),
  CONSTRAINT fk_business_documents_lead FOREIGN KEY (lead_id)
    REFERENCES contact_submissions (id) ON DELETE SET NULL,
  CONSTRAINT fk_business_documents_source FOREIGN KEY (source_quotation_id)
    REFERENCES business_documents (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
