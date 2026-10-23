<?php

const CRM_CLIENT_STATUSES = ['active', 'inactive', 'prospect'];
const CRM_PROJECT_STATUSES = ['not_started', 'running', 'on_hold', 'review', 'completed', 'cancelled'];
const CRM_OPEN_PROJECT_STATUSES = ['not_started', 'running', 'on_hold', 'review'];
const CRM_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CRM_STAGE_STATUSES = ['pending', 'running', 'done', 'hold', 'skipped'];
const CRM_PAYMENT_TYPES = ['advance', 'installment', 'final', 'refund'];

const CRM_CLIENT_FIELDS = [
    'name' => 255, 'company' => 255, 'email' => 255, 'phone' => 50, 'whatsapp' => 50,
    'address' => 2000, 'website' => 500, 'industry' => 255, 'source' => 100, 'notes' => 5000,
];

const CRM_STAGE_TEMPLATES = [
    'Website Development' => [
        'Requirement Analysis', 'UI/UX Design', 'Frontend Development', 'Backend Development',
        'Database Setup', 'Content Upload', 'Testing & QA', 'Deployment & Launch',
    ],
    'E-Commerce Website' => [
        'Requirement Analysis', 'UI/UX Design', 'Frontend Development', 'Backend Development',
        'Database Setup', 'Payment Gateway Integration', 'Product Upload', 'Testing & QA', 'Launch',
    ],
    'Web Application / SaaS' => [
        'Requirement Analysis', 'System Architecture', 'UI/UX Design', 'Frontend Development',
        'Backend & API Development', 'Database Design', 'Testing & QA', 'Deployment',
    ],
    'Mobile App Development' => [
        'Requirement Analysis', 'UI/UX Design', 'App UI Development', 'Backend & API',
        'Database Setup', 'Testing & QA', 'Store Submission', 'Launch',
    ],
    'SEO' => [
        'Website Audit', 'Keyword Research', 'On-Page SEO', 'Technical SEO',
        'Content Optimization', 'Link Building', 'Monthly Reporting',
    ],
    'Digital Marketing' => [
        'Strategy & Planning', 'Content Creation', 'Ad Campaign Setup', 'Campaign Running',
        'Optimization', 'Reporting',
    ],
    'Social Media Management' => [
        'Account Setup & Audit', 'Content Calendar', 'Content Design', 'Posting & Engagement',
        'Monthly Reporting',
    ],
    'Graphics Design' => [
        'Brief & Research', 'Concept', 'Initial Design', 'Client Review', 'Revisions', 'Final Delivery',
    ],
    'Branding' => [
        'Brand Discovery', 'Logo Concepts', 'Logo Finalization', 'Brand Guidelines',
        'Stationery Design', 'Final Delivery',
    ],
    'Other' => ['Planning', 'In Progress', 'Review', 'Delivery'],
];

/* ---------------------------------------------------------------- helpers */

function crm_str($value, int $max = 255): ?string
{
    if ($value === null || is_array($value)) {
        return null;
    }
    $s = trim((string) $value);
    return $s === '' ? null : mb_substr($s, 0, $max);
}

function crm_date($value, string $field): ?string
{
    $s = crm_str($value, 10);
    if ($s === null) {
        return null;
    }
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $s, $m) || !checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
        error_response("Invalid date for $field.");
    }
    return $s;
}

function crm_enum($value, array $allowed, string $field, string $default): string
{
    if ($value === null || $value === '') {
        return $default;
    }
    if (!in_array($value, $allowed, true)) {
        error_response("Invalid $field.");
    }
    return $value;
}

function crm_money($value, string $field): float
{
    if ($value === null || $value === '') {
        return 0.0;
    }
    if (!is_numeric($value) || (float) $value < 0) {
        error_response("Invalid $field.");
    }
    return round((float) $value, 2);
}

function crm_url($value, string $field): ?string
{
    $s = crm_str($value, 500);
    if ($s === null) {
        return null;
    }
    if (!preg_match('#^https?://#i', $s)) {
        $s = 'https://' . $s;
    }
    if (!filter_var($s, FILTER_VALIDATE_URL)) {
        error_response("Invalid link for $field.");
    }
    return $s;
}

function crm_format_money(float $amount, string $currency): string
{
    $symbols = ['BDT' => '৳', 'USD' => '$', 'EUR' => '€', 'GBP' => '£', 'INR' => '₹'];
    $symbol = $symbols[$currency] ?? ($currency . ' ');
    return $symbol . number_format($amount, $amount == floor($amount) ? 0 : 2);
}

function crm_log(PDO $pdo, ?string $clientId, ?string $projectId, string $type, string $message, bool $visible): void
{
    $pdo->prepare(
        'INSERT INTO crm_activity (id, client_id, project_id, type, message, visible_to_client) VALUES (?, ?, ?, ?, ?, ?)'
    )->execute([uuid4(), $clientId, $projectId, $type, mb_substr($message, 0, 2000), $visible ? 1 : 0]);
}

function crm_fetch_one(PDO $pdo, string $sql, array $params): ?array
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();
    return $row === false ? null : $row;
}

/** Builds and runs an INSERT from a whitelisted column => value map. */
function crm_insert(PDO $pdo, string $table, array $data): void
{
    $cols = array_keys($data);
    $sql = "INSERT INTO `$table` (" . implode(', ', $cols) . ') VALUES (:' . implode(', :', $cols) . ')';
    $pdo->prepare($sql)->execute($data);
}

function crm_update(PDO $pdo, string $table, string $id, array $data): void
{
    if (empty($data)) {
        return;
    }
    $set = array_map(fn ($c) => "$c = :$c", array_keys($data));
    $data['__id'] = $id;
    $pdo->prepare("UPDATE `$table` SET " . implode(', ', $set) . ' WHERE id = :__id')->execute($data);
}

/* ----------------------------------------------------------------- stages */

function crm_template_stages(string $serviceType): array
{
    $names = CRM_STAGE_TEMPLATES[$serviceType] ?? CRM_STAGE_TEMPLATES['Other'];
    return array_map(fn ($name) => [
        'id' => substr(str_replace('-', '', uuid4()), 0, 10),
        'name' => $name,
        'status' => 'pending',
        'started_at' => null,
        'completed_at' => null,
        'note' => null,
    ], $names);
}

function crm_validate_stages($stages): array
{
    if (!is_array($stages) || array_is_list($stages) === false) {
        error_response('Invalid stages.');
    }
    if (count($stages) > 30) {
        error_response('A project can have at most 30 stages.');
    }
    $out = [];
    foreach ($stages as $s) {
        if (!is_array($s)) {
            error_response('Invalid stages.');
        }
        $name = crm_str($s['name'] ?? null, 100);
        if ($name === null) {
            error_response('Every stage needs a name.');
        }
        $id = $s['id'] ?? null;
        if (!is_string($id) || !preg_match('/^[A-Za-z0-9_-]{1,40}$/', $id)) {
            $id = substr(str_replace('-', '', uuid4()), 0, 10);
        }
        $out[] = [
            'id' => $id,
            'name' => $name,
            'status' => crm_enum($s['status'] ?? null, CRM_STAGE_STATUSES, 'stage status', 'pending'),
            'started_at' => crm_date($s['started_at'] ?? null, 'stage start'),
            'completed_at' => crm_date($s['completed_at'] ?? null, 'stage completion'),
            'note' => crm_str($s['note'] ?? null, 500),
        ];
    }
    return $out;
}

function crm_stage_progress(array $stages): int
{
    $total = 0;
    $done = 0;
    foreach ($stages as $s) {
        if ($s['status'] === 'skipped') {
            continue;
        }
        $total++;
        if ($s['status'] === 'done') {
            $done++;
        }
    }
    return $total === 0 ? 0 : (int) round($done / $total * 100);
}

function crm_current_stage(array $stages): ?array
{
    foreach (['running', 'hold'] as $status) {
        foreach ($stages as $s) {
            if ($s['status'] === $status) {
                return $s;
            }
        }
    }
    foreach ($stages as $s) {
        if ($s['status'] === 'pending') {
            return $s;
        }
    }
    return null;
}

/* --------------------------------------------------------------- casting */

const CRM_PAID_SQL = "COALESCE(SUM(CASE WHEN pay.type = 'refund' THEN -pay.amount ELSE pay.amount END), 0)";

function crm_client_select(): string
{
    $paid = CRM_PAID_SQL;
    return "SELECT c.*,
      (SELECT COUNT(*) FROM crm_projects p WHERE p.client_id = c.id) AS project_count,
      (SELECT COUNT(*) FROM crm_projects p WHERE p.client_id = c.id
         AND p.status IN ('not_started','running','on_hold','review')) AS active_projects,
      (SELECT COALESCE(SUM(p.total_cost), 0) FROM crm_projects p
         WHERE p.client_id = c.id AND p.status <> 'cancelled') AS total_value,
      (SELECT $paid FROM crm_payments pay WHERE pay.client_id = c.id) AS paid_amount,
      (SELECT COALESCE(SUM(GREATEST(p.total_cost -
         (SELECT $paid FROM crm_payments pay WHERE pay.project_id = p.id), 0)), 0)
         FROM crm_projects p WHERE p.client_id = c.id AND p.status <> 'cancelled') AS due_amount
      FROM crm_clients c";
}

function crm_project_select(): string
{
    $paid = CRM_PAID_SQL;
    return "SELECT p.*, c.name AS client_name, c.company AS client_company, c.email AS client_email,
      (SELECT $paid FROM crm_payments pay WHERE pay.project_id = p.id) AS paid_amount,
      (SELECT COALESCE(SUM(pay.amount), 0) FROM crm_payments pay
         WHERE pay.project_id = p.id AND pay.type = 'advance') AS advance_amount
      FROM crm_projects p JOIN crm_clients c ON c.id = p.client_id";
}

function cast_crm_client(array $r): array
{
    $r['has_password'] = !empty($r['password_hash']);
    unset($r['password_hash']);
    $r['portal_enabled'] = (bool) $r['portal_enabled'];
    foreach (['project_count', 'active_projects'] as $k) {
        if (array_key_exists($k, $r)) {
            $r[$k] = (int) $r[$k];
        }
    }
    foreach (['total_value', 'paid_amount', 'due_amount'] as $k) {
        if (array_key_exists($k, $r)) {
            $r[$k] = (float) $r[$k];
        }
    }
    return $r;
}

function cast_crm_project(array $r): array
{
    $r['stages'] = json_decode((string) $r['stages'], true) ?: [];
    $r['progress'] = (int) $r['progress'];
    $r['total_cost'] = (float) $r['total_cost'];
    $r['paid_amount'] = (float) ($r['paid_amount'] ?? 0);
    $r['advance_amount'] = (float) ($r['advance_amount'] ?? 0);
    $r['due_amount'] = $r['status'] === 'cancelled' ? 0.0 : max(0.0, round($r['total_cost'] - $r['paid_amount'], 2));
    $current = crm_current_stage($r['stages']);
    $r['current_stage'] = $current['name'] ?? null;
    $r['current_stage_status'] = $current['status'] ?? null;
    return $r;
}

function cast_crm_payment(array $r): array
{
    $r['amount'] = (float) $r['amount'];
    return $r;
}

function cast_crm_activity(array $r): array
{
    $r['visible_to_client'] = (bool) $r['visible_to_client'];
    return $r;
}

function crm_get_project(PDO $pdo, string $id): ?array
{
    $row = crm_fetch_one($pdo, crm_project_select() . ' WHERE p.id = ?', [$id]);
    return $row ? cast_crm_project($row) : null;
}

function crm_get_client(PDO $pdo, string $id): ?array
{
    $row = crm_fetch_one($pdo, crm_client_select() . ' WHERE c.id = ?', [$id]);
    return $row ? cast_crm_client($row) : null;
}

/* ---------------------------------------------------------------- router */

/** /crm/* — admin only. */
function handle_crm(string $method, array $segments, array $config): void
{
    require_auth($config);
    $pdo = db();
    crm_ensure_schema($pdo);

    $resource = $segments[1] ?? '';
    $id = $segments[2] ?? null;
    $action = $segments[3] ?? null;

    match ($resource) {
        'clients' => crm_clients_route($pdo, $method, $id, $action),
        'projects' => crm_projects_route($pdo, $method, $id),
        'payments' => crm_payments_route($pdo, $method, $id),
        'activity' => crm_activity_route($pdo, $method, $id),
        'stats' => crm_stats_route($pdo, $method),
        'convert-lead' => crm_convert_lead_route($pdo, $method),
        'service-types' => json_response(array_keys(CRM_STAGE_TEMPLATES)),
        default => error_response('Not found', 404),
    };
}

/* --------------------------------------------------------------- clients */

function crm_client_input(array $body, bool $creating): array
{
    $data = [];
    foreach (CRM_CLIENT_FIELDS as $field => $max) {
        if ($creating || array_key_exists($field, $body)) {
            $data[$field] = crm_str($body[$field] ?? null, $max);
        }
    }
    if (array_key_exists('website', $data)) {
        $data['website'] = crm_url($data['website'], 'website');
    }
    if (array_key_exists('name', $data) && $data['name'] === null) {
        error_response('Client name is required.');
    }
    if (array_key_exists('email', $data) && $data['email'] !== null) {
        $data['email'] = mb_strtolower($data['email']);
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            error_response('Please enter a valid email address.');
        }
    }
    if ($creating || array_key_exists('status', $body)) {
        $data['status'] = crm_enum($body['status'] ?? null, CRM_CLIENT_STATUSES, 'client status', 'active');
    }
    return $data;
}

function crm_save_client_or_conflict(callable $fn): void
{
    try {
        $fn();
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            error_response('A client with this email already exists.', 409);
        }
        throw $e;
    }
}

function crm_clients_route(PDO $pdo, string $method, ?string $id, ?string $action): void
{
    if ($method === 'GET' && $id === null) {
        $rows = $pdo->query(crm_client_select() . ' ORDER BY c.created_at DESC')->fetchAll();
        json_response(array_map('cast_crm_client', $rows));
    }

    if ($method === 'POST' && $id === null) {
        $data = crm_client_input(read_json_body(), true);
        $data['id'] = uuid4();
        crm_save_client_or_conflict(fn () => crm_insert($pdo, 'crm_clients', $data));
        crm_log($pdo, $data['id'], null, 'client', "Client added: {$data['name']}", false);
        json_response(crm_get_client($pdo, $data['id']), 201);
    }

    if ($id === null) {
        error_response('Method not allowed', 405);
    }

    $client = crm_get_client($pdo, $id);
    if (!$client) {
        error_response('Client not found.', 404);
    }

    if ($method === 'GET' && $action === null) {
        $projects = $pdo->prepare(crm_project_select() . ' WHERE p.client_id = ? ORDER BY p.created_at DESC');
        $projects->execute([$id]);
        $payments = $pdo->prepare(
            'SELECT pay.*, p.title AS project_title FROM crm_payments pay
             JOIN crm_projects p ON p.id = pay.project_id
             WHERE pay.client_id = ? ORDER BY pay.paid_at DESC, pay.created_at DESC'
        );
        $payments->execute([$id]);
        $activity = $pdo->prepare(
            'SELECT a.*, p.title AS project_title FROM crm_activity a
             LEFT JOIN crm_projects p ON p.id = a.project_id
             WHERE a.client_id = ? ORDER BY a.created_at DESC LIMIT 100'
        );
        $activity->execute([$id]);

        $client['projects'] = array_map('cast_crm_project', $projects->fetchAll());
        $client['payments'] = array_map('cast_crm_payment', $payments->fetchAll());
        $client['activity'] = array_map('cast_crm_activity', $activity->fetchAll());
        json_response($client);
    }

    if ($method === 'PUT' && $action === null) {
        $data = crm_client_input(read_json_body(), false);
        if (empty($data)) {
            error_response('No fields to update.');
        }
        crm_save_client_or_conflict(fn () => crm_update($pdo, 'crm_clients', $id, $data));
        json_response(crm_get_client($pdo, $id));
    }

    if ($method === 'PUT' && $action === 'portal') {
        $body = read_json_body();
        $enabled = (bool) ($body['enabled'] ?? false);
        $password = (string) ($body['password'] ?? '');
        $data = ['portal_enabled' => $enabled ? 1 : 0];

        if ($password !== '') {
            if (strlen($password) < 8) {
                error_response('Password must be at least 8 characters.');
            }
            $data['password_hash'] = password_hash($password, PASSWORD_BCRYPT);
        }
        if ($enabled) {
            if ($client['email'] === null) {
                error_response('Add an email address for this client before enabling the portal.');
            }
            if ($password === '' && !$client['has_password']) {
                error_response('Set a password to enable the client portal.');
            }
        }
        crm_update($pdo, 'crm_clients', $id, $data);
        json_response(crm_get_client($pdo, $id));
    }

    if ($method === 'DELETE' && $action === null) {
        $pdo->prepare('DELETE FROM crm_clients WHERE id = ?')->execute([$id]);
        json_response(['ok' => true]);
    }

    error_response('Method not allowed', 405);
}

/* -------------------------------------------------------------- projects */

function crm_project_input(array $body, bool $creating): array
{
    $data = [];
    $strings = ['title' => 255, 'service_type' => 100, 'description' => 5000, 'currency' => 10,
        'client_note' => 5000, 'internal_notes' => 5000];
    foreach ($strings as $field => $max) {
        if ($creating || array_key_exists($field, $body)) {
            $data[$field] = crm_str($body[$field] ?? null, $max);
        }
    }
    if (array_key_exists('title', $data) && $data['title'] === null) {
        error_response('Project title is required.');
    }
    if (array_key_exists('service_type', $data) && $data['service_type'] === null) {
        $data['service_type'] = 'Website Development';
    }
    if (array_key_exists('currency', $data)) {
        $data['currency'] = strtoupper($data['currency'] ?? 'BDT');
        if (!preg_match('/^[A-Z]{3}$/', $data['currency'])) {
            error_response('Invalid currency.');
        }
    }
    if ($creating || array_key_exists('status', $body)) {
        $data['status'] = crm_enum($body['status'] ?? null, CRM_PROJECT_STATUSES, 'project status', 'not_started');
    }
    if ($creating || array_key_exists('priority', $body)) {
        $data['priority'] = crm_enum($body['priority'] ?? null, CRM_PRIORITIES, 'priority', 'medium');
    }
    if ($creating || array_key_exists('total_cost', $body)) {
        $data['total_cost'] = crm_money($body['total_cost'] ?? null, 'project cost');
    }
    foreach (['start_date' => 'start date', 'deadline' => 'deadline', 'completed_at' => 'completion date'] as $field => $label) {
        if ($creating || array_key_exists($field, $body)) {
            $data[$field] = crm_date($body[$field] ?? null, $label);
        }
    }
    foreach (['live_url' => 'live site', 'staging_url' => 'preview link'] as $field => $label) {
        if ($creating || array_key_exists($field, $body)) {
            $data[$field] = crm_url($body[$field] ?? null, $label);
        }
    }
    return $data;
}

/** Stamps start/finish dates on stages whose status just changed, and logs each change. */
function crm_apply_stage_changes(array $old, array $new, string $today): array
{
    $oldById = [];
    foreach ($old as $s) {
        $oldById[$s['id']] = $s;
    }
    $changes = [];
    foreach ($new as &$s) {
        $prev = $oldById[$s['id']] ?? null;
        $prevStatus = $prev['status'] ?? 'pending';
        if ($prevStatus === $s['status']) {
            continue;
        }
        if ($s['status'] === 'running' && $s['started_at'] === null) {
            $s['started_at'] = $today;
        }
        if ($s['status'] === 'done') {
            $s['started_at'] ??= $today;
            $s['completed_at'] ??= $today;
        }
        if ($s['status'] !== 'done') {
            $s['completed_at'] = null;
        }
        $changes[] = $s;
    }
    unset($s);
    return [$new, $changes];
}

const CRM_STAGE_LABELS = [
    'pending' => 'Pending', 'running' => 'In progress', 'done' => 'Completed',
    'hold' => 'On hold', 'skipped' => 'Skipped',
];
const CRM_PROJECT_STATUS_LABELS = [
    'not_started' => 'Not started', 'running' => 'Running', 'on_hold' => 'On hold',
    'review' => 'In review', 'completed' => 'Completed', 'cancelled' => 'Cancelled',
];

function crm_projects_route(PDO $pdo, string $method, ?string $id): void
{
    $today = date('Y-m-d');

    if ($method === 'GET' && $id === null) {
        $where = [];
        $params = [];
        if (!empty($_GET['client_id'])) {
            $where[] = 'p.client_id = ?';
            $params[] = (string) $_GET['client_id'];
        }
        if (!empty($_GET['status'])) {
            $where[] = 'p.status = ?';
            $params[] = (string) $_GET['status'];
        }
        $sql = crm_project_select() . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . ' ORDER BY p.created_at DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        json_response(array_map('cast_crm_project', $stmt->fetchAll()));
    }

    if ($method === 'POST' && $id === null) {
        $body = read_json_body();
        $clientId = crm_str($body['client_id'] ?? null, 36);
        if ($clientId === null || !crm_fetch_one($pdo, 'SELECT id FROM crm_clients WHERE id = ?', [$clientId])) {
            error_response('Choose a valid client for this project.');
        }
        $data = crm_project_input($body, true);
        $stages = isset($body['stages']) ? crm_validate_stages($body['stages']) : crm_template_stages($data['service_type']);
        [$stages] = crm_apply_stage_changes([], $stages, $today);

        $data['id'] = uuid4();
        $data['client_id'] = $clientId;
        $data['stages'] = json_encode($stages, JSON_UNESCAPED_UNICODE);
        $data['progress'] = $data['status'] === 'completed' ? 100 : crm_stage_progress($stages);
        if ($data['status'] === 'completed') {
            $data['completed_at'] ??= $today;
        }
        if ($data['status'] === 'running') {
            $data['start_date'] ??= $today;
        }
        crm_insert($pdo, 'crm_projects', $data);
        crm_log($pdo, $clientId, $data['id'], 'project', "New project started: {$data['title']} ({$data['service_type']})", true);
        json_response(crm_get_project($pdo, $data['id']), 201);
    }

    if ($id === null) {
        error_response('Method not allowed', 405);
    }

    $project = crm_get_project($pdo, $id);
    if (!$project) {
        error_response('Project not found.', 404);
    }

    if ($method === 'GET') {
        $payments = $pdo->prepare('SELECT * FROM crm_payments WHERE project_id = ? ORDER BY paid_at DESC, created_at DESC');
        $payments->execute([$id]);
        $activity = $pdo->prepare('SELECT * FROM crm_activity WHERE project_id = ? ORDER BY created_at DESC LIMIT 100');
        $activity->execute([$id]);
        $project['payments'] = array_map('cast_crm_payment', $payments->fetchAll());
        $project['activity'] = array_map('cast_crm_activity', $activity->fetchAll());
        json_response($project);
    }

    if ($method === 'PUT') {
        $body = read_json_body();
        $data = crm_project_input($body, false);
        $clientId = $project['client_id'];
        $title = $data['title'] ?? $project['title'];

        $stages = $project['stages'];
        $stagesChanged = false;
        if (!empty($body['reset_stages'])) {
            $stages = crm_template_stages($data['service_type'] ?? $project['service_type']);
            $stagesChanged = true;
        } elseif (array_key_exists('stages', $body)) {
            [$stages, $changes] = crm_apply_stage_changes($project['stages'], crm_validate_stages($body['stages']), $today);
            $stagesChanged = true;
            foreach ($changes as $s) {
                $label = CRM_STAGE_LABELS[$s['status']];
                crm_log($pdo, $clientId, $id, 'stage', "$title — {$s['name']}: $label", true);
            }
            $anyRunning = (bool) array_filter($stages, fn ($s) => $s['status'] === 'running');
            if ($anyRunning && $project['status'] === 'not_started' && !isset($data['status'])) {
                $data['status'] = 'running';
            }
        }

        $status = $data['status'] ?? $project['status'];
        if ($stagesChanged) {
            $data['stages'] = json_encode($stages, JSON_UNESCAPED_UNICODE);
        }
        if ($status === 'completed') {
            $data['progress'] = 100;
            if (empty($project['completed_at']) && !array_key_exists('completed_at', $data)) {
                $data['completed_at'] = $today;
            }
        } elseif ($stagesChanged || $status !== $project['status']) {
            $data['progress'] = count($stages) > 0 ? crm_stage_progress($stages) : (int) $project['progress'];
        }
        if ($status === 'running' && empty($project['start_date']) && !array_key_exists('start_date', $data)) {
            $data['start_date'] = $today;
        }
        if (empty($data)) {
            error_response('No fields to update.');
        }

        crm_update($pdo, 'crm_projects', $id, $data);
        if ($status !== $project['status']) {
            crm_log($pdo, $clientId, $id, 'status', "$title — project status: " . CRM_PROJECT_STATUS_LABELS[$status], true);
        }
        json_response(crm_get_project($pdo, $id));
    }

    if ($method === 'DELETE') {
        $pdo->prepare('DELETE FROM crm_projects WHERE id = ?')->execute([$id]);
        crm_log($pdo, $project['client_id'], null, 'project', "Project deleted: {$project['title']}", false);
        json_response(['ok' => true]);
    }

    error_response('Method not allowed', 405);
}

/* -------------------------------------------------------------- payments */

function crm_payment_input(array $body, bool $creating): array
{
    $data = [];
    if ($creating || array_key_exists('amount', $body)) {
        $data['amount'] = crm_money($body['amount'] ?? null, 'amount');
        if ($data['amount'] <= 0) {
            error_response('Payment amount must be more than zero.');
        }
    }
    if ($creating || array_key_exists('type', $body)) {
        $data['type'] = crm_enum($body['type'] ?? null, CRM_PAYMENT_TYPES, 'payment type', 'installment');
    }
    if ($creating || array_key_exists('method', $body)) {
        $data['method'] = crm_str($body['method'] ?? null, 50) ?? 'Cash';
    }
    if ($creating || array_key_exists('paid_at', $body)) {
        $data['paid_at'] = crm_date($body['paid_at'] ?? null, 'payment date') ?? date('Y-m-d');
    }
    foreach (['reference' => 255, 'note' => 2000] as $field => $max) {
        if ($creating || array_key_exists($field, $body)) {
            $data[$field] = crm_str($body[$field] ?? null, $max);
        }
    }
    return $data;
}

function crm_payments_route(PDO $pdo, string $method, ?string $id): void
{
    if ($method === 'GET' && $id === null) {
        $where = [];
        $params = [];
        foreach (['project_id' => 'pay.project_id = ?', 'client_id' => 'pay.client_id = ?'] as $key => $clause) {
            if (!empty($_GET[$key])) {
                $where[] = $clause;
                $params[] = (string) $_GET[$key];
            }
        }
        if (!empty($_GET['from'])) {
            $where[] = 'pay.paid_at >= ?';
            $params[] = crm_date($_GET['from'], 'from');
        }
        if (!empty($_GET['to'])) {
            $where[] = 'pay.paid_at <= ?';
            $params[] = crm_date($_GET['to'], 'to');
        }
        $sql = 'SELECT pay.*, p.title AS project_title, c.name AS client_name FROM crm_payments pay
                JOIN crm_projects p ON p.id = pay.project_id
                JOIN crm_clients c ON c.id = pay.client_id'
            . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
            . ' ORDER BY pay.paid_at DESC, pay.created_at DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        json_response(array_map('cast_crm_payment', $stmt->fetchAll()));
    }

    if ($method === 'POST' && $id === null) {
        $body = read_json_body();
        $projectId = crm_str($body['project_id'] ?? null, 36);
        $project = $projectId ? crm_fetch_one($pdo, 'SELECT * FROM crm_projects WHERE id = ?', [$projectId]) : null;
        if (!$project) {
            error_response('Choose a valid project for this payment.');
        }
        $data = crm_payment_input($body, true);
        $data['id'] = uuid4();
        $data['project_id'] = $project['id'];
        $data['client_id'] = $project['client_id'];
        $data['currency'] = $project['currency'];
        crm_insert($pdo, 'crm_payments', $data);

        $amount = crm_format_money($data['amount'], $data['currency']);
        $message = $data['type'] === 'refund'
            ? "Refund issued: $amount for {$project['title']}"
            : "Payment received: $amount ({$data['type']}) via {$data['method']} for {$project['title']}";
        crm_log($pdo, $project['client_id'], $project['id'], 'payment', $message, true);

        $row = crm_fetch_one($pdo, 'SELECT * FROM crm_payments WHERE id = ?', [$data['id']]);
        json_response(cast_crm_payment($row), 201);
    }

    if ($id === null) {
        error_response('Method not allowed', 405);
    }

    $payment = crm_fetch_one($pdo, 'SELECT * FROM crm_payments WHERE id = ?', [$id]);
    if (!$payment) {
        error_response('Payment not found.', 404);
    }

    if ($method === 'PUT') {
        $data = crm_payment_input(read_json_body(), false);
        if (empty($data)) {
            error_response('No fields to update.');
        }
        crm_update($pdo, 'crm_payments', $id, $data);
        json_response(cast_crm_payment(crm_fetch_one($pdo, 'SELECT * FROM crm_payments WHERE id = ?', [$id])));
    }

    if ($method === 'DELETE') {
        $pdo->prepare('DELETE FROM crm_payments WHERE id = ?')->execute([$id]);
        $amount = crm_format_money((float) $payment['amount'], $payment['currency']);
        crm_log($pdo, $payment['client_id'], $payment['project_id'], 'payment', "Payment record deleted: $amount", false);
        json_response(['ok' => true]);
    }

    error_response('Method not allowed', 405);
}

/* -------------------------------------------------------------- activity */

function crm_activity_route(PDO $pdo, string $method, ?string $id): void
{
    if ($method === 'GET' && $id === null) {
        $where = [];
        $params = [];
        if (!empty($_GET['date'])) {
            $where[] = 'a.created_at >= ? AND a.created_at < DATE_ADD(?, INTERVAL 1 DAY)';
            $date = crm_date($_GET['date'], 'date');
            $params[] = $date;
            $params[] = $date;
        }
        foreach (['project_id' => 'a.project_id = ?', 'client_id' => 'a.client_id = ?'] as $key => $clause) {
            if (!empty($_GET[$key])) {
                $where[] = $clause;
                $params[] = (string) $_GET[$key];
            }
        }
        $limit = max(1, min(500, (int) ($_GET['limit'] ?? 200)));
        $sql = 'SELECT a.*, p.title AS project_title, c.name AS client_name FROM crm_activity a
                LEFT JOIN crm_projects p ON p.id = a.project_id
                LEFT JOIN crm_clients c ON c.id = a.client_id'
            . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
            . " ORDER BY a.created_at DESC LIMIT $limit";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        json_response(array_map('cast_crm_activity', $stmt->fetchAll()));
    }

    if ($method === 'POST' && $id === null) {
        $body = read_json_body();
        $message = crm_str($body['message'] ?? null, 2000);
        if ($message === null) {
            error_response('Write a message for this update.');
        }
        $projectId = crm_str($body['project_id'] ?? null, 36);
        $clientId = crm_str($body['client_id'] ?? null, 36);
        if ($projectId !== null) {
            $project = crm_fetch_one($pdo, 'SELECT client_id FROM crm_projects WHERE id = ?', [$projectId]);
            if (!$project) {
                error_response('Project not found.', 404);
            }
            $clientId = $project['client_id'];
        } elseif ($clientId !== null && !crm_fetch_one($pdo, 'SELECT id FROM crm_clients WHERE id = ?', [$clientId])) {
            error_response('Client not found.', 404);
        }
        $newId = uuid4();
        $pdo->prepare(
            'INSERT INTO crm_activity (id, client_id, project_id, type, message, visible_to_client) VALUES (?, ?, ?, ?, ?, ?)'
        )->execute([$newId, $clientId, $projectId, 'note', $message, !empty($body['visible_to_client']) ? 1 : 0]);
        json_response(cast_crm_activity(crm_fetch_one($pdo, 'SELECT * FROM crm_activity WHERE id = ?', [$newId])), 201);
    }

    if ($method === 'DELETE' && $id !== null) {
        $pdo->prepare('DELETE FROM crm_activity WHERE id = ?')->execute([$id]);
        json_response(['ok' => true]);
    }

    error_response('Method not allowed', 405);
}

/* ----------------------------------------------------------------- stats */

function crm_stats_route(PDO $pdo, string $method): void
{
    if ($method !== 'GET') {
        error_response('Method not allowed', 405);
    }
    $today = date('Y-m-d');
    $monthStart = date('Y-m-01');

    $projects = array_map('cast_crm_project', $pdo->query(crm_project_select())->fetchAll());
    $statusCounts = array_fill_keys(CRM_PROJECT_STATUSES, 0);
    $totalValue = 0.0;
    $due = 0.0;
    $overdue = 0;
    foreach ($projects as $p) {
        $statusCounts[$p['status']]++;
        if ($p['status'] !== 'cancelled') {
            $totalValue += $p['total_cost'];
            $due += $p['due_amount'];
        }
        if (in_array($p['status'], CRM_OPEN_PROJECT_STATUSES, true) && $p['deadline'] && $p['deadline'] < $today) {
            $overdue++;
        }
    }

    $sum = function (string $where, array $params) use ($pdo): float {
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(CASE WHEN type = 'refund' THEN -amount ELSE amount END), 0) FROM crm_payments $where");
        $stmt->execute($params);
        return (float) $stmt->fetchColumn();
    };

    $monthly = $pdo->prepare(
        "SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month,
                COALESCE(SUM(CASE WHEN type = 'refund' THEN -amount ELSE amount END), 0) AS total
         FROM crm_payments WHERE paid_at >= ? GROUP BY DATE_FORMAT(paid_at, '%Y-%m') ORDER BY month"
    );
    $monthly->execute([date('Y-m-01', strtotime('-5 months', strtotime($monthStart)))]);
    $monthlyMap = [];
    foreach ($monthly->fetchAll() as $row) {
        $monthlyMap[$row['month']] = (float) $row['total'];
    }
    $months = [];
    for ($i = 5; $i >= 0; $i--) {
        $key = date('Y-m', strtotime("-$i months", strtotime($monthStart)));
        $months[] = ['month' => $key, 'total' => $monthlyMap[$key] ?? 0.0];
    }

    $clients = $pdo->query(
        "SELECT COUNT(*) AS total, COALESCE(SUM(status = 'active'), 0) AS active FROM crm_clients"
    )->fetch();

    json_response([
        'clients_total' => (int) $clients['total'],
        'clients_active' => (int) $clients['active'],
        'projects_total' => count($projects),
        'projects_by_status' => $statusCounts,
        'projects_overdue' => $overdue,
        'total_value' => round($totalValue, 2),
        'collected_total' => $sum('', []),
        'collected_month' => $sum('WHERE paid_at >= ?', [$monthStart]),
        'collected_today' => $sum('WHERE paid_at = ?', [$today]),
        'due_total' => round($due, 2),
        'monthly' => $months,
        'today' => $today,
    ]);
}

/* ---------------------------------------------------------- lead convert */

function crm_convert_lead_route(PDO $pdo, string $method): void
{
    if ($method !== 'POST') {
        error_response('Method not allowed', 405);
    }
    $body = read_json_body();
    $leadId = crm_str($body['lead_id'] ?? null, 36);
    $lead = $leadId ? crm_fetch_one($pdo, 'SELECT * FROM contact_submissions WHERE id = ?', [$leadId]) : null;
    if (!$lead) {
        error_response('Lead not found.', 404);
    }

    $email = mb_strtolower(trim($lead['email']));
    $existing = crm_fetch_one($pdo, 'SELECT id FROM crm_clients WHERE email = ?', [$email]);
    $clientId = $existing['id'] ?? uuid4();

    if (!$existing) {
        crm_insert($pdo, 'crm_clients', [
            'id' => $clientId,
            'name' => $lead['name'],
            'company' => $lead['company'],
            'email' => $email,
            'phone' => $lead['phone'],
            'source' => 'Website lead',
            'status' => 'active',
            'notes' => $lead['notes'],
            'lead_id' => $lead['id'],
        ]);
        crm_log($pdo, $clientId, null, 'client', "Client added from lead: {$lead['name']}", false);
    }

    $projectId = null;
    if (!empty($lead['project_name'])) {
        $serviceType = array_key_exists((string) $lead['project_type'], CRM_STAGE_TEMPLATES)
            ? $lead['project_type']
            : 'Website Development';
        $projectId = uuid4();
        $stages = crm_template_stages($serviceType);
        crm_insert($pdo, 'crm_projects', [
            'id' => $projectId,
            'client_id' => $clientId,
            'title' => $lead['project_name'],
            'service_type' => $serviceType,
            'description' => $lead['message'],
            'status' => 'not_started',
            'priority' => 'medium',
            'stages' => json_encode($stages, JSON_UNESCAPED_UNICODE),
            'progress' => 0,
            'total_cost' => (float) ($lead['project_cost'] ?? 0),
            'currency' => $lead['currency'] ?: 'BDT',
        ]);
        crm_log($pdo, $clientId, $projectId, 'project', "New project started: {$lead['project_name']} ($serviceType)", true);
    }

    $pdo->prepare("UPDATE contact_submissions SET status = 'converted' WHERE id = ?")->execute([$lead['id']]);
    json_response(['client_id' => $clientId, 'project_id' => $projectId, 'existing' => (bool) $existing], 201);
}
