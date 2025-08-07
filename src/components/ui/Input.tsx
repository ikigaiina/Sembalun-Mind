import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// 2025 Enhanced Input Component - Glassmorphic and Neomorphic variants
const inputVariants = cva(
  'flex w-full text-base transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation -webkit-appearance-none',
  {
    variants: {
      variant: {
        // Default glassmorphic input
        default: [
          'bg-white/10 backdrop-blur-md border border-white/20',
          'text-gray-800 placeholder:text-gray-500',
          'focus:bg-white/15 focus:border-white/30',
          'focus-visible:ring-2 focus-visible:ring-primary-500/20',
        ],
        // Meditation-specific input
        meditation: [
          'bg-meditation-zen-100/10 backdrop-blur-md border border-meditation-zen-200/30',
          'text-meditation-zen-800 placeholder:text-meditation-zen-400',
          'focus:bg-meditation-zen-100/15 focus:border-meditation-zen-200/50',
          'focus-visible:ring-2 focus-visible:ring-meditation-zen-500/20',
        ],
        // Breathing exercises input
        breathing: [
          'bg-meditation-focus-100/10 backdrop-blur-md border border-meditation-focus-200/30',
          'text-meditation-focus-800 placeholder:text-meditation-focus-400',
          'focus:bg-meditation-focus-100/15 focus:border-meditation-focus-200/50',
          'focus-visible:ring-2 focus-visible:ring-meditation-focus-500/20',
        ],
        // Calm/neutral input
        calm: [
          'bg-meditation-calm-100/10 backdrop-blur-md border border-meditation-calm-200/30',
          'text-meditation-calm-800 placeholder:text-meditation-calm-400',
          'focus:bg-meditation-calm-100/15 focus:border-meditation-calm-200/50',
          'focus-visible:ring-2 focus-visible:ring-meditation-calm-500/20',
        ],
        // Neomorphic input variant
        neomorphic: [
          'bg-gradient-to-br from-slate-50 to-slate-100',
          'shadow-neomorphism-concave',
          'border-slate-200 text-slate-700 placeholder:text-slate-400',
          'focus:shadow-[inset_6px_6px_12px_#a0b3c2,inset_-6px_-6px_12px_#ffffff]',
          'focus-visible:ring-2 focus-visible:ring-slate-500/20',
        ],
        // Ghost variant for minimal styling
        ghost: [
          'bg-transparent border-gray-200',
          'text-gray-700 placeholder:text-gray-400',
          'focus:border-primary-300 focus:bg-white/50',
          'focus-visible:ring-2 focus-visible:ring-primary-500/20',
        ],
        // Solid variant for forms
        solid: [
          'bg-white border-gray-200',
          'text-gray-900 placeholder:text-gray-400',
          'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
        ],
      },
      size: {
        sm: 'h-11 px-3 py-2 text-sm rounded-lg min-h-[44px]', // Mobile-optimized touch target
        default: 'h-12 px-4 py-3 text-base rounded-xl min-h-[48px]',
        lg: 'h-14 px-5 py-4 text-lg rounded-xl min-h-[56px]',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = 'text', 
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    ...props 
  }, ref) => {
    const hasError = !!error;
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Start Icon */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {startIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant, size }),
              hasError && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : 
              helperText ? `${inputId}-helper` : 
              undefined
            }
            {...props}
          />

          {/* End Icon */}
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {endIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p 
            id={`${inputId}-error`}
            className="mt-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p 
            id={`${inputId}-helper`}
            className="mt-2 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Specialized Input Components
export const MeditationInput = forwardRef<HTMLInputElement, Omit<InputProps, 'variant'>>(
  (props, ref) => <Input {...props} variant="meditation" ref={ref} />
);

export const BreathingInput = forwardRef<HTMLInputElement, Omit<InputProps, 'variant'>>(
  (props, ref) => <Input {...props} variant="breathing" ref={ref} />
);

export const NeomorphicInput = forwardRef<HTMLInputElement, Omit<InputProps, 'variant'>>(
  (props, ref) => <Input {...props} variant="neomorphic" ref={ref} />
);

MeditationInput.displayName = 'MeditationInput';
BreathingInput.displayName = 'BreathingInput';
NeomorphicInput.displayName = 'NeomorphicInput';

export { Input, inputVariants };