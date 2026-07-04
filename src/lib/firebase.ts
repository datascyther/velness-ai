import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import {
  getAuth,
  initializeAuth,
  Auth,
  connectAuthEmulator,
} from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
  isSupported,
  type Analytics,
} from 'firebase/analytics';
import { env } from '@/core/config/env';

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
  ...(env.firebaseMeasurementId ? { measurementId: env.firebaseMeasurementId } : {}),
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

function createAuth(firebaseApp: FirebaseApp): Auth {
  if (Platform.OS === 'web') {
    return getAuth(firebaseApp);
  }

  try {
    const getReactNativePersistence = (firebaseAuth as any)['getReactNativePersistence'];
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Hot reload can re-run module init; reuse existing auth instance.
    return getAuth(firebaseApp);
  }
}

if (firebaseConfig.apiKey) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = createAuth(app);
    db = getFirestore(app);

    if (env.isDev && env.useFirebaseEmulators) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('[Firebase] Using emulators');
    }

    if (!__DEV__) {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      });
    }
  } catch (error) {
    console.warn('[Firebase] Initialization failed:', error);
  }
} else {
  console.warn(
    '[Firebase] Missing EXPO_PUBLIC_FIREBASE_API_KEY — add it to .env or run npm run firebase:sync-env',
  );
}

export function isFirebaseConfigured(): boolean {
  return Boolean(app && auth && db);
}

export { app as default, auth, db, analytics, logEvent, setUserId, setUserProperties };
