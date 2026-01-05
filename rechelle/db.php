<?php
$host = "127.0.0.1";
$user = "root";
$pass = "";
$dbname = "bagares";

// Connect to database
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// Get POST data
$username = trim($_POST['username']);
$email = trim($_POST['email']);
$password = trim($_POST['password']);

// Validate input
if (!$username || !$email || !$password) {
    die("error: missing fields");
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Set ENUM-safe role
$role = "Receptionist"; // default
if (stripos($username, 'manager') !== false) $role = "Manager";
elseif (stripos($username, 'opto') !== false) $role = "Optometrist";
elseif (stripos($username, 'admin') !== false) $role = "Admin";

// Set ENUM-safe status
$status = "Active";

// Optional: check if username already exists
$check = $conn->prepare("SELECT * FROM user_login WHERE username=?");
$check->bind_param("s", $username);
$check->execute();
$res = $check->get_result();
if ($res->num_rows > 0) {
    die("error: username already exists");
}

// Prepare insert statement
$sql = "INSERT INTO user_login (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
if (!$stmt) die("error: prepare failed: " . $conn->error);

$stmt->bind_param("sssss", $username, $email, $hashedPassword, $role, $status);

// Execute and return result
if ($stmt->execute()) {
    echo "success";
} else {
    echo "error: execute failed: " . $stmt->error;
}
