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
