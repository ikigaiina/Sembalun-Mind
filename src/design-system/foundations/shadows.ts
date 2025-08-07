/**
 * Sembalun Design System - Shadow Foundation
 * Cultural and meditation-inspired shadow system
 */

// ============= BASE SHADOW SYSTEM =============

export interface ShadowScale {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  inner: string;
}

export const shadows: ShadowScale = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.35)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
};

// ============= CULTURAL SHADOWS =============

export interface CulturalShadows {
  temple: string;         // Temple-inspired deep shadow
  lotus: string;          // Soft lotus petal shadow
  bamboo: string;         // Natural bamboo shadow
  batik: string;          // Subtle batik pattern shadow
  traditional: string;    // Traditional Indonesian shadow
  spiritual: string;      // Spiritual/mystical glow
}

export const culturalShadows: CulturalShadows = {
  // Temple-inspired shadow with golden undertones
  temple: '0 8px 32px -8px rgba(255, 215, 0, 0.3), 0 0 0 1px rgba(139, 69, 19, 0.1)',
  
  // Soft, organic lotus shadow
  lotus: '0 4px 20px -2px rgba(255, 250, 240, 0.8), 0 0 0 1px rgba(255, 250, 240, 0.2)',
  
  // Natural bamboo green shadow
  bamboo: '0 6px 24px -4px rgba(154, 205, 50, 0.2), 0 0 0 1px rgba(154, 205, 50, 0.1)',
  
  // Indigo batik shadow
  batik: '0 4px 16px -2px rgba(75, 0, 130, 0.2), 0 0 0 1px rgba(75, 0, 130, 0.1)',
  
  // Earth brown traditional shadow
  traditional: '0 6px 20px -4px rgba(139, 69, 19, 0.3), 0 0 0 1px rgba(139, 69, 19, 0.1)',
  
  // Spiritual purple glow
  spiritual: '0 0 20px -2px rgba(102, 51, 153, 0.4), 0 0 40px -4px rgba(102, 51, 153, 0.2)',
};

// ============= MEDITATION SHADOWS =============

export interface MeditationShadows {
  calm: string;           // Calm, peaceful shadow
  focus: string;          // Sharp, focused shadow
  breathe: string;        // Soft breathing rhythm
  glow: string;           // Meditative glow effect
  depth: string;          // Deep concentration
  floating: string;       // Floating meditation
}

export const meditationShadows: MeditationShadows = {
  // Calm blue shadow for peaceful states
  calm: '0 8px 32px -4px rgba(14, 165, 233, 0.15), 0 0 0 1px rgba(14, 165, 233, 0.05)',
  
  // Sharp purple shadow for focus
  focus: '0 4px 16px -2px rgba(102, 51, 153, 0.3), 0 0 8px -2px rgba(102, 51, 153, 0.2)',
  
  // Gentle breathing rhythm shadow
  breathe: '0 6px 24px -6px rgba(255, 255, 255, 0.6), 0 0 16px -4px rgba(14, 165, 233, 0.1)',
  
  // Soft meditative glow
  glow: '0 0 32px -8px rgba(102, 51, 153, 0.3), 0 0 64px -16px rgba(14, 165, 233, 0.2)',
  
  // Deep shadow for concentration
  depth: '0 12px 48px -8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(102, 51, 153, 0.1)',
  
  // Floating effect
  floating: '0 16px 32px -8px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
};

// ============= INTERACTIVE SHADOWS =============

export interface InteractiveShadows {
  button: {
    default: string;
    hover: string;
    active: string;
    focus: string;
  };
  card: {
    default: string;
    hover: string;
    active: string;
  };
  modal: string;
  dropdown: string;
  tooltip: string;
}

export const interactiveShadows: InteractiveShadows = {
  button: {
    default: shadows.md,
    hover: shadows.lg,
    active: shadows.sm,
    focus: '0 0 0 3px rgba(14, 165, 233, 0.2), ' + shadows.md,
  },
  card: {
    default: shadows.md,
    hover: shadows.xl,
    active: shadows.lg,
  },
  modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  dropdown: '0 10px 38px -10px rgba(0, 0, 0, 0.35), 0 10px 20px -15px rgba(0, 0, 0, 0.2)',
  tooltip: '0 4px 14px -2px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
};

// ============= REGIONAL SHADOW VARIATIONS =============

export interface RegionalShadows {
  javanese: CulturalShadows;
  balinese: CulturalShadows;
  sundanese: CulturalShadows;
  minang: CulturalShadows;
}

export const regionalShadows: RegionalShadows = {
  javanese: {
    temple: '0 8px 32px -8px rgba(255, 215, 0, 0.25), 0 0 0 1px rgba(139, 69, 19, 0.1)',
    lotus: '0 4px 20px -2px rgba(255, 250, 240, 0.7), 0 0 0 1px rgba(139, 69, 19, 0.1)',
    bamboo: '0 6px 24px -4px rgba(154, 205, 50, 0.15), 0 0 0 1px rgba(75, 0, 130, 0.1)',
    batik: '0 4px 16px -2px rgba(75, 0, 130, 0.3), 0 0 0 1px rgba(75, 0, 130, 0.15)',
    traditional: '0 6px 20px -4px rgba(139, 69, 19, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1)',
    spiritual: '0 0 20px -2px rgba(75, 0, 130, 0.4), 0 0 40px -4px rgba(102, 51, 153, 0.2)',
  },
  balinese: {
    temple: '0 8px 32px -8px rgba(255, 165, 0, 0.3), 0 0 0 1px rgba(160, 82, 45, 0.1)',
    lotus: '0 4px 20px -2px rgba(255, 248, 255, 0.8), 0 0 0 1px rgba(147, 112, 219, 0.1)',
    bamboo: '0 6px 24px -4px rgba(144, 238, 144, 0.2), 0 0 0 1px rgba(65, 105, 225, 0.1)',
    batik: '0 4px 16px -2px rgba(65, 105, 225, 0.25), 0 0 0 1px rgba(65, 105, 225, 0.15)',
    traditional: '0 6px 20px -4px rgba(160, 82, 45, 0.3), 0 0 0 1px rgba(255, 165, 0, 0.1)',
    spiritual: '0 0 20px -2px rgba(147, 112, 219, 0.4), 0 0 40px -4px rgba(65, 105, 225, 0.2)',
  },
  sundanese: {
    temple: '0 8px 32px -8px rgba(218, 165, 32, 0.25), 0 0 0 1px rgba(139, 115, 85, 0.1)',
    lotus: '0 4px 20px -2px rgba(255, 248, 220, 0.7), 0 0 0 1px rgba(138, 43, 226, 0.1)',
    bamboo: '0 6px 24px -4px rgba(143, 188, 143, 0.18), 0 0 0 1px rgba(72, 61, 139, 0.1)',
    batik: '0 4px 16px -2px rgba(72, 61, 139, 0.22), 0 0 0 1px rgba(72, 61, 139, 0.12)',
    traditional: '0 6px 20px -4px rgba(139, 115, 85, 0.28), 0 0 0 1px rgba(218, 165, 32, 0.1)',
    spiritual: '0 0 20px -2px rgba(138, 43, 226, 0.35), 0 0 40px -4px rgba(72, 61, 139, 0.18)',
  },
  minang: {
    temple: '0 8px 32px -8px rgba(184, 134, 11, 0.28), 0 0 0 1px rgba(160, 82, 45, 0.12)',
    lotus: '0 4px 20px -2px rgba(255, 255, 240, 0.75), 0 0 0 1px rgba(153, 50, 204, 0.1)',
    bamboo: '0 6px 24px -4px rgba(107, 142, 35, 0.2), 0 0 0 1px rgba(25, 25, 112, 0.1)',
    batik: '0 4px 16px -2px rgba(25, 25, 112, 0.25), 0 0 0 1px rgba(25, 25, 112, 0.15)',
    traditional: '0 6px 20px -4px rgba(160, 82, 45, 0.3), 0 0 0 1px rgba(184, 134, 11, 0.12)',
    spiritual: '0 0 20px -2px rgba(153, 50, 204, 0.38), 0 0 40px -4px rgba(25, 25, 112, 0.2)',
  },
};

// ============= SHADOW UTILITIES =============

export const shadowUtilities = {
  /**
   * Create custom shadow with color
   */
  createShadow: (
    offsetX: number,
    offsetY: number, 
    blur: number,
    spread: number,
    color: string,
    opacity: number
  ): string => {
    return `${offsetX}px ${offsetY}px ${blur}px ${spread}px rgba(${color}, ${opacity})`;
  },

  /**
   * Combine multiple shadows
   */
  combineShadows: (...shadows: string[]): string => {
    return shadows.join(', ');
  },

  /**
   * Create elevation shadow
   */
  createElevation: (level: number, color = '0, 0, 0'): string => {
    const baseOffset = level * 2;
    const baseBlur = level * 4;
    const baseOpacity = Math.min(0.1 + (level * 0.02), 0.25);
    
    return `0 ${baseOffset}px ${baseBlur}px -${Math.floor(level / 2)}px rgba(${color}, ${baseOpacity})`;
  },

  /**
   * Get cultural shadow for tradition
   */
  getCulturalShadow: (
    tradition: keyof RegionalShadows,
    type: keyof CulturalShadows
  ): string => {
    return regionalShadows[tradition][type];
  },

  /**
   * Create meditation glow effect
   */
  createMeditationGlow: (color: string, intensity: number = 0.3): string => {
    return `0 0 ${16 * intensity}px -${4 * intensity}px rgba(${color}, ${intensity}), ` +
           `0 0 ${32 * intensity}px -${8 * intensity}px rgba(${color}, ${intensity * 0.5})`;
  },

  /**
   * Generate CSS custom properties
   */
  generateCssVariables: (): string => {
    const allShadows = {
      ...shadows,
      ...culturalShadows,
      ...meditationShadows,
    };
    
    return Object.entries(allShadows)
      .map(([key, value]) => `  --shadow-${key}: ${value};`)
      .join('\n');
  },
};

// ============= SHADOW TOKENS EXPORT =============

export const shadowTokens = {
  shadows,
  cultural: culturalShadows,
  meditation: meditationShadows,
  interactive: interactiveShadows,
  regional: regionalShadows,
  utilities: shadowUtilities,
};

export default shadowTokens;