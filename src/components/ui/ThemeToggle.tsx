import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'floating' | 'button' | 'minimal';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = 'md',
  variant = 'button',
  showLabel = false
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getVariantClasses = () => {
    const baseClasses = "relative rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    switch (variant) {
      case 'floating':
        return `${baseClasses} bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl focus:ring-meditation-zen-500/50`;
      case 'minimal':
        return `${baseClasses} bg-transparent hover:bg-white/10 dark:hover:bg-gray-800/10 focus:ring-meditation-zen-500/50`;
      default:
        return `${baseClasses} bg-white/15 dark:bg-gray-800/15 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl hover:bg-white/25 dark:hover:bg-gray-800/25 focus:ring-meditation-zen-500/50`;
    }
  };

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Terang' },
    { value: 'auto', icon: Monitor, label: 'Sistem' },
    { value: 'dark', icon: Moon, label: 'Gelap' }
  ] as const;

  if (showLabel) {
    return (
      <div className={cn("flex items-center space-x-2 rounded-2xl bg-white/10 dark:bg-gray-800/10 p-1 backdrop-blur-md", className)}>
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          
          return (
            <motion.button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-white/30 dark:bg-gray-700/30 text-meditation-zen-700 dark:text-meditation-zen-300 shadow-md" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-700/20"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={iconSizes[size]} />
              <span className="text-sm font-medium">{option.label}</span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => {
        const currentIndex = themeOptions.findIndex(opt => opt.value === theme);
        const nextIndex = (currentIndex + 1) % themeOptions.length;
        setTheme(themeOptions[nextIndex].value);
      }}
      className={cn(getVariantClasses(), sizeClasses[size], className)}
      whileHover={{ 
        scale: 1.05,
        rotate: resolvedTheme === 'dark' ? 180 : 0 
      }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
      title={`Current: ${theme === 'auto' ? `Auto (${resolvedTheme})` : theme}`}
    >
      <motion.div
        key={theme}
        initial={{ opacity: 0, rotate: -90 }}
        animate={{ opacity: 1, rotate: 0 }}
        exit={{ opacity: 0, rotate: 90 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex items-center justify-center w-full h-full"
      >
        {theme === 'light' && <Sun className={cn(iconSizes[size], "text-yellow-500")} />}
        {theme === 'auto' && <Monitor className={cn(iconSizes[size], "text-blue-500")} />}
        {theme === 'dark' && <Moon className={cn(iconSizes[size], "text-purple-400")} />}
      </motion.div>
      
      {/* Ambient glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-meditation-zen-400/20 to-meditation-focus-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.button>
  );
};