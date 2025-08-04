import { useState, useEffect, useRef, useCallback } from 'react';

interface UseOfflineTimerProps {
  duration: number;
  onComplete: () => void;
}

interface UseOfflineTimerReturn {
  timeLeft: number;
  isActive: boolean;
  isPaused: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

export const useOfflineTimer = ({ 
  duration, 
  onComplete 
}: UseOfflineTimerProps): UseOfflineTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Calculate progress
  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration);
    setIsActive(false);
    setIsPaused(false);
    pausedTimeRef.current = 0;
  }, [duration]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Main timer logic - works offline
  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - (duration - timeLeft) * 1000;
      }

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - (startTimeRef.current || now) - pausedTimeRef.current) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          setIsActive(false);
          setIsPaused(false);
          onComplete();
        }
      }, 100); // Update more frequently for smoother animation
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
  }, [isActive, isPaused, timeLeft, duration, onComplete]);

  const start = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    startTimeRef.current = Date.now() - (duration - timeLeft) * 1000;
    pausedTimeRef.current = 0;
  }, [duration, timeLeft]);

  const pause = useCallback(() => {
    if (isActive && !isPaused) {
      setIsPaused(true);
      const now = Date.now();
      if (startTimeRef.current) {
        pausedTimeRef.current += now - startTimeRef.current - (duration - timeLeft) * 1000;
      }
    }
  }, [isActive, isPaused, duration, timeLeft]);

  const resume = useCallback(() => {
    if (isActive && isPaused) {
      setIsPaused(false);
      startTimeRef.current = Date.now() - (duration - timeLeft) * 1000;
    }
  }, [isActive, isPaused, duration, timeLeft]);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(duration);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [duration]);

  const reset = useCallback(() => {
    stop();
  }, [stop]);

  return {
    timeLeft,
    isActive,
    isPaused,
    progress,
    start,
    pause,
    resume,
    stop,
    reset
  };
};