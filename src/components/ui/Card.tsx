
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'medium',
  onClick,
  onMouseEnter,
  onMouseLeave,
  style,
  ...rest
}) => {
  const paddingClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  return (
    <div 
      className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 ${paddingClasses[padding]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
};