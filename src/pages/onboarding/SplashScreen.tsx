import { useEffect, useState } from 'react';
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
    <div 
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center
        transition-opacity duration-500 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        background: `linear-gradient(135deg, 
          var(--color-background) 0%, 
          rgba(169, 193, 217, 0.3) 50%, 
          var(--color-background) 100%)`
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-10 animate-pulse"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        <div 
          className="absolute bottom-32 right-16 w-24 h-24 rounded-full opacity-10 animate-pulse"
          style={{ 
            backgroundColor: 'var(--color-accent)',
            animationDelay: '1s'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-sm">
        
        {/* Logo and icon */}
        <div className="mb-8 transform scale-110 animate-fade-in">
          <div className="relative">
            <CairnIcon 
              progress={cairnProgress} 
              size={80} 
              className="text-primary mx-auto mb-4"
            />
            
            {/* Glow effect */}
            <div 
              className={`
                absolute inset-0 rounded-full transition-opacity duration-300
                ${cairnProgress >= 100 ? 'opacity-30' : 'opacity-0'}
              `}
              style={{
                background: `radial-gradient(circle, var(--color-primary) 0%, transparent 70%)`,
                filter: 'blur(20px)',
                transform: 'scale(1.5)'
              }}
            />
          </div>
        </div>

        {/* App name */}
        <h1 
          className="text-4xl font-heading mb-4 animate-fade-in"
          style={{ 
            color: 'var(--color-primary)',
            animationDelay: '0.5s',
            animationFillMode: 'both'
          }}
        >
          Sembalun
        </h1>

        {/* Tagline */}
        <p 
          className="text-lg text-gray-600 font-body leading-relaxed animate-fade-in"
          style={{
            animationDelay: '1s',
            animationFillMode: 'both'
          }}
        >
          Perjalanan ke Dalam Diri
        </p>

        {/* Subtitle */}
        <p 
          className="text-sm text-gray-500 font-body mt-2 opacity-80 animate-fade-in"
          style={{
            animationDelay: '1.5s',
            animationFillMode: 'both'
          }}
        >
          Meditasi yang tenang untuk jiwa Indonesia
        </p>

        {/* Loading indicator */}
        <div 
          className="mt-12 animate-fade-in"
          style={{
            animationDelay: '2s',
            animationFillMode: 'both'
          }}
        >
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};