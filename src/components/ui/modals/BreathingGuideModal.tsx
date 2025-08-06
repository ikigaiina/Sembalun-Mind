import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../Button';
import { Card } from '../Card';
import { BreathingGuide } from '../BreathingGuide';
import { breathingPatterns, type BreathingPattern } from '../../../utils/breathingPatterns';

interface BreathingGuideModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialPattern?: BreathingPattern;
  showPatternSelector?: boolean;
  autoStart?: boolean;
  culturalStyle?: 'traditional' | 'modern';
}

const traditionalBreathingTechniques = [
  {
    id: 'pranayama-anuloma-viloma' as BreathingPattern,
    name: 'Anuloma Viloma',
    description: 'Pernapasan bergantian hidung kiri-kanan',
    icon: '🌬️',
    phases: { inhale: 4, hold: 4, exhale: 4, pause: 0 },
    cultural: 'Teknik pranayama tradisional dari yoga India'
  },
  {
    id: 'pranayama-kapalabhati' as BreathingPattern,
    name: 'Kapalabhati',
    description: 'Pernapasan pembersih tengkorak',
    icon: '✨',
    phases: { inhale: 1, hold: 0, exhale: 2, pause: 0 },
    cultural: 'Teknik pembersihan dari tradisi yoga'
  },
  {
    id: 'javanese-meditation' as BreathingPattern,
    name: 'Meditasi Jawa',
    description: 'Pernapasan dalam tradisi Jawa',
    icon: '🌸',
    phases: { inhale: 6, hold: 2, exhale: 8, pause: 2 },
    cultural: 'Berdasarkan kebijaksanaan spiritual Jawa'
  }
];

export const BreathingGuideModal: React.FC<BreathingGuideModalProps> = ({
  isOpen,
  onClose,
  initialPattern = 'box',
  showPatternSelector = true,
  autoStart = false,
  culturalStyle = 'modern',
}) => {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(initialPattern);
  const [isActive, setIsActive] = useState(autoStart);
  const [sessionTime, setSessionTime] = useState(0);
  const [breathCount, setBreathCount] = useState(0);

  const availablePatterns = culturalStyle === 'traditional' 
    ? [...breathingPatterns, ...traditionalBreathingTechniques]
    : breathingPatterns;

  // Session timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isActive) {
      timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive]);

  const handlePatternChange = useCallback((patternId: BreathingPattern) => {
    setSelectedPattern(patternId);
    if (isActive) {
      // Reset counters when changing pattern during active session
      setBreathCount(0);
    }
  }, [isActive]);

  const handleBreathComplete = useCallback(() => {
    setBreathCount(prev => prev + 1);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPattern = () => {
    return availablePatterns.find(p => p.id === selectedPattern) || availablePatterns[0];
  };

  if (!isOpen) return null;

  const currentPattern = getCurrentPattern();

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
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(219, 39, 119, 0.2) 100%)'
              }}
            >
              {currentPattern.icon}
            </div>
          </div>
          
          <h2 className="text-xl font-heading text-gray-800 mb-2">
            {currentPattern.name}
          </h2>
          <p className="text-gray-600 text-sm">
            {currentPattern.description}
          </p>
          
          {('cultural' in currentPattern) && (
            <p className="text-purple-600 text-xs mt-2 italic">
              {currentPattern.cultural}
            </p>
          )}
        </div>

        {/* Session Stats */}
        {isActive && (
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-heading text-purple-700">
                  {formatTime(sessionTime)}
                </div>
                <div className="text-xs text-gray-600">Waktu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading text-purple-700">
                  {breathCount}
                </div>
                <div className="text-xs text-gray-600">Napas</div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Pattern Selector */}
          {showPatternSelector && (
            <Card>
              <h3 className="font-heading text-gray-800 mb-4">
                {culturalStyle === 'traditional' ? 'Teknik Spiritual' : 'Pola Pernapasan'}
              </h3>
              <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                {availablePatterns.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => handlePatternChange(pattern.id)}
                    className={`
                      flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left
                      ${selectedPattern === pattern.id 
                        ? 'bg-purple-50 border-2 border-purple-200' 
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }
                    `}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: selectedPattern === pattern.id 
                          ? 'rgba(147, 51, 234, 0.15)' 
                          : 'rgba(147, 51, 234, 0.08)'
                      }}
                    >
                      {pattern.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm truncate">
                        {pattern.name}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {pattern.description}
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        {Object.entries(pattern.phases)
                          .filter(([, duration]) => duration > 0)
                          .map(([phase, duration]) => `${duration}s`)
                          .join(' - ')}
                      </div>
                    </div>
                    {selectedPattern === pattern.id && (
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="rgba(147, 51, 234, 0.8)" 
                        strokeWidth="2"
                        className="flex-shrink-0"
                      >
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Breathing Guide */}
          <div className="flex justify-center">
            <BreathingGuide
              pattern={selectedPattern}
              isActive={isActive}
              size="large"
              onBreathComplete={handleBreathComplete}
              culturalStyle={culturalStyle}
            />
          </div>

          {/* Instructions */}
          <Card padding="small" className="text-center">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-sm">
                Panduan Pernapasan
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                {currentPattern.phases.inhale > 0 && (
                  <div>Hirup: {currentPattern.phases.inhale} detik</div>
                )}
                {currentPattern.phases.hold > 0 && (
                  <div>Tahan: {currentPattern.phases.hold} detik</div>
                )}
                {currentPattern.phases.exhale > 0 && (
                  <div>Buang: {currentPattern.phases.exhale} detik</div>
                )}
                {currentPattern.phases.pause > 0 && (
                  <div>Jeda: {currentPattern.phases.pause} detik</div>
                )}
              </div>
            </div>
          </Card>

          {/* Control Buttons */}
          <div className="space-y-3">
            <div className="flex space-x-3">
              <Button
                onClick={() => setIsActive(!isActive)}
                className="flex-1"
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 1) 0%, rgba(220, 38, 127, 1) 100%)'
                } : { 
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(219, 39, 119, 1) 100%)' 
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isActive ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                      </svg>
                      <span>Jeda</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <span>Mulai</span>
                    </>
                  )}
                </div>
              </Button>
              
              {isActive && (
                <Button
                  onClick={() => {
                    setIsActive(false);
                    setSessionTime(0);
                    setBreathCount(0);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12"/>
                    </svg>
                    <span>Reset</span>
                  </div>
                </Button>
              )}
            </div>
            
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Selesai
              </Button>
            )}
          </div>

          {/* Cultural Wisdom */}
          {culturalStyle === 'traditional' && (
            <Card padding="small" className="text-center border-purple-100">
              <div className="space-y-2">
                <div className="text-lg">🙏</div>
                <blockquote className="text-gray-600 font-body text-xs italic leading-relaxed">
                  "Prana adalah kehidupan itu sendiri. Dengan menguasai napas, kita menguasai pikiran dan jiwa."
                  <br />
                  <cite className="text-purple-600">- Kebijaksanaan Yoga</cite>
                </blockquote>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreathingGuideModal;