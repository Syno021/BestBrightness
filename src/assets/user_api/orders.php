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
    die(json_encode(array("success" => false, "message" => "Connection failed: " . $conn->connect_error)));
}

// Handle POST request for inserting a new order
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input);

    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("Invalid JSON: " . json_last_error_msg());
        die(json_encode(array("success" => false, "message" => "Invalid JSON: " . json_last_error_msg())));
    }

    error_log("Received data: " . print_r($data, true));

    // Prepare and bind for ORDERS table
    $stmt = $conn->prepare("INSERT INTO ORDERS (user_id, total_amount, order_type, status) VALUES (?, ?, ?, ?)");
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        die(json_encode(array("success" => false, "message" => "Prepare failed: " . $conn->error)));
    }

    $stmt->bind_param("idss", $data->user_id, $data->total_amount, $data->order_type, $data->status);

    // Execute the statement
    if ($stmt->execute()) {
        $order_id = $conn->insert_id;
        
        // Insert order items
        $stmt_items = $conn->prepare("INSERT INTO ORDER_ITEMS (order_id, product_id, quantity, price_per_unit) VALUES (?, ?, ?, ?)");
        if (!$stmt_items) {
            error_log("Prepare items failed: " . $conn->error);
            die(json_encode(array("success" => false, "message" => "Prepare items failed: " . $conn->error)));
        }

        foreach ($data->items as $item) {
            $stmt_items->bind_param("iiid", $order_id, $item->product_id, $item->quantity, $item->price);
            if (!$stmt_items->execute()) {
                error_log("Execute items failed: " . $stmt_items->error);
                die(json_encode(array("success" => false, "message" => "Execute items failed: " . $stmt_items->error)));
            }
        }
        $stmt_items->close();
        
        echo json_encode(array("success" => true, "message" => "Order placed successfully"));
    } else {
        error_log("Failed to place order: " . $stmt->error);
        echo json_encode(array("success" => false, "message" => "Failed to place order: " . $stmt->error));
    }

    $stmt->close();
}
// Handle GET request
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if count=true parameter is passed
    if (isset($_GET['count']) && $_GET['count'] === 'true') {
        // Count the total number of orders
        $sql = "SELECT COUNT(*) AS order_count FROM ORDERS"; 
        $result = $conn->query($sql);

        if ($result && $row = $result->fetch_assoc()) {
            echo json_encode(['order_count' => $row['order_count']]);
        } else {
            echo json_encode(['order_count' => 0]);
        }
    } else {
        // Return all orders data
        $sql = "SELECT * FROM ORDERS"; 
        $result = $conn->query($sql);

        $data = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }

        echo json_encode(['orderData' => $data]);
    }
} else {
    error_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    echo json_encode(array("success" => false, "message" => "Invalid request method"));
}

$conn->close();
?>