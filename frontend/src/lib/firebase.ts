import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBptGdIbxGonIxzS8O0OuP_fIdAeRoszkE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pathfinder-ai-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pathfinder-ai-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pathfinder-ai-project.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "643456407704",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:643456407704:web:9311802e80ca4e050d98ed",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZJRCBE91MS"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with Offline Persistence enabled
export const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Analytics (Browser only)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
