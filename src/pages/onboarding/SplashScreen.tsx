import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CairnIcon } from '../../components/ui/CairnIcon';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  duration = 2500 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [cairnProgress, setCairnProgress] = useState(0);

  useEffect(() => {
    // Animate cairn building up
    const progressInterval = setInterval(() => {
      setCairnProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    // Auto-advance after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete, duration]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-accent-50 to-meditation-zen-50"
      >
        {/* Enhanced Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.15, 0.05],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary-400"
          />
          <motion.div 
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.12, 0.03],
              rotate: [360, 180, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-accent-400"
          />
          <motion.div 
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.02, 0.08, 0.02],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-meditation-zen-400"
          />
        </div>

        {/* Main content with enhanced animations */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-sm">
          
          {/* Logo and icon with sophisticated animation */}
          <motion.div 
            className="mb-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: cairnProgress >= 100 ? [1, 1.05, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <CairnIcon 
                  progress={cairnProgress} 
                  size={100} 
                  className="text-primary-600 mx-auto mb-4"
                />
              </motion.div>
              
              {/* Enhanced Glow effect */}
              <motion.div 
                animate={{
                  opacity: cairnProgress >= 100 ? [0.2, 0.4, 0.2] : 0,
                  scale: cairnProgress >= 100 ? [1.5, 2, 1.5] : 1.5
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(106, 143, 111, 0.4) 0%, transparent 70%)`,
                  filter: 'blur(25px)',
                  transform: 'scale(1.5)'
                }}
              />
            </div>
          </motion.div>

          {/* App name with typewriter effect */}
          <motion.h1 
            className="text-4xl sm:text-5xl font-heading mb-4 text-primary-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Sembalun
          </motion.h1>

          {/* Tagline with slide up */}
          <motion.p 
            className="text-lg text-gray-700 font-body leading-relaxed mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Perjalanan ke Dalam Diri
          </motion.p>

          {/* Subtitle with fade in */}
          <motion.p 
            className="text-sm text-gray-500 font-body opacity-80 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            Meditasi yang tenang untuk jiwa Indonesia
          </motion.p>

          {/* Enhanced loading indicator */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-primary-400"
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <motion.span 
              className="text-sm text-gray-500 font-medium ml-3"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Mempersiapkan...
            </motion.span>
          </motion.div>

          {/* Progress indicator */}
          <motion.div 
            className="mt-6 w-full max-w-xs"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${cairnProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};