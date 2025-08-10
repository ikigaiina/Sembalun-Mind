import { useNavigate } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Cairn } from '../components/ui/Cairn';
import { useSmartBack } from '../hooks/useNavigationHistory';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const { goBack } = useSmartBack('/');
  
  const sessions = [
    { date: 'Hari ini', type: 'Pernapasan Mindful', duration: '10 menit', completed: true },
    { date: 'Hari ini', type: 'Body Scan', duration: '15 menit', completed: true },
    { date: 'Kemarin', type: 'Visualisasi Gunung', duration: '20 menit', completed: true },
    { date: 'Kemarin', type: 'Pernapasan Mindful', duration: '10 menit', completed: false },
  ];

  return (
    <div>
      <Header title="Riwayat Meditasi" showBack={true} onBack={goBack} />
      
      <div className="px-4 py-6 space-y-6">
        <Card className="text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Cairn progress={75} size="large" />
            </div>
            <div>
              <h3 className="text-xl font-heading text-gray-800">Streak 7 Hari</h3>
              <p className="text-sm text-gray-600">Total 45 menit minggu ini</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="font-heading text-gray-800">Sesi Terbaru</h3>
          {sessions.map((session, index) => (
            <Card key={index} padding="small">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${session.completed ? '' : 'bg-gray-300'}`}
                      style={session.completed ? {backgroundColor: 'var(--color-primary)'} : {}}
                    ></div>
                    <h4 className="font-medium text-gray-800">{session.type}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{session.date} • {session.duration}</p>
                </div>
                <div className="flex justify-center">
                  <Cairn progress={session.completed ? 100 : 0} size="small" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};