import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight,
  Clock, Heart, BookOpen, Wind, CheckCircle, Star,
  Volume2, VolumeX, Settings, Maximize, Minimize
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useOfflineMode } from '../../hooks/useOfflineMode';
import { useMoodTracker } from '../../hooks/useMoodTracker';
import { MoodSelector } from '../ui/MoodSelector';
import type { MoodType } from '../../types/mood';

interface Props {
  sessionId: string;
  onComplete?: (data: any) => void;
  onClose?: () => void;
  className?: string;
}

interface BreathingPattern {
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
}

export const OfflineSessionPlayer: React.FC<Props> = ({
  sessionId,
  onComplete,
  onClose,
  className = ''
}) => {
  const { startOfflineSession, completeOfflineSession } = useOfflineMode();
  const { saveMoodEntry } = useMoodTracker();
  
  const [session, setSession] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionMood, setCompletionMood] = useState<MoodType>('neutral');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Load session data
  useEffect(() => {
    try {
      const sessionData = startOfflineSession(sessionId);
      setSession(sessionData);
      setTimeRemaining(sessionData.steps[0]?.duration * 60 || 0);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }, [sessionId, startOfflineSession]);

  // Timer management
  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Move to next step
            nextStep();
            return 0;
          }
          return prev - 1;
        });
        setTotalElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, timeRemaining]);

  // Breathing pattern management
  useEffect(() => {
    const currentStep = session?.steps[currentStepIndex];
    if (!currentStep || currentStep.type !== 'breathing' || !isPlaying) {
      if (breathingTimerRef.current) {
        clearInterval(breathingTimerRef.current);
        breathingTimerRef.current = null;
      }
      return;
    }

    const pattern = currentStep.breathingPattern;
    if (!pattern) return;

    const runBreathingCycle = () => {
      const phases = [
        { phase: 'inhale', duration: pattern.inhale },
        { phase: 'hold', duration: pattern.hold },
        { phase: 'exhale', duration: pattern.exhale },
        { phase: 'pause', duration: pattern.pause }
      ];

      let phaseIndex = 0;
      let phaseDuration = phases[phaseIndex].duration;
      let phaseElapsed = 0;

      setBreathingPhase(phases[phaseIndex].phase as any);

      breathingTimerRef.current = setInterval(() => {
        phaseElapsed++;
        
        if (phaseElapsed >= phaseDuration) {
          phaseIndex = (phaseIndex + 1) % phases.length;
          if (phaseIndex === 0) {
            setBreathingCount(prev => prev + 1);
          }
          setBreathingPhase(phases[phaseIndex].phase as any);
          phaseDuration = phases[phaseIndex].duration;
          phaseElapsed = 0;
        }
      }, 1000);
    };

    runBreathingCycle();

    return () => {
      if (breathingTimerRef.current) {
        clearInterval(breathingTimerRef.current);
        breathingTimerRef.current = null;
      }
    };
  }, [session, currentStepIndex, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < session.steps.length) {
      setCurrentStepIndex(nextIndex);
      setTimeRemaining(session.steps[nextIndex].duration * 60);
      setBreathingCount(0);
    } else {
      // Session completed
      setIsPlaying(false);
      setShowCompletion(true);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setTimeRemaining(session.steps[prevIndex].duration * 60);
      setBreathingCount(0);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSession = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setTimeRemaining(session.steps[0]?.duration * 60 || 0);
    setTotalElapsed(0);
    setBreathingCount(0);
    startTimeRef.current = Date.now();
  };

  const handleComplete = async () => {
    const actualDuration = Math.round((Date.now() - startTimeRef.current) / 60000);
    
    const completionData = {
      actualDuration,
      mood: completionMood,
      notes: sessionNotes,
      rating: sessionRating
    };

    try {
      await completeOfflineSession(sessionId, completionData);
      onComplete?.(completionData);
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  const currentStep = session.steps[currentStepIndex];
  const progress = ((currentStepIndex + (1 - timeRemaining / (currentStep?.duration * 60 || 1))) / session.steps.length) * 100;

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Tarik napas perlahan';
      case 'hold': return 'Tahan napas';
      case 'exhale': return 'Hembuskan napas';
      case 'pause': return 'Jeda sejenak';
      default: return 'Bernapas dengan tenang';
    }
  };

  const getBreathingCircleScale = () => {
    const pattern = currentStep?.breathingPattern;
    if (!pattern) return 1;
    
    switch (breathingPhase) {
      case 'inhale': return 1.3;
      case 'hold': return 1.3;
      case 'exhale': return 0.8;
      case 'pause': return 0.8;
      default: return 1;
    }
  };

  if (showCompletion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}
      >
        <Card className="p-8 max-w-lg mx-auto">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>

            <div>
              <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-2">
                Sesi Selesai!
              </h2>
              <p className="text-gray-600">
                Bagus! Anda telah menyelesaikan sesi "{session.title}"
              </p>
            </div>

            {/* Mood Selection */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Bagaimana perasaan Anda sekarang?</h3>
              <MoodSelector
                selectedMood={completionMood}
                onMoodSelect={setCompletionMood}
                size="medium"
                showLabels={true}
              />
            </div>

            {/* Rating */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Berikan rating untuk sesi ini:</h3>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setSessionRating(rating)}
                    className={`p-1 transition-colors ${
                      rating <= sessionRating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Catatan (opsional):</h3>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Bagikan pengalaman Anda..."
                className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={resetSession}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Ulangi Sesi
              </Button>
              <Button
                variant="primary"
                onClick={handleComplete}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Selesai
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''} ${className}`}>
      <Card className={`${isFullscreen ? 'h-full rounded-none' : ''} p-6`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-heading font-semibold text-gray-800">
              {session.title}
            </h2>
            <p className="text-sm text-gray-600">{session.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-gray-600"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-600"
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Langkah {currentStepIndex + 1} dari {session.steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              currentStep.type === 'breathing' ? 'bg-blue-100 text-blue-600' :
              currentStep.type === 'wisdom' ? 'bg-amber-100 text-amber-600' :
              currentStep.type === 'reflection' ? 'bg-purple-100 text-purple-600' :
              'bg-green-100 text-green-600'
            }`}>
              {currentStep.type === 'breathing' ? <Wind className="w-8 h-8" /> :
               currentStep.type === 'wisdom' ? <BookOpen className="w-8 h-8" /> :
               currentStep.type === 'reflection' ? <Heart className="w-8 h-8" /> :
               <Clock className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-heading font-semibold text-gray-800 mb-2">
              {currentStep.title}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              {currentStep.content}
            </p>
          </div>

          {/* Breathing Visualization */}
          {currentStep.type === 'breathing' && (
            <div className="my-8">
              <motion.div
                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-medium"
                animate={{ 
                  scale: getBreathingCircleScale(),
                  opacity: breathingPhase === 'pause' ? 0.7 : 1
                }}
                transition={{ 
                  duration: breathingPhase === 'inhale' ? currentStep.breathingPattern?.inhale || 4 :
                           breathingPhase === 'hold' ? 0.5 :
                           breathingPhase === 'exhale' ? currentStep.breathingPattern?.exhale || 4 :
                           currentStep.breathingPattern?.pause || 2,
                  ease: "easeInOut"
                }}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {getBreathingInstruction()}
                  </div>
                  <div className="text-sm opacity-80">
                    Siklus: {breathingCount}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Wisdom Quote */}
          {currentStep.type === 'wisdom' && currentStep.wisdomQuote && (
            <div className="my-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl max-w-md mx-auto">
              <blockquote className="text-lg italic text-amber-900 mb-3">
                "{currentStep.wisdomQuote.text}"
              </blockquote>
              <cite className="text-amber-700 font-medium">
                — {currentStep.wisdomQuote.author}
              </cite>
            </div>
          )}

          {/* Timer */}
          <div className="text-3xl font-mono font-bold text-gray-800 mb-4">
            {formatTime(timeRemaining)}
          </div>
          
          <p className="text-sm text-gray-600">
            Total waktu berlalu: {formatTime(totalElapsed)}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={previousStep}
            disabled={currentStepIndex === 0}
            className="text-gray-600 disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={togglePlay}
            className="w-16 h-16 rounded-full"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={nextStep}
            disabled={currentStepIndex === session.steps.length - 1}
            className="text-gray-600 disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-center space-x-6 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSession}
            className="text-gray-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </Button>
        </div>
      </Card>
    </div>
  );
};