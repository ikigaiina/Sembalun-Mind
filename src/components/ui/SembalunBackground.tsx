import { useEffect, useState } from 'react';

interface SembalunBackgroundProps {
  variant?: 'default' | 'sunrise' | 'sunset' | 'mist';
  intensity?: 'subtle' | 'medium' | 'strong';
  animated?: boolean;
  className?: string;
}

export const SembalunBackground: React.FC<SembalunBackgroundProps> = ({
  variant = 'default',
  intensity = 'subtle',
  animated = true,
  className = ''
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => setTime(new Date()), 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [animated]);

  // Dynamic colors based on time of day
  const getTimeBasedColors = () => {
    const hour = time.getHours();
    
    if (hour >= 5 && hour < 7) { // Sunrise
      return {
        sky: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        mountains: ['#2C3E50', '#34495E', '#5D6D7E'],
        fields: ['#F39C12', '#E67E22', '#D35400']
      };
    } else if (hour >= 17 && hour < 19) { // Sunset
      return {
        sky: ['#FF8A80', '#FFAB91', '#FFCC80'],
        mountains: ['#424242', '#616161', '#757575'],
        fields: ['#FF8F00', '#FF6F00', '#E65100']
      };
    } else if (hour >= 19 || hour < 5) { // Night
      return {
        sky: ['#2C3E50', '#34495E', '#4A6741'],
        mountains: ['#1B2631', '#273746', '#34495E'],
        fields: ['#145A32', '#1E8449', '#239B56']
      };
    } else { // Day
      return {
        sky: ['#87CEEB', '#B0E0E6', '#E0F6FF'],
        mountains: ['#6A8F6F', '#5D7A63', '#4A6741'],
        fields: ['#9ACD32', '#8FBC8F', '#6B8E23']
      };
    }
  };

  const colors = variant === 'default' ? getTimeBasedColors() : 
    variant === 'sunrise' ? {
      sky: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      mountains: ['#2C3E50', '#34495E', '#5D6D7E'],
      fields: ['#F39C12', '#E67E22', '#D35400']
    } :
    variant === 'sunset' ? {
      sky: ['#FF8A80', '#FFAB91', '#FFCC80'],
      mountains: ['#424242', '#616161', '#757575'],
      fields: ['#FF8F00', '#FF6F00', '#E65100']
    } : {
      sky: ['#E8F4FD', '#D4E9F7', '#C0D6EA'],
      mountains: ['#6A8F6F', '#5D7A63', '#8FA48F'],
      fields: ['#A9D18E', '#9ACD32', '#8FBC8F']
    };

  const opacityMap = {
    subtle: 0.3,
    medium: 0.5,
    strong: 0.7
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      
      {/* Sky Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, 
            ${colors.sky[0]}${Math.round(opacityMap[intensity] * 255).toString(16).padStart(2, '0')} 0%, 
            ${colors.sky[1]}${Math.round(opacityMap[intensity] * 200).toString(16).padStart(2, '0')} 50%, 
            ${colors.sky[2]}${Math.round(opacityMap[intensity] * 150).toString(16).padStart(2, '0')} 100%)`
        }}
      />

      {/* Floating Clouds */}
      {animated && (
        <>
          <div 
            className="absolute top-10 left-0 w-32 h-16 rounded-full animate-float opacity-20"
            style={{ 
              background: `radial-gradient(ellipse, white 0%, transparent 70%)`,
              animationDelay: '0s',
              animationDuration: '20s'
            }}
          />
          <div 
            className="absolute top-20 right-0 w-24 h-12 rounded-full animate-float opacity-15"
            style={{ 
              background: `radial-gradient(ellipse, white 0%, transparent 70%)`,
              animationDelay: '5s',
              animationDuration: '25s'
            }}
          />
          <div 
            className="absolute top-32 left-1/3 w-20 h-10 rounded-full animate-float opacity-25"
            style={{ 
              background: `radial-gradient(ellipse, white 0%, transparent 70%)`,
              animationDelay: '10s',
              animationDuration: '18s'
            }}
          />
        </>
      )}

      {/* Mountain Layers - Sembalun's distinctive peaks */}
      <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="mountain1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.mountains[0]} stopOpacity={opacityMap[intensity]} />
            <stop offset="100%" stopColor={colors.mountains[0]} stopOpacity={opacityMap[intensity] * 0.7} />
          </linearGradient>
          <linearGradient id="mountain2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.mountains[1]} stopOpacity={opacityMap[intensity] * 0.8} />
            <stop offset="100%" stopColor={colors.mountains[1]} stopOpacity={opacityMap[intensity] * 0.5} />
          </linearGradient>
          <linearGradient id="mountain3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.mountains[2]} stopOpacity={opacityMap[intensity] * 0.6} />
            <stop offset="100%" stopColor={colors.mountains[2]} stopOpacity={opacityMap[intensity] * 0.3} />
          </linearGradient>
          <pattern id="ricePattern" x="0" y="0" width="40" height="8" patternUnits="userSpaceOnUse">
            <rect width="40" height="8" fill={colors.fields[0]} fillOpacity={opacityMap[intensity] * 0.3} />
            <rect width="40" height="1" y="2" fill={colors.fields[1]} fillOpacity={opacityMap[intensity] * 0.2} />
            <rect width="40" height="1" y="5" fill={colors.fields[2]} fillOpacity={opacityMap[intensity] * 0.15} />
          </pattern>
        </defs>

        {/* Furthest mountain range - Rinjani silhouette */}
        <path
          d="M0,400 L150,300 L250,250 L350,200 L450,180 L550,220 L650,280 L750,320 L800,350 L800,600 L0,600 Z"
          fill="url(#mountain1)"
          className={animated ? "animate-color-shift" : ""}
        />

        {/* Middle mountain range */}
        <path
          d="M0,450 L120,380 L200,340 L300,320 L400,300 L500,330 L600,370 L700,400 L800,420 L800,600 L0,600 Z"
          fill="url(#mountain2)"
          className={animated ? "animate-color-shift" : ""}
          style={{ animationDelay: '2s' }}
        />

        {/* Foreground hills */}
        <path
          d="M0,500 L100,460 L200,440 L300,420 L400,430 L500,450 L600,470 L700,480 L800,490 L800,600 L0,600 Z"
          fill="url(#mountain3)"
          className={animated ? "animate-color-shift" : ""}
          style={{ animationDelay: '4s' }}
        />

        {/* Rice terraces - Sembalun's golden fields */}
        <rect x="0" y="480" width="800" height="120" fill="url(#ricePattern)" />
        
        {/* Terraced field lines */}
        <g stroke={colors.fields[1]} strokeWidth="0.5" opacity={opacityMap[intensity] * 0.4}>
          <path d="M0,500 Q200,495 400,500 T800,505" />
          <path d="M0,520 Q200,515 400,520 T800,525" />
          <path d="M0,540 Q200,535 400,540 T800,545" />
          <path d="M0,560 Q200,555 400,560 T800,565" />
          <path d="M0,580 Q200,575 400,580 T800,585" />
        </g>

        {/* Traditional huts/structures silhouettes */}
        <g fill={colors.mountains[0]} opacity={opacityMap[intensity] * 0.4}>
          <rect x="150" y="460" width="8" height="15" />
          <polygon points="150,460 154,450 158,460" />
          <rect x="350" y="465" width="6" height="12" />
          <polygon points="350,465 353,457 356,465" />
          <rect x="600" y="470" width="10" height="18" />
          <polygon points="600,470 605,458 610,470" />
        </g>

        {/* Mist/fog effects */}
        {variant === 'mist' && (
          <g>
            <ellipse cx="200" cy="350" rx="100" ry="30" fill="white" opacity="0.2" className={animated ? "animate-float" : ""} />
            <ellipse cx="500" cy="380" rx="120" ry="25" fill="white" opacity="0.15" className={animated ? "animate-float" : ""} style={{ animationDelay: '3s' }} />
            <ellipse cx="650" cy="320" rx="80" ry="20" fill="white" opacity="0.25" className={animated ? "animate-float" : ""} style={{ animationDelay: '6s' }} />
          </g>
        )}

        {/* Birds flying (optional animation) */}
        {animated && (
          <g className="animate-float" style={{ animationDuration: '15s' }}>
            <path d="M100,200 Q102,195 104,200 Q102,205 100,200" fill={colors.mountains[0]} opacity="0.3" />
            <path d="M110,205 Q112,200 114,205 Q112,210 110,205" fill={colors.mountains[0]} opacity="0.3" />
            <path d="M300,150 Q302,145 304,150 Q302,155 300,150" fill={colors.mountains[0]} opacity="0.2" />
          </g>
        )}
      </svg>

      {/* Subtle grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-5 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3Ccircle cx='33' cy='5' r='1'/%3E%3Ccircle cx='3' cy='23' r='1'/%3E%3Ccircle cx='23' cy='33' r='1'/%3E%3Ccircle cx='53' cy='15' r='1'/%3E%3Ccircle cx='43' cy='43' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};