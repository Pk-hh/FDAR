import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCLr5cgvRJ4l5oyiQhgP__697qXraetbsE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fdar-cb701.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fdar-cb701",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fdar-cb701.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "316309976043",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:316309976043:web:5b7bb9fc0fab0c01241fae",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-L1JYFET0EF"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('[Firebase] Connected to live project:', firebaseConfig.projectId);

    // Initialize Analytics if supported in browser environment
    if (typeof window !== 'undefined') {
      isAnalyticsSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
          console.log('[Firebase] Analytics initialized successfully.');
        }
      }).catch(() => {});
    }
  } catch (err) {
    console.error('[Firebase] Initialization error:', err);
  }
}

export { app, auth, db, analytics };
