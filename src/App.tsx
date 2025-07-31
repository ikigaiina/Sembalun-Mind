import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { OfflineProvider } from './contexts/OfflineContext';
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
import { ComponentsDemo } from './pages/ComponentsDemo';
import { EmotionalAwareness } from './pages/EmotionalAwareness';
import { OfflineToast } from './components/ui/OfflineToast';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { SplashScreen } from './components/ui/SplashScreen';
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

  if (import.meta.env?.DEV) {
    console.log('App: isOnboardingComplete =', isOnboardingComplete);
  }

  // Show onboarding flow if not completed
  if (!isOnboardingComplete) {
    if (import.meta.env?.DEV) {
      console.log('App: Showing onboarding flow');
    }
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  if (import.meta.env?.DEV) {
    console.log('App: Showing main dashboard');
  }

  // Show main app if onboarding is completed
  return (
    <>
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
          <Route 
            path="/breathing" 
            element={
              <DashboardLayout showBottomNav={false}>
                <BreathingSession />
              </DashboardLayout>
            } 
          />
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
    </>
  );
};

function App() {
  return (
    <OfflineProvider>
      <OnboardingProvider>
        <Router>
          <AppContent />
        </Router>
      </OnboardingProvider>
    </OfflineProvider>
  );
}

export default App;