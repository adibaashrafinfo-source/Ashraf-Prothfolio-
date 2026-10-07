<?php

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0'); // never leak raw PHP errors/paths to the client

// PHP's built-in dev server (php -S) always hits this router, even for an
// uploaded file that actually exists on disk — real Apache's .htaccess
// serves those directly and never gets here. Mirror that behavior so local
// testing matches production.
if (php_sapi_name() === 'cli-server') {
    $requested = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (is_file($requested)) {
        return false;
    }
}

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/routes/_crud.php';
require_once __DIR__ . '/routes/settings.php';
require_once __DIR__ . '/routes/social_links.php';
require_once __DIR__ . '/routes/projects.php';
require_once __DIR__ . '/routes/testimonials.php';
require_once __DIR__ . '/routes/client_logos.php';
require_once __DIR__ . '/routes/leads.php';
require_once __DIR__ . '/routes/documents.php';
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/upload.php';

set_exception_handler(function (Throwable $e) {
    error_log('[portfolio-api] ' . $e->getMessage());
    json_response(['error' => 'Something went wrong on the server.'], 500);
});

if (!file_exists(__DIR__ . '/config.php')) {
    json_response(['error' => 'config.php is missing — copy config.example.php to config.php and fill it in.'], 500);
}
$config = require __DIR__ . '/config.php';

apply_cors($config);

$method = $_SERVER['REQUEST_METHOD'];
// On real Apache hosting, .htaccess rewrites everything to index.php?_route=...
// PHP's built-in dev server (php -S) never runs .htaccess, so fall back to
// REQUEST_URI directly — this keeps local testing and production identical.
$route = $_GET['_route'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '';
$route = trim((string) $route, '/');
$segments = $route === '' ? [] : explode('/', $route);
$resource = $segments[0] ?? '';

match ($resource) {
    'site-settings' => handle_settings($method, $config),
    'social-links' => handle_social_links($method, $segments, $config),
    'projects' => handle_projects($method, $segments, $config),
    'testimonials' => handle_testimonials($method, $segments, $config),
    'client-logos' => handle_client_logos($method, $segments, $config),
    'contact' => handle_contact($method),
    'leads' => handle_leads($method, $segments, $config),
    'documents' => handle_documents($method, $segments, $config),
    'auth' => handle_auth($method, $segments, $config),
    'upload' => handle_upload($method, $config),
    '', 'health' => json_response(['ok' => true, 'service' => 'portfolio-api']),
    default => error_response('Not found', 404),
};
