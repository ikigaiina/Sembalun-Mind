import React, { useEffect, useState, useMemo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

export interface VisualMeditationEffectsProps {
  effect?: 'mandala' | 'chakra-flow' | 'energy-field' | 'cosmic-breath' | 'zen-garden' | 'aurora-meditation';
  intensity?: 'gentle' | 'moderate' | 'immersive';
  colorPalette?: 'serene-blue' | 'forest-green' | 'sunset-orange' | 'cosmic-purple' | 'zen-neutral';
  isActive?: boolean;
  breathingSync?: boolean;
  breathingPhase?: 'inhale' | 'hold' | 'exhale' | 'pause';
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  className?: string;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  background: string;
}

const colorPalettes: Record<string, ColorPalette> = {
  'serene-blue': {
    primary: '#3B82F6',
    secondary: '#60A5FA', 
    accent: '#DBEAFE',
    highlight: '#1E40AF',
    background: 'rgba(59, 130, 246, 0.05)'
  },
  'forest-green': {
    primary: '#22C55E',
    secondary: '#86EFAC',
    accent: '#BBFCD8',
    highlight: '#15803D',
    background: 'rgba(34, 197, 94, 0.05)'
  },
  'sunset-orange': {
    primary: '#FB923C',
    secondary: '#FED7AA',
    accent: '#FFEDD5',
    highlight: '#EA580C',
    background: 'rgba(251, 146, 60, 0.05)'
  },
  'cosmic-purple': {
    primary: '#A855F7',
    secondary: '#C4B5FD',
    accent: '#DDD6FE',
    highlight: '#7C3AED',
    background: 'rgba(168, 85, 247, 0.05)'
  },
  'zen-neutral': {
    primary: '#6B7280',
    secondary: '#9CA3AF',
    accent: '#F3F4F6',
    highlight: '#374151',
    background: 'rgba(107, 114, 128, 0.05)'
  }
};

const sizeConfig = {
  small: { width: 200, height: 200 },
  medium: { width: 320, height: 320 },
  large: { width: 480, height: 480 },
  fullscreen: { width: '100vw', height: '100vh' }
};

// Mandala Effect Component
const MandalaEffect: React.FC<{
  colors: ColorPalette;
  intensity: string;
  isActive: boolean;
  breathingPhase?: string;
  size: { width: number | string; height: number | string };
}> = ({ colors, intensity, isActive, breathingPhase, size }) => {
  const controls = useAnimation();
  const layers = intensity === 'gentle' ? 3 : intensity === 'moderate' ? 5 : 8;
  
  useEffect(() => {
    if (isActive) {
      controls.start({
        rotate: 360,
        transition: { duration: 20, repeat: Infinity, ease: 'linear' }
      });
    } else {
      controls.stop();
    }
  }, [isActive, controls]);

  const breathingScale = breathingPhase === 'inhale' ? 1.1 : breathingPhase === 'exhale' ? 0.9 : 1;

  return (
    <div 
      className="relative flex items-center justify-center overflow-hidden rounded-full"
      style={{ width: size.width, height: size.height }}
    >
      {[...Array(layers)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: `${90 - i * 10}%`,
            height: `${90 - i * 10}%`,
            borderColor: i % 2 === 0 ? colors.primary + '40' : colors.secondary + '60',
            borderStyle: i % 3 === 0 ? 'solid' : 'dashed'
          }}
          animate={controls}
          transition={{ delay: i * 0.1 }}
        />
      ))}
      
      {/* Central geometric patterns */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`petal-${i}`}
          className="absolute origin-center"
          style={{
            width: 4,
            height: typeof size.height === 'number' ? size.height / 4 : 80,
            backgroundColor: colors.accent,
            transform: `rotate(${i * 30}deg) translateY(-${typeof size.height === 'number' ? size.height / 6 : 40}px)`,
            borderRadius: 2
          }}
          animate={{
            scaleY: isActive ? [1, breathingScale, 1] : 1,
            opacity: isActive ? [0.6, 1, 0.6] : 0.3
          }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
      
      {/* Center circle */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: typeof size.width === 'number' ? size.width / 8 : 40,
          height: typeof size.height === 'number' ? size.height / 8 : 40,
          backgroundColor: colors.highlight,
          boxShadow: `0 0 20px ${colors.primary}60`
        }}
        animate={{
          scale: isActive ? [1, 1.2, 1] : 1,
          boxShadow: isActive ? 
            [`0 0 20px ${colors.primary}60`, `0 0 40px ${colors.primary}80`, `0 0 20px ${colors.primary}60`] :
            `0 0 20px ${colors.primary}40`
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );
};

// Chakra Flow Effect
const ChakraFlowEffect: React.FC<{
  colors: ColorPalette;
  intensity: string;
  isActive: boolean;
  size: { width: number | string; height: number | string };
}> = ({ colors, intensity, isActive, size }) => {
  const chakraColors = [
    '#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#8000FF'
  ];
  
  return (
    <div 
      className="relative flex flex-col justify-center items-center space-y-4"
      style={{ width: size.width, height: size.height }}
    >
      {chakraColors.map((color, i) => (
        <motion.div
          key={i}
          className="relative rounded-full"
          style={{
            width: 40 + i * 4,
            height: 40 + i * 4,
            background: `radial-gradient(circle, ${color}80 0%, ${color}40 50%, transparent 100%)`
          }}
          animate={isActive ? {
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
            rotate: [0, 180, 360]
          } : { scale: 1, opacity: 0.4 }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.2
          }}
        >
          {/* Energy flow lines */}
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: color + '60' }}
            animate={isActive ? {
              borderColor: [color + '60', color + 'FF', color + '60'],
              borderWidth: [2, 4, 2]
            } : {}}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Energy Field Effect
const EnergyFieldEffect: React.FC<{
  colors: ColorPalette;
  intensity: string;
  isActive: boolean;
  size: { width: number | string; height: number | string };
}> = ({ colors, intensity, isActive, size }) => {
  const fieldLines = intensity === 'gentle' ? 8 : intensity === 'moderate' ? 12 : 20;
  
  return (
    <div 
      className="relative overflow-hidden"
      style={{ width: size.width, height: size.height }}
    >
      {[...Array(fieldLines)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: 2,
            height: '100%',
            background: `linear-gradient(180deg, transparent 0%, ${colors.primary}60 50%, transparent 100%)`,
            left: `${(i / fieldLines) * 100}%`,
            filter: 'blur(1px)'
          }}
          animate={isActive ? {
            x: [-20, 20, -20],
            opacity: [0.3, 0.8, 0.3],
            scaleY: [0.8, 1.2, 0.8]
          } : { opacity: 0.1 }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
      
      {/* Floating energy orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: 8 + Math.random() * 12,
            height: 8 + Math.random() * 12,
            background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%'
          }}
          animate={isActive ? {
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          } : { opacity: 0 }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3
          }}
        />
      ))}
    </div>
  );
};

// Cosmic Breath Effect
const CosmicBreathEffect: React.FC<{
  colors: ColorPalette;
  intensity: string;
  isActive: boolean;
  breathingPhase?: string;
  size: { width: number | string; height: number | string };
}> = ({ colors, intensity, isActive, breathingPhase, size }) => {
  const universeScale = breathingPhase === 'inhale' ? 1.3 : breathingPhase === 'exhale' ? 0.7 : 1;
  
  return (
    <div 
      className="relative flex items-center justify-center overflow-hidden"
      style={{ width: size.width, height: size.height, background: '#000010' }}
    >
      {/* Cosmic background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, ${colors.primary}20 0%, ${colors.secondary}10 30%, transparent 80%)`
        }}
        animate={isActive ? {
          scale: [1, universeScale, 1],
          opacity: [0.6, 1, 0.6]
        } : { scale: 0.8, opacity: 0.3 }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      
      {/* Stars */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full"
          style={{
            width: 2,
            height: 2,
            backgroundColor: colors.accent,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%'
          }}
          animate={isActive ? {
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          } : { opacity: 0.2 }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3
          }}
        />
      ))}
      
      {/* Cosmic spirals */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`spiral-${i}`}
          className="absolute rounded-full border"
          style={{
            width: 100 + i * 50,
            height: 100 + i * 50,
            borderColor: colors.primary + '40',
            borderStyle: 'dashed'
          }}
          animate={isActive ? {
            rotate: [0, 360],
            scale: [1, universeScale, 1]
          } : { rotate: 0, scale: 0.8 }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
};

// Zen Garden Effect
const ZenGardenEffect: React.FC<{
  colors: ColorPalette;
  intensity: string;
  isActive: boolean;
  size: { width: number | string; height: number | string };
}> = ({ colors, intensity, isActive, size }) => {
  const rakeLines = intensity === 'gentle' ? 5 : intensity === 'moderate' ? 8 : 12;
  
  return (
    <div 
      className="relative overflow-hidden rounded-lg"
      style={{ 
        width: size.width, 
        height: size.height, 
        backgroundColor: colors.background
      }}
    >
      {/* Sand pattern lines */}
      {[...Array(rakeLines)].map((_, i) => (
        <motion.div
          key={`rake-${i}`}
          className="absolute w-full"
          style={{
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${colors.primary}40 50%, transparent 100%)`,
            top: `${(i / rakeLines) * 100}%`
          }}
          animate={isActive ? {
            x: [-100, 100],
            opacity: [0, 0.6, 0]
          } : { opacity: 0.2 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 0.3
          }}
        />
      ))}
      
      {/* Zen stones */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`stone-${i}`}
          className="absolute rounded-full"
          style={{
            width: 40 + i * 20,
            height: 30 + i * 15,
            background: `radial-gradient(ellipse, ${colors.secondary}60 0%, ${colors.primary}40 100%)`,
            left: 20 + i * 30 + '%',
            top: 30 + i * 20 + '%',
            borderRadius: '50%'
          }}
          animate={isActive ? {
            y: [-2, 2, -2],
            boxShadow: [
              `0 4px 8px ${colors.primary}20`,
              `0 8px 16px ${colors.primary}40`,
              `0 4px 8px ${colors.primary}20`
            ]
          } : {}}
          transition={{ duration: 4 + i, repeat: Infinity }}
        />
      ))}
      
      {/* Ripple effects */}
      <AnimatePresence>
        {isActive && [...Array(3)].map((_, i) => (
          <motion.div
            key={`ripple-${i}`}
            className="absolute rounded-full border"
            style={{
              width: 60,
              height: 60,
              borderColor: colors.accent,
              left: 25 + i * 35 + '%',
              top: 35 + i * 20 + '%'
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 3, delay: i * 2, repeat: Infinity }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const VisualMeditationEffects: React.FC<VisualMeditationEffectsProps> = ({
  effect = 'mandala',
  intensity = 'moderate',
  colorPalette = 'serene-blue',
  isActive = true,
  breathingSync = false,
  breathingPhase = 'inhale',
  size = 'medium',
  className = ''
}) => {
  const colors = colorPalettes[colorPalette];
  const currentSize = sizeConfig[size];

  const effectComponent = useMemo(() => {
    const commonProps = {
      colors,
      intensity,
      isActive,
      size: currentSize,
      breathingPhase: breathingSync ? breathingPhase : undefined
    };

    switch (effect) {
      case 'mandala':
        return <MandalaEffect {...commonProps} />;
      case 'chakra-flow':
        return <ChakraFlowEffect {...commonProps} />;
      case 'energy-field':
        return <EnergyFieldEffect {...commonProps} />;
      case 'cosmic-breath':
        return <CosmicBreathEffect {...commonProps} />;
      case 'zen-garden':
        return <ZenGardenEffect {...commonProps} />;
      default:
        return <MandalaEffect {...commonProps} />;
    }
  }, [effect, colors, intensity, isActive, currentSize, breathingSync, breathingPhase]);

  return (
    <div className={`relative ${className}`}>
      {effectComponent}
      
      {/* Optional overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/10 pointer-events-none" />
    </div>
  );
};

export default VisualMeditationEffects;