import { useEffect, useState } from 'react';

interface AnimatedCairnProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

export const AnimatedCairn: React.FC<AnimatedCairnProps> = ({ 
  size = 120, 
  animate = true,
  className = '' 
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!animate) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 800);

    return () => clearInterval(interval);
  }, [animate]);

  const getStoneStyle = (index: number) => {
    if (!animate) return {};

    const delay = index * 200;
    const phase = (animationPhase + index) % 4;
    
    return {
      transform: `translateY(${phase < 2 ? -2 : 0}px)`,
      opacity: 0.7 + (phase * 0.075),
      transition: `all 0.8s ease-in-out ${delay}ms`
    };
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="drop-shadow-sm"
      >
        {/* Background circle for harmony */}
        <circle
          cx="60"
          cy="60"
          r="55"
          fill="none"
          stroke="rgba(106, 143, 111, 0.1)"
          strokeWidth="1"
          className="animate-pulse"
          style={{ animationDuration: '4s' }}
        />

        {/* Base stone (largest) */}
        <ellipse
          cx="60"
          cy="95"
          rx="28"
          ry="14"
          fill="#8B9DC3"
          opacity="0.8"
          style={getStoneStyle(0)}
        />

        {/* Third stone */}
        <ellipse
          cx="60"
          cy="75"
          rx="22"
          ry="11"
          fill="#A9C1D9"
          opacity="0.85"
          style={getStoneStyle(1)}
        />

        {/* Second stone */}
        <ellipse
          cx="60"
          cy="58"
          rx="18"
          ry="9"
          fill="#B8D0E8"
          opacity="0.9"
          style={getStoneStyle(2)}
        />

        {/* Top stone (smallest) */}
        <ellipse
          cx="60"
          cy="45"
          rx="12"
          ry="6"
          fill="#C7DCF0"
          opacity="0.95"
          style={getStoneStyle(3)}
        />

        {/* Decorative elements */}
        {animate && (
          <>
            {/* Floating particles */}
            <circle
              cx="30"
              cy="40"
              r="1.5"
              fill="#6A8F6F"
              opacity="0.4"
              className="animate-pulse"
              style={{ animationDuration: '3s', animationDelay: '0s' }}
            />
            <circle
              cx="90"
              cy="35"
              r="1"
              fill="#6A8F6F"
              opacity="0.3"
              className="animate-pulse"
              style={{ animationDuration: '2.5s', animationDelay: '1s' }}
            />
            <circle
              cx="25"
              cy="70"
              r="1"
              fill="#6A8F6F"
              opacity="0.35"
              className="animate-pulse"
              style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}
            />
            <circle
              cx="95"
              cy="65"
              r="1.5"
              fill="#6A8F6F"
              opacity="0.25"
              className="animate-pulse"
              style={{ animationDuration: '4s', animationDelay: '1.5s' }}
            />
          </>
        )}
      </svg>

      {/* Breathing ring animation */}
      {animate && (
        <div
          className="absolute inset-0 rounded-full border border-green-200 animate-ping"
          style={{
            animationDuration: '3s',
            animationIterationCount: 'infinite',
            opacity: 0.2
          }}
        />
      )}
    </div>
  );
};