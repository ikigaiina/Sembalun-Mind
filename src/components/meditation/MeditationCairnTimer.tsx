import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AestheticCairnLogo } from '../ui/AestheticCairnLogo';
import { Button } from '../ui/Button';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

interface MeditationCairnTimerProps {
  duration: number; // in seconds
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  autoStart?: boolean;
  showMilestones?: boolean;
  className?: string;
}

export const MeditationCairnTimer: React.FC<MeditationCairnTimerProps> = ({
  duration,
  onComplete,
  onProgress,
  autoStart = false,
  showMilestones = true,
  className = ''
}) => {
  const [isRunning, setIsRunning] = useState(autoStart);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate progress as percentage
  const progress = ((duration - timeLeft) / duration) * 100;

  // Milestone markers at 25%, 50%, 75%, 100%
  const milestones = showMilestones ? [
    { value: 25, label: 'Ketenangan Dasar', reached: progress >= 25 },
    { value: 50, label: 'Fokus Mendalam', reached: progress >= 50 },
    { value: 75, label: 'Kedamaian Sejati', reached: progress >= 75 },
    { value: 100, label: 'Pencerahan', reached: progress >= 100 }
  ] : [];

  // Timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = Math.max(0, prevTime - 1);
          const newProgress = ((duration - newTime) / duration) * 100;
          
          if (onProgress) {
            onProgress(newProgress);
          }

          if (newTime === 0) {
            setIsCompleted(true);
            setIsRunning(false);
            setShowCelebration(true);
            
            if (onComplete) {
              onComplete();
            }

            // Hide celebration after 3 seconds
            setTimeout(() => setShowCelebration(false), 3000);
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
  }, [isRunning, timeLeft, duration, onComplete, onProgress]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Control functions
  const handlePlayPause = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(duration);
    setIsCompleted(false);
    setShowCelebration(false);
  }, [duration]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(duration);
    setIsCompleted(false);
    setShowCelebration(false);
  }, [duration]);

  // Get meditation phase description
  const getPhaseDescription = (): string => {
    if (isCompleted) return 'Sesi meditasi selesai dengan sempurna!';
    if (progress < 25) return 'Mulai dengan menenangkan pikiran...';
    if (progress < 50) return 'Fokus pada napas dalam-dalam...';
    if (progress < 75) return 'Rasakan kedamaian yang mengalir...';
    return 'Hampir mencapai pencerahan penuh...';
  };

  // Breathing animation speed based on progress
  const breathingDuration = isRunning ? 
    Math.max(2, 4 - (progress / 100) * 1.5) : 4; // Slower breathing as session progresses

  return (
    <div className={`flex flex-col items-center space-y-8 p-8 ${className}`}>
      {/* Main Cairn Timer Display */}
      <motion.div
        className="relative"
        animate={isRunning ? {
          scale: [1, 1.02, 1],
        } : {}}
        transition={{
          duration: breathingDuration,
          repeat: isRunning ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        <AestheticCairnLogo
          size={200}
          progress={progress}
          animated={true}
          showWaves={isRunning}
        />

        {/* Breathing guide ring */}
        {isRunning && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-300/30"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: breathingDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Progress ring overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(106, 143, 111, 0.1)"
              strokeWidth="4"
            />
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100)
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6A8F6F" />
                <stop offset="50%" stopColor="#A9C1D9" />
                <stop offset="100%" stopColor="#C7DCF0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* Time Display */}
      <motion.div
        className="text-center space-y-3"
        animate={isCompleted ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-4xl md:text-5xl font-mono font-bold text-primary tracking-wider"
          animate={isRunning ? { 
            opacity: [0.8, 1, 0.8] 
          } : {}}
          transition={{
            duration: breathingDuration,
            repeat: isRunning ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {formatTime(timeLeft)}
        </motion.div>
        
        <motion.p
          className="text-lg text-gray-600 dark:text-gray-300 font-heading max-w-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {getPhaseDescription()}
        </motion.p>

        {/* Progress percentage */}
        <motion.div
          className="text-2xl font-semibold text-accent"
          animate={progress > 0 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          {Math.round(progress)}%
        </motion.div>
      </motion.div>

      {/* Milestones */}
      {showMilestones && milestones.length > 0 && (
        <motion.div
          className="grid grid-cols-2 gap-4 w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.value}
              className={`
                p-3 rounded-xl text-center backdrop-blur-sm border transition-all duration-500
                ${milestone.reached 
                  ? 'bg-green-50/50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
                  : 'bg-gray-50/30 border-gray-200/50 text-gray-600 dark:bg-gray-800/20 dark:border-gray-700 dark:text-gray-400'
                }
              `}
              animate={milestone.reached ? { 
                scale: [1, 1.05, 1],
                boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 20px rgba(34, 197, 94, 0.3)', '0 0 0 rgba(34, 197, 94, 0)']
              } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="text-sm font-semibold">{milestone.value}%</div>
              <div className="text-xs mt-1">{milestone.label}</div>
              {milestone.reached && (
                <motion.div
                  className="text-green-500 mt-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Control Buttons */}
      <motion.div
        className="flex items-center space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <Button
          onClick={handlePlayPause}
          variant={isRunning ? "secondary" : "default"}
          size="lg"
          className="flex items-center space-x-2 min-w-[120px]"
          disabled={isCompleted}
        >
          {isRunning ? (
            <>
              <Pause size={20} />
              <span>Jeda</span>
            </>
          ) : (
            <>
              <Play size={20} />
              <span>{timeLeft === duration ? 'Mulai' : 'Lanjut'}</span>
            </>
          )}
        </Button>

        <Button
          onClick={handleStop}
          variant="outline"
          size="lg"
          className="flex items-center space-x-2"
        >
          <Square size={20} />
          <span>Berhenti</span>
        </Button>

        <Button
          onClick={handleReset}
          variant="ghost"
          size="lg"
          className="flex items-center space-x-2"
        >
          <RotateCcw size={20} />
          <span>Reset</span>
        </Button>
      </motion.div>

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
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-bold text-primary mb-2 font-heading">
                Selamat!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Anda telah menyelesaikan sesi meditasi dengan sempurna. 
                Cairn kebijaksanaan Anda telah lengkap!
              </p>
              <motion.div
                className="mt-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <AestheticCairnLogo
                  size={100}
                  progress={100}
                  animated={true}
                  showWaves={true}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeditationCairnTimer;