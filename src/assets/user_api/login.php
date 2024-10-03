<?php
header("Access-Control-Allow-Origin: http://localhost:8100");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Database connection details
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "best";

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get posted data
$postdata = file_get_contents("php://input");

if (isset($postdata) && !empty($postdata)) {
    // Decode the JSON request body
    $request = json_decode($postdata);

    // Sanitize inputs
    $email = mysqli_real_escape_string($conn, trim($request->email));
    $password = trim($request->password);

    // Prepare and execute the SQL query to find the user by email
    $sql = "SELECT * FROM users WHERE email='$email'";
    $result = $conn->query($sql);

    // If a user was found with the provided email
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();

        // Verify the password using password_verify
        if (password_verify($password, $row['password_hash'])) {
            // Return user details in the response
            $response = [
                'status' => 1,
                'message' => 'Login successful',
                'user_id' => $row['user_id'],    // Return the user ID
                'email' => $row['email'],        // Return the email
                'username' => $row['username'],  // Return the username
                'role' => $row['role']           // Return the user's role
            ];
        } else {
            // Invalid password
            $response = ['status' => 0, 'message' => 'Invalid password'];
        }
    } else {
        // User not found
        $response = ['status' => 0, 'message' => 'User not found'];
    }

    // Send the response as JSON
    echo json_encode($response);
}

// Close the database connection
$conn->close();
?>
