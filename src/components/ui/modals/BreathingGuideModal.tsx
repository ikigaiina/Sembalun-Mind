import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Wind, Heart } from 'lucide-react';
import { Button, Card } from '../index';
import { MeditationModal } from '../IndonesianModal';
import BreathingVisualization3D from '../../meditation/BreathingVisualization3D';
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

// Enhanced 2025 Breathing Guide Modal with Glassmorphic Design
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
  const [showSettings, setShowSettings] = useState(false);
  const [show3D, setShow3D] = useState(true);

  const availablePatterns = culturalStyle === 'traditional' 
    ? [...breathingPatterns, ...traditionalBreathingTechniques]
    : breathingPatterns;

  // Enhanced session timer
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
      setBreathCount(0);
    }
  }, [isActive]);

  // Breath completion handler - currently handled by 3D visualization
  // const handleBreathComplete = useCallback(() => {
  //   setBreathCount(prev => prev + 1);
  // }, []);

  const handleSessionComplete = useCallback(() => {
    setIsActive(false);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPattern = () => {
    return availablePatterns.find(p => p.id === selectedPattern) || availablePatterns[0];
  };

  const currentPattern = getCurrentPattern();

  return (
    <MeditationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Breathing Guide"
      size="large"
      culturalTheme="meditation"
      gestureEnabled={true}
      showBackButton={false}
      className="overflow-hidden"
    >
      <div className="p-6">
        {/* Enhanced Header with 2025 Design */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center mb-6 relative">
            <motion.div 
              className="relative flex items-center justify-center"
              animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ duration: 4, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-meditation-focus-400/20 to-meditation-zen-400/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg">
                <Wind className="w-10 h-10 text-meditation-focus-600" />
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-fluid-2xl font-heading font-bold mb-3 text-gray-800">
              {currentPattern.name}
            </h2>
            <p className="text-meditation-focus-600 meditation-body">
              {currentPattern.description}
            </p>
            
            {('cultural' in currentPattern) && (
              <p className="text-meditation-zen-600 text-sm mt-2 italic">
                {(currentPattern as any).cultural}
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Enhanced Session Stats */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card variant="breathing" className="backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-8 p-4">
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-heading text-meditation-focus-600 mb-1"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {formatTime(sessionTime)}
                    </motion.div>
                    <div className="text-sm text-gray-600 flex items-center justify-center">
                      <Heart className="w-4 h-4 mr-1" />
                      Duration
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gradient-to-b from-transparent via-meditation-focus-300 to-transparent" />
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-heading text-meditation-zen-600 mb-1"
                      animate={{ scale: breathCount % 2 === 1 ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {breathCount}
                    </motion.div>
                    <div className="text-sm text-gray-600 flex items-center justify-center">
                      <Wind className="w-4 h-4 mr-1" />
                      Breaths
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced 3D Breathing Visualization */}
        {show3D && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex justify-center"
          >
            <div className="relative">
              <BreathingVisualization3D 
                autoStart={isActive}
                onSessionComplete={handleSessionComplete}
              />
              
              {/* Settings Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg hover:bg-white/30 transition-colors"
              >
                <Settings className="w-5 h-5 text-meditation-focus-600" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Pattern Selector */}
        <AnimatePresence>
          {showPatternSelector && (showSettings || !isActive) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card variant="meditation" size="lg">
                <h3 className="text-fluid-lg font-heading font-semibold text-gray-800 mb-4">
                  {culturalStyle === 'traditional' ? 'Spiritual Techniques' : 'Breathing Patterns'}
                </h3>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                  {availablePatterns.map((pattern, index) => (
                    <motion.button
                      key={pattern.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handlePatternChange(pattern.id)}
                      className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 text-left group hover:scale-[1.02] ${
                        selectedPattern === pattern.id 
                          ? 'bg-meditation-focus-100/20 backdrop-blur-md border-2 border-meditation-focus-300 shadow-lg' 
                          : 'bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-colors ${
                        selectedPattern === pattern.id 
                          ? 'bg-meditation-focus-200/30 text-meditation-focus-600' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-meditation-focus-100/20'
                      }`}>
                        {pattern.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-base mb-1">
                          {pattern.name}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {pattern.description}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-meditation-focus-600">
                          {Object.entries(pattern.phases)
                            .filter(([, duration]) => duration > 0)
                            .map(([phase, duration], idx) => (
                              <React.Fragment key={phase}>
                                <span className="px-2 py-1 bg-meditation-focus-100/30 rounded-full">
                                  {duration}s {phase}
                                </span>
                                {idx < Object.entries(pattern.phases).filter(([, d]) => d > 0).length - 1 && (
                                  <span className="text-gray-400">→</span>
                                )}
                              </React.Fragment>
                            ))}
                        </div>
                      </div>
                      {selectedPattern === pattern.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-meditation-focus-500 rounded-full flex items-center justify-center flex-shrink-0"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Control Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex space-x-4">
            <Button
              variant="breathing"
              size="lg"
              className="flex-1"
              onClick={() => setIsActive(!isActive)}
            >
              <div className="flex items-center justify-center space-x-3">
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause Session</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Breathing</span>
                  </>
                )}
              </div>
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="px-4 border border-meditation-focus-200/50"
              onClick={() => {
                setIsActive(false);
                setSessionTime(0);
                setBreathCount(0);
              }}
              disabled={!isActive && sessionTime === 0 && breathCount === 0}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="calm"
              size="lg"
              className="flex-1"
              onClick={() => setShow3D(!show3D)}
            >
              {show3D ? 'Hide 3D' : 'Show 3D'} Visualization
            </Button>
            
            {onClose && (
              <Button
                variant="ghost"
                size="lg" 
                className="flex-1 border border-gray-200/50"
                onClick={onClose}
              >
                Complete Session
              </Button>
            )}
          </div>
        </motion.div>

        {/* Enhanced Wisdom Section */}
        {culturalStyle === 'traditional' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <Card variant="calm" className="text-center border border-meditation-zen-200/50">
              <div className="space-y-4 p-4">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-2xl"
                >
                  🙏
                </motion.div>
                <blockquote className="text-meditation-zen-700 meditation-body text-sm italic leading-relaxed">
                  "Breath is the bridge which connects life to consciousness, 
                  which unites your body to your thoughts."
                  <br />
                  <cite className="text-meditation-zen-600 not-italic text-xs">
                    — Thich Nhat Hanh
                  </cite>
                </blockquote>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </MeditationModal>
  );
};

export default BreathingGuideModal;