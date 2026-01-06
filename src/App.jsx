import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import UnitsGrid from './components/UnitsGrid';
import HistoryLog from './components/HistoryLog';

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    <Route path="/" element={<UnitsGrid />} />
                    <Route path="/dashboard/:unitId" element={<Dashboard />} />
                    <Route path="/history" element={<HistoryLog />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
