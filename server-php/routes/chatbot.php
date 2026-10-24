<?php

/**
 * Free-form AI chat for the public chatbot widget. Only runs when
 * config.php has a non-empty 'anthropic_api_key' — otherwise the widget
 * falls back to its button-menu-only mode automatically.
 */
function chatbot_ensure_schema(PDO $pdo): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS chatbot_rate_limits (
          ip VARCHAR(64) NOT NULL PRIMARY KEY,
          window_start DATETIME NOT NULL,
          count INT NOT NULL DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function chatbot_client_ip(): string
{
    $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($forwarded !== '') {
        return trim(explode(',', $forwarded)[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/** Max 20 messages per IP per 10 minutes — keeps API cost bounded if someone spams it. */
function chatbot_rate_limit_ok(PDO $pdo, string $ip): bool
{
    $windowSeconds = 600;
    $maxRequests = 20;

    $stmt = $pdo->prepare('SELECT window_start, count FROM chatbot_rate_limits WHERE ip = ?');
    $stmt->execute([$ip]);
    $row = $stmt->fetch();

    if (!$row) {
        $pdo->prepare('INSERT INTO chatbot_rate_limits (ip, window_start, count) VALUES (?, NOW(), 1)')
            ->execute([$ip]);
        return true;
    }

    $windowStart = strtotime((string) $row['window_start']);
    if ($windowStart === false || time() - $windowStart >= $windowSeconds) {
        $pdo->prepare('UPDATE chatbot_rate_limits SET window_start = NOW(), count = 1 WHERE ip = ?')
            ->execute([$ip]);
        return true;
    }

    if ((int) $row['count'] >= $maxRequests) {
        return false;
    }

    $pdo->prepare('UPDATE chatbot_rate_limits SET count = count + 1 WHERE ip = ?')->execute([$ip]);
    return true;
}

function chatbot_system_prompt(PDO $pdo): string
{
    $site = $pdo->query("SELECT name, title, tagline, email, phone FROM site_settings WHERE id = 'default'")->fetch();
    $name = $site['name'] ?? 'Ashraful Islam Arif';
    $title = $site['title'] ?? 'Founder & CEO, Abrar IT';
    $email = $site['email'] ?? '';
    $phone = $site['phone'] ?? '';

    return <<<PROMPT
        You are the friendly assistant chatbot embedded on {$name}'s ({$title}) portfolio and
        agency website. You help visitors with questions about hiring {$name} for web/software
        work, and encourage qualified leads to leave their contact details.

        Facts you can rely on:
        - Services: full-stack websites, admin dashboards, CRM/business tools, e-commerce
          stores — React/Next.js frontend, PHP or Node backend, plus UI/UX design and ongoing
          maintenance.
        - Process: Requirement Analysis -> UI/UX Design -> Development -> Content & Testing ->
          Deployment. Clients get a private dashboard to track progress live.
        - Typical timeline: simple business site 1-2 weeks; custom dashboard/CRM/e-commerce
          3-6 weeks, depending on scope.
        - Pricing: project-based fixed price quoted after a short requirement discussion, paid
          as an advance + milestone installments. Never invent a specific number — always say
          it depends on scope and offer to connect them for an exact quote.
        - Contact: {$email} / {$phone} (also shown elsewhere on this page), or they can leave
          their details right here in the chat and {$name} will follow up personally.

        Rules:
        - Answer in the same language/style the visitor used (English, Bangla, or Banglish are
          all fine).
        - Keep replies short and conversational — 2-4 sentences, no markdown headers or bullet
          walls, this is a small chat bubble.
        - Stay focused on helping them evaluate or start a project with {$name}. If asked
          something unrelated (general trivia, coding homework, other companies, etc.), briefly
          decline and steer back to how you can help with their project.
        - Never invent specific prices, deadlines, or guarantees. For anything specific, suggest
          they share their name/email/phone so {$name} can follow up directly.
        - Never claim to be a human, and never say you've already contacted or scheduled
          anything — you can only answer questions and take down contact details.
        PROMPT;
}

/** Calls Anthropic's Messages API. Returns the assistant's text reply, or throws on failure. */
function chatbot_call_claude(string $apiKey, string $model, string $system, array $messages): string
{
    $payload = [
        'model' => $model,
        'max_tokens' => 350,
        'system' => $system,
        'messages' => $messages,
    ];

    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'x-api-key: ' . $apiKey,
            'anthropic-version: 2023-06-01',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 25,
    ]);
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        throw new RuntimeException('AI request failed: ' . $curlError);
    }
    $decoded = json_decode($raw, true);
    if ($status !== 200 || !is_array($decoded)) {
        throw new RuntimeException('AI request returned status ' . $status . ': ' . substr((string) $raw, 0, 300));
    }

    $text = '';
    foreach ($decoded['content'] ?? [] as $block) {
        if (($block['type'] ?? '') === 'text') {
            $text .= $block['text'];
        }
    }
    if ($text === '') {
        throw new RuntimeException('AI returned an empty reply.');
    }
    return trim($text);
}

/** GET /chatbot/status and POST /chatbot/ask — both public, no auth. */
function handle_chatbot_route(string $method, array $segments, array $config): void
{
    $action = $segments[1] ?? null;
    $apiKey = trim((string) ($config['anthropic_api_key'] ?? ''));

    if ($action === 'status' && $method === 'GET') {
        json_response(['enabled' => $apiKey !== '']);
    }

    if ($action !== 'ask') {
        error_response('Not found', 404);
    }
    if ($method !== 'POST') {
        error_response('Method not allowed', 405);
    }
    if ($apiKey === '') {
        error_response('AI chat is not set up yet.', 503);
    }

    $pdo = db();
    chatbot_ensure_schema($pdo);

    $ip = chatbot_client_ip();
    if (!chatbot_rate_limit_ok($pdo, $ip)) {
        error_response('Too many messages — please wait a few minutes, or use the quote form instead.', 429);
    }

    $body = read_json_body();
    $message = trim((string) ($body['message'] ?? ''));
    if ($message === '' || mb_strlen($message) > 600) {
        error_response('Please send a message between 1 and 600 characters.');
    }

    $history = [];
    foreach (array_slice((array) ($body['history'] ?? []), -8) as $turn) {
        $role = ($turn['role'] ?? '') === 'assistant' ? 'assistant' : 'user';
        $content = trim((string) ($turn['content'] ?? ''));
        if ($content === '') {
            continue;
        }
        $history[] = ['role' => $role, 'content' => mb_substr($content, 0, 600)];
    }
    $history[] = ['role' => 'user', 'content' => $message];

    $model = (string) ($config['anthropic_model'] ?? 'claude-haiku-5-5');
    $system = chatbot_system_prompt($pdo);

    try {
        $reply = chatbot_call_claude($apiKey, $model, $system, $history);
    } catch (Throwable $e) {
        error_log('[chatbot] ' . $e->getMessage());
        error_response('Could not reach the AI assistant right now. Please try again or use the quote form.', 502);
    }

    json_response(['reply' => $reply]);
}
