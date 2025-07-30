import { useState, useEffect } from 'react';
import { Card } from './Card';

interface BreathingCardProps {
  title: string;
  description?: string;
  duration?: number;
  isActive?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const BreathingCard: React.FC<BreathingCardProps> = ({
  title,
  description,
  duration = 4000, // 4 seconds breathing cycle
  isActive = false,
  children,
  className = '',
  onClick
}) => {
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setBreathingPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
    }, duration);

    return () => clearInterval(interval);
  }, [isActive, duration]);

  const breathingAnimation = isActive ? {
    transform: breathingPhase === 'inhale' ? 'scale(1.02)' : 'scale(0.98)',
    transition: `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
  } : {};

  const glowAnimation = isActive ? {
    boxShadow: breathingPhase === 'inhale' 
      ? '0 8px 32px rgba(106, 143, 111, 0.15), 0 4px 16px rgba(106, 143, 111, 0.1)' 
      : '0 4px 16px rgba(106, 143, 111, 0.08), 0 2px 8px rgba(106, 143, 111, 0.05)',
    transition: `box-shadow ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
  } : {};

  return (
    <div
      className={`transform-gpu cursor-pointer ${className}`}
      style={{...breathingAnimation, ...glowAnimation}}
      onClick={onClick}
    >
      <Card className="relative overflow-hidden">
        {/* Subtle breathing background gradient */}
        {isActive && (
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${
                breathingPhase === 'inhale' 
                  ? 'rgba(106, 143, 111, 0.1) 0%, transparent 70%' 
                  : 'rgba(169, 193, 217, 0.08) 0%, transparent 70%'
              })`,
              transition: `background ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
            }}
          />
        )}
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-heading text-gray-800">{title}</h3>
            {isActive && (
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    opacity: breathingPhase === 'inhale' ? 1 : 0.5,
                    transform: breathingPhase === 'inhale' ? 'scale(1.2)' : 'scale(0.8)'
                  }}
                />
                <span className="text-xs text-gray-500 font-medium">
                  {breathingPhase === 'inhale' ? 'Tarik napas' : 'Hembuskan'}
                </span>
              </div>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-gray-600 mb-4">{description}</p>
          )}
          
          {children}
          
          {/* Breathing guide circle */}
          {isActive && (
            <div className="flex justify-center mt-6">
              <div className="relative w-16 h-16">
                <div 
                  className="absolute inset-0 rounded-full border-2 transition-all duration-1000 ease-in-out"
                  style={{
                    borderColor: 'var(--color-primary)',
                    opacity: 0.6,
                    transform: breathingPhase === 'inhale' ? 'scale(1)' : 'scale(0.7)',
                    transition: `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                  }}
                />
                <div 
                  className="absolute inset-2 rounded-full transition-all duration-1000 ease-in-out"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    opacity: breathingPhase === 'inhale' ? 0.2 : 0.1,
                    transform: breathingPhase === 'inhale' ? 'scale(1)' : 'scale(0.8)',
                    transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};