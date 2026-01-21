// Environment Configuration
// These values are loaded from .env file

import Constants from 'expo-constants';

const ENV = {
    // Firebase
    FIREBASE_API_KEY: Constants.expoConfig?.extra?.firebaseApiKey || 'AIzaSyCybLnzcXrU8oYYh1Q6d84Qu2n8N3bPxbw',
    FIREBASE_AUTH_DOMAIN: 'crewleaf-app.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'crewleaf-app',
    FIREBASE_STORAGE_BUCKET: 'crewleaf-app.firebasestorage.app',
    FIREBASE_MESSAGING_SENDER_ID: '619615370420',
    FIREBASE_APP_ID: '1:619615370420:web:0552faa96db531eb2f2be1',
    FIREBASE_DATABASE_URL: 'https://crewleaf-app-default-rtdb.firebaseio.com',

    // Google Maps
    GOOGLE_MAPS_API_KEY: Constants.expoConfig?.extra?.googleMapsApiKey || 'AIzaSyDZA4LxLuzAOHqD610wU24ucdgrbhZdGgc',

    // Razorpay (TEST MODE)
    RAZORPAY_KEY_ID: Constants.expoConfig?.extra?.razorpayKeyId || 'rzp_test_S6SKGkyDq5hNgB',
    RAZORPAY_KEY_SECRET: Constants.expoConfig?.extra?.razorpayKeySecret || 'x713KhZE7NKObA6KbAefkapx',

    // App
    APP_ENV: 'development',
};

export default ENV;
