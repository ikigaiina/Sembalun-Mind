import { useState, useEffect, useRef } from 'react';
import { 
  breathingPatterns, 
  phaseLabels, 
  type BreathingPattern, 
  type BreathingPhase 
} from '../../utils/breathingPatterns';

interface BreathingGuideProps {
  pattern: BreathingPattern;
  isActive: boolean;
  onComplete?: () => void;
  className?: string;
}

export const BreathingGuide: React.FC<BreathingGuideProps> = ({
  pattern,
  isActive,
  className = ''
}) => {
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [countdown, setCountdown] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [animationKey, setAnimationKey] = useState(0); // Force animation restart
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const config = breathingPatterns.find(p => p.id === pattern) || breathingPatterns[0];
  const phases = Object.entries(config.phases).filter(([_, duration]) => duration > 0);
  
  // Initialize countdown for current phase
  useEffect(() => {
    if (isActive) {
      const currentPhaseDuration = config.phases[currentPhase];
      if (currentPhaseDuration) {
        setCountdown(currentPhaseDuration);
      }
    }
  }, [currentPhase, config.phases, isActive]);

  // Main breathing timer logic
  useEffect(() => {
    if (isActive && countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Move to next phase
            const currentIndex = phases.findIndex(([phase]) => phase === currentPhase);
            const nextIndex = (currentIndex + 1) % phases.length;
            const nextPhase = phases[nextIndex][0] as BreathingPhase;
            
            setCurrentPhase(nextPhase);
            setAnimationKey(prev => prev + 1); // Force animation restart
            
            // Increment cycle when returning to inhale
            if (nextPhase === 'inhale') {
              setCycleCount(prev => prev + 1);
            }
            
            // Play soft chime sound (optional)
            playChime();
            
            return config.phases[nextPhase] || 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, countdown, currentPhase, config.phases, phases]);

  // Reset when pattern changes or stopped
  useEffect(() => {
    if (!isActive) {
      setCurrentPhase('inhale');
      setCountdown(config.phases.inhale);
      setCycleCount(0);
    }
  }, [isActive, pattern, config.phases.inhale]);

  const playChime = () => {
    // TODO: In a real app, you would play actual chime sounds here
    // For now, we'll just log the chime
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Handle audio play failure silently
      });
    }
  };

  // Get animation class and style for current phase
  const getCircleAnimation = () => {
    const phaseDuration = config.phases[currentPhase] || 4;
    
    switch (currentPhase) {
      case 'inhale':
        return {
          animationName: 'breathe-inhale',
          animationDuration: `${phaseDuration}s`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'forwards'
        };
      case 'hold':
        return {
          animationName: 'breathe-hold',
          animationDuration: `${phaseDuration}s`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'forwards'
        };
      case 'exhale':
        return {
          animationName: 'breathe-exhale',
          animationDuration: `${phaseDuration}s`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'forwards'
        };
      case 'pause':
        return {
          animationName: 'breathe-pause',
          animationDuration: `${phaseDuration}s`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'forwards'
        };
      default:
        return {
          transform: 'scale(1)',
          opacity: 0.3
        };
    }
  };

  const animationStyle = getCircleAnimation();

  return (
    <div className={`flex flex-col items-center justify-center space-y-8 ${className}`}>
      
      {/* Breathing Circle Animation */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        
        {/* Outer ring - background */}
        <div 
          className="absolute w-full h-full rounded-full border-4 border-opacity-20"
          style={{ 
            borderColor: 'rgba(147, 51, 234, 0.2)', // Purple border
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.05) 0%, transparent 70%)'
          }}
        />
        
        {/* Main breathing circle */}
        <div
          key={`breathing-circle-${animationKey}`} // Force re-render for animation restart
          className="absolute w-48 h-48 rounded-full flex items-center justify-center"
          style={{
            ...(isActive ? animationStyle : { transform: 'scale(1)', opacity: 0.3 }),
            background: `radial-gradient(circle, 
              rgba(147, 51, 234, 0.4) 0%, 
              rgba(219, 39, 119, 0.3) 50%, 
              rgba(147, 51, 234, 0.2) 100%)`,
            boxShadow: `0 0 40px rgba(147, 51, 234, 0.3)`
          }}
        >
          {/* Inner glow */}
          <div 
            className="w-24 h-24 rounded-full"
            style={{
              background: `radial-gradient(circle, 
                rgba(255, 255, 255, 0.8) 0%, 
                rgba(147, 51, 234, 0.1) 100%)`
            }}
          />
        </div>

        {/* Countdown number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="text-7xl font-heading"
            style={{ color: 'rgba(147, 51, 234, 0.8)' }}
          >
            {countdown}
          </div>
        </div>

        {/* Floating particles for ambiance */}
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(147, 51, 234, 0.3)',
                  top: `${20 + Math.sin((i * Math.PI) / 3) * 30}%`,
                  left: `${20 + Math.cos((i * Math.PI) / 3) * 30}%`,
                  animation: 'floating-particle 3s ease-in-out infinite',
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Phase instruction */}
      <div className="text-center space-y-4">
        <div 
          className="text-2xl font-heading"
          style={{ color: 'rgba(147, 51, 234, 0.9)' }}
        >
          {phaseLabels[currentPhase]}...
        </div>
        
        {/* Pattern info */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-xl">{config.icon}</span>
            <span className="font-heading text-gray-700">{config.name}</span>
          </div>
          <p className="text-gray-600 font-body text-sm max-w-xs">
            {config.description}
          </p>
        </div>

        {/* Cycle counter */}
        {isActive && cycleCount > 0 && (
          <div className="pt-4 border-t border-purple-100">
            <div className="text-sm text-gray-600 font-body">
              Siklus selesai: <span className="font-medium text-purple-700">{cycleCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Phase progress indicators */}
      <div className="flex items-center space-x-3">
        {phases.map(([phase, duration]) => (
          <div key={phase} className="flex flex-col items-center space-y-1">
            <div 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                phase === currentPhase ? 'scale-125 shadow-lg' : 'scale-100'
              }`}
              style={{
                backgroundColor: phase === currentPhase 
                  ? 'rgba(147, 51, 234, 0.8)' 
                  : 'rgba(147, 51, 234, 0.3)'
              }}
            />
            <div className="text-xs text-gray-500 font-body">
              {duration}s
            </div>
          </div>
        ))}
      </div>

      {/* Hidden audio element for chimes */}
      <audio 
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        {/* TODO: Add actual chime sound file */}
        {/* <source src="/sounds/soft-chime.mp3" type="audio/mpeg" /> */}
      </audio>
    </div>
  );
};