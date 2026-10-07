-- Ashraful Islam Portfolio — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: every statement uses IF NOT EXISTS / ON CONFLICT where possible.

-- ============================================================
-- 1. Content tables
-- ============================================================

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('E-Commerce', 'Software')),
  description text not null,
  image_url text not null,
  project_url text,
  created_at timestamptz not null default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_role text not null,
  client_avatar_url text,
  message text not null,
  rating int not null default 5,
  created_at timestamptz not null default now()
);

create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Single-row table holding all editable header/hero/about/contact/stats copy.
create table if not exists site_settings (
  id text primary key default 'default',
  name text not null default 'Ashraful Islam',
  short_name text not null default 'Arif',
  title text not null default 'Founder & CEO, Abrar IT',
  tagline text not null default '',
  short_bio text not null default '',
  about text not null default '',
  years_experience int not null default 0,
  projects_completed int not null default 0,
  happy_clients int not null default 0,
  awards_won int not null default 0,
  location text not null default '',
  email text not null default '',
  phone text not null default '',
  resume_url text not null default '/cv.pdf',
  map_embed_src text not null default '',
  logo_text text not null default 'Arif',
  logo_image_url text,
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values ('default')
  on conflict (id) do nothing;

-- Adds short_bio to a site_settings table created before this column existed.
alter table site_settings add column if not exists short_bio text not null default '';

create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null check (
    icon in ('facebook', 'linkedin', 'instagram', 'github', 'whatsapp', 'twitter', 'youtube', 'mail', 'globe')
  ),
  href text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Client logos for the scrolling strip under the hero.
create table if not exists client_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  website_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Portfolio projects may now rely on an auto thumbnail captured from the live
-- site, so a stored image is no longer required.
alter table projects alter column image_url drop not null;
alter table projects alter column image_url set default '';
alter table projects drop constraint if exists projects_category_check;
alter table projects add constraint projects_category_check
  check (category in ('E-Commerce', 'SaaS Dashboard', 'Business Website', 'Apps', 'Software'));

-- ============================================================
-- 1b. CRM fields on contact submissions (leads)
-- ============================================================

alter table contact_submissions add column if not exists status text not null default 'new';
alter table contact_submissions add column if not exists phone text;
alter table contact_submissions add column if not exists company text;
alter table contact_submissions add column if not exists project_name text;
alter table contact_submissions add column if not exists project_type text;
alter table contact_submissions add column if not exists progress int not null default 0;
alter table contact_submissions add column if not exists project_cost numeric(12, 2);
alter table contact_submissions add column if not exists currency text not null default 'BDT';
alter table contact_submissions add column if not exists next_follow_up date;
alter table contact_submissions add column if not exists notes text;
alter table contact_submissions add column if not exists updated_at timestamptz not null default now();

alter table contact_submissions drop constraint if exists contact_submissions_status_check;
alter table contact_submissions add constraint contact_submissions_status_check
  check (status in ('new', 'contacted', 'in_progress', 'confirmed', 'converted', 'important', 'cancelled'));

-- ============================================================
-- 1c. Quotations and invoices
-- ============================================================
-- One table holds both; `kind` separates them and `source_quotation_id` links
-- an invoice back to the quotation it was generated from. Line items live in
-- a jsonb array: [{ id, title, description, quantity, unit_price }].

create table if not exists business_documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('quotation', 'invoice')),
  doc_number text not null,
  lead_id uuid references contact_submissions (id) on delete set null,
  source_quotation_id uuid references business_documents (id) on delete set null,
  client_name text not null,
  client_company text,
  client_email text,
  client_phone text,
  client_address text,
  project_title text not null,
  project_details text,
  items jsonb not null default '[]'::jsonb,
  currency text not null default 'BDT',
  discount numeric(12, 2) not null default 0,
  tax_percent numeric(5, 2) not null default 0,
  terms text,
  notes text,
  issue_date date not null default current_date,
  valid_until date,
  due_date date,
  paid_amount numeric(12, 2) not null default 0,
  template text not null default 'modern',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_documents_kind_idx on business_documents (kind, created_at desc);

-- ============================================================
-- 2. Row Level Security
-- ============================================================
-- Public (anonymous) visitors can only READ content and INSERT contact
-- messages. Only a signed-in admin (any authenticated user) can write
-- content or read/delete messages.

alter table projects enable row level security;
alter table testimonials enable row level security;
alter table contact_submissions enable row level security;
alter table site_settings enable row level security;
alter table social_links enable row level security;
alter table client_logos enable row level security;
alter table business_documents enable row level security;

drop policy if exists "Public can read projects" on projects;
create policy "Public can read projects" on projects for select using (true);
drop policy if exists "Admin can manage projects" on projects;
create policy "Admin can manage projects" on projects
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public can read testimonials" on testimonials;
create policy "Public can read testimonials" on testimonials for select using (true);
drop policy if exists "Admin can manage testimonials" on testimonials;
create policy "Admin can manage testimonials" on testimonials
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public can submit contact form" on contact_submissions;
create policy "Public can submit contact form" on contact_submissions
  for insert with check (true);
drop policy if exists "Admin can read messages" on contact_submissions;
create policy "Admin can read messages" on contact_submissions
  for select using (auth.role() = 'authenticated');
drop policy if exists "Admin can delete messages" on contact_submissions;
create policy "Admin can delete messages" on contact_submissions
  for delete using (auth.role() = 'authenticated');
-- Needed so the admin can set lead status, cost, progress and notes.
drop policy if exists "Admin can update leads" on contact_submissions;
create policy "Admin can update leads" on contact_submissions
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public can read client logos" on client_logos;
create policy "Public can read client logos" on client_logos for select using (true);
drop policy if exists "Admin can manage client logos" on client_logos;
create policy "Admin can manage client logos" on client_logos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Quotations and invoices are internal: no public access at all.
drop policy if exists "Admin can manage documents" on business_documents;
create policy "Admin can manage documents" on business_documents
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public can read site settings" on site_settings;
create policy "Public can read site settings" on site_settings for select using (true);
drop policy if exists "Admin can manage site settings" on site_settings;
create policy "Admin can manage site settings" on site_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public can read social links" on social_links;
create policy "Public can read social links" on social_links for select using (true);
drop policy if exists "Admin can manage social links" on social_links;
create policy "Admin can manage social links" on social_links
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- 3. Storage bucket for uploaded images (portfolio/testimonial/logo)
-- ============================================================

insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do nothing;

drop policy if exists "Public can view media" on storage.objects;
create policy "Public can view media" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "Admin can upload media" on storage.objects;
create policy "Admin can upload media" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists "Admin can update media" on storage.objects;
create policy "Admin can update media" on storage.objects
  for update using (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists "Admin can delete media" on storage.objects;
create policy "Admin can delete media" on storage.objects
  for delete using (bucket_id = 'media' and auth.role() = 'authenticated');

-- ============================================================
-- 4. Create your admin login
-- ============================================================
-- This SQL cannot create an auth user for you (Supabase manages that
-- through its own API, not a plain SQL insert). After running the SQL
-- above, go to:
--   Dashboard → Authentication → Users → Add user
-- and create yourself an email + password. Use that to sign in at
-- /admin/login on the deployed site. Any authenticated user can manage
-- content per the policies above, so only create accounts you trust.
