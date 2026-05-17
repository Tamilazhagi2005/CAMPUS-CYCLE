import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const authDomainHost = (() => {
  try {
    if (!firebaseConfig.authDomain) return '';
    return new URL(`https://${firebaseConfig.authDomain}`).hostname;
  } catch {
    return '';
  }
})();

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const isFirebaseConfigured =
  Boolean(firebaseConfig.apiKey) &&
  Boolean(firebaseConfig.authDomain) &&
  Boolean(firebaseConfig.projectId) &&
  Boolean(firebaseConfig.appId);

export const actionCodeSettings = {
  url: 'https://revoxa.netlify.app/verify-email',
  handleCodeInApp: false,
};

export const isAuthorizedHost =
  typeof window !== 'undefined' &&
  (['localhost', '127.0.0.1', '::1'].includes(window.location.hostname) ||
    window.location.hostname.endsWith('.firebaseapp.com') ||
    window.location.hostname.endsWith('.web.app') ||
    window.location.hostname.endsWith('.vercel.app') ||
    window.location.hostname.endsWith('.netlify.app') ||
    window.location.hostname === authDomainHost);
