<?php
session_start();
require 'db.php';

// Get POST data
$username = trim($_POST['username']);
$password = trim($_POST['password']);

// Validate input
if (!$username || !$password) {
    echo "invalid";
    
    exit;
}




// Check if user exists
$sql = "SELECT * FROM user_login WHERE username = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    // Verify password
    if (password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        echo $user['role']; // returns the correct role: Admin, Manager, etc.
    } else {
        echo "invalid"; // wrong password
    }
} else {
    echo "invalid"; // user not found
}
?>
