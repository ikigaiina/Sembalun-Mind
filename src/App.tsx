import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { OnboardingFlow } from './pages/onboarding';
import { DashboardLayout } from './components/ui/DashboardLayout';
import { Home } from './pages/Home';
import { Meditation } from './pages/Meditation';
import { History } from './pages/History';
import { ComponentsDemo } from './pages/ComponentsDemo';

// Main app content component
const AppContent: React.FC = () => {
  const { isOnboardingComplete, completeOnboarding } = useOnboarding();

  // Show onboarding flow if not completed
  if (!isOnboardingComplete) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  // Show main app if onboarding is completed
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/meditation" 
          element={
            <DashboardLayout showBottomNav={false}>
              <Meditation />
            </DashboardLayout>
          } 
        />
        <Route path="/history" element={<History />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

function App() {
  return (
    <OnboardingProvider>
      <Router>
        <AppContent />
      </Router>
    </OnboardingProvider>
  );
}

export default App;