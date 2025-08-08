import React from 'react';
import { DashboardLayout } from '../components/ui';
import { PersonalizedDashboard } from '../components/ui/PersonalizedDashboard';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';
import { useOnboarding } from '../hooks/useOnboarding';

export const Dashboard: React.FC = () => {
  const {
    shouldShowOnboarding,
    completeOnboarding,
    hideOnboardingModal
  } = useOnboarding();

  return (
    <DashboardLayout>
      <PersonalizedDashboard />
      
      <OnboardingModal
        isOpen={shouldShowOnboarding}
        onClose={hideOnboardingModal}
        onComplete={completeOnboarding}
        showWelcomePrompt={true}
      />
    </DashboardLayout>
  );
};