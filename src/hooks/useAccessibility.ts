import { useState, useEffect } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false
};

const STORAGE_KEY = 'sembalun-accessibility-settings';

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Detect system preferences
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const prefersLargeText = window.matchMedia('(prefers-reduced-data: reduce)').matches; // Approximation
    
    // Load saved settings
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    let initialSettings = defaultSettings;
    
    if (savedSettings) {
      try {
        initialSettings = { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }

    // Apply system preferences if not overridden
    const finalSettings = {
      ...initialSettings,
      reducedMotion: initialSettings.reducedMotion || prefersReducedMotion,
      highContrast: initialSettings.highContrast || prefersHighContrast,
      largeText: initialSettings.largeText || prefersLargeText
    };

    setSettings(finalSettings);
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text mode
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion mode
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Screen reader optimizations
    if (settings.screenReader) {
      root.classList.add('screen-reader');
    } else {
      root.classList.remove('screen-reader');
    }
  }, [settings]);

  // Save settings
  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  // Announce to screen readers
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return {
    settings,
    updateSetting,
    announce
  };
};