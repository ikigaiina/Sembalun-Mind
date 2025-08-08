import { useEffect, useState } from 'react';
import { AnimatedCairn } from './AnimatedCairn';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number; // in milliseconds
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('fade-in');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('breathing');
    }, 500);

    const timer2 = setTimeout(() => {
      setAnimationPhase('fade-out');
    }, duration - 800);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-[100] flex items-center justify-center
        transition-all duration-1000 ease-in-out
        ${animationPhase === 'fade-in' ? 'opacity-0' : 'opacity-100'}
        ${animationPhase === 'fade-out' ? 'opacity-0' : ''}
      `}
      style={{
        background: 'linear-gradient(135deg, #E1E8F0 0%, #F7F9FC 50%, #E8F0E1 100%)',
      }}
    >
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle geometric patterns */}
        <div 
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #6A8F6F 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #A9C1D9 0%, transparent 70%)' }}
        />
        
        {/* Floating particles */}
        <div className="absolute top-1/3 left-1/6 w-2 h-2 bg-green-200 rounded-full opacity-30 animate-pulse" 
             style={{ animationDuration: '3s' }} />
        <div className="absolute top-2/3 right-1/5 w-1.5 h-1.5 bg-blue-200 rounded-full opacity-25 animate-pulse" 
             style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-green-300 rounded-full opacity-40 animate-pulse" 
             style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
      </div>

      {/* Main content */}
      <div className="relative text-center">
        {/* Animated Cairn */}
        <div 
          className={`
            mb-8 transition-all duration-1000 ease-out
            flex items-center justify-center
            ${animationPhase === 'fade-in' ? 'scale-75 translate-y-4' : 'scale-100 translate-y-0'}
            ${animationPhase === 'breathing' ? 'scale-105' : ''}
            ${animationPhase === 'fade-out' ? 'scale-110 translate-y-[-8px]' : ''}
          `}
        >
          <div className="flex items-center justify-center">
            <AnimatedCairn size={160} animate={animationPhase !== 'fade-in'} />
          </div>
        </div>

        {/* App name */}
        <div 
          className={`
            transition-all duration-1000 ease-out delay-300
            ${animationPhase === 'fade-in' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
            ${animationPhase === 'fade-out' ? 'opacity-0 translate-y-[-4px]' : ''}
          `}
        >
          <h1 
            className="text-4xl font-heading mb-3"
            style={{ color: '#6A8F6F' }}
          >
            Sembalun
          </h1>
          <p 
            className="text-gray-600 font-body text-lg tracking-wide"
            style={{ letterSpacing: '0.1em' }}
          >
            Perjalanan Kedamaian
          </p>
        </div>

        {/* Breathing indicator */}
        <div 
          className={`
            mt-12 transition-all duration-1000 ease-out delay-500
            ${animationPhase === 'fade-in' ? 'opacity-0' : 'opacity-100'}
            ${animationPhase === 'fade-out' ? 'opacity-0' : ''}
          `}
        >
          <div className="flex items-center justify-center space-x-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: '#6A8F6F',
                animationDuration: '2s',
                animationDelay: '0s'
              }}
            />
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: '#6A8F6F',
                animationDuration: '2s',
                animationDelay: '0.3s'
              }}
            />
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: '#6A8F6F',
                animationDuration: '2s',
                animationDelay: '0.6s'
              }}
            />
          </div>
          
          <p 
            className="text-xs text-gray-500 font-body mt-4 tracking-widest"
            style={{ letterSpacing: '0.15em' }}
          >
            {animationPhase === 'breathing' 
              ? 'MENGATUR NAPAS...' 
              : animationPhase === 'fade-out' 
                ? 'SIAP BERMEDITASI' 
                : 'MEMUAT...'
            }
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div 
          className={`
            w-32 h-0.5 bg-gray-200 rounded-full overflow-hidden
            transition-all duration-1000 ease-out delay-700
            ${animationPhase === 'fade-in' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
            ${animationPhase === 'fade-out' ? 'opacity-0' : ''}
          `}
        >
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: animationPhase === 'fade-in' ? '0%' : 
                     animationPhase === 'breathing' ? '60%' : 
                     animationPhase === 'fade-out' ? '100%' : '30%'
            }}
          />
        </div>
      </div>
    </div>
  );
};