import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useOnboarding } from '../contexts/OnboardingContext';

export const Profile: React.FC = () => {
  const { resetOnboarding } = useOnboarding();

  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-heading text-gray-800 mb-2">Profil Saya</h1>
        <p className="text-gray-600 font-body">Kelola pengaturan dan lihat perkembangan meditasimu</p>
      </div>

      <Card className="text-center">
        <div className="py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="font-heading text-gray-800 mb-2">Segera Hadir</h3>
          <p className="text-gray-600 font-body text-sm mb-6">
            Pengaturan profil, statistik, dan preferensi personal
          </p>
          
          {import.meta.env?.DEV && (
            <Button
              variant="outline"
              size="small"
              onClick={resetOnboarding}
            >
              Reset Onboarding (Dev)
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};