<?php

function cast_document(array $r): array
{
    $r['items'] = json_decode($r['items'], true) ?? [];
    $r['discount'] = (float) $r['discount'];
    $r['tax_percent'] = (float) $r['tax_percent'];
    $r['paid_amount'] = (float) $r['paid_amount'];
    return $r;
}

const DOCUMENT_FIELDS = [
    'kind', 'doc_number', 'lead_id', 'source_quotation_id', 'client_name',
    'client_company', 'client_email', 'client_phone', 'client_address',
    'project_title', 'project_details', 'currency', 'discount', 'tax_percent',
    'terms', 'notes', 'issue_date', 'valid_until', 'due_date', 'paid_amount',
    'template', 'status',
];

/** /documents and /documents/:id — admin only (quotations + invoices). */
function handle_documents(string $method, array $segments, array $config): void
{
    require_auth($config);
    $pdo = db();
    $id = $segments[1] ?? null;

    if ($method === 'GET' && $id === null) {
        $kind = $_GET['kind'] ?? null;
        if ($kind !== null) {
            $stmt = $pdo->prepare('SELECT * FROM business_documents WHERE kind = ? ORDER BY created_at DESC');
            $stmt->execute([$kind]);
        } else {
            $stmt = $pdo->query('SELECT * FROM business_documents ORDER BY created_at DESC');
        }
        json_response(array_map('cast_document', $stmt->fetchAll()));
    }

    if ($method === 'GET' && $id !== null) {
        $stmt = $pdo->prepare('SELECT * FROM business_documents WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            error_response('Not found', 404);
        }
        json_response(cast_document($row));
    }

    if ($method === 'POST') {
        $body = read_json_body();
        $newId = uuid4();

        // These columns are NOT NULL with no DB-side default an explicit NULL
        // could fall back to, so a partial payload still needs real numbers/dates.
        $body['discount'] ??= 0;
        $body['tax_percent'] ??= 0;
        $body['paid_amount'] ??= 0;
        $body['issue_date'] ??= date('Y-m-d');
        $body['currency'] ??= 'BDT';
        $body['template'] ??= 'modern';
        $body['status'] ??= 'draft';

        $cols = ['id', 'items'];
        $placeholders = [':id', ':items'];
        $params = ['id' => $newId, 'items' => json_encode($body['items'] ?? [])];
        foreach (DOCUMENT_FIELDS as $f) {
            $cols[] = $f;
            $placeholders[] = ":$f";
            $params[$f] = $body[$f] ?? null;
        }

        $sql = 'INSERT INTO business_documents (' . implode(', ', $cols) . ') VALUES (' . implode(', ', $placeholders) . ')';
        $pdo->prepare($sql)->execute($params);

        $stmt = $pdo->prepare('SELECT * FROM business_documents WHERE id = ?');
        $stmt->execute([$newId]);
        json_response(cast_document($stmt->fetch()), 201);
    }

    if ($method === 'PUT' && $id !== null) {
        $body = read_json_body();
        $set = [];
        $params = ['id' => $id];

        if (array_key_exists('items', $body)) {
            $set[] = 'items = :items';
            $params['items'] = json_encode($body['items']);
        }
        foreach (DOCUMENT_FIELDS as $f) {
            if (array_key_exists($f, $body)) {
                $set[] = "$f = :$f";
                $params[$f] = $body[$f];
            }
        }
        if (empty($set)) {
            error_response('No fields to update.');
        }

        $sql = 'UPDATE business_documents SET ' . implode(', ', $set) . ' WHERE id = :id';
        $pdo->prepare($sql)->execute($params);

        $stmt = $pdo->prepare('SELECT * FROM business_documents WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            error_response('Not found', 404);
        }
        json_response(cast_document($row));
    }

    if ($method === 'DELETE' && $id !== null) {
        $stmt = $pdo->prepare('DELETE FROM business_documents WHERE id = ?');
        $stmt->execute([$id]);
        json_response(['ok' => true]);
    }

    error_response('Method not allowed', 405);
}
