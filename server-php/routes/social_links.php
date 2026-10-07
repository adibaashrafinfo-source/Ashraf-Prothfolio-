<?php

function handle_social_links(string $method, array $segments, array $config): void
{
    crud_table($method, $segments, $config, [
        'table' => 'social_links',
        'fields' => ['name', 'icon', 'href', 'sort_order'],
        'orderBy' => 'sort_order ASC',
        'cast' => function (array $r): array {
            $r['sort_order'] = (int) $r['sort_order'];
            return $r;
        },
    ]);
}
