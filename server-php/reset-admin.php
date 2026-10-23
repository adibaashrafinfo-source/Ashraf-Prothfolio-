<?php
/**
 * Admin password reset without SSH or phpMyAdmin.
 *
 * Locked by default. It only works while a file named `reset-admin.txt` exists
 * in this folder and was created in the last 30 minutes — creating that file
 * through cPanel's File Manager proves you own the hosting. The file is
 * deleted automatically after a successful reset.
 */

declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0');
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

const RESET_FILE = __DIR__ . '/reset-admin.txt';
const RESET_WINDOW_SECONDS = 30 * 60;

set_exception_handler(function (Throwable $e) {
    error_log('[reset-admin.php] ' . $e->getMessage());
    http_response_code(500);
    page('<p class="err">Something went wrong: ' . htmlspecialchars($e->getMessage()) . '</p>');
});

function page(string $body): never
{
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex');
    echo <<<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Reset admin password</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; background: #0b0d12; color: #e5e7eb;
         display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; padding: 16px; }
  .card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 18px;
          padding: 32px; max-width: 420px; width: 100%; box-sizing: border-box; backdrop-filter: blur(16px); }
  h1 { font-size: 20px; margin: 0 0 6px; }
  p, li { color: #9ca3af; font-size: 14px; line-height: 1.55; }
  ol { padding-left: 20px; }
  code { background: rgba(255,255,255,.1); padding: 1px 6px; border-radius: 6px; color: #fff; }
  label { display: block; font-size: 13px; font-weight: 600; margin: 14px 0 6px; color: #e5e7eb; }
  input, select { width: 100%; box-sizing: border-box; padding: 11px 12px; border: 1px solid rgba(255,255,255,.15);
                  border-radius: 10px; font-size: 14px; background: rgba(0,0,0,.3); color: #fff; }
  button { margin-top: 20px; width: 100%; padding: 12px; background: #ea580c; color: #fff; border: none;
           border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .ok { background: rgba(16,185,129,.12); color: #6ee7b7; padding: 10px 12px; border-radius: 10px; }
  .err { background: rgba(239,68,68,.12); color: #fca5a5; padding: 10px 12px; border-radius: 10px; }
  a { color: #fb923c; }
</style>
</head>
<body><div class="card"><h1>Reset admin password</h1>{$body}</div></body>
</html>
HTML;
    exit;
}

$locked = <<<HTML
<p>This page is locked for safety. To unlock it for 30 minutes:</p>
<ol>
  <li>Open <b>cPanel → File Manager → public_html/api</b></li>
  <li>Click <b>+ File</b> and create a file named <code>reset-admin.txt</code> (leave it empty)</li>
  <li>Refresh this page</li>
</ol>
HTML;

clearstatcache();
if (!is_file(RESET_FILE)) {
    page($locked);
}
if (time() - (int) filemtime(RESET_FILE) > RESET_WINDOW_SECONDS) {
    page('<p class="err">The unlock file is older than 30 minutes.</p><p>Delete <code>reset-admin.txt</code> in File Manager and create it again, then refresh.</p>');
}

$pdo = db();
$admins = $pdo->query('SELECT id, email FROM admin_users ORDER BY created_at')->fetchAll();
if (!$admins) {
    page('<p>There is no admin account yet — create one at <a href="setup.php">setup.php</a>.</p>');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (string) ($_POST['admin_id'] ?? '');
    $password = (string) ($_POST['password'] ?? '');
    $confirm = (string) ($_POST['confirm'] ?? '');
    $match = array_values(array_filter($admins, fn ($a) => $a['id'] === $id));

    if (!$match) {
        $error = 'Choose an admin account.';
    } elseif (strlen($password) < 8) {
        $error = 'Password must be at least 8 characters.';
    } elseif ($password !== $confirm) {
        $error = 'Passwords do not match.';
    } else {
        $pdo->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')
            ->execute([password_hash($password, PASSWORD_BCRYPT), $id]);
        $removed = @unlink(RESET_FILE);
        $email = htmlspecialchars($match[0]['email']);
        page(
            "<p class=\"ok\">Password updated for <b>$email</b>.</p>"
            . '<p><a href="/admin/login">Go to the admin login →</a></p>'
            . ($removed ? '<p>This page has locked itself again.</p>' : '<p class="err">Please delete <code>reset-admin.txt</code> in File Manager now.</p>')
        );
    }
}

$options = '';
foreach ($admins as $a) {
    $options .= '<option value="' . htmlspecialchars($a['id']) . '">' . htmlspecialchars($a['email']) . '</option>';
}
$errorHtml = $error ? '<p class="err">' . htmlspecialchars($error) . '</p>' : '';

page(<<<HTML
<p>Unlocked. Choose the admin login and set a new password.</p>
{$errorHtml}
<form method="post" autocomplete="off">
  <label for="admin_id">Admin email (your login)</label>
  <select id="admin_id" name="admin_id">{$options}</select>
  <label for="password">New password</label>
  <input id="password" name="password" type="password" minlength="8" required autocomplete="new-password">
  <label for="confirm">Confirm new password</label>
  <input id="confirm" name="confirm" type="password" minlength="8" required autocomplete="new-password">
  <button type="submit">Set new password</button>
</form>
HTML);
