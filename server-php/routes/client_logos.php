<?php

function handle_client_logos(string $method, array $segments, array $config): void
{
    crud_table($method, $segments, $config, [
        'table' => 'client_logos',
        'fields' => ['name', 'logo_url', 'website_url', 'sort_order'],
        'orderBy' => 'sort_order ASC',
        'cast' => function (array $r): array {
            $r['sort_order'] = (int) $r['sort_order'];
            return $r;
        },
    ]);
}
