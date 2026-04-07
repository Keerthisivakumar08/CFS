<?php
// Prevent fatal exceptions on connection for beginners
mysqli_report(MYSQLI_REPORT_OFF);

$host = "127.0.0.1";
$user = "root";
$pass = "";
$dbname = "client_feedback_db";

// Connect to MySQL server first (without specifying database)
$conn = new mysqli($host, $user, $pass, "", 3306);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . " (Please make sure XAMPP MySQL is running)");
}

// Auto-create database if it doesn't exist
$sql_db = "CREATE DATABASE IF NOT EXISTS `$dbname`";
if ($conn->query($sql_db) === TRUE) {
    $conn->select_db($dbname);
    
    // Auto-create users table
    $conn->query("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user'
    )");

    // Auto-create feedback table
    $conn->query("CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comments TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Check if admin exists; if not, insert defaults
    $check_admin = $conn->query("SELECT id FROM users WHERE username='admin'");
    if ($check_admin && $check_admin->num_rows == 0) {
        $admin_pass = password_hash('admin123', PASSWORD_DEFAULT);
        $user_pass  = password_hash('user123', PASSWORD_DEFAULT);
        $conn->query("INSERT INTO users (username, password, role) VALUES ('admin', '$admin_pass', 'admin')");
        $conn->query("INSERT INTO users (username, password, role) VALUES ('client1', '$user_pass', 'user')");
    }
} else {
    die("Error creating database: " . $conn->error);
}
?>
