<?php

/** POST /contact — public, no auth. Matches src/lib/contactSchema.ts. */
function handle_contact(string $method): void
{
    if ($method !== 'POST') {
        error_response('Method not allowed', 405);
    }

    $body = read_json_body();
    $name = trim((string) ($body['name'] ?? ''));
    $email = trim((string) ($body['email'] ?? ''));
    $subject = trim((string) ($body['subject'] ?? ''));
    $message = trim((string) ($body['message'] ?? ''));

    if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
        error_response('Please enter your full name.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        error_response('Please enter a valid email address.');
    }
    if (mb_strlen($subject) < 3 || mb_strlen($subject) > 150) {
        error_response('Subject must be at least 3 characters.');
    }
    if (mb_strlen($message) < 10 || mb_strlen($message) > 2000) {
        error_response('Message must be at least 10 characters.');
    }

    $pdo = db();
    $id = uuid4();
    $stmt = $pdo->prepare(
        'INSERT INTO contact_submissions (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([$id, $name, $email, $subject, $message]);

    json_response(['ok' => true, 'id' => $id], 201);
}

function cast_lead(array $r): array
{
    $r['progress'] = (int) $r['progress'];
    $r['project_cost'] = $r['project_cost'] !== null ? (float) $r['project_cost'] : null;
    return $r;
}

/** /leads and /leads/:id — admin only. */
function handle_leads(string $method, array $segments, array $config): void
{
    require_auth($config);
    $pdo = db();
    $id = $segments[1] ?? null;

    if ($method === 'GET' && $id === null) {
        $rows = $pdo->query('SELECT * FROM contact_submissions ORDER BY created_at DESC')->fetchAll();
        json_response(array_map('cast_lead', $rows));
    }

    if ($method === 'GET' && $id !== null) {
        $stmt = $pdo->prepare('SELECT * FROM contact_submissions WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            error_response('Not found', 404);
        }
        json_response(cast_lead($row));
    }

    if ($method === 'PUT' && $id !== null) {
        $body = read_json_body();
        $fields = [
            'status', 'phone', 'company', 'project_name', 'project_type',
            'progress', 'project_cost', 'currency', 'next_follow_up', 'notes',
        ];
        $set = [];
        $params = ['id' => $id];
        foreach ($fields as $f) {
            if (array_key_exists($f, $body)) {
                $set[] = "$f = :$f";
                $params[$f] = $body[$f];
            }
        }
        if (empty($set)) {
            error_response('No fields to update.');
        }

        $sql = 'UPDATE contact_submissions SET ' . implode(', ', $set) . ' WHERE id = :id';
        $pdo->prepare($sql)->execute($params);

        $stmt = $pdo->prepare('SELECT * FROM contact_submissions WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            error_response('Not found', 404);
        }
        json_response(cast_lead($row));
    }

    if ($method === 'DELETE' && $id !== null) {
        $stmt = $pdo->prepare('DELETE FROM contact_submissions WHERE id = ?');
        $stmt->execute([$id]);
        json_response(['ok' => true]);
    }

    error_response('Method not allowed', 405);
}
