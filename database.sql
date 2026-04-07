CREATE DATABASE IF NOT EXISTS client_feedback_db;
USE client_feedback_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123 - bcrypt hashed)
INSERT INTO users (username, password, role) VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert default regular user (password: user123 - bcrypt hashed)
INSERT INTO users (username, password, role) VALUES ('client1', '$2y$10$TKh8H1.PfbuNIlQESe9y4ezmFMSMFQCFyYtUVMBiL9MHqnGnGe9Gy', 'user');

-- Insert sample feedback
INSERT INTO feedback (user_id, rating, comments) VALUES 
((SELECT id FROM users WHERE username='client1'), 5, 'Great service, highly recommended!');
