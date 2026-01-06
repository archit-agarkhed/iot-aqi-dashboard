#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "ESP_NANO_WIFI";
const char* password = "12345678";
const char* serverName = "http://192.168.4.2:3000/api/update-data";

unsigned long lastTime = 0;
unsigned long timerDelay = 5000;  // 5 seconds

WiFiClient client;

void setup() {
  Serial.begin(115200);
  delay(100);

  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, password);

  Serial.print("AP IP: ");
  Serial.println(WiFi.softAPIP());

  Serial.print("Waiting for client to connect");
  unsigned long waitStart = millis();
  while (WiFi.softAPgetStationNum() == 0 && millis() - waitStart < 30000UL) {
    Serial.print('.');
    delay(500);
  }

  if (WiFi.softAPgetStationNum() == 0) {
    Serial.println();
    Serial.println("No client connected after 30s — continuing anyway.");
  } else {
    Serial.println();
    Serial.println("Client connected.");
  }

  randomSeed(esp_random());
}

void loop() {
  if ((millis() - lastTime) <= timerDelay) return;

  Serial.print("Stations connected: ");
  Serial.println(WiFi.softAPgetStationNum());

  // Generate fake sensor data for 3 units
  // UNIT 1
  int aqi1 = random(50, 150);
  float pm25_1 = random(10, 80);
  int co2_1 = random(400, 1200);
  int o3_1 = random(10, 60);

  // UNIT 2
  int aqi2 = random(50, 150);
  float pm25_2 = random(10, 80);
  int co2_2 = random(400, 1200);
  int o3_2 = random(10, 60);

  // UNIT 3
  int aqi3 = random(50, 150);
  float pm25_3 = random(10, 80);
  int co2_3 = random(400, 1200);
  int o3_3 = random(10, 60);

  // Print to Serial Monitor
  Serial.print("AQI1="); Serial.print(aqi1); Serial.print(", PM25_1="); Serial.print(pm25_1);
  Serial.print(" | AQI2="); Serial.print(aqi2); Serial.print(", PM25_2="); Serial.print(pm25_2);
  Serial.print(" | AQI3="); Serial.print(aqi3); Serial.print(", PM25_3="); Serial.println(pm25_3);

  // ============================================
  // Send 3 separate POST requests (one per unit)
  // ============================================
  
  // UNIT 1
  sendUnitData(1, pm25_1, aqi1, pm25_1, co2_1, o3_1);
  delay(100);  // Small delay between requests
  
  // UNIT 2
  sendUnitData(2, pm25_2, aqi2, pm25_2, co2_2, o3_2);
  delay(100);
  
  // UNIT 3
  sendUnitData(3, pm25_3, aqi3, pm25_3, co2_3, o3_3);

  lastTime = millis();
}

// Function to send data for one unit
void sendUnitData(int unitId, float pm25, int aqi, float s1, int s2, int s3) {
  // Build JSON for this unit
  String json = "{";
  json += "\"unit_id\":" + String(unitId) + ",";
  json += "\"pm25\":" + String(pm25) + ",";
  json += "\"aqi\":" + String(aqi) + ",";
  json += "\"sensors\":[";
  json += String(s1) + "," + String(s2) + "," + String(s3) + ",";
  json += String(s1) + "," + String(s2) + "," + String(s3) + ",";
  json += String(s1) + "," + String(s2) + "," + String(s3);
  json += "]}";

  // Send HTTP POST
  HTTPClient http;
  http.setTimeout(5000);
  
  if (http.begin(client, serverName)) {
    http.addHeader("Content-Type", "application/json");
    
    int httpCode = http.POST(json);
    
    if (httpCode == 200) {
      Serial.print("✅ Unit "); Serial.print(unitId); 
      Serial.print(" - HTTP 200, AQI: "); Serial.println(aqi);
    } else {
      Serial.print("❌ Unit "); Serial.print(unitId);
      Serial.print(" - HTTP Error: "); Serial.println(httpCode);
    }
    
    http.end();
  }
  
  client.stop();
}
