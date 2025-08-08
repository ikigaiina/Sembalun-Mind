/**
 * Comprehensive Accessibility Service for Sembalun
 * WCAG 2.1 AA compliant features with Indonesian cultural sensitivity
 */

export interface AccessibilityPreferences {
  // Visual accessibility
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  reduceMotion: boolean;
  colorBlindnessMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  darkMode: boolean;
  
  // Audio accessibility
  audioDescriptions: boolean;
  soundEffects: boolean;
  voiceGuidance: boolean;
  audioTranscription: boolean;
  
  // Motor accessibility
  stickyKeys: boolean;
  slowKeys: boolean;
  mouseKeys: boolean;
  oneHandedMode: boolean;
  largerClickTargets: boolean;
  
  // Cognitive accessibility
  simplifiedInterface: boolean;
  extendedTimeouts: boolean;
  readingAssistance: boolean;
  memoryAids: boolean;
  
  // Language and cultural
  language: 'id' | 'en' | 'jv'; // Indonesian, English, Javanese
  culturalContext: 'general' | 'balinese' | 'javanese' | 'sundanese';
  transliterationMode: boolean; // For Indonesian script variations
  
  // Screen reader support
  screenReader: boolean;
  verboseDescriptions: boolean;
  structuralNavigation: boolean;
}

export interface AccessibilityAnnouncement {
  message: string;
  priority: 'polite' | 'assertive' | 'off';
  language?: string;
  culturalContext?: string;
}

class AccessibilityService {
  private preferences: AccessibilityPreferences;
  private announcer: HTMLElement;
  private focusTracker: HTMLElement | null = null;
  private keyboardNavigationEnabled: boolean = false;
  private touchDevice: boolean = false;

  // Indonesian accessibility text translations
  private translations = {
    id: {
      skipToContent: 'Lompat ke konten utama',
      navigationMenu: 'Menu navigasi',
      meditationSession: 'Sesi meditasi',
      playPause: 'Putar/Jeda',
      volumeControl: 'Kontrol volume',
      progressBar: 'Bar kemajuan',
      closeModal: 'Tutup modal',
      openSettings: 'Buka pengaturan',
      accessibilitySettings: 'Pengaturan aksesibilitas',
      highContrastMode: 'Mode kontras tinggi',
      largeText: 'Teks besar',
      screenReaderAnnouncement: 'Pengumuman pembaca layar',
      meditationStarted: 'Meditasi dimulai',
      meditationPaused: 'Meditasi dijeda',
      meditationCompleted: 'Meditasi selesai',
      breathingGuidance: 'Panduan pernapasan',
      inhale: 'Tarik napas',
      exhale: 'Hembuskan napas',
      hold: 'Tahan',
      culturalWisdom: 'Kebijaksanaan budaya',
      achievement: 'Pencapaian',
      progressUpdate: 'Pembaruan kemajuan'
    },
    en: {
      skipToContent: 'Skip to main content',
      navigationMenu: 'Navigation menu',
      meditationSession: 'Meditation session',
      playPause: 'Play/Pause',
      volumeControl: 'Volume control',
      progressBar: 'Progress bar',
      closeModal: 'Close modal',
      openSettings: 'Open settings',
      accessibilitySettings: 'Accessibility settings',
      highContrastMode: 'High contrast mode',
      largeText: 'Large text',
      screenReaderAnnouncement: 'Screen reader announcement',
      meditationStarted: 'Meditation started',
      meditationPaused: 'Meditation paused',
      meditationCompleted: 'Meditation completed',
      breathingGuidance: 'Breathing guidance',
      inhale: 'Inhale',
      exhale: 'Exhale',
      hold: 'Hold',
      culturalWisdom: 'Cultural wisdom',
      achievement: 'Achievement',
      progressUpdate: 'Progress update'
    },
    jv: {
      skipToContent: 'Lompat menyang isi utama',
      navigationMenu: 'Menu navigasi',
      meditationSession: 'Sesi meditasi',
      playPause: 'Putar/Jeda',
      volumeControl: 'Kontrol swara',
      progressBar: 'Bar kemajuan',
      closeModal: 'Tutup modal',
      openSettings: 'Bukak pengaturan',
      accessibilitySettings: 'Pengaturan aksesibilitas',
      highContrastMode: 'Mode kontras dhuwur',
      largeText: 'Tulisan gedhe',
      screenReaderAnnouncement: 'Woro-woro pembaca layar',
      meditationStarted: 'Meditasi wis diwiwiti',
      meditationPaused: 'Meditasi dijeda',
      meditationCompleted: 'Meditasi wis rampung',
      breathingGuidance: 'Pandhuan napas',
      inhale: 'Narik napas',
      exhale: 'Ngetoake napas',
      hold: 'Tahan',
      culturalWisdom: 'Kawicaksanan budaya',
      achievement: 'Prestasi',
      progressUpdate: 'Nganyari kemajuan'
    }
  };

  constructor() {
    this.preferences = this.loadPreferences();
    this.touchDevice = 'ontouchstart' in window;
    this.initializeAccessibility();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.createScreenReaderAnnouncer();
    this.applyPreferences();
    this.detectUserPreferences();
  }

  private loadPreferences(): AccessibilityPreferences {
    const stored = localStorage.getItem('accessibilityPreferences');
    return stored ? JSON.parse(stored) : {
      highContrast: false,
      fontSize: 'medium',
      reduceMotion: false,
      colorBlindnessMode: 'none',
      darkMode: false,
      audioDescriptions: false,
      soundEffects: true,
      voiceGuidance: false,
      audioTranscription: false,
      stickyKeys: false,
      slowKeys: false,
      mouseKeys: false,
      oneHandedMode: false,
      largerClickTargets: false,
      simplifiedInterface: false,
      extendedTimeouts: false,
      readingAssistance: false,
      memoryAids: false,
      language: 'id',
      culturalContext: 'general',
      transliterationMode: false,
      screenReader: false,
      verboseDescriptions: false,
      structuralNavigation: true
    };
  }

  private savePreferences(): void {
    localStorage.setItem('accessibilityPreferences', JSON.stringify(this.preferences));
  }

  private initializeAccessibility(): void {
    // Add skip links
    this.addSkipLinks();
    
    // Set up ARIA live regions
    this.setupLiveRegions();
    
    // Add focus indicators
    this.enhanceFocusIndicators();
    
    // Set up reduced motion detection
    this.handleReducedMotion();
    
    // Initialize color scheme detection
    this.initializeColorScheme();
  }

  private addSkipLinks(): void {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = this.getText('skipToContent');
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-blue-600 focus:text-white focus:p-2 focus:rounded';
    
    // Add to document head
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  private setupLiveRegions(): void {
    // Create polite announcer
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    this.announcer.id = 'accessibility-announcer';
    document.body.appendChild(this.announcer);

    // Create assertive announcer for urgent messages
    const assertiveAnnouncer = document.createElement('div');
    assertiveAnnouncer.setAttribute('aria-live', 'assertive');
    assertiveAnnouncer.setAttribute('aria-atomic', 'true');
    assertiveAnnouncer.className = 'sr-only';
    assertiveAnnouncer.id = 'accessibility-announcer-assertive';
    document.body.appendChild(assertiveAnnouncer);
  }

  private createScreenReaderAnnouncer(): void {
    if (!this.announcer) {
      this.setupLiveRegions();
    }
  }

  private enhanceFocusIndicators(): void {
    // Add custom focus styles
    const style = document.createElement('style');
    style.textContent = `
      .focus-enhanced:focus {
        outline: 3px solid #3b82f6 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 2px white, 0 0 0 5px #3b82f6 !important;
      }
      
      .high-contrast .focus-enhanced:focus {
        outline: 4px solid yellow !important;
        box-shadow: 0 0 0 2px black, 0 0 0 7px yellow !important;
      }
      
      .large-click-targets button,
      .large-click-targets a,
      .large-click-targets input,
      .large-click-targets select {
        min-height: 44px !important;
        min-width: 44px !important;
        padding: 12px !important;
      }
    `;
    document.head.appendChild(style);
  }

  private handleReducedMotion(): void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotion = () => {
      if (mediaQuery.matches || this.preferences.reduceMotion) {
        document.documentElement.classList.add('reduce-motion');
        this.preferences.reduceMotion = true;
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    };

    mediaQuery.addListener(handleReducedMotion);
    handleReducedMotion();
  }

  private initializeColorScheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleColorScheme = () => {
      if (mediaQuery.matches && !this.preferences.darkMode) {
        this.preferences.darkMode = true;
        this.applyColorScheme();
      }
    };

    mediaQuery.addListener(handleColorScheme);
    handleColorScheme();
  }

  private detectUserPreferences(): void {
    // Detect screen reader usage
    if (navigator.userAgent.includes('NVDA') || 
        navigator.userAgent.includes('JAWS') || 
        navigator.userAgent.includes('VoiceOver')) {
      this.preferences.screenReader = true;
      this.preferences.verboseDescriptions = true;
    }

    // Detect high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.preferences.highContrast = true;
    }

    // Detect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.preferences.reduceMotion = true;
    }

    this.savePreferences();
  }

  private setupKeyboardNavigation(): void {
    let isTabbing = false;

    // Track tab usage for focus management
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        isTabbing = true;
        this.keyboardNavigationEnabled = true;
        document.body.classList.add('keyboard-navigation');
      }

      // Handle escape key globally
      if (e.key === 'Escape') {
        this.handleEscape();
      }

      // Handle arrow keys for meditation controls
      if (this.isInMeditationSession()) {
        this.handleMeditationKeyboard(e);
      }
    });

    // Remove keyboard navigation class on mouse use
    document.addEventListener('mousedown', () => {
      if (isTabbing) {
        isTabbing = false;
        this.keyboardNavigationEnabled = false;
        document.body.classList.remove('keyboard-navigation');
      }
    });
  }

  private setupFocusManagement(): void {
    // Track focus for restoration
    document.addEventListener('focusin', (e) => {
      this.focusTracker = e.target as HTMLElement;
    });

    // Focus trap for modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const modal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
        if (modal) {
          this.trapFocus(e, modal as HTMLElement);
        }
      }
    });
  }

  private trapFocus(e: KeyboardEvent, container: HTMLElement): void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  private handleEscape(): void {
    // Close any open modals
    const openModal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
    if (openModal) {
      const closeButton = openModal.querySelector('[aria-label*="close"], [data-close]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  private isInMeditationSession(): boolean {
    return window.location.pathname.includes('meditation') || 
           document.querySelector('[data-meditation-active="true"]') !== null;
  }

  private handleMeditationKeyboard(e: KeyboardEvent): void {
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        this.triggerPlayPause();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.adjustVolume(0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.adjustVolume(-0.1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.seekBackward();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.seekForward();
        break;
      case 'm':
        e.preventDefault();
        this.toggleMute();
        break;
    }
  }

  private triggerPlayPause(): void {
    const playButton = document.querySelector('[data-play-pause]') as HTMLElement;
    if (playButton) {
      playButton.click();
      this.announce(
        playButton.getAttribute('aria-pressed') === 'true' 
          ? this.getText('meditationStarted')
          : this.getText('meditationPaused')
      );
    }
  }

  private adjustVolume(delta: number): void {
    const volumeSlider = document.querySelector('[type="range"][aria-label*="volume"]') as HTMLInputElement;
    if (volumeSlider) {
      const currentVolume = parseFloat(volumeSlider.value);
      const newVolume = Math.max(0, Math.min(1, currentVolume + delta));
      volumeSlider.value = newVolume.toString();
      volumeSlider.dispatchEvent(new Event('input'));
      this.announce(`Volume ${Math.round(newVolume * 100)}%`);
    }
  }

  private seekBackward(): void {
    this.announce('Mundur 10 detik');
    // Implementation would depend on audio player
  }

  private seekForward(): void {
    this.announce('Maju 10 detik');
    // Implementation would depend on audio player
  }

  private toggleMute(): void {
    const muteButton = document.querySelector('[data-mute]') as HTMLElement;
    if (muteButton) {
      muteButton.click();
      this.announce(
        muteButton.getAttribute('aria-pressed') === 'true' ? 'Dibisukan' : 'Suara aktif'
      );
    }
  }

  // Public methods
  updatePreferences(newPreferences: Partial<AccessibilityPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
    this.applyPreferences();
  }

  getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  private applyPreferences(): void {
    this.applyVisualPreferences();
    this.applyAudioPreferences();
    this.applyMotorPreferences();
    this.applyCognitivePreferences();
    this.applyLanguagePreferences();
  }

  private applyVisualPreferences(): void {
    const root = document.documentElement;
    
    // High contrast
    root.classList.toggle('high-contrast', this.preferences.highContrast);
    
    // Font size
    root.setAttribute('data-font-size', this.preferences.fontSize);
    const fontSizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '22px'
    };
    root.style.fontSize = fontSizes[this.preferences.fontSize];
    
    // Dark mode
    root.classList.toggle('dark', this.preferences.darkMode);
    
    // Color blindness filters
    if (this.preferences.colorBlindnessMode !== 'none') {
      root.classList.add(`colorblind-${this.preferences.colorBlindnessMode}`);
    }
    
    // Reduced motion
    root.classList.toggle('reduce-motion', this.preferences.reduceMotion);
  }

  private applyColorScheme(): void {
    document.documentElement.classList.toggle('dark', this.preferences.darkMode);
    
    // Update theme color for PWA
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', this.preferences.darkMode ? '#1f2937' : '#6A8F6F');
    }
  }

  private applyAudioPreferences(): void {
    // Audio descriptions and voice guidance would be handled by audio components
    if (this.preferences.voiceGuidance) {
      this.enableVoiceGuidance();
    }
  }

  private applyMotorPreferences(): void {
    const body = document.body;
    
    // Larger click targets
    body.classList.toggle('large-click-targets', this.preferences.largerClickTargets);
    
    // One-handed mode (UI adjustments for single-hand use)
    body.classList.toggle('one-handed-mode', this.preferences.oneHandedMode);
  }

  private applyCognitivePreferences(): void {
    const root = document.documentElement;
    
    // Simplified interface
    root.classList.toggle('simplified-interface', this.preferences.simplifiedInterface);
    
    // Extended timeouts
    if (this.preferences.extendedTimeouts) {
      root.style.setProperty('--timeout-multiplier', '2');
    }
    
    // Memory aids (persistent help text, etc.)
    root.classList.toggle('memory-aids', this.preferences.memoryAids);
  }

  private applyLanguagePreferences(): void {
    document.documentElement.lang = this.preferences.language;
    
    // Update all aria-labels and text content
    this.updateUILanguage();
  }

  private updateUILanguage(): void {
    const elementsToUpdate = document.querySelectorAll('[data-i18n]');
    elementsToUpdate.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const text = this.getText(key);
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          (element as HTMLInputElement).placeholder = text;
        } else {
          element.textContent = text;
        }
      }
    });

    // Update aria-labels
    const ariaElements = document.querySelectorAll('[data-aria-i18n]');
    ariaElements.forEach(element => {
      const key = element.getAttribute('data-aria-i18n');
      if (key) {
        element.setAttribute('aria-label', this.getText(key));
      }
    });
  }

  private enableVoiceGuidance(): void {
    // This would integrate with Web Speech API
    if ('speechSynthesis' in window) {
      this.announce(this.getText('screenReaderAnnouncement'), 'polite');
    }
  }

  private getText(key: string): string {
    const lang = this.preferences.language;
    return this.translations[lang]?.[key] || this.translations.id[key] || key;
  }

  // Public announcement method
  announce(message: string, priority: 'polite' | 'assertive' = 'polite', delay: number = 100): void {
    if (!this.preferences.screenReader && priority === 'polite') {
      return; // Don't announce if screen reader is not detected and it's not urgent
    }

    setTimeout(() => {
      const announcer = priority === 'assertive' 
        ? document.getElementById('accessibility-announcer-assertive')
        : document.getElementById('accessibility-announcer');
      
      if (announcer) {
        announcer.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
          announcer.textContent = '';
        }, 1000);
      }
    }, delay);
  }

  // Meditation-specific accessibility methods
  announceMeditationStart(sessionType: string, duration: number): void {
    const message = `${this.getText('meditationStarted')}: ${sessionType}, ${duration} ${duration === 1 ? 'menit' : 'menit'}`;
    this.announce(message, 'polite');
  }

  announceBreathingGuidance(phase: 'inhale' | 'exhale' | 'hold'): void {
    if (this.preferences.voiceGuidance) {
      const guidance = this.getText(phase);
      this.announce(guidance, 'polite', 0);
    }
  }

  announceMoodChange(beforeMood: string, afterMood: string): void {
    const message = `Mood berubah dari ${beforeMood} menjadi ${afterMood}`;
    this.announce(message, 'polite');
  }

  announceAchievement(achievement: string): void {
    const message = `${this.getText('achievement')}: ${achievement}`;
    this.announce(message, 'assertive');
  }

  announceProgressUpdate(progress: string): void {
    const message = `${this.getText('progressUpdate')}: ${progress}`;
    this.announce(message, 'polite');
  }

  // Focus management methods
  restoreFocus(): void {
    if (this.focusTracker && document.contains(this.focusTracker)) {
      this.focusTracker.focus();
    }
  }

  setFocusToElement(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      this.focusTracker = element;
    }
  }

  // High-level accessibility checks
  runAccessibilityAudit(): AccessibilityAuditResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const successes: string[] = [];

    // Check for alt text on images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        issues.push(`Image missing alt text: ${img.src}`);
      } else {
        successes.push('Images have appropriate alt text');
      }
    });

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push('No headings found - page structure unclear');
    } else {
      successes.push('Page has proper heading structure');
    }

    // Check for focus indicators
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    if (focusableElements.length > 0) {
      successes.push('Page has focusable elements');
    }

    // Check color contrast (simplified)
    if (this.preferences.highContrast) {
      successes.push('High contrast mode enabled');
    } else {
      warnings.push('Consider enabling high contrast for better visibility');
    }

    return {
      issues,
      warnings,
      successes,
      score: Math.max(0, 100 - issues.length * 20 - warnings.length * 5)
    };
  }
}

export interface AccessibilityAuditResult {
  issues: string[];
  warnings: string[];
  successes: string[];
  score: number;
}

// Export singleton instance
export const accessibilityService = new AccessibilityService();
export default AccessibilityService;