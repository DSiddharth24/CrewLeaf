# CrewLeaf IoT Firmware Setup Guide (Real RFID)

## 1. Install Arduino IDE
If you haven't already, download and install [Arduino IDE](https://www.arduino.cc/en/software).

## 2. Setup ESP32 Board Manager
1. In Arduino IDE, go to **File** > **Preferences**.
2. In "Additional Boards Manager URLs", paste:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Go to **Tools** > **Board** > **Boards Manager**, search "esp32", and install **esp32 by Espressif Systems**.

## 3. Install Required Libraries
You need TWO libraries for this code:
1. **Firebase ESP Client** (by Mobizt) - For database connection.
2. **MFRC522** (by GithubCommunity or similar) - For the RFID reader.

## 4. Hardware Wiring
Connect your RC522 Reader to ESP32 as follows:
| RC522 Pin | ESP32 Pin |
|-----------|-----------|
| SDA (SS)  | GPIO 5    |
| SCK       | GPIO 18   |
| MOSI      | GPIO 23   |
| MISO      | GPIO 19   |
| GND       | GND       |
| RST       | GPIO 22   |
| 3.3V      | 3.3V      |

⚠️ **WARNING:** Do not connect to 5V! Use 3.3V only.

## 5. Flash the Firmware
1. Open `firmware/CrewLeaf_ESP32.ino`.
2. Update **WIFI_SSID** and **WIFI_PASSWORD** at the top.
3. Connect ESP32 via USB.
4. Select Board and Port.
5. Upload!

## 6. Testing
Once you have the hardware:
1. Open Serial Monitor (115200 baud).
2. Tap a card.
3. See "SUCCESS: Logged to Firebase" in the monitor.
