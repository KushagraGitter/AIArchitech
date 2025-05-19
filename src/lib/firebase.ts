// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAnalytics, type Analytics } from "firebase/analytics"; // Optional: if you want analytics

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
// let analytics: Analytics; // Optional

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  // if (firebaseConfig.measurementId) { // Optional
  //   analytics = getAnalytics(app);
  // }
} else if (getApps().length > 0) {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  // if (firebaseConfig.measurementId) { // Optional
  //   const existingApp = getApps()[0];
  //   // Check if analytics is already initialized for this app instance
  //   // This is a bit tricky as getAnalytics doesn't have a good "isInitialized" check easily exposed
  //   // For simplicity, we might re-get it, or if issues arise, wrap in a try-catch or a more robust check
  //   try {
  //     analytics = getAnalytics(existingApp);
  //   } catch (e) {
  //     console.warn("Firebase Analytics could not be re-initialized (may already exist or config missing).");
  //   }
  // }
}

// Export references that might not be initialized server-side
// or if accessed before initialization. Consider error handling or guards if needed.
export { app, auth, db }; // add 'analytics' here if you enable it
