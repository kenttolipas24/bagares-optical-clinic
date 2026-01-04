<?php
require 'db.php';
session_start();

$username = trim($_POST['username']);
$email = trim($_POST['email']);
$password = trim($_POST['password']);

// Validate input
if (!$username || !$email || !$password) {
    echo "invalid";
    exit;
}

// Hash the password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Default role & status
$role = "Receptionist";
$status = "Inactive";

// Auto-assign role by username keyword
if (stripos($username, 'manager') !== false) {
    $role = "Manager";
} elseif (stripos($username, 'opto') !== false) {
    $role = "Optometrist";
} elseif (stripos($username, 'admin') !== false) {
    $role = "Admin";
}

// Check if username already exists
$check = $conn->prepare("SELECT * FROM user_login WHERE username = ? LIMIT 1");
$check->bind_param("s", $username);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    echo "exists";
    exit;
}


// Insert new user
$sql = "INSERT INTO user_login (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssss", $username, $email, $hashedPassword, $role, $status);

if ($stmt->execute()) {
    // Auto-login after signup
    $_SESSION['user_id'] = $stmt->insert_id;
    $_SESSION['username'] = $username;
    $_SESSION['role'] = $role;

    echo $role; // returns the assigned role
} else {
    echo "error";
}
?>
