<?php
session_start();
require 'db.php';

// Check if user is logged in as admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header("Location: index.php");
    exit();
}

// Statistics for Charts
$stats_query = "SELECT rating, COUNT(*) as count FROM feedback GROUP BY rating";
$stats_result = $conn->query($stats_query);
$ratings_data = [1=>0, 2=>0, 3=>0, 4=>0, 5=>0];
while($row = $stats_result->fetch_assoc()) {
    $ratings_data[$row['rating']] = (int)$row['count'];
}

// Feedbacks for the cards
$sql = "SELECT f.id, u.username, f.rating, f.comments, f.created_at 
        FROM feedback f 
        JOIN users u ON f.user_id = u.id 
        ORDER BY f.created_at DESC";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - CFMS</title>
    <!-- Dependencies -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --sidebar-bg: #ffffff;
            --main-bg: #f4f7f6;
            --accent-purple: #7f68e6;
            --accent-green: #89b449;
            --accent-orange: #f59e0b;
            --text-dark: #2d3748;
            --text-muted: #718096;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--main-bg);
            color: var(--text-dark);
            margin: 0;
            overflow-x: hidden;
        }

        /* Sidebar Styles */
        .sidebar {
            width: 260px;
            background: var(--sidebar-bg);
            height: 100vh;
            position: fixed;
            left: 0;
            top: 0;
            padding: 30px 20px;
            box-shadow: 4px 0 10px rgba(0,0,0,0.02);
            z-index: 1000;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 50px;
            padding-left: 10px;
        }

        .brand-logo {
            width: 32px;
            height: 32px;
            background: var(--accent-green);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }

        .brand-name {
            font-weight: 700;
            font-size: 1.25rem;
            color: var(--accent-green);
        }

        .nav-menu {
            list-style: none;
            padding: 0;
        }

        .nav-item {
            margin-bottom: 8px;
        }

        .nav-link {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 12px 15px;
            border-radius: 12px;
            color: var(--text-muted);
            text-decoration: none;
            transition: all 0.2s;
            font-weight: 500;
        }

        .nav-link:hover, .nav-link.active {
            background: #f8fafc;
            color: var(--accent-green);
        }

        .nav-link.active {
            color: var(--accent-green);
        }

        .nav-link.active::before {
            content: '';
            position: absolute;
            left: 0;
            height: 24px;
            width: 4px;
            background: var(--accent-green);
            border-radius: 0 4px 4px 0;
        }

        /* Main Content */
        .main-content {
            margin-left: 260px;
            padding: 40px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
        }

        .search-container {
            position: relative;
            width: 300px;
        }

        .search-input {
            width: 100%;
            padding: 10px 15px 10px 40px;
            border-radius: 25px;
            border: 1px solid #e2e8f0;
            background: white;
            font-size: 0.9rem;
        }

        .search-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
        }

        /* Dashboard Cards */
        .dashboard-card {
            background: white;
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            height: 100%;
        }

        .card-title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .card-title {
            font-weight: 600;
            font-size: 1.1rem;
        }

        /* Feedback Cards */
        .feedback-grid {
            margin-top: 30px;
        }

        .feedback-card {
            background: white;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
            transition: transform 0.2s;
            border-left: 4px solid transparent;
        }

        .feedback-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .feedback-card.positive { border-left-color: var(--accent-green); }
        .feedback-card.negative { border-left-color: var(--accent-orange); }

        .user-avatar {
            width: 45px;
            height: 45px;
            border-radius: 12px;
            object-fit: cover;
        }

        .user-info h6 {
            margin: 0;
            font-weight: 600;
        }

        .user-info span {
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .rating-stars {
            color: #fbbf24;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>

<!-- Sidebar -->
<div class="sidebar">
    <div class="brand">
        <div class="brand-logo"><i class="fas fa-utensils"></i></div>
        <div class="brand-name">Savory</div>
    </div>
    
    <ul class="nav-menu">
        <li class="nav-item">
            <a href="#" class="nav-link"><i class="fas fa-home"></i> Home</a>
        </li>
        <li class="nav-item">
            <a href="#" class="nav-link"><i class="fas fa-shopping-basket"></i> Food Order</a>
        </li>
        <li class="nav-item">
            <a href="#" class="nav-link"><i class="fas fa-heart"></i> Favorite Menu</a>
        </li>
        <li class="nav-item">
            <a href="#" class="nav-link"><i class="fas fa-comment-dots"></i> Message</a>
        </li>
        <li class="nav-item">
            <a href="#" class="nav-link"><i class="fas fa-history"></i> Order History</a>
        </li>
        <li class="nav-item">
            <a href="#" class="nav-link"><i class="fas fa-bell"></i> Notification</a>
        </li>
        <li class="nav-item">
            <a href="#" class="nav-link active"><i class="fas fa-comment-alt"></i> Feedback</a>
        </li>
        <li class="nav-item">
            <a href="#" class="nav-link"><i class="fas fa-cog"></i> Setting</a>
        </li>
    </ul>

    <div style="margin-top: auto; padding-top: 50px;">
        <a href="logout.php" class="nav-link text-danger"><i class="fas fa-sign-out-alt"></i> Logout</a>
    </div>
</div>

<div class="main-content">
    <div class="header">
        <h2 class="fw-bold">Feedback &#128523;</h2>
        <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input type="text" class="search-input" placeholder="Search feedback...">
        </div>
    </div>

    <!-- Charts Row -->
    <div class="row g-4">
        <div class="col-lg-8">
            <div class="dashboard-card">
                <div class="card-title-row">
                    <span class="card-title">Positive Feedback</span>
                    <select class="form-select form-select-sm w-auto border-0 bg-light">
                        <option>This Month</option>
                    </select>
                </div>
                <div style="height: 300px;">
                    <canvas id="positiveChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="dashboard-card">
                <div class="card-title-row">
                    <span class="card-title">Feedback Distribution</span>
                </div>
                <div style="height: 300px;">
                    <canvas id="distributionChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="mt-5">
        <h4 class="fw-bold mb-4">Recent Feedback</h4>
        <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            <?php
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $isPositive = $row['rating'] >= 4;
                    $class = $isPositive ? 'positive' : 'negative';
                    ?>
                    <div class="col">
                        <div class="feedback-card <?php echo $class; ?> shadow-sm">
                            <div class="d-flex align-items-center gap-3 mb-3">
                                <img src="https://i.pravatar.cc/150?u=<?php echo $row['username']; ?>" class="user-avatar" alt="User">
                                <div class="user-info">
                                    <h6><?php echo htmlspecialchars($row['username']); ?></h6>
                                    <span>User since 2023</span>
                                </div>
                            </div>
                            <div class="rating-stars mb-2">
                                <?php
                                for($i=1; $i<=5; $i++) {
                                    echo $i <= $row['rating'] ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
                                }
                                ?>
                            </div>
                            <p class="text-muted small mb-0">
                                "<?php echo htmlspecialchars($row['comments']); ?>"
                            </p>
                            <div class="mt-3 text-end">
                                <span class="badge bg-light text-muted fw-normal" style="font-size: 0.7rem;">
                                    <?php echo date('M j, Y', strtotime($row['created_at'])); ?>
                                </span>
                            </div>
                        </div>
                    </div>
                <?php }
            } else {
                echo "<p class='text-muted'>No feedback found.</p>";
            }
            ?>
        </div>
    </div>
</div>

<script>
    // Data from PHP
    const ratingsData = <?php echo json_encode(array_values($ratings_data)); ?>;
    
    // Positive/Negative Bar Chart
    const ctxPos = document.getElementById('positiveChart').getContext('2d');
    new Chart(ctxPos, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Positive Feedback',
                data: [65, 59, 80, 81, 56, 55, 40, 70, 85, 90, 75, 80], // Mock for monthly trend
                backgroundColor: '#89b449',
                borderRadius: 5,
                barThickness: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { display: true, drawBorder: false } },
                x: { grid: { display: false } }
            }
        }
    });

    // Distribution Pie Chart
    const ctxDist = document.getElementById('distributionChart').getContext('2d');
    new Chart(ctxDist, {
        type: 'doughnut',
        data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
                data: ratingsData,
                backgroundColor: ['#ef4444', '#f59e0b', '#fbbf24', '#3b82f6', '#89b449'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6 } }
            },
            cutout: '70%'
        }
    });
</script>
</body>
</html>
