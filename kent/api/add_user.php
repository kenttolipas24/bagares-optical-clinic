<?php
header("Content-Type: application/json");
require_once "../db.php";

$data = json_decode(file_get_contents("php://input"), true);

$required = ['firstname','middlename','lastname','username','email','role','password','status'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(["error" => "$field is required"]);
        exit;
    }
}

$passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);

$stmt = $conn->prepare("
    INSERT INTO user_account 
    (firstname, middlename, lastname, suffix, username, email, role, password, status)
    VALUES (?,?,?,?,?,?,?,?,?)
");

$stmt->bind_param(
    "sssssssss",
    $data['firstname'],
    $data['middlename'],
    $data['lastname'],
    $data['suffix'],
    $data['username'],
    $data['email'],
    $data['role'],
    $passwordHash,
    $data['status']
);

if (!$stmt->execute()) {
    http_response_code(409);
    echo json_encode(["error" => "Username or Email already exists"]);
    exit;
}

echo json_encode(["success" => true]);
