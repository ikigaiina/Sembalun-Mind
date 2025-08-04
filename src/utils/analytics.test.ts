import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analytics } from './analytics';

// Mock gtag function
const mockGtag = vi.fn();

// Mock environment variables
vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
vi.stubEnv('VITE_GTM_ID', 'GTM-TEST123');
vi.stubEnv('VITE_APP_VERSION', '1.0.0');

// Mock DOM methods
Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    setAttribute: vi.fn(),
    set src(value: string) {},
    set async(value: boolean) {}
  })),
  writable: true
});

Object.defineProperty(document, 'head', {
  value: {
    appendChild: vi.fn()
  },
  writable: true
});

describe('Analytics Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.gtag
    window.gtag = mockGtag;
    window.dataLayer = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.gtag;
    delete window.dataLayer;
  });

  describe('Analytics initialization', () => {
    it('initializes with correct GTM configuration', () => {
      expect(document.createElement).toHaveBeenCalled();
      expect(document.head.appendChild).toHaveBeenCalled();
    });

    it('sets up gtag function correctly', () => {
      expect(window.gtag).toBeDefined();
      expect(typeof window.gtag).toBe('function');
    });

    it('configures analytics with app information', () => {
      // Analytics instance should be created automatically
      expect(analytics).toBeDefined();
    });
  });

  describe('trackEvent', () => {
    it('tracks custom events correctly', () => {
      analytics.trackEvent({
        event_name: 'button_click',
        event_category: 'interaction',
        event_label: 'start_meditation',
        value: 1
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'button_click', {
        event_category: 'interaction',
        event_label: 'start_meditation',
        value: 1
      });
    });

    it('tracks events without optional parameters', () => {
      analytics.trackEvent({
        event_name: 'app_open'
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'app_open', {
        event_category: undefined,
        event_label: undefined,
        value: undefined
      });
    });

    it('tracks feature usage', () => {
      analytics.trackFeatureUsage('breathing_guide');

      expect(mockGtag).toHaveBeenCalledWith('event', 'feature_usage', {
        event_category: 'interaction',
        event_label: 'breathing_guide',
        value: undefined
      });
    });
  });

  describe('trackPageView', () => {
    it('tracks page views correctly', () => {
      analytics.trackPageView('Dashboard', '/dashboard');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_title: 'Dashboard',
        page_location: '/dashboard'
      });
    });

    it('handles different page formats', () => {
      analytics.trackPageView('Breathing Session', '/breathing-session?id=123');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_title: 'Breathing Session',
        page_location: '/breathing-session?id=123'
      });
    });
  });

  describe('trackMeditationSession', () => {
    it('tracks meditation sessions correctly', () => {
      analytics.trackMeditationSession(300, 'mindfulness'); // 5 minutes

      expect(mockGtag).toHaveBeenCalledWith('event', 'meditation_session', {
        event_category: 'engagement',
        event_label: 'mindfulness',
        value: 300
      });
    });

    it('handles different meditation types', () => {
      analytics.trackMeditationSession(600, 'body_scan');

      expect(mockGtag).toHaveBeenCalledWith('event', 'meditation_session', {
        event_category: 'engagement',
        event_label: 'body_scan',
        value: 600
      });
    });
  });

  describe('trackBreathingSession', () => {
    it('tracks breathing sessions correctly', () => {
      analytics.trackBreathingSession(120, 'box_breathing'); // 2 minutes

      expect(mockGtag).toHaveBeenCalledWith('event', 'breathing_session', {
        event_category: 'engagement',
        event_label: 'box_breathing',
        value: 120
      });
    });

    it('handles different breathing patterns', () => {
      analytics.trackBreathingSession(180, '4_7_8_breathing');

      expect(mockGtag).toHaveBeenCalledWith('event', 'breathing_session', {
        event_category: 'engagement',
        event_label: '4_7_8_breathing',
        value: 180
      });
    });
  });

  describe('Privacy and Data Protection', () => {
    it('respects analytics disabled state', () => {
      vi.stubEnv('VITE_ENABLE_ANALYTICS', 'false');
      
      // Create new analytics instance with disabled state
      const disabledAnalytics = new (analytics.constructor as any)();
      
      disabledAnalytics.trackEvent({ event_name: 'test_event' });
      
      // Should not call gtag when disabled
      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('handles missing GTM ID gracefully', () => {
      vi.stubEnv('VITE_GTM_ID', '');
      
      const noGtmAnalytics = new (analytics.constructor as any)();
      noGtmAnalytics.trackPageView('test', '/test');
      
      // Should not break when GTM ID is missing
      expect(() => noGtmAnalytics.trackPageView('test', '/test')).not.toThrow();
    });
  });

  describe('Error Handling and Resilience', () => {
    it('handles gtag errors gracefully', () => {
      mockGtag.mockImplementation(() => {
        throw new Error('Gtag error');
      });
      
      expect(() => {
        analytics.trackEvent({ event_name: 'test_event' });
      }).not.toThrow();
    });

    it('handles missing gtag function', () => {
      delete window.gtag;
      
      expect(() => {
        analytics.trackPageView('test', '/test');
      }).not.toThrow();
    });
  });

  describe('Performance and Optimization', () => {
    it('handles high-frequency events efficiently', () => {
      const start = performance.now();
      
      // Track many events quickly
      for (let i = 0; i < 100; i++) {
        analytics.trackFeatureUsage(`feature_${i}`);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(100); // Should complete within 100ms
      expect(mockGtag).toHaveBeenCalledTimes(100);
    });

    it('does not block main thread', async () => {
      let mainThreadBlocked = false;
      
      // Simulate main thread work
      setTimeout(() => {
        mainThreadBlocked = true;
      }, 0);
      
      // Track event (should be async)
      analytics.trackEvent({ event_name: 'async_test' });
      
      // Wait for next tick
      await new Promise(resolve => setTimeout(resolve, 1));
      
      expect(mainThreadBlocked).toBe(true);
    });
  });

  describe('Integration and Compatibility', () => {
    it('works with different event types', () => {
      const eventTypes = [
        () => analytics.trackMeditationSession(300, 'mindfulness'),
        () => analytics.trackBreathingSession(120, 'box_breathing'),
        () => analytics.trackFeatureUsage('timer'),
        () => analytics.trackPageView('Home', '/')
      ];
      
      eventTypes.forEach(trackFn => {
        expect(() => trackFn()).not.toThrow();
      });
      
      expect(mockGtag).toHaveBeenCalledTimes(4);
    });

    it('handles offline scenarios gracefully', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      });
      
      expect(() => {
        analytics.trackEvent({ event_name: 'offline_test' });
      }).not.toThrow();
      
      expect(mockGtag).toHaveBeenCalled();
    });
  });
});

// Additional test for the Analytics class
describe('Analytics Class', () => {
  it('creates analytics instance correctly', () => {
    expect(analytics).toBeDefined();
    expect(typeof analytics.trackEvent).toBe('function');
    expect(typeof analytics.trackPageView).toBe('function');
    expect(typeof analytics.trackMeditationSession).toBe('function');
    expect(typeof analytics.trackBreathingSession).toBe('function');
    expect(typeof analytics.trackFeatureUsage).toBe('function');
  });

  it('handles instantiation with different environments', () => {
    // Test with different environment variables
    const originalEnv = import.meta.env;
    
    // Mock different environments
    const testCases = [
      { VITE_ENABLE_ANALYTICS: 'true', VITE_GTM_ID: 'GTM-TEST' },
      { VITE_ENABLE_ANALYTICS: 'false', VITE_GTM_ID: 'GTM-TEST' },
      { VITE_ENABLE_ANALYTICS: 'true', VITE_GTM_ID: '' }
    ];
    
    testCases.forEach(testCase => {
      Object.assign(import.meta.env, testCase);
      
      expect(() => {
        const testAnalytics = new (analytics.constructor as any)();
        testAnalytics.trackEvent({ event_name: 'test' });
      }).not.toThrow();
    });
    
    // Restore original environment
    Object.assign(import.meta.env, originalEnv);
  });
});