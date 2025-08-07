import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { designTokens } from '../../design-system/foundations';
import { AestheticCairnLogo } from '../ui/AestheticCairnLogo';

// ============= COMPONENT INTERFACES =============

export interface MeditationSession {
  id: string;
  duration: number; // in seconds
  type: 'guided' | 'silent' | 'breathing' | 'walking' | 'cultural';
  tradition?: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  culturalContent?: {
    title: string;
    instructor: string;
    backgroundMusic?: string;
    guidance?: string[];
  };
}

export interface MeditationTimerProps {
  session: MeditationSession;
  
  // Timer configuration
  autoStart?: boolean;
  showMilliseconds?: boolean;
  playChimes?: boolean;
  
  // Visual configuration
  variant?: 'minimal' | 'cultural' | 'traditional' | 'modern';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Cultural theming
  tradition?: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  
  // Progress visualization
  showProgress?: boolean;
  progressType?: 'circular' | 'linear' | 'breathe' | 'lotus';
  
  // Audio configuration
  enableAudio?: boolean;
  audioVolume?: number;
  
  // Event handlers
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onComplete?: (session: MeditationSession, actualDuration: number) => void;
  onTick?: (remainingTime: number, elapsedTime: number) => void;
  
  // Customization
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

// Timer state interface
interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  remainingTime: number;
  elapsedTime: number;
  totalDuration: number;
}

// Breathing animation component
const BreathingAnimation: React.FC<{ isActive: boolean; tradition: string }> = ({ 
  isActive, 
  tradition 
}) => {
  const { colors } = designTokens;
  const culturalColors = colors.regionalColors[tradition as keyof typeof colors.regionalColors] || colors.cultural;

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <div
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${culturalColors.spiritualPurple}20, transparent)`,
          animation: isActive ? 'breathe 4s ease-in-out infinite alternate' : 'none',
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${culturalColors.templeGold}15, transparent)`,
          animation: isActive ? 'breathe 3s ease-in-out infinite alternate' : 'none',
          opacity: 0.8,
          animationDelay: '0.5s',
        }}
      />
    </div>
  );
};


// Cairn progress component with Indonesian aesthetic
const CairnProgressDisplay: React.FC<{
  progress: number;
  size: number;
  tradition: string;
  isActive: boolean;
}> = ({ progress, size, tradition, isActive }) => {
  return (
    <div style={{ position: 'relative' }}>
      <AestheticCairnLogo
        size={size}
        progress={progress}
        animated={isActive}
        showWaves={isActive}
      />
      
      {/* Optional traditional progress ring overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          opacity: 0.3,
          pointerEvents: 'none'
        }}
      >
        <ProgressCircle 
          progress={progress}
          size={size + 40}
          tradition={tradition}
          strokeWidth={2}
        />
      </div>
    </div>
  );
};

// Progress circle component (kept for traditional overlay)
const ProgressCircle: React.FC<{
  progress: number;
  size: number;
  tradition: string;
  strokeWidth?: number;
}> = ({ progress, size, tradition, strokeWidth = 8 }) => {
  const { colors } = designTokens;
  const culturalColors = colors.regionalColors[tradition as keyof typeof colors.regionalColors] || colors.cultural;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg 
      width={size} 
      height={size} 
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={`${culturalColors.lotusWhite}20`}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={culturalColors.spiritualPurple}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{
          transition: 'stroke-dashoffset 1s ease',
          filter: `drop-shadow(0 0 8px ${culturalColors.spiritualPurple}20)`,
        }}
      />
    </svg>
  );
};

// Control button component
const ControlButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  variant: 'primary' | 'secondary';
  tradition: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  'aria-label': string;
}> = ({ 
  icon, 
  onClick, 
  variant, 
  tradition, 
  size = 'md',
  disabled = false,
  'aria-label': ariaLabel 
}) => {
  const { colors, spacing, shadows } = designTokens;
  const culturalColors = colors.regionalColors[tradition as keyof typeof colors.regionalColors] || colors.cultural;

  const sizeConfig = {
    sm: { padding: spacing[2], iconSize: '16px' },
    md: { padding: spacing[3], iconSize: '20px' },
    lg: { padding: spacing[4], iconSize: '24px' },
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `calc(${sizeConfig[size].iconSize} + ${sizeConfig[size].padding} * 2)`,
    height: `calc(${sizeConfig[size].iconSize} + ${sizeConfig[size].padding} * 2)`,
    borderRadius: '50%',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.3s ease',
    backgroundColor: variant === 'primary' 
      ? culturalColors.spiritualPurple
      : 'transparent',
    color: variant === 'primary' 
      ? culturalColors.lotusWhite
      : culturalColors.earthBrown,
    border: variant === 'secondary' 
      ? `2px solid ${culturalColors.earthBrown}40`
      : 'none',
    boxShadow: variant === 'primary' 
      ? shadows.cultural.spiritual
      : 'none',
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = shadows.cultural.temple;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = buttonStyle.boxShadow || 'none';
        }
      }}
    >
      <div style={{ fontSize: sizeConfig[size].iconSize }}>
        {icon}
      </div>
    </button>
  );
};

// ============= TIMER COMPONENT =============

export const MeditationTimer = forwardRef<HTMLDivElement, MeditationTimerProps>(({
  session,
  autoStart = false,
  showMilliseconds = false,
  playChimes = true,
  variant = 'cultural',
  size = 'lg',
  tradition,
  showProgress = true,
  progressType = 'circular',
  enableAudio = true,
  audioVolume = 0.7,
  onStart,
  onPause,
  onResume,
  onComplete,
  onTick,
  className = '',
  style = {},
  testId,
}, ref) => {
  // ============= STATE MANAGEMENT =============

  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    remainingTime: session.duration,
    elapsedTime: 0,
    totalDuration: session.duration,
  });

  // ============= DESIGN TOKENS =============

  const { colors, typography, spacing, shadows } = designTokens;
  const selectedTradition = tradition || session.tradition || 'javanese';
  const culturalColors = colors.regionalColors[selectedTradition] || colors.cultural;

  // ============= TIMER LOGIC =============

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = Math.floor((seconds % 1) * 100);
    
    if (showMilliseconds) {
      return `${minutes.toString().padStart(2, '0')}:${Math.floor(remainingSeconds).toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${Math.floor(remainingSeconds).toString().padStart(2, '0')}`;
  }, [showMilliseconds]);

  const playSound = useCallback((type: 'start' | 'pause' | 'complete') => {
    if (!enableAudio || !playChimes) return;
    
    // Create audio context for playing chimes
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different actions
      const frequencies = {
        start: 528, // C note - healing frequency
        pause: 396, // G note - grounding frequency
        complete: 741, // F# note - awakening frequency
      };
      
      oscillator.frequency.value = frequencies[type];
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(audioVolume * 0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Audio not available:', error);
    }
  }, [enableAudio, playChimes, audioVolume]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState.isRunning && !timerState.isPaused) {
      interval = setInterval(() => {
        setTimerState(prev => {
          const newElapsedTime = prev.elapsedTime + 1;
          const newRemainingTime = Math.max(0, prev.totalDuration - newElapsedTime);
          
          onTick?.(newRemainingTime, newElapsedTime);
          
          if (newRemainingTime <= 0) {
            playSound('complete');
            onComplete?.(session, newElapsedTime);
            return {
              ...prev,
              isRunning: false,
              remainingTime: 0,
              elapsedTime: prev.totalDuration,
            };
          }
          
          return {
            ...prev,
            remainingTime: newRemainingTime,
            elapsedTime: newElapsedTime,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.isPaused, session, onTick, onComplete, playSound]);

  // Auto start effect
  useEffect(() => {
    if (autoStart && !timerState.isRunning) {
      handleStart();
    }
  }, [autoStart, handleStart, timerState.isRunning]);

  // ============= EVENT HANDLERS =============

  const handleStart = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));
    playSound('start');
    onStart?.();
  }, [playSound, onStart]);

  const handlePause = () => {
    setTimerState(prev => ({
      ...prev,
      isPaused: true,
    }));
    playSound('pause');
    onPause?.();
  };

  const handleResume = () => {
    setTimerState(prev => ({
      ...prev,
      isPaused: false,
    }));
    onResume?.();
  };

  const handleReset = () => {
    setTimerState({
      isRunning: false,
      isPaused: false,
      remainingTime: session.duration,
      elapsedTime: 0,
      totalDuration: session.duration,
    });
  };

  // ============= STYLE CONFIGURATIONS =============

  const sizeConfig = {
    sm: {
      timerSize: '120px',
      fontSize: typography.fontSizes['2xl'],
      progressSize: 140,
      containerPadding: spacing[4],
    },
    md: {
      timerSize: '160px',
      fontSize: typography.fontSizes['3xl'],
      progressSize: 180,
      containerPadding: spacing[6],
    },
    lg: {
      timerSize: '200px',
      fontSize: typography.fontSizes['4xl'],
      progressSize: 220,
      containerPadding: spacing[8],
    },
    xl: {
      timerSize: '280px',
      fontSize: typography.fontSizes['6xl'],
      progressSize: 300,
      containerPadding: spacing[12],
    },
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizeConfig[size].containerPadding,
    borderRadius: '24px',
    position: 'relative',
    background: variant === 'cultural'
      ? `radial-gradient(ellipse at center, ${culturalColors.lotusWhite}, ${colors.neutral[50]})`
      : colors.neutral[50],
    border: variant === 'cultural'
      ? `2px solid ${culturalColors.templeGold}`
      : `1px solid ${colors.neutral[200]}`,
    boxShadow: variant === 'cultural'
      ? shadows.cultural.temple
      : shadows.md,
    minWidth: '300px',
    ...style,
  };

  const timerDisplayStyle: React.CSSProperties = {
    fontSize: sizeConfig[size].fontSize,
    fontWeight: typography.fontWeights.light,
    fontFamily: typography.fontFamilies.monospace.join(', '),
    color: culturalColors.earthBrown,
    textAlign: 'center',
    marginBottom: spacing[4],
    letterSpacing: '0.1em',
    textShadow: `0 2px 4px ${culturalColors.spiritualPurple}20`,
    zIndex: 2,
    position: 'relative',
  };

  const progress = timerState.totalDuration > 0 
    ? ((timerState.totalDuration - timerState.remainingTime) / timerState.totalDuration) * 100
    : 0;

  // ============= RENDER =============

  return (
    <div
      ref={ref}
      className={`sembalun-meditation-timer ${className}`}
      style={containerStyle}
      data-testid={testId}
      data-variant={variant}
      data-tradition={selectedTradition}
      data-size={size}
      role="timer"
      aria-label={`Meditation timer: ${formatTime(timerState.remainingTime)} remaining`}
    >
      {/* CSS Animations */}
      <style>
        {`
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          
          @keyframes spiritual-glow {
            0%, 100% { filter: drop-shadow(0 0 8px ${culturalColors.spiritualPurple}40); }
            50% { filter: drop-shadow(0 0 16px ${culturalColors.spiritualPurple}60); }
          }
          
          @keyframes lotus-bloom {
            0% { transform: scale(0.8) rotate(-5deg); opacity: 0.5; }
            50% { transform: scale(1.05) rotate(2deg); opacity: 0.8; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}
      </style>

      {/* Breathing Animation Background */}
      {variant === 'cultural' && timerState.isRunning && (
        <BreathingAnimation 
          isActive={!timerState.isPaused} 
          tradition={selectedTradition} 
        />
      )}

      {/* Session Info */}
      {session.culturalContent && (
        <div 
          style={{
            textAlign: 'center',
            marginBottom: spacing[4],
            zIndex: 2,
          }}
        >
          <h3 
            style={{
              fontSize: typography.fontSizes.lg,
              fontWeight: typography.fontWeights.medium,
              color: culturalColors.earthBrown,
              fontFamily: typography.fontFamilies.cultural.join(', '),
              margin: 0,
              marginBottom: spacing[1],
            }}
          >
            {session.culturalContent.title}
          </h3>
          <p 
            style={{
              fontSize: typography.fontSizes.sm,
              color: culturalColors.spiritualPurple,
              fontFamily: typography.fontFamilies.cultural.join(', '),
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            {session.culturalContent.instructor}
          </p>
        </div>
      )}

      {/* Progress Indicator with Aesthetic Cairn */}
      {showProgress && progressType === 'circular' && (
        <div style={{ position: 'relative', marginBottom: spacing[4] }}>
          <CairnProgressDisplay 
            progress={progress}
            size={sizeConfig[size].progressSize}
            tradition={selectedTradition}
            isActive={timerState.isRunning && !timerState.isPaused}
          />
          {/* Timer Display (centered below cairn) */}
          <div
            style={{
              position: 'absolute',
              top: '85%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              ...timerDisplayStyle,
              marginBottom: 0,
              fontSize: typography.fontSizes['2xl'], // Smaller font to fit below cairn
              background: 'rgba(255, 255, 255, 0.9)',
              padding: `${spacing[1]} ${spacing[3]}`,
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${culturalColors.templeGold}30`,
            }}
          >
            {formatTime(timerState.remainingTime)}
          </div>
        </div>
      )}

      {/* Timer Display (for non-circular progress) */}
      {(!showProgress || progressType !== 'circular') && (
        <div style={timerDisplayStyle}>
          {formatTime(timerState.remainingTime)}
        </div>
      )}

      {/* Control Buttons */}
      <div 
        style={{
          display: 'flex',
          gap: spacing[4],
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        {/* Play/Pause Button */}
        {!timerState.isRunning || timerState.isPaused ? (
          <ControlButton
            icon={timerState.isPaused ? '▶️' : '▶️'}
            onClick={timerState.isPaused ? handleResume : handleStart}
            variant="primary"
            tradition={selectedTradition}
            size={size === 'xl' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
            aria-label={timerState.isPaused ? 'Resume meditation' : 'Start meditation'}
          />
        ) : (
          <ControlButton
            icon="⏸️"
            onClick={handlePause}
            variant="primary"
            tradition={selectedTradition}
            size={size === 'xl' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
            aria-label="Pause meditation"
          />
        )}

        {/* Reset Button */}
        <ControlButton
          icon="⏹️"
          onClick={handleReset}
          variant="secondary"
          tradition={selectedTradition}
          size={size === 'xl' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
          aria-label="Reset meditation timer"
        />
      </div>

      {/* Session Progress Text */}
      {timerState.isRunning && (
        <div 
          style={{
            marginTop: spacing[4],
            textAlign: 'center',
            fontSize: typography.fontSizes.sm,
            color: culturalColors.spiritualPurple,
            fontFamily: typography.fontFamilies.cultural.join(', '),
          }}
        >
          {Math.round(progress)}% complete • {formatTime(timerState.elapsedTime)} elapsed
        </div>
      )}
    </div>
  );
});

MeditationTimer.displayName = 'MeditationTimer';

export default MeditationTimer;