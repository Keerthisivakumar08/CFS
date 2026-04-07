const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Checking feedback table columns...');
    
    // Add discovery_source if missing
    db.run("ALTER TABLE feedback ADD COLUMN discovery_source TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('discovery_source already exists.');
            } else {
                console.error('Error adding discovery_source:', err.message);
            }
        } else {
            console.log('Added discovery_source column.');
        }
    });

    // Add emoji if missing
    db.run("ALTER TABLE feedback ADD COLUMN emoji TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('emoji already exists.');
            } else {
                console.error('Error adding emoji:', err.message);
            }
        } else {
            console.log('Added emoji column.');
        }
    });

    console.log('Maintenance complete.');
});

db.close();
