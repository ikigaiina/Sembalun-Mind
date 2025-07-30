import { useNavigate } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Cairn } from '../components/ui/Cairn';

export const Meditation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Header title="Sesi Meditasi" showBack={true} onBack={() => navigate('/')} />
      
      <div className="px-4 py-6 space-y-6">
        <Card className="text-center">
          <div className="space-y-4">
            <div className="text-6xl font-heading" style={{color: 'var(--color-primary)'}}>05:30</div>
            <p className="text-gray-600">Pernapasan Mindful</p>
            <div className="flex justify-center">
              <Cairn progress={35} size="medium" />
            </div>
          </div>
        </Card>

        <Card padding="small">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Fokus pada napas Anda</p>
            <p className="text-xs text-gray-500">
              Rasakan udara masuk dan keluar dari hidung Anda dengan perlahan
            </p>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button size="large" className="w-24 h-24 rounded-full">
            Jeda
          </Button>
        </div>
      </div>
    </div>
  );
};