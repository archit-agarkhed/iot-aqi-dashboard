import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSensorData } from '../hooks/useSensorData';
import SensorCard from './SensorCard';
import { exportToCSV, exportHistoryToCSV } from '../utils/csvUtils';

const Dashboard = () => {
    const { unitId } = useParams();
    const { sensors, isRunning, setIsRunning } = useSensorData(parseInt(unitId) || 1);
    const navigate = useNavigate();

    const handleExport = async () => {
        try {
            console.log("Starting full export...");
            // Use window.location.hostname to ensure it works on other devices if needed
            const res = await fetch(`http://${window.location.hostname}:3000/api/sensor-export`);
            const allData = await res.json();
            console.log("Fetched records:", allData.length);
            exportHistoryToCSV(allData);
        } catch (error) {
            console.error('Export failed:', error);
            alert("Failed to download full history. Check backend connection.");
        }
    };

    return (
        <div className="container">
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2rem 0',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-glass)'
            }}>
                <div>
                    <h1>Unit {unitId} - AQI Monitor</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Real-time sensor data stream from ESP32 Cluster</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        className="glass-panel"
                        style={{
                            padding: '0.75rem 1.5rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}
                    >
                        BACK TO UNITS
                    </button>

                    <button
                        onClick={() => navigate('/history')}
                        className="glass-panel"
                        style={{
                            padding: '0.75rem 1.5rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}
                    >
                        VIEW LOGS
                    </button>


                    <button
                        onClick={handleExport}
                        className="btn-primary"
                    >
                        Download CSV
                    </button>
                </div>
            </header>

            <div className="grid-monitor">
                {sensors.map(sensor => (
                    <SensorCard key={sensor.id} sensor={sensor} />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
