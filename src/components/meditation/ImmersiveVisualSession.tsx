import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Mountain, Waves, Circle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ImmersiveVisualSessionProps {
  duration: number; // in minutes
  type: 'breathing' | 'mindfulness' | 'loving-kindness' | 'body-scan';
  onComplete: (sessionData: any) => void;
  onPause?: () => void;
}

export const ImmersiveVisualSession: React.FC<ImmersiveVisualSessionProps> = ({
  duration,
  type,
  onComplete,
  onPause
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [currentGuidance, setCurrentGuidance] = useState('');

  // Visual breathing pattern (4-4-4-4 seconds)
  useEffect(() => {
    if (!isActive || isPaused || type !== 'breathing') return;

    const breathingCycle = () => {
      setBreathPhase('inhale');
      setCurrentGuidance('Tarik napas dalam-dalam...');
      
      setTimeout(() => {
        setBreathPhase('hold');
        setCurrentGuidance('Tahan napas sejenak...');
      }, 4000);
      
      setTimeout(() => {
        setBreathPhase('exhale');
        setCurrentGuidance('Hembuskan perlahan...');
      }, 8000);
      
      setTimeout(() => {
        setBreathPhase('pause');
        setCurrentGuidance('Istirahat sejenak...');
      }, 12000);
    };

    breathingCycle();
    const interval = setInterval(breathingCycle, 16000);
    
    return () => clearInterval(interval);
  }, [isActive, isPaused, type]);

  // Main session timer
  useEffect(() => {
    if (!isActive || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsActive(false);
          onComplete({
            duration,
            type,
            completedAt: new Date(),
            completed: true
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, duration, type, onComplete]);

  const getVisualElement = () => {
    const baseSize = type === 'breathing' ? 
      (breathPhase === 'inhale' ? 'w-48 h-48' : 
       breathPhase === 'hold' ? 'w-52 h-52' :
       breathPhase === 'exhale' ? 'w-40 h-40' : 'w-44 h-44') :
      'w-44 h-44';

    switch (type) {
      case 'breathing':
        return (
          <motion.div
            className={`${baseSize} mx-auto rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center shadow-2xl`}
            animate={{
              scale: breathPhase === 'inhale' ? 1.2 : 
                     breathPhase === 'hold' ? 1.3 :
                     breathPhase === 'exhale' ? 0.8 : 1,
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
          >
            <Waves className="w-20 h-20 text-white" />
          </motion.div>
        );
        
      case 'mindfulness':
        return (
          <motion.div
            className={`${baseSize} mx-auto rounded-full bg-gradient-to-br from-purple-200 to-purple-400 flex items-center justify-center shadow-2xl`}
            animate={{
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Circle className="w-20 h-20 text-white" />
          </motion.div>
        );
        
      case 'loving-kindness':
        return (
          <motion.div
            className={`${baseSize} mx-auto rounded-full bg-gradient-to-br from-pink-200 to-red-300 flex items-center justify-center shadow-2xl`}
            animate={{
              scale: [1, 1.2, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-20 h-20 text-white" />
          </motion.div>
        );
        
      case 'body-scan':
        return (
          <motion.div
            className={`${baseSize} mx-auto rounded-full bg-gradient-to-br from-green-200 to-emerald-400 flex items-center justify-center shadow-2xl`}
            animate={{
              scale: [1, 1.05, 1],
              y: [0, -10, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            <Mountain className="w-20 h-20 text-white" />
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGuidanceText = () => {
    if (type === 'breathing') return currentGuidance;
    
    const progressPercent = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;
    
    switch (type) {
      case 'mindfulness':
        if (progressPercent < 25) return 'Biarkan pikiran tenang seperti air yang jernih';
        if (progressPercent < 50) return 'Amati setiap sensasi dengan penuh kesadaran';
        if (progressPercent < 75) return 'Terima semua yang muncul tanpa perlawanan';
        return 'Nikmati kedamaian yang Anda temukan';
        
      case 'loving-kindness':
        if (progressPercent < 25) return 'Kirimkan cinta untuk diri sendiri';
        if (progressPercent < 50) return 'Perluas cinta untuk orang-orang terkasih';
        if (progressPercent < 75) return 'Bagikan cinta untuk semua makhluk';
        return 'Rasakan kehangatan cinta universal';
        
      case 'body-scan':
        if (progressPercent < 25) return 'Mulai dari puncak kepala Anda';
        if (progressPercent < 50) return 'Rasakan bagian tengah tubuh';
        if (progressPercent < 75) return 'Perhatikan kaki dan ujung jari';
        return 'Rasakan tubuh yang sepenuhnya rileks';
        
      default:
        return 'Nikmati momen ketenangan ini';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: type === 'breathing' ? [
            'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%)',
            'linear-gradient(135deg, #bfdbfe 0%, #c7d2fe 50%, #e0e7ff 100%)',
            'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%)',
          ] : type === 'mindfulness' ? [
            'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #ddd6fe 100%)',
            'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 50%, #c4b5fd 100%)',
            'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #ddd6fe 100%)',
          ] : type === 'loving-kindness' ? [
            'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
            'linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 50%, #ec4899 100%)',
            'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
          ] : [
            'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
            'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)',
            'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Session Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        
        {/* Main Visual Element */}
        <div className="mb-12">
          {getVisualElement()}
        </div>

        {/* Guidance Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGuidance}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-heading font-medium text-gray-800 max-w-2xl mx-auto leading-relaxed">
              {getGuidanceText()}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Session Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-6"
        >
          <Button
            variant={isPaused ? "meditation" : "outline"}
            size="lg"
            onClick={() => {
              if (isActive) {
                setIsPaused(!isPaused);
                onPause?.();
              } else {
                setIsActive(true);
                setIsPaused(false);
              }
            }}
            className="px-8"
          >
            {!isActive ? (
              <>
                <Play className="w-5 h-5 mr-2" />
                Mulai
              </>
            ) : isPaused ? (
              <>
                <Play className="w-5 h-5 mr-2" />
                Lanjutkan
              </>
            ) : (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Jeda
              </>
            )}
          </Button>

          {(isActive || isPaused) && (
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-gray-700">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(((duration * 60 - timeRemaining) / (duration * 60)) * 100)}% selesai
              </div>
            </div>
          )}

          {(isActive || isPaused) && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setIsActive(false);
                setIsPaused(false);
                setTimeRemaining(duration * 60);
                setBreathPhase('inhale');
              }}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};