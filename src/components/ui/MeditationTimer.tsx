import { useState, useEffect, useRef } from 'react';
import { Button } from './Button';

interface MeditationTimerProps {
  duration: number; // in seconds
  isActive: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onComplete: () => void;
}

export const MeditationTimer: React.FC<MeditationTimerProps> = ({
  duration,
  isActive,
  isPaused,
  onPlay,
  onPause,
  onStop,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef<number | null>(null);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            onComplete();
            return 0;
          }
          return prevTime - 1;
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
  }, [isActive, isPaused, timeLeft, onComplete]);

  // Calculate progress
  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
  const circumference = 2 * Math.PI * 120; // radius = 120
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Breathing animation scale based on timer state
  const getBreathingScale = () => {
    if (!isActive || isPaused) return 'scale(1)';
    return 'scale(1.05)';
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Circular Progress Timer */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Background circle */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 250 250"
        >
          <circle
            cx="125"
            cy="125"
            r="120"
            stroke="rgba(107, 114, 128, 0.1)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="125"
            cy="125"
            r="120"
            stroke="var(--color-primary)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Breathing animation circle */}
        <div
          className="absolute inset-4 rounded-full transition-all duration-4000 ease-in-out"
          style={{
            background: `radial-gradient(circle, 
              rgba(106, 143, 111, 0.1) 0%, 
              rgba(169, 193, 217, 0.05) 50%, 
              transparent 100%)`,
            transform: getBreathingScale(),
            animation: isActive && !isPaused ? 'breathe 4s ease-in-out infinite' : 'none'
          }}
        />

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Time display */}
          <div 
            className="text-6xl font-heading mb-2"
            style={{ color: 'var(--color-primary)' }}
          >
            {formatTime(timeLeft)}
          </div>
          
          {/* Session type */}
          <p className="text-gray-600 font-body text-sm">
            {isActive ? (isPaused ? 'Dijeda' : 'Dalam Sesi') : 'Siap Memulai'}
          </p>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-center space-x-4">
        {!isActive ? (
          <Button
            onClick={onPlay}
            size="large"
            className="px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center space-x-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Mulai</span>
            </div>
          </Button>
        ) : (
          <div className="flex items-center space-x-3">
            <Button
              onClick={isPaused ? onPlay : onPause}
              variant="outline"
              size="medium"
              className="px-6 py-3 rounded-full"
            >
              {isPaused ? (
                <div className="flex items-center space-x-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>Lanjut</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                  </svg>
                  <span>Jeda</span>
                </div>
              )}
            </Button>
            
            <Button
              onClick={onStop}
              variant="outline"
              size="medium" 
              className="px-6 py-3 rounded-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <div className="flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12"/>
                </svg>
                <span>Berhenti</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};