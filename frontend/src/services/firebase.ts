// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBptGdIbxGonIxzS8O0OuP_fIdAeRoszkE",
  authDomain: "pathfinder-ai-project.firebaseapp.com",
  projectId: "pathfinder-ai-project",
  storageBucket: "pathfinder-ai-project.firebasestorage.app",
  messagingSenderId: "643456407704",
  appId: "1:643456407704:web:9311802e80ca4e050d98ed",
  measurementId: "G-ZJRCBE91MS"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
