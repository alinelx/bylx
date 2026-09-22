<?php
/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx contact form handler
   Receives the contact-form POST, emails Aline the message and
   sends the visitor a branded confirmation (emails/confirmation-email.html). */

// ---- config ---------------------------------------------------------------
const OWNER_EMAIL   = 'geral@bylx.dev';         // where visitor messages arrive
const FROM_EMAIL    = 'geral@bylx.dev';         // must be a bylx.dev address (SPF/DKIM)
const FROM_NAME     = 'bylx.dev';
const TEMPLATE_PATH = __DIR__ . '/emails/confirmation-email.html';
// ---------------------------------------------------------------------------

// Fetch requests (js/contact.js) ask for JSON; a plain browser form POST
// (no JS, or a stale cached script.js) gets redirected back to the site
// instead of seeing raw JSON.
function wantsJson(): bool {
  return strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;
}

function respond(int $status, array $payload): void {
  if (wantsJson()) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($status);
    echo json_encode($payload);
  } else {
    $query = $payload['ok']
      ? 'sent=1'
      : 'sent=0&err=' . rawurlencode($payload['error'] ?? 'unknown');
    header('Location: /?' . $query, true, 303);
  }
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

// Honeypot: real users never fill this hidden field.
if (!empty($_POST['website'])) {
  respond(200, ['ok' => true]); // pretend success so bots move on
}

/* Throttle by IP. The confirmation leg below mails whatever address the caller
   supplies, so without a cap this endpoint can be driven as an open relay for
   our own branded template — the damage being bylx.dev's SPF/DKIM reputation.
   Deliberately generous (a real visitor sends once) and fails OPEN: if the
   temp dir misbehaves we would rather send than silently drop a recruiter. */
function throttled(string $ip): bool {
  $limit  = 5;
  $window = 3600;

  try {
    $file = sys_get_temp_dir() . '/bylx-rate-' . sha1($ip) . '.json';
    $now  = time();

    $hits = [];
    if (is_readable($file)) {
      $decoded = json_decode((string) @file_get_contents($file), true);
      if (is_array($decoded)) $hits = $decoded;
    }

    // Drop anything older than the window, then judge what is left.
    $hits = array_values(array_filter($hits, fn($t) => is_int($t) && $now - $t < $window));
    if (count($hits) >= $limit) return true;

    $hits[] = $now;
    @file_put_contents($file, json_encode($hits), LOCK_EX);
  } catch (Throwable $e) {
    return false;
  }

  return false;
}

if (throttled($_SERVER['REMOTE_ADDR'] ?? 'unknown')) {
  respond(429, ['ok' => false, 'error' => 'rate_limited']);
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
  respond(422, ['ok' => false, 'error' => 'missing_fields']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(422, ['ok' => false, 'error' => 'invalid_email']);
}
if (mb_strlen($name) > 120 || mb_strlen($message) > 5000) {
  respond(422, ['ok' => false, 'error' => 'too_long']);
}

// Strip anything that could inject extra mail headers.
$name = str_replace(["\r", "\n"], ' ', $name);

$encode = fn(string $s): string => '=?UTF-8?B?' . base64_encode($s) . '?=';

// ---- 1. notification to Aline ---------------------------------------------
$ownerHeaders = implode("\r\n", [
  'From: ' . $encode(FROM_NAME) . ' <' . FROM_EMAIL . '>',
  // Encoded like every other display name — a raw "José" is not valid here
  'Reply-To: ' . $encode($name) . " <{$email}>",
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
]);

$ownerBody = "New message via bylx.dev contact form\n"
  . "-------------------------------------\n"
  . "Name:  {$name}\n"
  . "Email: {$email}\n"
  . 'Date:  ' . date('Y-m-d H:i') . " (server time)\n\n"
  . $message . "\n";

$sentToOwner = mail(
  OWNER_EMAIL,
  $encode("bylx.dev ✉ New message from {$name}"),
  $ownerBody,
  $ownerHeaders
);

if (!$sentToOwner) {
  respond(500, ['ok' => false, 'error' => 'send_failed']);
}

// ---- 2. confirmation to the visitor -----------------------------------------
$template = @file_get_contents(TEMPLATE_PATH);

if ($template !== false) {
  $tz = new DateTimeZone('Europe/Lisbon');
  $now = new DateTime('now', $tz);

  if (class_exists('IntlDateFormatter')) {
    $fmtPT = new IntlDateFormatter('pt_PT', IntlDateFormatter::LONG, IntlDateFormatter::SHORT, $tz);
    $fmtEN = new IntlDateFormatter('en_GB', IntlDateFormatter::LONG, IntlDateFormatter::SHORT, $tz);
    $timestampPT = $fmtPT->format($now);
    $timestampEN = $fmtEN->format($now);
  } else {
    $timestampPT = $now->format('d/m/Y H:i');
    $timestampEN = $now->format('j F Y, H:i');
  }

  $html = str_replace(
    ['[NAME]', '[TIMESTAMP_PT]', '[TIMESTAMP_EN]'],
    [htmlspecialchars($name, ENT_QUOTES, 'UTF-8'), $timestampPT, $timestampEN],
    $template
  );

  $confirmHeaders = implode("\r\n", [
    'From: ' . $encode(FROM_NAME) . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . FROM_EMAIL,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
  ]);

  // Confirmation is best-effort: the visitor still sees success if only this leg fails.
  mail(
    $email,
    $encode('Message received / Mensagem recebida ✓ — bylx.dev'),
    $html,
    $confirmHeaders
  );
}

respond(200, ['ok' => true]);
