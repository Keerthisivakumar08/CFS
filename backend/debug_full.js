const { getDb } = require('./models/db');
const db = getDb();

db.serialize(() => {
    console.log('--- USERS ---');
    db.all('SELECT id, email, role FROM users', [], (err, rows) => {
        console.log(JSON.stringify(rows, null, 2));
    });

    console.log('--- FEEDBACK ---');
    db.all('SELECT * FROM feedback', [], (err, rows) => {
        console.log('Total feedback rows:', rows.length);
        console.log(JSON.stringify(rows, null, 2));
        process.exit();
    });
});
