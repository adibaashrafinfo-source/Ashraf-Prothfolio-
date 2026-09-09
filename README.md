# Ashraful Islam — Portfolio

A fast, fully responsive personal portfolio for **Ashraful Islam (Arif)**, Founder & CEO of
**Abrar IT** — built with React, TypeScript, Tailwind CSS, shadcn-style components, Framer
Motion, and Supabase.

## Tech stack

- **Framework:** React 19 + TypeScript + Vite
- **Routing:** React Router (home page + a dedicated `/portfolio/:id` page per project)
- **Styling:** Tailwind CSS v4 + shadcn/ui-style components
- **Animation:** Framer Motion
- **Icons:** lucide-react
- **Backend / DB:** Supabase (`@supabase/supabase-js`)
- **Forms:** React Hook Form + Zod
- **Hosting:** Vercel

## Project structure

```
src/
  components/
    ui/          # shadcn-style primitives (button, card, input, tabs, toast...)
    layout/      # Layout (Navbar + Footer + Toaster shell), Navbar, Footer
    Reveal.tsx, SectionHeading.tsx, TechBackground.tsx
  pages/         # Home (the one-page layout), ProjectDetail (per-project case study page)
  sections/      # Hero, About, Skills, Services, Portfolio, Stats, Testimonials, Contact
  hooks/         # use-dark-mode, use-counter, use-projects, use-testimonials,
                 # use-section-nav, use-toast
  lib/           # supabaseClient.ts, utils.ts, contactSchema.ts
  types/         # Project, Testimonial, ContactSubmission types
  data/          # site.ts (all editable content), skills.ts, services.ts,
                 # projects.ts / testimonials.ts (static fallback data)
public/          # favicon, profile.jpg, profile-about.jpg, cv.pdf, og-image.png,
                 # robots.txt, sitemap.xml
vercel.json      # SPA rewrite so /portfolio/:id resolves correctly on refresh/direct load
```

### Routing

The site is a single page (`/`) with anchor-scroll navigation, plus one route per portfolio
project: clicking a project card in the Portfolio section opens `/portfolio/:id`, a full case
study page reusing the same project data (Supabase or the static fallback). Nav links and the
logo work from any page — if you're not on `/`, clicking a section link navigates back to `/`
and scrolls to that section.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Supabase credentials
npm run dev
```

The site runs at `http://localhost:5173`.

## Environment variables

Create a `.env` file (never commit it) with:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

If these are not set, the app still runs — the Portfolio and Testimonials sections fall back
to the static data in `src/data/projects.ts` and `src/data/testimonials.ts`, and the contact
form will show an error toast instead of submitting.

## Updating content

Most site copy (name, tagline, about text, stats, contact info, social links) lives in one
place: **`src/data/site.ts`**. Skills and services live in `src/data/skills.ts` and
`src/data/services.ts`. Edit these files directly to rebrand or update copy — no component
changes needed.

### Updating projects & testimonials via Supabase

The Portfolio and Testimonials sections read from Supabase tables (with the static files above
used only as a fallback). This app assumes the following tables already exist in your Supabase
project — create them once via the Supabase SQL editor if they don't exist yet:

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('E-Commerce', 'Software')),
  description text not null,
  image_url text not null,
  project_url text,
  created_at timestamptz not null default now()
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_role text not null,
  client_avatar_url text,
  message text not null,
  rating int not null default 5,
  created_at timestamptz not null default now()
);

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table projects enable row level security;
alter table testimonials enable row level security;
alter table contact_submissions enable row level security;

create policy "Public can read projects" on projects for select using (true);
create policy "Public can read testimonials" on testimonials for select using (true);
create policy "Public can insert contact submissions" on contact_submissions for insert with check (true);
```

To add or edit a project or testimonial, insert/update a row in the Supabase table editor (or
via SQL) — the site picks it up automatically, ordered newest first. Contact form submissions
land in `contact_submissions` for you to review in the Supabase dashboard.

## Rebranding

All color tokens are defined once as CSS variables in `src/index.css` (`:root` for light mode,
`.dark` for dark mode), then exposed to Tailwind via `@theme inline`. Change `--primary`,
`--accent`, etc. there to re-theme the entire site — every component reads from those tokens.

## Available scripts

```bash
npm run dev       # start local dev server
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
npm run lint       # run oxlint
```

## Deploying to Vercel

1. Push this repository to GitHub (see commands below).
2. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repository.
3. Vercel auto-detects the Vite framework preset — leave the build command
   (`npm run build` / `vite build`) and output directory (`dist`) as default.
4. Before the first deploy, add your environment variables:
   **Project Settings → Environment Variables** → add
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Set them for all environments (Production, Preview, Development), then redeploy if you added
   them after the first deploy.
5. Click **Deploy**. Vercel will give you a live URL, and every push to your default branch
   will auto-deploy from then on.

## Pushing to a new GitHub repository

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

## Before going live

- `public/profile.jpg` (Hero) and `public/profile-about.jpg` (About) already have real photos —
  swap either file to update them.
- Replace `public/cv.pdf` with your real resume.
- Replace `public/og-image.png` with a branded 1200×630 social preview image.
- Update the canonical URL and OG/Twitter `og:url` / `og:image` values in `index.html` and
  `public/robots.txt` / `public/sitemap.xml` to your real production domain.
- Update `src/data/site.ts` with your real phone number, social links, and Google Maps embed
  for your area.
