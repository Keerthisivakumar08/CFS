<?php
$hosts = ['127.0.0.1', 'localhost', '::1'];
foreach ($hosts as $h) {
    echo "Testing $h: ";
    $conn = @new mysqli($h, "root", "", "", 3306);
    if ($conn->connect_error) {
        echo "Failed: (" . $conn->connect_errno . ") " . $conn->connect_error . "\n";
    } else {
        echo "Success!\n";
    }
}
?>
