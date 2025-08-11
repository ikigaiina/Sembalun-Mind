import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mountain, Waves, Circle } from 'lucide-react';

interface VisualProgressIndicatorProps {
  progress: number; // 0-100
  type?: 'streak' | 'session' | 'time' | 'achievement';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
}

export const VisualProgressIndicator: React.FC<VisualProgressIndicatorProps> = ({
  progress,
  type = 'session',
  size = 'medium',
  animated = true,
  showLabel = false,
  label
}) => {
  const getIcon = () => {
    switch (type) {
      case 'streak': return Sparkles;
      case 'session': return Circle;
      case 'time': return Mountain;
      case 'achievement': return Waves;
      default: return Circle;
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small': return { container: 'w-16 h-16', icon: 'w-6 h-6', stroke: 2 };
      case 'large': return { container: 'w-32 h-32', icon: 'w-12 h-12', stroke: 4 };
      default: return { container: 'w-24 h-24', icon: 'w-8 h-8', stroke: 3 };
    }
  };

  const getColor = () => {
    switch (type) {
      case 'streak': return 'text-orange-500';
      case 'session': return 'text-meditation-zen-500';
      case 'time': return 'text-blue-500';
      case 'achievement': return 'text-purple-500';
      default: return 'text-meditation-zen-500';
    }
  };

  const sizeConfig = getSize();
  const Icon = getIcon();
  const color = getColor();
  
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeConfig.container}`}>
        {/* Background circle */}
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            fill="transparent"
            className="text-gray-200"
          />
        </svg>
        
        {/* Progress circle */}
        <svg className="absolute top-0 left-0 transform -rotate-90 w-full h-full">
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            fill="transparent"
            strokeLinecap="round"
            className={color}
            initial={animated ? { strokeDashoffset: circumference } : {}}
            animate={animated ? { strokeDashoffset } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: animated ? undefined : strokeDashoffset
            }}
          />
        </svg>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={animated ? {
              scale: [1, 1.1, 1],
              rotate: type === 'achievement' ? [0, 5, -5, 0] : 0
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon className={`${sizeConfig.icon} ${color}`} />
          </motion.div>
        </div>
        
        {/* Progress percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className={`text-xs font-bold ${color} mt-8`}
            initial={animated ? { opacity: 0 } : {}}
            animate={animated ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      </div>
      
      {showLabel && label && (
        <motion.p
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={animated ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="text-sm text-gray-600 mt-2 text-center"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
};