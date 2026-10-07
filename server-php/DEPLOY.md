# Deploying the API to cPanel

This folder is a self-contained PHP app — no Composer, no build step. It needs **PHP 8.0+** and
a **MySQL** database, which almost any cPanel/shared hosting plan already gives you.

## 1. Create the database

In cPanel:

1. Open **MySQL® Databases**.
2. Under **Create New Database**, enter a name (e.g. `portfolio`) → **Create Database**.
   cPanel will prefix it with your account name, e.g. `cpaneluser_portfolio` — note the full name.
3. Under **MySQL Users → Add New User**, create a user with a strong password. Note the full
   username too (also prefixed, e.g. `cpaneluser_dbuser`).
4. Under **Add User To Database**, add that user to the database you just created, with **ALL
   PRIVILEGES**.

## 2. Import the schema

1. Open **phpMyAdmin** from cPanel.
2. Select your new database in the left sidebar.
3. Go to the **Import** tab → **Choose File** → select [`schema.sql`](./schema.sql) from this
   folder → **Go**.
4. You should see 8 tables created: `admin_users`, `business_documents`, `client_logos`,
   `contact_submissions`, `projects`, `site_settings`, `social_links`, `testimonials`.

Re-running the import later (after you `git pull` an updated `schema.sql`) is safe — every
`CREATE TABLE` uses `IF NOT EXISTS`.

## 3. Upload the files

Upload this entire `server-php/` folder to your hosting. Two common layouts:

- **A subfolder of your main site**, e.g. `public_html/api/` → your API lives at
  `https://your-domain.com/api`
- **A subdomain**, e.g. create `api.your-domain.com` pointed at its own folder → your API lives
  at `https://api.your-domain.com`

Either way, upload via cPanel's **File Manager** (zip the folder locally, upload, then
**Extract**) or an FTP client. Do **not** upload `config.example.php` as `config.php` — you'll
create `config.php` fresh in the next step.

## 4. Configure

In the folder you uploaded to, copy `config.example.php` to `config.php` (File Manager: select
the file → **Copy** → name it `config.php`), then edit `config.php` and fill in:

```php
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'cpaneluser_portfolio',   // from step 1
        'user' => 'cpaneluser_dbuser',      // from step 1
        'pass' => 'the-password-you-set',
    ],
    'jwt_secret' => 'a-long-random-string', // generate below
    'allowed_origins' => [
        'https://your-site.vercel.app',     // your deployed frontend
    ],
    'base_url' => 'https://your-domain.com/api', // exactly where this folder is reachable
];
```

Generate a random `jwt_secret` (don't reuse the example): if you have Terminal/SSH access, run

```bash
php -r "echo bin2hex(random_bytes(32));"
```

`config.php` is never served over the web — `.htaccess` in this folder blocks direct requests to
it, and it's gitignored so it never ends up in your repository either.

## 5. Make sure `uploads/` is writable

cPanel usually sets this correctly by default, but if image uploads fail, set the `uploads/`
folder's permissions to `755` (File Manager → right-click `uploads` → **Change Permissions**).

## 6. Create your admin login

From cPanel's **Terminal** (Advanced section) or SSH, `cd` into the folder and run:

```bash
cd public_html/api   # or wherever you uploaded it
php create_admin.php you@example.com "a-strong-password"
```

Run it again any time with the same email to reset that password.

## 7. Test it

Visit `https://your-domain.com/api/health` in a browser — you should see:

```json
{"ok":true,"service":"portfolio-api"}
```

If instead you get a 500 error or a blank page, see **Troubleshooting** below.

## 8. Point the frontend at it

In Vercel: **Project Settings → Environment Variables** → set

```
VITE_API_BASE_URL=https://your-domain.com/api
```

(no trailing slash), for all environments, then redeploy. Locally, set the same value in your
`.env` file.

---

## Troubleshooting

**500 error on every request.** Almost always `config.php` is missing, or has a syntax error, or
the DB credentials in it are wrong. Check cPanel's **Errors** log (or `error_log` in File
Manager) for the real PHP error.

**404 on everything except `/health`.** Your hosting's `mod_rewrite` isn't enabled, so
`.htaccess` isn't routing requests to `index.php`. Most cPanel hosting has it on by default —
contact your host if not. You can confirm rewrite is the issue by checking whether
`index.php?_route=site-settings` (with the query string spelled out) works while
`/site-settings` doesn't.

**CORS errors in the browser console** (`has been blocked by CORS policy`). The `Origin` your
frontend is actually running on isn't in `allowed_origins` in `config.php` — add it exactly
(including `https://`, no trailing slash) and it takes effect immediately, no restart needed.

**"Unauthorized" right after logging in.** The admin token is stored in the browser's
`localStorage` and expires after 7 days — just log in again. If it happens immediately after a
successful login, double-check `jwt_secret` wasn't changed in `config.php` between requests
(changing it invalidates every previously issued token).

**Image uploads fail with "Could not save the uploaded file."** The `uploads/` folder isn't
writable by PHP — see step 5.

**Wrong timezone on dates.** PHP's `date()`/`DATETIME` defaults to the server's timezone. If
your host runs UTC and you want Dhaka time, set `date_default_timezone_set('Asia/Dhaka');` at the
top of `index.php`, or ask your host to set `date.timezone` in `php.ini`.
