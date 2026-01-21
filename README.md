# 🌱 CrewLeaf - Smart Plantation Management Platform

CrewLeaf is a comprehensive mobile application designed to digitize plantation labor management. It bridges the gap between manual labor and digital tracking using GPS, IoT (RFID), and modern mobile interfaces.

## 🚀 Key Features

### 👨‍💼 Manager Dashboard
- **Field Management**: Draw fields on interactive maps, calculate acreage automatically.
- **Worker Management**: Track profiles, assign RFID cards.
- **Live Attendance**: See who is active, their location, and check-in source (Mobile vs IoT).
- **Task Management**: Assign and track field tasks.
- **Wages & Payments**: Calculate dues and pay via **Razorpay** (UPI).
- **Analytics**: Performance charts and productivity insights.

### 👷 Supervisor Module
- **Field Ops**: Manage daily operations and verify worker tasks.
- **Reporting**: Report issues directly from the field.

### 👨‍🌾 Worker App
- **Simple Interface**: Big-button design for ease of use.
- **GPS Attendance**: One-tap check-in/out with location verification.
- **Offline Mode**: Works in low connectivity areas (syncs when online).

### 📡 IoT Integration (RFID)
- **Gate Check-in**: ESP32-based RFID readers for rapid attendance at entry points.
- **Seamless Sync**: Taps are processed instantly by the app background service.

---

## 🛠️ Technology Stack
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Backend**: Firebase (Auth, Firestore, Realtime DB)
- **IoT Firmware**: C++ (Arduino Framework for ESP32)
- **Maps**: Google Maps SDK
- **Payments**: Razorpay SDK

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- React Native / Expo CLI
- Android Studio / iOS Simulator (optional)

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>

# Navigate to project
cd app

# Install dependencies
npm install
```

### 3. Running the App
```bash
# Start Metro Bundler
npx expo start
```
Scan the QR code with **Expo Go** on your Android/iOS device.

---

## 📂 Project Structure

```
crewleaf-mobile/
├── assets/             # Images and icons
├── config/             # Firebase & Env configuration
├── firmware/           # ESP32 C++ Code for IoT Reader
├── locales/            # Translation files (i18n)
├── screens/            # App screens by role
│   ├── manager/        # Manager-specific screens
│   ├── supervisor/     # Supervisor screens
│   └── worker/         # Worker screens
├── services/           # Logic (Location, Payment, IoT)
├── theme/              # Design tokens (Colors, Typography)
├── types/              # TypeScript interfaces
├── App.tsx             # Main entry point & Navigation
└── app.json            # Expo configuration
```

---

## 🔐 Credentials & Security
- API Keys are loaded from `.env` (not committed to Git).
- Google Maps API key is restricted by App ID.
- Firebase Security Rules ensure Role-Based Access Control (RBAC).

---

## 📡 IoT Setup
See [`firmware/README.md`](firmware/README.md) for detailed instructions on flashing the ESP32 device.

---

## 🧪 Testing Credentials
*(For Development Use Only)*

| Role | Email | Password |
|------|-------|----------|
| **Manager** | `siddharth85431146@gmail.com` | *(User set)* |
| **Worker** | *(Create via Signup)* | - |

---

Built with ❤️ for Smart Agriculture.
