<?php

const CRM_FILE_MIME_EXT = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
    'image/svg+xml' => 'svg',
    'application/pdf' => 'pdf',
    'application/msword' => 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
    'application/vnd.ms-excel' => 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
    'application/vnd.ms-powerpoint' => 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
    'application/zip' => 'zip',
    'application/x-zip-compressed' => 'zip',
    'text/plain' => 'txt',
];
const CRM_FILE_MAX_BYTES = 20 * 1024 * 1024; // 20MB

function cast_crm_file(array $r): array
{
    $r['size'] = (int) $r['size'];
    return $r;
}

/**
 * Shared by the admin (role=admin) and client-portal (role=client) upload
 * endpoints. $project is the already-loaded, already-authorized project row.
 */
function crm_upload_project_file(PDO $pdo, array $config, array $project, string $role): array
{
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        error_response('No file uploaded, or the upload failed.');
    }
    $file = $_FILES['file'];
    if ($file['size'] > CRM_FILE_MAX_BYTES) {
        error_response('File is too large (max 20MB).');
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    if (!isset(CRM_FILE_MIME_EXT[$mime])) {
        error_response('That file type is not allowed. Use images, PDF, Word/Excel/PowerPoint, ZIP, or TXT.');
    }

    $ext = CRM_FILE_MIME_EXT[$mime];
    $storedName = uuid4() . '.' . $ext;
    $dir = __DIR__ . '/../uploads/project-files';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $storedName)) {
        error_response('Could not save the uploaded file.', 500);
    }

    $originalName = crm_str($_POST['file_name'] ?? $file['name'], 255) ?? $file['name'];
    $note = crm_str($_POST['note'] ?? null, 500);

    $id = uuid4();
    $pdo->prepare(
        'INSERT INTO crm_files (id, project_id, client_id, category, file_name, url, size, mime, note, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $project['id'],
        $project['client_id'],
        $role === 'admin' ? 'deliverable' : 'client_asset',
        $originalName,
        rtrim($config['base_url'], '/') . '/uploads/project-files/' . $storedName,
        (int) $file['size'],
        $mime,
        $note,
        $role,
    ]);

    crm_log(
        $pdo,
        $project['client_id'],
        $project['id'],
        'file',
        ($role === 'admin' ? 'File shared with client: ' : 'Client uploaded a file: ') . $originalName,
        true
    );

    $row = crm_fetch_one($pdo, 'SELECT * FROM crm_files WHERE id = ?', [$id]);
    return cast_crm_file($row);
}

/** /crm/files and /crm/files/:id — admin only. */
function handle_crm_files(PDO $pdo, array $config, string $method, ?string $id): void
{
    if ($method === 'GET' && $id === null) {
        $projectId = crm_str($_GET['project_id'] ?? null, 36);
        if ($projectId === null) {
            error_response('project_id is required.');
        }
        $stmt = $pdo->prepare('SELECT * FROM crm_files WHERE project_id = ? ORDER BY created_at DESC');
        $stmt->execute([$projectId]);
        json_response(array_map('cast_crm_file', $stmt->fetchAll()));
    }

    if ($method === 'POST' && $id === null) {
        $projectId = crm_str($_POST['project_id'] ?? null, 36);
        $project = $projectId ? crm_fetch_one($pdo, 'SELECT * FROM crm_projects WHERE id = ?', [$projectId]) : null;
        if (!$project) {
            error_response('Choose a valid project for this file.');
        }
        json_response(crm_upload_project_file($pdo, $config, $project, 'admin'), 201);
    }

    if ($method === 'DELETE' && $id !== null) {
        $file = crm_fetch_one($pdo, 'SELECT * FROM crm_files WHERE id = ?', [$id]);
        if (!$file) {
            error_response('Not found', 404);
        }
        $pdo->prepare('DELETE FROM crm_files WHERE id = ?')->execute([$id]);
        $path = __DIR__ . '/../uploads/project-files/' . basename((string) parse_url($file['url'], PHP_URL_PATH));
        if (is_file($path)) {
            @unlink($path);
        }
        json_response(['ok' => true]);
    }

    error_response('Not found', 404);
}
