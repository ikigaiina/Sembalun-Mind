export interface CairnIconProps {
  size?: number;
  progress?: number; // 0-100
  className?: string;
  variant?: 'default' | 'artistic' | 'minimal';
}

export const CairnIcon: React.FC<CairnIconProps> = ({ 
  size = 24, 
  progress = 100, 
  className = '',
  variant = 'artistic'
}) => {
  if (variant === 'artistic') {
    // More artistic and organic stone stack
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="stoneGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.5"/>
          </linearGradient>
          <linearGradient id="stoneGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6"/>
          </linearGradient>
          <linearGradient id="stoneGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.7"/>
          </linearGradient>
        </defs>
        
        {/* Base stone - largest and most stable */}
        <ellipse
          cx="16"
          cy="26"
          rx="9"
          ry="4"
          fill="url(#stoneGradient1)"
          opacity={progress >= 20 ? 1 : 0.3}
          className="transition-all duration-700 ease-out"
          transform={progress >= 20 ? "scale(1)" : "scale(0.8)"}
        />
        
        {/* Second stone - slightly rotated */}
        <ellipse
          cx="15.5"
          cy="21"
          rx="7.5"
          ry="3.5"
          fill="url(#stoneGradient2)"
          opacity={progress >= 40 ? 1 : 0.3}
          className="transition-all duration-700 ease-out"
          transform={progress >= 40 ? "rotate(-2 15.5 21) scale(1)" : "rotate(-2 15.5 21) scale(0.8)"}
        />
        
        {/* Third stone - middle, slightly larger */}
        <ellipse
          cx="16.2"
          cy="16.5"
          rx="8"
          ry="3.8"
          fill="url(#stoneGradient3)"
          opacity={progress >= 60 ? 1 : 0.3}
          className="transition-all duration-700 ease-out"
          transform={progress >= 60 ? "rotate(1.5 16.2 16.5) scale(1)" : "rotate(1.5 16.2 16.5) scale(0.8)"}
        />
        
        {/* Fourth stone - smaller, more balanced */}
        <ellipse
          cx="15.8"
          cy="12"
          rx="6"
          ry="3"
          fill="url(#stoneGradient2)"
          opacity={progress >= 80 ? 1 : 0.3}
          className="transition-all duration-700 ease-out"
          transform={progress >= 80 ? "rotate(-1 15.8 12) scale(1)" : "rotate(-1 15.8 12) scale(0.8)"}
        />
        
        {/* Top stone - smallest, perfectly balanced */}
        <ellipse
          cx="16"
          cy="8"
          rx="4"
          ry="2.5"
          fill="url(#stoneGradient1)"
          opacity={progress >= 100 ? 1 : 0.3}
          className="transition-all duration-700 ease-out"
          transform={progress >= 100 ? "scale(1)" : "scale(0.8)"}
        />
        
        {/* Subtle shadow/ground effect */}
        <ellipse
          cx="16"
          cy="29.5"
          rx="10"
          ry="2"
          fill="currentColor"
          opacity="0.1"
          className="transition-opacity duration-500"
        />
        
        {/* Small pebbles for detail */}
        {progress >= 100 && (
          <>
            <circle
              cx="8"
              cy="28"
              r="1.5"
              fill="currentColor"
              opacity="0.4"
              className="animate-fade-in"
            />
            <circle
              cx="24"
              cy="27.5"
              r="1"
              fill="currentColor"
              opacity="0.3"
              className="animate-fade-in"
            />
          </>
        )}
      </svg>
    );
  }

  // Fallback to original minimal design
  const stones = [
    { x: 12, y: 20, width: 8, height: 4, rx: 2, opacity: progress >= 20 ? 1 : 0.3 },
    { x: 10, y: 16, width: 12, height: 4, rx: 2, opacity: progress >= 40 ? 1 : 0.3 },
    { x: 8, y: 11, width: 16, height: 5, rx: 2.5, opacity: progress >= 60 ? 1 : 0.3 },
    { x: 10, y: 7, width: 12, height: 4, rx: 2, opacity: progress >= 80 ? 1 : 0.3 },
    { x: 12, y: 4, width: 8, height: 3, rx: 1.5, opacity: progress >= 100 ? 1 : 0.3 },
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
      {stones.map((stone, index) => (
        <rect
          key={index}
          x={stone.x}
          y={stone.y}
          width={stone.width}
          height={stone.height}
          rx={stone.rx}
          fill="currentColor"
          opacity={stone.opacity}
          className="transition-opacity duration-500 ease-in-out"
        />
      ))}
    </svg>
  );
};