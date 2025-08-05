import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  connectAuthEmulator 
} from 'firebase/auth';
import { 
  getFirestore,
  connectFirestoreEmulator,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { 
  getStorage,
  connectStorageEmulator 
} from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

// Environment detection utilities
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

// CRITICAL FIX: Enhanced SSR/Build detection to prevent initialization issues
const isSSR = typeof window === 'undefined';
const isBuildTime = import.meta.env.SSR || typeof global !== 'undefined';
const isClientSide = !isSSR && !isBuildTime && typeof window !== 'undefined';

// Validate required environment variables only when needed
const validateEnvVars = () => {
  if (isSSR || isBuildTime) return true;
  
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('🔥 Missing required Firebase environment variables:', missing);
    if (isDevelopment) {
      throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
    }
    return false;
  }
  return true;
};

// Only validate config in appropriate environments
const isConfigValid = isClientSide ? validateEnvVars() : true;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
};

// CRITICAL FIX: Singleton pattern for Firebase App with proper error handling
let firebaseApp: ReturnType<typeof initializeApp> | null = null;
let firebaseInitialized = false;

const initializeFirebaseApp = () => {
  // Skip initialization during SSR or build
  if (isSSR || isBuildTime || !isConfigValid) {
    console.log('🔥 Firebase initialization skipped:', { isSSR, isBuildTime, isConfigValid });
    return null;
  }
  
  // Return existing app if already initialized
  if (firebaseInitialized) {
    return firebaseApp;
  }
  
  try {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseInitialized = true;
    console.log('✅ Firebase initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    firebaseInitialized = true; // Prevent retry loops
    if (isDevelopment) {
      throw new Error('Firebase configuration is invalid. Please check your environment variables.');
    }
    return null;
  }
};

// Initialize the app once
const app = initializeFirebaseApp();

// CRITICAL FIX: Lazy initialization pattern to prevent "Cannot access 't' before initialization" error
let firebaseAuth: ReturnType<typeof getAuth> | null = null;
let firebaseStorage: ReturnType<typeof getStorage> | null = null;
let firestoreDb: ReturnType<typeof getFirestore> | null = null;
let firestoreInitialized = false;
let authInitialized = false;
let storageInitialized = false;

// Enhanced lazy getter for Firebase Auth
const getFirebaseAuth = () => {
  if (authInitialized) return firebaseAuth;
  
  if (app && isClientSide) {
    try {
      firebaseAuth = getAuth(app);
      console.log('🔥 Firebase Auth initialized lazily');
    } catch (error) {
      console.error('🔥 Failed to initialize Firebase Auth:', error);
      firebaseAuth = null;
    }
  }
  
  authInitialized = true;
  return firebaseAuth;
};

// Enhanced lazy getter for Firebase Storage
const getFirebaseStorage = () => {
  if (storageInitialized) return firebaseStorage;
  
  if (app && isClientSide) {
    try {
      firebaseStorage = getStorage(app);
      console.log('🔥 Firebase Storage initialized lazily');
    } catch (error) {
      console.error('🔥 Failed to initialize Firebase Storage:', error);
      firebaseStorage = null;
    }
  }
  
  storageInitialized = true;
  return firebaseStorage;
};

// CRITICAL FIX: Enhanced lazy getter for Firestore with comprehensive error handling
const getFirebaseDb = () => {
  if (firestoreInitialized) return firestoreDb;
  
  if (!app || !isClientSide) {
    firestoreInitialized = true;
    return null;
  }
  
  try {
    if (isDevelopment && useEmulators) {
      // Development with emulators - use simple Firestore
      firestoreDb = getFirestore(app);
      console.log('🔥 Firestore initialized for development with emulators');
    } else if (isProduction) {
      // Production - try advanced features first, fallback to basic
      try {
        firestoreDb = initializeFirestore(app, {
          localCache: persistentLocalCache({
            cacheSizeBytes: CACHE_SIZE_UNLIMITED,
            tabManager: persistentMultipleTabManager()
          }),
          ignoreUndefinedProperties: true
        });
        console.log('🔥 Firestore initialized for production with persistent cache');
      } catch (cacheError) {
        console.warn('🔥 Advanced Firestore cache failed, using basic Firestore:', cacheError);
        firestoreDb = getFirestore(app);
        console.log('🔥 Firestore initialized with basic configuration');
      }
    } else {
      // Development without emulators or fallback
      firestoreDb = getFirestore(app);
      console.log('🔥 Firestore initialized with default configuration');
    }
  } catch (error) {
    console.error('🔥 Failed to initialize Firestore:', error);
    try {
      // Ultimate fallback to basic Firestore
      firestoreDb = getFirestore(app);
      console.log('🔥 Firestore fallback initialization succeeded');
    } catch (fallbackError) {
      console.error('🔥 All Firestore initialization attempts failed:', fallbackError);
      firestoreDb = null;
    }
  }
  
  firestoreInitialized = true;
  return firestoreDb;
};

// CRITICAL FIX: Export lazy-initialized services to prevent initialization errors
export const auth = isClientSide ? getFirebaseAuth() : null;
export const storage = isClientSide ? getFirebaseStorage() : null;
export const db = isClientSide ? getFirebaseDb() : null;

// Initialize Analytics and Performance (production only with measurement ID)
let analytics: ReturnType<typeof getAnalytics> | null = null;
let performance: ReturnType<typeof getPerformance> | null = null;

if (isProduction && firebaseConfig.measurementId && app && isClientSide) {
  try {
    analytics = getAnalytics(app);
    performance = getPerformance(app);
    console.log('🔥 Analytics and Performance initialized for production');
  } catch (error) {
    console.warn('🔥 Failed to initialize Analytics/Performance:', error);
  }
} else if (isClientSide) {
  console.log('🔥 Analytics and Performance disabled for development');
}

export { analytics, performance };

// Auth providers - only initialize if auth is available
export const googleProvider = auth ? new GoogleAuthProvider() : null;
export const appleProvider = auth ? new OAuthProvider('apple.com') : null;

// Configure providers only if they exist
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  
  // Request additional profile information
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
}

if (appleProvider) {
  appleProvider.setCustomParameters({
    locale: 'id' // Indonesian localization
  });
}

// Development emulator connections with proper error handling
if (isDevelopment && useEmulators && app && auth && db && storage && isClientSide) {
  const connectToEmulators = async () => {
    try {
      // Check if already connected to avoid connection errors
      const authConfig = (auth as any)?._delegate?._config?.emulator;
      if (!authConfig) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('🔥 Connected to Auth Emulator');
      }

      const dbHost = (db as any)?._delegate?._databaseId?.projectId;
      if (!dbHost?.includes('localhost')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('🔥 Connected to Firestore Emulator');
      }

      const storageHost = (storage as any)?._delegate?._host;
      if (!storageHost?.includes('localhost')) {
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('🔥 Connected to Storage Emulator');
      }

      console.log('🔥 All Firebase Emulators connected successfully');
    } catch (error) {
      console.warn('🔥 Some Firebase Emulators may not be available:', error);
      console.info('🔥 To start emulators, run: firebase emulators:start');
    }
  };

  // Connect to emulators
  connectToEmulators();
} else if (isDevelopment && isClientSide) {
  console.log('🔥 Emulators disabled - using live Firebase services in development');
}

export default app;