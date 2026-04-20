-- Client System Database Schema (SQLite)
-- Auto-created by backend/models/db.js

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  venue TEXT,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- Sample Data (inserted by db.js)
-- Admin: admin@system.com / admin123
INSERT INTO users (email, password, role) VALUES ('admin@system.com', '{hashed}', 'admin');
INSERT INTO clients (name, email, phone, status, created_by) VALUES 
('John Doe', 'john@example.com', '123-456-7890', 'active', 1),
('Jane Smith', 'jane@example.com', '098-765-4321', 'active', 1),
('Acme Corp', 'contact@acme.com', '555-1234', 'inactive', 1);
INSERT INTO categories (name) VALUES ('Product'), ('Service'), ('Support');
INSERT INTO feedback (user_id, category_id, rating, comment) VALUES
(1, 1, 5, 'Great product overall!'),
(1, 1, 2, 'Features are missing and UI feels clunky.');

-- DB file: backend/db.sqlite

