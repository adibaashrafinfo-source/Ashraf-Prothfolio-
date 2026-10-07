<?php
/**
 * Copy this file to config.php and fill in your real values.
 * config.php is gitignored — never commit real credentials.
 */

return [
    // From cPanel → MySQL Databases. The DB name/user are usually prefixed
    // with your cPanel username, e.g. "cpaneluser_portfolio".
    'db' => [
        'host' => 'localhost',
        'name' => 'cpaneluser_portfolio',
        'user' => 'cpaneluser_portfolio',
        'pass' => 'REPLACE_WITH_DB_PASSWORD',
    ],

    // Any long random string — used to sign admin login tokens.
    // Generate one with: php -r "echo bin2hex(random_bytes(32));"
    'jwt_secret' => 'REPLACE_WITH_A_LONG_RANDOM_SECRET',

    // Exact origin(s) of your frontend that are allowed to call this API.
    // Include your Vercel production domain and any preview domains you use.
    'allowed_origins' => [
        'https://your-site.vercel.app',
        'http://localhost:5173',
    ],

    // Public base URL of THIS api folder (no trailing slash) — used to build
    // public URLs for uploaded images.
    'base_url' => 'https://your-domain.com/api',
];
