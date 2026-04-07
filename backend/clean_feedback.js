const { getDb } = require('./models/db');
const db = getDb();

console.log('Cleaning up feedback table...');
db.run('DELETE FROM feedback', (err) => {
    if (err) {
        console.error('Error deleting feedback:', err.message);
    } else {
        console.log('All feedback deleted successfully.');
    }
    process.exit();
});
