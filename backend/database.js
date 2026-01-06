import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Initialize the database
let db;

export async function initDB() {
    db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    // Check if table exists and has correct schema
    const tableInfo = await db.all("PRAGMA table_info(sensor_readings)");

    if (tableInfo.length === 0) {
        // Table doesn't exist, create with full schema
        await db.exec(`
        CREATE TABLE sensor_readings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          unit_id INTEGER DEFAULT 1,
          unit_name TEXT DEFAULT 'Unit 1',
          timestamp TEXT,
          pm25 REAL,
          aqi INTEGER,
          sensor_1 REAL,
          sensor_2 REAL,
          sensor_3 REAL,
          sensor_4 REAL,
          sensor_5 REAL,
          sensor_6 REAL,
          sensor_7 REAL,
          sensor_8 REAL,
          sensor_9 REAL
        )
      `);
        console.log('Database created with 15 columns');
    } else {
        // Table exists, check if we need to add unit columns
        const hasUnitId = tableInfo.some(col => col.name === 'unit_id');
        const hasUnitName = tableInfo.some(col => col.name === 'unit_name');

        if (!hasUnitId || !hasUnitName) {
            console.log('Old schema detected. Recreating table...');
            // Old schema, need to migrate
            await db.exec(`
                CREATE TABLE sensor_readings_new (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  unit_id INTEGER DEFAULT 1,
                  unit_name TEXT DEFAULT 'Unit 1',
                  timestamp TEXT,
                  pm25 REAL,
                  aqi INTEGER,
                  sensor_1 REAL,
                  sensor_2 REAL,
                  sensor_3 REAL,
                  sensor_4 REAL,
                  sensor_5 REAL,
                  sensor_6 REAL,
                  sensor_7 REAL,
                  sensor_8 REAL,
                  sensor_9 REAL
                );
                
                INSERT INTO sensor_readings_new (id, unit_id, unit_name, timestamp, pm25, aqi, sensor_1, sensor_2, sensor_3, sensor_4, sensor_5, sensor_6, sensor_7, sensor_8, sensor_9)
                SELECT id, 1, 'Unit 1', timestamp, pm25, aqi, sensor_1, sensor_2, sensor_3, sensor_4, sensor_5, sensor_6, sensor_7, sensor_8, sensor_9
                FROM sensor_readings;
                
                DROP TABLE sensor_readings;
                ALTER TABLE sensor_readings_new RENAME TO sensor_readings;
            `);
            console.log('Database migrated successfully');
        } else {
            console.log(`Database schema OK (${tableInfo.length} columns)`);
        }
    }

    // Create unit_names table for persistent custom names
    await db.exec(`
        CREATE TABLE IF NOT EXISTS unit_names (
          unit_id INTEGER PRIMARY KEY,
          custom_name TEXT
        )
    `);

    console.log('Database initialized');
}

export async function saveReading(data) {
    if (!db) await initDB();
    const { pm25, aqi, sensors, unit_id = 1 } = data; // Extract unit_id, default to 1
    const timestamp = new Date().toISOString();

    // Check if this unit already has a custom name
    let unit_name = data.unit_name;
    if (!unit_name) {
        // Try to get existing custom name from database
        const existing = await db.get(
            'SELECT unit_name FROM sensor_readings WHERE unit_id = ? ORDER BY id DESC LIMIT 1',
            unit_id
        );
        unit_name = existing?.unit_name || `Unit ${unit_id}`;
    }

    // sensors might be array of objects or values. Let's assume values or extract them
    const s = sensors.map(s => (typeof s === 'object' ? s.value : s));

    // Pad if less than 9
    while (s.length < 9) s.push(0);

    await db.run(
        `INSERT INTO sensor_readings (unit_id, unit_name, timestamp, pm25, aqi, sensor_1, sensor_2, sensor_3, sensor_4, sensor_5, sensor_6, sensor_7, sensor_8, sensor_9)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        unit_id, unit_name, timestamp, pm25, aqi, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8]
    );
}

export async function getLatestReading() {
    if (!db) await initDB();
    return await db.get('SELECT * FROM sensor_readings ORDER BY id DESC LIMIT 1');
}

export async function getHistory(limit = 60) {
    if (!db) await initDB();
    return await db.all(`SELECT * FROM sensor_readings ORDER BY id DESC LIMIT ?`, limit);
}

export async function getAllReadings() {
    if (!db) await initDB();
    return await db.all('SELECT * FROM sensor_readings ORDER BY id ASC');
}

export async function getLatestReadingByUnit(unitId) {
    if (!db) await initDB();
    return await db.get('SELECT * FROM sensor_readings WHERE unit_id = ? ORDER BY id DESC LIMIT 1', unitId);
}

export async function getHistoryByUnit(unitId, limit = 60) {
    if (!db) await initDB();
    return await db.all('SELECT * FROM sensor_readings WHERE unit_id = ? ORDER BY id DESC LIMIT ?', unitId, limit);
}

export async function getAllUnitsLatest() {
    if (!db) await initDB();
    // Get latest reading for each unit (1-9)
    const units = [];
    for (let i = 1; i <= 9; i++) {
        const reading = await getLatestReadingByUnit(i);

        // Check for custom name in unit_names table
        const customName = await db.get('SELECT custom_name FROM unit_names WHERE unit_id = ?', i);
        const unit_name = customName?.custom_name || reading?.unit_name || `Unit ${i}`;

        units.push(reading ? { ...reading, unit_name } : { unit_id: i, unit_name, pm25: 0, aqi: 0 });
    }
    return units;
}

export async function updateUnitName(unitId, customName) {
    if (!db) await initDB();
    await db.run(
        'INSERT INTO unit_names (unit_id, custom_name) VALUES (?, ?) ON CONFLICT(unit_id) DO UPDATE SET custom_name = ?',
        unitId, customName, customName
    );
}
