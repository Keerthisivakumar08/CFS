const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../feedback.db');
const db = new sqlite3.Database(dbPath);

function init() {
  db.serialize(() => {
    // Users
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Categories
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Feedback
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category_id INTEGER,
      rating INTEGER CHECK(rating >=1 AND rating <=5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )`);

    // Default admin
    bcrypt.hash('admin123', 10, (err, hash) => {
      if (err) console.error(err);
      db.get('SELECT * FROM users WHERE email = ?', ['admin@feedback.com'], (err, user) => {
        if (!user) {
          db.run('INSERT INTO users (email, password, role) VALUES (?, ?, "admin")', ['admin@feedback.com', hash], err => {
            if (err) console.error(err);
            console.log('Admin created!');
          });
        }
      });
    });

    // Categories
    const cats = ['Service', 'Product', 'Support'];
    cats.forEach(name => db.run('INSERT OR IGNORE INTO categories (name) VALUES (?)', name));
    
    console.log('DB initialized!');
  });
}

function getDb() {
  return db;
}

module.exports = { init, getDb };

