<?php

function handle_projects(string $method, array $segments, array $config): void
{
    crud_table($method, $segments, $config, [
        'table' => 'projects',
        'fields' => ['title', 'category', 'description', 'image_url', 'project_url'],
        'orderBy' => 'created_at DESC',
    ]);
}
