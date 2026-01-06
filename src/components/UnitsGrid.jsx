import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateAQI } from '../utils/aqiUtils';

const UnitsGrid = () => {
    const navigate = useNavigate();
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUnit, setEditingUnit] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/units');
                if (!response.ok) return;
                const data = await response.json();

                // Calculate AQI data for each unit
                const unitsWithAQI = data.map(unit => ({
                    ...unit,
                    aqiData: calculateAQI(unit.pm25 || 0)
                }));

                setUnits(unitsWithAQI);
            } catch (err) {
                console.error("Error fetching units:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUnits();
        const interval = setInterval(fetchUnits, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleRename = async (unitId) => {
        if (!editName.trim()) {
            setEditingUnit(null);
            return;
        }

        try {
            // Update unit name in database
            await fetch(`http://localhost:3000/api/units/${unitId}/name`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName })
            });

            // Update local state
            setUnits(prev => prev.map(u =>
                u.unit_id === unitId ? { ...u, unit_name: editName } : u
            ));
        } catch (err) {
            console.error('Failed to rename unit:', err);
        }

        setEditingUnit(null);
        setEditName('');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
            padding: '1rem'
        }}>
            {/* Compact Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
                <img
                    src="/assets/iisc_logo.png"
                    alt="IISc"
                    style={{
                        height: '50px',
                        filter: 'invert(1) brightness(1.5)',
                        opacity: 0.9
                    }}
                />

                <h1 style={{
                    fontSize: '1.25rem',
                    color: '#94a3b8',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    fontWeight: 300,
                    margin: 0
                }}>
                    AQI MONITORING SYSTEM
                </h1>

                <img
                    src="/assets/cense_logo.png"
                    alt="CeNSE"
                    style={{
                        height: '40px',
                        background: 'rgba(255,255,255,0.95)',
                        padding: '6px',
                        borderRadius: '6px'
                    }}
                />
            </div>

            {/* Compact 3x3 Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.25rem',
                maxWidth: '850px',
                margin: '0 auto',
                width: '100%',
                padding: '1rem'
            }}>
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>
                        Loading units...
                    </div>
                ) : (
                    units.map((unit) => (
                        <div
                            key={unit.unit_id}
                            style={{
                                position: 'relative',
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(12px)',
                                border: `2px solid ${unit.aqiData.color}`,
                                borderRadius: '12px',
                                padding: '1.25rem',
                                transition: 'all 0.3s ease',
                                boxShadow: `0 0 25px ${unit.aqiData.color}20`,
                                cursor: 'pointer'
                            }}
                            onClick={() => editingUnit !== unit.unit_id && navigate(`/dashboard/${unit.unit_id}`)}
                            onMouseOver={(e) => {
                                if (editingUnit !== unit.unit_id) {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = `0 4px 30px ${unit.aqiData.color}35`;
                                }
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `0 0 25px ${unit.aqiData.color}20`;
                            }}
                        >
                            {/* Unit Name with Edit */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.75rem'
                            }}>
                                {editingUnit === unit.unit_id ? (
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={() => handleRename(unit.unit_id)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleRename(unit.unit_id)}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            color: '#fff',
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            outline: 'none',
                                            width: '100%'
                                        }}
                                    />
                                ) : (
                                    <>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: '#94a3b8',
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase',
                                            fontWeight: 600
                                        }}>
                                            {unit.unit_name || `Unit ${unit.unit_id}`}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingUnit(unit.unit_id);
                                                setEditName(unit.unit_name || `Unit ${unit.unit_id}`);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#64748b',
                                                cursor: 'pointer',
                                                padding: '2px 6px',
                                                fontSize: '0.7rem',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.color = '#94a3b8'}
                                            onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                                        >
                                            ✏️
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* AQI Value */}
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '0.5rem'
                            }}>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: '800',
                                    color: unit.aqiData.color,
                                    lineHeight: 1,
                                    textShadow: `0 0 15px ${unit.aqiData.color}50`,
                                    fontFamily: 'monospace'
                                }}>
                                    {unit.aqiData.aqi}
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    marginTop: '0.4rem',
                                    color: unit.aqiData.color,
                                    fontWeight: 600
                                }}>
                                    {unit.aqiData.category}
                                </div>
                            </div>

                            {/* View Details */}
                            <div style={{
                                textAlign: 'center',
                                fontSize: '0.6rem',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.25rem',
                                marginTop: '0.5rem'
                            }}>
                                <span>View Details</span>
                                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UnitsGrid;
