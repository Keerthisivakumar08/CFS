const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.SQLITE_DB_PATH
  ? path.resolve(process.env.SQLITE_DB_PATH)
  : path.join(__dirname, '../db.sqlite');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

function init() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clients table
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id)
    )
  `);

  // Categories table (for feedback)
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  // Feedback table
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 10),
      comment TEXT,
      discovery_source TEXT,
      emoji TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);

  // Insert default admin if not exists
  bcrypt.hash('admin123', 10, (err, hash) => {
    if (err) return console.error('Error hashing password:', err);
    
    db.get('SELECT id FROM users WHERE email = ?', ['admin@system.com'], (err, row) => {
      if (!row) {
        db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', 
          ['admin@system.com', hash, 'admin'],
          function(err) {
            if (err) console.error('Error creating admin:', err);
            else console.log('Default admin created: admin@system.com / admin123');
          }
        );
      }
    });
  });

  // Insert default user if not exists
  bcrypt.hash('user123', 10, (err, hash) => {
    if (err) return console.error('Error hashing password:', err);
    
    db.get('SELECT id FROM users WHERE email = ?', ['user@example.com'], (err, row) => {
      if (!row) {
        db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', 
          ['user@example.com', hash, 'user'],
          function(err) {
            if (err) console.error('Error creating user:', err);
            else console.log('Default user created: user@example.com / user123');
          }
        );
      }
    });
  });

  // Sample data insertion disabled to allow clean user feedback testing
  /*
  setTimeout(() => {
    ...
  }, 1000);
  */
  console.log('Database initialized at:', dbPath);
}

function getDb() {
  return db;
}

module.exports = { init, getDb };

