import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../Button';
import { Card } from '../Card';
import { BreathingGuide } from '../BreathingGuide';
import { breathingPatterns, type BreathingPattern } from '../../../utils/breathingPatterns';

interface MeditationSessionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  sessionType?: 'breathing' | 'mindfulness' | 'guided' | 'custom';
  initialPattern?: BreathingPattern;
  duration?: number;
  culturalTheme?: 'indonesian' | 'javanese' | 'balinese' | 'universal';
}

interface SessionState {
  phase: 'preparation' | 'active' | 'paused' | 'completed';
  timeElapsed: number;
  progress: number;
  currentInstruction: string;
}

const culturalInstructions = {
  indonesian: {
    preparation: 'Duduk dengan tenang, seperti saat mengamati matahari terbit di Sembalun. Hirup keheningan pagi.',
    breathing: 'Ikuti ritme napas seperti ombak yang mengalir di pantai Senggigi. Tenang dan teratur.',
    mindfulness: 'Rasakan kehadiran Sang Hyang Widhi dalam setiap helaan napas. Jadilah satu dengan alam.',
    completion: 'Terima kasih telah berbagi kedamaian dengan alam semesta. Om Shanti Shanti Shanti.',
  },
  javanese: {
    preparation: 'Dengan rasa syukur, duduk seperti dalam samadi. Biarkan batin menjadi jernih seperti air telaga.',
    breathing: 'Napas mengalir seperti gamelan yang harmonis. Setiap helaan membawa kedamaian.',
    mindfulness: 'Rasakan kebijaksanaan leluhur mengalir dalam dirimu. Jagalah keseimbangan jiwa.',
    completion: 'Mugi-mugi ketenangan ini tetap menyertai perjalanan hidupmu. Rahayu.',
  },
  balinese: {
    preparation: 'Dengan sikap sembahyang, duduk dalam keheningan. Rasakan energi Tri Hita Karana.',
    breathing: 'Biarkan prana mengalir seperti air suci di Pura Besakih. Suci dan penuh berkah.',
    mindfulness: 'Dalam setiap napas, ada Ida Sang Hyang Widhi. Jadilah saksi yang penuh kesadaran.',
    completion: 'Om Awighnam Astu. Semoga semua rintangan sirna, kedamaian selalu menyertai.',
  },
  universal: {
    preparation: 'Find your center, like the calm at the heart of a storm. Breathe in peace.',
    breathing: 'Let each breath flow naturally, like a gentle river finding its way to the sea.',
    mindfulness: 'Be present in this moment. Feel the interconnectedness of all existence.',
    completion: 'May the peace you found here radiate out to all beings. Namaste.',
  },
};

export const MeditationSessionModal: React.FC<MeditationSessionModalProps> = ({
  isOpen,
  onClose,
  sessionType = 'breathing',
  initialPattern = 'box',
  duration = 600, // 10 minutes in seconds
  culturalTheme = 'indonesian',
}) => {
  const [sessionState, setSessionState] = useState<SessionState>({
    phase: 'preparation',
    timeElapsed: 0,
    progress: 0,
    currentInstruction: '',
  });
  
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(initialPattern);
  const [isActive, setIsActive] = useState(false);

  const instructions = culturalInstructions[culturalTheme];

  // Session timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isActive && sessionState.phase === 'active') {
      timer = setInterval(() => {
        setSessionState(prev => {
          const newTimeElapsed = prev.timeElapsed + 1;
          const newProgress = Math.min((newTimeElapsed / duration) * 100, 100);
          
          if (newTimeElapsed >= duration) {
            setIsActive(false);
            return {
              ...prev,
              phase: 'completed',
              timeElapsed: duration,
              progress: 100,
              currentInstruction: instructions.completion,
            };
          }
          
          return {
            ...prev,
            timeElapsed: newTimeElapsed,
            progress: newProgress,
          };
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, sessionState.phase, duration, instructions.completion]);

  // Update current instruction based on phase
  useEffect(() => {
    let instruction = '';
    
    switch (sessionState.phase) {
      case 'preparation':
        instruction = instructions.preparation;
        break;
      case 'active':
        instruction = sessionType === 'breathing' ? instructions.breathing : instructions.mindfulness;
        break;
      case 'paused':
        instruction = 'Sesi dijeda sejenak. Ambil napas dalam dan lanjutkan saat siap.';
        break;
      case 'completed':
        instruction = instructions.completion;
        break;
    }
    
    setSessionState(prev => ({ ...prev, currentInstruction: instruction }));
  }, [sessionState.phase, sessionType, instructions]);

  const handleStartSession = useCallback(() => {
    setSessionState(prev => ({ ...prev, phase: 'active' }));
    setIsActive(true);
  }, []);

  const handlePauseSession = useCallback(() => {
    setSessionState(prev => ({ ...prev, phase: 'paused' }));
    setIsActive(false);
  }, []);

  const handleResumeSession = useCallback(() => {
    setSessionState(prev => ({ ...prev, phase: 'active' }));
    setIsActive(true);
  }, []);

  const handleEndSession = useCallback(() => {
    setSessionState(prev => ({ ...prev, phase: 'completed' }));
    setIsActive(false);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = (): string => {
    const remaining = duration - sessionState.timeElapsed;
    return formatTime(Math.max(0, remaining));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-gray-100">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(219, 39, 119, 0.2) 100%)'
              }}
            >
              <span className="text-2xl">
                {sessionState.phase === 'completed' ? '🌸' : '🧘‍♀️'}
              </span>
            </div>
          </div>
          
          <h2 className="text-xl font-heading text-gray-800 mb-2">
            {sessionState.phase === 'preparation' && 'Persiapan Meditasi'}
            {sessionState.phase === 'active' && 'Meditasi Berlangsung'}
            {sessionState.phase === 'paused' && 'Meditasi Dijeda'}
            {sessionState.phase === 'completed' && 'Meditasi Selesai'}
          </h2>
          
          {sessionState.phase !== 'preparation' && (
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span>Waktu: {formatTime(sessionState.timeElapsed)}</span>
              <span>•</span>
              <span>Sisa: {getRemainingTime()}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {sessionState.phase !== 'preparation' && (
          <div className="px-6 py-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${sessionState.progress}%`,
                  background: 'linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(219, 39, 119, 1) 100%)',
                }}
              />
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Current Instruction */}
          <Card padding="large" className="text-center">
            <p className="text-gray-700 font-body leading-relaxed text-base">
              {sessionState.currentInstruction}
            </p>
          </Card>

          {/* Breathing Guide (only for breathing sessions and when active) */}
          {sessionType === 'breathing' && sessionState.phase === 'active' && (
            <div className="flex justify-center">
              <BreathingGuide
                pattern={selectedPattern}
                isActive={isActive}
                size="large"
                showInstructions={false}
              />
            </div>
          )}

          {/* Pattern Selection (only in preparation phase for breathing sessions) */}
          {sessionType === 'breathing' && sessionState.phase === 'preparation' && (
            <Card>
              <h3 className="font-heading text-gray-800 mb-4">Pilih Teknik Pernapasan</h3>
              <div className="grid grid-cols-1 gap-3">
                {breathingPatterns.slice(0, 3).map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setSelectedPattern(pattern.id)}
                    className={`
                      flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                      ${selectedPattern === pattern.id 
                        ? 'bg-purple-50 border-2 border-purple-200' 
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }
                    `}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: selectedPattern === pattern.id 
                          ? 'rgba(147, 51, 234, 0.15)' 
                          : 'rgba(147, 51, 234, 0.08)'
                      }}
                    >
                      {pattern.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-800 text-sm">
                        {pattern.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {pattern.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Control Buttons */}
          <div className="space-y-3">
            {sessionState.phase === 'preparation' && (
              <Button
                onClick={handleStartSession}
                className="w-full py-4"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(219, 39, 119, 1) 100%)' 
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">🌸</span>
                  <span>Mulai Meditasi</span>
                </div>
              </Button>
            )}

            {sessionState.phase === 'active' && (
              <div className="flex space-x-3">
                <Button
                  onClick={handlePauseSession}
                  variant="outline"
                  className="flex-1"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                    </svg>
                    <span>Jeda</span>
                  </div>
                </Button>
                <Button
                  onClick={handleEndSession}
                  variant="outline"
                  className="flex-1"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>✓</span>
                    <span>Selesai</span>
                  </div>
                </Button>
              </div>
            )}

            {sessionState.phase === 'paused' && (
              <div className="flex space-x-3">
                <Button
                  onClick={handleResumeSession}
                  className="flex-1"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(219, 39, 119, 1) 100%)' 
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>Lanjut</span>
                  </div>
                </Button>
                <Button
                  onClick={handleEndSession}
                  variant="outline"
                  className="flex-1"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12"/>
                    </svg>
                    <span>Berhenti</span>
                  </div>
                </Button>
              </div>
            )}

            {sessionState.phase === 'completed' && (
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    // Reset session for new one
                    setSessionState({
                      phase: 'preparation',
                      timeElapsed: 0,
                      progress: 0,
                      currentInstruction: '',
                    });
                    setIsActive(false);
                  }}
                  className="w-full"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(219, 39, 119, 1) 100%)' 
                  }}
                >
                  Meditasi Lagi
                </Button>
                {onClose && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                  >
                    Kembali
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Cultural Quote */}
          {sessionState.phase === 'completed' && (
            <Card padding="small" className="text-center border-purple-100">
              <div className="space-y-2">
                <div className="text-lg">🌸</div>
                <blockquote className="text-gray-600 font-body text-sm italic leading-relaxed">
                  {culturalTheme === 'indonesian' && '"Dalam keheningan, kita menemukan kebijaksanaan. Dalam napas, kita menemukan kehidupan."'}
                  {culturalTheme === 'javanese' && '"Sapa sing tansah eling lan waspada, bakal oleh kabagyan sejati."'}
                  {culturalTheme === 'balinese' && '"Tat twam asi - Engkau adalah Aku, Aku adalah Engkau."'}
                  {culturalTheme === 'universal' && '"Peace comes from within. Do not seek it without." - Buddha'}
                </blockquote>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeditationSessionModal;