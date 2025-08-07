/**
 * Sembalun Design System - Spacing Foundation
 * Consistent spacing system based on 4px base unit
 */

// ============= BASE SPACING UNIT =============

export const baseUnit = 4; // 4px base unit

// ============= SPACING SCALE =============

export interface SpacingScale {
  px: string;
  0: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export const spacing: SpacingScale = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

// ============= SEMANTIC SPACING =============

export interface SemanticSpacing {
  // Component internal spacing
  componentPadding: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Gap between elements
  gap: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Section spacing
  section: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Meditation-specific spacing
  meditation: {
    timerPadding: string;
    controlsGap: string;
    sessionSpacing: string;
    breathingGap: string;
  };
  
  // Cultural component spacing
  cultural: {
    cardPadding: string;
    ornamentGap: string;
    quoteSpacing: string;
    traditionSpacing: string;
  };
}

export const semanticSpacing: SemanticSpacing = {
  // Component internal spacing
  componentPadding: {
    xs: spacing[2],    // 8px
    sm: spacing[3],    // 12px
    md: spacing[4],    // 16px
    lg: spacing[6],    // 24px
    xl: spacing[8],    // 32px
  },
  
  // Gap between elements
  gap: {
    xs: spacing[1],    // 4px
    sm: spacing[2],    // 8px
    md: spacing[4],    // 16px
    lg: spacing[6],    // 24px
    xl: spacing[8],    // 32px
  },
  
  // Section spacing
  section: {
    xs: spacing[8],    // 32px
    sm: spacing[12],   // 48px
    md: spacing[16],   // 64px
    lg: spacing[20],   // 80px
    xl: spacing[24],   // 96px
  },
  
  // Meditation-specific spacing
  meditation: {
    timerPadding: spacing[8],     // 32px - comfortable space around timer
    controlsGap: spacing[4],      // 16px - space between control buttons
    sessionSpacing: spacing[6],   // 24px - space between session elements
    breathingGap: spacing[3],     // 12px - tight spacing for breathing guides
  },
  
  // Cultural component spacing
  cultural: {
    cardPadding: spacing[6],        // 24px - traditional card padding
    ornamentGap: spacing[2],        // 8px - space between ornamental elements
    quoteSpacing: spacing[8],       // 32px - generous space around quotes
    traditionSpacing: spacing[12],  // 48px - space between tradition sections
  },
};

// ============= RESPONSIVE SPACING =============

export interface ResponsiveSpacing {
  mobile: string;
  tablet: string;
  desktop: string;
}

export const responsiveSpacing = {
  // Page margins
  pageMargin: {
    mobile: spacing[4],    // 16px
    tablet: spacing[6],    // 24px
    desktop: spacing[8],   // 32px
  },
  
  // Section padding
  sectionPadding: {
    mobile: spacing[8],    // 32px
    tablet: spacing[12],   // 48px
    desktop: spacing[16],  // 64px
  },
  
  // Grid gaps
  gridGap: {
    mobile: spacing[4],    // 16px
    tablet: spacing[6],    // 24px
    desktop: spacing[8],   // 32px
  },
  
  // Card spacing
  cardSpacing: {
    mobile: spacing[4],    // 16px
    tablet: spacing[6],    // 24px
    desktop: spacing[8],   // 32px
  },
};

// ============= LAYOUT SPACING =============

export interface LayoutSpacing {
  container: {
    padding: string;
    maxWidth: string;
  };
  
  grid: {
    gap: string;
    columnGap: string;
    rowGap: string;
  };
  
  flexbox: {
    gap: string;
  };
}

export const layoutSpacing: LayoutSpacing = {
  container: {
    padding: spacing[4],      // 16px default container padding
    maxWidth: '1280px',       // Maximum container width
  },
  
  grid: {
    gap: spacing[6],          // 24px default grid gap
    columnGap: spacing[6],    // 24px column gap
    rowGap: spacing[8],       // 32px row gap
  },
  
  flexbox: {
    gap: spacing[4],          // 16px default flexbox gap
  },
};

// ============= CULTURAL SPACING PATTERNS =============

export interface CulturalSpacing {
  javanese: {
    cardPadding: string;
    elementGap: string;
    ornamentSpacing: string;
  };
  balinese: {
    cardPadding: string;
    elementGap: string;
    ornamentSpacing: string;
  };
  sundanese: {
    cardPadding: string;
    elementGap: string;
    ornamentSpacing: string;
  };
  minang: {
    cardPadding: string;
    elementGap: string;
    ornamentSpacing: string;
  };
}

export const culturalSpacing: CulturalSpacing = {
  javanese: {
    cardPadding: spacing[6],      // 24px - traditional Javanese proportions
    elementGap: spacing[4],       // 16px - balanced spacing
    ornamentSpacing: spacing[2],  // 8px - tight ornamental spacing
  },
  balinese: {
    cardPadding: spacing[8],      // 32px - generous Balinese spacing
    elementGap: spacing[6],       // 24px - spacious layout
    ornamentSpacing: spacing[3],  // 12px - ornate decorative spacing
  },
  sundanese: {
    cardPadding: spacing[5],      // 20px - natural Sundanese spacing
    elementGap: spacing[4],       // 16px - comfortable spacing
    ornamentSpacing: spacing[2],  // 8px - subtle decoration
  },
  minang: {
    cardPadding: spacing[6],      // 24px - structured Minang spacing
    elementGap: spacing[5],       // 20px - organized layout
    ornamentSpacing: spacing[3],  // 12px - architectural spacing
  },
};

// ============= MEDITATION SPACING PATTERNS =============

export interface MeditationSpacing {
  session: {
    containerPadding: string;
    timerMargin: string;
    controlsGap: string;
    progressGap: string;
  };
  
  breathing: {
    guideSpacing: string;
    instructionGap: string;
    visualGap: string;
  };
  
  progress: {
    cardGap: string;
    statsSpacing: string;
    chartMargin: string;
  };
}

export const meditationSpacing: MeditationSpacing = {
  session: {
    containerPadding: spacing[8],   // 32px - comfortable session container
    timerMargin: spacing[12],       // 48px - prominent timer spacing
    controlsGap: spacing[6],        // 24px - clear control separation
    progressGap: spacing[4],        // 16px - progress indicator spacing
  },
  
  breathing: {
    guideSpacing: spacing[10],      // 40px - breathing guide separation
    instructionGap: spacing[6],     // 24px - instruction clarity
    visualGap: spacing[8],          // 32px - visual element spacing
  },
  
  progress: {
    cardGap: spacing[6],            // 24px - progress card spacing
    statsSpacing: spacing[8],       // 32px - statistics separation
    chartMargin: spacing[4],        // 16px - chart margins
  },
};

// ============= SPACING UTILITIES =============

export const spacingUtilities = {
  /**
   * Convert spacing key to pixel value
   */
  toPixels: (spacingKey: keyof SpacingScale): number => {
    const value = spacing[spacingKey];
    if (value === '0') return 0;
    if (value === '1px') return 1;
    
    // Convert rem to pixels (assuming 1rem = 16px)
    const remValue = parseFloat(value.replace('rem', ''));
    return remValue * 16;
  },

  /**
   * Create custom spacing value
   */
  createSpacing: (multiplier: number): string => {
    return `${multiplier * (baseUnit / 16)}rem`;
  },

  /**
   * Get responsive spacing CSS
   */
  getResponsiveSpacing: (
    property: 'margin' | 'padding', 
    responsive: ResponsiveSpacing
  ): string => {
    return `
      ${property}: ${responsive.mobile};
      
      @media (min-width: 768px) {
        ${property}: ${responsive.tablet};
      }
      
      @media (min-width: 1024px) {
        ${property}: ${responsive.desktop};
      }
    `;
  },

  /**
   * Get cultural spacing for specific tradition
   */
  getCulturalSpacing: (tradition: keyof CulturalSpacing) => {
    return culturalSpacing[tradition];
  },

  /**
   * Generate spacing scale CSS variables
   */
  generateCssVariables: (): string => {
    return Object.entries(spacing)
      .map(([key, value]) => `  --spacing-${key}: ${value};`)
      .join('\n');
  },
};

// ============= SPACING TOKENS EXPORT =============

export const spacingTokens = {
  baseUnit,
  spacing,
  semantic: semanticSpacing,
  responsive: responsiveSpacing,
  layout: layoutSpacing,
  cultural: culturalSpacing,
  meditation: meditationSpacing,
  utilities: spacingUtilities,
};

export default spacingTokens;