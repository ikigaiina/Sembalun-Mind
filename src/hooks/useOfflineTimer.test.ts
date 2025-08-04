import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineTimer } from './useOfflineTimer';

describe('useOfflineTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('initializes with correct default values', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      expect(result.current.timeLeft).toBe(60);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.progress).toBe(0);
    });

    it('calculates progress correctly', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 100, onComplete })
      );

      expect(result.current.progress).toBe(0);

      // Start timer and advance time
      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(25000); // 25 seconds
      });

      expect(result.current.progress).toBeCloseTo(25, 0);
    });

    it('handles zero duration gracefully', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 0, onComplete })
      );

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.progress).toBe(0);
    });
  });

  describe('Timer Controls', () => {
    it('starts timer correctly', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      act(() => {
        result.current.start();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it('pauses timer correctly', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.isPaused).toBe(true);
    });

    it('resumes timer correctly', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.pause();
      });

      act(() => {
        result.current.resume();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it('stops timer correctly', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.timeLeft).toBe(60); // Reset to original duration
    });

    it('resets timer correctly', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(30000); // 30 seconds
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.timeLeft).toBe(60);
    });
  });

  describe('Timer Progression', () => {
    it('counts down correctly', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(10000); // 10 seconds
      });

      expect(result.current.timeLeft).toBe(50);
      expect(result.current.progress).toBeCloseTo(16.67, 1);
    });

    it('maintains accuracy with frequent updates', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 10, onComplete })
      );

      act(() => {
        result.current.start();
      });

      // Advance in small increments
      for (let i = 0; i < 50; i++) {
        act(() => {
          vi.advanceTimersByTime(100); // 0.1 seconds each
        });
      }

      expect(result.current.timeLeft).toBe(5); // 10 - 5 = 5 seconds left
    });

    it('calls onComplete when timer reaches zero', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 5, onComplete })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000); // 5 seconds
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(result.current.isActive).toBe(false);
      expect(result.current.timeLeft).toBe(0);
    });

    it('stops at zero and does not go negative', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 5, onComplete })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(10000); // 10 seconds (more than duration)
      });

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.progress).toBe(100);
    });
  });

  describe('Pause and Resume Logic', () => {
    it('maintains correct time when paused and resumed', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      act(() => {
        result.current.start();
      });

      // Run for 20 seconds
      act(() => {
        vi.advanceTimersByTime(20000);
      });

      expect(result.current.timeLeft).toBe(40);

      // Pause
      act(() => {
        result.current.pause();
      });

      // Wait 10 seconds while paused (should not affect timer)
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.timeLeft).toBe(40); // Should remain the same

      // Resume
      act(() => {
        result.current.resume();
      });

      // Run for another 15 seconds
      act(() => {
        vi.advanceTimersByTime(15000);
      });

      expect(result.current.timeLeft).toBe(25); // 40 - 15 = 25
    });

    it('handles multiple pause/resume cycles correctly', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 100, onComplete })
      );

      act(() => {
        result.current.start();
      });

      // First cycle: run 10s, pause, wait 5s, resume
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(result.current.timeLeft).toBe(90);

      act(() => {
        result.current.pause();
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.timeLeft).toBe(90);

      act(() => {
        result.current.resume();
      });

      // Second cycle: run 20s, pause, wait 10s, resume
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      expect(result.current.timeLeft).toBe(70);

      act(() => {
        result.current.pause();
      });
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(result.current.timeLeft).toBe(70);

      act(() => {
        result.current.resume();
      });

      // Final run
      act(() => {
        vi.advanceTimersByTime(30000);
      });
      expect(result.current.timeLeft).toBe(40);
    });

    it('does not pause when timer is not active', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      // Try to pause without starting
      act(() => {
        result.current.pause();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });

    it('does not resume when timer is not paused', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      act(() => {
        result.current.start();
      });

      // Try to resume when not paused
      act(() => {
        result.current.resume();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('Duration Changes', () => {
    it('resets timer when duration changes', () => {
      const onComplete = vi.fn();
      const { result, rerender } = renderHook(
        ({ duration }) => useOfflineTimer({ duration, onComplete }),
        { initialProps: { duration: 60 } }
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(30000); // 30 seconds
      });

      expect(result.current.timeLeft).toBe(30);

      // Change duration
      rerender({ duration: 120 });

      expect(result.current.timeLeft).toBe(120);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });

    it('handles dynamic duration updates correctly', () => {
      const onComplete = vi.fn();
      const { result, rerender } = renderHook(
        ({ duration }) => useOfflineTimer({ duration, onComplete }),
        { initialProps: { duration: 30 } }
      );

      expect(result.current.timeLeft).toBe(30);

      rerender({ duration: 60 });
      expect(result.current.timeLeft).toBe(60);

      rerender({ duration: 10 });
      expect(result.current.timeLeft).toBe(10);
    });
  });

  describe('Cleanup and Memory Management', () => {
    it('cleans up intervals on unmount', () => {
      const onComplete = vi.fn();
      const { result, unmount } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      act(() => {
        result.current.start();
      });

      // Unmount the hook
      unmount();

      // Advance time - should not cause errors
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      // onComplete should not be called after unmount
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('cleans up intervals when stopped', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
      });

      // Should not continue running after stop
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.timeLeft).toBe(60); // Should remain at reset value
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('handles rapid start/stop cycles without memory leaks', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      // Rapid start/stop cycles
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.start();
        });
        act(() => {
          result.current.stop();
        });
      }

      expect(result.current.isActive).toBe(false);
      expect(result.current.timeLeft).toBe(60);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles very small durations', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 0.1, onComplete })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(100); // 0.1 seconds
      });

      expect(onComplete).toHaveBeenCalled();
    });

    it('handles very large durations', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 86400, onComplete }) // 24 hours
      );

      expect(result.current.timeLeft).toBe(86400);
      expect(result.current.progress).toBe(0);

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3600000); // 1 hour
      });

      expect(result.current.timeLeft).toBe(82800); // 23 hours left
      expect(result.current.progress).toBeCloseTo(4.17, 1); // ~4.17%
    });

    it('handles onComplete callback changes', () => {
      const onComplete1 = vi.fn();
      const onComplete2 = vi.fn();
      
      const { result, rerender } = renderHook(
        ({ onComplete }) => useOfflineTimer({ duration: 5, onComplete }),
        { initialProps: { onComplete: onComplete1 } }
      );

      act(() => {
        result.current.start();
      });

      // Change callback before completion
      rerender({ onComplete: onComplete2 });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onComplete1).not.toHaveBeenCalled();
      expect(onComplete2).toHaveBeenCalledTimes(1);
    });

    it('maintains stable function references', () => {
      const onComplete = vi.fn();
      const { result, rerender } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      const firstStart = result.current.start;
      const firstPause = result.current.pause;
      const firstResume = result.current.resume;
      const firstStop = result.current.stop;
      const firstReset = result.current.reset;

      rerender();

      expect(result.current.start).toBe(firstStart);
      expect(result.current.pause).toBe(firstPause);
      expect(result.current.resume).toBe(firstResume);
      expect(result.current.stop).toBe(firstStop);
      expect(result.current.reset).toBe(firstReset);
    });
  });

  describe('Performance and Optimization', () => {
    it('updates at correct intervals', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 10, onComplete })
      );

      act(() => {
        result.current.start();
      });

      // Should update every 100ms (0.1 seconds)
      let previousTimeLeft = result.current.timeLeft;
      
      for (let i = 0; i < 50; i++) { // 5 seconds total
        act(() => {
          vi.advanceTimersByTime(100);
        });
        
        if (result.current.timeLeft !== previousTimeLeft) {
          expect(result.current.timeLeft).toBeLessThan(previousTimeLeft);
          previousTimeLeft = result.current.timeLeft;
        }
      }

      expect(result.current.timeLeft).toBe(5);
    });

    it('handles system time changes gracefully', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => 
        useOfflineTimer({ duration: 60, onComplete })
      );

      // Mock Date.now to simulate time jumps
      const originalDateNow = Date.now;
      let mockTime = 1000000;
      
      vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

      act(() => {
        result.current.start();
      });

      // Simulate normal progression
      mockTime += 10000; // 10 seconds
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.timeLeft).toBe(50);

      // Simulate system time jump (e.g., computer sleep/wake)
      mockTime += 30000; // Jump 30 seconds
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.timeLeft).toBe(20); // Should handle the jump correctly

      Date.now = originalDateNow;
    });
  });
});