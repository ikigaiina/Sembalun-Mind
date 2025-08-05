import { initializeApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  connectAuthEmulator,
  type Auth
} from 'firebase/auth';
import { 
  getFirestore,
  connectFirestoreEmulator,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore
} from 'firebase/firestore';
import { 
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage
} from 'firebase/storage';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getPerformance, type FirebasePerformance } from 'firebase/performance';

// Safe environment variable access
const getEnvVar = (key: string, defaultValue = '') => {
  try {
    return import.meta.env[key] || defaultValue;
  } catch (error) {
    console.warn(`Failed to access environment variable: ${key}`);
    return defaultValue;
  }
};

// Firebase configuration with safe fallbacks
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID')
};

// Validate configuration
const isConfigValid = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'];
  return required.every(key => firebaseConfig[key as keyof typeof firebaseConfig]);
};

// Environment detection
const isDevelopment = getEnvVar('NODE_ENV') === 'development' || getEnvVar('MODE') === 'development';
const useEmulators = getEnvVar('VITE_USE_EMULATORS') === 'true';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let performance: FirebasePerformance | null = null;

// Initialize Firebase with comprehensive error handling
const initializeFirebase = () => {
  try {
    if (!isConfigValid()) {
      console.error('❌ Firebase configuration is incomplete');
      console.log('Missing configuration keys:', 
        Object.entries(firebaseConfig)
          .filter(([_, value]) => !value)
          .map(([key]) => key)
      );
      return false;
    }

    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');

    // Initialize Auth
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized');

    // Initialize Firestore with error handling
    try {
      if (import.meta.env.PROD) {
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({
            cacheSizeBytes: CACHE_SIZE_UNLIMITED,
            tabManager: persistentMultipleTabManager()
          }),
          ignoreUndefinedProperties: true
        });
      } else {
        db = getFirestore(app);
      }
      console.log('✅ Firestore initialized');
    } catch (firestoreError) {
      console.warn('⚠️ Firestore advanced features failed, using basic setup');
      db = getFirestore(app);
    }

    // Initialize Storage
    storage = getStorage(app);
    console.log('✅ Firebase Storage initialized');

    // Initialize Analytics (production only)
    if (import.meta.env.PROD && firebaseConfig.measurementId) {
      try {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized');
      } catch (analyticsError) {
        console.warn('⚠️ Analytics initialization failed:', analyticsError);
      }
    }

    // Initialize Performance (production only)
    if (import.meta.env.PROD) {
      try {
        performance = getPerformance(app);
        console.log('✅ Firebase Performance initialized');
      } catch (perfError) {
        console.warn('⚠️ Performance monitoring initialization failed:', perfError);
      }
    }

    // Connect to emulators in development
    if (isDevelopment && useEmulators) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db!, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('🔧 Connected to Firebase Emulators');
      } catch (emulatorError) {
        console.warn('⚠️ Emulator connection failed:', emulatorError);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return false;
  }
};

// Initialize Firebase
const isInitialized = initializeFirebase();

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Configure providers
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('profile');
googleProvider.addScope('email');
appleProvider.setCustomParameters({ locale: 'id' });

// Export Firebase services with null checks
export { 
  app, 
  auth, 
  db, 
  storage, 
  analytics, 
  performance,
  isInitialized,
  firebaseConfig 
};

// Default export
export default app;