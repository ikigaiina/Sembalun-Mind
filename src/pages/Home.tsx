import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../contexts/OnboardingContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Cairn } from '../components/ui/Cairn';
import { CairnIcon } from '../components/ui/CairnIcon';
import { BreathingCard } from '../components/ui/BreathingCard';
import { MoodSelector, type MoodType } from '../components/ui/MoodSelector';
import { FloatingButton } from '../components/ui/FloatingButton';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { resetOnboarding } = useOnboarding();
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const [breathingActive, setBreathingActive] = useState(false);

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading text-gray-800 mb-2">Sembalun</h1>
        <p className="text-gray-600 font-body">Perjalanan meditasi yang tenang</p>
      </div>

      <Card className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-4">
            <Cairn progress={60} size="large" />
            <CairnIcon progress={80} size={40} variant="artistic" className="text-primary animate-pulse hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <h3 className="text-lg font-heading text-gray-800">Progress Hari Ini</h3>
            <p className="text-sm text-gray-600">3 dari 5 sesi selesai</p>
          </div>
        </div>
      </Card>

      {/* Mood Selector */}
      <Card>
        <MoodSelector 
          selectedMood={selectedMood}
          onMoodSelect={setSelectedMood}
        />
      </Card>

      {/* Breathing Card */}
      <BreathingCard
        title="Latihan Pernapasan"
        description="Teknik pernapasan untuk menenangkan pikiran"
        isActive={breathingActive}
        onClick={() => setBreathingActive(!breathingActive)}
      >
        <Button 
          variant={breathingActive ? "secondary" : "primary"}
          size="small"
          onClick={(e) => {
            e?.stopPropagation();
            setBreathingActive(!breathingActive);
          }}
        >
          {breathingActive ? 'Berhenti' : 'Mulai'}
        </Button>
      </BreathingCard>

      <div className="space-y-4">
        <Button 
          className="w-full" 
          size="large"
          onClick={() => navigate('/meditation')}
        >
          Mulai Meditasi
        </Button>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="secondary" 
            className="flex-1"
            onClick={() => navigate('/history')}
          >
            Riwayat
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/demo')}
          >
            Demo UI
          </Button>
        </div>
      </div>

      <Card padding="small">
        <h4 className="font-heading text-gray-800 mb-3">Sesi Tersedia</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
            <span className="text-sm">Pernapasan Mindful</span>
            <span className="text-xs text-gray-500">10 menit</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
            <span className="text-sm">Visualisasi Gunung</span>
            <span className="text-xs text-gray-500">15 menit</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
            <span className="text-sm">Body Scan</span>
            <span className="text-xs text-gray-500">20 menit</span>
          </div>
        </div>
      </Card>

      {/* Development: Reset onboarding button */}
      {import.meta.env?.DEV && (
        <Card padding="small">
          <h4 className="font-heading text-gray-800 mb-3">Development Tools</h4>
          <Button
            variant="outline"
            size="small"
            onClick={resetOnboarding}
            className="w-full"
          >
            Reset Onboarding
          </Button>
        </Card>
      )}

      {/* Floating Action Button */}
      <FloatingButton
        onClick={() => navigate('/meditation')}
        variant="primary"
        size="large"
      >
        <CairnIcon size={28} variant="artistic" className="animate-bounce" />
      </FloatingButton>
    </div>
  );
};