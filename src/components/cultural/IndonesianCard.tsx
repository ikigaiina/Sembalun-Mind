import React, { forwardRef } from 'react';
import { designTokens } from '../../design-system/foundations';

// ============= COMPONENT INTERFACES =============

export interface IndonesianCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  
  // Cultural variants
  tradition?: 'javanese' | 'balinese' | 'sundanese' | 'minang' | 'general';
  
  // Card variants
  variant?: 'default' | 'elevated' | 'ornamental' | 'sacred' | 'meditation';
  
  // Size variants
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Cultural elements
  showPattern?: boolean;
  showOrnament?: boolean;
  ornamentPosition?: 'top' | 'bottom' | 'left' | 'right' | 'all';
  
  // Header content
  title?: string;
  subtitle?: string;
  culturalContext?: string;
  
  // Interaction states
  isHoverable?: boolean;
  isClickable?: boolean;
  
  // Custom styling
  className?: string;
  style?: React.CSSProperties;
  
  // Events
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  
  // Accessibility
  role?: string;
  'aria-label'?: string;
  testId?: string;
}

// Cultural ornament patterns
const CulturalOrnament: React.FC<{ 
  tradition: string; 
  position: string; 
  size: string;
}> = ({ tradition, position, size }) => {
  const ornamentSize = size === 'sm' ? 'w-8 h-2' : size === 'lg' ? 'w-16 h-4' : 'w-12 h-3';
  const { colors } = designTokens;
  
  const getOrnamentColor = () => {
    switch (tradition) {
      case 'javanese': return colors.cultural.templeGold;
      case 'balinese': return colors.cultural.sunsetOrange;
      case 'sundanese': return colors.cultural.bambooGreen;
      case 'minang': return colors.cultural.earthBrown;
      default: return colors.cultural.templeGold;
    }
  };

  const positionStyles = {
    top: { top: 0, left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
    left: { left: 0, top: '50%', transform: 'translateY(-50%) rotate(90deg)' },
    right: { right: 0, top: '50%', transform: 'translateY(-50%) rotate(90deg)' },
  };

  return (
    <div 
      className={`absolute ${ornamentSize} opacity-60`}
      style={{
        ...positionStyles[position as keyof typeof positionStyles],
        background: `linear-gradient(90deg, ${getOrnamentColor()}, ${colors.cultural.earthBrown})`,
        borderRadius: '2px',
        zIndex: 1,
      }}
    />
  );
};

// Cultural pattern background
const CulturalPattern: React.FC<{ 
  tradition: string; 
  opacity?: number;
}> = ({ tradition, opacity = 0.05 }) => {
  const patternSvg = {
    javanese: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="batik-kawung" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="8" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>
            <circle cx="15" cy="15" r="4" fill="currentColor" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#batik-kawung)"/>
      </svg>
    `)}`,
    balinese: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pura-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 5 L35 20 L20 35 L5 20 Z" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2"/>
            <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pura-pattern)"/>
      </svg>
    `)}`,
    sundanese: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bamboo-pattern" x="0" y="0" width="20" height="40" patternUnits="userSpaceOnUse">
            <line x1="10" y1="0" x2="10" y2="40" stroke="currentColor" stroke-width="2" opacity="0.15"/>
            <line x1="5" y1="10" x2="15" y2="10" stroke="currentColor" stroke-width="1" opacity="0.1"/>
            <line x1="5" y1="30" x2="15" y2="30" stroke="currentColor" stroke-width="1" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bamboo-pattern)"/>
      </svg>
    `)}`,
    minang: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="rumah-gadang" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M25 10 L40 25 L35 30 L25 25 L15 30 L10 25 Z" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>
            <rect x="20" y="25" width="10" height="15" fill="none" stroke="currentColor" stroke-width="1" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rumah-gadang)"/>
      </svg>
    `)}`,
  };

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url("${patternSvg[tradition as keyof typeof patternSvg] || patternSvg.javanese}")`,
        opacity,
        zIndex: 0,
      }}
    />
  );
};

// ============= CARD COMPONENT =============

export const IndonesianCard = forwardRef<HTMLDivElement, IndonesianCardProps>(({
  children,
  tradition = 'general',
  variant = 'default',
  size = 'md',
  showPattern = true,
  showOrnament = true,
  ornamentPosition = 'top',
  title,
  subtitle,
  culturalContext,
  isHoverable = true,
  isClickable = false,
  className = '',
  style = {},
  onClick,
  onHover,
  testId,
  ...rest
}, ref) => {
  // ============= DESIGN TOKENS =============
  
  const { colors, typography, spacing, shadows, borders } = designTokens;

  // ============= STYLE CONFIGURATIONS =============

  // Get cultural colors based on tradition
  const getCulturalColors = () => {
    if (tradition === 'general') {
      return colors.cultural;
    }
    return colors.regionalColors[tradition];
  };

  const culturalColors = getCulturalColors();

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: spacing[4],
      titleSize: typography.fontSizes.lg,
      subtitleSize: typography.fontSizes.sm,
      minHeight: '120px',
    },
    md: {
      padding: spacing[6],
      titleSize: typography.fontSizes.xl,
      subtitleSize: typography.fontSizes.base,
      minHeight: '160px',
    },
    lg: {
      padding: spacing[8],
      titleSize: typography.fontSizes['2xl'],
      subtitleSize: typography.fontSizes.lg,
      minHeight: '200px',
    },
    xl: {
      padding: spacing[12],
      titleSize: typography.fontSizes['3xl'],
      subtitleSize: typography.fontSizes.xl,
      minHeight: '240px',
    },
  };

  // Variant styles
  const getVariantStyles = (): React.CSSProperties => {
    const baseCardStyle = {
      position: 'relative' as const,
      borderRadius: borders.radius['2xl'],
      overflow: 'hidden',
      transition: `all ${designTokens.animations.duration.normal} ${designTokens.animations.easing.easeInOut}`,
      minHeight: sizeConfig[size].minHeight,
      padding: sizeConfig[size].padding,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseCardStyle,
          background: `linear-gradient(135deg, ${culturalColors.lotusWhite} 0%, ${colors.neutral[50]} 100%)`,
          border: `2px solid ${culturalColors.templeGold}`,
          boxShadow: tradition !== 'general' 
            ? shadows.regional[tradition].temple
            : shadows.cultural.temple,
        };

      case 'ornamental':
        return {
          ...baseCardStyle,
          background: `radial-gradient(circle at top right, ${culturalColors.templeGold}10, ${culturalColors.lotusWhite})`,
          border: `3px double ${culturalColors.earthBrown}`,
          boxShadow: tradition !== 'general'
            ? shadows.regional[tradition].traditional
            : shadows.cultural.traditional,
        };

      case 'sacred':
        return {
          ...baseCardStyle,
          background: `linear-gradient(45deg, ${culturalColors.spiritualPurple}05, ${culturalColors.lotusWhite})`,
          border: `1px solid ${culturalColors.spiritualPurple}`,
          boxShadow: tradition !== 'general'
            ? shadows.regional[tradition].spiritual
            : shadows.cultural.spiritual,
        };

      case 'meditation':
        return {
          ...baseCardStyle,
          background: `radial-gradient(ellipse at center, ${colors.meditation.calm}20, ${culturalColors.lotusWhite})`,
          border: `1px solid ${colors.meditation.peace}`,
          boxShadow: shadows.meditation.calm,
          backdropFilter: 'blur(1px)',
        };

      default: // 'default'
        return {
          ...baseCardStyle,
          background: culturalColors.lotusWhite,
          border: `1px solid ${culturalColors.templeGold}`,
          boxShadow: tradition !== 'general'
            ? shadows.regional[tradition].lotus
            : shadows.cultural.lotus,
        };
    }
  };

  // Hover styles
  const getHoverStyles = (): React.CSSProperties => {
    if (!isHoverable) return {};
    
    return {
      transform: 'translateY(-4px)',
      boxShadow: tradition !== 'general'
        ? shadows.regional[tradition].temple
        : shadows.cultural.temple,
    };
  };

  // Base styles
  const baseStyles: React.CSSProperties = {
    ...getVariantStyles(),
    cursor: isClickable ? 'pointer' : 'default',
    ...style,
  };

  // ============= EVENT HANDLERS =============

  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    if (isHoverable) {
      setIsHovered(true);
      onHover?.(true);
    }
  };

  const handleMouseLeave = () => {
    if (isHoverable) {
      setIsHovered(false);
      onHover?.(false);
    }
  };

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  // ============= RENDER =============

  return (
    <div
      ref={ref}
      className={`sembalun-indonesian-card ${className}`}
      style={{
        ...baseStyles,
        ...(isHovered ? getHoverStyles() : {}),
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={testId}
      data-tradition={tradition}
      data-variant={variant}
      data-size={size}
      role={isClickable ? 'button' : rest.role}
      {...rest}
    >
      {/* Cultural Pattern Background */}
      {showPattern && tradition !== 'general' && (
        <CulturalPattern tradition={tradition} opacity={0.03} />
      )}

      {/* Ornamental Elements */}
      {showOrnament && (
        <>
          {ornamentPosition === 'all' ? (
            <>
              <CulturalOrnament tradition={tradition} position="top" size={size} />
              <CulturalOrnament tradition={tradition} position="bottom" size={size} />
              <CulturalOrnament tradition={tradition} position="left" size={size} />
              <CulturalOrnament tradition={tradition} position="right" size={size} />
            </>
          ) : (
            <CulturalOrnament tradition={tradition} position={ornamentPosition} size={size} />
          )}
        </>
      )}

      {/* Header Content */}
      {(title || subtitle || culturalContext) && (
        <div 
          className="relative mb-4 pb-3"
          style={{
            borderBottom: `1px solid ${culturalColors.templeGold}40`,
            zIndex: 2,
          }}
        >
          {title && (
            <h3
              style={{
                fontSize: sizeConfig[size].titleSize,
                fontWeight: typography.fontWeights.semibold,
                color: culturalColors.earthBrown,
                fontFamily: typography.fontFamilies.cultural.join(', '),
                margin: 0,
                marginBottom: subtitle || culturalContext ? spacing[2] : 0,
              }}
            >
              {title}
            </h3>
          )}
          
          {subtitle && (
            <p
              style={{
                fontSize: sizeConfig[size].subtitleSize,
                fontWeight: typography.fontWeights.normal,
                color: culturalColors.earthBrown + '80',
                fontFamily: typography.fontFamilies.cultural.join(', '),
                margin: 0,
                marginBottom: culturalContext ? spacing[1] : 0,
              }}
            >
              {subtitle}
            </p>
          )}
          
          {culturalContext && (
            <small
              style={{
                fontSize: typography.fontSizes.xs,
                fontWeight: typography.fontWeights.normal,
                color: culturalColors.spiritualPurple,
                fontStyle: 'italic',
                fontFamily: typography.fontFamilies.cultural.join(', '),
                margin: 0,
                letterSpacing: typography.letterSpacing.wide,
              }}
            >
              {culturalContext}
            </small>
          )}
        </div>
      )}

      {/* Card Content */}
      <div 
        className="relative"
        style={{ 
          zIndex: 2,
          fontFamily: typography.fontFamilies.cultural.join(', '),
          color: culturalColors.earthBrown,
        }}
      >
        {children}
      </div>

      {/* Cultural Footer Accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${culturalColors.templeGold}, ${culturalColors.earthBrown}, ${culturalColors.templeGold})`,
          borderRadius: `0 0 ${borders.radius['2xl']} ${borders.radius['2xl']}`,
        }}
      />
    </div>
  );
});

IndonesianCard.displayName = 'IndonesianCard';

// ============= COMPONENT VARIANTS =============

// Regional Card Variants
export const JavaneseCard: React.FC<IndonesianCardProps> = (props) => (
  <IndonesianCard {...props} tradition="javanese" />
);

export const BalineseCard: React.FC<IndonesianCardProps> = (props) => (
  <IndonesianCard {...props} tradition="balinese" />
);

export const SundaneseCard: React.FC<IndonesianCardProps> = (props) => (
  <IndonesianCard {...props} tradition="sundanese" />
);

export const MinangCard: React.FC<IndonesianCardProps> = (props) => (
  <IndonesianCard {...props} tradition="minang" />
);

// Variant-specific Cards
export const SacredCard: React.FC<IndonesianCardProps> = (props) => (
  <IndonesianCard {...props} variant="sacred" />
);

export const MeditationCard: React.FC<IndonesianCardProps> = (props) => (
  <IndonesianCard {...props} variant="meditation" />
);

export const OrnamentalCard: React.FC<IndonesianCardProps> = (props) => (
  <IndonesianCard {...props} variant="ornamental" />
);

export const ElevatedCard: React.FC<IndonesianCardProps> = (props) => (
  <IndonesianCard {...props} variant="elevated" />
);

export default IndonesianCard;