import React from 'react';
import { motion } from 'framer-motion';

interface AestheticCairnLogoProps {
  size?: number;
  progress?: number; // 0-100
  animated?: boolean;
  showWaves?: boolean;
  className?: string;
}

export const AestheticCairnLogo: React.FC<AestheticCairnLogoProps> = ({
  size = 120,
  progress = 100,
  animated = true,
  showWaves = true,
  className = ''
}) => {
  // Calculate progress-based visibility for each stone
  const stones = [
    { 
      id: 'base', 
      threshold: 10, 
      cx: size * 0.5, 
      cy: size * 0.85, 
      rx: size * 0.28, 
      ry: size * 0.12,
      gradient: ['#6A8F6F', '#8DA18F'],
      shadow: size * 0.02
    },
    { 
      id: 'fourth', 
      threshold: 25, 
      cx: size * 0.5, 
      cy: size * 0.68, 
      rx: size * 0.24, 
      ry: size * 0.1,
      gradient: ['#7C9885', '#A3B3A3'],
      shadow: size * 0.015
    },
    { 
      id: 'third', 
      threshold: 45, 
      cx: size * 0.5, 
      cy: size * 0.53, 
      rx: size * 0.2, 
      ry: size * 0.08,
      gradient: ['#8DA49C', '#B5C5B5'],
      shadow: size * 0.012
    },
    { 
      id: 'second', 
      threshold: 70, 
      cx: size * 0.5, 
      cy: size * 0.4, 
      rx: size * 0.16, 
      ry: size * 0.065,
      gradient: ['#A9C1D9', '#BFD1E9'],
      shadow: size * 0.01
    },
    { 
      id: 'top', 
      threshold: 100, 
      cx: size * 0.5, 
      cy: size * 0.29, 
      rx: size * 0.12, 
      ry: size * 0.05,
      gradient: ['#C7DCF0', '#E1E8F0'],
      shadow: size * 0.008
    }
  ];

  // Animation variants for stones
  const stoneVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
      y: 20,
    },
    visible: (delay: number) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: delay * 0.3,
        duration: 0.6
      }
    }),
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 }
    },
    inactive: {
      scale: 0.8,
      opacity: 0.3
    }
  };

  // Wave animation variants
  const waveVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: [0, 0.6, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "loop" as const,
        ease: "easeInOut"
      }
    }
  };

  // Floating particle animation
  const particleVariants = {
    floating: {
      y: [-10, -20, -10],
      x: [-5, 5, -5],
      opacity: [0.2, 0.5, 0.2],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-lg"
      >
        {/* Background glow */}
        <defs>
          <filter id="glow">
            <feMorphology operator="dilate" radius="2"/>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradients for each stone */}
          {stones.map((stone, index) => (
            <radialGradient 
              key={`gradient-${stone.id}`}
              id={`stone-gradient-${stone.id}`}
              cx="0.3" 
              cy="0.3" 
              r="0.8"
            >
              <stop offset="0%" stopColor={stone.gradient[1]} />
              <stop offset="100%" stopColor={stone.gradient[0]} />
            </radialGradient>
          ))}

          {/* Shadow gradient */}
          <radialGradient id="shadow-gradient" cx="0.5" cy="0.8" r="0.6">
            <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* Floating waves animation */}
        {showWaves && animated && (
          <>
            <motion.circle
              cx={size * 0.5}
              cy={size * 0.5}
              r={size * 0.3}
              fill="none"
              stroke="rgba(106, 143, 111, 0.15)"
              strokeWidth="1"
              variants={waveVariants}
              initial="initial"
              animate="animate"
            />
            <motion.circle
              cx={size * 0.5}
              cy={size * 0.5}
              r={size * 0.4}
              fill="none"
              stroke="rgba(169, 193, 217, 0.1)"
              strokeWidth="1"
              variants={waveVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '1s' }}
            />
          </>
        )}

        {/* Cairn stones */}
        {stones.map((stone, index) => {
          const isActive = progress >= stone.threshold;
          const stoneDelay = index * 0.1;
          
          return (
            <g key={stone.id}>
              {/* Stone shadow */}
              <motion.ellipse
                cx={stone.cx}
                cy={stone.cy + stone.shadow * 3}
                rx={stone.rx * 0.9}
                ry={stone.ry * 0.3}
                fill="url(#shadow-gradient)"
                opacity={isActive ? 0.3 : 0.1}
                initial={animated ? "hidden" : "visible"}
                animate={animated ? (isActive ? "visible" : "inactive") : "visible"}
                variants={stoneVariants}
                custom={stoneDelay}
              />
              
              {/* Main stone */}
              <motion.ellipse
                cx={stone.cx}
                cy={stone.cy}
                rx={stone.rx}
                ry={stone.ry}
                fill={`url(#stone-gradient-${stone.id})`}
                filter={isActive ? "url(#glow)" : "none"}
                style={{
                  cursor: animated ? 'pointer' : 'default'
                }}
                initial={animated ? "hidden" : "visible"}
                animate={animated ? (isActive ? "visible" : "inactive") : "visible"}
                whileHover={animated && isActive ? "hover" : {}}
                variants={stoneVariants}
                custom={stoneDelay}
              />

              {/* Stone highlight */}
              {isActive && (
                <motion.ellipse
                  cx={stone.cx - stone.rx * 0.3}
                  cy={stone.cy - stone.ry * 0.4}
                  rx={stone.rx * 0.4}
                  ry={stone.ry * 0.3}
                  fill="rgba(255, 255, 255, 0.3)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: stoneDelay + 0.3, duration: 0.5 }}
                />
              )}
            </g>
          );
        })}

        {/* Floating particles around the cairn */}
        {animated && progress > 50 && (
          <>
            <motion.circle
              cx={size * 0.2}
              cy={size * 0.3}
              r="2"
              fill="#6A8F6F"
              opacity="0.4"
              variants={particleVariants}
              animate="floating"
            />
            <motion.circle
              cx={size * 0.8}
              cy={size * 0.4}
              r="1.5"
              fill="#A9C1D9"
              opacity="0.3"
              variants={particleVariants}
              animate="floating"
              style={{ animationDelay: '2s' }}
            />
            <motion.circle
              cx={size * 0.15}
              cy={size * 0.65}
              r="1"
              fill="#C56C3E"
              opacity="0.25"
              variants={particleVariants}
              animate="floating"
              style={{ animationDelay: '1s' }}
            />
            <motion.circle
              cx={size * 0.85}
              cy={size * 0.7}
              r="1.8"
              fill="#6A8F6F"
              opacity="0.3"
              variants={particleVariants}
              animate="floating"
              style={{ animationDelay: '3s' }}
            />
          </>
        )}

        {/* Progress completion sparkle */}
        {animated && progress === 100 && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <path
              d={`M${size * 0.5},${size * 0.15} L${size * 0.515},${size * 0.19} L${size * 0.55},${size * 0.18} L${size * 0.52},${size * 0.21} L${size * 0.53},${size * 0.25} L${size * 0.5},${size * 0.22} L${size * 0.47},${size * 0.25} L${size * 0.48},${size * 0.21} L${size * 0.45},${size * 0.18} L${size * 0.485},${size * 0.19} Z`}
              fill="#FFD700"
              opacity="0.8"
            />
          </motion.g>
        )}
      </svg>

      {/* Meditation energy aura (only when fully completed) */}
      {animated && progress === 100 && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(106, 143, 111, 0.1) 0%, rgba(106, 143, 111, 0.05) 50%, transparent 100%)`
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
};

export default AestheticCairnLogo;