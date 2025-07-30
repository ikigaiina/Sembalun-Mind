import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MeditationTimer } from '../components/ui/MeditationTimer';
import { AudioPlayer, type AmbientSound, type SessionType } from '../components/ui/AudioPlayer';
import { SessionComplete } from '../components/ui/SessionComplete';
import { SembalunBackground } from '../components/ui/SembalunBackground';
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
  const [selectedSound, setSelectedSound] = useState<AmbientSound>('silence');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

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
    setIsTimerActive(true);
    setIsTimerPaused(false);
    // Scroll to top for focused meditation view
    setTimeout(scrollToTop, 100);
  };

  const handlePauseSession = () => {
    setIsTimerPaused(true);
    setMeditationState('paused');
    // Scroll to top to show all pause controls
    setTimeout(scrollToTop, 100);
  };

  const handleResumeSession = () => {
    setIsTimerPaused(false);
    setMeditationState('active');
    // Scroll to top for focused meditation view
    setTimeout(scrollToTop, 100);
  };

  const handleStopSession = () => {
    setIsTimerActive(false);
    setIsTimerPaused(false);
    setMeditationState('setup');
    // Scroll to top to show setup screen
    setTimeout(scrollToTop, 100);
  };

  const handleSessionComplete = () => {
    setIsTimerActive(false);
    setIsTimerPaused(false);
    setMeditationState('completed');
    // Scroll to top for completion screen
    setTimeout(scrollToTop, 100);
  };

  const handleNewSession = () => {
    setMeditationState('setup');
    setIsTimerActive(false);
    setIsTimerPaused(false);
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
      <div className="min-h-screen relative">
        {/* Sembalun Background */}
        <SembalunBackground 
          variant="mist" 
          intensity="subtle" 
          animated={true}
          className="fixed inset-0 z-0"
        />
        
        <div className="relative z-10">
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
            onSoundChange={setSelectedSound}
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
      </div>
    );
  }

  // Render active meditation session
  return (
    <div className="min-h-screen relative">
      {/* Sembalun Background */}
      <SembalunBackground 
        variant="default" 
        intensity="subtle" 
        animated={true}
        className="fixed inset-0 z-0"
      />
      
      <div className="relative z-10">
      <Header 
        title={session.title}
        showBack={false}
      />
      
      <div className="px-4 py-6 space-y-8 max-w-md mx-auto">

        {/* Timer component - main focus */}
        <div className="flex justify-center">
          <MeditationTimer
            duration={session.duration * 60} // convert to seconds
            isActive={isTimerActive}
            isPaused={isTimerPaused}
            onPlay={handleResumeSession}
            onPause={handlePauseSession}
            onStop={handleStopSession}
            onComplete={handleSessionComplete}
          />
        </div>

        {/* Session guidance - only show when paused or minimal when active */}
        {meditationState === 'paused' ? (
          <Card className="text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                <span className="text-xl">⏸️</span>
              </div>
              
              <div>
                <h3 className="font-heading text-gray-800 mb-2">
                  Sesi Dijeda
                </h3>
                <p className="text-gray-600 font-body text-sm leading-relaxed">
                  Ambil waktu sejenak jika diperlukan. Lanjutkan saat kamu siap.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          /* Minimal guidance during active session */
          <div className="text-center">
            <p className="text-gray-500 font-body text-sm leading-relaxed opacity-60">
              {session.category === 'breathing' 
                ? 'Rasakan napas masuk dan keluar dengan perlahan'
                : 'Biarkan pikiran mengalir, kembali ke momen ini'
              }
            </p>
          </div>
        )}

        {/* Audio player - completely hidden during active session, only show when paused */}
        {meditationState === 'paused' && (
          <div className="transition-all duration-500 ease-in-out">
            <AudioPlayer
              sessionType={getSessionType(session.category)}
              isActive={isTimerActive}
              onSoundChange={setSelectedSound}
            />
          </div>
        )}

        {/* Progress indicator - minimal during active session */}
        {meditationState === 'paused' ? (
          <Card padding="small">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-body">
                Sesi {session.difficulty === 'beginner' ? 'Pemula' :
                      session.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'} • 
                {session.category === 'breathing' ? ' Pernapasan' :
                 session.category === 'sleep' ? ' Tidur Nyenyak' :
                 session.category === 'focus' ? ' Fokus' : ' Mindfulness'}
              </p>
            </div>
          </Card>
        ) : (
          /* Minimal session info during active meditation */
          <div className="text-center">
            <p className="text-xs text-gray-400 font-body opacity-50">
              {session.category === 'breathing' ? 'Pernapasan' :
               session.category === 'sleep' ? 'Tidur Nyenyak' :
               session.category === 'focus' ? 'Fokus' : 'Mindfulness'} • 
              {session.difficulty === 'beginner' ? 'Pemula' :
               session.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'}
            </p>
          </div>
        )}

        {/* Breathing visual cue during active session */}
        {meditationState === 'active' && (
          <div className="flex justify-center">
            <div 
              className="w-4 h-4 rounded-full opacity-20 animate-pulse"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                animationDuration: '4s' 
              }}
            />
          </div>
        )}
      </div>
      </div>
    </div>
  );
};