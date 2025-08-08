import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PersonalizationProvider } from './contexts/PersonalizationContext';
import { indonesianMobileOptimizer } from './utils/indonesian-mobile-optimization';
import { useOnboarding } from './hooks/useOnboarding';
import { usePersonalization } from './contexts/PersonalizationContext';
import { OnboardingFlow, type OnboardingData } from './pages/onboarding';
import { DashboardLayout } from './components/ui/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Meditation } from './pages/Meditation';
import { BreathingSession } from './pages/BreathingSession';
import { History } from './pages/History';
import { Explore } from './pages/Explore';
import { Journal } from './pages/Journal';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Progress } from './pages/Progress';
import { ComponentsDemo } from './pages/ComponentsDemo';
import FrameworkDemo from './pages/FrameworkDemo';
import DesignSystemDemo from './pages/DesignSystemDemo';
import CairnShowcase from './pages/CairnShowcase';
import { EmotionalAwareness } from './pages/EmotionalAwareness';
import AdminDashboard from './pages/AdminDashboard';
import { AdminPanel } from './pages/AdminPanel';
import ContentLibrary from './pages/ContentLibrary';
import Analytics from './pages/Analytics';
import AccountManagement from './pages/AccountManagement';
import Courses from './pages/Courses';
import Community from './pages/Community';
import Personalization from './pages/Personalization';
import { MultiagentDashboard } from './pages/MultiagentDashboard';
import Help from './pages/Help';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AuthCallback from './pages/AuthCallback';
import { OfflineToast } from './components/ui/OfflineToast';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { SplashScreen } from './components/ui/SplashScreen';
import { SupabaseProtectedRoute } from './components/auth/SupabaseProtectedRoute';
import { useScrollToTop } from './hooks/useScrollToTop';
import ErrorBoundary from './components/ui/ErrorBoundary';
// Enterprise monitoring re-enabled after fixing errors
import EnterprisePerformanceMonitor from './utils/enterprise-performance-monitor';
// import EnterpriseSecurityManager from './utils/enterprise-security';

// Initialize enterprise systems - re-enabled after fixing errors
const performanceMonitor = EnterprisePerformanceMonitor.getInstance();
// const securityManager = EnterpriseSecurityManager.getInstance();

// Main app content component
const AppContent: React.FC = () => {
  const { isOnboardingComplete, completeOnboarding } = useOnboarding();
  const { updateFromOnboarding } = usePersonalization();
  const [showSplash, setShowSplash] = useState(true);
  
  // Auto-scroll to top on route changes
  useScrollToTop();

  // Handle onboarding completion with personalization data
  const handleOnboardingComplete = (data: OnboardingData) => {
    // Update personalization context with onboarding data
    updateFromOnboarding(data);
    // Mark onboarding as complete
    completeOnboarding();
  };

  // Enterprise monitoring setup - re-enabled after fixing errors
  useEffect(() => {
    // Initialize performance monitoring
    console.log('🚀 Enterprise monitoring re-enabled and functioning');
    
    // Cleanup on unmount
    return () => {
      performanceMonitor.cleanup();
      // securityManager.cleanup();
    };
  }, []);

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }


  // Show onboarding flow if not completed
  if (!isOnboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }


  // Show main app if onboarding is completed
  return (
    <SupabaseProtectedRoute>
      <OfflineToast />
      <InstallPrompt />
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/old-home" element={<Home />} />
          <Route 
            path="/meditation" 
            element={
              <DashboardLayout showBottomNav={false}>
                <Meditation />
              </DashboardLayout>
            } 
          />
          <Route path="/history" element={<History />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route 
            path="/progress" 
            element={
              <DashboardLayout showBottomNav={true}>
                <Progress />
              </DashboardLayout>
            } 
          />
          <Route 
            path="/breathing" 
            element={
              <DashboardLayout showBottomNav={false}>
                <BreathingSession />
              </DashboardLayout>
            } 
          />
          
          {/* New Pages */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/content-library" element={<ContentLibrary />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/account" element={<AccountManagement />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/community" element={<Community />} />
          <Route path="/personalization" element={<Personalization />} />
          <Route path="/multiagent" element={<MultiagentDashboard />} />
          <Route path="/help" element={<Help />} />
          
          {/* Utility Pages */}
          <Route 
            path="/demo" 
            element={
              <DashboardLayout showBottomNav={false}>
                <ComponentsDemo />
              </DashboardLayout>
            } 
          />
          <Route 
            path="/framework" 
            element={
              <DashboardLayout showBottomNav={false}>
                <FrameworkDemo />
              </DashboardLayout>
            } 
          />
          <Route 
            path="/design-system-2025" 
            element={
              <DashboardLayout showBottomNav={false}>
                <DesignSystemDemo />
              </DashboardLayout>
            } 
          />
          <Route 
            path="/cairn-showcase" 
            element={
              <DashboardLayout showBottomNav={false}>
                <CairnShowcase />
              </DashboardLayout>
            } 
          />
          <Route 
            path="/onboarding" 
            element={<OnboardingFlow onComplete={handleOnboardingComplete} />} 
          />
          <Route path="/emotional-awareness" element={<EmotionalAwareness />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </SupabaseProtectedRoute>
  );
};

function App() {
  // Apply Indonesian mobile optimizations on app start
  useEffect(() => {
    // Apply CSS classes for Indonesian mobile optimization
    const optimizationClasses = indonesianMobileOptimizer.getCSSOptimizations();
    document.documentElement.classList.add(...optimizationClasses);
    
    // Set CSS custom properties for Indonesian UI
    const uiPrefs = indonesianMobileOptimizer.getUIPreferences();
    const animationConfig = indonesianMobileOptimizer.getAnimationConfig();
    const root = document.documentElement.style;
    
    root.setProperty('--indonesian-spacing-base', `${uiPrefs.spacing.base}px`);
    root.setProperty('--indonesian-spacing-touch', `${uiPrefs.spacing.touch}px`);
    root.setProperty('--indonesian-font-scale', uiPrefs.typography.scale.toString());
    root.setProperty('--indonesian-animation-duration', `${animationConfig.duration}s`);
    root.setProperty('--indonesian-nav-color', uiPrefs.navigation.activeColor);
    
    // Add meta tag for mobile optimization
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
    
    return () => {
      document.documentElement.classList.remove(...optimizationClasses);
    };
  }, []);
  
  return (
    <ThemeProvider defaultTheme="light">
      <ErrorBoundary showDetails={import.meta.env.DEV}>
        <OfflineProvider>
          <SupabaseAuthProvider>
            <PersonalizationProvider>
              <OnboardingProvider>
                <Router>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    
                    {/* Protected routes */}
                    <Route path="/*" element={<AppContent />} />
                  </Routes>
                </Router>
              </OnboardingProvider>
            </PersonalizationProvider>
          </SupabaseAuthProvider>
        </OfflineProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;