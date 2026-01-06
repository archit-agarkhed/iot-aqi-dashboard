import React from 'react';

const SensorChart = ({ history, color }) => {
    // History is array of { value: number }, new to old
    // We need to map it to SVG commands.
    // ViewBox: 0 0 100 50
    // X axis: 0 to 100 (60 points approx 1.6 width per point)
    // Y axis: 0 to 100 value mapped to 50 height.

    if (!history || history.length < 2) return null;

    const width = 100;
    const height = 40;
    const maxVal = 100; // Fixed scale for now

    const points = history.map((pt, i) => {
        // i=0 is newest (right side?), or left?
        // Let's draw newest at the right.
        const x = width - (i * (width / 60));
        const y = height - ((pt.value / maxVal) * height);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="sensor-chart" style={{ width: '100%', height: '50px', overflow: 'visible' }}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};

const SensorCard = ({ sensor }) => {
    const { name, value, unit, history, type } = sensor;

    // Color coding based on type
    // Color coding based on type
    let color;
    if (type === 'Temp') {
        color = '#ef4444'; // Red
    } else if (type === 'Pressure') {
        color = '#06b6d4'; // Cyan
    } else {
        color = '#22c55e'; // Green
    }

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{name}</span>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>{type}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>
                    {value.toFixed(1)}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    {unit}
                </span>
            </div>

            <div style={{ marginTop: 'auto' }}>
                <SensorChart history={history} color={color} />
            </div>

            {/* Connection Status Dot */}
            <div style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 10px #22c55e'
            }} title="Connected via ESP32"></div>
        </div>
    );
};

export default SensorCard;
