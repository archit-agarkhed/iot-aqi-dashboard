/**
 * Exports sensor data to a CSV file
 * @param {Array} sensors - Array of sensor objects with history
 */
export const exportToCSV = (sensors) => {
    // We assume all sensors have the same amount of history for simplicity
    // or we take the max length.
    const historyLength = sensors[0]?.history.length || 0;

    if (historyLength === 0) return;

    // Header: Timestamp (relative), Sensor 1, Sensor 2, ...
    const headers = ['Time (s ago)', ...sensors.map(s => s.name)];

    let csvContent = headers.join(',') + '\n';

    // Rows: We iterate backwards through history (index 0 is newest)
    // But usually CSV is ordered by time. Let's do oldest to newest.
    // history[59] is oldest (60s ago), history[0] is newest (now).

    for (let i = historyLength - 1; i >= 0; i--) {
        const row = [
            -(i), // Time: -59, -58, ... 0
            ...sensors.map(s => s.history[i]?.value.toFixed(2) || '')
        ];
        csvContent += row.join(',') + '\n';
    }

    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sensor_data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportHistoryToCSV = (data) => {
    if (!data || data.length === 0) return;

    // Headers matching DB columns
    const headers = ['Unit ID', 'Unit Name', 'ID', 'Timestamp', 'PM2.5', 'AQI', 'Sensor 1', 'Sensor 2', 'Sensor 3', 'Sensor 4', 'Sensor 5', 'Sensor 6', 'Sensor 7', 'Sensor 8', 'Sensor 9'];

    let csvContent = headers.join(',') + '\n';

    data.forEach(row => {
        const csvRow = [
            row.unit_id || 1,
            `"${row.unit_name || `Unit ${row.unit_id || 1}`}"`,
            row.id,
            `"${row.timestamp}"`,
            row.pm25,
            row.aqi,
            row.sensor_1,
            row.sensor_2,
            row.sensor_3,
            row.sensor_4,
            row.sensor_5,
            row.sensor_6,
            row.sensor_7,
            row.sensor_8,
            row.sensor_9
        ];
        csvContent += csvRow.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `full_sensor_history_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
