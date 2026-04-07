<?php
session_start();
require 'db.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['register'])) {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $role     = in_array($_POST['role'], ['user']) ? 'user' : 'user'; // only 'user' allowed on self-registration

    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $error = "Username already taken! Please choose another.";
    } else {
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt2  = $conn->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
        $stmt2->bind_param('sss', $username, $hashed, $role);
        if ($stmt2->execute()) {
            $success = "Registration successful! You can now <a href='index.php' class='alert-link'>login here</a>.";
        } else {
            $error = "Registration failed. Please try again.";
        }
        $stmt2->close();
    }
    $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Client Feedback System</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
<div class="container mt-5">
    <div class="row justify-content-center mt-5">
        <div class="col-md-5">
            <div class="card shadow">
                <div class="card-header bg-secondary text-white text-center">
                    <h4>Register New Account</h4>
                </div>
                <div class="card-body p-4">
                    <?php if($error) { echo "<div class='alert alert-danger'>" . htmlspecialchars($error) . "</div>"; } ?>
                    <?php if($success) { echo "<div class='alert alert-success'>$success</div>"; } ?>
                    <form method="POST" action="">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Username</label>
                            <input type="text" name="username" class="form-control" required placeholder="Choose a username">
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Password</label>
                            <input type="password" name="password" class="form-control" required placeholder="Choose a password">
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Role</label>
                            <select name="role" class="form-select">
                                <option value="user">Client / User</option>
                            </select>
                        </div>
                        <button type="submit" name="register" class="btn btn-secondary w-100 fw-bold">Register</button>
                    </form>
                    <div class="mt-3 text-center">
                        <a href="index.php" class="text-decoration-none">Back to Login</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Bootstrap Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
