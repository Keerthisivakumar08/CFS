<?php
session_start();
require 'db.php';

// Redirect if already logged in
if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] == 'admin') {
        header("Location: admin_dashboard.php");
    } else {
        header("Location: user_dashboard.php");
    }
    exit();
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['login_submit'])) {
    $username   = trim($_POST['username']);
    $password   = $_POST['password'];
    $login_role = in_array($_POST['login_type'] ?? '', ['admin', 'user']) ? $_POST['login_type'] : 'user';

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? AND role = ?");
    $stmt->bind_param('ss', $username, $login_role);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($row && password_verify($password, $row['password'])) {
        $_SESSION['user_id']  = $row['id'];
        $_SESSION['username'] = $row['username'];
        $_SESSION['role']     = $row['role'];

        header($row['role'] == 'admin' ? "Location: admin_dashboard.php" : "Location: user_dashboard.php");
        exit();
    } else {
        $error = "Invalid credentials or incorrect role selected!";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Client Feedback System</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: #5c5573;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            font-family: 'Inter', sans-serif;
        }
        .split-card {
            background-color: #2b2836;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
            max-width: 900px;
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            margin: 20px;
        }
        .image-pane {
            flex: 1;
            min-width: 300px;
            background: linear-gradient(to bottom, rgba(82,65,138,0.2) 0%, rgba(30,25,45,0.8) 100%), url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80') center/cover;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            color: #fff;
            min-height: 400px;
            transition: background 0.5s ease-in-out;
        }
        .slide-indicator {
            height: 3px;
            border-radius: 2px;
            transition: all 0.3s ease;
            background-color: rgba(255,255,255,0.3);
            width: 15px;
        }
        .slide-indicator.active {
            background-color: #7f68e6;
            width: 25px;
        }
        .form-pane {
            flex: 1;
            min-width: 350px;
            padding: 50px;
            color: #fff;
        }
        .brand-name {
            font-weight: 700;
            font-size: 1.2rem;
            letter-spacing: 1px;
        }
        .form-title {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        .sub-text {
            color: #a39eb8;
            font-size: 0.9rem;
            margin-bottom: 2rem;
        }
        .sub-text a {
            color: #7f68e6;
            text-decoration: none;
        }
        .sub-text a:hover {
            color: #9c89f5;
            text-decoration: underline;
        }
        .form-control {
            background-color: #3b3749;
            border: 1px solid #4f4961;
            color: #fff;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }
        .form-control:focus {
            background-color: #3b3749;
            border-color: #7f68e6;
            color: #fff;
            box-shadow: 0 0 0 0.2rem rgba(127, 104, 230, 0.25);
        }
        .form-control::placeholder {
            color: #6c6682;
        }
        .btn-primary {
            background-color: #7f68e6;
            border: none;
            padding: 12px;
            font-weight: 600;
            border-radius: 8px;
            width: 100%;
            margin-top: 10px;
            transition: background-color 0.2s;
        }
        .btn-primary:hover {
            background-color: #6a53cb;
        }
        .btn-secondary {
            background-color: #3b3749;
            border: 1px solid #4f4961;
            color: #fff;
            padding: 12px;
            font-weight: 600;
            border-radius: 8px;
            width: 100%;
            margin-top: 10px;
            transition: background-color 0.2s;
        }
        .btn-secondary:hover {
            background-color: #4a455a;
        }
        .form-actions {
            display: flex;
            gap: 15px;
            margin-top: 15px;
        }
        .form-actions button {
            flex: 1;
            margin-top: 0;
        }

        .auth-error {
            background-color: #4f2835;
            color: #ffb3c6;
            border: 1px solid #753b4e;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>

<div class="split-card">
    <div class="image-pane">
        <div class="d-flex justify-content-between align-items-center">
            <div class="brand-name">CFMS</div>
        </div>
        <div>
            <h3 class="fw-bold mb-2">Client Feedback Management System</h3>
            <p class="mb-0 text-light opacity-75">Capturing Moments, Creating Memories</p>
            <div class="mt-3 d-flex gap-2">
                <span class="slide-indicator active"></span>
                <span class="slide-indicator"></span>
                <span class="slide-indicator"></span>
            </div>
        </div>
    </div>
    
    <div class="form-pane">
        <h2 class="form-title">Log in</h2>
        <p class="sub-text">Don't have an account? <a href="register.php">Register here</a></p>
        
        <?php if($error) { echo "<div class='auth-error'>" . htmlspecialchars($error) . "</div>"; } ?>
        
        <form method="POST" action="">
            <div class="mb-0">
                <input type="text" name="username" class="form-control" required placeholder="Email or Username">
            </div>
            
            <div class="mb-0">
                <input type="password" name="password" class="form-control" required placeholder="Password">
            </div>
            
            <div class="form-actions">
                <input type="hidden" name="login_type" id="loginType" value="user">
                <button type="button" id="btnAdmin" class="btn btn-secondary" onclick="setLoginType('admin')">Admin</button>
                <button type="button" id="btnUser" class="btn btn-primary" onclick="setLoginType('user')">User</button>
            </div>
            
            <button type="submit" name="login_submit" class="btn btn-primary" style="margin-top:20px;">Log in</button>
        </form>


    </div>
</div>

<!-- Bootstrap Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script>
    const images = [
        "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80')",
        "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80')",
        "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80')"
    ];
    let currentIndex = 0;
    const imagePane = document.querySelector('.image-pane');
    const indicators = document.querySelectorAll('.slide-indicator');

    setInterval(() => {
        indicators[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        imagePane.style.background = `linear-gradient(to bottom, rgba(82,65,138,0.2) 0%, rgba(30,25,45,0.8) 100%), ${images[currentIndex]} center/cover`;
        indicators[currentIndex].classList.add('active');
    }, 4000);

    function setLoginType(type) {
        document.getElementById('loginType').value = type;
        const btnAdmin = document.getElementById('btnAdmin');
        const btnUser = document.getElementById('btnUser');
        
        if (type === 'admin') {
            btnAdmin.className = 'btn btn-primary';
            btnUser.className = 'btn btn-secondary';
        } else {
            btnAdmin.className = 'btn btn-secondary';
            btnUser.className = 'btn btn-primary';
        }
    }
</script>
</body>
</html>
