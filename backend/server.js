import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDB, saveReading, getLatestReading, getHistory, getAllReadings, getLatestReadingByUnit, getHistoryByUnit, getAllUnitsLatest, updateUnitName } from './database.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Init DB on start
initDB().catch(console.error);

// ----------------------------------------------------------------------
// 1. PUSH ENDPOINT (ESP32 sends POST here)
// ----------------------------------------------------------------------
app.post('/api/update-data', async (req, res) => {
    try {
        const data = req.body;

        // Log that we received something (Verified Connection)
        console.log(`Received PUSH data from ${req.ip}`);

        // Basic validation
        if (!data || typeof data.pm25 === 'undefined') {
            console.log('Invalid data format received:', data);
            return res.status(400).json({ error: 'Invalid data format' });
        }

        // Auto calculate AQI if missing (Simplified US AQI)
        if (!data.aqi) {
            data.aqi = Math.round(data.pm25 * 3.5);
        }

        // Ensure sensors array exists
        if (!data.sensors) {
            data.sensors = Array(9).fill(0).map(() => 10 + Math.random() * 5);
        }

        await saveReading(data);
        console.log('✅ Saved reading. AQI:', data.aqi);

        res.status(200).json({ status: 'success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ----------------------------------------------------------------------
// 2. FETCH ENDPOINT (Frontend polls this) - Legacy, defaults to unit 1
// ----------------------------------------------------------------------
app.get('/api/sensor-data', async (req, res) => {
    try {
        const row = await getLatestReadingByUnit(1); // Default to unit 1
        if (!row) {
            // Default if empty
            return res.json({
                pm25: 15,
                aqi: 50,
                timestamp: new Date().toISOString(),
                sensors: Array(9).fill(0).map((_, i) => ({ id: i + 1, value: 15 }))
            });
        }

        // Transform for Frontend
        const responseData = {
            pm25: row.pm25,
            aqi: row.aqi,
            timestamp: row.timestamp,
            sensors: [
                row.sensor_1, row.sensor_2, row.sensor_3,
                row.sensor_4, row.sensor_5, row.sensor_6,
                row.sensor_7, row.sensor_8, row.sensor_9
            ].map((val, i) => ({ id: i + 1, value: val }))
        };

        res.json(responseData);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Database error' });
    }
});

// 2b. UNIT-SPECIFIC FETCH ENDPOINT
app.get('/api/sensor-data/:unitId', async (req, res) => {
    try {
        const unitId = parseInt(req.params.unitId);
        const row = await getLatestReadingByUnit(unitId);

        if (!row) {
            // Default if empty
            return res.json({
                pm25: 0,
                aqi: 0,
                timestamp: new Date().toISOString(),
                sensors: Array(9).fill(0).map((_, i) => ({ id: i + 1, value: 0 }))
            });
        }

        // Transform for Frontend
        const responseData = {
            unit_id: row.unit_id,
            unit_name: row.unit_name,
            pm25: row.pm25,
            aqi: row.aqi,
            timestamp: row.timestamp,
            sensors: [
                row.sensor_1, row.sensor_2, row.sensor_3,
                row.sensor_4, row.sensor_5, row.sensor_6,
                row.sensor_7, row.sensor_8, row.sensor_9
            ].map((val, i) => ({ id: i + 1, value: val }))
        };

        res.json(responseData);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Database error' });
    }
});

// 3. HISTORY ENDPOINT - Legacy, defaults to unit 1
app.get('/api/sensor-history', async (req, res) => {
    try {
        const history = await getHistoryByUnit(1);
        res.json(history);
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 3b. UNIT-SPECIFIC HISTORY ENDPOINT
app.get('/api/sensor-history/:unitId', async (req, res) => {
    try {
        const unitId = parseInt(req.params.unitId);
        const history = await getHistoryByUnit(unitId);
        res.json(history);
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 4. EXPORT ENDPOINT (All Data)
app.get('/api/sensor-export', async (req, res) => {
    try {
        const allData = await getAllReadings();
        res.json(allData);
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 5. UNITS LIST ENDPOINT (For grid display)
app.get('/api/units', async (req, res) => {
    try {
        const units = await getAllUnitsLatest();
        res.json(units);
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 6. UPDATE UNIT NAME ENDPOINT
app.patch('/api/units/:unitId/name', async (req, res) => {
    try {
        const unitId = parseInt(req.params.unitId);
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Store custom name in unit_names table
        await updateUnitName(unitId, name.trim());

        res.json({ success: true, unit_id: unitId, unit_name: name.trim() });
    } catch (e) {
        console.error('Error updating unit name:', e);
        res.status(500).json({ error: 'Database error' });
    }
});


app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`--- ARCHITECTURE MOVED TO PUSH ---`);
    console.log(`1. ESP32 MUST POST to: http://<YOUR_LAPTOP_IP>:3000/api/update-data`);
    console.log(`2. Frontend gets data from: http://localhost:3000/api/sensor-data`);
});
