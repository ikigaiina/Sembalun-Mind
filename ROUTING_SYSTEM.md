# Sembalun - Routing & Navigation System

## 🧭 Navigation Architecture

Sembalun menggunakan React Router v6 dengan struktur navigasi yang intuitif dan mendukung pengalaman pengguna yang lancar di perangkat mobile dan desktop.

## 🏗️ Routing Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    APP ROUTING                              │
├─────────────────────────────────────────────────────────────┤
│  React Router v6 Configuration                             │
│  ├── Public Routes (Unauthenticated)                       │
│  ├── Protected Routes (Authenticated)                      │
│  ├── Cultural Setup Routes                                 │
│  └── Error Boundaries & 404 Handling                       │
├─────────────────────────────────────────────────────────────┤
│                    NAVIGATION PATTERNS                      │
├─────────────────────────────────────────────────────────────┤
│  Mobile Navigation                                          │
│  ├── Bottom Tab Navigation (Primary)                       │
│  ├── Hamburger Menu (Secondary)                            │
│  ├── Modal Navigation (Overlays)                           │
│  └── Gesture-based Navigation                              │
│                                                             │
│  Desktop Navigation                                         │
│  ├── Sidebar Navigation (Primary)                          │
│  ├── Top Navigation Bar                                     │
│  ├── Breadcrumbs (Deep Navigation)                         │
│  └── Keyboard Shortcuts                                    │
├─────────────────────────────────────────────────────────────┤
│                    CULTURAL NAVIGATION                      │
├─────────────────────────────────────────────────────────────┤
│  Tradition-based Routes                                     │
│  ├── /javanese/* (Javanese meditation paths)               │
│  ├── /balinese/* (Balinese meditation paths)               │
│  ├── /sundanese/* (Sundanese meditation paths)             │
│  └── /minang/* (Minang meditation paths)                   │
└─────────────────────────────────────────────────────────────┘
```

## 🛣️ Route Configuration

```typescript
// routes/AppRoutes.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCulturalTheme } from '../contexts/CulturalThemeContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { CulturalSetupGuard } from '../components/auth/CulturalSetupGuard';

// Lazy load components for better performance
const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/Login'));
const SignUp = lazy(() => import('../pages/SignUp'));
const CulturalSetup = lazy(() => import('../pages/CulturalSetup'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const BreathingSession = lazy(() => import('../pages/BreathingSession'));
const MeditationSession = lazy(() => import('../pages/MeditationSession'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Explore = lazy(() => import('../pages/Explore'));
const Community = lazy(() => import('../pages/Community'));
const Analytics = lazy(() => import('../pages/Analytics'));
const ContentLibrary = lazy(() => import('../pages/ContentLibrary'));

// Cultural tradition pages
const JavaneseMeditation = lazy(() => import('../pages/cultural/JavaneseMeditation'));
const BalineseMeditation = lazy(() => import('../pages/cultural/BalineseMeditation'));
const SundaneseMeditation = lazy(() => import('../pages/cultural/SundaneseMeditation'));
const MinangMeditation = lazy(() => import('../pages/cultural/MinangMeditation'));

// Admin and management pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ContentManagement = lazy(() => import('../pages/admin/ContentManagement'));

// Error pages
const NotFound = lazy(() => import('../pages/errors/NotFound'));
const ErrorPage = lazy(() => import('../pages/errors/ErrorPage'));

interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requiresAuth?: boolean;
  requiresCulturalSetup?: boolean;
  requiredRoles?: string[];
  culturalContext?: string;
  title?: string;
  description?: string;
}

const routeConfigs: RouteConfig[] = [
  // Public routes
  {
    path: '/',
    element: Landing,
    title: 'Sembalun - Meditasi Tradisional Indonesia',
    description: 'Platform meditasi yang menggabungkan teknologi modern dengan kearifan tradisional Indonesia',
  },
  {
    path: '/login',
    element: Login,
    title: 'Masuk - Sembalun',
    description: 'Masuk ke akun Sembalun Anda',
  },
  {
    path: '/signup',
    element: SignUp,
    title: 'Daftar - Sembalun',
    description: 'Daftar untuk memulai perjalanan meditasi Anda',
  },

  // Cultural setup
  {
    path: '/cultural-setup',
    element: CulturalSetup,
    requiresAuth: true,
    title: 'Pilih Tradisi - Sembalun',
    description: 'Pilih tradisi meditasi Indonesia yang ingin Anda pelajari',
  },

  // Protected main routes
  {
    path: '/dashboard',
    element: Dashboard,
    requiresAuth: true,
    requiresCulturalSetup: true,
    title: 'Dashboard - Sembalun',
    description: 'Pantau progress meditasi Anda',
  },
  {
    path: '/session/breathing',
    element: BreathingSession,
    requiresAuth: true,
    requiresCulturalSetup: true,
    title: 'Sesi Pernapasan - Sembalun',
    description: 'Latihan pernapasan untuk ketenangan pikiran',
  },
  {
    path: '/session/meditation/:sessionId?',
    element: MeditationSession,
    requiresAuth: true,
    requiresCulturalSetup: true,
    title: 'Sesi Meditasi - Sembalun',
    description: 'Sesi meditasi terpandu dengan tradisi Indonesia',
  },
  {
    path: '/profile',
    element: Profile,
    requiresAuth: true,
    title: 'Profil - Sembalun',
    description: 'Kelola profil dan preferensi Anda',
  },
  {
    path: '/settings',
    element: Settings,
    requiresAuth: true,
    title: 'Pengaturan - Sembalun',
    description: 'Atur preferensi aplikasi Anda',
  },
  {
    path: '/explore',
    element: Explore,
    requiresAuth: true,
    requiresCulturalSetup: true,
    title: 'Jelajahi - Sembalun',
    description: 'Jelajahi konten meditasi dan tradisi budaya',
  },
  {
    path: '/community',
    element: Community,
    requiresAuth: true,
    title: 'Komunitas - Sembalun',
    description: 'Bergabung dengan komunitas meditasi',
  },
  {
    path: '/analytics',
    element: Analytics,
    requiresAuth: true,
    title: 'Analitik - Sembalun',
    description: 'Analisis mendalam progress meditasi Anda',
  },
  {
    path: '/library',
    element: ContentLibrary,
    requiresAuth: true,
    requiresCulturalSetup: true,
    title: 'Perpustakaan - Sembalun',
    description: 'Kumpulan konten meditasi dan budaya',
  },

  // Cultural tradition routes
  {
    path: '/traditions/javanese/*',
    element: JavaneseMeditation,
    requiresAuth: true,
    requiresCulturalSetup: true,
    culturalContext: 'javanese',
    title: 'Meditasi Jawa - Sembalun',
    description: 'Jelajahi tradisi meditasi Jawa',
  },
  {
    path: '/traditions/balinese/*',
    element: BalineseMeditation,
    requiresAuth: true,
    requiresCulturalSetup: true,
    culturalContext: 'balinese',
    title: 'Meditasi Bali - Sembalun',
    description: 'Jelajahi tradisi meditasi Bali',
  },
  {
    path: '/traditions/sundanese/*',
    element: SundaneseMeditation,
    requiresAuth: true,
    requiresCulturalSetup: true,
    culturalContext: 'sundanese',
    title: 'Meditasi Sunda - Sembalun',
    description: 'Jelajahi tradisi meditasi Sunda',
  },
  {
    path: '/traditions/minang/*',
    element: MinangMeditation,
    requiresAuth: true,
    requiresCulturalSetup: true,
    culturalContext: 'minang',
    title: 'Meditasi Minang - Sembalun',
    description: 'Jelajahi tradisi meditasi Minangkabau',
  },

  // Admin routes
  {
    path: '/admin',
    element: AdminDashboard,
    requiresAuth: true,
    requiredRoles: ['admin'],
    title: 'Admin Dashboard - Sembalun',
    description: 'Panel administrasi Sembalun',
  },
  {
    path: '/admin/content',
    element: ContentManagement,
    requiresAuth: true,
    requiredRoles: ['admin', 'content_manager'],
    title: 'Manajemen Konten - Sembalun',
    description: 'Kelola konten meditasi dan budaya',
  },
];

export const AppRoutes: React.FC = () => {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoadingSpinner />}>
          <Routes>
            {/* Error routes */}
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/404" element={<NotFound />} />

            {/* Auth callback routes */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Dynamic route generation */}
            {routeConfigs.map((config) => (
              <Route
                key={config.path}
                path={config.path}
                element={
                  <RouteWrapper
                    config={config}
                    component={config.element}
                  />
                }
              />
            ))}

            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

// Route wrapper component for handling guards and metadata
const RouteWrapper: React.FC<{
  config: RouteConfig;
  component: React.ComponentType;
}> = ({ config, component: Component }) => {
  const { user, culturalPreferences } = useAuth();
  const { switchTradition, availableTraditions } = useCulturalTheme();

  // Set document title and meta description
  React.useEffect(() => {
    if (config.title) {
      document.title = config.title;
    }
    if (config.description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', config.description);
      }
    }
  }, [config.title, config.description]);

  // Handle cultural context switching
  React.useEffect(() => {
    if (config.culturalContext && availableTraditions.length > 0) {
      const tradition = availableTraditions.find(t => t.name === config.culturalContext);
      if (tradition) {
        switchTradition(tradition.id);
      }
    }
  }, [config.culturalContext, availableTraditions, switchTradition]);

  let element = <Component />;

  // Apply route guards
  if (config.requiresAuth) {
    element = (
      <ProtectedRoute>
        {element}
      </ProtectedRoute>
    );
  }

  if (config.requiresCulturalSetup) {
    element = (
      <CulturalSetupGuard>
        {element}
      </CulturalSetupGuard>
    );
  }

  if (config.requiredRoles) {
    element = (
      <RoleGuard requiredRoles={config.requiredRoles}>
        {element}
      </RoleGuard>
    );
  }

  return element;
};

// Loading component for page transitions
const PageLoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
    <LoadingSpinner size="large" />
  </div>
);
```

## 🔐 Route Guards

```typescript
// components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login with return path
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname + location.search }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

// components/auth/CulturalSetupGuard.tsx
export const CulturalSetupGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, culturalPreferences } = useAuth();

  // If user doesn't have cultural preferences set, redirect to setup
  if (user && !culturalPreferences?.preferredTradition) {
    return <Navigate to="/cultural-setup" replace />;
  }

  return <>{children}</>;
};

// components/auth/RoleGuard.tsx
interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, requiredRoles }) => {
  const { user } = useAuth();
  
  const userRoles = user?.user_metadata?.roles || [];
  const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// components/auth/AuthCallback.tsx
export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login?error=callback_failed');
          return;
        }

        if (data.session) {
          // Check if user needs cultural setup
          const user = data.session.user;
          const needsSetup = !user.user_metadata?.cultural_preferences;
          
          if (needsSetup) {
            navigate('/cultural-setup');
          } else {
            // Redirect to intended destination or dashboard
            const from = location.state?.from || '/dashboard';
            navigate(from, { replace: true });
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback failed:', error);
        navigate('/login?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Menyelesaikan proses masuk...</p>
      </div>
    </div>
  );
};
```

## 📱 Mobile Navigation

```typescript
// components/navigation/MobileNavigation.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCulturalTheme } from '../../contexts/CulturalThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  PlayIcon,
  BookOpenIcon,
  ChartBarIcon,
  UserIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  PlayIcon as PlayIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  requiresCulturalSetup?: boolean;
}

const navItems: NavItem[] = [
  {
    name: 'Beranda',
    path: '/dashboard',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
    requiresCulturalSetup: true,
  },
  {
    name: 'Sesi',
    path: '/session',
    icon: PlayIcon,
    activeIcon: PlayIconSolid,
    requiresCulturalSetup: true,
  },
  {
    name: 'Jelajah',
    path: '/explore',
    icon: BookOpenIcon,
    activeIcon: BookOpenIconSolid,
    requiresCulturalSetup: true,
  },
  {
    name: 'Analitik',
    path: '/analytics',
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    name: 'Profil',
    path: '/profile',
    icon: UserIcon,
    activeIcon: UserIconSolid,
  },
];

export const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const { currentTradition, themeTokens } = useCulturalTheme();
  const { culturalPreferences } = useAuth();

  // Filter navigation items based on cultural setup
  const filteredNavItems = navItems.filter(item => {
    if (item.requiresCulturalSetup && !culturalPreferences?.preferredTradition) {
      return false;
    }
    return true;
  });

  const isActive = (path: string) => {
    if (path === '/session') {
      return location.pathname.startsWith('/session');
    }
    return location.pathname === path;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50"
      style={{
        backgroundColor: themeTokens?.colors.background,
        borderColor: themeTokens?.colors.primary + '20',
      }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {filteredNavItems.map((item) => {
          const Icon = isActive(item.path) ? item.activeIcon : item.icon;
          const active = isActive(item.path);
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                active 
                  ? 'text-current' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{
                color: active ? themeTokens?.colors.primary : undefined,
              }}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

// components/navigation/MobileHeader.tsx
export const MobileHeader: React.FC<{
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  actions?: React.ReactNode;
}> = ({ title, showBack = false, showMenu = true, actions }) => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { themeTokens } = useCulturalTheme();

  return (
    <header 
      className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 safe-area-pt"
      style={{
        backgroundColor: themeTokens?.colors.background,
        borderColor: themeTokens?.colors.primary + '20',
      }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center space-x-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          )}
          
          {showMenu && !showBack && (
            <button
              onClick={() => openModal('settings-modal')}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          )}
          
          {title && (
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {actions}
        </div>
      </div>
    </header>
  );
};
```

## 🖥️ Desktop Navigation

```typescript
// components/navigation/DesktopNavigation.tsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCulturalTheme } from '../../contexts/CulturalThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProgressStore } from '../../stores/progressStore';

interface SidebarSection {
  title: string;
  items: NavItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Utama',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
      { name: 'Sesi Meditasi', path: '/session', icon: PlayIcon },
      { name: 'Jelajahi Konten', path: '/explore', icon: BookOpenIcon },
    ],
  },
  {
    title: 'Tradisi Budaya',
    items: [
      { name: 'Meditasi Jawa', path: '/traditions/javanese', icon: SparklesIcon, culturalContext: 'javanese' },
      { name: 'Meditasi Bali', path: '/traditions/balinese', icon: SparklesIcon, culturalContext: 'balinese' },
      { name: 'Meditasi Sunda', path: '/traditions/sundanese', icon: SparklesIcon, culturalContext: 'sundanese' },
      { name: 'Meditasi Minang', path: '/traditions/minang', icon: SparklesIcon, culturalContext: 'minang' },
    ],
  },
  {
    title: 'Analitik & Komunitas',
    items: [
      { name: 'Progress Analitik', path: '/analytics', icon: ChartBarIcon },
      { name: 'Perpustakaan Konten', path: '/library', icon: BookmarkIcon },
      { name: 'Komunitas', path: '/community', icon: UsersIcon },
    ],
  },
  {
    title: 'Akun',
    items: [
      { name: 'Profil Saya', path: '/profile', icon: UserIcon },
      { name: 'Pengaturan', path: '/settings', icon: CogIcon },
    ],
  },
];

export const DesktopNavigation: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { currentTradition, themeTokens } = useCulturalTheme();
  const { culturalPreferences, user } = useAuth();
  const { progress } = useProgressStore();

  const isActive = (path: string) => {
    if (path === '/session') {
      return location.pathname.startsWith('/session');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{
        backgroundColor: themeTokens?.colors.background,
        borderColor: themeTokens?.colors.primary + '20',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <img src="/logo.svg" alt="Sembalun" className="w-8 h-8" />
            <h1 className="text-xl font-bold text-gray-900">Sembalun</h1>
          </div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500">
                {progress.totalSessions} sesi • {Math.floor(progress.totalMinutes)} menit
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {sidebarSections.map((section) => (
          <div key={section.title} className="mb-6">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                // Skip cultural items if user hasn't completed setup
                if (item.culturalContext && !culturalPreferences?.preferredTradition) {
                  return null;
                }
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors group ${
                      active
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    style={{
                      backgroundColor: active ? themeTokens?.colors.primary : undefined,
                      color: active ? 'white' : undefined,
                    }}
                  >
                    <Icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">{item.name}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Cultural tradition indicator */}
      {!collapsed && currentTradition && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentTradition.colorPalette.primary }}
            />
            <span className="text-sm font-medium text-gray-600">
              {currentTradition.displayName}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
```

## 🍞 Breadcrumb Navigation

```typescript
// components/navigation/Breadcrumb.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { useCulturalTheme } from '../../contexts/CulturalThemeContext';

interface BreadcrumbItem {
  name: string;
  path?: string;
  culturalContext?: boolean;
}

const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/session': 'Sesi Meditasi',
  '/session/breathing': 'Latihan Pernapasan',
  '/session/meditation': 'Meditasi Terpandu',
  '/explore': 'Jelajahi',
  '/analytics': 'Analitik',
  '/library': 'Perpustakaan',
  '/community': 'Komunitas',
  '/profile': 'Profil',
  '/settings': 'Pengaturan',
  '/traditions': 'Tradisi Budaya',
  '/traditions/javanese': 'Meditasi Jawa',
  '/traditions/balinese': 'Meditasi Bali',
  '/traditions/sundanese': 'Meditasi Sunda',
  '/traditions/minang': 'Meditasi Minang',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { currentTradition, themeTokens } = useCulturalTheme();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ name: 'Beranda', path: '/dashboard' }];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      const isLast = index === paths.length - 1;
      const title = routeTitleMap[currentPath] || path.charAt(0).toUpperCase() + path.slice(1);
      
      breadcrumbs.push({
        name: title,
        path: isLast ? undefined : currentPath,
        culturalContext: currentPath.includes('/traditions/'),
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.path || item.name}>
          {index > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          )}
          
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-gray-900 transition-colors"
              style={{
                color: item.culturalContext ? themeTokens?.colors.primary : undefined,
              }}
            >
              {item.name}
            </Link>
          ) : (
            <span 
              className="font-medium"
              style={{
                color: item.culturalContext ? themeTokens?.colors.primary : '#374151',
              }}
            >
              {item.name}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
```

## 🎨 Cultural Route Transitions

```typescript
// components/navigation/CulturalRouteTransition.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCulturalTheme } from '../../contexts/CulturalThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export const CulturalRouteTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { currentTradition, themeTokens } = useCulturalTheme();
  const [showTransition, setShowTransition] = useState(false);
  const [previousTradition, setPreviousTradition] = useState(currentTradition?.name);

  useEffect(() => {
    const currentCulturalContext = getCulturalContextFromPath(location.pathname);
    
    if (currentCulturalContext && currentCulturalContext !== previousTradition) {
      setShowTransition(true);
      setPreviousTradition(currentCulturalContext);
      
      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, previousTradition]);

  const getCulturalContextFromPath = (pathname: string): string | null => {
    const culturalPaths = {
      '/traditions/javanese': 'javanese',
      '/traditions/balinese': 'balinese',
      '/traditions/sundanese': 'sundanese',
      '/traditions/minang': 'minang',
    };
    
    for (const [path, tradition] of Object.entries(culturalPaths)) {
      if (pathname.startsWith(path)) {
        return tradition;
      }
    }
    
    return null;
  };

  return (
    <>
      <AnimatePresence>
        {showTransition && currentTradition && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backgroundColor: currentTradition.colorPalette.background,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  backgroundColor: currentTradition.colorPalette.primary,
                }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-white opacity-80"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 0.4, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: currentTradition.colorPalette.primary }}
              >
                {currentTradition.displayName}
              </h2>
              
              <p className="text-gray-600 max-w-md">
                {currentTradition.description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  );
};
```

## ⌨️ Keyboard Navigation

```typescript
// hooks/useKeyboardNavigation.ts
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useModal } from '../contexts/ModalContext';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal, closeModal, activeModal } = useModal();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: '1',
      altKey: true,
      action: () => navigate('/dashboard'),
      description: 'Go to Dashboard',
    },
    {
      key: '2',
      altKey: true,
      action: () => navigate('/session'),
      description: 'Go to Session',
    },
    {
      key: '3',
      altKey: true,
      action: () => navigate('/explore'),
      description: 'Go to Explore',
    },
    {
      key: '4',
      altKey: true,
      action: () => navigate('/analytics'),
      description: 'Go to Analytics',
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => openModal('settings-modal'),
      description: 'Open Settings',
    },
    {
      key: 'p',
      ctrlKey: true,
      action: () => navigate('/profile'),
      description: 'Go to Profile',
    },
    {
      key: 'Escape',
      action: () => {
        if (activeModal) {
          closeModal();
        }
      },
      description: 'Close Modal',
    },
    {
      key: '/',
      action: () => {
        // Focus search input if available
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus Search',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.altKey === event.altKey &&
        !!s.shiftKey === event.shiftKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, activeModal]);

  return {
    shortcuts: shortcuts.map(s => ({
      keys: [
        s.ctrlKey && 'Ctrl',
        s.altKey && 'Alt',
        s.shiftKey && 'Shift',
        s.key,
      ].filter(Boolean).join(' + '),
      description: s.description,
    })),
  };
};

// components/navigation/KeyboardShortcutsHelp.tsx
export const KeyboardShortcutsHelp: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { shortcuts } = useKeyboardNavigation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">?</kbd> to show/hide this help
          </p>
        </div>
      </div>
    </div>
  );
};
```

## 🔄 Route State Management

```typescript
// hooks/useRouteState.ts
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface RouteState {
  previousPath: string | null;
  isBack: boolean;
  params: Record<string, string>;
  searchParams: URLSearchParams;
}

export const useRouteState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [routeState, setRouteState] = useState<RouteState>({
    previousPath: null,
    isBack: false,
    params: {},
    searchParams: new URLSearchParams(),
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    setRouteState(prev => ({
      previousPath: prev.previousPath,
      isBack: location.key === 'default', // Browser back/forward
      params: {}, // Would be populated by useParams() in actual component
      searchParams,
    }));
    
    // Store current path as previous for next navigation
    return () => {
      setRouteState(prev => ({
        ...prev,
        previousPath: location.pathname,
      }));
    };
  }, [location]);

  const navigateWithState = (
    to: string, 
    options?: { 
      replace?: boolean; 
      state?: any; 
      preserveSearch?: boolean 
    }
  ) => {
    const { replace = false, state = null, preserveSearch = false } = options || {};
    
    let finalPath = to;
    if (preserveSearch && location.search) {
      finalPath += location.search;
    }
    
    navigate(finalPath, { 
      replace, 
      state: { 
        ...state, 
        from: location.pathname 
      } 
    });
  };

  const goBackOrFallback = (fallbackPath: string = '/dashboard') => {
    if (routeState.previousPath && routeState.previousPath !== location.pathname) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(location.search);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });

    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
  };

  return {
    routeState,
    navigateWithState,
    goBackOrFallback,
    updateSearchParams,
    currentPath: location.pathname,
    searchParams: routeState.searchParams,
  };
};
```

---

## 🚀 Implementation Checklist

- [x] React Router v6 configuration
- [x] Route guards (authentication, cultural setup, roles)
- [x] Mobile bottom tab navigation
- [x] Desktop sidebar navigation
- [x] Breadcrumb navigation for deep routes
- [x] Cultural route transitions with animations
- [x] Keyboard shortcuts and navigation
- [x] Route state management and history
- [x] Dynamic route generation from config
- [x] SEO-friendly route titles and meta descriptions
- [ ] Route-based code splitting optimization
- [ ] Navigation analytics tracking
- [ ] Route preloading strategies
- [ ] Deep linking and URL sharing

---

*Sistem routing ini dirancang untuk memberikan navigasi yang intuitif dan responsif sambil mempertahankan konteks budaya Indonesia di setiap perpindahan halaman.*