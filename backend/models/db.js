const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const fallbackDbPath = path.join(__dirname, '../db.sqlite');

function ensureDbDirectory(filePath) {
  const dirPath = path.dirname(filePath);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.accessSync(dirPath, fs.constants.W_OK);
}

function resolveDbPath() {
  const configuredPath = process.env.SQLITE_DB_PATH
    ? path.resolve(process.env.SQLITE_DB_PATH)
    : fallbackDbPath;

  try {
    ensureDbDirectory(configuredPath);
    return configuredPath;
  } catch (error) {
    if (configuredPath !== fallbackDbPath) {
      console.warn(
        `Unable to use SQLITE_DB_PATH "${configuredPath}". Falling back to "${fallbackDbPath}".`,
        error.message
      );
    } else {
      console.warn(
        `Unable to prepare configured database path "${configuredPath}".`,
        error.message
      );
    }

    ensureDbDirectory(fallbackDbPath);
    return fallbackDbPath;
  }
}

const dbPath = resolveDbPath();
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err.message);
  }
});

function runStatement(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function getRow(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

async function ensureUsersTableColumns() {
  const columns = await getAll('PRAGMA table_info(users)');
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('role')) {
    await runStatement("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    await runStatement("UPDATE users SET role = 'user' WHERE role IS NULL OR TRIM(role) = ''");
  }

  if (!columnNames.has('venue')) {
    await runStatement('ALTER TABLE users ADD COLUMN venue TEXT');
  }
}

async function seedDefaultUser({ email, password, venue, role, label }) {
  const existingUser = await getRow('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await runStatement(
    'INSERT INTO users (email, password, venue, role) VALUES (?, ?, ?, ?)',
    [email, hash, venue, role]
  );
  console.log(`Default ${label} created: ${email} / ${password}`);
}

async function init(onReady) {
  try {
    await runStatement(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        venue TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await ensureUsersTableColumns();

    await runStatement(`
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

    await runStatement(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);

    await runStatement(`
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

    await runStatement(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        food_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, food_id)
      )
    `);

    await seedDefaultUser({
      email: 'admin@system.com',
      password: 'admin123',
      venue: 'Main Office',
      role: 'admin',
      label: 'admin'
    });

    await seedDefaultUser({
      email: 'user@example.com',
      password: 'user123',
      venue: 'Client Venue',
      role: 'user',
      label: 'user'
    });

    console.log('Database initialized at:', dbPath);
    if (onReady) {
      onReady();
    }
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

function getDb() {
  return db;
}

module.exports = { init, getDb };
