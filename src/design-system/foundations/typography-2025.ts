// 2025 Design Trends: Variable Fonts and Dynamic Typography for Meditation

export interface TypographyScale {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
  fontWeight: number;
  textTransform?: string;
}

export interface ResponsiveTypography {
  mobile: TypographyScale;
  tablet: TypographyScale;
  desktop: TypographyScale;
}

// 2025 Trend: Variable Font Configurations for Meditation App
export const meditationFontFamilies = {
  // Primary: Calm, readable for meditation content
  primary: {
    name: 'Inter Variable',
    fallback: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    variable: '--font-inter',
    features: {
      slnt: '-10deg 0deg', // Slant for dynamic expression
      wdth: '75% 125%',    // Width for space optimization
      opsz: '14 32',       // Optical size for readability
    },
    meditation: {
      calm: 'font-variation-settings: "wght" 300, "opsz" 20',
      focus: 'font-variation-settings: "wght" 500, "opsz" 16',
      energy: 'font-variation-settings: "wght" 600, "opsz" 14',
    }
  },
  
  // Heading: Expressive for meditation guidance
  heading: {
    name: 'Playfair Display Variable',
    fallback: 'Playfair Display, Georgia, "Times New Roman", serif',
    variable: '--font-playfair',
    features: {
      opsz: '6 72',       // Wide optical size range
      wght: '400 900',    // Weight range for hierarchy
    },
    meditation: {
      zen: 'font-variation-settings: "wght" 400, "opsz" 36',
      wisdom: 'font-variation-settings: "wght" 500, "opsz" 24',
      guidance: 'font-variation-settings: "wght" 600, "opsz" 18',
    }
  },
  
  // Body: Optimized for long-form meditation content
  body: {
    name: 'Source Serif Variable',
    fallback: 'Source Serif Pro, Georgia, "Times New Roman", serif',
    variable: '--font-source-serif',
    features: {
      opsz: '6 60',
      wght: '200 900',
    },
    meditation: {
      reading: 'font-variation-settings: "wght" 400, "opsz" 12',
      instructions: 'font-variation-settings: "wght" 450, "opsz" 14',
    }
  },
  
  // Mono: For meditation timers and technical content
  mono: {
    name: 'JetBrains Mono Variable',
    fallback: 'JetBrains Mono, Consolas, "Liberation Mono", Menlo, Courier, monospace',
    variable: '--font-jetbrains',
  }
};

// 2025 Trend: Fluid Typography Scale optimized for Meditation
const baseSize = 16; // 1rem
const meditationRatio = 1.5; // Calmer ratio than golden ratio
const minScale = 0.8; // Mobile scaling
const maxScale = 1.3; // Desktop scaling

const generateFluidMeditationScale = (step: number): ResponsiveTypography => {
  const size = baseSize * Math.pow(meditationRatio, step);
  const mobileSize = size * minScale;
  const desktopSize = size * maxScale;
  
  // Line height: optimized for meditation reading
  const lineHeightRatio = step > 2 ? 1.2 : step < -1 ? 1.7 : 1.6;
  
  return {
    mobile: {
      fontSize: `${mobileSize / 16}rem`,
      lineHeight: `${lineHeightRatio}`,
      fontWeight: step > 2 ? 600 : step > 0 ? 500 : 400,
      letterSpacing: step > 2 ? '-0.02em' : '0',
    },
    tablet: {
      fontSize: `${size / 16}rem`,
      lineHeight: `${lineHeightRatio}`,
      fontWeight: step > 2 ? 600 : step > 0 ? 500 : 400,
      letterSpacing: step > 2 ? '-0.015em' : '0',
    },
    desktop: {
      fontSize: `${desktopSize / 16}rem`,
      lineHeight: `${lineHeightRatio}`,
      fontWeight: step > 2 ? 600 : step > 0 ? 500 : 400,
      letterSpacing: step > 2 ? '-0.01em' : '0',
    }
  };
};

// Typography Scale for Meditation Content
export const meditationTypographyScale = {
  // Hero/Display sizes for meditation titles
  '4xl': generateFluidMeditationScale(4), // Large meditation session titles
  '3xl': generateFluidMeditationScale(3), // Module titles
  '2xl': generateFluidMeditationScale(2), // Section headers
  'xl': generateFluidMeditationScale(1.5), // Card titles
  
  // Content sizes
  'lg': generateFluidMeditationScale(1), // Subheadings
  'md': generateFluidMeditationScale(0.5), // Larger body text
  'base': generateFluidMeditationScale(0), // Standard body text
  'sm': generateFluidMeditationScale(-0.5), // Small body text
  'xs': generateFluidMeditationScale(-1), // Captions and metadata
  'xxs': generateFluidMeditationScale(-1.5), // Tiny text
};

// 2025 Trend: Micro-typography for Enhanced Meditation Reading
export const meditationMicroTypography = {
  letterSpacing: {
    tighter: '-0.05em',  // For large headings
    tight: '-0.025em',   // For headings
    normal: '0',         // For body text
    wide: '0.025em',     // For small text
    wider: '0.05em',     // For captions
    widest: '0.1em',     // For button text
    meditation: '0.015em', // For calm, meditative text
  },
  
  // 2025: Advanced text spacing for meditation content
  wordSpacing: {
    tight: '-0.05em',
    normal: '0',
    wide: '0.1em',
    meditation: '0.05em', // Slightly wider for calm reading
  },
  
  textIndent: {
    sm: '1em',
    md: '1.5em',
    lg: '2em',
    meditation: '1.2em', // Optimal for meditation paragraphs
  },
  
  // 2025: Enhanced text decoration for meditation UI
  textDecoration: {
    underlineOffset: {
      sm: '0.1em',
      md: '0.2em',
      lg: '0.3em',
    },
    underlineThickness: {
      thin: '1px',
      medium: '2px',
      thick: '3px',
      meditation: '1.5px',
    }
  }
};

// 2025 Trend: Semantic Typography for Meditation Contexts
export const meditationSemanticTypography = {
  // Hero sections for meditation sessions
  hero: {
    fontFamily: meditationFontFamilies.heading.name,
    ...meditationTypographyScale['4xl'].desktop,
    letterSpacing: meditationMicroTypography.letterSpacing.tight,
    fontFeatureSettings: '"ss01" 1, "liga" 1',
    fontVariationSettings: meditationFontFamilies.heading.meditation.zen,
  },
  
  // Session titles
  sessionTitle: {
    fontFamily: meditationFontFamilies.heading.name,
    ...meditationTypographyScale['3xl'].desktop,
    letterSpacing: meditationMicroTypography.letterSpacing.tight,
    fontVariationSettings: meditationFontFamilies.heading.meditation.wisdom,
  },
  
  // Module headings
  moduleHeading: {
    fontFamily: meditationFontFamilies.primary.name,
    ...meditationTypographyScale['2xl'].desktop,
    letterSpacing: meditationMicroTypography.letterSpacing.normal,
    fontVariationSettings: meditationFontFamilies.primary.meditation.focus,
  },
  
  // Card titles
  cardTitle: {
    fontFamily: meditationFontFamilies.primary.name,
    ...meditationTypographyScale['xl'].desktop,
    letterSpacing: meditationMicroTypography.letterSpacing.normal,
    fontVariationSettings: meditationFontFamilies.primary.meditation.calm,
  },
  
  // Meditation instructions - optimized for calm reading
  meditationBody: {
    fontFamily: meditationFontFamilies.body.name,
    ...meditationTypographyScale['base'].desktop,
    letterSpacing: meditationMicroTypography.letterSpacing.meditation,
    wordSpacing: meditationMicroTypography.wordSpacing.meditation,
    lineHeight: '1.8', // Extra spacing for calm reading
    fontVariationSettings: meditationFontFamilies.body.meditation.reading,
  },
  
  // Regular body text
  body: {
    fontFamily: meditationFontFamilies.primary.name,
    ...meditationTypographyScale['base'].desktop,
    letterSpacing: meditationMicroTypography.letterSpacing.normal,
    fontVariationSettings: meditationFontFamilies.primary.meditation.calm,
  },
  
  // Guidance text - for meditation instructions
  guidance: {
    fontFamily: meditationFontFamilies.body.name,
    ...meditationTypographyScale['md'].desktop,
    letterSpacing: meditationMicroTypography.letterSpacing.wide,
    fontStyle: 'italic',
    fontVariationSettings: meditationFontFamilies.body.meditation.instructions,
  },
  
  // Wisdom quotes
  wisdom: {
    fontFamily: meditationFontFamilies.heading.name,
    ...meditationTypographyScale['lg'].desktop,
    letterSpacing: meditationMicroTypography.letterSpacing.normal,
    fontStyle: 'italic',
    textAlign: 'center' as const,
    fontVariationSettings: meditationFontFamilies.heading.meditation.wisdom,
  },
  
  // Captions and metadata
  caption: {
    fontFamily: meditationFontFamilies.primary.name,
    ...meditationTypographyScale['sm'].desktop,
    letterSpacing: meditationMicroTypography.letterSpacing.wider,
    textTransform: 'uppercase' as const,
    fontVariationSettings: meditationFontFamilies.primary.meditation.calm,
  },
  
  // Timer and technical text
  timer: {
    fontFamily: meditationFontFamilies.mono.name,
    ...meditationTypographyScale['2xl'].desktop,
    letterSpacing: meditationMicroTypography.letterSpacing.normal,
    fontFeatureSettings: '"tnum" 1', // Tabular numbers
  },
  
  // Button text
  button: {
    fontFamily: meditationFontFamilies.primary.name,
    ...meditationTypographyScale['sm'].desktop,
    letterSpacing: meditationMicroTypography.letterSpacing.widest,
    textTransform: 'uppercase' as const,
    fontVariationSettings: meditationFontFamilies.primary.meditation.focus,
  }
};

// CSS Custom Properties for Meditation Typography
export const meditationTypographyCSSVariables = {
  // Font families with meditation variations
  '--font-primary': meditationFontFamilies.primary.fallback,
  '--font-heading': meditationFontFamilies.heading.fallback,
  '--font-body': meditationFontFamilies.body.fallback,
  '--font-mono': meditationFontFamilies.mono.fallback,
  
  // Font variation settings
  '--font-variation-calm': meditationFontFamilies.primary.meditation.calm,
  '--font-variation-focus': meditationFontFamilies.primary.meditation.focus,
  '--font-variation-energy': meditationFontFamilies.primary.meditation.energy,
  '--font-variation-zen': meditationFontFamilies.heading.meditation.zen,
  '--font-variation-wisdom': meditationFontFamilies.heading.meditation.wisdom,
  '--font-variation-guidance': meditationFontFamilies.heading.meditation.guidance,
  
  // Letter spacing
  '--letter-spacing-meditation': meditationMicroTypography.letterSpacing.meditation,
  '--letter-spacing-tight': meditationMicroTypography.letterSpacing.tight,
  '--letter-spacing-normal': meditationMicroTypography.letterSpacing.normal,
  '--letter-spacing-wide': meditationMicroTypography.letterSpacing.wide,
  '--letter-spacing-wider': meditationMicroTypography.letterSpacing.wider,
  '--letter-spacing-widest': meditationMicroTypography.letterSpacing.widest,
  
  // Word spacing for meditation content
  '--word-spacing-meditation': meditationMicroTypography.wordSpacing.meditation,
  '--word-spacing-normal': meditationMicroTypography.wordSpacing.normal,
  '--word-spacing-wide': meditationMicroTypography.wordSpacing.wide,
  
  // Text indent for meditation paragraphs
  '--text-indent-meditation': meditationMicroTypography.textIndent.meditation,
};

// 2025: Typography utilities for meditation content
export const meditationTypographyUtilities = {
  // Text balance for meditation titles
  textWrap: {
    balance: 'text-wrap: balance',    // For headings
    pretty: 'text-wrap: pretty',     // For body text
    stable: 'text-wrap: stable',     // For consistent layout
    meditation: 'text-wrap: balance', // Optimal for meditation content
  },
  
  // Reading optimizations
  textRendering: {
    optimizeSpeed: 'text-rendering: optimizeSpeed',
    optimizeLegibility: 'text-rendering: optimizeLegibility', // For meditation text
    geometricPrecision: 'text-rendering: geometricPrecision',
  },
  
  // Font smoothing for better meditation reading
  fontSmoothing: {
    antialiased: '-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale',
    subpixelAntialiased: '-webkit-font-smoothing: subpixel-antialiased; -moz-osx-font-smoothing: auto',
  },
  
  // Font synthesis control
  fontSynthesis: {
    none: 'font-synthesis: none',
    weight: 'font-synthesis: weight',
    style: 'font-synthesis: style',
    meditation: 'font-synthesis: weight style', // Allow synthesis for meditation fonts
  },
  
  // Optical sizing for variable fonts
  fontOpticalSizing: {
    auto: 'font-optical-sizing: auto',
    none: 'font-optical-sizing: none',
  },
  
  // Text size adjustment for accessibility
  textSizeAdjust: {
    none: 'text-size-adjust: none',
    auto: 'text-size-adjust: auto',
    meditation: 'text-size-adjust: 110%', // Slightly larger for comfort
  }
};

// 2025: Dynamic typography based on meditation context
export const getDynamicMeditationTypography = (
  context: 'calm' | 'focus' | 'energy' | 'wisdom' | 'guidance',
  element: 'heading' | 'body' | 'caption'
) => {
  const baseStyle = meditationSemanticTypography[element === 'heading' ? 'moduleHeading' : 
                                                element === 'body' ? 'meditationBody' : 'caption'];
  
  const contextVariations = {
    calm: { fontWeight: 300, letterSpacing: '0.02em', lineHeight: '1.8' },
    focus: { fontWeight: 500, letterSpacing: '0em', lineHeight: '1.6' },
    energy: { fontWeight: 600, letterSpacing: '-0.01em', lineHeight: '1.5' },
    wisdom: { fontStyle: 'italic', fontWeight: 400, letterSpacing: '0.01em' },
    guidance: { fontWeight: 450, letterSpacing: '0.015em', lineHeight: '1.7' },
  };
  
  return {
    ...baseStyle,
    ...contextVariations[context],
  };
};