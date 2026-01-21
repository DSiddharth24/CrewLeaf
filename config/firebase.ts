import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCybLnzcXrU8oYYh1Q6d84Qu2n8N3bPxbw",
  authDomain: "crewleaf-app.firebaseapp.com",
  projectId: "crewleaf-app",
  storageBucket: "crewleaf-app.firebasestorage.app",
  messagingSenderId: "619615370420",
  appId: "1:619615370420:web:0552faa96db531eb2f2be1",
  databaseURL: "https://crewleaf-app-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const firestore = getFirestore(app); // Alias for clarity
export const db = firestore; // Standard export
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

export default app;

