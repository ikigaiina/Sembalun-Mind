import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

// Enhanced breathing visualization with smoother animations
export interface BreathingVisualizationProps {
  isActive: boolean;
  pattern?: {
    inhale: number;
    hold: number;
    exhale: number;
    pause?: number;
  };
  size?: 'small' | 'medium' | 'large';
  theme?: 'ocean' | 'forest' | 'sunset' | 'moonlight';
  showGuides?: boolean;
  showRipples?: boolean;
  onPhaseChange?: (phase: 'inhale' | 'hold' | 'exhale' | 'pause') => void;
}

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  shadow: string;
  glow: string;
}

const themes: Record<string, ThemeConfig> = {
  ocean: {
    primary: 'rgba(59, 130, 246, 0.8)',
    secondary: 'rgba(147, 197, 253, 0.6)',
    accent: 'rgba(219, 234, 254, 0.4)',
    gradient: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(147, 197, 253, 0.2) 50%, rgba(219, 234, 254, 0.1) 100%)',
    shadow: 'rgba(59, 130, 246, 0.3)',
    glow: 'rgba(147, 197, 253, 0.4)'
  },
  forest: {
    primary: 'rgba(34, 197, 94, 0.8)',
    secondary: 'rgba(134, 239, 172, 0.6)',
    accent: 'rgba(187, 247, 208, 0.4)',
    gradient: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, rgba(134, 239, 172, 0.2) 50%, rgba(187, 247, 208, 0.1) 100%)',
    shadow: 'rgba(34, 197, 94, 0.3)',
    glow: 'rgba(134, 239, 172, 0.4)'
  },
  sunset: {
    primary: 'rgba(251, 146, 60, 0.8)',
    secondary: 'rgba(254, 215, 170, 0.6)',
    accent: 'rgba(255, 237, 213, 0.4)',
    gradient: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, rgba(254, 215, 170, 0.2) 50%, rgba(255, 237, 213, 0.1) 100%)',
    shadow: 'rgba(251, 146, 60, 0.3)',
    glow: 'rgba(254, 215, 170, 0.4)'
  },
  moonlight: {
    primary: 'rgba(168, 85, 247, 0.8)',
    secondary: 'rgba(196, 181, 253, 0.6)',
    accent: 'rgba(221, 214, 254, 0.4)',
    gradient: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(196, 181, 253, 0.2) 50%, rgba(221, 214, 254, 0.1) 100%)',
    shadow: 'rgba(168, 85, 247, 0.3)',
    glow: 'rgba(196, 181, 253, 0.4)'
  }
};

const sizeConfig = {
  small: { width: 200, height: 200, breathingScale: { min: 0.7, max: 1.2 } },
  medium: { width: 280, height: 280, breathingScale: { min: 0.6, max: 1.3 } },
  large: { width: 360, height: 360, breathingScale: { min: 0.5, max: 1.4 } }
};

export const BreathingVisualization: React.FC<BreathingVisualizationProps> = ({
  isActive = false,
  pattern = { inhale: 4, hold: 4, exhale: 4, pause: 2 },
  size = 'medium',
  theme = 'ocean',
  showGuides = true,
  showRipples = true,
  onPhaseChange
}) => {
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [cycleProgress, setCycleProgress] = useState(0);
  const breathingControls = useAnimation();
  const rippleControls = useAnimation();
  const guideControls = useAnimation();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTheme = themes[theme];
  const currentSize = sizeConfig[size];

  // Phase animation variants
  const breathingVariants = {
    inhale: {
      scale: currentSize.breathingScale.max,
      opacity: 0.9,
      background: currentTheme.gradient,
      filter: `drop-shadow(0 0 30px ${currentTheme.glow})`,
      transition: {
        duration: pattern.inhale,
        ease: [0.4, 0, 0.6, 1]
      }
    },
    hold: {
      scale: currentSize.breathingScale.max,
      opacity: 1,
      background: currentTheme.gradient,
      filter: `drop-shadow(0 0 40px ${currentTheme.glow})`,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exhale: {
      scale: currentSize.breathingScale.min,
      opacity: 0.7,
      background: `radial-gradient(circle, ${currentTheme.secondary} 0%, ${currentTheme.accent} 50%, transparent 100%)`,
      filter: `drop-shadow(0 0 20px ${currentTheme.shadow})`,
      transition: {
        duration: pattern.exhale,
        ease: [0.4, 0, 0.6, 1]
      }
    },
    pause: {
      scale: currentSize.breathingScale.min,
      opacity: 0.5,
      background: `radial-gradient(circle, ${currentTheme.accent} 0%, transparent 70%)`,
      filter: `drop-shadow(0 0 15px ${currentTheme.shadow})`,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  // Ripple effect variants
  const rippleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 2.5,
      opacity: [0, 0.6, 0],
      transition: {
        duration: 3,
        ease: 'easeOut',
        repeat: Infinity,
        repeatDelay: 1
      }
    }
  };

  // Guide ring variants
  const guideVariants = {
    inhale: {
      scale: [1, 1.1, 1.05],
      rotate: [0, 120, 180],
      opacity: 0.4,
      transition: {
        duration: pattern.inhale,
        ease: 'easeInOut'
      }
    },
    hold: {
      scale: 1.05,
      rotate: 180,
      opacity: 0.6,
      transition: { duration: 0.5 }
    },
    exhale: {
      scale: [1.05, 0.95, 0.9],
      rotate: [180, 300, 360],
      opacity: 0.3,
      transition: {
        duration: pattern.exhale,
        ease: 'easeInOut'
      }
    },
    pause: {
      scale: 0.9,
      rotate: 360,
      opacity: 0.2,
      transition: { duration: 0.5 }
    }
  };

  // Breathing cycle logic
  useEffect(() => {
    if (!isActive) return;

    const runPhase = (phase: typeof currentPhase, duration: number) => {
      setCurrentPhase(phase);
      onPhaseChange?.(phase);
      
      // Update animations
      breathingControls.start(phase);
      if (showGuides) guideControls.start(phase);
      
      // Update progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 100 / (duration * 10);
        setCycleProgress(Math.min(progress, 100));
      }, 100);

      return new Promise<void>(resolve => {
        timerRef.current = setTimeout(() => {
          clearInterval(progressInterval);
          resolve();
        }, duration * 1000);
      });
    };

    const breathingCycle = async () => {
      if (!isActive) return;
      
      setCycleProgress(0);
      
      // Inhale
      await runPhase('inhale', pattern.inhale);
      if (!isActive) return;
      
      // Hold
      if (pattern.hold > 0) {
        await runPhase('hold', pattern.hold);
        if (!isActive) return;
      }
      
      // Exhale
      await runPhase('exhale', pattern.exhale);
      if (!isActive) return;
      
      // Pause
      if (pattern.pause && pattern.pause > 0) {
        await runPhase('pause', pattern.pause);
        if (!isActive) return;
      }
      
      // Continue cycle
      if (isActive) breathingCycle();
    };

    breathingCycle();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, pattern, breathingControls, guideControls, onPhaseChange, showGuides]);

  // Ripple animation
  useEffect(() => {
    if (showRipples && isActive) {
      rippleControls.start('visible');
    } else {
      rippleControls.start('hidden');
    }
  }, [showRipples, isActive, rippleControls]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Container */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: currentSize.width, height: currentSize.height }}
      >
        {/* Background gradient */}
        <div 
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: `conic-gradient(from 0deg, ${currentTheme.accent}, ${currentTheme.secondary}, ${currentTheme.primary}, ${currentTheme.secondary}, ${currentTheme.accent})`
          }}
        />

        {/* Outer guide rings */}
        {showGuides && (
          <>
            <motion.div
              animate={guideControls}
              variants={guideVariants}
              className="absolute inset-4 rounded-full border-2 border-opacity-30"
              style={{ borderColor: currentTheme.primary }}
            />
            <motion.div
              animate={guideControls}
              variants={{
                ...guideVariants,
                inhale: { ...guideVariants.inhale, transition: { ...guideVariants.inhale.transition, delay: 0.2 } },
                exhale: { ...guideVariants.exhale, transition: { ...guideVariants.exhale.transition, delay: 0.2 } }
              }}
              className="absolute inset-8 rounded-full border border-opacity-20"
              style={{ borderColor: currentTheme.secondary }}
            />
          </>
        )}

        {/* Ripple effects */}
        {showRipples && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={rippleControls}
                variants={rippleVariants}
                className="absolute inset-12 rounded-full border"
                style={{ 
                  borderColor: currentTheme.accent,
                  animationDelay: `${i * 1}s`
                }}
              />
            ))}
          </>
        )}

        {/* Main breathing circle */}
        <motion.div
          animate={breathingControls}
          variants={breathingVariants}
          className="absolute inset-16 rounded-full"
          style={{
            background: currentTheme.gradient,
            boxShadow: `
              0 0 60px ${currentTheme.shadow},
              inset 0 0 30px rgba(255, 255, 255, 0.1)
            `
          }}
        />

        {/* Inner glow */}
        <motion.div
          animate={breathingControls}
          variants={{
            inhale: { scale: 1.2, opacity: 0.6 },
            hold: { scale: 1.2, opacity: 0.8 },
            exhale: { scale: 0.8, opacity: 0.4 },
            pause: { scale: 0.8, opacity: 0.2 }
          }}
          className="absolute inset-20 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)`,
            filter: `blur(4px)`
          }}
        />

        {/* Floating particles */}
        <AnimatePresence>
          {isActive && [...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: currentTheme.primary,
                top: '50%',
                left: '50%',
                marginTop: -4,
                marginLeft: -4
              }}
              animate={{
                x: [0, Math.cos(i * 60 * Math.PI / 180) * 80, 0],
                y: [0, Math.sin(i * 60 * Math.PI / 180) * 80, 0],
                opacity: [0, 0.8, 0.6, 0.8, 0],
                scale: [0, 1, 1, 1, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3
              }}
            />
          ))}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: currentTheme.primary }}
              animate={{ width: `${cycleProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreathingVisualization;