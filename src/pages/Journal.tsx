import { DashboardLayout } from '../components/ui/DashboardLayout';
import { ComprehensiveJournalPage } from '../components/journal/ComprehensiveJournalPage';

export const Journal: React.FC = () => {
  return (
    <DashboardLayout>
      <ComprehensiveJournalPage />
    </DashboardLayout>
  );
};