# Ashraful Islam — Portfolio

A fast, fully responsive personal portfolio for **Ashraful Islam (Arif)**, Founder & CEO of
**Abrar IT** — built with React, TypeScript, Tailwind CSS, shadcn-style components, Framer
Motion, and a small PHP + MySQL backend you run on your own hosting.

## Tech stack

- **Framework:** React 19 + TypeScript + Vite
- **Routing:** React Router (home page + a dedicated `/portfolio/:id` page per project)
- **Styling:** Tailwind CSS v4 + shadcn/ui-style components
- **Animation:** Framer Motion
- **Icons:** lucide-react
- **Backend / DB:** a self-hosted PHP REST API + MySQL (see [`server-php/`](./server-php)) —
  no third-party account, runs on any cPanel/shared hosting with PHP and MySQL
- **Forms:** React Hook Form + Zod
- **Hosting:** Vercel (frontend) + your own hosting (API + database)

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
                 # use-section-nav, use-toast, use-auth
  lib/           # apiClient.ts (the API client), utils.ts, contactSchema.ts
  types/         # Project, Testimonial, Lead, BusinessDocument, etc.
  data/          # site.ts (all editable content), skills.ts, services.ts,
                 # projects.ts / testimonials.ts (static fallback data)
public/          # favicon, profile.jpg, profile-about.jpg, cv.pdf, og-image.png,
                 # robots.txt, sitemap.xml
server-php/      # the PHP + MySQL API that powers the admin panel (see below)
vercel.json      # SPA rewrite so /portfolio/:id resolves correctly on refresh/direct load
```

### Routing

The site is a single page (`/`) with anchor-scroll navigation, plus one route per portfolio
project: clicking a project card in the Portfolio section opens `/portfolio/:id`, a full case
study page reusing the same project data (from the API, or the static fallback). Nav links and
the logo work from any page — if you're not on `/`, clicking a section link navigates back to
`/` and scrolls to that section.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in VITE_API_BASE_URL once your backend is deployed
npm run dev
```

The site runs at `http://localhost:5173`. The backend (`server-php/`) is a separate PHP app that
lives on your own hosting — see **[Backend setup](./server-php/DEPLOY.md)** for the full,
step-by-step cPanel guide (create the database, import the schema, upload the API, create your
admin login).

## Environment variables

Create a `.env` file (never commit it) with:

```
VITE_API_BASE_URL=https://your-domain.com/api
```

Point it at wherever you deployed `server-php/` (see the deploy guide). If this is not set, the
app still runs — the Portfolio and Testimonials sections fall back to the static data in
`src/data/projects.ts` and `src/data/testimonials.ts`, and the contact form will show an error
toast with an email/WhatsApp fallback instead of submitting.

## Updating content

There are two ways to edit content, and both work together:

1. **The admin panel** (recommended) — sign in at `/admin` and edit everything from a browser:
   header logo/text, hero/about copy, stats, contact info, social links, portfolio projects
   (with image upload), testimonials, and incoming contact messages. See
   [Admin panel](#admin-panel) below for setup.
2. **Editing code directly** — `src/data/site.ts` holds the *default/fallback* copy used until
   the API has real data (or if the API isn't configured at all). Skills and services
   (`src/data/skills.ts`, `src/data/services.ts`) are not part of the admin panel and are only
   editable in code.

### Backend (PHP + MySQL)

The API is a plain PHP app in [`server-php/`](./server-php) — no framework, no Composer
dependencies, built to run on ordinary cPanel/shared hosting. It talks to a MySQL database using
[`server-php/schema.sql`](./server-php/schema.sql), which creates every table the site and admin
panel need (`projects`, `testimonials`, `contact_submissions`, `site_settings`, `social_links`,
`client_logos`, `business_documents`, `admin_users`). It's safe to re-run.

Full setup (create the database, import the schema, upload the files, create your admin login,
point Vercel at it) is in **[`server-php/DEPLOY.md`](./server-php/DEPLOY.md)**.

## Admin panel

The site ships with a full admin panel at **`/admin`** for managing content without touching
code:

- **Site Settings** — name, title, tagline, about text, stats (years/projects/clients/awards),
  location, email, phone, resume link, map embed, and the header logo (text or an uploaded
  image).
- **Social Links** — add, edit, reorder, or remove social/contact links shown in the footer and
  contact section.
- **Portfolio** — add, edit, or delete projects across E-Commerce, SaaS Dashboard, Business
  Website, Apps, and Software. Paste the live website link and the card thumbnail is captured
  from that site's own hero automatically; clicking the card opens the live site. Uploading an
  image overrides the automatic capture.
- **Clients** — upload client logos for the scrolling strip under the hero. Any logo size works:
  each one is fitted whole into the strip, in its original colors.
- **Testimonials** — add, edit, or delete client testimonials.
- **Leads** — every contact-form submission as a CRM record: status (new, contacted, in progress,
  confirmed, converted, important, cancelled), company and phone, project name and type, progress
  percentage, project cost and currency, follow-up date, and internal notes. The header totals
  open pipeline and won value.
- **Quotations / Invoices** — build a quotation from scratch or straight off a lead, with line
  items, discount, tax, validity, and terms. **Generate copy** turns rough notes into
  client-ready scope and terms text, three premium templates (Modern, Minimal, Bold) are
  switchable at any time, **Print / PDF** saves the document, and **Make invoice** clones an
  accepted quotation into an invoice that tracks its due date and paid amount. Your logo and
  contact details come from Site Settings.

### Setting up your admin login

1. Deploy `server-php/` and import `schema.sql` (see
   [`server-php/DEPLOY.md`](./server-php/DEPLOY.md)) if you haven't already.
2. Visit `https://your-domain.com/api/setup.php` in a browser — a one-time form that creates
   your admin account. It only works until the first admin exists, then permanently disables
   itself, so no secret or Terminal access is needed. (Have Terminal/SSH access instead? Run
   `php create_admin.php you@example.com "a-strong-password"` from inside `server-php/`.)
3. Visit `/admin/login` on your deployed site (or `http://localhost:5173/admin/login` locally)
   and sign in with that email and password.

Anyone signed in can manage all content — only create accounts for people you trust with full
edit access.

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

Deploy the backend first (see [`server-php/DEPLOY.md`](./server-php/DEPLOY.md)) — you need its
URL for step 4.

1. Push this repository to GitHub (see commands below).
2. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repository.
3. Vercel auto-detects the Vite framework preset — leave the build command
   (`npm run build` / `vite build`) and output directory (`dist`) as default.
4. Before the first deploy, add your environment variable:
   **Project Settings → Environment Variables** → add
   - `VITE_API_BASE_URL` = `https://your-domain.com/api` (wherever you deployed `server-php/`)

   Set it for all environments (Production, Preview, Development), then redeploy if you added it
   after the first deploy.
5. Click **Deploy**. Vercel will give you a live URL, and every push to your default branch
   will auto-deploy from then on.
6. Back in `server-php/config.php` on your hosting, add that Vercel URL (and any preview domain
   you use) to `allowed_origins` so the API accepts requests from it.

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
