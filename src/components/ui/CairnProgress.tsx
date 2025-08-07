import React from 'react';
import { AestheticCairnProgress } from './AestheticCairnProgress';

interface CairnProgressProps {
  progress: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
  className?: string;
  theme?: 'default' | 'meditation' | 'breathing' | 'achievement';
  animated?: boolean;
  showPercentage?: boolean;
}

export const CairnProgress: React.FC<CairnProgressProps> = ({ 
  progress, 
  size = 'medium',
  showLabel = true,
  label = "Progress",
  className = "",
  theme = 'default',
  animated = true,
  showPercentage = true
}) => {
  return (
    <AestheticCairnProgress
      progress={progress}
      size={size}
      showLabel={showLabel}
      label={label}
      className={className}
      theme={theme}
      animated={animated}
      showPercentage={showPercentage}
      subtitle={`${Math.round(progress)}% selesai`}
    />
  );
};