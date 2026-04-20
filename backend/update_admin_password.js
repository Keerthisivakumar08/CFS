const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

const NEW_PASSWORD = 'Admin@123';

bcrypt.hash(NEW_PASSWORD, 10, (err, hash) => {
  if (err) {
    console.error('Hash error:', err);
    process.exit(1);
  }

  db.run(
    'UPDATE users SET password = ? WHERE email = ?',
    [hash, 'admin@system.com'],
    function (updateErr) {
      if (updateErr) {
        console.error('Failed to update admin password:', updateErr.message);
      } else if (this.changes === 0) {
        console.log('No admin user found with email admin@system.com');
      } else {
        console.log('Admin password updated to Admin@123 for admin@system.com');
      }
      db.close();
    }
  );
});

