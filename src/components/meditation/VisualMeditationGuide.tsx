import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Circle, Waves, Mountain, Sun, Moon } from 'lucide-react';

interface VisualMeditationGuideProps {
  type: 'breathing' | 'mindfulness' | 'loving-kindness' | 'body-scan';
  duration: number;
  isActive: boolean;
  onComplete?: () => void;
}

export const VisualMeditationGuide: React.FC<VisualMeditationGuideProps> = ({
  type,
  duration,
  isActive,
  onComplete
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  
  // Visual guidance phases based on meditation type
  const getVisualPhases = () => {
    switch (type) {
      case 'breathing':
        return [
          { text: 'Duduklah dengan nyaman dan rileks', icon: Mountain, duration: 30 },
          { text: 'Rasakan napas alami Anda', icon: Waves, duration: 60 },
          { text: 'Ikuti ritme pernapasan yang tenang', icon: Circle, duration: 180 },
          { text: 'Biarkan pikiran mengalir seperti air', icon: Waves, duration: duration * 60 - 270 },
          { text: 'Nikmati ketenangan yang Anda ciptakan', icon: Sparkles, duration: 30 }
        ];
      case 'mindfulness':
        return [
          { text: 'Hadirkan diri Anda sepenuhnya', icon: Sun, duration: 45 },
          { text: 'Amati pikiran tanpa menghakimi', icon: Circle, duration: 120 },
          { text: 'Rasakan momen ini dengan penuh kesadaran', icon: Sparkles, duration: duration * 60 - 195 },
          { text: 'Terima semua yang muncul dalam pikiran', icon: Mountain, duration: 30 }
        ];
      case 'loving-kindness':
        return [
          { text: 'Mulai dengan mencintai diri sendiri', icon: Sun, duration: 60 },
          { text: 'Kirimkan cinta untuk orang terkasih', icon: Sparkles, duration: 120 },
          { text: 'Perluas cinta untuk semua makhluk', icon: Circle, duration: duration * 60 - 210 },
          { text: 'Rasakan kehangatan cinta universal', icon: Sun, duration: 30 }
        ];
      case 'body-scan':
        return [
          { text: 'Mulai dari puncak kepala', icon: Circle, duration: 60 },
          { text: 'Rasakan setiap bagian tubuh dengan lembut', icon: Waves, duration: 180 },
          { text: 'Lepaskan ketegangan yang Anda temukan', icon: Mountain, duration: duration * 60 - 270 },
          { text: 'Rasakan tubuh yang rileks sepenuhnya', icon: Moon, duration: 30 }
        ];
      default:
        return [{ text: 'Nikmati momen ketenangan ini', icon: Sparkles, duration: duration * 60 }];
    }
  };

  const phases = getVisualPhases();

  useEffect(() => {
    if (!isActive) return;

    let phaseTimer = 0;
    let currentPhaseIndex = 0;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });

      phaseTimer += 1;
      
      if (phaseTimer >= phases[currentPhaseIndex]?.duration && currentPhaseIndex < phases.length - 1) {
        currentPhaseIndex++;
        setCurrentPhase(currentPhaseIndex);
        phaseTimer = 0;
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phases, onComplete]);

  const getCurrentPhase = () => phases[currentPhase] || phases[0];
  const currentPhaseData = getCurrentPhase();

  if (!isActive) return null;

  return (
    <div className="text-center space-y-12">
      {/* Visual Breathing Indicator */}
      <motion.div
        animate={{
          scale: type === 'breathing' ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: type === 'breathing' ? 4 : 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-32 h-32 mx-auto"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-meditation-zen-200 to-meditation-calm-200 flex items-center justify-center shadow-2xl">
          <currentPhaseData.icon className="w-16 h-16 text-meditation-zen-600" />
        </div>
      </motion.div>

      {/* Phase Guidance */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h3 className="text-2xl font-heading font-medium text-gray-800 max-w-2xl mx-auto leading-relaxed">
            {currentPhaseData.text}
          </h3>
          
          {/* Visual Progress */}
          <div className="max-w-md mx-auto">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-meditation-zen-400 to-meditation-calm-400"
                animate={{
                  width: `${((duration * 60 - timeRemaining) / (duration * 60)) * 100}%`
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Phase {currentPhase + 1} of {phases.length}</span>
              <span>{Math.ceil(timeRemaining / 60)} min remaining</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Ambient Visual Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-meditation-zen-300 rounded-full opacity-30"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 2
            }}
          />
        ))}
      </div>
    </div>
  );
};