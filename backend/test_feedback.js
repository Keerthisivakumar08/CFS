const { getDb } = require('./models/db');
const db = getDb();

const user_id = 2; // user@example.com
const rating = 5;
const comment = "Testing from diagnostic script";
const discovery_source = "Social media";
const emoji = "😐";

console.log('Attempting manual insert...');
db.run(
    'INSERT INTO feedback (user_id, category_id, rating, comment, discovery_source, emoji) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, null, rating, comment, discovery_source, emoji],
    function(err) {
        if (err) {
            console.error('DIAGNOSTIC ERROR:', err.message);
        } else {
            console.log('SUCCESS! Row ID:', this.lastID);
        }
        process.exit();
    }
);
