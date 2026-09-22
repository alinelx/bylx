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
// Only keeps the rate-limit filenames from being a reversible list of visitor
// IPs on shared hosting. Change it on deploy; the counters simply reset.
const RATE_SECRET   = 'bylx.dev rate limiter - change me on deploy';
// ---------------------------------------------------------------------------

// Fetch requests (js/contact.js) ask for JSON; a plain browser form POST
// (no JS, or a stale cached script.js) gets a rendered page instead of raw
// JSON — see respondHtml().
function wantsJson(): bool {
  return strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;
}

const ERRORS = [
  'method_not_allowed' => 'That request was not a form submission.',
  'bad_origin'         => 'That submission did not come from bylx.dev.',
  'rate_limited'       => 'Too many messages from this address in the last hour. Try again later, or email geral@bylx.dev.',
  'missing_fields'     => 'Name, email and message are all required.',
  'invalid_email'      => 'That email address does not look right.',
  'too_long'           => 'That message is longer than the form accepts.',
  'send_failed'        => 'The mail server refused the message. Please email geral@bylx.dev.',
];

function explain(string $code): string {
  return ERRORS[$code] ?? 'Something went wrong. Please email geral@bylx.dev.';
}

/* Without JS the visitor used to be 303'd to "/" with ?sent=... in the URL and
   nothing to read: the code that turns that param into a message lives in
   js/contact.js. So the no-JS path now renders its own page. */
function respondHtml(int $status, array $payload): void {
  $ok    = (bool) $payload['ok'];
  $title = $ok ? 'Message sent' : 'Message not sent';
  $body  = $ok
    ? 'Thanks - your message is on its way, and a confirmation is heading to your inbox.'
    : explain((string) ($payload['error'] ?? 'unknown'));

  http_response_code($status);
  header('Content-Type: text/html; charset=utf-8');

  $t = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
  $b = htmlspecialchars($body, ENT_QUOTES, 'UTF-8');

  echo '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>' . $t . ' - bylx.dev</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
           background: #09051b; color: #f7f2ff; font-family: system-ui, sans-serif;
           padding: 1.5rem; }
    main { max-width: 32rem; border: 4px solid #59f3ff; box-shadow: 7px 7px 0 #ff5dbb;
           padding: 1.5rem; }
    h1 { margin: 0 0 .75rem; font-size: 1.5rem; }
    p { margin: 0 0 1.25rem; line-height: 1.5; }
    a { display: inline-block; padding: .6rem .9rem; background: #ff5dbb; color: #09051b;
        border: 2px solid #59f3ff; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <main>
    <h1>' . $t . '</h1>
    <p>' . $b . '</p>
    <a href="/">Back to bylx.dev</a>
  </main>
</body>
</html>';
  exit;
}

function respond(int $status, array $payload): void {
  if (wantsJson()) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($status);
    echo json_encode($payload);
    exit;
  }

  respondHtml($status, $payload);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

/* A cross-origin <form method="post"> needs no CORS, so any page could drive
   this endpoint: each victim's browser brings its own IP, which walks straight
   around the per-IP throttle below, and the confirmation leg then mails our
   branded template to any address the attacker names. Browsers send Origin on
   form POSTs; Referer is the fallback. When neither is present we still accept
   the message (some privacy setups strip both) but skip the confirmation -
   that is the only leg that mails an address nobody verified. */
const ALLOWED_HOSTS = ['bylx.dev', 'www.bylx.dev'];

function originHost(): ?string {
  foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $key) {
    $value = $_SERVER[$key] ?? '';
    if ($value === '') continue;
    $host = parse_url($value, PHP_URL_HOST);
    if (is_string($host) && $host !== '') return strtolower($host);
  }
  return null;
}

$sourceHost    = originHost();
$sameOrigin    = $sourceHost !== null && in_array($sourceHost, ALLOWED_HOSTS, true);
$unknownOrigin = $sourceHost === null;

if (!$sameOrigin && !$unknownOrigin) {
  respond(403, ['ok' => false, 'error' => 'bad_origin']);
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
    /* HMAC, not sha1($ip): the IPv4 space is 2^32, so a bare hash sitting in a
       world-readable temp dir is a reversible list of everyone who used the
       form. RATE_SECRET keeps the filename opaque to co-tenants. */
    $file = sys_get_temp_dir() . '/bylx-rate-' . hash_hmac('sha256', $ip, RATE_SECRET) . '.json';
    $now  = time();

    /* One lock around read AND write. Read and write as two operations let
       concurrent requests all read the same count and all pass. */
    $handle = @fopen($file, 'c+');
    if ($handle === false) return false;

    if (!flock($handle, LOCK_EX)) {
      fclose($handle);
      return false;
    }

    $raw     = (string) stream_get_contents($handle);
    $decoded = json_decode($raw, true);
    $hits    = is_array($decoded) ? $decoded : [];

    // Drop anything older than the window, then judge what is left.
    $hits = array_values(array_filter($hits, fn($t) => is_int($t) && $now - $t < $window));

    if (count($hits) >= $limit) {
      flock($handle, LOCK_UN);
      fclose($handle);
      return true;
    }

    $hits[] = $now;
    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, json_encode($hits));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
  } catch (Throwable $e) {
    return false;
  }

  return false;
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

/* Throttle only what would actually send mail. Charged before validation, five
   malformed bot posts burned the hour for every visitor behind the same NAT. */
if (throttled($_SERVER['REMOTE_ADDR'] ?? 'unknown')) {
  respond(429, ['ok' => false, 'error' => 'rate_limited']);
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
$template = $sameOrigin ? @file_get_contents(TEMPLATE_PATH) : false;

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
