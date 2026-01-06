import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateAQI } from '../utils/aqiUtils';

const AQIUnit = () => {
    const navigate = useNavigate();
    const [pm25, setPm25] = useState(15); // Start with a safe random value
    const [aqiData, setAqiData] = useState(calculateAQI(15));

    useEffect(() => {
        const fetchAQI = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/sensor-data');
                if (!response.ok) return;
                const data = await response.json();

                if (data && typeof data.pm25 !== 'undefined') {
                    setPm25(data.pm25);
                    // setAqiData is handled by the other useEffect dependent on pm25
                    // But if backend sends aqi directly, we could use that.
                    // The current codebase calculates AQI from PM2.5 in the next useEffect.
                    // Let's stick to that for consistency, or override if backend sends color/category.
                    // For now, updating pm25 triggers the calculator.
                }
            } catch (err) {
                console.error("Error fetching AQI:", err);
            }
        };

        const interval = setInterval(fetchAQI, 2000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setAqiData(calculateAQI(pm25));
    }, [pm25]);

    return (
        <div className="aqi-unit-container" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100vw',
            background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)', // Premium dark slate gradient
            overflow: 'hidden'
        }}>
            {/* Header with Logos */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2rem 4rem',
                width: '100%',
                zIndex: 10
            }}>
                <img
                    src="/assets/iisc_logo.png"
                    alt="IISc Logo"
                    style={{
                        height: '140px', // Increased size
                        filter: 'invert(1) brightness(1.5)', // White logo for dark bg
                        opacity: 0.9
                    }}
                />

                {/* Title */}
                <h1 style={{
                    fontSize: '2.5rem', // Increased font size slightly
                    color: '#94a3b8',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    fontWeight: 300,
                    borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                    paddingBottom: '0.5rem'
                }}>
                    AQI Monitoring
                </h1>

                <img
                    src="/assets/cense_logo.png"
                    alt="CeNSE Logo"
                    style={{
                        height: '110px', // Increased size
                        background: 'rgba(255,255,255,0.95)', // Background for colored logo availability
                        padding: '10px',
                        borderRadius: '12px',
                        boxShadow: '0 0 20px rgba(255,255,255,0.1)'
                    }}
                />
            </div>

            {/* Main Content Area - Centered Unit */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                top: '-40px' // Optical centering to account for header
            }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="glass-panel"
                    style={{
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: `4px solid ${aqiData.color}`,
                        boxShadow: `0 0 60px ${aqiData.color}20`,
                        background: 'rgba(255, 255, 255, 0.03)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = `0 0 100px ${aqiData.color}40`;
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = `0 0 60px ${aqiData.color}20`;
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                >
                    <h2 style={{
                        fontSize: '1.25rem',
                        margin: '0 0 0.5rem 0',
                        color: '#cbd5e1',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        Current AQI
                    </h2>

                    <div style={{
                        fontSize: '7rem',
                        fontWeight: '800',
                        color: aqiData.color,
                        lineHeight: 1,
                        textShadow: `0 0 30px ${aqiData.color}60`,
                        fontFamily: 'monospace'
                    }}>
                        {aqiData.aqi}
                    </div>

                    <div style={{
                        fontSize: '1.5rem',
                        marginTop: '1rem',
                        color: aqiData.color,
                        fontWeight: 600,
                        textShadow: `0 0 10px ${aqiData.color}40`,
                        textAlign: 'center',
                        padding: '0 1rem'
                    }}>
                        {aqiData.category}
                    </div>

                    <div style={{
                        marginTop: '2.5rem',
                        fontSize: '0.875rem',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>View Sensor Data</span>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default AQIUnit;
