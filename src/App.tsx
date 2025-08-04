import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { AuthProvider } from './contexts/AuthContextProvider';
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
import AdminDashboard from './pages/AdminDashboard';
import ContentLibrary from './pages/ContentLibrary';
import Analytics from './pages/Analytics';
import AccountManagement from './pages/AccountManagement';
import Courses from './pages/Courses';
import Community from './pages/Community';
import Personalization from './pages/Personalization';
import { MultiagentDashboard } from './pages/MultiagentDashboard';
import Help from './pages/Help';
import { OfflineToast } from './components/ui/OfflineToast';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { SplashScreen } from './components/ui/SplashScreen';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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
    <ProtectedRoute>
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
          
          {/* New Pages */}
          <Route path="/admin" element={<AdminDashboard />} />
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
            path="/onboarding" 
            element={<OnboardingFlow onComplete={completeOnboarding} />} 
          />
          <Route path="/emotional-awareness" element={<EmotionalAwareness />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <OfflineProvider>
      <AuthProvider>
        <OnboardingProvider>
          <Router>
            <AppContent />
          </Router>
        </OnboardingProvider>
      </AuthProvider>
    </OfflineProvider>
  );
}

export default App;