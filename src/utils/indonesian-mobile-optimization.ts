// Indonesian Mobile UX Optimization Utilities
// Optimized for Indonesian mobile patterns and device characteristics

interface DeviceCapabilities {
  screenSize: 'small' | 'medium' | 'large';
  ram: 'low' | 'medium' | 'high';
  connection: 'slow' | 'medium' | 'fast';
  batteryLevel?: number;
  isLowEndDevice: boolean;
}

interface IndonesianMobileSettings {
  reduceAnimations: boolean;
  optimizeImages: boolean;
  enableOfflineMode: boolean;
  reduceBandwidth: boolean;
  simplifyUI: boolean;
  enableBatterySaving: boolean;
  preferWhatsAppPatterns: boolean;
}

// Common Indonesian mobile device patterns
const INDONESIAN_DEVICE_PATTERNS = {
  // Most common screen sizes in Indonesia (2024 data)
  commonScreenSizes: {
    '5.0-5.5': 35, // percentage of users
    '5.5-6.0': 40,
    '6.0-6.5': 20,
    '6.5+': 5
  },
  
  // Network patterns
  commonConnections: {
    '3G': 25,
    '4G': 65,
    'WiFi': 35, // overlapping usage
    'limited-data': 45 // users with data limits
  },
  
  // Device capabilities (budget to flagship ratio)
  deviceTiers: {
    'budget': 60, // <$200 USD
    'mid-range': 30, // $200-500 USD  
    'flagship': 10 // >$500 USD
  }
};

export class IndonesianMobileOptimizer {
  private deviceCapabilities: DeviceCapabilities;
  private settings: IndonesianMobileSettings;
  
  constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.settings = this.getOptimalSettings();
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const screen = window.screen;
    const connection = (navigator as any).connection || (navigator as any).mozConnection;
    
    // Detect screen size category
    const screenSize = this.getScreenSizeCategory(screen.width, screen.height);
    
    // Detect RAM (approximate)
    const ram = this.detectRAMCategory();
    
    // Detect connection speed
    const connectionSpeed = this.detectConnectionSpeed(connection);
    
    // Detect if it's likely a low-end device
    const isLowEndDevice = this.isLowEndDevice();
    
    // Battery level if available
    const batteryLevel = this.getBatteryLevel();
    
    return {
      screenSize,
      ram,
      connection: connectionSpeed,
      batteryLevel,
      isLowEndDevice
    };
  }

  private getScreenSizeCategory(width: number, height: number): 'small' | 'medium' | 'large' {
    const diagonal = Math.sqrt(width * width + height * height) / window.devicePixelRatio;
    
    if (diagonal < 400) return 'small'; // ~5 inches
    if (diagonal < 500) return 'medium'; // ~6 inches
    return 'large'; // >6 inches
  }

  private detectRAMCategory(): 'low' | 'medium' | 'high' {
    // Approximate RAM detection based on device capabilities
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const isLowEnd = this.isLowEndDevice();
    
    if (isLowEnd || hardwareConcurrency <= 2) return 'low';
    if (hardwareConcurrency <= 4) return 'medium';
    return 'high';
  }

  private detectConnectionSpeed(connection: any): 'slow' | 'medium' | 'fast' {
    if (!connection) return 'medium';
    
    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g' || (downlink && downlink < 1.5)) return 'slow';
    if (effectiveType === '4g' && downlink > 5) return 'fast';
    
    return 'medium';
  }

  private isLowEndDevice(): boolean {
    // Heuristics for low-end device detection
    const userAgent = navigator.userAgent.toLowerCase();
    const memory = (navigator as any).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    
    // Known low-end indicators
    const lowEndIndicators = [
      memory && memory <= 2, // 2GB RAM or less
      hardwareConcurrency <= 2, // Single or dual core
      userAgent.includes('android 8') || userAgent.includes('android 7'), // Older Android
      userAgent.includes('webview'), // WebView usually means low-end
      !('serviceWorker' in navigator), // Basic feature support
    ];
    
    return lowEndIndicators.filter(Boolean).length >= 2;
  }

  private getBatteryLevel(): number | undefined {
    // Battery API is deprecated but still available in some browsers
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        return battery.level * 100;
      });
    }
    return undefined;
  }

  private getOptimalSettings(): IndonesianMobileSettings {
    const { isLowEndDevice, connection, ram, batteryLevel } = this.deviceCapabilities;
    
    return {
      reduceAnimations: isLowEndDevice || ram === 'low' || (batteryLevel && batteryLevel < 20),
      optimizeImages: connection === 'slow' || isLowEndDevice,
      enableOfflineMode: connection === 'slow',
      reduceBandwidth: connection === 'slow' || connection === 'medium',
      simplifyUI: isLowEndDevice || ram === 'low',
      enableBatterySaving: batteryLevel ? batteryLevel < 30 : false,
      preferWhatsAppPatterns: true // Indonesian users are very familiar with WhatsApp UX
    };
  }

  // Get CSS classes for optimization
  getCSSOptimizations(): string[] {
    const classes: string[] = [];
    
    if (this.settings.reduceAnimations) {
      classes.push('reduce-motion', 'disable-parallax');
    }
    
    if (this.settings.simplifyUI) {
      classes.push('simplified-ui', 'minimal-shadows', 'reduced-gradients');
    }
    
    if (this.deviceCapabilities.screenSize === 'small') {
      classes.push('compact-layout', 'large-touch-targets');
    }
    
    if (this.settings.preferWhatsAppPatterns) {
      classes.push('whatsapp-style-nav', 'familiar-interactions');
    }
    
    return classes;
  }

  // Get animation preferences
  getAnimationConfig() {
    if (this.settings.reduceAnimations) {
      return {
        duration: 0.15, // Faster animations
        easing: 'ease-out',
        enableParallax: false,
        enableComplexTransitions: false,
        staggerDelay: 0.05 // Minimal stagger
      };
    }
    
    return {
      duration: 0.3, // Normal animations
      easing: 'ease-out',
      enableParallax: true,
      enableComplexTransitions: true,
      staggerDelay: 0.1
    };
  }

  // Get image optimization settings
  getImageConfig() {
    return {
      quality: this.settings.optimizeImages ? 70 : 90,
      format: this.settings.optimizeImages ? 'webp' : 'auto',
      lazy: true,
      placeholder: this.settings.optimizeImages ? 'blur' : 'none',
      sizes: {
        small: this.deviceCapabilities.screenSize === 'small' ? 320 : 480,
        medium: this.deviceCapabilities.screenSize === 'small' ? 480 : 768,
        large: this.deviceCapabilities.screenSize === 'small' ? 640 : 1024
      }
    };
  }

  // Get touch interaction settings optimized for Indonesian users
  getTouchConfig() {
    return {
      minTouchTarget: 48, // 48dp minimum (accessibility + thumb-friendly)
      tapDelay: 0, // Remove 300ms delay
      swipeThreshold: 50, // Easier swiping
      longPressDelay: 500, // Familiar with WhatsApp long-press
      enableFastClick: true,
      preferredGestures: [
        'tap', 
        'swipe-right-back', // Android-style back
        'long-press-menu', // WhatsApp-style
        'pull-to-refresh'
      ]
    };
  }

  // Get offline/PWA configuration
  getOfflineConfig() {
    return {
      enableServiceWorker: true,
      cacheStrategy: this.settings.enableOfflineMode ? 'cache-first' : 'network-first',
      offlinePages: [
        '/', 
        '/meditation', 
        '/breathing',
        '/dashboard'
      ],
      offlineAssets: this.settings.enableOfflineMode ? [
        'essential-audio',
        'core-images',
        'basic-animations'
      ] : [],
      backgroundSync: this.settings.enableOfflineMode
    };
  }

  // Get Indonesian-specific UI preferences
  getUIPreferences() {
    return {
      layout: this.settings.simplifyUI ? 'simple' : 'detailed',
      navigation: {
        style: 'bottom-tabs', // Familiar from Indonesian mobile apps
        backgroundColor: '#FFFFFF',
        activeColor: '#25D366', // WhatsApp green - familiar color
        showLabels: true // Indonesian users prefer labeled navigation
      },
      typography: {
        scale: this.deviceCapabilities.screenSize === 'small' ? 0.9 : 1.0,
        lineHeight: 1.6, // Better for Indonesian text readability
        fontWeight: 'normal' // Don't use thin fonts on low-end devices
      },
      spacing: {
        base: this.deviceCapabilities.screenSize === 'small' ? 12 : 16,
        touch: 48, // Minimum touch target size
        comfortable: true // Generous padding for thumb navigation
      }
    };
  }

  // Indonesian cultural UX patterns
  getCulturalUXPatterns() {
    return {
      greetings: {
        useTimeBasedGreeting: true, // "Selamat pagi" vs "Selamat malam"
        includeCulturalContext: true, // Regional greetings
        showRespect: true // Formal language for religious content
      },
      interactions: {
        confirmationStyle: 'polite', // "Baik, terima kasih" vs "OK"
        errorHandling: 'apologetic', // "Maaf, ada masalah" vs "Error"
        successFeedback: 'grateful', // "Terima kasih" in success messages
      },
      contentLayout: {
        readingPattern: 'left-to-right',
        scanPattern: 'F-pattern', // Familiar web reading pattern
        prioritizeImages: true, // Visual culture
        useWhitespace: 'comfortable' // Don't overcrowd
      },
      trust: {
        showUserCount: true, // Social proof important in Indonesian culture
        useLocalTestimonials: true, // Indonesian names and contexts
        displayCertifications: true, // Trust signals
        familyFriendlyIndicators: true
      }
    };
  }

  // Performance budget for Indonesian mobile devices
  getPerformanceBudget() {
    const budgets = {
      low: {
        jsBundle: 150, // KB
        cssBundle: 50,
        images: 500,
        fonts: 50,
        totalPageWeight: 1000,
        timeToInteractive: 5000 // ms
      },
      medium: {
        jsBundle: 300,
        cssBundle: 100,
        images: 1000,
        fonts: 100,
        totalPageWeight: 2000,
        timeToInteractive: 3000
      },
      high: {
        jsBundle: 500,
        cssBundle: 150,
        images: 2000,
        fonts: 150,
        totalPageWeight: 3500,
        timeToInteractive: 2000
      }
    };

    const tier = this.deviceCapabilities.isLowEndDevice ? 'low' : 
                 this.deviceCapabilities.ram === 'high' ? 'high' : 'medium';
    
    return budgets[tier];
  }
}

// Utility functions for Indonesian mobile optimization

export const getIndonesianNumberFormat = (number: number): string => {
  return new Intl.NumberFormat('id-ID').format(number);
};

export const getIndonesianDateFormat = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const getIndonesianTimeFormat = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Indonesia uses 24-hour format
  }).format(date);
};

// Indonesian-specific validation patterns
export const indonesianValidation = {
  phoneNumber: /^(\+62|62|0)[\d\s\-]{8,13}$/,
  postalCode: /^\d{5}$/,
  nik: /^\d{16}$/, // Indonesian National ID
  currency: /^[Rp\.\d\,\s]+$/
};

// Common Indonesian mobile UI constants
export const INDONESIAN_UI_CONSTANTS = {
  colors: {
    success: '#25D366', // WhatsApp green
    warning: '#FFB020', // Indonesian-friendly orange
    error: '#E74C3C', // Clear red
    primary: '#2E7D32', // Nature green
    secondary: '#1976D2' // Indonesian blue
  },
  
  spacing: {
    touchTarget: 48, // Minimum touch target
    comfortable: 16, // Standard padding
    compact: 12, // Tight spaces
    generous: 24 // Relaxed layout
  },
  
  timing: {
    fastTap: 150, // Quick feedback
    normalTap: 300, // Standard interaction
    longPress: 500, // WhatsApp-style
    animation: 300 // Smooth but not slow
  },
  
  breakpoints: {
    small: 360, // Budget phone
    medium: 414, // Standard phone  
    large: 768, // Large phone/small tablet
    xlarge: 1024 // Tablet
  }
};

// Export singleton instance
export const indonesianMobileOptimizer = new IndonesianMobileOptimizer();

export default IndonesianMobileOptimizer;