<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve and sanitize form inputs
    $name = filter_input(INPUT_POST, 'Name', FILTER_SANITIZE_STRING);
    $phone = filter_input(INPUT_POST, 'Phone_Number', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'Email', FILTER_SANITIZE_EMAIL);
    $message = filter_input(INPUT_POST, 'Massage', FILTER_SANITIZE_STRING);

    // Set email details
    $to = "info@otodrive.co.ke";
    $subject = "New Contact Form Submission";
    $body = "Name: $name\nPhone: $phone\nEmail: $email\nMessage:\n$message";
    $headers = "From: $email";

    // Send email and return a JSON response
    if (mail($to, $subject, $body, $headers)) {
        echo json_encode(['status' => 'success', 'message' => 'Message sent successfully!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to send the message. Please try again.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
}
?>
