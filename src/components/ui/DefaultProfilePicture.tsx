import React from 'react';

interface DefaultProfilePictureProps {
  size?: number;
  className?: string;
}

export const DefaultProfilePicture: React.FC<DefaultProfilePictureProps> = ({ 
  size = 96, 
  className = "" 
}) => {
  return (
    <div 
      className={`bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size * 0.6} 
        height={size * 0.6} 
        viewBox="0 0 24 24" 
        fill="none" 
        className="text-white drop-shadow-sm"
      >
        {/* Meditation pose silhouette with mountain backdrop - representing Sembalun */}
        <g>
          {/* Mountain silhouette in background */}
          <path
            d="M2 20L7 12L10 16L14 10L18 14L22 8V20H2Z"
            fill="currentColor"
            fillOpacity="0.3"
          />
          
          {/* Person in meditation pose */}
          <g transform="translate(12, 12)">
            {/* Head */}
            <circle
              cx="0"
              cy="-4"
              r="2.5"
              fill="currentColor"
            />
            
            {/* Body */}
            <path
              d="M-1.5 -1.5L-1.5 3L-3 4.5L-2 5.5L0 4L2 5.5L3 4.5L1.5 3L1.5 -1.5L0 -2L-1.5 -1.5Z"
              fill="currentColor"
            />
            
            {/* Arms in meditation position */}
            <path
              d="M-3 1C-3.5 0.5 -3.5 2 -2.5 2.5C-2 2.5 -1.5 2 -1.5 1.5"
              fill="currentColor"
            />
            <path
              d="M3 1C3.5 0.5 3.5 2 2.5 2.5C2 2.5 1.5 2 1.5 1.5"
              fill="currentColor"
            />
            
            {/* Legs crossed */}
            <path
              d="M-1.5 3L-2.5 5.5L-1.5 6L0 4.5L1.5 6L2.5 5.5L1.5 3"
              fill="currentColor"
            />
          </g>
          
          {/* Subtle aura/glow effect */}
          <circle
            cx="12"
            cy="12"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.4"
            strokeDasharray="2,2"
          />
        </g>
      </svg>
    </div>
  );
};