import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User,
  Auth 
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore 
} from 'firebase/firestore';
import { FirebaseConfig } from '../types';

const STORAGE_KEY = 'tailor_firebase_config';

export function getStoredFirebaseConfig(): FirebaseConfig | null {
  // 1. Try env vars first (from .env)
  const envConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  // 2. Try localStorage config saved by user
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch {
      // ignore JSON parse error
    }
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.location.reload(); // Reload to re-init Firebase with new keys
}

export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const currentConfig = getStoredFirebaseConfig();

if (currentConfig && currentConfig.apiKey) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(currentConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("🟢 Firebase initialized with project:", currentConfig.projectId);
  } catch (err) {
    console.warn("⚠️ Failed to initialize Firebase with stored config:", err);
  }
}

export { app, auth, db };

export const isFirebaseConfigured = Boolean(app && auth && db);

// Authorized Admins Whitelist
export const ALLOWED_ADMIN_EMAILS = [
  'vishalkumar9032374977@gmail.com',
  'ashadevi903237@gmail.com',
  'anjalikumari903237@gmail.com',
];

export function isEmailAuthorized(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase().trim());
}

// Auth Helpers
const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<User | null> {
  if (!auth) throw new Error("Firebase Auth is not configured yet.");
  const result = await signInWithPopup(auth, googleProvider);
  if (!isEmailAuthorized(result.user.email)) {
    await fbSignOut(auth);
    throw new Error(`Access Denied: ${result.user.email} is not authorized. Only vishalkumar9032374977@gmail.com, ashadevi903237@gmail.com, and anjalikumari903237@gmail.com have admin access.`);
  }
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User | null> {
  if (!isEmailAuthorized(email)) {
    throw new Error(`Access Denied: Only authorized tailors (vishalkumar9032374977@gmail.com, ashadevi903237@gmail.com, anjalikumari903237@gmail.com) can sign in.`);
  }
  if (!auth) throw new Error("Firebase Auth is not configured yet.");
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function logout(): Promise<void> {
  if (auth) {
    await fbSignOut(auth);
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (!auth) {
    // If not connected to live Firebase, check local admin session
    const localAdmin = localStorage.getItem('tailor_local_admin_session');
    if (localAdmin && isEmailAuthorized(localAdmin)) {
      callback({
        email: localAdmin,
        displayName: 'Asha Devi (Admin)',
        uid: 'local-admin-1',
      } as unknown as User);
    } else {
      callback(null);
    }
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    if (user && isEmailAuthorized(user.email)) {
      callback(user);
    } else {
      if (user) {
        fbSignOut(auth!);
      }
      callback(null);
    }
  });
}

// Local mock login for authorized emails
export function setLocalAdminSession(email: string = 'ashadevi903237@gmail.com') {
  if (isEmailAuthorized(email)) {
    localStorage.setItem('tailor_local_admin_session', email);
    window.dispatchEvent(new Event('auth_state_changed'));
  }
}

export function clearLocalAdminSession() {
  localStorage.removeItem('tailor_local_admin_session');
  window.dispatchEvent(new Event('auth_state_changed'));
}
