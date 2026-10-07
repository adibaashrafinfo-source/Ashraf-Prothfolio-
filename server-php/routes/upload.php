<?php

const ALLOWED_UPLOAD_FOLDERS = ['projects', 'testimonials', 'client-logos', 'logo'];
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME_EXT = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
    'image/svg+xml' => 'svg',
];

function handle_upload(string $method, array $config): void
{
    if ($method !== 'POST') {
        error_response('Method not allowed', 405);
    }
    require_auth($config);

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        error_response('No file uploaded, or the upload failed.');
    }

    $file = $_FILES['file'];
    if ($file['size'] > MAX_UPLOAD_BYTES) {
        error_response('File is too large (max 8MB).');
    }

    $folder = $_POST['folder'] ?? 'misc';
    if (!in_array($folder, ALLOWED_UPLOAD_FOLDERS, true)) {
        $folder = 'misc';
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!isset(ALLOWED_MIME_EXT[$mime])) {
        error_response('Only JPG, PNG, WEBP, GIF, or SVG images are allowed.');
    }

    $ext = ALLOWED_MIME_EXT[$mime];
    $filename = uuid4() . '.' . $ext;
    $dir = __DIR__ . '/../uploads/' . $folder;
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $destination = $dir . '/' . $filename;
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        error_response('Could not save the uploaded file.', 500);
    }

    $url = rtrim($config['base_url'], '/') . "/uploads/$folder/$filename";
    json_response(['url' => $url], 201);
}
