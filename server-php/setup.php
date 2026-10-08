<?php
/**
 * One-time admin account setup, reachable as a normal web page — no SSH or
 * Terminal access needed. It only works while admin_users is still empty;
 * the moment the first admin is created, this page permanently refuses to
 * do anything else, so there's nothing to remember to delete afterward
 * (though removing this file once setup is done is still good hygiene).
 */

declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0');
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

set_exception_handler(function (Throwable $e) {
    error_log('[setup.php] ' . $e->getMessage());
    http_response_code(500);
    echo '<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;max-width:480px;margin:60px auto;padding:0 16px">'
        . '<h1>Something went wrong</h1><p>' . htmlspecialchars($e->getMessage()) . '</p>'
        . '<p>Check config.php (db host/name/user/password) and that schema.sql has been imported.</p></body>';
    exit;
});

function render(string $body, ?string $message = null, ?string $error = null): never
{
    $msgHtml = $message ? "<p class=\"ok\">" . htmlspecialchars($message) . "</p>" : '';
    $errHtml = $error ? "<p class=\"err\">" . htmlspecialchars($error) . "</p>" : '';
    echo <<<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin setup</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; background: #f8fafc; color: #0f172a;
         display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; }
  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;
           max-width: 380px; width: 100%; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
  h1 { font-size: 20px; margin: 0 0 4px; }
  p.sub { color: #64748b; font-size: 14px; margin: 0 0 20px; }
  label { display: block; font-size: 13px; font-weight: 600; margin: 14px 0 6px; }
  input { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #cbd5e1;
          border-radius: 8px; font-size: 14px; }
  button { margin-top: 20px; width: 100%; padding: 11px; background: #ea580c; color: #fff;
           border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  p.ok { background: #ecfdf5; color: #047857; padding: 10px 12px; border-radius: 8px; font-size: 14px; }
  p.err { background: #fef2f2; color: #b91c1c; padding: 10px 12px; border-radius: 8px; font-size: 14px; }
</style>
</head>
<body>
  <div class="card">
    <h1>Portfolio admin setup</h1>
    <p class="sub">One-time only. This page disables itself after an admin account exists.</p>
    {$msgHtml}{$errHtml}
    {$body}
  </div>
</body>
</html>
HTML;
    exit;
}

$pdo = db();
$adminCount = (int) $pdo->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();

if ($adminCount > 0) {
    render(
        '<p>An admin account already exists. For security this setup page no longer does anything — delete <code>setup.php</code> from the server, or go straight to <a href="/admin/login">/admin/login</a> on your site.</p>',
    );
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim((string) ($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $confirm = (string) ($_POST['confirm'] ?? '');

    $form = <<<HTML
<form method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required value="{$email}">
  <label for="password">Password</label>
  <input id="password" name="password" type="password" required minlength="8">
  <label for="confirm">Confirm password</label>
  <input id="confirm" name="confirm" type="password" required minlength="8">
  <button type="submit">Create admin account</button>
</form>
HTML;

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        render($form, null, 'Enter a valid email address.');
    }
    if (strlen($password) < 8) {
        render($form, null, 'Password must be at least 8 characters.');
    }
    if ($password !== $confirm) {
        render($form, null, 'Passwords do not match.');
    }

    // Re-check under the insert to close the race between two submissions.
    $pdo->beginTransaction();
    $stillEmpty = (int) $pdo->query('SELECT COUNT(*) FROM admin_users')->fetchColumn() === 0;
    if (!$stillEmpty) {
        $pdo->rollBack();
        render('<p>An admin account was just created by someone else. Refresh this page.</p>');
    }

    $id = uuid4();
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $pdo->prepare('INSERT INTO admin_users (id, email, password_hash) VALUES (?, ?, ?)')
        ->execute([$id, $email, $hash]);
    $pdo->commit();

    render(
        '<p><a href="/admin/login">Go to /admin/login</a> and sign in with that email and password. Then delete <code>setup.php</code> from the server.</p>',
        'Admin account created.',
    );
}

render(<<<HTML
<form method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>
  <label for="password">Password</label>
  <input id="password" name="password" type="password" required minlength="8">
  <label for="confirm">Confirm password</label>
  <input id="confirm" name="confirm" type="password" required minlength="8">
  <button type="submit">Create admin account</button>
</form>
HTML);
