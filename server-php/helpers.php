<?php

require_once __DIR__ . '/jwt.php';

function json_response($data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function error_response(string $message, int $status = 400): never
{
    json_response(['error' => $message], $status);
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function uuid4(): string
{
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function apply_cors(array $config): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $site = fn (string $host) => preg_replace('/^www\./i', '', strtolower($host));
    $originHost = (string) parse_url($origin, PHP_URL_HOST);
    $originPort = parse_url($origin, PHP_URL_PORT);
    $ownHost = (string) ($_SERVER['HTTP_HOST'] ?? '');
    // http://, https:// and www. versions of this API's own site are always allowed.
    $sameSite = $originHost !== '' && $site($originHost . ($originPort ? ":$originPort" : '')) === $site($ownHost);
    if ($sameSite || in_array($origin, $config['allowed_origins'], true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/** Returns the decoded JWT payload for the current request, or null if absent/invalid. */
function current_user(array $config): ?array
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($header, 'Bearer ')) {
        return null;
    }
    $token = substr($header, 7);
    return jwt_verify($token, $config['jwt_secret']);
}

/**
 * Call at the top of any admin-only route. Exits with 401 if not authenticated.
 * Client-portal tokens are signed with the same secret, so the role check is
 * what keeps them out; tokens issued before roles existed are admin tokens.
 */
function require_auth(array $config): array
{
    $user = current_user($config);
    if ($user === null || ($user['role'] ?? 'admin') !== 'admin') {
        error_response('Unauthorized', 401);
    }
    return $user;
}

/** Client-portal routes: returns the signed-in client's row, re-checked on every request. */
function require_client(array $config): array
{
    $payload = current_user($config);
    if ($payload === null || ($payload['role'] ?? null) !== 'client' || empty($payload['sub'])) {
        error_response('Unauthorized', 401);
    }
    $stmt = db()->prepare('SELECT * FROM crm_clients WHERE id = ? AND portal_enabled = 1');
    $stmt->execute([(string) $payload['sub']]);
    $client = $stmt->fetch();
    if (!$client) {
        error_response('Unauthorized', 401);
    }
    return $client;
}
