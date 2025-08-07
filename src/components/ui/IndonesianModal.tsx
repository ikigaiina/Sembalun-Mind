import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

// Indonesian Cultural Colors - Earth Tones
const INDONESIAN_COLORS = {
  primary: {
    green: '#2D7D32', // Deep forest green
    brown: '#5D4037', // Rich earth brown
    gold: '#FF8F00',  // Traditional gold
    terracotta: '#BF360C' // Clay red
  },
  secondary: {
    bamboo: '#689F38', // Bamboo green
    teak: '#795548',   // Teak wood
    sunrise: '#FFA726', // Golden sunrise
    batik: '#1565C0'   // Traditional blue
  },
  neutral: {
    stone: '#9E9E9E',
    sand: '#EFEBE9',
    mist: '#F5F5F5',
    shadow: '#424242'
  }
};

// Indonesian Cultural Patterns
const CULTURAL_PATTERNS = {
  batik: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDEwQzE1LjU4IDEwIDEyIDEzLjU4IDEyIDEzSDI4QzI4IDEzLjU4IDI0LjQyIDEwIDIwIDEwWiIgZmlsbD0iIzJENzQzMiIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMyIgZmlsbD0iI0ZGOEYwMCIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPHN2Zz4K',
  geometric: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBvbHlnb24gcG9pbnRzPSIxMCwyIDEzLjUsNi41IDEwLDkgNi41LDYuNSIgZmlsbD0iIzJENzQzMiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPgo='
};

// Indonesian Gesture Patterns
const GESTURE_THRESHOLDS = {
  swipeDown: 100,    // Close modal by swiping down
  swipeRight: 120,   // Navigate back with right swipe (Indonesian reading pattern)
  swipeLeft: 120,    // Navigate forward with left swipe
  tapOutside: 'close' // Familiar tap-outside-to-close
};

interface IndonesianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  culturalTheme?: 'meditation' | 'learning' | 'community' | 'nature';
  showHeader?: boolean;
  showBackButton?: boolean;
  gestureEnabled?: boolean;
  darkMode?: boolean;
  className?: string;
}

export const IndonesianModal: React.FC<IndonesianModalProps> = ({
  isOpen,
  onClose,
  onBack,
  title,
  children,
  size = 'medium',
  culturalTheme = 'meditation',
  showHeader = true,
  showBackButton = false,
  gestureEnabled = true,
  darkMode = false,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Cultural theme colors
  const getThemeColors = () => {
    switch (culturalTheme) {
      case 'meditation':
        return {
          primary: INDONESIAN_COLORS.primary.green,
          secondary: INDONESIAN_COLORS.secondary.bamboo,
          accent: INDONESIAN_COLORS.primary.gold,
          background: darkMode ? '#1A4D2E' : INDONESIAN_COLORS.neutral.mist
        };
      case 'learning':
        return {
          primary: INDONESIAN_COLORS.secondary.batik,
          secondary: INDONESIAN_COLORS.primary.brown,
          accent: INDONESIAN_COLORS.primary.gold,
          background: darkMode ? '#1A365D' : INDONESIAN_COLORS.neutral.sand
        };
      case 'community':
        return {
          primary: INDONESIAN_COLORS.primary.terracotta,
          secondary: INDONESIAN_COLORS.secondary.sunrise,
          accent: INDONESIAN_COLORS.primary.gold,
          background: darkMode ? '#4A1C1C' : INDONESIAN_COLORS.neutral.mist
        };
      case 'nature':
        return {
          primary: INDONESIAN_COLORS.secondary.teak,
          secondary: INDONESIAN_COLORS.secondary.bamboo,
          accent: INDONESIAN_COLORS.secondary.sunrise,
          background: darkMode ? '#2D2D2D' : INDONESIAN_COLORS.neutral.sand
        };
      default:
        return {
          primary: INDONESIAN_COLORS.primary.green,
          secondary: INDONESIAN_COLORS.secondary.bamboo,
          accent: INDONESIAN_COLORS.primary.gold,
          background: darkMode ? '#1A4D2E' : INDONESIAN_COLORS.neutral.mist
        };
    }
  };

  const themeColors = getThemeColors();

  // Modal size configurations
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'max-w-sm w-full mx-4';
      case 'medium':
        return 'max-w-md w-full mx-4';
      case 'large':
        return 'max-w-2xl w-full mx-4';
      case 'fullscreen':
        return 'w-full h-full m-0';
      default:
        return 'max-w-md w-full mx-4';
    }
  };

  // Handle gesture navigation
  useEffect(() => {
    if (!gestureEnabled || !isOpen) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      currentX = e.touches[0].clientX - startX;
      currentY = e.touches[0].clientY - startY;
      
      // Apply drag resistance for smooth feel
      const resistance = 0.6;
      setDragPosition({
        x: currentX * resistance,
        y: Math.max(0, currentY * resistance) // Only allow downward drag
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      
      // Check for gesture completion
      if (currentY > GESTURE_THRESHOLDS.swipeDown) {
        // Close modal with downward swipe
        onClose();
      } else if (currentX > GESTURE_THRESHOLDS.swipeRight && onBack) {
        // Navigate back with right swipe (Indonesian pattern)
        onBack();
      } else {
        // Reset position if gesture not completed
        setDragPosition({ x: 0, y: 0 });
      }
      
      currentX = 0;
      currentY = 0;
    };

    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      modalElement.addEventListener('touchmove', handleTouchMove, { passive: true });
      modalElement.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener('touchstart', handleTouchStart);
        modalElement.removeEventListener('touchmove', handleTouchMove);
        modalElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [gestureEnabled, isOpen, isDragging, onClose, onBack]);

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
      
      // Focus management for accessibility
      const focusableElements = contentRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.[0]) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      setIsAnimating(false);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen && !isAnimating) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, 
              ${darkMode ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)'} 0%, 
              ${darkMode ? 'rgba(45,125,50,0.3)' : 'rgba(45,125,50,0.15)'} 100%
            )`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {/* Enhanced Cultural Pattern Overlay with 2025 Design */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url(${CULTURAL_PATTERNS.batik})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '60px 60px',
              animation: 'float 20s ease-in-out infinite'
            }}
          />

          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: dragPosition.x,
              y: dragPosition.y
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className={cn(
              "relative overflow-hidden shadow-glassmorphism-lg border border-white/20",
              "bg-white/15 backdrop-blur-xl",
              getSizeClasses().replace('bg-white', ''),
              className
            )}
            style={{
              borderRadius: size === 'fullscreen' ? '0' : '24px',
              boxShadow: `
                0 32px 64px -12px ${themeColors.primary}30,
                0 20px 25px -5px ${themeColors.primary}20,
                inset 0 1px 0 rgba(255,255,255,0.2),
                0 0 40px ${themeColors.accent}10
              `,
              background: darkMode 
                ? `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(45,125,50,0.2) 100%)`
                : `linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(45,125,50,0.05) 100%)`
            }}
          >
            {/* Glassmorphic Header with Enhanced Design */}
            {showHeader && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between p-6 border-b border-white/10"
                style={{ 
                  background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-center space-x-4">
                  {showBackButton && onBack && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onBack}
                      className="p-3 rounded-2xl transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/15 border border-white/20"
                      style={{ 
                        color: darkMode ? '#FFFFFF' : themeColors.secondary
                      }}
                      aria-label="Back"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                  )}
                  
                  {title && (
                    <div>
                      <h2 
                        className="text-fluid-xl font-heading font-semibold"
                        style={{ color: darkMode ? '#FFFFFF' : 'rgba(0,0,0,0.85)' }}
                      >
                        {title}
                      </h2>
                      {/* Enhanced Cultural Accent Line */}
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="mt-2 h-1 w-16 rounded-full origin-left"
                        style={{ 
                          background: `linear-gradient(90deg, ${themeColors.accent}, ${themeColors.secondary}, ${themeColors.primary})`
                        }}
                      />
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-3 rounded-2xl transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/15 border border-white/20"
                  style={{ 
                    color: darkMode ? '#FFFFFF80' : 'rgba(0,0,0,0.6)'
                  }}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {/* Enhanced Content with Glassmorphic Background */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
              style={{
                background: size === 'fullscreen' ? 'transparent' : `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`
              }}
            >
              {children}
            </motion.div>

            {/* Enhanced Drag Indicator with 2025 Design */}
            {gestureEnabled && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.4 }}
                className="absolute top-3 left-1/2 transform -translate-x-1/2"
              >
                <div 
                  className="w-12 h-1.5 rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, ${themeColors.primary}60, ${themeColors.accent}60)`,
                    boxShadow: `0 2px 4px ${themeColors.primary}20`
                  }}
                />
              </motion.div>
            )}

            {/* Subtle Ambient Glow Effect */}
            <div 
              className="absolute inset-0 rounded-inherit pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${themeColors.accent}05 0%, transparent 50%)`,
                borderRadius: 'inherit'
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

// Meditation-specific modal wrapper
export const MeditationModal: React.FC<Omit<IndonesianModalProps, 'culturalTheme'>> = (props) => (
  <IndonesianModal {...props} culturalTheme="meditation" />
);

// Learning-specific modal wrapper  
export const LearningModal: React.FC<Omit<IndonesianModalProps, 'culturalTheme'>> = (props) => (
  <IndonesianModal {...props} culturalTheme="learning" />
);

// Community-specific modal wrapper
export const CommunityModal: React.FC<Omit<IndonesianModalProps, 'culturalTheme'>> = (props) => (
  <IndonesianModal {...props} culturalTheme="community" />
);

// Nature-specific modal wrapper
export const NatureModal: React.FC<Omit<IndonesianModalProps, 'culturalTheme'>> = (props) => (
  <IndonesianModal {...props} culturalTheme="nature" />
);