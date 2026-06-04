<?php
/**
 * Explore Sri Lanka – Contact Form Processor
 * File:    php/contact.php
 * Author:  Web Design Assignment
 * Purpose: Server-side validation and processing of the contact form.
 *          Returns a JSON response for JavaScript fetch() handler.
 */

/* ─────────────────────────────────────────────────────────────
   SECURITY: Set content type and CORS headers
   ───────────────────────────────────────────────────────────── */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

/* ─────────────────────────────────────────────────────────────
   1. RETRIEVE & SANITISE INPUT
   ───────────────────────────────────────────────────────────── */

/**
 * Sanitises a plain text field:
 * strips tags, trims whitespace, converts special chars to HTML entities.
 *
 * @param  mixed  $input  Raw POST value
 * @return string         Sanitised string
 */
function sanitiseText($input) {
    $input = isset($input) ? $input : '';
    $input = strip_tags($input);
    $input = trim($input);
    $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return $input;
}

$name    = sanitiseText($_POST['name']    ?? '');
$email   = sanitiseText($_POST['email']   ?? '');
$subject = sanitiseText($_POST['subject'] ?? '');
$message = sanitiseText($_POST['message'] ?? '');

/* ─────────────────────────────────────────────────────────────
   2. SERVER-SIDE VALIDATION
   ───────────────────────────────────────────────────────────── */
$errors = [];

// Name: required, minimum 2 characters
if (empty($name)) {
    $errors['name'] = 'Name is required.';
} elseif (mb_strlen($name) < 2) {
    $errors['name'] = 'Name must be at least 2 characters.';
}

// Email: required and must be a valid format
if (empty($email)) {
    $errors['email'] = 'Email address is required.';
} elseif (!filter_var(htmlspecialchars_decode($email), FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please provide a valid email address.';
}

// Subject: required
if (empty($subject)) {
    $errors['subject'] = 'Please select a subject.';
}

// Message: required and minimum 20 characters
if (empty($message)) {
    $errors['message'] = 'Message is required.';
} elseif (mb_strlen($message) < 20) {
    $errors['message'] = 'Message must be at least 20 characters long.';
}

// Return validation errors if any
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Please correct the highlighted fields.',
        'errors'  => $errors
    ]);
    exit;
}

/* ─────────────────────────────────────────────────────────────
   3. PROCESS THE SUBMISSION
   In a production environment this section would send an email
   using PHP's mail() function or a library such as PHPMailer.
   For this assignment, we log the submission and return success.
   ───────────────────────────────────────────────────────────── */

// Decode HTML entities for email/log use (they were encoded for safety above)
$emailDecoded   = htmlspecialchars_decode($email,   ENT_QUOTES | ENT_HTML5);
$nameDecoded    = htmlspecialchars_decode($name,    ENT_QUOTES | ENT_HTML5);
$subjectDecoded = htmlspecialchars_decode($subject, ENT_QUOTES | ENT_HTML5);
$messageDecoded = htmlspecialchars_decode($message, ENT_QUOTES | ENT_HTML5);

// ── Optional: Write to a log file ──────────────────────────────
$logDir  = __DIR__ . '/../logs/';
$logFile = $logDir . 'contact_submissions.log';

if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}

$timestamp  = date('Y-m-d H:i:s');
$logEntry   = "[{$timestamp}] From: {$nameDecoded} <{$emailDecoded}> | Subject: {$subjectDecoded}" . PHP_EOL;
$logEntry  .= "Message: " . substr($messageDecoded, 0, 200) . (mb_strlen($messageDecoded) > 200 ? '…' : '') . PHP_EOL;
$logEntry  .= str_repeat('-', 80) . PHP_EOL;

@file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

// ── Optional: Send email (uncomment and configure for production) ──
/*
$to      = 'your-email@exploresrilanka.lk';
$headers = [
    'From'         => "Explore Sri Lanka Website <noreply@exploresrilanka.lk>",
    'Reply-To'     => "{$nameDecoded} <{$emailDecoded}>",
    'Content-Type' => 'text/plain; charset=UTF-8',
    'MIME-Version' => '1.0',
];

$emailBody  = "New contact form submission\n\n";
$emailBody .= "Name:    {$nameDecoded}\n";
$emailBody .= "Email:   {$emailDecoded}\n";
$emailBody .= "Subject: {$subjectDecoded}\n";
$emailBody .= "Message:\n{$messageDecoded}\n";

mail($to, "Contact Form: {$subjectDecoded}", $emailBody, $headers);
*/

/* ─────────────────────────────────────────────────────────────
   4. RETURN SUCCESS RESPONSE
   The JavaScript fetch() handler uses name and email to build
   a personalised confirmation message in the UI.
   ───────────────────────────────────────────────────────────── */
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Your message has been received successfully.',
    'name'    => $nameDecoded,
    'email'   => $emailDecoded,
    'subject' => $subjectDecoded
]);
exit;
