import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// 2025 Glassmorphism Component with Enhanced Depth for Meditation
const glassmorphicCardVariants = cva(
  'relative overflow-hidden transition-all duration-300 border border-white/20',
  {
    variants: {
      variant: {
        // Light glassmorphism for primary content
        light: [
          'bg-white/10 backdrop-blur-sm',
          'shadow-lg shadow-black/5',
          'hover:bg-white/15 hover:backdrop-blur-md',
        ],
        // Medium glassmorphism for cards
        medium: [
          'bg-white/15 backdrop-blur-md',
          'shadow-xl shadow-black/10',
          'hover:bg-white/20 hover:backdrop-blur-lg',
        ],
        // Heavy glassmorphism for modals and overlays
        heavy: [
          'bg-white/20 backdrop-blur-lg',
          'shadow-2xl shadow-black/15',
          'hover:bg-white/25 hover:backdrop-blur-xl',
        ],
        // Meditation-specific with emerald tint
        meditation: [
          'bg-emerald-100/10 backdrop-blur-md',
          'shadow-xl shadow-emerald-900/5',
          'hover:bg-emerald-100/15 hover:backdrop-blur-lg',
          'border-emerald-200/30',
        ],
        // Breathing exercises with blue tint
        breathing: [
          'bg-blue-100/10 backdrop-blur-md',
          'shadow-xl shadow-blue-900/5',
          'hover:bg-blue-100/15 hover:backdrop-blur-lg',
          'border-blue-200/30',
        ],
        // Calm sessions with neutral tint
        calm: [
          'bg-slate-100/10 backdrop-blur-md',
          'shadow-xl shadow-slate-900/5',
          'hover:bg-slate-100/15 hover:backdrop-blur-lg',
          'border-slate-200/30',
        ],
        // Dark glassmorphism for dark mode
        dark: [
          'bg-black/10 backdrop-blur-md',
          'shadow-xl shadow-white/5',
          'hover:bg-black/15 hover:backdrop-blur-lg',
          'border-white/10',
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
        hover: 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer',
        press: 'active:scale-[0.98] cursor-pointer',
        meditation: 'hover:scale-[1.01] hover:shadow-emerald-900/10 transition-all duration-500 cursor-pointer',
        float: 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer',
      },
      glow: {
        none: '',
        subtle: 'shadow-[0_0_20px_rgba(255,255,255,0.1)]',
        medium: 'shadow-[0_0_30px_rgba(255,255,255,0.15)]',
        strong: 'shadow-[0_0_40px_rgba(255,255,255,0.2)]',
        meditation: 'shadow-[0_0_25px_rgba(106,143,111,0.15)]',
        breathing: 'shadow-[0_0_25px_rgba(169,193,217,0.15)]',
      }
    },
    defaultVariants: {
      variant: 'medium',
      size: 'md',
      interactive: 'none',
      glow: 'none',
    },
  }
);

// Enhanced backdrop element for depth
const GlassBackdrop = ({ variant }: { variant?: string }) => {
  const backdropStyles = {
    meditation: 'bg-gradient-to-br from-emerald-400/5 to-emerald-600/5',
    breathing: 'bg-gradient-to-br from-blue-400/5 to-blue-600/5',
    calm: 'bg-gradient-to-br from-slate-400/5 to-slate-600/5',
    default: 'bg-gradient-to-br from-white/5 to-white/10',
  };

  return (
    <div 
      className={cn(
        'absolute inset-0 -z-10 rounded-inherit',
        backdropStyles[variant as keyof typeof backdropStyles] || backdropStyles.default
      )}
    />
  );
};

export interface GlassmorphicCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassmorphicCardVariants> {
  children?: React.ReactNode;
  showBackdrop?: boolean;
  asChild?: boolean;
}

const GlassmorphicCard = forwardRef<HTMLDivElement, GlassmorphicCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    interactive, 
    glow, 
    children, 
    showBackdrop = false,
    asChild = false, 
    ...props 
  }, ref) => {
    const Comp = asChild ? 'div' : 'div';

    return (
      <Comp
        className={cn(glassmorphicCardVariants({ variant, size, interactive, glow, className }))}
        ref={ref}
        {...props}
      >
        {showBackdrop && <GlassBackdrop variant={variant} />}
        {children}
      </Comp>
    );
  }
);

GlassmorphicCard.displayName = 'GlassmorphicCard';

// Glassmorphic Button for Meditation Actions
const glassmorphicButtonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white/20 backdrop-blur-md',
  {
    variants: {
      variant: {
        meditation: [
          'bg-emerald-100/15 text-emerald-800 hover:bg-emerald-100/25',
          'shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20',
          'border-emerald-200/30 focus-visible:ring-emerald-500',
        ],
        breathing: [
          'bg-blue-100/15 text-blue-800 hover:bg-blue-100/25',
          'shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20',
          'border-blue-200/30 focus-visible:ring-blue-500',
        ],
        calm: [
          'bg-slate-100/15 text-slate-800 hover:bg-slate-100/25',
          'shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20',
          'border-slate-200/30 focus-visible:ring-slate-500',
        ],
        ghost: [
          'bg-white/5 text-gray-700 hover:bg-white/15',
          'shadow-lg shadow-black/5 hover:shadow-black/10',
        ]
      },
      size: {
        sm: 'h-9 px-6 text-sm rounded-lg',
        md: 'h-12 px-8 text-base rounded-xl',
        lg: 'h-14 px-10 text-lg rounded-xl',
        xl: 'h-16 px-12 text-xl rounded-2xl',
      }
    },
    defaultVariants: {
      variant: 'meditation',
      size: 'md',
    },
  }
);

export interface GlassmorphicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassmorphicButtonVariants> {
  children?: React.ReactNode;
  glow?: boolean;
}

const GlassmorphicButton = forwardRef<HTMLButtonElement, GlassmorphicButtonProps>(
  ({ className, variant, size, children, glow = false, ...props }, ref) => {
    return (
      <button
        className={cn(
          glassmorphicButtonVariants({ variant, size }),
          glow && 'shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassmorphicButton.displayName = 'GlassmorphicButton';

// Glassmorphic Input for Settings
export interface GlassmorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'meditation' | 'calm' | 'breathing';
}

const GlassmorphicInput = forwardRef<HTMLInputElement, GlassmorphicInputProps>(
  ({ className, variant = 'meditation', ...props }, ref) => {
    const variantStyles = {
      meditation: [
        'bg-emerald-100/10 border-emerald-200/30 text-emerald-800 placeholder:text-emerald-500',
        'focus:bg-emerald-100/15 focus:border-emerald-200/50',
      ].join(' '),
      breathing: [
        'bg-blue-100/10 border-blue-200/30 text-blue-800 placeholder:text-blue-500',
        'focus:bg-blue-100/15 focus:border-blue-200/50',
      ].join(' '),
      calm: [
        'bg-slate-100/10 border-slate-200/30 text-slate-800 placeholder:text-slate-500',
        'focus:bg-slate-100/15 focus:border-slate-200/50',
      ].join(' ')
    };

    return (
      <input
        className={cn(
          'flex h-12 w-full rounded-xl border backdrop-blur-md px-4 py-2 text-base transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'shadow-lg shadow-black/5',
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

GlassmorphicInput.displayName = 'GlassmorphicInput';

// Glassmorphic Modal Component
export interface GlassmorphicModalProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: 'meditation' | 'breathing' | 'calm';
  blur?: 'light' | 'medium' | 'heavy';
}

const GlassmorphicModal = forwardRef<HTMLDivElement, GlassmorphicModalProps>(
  ({ className, children, variant = 'meditation', blur = 'heavy', ...props }, ref) => {
    const variantStyles = {
      meditation: 'bg-emerald-100/20 border-emerald-200/30',
      breathing: 'bg-blue-100/20 border-blue-200/30',
      calm: 'bg-slate-100/20 border-slate-200/30',
    };

    const blurStyles = {
      light: 'backdrop-blur-sm',
      medium: 'backdrop-blur-md',
      heavy: 'backdrop-blur-xl',
    };

    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          blurStyles[blur],
          'bg-black/20'
        )}
        {...props}
      >
        <div
          className={cn(
            'relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl',
            blurStyles[blur],
            variantStyles[variant],
            'shadow-black/20',
            className
          )}
          ref={ref}
        >
          {children}
        </div>
      </div>
    );
  }
);

GlassmorphicModal.displayName = 'GlassmorphicModal';

export { 
  GlassmorphicCard, 
  GlassmorphicButton, 
  GlassmorphicInput, 
  GlassmorphicModal,
  glassmorphicCardVariants, 
  glassmorphicButtonVariants 
};