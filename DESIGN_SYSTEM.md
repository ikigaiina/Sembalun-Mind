# Sembalun Design System
# Sistem Desain Komprehensif untuk Platform Meditasi

## 🎨 Design Philosophy

### Core Principles
Sembalun Design System dibangun berdasarkan prinsip-prinsip fundamental yang mencerminkan nilai-nilai meditasi dan kearifan Indonesia:

1. **🧘‍♀️ Ketenangan (Serenity)** - Design yang menenangkan dan tidak mengganggu
2. **🏛️ Keaslian Budaya (Cultural Authenticity)** - Elemen visual yang menghormati tradisi Indonesia
3. **♿ Aksesibilitas (Accessibility)** - Inklusif untuk semua pengguna
4. **🌱 Kesederhanaan (Simplicity)** - Minimalis namun bermakna
5. **⚡ Responsivitas (Responsiveness)** - Adaptif di semua perangkat

### Design Values
```typescript
const designValues = {
  mindfulness: "Setiap elemen mendukung kesadaran dan fokus",
  respect: "Menghormati tradisi spiritual Indonesia",
  clarity: "Komunikasi visual yang jelas dan intuitif",
  harmony: "Keseimbangan antara tradisi dan modernitas",
  wellness: "Mendukung kesehatan mental dan spiritual"
};
```

## 🎯 Brand Identity

### Logo & Branding
```typescript
interface BrandIdentity {
  primary: {
    logo: "sembalun-primary.svg";
    symbol: "mountain-lotus.svg";
    wordmark: "sembalun-wordmark.svg";
  };
  variations: {
    dark: "sembalun-dark.svg";
    light: "sembalun-light.svg";
    monochrome: "sembalun-mono.svg";
    cultural: "sembalun-cultural.svg";
  };
  usage: {
    minSize: "24px";
    clearSpace: "2x logo height";
    backgrounds: ["light", "dark", "cultural"];
  };
}
```

### Brand Colors & Cultural Significance
```scss
// Primary Brand Colors
$colors: (
  // Core Brand
  'primary': (
    50: #f0f9ff,   // Langit pagi (Morning sky)
    100: #e0f2fe,  // Embun (Dew)
    200: #bae6fd,  // Air terjun (Waterfall)
    300: #7dd3fc,  // Danau (Lake)
    400: #38bdf8,  // Laut (Ocean)
    500: #0ea5e9,  // Sembalun Blue (Primary)
    600: #0284c7,  // Laut dalam (Deep ocean)
    700: #0369a1,  // Malam (Night)
    800: #075985,  // Langit malam (Night sky)
    900: #0c4a6e,  // Kedalaman (Depth)
  ),
  
  // Cultural Indonesian Colors
  'cultural': (
    'earth-brown': #8B4513,      // Tanah Indonesia
    'temple-gold': #FFD700,      // Emas candi
    'lotus-white': #FFFAF0,      // Putih teratai
    'bamboo-green': #9ACD32,     // Hijau bambu
    'spiritual-purple': #663399,  // Ungu spiritual
    'batik-indigo': #4B0082,     // Indigo batik
    'sunset-orange': #FF6B35,    // Jingga senja
    'rice-field': #7CB342,       // Hijau sawah
  ),
  
  // Semantic Colors
  'semantic': (
    'success': #22c55e,    // Hijau sukses
    'warning': #f59e0b,    // Kuning peringatan
    'error': #ef4444,      // Merah error
    'info': #3b82f6,       // Biru informasi
  ),
  
  // Neutral Grays
  'neutral': (
    50: #fafafa,
    100: #f5f5f5,
    200: #e5e5e5,
    300: #d4d4d4,
    400: #a3a3a3,
    500: #737373,
    600: #525252,
    700: #404040,
    800: #262626,
    900: #171717,
  )
);
```

## 📝 Typography System

### Font Families
```scss
// Primary Font Stack
$font-families: (
  'primary': ('Inter', 'system-ui', '-apple-system', 'sans-serif'),
  'heading': ('Poppins', 'Inter', 'system-ui', 'sans-serif'),
  'cultural': ('Noto Sans Indonesian', 'Inter', 'system-ui', 'sans-serif'),
  'monospace': ('JetBrains Mono', 'Consolas', 'Monaco', 'monospace'),
);

// Font Weights
$font-weights: (
  'thin': 100,
  'extralight': 200,
  'light': 300,
  'normal': 400,
  'medium': 500,
  'semibold': 600,
  'bold': 700,
  'extrabold': 800,
  'black': 900,
);
```

### Typography Scale
```typescript
interface TypographyScale {
  // Display Typography
  display: {
    '4xl': { fontSize: '3.5rem', lineHeight: '1.1', fontWeight: 'bold' };
    '3xl': { fontSize: '3rem', lineHeight: '1.15', fontWeight: 'bold' };
    '2xl': { fontSize: '2.5rem', lineHeight: '1.2', fontWeight: 'bold' };
    'xl': { fontSize: '2rem', lineHeight: '1.25', fontWeight: 'bold' };
  };
  
  // Heading Typography
  heading: {
    'h1': { fontSize: '1.875rem', lineHeight: '1.3', fontWeight: 'semibold' };
    'h2': { fontSize: '1.5rem', lineHeight: '1.35', fontWeight: 'semibold' };
    'h3': { fontSize: '1.25rem', lineHeight: '1.4', fontWeight: 'medium' };
    'h4': { fontSize: '1.125rem', lineHeight: '1.45', fontWeight: 'medium' };
    'h5': { fontSize: '1rem', lineHeight: '1.5', fontWeight: 'medium' };
    'h6': { fontSize: '0.875rem', lineHeight: '1.5', fontWeight: 'medium' };
  };
  
  // Body Typography
  body: {
    'lg': { fontSize: '1.125rem', lineHeight: '1.6', fontWeight: 'normal' };
    'base': { fontSize: '1rem', lineHeight: '1.6', fontWeight: 'normal' };
    'sm': { fontSize: '0.875rem', lineHeight: '1.5', fontWeight: 'normal' };
    'xs': { fontSize: '0.75rem', lineHeight: '1.4', fontWeight: 'normal' };
  };
  
  // Cultural Typography
  cultural: {
    'title': { fontSize: '1.5rem', lineHeight: '1.35', fontWeight: 'medium', fontFamily: 'cultural' };
    'subtitle': { fontSize: '1.125rem', lineHeight: '1.45', fontWeight: 'normal', fontFamily: 'cultural' };
    'body': { fontSize: '1rem', lineHeight: '1.6', fontWeight: 'normal', fontFamily: 'cultural' };
  };
}
```

### Typography Usage Guidelines
```scss
// Cultural Text Styling
.cultural-title {
  @apply text-2xl font-medium text-cultural-earth-brown;
  font-family: 'Noto Sans Indonesian', system-ui;
  letter-spacing: 0.025em;
}

.spiritual-text {
  @apply text-lg text-cultural-spiritual-purple;
  font-style: italic;
  line-height: 1.7;
}

.meditation-quote {
  @apply text-xl text-center text-cultural-temple-gold;
  font-weight: 300;
  line-height: 1.8;
  font-style: italic;
}
```

## 📏 Spacing & Layout System

### Spacing Scale
```scss
// Base unit: 4px (0.25rem)
$spacing: (
  'px': 1px,
  '0': 0,
  '0.5': 0.125rem,  // 2px
  '1': 0.25rem,     // 4px
  '1.5': 0.375rem,  // 6px
  '2': 0.5rem,      // 8px
  '2.5': 0.625rem,  // 10px
  '3': 0.75rem,     // 12px
  '3.5': 0.875rem,  // 14px
  '4': 1rem,        // 16px
  '5': 1.25rem,     // 20px
  '6': 1.5rem,      // 24px
  '7': 1.75rem,     // 28px
  '8': 2rem,        // 32px
  '9': 2.25rem,     // 36px
  '10': 2.5rem,     // 40px
  '11': 2.75rem,    // 44px
  '12': 3rem,       // 48px
  '14': 3.5rem,     // 56px
  '16': 4rem,       // 64px
  '20': 5rem,       // 80px
  '24': 6rem,       // 96px
  '28': 7rem,       // 112px
  '32': 8rem,       // 128px
  '36': 9rem,       // 144px
  '40': 10rem,      // 160px
  '44': 11rem,      // 176px
  '48': 12rem,      // 192px
  '52': 13rem,      // 208px
  '56': 14rem,      // 224px
  '60': 15rem,      // 240px
  '64': 16rem,      // 256px
  '72': 18rem,      // 288px
  '80': 20rem,      // 320px
  '96': 24rem,      // 384px
);
```

### Grid System
```typescript
interface GridSystem {
  // Breakpoints
  breakpoints: {
    xs: '0px';      // Mobile portrait
    sm: '640px';    // Mobile landscape
    md: '768px';    // Tablet portrait
    lg: '1024px';   // Tablet landscape
    xl: '1280px';   // Desktop
    '2xl': '1536px'; // Large desktop
  };
  
  // Container sizes
  containers: {
    xs: '100%';
    sm: '640px';
    md: '768px';
    lg: '1024px';
    xl: '1280px';
    '2xl': '1536px';
  };
  
  // Grid columns
  columns: 12;
  gap: '1rem'; // 16px
  
  // Meditation-specific layouts
  layouts: {
    'session': { columns: 1, maxWidth: '480px' };
    'dashboard': { columns: 2, gap: '2rem' };
    'explore': { columns: 3, gap: '1.5rem' };
    'admin': { columns: 4, gap: '1rem' };
  };
}
```

## 🎨 Component Design Tokens

### Button Variants
```typescript
interface ButtonVariants {
  // Primary Actions
  primary: {
    background: 'primary-500';
    color: 'white';
    border: 'none';
    shadow: 'md';
    hover: { background: 'primary-600', shadow: 'lg' };
    active: { background: 'primary-700' };
    disabled: { background: 'neutral-300', color: 'neutral-500' };
  };
  
  // Cultural Actions
  cultural: {
    background: 'cultural-temple-gold';
    color: 'cultural-earth-brown';
    border: '2px solid cultural-earth-brown';
    hover: { background: 'cultural-earth-brown', color: 'cultural-lotus-white' };
  };
  
  // Meditation Actions
  meditation: {
    background: 'gradient(cultural-spiritual-purple, primary-500)';
    color: 'white';
    border: 'none';
    shadow: 'lg';
    hover: { transform: 'translateY(-2px)', shadow: 'xl' };
  };
  
  // Secondary Actions
  secondary: {
    background: 'transparent';
    color: 'primary-600';
    border: '1px solid primary-200';
    hover: { background: 'primary-50', border: 'primary-300' };
  };
  
  // Ghost Actions
  ghost: {
    background: 'transparent';
    color: 'neutral-700';
    border: 'none';
    hover: { background: 'neutral-100' };
  };
}
```

### Card Components
```scss
// Base Card Styles
.card {
  @apply bg-white rounded-xl shadow-md border border-neutral-100;
  transition: all 0.3s ease;
  
  &:hover {
    @apply shadow-lg transform -translate-y-1;
  }
  
  // Cultural Card Variant
  &.cultural {
    @apply border-cultural-temple-gold border-2;
    background: linear-gradient(135deg, #FFFAF0 0%, #FFF8E7 100%);
    
    .card-header {
      @apply text-cultural-earth-brown border-b border-cultural-temple-gold;
    }
  }
  
  // Meditation Card Variant
  &.meditation {
    background: linear-gradient(135deg, #663399 0%, #0ea5e9 100%);
    @apply text-white shadow-xl;
    
    &:hover {
      @apply shadow-2xl;
    }
  }
  
  // Elevated Card
  &.elevated {
    @apply shadow-xl border-0;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
}
```

### Form Elements
```typescript
interface FormElements {
  input: {
    base: {
      padding: 'py-3 px-4';
      border: '1px solid neutral-300';
      borderRadius: 'rounded-lg';
      fontSize: 'text-base';
      background: 'white';
      transition: 'all 0.2s ease';
    };
    focus: {
      borderColor: 'primary-500';
      boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)';
      outline: 'none';
    };
    error: {
      borderColor: 'error';
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)';
    };
    cultural: {
      borderColor: 'cultural-temple-gold';
      background: 'cultural-lotus-white';
    };
  };
  
  label: {
    base: {
      fontSize: 'text-sm';
      fontWeight: 'medium';
      color: 'neutral-700';
      marginBottom: 'mb-2';
    };
    required: {
      '&::after': { content: '"*"', color: 'error', marginLeft: '2px' };
    };
  };
  
  select: {
    base: {
      appearance: 'none';
      backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg...")';
      backgroundPosition: 'right 12px center';
      backgroundRepeat: 'no-repeat';
      backgroundSize: '16px';
      paddingRight: '40px';
    };
  };
}
```

## 🌟 Cultural Design Elements

### Indonesian Design Motifs
```typescript
interface CulturalElements {
  patterns: {
    batik: {
      primary: 'batik-kawung.svg';
      secondary: 'batik-parang.svg';
      accent: 'batik-truntum.svg';
      usage: ['backgrounds', 'borders', 'decorative elements'];
    };
    temple: {
      borobudur: 'borobudur-relief.svg';
      prambanan: 'prambanan-ornament.svg';
      usage: ['headers', 'dividers', 'cultural sections'];
    };
    nature: {
      lotus: 'lotus-bloom.svg';
      bamboo: 'bamboo-pattern.svg';
      mountain: 'mountain-silhouette.svg';
      usage: ['meditation sections', 'wellness content'];
    };
  };
  
  colors: {
    traditional: {
      'sogan': '#8B4513',      // Coklat sogan
      'indigo': '#4B0082',     // Indigo batik
      'emas': '#FFD700',       // Emas tradisional
      'putih': '#FFFAF0',      // Putih gading
    };
    spiritual: {
      'ungu-mistis': '#663399',  // Ungu spiritual
      'biru-samudra': '#0ea5e9', // Biru samudra
      'hijau-alam': '#22c55e',   // Hijau alam
    };
  };
  
  typography: {
    traditional: {
      fontFamily: '"Noto Sans Javanese", "Noto Sans Indonesian"';
      letterSpacing: '0.05em';
      lineHeight: '1.7';
    };
  };
}
```

### Cultural Component Examples
```scss
// Traditional Indonesian Card
.indonesian-card {
  position: relative;
  @apply bg-cultural-lotus-white border-2 border-cultural-temple-gold rounded-xl;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      var(--cultural-temple-gold) 0%, 
      var(--cultural-earth-brown) 50%, 
      var(--cultural-temple-gold) 100%
    );
    border-radius: 8px 8px 0 0;
  }
  
  .header {
    @apply text-cultural-earth-brown border-b border-cultural-temple-gold;
    font-family: 'Noto Sans Indonesian', system-ui;
  }
}

// Meditation Session UI
.meditation-session {
  background: radial-gradient(circle at center, 
    rgba(102, 51, 153, 0.1) 0%, 
    rgba(14, 165, 233, 0.05) 100%
  );
  @apply rounded-2xl p-8;
  
  .timer-display {
    @apply text-6xl font-light text-cultural-spiritual-purple;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .controls {
    @apply flex justify-center space-x-4 mt-8;
    
    button {
      @apply bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4;
      transition: all 0.3s ease;
      
      &:hover {
        @apply bg-opacity-30 transform scale-110;
      }
    }
  }
}
```

## 📱 Responsive Design Guidelines

### Breakpoint Strategy
```typescript
interface ResponsiveStrategy {
  approach: 'mobile-first';
  
  breakpoints: {
    mobile: {
      range: '0px - 639px';
      columns: 1;
      spacing: 'tight';
      components: 'stacked';
      navigation: 'bottom-tabs';
    };
    tablet: {
      range: '640px - 1023px';
      columns: 2;
      spacing: 'comfortable';
      components: 'flexible';
      navigation: 'sidebar-collapsible';
    };
    desktop: {
      range: '1024px+';
      columns: 3;
      spacing: 'spacious';
      components: 'full-featured';
      navigation: 'sidebar-expanded';
    };
  };
  
  adaptiveComponents: {
    'meditation-timer': {
      mobile: 'fullscreen-modal';
      tablet: 'centered-card';
      desktop: 'sidebar-panel';
    };
    'content-grid': {
      mobile: 'single-column';
      tablet: 'two-column';
      desktop: 'three-column';
    };
    'navigation': {
      mobile: 'bottom-tabs';
      tablet: 'collapsible-sidebar';
      desktop: 'expanded-sidebar';
    };
  };
}
```

### Component Responsive Patterns
```scss
// Responsive Card Grid
.content-grid {
  display: grid;
  gap: 1rem;
  
  // Mobile: Single column
  grid-template-columns: 1fr;
  
  // Tablet: Two columns
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  // Desktop: Three columns
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
  
  // Large desktop: Four columns
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

// Responsive Typography
.responsive-heading {
  // Mobile
  @apply text-2xl leading-tight;
  
  // Tablet
  @screen md {
    @apply text-3xl leading-tight;
  }
  
  // Desktop
  @screen lg {
    @apply text-4xl leading-tight;
  }
}

// Responsive Spacing
.responsive-section {
  // Mobile
  @apply py-8 px-4;
  
  // Tablet
  @screen md {
    @apply py-12 px-6;
  }
  
  // Desktop
  @screen lg {
    @apply py-16 px-8;
  }
}
```

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance
```typescript
interface AccessibilityStandards {
  colorContrast: {
    normalText: 4.5; // AA standard
    largeText: 3.0;  // AA standard
    nonTextElements: 3.0;
  };
  
  focusManagement: {
    focusVisible: true;
    focusWithin: true;
    keyboardNavigation: true;
    skipLinks: true;
  };
  
  semanticHTML: {
    headingHierarchy: true;
    landmarkRegions: true;
    formLabeling: true;
    altText: true;
  };
  
  screenReaderSupport: {
    ariaLabels: true;
    ariaDescriptions: true;
    liveRegions: true;
    roleAttributes: true;
  };
}
```

### Accessible Component Implementation
```scss
// Focus Management
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
  border-radius: 4px;
}

// High Contrast Support
@media (prefers-contrast: high) {
  .button {
    border: 2px solid currentColor;
  }
  
  .card {
    border: 1px solid var(--neutral-900);
  }
}

// Reduced Motion Support
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// Color Blind Friendly
.success-indicator {
  // Don't rely only on color
  &::before {
    content: '✓';
    margin-right: 0.5rem;
  }
}

.error-indicator {
  &::before {
    content: '⚠';
    margin-right: 0.5rem;
  }
}
```

## 🎭 Animation & Transitions

### Animation Principles
```typescript
interface AnimationSystem {
  duration: {
    'instant': '0ms';
    'fast': '150ms';
    'normal': '300ms';
    'slow': '500ms';
    'slower': '750ms';
  };
  
  easing: {
    'linear': 'linear';
    'ease': 'ease';
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)';
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)';
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)';
    'meditation': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  };
  
  // Meditation-specific animations
  meditative: {
    'breathe': {
      duration: '4s';
      easing: 'ease-in-out';
      direction: 'alternate';
      iterationCount: 'infinite';
    };
    'pulse': {
      duration: '2s';
      easing: 'ease-in-out';
      direction: 'alternate';
      iterationCount: 'infinite';
    };
    'float': {
      duration: '6s';
      easing: 'ease-in-out';
      direction: 'alternate';
      iterationCount: 'infinite';
    };
  };
}
```

### Cultural Animations
```scss
// Breathing Animation (for meditation)
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
}

.meditation-indicator {
  animation: breathe 4s ease-in-out infinite;
}

// Lotus Bloom Animation
@keyframes lotus-bloom {
  0% { transform: scale(0.8) rotate(-5deg); opacity: 0.5; }
  50% { transform: scale(1.05) rotate(2deg); opacity: 0.8; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.cultural-lotus {
  animation: lotus-bloom 2s ease-out forwards;
}

// Water Ripple Effect
@keyframes ripple {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
}

.meditation-ripple {
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: ripple 0.6s linear;
  }
}

// Gentle Page Transitions
.page-transition-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-transition-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease-out;
}

.page-transition-exit {
  opacity: 1;
  transform: translateY(0);
}

.page-transition-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.3s ease-in;
}
```

## 🛠️ Implementation Guidelines

### CSS Architecture (ITCSS + BEM)
```scss
// 1. Settings - Global variables
@import 'settings/colors';
@import 'settings/typography';
@import 'settings/spacing';

// 2. Tools - Mixins and functions
@import 'tools/mixins';
@import 'tools/functions';

// 3. Generic - Reset and normalize
@import 'generic/reset';
@import 'generic/normalize';

// 4. Elements - Base HTML elements
@import 'elements/headings';
@import 'elements/forms';
@import 'elements/links';

// 5. Objects - Layout patterns
@import 'objects/container';
@import 'objects/grid';
@import 'objects/media';

// 6. Components - UI components
@import 'components/button';
@import 'components/card';
@import 'components/modal';
@import 'components/meditation-timer';

// 7. Utilities - Helper classes
@import 'utilities/spacing';
@import 'utilities/typography';
@import 'utilities/display';
```

### Component Naming Convention (BEM)
```scss
// Block
.meditation-session { }

// Element
.meditation-session__timer { }
.meditation-session__controls { }
.meditation-session__progress { }

// Modifier
.meditation-session--active { }
.meditation-session--paused { }
.meditation-session__timer--large { }

// Cultural variant
.meditation-session--javanese { }
.meditation-session--balinese { }
```

### TypeScript Design Tokens
```typescript
// Design Tokens Type Definitions
export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  borders: BorderTokens;
  animations: AnimationTokens;
}

export interface ColorTokens {
  primary: ColorScale;
  cultural: CulturalColors;
  semantic: SemanticColors;
  neutral: ColorScale;
}

export interface CulturalColors {
  earthBrown: string;
  templeGold: string;
  lotusWhite: string;
  bambooGreen: string;
  spiritualPurple: string;
  batikIndigo: string;
  sunsetOrange: string;
  riceField: string;
}

// Usage in components
import { designTokens } from '@/design-system';

const MeditationCard = styled.div`
  background: ${designTokens.colors.cultural.lotusWhite};
  border: 2px solid ${designTokens.colors.cultural.templeGold};
  border-radius: ${designTokens.borders.radius.lg};
  padding: ${designTokens.spacing[6]};
  box-shadow: ${designTokens.shadows.md};
`;
```

## 📚 Component Library Structure

### Component Organization
```
src/design-system/
├── foundations/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── animations.ts
├── components/
│   ├── primitives/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   └── Modal/
│   ├── cultural/
│   │   ├── IndonesianCard/
│   │   ├── CulturalTimer/
│   │   ├── TraditionalButton/
│   │   └── SpiritualQuote/
│   ├── meditation/
│   │   ├── MeditationTimer/
│   │   ├── BreathingGuide/
│   │   ├── SessionControls/
│   │   └── ProgressTracker/
│   └── layout/
│       ├── Header/
│       ├── Sidebar/
│       ├── Container/
│       └── Grid/
├── patterns/
│   ├── forms/
│   ├── navigation/
│   ├── data-display/
│   └── feedback/
└── utilities/
    ├── helpers.ts
    ├── constants.ts
    └── themes.ts
```

### Component Template
```typescript
// Component Template: Button
import React from 'react';
import { styled } from '@stitches/react';
import { designTokens } from '../foundations';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'cultural' | 'meditation';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const StyledButton = styled('button', {
  // Base styles
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: designTokens.typography.fontFamily.primary,
  fontWeight: designTokens.typography.fontWeight.medium,
  borderRadius: designTokens.borders.radius.md,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  // Focus styles
  '&:focus-visible': {
    outline: `2px solid ${designTokens.colors.primary[500]}`,
    outlineOffset: '2px',
  },
  
  // Variants
  variants: {
    variant: {
      primary: {
        backgroundColor: designTokens.colors.primary[500],
        color: 'white',
        '&:hover': {
          backgroundColor: designTokens.colors.primary[600],
        },
      },
      cultural: {
        backgroundColor: designTokens.colors.cultural.templeGold,
        color: designTokens.colors.cultural.earthBrown,
        border: `2px solid ${designTokens.colors.cultural.earthBrown}`,
        '&:hover': {
          backgroundColor: designTokens.colors.cultural.earthBrown,
          color: designTokens.colors.cultural.lotusWhite,
        },
      },
      meditation: {
        background: `linear-gradient(135deg, ${designTokens.colors.cultural.spiritualPurple}, ${designTokens.colors.primary[500]})`,
        color: 'white',
        boxShadow: designTokens.shadows.lg,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: designTokens.shadows.xl,
        },
      },
    },
    size: {
      sm: {
        padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
        fontSize: designTokens.typography.fontSize.sm,
      },
      md: {
        padding: `${designTokens.spacing[3]} ${designTokens.spacing[4]}`,
        fontSize: designTokens.typography.fontSize.base,
      },
      lg: {
        padding: `${designTokens.spacing[4]} ${designTokens.spacing[6]}`,
        fontSize: designTokens.typography.fontSize.lg,
      },
    },
    isDisabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        '&:hover': {
          transform: 'none',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  isLoading,
  children,
  onClick,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      isDisabled={isDisabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? <LoadingSpinner /> : children}
    </StyledButton>
  );
};
```

## 🎨 Dark Mode Support

### Dark Theme Configuration
```typescript
interface DarkTheme {
  colors: {
    background: {
      primary: '#0f172a';     // Dark slate
      secondary: '#1e293b';   // Lighter slate
      tertiary: '#334155';    // Card backgrounds
    };
    text: {
      primary: '#f1f5f9';     // Light text
      secondary: '#cbd5e1';   // Muted text
      tertiary: '#94a3b8';    // Disabled text
    };
    cultural: {
      earthBrown: '#d2691e';    // Lighter brown for dark mode
      templeGold: '#ffd700';    // Same gold (good contrast)
      lotusWhite: '#1e293b';    // Dark background
      spiritualPurple: '#8b5cf6'; // Lighter purple
    };
  };
  
  meditation: {
    sessionBackground: 'radial-gradient(circle, rgba(139, 92, 246, 0.1), rgba(15, 23, 42, 0.9))';
    timerGlow: '0 0 20px rgba(139, 92, 246, 0.3)';
    controlsBackground: 'rgba(255, 255, 255, 0.05)';
  };
}
```

### Theme Implementation
```scss
// CSS Custom Properties for theming
:root {
  // Light theme (default)
  --bg-primary: #{$colors-neutral-50};
  --bg-secondary: #{$colors-neutral-100};
  --text-primary: #{$colors-neutral-900};
  --text-secondary: #{$colors-neutral-700};
  
  // Cultural colors
  --cultural-earth: #{$colors-cultural-earth-brown};
  --cultural-gold: #{$colors-cultural-temple-gold};
  --cultural-lotus: #{$colors-cultural-lotus-white};
}

// Dark theme
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  
  // Adjusted cultural colors for dark mode
  --cultural-earth: #d2691e;
  --cultural-gold: #ffd700;
  --cultural-lotus: #1e293b;
}

// Auto dark mode
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
  }
}
```

---

**Sembalun Design System ini menyediakan foundation yang komprehensif untuk membangun interface yang beautiful, accessible, dan culturally-authentic. Sistem ini menggabungkan modern design principles dengan kearifan budaya Indonesia untuk menciptakan experience yang unik dan bermakna bagi pengguna.** 🎨✨

Design system ini akan terus berkembang seiring dengan pertumbuhan platform Sembalun, sambil tetap mempertahankan konsistensi visual dan cultural authenticity yang menjadi core value aplikasi.