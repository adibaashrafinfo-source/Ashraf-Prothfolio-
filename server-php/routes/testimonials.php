<?php

function handle_testimonials(string $method, array $segments, array $config): void
{
    crud_table($method, $segments, $config, [
        'table' => 'testimonials',
        'fields' => ['client_name', 'client_role', 'client_avatar_url', 'message', 'rating'],
        'orderBy' => 'created_at DESC',
        'cast' => function (array $r): array {
            $r['rating'] = (int) $r['rating'];
            return $r;
        },
    ]);
}
