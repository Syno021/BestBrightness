<?php
header("Access-Control-Allow-Origin: http://localhost:8100");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "best";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if we are only fetching the total amount
    if (isset($_GET['total_only']) && $_GET['total_only'] === 'true') {
        $sql = "SELECT SUM(total_amount) AS totalSalesAmount FROM sales";
        $result = $conn->query($sql);
        $totalSalesAmount = 0;

        if ($result && $row = $result->fetch_assoc()) {
            $totalSalesAmount = $row['totalSalesAmount'];
        }

        echo json_encode(['totalSalesAmount' => $totalSalesAmount]);
    } else {
        // Fetch all sales records and the total amount
        $sql = "SELECT * FROM sales";
        $result = $conn->query($sql);

        $salesData = [];
        $totalSalesAmount = 0;

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $salesData[] = $row;
                $totalSalesAmount += $row['total_amount'];
            }
        }

        $response = [
            'salesData' => $salesData,
            'totalSalesAmount' => $totalSalesAmount
        ];

        echo json_encode($response);
    }
}

$conn->close();
?>
