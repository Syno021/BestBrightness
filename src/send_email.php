<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from any origin
header("Access-Control-Allow-Methods: GET, POST"); // Allow GET and POST methods
session_start();

$subject = $_GET['subject'];
$email = $_GET['recipient'];
$body = $_GET['body'];
// $urlArrayString = $_GET['urlArrays'];

// $urlArrays = explode(',', $urlArrayString); // Convert the comma-separated string back to an array

/*##########Script Information#########
  # Purpose: Send mail Using PHPMailer#
  #          & Gmail SMTP Server      #
  # Created: 24-11-2019               #
  #   Author : Hafiz Haider           #
  # Version: 1.0                      #
  # Website: www.BroExperts.com       #
  #####################################*/

// Include required PHPMailer files
require 'PHPMailer.php';
require 'SMTP.php';
require 'Exception.php';

// Define namespaces
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Create an instance of PHPMailer
$mail = new PHPMailer();

// Set the mailer to use SMTP
$mail->isSMTP();

// Define the SMTP host
$mail->Host = "smtp.gmail.com";

// Enable SMTP authentication
$mail->SMTPAuth = true;

// Set the SMTP encryption type (ssl/tls)
$mail->SMTPSecure = "tls";

// Set the port to connect SMTP
$mail->Port = "587";

// Set the Gmail username
$mail->Username = "mnguninompilo86@gmail.com";

// Set the Gmail password
$mail->Password = "hizyqyhapgdhgawd";

// Set the email subject
$mail->Subject = $subject;

// Set the sender email
$mail->setFrom('mnguninompilo86@gmail.com');

// Enable HTML
$mail->isHTML(true);

// Set the email body
$mail->Body = "<p>$body</p>";

// Add the recipient
$mail->addAddress($email);

// Download and attach the files
// foreach ($urlArrays as $url) {
  
//         $fileContent = @file_get_contents($url); // Retrieve the file contents
//         $fileName = basename($url);
//         $mail->addStringAttachment($fileContent, $fileName);
   
// }

// Finally, send the email
if ($mail->send()) {
    $response = "Email sent successfully!!!.";
} else {
    $response = "Message could not be sent. Mailer Error: " . $mail->ErrorInfo;
}

// Closing SMTP connection
$mail->smtpClose();

// Return the response to Angular
header('Content-Type: application/json');
echo json_encode($response);
?>