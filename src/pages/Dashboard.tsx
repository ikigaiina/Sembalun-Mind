import React from 'react';
import { DashboardLayout } from '../components/ui';
import { PersonalizedDashboard } from '../components/ui/PersonalizedDashboard';

export const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <PersonalizedDashboard />
    </DashboardLayout>
  );
};