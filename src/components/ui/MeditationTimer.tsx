import { useCallback, useEffect, useRef, memo } from 'react';
import { Button } from './Button';
import { useOfflineTimer } from '../../hooks/useOfflineTimer';
import { useOffline } from '../../hooks/useOfflineContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { usePerformanceTracking, useAnimationOptimization } from '../../hooks/usePerformanceOptimization';

interface MeditationTimerProps {
  duration: number; // in seconds
  onComplete: () => void;
}

export const MeditationTimer: React.FC<MeditationTimerProps> = memo(({
  duration,
  onComplete
}) => {
  const { isOnline } = useOffline();
  const { announce, settings } = useAccessibility();
  const lastAnnouncedMinute = useRef<number>(-1);
  
  // Performance monitoring
  const { trackRender } = usePerformanceTracking('MeditationTimer');
  const { isReducedMotion, getAnimationDuration } = useAnimationOptimization();
  
  // Track render performance
  useEffect(() => {
    trackRender();
  });
  
  const handleComplete = useCallback(() => {
    announce('Sesi meditasi selesai. Terima kasih telah berlatih.', 'assertive');
    onComplete();
  }, [onComplete, announce]);

  const {
    timeLeft,
    isActive,
    isPaused,
    progress,
    start,
    pause,
    resume,
    stop
  } = useOfflineTimer({
    duration,
    onComplete: handleComplete
  });

  // Announce progress for screen readers
  useEffect(() => {
    if (!isActive || !settings.screenReader) return;

    const minutes = Math.floor(timeLeft / 60);
    const shouldAnnounce = minutes !== lastAnnouncedMinute.current && minutes > 0 && timeLeft % 60 === 0;

    if (shouldAnnounce) {
      lastAnnouncedMinute.current = minutes;
      announce(`${minutes} menit tersisa`, 'polite');
    }
  }, [timeLeft, isActive, settings.screenReader, announce]);

  // Handle meditation state changes with announcements
  const handleStart = useCallback(() => {
    announce('Memulai sesi meditasi. Duduklah dengan nyaman dan fokus pada pernapasan.', 'assertive');
    start();
  }, [start, announce]);

  const handlePause = useCallback(() => {
    announce('Sesi dijeda. Ambil waktu sejenak.', 'polite');
    pause();
  }, [pause, announce]);

  const handleResume = useCallback(() => {
    announce('Melanjutkan sesi meditasi.', 'polite');
    resume();
  }, [resume, announce]);

  const handleStop = useCallback(() => {
    announce('Sesi meditasi dihentikan.', 'polite');
    stop();
  }, [stop, announce]);

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
      {/* Skip to content for screen readers */}
      <a href="#meditation-controls" className="sr-only focus:not-sr-only skip-link">
        Lewati ke kontrol meditasi
      </a>

      {/* Circular Progress Timer */}
      <div 
        className="relative w-80 h-80 flex items-center justify-center"
        role="timer"
        aria-label={`Timer meditasi, ${formatTime(timeLeft)} tersisa`}
        aria-live="polite"
        aria-atomic="false"
      >
        {/* Background circle */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 250 250"
          aria-hidden="true"
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
            className={`transition-all ease-out`}
            style={{
              transitionDuration: `${getAnimationDuration(1000)}ms`
            }}
          />
        </svg>

        {/* Breathing animation circle */}
        {!isReducedMotion && !settings.reducedMotion && (
          <div
            className="absolute inset-4 rounded-full transition-all ease-in-out"
            style={{
              background: `radial-gradient(circle, 
                rgba(106, 143, 111, 0.1) 0%, 
                rgba(169, 193, 217, 0.05) 50%, 
                transparent 100%)`,
              transform: getBreathingScale(),
              transitionDuration: `${getAnimationDuration(4000)}ms`,
              animation: isActive && !isPaused ? `breathe ${getAnimationDuration(4000)}ms ease-in-out infinite` : 'none'
            }}
            aria-hidden="true"
          />
        )}

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
          
          {/* Offline indicator */}
          {!isOnline && (
            <div className="flex items-center space-x-1 mt-1">
              <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-orange-600">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Control buttons */}
      <div id="meditation-controls" className="flex items-center justify-center space-x-4" role="group" aria-label="Kontrol meditasi">
        {!isActive ? (
          <Button
            onClick={handleStart}
            size="large"
            className="px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:ring-accessible"
            aria-label="Mulai sesi meditasi"
          >
            <div className="flex items-center space-x-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Mulai</span>
            </div>
          </Button>
        ) : (
          <div className="flex items-center space-x-3">
            <Button
              onClick={isPaused ? handleResume : handlePause}
              variant="outline"
              size="medium"
              className="px-6 py-3 rounded-full focus:ring-accessible"
              aria-label={isPaused ? 'Lanjutkan sesi meditasi' : 'Jeda sesi meditasi'}
            >
              {isPaused ? (
                <div className="flex items-center space-x-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>Lanjut</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                  </svg>
                  <span>Jeda</span>
                </div>
              )}
            </Button>
            
            <Button
              onClick={handleStop}
              variant="outline"
              size="medium" 
              className="px-6 py-3 rounded-full text-red-600 border-red-200 hover:bg-red-50 focus:ring-accessible"
              aria-label="Hentikan sesi meditasi"
            >
              <div className="flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
});