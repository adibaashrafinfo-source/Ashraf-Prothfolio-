<?php
/**
 * One-time setup: creates (or resets the password of) an admin login.
 * Run from cPanel's Terminal (or SSH) inside this folder:
 *
 *   php create_admin.php you@example.com "a-strong-password"
 *
 * Blocked from direct web access by .htaccess — command line only.
 */

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('This script can only be run from the command line.');
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

[$email, $password] = [$argv[1] ?? null, $argv[2] ?? null];
if (!$email || !$password) {
    fwrite(STDERR, "Usage: php create_admin.php <email> <password>\n");
    exit(1);
}
if (strlen($password) < 8) {
    fwrite(STDERR, "Password must be at least 8 characters.\n");
    exit(1);
}

$pdo = db();
$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare('SELECT id FROM admin_users WHERE email = ?');
$stmt->execute([$email]);
$existing = $stmt->fetch();

if ($existing) {
    $pdo->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')
        ->execute([$hash, $existing['id']]);
    echo "Password updated for $email\n";
} else {
    $id = uuid4();
    $pdo->prepare('INSERT INTO admin_users (id, email, password_hash) VALUES (?, ?, ?)')
        ->execute([$id, $email, $hash]);
    echo "Admin user created: $email\n";
}
