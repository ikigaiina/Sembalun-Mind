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

// Validate required environment variables
const validateEnvVars = () => {
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
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }
};

// Environment detection utilities
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

// SSR/Build detection to prevent initialization issues
const isSSR = typeof window === 'undefined';
const isBuildTime = import.meta.env.SSR || process?.env?.NODE_ENV === 'production';

// Validate environment variables with safer error handling
const validateFirebaseConfig = (): boolean => {
  try {
    validateEnvVars();
    return true;
  } catch (error) {
    console.error('Firebase configuration error:', error);
    // Don't throw in production to prevent app crash
    if (isDevelopment && !isSSR) {
      throw error;
    }
    return false;
  }
};

// Only validate config in appropriate environments
const isConfigValid = !isSSR ? validateFirebaseConfig() : true;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
};

// Log configuration state (without sensitive data) - only in browser
if (!isSSR) {
  console.log('🔥 Firebase configuration loaded:', {
    environment: isDevelopment ? 'development' : 'production',
    projectId: firebaseConfig.projectId,
    useEmulators,
    hasAnalytics: !!firebaseConfig.measurementId
  });
}

// Initialize Firebase with enhanced error handling
const initializeFirebaseApp = () => {
  // Skip initialization during SSR or build
  if (isSSR || isBuildTime) {
    console.log('🔥 Firebase initialization skipped during SSR/build');
    return null;
  }
  
  try {
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    if (isDevelopment) {
      throw new Error('Firebase configuration is invalid. Please check your environment variables.');
    }
    // In production, return null and handle gracefully
    console.warn('⚠️ Firebase app initialization failed in production');
    return null;
  }
};

// Initialize the app
const app = initializeFirebaseApp();

// Initialize Firebase services with null checking
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;

// Initialize Firestore with proper error handling and static initialization
// Fixed initialization pattern to prevent "Cannot access 't' before initialization" error
const initializeFirestoreDatabase = () => {
  if (!app) {
    console.warn('🔥 App not initialized, skipping Firestore setup');
    return null;
  }
  
  try {
    if (isDevelopment && useEmulators && !isSSR) {
      // Development with emulators - use simple Firestore
      console.log('🔥 Firestore initialized for development with emulators');
      return getFirestore(app);
    } else if (isProduction && !isSSR) {
      // Production - use persistent cache for better offline support
      console.log('🔥 Firestore initialized for production with persistent cache');
      return initializeFirestore(app, {
        localCache: persistentLocalCache({
          cacheSizeBytes: CACHE_SIZE_UNLIMITED,
          tabManager: persistentMultipleTabManager()
        }),
        ignoreUndefinedProperties: true
      });
    } else if (!isSSR) {
      // Development without emulators or fallback
      console.log('🔥 Firestore initialized with default configuration');
      return getFirestore(app);
    }
    
    // Return null during SSR
    return null;
  } catch (error) {
    console.error('🔥 Failed to initialize Firestore:', error);
    if (!isSSR && app) {
      console.log('🔥 Falling back to basic Firestore initialization');
      // Fallback to basic Firestore - this prevents the initialization error
      try {
        return getFirestore(app);
      } catch (fallbackError) {
        console.error('🔥 Fallback Firestore initialization also failed:', fallbackError);
        return null;
      }
    }
    return null;
  }
};

// Initialize db with function call to ensure proper initialization order
export const db = initializeFirestoreDatabase();

// Initialize Analytics and Performance (production only with measurement ID)
let analytics: ReturnType<typeof getAnalytics> | null = null;
let performance: ReturnType<typeof getPerformance> | null = null;

if (isProduction && firebaseConfig.measurementId && app && !isSSR) {
  try {
    analytics = getAnalytics(app);
    performance = getPerformance(app);
    console.log('🔥 Analytics and Performance initialized for production');
  } catch (error) {
    console.warn('🔥 Failed to initialize Analytics/Performance:', error);
  }
} else if (!isSSR) {
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
    locale: 'id' // Changed to Indonesian for better localization
  });
}

// Development emulator connections with proper error handling
if (isDevelopment && useEmulators && app && auth && db && storage && !isSSR) {
  const connectToEmulators = async () => {
    try {
      // Check if already connected to avoid connection errors
      // Note: Using unknown instead of any for Firebase internal properties
      if (!(auth as unknown as { _delegate?: { _config?: { emulator?: unknown } } })._delegate?._config?.emulator) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('🔥 Connected to Auth Emulator');
      }

      if (!(db as unknown as { _delegate?: { _databaseId?: { projectId?: string } } })._delegate?._databaseId?.projectId?.includes('localhost')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('🔥 Connected to Firestore Emulator');
      }

      if (!(storage as unknown as { _delegate?: { _host?: string } })._delegate?._host?.includes('localhost')) {
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
} else if (isDevelopment && !isSSR) {
  console.log('🔥 Emulators disabled - using live Firebase services in development');
}

export default app;