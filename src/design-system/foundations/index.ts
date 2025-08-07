/**
 * Sembalun Design System - Foundation Tokens
 * Complete design token system with Indonesian cultural authenticity
 */

// Import all foundation tokens
import colorTokens from './colors';
import typographyTokens from './typography';
import spacingTokens from './spacing';
import shadowTokens from './shadows';

// ============= DESIGN TOKENS INTERFACE =============

export interface DesignTokens {
  colors: typeof colorTokens;
  typography: typeof typographyTokens;
  spacing: typeof spacingTokens;
  shadows: typeof shadowTokens;
  borders: BorderTokens;
  animations: AnimationTokens;
  breakpoints: BreakpointTokens;
}

// ============= BORDER TOKENS =============

export interface BorderTokens {
  width: {
    none: string;
    thin: string;
    base: string;
    thick: string;
    heavy: string;
  };
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };
  style: {
    solid: string;
    dashed: string;
    dotted: string;
    double: string;
    none: string;
  };
  cultural: {
    traditional: string;
    ornamental: string;
    sacred: string;
  };
}

export const borderTokens: BorderTokens = {
  width: {
    none: '0',
    thin: '1px',
    base: '2px',
    thick: '3px',
    heavy: '4px',
  },
  radius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    full: '9999px',
  },
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    double: 'double',
    none: 'none',
  },
  cultural: {
    traditional: `2px solid ${colorTokens.cultural.templeGold}`,
    ornamental: `3px double ${colorTokens.cultural.earthBrown}`,
    sacred: `1px solid ${colorTokens.cultural.spiritualPurple}`,
  },
};

// ============= ANIMATION TOKENS =============

export interface AnimationTokens {
  duration: {
    instant: string;
    fast: string;
    normal: string;
    slow: string;
    slower: string;
  };
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    meditation: string;
    bounce: string;
    elastic: string;
  };
  meditation: {
    breathe: {
      duration: string;
      easing: string;
      direction: string;
      iterationCount: string;
    };
    pulse: {
      duration: string;
      easing: string;
      direction: string;
      iterationCount: string;
    };
    float: {
      duration: string;
      easing: string;
      direction: string;
      iterationCount: string;
    };
  };
  cultural: {
    lotus: string;
    ripple: string;
    glow: string;
  };
}

export const animationTokens: AnimationTokens = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    meditation: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  },
  meditation: {
    breathe: {
      duration: '4s',
      easing: 'ease-in-out',
      direction: 'alternate',
      iterationCount: 'infinite',
    },
    pulse: {
      duration: '2s',
      easing: 'ease-in-out',
      direction: 'alternate',
      iterationCount: 'infinite',
    },
    float: {
      duration: '6s',
      easing: 'ease-in-out',
      direction: 'alternate',
      iterationCount: 'infinite',
    },
  },
  cultural: {
    lotus: 'lotus-bloom 2s ease-out forwards',
    ripple: 'ripple 0.6s linear',
    glow: 'spiritual-glow 3s ease-in-out infinite alternate',
  },
};

// ============= BREAKPOINT TOKENS =============

export interface BreakpointTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  meditation: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export const breakpointTokens: BreakpointTokens = {
  xs: '0px',
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet portrait
  lg: '1024px',   // Tablet landscape
  xl: '1280px',   // Desktop
  '2xl': '1536px', // Large desktop
  meditation: {
    mobile: '0px',
    tablet: '768px',
    desktop: '1024px',
  },
};

// ============= COMPLETE DESIGN TOKENS =============

export const designTokens: DesignTokens = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  shadows: shadowTokens,
  borders: borderTokens,
  animations: animationTokens,
  breakpoints: breakpointTokens,
};

// ============= THEME CONFIGURATION =============

export interface ThemeConfig {
  tradition: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  mode: 'light' | 'dark';
  meditation: {
    primaryPractice: 'calm' | 'focus' | 'energy' | 'balance';
    sessionDuration: number;
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  };
}

export const createTheme = (config: ThemeConfig) => {
  const { tradition, mode, meditation } = config;
  
  const baseColors = mode === 'dark' 
    ? colorTokens.darkTheme 
    : {
        background: { primary: colorTokens.neutral[50], secondary: colorTokens.neutral[100] },
        text: { primary: colorTokens.neutral[900], secondary: colorTokens.neutral[700] },
      };

  const culturalColors = colorTokens.regionalColors[tradition];
  const culturalShadows = shadowTokens.regional[tradition];
  const culturalSpacing = spacingTokens.cultural[tradition];

  return {
    ...designTokens,
    colors: {
      ...colorTokens,
      current: {
        ...baseColors,
        cultural: culturalColors,
      },
    },
    shadows: {
      ...shadowTokens,
      current: culturalShadows,
    },
    spacing: {
      ...spacingTokens,
      current: culturalSpacing,
    },
    meditation: {
      primaryColor: colorTokens.meditation[meditation.primaryPractice],
      shadows: shadowTokens.meditation,
      spacing: spacingTokens.meditation,
    },
  };
};

// ============= CSS GENERATION UTILITIES =============

export const generateCssVariables = (): string => {
  const colorVars = Object.entries(colorTokens.primary)
    .map(([key, value]) => `  --color-primary-${key}: ${value};`)
    .join('\n');

  const spacingVars = spacingTokens.utilities.generateCssVariables();
  const shadowVars = shadowTokens.utilities.generateCssVariables();

  return `:root {\n${colorVars}\n${spacingVars}\n${shadowVars}\n}`;
};

// Export individual token categories (already exported above, removed to prevent duplicates)

// Default export
export default designTokens;