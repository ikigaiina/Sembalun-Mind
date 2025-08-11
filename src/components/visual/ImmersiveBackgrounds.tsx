import React, { useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';

export interface ImmersiveBackgroundsProps {
  variant?: 'flowing-waves' | 'floating-orbs' | 'gentle-aurora' | 'breathing-gradients';
  intensity?: 'subtle' | 'medium' | 'immersive';
  colorScheme?: 'ocean' | 'forest' | 'sunset' | 'moonlight' | 'neutral';
  speed?: 'slow' | 'normal' | 'fast';
  isActive?: boolean;
  className?: string;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

const colorSchemes: Record<string, ColorScheme> = {
  ocean: {
    primary: '#3B82F6',
    secondary: '#60A5FA', 
    accent: '#DBEAFE',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%)'
  },
  forest: {
    primary: '#22C55E',
    secondary: '#86EFAC',
    accent: '#BBFCD8',
    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(134, 239, 172, 0.05) 100%)'
  },
  sunset: {
    primary: '#FB923C',
    secondary: '#FED7AA',
    accent: '#FFEDD5',
    background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(254, 215, 170, 0.05) 100%)'
  },
  moonlight: {
    primary: '#A855F7',
    secondary: '#C4B5FD',
    accent: '#DDD6FE',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(196, 181, 253, 0.05) 100%)'
  },
  neutral: {
    primary: '#6B7280',
    secondary: '#9CA3AF',
    accent: '#F3F4F6',
    background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.08) 0%, rgba(156, 163, 175, 0.04) 100%)'
  }
};

const speedConfig = {
  slow: 1.5,
  normal: 1,
  fast: 0.7
};

// Flowing Waves Background
const FlowingWaves: React.FC<{ colors: ColorScheme; speed: number; intensity: string }> = ({ colors, speed, intensity }) => {
  const waveCount = intensity === 'subtle' ? 2 : intensity === 'medium' ? 3 : 5;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(waveCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-full"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 20 / speed,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2
          }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 320"
            preserveAspectRatio="none"
            style={{ opacity: intensity === 'subtle' ? 0.1 : intensity === 'medium' ? 0.15 : 0.2 }}
          >
            <motion.path
              d={`M0,160 C300,${100 + i * 20} 600,${220 - i * 20} 1200,160 L1200,320 L0,320 Z`}
              fill={i % 2 === 0 ? colors.primary + '20' : colors.secondary + '15'}
              animate={{
                d: [
                  `M0,160 C300,${100 + i * 20} 600,${220 - i * 20} 1200,160 L1200,320 L0,320 Z`,
                  `M0,180 C300,${120 + i * 20} 600,${200 - i * 20} 1200,180 L1200,320 L0,320 Z`,
                  `M0,160 C300,${100 + i * 20} 600,${220 - i * 20} 1200,160 L1200,320 L0,320 Z`
                ]
              }}
              transition={{
                duration: 8 / speed,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

// Floating Orbs Background
const FloatingOrbs: React.FC<{ colors: ColorScheme; speed: number; intensity: string }> = ({ colors, speed, intensity }) => {
  const orbCount = intensity === 'subtle' ? 3 : intensity === 'medium' ? 6 : 10;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(orbCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 20 + Math.random() * 40,
            height: 20 + Math.random() * 40,
            background: `radial-gradient(circle, ${i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent}40 0%, transparent 70%)`,
            filter: 'blur(2px)',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%'
          }}
          animate={{
            x: [-20, 20, -20],
            y: [-30, 30, -30],
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: (6 + Math.random() * 4) / speed,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
};

// Gentle Aurora Background
const GentleAurora: React.FC<{ colors: ColorScheme; speed: number; intensity: string }> = ({ colors, speed, intensity }) => {
  const auroraOpacity = intensity === 'subtle' ? 0.08 : intensity === 'medium' ? 0.12 : 0.18;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, ${colors.primary}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, ${colors.secondary}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, ${colors.accent}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%)
          `
        }}
        animate={{
          background: [
            `radial-gradient(ellipse at 20% 30%, ${colors.primary}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%),
             radial-gradient(ellipse at 80% 70%, ${colors.secondary}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%),
             radial-gradient(ellipse at 40% 80%, ${colors.accent}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%)`,
            `radial-gradient(ellipse at 60% 20%, ${colors.primary}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%),
             radial-gradient(ellipse at 30% 80%, ${colors.secondary}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%),
             radial-gradient(ellipse at 70% 60%, ${colors.accent}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%)`,
            `radial-gradient(ellipse at 20% 30%, ${colors.primary}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%),
             radial-gradient(ellipse at 80% 70%, ${colors.secondary}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%),
             radial-gradient(ellipse at 40% 80%, ${colors.accent}${Math.round(auroraOpacity * 255).toString(16)} 0%, transparent 50%)`
          ]
        }}
        transition={{
          duration: 15 / speed,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
};

// Breathing Gradients Background  
const BreathingGradients: React.FC<{ colors: ColorScheme; speed: number; intensity: string; isActive?: boolean }> = ({ colors, speed, intensity, isActive = true }) => {
  const maxOpacity = intensity === 'subtle' ? 0.06 : intensity === 'medium' ? 0.1 : 0.15;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${colors.primary}20 0%, ${colors.secondary}10 50%, transparent 100%)`
        }}
        animate={isActive ? {
          scale: [1, 1.3, 1],
          opacity: [maxOpacity, maxOpacity * 1.5, maxOpacity]
        } : { scale: 1, opacity: maxOpacity * 0.5 }}
        transition={{
          duration: 8 / speed,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg at center, ${colors.accent}15 0deg, transparent 60deg, ${colors.secondary}10 180deg, transparent 240deg, ${colors.primary}15 360deg)`
        }}
        animate={isActive ? {
          rotate: [0, 360],
          scale: [0.8, 1.1, 0.8]
        } : { rotate: 0, scale: 0.8 }}
        transition={{
          duration: 20 / speed,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
};


export const ImmersiveBackgrounds: React.FC<ImmersiveBackgroundsProps> = ({
  variant = 'gentle-aurora',
  intensity = 'medium',
  colorScheme = 'ocean',
  speed = 'normal',
  isActive = true,
  className = ''
}) => {
  const colors = colorSchemes[colorScheme] || colorSchemes.neutral;
  const speedMultiplier = speedConfig[speed] || speedConfig.normal;

  const backgroundComponent = useMemo(() => {
    // Ensure colors is defined
    if (!colors) {
      return null;
    }
    
    const props = { colors, speed: speedMultiplier, intensity, isActive };
    
    switch (variant) {
      case 'flowing-waves':
        return <FlowingWaves {...props} />;
      case 'floating-orbs':
        return <FloatingOrbs {...props} />;
      case 'gentle-aurora':
        return <GentleAurora {...props} />;
      case 'breathing-gradients':
        return <BreathingGradients {...props} />;
      default:
        return <GentleAurora {...props} />;
    }
  }, [variant, colors, speedMultiplier, intensity, isActive]);

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`} style={{ zIndex: -50 }}>
      {/* Base gradient background */}
      <div 
        className="fixed inset-0"
        style={{ background: colors?.background || 'transparent', zIndex: -60 }}
      />
      
      {/* Animated background component */}
      {backgroundComponent}
      
      {/* Optional overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" style={{ zIndex: -40 }} />
    </div>
  );
};

export default ImmersiveBackgrounds;