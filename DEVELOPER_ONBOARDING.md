# Developer Onboarding Guide - Sembalun

Welcome to the Sembalun development team! This guide will help you get up to speed with our Indonesian meditation app built with React, TypeScript, and Supabase.

## Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone https://github.com/your-org/sembalun.git
cd sembalun
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development
npm run dev
# App will be available at http://localhost:3000
```

## Project Overview

**Sembalun** is a culturally-aware meditation application designed specifically for Indonesian users. It combines modern web technologies with traditional Indonesian wisdom and mobile optimization.

### Key Features You'll Work With
- 🧘 **Meditation Sessions**: Guided, breathing, and cultural meditation practices
- 🎯 **AI Personalization**: Smart content recommendations based on user behavior
- 🏛️ **Cultural Themes**: Regional Indonesian themes (Javanese, Balinese, Sundanese, Minang)
- 📱 **Mobile-First**: Optimized for Indonesian mobile devices and networks
- 🔄 **Offline-First**: Full functionality without internet connection
- 🎨 **Design System**: Comprehensive Indonesian cultural design components

## Architecture at a Glance

```
Frontend (React + TypeScript)
├── Context Providers (State Management)
├── Component Library (Cultural Themes)
├── Services (Business Logic)
└── PWA Features (Offline Support)

Backend (Supabase)
├── PostgreSQL Database
├── Authentication (Multi-provider)
├── Real-time Subscriptions
└── Edge Functions
```

## Development Environment Setup

### Prerequisites
- **Node.js**: v18.0+ (use `node --version` to check)
- **npm**: v8.0+ (use `npm --version` to check)
- **Git**: Latest version
- **VS Code**: Recommended IDE with our extension pack

### Required VS Code Extensions
Install these extensions for the best development experience:
```bash
# Install via VS Code Extensions Marketplace
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Tailwind CSS IntelliSense
- ESLint
- Prettier - Code formatter
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
```

### Environment Configuration

Create your `.env.local` file:
```bash
# Required Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional Development Settings
VITE_ENVIRONMENT=development
VITE_ENABLE_DEBUG_MODE=true
VITE_API_BASE_URL=http://localhost:3000
```

## Project Structure Deep Dive

Understanding our file organization:

```
src/
├── components/           # React Components
│   ├── auth/            # Authentication (login, signup, etc.)
│   ├── cultural/        # Indonesian cultural components
│   ├── meditation/      # Core meditation features
│   ├── onboarding/      # User onboarding flow
│   ├── personalization/ # AI-powered personalization
│   └── ui/             # Reusable UI components
├── contexts/           # React Context Providers
├── hooks/              # Custom React hooks
├── pages/              # Page-level components
├── services/           # API calls and business logic
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── design-system/      # Design tokens and themes
```

## Key Concepts You Need to Know

### 1. Cultural Themes System

We have four regional Indonesian themes:

```typescript
// Example: Using cultural themes
import { IndonesianCard } from '@/components/cultural/IndonesianCard';

const MeditationCard = () => (
  <IndonesianCard 
    variant="javanese"      // or 'balinese', 'sundanese', 'minang'
    elevation="soft"
    className="meditation-card"
  >
    <h3>Meditasi Jawa Tradisional</h3>
    <p>Praktik lelaku untuk ketenangan jiwa</p>
  </IndonesianCard>
);
```

### 2. Personalization Context

Our AI personalization system:

```typescript
// Example: Using personalization
import { usePersonalization } from '@/contexts/PersonalizationContext';

const PersonalizedContent = () => {
  const { 
    getPersonalizedRecommendations,
    getPersonalizedQuote,
    trackSession 
  } = usePersonalization();

  const recommendations = getPersonalizedRecommendations();
  const quote = getPersonalizedQuote();

  return (
    <div>
      <blockquote>{quote.text}</blockquote>
      <RecommendationList items={recommendations} />
    </div>
  );
};
```

### 3. Offline-First Architecture

How we handle offline functionality:

```typescript
// Example: Service with offline support
import { progressService } from '@/services/progressService';

const trackMeditationSession = async (sessionData) => {
  try {
    // Will sync immediately if online, queue if offline
    const sessionId = await progressService.createMeditationSession(sessionData);
    return sessionId;
  } catch (error) {
    // Automatically queued for later sync
    console.log('Session queued for offline sync');
  }
};
```

### 4. Cultural Responsiveness

Indonesian mobile optimization:

```typescript
// Example: Indonesian mobile patterns
import { indonesianMobileOptimizer } from '@/utils/indonesian-mobile-optimization';

const OptimizedComponent = () => {
  const deviceCapabilities = indonesianMobileOptimizer.getDeviceCapabilities();
  
  return (
    <div className={`
      ${deviceCapabilities.isLowEndDevice ? 'reduced-animations' : 'full-animations'}
      ${deviceCapabilities.connection === 'slow' ? 'compress-images' : 'full-quality'}
    `}>
      {/* Content optimized for Indonesian mobile users */}
    </div>
  );
};
```

## Common Development Patterns

### 1. Creating a New Page

```typescript
// src/pages/MyNewPage.tsx
import React from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export const MyNewPage: React.FC = () => {
  const { user } = useSupabaseAuth();

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-heading text-primary-700">
          Selamat datang, {user?.displayName}!
        </h1>
        {/* Your page content */}
      </div>
    </DashboardLayout>
  );
};
```

Add to router in `src/App.tsx`:
```typescript
<Route path="/my-new-page" element={<MyNewPage />} />
```

### 2. Creating a Service

```typescript
// src/services/myNewService.ts
import { supabase } from '@/config/supabase';

export class MyNewService {
  private static instance: MyNewService;

  static getInstance(): MyNewService {
    if (!MyNewService.instance) {
      MyNewService.instance = new MyNewService();
    }
    return MyNewService.instance;
  }

  async getData(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
}

export const myNewService = MyNewService.getInstance();
```

### 3. Creating a Custom Hook

```typescript
// src/hooks/useMyNewFeature.ts
import { useState, useEffect } from 'react';
import { myNewService } from '@/services/myNewService';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export const useMyNewFeature = () => {
  const { user } = useSupabaseAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const result = await myNewService.getData(user.id);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { data, loading, error };
};
```

### 4. Creating a Cultural Component

```typescript
// src/components/cultural/MyIndonesianComponent.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface MyIndonesianComponentProps {
  variant?: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  children: React.ReactNode;
  className?: string;
}

const culturalStyles = {
  javanese: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200',
  balinese: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200',
  sundanese: 'bg-gradient-to-r from-green-50 to-lime-50 border-green-200',
  minang: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
};

export const MyIndonesianComponent: React.FC<MyIndonesianComponentProps> = ({
  variant = 'javanese',
  children,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-soft border-2 p-4 shadow-meditation-glow',
        culturalStyles[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
};
```

## Testing Your Code

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# End-to-end tests
npm run test:e2e
```

### Writing Tests

```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly with Indonesian text', () => {
    render(<MyComponent text="Halo Dunia" />);
    expect(screen.getByText('Halo Dunia')).toBeInTheDocument();
  });

  it('handles cultural theme switching', () => {
    const { rerender } = render(<MyComponent theme="javanese" />);
    expect(screen.getByTestId('component')).toHaveClass('javanese-theme');

    rerender(<MyComponent theme="balinese" />);
    expect(screen.getByTestId('component')).toHaveClass('balinese-theme');
  });
});
```

## Database Interaction

### Basic Queries

```typescript
// Reading data
const sessions = await supabase
  .from('meditation_sessions')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Creating data
const { data, error } = await supabase
  .from('meditation_sessions')
  .insert({
    user_id: userId,
    type: 'breathing',
    duration_minutes: 10,
    completed_at: new Date().toISOString()
  })
  .select()
  .single();

// Updating data
const { error } = await supabase
  .from('users')
  .update({ 
    preferences: { ...currentPreferences, theme: 'dark' }
  })
  .eq('id', userId);
```

### Real-time Subscriptions

```typescript
// Listening for changes
const subscription = supabase
  .channel('meditation_updates')
  .on(
    'postgres_changes',
    { 
      event: 'INSERT',
      schema: 'public',
      table: 'meditation_sessions',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New meditation session:', payload.new);
    }
  )
  .subscribe();

// Cleanup
return () => supabase.removeChannel(subscription);
```

## Styling Guidelines

### Tailwind Classes We Use

```css
/* Indonesian-optimized spacing */
.space-meditation { margin: 1.2rem; }
.space-breathing { margin: 2rem; }

/* Cultural color classes */
.text-javanese { color: theme('colors.meditation.zen.500'); }
.bg-balinese { background: theme('colors.meditation.focus.100'); }

/* Mobile touch optimization */
.touch-target { min-height: 44px; min-width: 44px; }
.interactive-hover { transition: all 0.3s ease; }

/* Indonesian mobile patterns */
.whatsapp-green { background-color: #25D366; }
.indonesian-spacing { padding: 0.75rem 1rem; }
```

### Component Styling Patterns

```typescript
// Good: Using our design system
const MeditationButton = () => (
  <button className="
    btn-primary 
    touch-target 
    interactive-hover
    bg-meditation-zen-500 
    text-white
    rounded-soft
    shadow-meditation-glow
  ">
    Mulai Meditasi
  </button>
);

// Good: Cultural responsive design
const CulturalCard = ({ variant }) => (
  <div className={`
    card-base
    ${variant === 'javanese' && 'javanese-card'}
    ${variant === 'balinese' && 'balinese-card'}
    responsive-padding
    mobile-optimized
  `}>
    {/* Content */}
  </div>
);
```

## Debugging and Development Tools

### Browser DevTools Setup

1. **React DevTools**: Install browser extension
2. **Component Inspector**: Right-click → "Inspect Component"
3. **Context Values**: Check context values in Components tab
4. **Performance**: Use Profiler tab for performance issues

### Useful Development Commands

```bash
# Analyze bundle size
npm run build:analyze

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Test specific file
npm test -- MyComponent.test.tsx

# Debug mode with extra logging
VITE_ENABLE_DEBUG_MODE=true npm run dev
```

### Console Debugging

```typescript
// Development-only logging
if (import.meta.env.DEV) {
  console.log('🧘 Meditation session started:', sessionData);
  console.log('🎯 Personalization data:', personalizationContext);
  console.log('🌍 Cultural theme:', currentTheme);
}

// Performance monitoring
console.time('meditation-recommendation-calculation');
const recommendations = calculateRecommendations(userData);
console.timeEnd('meditation-recommendation-calculation');
```

## Common Issues and Solutions

### 1. Supabase Connection Issues

**Problem**: "Failed to connect to Supabase"
```typescript
// Check your environment variables
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10) + '...');

// Test connection
import { checkSupabaseConnection } from '@/config/supabase';
const isConnected = await checkSupabaseConnection();
console.log('Supabase connected:', isConnected);
```

### 2. Authentication State Issues

**Problem**: User state not updating
```typescript
// Make sure you're using the right context
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const MyComponent = () => {
  const { user, loading } = useSupabaseAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return <div>Welcome {user.displayName}</div>;
};
```

### 3. Cultural Theme Not Loading

**Problem**: Theme styles not applying
```typescript
// Check if theme provider is properly wrapped
// In App.tsx, ensure ThemeProvider is at the top level
<ThemeProvider defaultTheme="light">
  <PersonalizationProvider>
    {/* Your app content */}
  </PersonalizationProvider>
</ThemeProvider>

// Check CSS custom properties are loaded
const theme = getComputedStyle(document.documentElement);
console.log('Primary color:', theme.getPropertyValue('--color-primary'));
```

### 4. Offline Functionality Not Working

**Problem**: Data not syncing when back online
```typescript
// Check offline queue status
import { progressService } from '@/services/progressService';

// Manual sync trigger
await progressService.processOfflineQueue();

// Check queue contents
const queueItems = JSON.parse(localStorage.getItem('sembalun_offline_queue') || '[]');
console.log('Offline queue:', queueItems);
```

## Performance Best Practices

### 1. Component Optimization

```typescript
// Use React.memo for expensive components
const ExpensiveMeditationCard = memo(({ session }) => {
  const analysis = useMemo(() => 
    analyzeSessionData(session), 
    [session]
  );
  
  return <MeditationCard analysis={analysis} />;
});

// Debounce user inputs
import { useDebouncedCallback } from 'use-debounce';

const SearchInput = () => {
  const debouncedSearch = useDebouncedCallback(
    (searchTerm) => performSearch(searchTerm),
    500
  );
  
  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
};
```

### 2. Bundle Optimization

```typescript
// Lazy load heavy components
const HeavyAnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AnalyticsDashboard')
);

const Analytics = () => (
  <Suspense fallback={<AnalyticsLoader />}>
    <HeavyAnalyticsDashboard />
  </Suspense>
);

// Dynamic imports for conditional features
const loadAdvancedFeatures = async () => {
  if (user.subscription === 'premium') {
    const { AdvancedMeditation } = await import('@/components/premium/AdvancedMeditation');
    return AdvancedMeditation;
  }
  return null;
};
```

### 3. Indonesian Mobile Optimization

```typescript
// Optimize for Indonesian networks
const OptimizedAudioPlayer = () => {
  const { connection } = useNetworkInfo();
  
  const audioQuality = useMemo(() => {
    if (connection.effectiveType === '3g') return 'low';
    if (connection.effectiveType === '4g') return 'medium';
    return 'high';
  }, [connection]);
  
  return <AudioPlayer quality={audioQuality} />;
};
```

## Git Workflow

### Branch Naming Convention

```bash
# Feature branches
git checkout -b feature/meditation-timer-improvements
git checkout -b feature/balinese-theme-updates

# Bug fixes
git checkout -b fix/audio-playback-ios
git checkout -b fix/offline-sync-issue

# Cultural updates
git checkout -b cultural/javanese-quotes-expansion
git checkout -b cultural/minang-meditation-techniques
```

### Commit Message Format

```bash
# Use conventional commits
git commit -m "feat: add Balinese cultural theme for meditation cards"
git commit -m "fix: resolve audio caching issue on low-end devices"
git commit -m "perf: optimize bundle size for Indonesian mobile networks"
git commit -m "cultural: update Javanese meditation quotes collection"
git commit -m "docs: add developer guide for cultural themes"
```

### Pull Request Checklist

Before submitting a PR:
- [ ] All tests pass (`npm run test`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Component works on mobile devices
- [ ] Cultural themes are properly implemented
- [ ] Offline functionality is maintained
- [ ] Performance impact is acceptable
- [ ] Documentation is updated if needed

## Getting Help

### Internal Resources
- **Slack**: #sembalun-dev for general questions
- **Slack**: #sembalun-cultural for Indonesian cultural guidance
- **Wiki**: Internal knowledge base at `wiki.company.com/sembalun`
- **Design System**: Storybook at `storybook.sembalun.app`

### Code Review Process
1. Create feature branch from `development`
2. Make your changes with tests
3. Create PR with detailed description
4. Request review from team members
5. Address feedback and update branch
6. Merge after approval

### Team Contacts
- **Tech Lead**: @tech-lead (architecture questions)
- **Cultural Advisor**: @cultural-advisor (Indonesian cultural guidance)
- **UX Designer**: @ux-designer (design and user experience)
- **DevOps**: @devops (deployment and infrastructure)

## What's Next?

Now that you're set up, here's your learning path:

### Week 1: Foundation
- [ ] Complete a small bug fix or UI improvement
- [ ] Read through the main contexts and services
- [ ] Understand the cultural theme system
- [ ] Make your first pull request

### Week 2: Features
- [ ] Build a new meditation-related component
- [ ] Integrate with the personalization system
- [ ] Add proper offline support to your feature
- [ ] Write comprehensive tests

### Week 3: Advanced
- [ ] Contribute to the cultural adaptation features
- [ ] Optimize for Indonesian mobile performance
- [ ] Add real-time functionality with Supabase
- [ ] Mentor another new developer

Welcome to the team! We're excited to have you contribute to making meditation accessible and culturally relevant for Indonesian users. 🧘‍♂️🇮🇩