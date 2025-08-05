import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { useOnboarding } from './hooks/useOnboarding';
import { OnboardingFlow } from './pages/onboarding';
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
import { ComponentsDemo } from './pages/ComponentsDemo';
import { EmotionalAwareness } from './pages/EmotionalAwareness';
// Removed: ContentLibrary, Analytics, Courses, Community, Personalization, MultiagentDashboard
// These will be rebuilt with Supabase integration
import Help from './pages/Help';
import { OfflineToast } from './components/ui/OfflineToast';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { SplashScreen } from './components/ui/SplashScreen';
import { SupabaseProtectedRoute } from './components/auth/SupabaseProtectedRoute';
import { AuthCallback } from './pages/AuthCallback';
import { AuthResetPassword } from './pages/AuthResetPassword';
import { useScrollToTop } from './hooks/useScrollToTop';

// Main app content component
const AppContent: React.FC = () => {
  const { isOnboardingComplete, completeOnboarding } = useOnboarding();
  const [showSplash, setShowSplash] = useState(true);
  
  // Auto-scroll to top on route changes
  useScrollToTop();

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }


  // Show onboarding flow if not completed
  if (!isOnboardingComplete) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }


  // Show main app if onboarding is completed
  return (
    <>
      <Routes>
        {/* Auth routes that don't require protection */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/reset-password" element={<AuthResetPassword />} />
        
        {/* Protected routes */}
        <Route path="/*" element={
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
            path="/breathing" 
            element={
              <DashboardLayout showBottomNav={false}>
                <BreathingSession />
              </DashboardLayout>
            } 
          />
          
          {/* New Pages - To be rebuilt with Supabase */}
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
            path="/onboarding" 
            element={<OnboardingFlow onComplete={completeOnboarding} />} 
          />
          <Route path="/emotional-awareness" element={<EmotionalAwareness />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DashboardLayout>
          </SupabaseProtectedRoute>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <OfflineProvider>
      <SupabaseAuthProvider>
        <OnboardingProvider>
          <Router>
            <AppContent />
          </Router>
        </OnboardingProvider>
      </SupabaseAuthProvider>
    </OfflineProvider>
  );
}

export default App;