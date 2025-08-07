// DataDog RUM (Real User Monitoring) Configuration for Sembalun
// Enterprise monitoring for 10,000+ concurrent users

import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const environment = import.meta.env.VITE_APP_ENV || 'development';

// DataDog RUM initialization for comprehensive monitoring
export const initDataDog = () => {
  // Initialize RUM (Real User Monitoring)
  datadogRum.init({
    applicationId: import.meta.env.VITE_DATADOG_APPLICATION_ID,
    clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'sembalun-meditation-app',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    env: environment,
    
    // Session configuration for high-traffic enterprise app
    sessionSampleRate: isProduction ? 20 : 100, // 20% in prod, 100% in dev
    sessionReplaySampleRate: isProduction ? 5 : 20, // 5% in prod, 20% in dev
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    
    // Default privacy level for sensitive meditation data
    defaultPrivacyLevel: 'mask-user-input',
    
    // Custom global context for meditation app
    globalContextManager: {
      get: () => ({
        // App-specific context
        app_type: 'meditation_platform',
        platform: 'web',
        pwa_mode: window.matchMedia('(display-mode: standalone)').matches,
        
        // Device context
        device_type: getMobileDeviceType(),
        connection_type: getConnectionType(),
        
        // Meditation-specific context
        meditation_features: getMeditationFeatures(),
      }),
    },
    
    // Advanced configuration
    beforeSend: (event, context) => {
      // Filter sensitive information
      if (event.type === 'action' && context?.actionName?.includes('password')) {
        return false; // Don't send password-related actions
      }
      
      // Add meditation session context
      if (getCurrentMeditationSession()) {
        event.meditation_session = getCurrentMeditationSession();
      }
      
      return event;
    },
    
    // Allowed tracking origins for CORS
    allowedTracingUrls: [
      'https://sembalun.app',
      'https://sembalun.vercel.app',
      /^https:\/\/.*\.supabase\.co\//,
      /^https:\/\/api\.openai\.com\//,
    ],
    
    // Resource tracking configuration
    trackingConsent: 'granted',
    compressIntakeRequests: true,
  });

  // Initialize Logs collection
  datadogLogs.init({
    clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'sembalun-meditation-app',
    env: environment,
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // Log configuration
    forwardErrorsToLogs: true,
    forwardConsoleLogs: ['error', 'warn'],
    forwardReports: ['intervention', 'deprecation', 'csp_violation'],
    sampleRate: isProduction ? 10 : 100,
    
    // Privacy settings
    beforeSend: (log) => {
      // Remove sensitive data from logs
      if (log.message && typeof log.message === 'string') {
        // Mask potential tokens or sensitive data
        log.message = log.message.replace(
          /token[\"':\s]*[\"']([^\"']+)[\"']/gi,
          'token: "[REDACTED]"'
        );
        log.message = log.message.replace(
          /password[\"':\s]*[\"']([^\"']+)[\"']/gi,
          'password: "[REDACTED]"'
        );
      }
      return log;
    },
  });

  // Set initial user context (will be updated after authentication)
  datadogRum.setGlobalContextProperty('user.subscription', 'anonymous');
  
  console.log('📊 DataDog monitoring initialized for Sembalun');
};

// User context management
export const setDataDogUser = (user) => {
  datadogRum.setUser({
    id: user.id,
    name: user.display_name || user.email?.split('@')[0],
    email: user.email,
    subscription: user.subscription_type || 'free',
    meditation_level: user.preferences?.meditation?.guidanceLevel || 'beginner',
  });
  
  // Set user-specific global context
  datadogRum.setGlobalContextProperty('user.meditation_preferences', {
    default_duration: user.preferences?.meditation?.defaultDuration,
    preferred_voice: user.preferences?.meditation?.preferredVoice,
    background_sounds: user.preferences?.meditation?.backgroundSounds,
    guidance_level: user.preferences?.meditation?.guidanceLevel,
  });
  
  datadogRum.setGlobalContextProperty('user.device_preferences', {
    theme: user.preferences?.theme,
    language: user.preferences?.language,
    notifications: user.preferences?.notifications?.daily,
  });
};

// Meditation session tracking
export const trackMeditationSessionStart = (sessionData) => {
  datadogRum.addAction('meditation.session.start', {
    session_type: sessionData.type,
    duration_minutes: sessionData.duration,
    voice_guide: sessionData.voiceGuide,
    background_sound: sessionData.backgroundSound,
    custom_session: sessionData.isCustom || false,
  });
  
  // Set session context for subsequent events
  datadogRum.setGlobalContextProperty('current_meditation', {
    session_id: sessionData.id,
    type: sessionData.type,
    started_at: new Date().toISOString(),
    duration_planned: sessionData.duration,
  });
  
  console.log('🧘 Meditation session started:', sessionData.type);
};

export const trackMeditationSessionComplete = (sessionData, completionData) => {
  datadogRum.addAction('meditation.session.complete', {
    session_id: sessionData.id,
    session_type: sessionData.type,
    planned_duration: sessionData.duration,
    actual_duration: completionData.actualDuration,
    completion_rate: completionData.completionRate,
    interruptions: completionData.interruptions || 0,
    user_rating: completionData.userRating,
  });
  
  // Measure session performance
  datadogRum.addTiming('meditation.session.duration', completionData.actualDuration * 1000);
  
  // Clear session context
  datadogRum.removeGlobalContextProperty('current_meditation');
  
  console.log('✅ Meditation session completed:', completionData);
};

// Audio performance tracking
export const trackAudioPerformance = (audioData) => {
  datadogRum.addTiming('audio.load_time', audioData.loadTime);
  datadogRum.addTiming('audio.buffer_time', audioData.bufferTime);
  
  if (audioData.error) {
    datadogRum.addError(audioData.error, {
      audio_file: audioData.fileName,
      file_size: audioData.fileSize,
      duration: audioData.duration,
      error_type: 'audio_playback',
    });
  }
  
  datadogRum.addAction('audio.playback', {
    file_name: audioData.fileName,
    file_size: audioData.fileSize,
    duration: audioData.duration,
    quality: audioData.quality,
    cached: audioData.fromCache || false,
  });
};

// PWA performance tracking
export const trackPWAMetrics = (pwaData) => {
  datadogRum.addAction('pwa.install', {
    prompt_shown: pwaData.promptShown,
    user_choice: pwaData.userChoice,
    install_source: pwaData.installSource,
  });
  
  if (pwaData.serviceWorkerUpdate) {
    datadogRum.addAction('pwa.service_worker.update', {
      previous_version: pwaData.previousVersion,
      new_version: pwaData.newVersion,
      update_size: pwaData.updateSize,
    });
  }
};

// Network performance tracking
export const trackNetworkMetrics = (networkData) => {
  datadogRum.addAction('network.request', {
    endpoint: networkData.endpoint,
    method: networkData.method,
    status_code: networkData.statusCode,
    response_time: networkData.responseTime,
    payload_size: networkData.payloadSize,
    cached: networkData.fromCache || false,
  });
  
  if (networkData.error) {
    datadogRum.addError(networkData.error, {
      endpoint: networkData.endpoint,
      error_type: 'network',
      retry_count: networkData.retryCount || 0,
    });
  }
};

// User engagement tracking
export const trackUserEngagement = (engagementData) => {
  datadogRum.addAction('user.engagement', {
    feature: engagementData.feature,
    action: engagementData.action,
    session_duration: engagementData.sessionDuration,
    page_views: engagementData.pageViews,
    meditation_sessions: engagementData.meditationSessions,
  });
};

// Performance monitoring helpers
export const measureCustomTiming = (name, startTime) => {
  const duration = Date.now() - startTime;
  datadogRum.addTiming(name, duration);
  return duration;
};

// Custom logging for meditation app
export const logMeditationEvent = (level, message, context = {}) => {
  datadogLogs.logger.log(message, {
    level,
    meditation_context: true,
    ...context,
  });
};

// Error handling with context
export const reportError = (error, context = {}) => {
  datadogRum.addError(error, {
    error_category: 'application',
    meditation_feature: true,
    ...context,
  });
  
  datadogLogs.logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    ...context,
  });
};

// Helper functions
const getMobileDeviceType = () => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows Phone/.test(ua)) return 'windows_phone';
  return /Mobi/.test(ua) ? 'mobile_other' : 'desktop';
};

const getConnectionType = () => {
  if ('connection' in navigator) {
    const conn = navigator.connection;
    return {
      effective_type: conn.effectiveType,
      downlink: conn.downlink,
      rtt: conn.rtt,
      save_data: conn.saveData,
    };
  }
  return null;
};

const getMeditationFeatures = () => {
  return {
    offline_capable: 'serviceWorker' in navigator,
    audio_support: !!(window.Audio && window.Audio.prototype.play),
    notification_support: 'Notification' in window,
    vibration_support: 'vibrate' in navigator,
    fullscreen_support: !!(document.fullscreenEnabled || document.webkitFullscreenEnabled),
  };
};

const getCurrentMeditationSession = () => {
  try {
    const sessionData = localStorage.getItem('current-meditation-session');
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    return null;
  }
};

// Export for use in components
export { datadogRum, datadogLogs };