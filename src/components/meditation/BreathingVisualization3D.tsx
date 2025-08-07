import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Play, Pause, Settings, Volume2 } from 'lucide-react';
import { GlassmorphicCard, GlassmorphicButton } from '../ui/GlassmorphicCard';

// 2025 3D Breathing Visualization Component
interface BreathingPattern {
  id: string;
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  pause?: number;
  description: string;
  benefits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const breathingPatterns: BreathingPattern[] = [
  {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    inhale: 4,
    hold: 7,
    exhale: 8,
    description: 'Calming breath for sleep and anxiety relief',
    benefits: ['Reduces anxiety', 'Improves sleep', 'Lowers heart rate'],
    difficulty: 'beginner',
  },
  {
    id: 'box',
    name: 'Box Breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
    description: 'Navy SEALs technique for focus and calm',
    benefits: ['Improves focus', 'Reduces stress', 'Enhances performance'],
    difficulty: 'intermediate',
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    inhale: 5,
    hold: 0,
    exhale: 5,
    description: 'Heart rate variability optimization',
    benefits: ['Heart coherence', 'Emotional balance', 'Mental clarity'],
    difficulty: 'beginner',
  },
  {
    id: 'wim-hof',
    name: 'Wim Hof Method',
    inhale: 2,
    hold: 0,
    exhale: 1,
    description: 'Power breathing for energy and immunity',
    benefits: ['Increased energy', 'Immune boost', 'Cold tolerance'],
    difficulty: 'advanced',
  },
];

interface BreathingVisualization3DProps {
  className?: string;
  autoStart?: boolean;
  defaultPattern?: string;
  onSessionComplete?: () => void;
}

const BreathingVisualization3D: React.FC<BreathingVisualization3DProps> = ({
  className,
  autoStart = false,
  defaultPattern = 'coherent',
  onSessionComplete,
}) => {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentPattern, setCurrentPattern] = useState(
    breathingPatterns.find(p => p.id === defaultPattern) || breathingPatterns[0]
  );
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const sphereControls = useAnimation();
  const ringControls = useAnimation();
  // Note: Glow controls available for enhanced visual feedback
  // const glowControls = useAnimation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef(phase);
  
  // Update phase ref when phase changes
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // 3D Sphere animation variants
  const sphereVariants = {
    inhale: {
      scale: 1.4,
      rotateY: 180,
      background: [
        'radial-gradient(circle, rgba(34,197,94,0.8) 0%, rgba(34,197,94,0.3) 50%, rgba(34,197,94,0.1) 100%)',
        'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(59,130,246,0.3) 50%, rgba(59,130,246,0.1) 100%)'
      ],
      transition: {
        scale: { duration: currentPattern.inhale, ease: 'easeInOut' },
        rotateY: { duration: currentPattern.inhale, ease: 'linear' },
        background: { duration: currentPattern.inhale * 0.5, ease: 'easeInOut' }
      },
    },
    hold: {
      scale: 1.4,
      rotateY: 360,
      background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(168,85,247,0.3) 50%, rgba(168,85,247,0.1) 100%)',
      transition: {
        scale: { duration: 0.1 },
        rotateY: { duration: currentPattern.hold, ease: 'linear' },
        background: { duration: 0.5, ease: 'easeInOut' }
      },
    },
    exhale: {
      scale: 0.6,
      rotateY: 540,
      background: [
        'radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(168,85,247,0.3) 50%, rgba(168,85,247,0.1) 100%)',
        'radial-gradient(circle, rgba(239,68,68,0.6) 0%, rgba(239,68,68,0.2) 50%, rgba(239,68,68,0.05) 100%)'
      ],
      transition: {
        scale: { duration: currentPattern.exhale, ease: 'easeInOut' },
        rotateY: { duration: currentPattern.exhale, ease: 'linear' },
        background: { duration: currentPattern.exhale * 0.5, ease: 'easeInOut' }
      },
    },
    pause: {
      scale: 0.6,
      rotateY: 540,
      background: 'radial-gradient(circle, rgba(156,163,175,0.4) 0%, rgba(156,163,175,0.2) 50%, rgba(156,163,175,0.05) 100%)',
      transition: {
        scale: { duration: 0.1 },
        rotateY: { duration: 0.1 },
        background: { duration: 0.5, ease: 'easeInOut' }
      },
    },
  };

  // Ring animations for enhanced 3D effect
  const ringVariants = React.useMemo(() => ({
    inhale: {
      scale: [1, 1.6, 1.4],
      rotate: [0, 90, 180],
      opacity: [0.3, 0.6, 0.4],
    },
    hold: {
      scale: 1.4,
      rotate: 180,
      opacity: 0.7,
    },
    exhale: {
      scale: [1.4, 0.8, 0.6],
      rotate: [180, 270, 360],
      opacity: [0.7, 0.4, 0.2],
    },
    pause: {
      scale: 0.6,
      rotate: 360,
      opacity: 0.2,
    },
  }), []);

  // Start breathing cycle
  const startBreathingCycle = React.useCallback(() => {
    if (!isActive) return;
    
    const runPhase = (phaseName: typeof phase, duration: number) => {
      setPhase(phaseName);
      setTimeRemaining(duration);
      
      // Animate sphere and rings
      sphereControls.start(phaseName);
      ringControls.start({
        ...ringVariants[phaseName],
        transition: { duration, ease: 'easeInOut' }
      });

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return new Promise<void>(resolve => {
        timerRef.current = setTimeout(() => {
          clearInterval(countdownInterval);
          resolve();
        }, duration * 1000);
      });
    };

    const cycle = async () => {
      if (!isActive) return;
      
      // Inhale phase
      await runPhase('inhale', currentPattern.inhale);
      if (!isActive) return;
      
      // Hold phase
      if (currentPattern.hold > 0) {
        await runPhase('hold', currentPattern.hold);
        if (!isActive) return;
      }
      
      // Exhale phase
      await runPhase('exhale', currentPattern.exhale);
      if (!isActive) return;
      
      // Pause phase
      if (currentPattern.pause && currentPattern.pause > 0) {
        await runPhase('pause', currentPattern.pause);
        if (!isActive) return;
      }
      
      setCycleCount(prev => prev + 1);
      
      // Continue the cycle
      if (isActive) {
        cycle();
      }
    };

    cycle();
  }, [isActive, currentPattern, sphereControls, ringControls, ringVariants]);

  // Control breathing session
  useEffect(() => {
    if (isActive) {
      startBreathingCycle();
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, currentPattern, startBreathingCycle]);

  const toggleSession = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setCycleCount(0);
    }
  };

  const getPhaseColor = () => {
    const colors = {
      inhale: 'text-green-400',
      hold: 'text-purple-400',
      exhale: 'text-red-400',
      pause: 'text-gray-400',
    };
    return colors[phase];
  };

  const getPhaseInstruction = () => {
    const instructions = {
      inhale: 'Breathe In',
      hold: 'Hold',
      exhale: 'Breathe Out',
      pause: 'Pause',
    };
    return instructions[phase];
  };

  return (
    <div className={className}>
      <GlassmorphicCard variant="meditation" size="xl" className="text-center">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">{currentPattern.name}</h2>
            <p className="text-sm opacity-75">{currentPattern.description}</p>
          </div>
          <div className="flex space-x-2">
            <GlassmorphicButton
              variant="calm"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </GlassmorphicButton>
            <GlassmorphicButton variant="calm" size="sm">
              <Volume2 className="w-4 h-4" />
            </GlassmorphicButton>
          </div>
        </div>

        {/* 3D Breathing Visualization */}
        <div className="relative w-80 h-80 mx-auto mb-8">
          {/* Outer Ring */}
          <motion.div
            animate={ringControls}
            className="absolute inset-0 rounded-full border-2 border-white/20"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
            }}
          />

          {/* Middle Ring */}
          <motion.div
            animate={ringControls}
            className="absolute inset-8 rounded-full border border-white/30"
            style={{
              background: 'radial-gradient(circle, transparent 60%, rgba(255,255,255,0.05) 100%)'
            }}
          />

          {/* Central Breathing Sphere */}
          <motion.div
            animate={sphereControls}
            variants={sphereVariants}
            className="absolute inset-16 rounded-full backdrop-blur-sm"
            style={{
              background: 'radial-gradient(circle, rgba(34,197,94,0.8) 0%, rgba(34,197,94,0.3) 50%, rgba(34,197,94,0.1) 100%)',
              boxShadow: `
                0 0 60px rgba(255,255,255,0.1),
                inset 0 0 40px rgba(255,255,255,0.1)
              `,
            }}
          />

          {/* Particle Effects */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                originX: 0.5,
                originY: 0.5,
              }}
              animate={{
                rotate: [0, 360],
                x: [0, Math.cos(i * 45 * Math.PI / 180) * 120],
                y: [0, Math.sin(i * 45 * Math.PI / 180) * 120],
                opacity: isActive ? [0.4, 0.8, 0.4] : 0.2,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        {/* Phase Indicator */}
        <div className="mb-6">
          <motion.h3 
            className={`text-3xl font-bold mb-2 ${getPhaseColor()}`}
            animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {getPhaseInstruction()}
          </motion.h3>
          <div className="flex justify-center items-center space-x-4 text-lg">
            <span className="opacity-75">Time:</span>
            <motion.span 
              className="font-mono font-bold"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {timeRemaining}s
            </motion.span>
            <span className="opacity-50">|</span>
            <span className="opacity-75">Cycles:</span>
            <span className="font-bold">{cycleCount}</span>
          </div>
        </div>

        {/* Pattern Info */}
        <div className="grid grid-cols-4 gap-2 text-center text-sm mb-6 opacity-75">
          <div>
            <div className="font-semibold">Inhale</div>
            <div>{currentPattern.inhale}s</div>
          </div>
          {currentPattern.hold > 0 && (
            <div>
              <div className="font-semibold">Hold</div>
              <div>{currentPattern.hold}s</div>
            </div>
          )}
          <div>
            <div className="font-semibold">Exhale</div>
            <div>{currentPattern.exhale}s</div>
          </div>
          {currentPattern.pause && currentPattern.pause > 0 && (
            <div>
              <div className="font-semibold">Pause</div>
              <div>{currentPattern.pause}s</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <GlassmorphicButton
            variant="meditation"
            size="lg"
            onClick={toggleSession}
            className="flex items-center space-x-2"
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            <span>{isActive ? 'Pause' : 'Start'} Breathing</span>
          </GlassmorphicButton>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <h4 className="text-lg font-semibold mb-4">Choose Pattern</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {breathingPatterns.map((pattern) => (
                <motion.button
                  key={pattern.id}
                  onClick={() => {
                    setCurrentPattern(pattern);
                    setShowSettings(false);
                    if (isActive) {
                      setIsActive(false);
                      setTimeout(() => setIsActive(true), 500);
                    }
                  }}
                  className={`p-3 rounded-lg text-left transition-all ${
                    pattern.id === currentPattern.id 
                      ? 'bg-white/20 border-white/30' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  } border`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium">{pattern.name}</div>
                  <div className="text-xs opacity-75 capitalize">{pattern.difficulty}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </GlassmorphicCard>
    </div>
  );
};

export default BreathingVisualization3D;