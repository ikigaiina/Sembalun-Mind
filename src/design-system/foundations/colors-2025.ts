// 2025 Design Trends: Advanced Color System with AI-Powered Adaptive Colors
import { parseToHsl, hsla, adjustHue, lighten, darken, saturate, desaturate } from 'polished';

export interface ColorToken {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: ColorToken;
  warning: ColorToken;
  error: ColorToken;
  info: ColorToken;
  meditation: ColorToken;
}

// 2025 Trend: AI-Powered Color Generation for Meditation App
const generateColorScale = (baseColor: string): ColorToken => {
  const hsl = parseToHsl(baseColor);
  
  return {
    50: hsla(hsl.hue, hsl.saturation * 0.1, 0.98, 1),
    100: hsla(hsl.hue, hsl.saturation * 0.2, 0.95, 1),
    200: hsla(hsl.hue, hsl.saturation * 0.3, 0.9, 1),
    300: hsla(hsl.hue, hsl.saturation * 0.4, 0.8, 1),
    400: hsla(hsl.hue, hsl.saturation * 0.6, 0.7, 1),
    500: baseColor, // Base color
    600: hsla(hsl.hue, hsl.saturation, hsl.lightness * 0.8, 1),
    700: hsla(hsl.hue, hsl.saturation, hsl.lightness * 0.65, 1),
    800: hsla(hsl.hue, hsl.saturation, hsl.lightness * 0.5, 1),
    900: hsla(hsl.hue, hsl.saturation, hsl.lightness * 0.35, 1),
    950: hsla(hsl.hue, hsl.saturation, hsl.lightness * 0.15, 1),
  };
};

// Enhanced Sembalun Colors with 2025 Design Trends
export const sembalunColors = {
  // Main brand colors enhanced with 2025 trends
  primary: generateColorScale('#6A8F6F'), // hijau-perbukitan enhanced
  accent: generateColorScale('#A9C1D9'),   // biru-langit enhanced  
  background: generateColorScale('#E1E8F0'), // biru-kabut enhanced
  warm: generateColorScale('#C56C3E'),     // tanah-terakota enhanced
  
  // New 2025 meditation-specific colors
  meditation: {
    zen: generateColorScale('#7C9885'),      // Deep meditation green
    focus: generateColorScale('#6B9BD1'),   // Concentration blue
    calm: generateColorScale('#A8B8C8'),    // Tranquil gray-blue
    energy: generateColorScale('#D4A574'),  // Energizing warm
    healing: generateColorScale('#85A887'), // Healing sage green
  },
};

// 2025 Trend: Semantic Colors with Emotional Intelligence
export const semanticColors: SemanticColors = {
  success: generateColorScale('#10b981'), // Emerald for achievements
  warning: generateColorScale('#f59e0b'), // Amber for caution
  error: generateColorScale('#ef4444'),   // Red for alerts
  info: generateColorScale('#3b82f6'),    // Blue for information
  meditation: generateColorScale('#7C9885'), // Zen green for meditation states
};

// 2025 Trend: Glassmorphism Colors for Meditation UI
export const glassmorphismColors = {
  meditation: {
    light: 'rgba(106, 143, 111, 0.15)',     // Primary with transparency
    medium: 'rgba(106, 143, 111, 0.25)',   // Primary medium transparency
    heavy: 'rgba(106, 143, 111, 0.35)',    // Primary heavy transparency
    backdrop: 'rgba(225, 232, 240, 0.8)',  // Background with blur
  },
  accent: {
    light: 'rgba(169, 193, 217, 0.15)',
    medium: 'rgba(169, 193, 217, 0.25)',
    backdrop: 'rgba(169, 193, 217, 0.1)',
  },
  blur: {
    light: 'backdrop-filter: blur(12px) saturate(180%)',
    medium: 'backdrop-filter: blur(20px) saturate(200%)',
    heavy: 'backdrop-filter: blur(32px) saturate(250%)',
  }
};

// 2025 Trend: Neomorphism Colors for Meditation Components
export const neomorphismColors = {
  meditation: {
    background: '#E8EEF2',      // Soft meditation background
    highlight: '#F5F8FA',       // Light highlight
    shadow: '#B8C5D1',         // Soft shadow
    darkShadow: '#A0B3C2',     // Deeper shadow
    lightShadow: '#FFFFFF',    // Light shadow
    surface: '#DDE6ED',        // Surface color
    border: '#C8D4E0',         // Border color
  },
  text: {
    primary: '#2C3E50',         // Main text
    secondary: '#5D6D7E',       // Secondary text
    muted: '#85929E',           // Muted text
    meditation: '#6A8F6F',      // Meditation accent text
  }
};

// 2025 Trend: Gradient Systems with 3D Depth for Meditation
export const meditationGradients = {
  zen: {
    linear: `linear-gradient(135deg, ${sembalunColors.meditation.zen[300]} 0%, ${sembalunColors.meditation.zen[600]} 100%)`,
    radial: `radial-gradient(circle at 30% 30%, ${sembalunColors.meditation.zen[200]} 0%, ${sembalunColors.meditation.zen[700]} 100%)`,
    mesh: `
      radial-gradient(at 40% 20%, ${sembalunColors.meditation.zen[300]} 0px, transparent 50%),
      radial-gradient(at 80% 0%, ${sembalunColors.meditation.calm[300]} 0px, transparent 50%),
      radial-gradient(at 0% 50%, ${sembalunColors.meditation.focus[300]} 0px, transparent 50%)
    `,
  },
  focus: {
    linear: `linear-gradient(135deg, ${sembalunColors.meditation.focus[300]} 0%, ${sembalunColors.meditation.focus[600]} 100%)`,
    breathing: `linear-gradient(45deg, 
      ${sembalunColors.meditation.focus[200]} 0%, 
      ${sembalunColors.meditation.focus[400]} 25%,
      ${sembalunColors.meditation.focus[300]} 50%,
      ${sembalunColors.meditation.focus[500]} 75%,
      ${sembalunColors.meditation.focus[400]} 100%)`,
  },
  glassmorphism: {
    meditation: `linear-gradient(135deg, ${glassmorphismColors.meditation.light} 0%, ${glassmorphismColors.meditation.medium} 100%)`,
    accent: `linear-gradient(135deg, ${glassmorphismColors.accent.light} 0%, ${glassmorphismColors.accent.medium} 100%)`,
  },
  neomorphism: {
    convex: `linear-gradient(145deg, ${neomorphismColors.meditation.highlight} 0%, ${neomorphismColors.meditation.shadow} 100%)`,
    concave: `linear-gradient(145deg, ${neomorphismColors.meditation.shadow} 0%, ${neomorphismColors.meditation.highlight} 100%)`,
    meditation: `linear-gradient(145deg, ${neomorphismColors.meditation.surface} 0%, ${neomorphismColors.meditation.background} 100%)`,
  }
};

// 2025 Trend: Dark Mode with Intelligent Color Adaptation
export const darkModeColors = {
  background: {
    primary: '#0F1419',         // Deep meditation dark
    secondary: '#1A2127',       // Secondary background
    tertiary: '#252B33',        // Tertiary background
  },
  surface: {
    primary: '#1E2329',         // Primary surface
    secondary: '#2A3138',       // Secondary surface
    tertiary: '#363E47',        // Tertiary surface
    meditation: '#1A2E22',      // Meditation-specific surface
  },
  text: {
    primary: '#F8FAFC',         // Primary text
    secondary: '#CBD5E1',       // Secondary text
    muted: '#94A3B8',          // Muted text
    meditation: '#A8D4B0',      // Meditation accent text
  },
  border: {
    primary: '#374151',         // Primary border
    secondary: '#4B5563',       // Secondary border
    meditation: '#4A5D4F',      // Meditation border
  }
};

// 2025 Trend: Voice UI Colors for Meditation Guidance
export const voiceUIColors = {
  listening: {
    active: '#10B981',          // Green when listening
    inactive: '#6B7280',        // Gray when inactive
    processing: '#F59E0B',      // Amber when processing
  },
  waveform: {
    primary: sembalunColors.primary[400],
    accent: sembalunColors.accent[400],
    muted: '#9CA3AF',
  }
};

// CSS Custom Properties for 2025 Enhanced Sembalun
export const enhanced2025CSSVariables = {
  light: {
    // Enhanced primary colors
    '--color-primary-50': sembalunColors.primary[50],
    '--color-primary-100': sembalunColors.primary[100],
    '--color-primary-200': sembalunColors.primary[200],
    '--color-primary-300': sembalunColors.primary[300],
    '--color-primary-400': sembalunColors.primary[400],
    '--color-primary-500': sembalunColors.primary[500],
    '--color-primary-600': sembalunColors.primary[600],
    '--color-primary-700': sembalunColors.primary[700],
    '--color-primary-800': sembalunColors.primary[800],
    '--color-primary-900': sembalunColors.primary[900],
    '--color-primary-950': sembalunColors.primary[950],
    
    // Meditation-specific colors
    '--color-meditation-zen': sembalunColors.meditation.zen[500],
    '--color-meditation-focus': sembalunColors.meditation.focus[500],
    '--color-meditation-calm': sembalunColors.meditation.calm[500],
    '--color-meditation-energy': sembalunColors.meditation.energy[500],
    '--color-meditation-healing': sembalunColors.meditation.healing[500],
    
    // Glassmorphism
    '--glassmorphism-meditation': glassmorphismColors.meditation.light,
    '--glassmorphism-backdrop': glassmorphismColors.meditation.backdrop,
    '--blur-light': glassmorphismColors.blur.light,
    
    // Neomorphism
    '--neomorphism-bg': neomorphismColors.meditation.background,
    '--neomorphism-highlight': neomorphismColors.meditation.highlight,
    '--neomorphism-shadow': neomorphismColors.meditation.shadow,
    
    // Gradients
    '--gradient-meditation-zen': meditationGradients.zen.linear,
    '--gradient-meditation-focus': meditationGradients.focus.linear,
    '--gradient-glassmorphism': meditationGradients.glassmorphism.meditation,
  },
  dark: {
    '--color-background-primary': darkModeColors.background.primary,
    '--color-background-secondary': darkModeColors.background.secondary,
    '--color-surface-primary': darkModeColors.surface.primary,
    '--color-surface-meditation': darkModeColors.surface.meditation,
    '--color-text-primary': darkModeColors.text.primary,
    '--color-text-meditation': darkModeColors.text.meditation,
    '--color-border-primary': darkModeColors.border.primary,
    '--color-border-meditation': darkModeColors.border.meditation,
  }
};

// 2025: Advanced Color Utilities for Meditation
export const meditationColorUtils = {
  // Generate colors based on meditation state
  getMeditationStateColor: (state: 'calm' | 'focus' | 'energy' | 'healing' | 'zen') => {
    return sembalunColors.meditation[state][500];
  },
  
  // Generate glassmorphism style for meditation components
  getGlassmorphismStyle: (intensity: 'light' | 'medium' | 'heavy' = 'light') => ({
    background: glassmorphismColors.meditation[intensity],
    backdropFilter: glassmorphismColors.blur[intensity],
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
  }),
  
  // Generate neomorphism style for meditation components
  getNeomorphismStyle: (type: 'convex' | 'concave' | 'flat' = 'flat') => {
    const base = {
      background: neomorphismColors.meditation.background,
      borderRadius: '20px',
      border: `1px solid ${neomorphismColors.meditation.border}`,
    };
    
    if (type === 'convex') {
      return {
        ...base,
        boxShadow: `
          8px 8px 16px ${neomorphismColors.meditation.shadow},
          -8px -8px 16px ${neomorphismColors.meditation.highlight}
        `,
      };
    } else if (type === 'concave') {
      return {
        ...base,
        boxShadow: `
          inset 8px 8px 16px ${neomorphismColors.meditation.shadow},
          inset -8px -8px 16px ${neomorphismColors.meditation.highlight}
        `,
      };
    }
    
    return base;
  },
  
  // Generate breathing animation colors
  getBreathingColors: () => ({
    inhale: sembalunColors.meditation.zen[300],
    hold: sembalunColors.meditation.focus[400],
    exhale: sembalunColors.meditation.calm[300],
    pause: sembalunColors.meditation.healing[200],
  }),
};