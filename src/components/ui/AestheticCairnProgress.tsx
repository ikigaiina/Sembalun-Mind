import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AestheticCairnLogo } from './AestheticCairnLogo';

interface AestheticCairnProgressProps {
  progress: number; // 0-100
  size?: 'small' | 'medium' | 'large' | 'xl';
  showLabel?: boolean;
  label?: string;
  subtitle?: string;
  animated?: boolean;
  showPercentage?: boolean;
  showMilestones?: boolean;
  milestones?: { value: number; label: string; reached?: boolean }[];
  onMilestoneReached?: (milestone: { value: number; label: string }) => void;
  className?: string;
  theme?: 'default' | 'meditation' | 'breathing' | 'achievement';
}

export const AestheticCairnProgress: React.FC<AestheticCairnProgressProps> = ({
  progress,
  size = 'medium',
  showLabel = true,
  label = 'Progress',
  subtitle,
  animated = true,
  showPercentage = true,
  showMilestones = false,
  milestones = [],
  onMilestoneReached,
  className = '',
  theme = 'default'
}) => {
  const [prevProgress, setPrevProgress] = useState(progress);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);

  // Size configurations
  const sizeConfigs = {
    small: { 
      logo: 60, 
      container: 'w-20 h-24', 
      text: 'text-xs', 
      title: 'text-sm',
      spacing: 'space-y-1'
    },
    medium: { 
      logo: 90, 
      container: 'w-28 h-32', 
      text: 'text-sm', 
      title: 'text-base',
      spacing: 'space-y-2'
    },
    large: { 
      logo: 120, 
      container: 'w-36 h-40', 
      text: 'text-base', 
      title: 'text-lg',
      spacing: 'space-y-3'
    },
    xl: { 
      logo: 160, 
      container: 'w-48 h-52', 
      text: 'text-lg', 
      title: 'text-xl',
      spacing: 'space-y-4'
    }
  };

  // Theme configurations
  const themeConfigs = {
    default: {
      bgColor: 'bg-white/10 dark:bg-gray-800/10',
      textColor: 'text-gray-700 dark:text-gray-200',
      accentColor: 'text-primary',
      borderColor: 'border-gray-200/50 dark:border-gray-700/50'
    },
    meditation: {
      bgColor: 'bg-gradient-to-br from-green-50/30 to-blue-50/30 dark:from-green-900/20 dark:to-blue-900/20',
      textColor: 'text-green-800 dark:text-green-200',
      accentColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200/50 dark:border-green-700/50'
    },
    breathing: {
      bgColor: 'bg-gradient-to-br from-blue-50/30 to-cyan-50/30 dark:from-blue-900/20 dark:to-cyan-900/20',
      textColor: 'text-blue-800 dark:text-blue-200',
      accentColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200/50 dark:border-blue-700/50'
    },
    achievement: {
      bgColor: 'bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-900/20 dark:to-orange-900/20',
      textColor: 'text-amber-800 dark:text-amber-200',
      accentColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200/50 dark:border-amber-700/50'
    }
  };

  const config = sizeConfigs[size];
  const themeConfig = themeConfigs[theme];

  // Check for milestone achievements
  useEffect(() => {
    if (progress > prevProgress && milestones.length > 0) {
      const newlyReached = milestones.find(
        milestone => 
          milestone.value <= progress && 
          milestone.value > prevProgress && 
          !milestone.reached
      );

      if (newlyReached && onMilestoneReached) {
        onMilestoneReached(newlyReached);
        setCelebrationTrigger(prev => prev + 1);
      }
    }
    setPrevProgress(progress);
  }, [progress, prevProgress, milestones, onMilestoneReached]);

  // Progress text variants
  const textVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { delay: 0.5, duration: 0.3 }
    },
    progress: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.4 }
    }
  };

  // Milestone indicator component
  const MilestoneIndicator = ({ milestone, index }: { milestone: { value: number; label: string; reached?: boolean }, index: number }) => {
    const isReached = progress >= milestone.value;
    
    return (
      <motion.div
        className="flex items-center justify-between text-xs"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <span className={`${isReached ? themeConfig.accentColor : themeConfig.textColor} font-medium`}>
          {milestone.label}
        </span>
        <div className="flex items-center space-x-1">
          <span className={`${themeConfig.textColor} opacity-70`}>
            {milestone.value}%
          </span>
          <motion.div
            className={`w-2 h-2 rounded-full ${isReached ? 'bg-green-500' : 'bg-gray-300'}`}
            animate={isReached ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className={`
        ${config.container} 
        ${config.spacing}
        flex flex-col items-center justify-center
        p-4 rounded-2xl backdrop-blur-sm
        ${themeConfig.bgColor}
        ${themeConfig.borderColor}
        border
        transition-all duration-500
        ${className}
      `}
      initial={animated ? { scale: 0.9, opacity: 0 } : {}}
      animate={animated ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={animated ? { scale: 1.02, y: -2 } : {}}
    >
      {/* Main Cairn Logo */}
      <motion.div
        animate={celebrationTrigger > 0 ? { rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 0.6 }}
        key={celebrationTrigger}
      >
        <AestheticCairnLogo
          size={config.logo}
          progress={progress}
          animated={animated}
          showWaves={progress > 0}
        />
      </motion.div>

      {/* Progress Information */}
      <AnimatePresence>
        {showLabel && (
          <motion.div
            className="text-center w-full"
            variants={textVariants}
            initial={animated ? "initial" : "animate"}
            animate="animate"
            key={progress}
          >
            {/* Main Label */}
            <motion.h3 
              className={`${config.title} font-semibold ${themeConfig.textColor} font-heading`}
              animate={progress !== prevProgress ? "progress" : {}}
              variants={textVariants}
            >
              {label}
            </motion.h3>

            {/* Subtitle */}
            {subtitle && (
              <p className={`${config.text} ${themeConfig.textColor} opacity-70 mt-1`}>
                {subtitle}
              </p>
            )}

            {/* Progress Percentage */}
            {showPercentage && (
              <motion.div
                className={`${config.text} font-mono font-bold ${themeConfig.accentColor} mt-2`}
                animate={progress !== prevProgress ? "progress" : {}}
                variants={textVariants}
              >
                {Math.round(progress)}%
              </motion.div>
            )}

            {/* Progress Description */}
            <motion.p 
              className={`${config.text} ${themeConfig.textColor} opacity-60 mt-1`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8 }}
            >
              {progress === 0 && 'Siap memulai perjalanan'}
              {progress > 0 && progress < 25 && 'Langkah pertama yang baik'}
              {progress >= 25 && progress < 50 && 'Terus maju dengan stabil'}
              {progress >= 50 && progress < 75 && 'Kemajuan yang menginspirasi'}
              {progress >= 75 && progress < 100 && 'Hampir mencapai puncak'}
              {progress === 100 && 'Pencapaian luar biasa! 🎉'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestones Section */}
      {showMilestones && milestones.length > 0 && (
        <motion.div
          className="w-full mt-4 space-y-2"
          initial={animated ? { opacity: 0, y: 20 } : {}}
          animate={animated ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <h4 className={`${config.text} font-semibold ${themeConfig.textColor} mb-2`}>
            Pencapaian
          </h4>
          <div className="space-y-1">
            {milestones.map((milestone, index) => (
              <MilestoneIndicator
                key={`${milestone.value}-${milestone.label}`}
                milestone={milestone}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Celebration Sparkles */}
      <AnimatePresence>
        {animated && celebrationTrigger > 0 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                initial={{
                  x: config.logo / 2,
                  y: config.logo / 2,
                  scale: 0
                }}
                animate={{
                  x: Math.random() * config.logo,
                  y: Math.random() * config.logo,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AestheticCairnProgress;