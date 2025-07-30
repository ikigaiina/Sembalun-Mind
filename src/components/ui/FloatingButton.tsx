import { type ReactNode, useState } from 'react';

interface FloatingButtonProps {
  children: ReactNode;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'accent';
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'static';
  disabled?: boolean;
  className?: string;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  children,
  onClick,
  size = 'medium',
  variant = 'primary',
  position = 'bottom-right',
  disabled = false,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    small: 'w-12 h-12 text-sm',
    medium: 'w-14 h-14 text-base',
    large: 'w-16 h-16 text-lg'
  };

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6 z-50',
    'bottom-center': 'fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-left': 'fixed bottom-6 left-6 z-50',
    'static': 'relative'
  };

  const getVariantStyles = () => {
    const baseStyle = {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isPressed ? 'scale(0.95)' : 'scale(1)',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          boxShadow: isPressed 
            ? '0 4px 12px rgba(106, 143, 111, 0.3), 0 2px 6px rgba(106, 143, 111, 0.2)'
            : '0 8px 24px rgba(106, 143, 111, 0.4), 0 4px 12px rgba(106, 143, 111, 0.25)',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'white',
          color: 'var(--color-primary)',
          boxShadow: isPressed 
            ? '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)'
            : '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
        };
      case 'accent':
        return {
          ...baseStyle,
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-primary)',
          boxShadow: isPressed 
            ? '0 4px 12px rgba(169, 193, 217, 0.3), 0 2px 6px rgba(169, 193, 217, 0.2)'
            : '0 8px 24px rgba(169, 193, 217, 0.4), 0 4px 12px rgba(169, 193, 217, 0.25)',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${positionClasses[position]}
        rounded-full
        flex items-center justify-center
        font-medium
        focus:outline-none focus:ring-4 focus:ring-opacity-50
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
        hover:scale-105
        transform-gpu
        ${className}
      `}
      style={getVariantStyles()}
    >
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div 
          className={`
            absolute inset-0 rounded-full transition-all duration-300
            ${isPressed ? 'bg-white bg-opacity-20 scale-100' : 'bg-white bg-opacity-0 scale-0'}
          `}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
      
      {/* Breathing glow effect for primary variant */}
      {variant === 'primary' && !disabled && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            backgroundColor: 'var(--color-primary)',
            opacity: 0.3,
            filter: 'blur(8px)',
            transform: 'scale(1.2)',
            zIndex: -1
          }}
        />
      )}
    </button>
  );
};