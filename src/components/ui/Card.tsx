import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// 2025 Enhanced Card Component - Glassmorphic by default
const cardVariants = cva(
  'relative overflow-hidden transition-all duration-300 border border-white/20 dark:border-white/10',
  {
    variants: {
      variant: {
        // Default glassmorphic card
        default: [
          'bg-white/15 dark:bg-white/5 backdrop-blur-md',
          'shadow-glassmorphism shadow-black/10 dark:shadow-black/20',
          'hover:bg-white/20 dark:hover:bg-white/8 hover:backdrop-blur-lg',
        ],
        // Meditation-specific with emerald tint
        meditation: [
          'bg-meditation-zen-100/10 dark:bg-meditation-zen-100/5 backdrop-blur-md',
          'shadow-glassmorphism shadow-meditation-zen-900/5 dark:shadow-meditation-zen-900/15',
          'hover:bg-meditation-zen-100/15 dark:hover:bg-meditation-zen-100/8 hover:backdrop-blur-lg',
          'border-meditation-zen-200/30 dark:border-meditation-zen-200/20',
        ],
        // Breathing exercises with blue tint
        breathing: [
          'bg-meditation-focus-100/10 backdrop-blur-md',
          'shadow-glassmorphism shadow-meditation-focus-900/5',
          'hover:bg-meditation-focus-100/15 hover:backdrop-blur-lg',
          'border-meditation-focus-200/30',
        ],
        // Calm sessions with neutral tint
        calm: [
          'bg-meditation-calm-100/10 backdrop-blur-md',
          'shadow-glassmorphism shadow-meditation-calm-900/5',
          'hover:bg-meditation-calm-100/15 hover:backdrop-blur-lg',
          'border-meditation-calm-200/30',
        ],
        // Neomorphic variant for special contexts
        neomorphic: [
          'bg-gradient-to-br from-slate-50/80 to-slate-100/60',
          'shadow-neomorphism-convex',
          'border-slate-200',
          'hover:shadow-[12px_12px_20px_#a0b3c2,-12px_-12px_20px_#ffffff]',
        ],
        // Heavy glassmorphism for modals
        heavy: [
          'bg-white/20 backdrop-blur-lg',
          'shadow-glassmorphism-lg shadow-black/15',
          'hover:bg-white/25 hover:backdrop-blur-xl',
        ],
        // Dark glassmorphism for dark mode
        dark: [
          'bg-black/10 backdrop-blur-md',
          'shadow-glassmorphism shadow-white/5',
          'hover:bg-black/15 hover:backdrop-blur-lg',
          'border-white/10',
        ]
      },
      size: {
        sm: 'rounded-lg p-4',
        default: 'rounded-xl p-6',
        lg: 'rounded-2xl p-8',
        xl: 'rounded-3xl p-10',
      },
      interactive: {
        none: '',
        hover: 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer',
        press: 'active:scale-[0.98] cursor-pointer',
        meditation: 'hover:scale-[1.01] hover:shadow-meditation-glow transition-all duration-500 cursor-pointer',
        float: 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer',
      },
      glow: {
        none: '',
        subtle: 'shadow-[0_0_20px_rgba(255,255,255,0.1)]',
        medium: 'shadow-[0_0_30px_rgba(255,255,255,0.15)]',
        strong: 'shadow-[0_0_40px_rgba(255,255,255,0.2)]',
        meditation: 'shadow-meditation-glow',
        breathing: 'shadow-breathing-glow',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: 'none',
      glow: 'none',
    },
  }
);

// Enhanced backdrop element for depth
const CardBackdrop = ({ variant }: { variant?: string }) => {
  const backdropStyles = {
    meditation: 'bg-gradient-to-br from-meditation-zen-400/5 to-meditation-zen-600/5',
    breathing: 'bg-gradient-to-br from-meditation-focus-400/5 to-meditation-focus-600/5',
    calm: 'bg-gradient-to-br from-meditation-calm-400/5 to-meditation-calm-600/5',
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

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children?: React.ReactNode;
  showBackdrop?: boolean;
  asChild?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
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
        className={cn(cardVariants({ variant, size, interactive, glow, className }))}
        ref={ref}
        {...props}
      >
        {showBackdrop && <CardBackdrop variant={variant} />}
        {children}
      </Comp>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for semantic structure
const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  cardVariants 
};