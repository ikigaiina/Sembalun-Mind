// Enterprise Sentry Configuration for Sembalun Meditation Platform
// Optimized for 10,000+ concurrent users with advanced error tracking

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const environment = import.meta.env.VITE_APP_ENV || 'development';

// Sentry configuration for enterprise monitoring
export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: environment,
    
    // Release tracking for deployment monitoring
    release: `sembalun@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    
    // Enhanced integrations for comprehensive monitoring
    integrations: [
      // Browser tracing for performance monitoring
      new BrowserTracing({
        // Performance monitoring configuration
        tracingOrigins: [
          'localhost',
          'sembalun.app',
          'sembalun.vercel.app',
          /^\//,  // Same origin
          /^https:\/\/.*\.supabase\.co\//, // Supabase API
        ],
        
        // Route-based transaction names
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
        
        // Custom transaction naming for meditation sessions
        beforeNavigate: (context) => {
          return {
            ...context,
            name: getMeditationTransactionName(context.location.pathname),
          };
        },
      }),
      
      // Replay for debugging (enterprise feature)
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
        maskAllInputs: true,
        // Only capture replays for errors and performance issues
        sessionSampleRate: 0.01, // 1% of sessions
        errorSampleRate: 1.0,    // 100% of error sessions
      }),
    ],
    
    // Performance monitoring configuration
    tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in dev
    
    // Session replay configuration
    replaysSessionSampleRate: isProduction ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Advanced error filtering
    beforeSend: (event, hint) => {
      // Filter out development errors
      if (isDevelopment && event.exception) {
        const error = hint.originalException;
        
        // Skip React DevTools errors
        if (error && error.message && error.message.includes('React DevTools')) {
          return null;
        }
        
        // Skip network timeout errors in development
        if (error && error.message && error.message.includes('timeout')) {
          return null;
        }
      }
      
      // Filter out privacy-sensitive data
      if (event.request && event.request.data) {
        // Remove sensitive form data
        const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth'];
        sensitiveFields.forEach(field => {
          if (event.request.data[field]) {
            event.request.data[field] = '[Filtered]';
          }
        });
      }
      
      // Add meditation-specific context
      if (event.contexts) {
        event.contexts.meditation = getMeditationContext();
      }
      
      return event;
    },
    
    // Enhanced error categorization
    beforeSendTransaction: (event) => {
      // Add meditation session context to transactions
      if (event.transaction && event.transaction.includes('meditation')) {
        event.tags = {
          ...event.tags,
          feature: 'meditation',
          session_type: getMeditationSessionType(),
        };
      }
      
      // Filter out very fast transactions (likely noise)
      if (event.start_timestamp && event.timestamp) {
        const duration = event.timestamp - event.start_timestamp;
        if (duration < 0.01) { // Less than 10ms
          return null;
        }
      }
      
      return event;
    },
    
    // Custom tags for better organization
    initialScope: {
      tags: {
        component: 'frontend',
        platform: 'web',
        app: 'sembalun',
        meditation_platform: true,
      },
      user: {
        id: null, // Will be set after authentication
        email: null,
      },
      extra: {
        buildTime: import.meta.env.VITE_BUILD_TIME,
        commitHash: import.meta.env.VITE_COMMIT_HASH,
      },
    },
    
    // Transport options for high-traffic environments
    transport: Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport),
    
    // Debug configuration
    debug: isDevelopment,
    
    // Advanced configuration for enterprise scale
    maxBreadcrumbs: 50,
    attachStackTrace: true,
    captureUnhandledRejections: true,
    
    // Custom error boundaries
    errorBoundaryOptions: {
      tags: { section: 'error-boundary' },
      showDialog: false, // Handle errors gracefully without user prompts
    },
  });
  
  // Set up custom tags after initialization
  Sentry.setTag('feature', 'core');
  Sentry.setContext('device', {
    isMobile: /Mobi|Android/i.test(navigator.userAgent),
    isPWA: window.matchMedia('(display-mode: standalone)').matches,
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
    } : null,
  });
};

// Helper function to get meditation-specific context
const getMeditationContext = () => {
  try {
    const sessionData = localStorage.getItem('current-meditation-session');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      return {
        session_id: session.id,
        session_type: session.type,
        duration: session.duration,
        progress: session.progress,
      };
    }
  } catch (error) {
    // Ignore parsing errors
  }
  return {};
};

// Helper function to determine meditation session type
const getMeditationSessionType = () => {
  const path = window.location.pathname;
  if (path.includes('guided')) return 'guided';
  if (path.includes('breathing')) return 'breathing';
  if (path.includes('timer')) return 'timer';
  return 'unknown';
};

// Custom transaction naming for better organization
const getMeditationTransactionName = (pathname) => {
  const meditationRoutes = {
    '/meditation': 'Meditation Session',
    '/breathing': 'Breathing Exercise',
    '/meditation/guided': 'Guided Meditation',
    '/meditation/timer': 'Meditation Timer',
    '/analytics': 'Progress Analytics',
    '/courses': 'Meditation Courses',
    '/profile': 'User Profile',
  };
  
  return meditationRoutes[pathname] || pathname;
};

// User context management
export const setSentryUser = (user) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.display_name || user.email?.split('@')[0],
  });
  
  Sentry.setTag('user_type', user.subscription_type || 'free');
  Sentry.setContext('user_preferences', {
    theme: user.preferences?.theme,
    language: user.preferences?.language,
    meditation_level: user.preferences?.meditation?.guidanceLevel,
  });
};

// Meditation session tracking
export const trackMeditationSession = (sessionData) => {
  Sentry.addBreadcrumb({
    message: 'Meditation session started',
    category: 'meditation',
    level: 'info',
    data: {
      type: sessionData.type,
      duration: sessionData.duration,
      timestamp: new Date().toISOString(),
    },
  });
  
  Sentry.setTag('active_session', sessionData.type);
  Sentry.setContext('current_session', sessionData);
};

// Audio playback error tracking
export const trackAudioError = (error, audioFile) => {
  Sentry.captureException(error, {
    tags: {
      component: 'audio-player',
      audio_file: audioFile,
    },
    extra: {
      fileSize: audioFile?.size,
      duration: audioFile?.duration,
      format: audioFile?.format,
    },
  });
};

// Performance measurement helpers
export const measurePerformance = (name, fn) => {
  return Sentry.trace({ name }, fn);
};

// Custom error handling for meditation features
export const handleMeditationError = (error, context = {}) => {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'meditation');
    scope.setContext('meditation_error', context);
    Sentry.captureException(error);
  });
};

// Network error handling
export const handleNetworkError = (error, request) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'network');
    scope.setContext('request', {
      url: request?.url,
      method: request?.method,
      status: request?.status,
    });
    Sentry.captureException(error);
  });
};

// PWA-specific error handling
export const handlePWAError = (error, context) => {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'pwa');
    scope.setTag('pwa_feature', context.feature);
    scope.setContext('pwa_context', context);
    Sentry.captureException(error);
  });
};

// Export configured Sentry for use in components
export { Sentry };