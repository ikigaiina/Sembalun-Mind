# Sembalun - Meditation & Mindfulness App

[![Production Status](https://img.shields.io/badge/status-production-green.svg)](https://sembalun-app.vercel.app)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.53.0-green.svg)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-blue.svg)](https://tailwindcss.com/)

## 🧘‍♀️ Overview

Sembalun is a comprehensive meditation and mindfulness application designed to help users develop a consistent meditation practice through guided sessions, breathing exercises, progress tracking, and personalized insights. The app combines traditional meditation wisdom with modern technology to create an accessible and engaging mindfulness experience.

### ✨ Key Features

- **🎯 Guided Meditations**: Comprehensive library of guided meditation sessions
- **🫁 Breathing Exercises**: Various breathing patterns and techniques
- **📊 Progress Tracking**: Detailed analytics and streak monitoring
- **🎨 Cultural Integration**: Indonesian-inspired design and content
- **👤 User Profiles**: Personalized experience with preferences and goals
- **📱 PWA Support**: Installable web app with offline capabilities
- **🔐 Secure Authentication**: Supabase-powered authentication system
- **🌙 Guest Mode**: Try the app without creating an account
- **🔄 Real-time Sync**: Cross-device synchronization
- **📈 Analytics Dashboard**: Comprehensive progress insights

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19.1.0** - Modern UI framework with concurrent features
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 7.0.4** - Fast build tool and dev server
- **TailwindCSS 4.1.11** - Utility-first CSS framework
- **React Router 7.7.1** - Client-side routing
- **Lucide React** - Beautiful SVG icons

### Backend & Services
- **Supabase** - Backend-as-a-Service
  - Authentication & User Management
  - PostgreSQL Database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Storage for media files
- **Vercel** - Deployment and hosting platform

### Testing & Quality
- **Vitest** - Fast unit testing framework
- **Testing Library** - React component testing
- **ESLint** - Code linting and formatting
- **TypeScript Compiler** - Static type checking

## 📁 Project Structure

```
sembalun/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   ├── auth/           # Authentication components
│   │   ├── admin/          # Admin panel components
│   │   ├── analytics/      # Analytics and reporting
│   │   ├── account/        # User account management
│   │   ├── meditation/     # Meditation-specific components
│   │   ├── notifications/  # Notification system
│   │   ├── personalization/# User customization
│   │   └── tracking/       # Progress tracking
│   ├── pages/              # Page components (routes)
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic and API calls
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   └── test/               # Test utilities and setup
├── public/                 # Static assets
├── supabase/               # Database schema and migrations
├── docs/                   # Documentation
└── scripts/                # Build and utility scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn package manager
- Supabase account and project

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/sembalun.git
   cd sembalun
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Create `.env.local` file:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # App Configuration (Optional)
   VITE_APP_NAME=Sembalun
   VITE_APP_VERSION=1.0.0
   ```

4. **Database Setup**
   
   Run the Supabase migration:
   ```bash
   # Connect to your Supabase project
   npx supabase init
   npx supabase link --project-ref your-project-ref
   
   # Run migrations
   npx supabase db push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Core Tables

#### Users (`users`)
Extended user profiles with preferences and progress tracking.
- `id` (UUID, Primary Key)
- `email` (Text, Unique)
- `display_name` (Text)
- `avatar_url` (Text)
- `preferences` (JSONB) - User settings and preferences
- `progress` (JSONB) - Meditation progress and stats
- `created_at`, `updated_at` (Timestamps)

#### Meditation Sessions (`meditation_sessions`)
Records of completed meditation sessions.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `type` (Text) - 'breathing', 'guided', 'silent', 'walking'
- `duration_minutes` (Integer)
- `mood_before`, `mood_after` (Text)
- `notes` (Text)
- `completed_at` (Timestamp)

#### Courses (`courses`)
Available meditation courses and content.
- `id` (UUID, Primary Key)
- `title`, `description` (Text)
- `category`, `difficulty` (Text)
- `duration_minutes` (Integer)
- `instructor` (Text)
- `is_premium` (Boolean)
- `order_index` (Integer)

#### Journal Entries (`journal_entries`)
User reflection and journaling entries.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `title`, `content` (Text)
- `mood` (Text)
- `tags` (Text Array)
- `created_at`, `updated_at` (Timestamps)

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - Users can only access their own data
- **Secure authentication** with email/password and OAuth
- **Data validation** with database constraints
- **Automatic timestamps** with triggers

## 🔐 Authentication System

### Authentication Flow

The app uses Supabase Auth with multiple authentication methods:

#### 1. Email/Password Authentication
- User registration with email verification
- Secure password-based login
- Password reset functionality

#### 2. OAuth Providers
- **Google Sign-in** - Quick authentication with Google accounts
- **Apple Sign-in** - iOS/macOS integration
- Automatic profile creation from OAuth data

#### 3. Guest Mode
- Try the app without registration
- Local storage for session data
- Migration to full account available

### Authentication Context

```typescript
interface SupabaseAuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  
  // Authentication methods
  signInWithEmail: (email: string, password: string) => Promise<{error: AuthError | null}>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{error: AuthError | null}>;
  signInWithGoogle: () => Promise<{error: AuthError | null}>;
  signInWithApple: () => Promise<{error: AuthError | null}>;
  signOut: () => Promise<{error: AuthError | null}>;
  
  // Profile management
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{error: AuthError | null}>;
  deleteAccount: () => Promise<{error: AuthError | null}>;
  
  // Guest functionality
  continueAsGuest: () => void;
  migrateGuestData: () => Promise<void>;
}
```

## 🎨 UI Components

### Design System

The app follows a consistent design system with:

#### Core Components

**Button (`src/components/ui/Button.tsx`)**
- Multiple variants: primary, secondary, outline, ghost
- Size options: sm, md, lg
- Loading states and disabled states
- Accessibility features

**Card (`src/components/ui/Card.tsx`)**
- Flexible container component
- Shadow and border variants
- Header, body, footer sections

**Input (`src/components/ui/Input.tsx`)**
- Form input with validation states
- Error message display
- Label and helper text support

#### Specialized Components

**MeditationTimer (`src/components/ui/MeditationTimer.tsx`)**
- Customizable meditation timer
- Multiple timer visualizations
- Sound alerts and vibration

**BreathingGuide (`src/components/ui/BreathingGuide.tsx`)**
- Animated breathing visualization
- Multiple breathing patterns
- Customizable timing and guidance

**AudioPlayer (`src/components/ui/AudioPlayer.tsx`)**
- Media player for guided meditations
- Playback speed control
- Background audio support

## 📱 Features & Functionality

### 1. Meditation Sessions

#### Session Types
- **Guided Meditations**: Voice-guided sessions with various themes
- **Breathing Exercises**: Different breathing patterns and techniques
- **Silent Meditation**: Timer-based silent practice
- **Walking Meditation**: Mindful movement practices

#### Session Management
- Progress tracking during sessions
- Mood logging before/after sessions
- Personal notes and reflections
- Session history and analytics

### 2. Progress Tracking

#### Metrics Tracked
- Total meditation minutes
- Session streaks (current and longest)
- Favorite meditation categories
- Completion rates
- Mood trends over time

#### Visualizations
- Progress charts and graphs
- Streak calendars
- Category breakdowns
- Time-based analytics

### 3. User Personalization

#### Preferences System
```typescript
interface UserPreferences {
  theme: 'auto' | 'light' | 'dark';
  language: 'en' | 'id';
  notifications: {
    daily: boolean;
    reminders: boolean;
    achievements: boolean;
    weeklyProgress: boolean;
  };
  meditation: {
    defaultDuration: number;
    preferredVoice: string;
    backgroundSounds: boolean;
    guidanceLevel: 'minimal' | 'moderate' | 'detailed';
    musicVolume: number;
    voiceVolume: number;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}
```

### 4. Offline Capabilities

#### PWA Features
- Installable web app
- Offline session tracking
- Cached meditation content
- Background sync when online

#### Offline Storage
- IndexedDB for session data
- Local storage for preferences
- Service worker for caching

## 🛠️ Development Workflows

### Available Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build              # Production build
npm run build:fast         # Fast production build
npm run preview            # Preview production build

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues
npm run typecheck          # TypeScript type checking

# Testing
npm run test               # Run tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Generate coverage report

# Deployment
npm run build:vercel       # Build for Vercel deployment
npm run deploy:vercel      # Deploy to Vercel
```

### Development Guidelines

#### Code Style
- Use TypeScript for all new files
- Follow React functional component patterns
- Implement proper error handling
- Add JSDoc comments for complex functions
- Use meaningful variable and function names

#### Component Structure
```typescript
// Component template
interface ComponentProps {
  // Props definition
}

export const Component: React.FC<ComponentProps> = ({
  // Destructured props
}) => {
  // Hooks
  // State
  // Effects
  // Event handlers
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

#### Testing Strategy
- Unit tests for utility functions
- Component tests for UI components
- Integration tests for complex workflows
- E2E tests for critical user paths

## 🚀 Deployment

### Production Deployment

The app is deployed on Vercel with the following configuration:

#### Build Configuration
```typescript
// vite.config.deploy.ts
export default defineConfig({
  plugins: [react(), vitePWA(pwaConfig)],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          router: ['react-router-dom']
        }
      }
    }
  }
});
```

#### Environment Variables
Production requires the following environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

#### Deployment Steps
1. **Build optimization**
   ```bash
   npm run build:vercel
   ```

2. **Deploy to Vercel**
   ```bash
   npm run deploy:vercel
   ```

3. **Post-deployment checks**
   - Health check endpoints
   - Authentication flow testing
   - Database connectivity verification

### Performance Optimizations

#### Bundle Optimization
- Code splitting by route
- Dynamic imports for heavy components
- Tree shaking for unused code
- Asset optimization

#### Runtime Performance
- React 19 concurrent features
- Memoization for expensive calculations
- Virtual scrolling for large lists
- Image lazy loading

#### PWA Optimizations
- Service worker caching
- Background sync
- Push notifications
- Install prompts

## 📊 Monitoring & Analytics

### Error Tracking
- Client-side error boundaries
- Supabase error monitoring
- Performance monitoring

### User Analytics
- Session tracking
- Feature usage analytics
- Performance metrics
- User engagement tracking

## 🔧 Configuration

### Build Configurations

The project includes multiple Vite configurations:

- `vite.config.ts` - Development configuration
- `vite.config.production.ts` - Production optimization
- `vite.config.deploy.ts` - Deployment-specific settings
- `vite.config.minimal.ts` - Minimal build for testing

### PWA Configuration

```typescript
const pwaConfig: VitePWAOptions = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  manifest: {
    name: 'Sembalun - Meditation & Mindfulness',
    short_name: 'Sembalun',
    description: 'Your personal meditation and mindfulness companion',
    theme_color: '#4f46e5',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      }
    ]
  }
};
```

## 📚 API Reference

### Supabase Services

#### Authentication Service (`src/services/supabaseAuthService.ts`)
```typescript
class SupabaseAuthService {
  static async signUp(data: SignUpData): Promise<AuthResponse>
  static async signIn(data: SignInData): Promise<AuthResponse>
  static async signOut(): Promise<{error: AuthError | null}>
  static async resetPassword(data: ResetPasswordData): Promise<{error: AuthError | null}>
}
```

#### Database Service (`src/services/supabaseDatabaseService.ts`)
```typescript
class SupabaseDatabaseService {
  static async getUser(userId: string): Promise<UserProfile | null>
  static async updateUser(userId: string, updates: UserUpdate): Promise<{error: any}>
  static async getMeditationSessions(userId: string): Promise<MeditationSession[]>
  static async createMeditationSession(session: MeditationSessionInsert): Promise<{error: any}>
}
```

### Hooks API

#### useAuth
```typescript
const {
  user,
  userProfile,
  loading,
  isGuest,
  signIn,
  signOut,
  updateProfile
} = useAuth();
```

#### useProgress
```typescript
const {
  totalSessions,
  totalMinutes,
  currentStreak,
  addSession,
  getWeeklyProgress
} = useProgress();
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Code Review Process
- All PRs require review from maintainers
- Automated testing must pass
- Code must follow established patterns
- Documentation updates required for new features

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Indonesian meditation traditions and Mount Rinjani
- **Icons**: Lucide React icon library
- **Backend**: Supabase for providing excellent BaaS platform
- **Hosting**: Vercel for reliable deployment platform
- **Community**: React and TypeScript communities for excellent tooling

## 📞 Support

For support and questions:
- 📧 Email: support@sembalun.app
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/sembalun/issues)
- 📖 Documentation: [Project Wiki](https://github.com/your-org/sembalun/wiki)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/sembalun/discussions)

---

Built with ❤️ for mindfulness practitioners everywhere.