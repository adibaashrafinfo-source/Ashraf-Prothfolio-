<?php

function handle_settings(string $method, array $config): void
{
    $pdo = db();

    if ($method === 'GET') {
        $row = $pdo->query("SELECT * FROM site_settings WHERE id = 'default'")->fetch();
        if (!$row) {
            error_response('Site settings not found — did you import schema.sql?', 404);
        }
        json_response(cast_settings($row));
    }

    if ($method === 'PUT') {
        require_auth($config);
        $body = read_json_body();

        $fields = [
            'name', 'short_name', 'title', 'tagline', 'short_bio', 'about',
            'years_experience', 'projects_completed', 'happy_clients', 'awards_won',
            'location', 'email', 'phone', 'resume_url', 'map_embed_src',
            'logo_text', 'logo_image_url',
        ];
        $set = [];
        $params = [];
        foreach ($fields as $f) {
            if (array_key_exists($f, $body)) {
                $set[] = "$f = :$f";
                $params[$f] = $body[$f];
            }
        }
        if (empty($set)) {
            error_response('No fields to update.');
        }

        $sql = 'UPDATE site_settings SET ' . implode(', ', $set) . " WHERE id = 'default'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $row = $pdo->query("SELECT * FROM site_settings WHERE id = 'default'")->fetch();
        json_response(cast_settings($row));
    }

    error_response('Method not allowed', 405);
}

function cast_settings(array $row): array
{
    $row['years_experience'] = (int) $row['years_experience'];
    $row['projects_completed'] = (int) $row['projects_completed'];
    $row['happy_clients'] = (int) $row['happy_clients'];
    $row['awards_won'] = (int) $row['awards_won'];
    return $row;
}
