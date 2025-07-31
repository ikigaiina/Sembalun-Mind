import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MeditationTimer } from '../components/ui/MeditationTimer';
import { AudioPlayer, type SessionType } from '../components/ui/AudioPlayer';
import { SessionComplete } from '../components/ui/SessionComplete';
import { scrollToTop } from '../hooks/useScrollToTop';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: 'breathing' | 'mindfulness' | 'sleep' | 'focus';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

type MeditationState = 'setup' | 'active' | 'paused' | 'completed';

const defaultSession: MeditationSession = {
  id: 'default',
  title: 'Meditasi Mindfulness',
  description: 'Sesi meditasi untuk ketenangan pikiran',
  duration: 5,
  category: 'mindfulness',
  difficulty: 'beginner'
};

const durationOptions = [
  { value: 3, label: '3 menit', description: 'Jeda singkat' },
  { value: 5, label: '5 menit', description: 'Pemula' },
  { value: 10, label: '10 menit', description: 'Standar' },
  { value: 15, label: '15 menit', description: 'Menengah' },
  { value: 20, label: '20 menit', description: 'Mendalam' }
];

export const Meditation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get session from navigation state or use default
  const initialSession = location.state?.session as MeditationSession || defaultSession;
  
  const [session, setSession] = useState<MeditationSession>(initialSession);
  const [meditationState, setMeditationState] = useState<MeditationState>('setup');
  const [selectedDuration, setSelectedDuration] = useState(session.duration);

  // Update session duration when selection changes
  useEffect(() => {
    setSession(prev => ({ ...prev, duration: selectedDuration }));
  }, [selectedDuration]);

  // Map session category to audio player session type
  const getSessionType = (category: string): SessionType => {
    switch (category) {
      case 'breathing': return 'breathing';
      case 'sleep': return 'sleep';
      case 'focus': return 'focus';
      default: return 'mindfulness';
    }
  };

  // Use the utility function from hooks

  const handleStartSession = () => {
    setMeditationState('active');
    // Scroll to top for focused meditation view
    setTimeout(scrollToTop, 100);
  };

  const handleSessionComplete = () => {
    setMeditationState('completed');
    // Scroll to top for completion screen
    setTimeout(scrollToTop, 100);
  };

  const handleNewSession = () => {
    setMeditationState('setup');
    // Scroll to top for new setup
    setTimeout(scrollToTop, 100);
  };

  const handleCloseComplete = () => {
    navigate('/');
  };

  // Auto-scroll on meditation state changes
  useEffect(() => {
    // Small delay to allow DOM updates to complete before scrolling
    const timer = setTimeout(scrollToTop, 150);
    return () => clearTimeout(timer);
  }, [meditationState]);

  // Render session complete screen
  if (meditationState === 'completed') {
    return (
      <SessionComplete
        sessionType={session.title}
        duration={session.duration}
        onClose={handleCloseComplete}
        onNewSession={handleNewSession}
        previousStreak={6} // TODO: Get from user stats
      />
    );
  }

  // Render setup screen
  if (meditationState === 'setup') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <Header 
          title="Persiapan Sesi" 
          showBack={true} 
          onBack={() => navigate('/')} 
        />
        
        <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
          
          {/* Session info */}
          <Card>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                <span className="text-2xl">
                  {session.category === 'breathing' ? '💨' :
                   session.category === 'sleep' ? '🌙' :
                   session.category === 'focus' ? '🎯' : '🧘‍♀️'}
                </span>
              </div>
              
              <div>
                <h1 className="text-xl font-heading text-gray-800 mb-2">
                  {session.title}
                </h1>
                <p className="text-gray-600 font-body text-sm leading-relaxed">
                  {session.description}
                </p>
              </div>
            </div>
          </Card>

          {/* Duration selection */}
          <Card>
            <h3 className="font-heading text-gray-800 mb-4">Pilih Durasi</h3>
            <div className="space-y-2">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDuration(option.value)}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200
                    hover:bg-gray-50 active:scale-98
                    ${selectedDuration === option.value 
                      ? 'bg-primary bg-opacity-5 border-2' 
                      : 'bg-white border-2 border-transparent'
                    }
                  `}
                  style={{
                    borderColor: selectedDuration === option.value ? 'var(--color-primary)' : 'transparent'
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-800">
                      {option.label}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {option.description}
                    </div>
                  </div>
                  
                  {selectedDuration === option.value && (
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="var(--color-primary)" 
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Audio settings */}
          <AudioPlayer
            sessionType={getSessionType(session.category)}
            isActive={false}
            onSoundChange={() => {}}
          />

          {/* Start button */}
          <div className="pt-4">
            <Button
              onClick={handleStartSession}
              size="large"
              className="w-full py-4 text-lg font-medium"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Mulai Sesi ({selectedDuration} menit)</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render active meditation session
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <Header 
        title={session.title}
        showBack={false}
      />
      
      <div className="px-4 py-6 space-y-8 max-w-md mx-auto">

        {/* Timer component - main focus */}
        <div className="flex justify-center">
          <MeditationTimer
            duration={session.duration * 60} // convert to seconds
            onComplete={handleSessionComplete}
          />
        </div>

        {/* Meditation guidance */}
        <div className="text-center">
          <p className="text-gray-500 font-body text-sm leading-relaxed opacity-60">
            {session.category === 'breathing' 
              ? 'Rasakan napas masuk dan keluar dengan perlahan'
              : 'Biarkan pikiran mengalir, kembali ke momen ini'
            }
          </p>
        </div>

        {/* Audio player */}
        <div className="transition-all duration-500 ease-in-out">
          <AudioPlayer
            sessionType={getSessionType(session.category)}
            isActive={true}
            onSoundChange={() => {}}
          />
        </div>

        {/* Session info */}
        <div className="text-center">
          <p className="text-xs text-gray-400 font-body opacity-50">
            {session.category === 'breathing' ? 'Pernapasan' :
             session.category === 'sleep' ? 'Tidur Nyenyak' :
             session.category === 'focus' ? 'Fokus' : 'Mindfulness'} • 
            {session.difficulty === 'beginner' ? 'Pemula' :
             session.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'}
          </p>
        </div>

        {/* Breathing visual cue */}
        <div className="flex justify-center">
          <div 
            className="w-4 h-4 rounded-full opacity-20 animate-pulse"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              animationDuration: '4s' 
            }}
          />
        </div>
      </div>
    </div>
  );
};