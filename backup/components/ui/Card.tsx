import React, { forwardRef, useState } from 'react';
import { designTokens } from '../../design-system/foundations';

// ============= COMPONENT INTERFACES =============

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  
  // Visual variants
  variant?: 'default' | 'meditation' | 'cultural' | 'elevated' | 'glass' | 'minimal';
  
  // Cultural variants
  tradition?: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  
  // Size and spacing
  size?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Interactive states
  hoverable?: boolean;
  clickable?: boolean;
  isPressed?: boolean;
  isSelected?: boolean;
  
  // Visual effects
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'meditation';
  gradient?: boolean;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  
  // Cultural effects
  culturalPattern?: boolean;
  breathingEffect?: boolean;
  spiritualGlow?: boolean;
  
  // Accessibility
  role?: string;
  'aria-label'?: string;
  testId?: string;
  
  // Custom styling
  className?: string;
  contentClassName?: string;
}

// ============= CARD COMPONENT =============

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  tradition,
  size = 'md',
  padding = 'md',
  hoverable = false,
  clickable = false,
  isPressed = false,
  isSelected = false,
  shadow = 'md',
  gradient = false,
  borderRadius = 'xl',
  culturalPattern = false,
  breathingEffect = false,
  spiritualGlow = false,
  role,
  className = '',
  contentClassName = '',
  testId,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  style = {},
  ...rest
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { colors, typography, spacing, shadows, borders, animations } = designTokens;

  // Size configurations
  const sizeConfig = {
    sm: { minHeight: 'auto', maxWidth: '300px' },
    md: { minHeight: 'auto', maxWidth: '400px' },
    lg: { minHeight: 'auto', maxWidth: '500px' },
    xl: { minHeight: 'auto', maxWidth: '100%' },
  };

  // Padding configurations
  const paddingConfig = {
    none: '0',
    sm: spacing[4],
    md: spacing[6],
    lg: spacing[8],
    xl: spacing[10],
  };

  // Shadow configurations
  const shadowConfig = {
    none: 'none',
    sm: shadows.interactive.card.default,
    md: shadows.interactive.card.hover,
    lg: shadows.xl,
    xl: shadows['2xl'],
    meditation: shadows.meditation.glow,
  };

  // Get variant colors and styles
  const getVariantStyles = (): React.CSSProperties => {
    // Regional tradition styling
    if (tradition && colors.regionalColors[tradition]) {
      const regionalColors = colors.regionalColors[tradition];
      const culturalShadows = shadows.regional[tradition];
      
      return {
        backgroundColor: gradient 
          ? `linear-gradient(135deg, ${regionalColors.lotusWhite}, ${regionalColors.templeGold}10)`
          : regionalColors.lotusWhite,
        borderColor: regionalColors.earthBrown + '20',
        boxShadow: culturalShadows.traditional,
        color: regionalColors.earthBrown,
      };
    }

    // Standard variants
    switch (variant) {
      case 'meditation':
        return {
          backgroundColor: gradient
            ? `linear-gradient(135deg, rgba(147, 51, 234, 0.03), rgba(236, 72, 153, 0.02))`
            : 'rgba(147, 51, 234, 0.02)',
          borderColor: colors.cultural.spiritualPurple + '20',
          boxShadow: spiritualGlow ? shadows.meditation.glow : shadowConfig[shadow],
          color: colors.cultural.spiritualPurple,
          backdropFilter: 'blur(8px)',
        };
      
      case 'cultural':
        return {
          backgroundColor: gradient
            ? `linear-gradient(135deg, ${colors.cultural.lotusWhite}, ${colors.cultural.templeGold}10)`
            : colors.cultural.lotusWhite,
          borderColor: colors.cultural.earthBrown + '20',
          boxShadow: shadowConfig[shadow],
          color: colors.cultural.earthBrown,
        };
      
      case 'elevated':
        return {
          backgroundColor: gradient
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))'
            : 'rgba(255, 255, 255, 0.9)',
          borderColor: colors.neutral[200],
          boxShadow: shadows.xl,
          color: colors.neutral[800],
          backdropFilter: 'blur(12px)',
        };
      
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          boxShadow: shadows.interactive.card.default,
          color: colors.neutral[800],
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        };
      
      case 'minimal':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.neutral[200],
          boxShadow: 'none',
          color: colors.neutral[800],
        };
      
      default:
        return {
          backgroundColor: gradient
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))'
            : 'rgba(255, 255, 255, 0.8)',
          borderColor: colors.neutral[200],
          boxShadow: shadowConfig[shadow],
          color: colors.neutral[800],
          backdropFilter: 'blur(8px)',
        };
    }
  };

  // Get hover styles
  const getHoverStyles = (): React.CSSProperties => {
    if (!hoverable && !clickable) return {};

    const baseHover = {
      transform: 'translateY(-2px)',
      boxShadow: shadows.interactive.card.hover,
    };

    if (variant === 'meditation') {
      return {
        ...baseHover,
        boxShadow: shadows.meditation.focus,
        backgroundColor: gradient
          ? `linear-gradient(135deg, rgba(147, 51, 234, 0.08), rgba(236, 72, 153, 0.04))`
          : 'rgba(147, 51, 234, 0.05)',
      };
    }

    if (tradition && colors.regionalColors[tradition]) {
      const regionalColors = colors.regionalColors[tradition];
      return {
        ...baseHover,
        backgroundColor: gradient
          ? `linear-gradient(135deg, ${regionalColors.lotusWhite}, ${regionalColors.templeGold}20)`
          : regionalColors.lotusWhite,
        borderColor: regionalColors.templeGold + '40',
      };
    }

    return baseHover;
  };

  // Get pressed styles
  const getPressedStyles = (): React.CSSProperties => {
    if (!isPressed && !clickable) return {};
    
    return {
      transform: 'translateY(1px)',
      boxShadow: shadows.interactive.card.active,
    };
  };

  // Get focus styles
  const getFocusStyles = (): React.CSSProperties => {
    if (!isFocused) return {};
    
    const focusColor = tradition && colors.regionalColors[tradition]
      ? colors.regionalColors[tradition].spiritualPurple
      : variant === 'meditation' 
        ? colors.cultural.spiritualPurple
        : colors.primary[500];

    return {
      outline: `2px solid ${focusColor}`,
      outlineOffset: '2px',
    };
  };

  // Combine all styles
  const combinedStyles: React.CSSProperties = {
    ...getVariantStyles(),
    ...sizeConfig[size],
    padding: paddingConfig[padding],
    borderRadius: borders.radius[borderRadius],
    border: '1px solid',
    cursor: clickable ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    transition: `all ${animations.duration.normal} ${animations.easing.easeInOut}`,
    fontFamily: typography.fontFamilies.primary.join(', '),
    
    // Apply hover and pressed states
    ...(isHovered ? getHoverStyles() : {}),
    ...(isPressed ? getPressedStyles() : {}),
    ...(isFocused ? getFocusStyles() : {}),
    
    // Breathing animation
    ...(breathingEffect ? {
      animation: `breathe ${animations.meditation.breathe.duration} ${animations.meditation.breathe.easing} ${animations.meditation.breathe.direction} ${animations.meditation.breathe.iterationCount}`,
    } : {}),
    
    // User custom styles
    ...style,
  };

  // Event handlers
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable || clickable) {
      setIsHovered(true);
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clickable) return;
    onClick?.(e);
  };

  return (
    <div
      ref={ref}
      className={`sembalun-card ${className}`}
      style={combinedStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      role={role || (clickable ? 'button' : undefined)}
      tabIndex={clickable ? 0 : undefined}
      data-testid={testId}
      data-variant={variant}
      data-tradition={tradition}
      data-size={size}
      data-hoverable={hoverable}
      data-clickable={clickable}
      {...rest}
    >
      {/* Cultural pattern overlay */}
      {culturalPattern && tradition && (
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 10C15.58 10 12 13.58 12 18H28C28 13.58 24.42 10 20 10Z" fill="currentColor" fill-opacity="0.1"/><circle cx="20" cy="20" r="3" fill="currentColor" fill-opacity="0.2"/></svg>')}")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '40px 40px',
            borderRadius: 'inherit',
          }}
        />
      )}

      {/* Content */}
      <div className={`relative z-10 ${contentClassName}`}>
        {children}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div 
          className="absolute top-2 right-2 w-3 h-3 rounded-full z-20"
          style={{ 
            backgroundColor: tradition && colors.regionalColors[tradition]
              ? colors.regionalColors[tradition].templeGold
              : colors.primary[500],
          }}
        />
      )}

      {/* Breathing animation CSS */}
      {breathingEffect && (
        <style jsx>{`
          @keyframes breathe {
            0%, 100% { transform: scale(1) translateY(${isHovered ? '-2px' : '0'}); }
            50% { transform: scale(1.02) translateY(${isHovered ? '-4px' : '-2px'}); }
          }
        `}</style>
      )}
    </div>
  );
});

Card.displayName = 'Card';

// ============= COMPONENT VARIANTS =============

export const MeditationCard: React.FC<CardProps> = (props) => (
  <Card {...props} variant="meditation" spiritualGlow={true} />
);

export const CulturalCard: React.FC<CardProps> = (props) => (
  <Card {...props} variant="cultural" culturalPattern={true} />
);

export const ElevatedCard: React.FC<CardProps> = (props) => (
  <Card {...props} variant="elevated" shadow="xl" />
);

export const GlassCard: React.FC<CardProps> = (props) => (
  <Card {...props} variant="glass" />
);

export const MinimalCard: React.FC<CardProps> = (props) => (
  <Card {...props} variant="minimal" shadow="none" />
);

// Regional Card variants
export const JavaneseCard: React.FC<CardProps> = (props) => (
  <Card {...props} variant="cultural" tradition="javanese" culturalPattern={true} />
);

export const BalineseCard: React.FC<CardProps> = (props) => (
  <Card {...props} variant="cultural" tradition="balinese" culturalPattern={true} />
);

export const SundaneseCard: React.FC<CardProps> = (props) => (
  <Card {...props} variant="cultural" tradition="sundanese" culturalPattern={true} />
);

export const MinangCard: React.FC<CardProps> = (props) => (
  <Card {...props} variant="cultural" tradition="minang" culturalPattern={true} />
);

export default Card;