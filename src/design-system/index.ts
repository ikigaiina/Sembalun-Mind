/**
 * Sembalun Design System - Main Export
 * Complete Indonesian cultural design system for meditation apps
 */

// ============= DESIGN FOUNDATIONS =============
export {
  designTokens,
  colorTokens,
  typographyTokens,
  spacingTokens,
  shadowTokens,
  borderTokens,
  animationTokens,
  breakpointTokens,
  createTheme,
  generateCssVariables,
} from './foundations';

// Re-export specific token categories for convenience
export type {
  ColorScale,
  CulturalColors,
  SemanticColors,
  MeditationColors,
  TypographyScale,
  FontFamilies,
  FontWeights,
  FontSizes,
  SpacingScale,
  ShadowScale,
  CulturalShadows,
  MeditationShadows,
  BorderTokens,
  AnimationTokens,
  BreakpointTokens,
  DesignTokens,
  ThemeConfig,
} from './foundations';

// ============= UI COMPONENTS =============

// Export Button components
export {
  Button,
  CulturalButton,
  MeditationButton,
  TraditionalButton,
  SpiritualButton,
  JavaneseButton,
  BalineseButton,
  SundaneseButton,
  MinangButton,
  type ButtonProps,
} from '../components/ui/Button';

// ============= CULTURAL COMPONENTS =============

// Export Indonesian Card components
export {
  IndonesianCard,
  JavaneseCard,
  BalineseCard,
  SundaneseCard,
  MinangCard,
  SacredCard,
  MeditationCard,
  OrnamentalCard,
  ElevatedCard,
  type IndonesianCardProps,
} from '../components/cultural/IndonesianCard';

// ============= MEDITATION COMPONENTS =============

// Export Meditation Timer
export {
  MeditationTimer,
  type MeditationTimerProps,
  type MeditationSession,
} from '../components/meditation/MeditationTimer';

// ============= UTILITIES =============

/**
 * Theme utility functions
 */
export const themeUtils = {
  /**
   * Get cultural colors for a specific tradition
   */
  getCulturalColors: (tradition: 'javanese' | 'balinese' | 'sundanese' | 'minang') => {
    return colorTokens.regionalColors[tradition];
  },

  /**
   * Create CSS custom properties for a theme
   */
  createCssVariables: (tradition: 'javanese' | 'balinese' | 'sundanese' | 'minang') => {
    const colors = colorTokens.regionalColors[tradition];
    return Object.entries(colors)
      .map(([key, value]) => `  --cultural-${key}: ${value};`)
      .join('\n');
  },

  /**
   * Get meditation color based on practice type
   */
  getMeditationColor: (practiceType: keyof typeof colorTokens.meditation) => {
    return colorTokens.meditation[practiceType];
  },

  /**
   * Create cultural gradient
   */
  createCulturalGradient: (
    tradition: 'javanese' | 'balinese' | 'sundanese' | 'minang',
    type: 'primary' | 'subtle' | 'spiritual' = 'primary'
  ) => {
    const colors = colorTokens.regionalColors[tradition];
    
    switch (type) {
      case 'primary':
        return `linear-gradient(135deg, ${colors.templeGold}, ${colors.earthBrown})`;
      case 'subtle':
        return `linear-gradient(135deg, ${colors.lotusWhite}, ${colors.bambooGreen}20)`;
      case 'spiritual':
        return `radial-gradient(circle, ${colors.spiritualPurple}20, transparent)`;
      default:
        return `linear-gradient(135deg, ${colors.templeGold}, ${colors.earthBrown})`;
    }
  },
};

/**
 * Component composition utilities
 */
export const componentUtils = {
  /**
   * Create a themed component wrapper
   */
  withCulturalTheme: <T extends Record<string, unknown>>(
    Component: React.ComponentType<T>,
    tradition: 'javanese' | 'balinese' | 'sundanese' | 'minang'
  ) => {
    return (props: T) => {
      return React.createElement(Component, {
        ...props,
        tradition,
        style: {
          '--cultural-primary': colorTokens.regionalColors[tradition].templeGold,
          '--cultural-secondary': colorTokens.regionalColors[tradition].earthBrown,
          '--cultural-accent': colorTokens.regionalColors[tradition].spiritualPurple,
          ...((props as T & { style?: React.CSSProperties }).style || {}),
        },
      });
    };
  },

  /**
   * Generate responsive props for components
   */
  createResponsiveProps: (
    mobile: Record<string, unknown>,
    tablet?: Record<string, unknown>,
    desktop?: Record<string, unknown>
  ) => {
    return {
      mobile,
      tablet: tablet || mobile,
      desktop: desktop || tablet || mobile,
    };
  },
};

/**
 * Accessibility utilities
 */
export const a11yUtils = {
  /**
   * Generate ARIA labels for cultural components
   */
  createCulturalAriaLabel: (
    componentType: string,
    tradition: string,
    additionalInfo?: string
  ) => {
    const traditionLabel = tradition.charAt(0).toUpperCase() + tradition.slice(1);
    return `${componentType} with ${traditionLabel} cultural styling${additionalInfo ? `. ${additionalInfo}` : ''}`;
  },

  /**
   * Check color contrast ratio
   */
  checkColorContrast: (foreground: string, background: string) => {
    // Simplified contrast checker - in production, use a proper library
    const getLuminance = (hex: string) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      ratio,
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
    };
  },
};

// ============= CONSTANTS =============

/**
 * Cultural tradition information
 */
export const CULTURAL_TRADITIONS = {
  javanese: {
    name: 'Javanese',
    displayName: 'Jawa',
    description: 'Traditional Javanese meditation practices focusing on inner harmony',
    emoji: '🏛️',
    practices: ['Lelaku', 'Tapa Brata', 'Semadi'],
    musicStyles: ['Gamelan', 'Keroncong'],
    locations: ['Yogyakarta', 'Surakarta', 'Central Java'],
  },
  balinese: {
    name: 'Balinese',
    displayName: 'Bali',
    description: 'Hindu-Balinese meditation combining yoga and nature connection',
    emoji: '🌺',
    practices: ['Dharana', 'Yoga', 'Puja Meditation'],
    musicStyles: ['Gamelan Bali', 'Kecak'],
    locations: ['Ubud', 'Besakih Temple', 'Mount Batur'],
  },
  sundanese: {
    name: 'Sundanese',
    displayName: 'Sunda',
    description: 'West Javanese contemplative practices in harmony with nature',
    emoji: '🎋',
    practices: ['Ngaji Diri', 'Tapa Sunda', 'Nature Meditation'],
    musicStyles: ['Degung', 'Kacapi Suling'],
    locations: ['Bandung', 'Bogor', 'West Java mountains'],
  },
  minang: {
    name: 'Minang',
    displayName: 'Minangkabau',
    description: 'Minangkabau spiritual practices emphasizing community wisdom',
    emoji: '🏠',
    practices: ['Silek Meditation', 'Adat Reflection', 'Community Contemplation'],
    musicStyles: ['Talempong', 'Saluang'],
    locations: ['Padang', 'Bukittinggi', 'West Sumatra'],
  },
} as const;

/**
 * Meditation practice types
 */
export const MEDITATION_TYPES = {
  guided: {
    name: 'Guided Meditation',
    description: 'Meditation with voice guidance and instructions',
    duration: [5, 10, 15, 20, 30],
    difficulty: 'beginner',
  },
  silent: {
    name: 'Silent Meditation', 
    description: 'Quiet meditation with optional background sounds',
    duration: [10, 15, 20, 30, 45, 60],
    difficulty: 'intermediate',
  },
  breathing: {
    name: 'Breathing Meditation',
    description: 'Focus on breath awareness and regulation',
    duration: [5, 10, 15, 20],
    difficulty: 'beginner',
  },
  walking: {
    name: 'Walking Meditation',
    description: 'Mindful movement and awareness practice',
    duration: [10, 15, 20, 30],
    difficulty: 'beginner',
  },
  cultural: {
    name: 'Cultural Meditation',
    description: 'Traditional Indonesian meditation practices',
    duration: [15, 20, 30, 45],
    difficulty: 'intermediate',
  },
} as const;

// ============= VERSION =============

export const SEMBALUN_DESIGN_SYSTEM_VERSION = '1.0.0';

export default {
  version: SEMBALUN_DESIGN_SYSTEM_VERSION,
  tokens: designTokens,
  utils: {
    theme: themeUtils,
    component: componentUtils,
    a11y: a11yUtils,
  },
  constants: {
    traditions: CULTURAL_TRADITIONS,
    meditationTypes: MEDITATION_TYPES,
  },
};