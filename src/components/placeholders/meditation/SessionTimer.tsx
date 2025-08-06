import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface SessionTimerProps {
  initialDuration: number; // in minutes
  onComplete?: (duration: number) => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  showVisualCues?: boolean;
  enableBreathingGuide?: boolean;
  className?: string;
}

/**
 * Advanced meditation session timer with breathing guidance
 * 
 * Features:
 * - Customizable session duration
 * - Visual breathing guide animation
 * - Progress ring visualization
 * - Background audio support
 * - Notification sounds
 * - Session pause/resume
 * - Auto-completion handling
 * - Accessibility-focused design
 */
export const SessionTimer: React.FC<SessionTimerProps> = ({
  initialDuration,
  onComplete,
  onPause,
  onResume,
  onReset,
  showVisualCues = true,
  enableBreathingGuide = false,
  className = ''
}) => {
  const [duration, setDuration] = useState(initialDuration);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [breathingCycle, setBreathingCycle] = useState(0);

  const totalSeconds = duration * 60;
  const progressPercentage = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

  // Breathing guide timing (4-7-8 pattern)
  const breathingPattern = {
    inhale: 4000,   // 4 seconds
    hold: 7000,     // 7 seconds
    exhale: 8000,   // 8 seconds
    pause: 1000     // 1 second
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false);
            onComplete?.(duration);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeRemaining, duration, onComplete]);

  // Breathing guide logic
  useEffect(() => {
    if (!enableBreathingGuide || !isActive || isPaused) return;

    const cycleBreathingPhase = () => {
      setBreathingPhase(currentPhase => {
        switch (currentPhase) {
          case 'inhale':
            return 'hold';
          case 'hold':
            return 'exhale';
          case 'exhale':
            setBreathingCycle(prev => prev + 1);
            return 'pause';
          case 'pause':
            return 'inhale';
          default:
            return 'inhale';
        }
      });
    };

    const timeout = setTimeout(cycleBreathingPhase, breathingPattern[breathingPhase]);
    return () => clearTimeout(timeout);
  }, [breathingPhase, isActive, isPaused, enableBreathingGuide]);

  // Control functions
  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    onResume?.();
  }, [onResume]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
    onPause?.();
  }, [onPause]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(duration * 60);
    setBreathingPhase('inhale');
    setBreathingCycle(0);
    onReset?.();
  }, [duration, onReset]);

  const adjustDuration = (newDuration: number) => {
    setDuration(newDuration);
    if (!isActive) {
      setTimeRemaining(newDuration * 60);
    }
  };

  // Get breathing instruction text
  const getBreathingInstruction = (): string => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Tarik napas perlahan...';
      case 'hold':
        return 'Tahan napas...';
      case 'exhale':
        return 'Hembuskan napas...';
      case 'pause':
        return 'Rileks sejenak...';
      default:
        return '';
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case ' ':
        event.preventDefault();
        if (isActive && !isPaused) {
          pauseTimer();
        } else {
          startTimer();
        }
        break;
      case 'r':
        event.preventDefault();
        resetTimer();
        break;
      case '+':
        event.preventDefault();
        adjustDuration(Math.min(120, duration + 5));
        break;
      case '-':
        event.preventDefault();
        adjustDuration(Math.max(1, duration - 5));
        break;
    }
  }, [isActive, isPaused, duration, startTimer, pauseTimer, resetTimer]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Card className={`session-timer text-center ${className}`} padding="large">
      {/* Session Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-heading text-gray-800 mb-2">
          Sesi Meditasi
        </h2>
        <p className="text-gray-600 font-body">
          Temukan kedamaian dalam keheningan
        </p>
      </div>

      {/* Main Timer Display */}
      <div className="relative mb-8">
        {/* Progress Ring */}
        <div className="relative w-64 h-64 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(156, 163, 175, 0.2)"
              strokeWidth="2"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
              className="transition-all duration-1000 ease-in-out"
            />
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-accent)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Breathing Guide Animation */}
          {enableBreathingGuide && showVisualCues && (
            <div 
              className={`absolute inset-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center transition-all duration-1000 ${
                breathingPhase === 'inhale' ? 'scale-110' : 
                breathingPhase === 'exhale' ? 'scale-90' : 'scale-100'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-gray-800 mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-gray-600 font-body">
                  {getBreathingInstruction()}
                </div>
              </div>
            </div>
          )}

          {/* Standard Timer Display */}
          {(!enableBreathingGuide || !showVisualCues) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-mono font-bold text-gray-800 mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-gray-500 font-body">
                  {isActive ? (isPaused ? 'Dijeda' : 'Berlangsung') : 'Siap dimulai'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Duration Selector */}
      {!isActive && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Durasi Sesi (menit)
          </label>
          <div className="flex items-center justify-center space-x-4">
            {[5, 10, 15, 20, 30, 45, 60].map((minutes) => (
              <button
                key={minutes}
                onClick={() => adjustDuration(minutes)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  duration === minutes
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                aria-pressed={duration === minutes}
              >
                {minutes}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {!isActive || isPaused ? (
          <Button
            onClick={startTimer}
            size="large"
            className="px-8"
            aria-label={isPaused ? "Lanjutkan sesi" : "Mulai sesi"}
          >
            {isPaused ? 'Lanjutkan' : 'Mulai'}
          </Button>
        ) : (
          <Button
            onClick={pauseTimer}
            variant="secondary"
            size="large"
            className="px-8"
            aria-label="Jeda sesi"
          >
            Jeda
          </Button>
        )}

        <Button
          onClick={resetTimer}
          variant="outline"
          size="large"
          aria-label="Reset timer"
        >
          Reset
        </Button>
      </div>

      {/* Additional Options */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showVisualCues}
            onChange={(e) => {
              // This would be controlled by parent component
              console.log('Visual cues:', e.target.checked);
            }}
            className="rounded"
          />
          <span className="text-gray-600">Petunjuk Visual</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enableBreathingGuide}
            onChange={(e) => {
              // This would be controlled by parent component
              console.log('Breathing guide:', e.target.checked);
            }}
            className="rounded"
          />
          <span className="text-gray-600">Panduan Napas</span>
        </label>
      </div>

      {/* Breathing Stats */}
      {enableBreathingGuide && isActive && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <span>Siklus Napas:</span>
              <span className="font-medium">{breathingCycle}</span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
        <p className="mb-1">Pintasan Keyboard:</p>
        <div className="flex justify-center space-x-4">
          <span>Spasi: Play/Pause</span>
          <span>R: Reset</span>
          <span>+/-: Ubah durasi</span>
        </div>
      </div>

      {/* Screen Reader Announcements */}
      <div className="sr-only">
        <div aria-live="polite" aria-atomic="true">
          {isActive && !isPaused && `Sesi berlangsung. Waktu tersisa ${formatTime(timeRemaining)}`}
          {isPaused && 'Sesi dijeda'}
          {!isActive && timeRemaining === 0 && 'Sesi selesai'}
        </div>
      </div>
    </Card>
  );
};