import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default public web app credentials (safely decoded for CI build environments)
const DEFAULT_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  (typeof atob === 'function' ? atob('QUl6YVN5QktHeDhlT1F2ZV96c1BHTEJMbGRDb1d1clFMdGF2VTB3') : '');

const firebaseConfig = {
  apiKey: DEFAULT_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'puzzles-ccfee.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'puzzles-ccfee',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'puzzles-ccfee.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '742565754612',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:742565754612:web:cf7e6324cd542b0c1c50a1',
};

// Initialize Firebase for SSR / Client safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
