const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
} else {
    // If no service account, try to initialize with default credentials (useful for local development with gcloud)
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const db = admin.firestore();
const auth = admin.auth();
const fcm = admin.messaging();

module.exports = { admin, db, auth, fcm };
