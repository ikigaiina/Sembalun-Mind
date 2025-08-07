import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div
      className={`transform-gpu cursor-pointer ${className}`}
      style={{...breathingAnimation, ...glowAnimation}}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden h-full flex flex-col justify-center min-h-[200px]">
        {/* Enhanced breathing background gradient */}
        <AnimatePresence>
          {isActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${
                  breathingPhase === 'inhale' 
                    ? 'rgba(106, 143, 111, 0.15) 0%, rgba(169, 193, 217, 0.05) 50%, transparent 70%' 
                    : 'rgba(169, 193, 217, 0.12) 0%, rgba(106, 143, 111, 0.03) 50%, transparent 70%'
                })`,
                transition: `background ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
              }}
            />
          )}
        </AnimatePresence>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 space-y-4">
          {/* Header with better mobile layout */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <motion.h3 
              className="text-lg sm:text-xl font-heading text-gray-800 font-semibold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.h3>
            
            <AnimatePresence>
              {isActive && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30"
                >
                  <motion.div 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: '#6A8F6F',
                    }}
                    animate={{
                      opacity: breathingPhase === 'inhale' ? 1 : 0.4,
                      scale: breathingPhase === 'inhale' ? 1.3 : 0.8
                    }}
                    transition={{ duration: duration / 1000 }}
                  />
                  <motion.span 
                    className="text-xs text-gray-700 font-medium"
                    animate={{ 
                      scale: breathingPhase === 'inhale' ? 1.05 : 0.95 
                    }}
                    transition={{ duration: duration / 1000 }}
                  >
                    {breathingPhase === 'inhale' ? 'Tarik napas' : 'Hembuskan'}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Description with better spacing */}
          {description && (
            <motion.p 
              className="text-sm text-gray-600 max-w-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {description}
            </motion.p>
          )}
          
          {/* Enhanced breathing guide circle - centered */}
          <div className="flex justify-center items-center flex-1 min-h-[120px]">
            <AnimatePresence>
              {isActive ? (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative"
                  style={{ width: '120px', height: '120px' }}
                >
                  {/* Outer breathing ring */}
                  <motion.div 
                    className="absolute inset-0 rounded-full border-3 border-primary-400"
                    style={{
                      opacity: 0.6,
                    }}
                    animate={{
                      scale: breathingPhase === 'inhale' ? 1 : 0.85,
                      borderWidth: breathingPhase === 'inhale' ? '3px' : '2px',
                    }}
                    transition={{ 
                      duration: duration / 1000,
                      ease: 'easeInOut'
                    }}
                  />
                  
                  {/* Inner breathing fill */}
                  <motion.div 
                    className="absolute inset-3 rounded-full bg-gradient-to-br from-primary-400/30 to-accent-400/20"
                    animate={{
                      scale: breathingPhase === 'inhale' ? 1 : 0.7,
                      opacity: breathingPhase === 'inhale' ? 0.4 : 0.2,
                    }}
                    transition={{ 
                      duration: duration / 1000,
                      ease: 'easeInOut'
                    }}
                  />
                  
                  {/* Center indicator */}
                  <motion.div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary-500"
                    animate={{
                      scale: breathingPhase === 'inhale' ? 1.2 : 0.8,
                      opacity: breathingPhase === 'inhale' ? 1 : 0.6,
                    }}
                    transition={{ 
                      duration: duration / 1000,
                      ease: 'easeInOut'
                    }}
                  />
                  
                  {/* Pulsing outer glow */}
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: '0 0 20px rgba(106, 143, 111, 0.3)',
                    }}
                    animate={{
                      scale: breathingPhase === 'inhale' ? 1.1 : 1,
                      opacity: breathingPhase === 'inhale' ? 0.8 : 0.3,
                    }}
                    transition={{ 
                      duration: duration / 1000,
                      ease: 'easeInOut'
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-50"
                >
                  <span className="text-gray-500 text-sm font-medium">Klik</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Custom children content */}
          {children && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full"
            >
              {children}
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};