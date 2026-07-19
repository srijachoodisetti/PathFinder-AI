import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBptGdIbxGonIxzS8O0OuP_fIdAeRoszkE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pathfinder-ai-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pathfinder-ai-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pathfinder-ai-project.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "643456407704",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:643456407704:web:9311802e80ca4e050d98ed",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZJRCBE91MS",
};

let app: any;
let auth: any;
let db: any;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase failed to initialize. Using mock/stub interfaces to prevent blank screen:", error);
  app = {} as any;
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      // Instantly trigger with null (logged out) to not hang the app
      setTimeout(() => callback(null), 0);
      return () => {};
    }
  } as any;
  db = {} as any;
}

export { auth, db };
