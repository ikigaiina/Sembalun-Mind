# Sembalun Development Documentation

## Architecture Overview

Sembalun is built as a Progressive Web App (PWA) using modern React patterns and Indonesian meditation themes.

### Tech Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7 with optimized production builds
- **Styling**: Tailwind CSS v4 with custom Indonesian color palette
- **Routing**: React Router DOM v7 with nested routes
- **PWA**: Vite PWA plugin with Workbox service worker
- **State Management**: React Context + Hooks (lightweight approach)
- **Analytics**: Optional Google Analytics integration

### Project Structure
```
sembalun/
├── public/                 # Static assets
│   ├── manifest.json      # PWA manifest
│   ├── sw.js             # Service worker
│   ├── icon-*.svg        # App icons
│   └── netlify.toml      # Netlify config
├── src/
│   ├── components/       # Reusable components
│   │   ├── ui/          # UI component library
│   │   └── Layout.tsx   # App layout wrapper
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Route components
│   │   └── onboarding/  # Onboarding flow
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # App entry point
├── .env.example         # Environment template
├── .env.production      # Production config
├── netlify.toml         # Netlify deployment
├── vercel.json          # Vercel deployment
└── vite.config.ts       # Build configuration
```

## Component Architecture

### Design System Philosophy
All components follow Indonesian-inspired design principles:
- **Soft, rounded corners** (12px border radius)
- **Gentle animations** (300ms cubic-bezier transitions)
- **Nature-inspired colors** (hills, sky, mist, earth)
- **Mobile-first responsive design**
- **Accessibility-conscious development**

### Core UI Components

#### Button (`components/ui/Button.tsx`)
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'accent'
  size: 'small' | 'medium' | 'large'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}
```

**Variants**:
- `primary`: Hill green background (#6A8F6F)
- `secondary`: Mist blue with green border
- `accent`: Terracotta earth for highlights (#C56C3E)

#### Card (`components/ui/Card.tsx`)
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  blur?: boolean // Frosted glass effect
  padding?: 'small' | 'medium' | 'large'
}
```

**Features**:
- Backdrop blur for depth
- Consistent shadows and spacing
- Responsive padding options

#### CairnIcon (`components/ui/CairnIcon.tsx`)
```typescript
interface CairnIconProps {
  progress: number // 0-100
  size?: number    // SVG size in pixels
  className?: string
}
```

**Progress States**:
- 0-25%: Base stone only
- 26-50%: Two stones stacked
- 51-75%: Three stones balanced
- 76-100%: Full cairn with 4+ stones

### Page Components

#### Dashboard (`pages/Dashboard.tsx`)
Main user interface featuring:
- Time-based greetings
- Mood check-in integration
- Smart recommendations
- Streak visualization
- Quick access cards

#### Onboarding Flow (`pages/onboarding/`)
Multi-step user introduction:
1. **SplashScreen**: Animated cairn building
2. **OnboardingSlides**: Swipeable introduction (3 slides)
3. **PersonalizationScreen**: Goal selection
4. **WelcomeScreen**: Completion with recommendations

### State Management

#### Context Pattern
```typescript
// Example: OnboardingContext
interface OnboardingState {
  currentStep: number
  selectedGoals: string[]
  isCompleted: boolean
  userPreferences: UserPreferences
}

const OnboardingContext = createContext<OnboardingState>()
```

#### Custom Hooks
- `useOnboarding()`: Manages onboarding flow state
- `usePWAInstall()`: Handles PWA installation prompts
- `useNotifications()`: Manages push notification permissions
- `useOfflineTimer()`: Meditation timer with offline support

## Development Workflow

### Setup
```bash
# Clone and install
git clone <repo-url>
cd sembalun
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your settings

# Start development
npm run dev
```

### Available Scripts
```bash
npm run dev              # Development server (port 3000)
npm run build           # Production build
npm run build:prod     # Build with linting and preview
npm run build:analyze  # Build with bundle analysis
npm run preview        # Preview production build
npm run serve         # Serve production build with host access
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run clean         # Remove dist folder
```

### Code Style Guidelines

#### TypeScript Best Practices
- Use interfaces for props and state types
- Leverage type inference where possible
- Avoid `any` types - prefer `unknown` or specific types
- Use optional chaining and nullish coalescing

#### Component Patterns
```typescript
// Preferred component structure
interface ComponentProps {
  // Props interface first
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks at top
  const [state, setState] = useState()
  
  // Event handlers
  const handleClick = () => {
    // Implementation
  }
  
  // Render logic
  return (
    <div className="component-styles">
      {/* JSX */}
    </div>
  )
}
```

#### CSS/Tailwind Conventions
- Use semantic class names for complex styles
- Prefer Tailwind utilities over custom CSS
- Follow mobile-first responsive patterns
- Use CSS variables for theme colors

### Testing Strategy

#### Component Testing
```bash
# Testing setup (future implementation)
npm install -D @testing-library/react @testing-library/jest-dom vitest
```

**Test Coverage Goals**:
- Core UI components (Button, Card, CairnIcon)
- User flows (onboarding, meditation sessions)
- Hook functionality (offline timer, PWA install)
- Accessibility compliance

#### Manual Testing Checklist
- [ ] PWA installation on mobile devices
- [ ] Offline functionality
- [ ] Touch gestures and swipe navigation
- [ ] Responsive design across screen sizes
- [ ] Cross-browser compatibility
- [ ] Performance on low-end devices

## Build & Deployment

### Production Optimization

#### Vite Configuration
```typescript
// vite.config.ts highlights
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1600
  }
})
```

#### Performance Targets
- **Bundle Size**: < 1.6MB total
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

### Deployment Options

#### Netlify (Recommended)
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Features**:
- Automatic deployments from Git
- Built-in CDN and SSL
- Branch previews
- Form handling (for feedback)

#### Vercel
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Features**:
- Edge runtime deployment
- Automatic optimization
- Analytics integration
- Serverless functions (future use)

### Environment Configuration

#### Development (.env.local)
```bash
VITE_APP_NAME="Sembalun Dev"
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
```

#### Production (.env.production)
```bash
VITE_APP_NAME="Sembalun"
VITE_APP_VERSION="1.0.0"
VITE_ENABLE_ANALYTICS=true
VITE_GTM_ID="GTM-XXXXXXX"
```

## PWA Implementation

### Service Worker Features
- **Caching Strategy**: Cache-first for static assets
- **Background Sync**: Queue user actions when offline
- **Push Notifications**: Meditation reminders (opt-in)
- **App Updates**: Automatic updates with user notification

### Manifest Configuration
```json
{
  "name": "Sembalun - Indonesian Meditation App",
  "short_name": "Sembalun",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#6A8F6F",
  "background_color": "#E1E8F0"
}
```

### Installation Prompts
- Smart timing based on user engagement
- Contextual messaging in Indonesian
- Respect user choice and don't be pushy
- Track installation rates for optimization

## Analytics & Monitoring

### Google Analytics Integration
```typescript
// utils/analytics.ts
class Analytics {
  trackMeditationSession(duration: number, type: string)
  trackBreathingSession(duration: number, pattern: string) 
  trackFeatureUsage(feature: string)
  trackPageView(page_title: string, page_location: string)
}
```

### Key Metrics to Track
- **Engagement**: Session duration, completion rates
- **Retention**: Daily/weekly active users, streak lengths
- **Features**: Most used meditation types, onboarding completion
- **Technical**: Load times, error rates, offline usage

## Performance Optimization

### Bundle Optimization
- Code splitting by route and vendor
- Tree shaking for unused code elimination
- Dynamic imports for non-critical features
- Service worker caching strategies

### Runtime Performance
- React.memo for expensive re-renders
- useCallback for stable function references
- useMemo for expensive calculations
- Intersection Observer for lazy loading

### Mobile Optimization
- Touch-friendly tap targets (44px minimum)
- Smooth scrolling and animations
- Reduced motion preferences support
- Battery-conscious animation strategies

## Security Considerations

### Content Security Policy
```http
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://www.google-analytics.com;
```

### Data Privacy
- No personal data collection without consent
- Local storage for user preferences only
- Analytics opt-out capability
- GDPR-friendly privacy policy

## Future Development

### Planned Features
1. **Audio Integration**: Guided meditation audio
2. **Social Features**: Community sharing and challenges
3. **Advanced Analytics**: Mood correlation analysis
4. **Internationalization**: Multi-language support
5. **Gamification**: Achievement system and rewards

### Technical Debt & Improvements
- Implement comprehensive testing suite
- Add error boundary components
- Optimize images with next-gen formats
- Consider state management library for complex features
- Add end-to-end testing with Playwright

### Contributing Guidelines
- Follow existing code patterns and style
- Maintain Indonesian cultural authenticity
- Prioritize accessibility and mobile experience
- Write self-documenting code with clear naming
- Add tests for new features and bug fixes

---

*Happy coding! Selamat mengembangkan! 🚀*