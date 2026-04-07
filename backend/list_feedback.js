const { getDb } = require('./models/db');
const db = getDb();

console.log('Listing ALL feedback in database:');
db.all('SELECT * FROM feedback', [], (err, rows) => {
    if (err) {
        console.error('DB ERROR:', err.message);
    } else {
        console.log('Total rows:', rows.length);
        console.log(JSON.stringify(rows, null, 2));
    }
    process.exit();
});
