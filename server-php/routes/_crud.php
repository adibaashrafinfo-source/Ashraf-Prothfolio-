<?php

/**
 * Generic list/create/update/delete for simple content tables (social_links,
 * projects, testimonials, client_logos) — all public to read, admin-only to
 * write, same shape of logic every time.
 */
function crud_table(string $method, array $segments, array $config, array $opts): void
{
    $pdo = db();
    $table = $opts['table'];
    $fields = $opts['fields'];
    $orderBy = $opts['orderBy'];
    $cast = $opts['cast'] ?? fn (array $r) => $r;
    $id = $segments[1] ?? null;

    if ($method === 'GET' && $id === null) {
        $rows = $pdo->query("SELECT * FROM `$table` ORDER BY $orderBy")->fetchAll();
        json_response(array_map($cast, $rows));
    }

    if ($method === 'GET' && $id !== null) {
        $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            error_response('Not found', 404);
        }
        json_response($cast($row));
    }

    if ($method === 'POST') {
        require_auth($config);
        $body = read_json_body();
        $newId = uuid4();

        $cols = ['id'];
        $placeholders = [':id'];
        $params = ['id' => $newId];
        foreach ($fields as $f) {
            $cols[] = $f;
            $placeholders[] = ":$f";
            $params[$f] = $body[$f] ?? null;
        }

        $sql = "INSERT INTO `$table` (" . implode(', ', $cols) . ') VALUES (' . implode(', ', $placeholders) . ')';
        $pdo->prepare($sql)->execute($params);

        $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
        $stmt->execute([$newId]);
        json_response($cast($stmt->fetch()), 201);
    }

    if ($method === 'PUT' && $id !== null) {
        require_auth($config);
        $body = read_json_body();

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

        $sql = "UPDATE `$table` SET " . implode(', ', $set) . ' WHERE id = :id';
        $pdo->prepare($sql)->execute($params);

        $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            error_response('Not found', 404);
        }
        json_response($cast($row));
    }

    if ($method === 'DELETE' && $id !== null) {
        require_auth($config);
        $stmt = $pdo->prepare("DELETE FROM `$table` WHERE id = ?");
        $stmt->execute([$id]);
        json_response(['ok' => true]);
    }

    error_response('Method not allowed', 405);
}
