# Multi-Unit AQI Monitoring System

Real-time air quality monitoring dashboard supporting 9 independent sensor units with live data visualization.

![System Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![ESP32](https://img.shields.io/badge/ESP32-compatible-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)

🔗 **[View on GitHub](https://github.com/archit-agarkhed/iot-aqi-dashboard)**

## System Overview

A scalable IoT solution for monitoring air quality across multiple locations. Each ESP32 unit measures 9 air quality parameters and sends data to a central server every 5 seconds.

### Key Features
- **9 Independent Units** - Monitor different rooms/locations simultaneously
- **Real-time Updates** - Data refreshes every 2 seconds on dashboard
- **Custom Unit Names** - Rename units (e.g., "Kitchen", "Lab 1")
- **Live AQI Calculation** - Color-coded air quality indicators
- **Historical Data** - SQLite database with full CSV export
- **Responsive UI** - Premium glassmorphism design

### Monitored Parameters
Each unit measures: PM2.5, PM10, CO, CO₂, NO₂, SO₂, O₃, Temperature, Humidity

## Architecture

```
ESP32 Units (1-9) → WiFi → Backend (Node.js + SQLite) → Frontend (React + Vite)
```

- **Hardware**: ESP32 microcontrollers with air quality sensors
- **Backend**: Express.js REST API with SQLite database
- **Frontend**: React with real-time data fetching

## Quick Start

### Prerequisites
- Node.js v18+ ([Download](https://nodejs.org/))
- Arduino IDE ([Download](https://www.arduino.cc/en/software))
- ESP32 board + air quality sensors

### 1. Clone Repository
```bash
git clone https://github.com/archit-agarkhed/iot-aqi-dashboard.git
cd iot-aqi-dashboard
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install
```

### 3. Start Backend Server
```bash
cd backend
node server.js
```
Expected output: `Backend server running on http://localhost:3000`

### 4. Start Frontend (New Terminal)
```bash
npm run dev
```
Expected output: `Local: http://localhost:5173/`

### 5. Configure ESP32
- Flash Arduino code from `/esp32/` folder
- Update WiFi credentials and server IP
- Set unique `UNIT_ID` for each ESP32 (1-9)

**See [DEPLOYMENT_GUIDE.pdf](DEPLOYMENT_GUIDE.pdf) for detailed setup instructions**

## Project Structure

```
iot-aqi-dashboard/
├── backend/
│   ├── database.js          # SQLite operations
│   ├── server.js            # Express API server
│   ├── package.json
│   └── database.sqlite      # (auto-generated)
├── src/
│   ├── components/
│   │   ├── UnitsGrid.jsx    # 3×3 unit grid
│   │   ├── Dashboard.jsx    # Unit-specific sensors view
│   │   ├── HistoryLog.jsx   # Database viewer
│   │   └── SensorCard.jsx   # Individual sensor display
│   ├── hooks/
│   │   └── useSensorData.js # Data fetching logic
│   ├── utils/
│   │   ├── aqiUtils.js      # AQI calculation
│   │   └── csvUtils.js      # CSV export
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── esp32/                   # (You'll add this)
│   └── sensor_code.ino
├── public/
│   └── assets/              # Logos
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## API Endpoints

### Backend REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/update-data` | ESP32 sends sensor data |
| `GET` | `/api/units` | Get all 9 units with latest AQI |
| `GET` | `/api/sensor-data/:unitId` | Unit-specific sensor data |
| `GET` | `/api/sensor-history/:unitId` | Historical data for unit |
| `GET` | `/api/sensor-export` | Download all data as CSV |
| `PATCH` | `/api/units/:unitId/name` | Update custom unit name |

### Example ESP32 POST Request
```json
{
  "unit_id": 1,
  "pm25": 15.2,
  "aqi": 53,
  "sensors": [15.2, 450, 25, 12.1, 380, 18, 8.5, 22.3, 45.6]
}
```

## Dashboard Features

### Home Page
- **3×3 Grid** of all 9 units
- **Real-time AQI** with color coding:
  - Green (0-50): Good
  - Yellow (51-100): Moderate
  - Red (101+): Unhealthy
- **Click any unit** to navigate to detailed sensor view
- **Edit unit names** by clicking the pencil icon

### Unit Dashboard
- View all 9 sensors for selected unit
- Live charts showing real-time values
- Export data to CSV
- "BACK TO UNITS" button

### History Log
- Last 100 database records
- Filterable by unit
- Downloadable as CSV

## Configuration

### ESP32 WiFi Setup
Edit in Arduino code:
```cpp
const int UNIT_ID = 1;  // Change for each ESP32 (1-9)
const char* WIFI_SSID = "YourWiFiName";
const char* WIFI_PASSWORD = "YourPassword";
const char* SERVER_URL = "http://192.168.1.100:3000/api/update-data";
```

### Backend Port (Optional)
Edit `backend/server.js`:
```javascript
const PORT = 3000;  // Change if needed
```

## Database Schema

### `sensor_readings` Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| unit_id | INTEGER | Unit identifier (1-9) |
| unit_name | TEXT | Custom name (e.g., "Kitchen") |
| timestamp | TEXT | ISO 8601 timestamp |
| pm25 | REAL | PM2.5 reading |
| aqi | INTEGER | Calculated AQI |
| sensor_1 to sensor_9 | REAL | Individual sensor values |

### `unit_names` Table
| Column | Type | Description |
|--------|------|-------------|
| unit_id | INTEGER | Primary key |
| custom_name | TEXT | Persistent unit name |

## Testing

### Test Individual Unit
1. Flash ESP32 with `UNIT_ID = 1`
2. Check Serial Monitor for "Data sent successfully"
3. Verify backend logs: "Saved reading. AQI: XXX"
4. Open dashboard: Unit 1 should show live data

### Test Multiple Units
1. Flash 3 ESP32s with `UNIT_ID` 1, 2, 3
2. All should appear on dashboard with different values
3. Click each unit to verify sensor data

## Troubleshooting

| Issue | Solution |
|-------|----------|
| ESP32 won't connect to WiFi | Check SSID/password, signal strength |
| HTTP 500 error | Restart backend, check database schema |
| Frontend not updating | Verify backend is running on port 3000 |
| Unit names revert | Restart backend with latest code |

## Deployment

### For Production Use:
1. **Backend**: Deploy on server with static IP
2. **Frontend**: Build and serve static files
   ```bash
   npm run build
   # Serve ./dist folder with nginx/apache
   ```
3. **Database**: Regular backups of `database.sqlite`
4. **ESP32s**: Use reliable power supplies (not USB)

## Documentation

- **[DEPLOYMENT_GUIDE.pdf](DEPLOYMENT_GUIDE.pdf)** - Complete setup guide for hardware team
- **[WALKTHROUGH.pdf](WALKTHROUGH.pdf)** - Development process documentation

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request



## Author

- **Archit Agarkhed** - *Initial work* - [GitHub](https://github.com/archit-agarkhed)

## Acknowledgments

- ESP32 community for hardware support
- React + Vite for excellent developer experience
- SQLite for reliable embedded database

---

**Built for clean air monitoring**
