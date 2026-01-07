<?php
header("Content-Type: application/json");
require_once "../db.php";

$result = $conn->query("
    SELECT 
        id,
        firstname,
        middlename,
        lastname,
        suffix,
        username,
        email,
        role,
        status,
        IFNULL(DATE_FORMAT(last_login,'%Y-%m-%d %h:%i %p'),'Never') AS lastLogin
    FROM user_account
    ORDER BY created_at DESC
");

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode($users);
