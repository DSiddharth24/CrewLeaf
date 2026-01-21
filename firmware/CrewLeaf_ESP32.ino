/**
 * CrewLeaf ESP32 Firmware (Real RFID Version)
 * 
 * Hardware Required:
 * - ESP32 Development Board
 * - MFRC522 RFID Reader
 * 
 * Logic:
 * 1. Connects to Wi-Fi
 * 2. Connects to Firebase Realtime Database
 * 3. Waits for RFID Card tap
 * 4. Reads Card UID
 * 5. Logs to Firebase: /iot_logs
 */

#include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Firebase_ESP_Client.h>

// 1. WI-FI CREDENTIALS
#define WIFI_SSID "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// 2. FIREBASE CREDENTIALS
#define API_KEY "AIzaSyCybLnzcXrU8oYYh1Q6d84Qu2n8N3bPxbw"
#define DATABASE_URL "https://crewleaf-app-default-rtdb.firebaseio.com/"

// 3. PINS (ESP32 <-> RC522)
#define SS_PIN  5  
#define RST_PIN 22
#define LED_PIN 2

MFRC522 rfid(SS_PIN, RST_PIN);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

String deviceId = "ESP32_GATE_01";
unsigned long lastScan = 0;

void setup() {
  Serial.begin(115200);
  SPI.begin(); 
  rfid.PCD_Init(); 
  pinMode(LED_PIN, OUTPUT);

  // Connect Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nConnected to Wi-Fi");

  // Firebase Init
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase Connected");
  }
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Ready to scan RFID cards...");
}

void loop() {
  // Check for new card
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  // Prevent double scans (3 seconds cooldown)
  if (millis() - lastScan < 3000) return;
  lastScan = millis();

  // Read UID
  String cardId = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    cardId += (rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    cardId += String(rfid.uid.uidByte[i], HEX);
  }
  cardId.toUpperCase();

  logAttendance(cardId);

  // Halt PICC
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

void logAttendance(String cardId) {
  Serial.print("Card Scanned: ");
  Serial.println(cardId);
  digitalWrite(LED_PIN, HIGH); // On during processing

  String path = "/iot_logs";
  FirebaseJson json;
  json.set("cardId", cardId);
  json.set("deviceId", deviceId);
  json.set("timestamp", millis());
  json.set("type", "rfid_tap");

  if (Firebase.RTDB.pushJSON(&fbdo, path, &json)) {
    Serial.println("SUCCESS: Logged to Firebase");
    // Success Blink (Fast)
    for(int i=0; i<3; i++) { digitalWrite(LED_PIN, LOW); delay(50); digitalWrite(LED_PIN, HIGH); delay(50); }
  } else {
    Serial.println("FAILED: " + fbdo.errorReason());
    // Fail Blink (Slow)
    digitalWrite(LED_PIN, LOW); delay(500); digitalWrite(LED_PIN, HIGH); delay(500);
  }
  digitalWrite(LED_PIN, LOW);
}
