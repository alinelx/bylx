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

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $payload): void {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

// Honeypot: real users never fill this hidden field.
if (!empty($_POST['website'])) {
  respond(200, ['ok' => true]); // pretend success so bots move on
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
  "Reply-To: {$name} <{$email}>",
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
