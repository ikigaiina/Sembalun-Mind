# Design System Implementation Guide
# Panduan Implementasi Design System Sembalun untuk Developers

## 🚀 Getting Started

### Quick Setup (5 menit)
```bash
# 1. Clone repository
git clone https://github.com/sembalun/meditation-app.git
cd meditation-app

# 2. Install dependencies
npm install

# 3. Setup design system
npm run setup:design-system

# 4. Start development with Storybook
npm run storybook
```

### Project Structure Overview
```
src/
├── design-system/
│   ├── tokens/              # Design tokens
│   ├── components/          # Component library
│   ├── patterns/           # Design patterns
│   └── themes/             # Theme configurations
├── components/
│   ├── primitives/         # Basic UI components
│   ├── cultural/           # Indonesian cultural components
│   ├── meditation/         # Meditation-specific components
│   └── layout/            # Layout components
├── styles/
│   ├── globals.css        # Global styles
│   ├── tokens.css         # CSS custom properties
│   └── cultural.css       # Cultural theme styles
└── utils/
    ├── design-tokens.ts   # Token utilities
    └── theme-helpers.ts   # Theme helper functions
```

## 🎨 Design Tokens Implementation

### Using Design Tokens in Components
```typescript
// Method 1: Direct token import
import { tokens } from '@/design-system/tokens';

const MyComponent = styled.div`
  color: ${tokens.color.primary[500]};
  font-family: ${tokens.typography.fontFamily.primary.join(', ')};
  padding: ${tokens.spacing[4]};
  border-radius: ${tokens.border.radius.lg};
`;

// Method 2: CSS Custom Properties
const MyComponent = styled.div`
  color: var(--color-primary-500);
  font-family: var(--font-family-primary);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-lg);
`;

// Method 3: Tailwind CSS Classes
const MyComponent = () => (
  <div className="text-primary-500 font-primary p-4 rounded-lg">
    Content
  </div>
);
```

### Dynamic Token Access
```typescript
// Token utility function
import { getToken } from '@/utils/design-tokens';

// Usage in components
const MyComponent = ({ variant }: { variant: 'primary' | 'cultural' }) => {
  const backgroundColor = getToken(
    variant === 'primary' 
      ? 'color.primary.500' 
      : 'color.cultural.templeGold'
  );
  
  return (
    <div style={{ backgroundColor }}>
      Content
    </div>
  );
};

// Advanced token utilities
export const useDesignTokens = () => {
  const getColorToken = (path: string) => getToken(`color.${path}`);
  const getSpacingToken = (size: string) => getToken(`spacing.${size}`);
  const getTypographyToken = (property: string) => getToken(`typography.${property}`);
  
  return {
    getColorToken,
    getSpacingToken,
    getTypographyToken,
  };
};
```

## 🧩 Component Usage Guide

### Basic Components
```typescript
// Button Implementation
import { Button } from '@/components/primitives/Button';

// Basic usage
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Cultural variant
<Button variant="cultural" icon="🧘‍♀️">
  Mulai Meditasi
</Button>

// Meditation variant with loading
<Button variant="meditation" size="lg" isLoading>
  Spiritual Journey
</Button>

// Input Implementation
import { Input } from '@/components/primitives/Input';

// Basic input
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  isRequired
/>

// Cultural input
<Input
  variant="cultural"
  label="Nama Lengkap"
  placeholder="Masukkan nama lengkap Anda"
  helper="Nama akan digunakan dalam sertifikat meditasi"
/>

// Card Implementation
import { Card } from '@/components/primitives/Card';

// Basic card
<Card variant="default" isHoverable>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
  </Card.Header>
  <Card.Content>
    Card content goes here
  </Card.Content>
  <Card.Footer>
    <Button size="sm">Action</Button>
  </Card.Footer>
</Card>

// Cultural card
<Card variant="cultural" culturalTheme="javanese">
  <Card.Header variant="cultural">
    <Card.Title variant="cultural">Meditasi Lelaku Jawa</Card.Title>
  </Card.Header>
  <Card.Content>
    Praktik spiritual tradisional Jawa
  </Card.Content>
</Card>
```

### Cultural Components
```typescript
// Indonesian Card
import { IndonesianCard } from '@/components/cultural/IndonesianCard';

<IndonesianCard
  tradition="javanese"
  title="Meditasi Lelaku Jawa"
  description="Praktik spiritual tradisional Jawa untuk keseimbangan batin"
  culturalContext={{
    origin: "Jawa Tengah",
    significance: "Pencarian keseimbangan spiritual",
    practiceType: "Kontemplasi dan Refleksi"
  }}
  image="/images/javanese-meditation.jpg"
  isActive={isSelected}
  onClick={() => setSelectedTradition('javanese')}
/>

// Cultural Timer
import { CulturalTimer } from '@/components/cultural/CulturalTimer';

<CulturalTimer
  duration={600} // 10 minutes
  tradition="balinese"
  isRunning={isTimerRunning}
  onComplete={() => handleMeditationComplete()}
  onTick={(remaining) => updateProgress(remaining)}
/>
```

### Meditation Components
```typescript
// Meditation Timer
import { MeditationTimer } from '@/components/meditation/MeditationTimer';

<MeditationTimer
  duration={900} // 15 minutes
  isRunning={isActive}
  tradition="sundanese"
  onComplete={() => {
    setIsActive(false);
    showCompletionModal();
  }}
  onTick={(remaining) => {
    updateSessionProgress(remaining);
  }}
/>

// Breathing Guide
import { BreathingGuide } from '@/components/meditation/BreathingGuide';

<BreathingGuide
  pattern="4-7-8" // Inhale-Hold-Exhale
  isActive={isBreathingActive}
  tradition="javanese"
  onCycleComplete={(cycle) => logBreathingCycle(cycle)}
/>

// Session Controls
import { SessionControls } from '@/components/meditation/SessionControls';

<SessionControls
  isPlaying={isSessionActive}
  isPaused={isSessionPaused}
  onPlay={() => startSession()}
  onPause={() => pauseSession()}
  onStop={() => stopSession()}
  onSettings={() => openSettings()}
  tradition="balinese"
/>
```

## 🎭 Theme Implementation

### Theme Provider Setup
```typescript
// ThemeProvider.tsx
import React, { createContext, useContext, useState } from 'react';
import { tokens } from '@/design-system/tokens';

interface ThemeContextType {
  currentTheme: 'light' | 'dark' | 'cultural';
  culturalTradition: 'javanese' | 'balinese' | 'sundanese';
  setTheme: (theme: 'light' | 'dark' | 'cultural') => void;
  setCulturalTradition: (tradition: 'javanese' | 'balinese' | 'sundanese') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'cultural'>('light');
  const [culturalTradition, setCulturalTradition] = useState<'javanese' | 'balinese' | 'sundanese'>('javanese');
  
  const setTheme = (theme: 'light' | 'dark' | 'cultural') => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'cultural') {
      document.documentElement.setAttribute('data-cultural-tradition', culturalTradition);
    }
  };
  
  const handleSetCulturalTradition = (tradition: 'javanese' | 'balinese' | 'sundanese') => {
    setCulturalTradition(tradition);
    if (currentTheme === 'cultural') {
      document.documentElement.setAttribute('data-cultural-tradition', tradition);
    }
  };
  
  return (
    <ThemeContext.Provider value={{
      currentTheme,
      culturalTradition,
      setTheme,
      setCulturalTradition: handleSetCulturalTradition,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### CSS Theme Variables
```css
/* styles/themes.css */

/* Light Theme (Default) */
:root {
  --color-primary-500: #0ea5e9;
  --color-cultural-earth-brown: #8B4513;
  --color-cultural-temple-gold: #FFD700;
  --color-cultural-lotus-white: #FFFAF0;
  --color-cultural-spiritual-purple: #663399;
  
  --background-primary: #ffffff;
  --background-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
}

/* Dark Theme */
[data-theme="dark"] {
  --background-primary: #0f172a;
  --background-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  
  /* Adjust cultural colors for dark mode */
  --color-cultural-earth-brown: #d2691e;
  --color-cultural-lotus-white: #1e293b;
}

/* Cultural Theme - Javanese */
[data-theme="cultural"][data-cultural-tradition="javanese"] {
  --background-primary: var(--color-cultural-lotus-white);
  --accent-primary: var(--color-cultural-earth-brown);
  --accent-secondary: var(--color-cultural-temple-gold);
  
  /* Cultural patterns */
  --cultural-pattern: url('/patterns/batik-kawung.svg');
  --cultural-symbol: url('/symbols/javanese-symbol.svg');
}

/* Cultural Theme - Balinese */
[data-theme="cultural"][data-cultural-tradition="balinese"] {
  --accent-primary: var(--color-cultural-temple-gold);
  --accent-secondary: var(--color-cultural-earth-brown);
  --cultural-pattern: url('/patterns/temple-ornament.svg');
  --cultural-symbol: url('/symbols/balinese-symbol.svg');
}

/* Cultural Theme - Sundanese */
[data-theme="cultural"][data-cultural-tradition="sundanese"] {
  --accent-primary: var(--color-cultural-bamboo-green);
  --accent-secondary: var(--color-cultural-earth-brown);
  --cultural-pattern: url('/patterns/bamboo-pattern.svg');
  --cultural-symbol: url('/symbols/sundanese-symbol.svg');
}
```

### Theme-Aware Components
```typescript
// ThemeAwareComponent.tsx
import React from 'react';
import { styled } from '@stitches/react';
import { useTheme } from '@/contexts/ThemeProvider';

const Container = styled('div', {
  backgroundColor: 'var(--background-primary)',
  color: 'var(--text-primary)',
  transition: 'all 0.3s ease',
  
  variants: {
    culturalTheme: {
      true: {
        position: 'relative',
        
        '&::before': {
          content: '',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'var(--cultural-pattern)',
          opacity: 0.05,
          pointerEvents: 'none',
        },
      },
    },
  },
});

export const ThemeAwareComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTheme, culturalTradition } = useTheme();
  
  return (
    <Container culturalTheme={currentTheme === 'cultural'}>
      {children}
      
      {currentTheme === 'cultural' && (
        <div 
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            padding: '0.5rem',
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--color-cultural-lotus-white)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 'medium',
          }}
        >
          Tema {culturalTradition.charAt(0).toUpperCase() + culturalTradition.slice(1)}
        </div>
      )}
    </Container>
  );
};
```

## 📱 Responsive Implementation

### Responsive Utilities
```typescript
// hooks/useResponsive.ts
import { useEffect, useState } from 'react';
import { tokens } from '@/design-system/tokens';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const useResponsive = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setCurrentBreakpoint('xs');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < 768) {
        setCurrentBreakpoint('sm');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < 1024) {
        setCurrentBreakpoint('md');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else if (width < 1280) {
        setCurrentBreakpoint('lg');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else if (width < 1536) {
        setCurrentBreakpoint('xl');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else {
        setCurrentBreakpoint('2xl');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints: {
      xs: currentBreakpoint === 'xs',
      sm: currentBreakpoint === 'sm',
      md: currentBreakpoint === 'md',
      lg: currentBreakpoint === 'lg',
      xl: currentBreakpoint === 'xl',
      '2xl': currentBreakpoint === '2xl',
    },
  };
};
```

### Responsive Components
```typescript
// ResponsiveGrid.tsx
import React from 'react';
import { styled } from '@stitches/react';
import { useResponsive } from '@/hooks/useResponsive';

const Grid = styled('div', {
  display: 'grid',
  gap: '1rem',
  
  variants: {
    columns: {
      1: { gridTemplateColumns: '1fr' },
      2: { gridTemplateColumns: 'repeat(2, 1fr)' },
      3: { gridTemplateColumns: 'repeat(3, 1fr)' },
      4: { gridTemplateColumns: 'repeat(4, 1fr)' },
    },
  },
});

interface ResponsiveGridProps {
  children: React.ReactNode;
  mobileColumns?: 1 | 2;
  tabletColumns?: 2 | 3;
  desktopColumns?: 3 | 4;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const getColumns = () => {
    if (isMobile) return mobileColumns;
    if (isTablet) return tabletColumns;
    if (isDesktop) return desktopColumns;
    return desktopColumns;
  };
  
  return (
    <Grid columns={getColumns()}>
      {children}
    </Grid>
  );
};

// ResponsiveText.tsx
const Text = styled('p', {
  variants: {
    size: {
      sm: { fontSize: '0.875rem' },
      md: { fontSize: '1rem' },
      lg: { fontSize: '1.125rem' },
      xl: { fontSize: '1.25rem' },
    },
    responsive: {
      true: {
        // Mobile
        fontSize: '0.875rem',
        
        // Tablet
        '@media (min-width: 768px)': {
          fontSize: '1rem',
        },
        
        // Desktop
        '@media (min-width: 1024px)': {
          fontSize: '1.125rem',
        },
      },
    },
  },
});

export const ResponsiveText: React.FC<{
  children: React.ReactNode;
  responsive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ children, responsive = false, size = 'md' }) => {
  return (
    <Text size={size} responsive={responsive}>
      {children}
    </Text>
  );
};
```

## ♿ Accessibility Implementation

### Focus Management
```typescript
// hooks/useFocusManagement.ts
import { useEffect, useRef } from 'react';

export const useFocusManagement = (isVisible: boolean) => {
  const focusRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isVisible) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the target element
      if (focusRef.current) {
        focusRef.current.focus();
      }
    } else {
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isVisible]);
  
  return focusRef;
};

// Accessible Modal Implementation
import { useFocusManagement } from '@/hooks/useFocusManagement';

export const AccessibleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  const focusRef = useFocusManagement(isOpen);
  
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={focusRef}
      tabIndex={-1}
    >
      <div onClick={onClose} /> {/* Overlay */}
      <div>
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose} aria-label="Close modal">
          ×
        </button>
      </div>
    </div>
  );
};
```

### Screen Reader Support
```typescript
// ScreenReaderAnnouncer.tsx
import React, { useEffect, useRef } from 'react';

interface ScreenReaderAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export const ScreenReaderAnnouncer: React.FC<ScreenReaderAnnouncerProps> = ({
  message,
  priority = 'polite',
}) => {
  const announcerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (announcerRef.current) {
      announcerRef.current.textContent = message;
    }
  }, [message]);
  
  return (
    <div
      ref={announcerRef}
      aria-live={priority}
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    />
  );
};

// Usage in meditation components
export const MeditationTimerWithAnnouncements: React.FC = () => {
  const [announcement, setAnnouncement] = useState('');
  
  const handleTimerUpdate = (remaining: number) => {
    // Announce significant time milestones
    if (remaining === 300) { // 5 minutes remaining
      setAnnouncement('5 menit tersisa dalam sesi meditasi');
    } else if (remaining === 60) { // 1 minute remaining
      setAnnouncement('1 menit tersisa, bersiaplah untuk mengakhiri meditasi');
    } else if (remaining === 0) {
      setAnnouncement('Sesi meditasi selesai. Terima kasih telah bermeditasi');
    }
  };
  
  return (
    <>
      <MeditationTimer onTick={handleTimerUpdate} />
      <ScreenReaderAnnouncer message={announcement} priority="polite" />
    </>
  );
};
```

## 🧪 Testing Implementation

### Component Testing
```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/primitives/Button';
import { ThemeProvider } from '@/contexts/ThemeProvider';

// Helper function for testing with theme
const renderWithTheme = (component: React.ReactElement, theme = 'light') => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Button Component', () => {
  describe('Basic Functionality', () => {
    it('renders button with text', () => {
      renderWithTheme(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });
    
    it('handles click events', () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Cultural Variants', () => {
    it('applies cultural variant styles', () => {
      renderWithTheme(<Button variant="cultural">Mulai Meditasi</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveStyle({
        backgroundColor: expect.stringContaining('#FFD700'), // temple gold
      });
    });
    
    it('uses cultural font family', () => {
      renderWithTheme(<Button variant="cultural">Tradisional</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveStyle({
        fontFamily: expect.stringContaining('Noto Sans Indonesian'),
      });
    });
  });
  
  describe('Accessibility', () => {
    it('has proper focus management', () => {
      renderWithTheme(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
    });
    
    it('has proper ARIA attributes when loading', () => {
      renderWithTheme(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
```

### Visual Regression Testing
```typescript
// __tests__/visual/Button.visual.test.tsx
import { test, expect } from '@playwright/test';

test.describe('Button Visual Tests', () => {
  test('default button appearance', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--default');
    await expect(page.locator('[data-testid="button"]')).toHaveScreenshot('button-default.png');
  });
  
  test('cultural button variants', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--cultural-themes');
    
    // Test different cultural themes
    const traditions = ['javanese', 'balinese', 'sundanese'];
    
    for (const tradition of traditions) {
      await page.selectOption('[data-testid="cultural-theme-select"]', tradition);
      await page.waitForTimeout(500); // Wait for animation
      
      await expect(page.locator('[data-testid="cultural-button"]'))
        .toHaveScreenshot(`button-cultural-${tradition}.png`);
    }
  });
  
  test('meditation button with breathing animation', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--meditation');
    
    // Wait for animation to start
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[data-testid="meditation-button"]'))
      .toHaveScreenshot('button-meditation-animated.png');
  });
});
```

## 📊 Performance Optimization

### Bundle Optimization
```typescript
// webpack.config.js - Design System Bundle Analysis
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  // ... other config
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Separate design system bundle
        designSystem: {
          test: /[\\/]src[\\/]design-system[\\/]/,
          name: 'design-system',
          chunks: 'all',
          priority: 20,
        },
        // Cultural assets bundle
        cultural: {
          test: /[\\/](patterns|symbols|cultural)[\\/]/,
          name: 'cultural-assets',
          chunks: 'all',
          priority: 15,
        },
        // Vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
      },
    },
  },
  plugins: [
    // Analyze bundle size
    process.env.ANALYZE && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
};
```

### Component Lazy Loading
```typescript
// Lazy load heavy cultural components
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/primitives/LoadingSpinner';

// Lazy load meditation components
const MeditationTimer = lazy(() => import('@/components/meditation/MeditationTimer'));
const BreathingGuide = lazy(() => import('@/components/meditation/BreathingGuide'));
const CulturalSessionTemplate = lazy(() => import('@/components/patterns/CulturalSessionTemplate'));

// Wrapper component with loading fallback
export const LazyMeditationComponents: React.FC<{
  component: 'timer' | 'breathing' | 'session';
  props: any;
}> = ({ component, props }) => {
  const ComponentMap = {
    timer: MeditationTimer,
    breathing: BreathingGuide,
    session: CulturalSessionTemplate,
  };
  
  const Component = ComponentMap[component];
  
  return (
    <Suspense fallback={<LoadingSpinner cultural />}>
      <Component {...props} />
    </Suspense>
  );
};
```

## 🚀 Production Deployment

### Build Optimization
```bash
# Build script for production
#!/bin/bash

# 1. Clean previous builds
rm -rf dist/
rm -rf storybook-static/

# 2. Build design system
npm run build:design-system

# 3. Generate design tokens
npm run tokens:build

# 4. Build Storybook
npm run storybook:build

# 5. Run visual regression tests
npm run test:visual

# 6. Build main application
npm run build

# 7. Analyze bundle size
npm run analyze:bundle

echo "✅ Production build completed successfully"
```

### Environment Configuration
```typescript
// config/design-system.config.ts
export const designSystemConfig = {
  development: {
    enableDebugMode: true,
    showDesignTokens: true,
    enableHotReload: true,
    culturalAssetsPath: '/assets/cultural/',
  },
  production: {
    enableDebugMode: false,
    showDesignTokens: false,
    enableHotReload: false,
    culturalAssetsPath: '/cdn/cultural/',
    optimizeCulturalAssets: true,
  },
  testing: {
    enableDebugMode: true,
    showDesignTokens: false,
    mockCulturalAssets: true,
    culturalAssetsPath: '/test-assets/',
  },
};
```

---

**Design System Implementation Guide ini menyediakan panduan praktis dan comprehensive untuk mengimplementasikan Sembalun Design System dalam development workflow. Dengan mengikuti panduan ini, developer dapat dengan mudah membangun interface yang consistent, accessible, dan culturally-authentic.** 🚀✨