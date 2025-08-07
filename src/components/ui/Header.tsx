
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Bell, Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { scrollToTop } from '../../hooks/useScrollToTop';

// Enhanced 2025 Header Props
interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showSettings?: boolean;
  onSettings?: () => void;
  showNotifications?: boolean;
  onNotifications?: () => void;
  showSearch?: boolean;
  onSearch?: () => void;
  showThemeToggle?: boolean;
  className?: string;
}

// Enhanced 2025 Header Component with Glassmorphic Design
export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack = false, 
  onBack,
  showSettings = false,
  onSettings,
  showNotifications = false,
  onNotifications,
  showSearch = false,
  onSearch,
  showThemeToggle = true,
  className = ''
}) => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`sticky top-0 z-50 ${className}`}
    >
      {/* Enhanced Glassmorphic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/70 dark:from-gray-900/90 dark:via-gray-900/80 dark:to-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20" />
      
      {/* Header Content */}
      <div className="relative flex items-center justify-between px-6 py-4">
        
        {/* Left Section - Back Button */}
        <div className="flex items-center">
          {showBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                scrollToTop();
                onBack?.();
              }}
              className="p-3 -ml-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-gray-600 hover:text-meditation-zen-600 hover:bg-white/30 transition-all duration-200 shadow-lg min-h-[44px] min-w-[44px] touch-manipulation select-none"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Center Section - Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`flex-1 ${showBack ? 'text-center' : 'text-left'}`}
        >
          <h1 className="text-fluid-xl font-heading font-semibold text-gray-800 truncate px-4">
            {title}
          </h1>
          
          {/* Subtle underline decoration */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-px w-16 bg-gradient-to-r from-meditation-zen-400 to-meditation-focus-400 mx-auto mt-1 rounded-full"
            style={{ 
              marginLeft: showBack ? 'auto' : '16px',
              marginRight: showBack ? 'auto' : 'initial'
            }}
          />
        </motion.div>

        {/* Right Section - Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-2"
        >
          {/* Search Button */}
          {showSearch && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSearch}
              className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-gray-600 hover:text-meditation-zen-600 hover:bg-white/30 transition-all duration-200 shadow-lg"
            >
              <Search className="w-5 h-5" />
            </motion.button>
          )}

          {/* Notifications Button */}
          {showNotifications && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNotifications}
              className="relative p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-gray-600 hover:text-meditation-zen-600 hover:bg-white/30 transition-all duration-200 shadow-lg"
            >
              <Bell className="w-5 h-5" />
              {/* Notification Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-400 to-pink-400 rounded-full border-2 border-white shadow-lg"
              />
            </motion.button>
          )}

          {/* Settings Button */}
          {showSettings && (
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSettings}
              className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-gray-600 hover:text-meditation-zen-600 hover:bg-white/30 transition-all duration-200 shadow-lg"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          )}

          {/* Theme Toggle */}
          {showThemeToggle && (
            <ThemeToggle 
              size="md" 
              variant="floating"
              className="shadow-lg"
            />
          )}

          {/* Placeholder for alignment when no buttons */}
          {!showSearch && !showNotifications && !showSettings && !showThemeToggle && (
            <div className="w-12" />
          )}
        </motion.div>
      </div>

      {/* Subtle Ambient Glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top center, rgba(106,143,111,0.05) 0%, transparent 70%)',
          borderRadius: 'inherit'
        }}
      />
    </motion.header>
  );
};