const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

const candidates = ['admin123', 'Admin@123', 'Admin@123 ', 'Admin123'];

db.get(
  'SELECT email, password FROM users WHERE email = ?',
  ['admin@system.com'],
  (err, row) => {
    if (err) {
      console.error('DB error:', err.message);
      db.close();
      process.exit(1);
    }
    if (!row) {
      console.error('Admin user not found');
      db.close();
      process.exit(1);
    }

    const hash = row.password;
    console.log('Admin found. Hash loaded.');

    let idx = 0;
    const next = () => {
      if (idx >= candidates.length) {
        db.close();
        return;
      }
      const c = candidates[idx++];
      bcrypt.compare(c, hash, (cmpErr, ok) => {
        if (cmpErr) {
          console.error('Compare error:', cmpErr.message);
        } else {
          console.log(`Candidate "${c}" => ${ok ? 'MATCH' : 'NO'}`);
        }
        next();
      });
    };

    next();
  }
);

