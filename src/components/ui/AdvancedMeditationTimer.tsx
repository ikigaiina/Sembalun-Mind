import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Volume2, VolumeX, Clock, Bell } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface TimerPhase {
  id: string;
  name: string;
  duration: number; // in seconds
  color: string;
  sound?: string;
  instruction?: string;
}

interface AdvancedMeditationTimerProps {
  phases: TimerPhase[];
  onComplete: () => void;
  onPhaseChange?: (phase: TimerPhase, phaseIndex: number) => void;
  autoStart?: boolean;
  showInstructions?: boolean;
  enableSounds?: boolean;
}

export const AdvancedMeditationTimer: React.FC<AdvancedMeditationTimerProps> = ({
  phases,
  onComplete,
  onPhaseChange,
  autoStart = false,
  showInstructions = true,
  enableSounds = true
}) => {
  const [isRunning, setIsRunning] = useState(autoStart);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(phases[0]?.duration || 0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentPhase = phases[currentPhaseIndex];
  const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
  const overallProgress = (totalElapsed / totalDuration) * 100;
  const phaseProgress = currentPhase ? ((currentPhase.duration - timeRemaining) / currentPhase.duration) * 100 : 0;

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play notification sound
  const playSound = useCallback((soundType: 'start' | 'phase' | 'complete' | 'pause') => {
    if (!enableSounds || isMuted || !audioRef.current) return;

    // You would need to add actual sound files to your public/sounds directory
    const soundUrls = {
      start: '/sounds/meditation-start.mp3',
      phase: '/sounds/meditation-phase.mp3',
      complete: '/sounds/meditation-complete.mp3',
      pause: '/sounds/meditation-pause.mp3'
    };

    audioRef.current.src = soundUrls[soundType];
    audioRef.current.play().catch(console.error);
  }, [enableSounds, isMuted]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Phase completed
            const nextPhaseIndex = currentPhaseIndex + 1;
            
            if (nextPhaseIndex < phases.length) {
              // Move to next phase
              setCurrentPhaseIndex(nextPhaseIndex);
              setShowPhaseTransition(true);
              
              setTimeout(() => setShowPhaseTransition(false), 2000);
              
              const nextPhase = phases[nextPhaseIndex];
              playSound('phase');
              
              if (onPhaseChange) {
                onPhaseChange(nextPhase, nextPhaseIndex);
              }
              
              return nextPhase.duration;
            } else {
              // All phases completed
              setIsRunning(false);
              playSound('complete');
              onComplete();
              return 0;
            }
          }
          return prev - 1;
        });
        
        setTotalElapsed(prev => prev + 1);
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
      }
    };
  }, [isRunning, timeRemaining, currentPhaseIndex, phases, onComplete, onPhaseChange, playSound]);

  const handlePlayPause = () => {
    if (isRunning) {
      playSound('pause');
    } else {
      playSound('start');
    }
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setTimeRemaining(phases[0]?.duration || 0);
    setTotalElapsed(0);
    playSound('pause');
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setTimeRemaining(phases[0]?.duration || 0);
    setTotalElapsed(0);
  };

  const handleSkipPhase = () => {
    if (currentPhaseIndex < phases.length - 1) {
      const nextPhaseIndex = currentPhaseIndex + 1;
      setCurrentPhaseIndex(nextPhaseIndex);
      setTimeRemaining(phases[nextPhaseIndex].duration);
      playSound('phase');
      
      if (onPhaseChange) {
        onPhaseChange(phases[nextPhaseIndex], nextPhaseIndex);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentPhase) {
    return (
      <Card>
        <div className="text-center p-8">
          <p className="text-gray-600 font-body">No meditation phases configured</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Phase Transition Overlay */}
      {showPhaseTransition && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <Card className="max-w-sm mx-4">
            <div className="text-center p-6">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${currentPhase.color}20` }}
              >
                <Bell className="w-8 h-8" style={{ color: currentPhase.color }} />
              </div>
              <h3 className="text-lg font-heading text-gray-900 mb-2">
                {currentPhase.name}
              </h3>
              <p className="text-gray-600 font-body text-sm">
                {formatTime(currentPhase.duration)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Main Timer Display */}
      <Card>
        <div className="text-center p-6">
          {/* Phase Indicator */}
          <div className="mb-6">
            <div className="flex justify-center space-x-2 mb-4">
              {phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300
                    ${index === currentPhaseIndex 
                      ? 'transform scale-125' 
                      : index < currentPhaseIndex 
                        ? 'opacity-60' 
                        : 'opacity-30'
                    }
                  `}
                  style={{ 
                    backgroundColor: index <= currentPhaseIndex ? phase.color : '#d1d5db'
                  }}
                />
              ))}
            </div>
            <h2 
              className="text-xl font-heading mb-2"
              style={{ color: currentPhase.color }}
            >
              {currentPhase.name}
            </h2>
            <p className="text-gray-600 font-body text-sm">
              Phase {currentPhaseIndex + 1} of {phases.length}
            </p>
          </div>

          {/* Timer Display */}
          <div className="mb-6">
            <div 
              className="text-6xl font-mono font-bold mb-2"
              style={{ color: currentPhase.color }}
            >
              {formatTime(timeRemaining)}
            </div>
            <p className="text-gray-600 font-body text-sm">
              {formatTime(totalElapsed)} elapsed • {formatTime(totalDuration - totalElapsed)} remaining
            </p>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3 mb-6">
            {/* Phase Progress */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Phase Progress</span>
                <span>{Math.round(phaseProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${phaseProgress}%`,
                    backgroundColor: currentPhase.color
                  }}
                />
              </div>
            </div>

            {/* Overall Progress */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          {showInstructions && currentPhase.instruction && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 font-body text-sm leading-relaxed">
                {currentPhase.instruction}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-3">
            <Button
              onClick={handlePlayPause}
              variant="meditation"
              size="lg"
              className="px-8"
            >
              {isRunning ? (
                <Pause className="w-5 h-5 mr-2" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              {isRunning ? 'Pause' : 'Start'}
            </Button>

            <Button
              onClick={handleStop}
              variant="control"
              size="lg"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>

            <Button
              onClick={handleReset}
              variant="control"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex justify-center space-x-4 mt-4">
            {currentPhaseIndex < phases.length - 1 && (
              <Button
                onClick={handleSkipPhase}
                variant="control"
                size="sm"
              >
                Skip Phase
              </Button>
            )}

            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="control"
              size="sm"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 mr-1" />
              ) : (
                <Volume2 className="w-4 h-4 mr-1" />
              )}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Phase Overview */}
      <Card>
        <div className="p-4">
          <h3 className="font-heading text-gray-900 mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Session Overview
          </h3>
          <div className="space-y-2">
            {phases.map((phase, index) => (
              <div
                key={phase.id}
                className={`
                  flex items-center justify-between p-2 rounded-lg transition-all duration-200
                  ${index === currentPhaseIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: phase.color }}
                  />
                  <span className={`font-body text-sm ${index === currentPhaseIndex ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {phase.name}
                  </span>
                </div>
                <span className="text-gray-500 font-body text-xs">
                  {formatTime(phase.duration)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-4 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-body text-sm text-gray-900">Total Duration</span>
              <span className="font-body text-sm font-medium text-gray-900">
                {formatTime(totalDuration)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};