<?php

function cast_crm_approval(array $r): array
{
    $r['round'] = (int) $r['round'];
    return $r;
}

/** /crm/approvals and /crm/approvals/:id — admin only (requesting + listing; client responds via /portal). */
function handle_crm_approvals(PDO $pdo, string $method, ?string $id): void
{
    if ($method === 'GET' && $id === null) {
        $projectId = crm_str($_GET['project_id'] ?? null, 36);
        if ($projectId === null) {
            error_response('project_id is required.');
        }
        $stmt = $pdo->prepare('SELECT * FROM crm_stage_approvals WHERE project_id = ? ORDER BY requested_at DESC');
        $stmt->execute([$projectId]);
        json_response(array_map('cast_crm_approval', $stmt->fetchAll()));
    }

    if ($method === 'POST' && $id === null) {
        $body = read_json_body();
        $projectId = crm_str($body['project_id'] ?? null, 36);
        $project = $projectId ? crm_fetch_one($pdo, 'SELECT * FROM crm_projects WHERE id = ?', [$projectId]) : null;
        if (!$project) {
            error_response('Choose a valid project.');
        }
        $stageId = crm_str($body['stage_id'] ?? null, 40);
        $stageName = crm_str($body['stage_name'] ?? null, 100);
        if ($stageId === null || $stageName === null) {
            error_response('Choose a stage to request approval for.');
        }
        $message = crm_str($body['message'] ?? null, 2000);

        $countStmt = $pdo->prepare('SELECT COUNT(*) FROM crm_stage_approvals WHERE project_id = ? AND stage_id = ?');
        $countStmt->execute([$projectId, $stageId]);
        $round = ((int) $countStmt->fetchColumn()) + 1;

        $newId = uuid4();
        $pdo->prepare(
            'INSERT INTO crm_stage_approvals (id, project_id, client_id, stage_id, stage_name, round, message)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        )->execute([$newId, $projectId, $project['client_id'], $stageId, $stageName, $round, $message]);

        $roundLabel = $round > 1 ? " (round $round)" : '';
        crm_log($pdo, $project['client_id'], $projectId, 'approval', "Approval requested: {$project['title']} — $stageName$roundLabel", true);

        json_response(cast_crm_approval(crm_fetch_one($pdo, 'SELECT * FROM crm_stage_approvals WHERE id = ?', [$newId])), 201);
    }

    if ($method === 'DELETE' && $id !== null) {
        $approval = crm_fetch_one($pdo, 'SELECT * FROM crm_stage_approvals WHERE id = ?', [$id]);
        if (!$approval) {
            error_response('Not found', 404);
        }
        $pdo->prepare('DELETE FROM crm_stage_approvals WHERE id = ?')->execute([$id]);
        json_response(['ok' => true]);
    }

    error_response('Not found', 404);
}

/** Called from /portal/approvals/:id — the signed-in client responds to their own pending request. */
function crm_client_respond_approval(PDO $pdo, array $client, string $id, string $status, ?string $comment): array
{
    $approval = crm_fetch_one($pdo, 'SELECT * FROM crm_stage_approvals WHERE id = ?', [$id]);
    if (!$approval || $approval['client_id'] !== $client['id']) {
        error_response('Not found', 404);
    }
    if ($approval['status'] !== 'pending') {
        error_response('This approval request was already resolved.');
    }

    $pdo->prepare('UPDATE crm_stage_approvals SET status = ?, client_comment = ?, resolved_at = NOW() WHERE id = ?')
        ->execute([$status, $comment, $id]);

    $project = crm_fetch_one($pdo, 'SELECT * FROM crm_projects WHERE id = ?', [$approval['project_id']]);
    $verb = $status === 'approved' ? 'approved' : 'requested changes on';
    $message = "{$client['name']} $verb \"{$approval['stage_name']}\"" . ($comment ? ": $comment" : '');
    crm_log($pdo, $client['id'], $approval['project_id'], 'approval', $message, false);

    if ($status === 'approved' && $project) {
        $stages = json_decode((string) $project['stages'], true) ?: [];
        foreach ($stages as &$s) {
            if ($s['id'] === $approval['stage_id'] && $s['status'] !== 'done') {
                $s['status'] = 'done';
                $s['completed_at'] ??= date('Y-m-d');
                $s['started_at'] ??= date('Y-m-d');
            }
        }
        unset($s);
        $pdo->prepare('UPDATE crm_projects SET stages = ?, progress = ? WHERE id = ?')
            ->execute([json_encode($stages, JSON_UNESCAPED_UNICODE), crm_stage_progress($stages), $project['id']]);
    }

    return cast_crm_approval(crm_fetch_one($pdo, 'SELECT * FROM crm_stage_approvals WHERE id = ?', [$id]));
}
