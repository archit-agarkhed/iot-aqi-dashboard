
// Simple validation script
async function test() {
    try {
        // 1. POST mock data (Simulating ESP32)
        const postRes = await fetch('http://localhost:3000/api/update-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pm25: 88,
                aqi: 156,
                sensors: [10, 20, 30, 40, 50, 60, 70, 80, 90]
            })
        });
        const postJson = await postRes.json();
        console.log('POST Status:', postRes.status, postJson);

        // 2. GET data (Simulating Frontend)
        const getRes = await fetch('http://localhost:3000/api/sensor-data');
        const getData = await getRes.json();
        console.log('GET Data:', getData);

        if (getData.pm25 === 88 && getData.sensors.length === 9) {
            console.log('SUCCESS: Data flow verified.');
        } else {
            console.log('FAILURE: Data mismatch.');
        }

    } catch (e) {
        console.error('ERROR:', e);
    }
}

test();
