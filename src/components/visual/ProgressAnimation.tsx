import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

export interface ProgressAnimationProps {
  progress: number; // 0-100
  variant?: 'circular' | 'linear' | 'wave' | 'breathing-ring' | 'zen-lotus' | 'flowing-river';
  size?: 'small' | 'medium' | 'large';
  theme?: 'ocean' | 'forest' | 'sunset' | 'moonlight';
  showPercentage?: boolean;
  showMilestones?: boolean;
  animated?: boolean;
  duration?: number;
  onMilestone?: (milestone: number) => void;
  className?: string;
}

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  glow: string;
}

const themes: Record<string, ThemeConfig> = {
  ocean: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#DBEAFE',
    background: '#F0F9FF',
    glow: 'rgba(59, 130, 246, 0.3)'
  },
  forest: {
    primary: '#22C55E',
    secondary: '#86EFAC',
    accent: '#BBFCD8',
    background: '#F0FDF4',
    glow: 'rgba(34, 197, 94, 0.3)'
  },
  sunset: {
    primary: '#FB923C',
    secondary: '#FED7AA',
    accent: '#FFEDD5',
    background: '#FFFBEB',
    glow: 'rgba(251, 146, 60, 0.3)'
  },
  moonlight: {
    primary: '#A855F7',
    secondary: '#C4B5FD',
    accent: '#DDD6FE',
    background: '#FAF5FF',
    glow: 'rgba(168, 85, 247, 0.3)'
  }
};

const sizeConfig = {
  small: { width: 80, height: 80, strokeWidth: 6 },
  medium: { width: 120, height: 120, strokeWidth: 8 },
  large: { width: 160, height: 160, strokeWidth: 10 }
};

// Circular Progress Component
const CircularProgress: React.FC<{ 
  progress: number; 
  theme: ThemeConfig; 
  size: { width: number; height: number; strokeWidth: number };
  showPercentage: boolean;
  animated: boolean;
}> = ({ progress, theme, size, showPercentage, animated }) => {
  const radius = (size.width - size.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size.width} height={size.height} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size.width / 2}
          cy={size.height / 2}
          r={radius}
          fill="none"
          stroke={theme.accent}
          strokeWidth={size.strokeWidth}
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size.width / 2}
          cy={size.height / 2}
          r={radius}
          fill="none"
          stroke={theme.primary}
          strokeWidth={size.strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={animated ? strokeDashoffset : circumference}
          strokeLinecap="round"
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${theme.glow})`
          }}
        />
        
        {/* Glow effect */}
        <motion.circle
          cx={size.width / 2}
          cy={size.height / 2}
          r={radius}
          fill="none"
          stroke={theme.glow}
          strokeWidth={size.strokeWidth + 2}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          opacity={0.5}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: 'blur(4px)' }}
        />
      </svg>
      
      {showPercentage && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center font-bold text-2xl"
          style={{ color: theme.primary }}
          animate={{ scale: [0.9, 1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {Math.round(progress)}%
        </motion.div>
      )}
    </div>
  );
};

// Wave Progress Component
const WaveProgress: React.FC<{ 
  progress: number; 
  theme: ThemeConfig; 
  size: { width: number; height: number };
  animated: boolean;
}> = ({ progress, theme, size, animated }) => {
  const waveHeight = size.height * (progress / 100);
  
  return (
    <div 
      className="relative overflow-hidden rounded-2xl border-2"
      style={{ 
        width: size.width, 
        height: size.height,
        borderColor: theme.accent,
        backgroundColor: theme.background
      }}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ height: 0 }}
        animate={{ height: animated ? waveHeight : 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ backgroundColor: theme.primary + '40' }}
      >
        {/* Wave animation */}
        <svg 
          className="absolute top-0 left-0 w-full h-8"
          viewBox="0 0 400 50"
          style={{ transform: 'translateY(-1px)' }}
        >
          <motion.path
            d="M0,25 C100,10 300,40 400,25 L400,50 L0,50 Z"
            fill={theme.primary}
            animate={{
              d: [
                "M0,25 C100,10 300,40 400,25 L400,50 L0,50 Z",
                "M0,25 C100,40 300,10 400,25 L400,50 L0,50 Z",
                "M0,25 C100,10 300,40 400,25 L400,50 L0,50 Z"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </motion.div>
      
      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ 
            backgroundColor: theme.secondary,
            left: Math.random() * 90 + '%',
            bottom: Math.random() * waveHeight
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
};

// Breathing Ring Progress
const BreathingRingProgress: React.FC<{ 
  progress: number; 
  theme: ThemeConfig; 
  size: { width: number; height: number };
  animated: boolean;
}> = ({ progress, theme, size, animated }) => {
  const rings = 3;
  
  return (
    <div className="relative flex items-center justify-center">
      {[...Array(rings)].map((_, i) => {
        const ringSize = size.width - i * 20;
        const ringProgress = Math.max(0, Math.min(100, progress - i * 20));
        const opacity = 0.8 - i * 0.2;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full border-4"
            style={{
              width: ringSize,
              height: ringSize,
              borderColor: theme.primary,
              opacity: opacity
            }}
            animate={animated ? {
              scale: [1, 1 + (ringProgress / 100) * 0.2, 1],
              opacity: [opacity, opacity * 1.5, opacity],
              rotate: [0, ringProgress * 3.6, 0]
            } : { scale: 1, opacity: opacity * 0.5 }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5
            }}
          />
        );
      })}
      
      {/* Center indicator */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size.width / 4,
          height: size.height / 4,
          backgroundColor: theme.primary,
          boxShadow: `0 0 20px ${theme.glow}`
        }}
        animate={animated ? {
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        } : { scale: 1, opacity: 0.5 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};

// Zen Lotus Progress
const ZenLotusProgress: React.FC<{ 
  progress: number; 
  theme: ThemeConfig; 
  size: { width: number; height: number };
  animated: boolean;
}> = ({ progress, theme, size, animated }) => {
  const petalCount = 8;
  const openPetals = Math.floor((progress / 100) * petalCount);
  
  return (
    <div className="relative flex items-center justify-center">
      {[...Array(petalCount)].map((_, i) => {
        const angle = (360 / petalCount) * i;
        const isOpen = i < openPetals;
        
        return (
          <motion.div
            key={i}
            className="absolute origin-center"
            style={{
              width: size.width / 3,
              height: size.height / 6,
              transform: `rotate(${angle}deg) translateY(-${size.height / 3}px)`
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={animated && isOpen ? 
              { scaleY: 1, opacity: 0.8, rotateX: [0, 10, 0] } : 
              { scaleY: 0, opacity: 0 }
            }
            transition={{ 
              duration: 0.8, 
              delay: i * 0.1,
              repeat: animated && isOpen ? Infinity : 0,
              repeatDelay: 3
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                boxShadow: `0 0 10px ${theme.glow}`
              }}
            />
          </motion.div>
        );
      })}
      
      {/* Center */}
      <div
        className="absolute rounded-full"
        style={{
          width: size.width / 5,
          height: size.height / 5,
          backgroundColor: theme.accent,
          border: `2px solid ${theme.primary}`
        }}
      />
    </div>
  );
};

export const ProgressAnimation: React.FC<ProgressAnimationProps> = ({
  progress,
  variant = 'circular',
  size = 'medium',
  theme = 'ocean',
  showPercentage = true,
  showMilestones = false,
  animated = true,
  duration = 1000,
  onMilestone,
  className = ''
}) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [milestones, setMilestones] = useState<number[]>([]);
  
  const currentTheme = themes[theme];
  const currentSize = sizeConfig[size];

  // Animate progress changes
  useEffect(() => {
    if (animated) {
      const startProgress = currentProgress;
      const diff = progress - startProgress;
      const steps = 50;
      const stepSize = diff / steps;
      const stepDuration = duration / steps;

      let step = 0;
      const interval = setInterval(() => {
        step++;
        const newProgress = startProgress + stepSize * step;
        setCurrentProgress(Math.min(progress, newProgress));
        
        if (step >= steps) {
          clearInterval(interval);
          setCurrentProgress(progress);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    } else {
      setCurrentProgress(progress);
    }
  }, [progress, animated, duration, currentProgress]);

  // Handle milestones
  useEffect(() => {
    const newMilestone = Math.floor(currentProgress / 25) * 25;
    if (newMilestone > 0 && !milestones.includes(newMilestone)) {
      setMilestones(prev => [...prev, newMilestone]);
      onMilestone?.(newMilestone);
    }
  }, [currentProgress, milestones, onMilestone]);

  const renderProgressComponent = () => {
    const commonProps = {
      progress: currentProgress,
      theme: currentTheme,
      size: currentSize,
      animated
    };

    switch (variant) {
      case 'circular':
        return <CircularProgress {...commonProps} showPercentage={showPercentage} />;
      case 'wave':
        return <WaveProgress {...commonProps} />;
      case 'breathing-ring':
        return <BreathingRingProgress {...commonProps} />;
      case 'zen-lotus':
        return <ZenLotusProgress {...commonProps} />;
      default:
        return <CircularProgress {...commonProps} showPercentage={showPercentage} />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {renderProgressComponent()}
      
      {/* Milestone celebrations */}
      <AnimatePresence>
        {showMilestones && milestones.map((milestone) => (
          <motion.div
            key={milestone}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <div 
              className="text-4xl font-bold"
              style={{ color: currentTheme.primary }}
            >
              {milestone}%
            </div>
            
            {/* Celebration particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: currentTheme.secondary }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos(i * 45 * Math.PI / 180) * 60,
                  y: Math.sin(i * 45 * Math.PI / 180) * 60
                }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProgressAnimation;