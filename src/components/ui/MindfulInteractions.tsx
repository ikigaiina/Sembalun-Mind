import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion, useAnimation } from 'framer-motion';

// Mindful Interactions Context for coordinated micro-interactions
interface MindfulInteractionsContextType {
  rippleEffect: (x: number, y: number, element: HTMLElement, color?: string) => void;
  breathingPulse: (element: HTMLElement, intensity?: 'subtle' | 'medium' | 'strong') => void;
  gentleHover: (element: HTMLElement, scale?: number) => void;
  mindfulTransition: (type: 'page' | 'modal' | 'card') => any;
  celebrateProgress: (element: HTMLElement, achievement: string) => void;
}

const MindfulInteractionsContext = createContext<MindfulInteractionsContextType | null>(null);

export const useMindfulInteractions = () => {
  const context = useContext(MindfulInteractionsContext);
  if (!context) {
    throw new Error('useMindfulInteractions must be used within MindfulInteractionsProvider');
  }
  return context;
};

interface MindfulInteractionsProviderProps {
  children: ReactNode;
}

export const MindfulInteractionsProvider: React.FC<MindfulInteractionsProviderProps> = ({ children }) => {
  const [ripples, setRipples] = useState<Array<{ id: string; x: number; y: number; color: string }>>([]);

  // Gentle ripple effect for button interactions
  const rippleEffect = (x: number, y: number, element: HTMLElement, color = 'rgba(106, 143, 111, 0.3)') => {
    const rect = element.getBoundingClientRect();
    const rippleX = x - rect.left;
    const rippleY = y - rect.top;
    const rippleId = `ripple-${Date.now()}`;
    
    setRipples(prev => [...prev, { id: rippleId, x: rippleX, y: rippleY, color }]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 600);
  };

  // Breathing-synchronized pulse animation
  const breathingPulse = (element: HTMLElement, intensity: 'subtle' | 'medium' | 'strong' = 'subtle') => {
    const scales = {
      subtle: { from: 1, to: 1.02 },
      medium: { from: 1, to: 1.05 },
      strong: { from: 1, to: 1.08 }
    };
    
    const scale = scales[intensity];
    
    element.style.transition = 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    element.style.transform = `scale(${scale.to})`;
    
    setTimeout(() => {
      element.style.transform = `scale(${scale.from})`;
    }, 3000);
    
    // Repeat breathing cycle
    const breathingInterval = setInterval(() => {
      element.style.transform = `scale(${scale.to})`;
      setTimeout(() => {
        element.style.transform = `scale(${scale.from})`;
      }, 3000);
    }, 6000);
    
    // Cleanup after 30 seconds
    setTimeout(() => {
      clearInterval(breathingInterval);
    }, 30000);
  };

  // Gentle hover effect that doesn't startle
  const gentleHover = (element: HTMLElement, scale = 1.02) => {
    element.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease';
    element.style.transform = `translateY(-1px) scale(${scale})`;
    element.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
  };

  // Mindful page transitions
  const mindfulTransition = (type: 'page' | 'modal' | 'card') => {
    const transitions = {
      page: {
        initial: { opacity: 0, x: 20, filter: 'blur(1px)' },
        animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, x: -20, filter: 'blur(1px)' },
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
      },
      modal: {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
      },
      card: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.2, ease: 'easeOut' }
      }
    };
    return transitions[type];
  };

  // Progress celebration animation
  const celebrateProgress = (element: HTMLElement, achievement: string) => {
    // Create floating achievement text
    const achievementElement = document.createElement('div');
    achievementElement.textContent = `🌸 ${achievement}`;
    achievementElement.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #6A8F6F;
      font-weight: 600;
      font-size: 14px;
      pointer-events: none;
      z-index: 1000;
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    `;
    
    element.style.position = 'relative';
    element.appendChild(achievementElement);
    
    // Animate achievement text
    setTimeout(() => {
      achievementElement.style.opacity = '1';
      achievementElement.style.transform = 'translate(-50%, -70px)';
    }, 100);
    
    // Gentle scale animation for the element
    element.style.transition = 'transform 0.3s ease';
    element.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 300);
    
    // Remove achievement text
    setTimeout(() => {
      achievementElement.style.opacity = '0';
      setTimeout(() => {
        if (element.contains(achievementElement)) {
          element.removeChild(achievementElement);
        }
      }, 500);
    }, 2000);
  };

  return (
    <MindfulInteractionsContext.Provider 
      value={{
        rippleEffect,
        breathingPulse,
        gentleHover,
        mindfulTransition,
        celebrateProgress
      }}
    >
      {children}
      
      {/* Ripple overlay */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: ripple.color }}
          />
        </div>
      ))}
    </MindfulInteractionsContext.Provider>
  );
};

// Enhanced Interactive Button Component
interface MindfulButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'meditation' | 'breathing' | 'calm' | 'energy';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  breathingSync?: boolean;
  celebrateOnClick?: string;
  className?: string;
}

export const MindfulButton: React.FC<MindfulButtonProps> = ({
  children,
  onClick,
  variant = 'meditation',
  size = 'md',
  disabled = false,
  breathingSync = false,
  celebrateOnClick,
  className = '',
  ...props
}) => {
  const { rippleEffect, breathingPulse, celebrateProgress } = useMindfulInteractions();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  const variants = {
    meditation: 'bg-meditation-zen-500 hover:bg-meditation-zen-600 text-white',
    breathing: 'bg-meditation-focus-500 hover:bg-meditation-focus-600 text-white',
    calm: 'bg-meditation-calm-500 hover:bg-meditation-calm-600 text-white',
    energy: 'bg-meditation-energy-500 hover:bg-meditation-energy-600 text-white',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  useEffect(() => {
    if (breathingSync && buttonRef.current) {
      breathingPulse(buttonRef.current, 'subtle');
    }
  }, [breathingSync, breathingPulse]);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !buttonRef.current) return;
    
    // Ripple effect
    rippleEffect(e.clientX, e.clientY, buttonRef.current);
    
    // Celebration if specified
    if (celebrateOnClick) {
      celebrateProgress(buttonRef.current, celebrateOnClick);
    }
    
    // Call original onClick
    if (onClick) {
      onClick(e);
    }
  };

  const handleMouseEnter = () => {
    if (!disabled && buttonRef.current) {
      buttonRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      buttonRef.current.style.transform = 'translateY(-1px)';
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && buttonRef.current) {
      buttonRef.current.style.transform = 'translateY(0)';
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden rounded-xl font-medium transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-meditation-zen-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Breathing Sync Component for passive elements
interface BreathingSyncProps {
  children: ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  duration?: number; // seconds
  className?: string;
}

export const BreathingSync: React.FC<BreathingSyncProps> = ({ 
  children, 
  intensity = 'subtle', 
  duration = 4,
  className = '' 
}) => {
  const scales = {
    subtle: [1, 1.01],
    medium: [1, 1.03],
    strong: [1, 1.06]
  };

  return (
    <motion.div
      className={className}
      animate={{
        scale: scales[intensity]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
};