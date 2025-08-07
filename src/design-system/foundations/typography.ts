/**
 * Sembalun Design System - Typography Foundation
 * Indonesian-focused typography with cultural authenticity
 */

// ============= FONT FAMILIES =============

export interface FontFamilies {
  primary: string[];
  heading: string[];
  cultural: string[];
  monospace: string[];
  traditional: string[];
}

export const fontFamilies: FontFamilies = {
  // Primary font stack for body text
  primary: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  
  // Heading font stack
  heading: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  
  // Indonesian cultural font stack
  cultural: [
    'Noto Sans Indonesian',
    'Noto Sans Javanese', 
    'Noto Sans Sundanese',
    'Inter',
    'system-ui',
    'sans-serif'
  ],
  
  // Monospace font stack
  monospace: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
  
  // Traditional script fonts (for special occasions)
  traditional: [
    'Noto Traditional', 
    'Noto Serif Indonesian',
    'Georgia', 
    'serif'
  ],
};

// ============= FONT WEIGHTS =============

export interface FontWeights {
  thin: number;
  extralight: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export const fontWeights: FontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

// ============= FONT SIZES =============

export interface FontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}

export const fontSizes: FontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem',  // 72px
  '8xl': '6rem',    // 96px
  '9xl': '8rem',    // 128px
};

// ============= LINE HEIGHTS =============

export interface LineHeights {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export const lineHeights: LineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// ============= LETTER SPACING =============

export interface LetterSpacing {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export const letterSpacing: LetterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

// ============= TYPOGRAPHY SCALES =============

export interface TypographyScale {
  fontSize: string;
  lineHeight: string | number;
  fontWeight: number;
  letterSpacing?: string;
  fontFamily?: string[];
}

// Display Typography (for hero sections, major headings)
export const displayScale = {
  '4xl': {
    fontSize: fontSizes['9xl'],
    lineHeight: lineHeights.none,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
    fontFamily: fontFamilies.heading,
  },
  '3xl': {
    fontSize: fontSizes['7xl'],
    lineHeight: lineHeights.none,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
    fontFamily: fontFamilies.heading,
  },
  '2xl': {
    fontSize: fontSizes['6xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
    fontFamily: fontFamilies.heading,
  },
  'xl': {
    fontSize: fontSizes['5xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamilies.heading,
  },
} as const;

// Heading Typography (for section headings, page titles)
export const headingScale = {
  'h1': {
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.heading,
  },
  'h2': {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.heading,
  },
  'h3': {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights.snug,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.heading,
  },
  'h4': {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.snug,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.heading,
  },
  'h5': {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.heading,
  },
  'h6': {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.heading,
  },
} as const;

// Body Typography (for content, forms, UI elements)
export const bodyScale = {
  'xl': {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.relaxed,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.primary,
  },
  'lg': {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.relaxed,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.primary,
  },
  'base': {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.primary,
  },
  'sm': {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.primary,
  },
  'xs': {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.snug,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.primary,
  },
} as const;

// ============= CULTURAL TYPOGRAPHY =============

export interface CulturalTypography {
  title: TypographyScale;
  subtitle: TypographyScale;
  body: TypographyScale;
  caption: TypographyScale;
  quote: TypographyScale;
  wisdom: TypographyScale;
}

export const culturalScale: CulturalTypography = {
  title: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamilies.cultural,
  },
  subtitle: {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.snug,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamilies.cultural,
  },
  body: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.relaxed,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamilies.cultural,
  },
  caption: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamilies.cultural,
  },
  quote: {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.loose,
    fontWeight: fontWeights.light,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamilies.traditional,
  },
  wisdom: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.loose,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.wider,
    fontFamily: fontFamilies.traditional,
  },
};

// ============= MEDITATION TYPOGRAPHY =============

export interface MeditationTypography {
  timer: TypographyScale;
  instruction: TypographyScale;
  mantra: TypographyScale;
  reflection: TypographyScale;
}

export const meditationScale: MeditationTypography = {
  timer: {
    fontSize: fontSizes['6xl'],
    lineHeight: lineHeights.none,
    fontWeight: fontWeights.light,
    letterSpacing: letterSpacing.wider,
    fontFamily: fontFamilies.monospace,
  },
  instruction: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.relaxed,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: fontFamilies.primary,
  },
  mantra: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights.loose,
    fontWeight: fontWeights.light,
    letterSpacing: letterSpacing.widest,
    fontFamily: fontFamilies.cultural,
  },
  reflection: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.loose,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamilies.primary,
  },
};

// ============= RESPONSIVE TYPOGRAPHY =============

export interface ResponsiveTypography {
  mobile: TypographyScale;
  tablet: TypographyScale;
  desktop: TypographyScale;
}

export const responsiveHeading: ResponsiveTypography = {
  mobile: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
  },
  tablet: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
  },
  desktop: {
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.bold,
  },
};

// ============= TYPOGRAPHY UTILITIES =============

export const typographyUtilities = {
  /**
   * Get font family stack as string
   */
  getFontFamily: (type: keyof FontFamilies): string => {
    return fontFamilies[type].join(', ');
  },

  /**
   * Create CSS font shorthand
   */
  createFontShorthand: (scale: TypographyScale): string => {
    const family = scale.fontFamily ? scale.fontFamily.join(', ') : fontFamilies.primary.join(', ');
    return `${scale.fontWeight} ${scale.fontSize}/${scale.lineHeight} ${family}`;
  },

  /**
   * Get cultural typography for specific tradition
   */
  getCulturalFont: (tradition: 'javanese' | 'balinese' | 'sundanese' | 'minang'): string => {
    const culturalFonts = {
      javanese: 'Noto Sans Javanese',
      balinese: 'Noto Sans Balinese',
      sundanese: 'Noto Sans Sundanese', 
      minang: 'Noto Sans Indonesian',
    };
    
    return `${culturalFonts[tradition]}, ${fontFamilies.cultural.join(', ')}`;
  },

  /**
   * Generate responsive typography CSS
   */
  generateResponsiveCss: (name: string, responsive: ResponsiveTypography): string => {
    return `
      .${name} {
        font-size: ${responsive.mobile.fontSize};
        line-height: ${responsive.mobile.lineHeight};
        font-weight: ${responsive.mobile.fontWeight};
      }
      
      @media (min-width: 768px) {
        .${name} {
          font-size: ${responsive.tablet.fontSize};
          line-height: ${responsive.tablet.lineHeight};
          font-weight: ${responsive.tablet.fontWeight};
        }
      }
      
      @media (min-width: 1024px) {
        .${name} {
          font-size: ${responsive.desktop.fontSize};
          line-height: ${responsive.desktop.lineHeight};
          font-weight: ${responsive.desktop.fontWeight};
        }
      }
    `;
  },
};

// ============= TYPOGRAPHY TOKENS EXPORT =============

export const typographyTokens = {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacing,
  scales: {
    display: displayScale,
    heading: headingScale,
    body: bodyScale,
    cultural: culturalScale,
    meditation: meditationScale,
  },
  responsive: {
    heading: responsiveHeading,
  },
  utilities: typographyUtilities,
};

export default typographyTokens;