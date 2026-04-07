<?php
session_start();
require 'db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'user') {
    header("Location: index.php");
    exit();
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['submit_feedback'])) {
    $user_id  = $_SESSION['user_id'];
    $rating   = (int)$_POST['rating'];
    $comments = trim($_POST['comments']);

    if ($rating < 1 || $rating > 5) {
        $error = "Invalid rating. Please select a value between 1 and 5.";
    } else {
        $stmt = $conn->prepare("INSERT INTO feedback (user_id, rating, comments) VALUES (?, ?, ?)");
        $stmt->bind_param('iis', $user_id, $rating, $comments);
        if ($stmt->execute()) {
            $success = "Thank you! Your feedback has been submitted successfully.";
        } else {
            $error = "Error submitting feedback. Please try again.";
        }
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Submit Feedback</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
<nav class="navbar navbar-dark bg-dark shadow-sm">
    <div class="container">
        <a class="navbar-brand fw-bold" href="#">Client Feedback System</a>
        <div class="d-flex align-items-center">
            <span class="text-white me-3">Welcome, <strong><?php echo htmlspecialchars($_SESSION['username']); ?></strong></span>
            <a href="logout.php" class="btn btn-outline-light btn-sm">Logout</a>
        </div>
    </div>
</nav>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">Submit Your Feedback</h5>
                </div>
                <div class="card-body p-4">
                    <?php if($success) { echo "<div class='alert alert-success'>$success</div>"; } ?>
                    <?php if($error) { echo "<div class='alert alert-danger'>$error</div>"; } ?>
                    
                    <form method="POST" action="">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Overall Rating</label>
                            <select name="rating" class="form-select" required>
                                <option value="" disabled selected>Select Rating (1-5)</option>
                                <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                                <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                                <option value="3">⭐⭐⭐ 3 - Average</option>
                                <option value="2">⭐⭐ 2 - Poor</option>
                                <option value="1">⭐ 1 - Terrible</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="form-label fw-bold">Comments & Suggestions</label>
                            <textarea name="comments" rows="5" class="form-control" required placeholder="Please let us know how we did..."></textarea>
                        </div>
                        <button type="submit" name="submit_feedback" class="btn btn-success w-100 fw-bold">Submit Feedback</button>
                    </form>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <a href="logout.php" class="text-secondary text-decoration-none">Back to Login / Logout</a>
            </div>
        </div>
    </div>
</div>

<!-- Bootstrap Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
