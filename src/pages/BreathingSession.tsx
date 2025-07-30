import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BreathingGuide, breathingPatterns, type BreathingPattern } from '../components/ui/BreathingGuide';
import { SembalunBackground } from '../components/ui/SembalunBackground';
import { scrollToTop } from '../hooks/useScrollToTop';

type SessionState = 'setup' | 'active' | 'paused' | 'completed';

interface SessionStats {
  completedCycles: number;
  totalMinutes: number;
  pattern: BreathingPattern;
}

const durationOptions = [
  { value: 2, label: '2 menit', description: 'Jeda singkat' },
  { value: 5, label: '5 menit', description: 'Standar' },
  { value: 10, label: '10 menit', description: 'Mendalam' },
  { value: 0, label: 'Terus menerus', description: 'Tanpa batas waktu' }
];

export const BreathingSession: React.FC = () => {
  const navigate = useNavigate();
  const [sessionState, setSessionState] = useState<SessionState>('setup');
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>('box');
  const [selectedDuration, setSelectedDuration] = useState(5); // in minutes, 0 = continuous
  const [sessionTime, setSessionTime] = useState(0); // elapsed seconds
  const [isActive, setIsActive] = useState(false);
  const [stats, setStats] = useState<SessionStats>({
    completedCycles: 0,
    totalMinutes: 0,
    pattern: 'box'
  });

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && sessionState === 'active') {
      interval = setInterval(() => {
        setSessionTime(prev => {
          const newTime = prev + 1;
          
          // Check if duration is reached (if not continuous)
          if (selectedDuration > 0 && newTime >= selectedDuration * 60) {
            handleSessionComplete();
            return newTime;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, sessionState, selectedDuration]);

  const handleStartSession = () => {
    setSessionState('active');
    setIsActive(true);
    setSessionTime(0);
    scrollToTop();
  };

  const handlePauseSession = () => {
    setSessionState('paused');
    setIsActive(false);
    scrollToTop();
  };

  const handleResumeSession = () => {
    setSessionState('active');
    setIsActive(true);
    scrollToTop();
  };

  const handleStopSession = () => {
    setSessionState('setup');
    setIsActive(false);
    setSessionTime(0);
    scrollToTop();
  };

  const handleSessionComplete = () => {
    setSessionState('completed');
    setIsActive(false);
    setStats({
      completedCycles: Math.floor(sessionTime / 20), // Rough estimate
      totalMinutes: Math.floor(sessionTime / 60),
      pattern: selectedPattern
    });
    scrollToTop();
  };

  const handleNewSession = () => {
    setSessionState('setup');
    setIsActive(false);
    setSessionTime(0);
    scrollToTop();
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get remaining time for timed sessions
  const getRemainingTime = (): string => {
    if (selectedDuration === 0) return 'Terus menerus';
    const remaining = (selectedDuration * 60) - sessionTime;
    return remaining > 0 ? formatTime(remaining) : '00:00';
  };

  // Session completion screen
  if (sessionState === 'completed') {
    return (
      <div className="min-h-screen relative">
        {/* Sembalun Background */}
        <SembalunBackground 
          variant="sunset" 
          intensity="medium" 
          animated={true}
          className="fixed inset-0 z-0"
        />
        
        <div className="relative z-10">
        <Header 
          title="Sesi Selesai" 
          showBack={true} 
          onBack={() => navigate('/')} 
        />
        
        <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
          <Card className="text-center">
            <div className="space-y-6">
              
              {/* Success animation */}
              <div className="relative">
                <div 
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(219, 39, 119, 0.2) 100%)'
                  }}
                >
                  <span className="text-3xl">🌸</span>
                </div>
                
                {/* Celebration rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-32 h-32 rounded-full border-2 opacity-30 animate-ping"
                    style={{ 
                      borderColor: 'rgba(147, 51, 234, 0.5)',
                      animationDuration: '2s'
                    }}
                  />
                </div>
              </div>

              {/* Completion message */}
              <div>
                <h1 className="text-2xl font-heading text-gray-800 mb-2">
                  Napas Teratur! 🌟
                </h1>
                <p className="text-gray-600 font-body leading-relaxed">
                  Kamu telah menyelesaikan sesi pernapasan dengan teknik {breathingPatterns.find(p => p.id === stats.pattern)?.name}. 
                  Rasakan ketenangan yang mengalir dalam dirimu.
                </p>
              </div>

              {/* Session stats */}
              <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-purple-100">
                <div className="text-center">
                  <div className="text-2xl font-heading text-purple-700 mb-1">
                    {stats.totalMinutes}
                  </div>
                  <div className="text-xs text-gray-500 font-body">
                    Menit bernapas
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-heading text-purple-700 mb-1">
                    {stats.completedCycles}
                  </div>
                  <div className="text-xs text-gray-500 font-body">
                    Siklus selesai
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleNewSession}
                  className="w-full"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(219, 39, 119, 1) 100%)' 
                  }}
                >
                  Sesi Baru
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                  style={{ borderColor: 'rgba(147, 51, 234, 0.3)' }}
                >
                  Kembali ke Dashboard
                </Button>
              </div>

              {/* Inspirational quote */}
              <div className="pt-4 border-t border-purple-100">
                <div className="space-y-2">
                  <div className="text-lg">🌸</div>
                  <blockquote className="text-gray-600 font-body text-xs italic leading-relaxed">
                    "Napas adalah jembatan yang menghubungkan tubuh dan pikiran, mengantar kita ke kedamaian."
                  </blockquote>
                </div>
              </div>
            </div>
          </Card>
        </div>
        </div>
      </div>
    );
  }

  // Setup screen
  if (sessionState === 'setup') {
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
          title="Latihan Pernapasan" 
          showBack={true} 
          onBack={() => navigate('/')} 
        />
        
        <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
          
          {/* Pattern selection */}
          <Card>
            <h3 className="font-heading text-gray-800 mb-4">Pilih Teknik Pernapasan</h3>
            <div className="space-y-3">
              {breathingPatterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedPattern(pattern.id)}
                  className={`
                    w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200
                    hover:bg-gray-50 active:scale-98
                    ${selectedPattern === pattern.id 
                      ? 'border-2 shadow-sm' 
                      : 'bg-white border-2 border-transparent'
                    }
                  `}
                  style={{
                    borderColor: selectedPattern === pattern.id ? 'rgba(147, 51, 234, 0.4)' : 'transparent',
                    backgroundColor: selectedPattern === pattern.id ? 'rgba(147, 51, 234, 0.05)' : 'white'
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ 
                      backgroundColor: selectedPattern === pattern.id 
                        ? 'rgba(147, 51, 234, 0.15)' 
                        : 'rgba(147, 51, 234, 0.08)'
                    }}
                  >
                    {pattern.icon}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">
                      {pattern.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {pattern.description}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {Object.entries(pattern.phases)
                        .filter(([_, duration]) => duration > 0)
                        .map(([phase, duration]) => `${duration}s`)
                        .join(' - ')}
                    </div>
                  </div>
                  
                  {selectedPattern === pattern.id && (
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="rgba(147, 51, 234, 0.8)" 
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Duration selection */}
          <Card>
            <h3 className="font-heading text-gray-800 mb-4">Durasi Sesi</h3>
            <div className="grid grid-cols-2 gap-3">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDuration(option.value)}
                  className={`
                    p-4 rounded-xl transition-all duration-200 text-center
                    hover:bg-gray-50 active:scale-98
                    ${selectedDuration === option.value 
                      ? 'border-2 shadow-sm' 
                      : 'bg-white border-2 border-transparent'
                    }
                  `}
                  style={{
                    borderColor: selectedDuration === option.value ? 'rgba(147, 51, 234, 0.4)' : 'transparent',
                    backgroundColor: selectedDuration === option.value ? 'rgba(147, 51, 234, 0.05)' : 'white'
                  }}
                >
                  <div className="font-medium text-gray-800">
                    {option.label}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Start button */}
          <div className="pt-4">
            <Button
              onClick={handleStartSession}
              size="large"
              className="w-full py-4 text-lg font-medium"
              style={{ 
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(219, 39, 119, 1) 100%)' 
              }}
            >
              <div className="flex items-center justify-center space-x-3">
                <span className="text-xl">🌸</span>
                <span>Mulai Bernapas</span>
              </div>
            </Button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Active/Paused session screen
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
        title={breathingPatterns.find(p => p.id === selectedPattern)?.name || 'Latihan Pernapasan'}
        showBack={false}
      />
      
      <div className="px-4 py-6 space-y-8 max-w-md mx-auto">

        {/* Session timer */}
        <Card padding="small" className="text-center">
          <div className="flex items-center justify-center space-x-6">
            <div>
              <div className="text-sm text-gray-600 font-body mb-1">Waktu Berlalu</div>
              <div className="text-lg font-heading text-purple-700">
                {formatTime(sessionTime)}
              </div>
            </div>
            
            {selectedDuration > 0 && (
              <>
                <div className="w-px h-8 bg-purple-200" />
                <div>
                  <div className="text-sm text-gray-600 font-body mb-1">Sisa Waktu</div>
                  <div className="text-lg font-heading text-purple-700">
                    {getRemainingTime()}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Main breathing guide */}
        <BreathingGuide
          pattern={selectedPattern}
          isActive={isActive}
          onComplete={handleSessionComplete}
        />

        {/* Session guidance */}
        {sessionState === 'paused' ? (
          <Card className="text-center">
            <div className="space-y-3">
              <div 
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}
              >
                <span className="text-xl">⏸️</span>
              </div>
              
              <div>
                <h3 className="font-heading text-gray-800 mb-2">
                  Sesi Dijeda
                </h3>
                <p className="text-gray-600 font-body text-sm leading-relaxed">
                  Ambil waktu sejenak. Lanjutkan saat kamu siap untuk bernapas kembali.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 font-body text-sm leading-relaxed opacity-70">
              Ikuti ritme pernapasan dan rasakan ketenangan mengalir dalam dirimu
            </p>
          </div>
        )}

        {/* Control buttons */}
        <div className="flex items-center justify-center space-x-4">
          {sessionState === 'paused' ? (
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleResumeSession}
                className="px-6 py-3 rounded-full"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(219, 39, 119, 1) 100%)' 
                }}
              >
                <div className="flex items-center space-x-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>Lanjut</span>
                </div>
              </Button>
              
              <Button
                onClick={handleStopSession}
                variant="outline"
                className="px-6 py-3 rounded-full"
                style={{ borderColor: 'rgba(147, 51, 234, 0.3)' }}
              >
                <div className="flex items-center space-x-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12"/>
                  </svg>
                  <span>Berhenti</span>
                </div>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                onClick={handlePauseSession}
                variant="outline"
                className="px-6 py-3 rounded-full"
                style={{ borderColor: 'rgba(147, 51, 234, 0.3)' }}
              >
                <div className="flex items-center space-x-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                  </svg>
                  <span>Jeda</span>
                </div>
              </Button>
              
              {selectedDuration > 0 && (
                <Button
                  onClick={handleSessionComplete}
                  variant="outline"
                  className="px-6 py-3 rounded-full"
                  style={{ borderColor: 'rgba(147, 51, 234, 0.3)' }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">✓</span>
                    <span>Selesai</span>
                  </div>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Breathing tip */}
        <Card padding="small" className="text-center">
          <p className="text-xs text-gray-500 font-body">
            💡 Tip: Bernapaslah melalui hidung dan rasakan perut naik turun dengan lembut
          </p>
        </Card>
      </div>
      </div>
    </div>
  );
};