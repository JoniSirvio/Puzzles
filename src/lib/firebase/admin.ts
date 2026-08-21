import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'puzzles-ccfee';

if (getApps().length === 0) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId,
      });
    } catch (e) {
      console.warn('Virhe luettaessa FIREBASE_SERVICE_ACCOUNT_KEY:', e);
      adminApp = initializeApp({ projectId });
    }
  } else {
    // Default initialization for GCP, Cloud Functions, and App Hosting environments
    adminApp = initializeApp({ projectId });
  }
} else {
  adminApp = getApps()[0];
}

adminDb = getFirestore(adminApp);

export { adminApp, adminDb };
