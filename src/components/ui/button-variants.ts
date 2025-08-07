import { cva } from 'class-variance-authority';

// 2025 Enhanced Button Variants - Mobile-First Design
export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white/20 dark:border-white/10 backdrop-blur-md touch-manipulation select-none active:scale-95 cursor-pointer',
  {
    variants: {
      variant: {
        // Primary glassmorphic button for main actions
        default: [
          'bg-primary-400/15 dark:bg-primary-400/20 text-primary-800 dark:text-primary-200 hover:bg-primary-400/25 dark:hover:bg-primary-400/30',
          'shadow-lg shadow-primary-900/10 dark:shadow-primary-900/20 hover:shadow-primary-900/20 dark:hover:shadow-primary-900/30',
          'border-primary-200/30 dark:border-primary-200/20 focus-visible:ring-primary-500',
        ],
        // Meditation-specific variant
        meditation: [
          'bg-meditation-zen-400/15 dark:bg-meditation-zen-400/25 text-meditation-zen-800 dark:text-meditation-zen-200 hover:bg-meditation-zen-400/25 dark:hover:bg-meditation-zen-400/35',
          'shadow-lg shadow-meditation-zen-900/10 dark:shadow-meditation-zen-900/25 hover:shadow-meditation-zen-900/20 dark:hover:shadow-meditation-zen-900/35',
          'border-meditation-zen-200/30 dark:border-meditation-zen-200/20 focus-visible:ring-meditation-zen-500',
        ],
        // Breathing exercises variant
        breathing: [
          'bg-meditation-focus-400/15 dark:bg-meditation-focus-400/25 text-meditation-focus-800 dark:text-meditation-focus-200 hover:bg-meditation-focus-400/25 dark:hover:bg-meditation-focus-400/35',
          'shadow-lg shadow-meditation-focus-900/10 dark:shadow-meditation-focus-900/25 hover:shadow-meditation-focus-900/20 dark:hover:shadow-meditation-focus-900/35',
          'border-meditation-focus-200/30 dark:border-meditation-focus-200/20 focus-visible:ring-meditation-focus-500',
        ],
        // Calm/neutral variant
        calm: [
          'bg-meditation-calm-400/15 dark:bg-meditation-calm-400/25 text-meditation-calm-800 dark:text-meditation-calm-200 hover:bg-meditation-calm-400/25 dark:hover:bg-meditation-calm-400/35',
          'shadow-lg shadow-meditation-calm-900/10 dark:shadow-meditation-calm-900/25 hover:shadow-meditation-calm-900/20 dark:hover:shadow-meditation-calm-900/35',
          'border-meditation-calm-200/30 dark:border-meditation-calm-200/20 focus-visible:ring-meditation-calm-500',
        ],
        // Neomorphic variant for special actions
        neomorphic: [
          'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700',
          'shadow-neomorphism-convex hover:shadow-[12px_12px_20px_#a0b3c2,-12px_-12px_20px_#ffffff]',
          'border-slate-200 focus-visible:ring-slate-500',
          'active:shadow-neomorphism-concave',
        ],
        // Ghost variant for subtle actions
        ghost: [
          'bg-white/5 text-gray-700 hover:bg-white/15',
          'shadow-lg shadow-black/5 hover:shadow-black/10',
          'border-white/10',
        ],
        // Destructive actions
        destructive: [
          'bg-red-500/15 text-red-800 hover:bg-red-500/25',
          'shadow-lg shadow-red-900/10 hover:shadow-red-900/20',
          'border-red-200/30 focus-visible:ring-red-500',
        ],
        // Success actions
        success: [
          'bg-green-500/15 text-green-800 hover:bg-green-500/25',
          'shadow-lg shadow-green-900/10 hover:shadow-green-900/20',
          'border-green-200/30 focus-visible:ring-green-500',
        ],
      },
      size: {
        sm: 'h-11 px-6 text-sm rounded-lg min-h-[44px]', // Mobile-optimized minimum touch target
        default: 'h-12 px-8 text-base rounded-xl min-h-[48px]',
        lg: 'h-14 px-10 text-lg rounded-xl min-h-[56px]',
        xl: 'h-16 px-12 text-xl rounded-2xl min-h-[64px]',
        icon: 'h-12 w-12 rounded-xl min-h-[44px] min-w-[44px]', // Ensure minimum touch target
      },
      glow: {
        none: '',
        subtle: 'shadow-[0_0_20px_rgba(255,255,255,0.1)]',
        medium: 'shadow-[0_0_30px_rgba(255,255,255,0.15)]',
        strong: 'shadow-[0_0_40px_rgba(255,255,255,0.2)]',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      glow: 'none',
    },
  }
);