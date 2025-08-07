import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// 2025 Neomorphism 2.0 Component for Meditation Interfaces
const neomorphicCardVariants = cva(
  'relative transition-all duration-300 border border-opacity-20',
  {
    variants: {
      variant: {
        // Convex - raised from surface
        convex: [
          'bg-gradient-to-br from-slate-50 to-slate-100',
          'shadow-[8px_8px_16px_#b8c5d1,-8px_-8px_16px_#ffffff]',
          'border-slate-200',
          'hover:shadow-[12px_12px_20px_#a0b3c2,-12px_-12px_20px_#ffffff]',
        ],
        // Concave - pressed into surface
        concave: [
          'bg-gradient-to-br from-slate-100 to-slate-50',
          'shadow-[inset_8px_8px_16px_#b8c5d1,inset_-8px_-8px_16px_#ffffff]',
          'border-slate-300',
        ],
        // Flat - subtle depth
        flat: [
          'bg-slate-50',
          'shadow-[4px_4px_8px_#b8c5d1,-4px_-4px_8px_#ffffff]',
          'border-slate-200',
          'hover:shadow-[6px_6px_12px_#b8c5d1,-6px_-6px_12px_#ffffff]',
        ],
        // Meditation-specific soft variant
        meditation: [
          'bg-gradient-to-br from-emerald-50/80 to-emerald-100/60',
          'shadow-[6px_6px_12px_rgba(106,143,111,0.15),-6px_-6px_12px_rgba(255,255,255,0.8)]',
          'border-emerald-100',
          'hover:shadow-[8px_8px_16px_rgba(106,143,111,0.2),-8px_-8px_16px_rgba(255,255,255,0.9)]',
        ],
        // Breathing - animated for breathing exercises
        breathing: [
          'bg-gradient-to-br from-blue-50/80 to-blue-100/60',
          'shadow-[6px_6px_12px_rgba(169,193,217,0.15),-6px_-6px_12px_rgba(255,255,255,0.8)]',
          'border-blue-100',
          'animate-pulse',
        ]
      },
      size: {
        sm: 'rounded-lg p-4',
        md: 'rounded-xl p-6',
        lg: 'rounded-2xl p-8',
        xl: 'rounded-3xl p-10',
      },
      interactive: {
        none: '',
        hover: 'hover:scale-[1.02] cursor-pointer',
        press: 'active:scale-[0.98] active:shadow-inner cursor-pointer',
        meditation: 'hover:scale-[1.01] transition-transform duration-700 ease-out cursor-pointer',
      }
    },
    defaultVariants: {
      variant: 'flat',
      size: 'md',
      interactive: 'none',
    },
  }
);

export interface NeomorphicCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof neomorphicCardVariants> {
  children?: React.ReactNode;
  asChild?: boolean;
}

const NeomorphicCard = forwardRef<HTMLDivElement, NeomorphicCardProps>(
  ({ className, variant, size, interactive, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'div' : 'div';

    return (
      <Comp
        className={cn(neomorphicCardVariants({ variant, size, interactive, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

NeomorphicCard.displayName = 'NeomorphicCard';

// Neomorphic Button Component for Meditation Actions
const neomorphicButtonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        meditation: [
          'bg-gradient-to-br from-emerald-50 to-emerald-100',
          'text-emerald-800 shadow-[4px_4px_8px_rgba(106,143,111,0.15),-4px_-4px_8px_rgba(255,255,255,0.8)]',
          'hover:shadow-[6px_6px_12px_rgba(106,143,111,0.2),-6px_-6px_12px_rgba(255,255,255,0.9)]',
          'active:shadow-[inset_4px_4px_8px_rgba(106,143,111,0.15),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]',
          'border border-emerald-100',
        ],
        breathing: [
          'bg-gradient-to-br from-blue-50 to-blue-100',
          'text-blue-800 shadow-[4px_4px_8px_rgba(169,193,217,0.15),-4px_-4px_8px_rgba(255,255,255,0.8)]',
          'hover:shadow-[6px_6px_12px_rgba(169,193,217,0.2),-6px_-6px_12px_rgba(255,255,255,0.9)]',
          'active:shadow-[inset_4px_4px_8px_rgba(169,193,217,0.15),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]',
          'border border-blue-100',
        ],
        calm: [
          'bg-gradient-to-br from-slate-50 to-slate-100',
          'text-slate-700 shadow-[4px_4px_8px_#b8c5d1,-4px_-4px_8px_#ffffff]',
          'hover:shadow-[6px_6px_12px_#a0b3c2,-6px_-6px_12px_#ffffff]',
          'active:shadow-[inset_4px_4px_8px_#b8c5d1,inset_-4px_-4px_8px_#ffffff]',
          'border border-slate-200',
        ]
      },
      size: {
        sm: 'h-9 px-6 text-sm',
        md: 'h-12 px-8 text-base',
        lg: 'h-14 px-10 text-lg',
        xl: 'h-16 px-12 text-xl',
      }
    },
    defaultVariants: {
      variant: 'meditation',
      size: 'md',
    },
  }
);

export interface NeomorphicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neomorphicButtonVariants> {
  children?: React.ReactNode;
}

const NeomorphicButton = forwardRef<HTMLButtonElement, NeomorphicButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(neomorphicButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeomorphicButton.displayName = 'NeomorphicButton';

// Neomorphic Input for Meditation Settings
export interface NeomorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'meditation' | 'calm';
}

const NeomorphicInput = forwardRef<HTMLInputElement, NeomorphicInputProps>(
  ({ className, variant = 'meditation', ...props }, ref) => {
    const variantStyles = {
      meditation: [
        'bg-gradient-to-br from-emerald-50 to-emerald-100',
        'shadow-[inset_4px_4px_8px_rgba(106,143,111,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]',
        'border-emerald-200 text-emerald-800 placeholder:text-emerald-400',
        'focus:shadow-[inset_6px_6px_12px_rgba(106,143,111,0.15),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]',
      ].join(' '),
      calm: [
        'bg-gradient-to-br from-slate-50 to-slate-100',
        'shadow-[inset_4px_4px_8px_#b8c5d1,inset_-4px_-4px_8px_#ffffff]',
        'border-slate-200 text-slate-700 placeholder:text-slate-400',
        'focus:shadow-[inset_6px_6px_12px_#a0b3c2,inset_-6px_-6px_12px_#ffffff]',
      ].join(' ')
    };

    return (
      <input
        className={cn(
          'flex h-12 w-full rounded-xl border px-4 py-2 text-base transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

NeomorphicInput.displayName = 'NeomorphicInput';

export { NeomorphicCard, NeomorphicButton, NeomorphicInput, neomorphicCardVariants, neomorphicButtonVariants };