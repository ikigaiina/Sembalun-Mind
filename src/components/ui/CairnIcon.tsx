import React from 'react';

interface CairnIconProps {
  size?: number;
  progress?: number; // 0-100
  className?: string;
}

export const CairnIcon: React.FC<CairnIconProps> = ({ 
  size = 24, 
  progress = 100, 
  className = '' 
}) => {
  // More aesthetic elliptical stones with gradient colors
  const stones = [
    { 
      cx: 12, cy: 20.5, rx: 4.2, ry: 2, 
      opacity: progress >= 10 ? 1 : 0.3,
      gradient: 'url(#stone-gradient-base)'
    },
    { 
      cx: 12, cy: 17, rx: 3.6, ry: 1.6, 
      opacity: progress >= 30 ? 1 : 0.3,
      gradient: 'url(#stone-gradient-fourth)'
    },
    { 
      cx: 12, cy: 13.8, rx: 3, ry: 1.3, 
      opacity: progress >= 50 ? 1 : 0.3,
      gradient: 'url(#stone-gradient-third)'
    },
    { 
      cx: 12, cy: 10.8, rx: 2.4, ry: 1, 
      opacity: progress >= 75 ? 1 : 0.3,
      gradient: 'url(#stone-gradient-second)'
    },
    { 
      cx: 12, cy: 8.2, rx: 1.8, ry: 0.8, 
      opacity: progress >= 100 ? 1 : 0.3,
      gradient: 'url(#stone-gradient-top)'
    },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Stone gradients for realistic depth */}
        <radialGradient id="stone-gradient-base" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#8DA18F" />
          <stop offset="100%" stopColor="#6A8F6F" />
        </radialGradient>
        <radialGradient id="stone-gradient-fourth" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#A3B3A3" />
          <stop offset="100%" stopColor="#7C9885" />
        </radialGradient>
        <radialGradient id="stone-gradient-third" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#B5C5B5" />
          <stop offset="100%" stopColor="#8DA49C" />
        </radialGradient>
        <radialGradient id="stone-gradient-second" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#BFD1E9" />
          <stop offset="100%" stopColor="#A9C1D9" />
        </radialGradient>
        <radialGradient id="stone-gradient-top" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#E1E8F0" />
          <stop offset="100%" stopColor="#C7DCF0" />
        </radialGradient>
        
        {/* Subtle shadow */}
        <radialGradient id="shadow-gradient-icon" cx="0.5" cy="0.8" r="0.6">
          <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Stone shadows */}
      {stones.map((stone, index) => (
        <ellipse
          key={`shadow-${index}`}
          cx={stone.cx}
          cy={stone.cy + 0.5}
          rx={stone.rx * 0.8}
          ry={stone.ry * 0.3}
          fill="url(#shadow-gradient-icon)"
          opacity={stone.opacity * 0.5}
          className="transition-opacity duration-500 ease-in-out"
        />
      ))}

      {/* Main stones */}
      {stones.map((stone, index) => (
        <ellipse
          key={index}
          cx={stone.cx}
          cy={stone.cy}
          rx={stone.rx}
          ry={stone.ry}
          fill={stone.gradient}
          opacity={stone.opacity}
          className="transition-opacity duration-500 ease-in-out"
        />
      ))}

      {/* Stone highlights for depth */}
      {stones.map((stone, index) => 
        stone.opacity > 0.8 && (
          <ellipse
            key={`highlight-${index}`}
            cx={stone.cx - stone.rx * 0.3}
            cy={stone.cy - stone.ry * 0.4}
            rx={stone.rx * 0.4}
            ry={stone.ry * 0.3}
            fill="rgba(255, 255, 255, 0.3)"
            opacity={stone.opacity}
            className="transition-opacity duration-500 ease-in-out"
          />
        )
      )}

      {/* Completion sparkle */}
      {progress === 100 && (
        <g opacity="0.8">
          <path
            d="M12,3 L12.5,5.5 L15,5 L13,7 L14,9 L12,7.5 L10,9 L11,7 L9,5 L11.5,5.5 Z"
            fill="#FFD700"
          />
        </g>
      )}
    </svg>
  );
};