import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HistoryLog = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch all data including unit info
                const res = await fetch('http://localhost:3000/api/sensor-export');
                const data = await res.json();
                // Reverse to show most recent first
                setHistory(data.reverse().slice(0, 100)); // Limit to 100 most recent
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
        // Optional: poll every 5 seconds for updates
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, []);

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
                    <h1>Database Logs</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Historical records from SQLite Database</p>
                </div>
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
            </header>

            <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Unit</th>
                                <th style={{ padding: '1rem' }}>ID</th>
                                <th style={{ padding: '1rem' }}>Timestamp</th>
                                <th style={{ padding: '1rem' }}>PM2.5</th>
                                <th style={{ padding: '1rem' }}>AQI</th>
                                <th style={{ padding: '1rem' }}>Sensors (Avg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((row) => (
                                <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', color: '#06b6d4', fontWeight: 'bold' }}>
                                        {row.unit_name || `Unit ${row.unit_id}`}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>#{row.id}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(row.timestamp).toLocaleString()}</td>
                                    <td style={{ padding: '1rem', color: '#06b6d4', fontWeight: 'bold' }}>{row.pm25}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: row.aqi > 100 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                            color: row.aqi > 100 ? '#fca5a5' : '#86efac',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {row.aqi}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '300px' }}>
                                            {[row.sensor_1, row.sensor_2, row.sensor_3, row.sensor_4, row.sensor_5, row.sensor_6, row.sensor_7, row.sensor_8, row.sensor_9]
                                                .map((val, idx) => (
                                                    <span key={idx} title={`Sensor ${idx + 1}`} style={{ opacity: 0.7 }}>
                                                        {Math.round(val)}
                                                    </span>
                                                ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default HistoryLog;
