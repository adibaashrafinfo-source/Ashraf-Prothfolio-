<?php

/** /portal/* — the client-facing dashboard. Every query is scoped to the signed-in client. */
function handle_portal(string $method, array $segments, array $config): void
{
    $pdo = db();
    crm_ensure_schema($pdo);
    $action = $segments[1] ?? '';
    $actionId = $segments[2] ?? null;

    if ($method === 'POST' && $action === 'login') {
        $body = read_json_body();
        $email = mb_strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');
        if ($email === '' || $password === '') {
            error_response('Email and password are required.');
        }

        $client = crm_fetch_one(
            $pdo,
            'SELECT * FROM crm_clients WHERE email = ? AND portal_enabled = 1 AND password_hash IS NOT NULL',
            [$email]
        );
        if (!$client || !password_verify($password, $client['password_hash'])) {
            // Slow down password guessing a little on cheap shared hosting.
            usleep(random_int(300000, 600000));
            error_response('Invalid email or password.', 401);
        }

        $pdo->prepare('UPDATE crm_clients SET last_login_at = NOW() WHERE id = ?')->execute([$client['id']]);
        $token = jwt_sign(['sub' => $client['id'], 'email' => $client['email'], 'role' => 'client'], $config['jwt_secret']);
        json_response(['token' => $token, 'name' => $client['name']]);
    }

    $client = require_client($config);

    if ($method === 'GET' && $action === 'me') {
        $projects = $pdo->prepare(crm_project_select() . ' WHERE p.client_id = ? ORDER BY p.created_at DESC');
        $projects->execute([$client['id']]);
        $projectRows = array_map(function (array $row) {
            $p = cast_crm_project($row);
            unset($p['internal_notes'], $p['client_email']);
            return $p;
        }, $projects->fetchAll());

        $payments = $pdo->prepare(
            'SELECT pay.id, pay.project_id, pay.amount, pay.currency, pay.type, pay.method, pay.paid_at,
                    pay.reference, p.title AS project_title
             FROM crm_payments pay JOIN crm_projects p ON p.id = pay.project_id
             WHERE pay.client_id = ? ORDER BY pay.paid_at DESC, pay.created_at DESC'
        );
        $payments->execute([$client['id']]);

        $activity = $pdo->prepare(
            'SELECT a.id, a.project_id, a.type, a.message, a.created_at, p.title AS project_title
             FROM crm_activity a LEFT JOIN crm_projects p ON p.id = a.project_id
             WHERE a.client_id = ? AND a.visible_to_client = 1
             ORDER BY a.created_at DESC LIMIT 60'
        );
        $activity->execute([$client['id']]);

        $files = $pdo->prepare(
            'SELECT f.id, f.project_id, f.category, f.file_name, f.url, f.size, f.mime, f.note, f.uploaded_by, f.created_at,
                    p.title AS project_title
             FROM crm_files f JOIN crm_projects p ON p.id = f.project_id
             WHERE f.client_id = ? ORDER BY f.created_at DESC'
        );
        $files->execute([$client['id']]);

        $approvals = $pdo->prepare(
            'SELECT a.id, a.project_id, a.stage_id, a.stage_name, a.round, a.status, a.message, a.client_comment,
                    a.requested_at, a.resolved_at, p.title AS project_title
             FROM crm_stage_approvals a JOIN crm_projects p ON p.id = a.project_id
             WHERE a.client_id = ? ORDER BY a.requested_at DESC'
        );
        $approvals->execute([$client['id']]);

        json_response([
            'client' => [
                'id' => $client['id'],
                'name' => $client['name'],
                'company' => $client['company'],
                'email' => $client['email'],
                'phone' => $client['phone'],
            ],
            'projects' => $projectRows,
            'payments' => array_map('cast_crm_payment', $payments->fetchAll()),
            'activity' => $activity->fetchAll(),
            'files' => array_map('cast_crm_file', $files->fetchAll()),
            'approvals' => array_map('cast_crm_approval', $approvals->fetchAll()),
        ]);
    }

    if ($method === 'POST' && $action === 'files') {
        $projectId = crm_str($_POST['project_id'] ?? null, 36);
        $project = $projectId ? crm_fetch_one($pdo, 'SELECT * FROM crm_projects WHERE id = ?', [$projectId]) : null;
        if (!$project || $project['client_id'] !== $client['id']) {
            error_response('Project not found.', 404);
        }
        json_response(crm_upload_project_file($pdo, $config, $project, 'client'), 201);
    }

    if ($method === 'PUT' && $action === 'approvals' && $actionId !== null) {
        $body = read_json_body();
        $status = $body['status'] ?? null;
        if (!in_array($status, ['approved', 'changes_requested'], true)) {
            error_response('Invalid response.');
        }
        $comment = crm_str($body['comment'] ?? null, 2000);
        if ($status === 'changes_requested' && $comment === null) {
            error_response('Let us know what needs to change.');
        }
        json_response(crm_client_respond_approval($pdo, $client, $actionId, $status, $comment));
    }

    if ($method === 'PUT' && $action === 'password') {
        $body = read_json_body();
        $current = (string) ($body['current_password'] ?? '');
        $new = (string) ($body['new_password'] ?? '');
        if (!password_verify($current, (string) $client['password_hash'])) {
            error_response('Your current password is incorrect.');
        }
        if (strlen($new) < 8) {
            error_response('New password must be at least 8 characters.');
        }
        $pdo->prepare('UPDATE crm_clients SET password_hash = ? WHERE id = ?')
            ->execute([password_hash($new, PASSWORD_BCRYPT), $client['id']]);
        json_response(['ok' => true]);
    }

    error_response('Not found', 404);
}
