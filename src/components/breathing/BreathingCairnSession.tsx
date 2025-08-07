import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AestheticCairnLogo } from '../ui/AestheticCairnLogo';
import { Button } from '../ui/Button';
import { Play, Pause, Square, Wind, Heart, Timer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  description: string;
  benefits: string[];
}

interface BreathingCairnSessionProps {
  duration?: number; // in minutes
  pattern?: BreathingPattern;
  onComplete?: (sessionData: any) => void;
  className?: string;
}

// Predefined breathing patterns
const BREATHING_PATTERNS: { [key: string]: BreathingPattern } = {
  coherent: {
    name: 'Coherent Breathing',
    inhale: 4,
    hold: 0,
    exhale: 4,
    pause: 0,
    description: 'Pernafasan seimbang untuk ketenangan',
    benefits: ['Menurunkan stres', 'Meningkatkan fokus', 'Menyeimbangkan sistem saraf']
  },
  box: {
    name: 'Box Breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
    description: 'Teknik pernafasan kotak untuk kontrol mental',
    benefits: ['Meningkatkan konsentrasi', 'Mengurangi kecemasan', 'Memperkuat mindfulness']
  },
  calm: {
    name: 'Calming Breath',
    inhale: 4,
    hold: 2,
    exhale: 6,
    pause: 1,
    description: 'Pernafasan menenangkan untuk relaksasi',
    benefits: ['Menurunkan detak jantung', 'Mengurangi tekanan', 'Mempromosikan tidur nyenyak']
  },
  energize: {
    name: 'Energizing Breath',
    inhale: 6,
    hold: 2,
    exhale: 4,
    pause: 1,
    description: 'Pernafasan memberi energi untuk aktivasi',
    benefits: ['Meningkatkan energi', 'Memperbaiki sirkulasi', 'Meningkatkan kewaspadaan']
  }
};

export const BreathingCairnSession: React.FC<BreathingCairnSessionProps> = ({
  duration = 5,
  pattern = BREATHING_PATTERNS.coherent,
  onComplete,
  className = ''
}) => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const sessionDurationSeconds = duration * 60;
  const progress = (sessionTimer / sessionDurationSeconds) * 100;
  const totalCycles = Math.floor(sessionDurationSeconds / (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause));

  // Phase durations in seconds
  const phaseDurations = {
    inhale: pattern.inhale,
    hold: pattern.hold,
    exhale: pattern.exhale,
    pause: pattern.pause
  };

  // Main breathing cycle timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isActive && !isCompleted) {
      intervalId = setInterval(() => {
        setSessionTimer(prev => {
          const newTime = prev + 1;
          if (newTime >= sessionDurationSeconds) {
            setIsActive(false);
            setIsCompleted(true);
            setShowCelebration(true);
            if (onComplete) {
              onComplete({
                duration: duration,
                completedCycles: completedCycles,
                patternUsed: pattern.name,
                completionRate: 100
              });
            }
            setTimeout(() => setShowCelebration(false), 3000);
            return sessionDurationSeconds;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, isCompleted, sessionDurationSeconds, duration, completedCycles, pattern.name, onComplete]);

  // Breathing phase timer
  useEffect(() => {
    let phaseIntervalId: NodeJS.Timeout | null = null;

    if (isActive && !isCompleted) {
      phaseIntervalId = setInterval(() => {
        setPhaseTimer(prev => {
          const currentPhaseDuration = phaseDurations[currentPhase];
          const newPhaseTimer = prev + 1;

          if (newPhaseTimer >= currentPhaseDuration) {
            // Move to next phase
            let nextPhase: typeof currentPhase;
            switch (currentPhase) {
              case 'inhale':
                nextPhase = pattern.hold > 0 ? 'hold' : (pattern.exhale > 0 ? 'exhale' : 'pause');
                break;
              case 'hold':
                nextPhase = pattern.exhale > 0 ? 'exhale' : (pattern.pause > 0 ? 'pause' : 'inhale');
                break;
              case 'exhale':
                nextPhase = pattern.pause > 0 ? 'pause' : 'inhale';
                if (pattern.pause === 0) {
                  setCompletedCycles(cycles => cycles + 1);
                }
                break;
              case 'pause':
                nextPhase = 'inhale';
                setCompletedCycles(cycles => cycles + 1);
                break;
              default:
                nextPhase = 'inhale';
            }

            setCurrentPhase(nextPhase);
            return 0;
          }

          return newPhaseTimer;
        });
      }, 1000);
    }

    return () => {
      if (phaseIntervalId) {
        clearInterval(phaseIntervalId);
      }
    };
  }, [isActive, isCompleted, currentPhase, phaseDurations, pattern]);

  // Control functions
  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleStop = () => {
    setIsActive(false);
    setSessionTimer(0);
    setPhaseTimer(0);
    setCurrentPhase('inhale');
    setCompletedCycles(0);
    setIsCompleted(false);
  };

  const handleBack = () => {
    if (isActive) {
      // Show confirmation in real implementation
      handleStop();
    } else {
      navigate('/');
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get phase description and color
  const getPhaseInfo = () => {
    switch (currentPhase) {
      case 'inhale':
        return {
          text: 'Tarik Nafas',
          instruction: 'Hirup udara perlahan dan dalam',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          cairnTheme: 'breathing' as const
        };
      case 'hold':
        return {
          text: 'Tahan',
          instruction: 'Tahan nafas dengan nyaman',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          cairnTheme: 'meditation' as const
        };
      case 'exhale':
        return {
          text: 'Buang Nafas',
          instruction: 'Lepaskan nafas perlahan dan tuntas',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          cairnTheme: 'achievement' as const
        };
      case 'pause':
        return {
          text: 'Jeda',
          instruction: 'Rileks sejenak sebelum siklus berikutnya',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          cairnTheme: 'default' as const
        };
    }
  };

  const phaseInfo = getPhaseInfo();
  const phaseProgress = ((phaseTimer + 1) / phaseDurations[currentPhase]) * 100;

  // Breathing animation scale
  const getBreathingScale = (): number => {
    if (!isActive) return 1;
    
    switch (currentPhase) {
      case 'inhale':
        return 1 + (phaseProgress / 100) * 0.3; // Scale up during inhale
      case 'hold':
        return 1.3; // Hold at expanded state
      case 'exhale':
        return 1.3 - (phaseProgress / 100) * 0.3; // Scale down during exhale
      case 'pause':
        return 1; // Return to normal
      default:
        return 1;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 ${className}`}>
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="backdrop-blur-md"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        
        <div className="text-center">
          <h1 className="text-lg font-heading font-semibold text-gray-800 dark:text-gray-100">
            {pattern.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {pattern.description}
          </p>
        </div>

        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Main Session Area */}
      <div className="flex flex-col items-center justify-center px-6 py-8">
        {/* Cairn with Breathing Animation */}
        <motion.div
          className="relative mb-8"
          animate={{ scale: getBreathingScale() }}
          transition={{ 
            duration: isActive ? 0.5 : 0.3,
            ease: "easeInOut"
          }}
        >
          <AestheticCairnLogo
            size={220}
            progress={progress}
            animated={isActive}
            showWaves={isActive}
          />

          {/* Phase indicator overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className={`
                px-6 py-3 rounded-full backdrop-blur-md border shadow-lg
                ${phaseInfo.bgColor} ${phaseInfo.color} border-current/20
              `}
              animate={{
                scale: isActive ? [1, 1.05, 1] : 1,
                opacity: isActive ? [0.8, 1, 0.8] : 0.9
              }}
              transition={{
                duration: phaseDurations[currentPhase],
                repeat: isActive ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <div className="text-center">
                <div className="text-lg font-semibold">{phaseInfo.text}</div>
                <div className="text-sm opacity-80">{phaseDurations[currentPhase]}s</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Session Info */}
        <div className="text-center mb-8 space-y-4">
          {/* Timer and Progress */}
          <div className="space-y-2">
            <div className="text-4xl font-mono font-bold text-gray-800 dark:text-gray-100">
              {formatTime(sessionDurationSeconds - sessionTimer)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              tersisa dari {duration} menit
            </div>
          </div>

          {/* Phase Progress */}
          <div className="space-y-2">
            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
              {phaseInfo.instruction}
            </p>
            
            {/* Phase progress bar */}
            <div className="w-64 mx-auto">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-full rounded-full ${
                    currentPhase === 'inhale' ? 'bg-blue-500' :
                    currentPhase === 'hold' ? 'bg-purple-500' :
                    currentPhase === 'exhale' ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${phaseProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          </div>

          {/* Session Stats */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Wind className="w-4 h-4 mr-1" />
              <span>{completedCycles} siklus</span>
            </div>
            <div className="flex items-center">
              <Timer className="w-4 h-4 mr-1" />
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              <span>{pattern.name}</span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-4">
          {!isActive ? (
            <Button
              onClick={handleStart}
              size="lg"
              className="flex items-center space-x-2 px-8"
              disabled={isCompleted}
            >
              <Play size={20} />
              <span>{sessionTimer === 0 ? 'Mulai' : 'Lanjut'}</span>
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              variant="secondary"
              size="lg"
              className="flex items-center space-x-2 px-8"
            >
              <Pause size={20} />
              <span>Jeda</span>
            </Button>
          )}

          <Button
            onClick={handleStop}
            variant="outline"
            size="lg"
            className="flex items-center space-x-2"
          >
            <Square size={20} />
            <span>Berhenti</span>
          </Button>
        </div>

        {/* Pattern Benefits */}
        {!isActive && !isCompleted && (
          <motion.div
            className="mt-8 max-w-md text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Manfaat {pattern.name}:
            </h3>
            <div className="space-y-1">
              {pattern.benefits.map((benefit, index) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                  • {benefit}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Completion Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl text-center shadow-2xl border max-w-md mx-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 2 }}
              >
                🌸
              </motion.div>
              <h3 className="text-2xl font-bold text-primary mb-2 font-heading">
                Sesi Selesai!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Anda telah menyelesaikan {completedCycles} siklus pernafasan {pattern.name}
              </p>
              <div className="mt-6">
                <AestheticCairnLogo
                  size={80}
                  progress={100}
                  animated={true}
                  showWaves={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BreathingCairnSession;