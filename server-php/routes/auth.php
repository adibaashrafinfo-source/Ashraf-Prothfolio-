<?php

function handle_auth(string $method, array $segments, array $config): void
{
    $action = $segments[1] ?? null;

    if ($method === 'POST' && $action === 'login') {
        $body = read_json_body();
        $email = trim((string) ($body['email'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if ($email === '' || $password === '') {
            error_response('Email and password are required.');
        }

        $pdo = db();
        $stmt = $pdo->prepare('SELECT * FROM admin_users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            error_response('Invalid email or password.', 401);
        }

        $token = jwt_sign(['sub' => $user['id'], 'email' => $user['email'], 'role' => 'admin'], $config['jwt_secret']);
        json_response(['token' => $token, 'email' => $user['email']]);
    }

    if ($method === 'PUT' && $action === 'password') {
        $payload = require_auth($config);
        $body = read_json_body();
        $current = (string) ($body['current_password'] ?? '');
        $new = (string) ($body['new_password'] ?? '');

        $stmt = db()->prepare('SELECT * FROM admin_users WHERE id = ?');
        $stmt->execute([(string) ($payload['sub'] ?? '')]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($current, $user['password_hash'])) {
            error_response('Your current password is incorrect.');
        }
        if (strlen($new) < 8) {
            error_response('New password must be at least 8 characters.');
        }
        db()->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')
            ->execute([password_hash($new, PASSWORD_BCRYPT), $user['id']]);
        json_response(['ok' => true]);
    }

    if ($method === 'GET' && $action === 'me') {
        $user = require_auth($config);
        json_response(['email' => $user['email']]);
    }

    error_response('Not found', 404);
}
