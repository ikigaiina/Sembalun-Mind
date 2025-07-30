import { useEffect, useState } from 'react';
import { CairnIcon } from '../../components/ui/CairnIcon';
import { SembalunBackground } from '../../components/ui/SembalunBackground';

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
    >
      {/* Sembalun Background */}
      <SembalunBackground 
        variant="sunrise" 
        intensity="medium" 
        animated={true}
        className="absolute inset-0"
      />
      
      {/* Overlay for better text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, 
            rgba(225, 232, 240, 0.8) 0%, 
            rgba(169, 193, 217, 0.6) 50%, 
            rgba(225, 232, 240, 0.8) 100%)`
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-sm">
        
        {/* Logo and icon */}
        <div className="mb-8 animate-fade-in">
          <div className="relative flex items-center justify-center">
            <CairnIcon 
              progress={cairnProgress} 
              size={120} 
              variant="artistic"
              className="text-primary"
            />
            
            {/* Ambient glow effect */}
            <div 
              className={`
                absolute inset-0 transition-opacity duration-1000 ease-out
                ${cairnProgress >= 100 ? 'opacity-40' : 'opacity-0'}
              `}
              style={{
                background: `radial-gradient(circle, var(--color-primary) 0%, var(--color-accent) 30%, transparent 70%)`,
                filter: 'blur(30px)',
                transform: 'scale(1.8)',
                borderRadius: '50%'
              }}
            />
            
            {/* Subtle pulsing ring */}
            <div 
              className={`
                absolute inset-0 rounded-full border-2 transition-all duration-2000 ease-out
                ${cairnProgress >= 100 ? 'opacity-30 scale-150' : 'opacity-0 scale-100'}
              `}
              style={{
                borderColor: 'var(--color-primary)',
                animation: cairnProgress >= 100 ? 'pulse 3s ease-in-out infinite' : 'none'
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