# Sembalun - Comprehensive System Architecture

## 🏗️ System Overview

Sembalun adalah platform meditasi modern yang menggabungkan teknologi web terdepan dengan kearifan tradisional Indonesia. Arsitektur sistem dirancang untuk skalabilitas, keandalan, dan pengalaman pengguna yang optimal.

### Core Tech Stack
- **Frontend**: React 19.1.0 + TypeScript 5.8.3 + Vite
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Edge Functions)
- **State Management**: React Context + Zustand untuk state kompleks
- **Styling**: Stitches (CSS-in-JS) + Design Tokens
- **Build**: Vite + Vercel untuk deployment
- **PWA**: Service Workers + IndexedDB untuk offline functionality

## 🌐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  PWA Web App (React + TypeScript)                          │
│  ├── Component Library (Cultural + Modern UI)              │
│  ├── Design System (Indonesian Cultural Tokens)            │
│  ├── State Management (Context + Zustand)                  │
│  ├── Service Workers (Offline + Caching)                   │
│  └── IndexedDB (Local Storage)                             │
├─────────────────────────────────────────────────────────────┤
│                    API LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  Supabase Backend Services                                 │
│  ├── Authentication (Row Level Security)                   │
│  ├── PostgreSQL Database (Optimized Schemas)               │
│  ├── Real-time Subscriptions (WebSocket)                   │
│  ├── Edge Functions (Serverless Logic)                     │
│  ├── Storage (Cultural Media Assets)                       │
│  └── Analytics & Monitoring                                │
├─────────────────────────────────────────────────────────────┤
│                    EXTERNAL SERVICES                       │
├─────────────────────────────────────────────────────────────┤
│  ├── Vercel (Hosting + CDN)                               │
│  ├── Cultural Content APIs (Traditional Music/Guidance)    │
│  └── Analytics Services (Performance Monitoring)           │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Application Architecture

### Frontend Architecture (React + TypeScript)

```typescript
// Core App Structure
src/
├── components/           // Reusable UI components
│   ├── ui/              // Basic UI components (Button, Input, etc.)
│   ├── cultural/        // Indonesian cultural components
│   ├── meditation/      // Meditation-specific components
│   └── auth/            // Authentication components
├── pages/               // Route-based page components
├── contexts/            // React Context providers
├── hooks/               // Custom React hooks
├── services/            // API and business logic
├── utils/               // Helper functions and utilities
├── types/               // TypeScript type definitions
└── config/              // App configuration
```

### Component Hierarchy

```
App
├── AuthProvider (Global authentication state)
├── ThemeProvider (Cultural theme switching)
├── ModalProvider (Modal management)
├── Router
│   ├── PublicRoutes
│   │   ├── Landing
│   │   ├── Login/SignUp
│   │   └── Cultural Showcase
│   └── ProtectedRoutes
│       ├── Dashboard (Progress + Quick Actions)
│       ├── Meditation Sessions
│       │   ├── Session Builder
│       │   ├── Active Session
│       │   └── Session History
│       ├── Cultural Content
│       │   ├── Javanese Meditation
│       │   ├── Balinese Meditation
│       │   ├── Sundanese Meditation
│       │   └── Minang Meditation
│       ├── Profile & Settings
│       └── Community Features
```

## 🔐 Security Architecture

### Authentication Flow
```
User Registration/Login
├── Client-side validation
├── Supabase Auth (JWT tokens)
├── Row Level Security (RLS) policies
├── Session management (refresh tokens)
└── Cultural preference initialization
```

### Data Security Layers
1. **Transport Layer**: HTTPS encryption
2. **Application Layer**: JWT token validation
3. **Database Layer**: Row Level Security (RLS)
4. **Client Layer**: Secure token storage
5. **Cultural Data**: Respectful handling of traditional content

## 🗄️ Database Architecture

### Core Tables Structure
```sql
-- Users and Authentication
users (extends auth.users)
├── id (uuid, primary key)
├── email (text, unique)
├── cultural_preferences (jsonb)
├── meditation_level (enum)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Cultural Content
cultural_traditions
├── id (uuid, primary key)
├── name (text) -- 'javanese', 'balinese', etc.
├── description (text)
├── color_scheme (jsonb)
├── music_assets (text[])
└── guidance_scripts (jsonb)

-- Meditation Sessions
meditation_sessions
├── id (uuid, primary key)
├── user_id (uuid, foreign key)
├── tradition_id (uuid, foreign key)
├── duration (integer) -- in minutes
├── session_type (enum)
├── completed_at (timestamptz)
├── rating (integer, 1-5)
└── notes (text)

-- User Progress
user_progress
├── id (uuid, primary key)
├── user_id (uuid, foreign key)
├── total_sessions (integer)
├── total_minutes (integer)
├── current_streak (integer)
├── achievements (jsonb)
└── cultural_mastery (jsonb)
```

## 🔄 State Management Architecture

### Global State (React Context)
```typescript
// Authentication State
interface AuthState {
  user: User | null;
  isLoading: boolean;
  culturalPreferences: CulturalPreferences;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateCulturalPreferences: (prefs: CulturalPreferences) => Promise<void>;
}

// Theme State (Cultural)
interface ThemeState {
  currentTradition: CulturalTradition;
  colorScheme: ColorScheme;
  switchTradition: (tradition: CulturalTradition) => void;
  customizations: UserCustomizations;
}

// Modal State
interface ModalState {
  activeModal: ModalType | null;
  modalProps: any;
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}
```

### Local Component State (useState/useReducer)
- Form inputs and validation
- UI component states (loading, expanded, etc.)
- Temporary data (session builder selections)

### Persistent State (Zustand + IndexedDB)
```typescript
// Offline Data Store
interface OfflineStore {
  cachedSessions: MeditationSession[];
  culturalContent: CulturalContent[];
  userPreferences: UserPreferences;
  syncQueue: SyncItem[];
  lastSyncTime: Date;
}

// Session State Store
interface SessionStore {
  activeSession: ActiveSession | null;
  sessionHistory: SessionSummary[];
  currentStreak: number;
  weeklyProgress: WeeklyProgress;
}
```

## 🌐 API Architecture

### Supabase Client Configuration
```typescript
// supabase/client.ts
export const supabase = createClient<Database>(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storage: window.localStorage,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
```

### API Service Layer
```typescript
// services/api/
├── authService.ts        // Authentication operations
├── userService.ts        // User profile management
├── meditationService.ts  // Session CRUD operations
├── culturalService.ts    // Cultural content management
├── progressService.ts    // Progress tracking
└── offlineService.ts     // Offline sync management
```

### Real-time Features
```typescript
// Real-time subscription for user progress
const subscribeToProgress = (userId: string) => {
  return supabase
    .channel(`user-progress-${userId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'user_progress',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      // Update local progress state
      updateProgressState(payload.new);
    })
    .subscribe();
};
```

## 📱 PWA Architecture

### Service Worker Strategy
```typescript
// public/sw.js
const CACHE_NAME = 'sembalun-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/cultural-assets/javanese-music.mp3',
  '/cultural-assets/balinese-guidance.mp3',
  // Cultural content for offline access
];

// Network First, then Cache strategy for API calls
// Cache First strategy for static cultural assets
```

### Offline Functionality
```typescript
// hooks/useOffline.ts
export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  
  const queueForSync = (item: SyncItem) => {
    // Store in IndexedDB for persistence
    storeSyncItem(item);
    setSyncQueue(prev => [...prev, item]);
  };
  
  const processSyncQueue = async () => {
    // Process all queued items when online
    for (const item of syncQueue) {
      await syncItem(item);
    }
    clearSyncQueue();
  };
};
```

## 🎨 Cultural System Architecture

### Cultural Content Management
```typescript
// types/cultural.ts
interface CulturalTradition {
  id: string;
  name: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  displayName: string;
  description: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  assets: {
    music: string[];
    guidance: string[];
    backgrounds: string[];
    icons: string[];
  };
  meditationStyles: MeditationStyle[];
}
```

### Cultural Theme Provider
```typescript
// contexts/CulturalThemeProvider.tsx
export const CulturalThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [currentTradition, setCurrentTradition] = useState<CulturalTradition>();
  const [themeTokens, setThemeTokens] = useState<ThemeTokens>();
  
  const switchTradition = useCallback((tradition: CulturalTradition) => {
    setCurrentTradition(tradition);
    setThemeTokens(generateThemeTokens(tradition));
    
    // Update CSS custom properties
    updateCSSVariables(tradition.colorPalette);
  }, []);
  
  return (
    <CulturalThemeContext.Provider value={{
      currentTradition,
      themeTokens,
      switchTradition,
      availableTraditions
    }}>
      {children}
    </CulturalThemeContext.Provider>
  );
};
```

## 🔄 Performance Architecture

### Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          cultural: ['./src/services/culturalService'],
          meditation: ['./src/components/meditation']
        }
      }
    }
  },
  // Code splitting for cultural content
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ]
});
```

### Caching Strategy
```typescript
// utils/cache.ts
export class CacheManager {
  private culturalCache = new Map<string, CulturalContent>();
  private sessionCache = new Map<string, MeditationSession>();
  
  // Intelligent caching based on cultural preferences
  async getCulturalContent(traditionId: string): Promise<CulturalContent> {
    if (this.culturalCache.has(traditionId)) {
      return this.culturalCache.get(traditionId)!;
    }
    
    const content = await fetchCulturalContent(traditionId);
    this.culturalCache.set(traditionId, content);
    
    // Preload related cultural content
    this.preloadRelatedContent(traditionId);
    
    return content;
  }
}
```

## 📊 Monitoring & Analytics

### Performance Monitoring
```typescript
// utils/monitoring.ts
export const trackPerformance = () => {
  // Core Web Vitals
  getCLS(onPerfEntry);
  getFID(onPerfEntry);
  getFCP(onPerfEntry);
  getLCP(onPerfEntry);
  getTTFB(onPerfEntry);
  
  // Cultural content load times
  trackCulturalContentLoad();
  
  // Meditation session metrics
  trackSessionPerformance();
};

// Cultural-specific analytics
export const trackCulturalEngagement = (tradition: string, action: string) => {
  analytics.track('cultural_engagement', {
    tradition,
    action,
    timestamp: Date.now(),
    user_level: getCurrentUserLevel(),
  });
};
```

## 🚀 Deployment Architecture

### Production Environment
```
Vercel Edge Network
├── Static Assets (CDN cached)
├── React App Bundle (Gzip compressed)
├── Cultural Assets (Region-specific caching)
└── Service Worker (Offline functionality)

Supabase Infrastructure
├── PostgreSQL Database (Multi-region backup)
├── Authentication Service (JWT management)
├── Real-time Engine (WebSocket connections)
├── Edge Functions (Serverless compute)
└── Storage (Cultural media files)
```

### Environment Configuration
```typescript
// config/environment.ts
export const config = {
  development: {
    supabaseUrl: process.env.REACT_APP_SUPABASE_URL_DEV,
    supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY_DEV,
    culturalAssetsUrl: 'http://localhost:3001/cultural',
  },
  production: {
    supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
    supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
    culturalAssetsUrl: 'https://cdn.sembalun.com/cultural',
  },
};
```

## 🔧 Development Workflow

### Code Organization
```
sembalun/
├── src/                 // Application source code
├── public/             // Static assets and PWA files
├── docs/               // Comprehensive documentation
├── supabase/           // Database migrations and functions
├── cultural-assets/    // Traditional Indonesian content
├── tests/              // Unit and integration tests
└── deployment/         // Production deployment configs
```

### Development Commands
```bash
# Development server with hot reload
npm run dev

# Build production bundle
npm run build

# Run comprehensive test suite
npm run test

# Cultural content validation
npm run validate:cultural

# Database migrations
npm run db:migrate

# Deploy to production
npm run deploy:production
```

## 🌍 Scalability Considerations

### Horizontal Scaling
- **CDN Distribution**: Cultural content cached globally
- **Database Scaling**: Read replicas for meditation content
- **Microservices**: Cultural services can be split independently
- **Edge Computing**: Meditation logic processed at edge

### Vertical Scaling
- **Component Lazy Loading**: Load cultural components on demand
- **Progressive Enhancement**: Core meditation features first
- **Intelligent Prefetching**: Predict user's cultural interests
- **Resource Optimization**: Cultural assets compressed and optimized

## 🔒 Data Privacy & Cultural Sensitivity

### Privacy Protection
- **Minimal Data Collection**: Only essential meditation progress
- **Cultural Respect**: Traditional content used with permission
- **User Control**: Full control over cultural preferences
- **Data Sovereignty**: Respect for Indonesian cultural data laws

### Cultural Guidelines
- **Authentic Representation**: Work with cultural experts
- **Respectful Implementation**: Avoid appropriation or misrepresentation
- **Community Input**: Regular feedback from cultural communities
- **Educational Context**: Provide historical and cultural context

---

## 📚 Next Steps

1. **Authentication System**: Implement secure Supabase auth
2. **Database Setup**: Create optimized PostgreSQL schemas
3. **Cultural Integration**: Add traditional Indonesian content
4. **PWA Implementation**: Enable offline meditation experiences
5. **Performance Optimization**: Implement caching and lazy loading
6. **Cultural Validation**: Review with Indonesian meditation experts

---

*Arsitektur ini dirancang untuk menghormati tradisi meditasi Indonesia sambil memanfaatkan teknologi modern untuk pengalaman pengguna yang optimal.*