import React, { forwardRef, useState } from 'react';
import { designTokens } from '../../design-system/foundations';

// ============= COMPONENT INTERFACES =============

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Core properties
  label?: string;
  error?: string;
  helperText?: string;
  
  // Visual variants
  variant?: 'default' | 'meditation' | 'cultural' | 'traditional';
  
  // Cultural variants
  tradition?: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  
  // Size variants
  size?: 'sm' | 'md' | 'lg';
  
  // State variants
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  
  // Icons
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // Accessibility
  'aria-label'?: string;
  testId?: string;
  
  // Custom styling
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  
  // Meditation-specific
  focusRing?: boolean;
  breathingEffect?: boolean;
}

// ============= INPUT COMPONENT =============

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  tradition,
  size = 'md',
  isRequired = false,
  isInvalid = false,
  isDisabled = false,
  icon,
  rightIcon,
  labelClassName = '',
  inputClassName = '',
  containerClassName = '',
  focusRing = true,
  breathingEffect = false,
  testId,
  id,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [, setHasValue] = useState(false);

  const { colors, typography, spacing, shadows, borders, animations } = designTokens;

  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Size configurations
  const sizeConfig = {
    sm: {
      height: '40px',
      fontSize: typography.fontSizes.sm,
      padding: `${spacing[2]} ${spacing[3]}`,
      iconSize: '16px',
    },
    md: {
      height: '48px',
      fontSize: typography.fontSizes.base,
      padding: `${spacing[3]} ${spacing[4]}`,
      iconSize: '20px',
    },
    lg: {
      height: '56px',
      fontSize: typography.fontSizes.lg,
      padding: `${spacing[4]} ${spacing[5]}`,
      iconSize: '24px',
    },
  };

  const currentSizeConfig = sizeConfig[size];

  // Get variant colors
  const getVariantColors = () => {
    if (tradition && colors.regionalColors[tradition]) {
      const regionalColors = colors.regionalColors[tradition];
      return {
        borderColor: regionalColors.earthBrown,
        focusBorderColor: regionalColors.templeGold,
        backgroundColor: regionalColors.lotusWhite,
        textColor: regionalColors.earthBrown,
        labelColor: regionalColors.earthBrown,
        shadowColor: regionalColors.spiritualPurple,
      };
    }

    switch (variant) {
      case 'meditation':
        return {
          borderColor: colors.cultural.spiritualPurple,
          focusBorderColor: colors.cultural.templeGold,
          backgroundColor: 'rgba(147, 51, 234, 0.02)',
          textColor: colors.neutral[800],
          labelColor: colors.cultural.spiritualPurple,
          shadowColor: colors.cultural.spiritualPurple,
        };
      
      case 'cultural':
        return {
          borderColor: colors.cultural.earthBrown,
          focusBorderColor: colors.cultural.templeGold,
          backgroundColor: colors.cultural.lotusWhite,
          textColor: colors.cultural.earthBrown,
          labelColor: colors.cultural.earthBrown,
          shadowColor: colors.cultural.templeGold,
        };
      
      case 'traditional':
        return {
          borderColor: colors.cultural.earthBrown,
          focusBorderColor: colors.cultural.spiritualPurple,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          textColor: colors.cultural.earthBrown,
          labelColor: colors.cultural.earthBrown,
          shadowColor: colors.cultural.earthBrown,
        };
      
      default:
        return {
          borderColor: colors.neutral[300],
          focusBorderColor: colors.primary[500],
          backgroundColor: colors.neutral[50],
          textColor: colors.neutral[800],
          labelColor: colors.neutral[700],
          shadowColor: colors.primary[500],
        };
    }
  };

  const variantColors = getVariantColors();

  // Container styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
  };

  // Label styles
  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: spacing[2],
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: error ? colors.semantic.error : variantColors.labelColor,
    fontFamily: typography.fontFamilies.primary.join(', '),
  };

  // Input wrapper styles
  const inputWrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  // Input styles
  const inputStyles: React.CSSProperties = {
    width: '100%',
    height: currentSizeConfig.height,
    padding: currentSizeConfig.padding,
    paddingLeft: icon ? `${parseInt(spacing[4]) + 24}px` : currentSizeConfig.padding.split(' ')[1],
    paddingRight: rightIcon ? `${parseInt(spacing[4]) + 24}px` : currentSizeConfig.padding.split(' ')[1],
    fontSize: currentSizeConfig.fontSize,
    fontFamily: typography.fontFamilies.primary.join(', '),
    fontWeight: typography.fontWeights.normal,
    lineHeight: 1.2,
    color: isDisabled ? colors.neutral[400] : variantColors.textColor,
    backgroundColor: isDisabled ? colors.neutral[100] : variantColors.backgroundColor,
    border: `2px solid ${
      error || isInvalid 
        ? colors.semantic.error 
        : isFocused 
          ? variantColors.focusBorderColor 
          : variantColors.borderColor
    }`,
    borderRadius: borders.radius.lg,
    outline: 'none',
    transition: `all ${animations.duration.normal} ${animations.easing.easeInOut}`,
    boxShadow: isFocused && focusRing ? 
      `0 0 0 3px ${variantColors.shadowColor}20, ${shadows.interactive.button.default}` : 
      'none',
    cursor: isDisabled ? 'not-allowed' : 'text',
    
    // Breathing effect animation
    ...(breathingEffect && isFocused ? {
      animation: `breathe ${animations.meditation.breathe.duration} ${animations.meditation.breathe.easing} ${animations.meditation.breathe.direction} ${animations.meditation.breathe.iterationCount}`,
    } : {}),
  };

  // Icon styles
  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: currentSizeConfig.iconSize,
    height: currentSizeConfig.iconSize,
    color: error ? colors.semantic.error : variantColors.labelColor,
    pointerEvents: 'none',
  };

  const leftIconStyles: React.CSSProperties = {
    ...iconStyles,
    left: spacing[3],
  };

  const rightIconStyles: React.CSSProperties = {
    ...iconStyles,
    right: spacing[3],
  };

  // Helper text styles
  const helperTextStyles: React.CSSProperties = {
    marginTop: spacing[1.5],
    fontSize: typography.fontSizes.xs,
    color: error ? colors.semantic.error : colors.neutral[600],
    fontFamily: typography.fontFamilies.primary.join(', '),
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    rest.onChange?.(e);
  };

  // Handle focus events
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    rest.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    rest.onBlur?.(e);
  };

  return (
    <div 
      className={`sembalun-input ${containerClassName}`}
      style={containerStyles}
      data-testid={testId}
    >
      {label && (
        <label 
          htmlFor={inputId}
          className={`sembalun-input-label ${labelClassName}`}
          style={labelStyles}
        >
          {label}
          {isRequired && (
            <span style={{ color: colors.semantic.error, marginLeft: spacing[1] }}>
              *
            </span>
          )}
        </label>
      )}
      
      <div style={inputWrapperStyles}>
        {icon && (
          <div style={leftIconStyles}>
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`sembalun-input-field ${inputClassName}`}
          style={inputStyles}
          disabled={isDisabled}
          required={isRequired}
          aria-invalid={error || isInvalid ? 'true' : 'false'}
          aria-describedby={
            (error || helperText) ? `${inputId}-helper-text` : undefined
          }
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        
        {rightIcon && (
          <div style={rightIconStyles}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div 
          id={`${inputId}-helper-text`}
          style={helperTextStyles}
          role={error ? 'alert' : 'status'}
        >
          {error || helperText}
        </div>
      )}

      {/* Breathing animation CSS */}
      {breathingEffect && (
        <style jsx>{`
          @keyframes breathe {
            0%, 100% { box-shadow: 0 0 0 3px ${variantColors.shadowColor}20; }
            50% { box-shadow: 0 0 0 6px ${variantColors.shadowColor}40; }
          }
        `}</style>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// ============= COMPONENT VARIANTS =============

export const MeditationInput: React.FC<InputProps> = (props) => (
  <Input {...props} variant="meditation" breathingEffect={true} />
);

export const CulturalInput: React.FC<InputProps> = (props) => (
  <Input {...props} variant="cultural" />
);

export const TraditionalInput: React.FC<InputProps> = (props) => (
  <Input {...props} variant="traditional" />
);

// Regional Input variants
export const JavaneseInput: React.FC<InputProps> = (props) => (
  <Input {...props} variant="cultural" tradition="javanese" />
);

export const BalineseInput: React.FC<InputProps> = (props) => (
  <Input {...props} variant="cultural" tradition="balinese" />
);

export const SundaneseInput: React.FC<InputProps> = (props) => (
  <Input {...props} variant="cultural" tradition="sundanese" />
);

export const MinangInput: React.FC<InputProps> = (props) => (
  <Input {...props} variant="cultural" tradition="minang" />
);

export default Input;