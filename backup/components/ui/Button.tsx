
import React, { forwardRef } from 'react';
import { designTokens } from '../../design-system/foundations';

// ============= COMPONENT INTERFACES =============

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  
  // Core variants
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'meditation' | 'breathing' | 'control';
  
  // Cultural variants
  culturalVariant?: 'cultural' | 'meditation' | 'traditional' | 'spiritual';
  
  // Regional variants
  tradition?: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  
  // Size variants
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  // State variants
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  testId?: string;
  
  // Custom styling
  className?: string;
  style?: React.CSSProperties;
}

// Loading spinner component
const LoadingSpinner: React.FC<{ size: string }> = ({ size }) => (
  <svg 
    className={`animate-spin ${size} mr-2`} 
    fill="none" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ============= BUTTON COMPONENT =============

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  culturalVariant,
  tradition,
  size = 'md',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  className = '',
  style = {},
  testId,
  onClick,
  ...rest
}, ref) => {
  // ============= STYLE CONFIGURATIONS =============
  
  const { colors, typography, spacing, shadows, borders, animations } = designTokens;

  // Base styles
  const baseStyles: React.CSSProperties = {
    // Layout
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
    border: 'none',
    outline: 'none',
    textDecoration: 'none',
    userSelect: 'none',
    width: fullWidth ? '100%' : 'auto',
    
    // Typography - Force with !important
    fontFamily: `${typography.fontFamilies.primary.join(', ')} !important`,
    fontWeight: `${typography.fontWeights.medium} !important`,
    textAlign: 'center !important',
    whiteSpace: 'nowrap !important',
    overflow: 'hidden !important',
    textOverflow: 'ellipsis !important',
    
    // Border radius
    borderRadius: borders.radius.lg,
    
    // Transitions
    transition: `all ${animations.duration.normal} ${animations.easing.easeInOut}`,
    
    // States
    opacity: isDisabled ? 0.5 : 1,
    transform: 'translateY(0)',
  };

  // Size configurations with proper line-height and padding
  const sizeConfig = {
    xs: {
      padding: `${spacing[1.5]} ${spacing[3]}`, // 6px 12px - tighter vertical
      fontSize: typography.fontSizes.xs, // 12px
      lineHeight: '1.2', // tight line height
      iconSize: 'w-3 h-3',
    },
    sm: {
      padding: `${spacing[2]} ${spacing[4]}`, // 8px 16px
      fontSize: typography.fontSizes.sm, // 14px
      lineHeight: '1.25', // controlled line height
      iconSize: 'w-4 h-4',
    },
    md: {
      padding: `${spacing[2.5]} ${spacing[6]}`, // 10px 24px - reduced vertical
      fontSize: typography.fontSizes.sm, // 14px
      lineHeight: '1.3', // contained line height
      iconSize: 'w-4 h-4',
    },
    lg: {
      padding: `${spacing[3]} ${spacing[8]}`, // 12px 32px - reduced vertical
      fontSize: typography.fontSizes.base, // 16px
      lineHeight: '1.25', // tight control
      iconSize: 'w-5 h-5',
    },
    xl: {
      padding: `${spacing[4]} ${spacing[10]}`, // 16px 40px
      fontSize: typography.fontSizes.lg, // 18px
      lineHeight: '1.2', // very tight
      iconSize: 'w-6 h-6',
    },
  };

  // Variant styles
  const getVariantStyles = (): React.CSSProperties => {
    // Cultural variants take precedence
    if (culturalVariant) {
      switch (culturalVariant) {
        case 'cultural':
          return {
            background: tradition 
              ? colors.regionalColors[tradition].templeGold
              : colors.cultural.templeGold,
            color: tradition 
              ? colors.regionalColors[tradition].earthBrown 
              : colors.cultural.earthBrown,
            border: `2px solid ${tradition 
              ? colors.regionalColors[tradition].earthBrown 
              : colors.cultural.earthBrown}`,
            boxShadow: tradition 
              ? shadows.regional[tradition].traditional
              : shadows.cultural.traditional,
            fontFamily: typography.fontFamilies.cultural.join(', '),
          };
          
        case 'meditation':
          return {
            background: `linear-gradient(135deg, ${colors.cultural.spiritualPurple}, ${colors.primary[500]})`,
            color: 'white',
            boxShadow: shadows.meditation.glow,
            border: 'none',
          };
          
        case 'traditional':
          return {
            background: tradition 
              ? colors.regionalColors[tradition].lotusWhite
              : colors.cultural.lotusWhite,
            color: tradition 
              ? colors.regionalColors[tradition].earthBrown
              : colors.cultural.earthBrown,
            border: borders.cultural.traditional,
            boxShadow: tradition 
              ? shadows.regional[tradition].lotus
              : shadows.cultural.lotus,
            fontFamily: typography.fontFamilies.traditional.join(', '),
          };
          
        case 'spiritual':
          return {
            background: `radial-gradient(circle, ${colors.cultural.spiritualPurple}20, transparent)`,
            color: colors.cultural.spiritualPurple,
            border: borders.cultural.sacred,
            boxShadow: shadows.cultural.spiritual,
            backdropFilter: 'blur(8px)',
          };
      }
    }

    // Standard variants
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary[500],
          color: 'white',
          boxShadow: shadows.interactive.button.default,
        };
        
      case 'secondary':
        return {
          backgroundColor: colors.neutral[100],
          color: colors.neutral[900],
          boxShadow: shadows.interactive.button.default,
          border: `1px solid ${colors.neutral[200]}`,
        };
        
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: colors.primary[600],
          border: `2px solid ${colors.primary[200]}`,
          boxShadow: 'none',
        };
        
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: colors.neutral[700],
          boxShadow: 'none',
          border: 'none',
        };
        
      case 'destructive':
        return {
          backgroundColor: colors.semantic.error,
          color: 'white',
          boxShadow: shadows.interactive.button.default,
        };
        
      case 'meditation':
        return {
          background: `linear-gradient(135deg, ${colors.cultural.spiritualPurple}, ${colors.primary[600]})`,
          color: 'white',
          boxShadow: shadows.meditation.glow,
          border: 'none',
          fontWeight: typography.fontWeights.medium,
        };
        
      case 'breathing':
        return {
          background: `linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(219, 39, 119, 1) 100%)`,
          color: 'white',
          boxShadow: '0 8px 32px rgba(147, 51, 234, 0.25)',
          border: 'none',
          fontWeight: typography.fontWeights.medium,
        };
        
      case 'control':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: colors.neutral[700],
          border: `2px solid ${colors.primary[200]}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(8px)',
        };
        
      default:
        return {};
    }
  };

  // Hover styles
  const getHoverStyles = (): React.CSSProperties => {
    if (isDisabled || isLoading) return {};
    
    const hoverBase = {
      transform: 'translateY(-2px)',
      boxShadow: shadows.interactive.button.hover,
    };

    if (culturalVariant === 'cultural') {
      return {
        ...hoverBase,
        backgroundColor: tradition 
          ? colors.regionalColors[tradition].earthBrown
          : colors.cultural.earthBrown,
        color: tradition 
          ? colors.regionalColors[tradition].lotusWhite
          : colors.cultural.lotusWhite,
      };
    }

    if (culturalVariant === 'meditation') {
      return {
        ...hoverBase,
        boxShadow: shadows.meditation.focus,
      };
    }

    // Handle standard meditation variants
    if (variant === 'meditation') {
      return {
        ...hoverBase,
        boxShadow: shadows.meditation.focus,
        transform: 'translateY(-3px)',
      };
    }
    
    if (variant === 'breathing') {
      return {
        ...hoverBase,
        transform: 'translateY(-3px)',
        boxShadow: '0 12px 40px rgba(147, 51, 234, 0.35)',
      };
    }
    
    if (variant === 'control') {
      return {
        ...hoverBase,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderColor: colors.primary[300],
        transform: 'translateY(-2px)',
      };
    }

    return hoverBase;
  };

  // Focus styles
  const focusStyles: React.CSSProperties = {
    outline: `2px solid ${colors.primary[500]}`,
    outlineOffset: '2px',
  };

  // Active styles
  const activeStyles: React.CSSProperties = {
    transform: 'translateY(0)',
    boxShadow: shadows.interactive.button.active,
  };

  // Ensure size is valid and get size config
  const validSize = (['xs', 'sm', 'md', 'lg', 'xl'] as const).includes(size) ? size : 'md';
  const currentSizeConfig = sizeConfig[validSize];
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...getVariantStyles(),
    padding: `${currentSizeConfig.padding} !important`,
    fontSize: `${currentSizeConfig.fontSize} !important`,
    lineHeight: `${currentSizeConfig.lineHeight} !important`,
    boxSizing: 'border-box !important',
    height: 'auto !important',
    minHeight: 'auto !important',
    ...style,
  };

  // ============= EVENT HANDLERS =============
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || isLoading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && (isDisabled || isLoading)) {
      e.preventDefault();
    }
  };

  // ============= RENDER =============

  return (
    <button
      ref={ref}
      className={`sembalun-button ${className}`}
      style={combinedStyles}
      disabled={isDisabled || isLoading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={testId}
      data-variant={variant}
      data-cultural-variant={culturalVariant}
      data-tradition={tradition}
      data-size={size}
      aria-disabled={isDisabled || isLoading}
      {...rest}
      
      // CSS-in-JS hover and focus effects
      onMouseEnter={(e) => {
        if (!isDisabled && !isLoading) {
          Object.assign(e.currentTarget.style, getHoverStyles());
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled && !isLoading) {
          Object.assign(e.currentTarget.style, combinedStyles);
        }
      }}
      onFocus={(e) => {
        if (!isDisabled && !isLoading) {
          Object.assign(e.currentTarget.style, { ...combinedStyles, ...focusStyles });
        }
      }}
      onBlur={(e) => {
        Object.assign(e.currentTarget.style, combinedStyles);
      }}
      onMouseDown={(e) => {
        if (!isDisabled && !isLoading) {
          Object.assign(e.currentTarget.style, { ...combinedStyles, ...activeStyles });
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled && !isLoading) {
          Object.assign(e.currentTarget.style, { ...combinedStyles, ...getHoverStyles() });
        }
      }}
    >
      {isLoading && (
        <LoadingSpinner size={currentSizeConfig.iconSize} />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

// ============= COMPONENT VARIANTS =============

// Cultural Button variants for easy usage
export const CulturalButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} culturalVariant="cultural" />
);

export const MeditationButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} culturalVariant="meditation" />
);

export const TraditionalButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} culturalVariant="traditional" />
);

export const SpiritualButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} culturalVariant="spiritual" />
);

// Regional Button variants
export const JavaneseButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} culturalVariant="cultural" tradition="javanese" />
);

export const BalineseButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} culturalVariant="cultural" tradition="balinese" />
);

export const SundaneseButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} culturalVariant="cultural" tradition="sundanese" />
);

export const MinangButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} culturalVariant="cultural" tradition="minang" />
);

export default Button;