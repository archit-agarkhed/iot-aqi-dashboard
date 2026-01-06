import { useState, useEffect, useRef } from 'react';

const SENSOR_COUNT = 9;

const INITIAL_SENSORS = Array.from({ length: SENSOR_COUNT }, (_, i) => ({
    id: `s-${i + 1}`,
    name: `Sensor ${i + 1}`,
    type: ['Temp', 'Pressure', 'Humidity'][i % 3],
    unit: ['°C', 'PSI', '%'][i % 3],
    value: 0,
    history: Array(60).fill({ value: 0 }) // Pre-fill or start empty? Let's start with 0s for chart stability
}));

export const useSensorData = (unitId = 1) => {
    const [sensors, setSensors] = useState(INITIAL_SENSORS);
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        if (!isRunning) return;

        const fetchData = async () => {
            try {
                // Fetch unit-specific data
                const response = await fetch(`http://localhost:3000/api/sensor-data/${unitId}`);
                if (!response.ok) return; // Silent fail if server down

                const data = await response.json();

                // If the backend returns sensors as simple objects or numbers, we need to merge with our rich state (names, units)
                // Backend format: { pm25: number, aqi: number, sensors: [{id: 1, value: 12}] }

                if (data.sensors) {
                    setSensors(prevSensors => {
                        return prevSensors.map((sensor, index) => {
                            // Match sensor by ID or Index
                            // Backend sends id: 1..9, our sensors are s-1..s-9
                            // Let's assume index alignment for now since we have fixed 9 sensors
                            const incoming = data.sensors[index];
                            const usageValue = incoming ? incoming.value : sensor.value;

                            const newHistory = [{ value: usageValue }, ...sensor.history];
                            if (newHistory.length > 60) newHistory.pop();

                            return {
                                ...sensor,
                                value: usageValue,
                                history: newHistory
                            };
                        });
                    });
                }
            } catch (err) {
                console.error("Failed to fetch sensor data:", err);
            }
        };

        const interval = setInterval(fetchData, 1000);

        return () => clearInterval(interval);
    }, [isRunning, unitId]); // Add unitId to dependency array

    return { sensors, isRunning, setIsRunning };
};
