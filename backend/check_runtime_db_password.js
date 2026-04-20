const bcrypt = require('bcryptjs');
const { getDb } = require('./models/db');

const db = getDb();

db.get(
  'SELECT email, password FROM users WHERE email = ?',
  ['admin@system.com'],
  (err, row) => {
    if (err) {
      console.error('DB query error:', err.message);
      process.exit(1);
    }
    if (!row) {
      console.error('Admin user not found in runtime DB');
      process.exit(1);
    }

    bcrypt.compare('Admin@123', row.password, (cmpErr, ok) => {
      if (cmpErr) {
        console.error('Compare error:', cmpErr.message);
        process.exit(1);
      }
      console.log('Runtime compare Admin@123 =>', ok ? 'MATCH' : 'NO MATCH');
    });
  }
);

