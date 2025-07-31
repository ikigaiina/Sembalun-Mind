declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface AnalyticsEvent {
  event_name: string;
  event_category?: string;
  event_label?: string;
  value?: number;
}

class Analytics {
  private enabled: boolean;
  private gtmId: string | null;

  constructor() {
    this.enabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    this.gtmId = import.meta.env.VITE_GTM_ID || null;
    this.init();
  }

  private init() {
    if (!this.enabled || !this.gtmId) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gtmId}`;
    document.head.appendChild(script);

    window.gtag = function() {
      // @ts-ignore
      window.dataLayer = window.dataLayer || [];
      // @ts-ignore
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.gtmId, {
      app_name: 'Sembalun',
      app_version: import.meta.env.VITE_APP_VERSION || '1.0.0'
    });
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.enabled || !window.gtag) return;

    window.gtag('event', event.event_name, {
      event_category: event.event_category,
      event_label: event.event_label,
      value: event.value
    });
  }

  trackPageView(page_title: string, page_location: string) {
    if (!this.enabled || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_title,
      page_location
    });
  }

  trackMeditationSession(duration: number, type: string) {
    this.trackEvent({
      event_name: 'meditation_session',
      event_category: 'engagement',
      event_label: type,
      value: duration
    });
  }

  trackBreathingSession(duration: number, pattern: string) {
    this.trackEvent({
      event_name: 'breathing_session',
      event_category: 'engagement', 
      event_label: pattern,
      value: duration
    });
  }

  trackFeatureUsage(feature: string) {
    this.trackEvent({
      event_name: 'feature_usage',
      event_category: 'interaction',
      event_label: feature
    });
  }
}

export const analytics = new Analytics();