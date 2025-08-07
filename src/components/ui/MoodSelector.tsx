import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMoodTracker } from '../../hooks/useMoodTracker';
import type { MoodType } from '../../types/mood';
import { moodOptions, getMoodColor } from '../../types/mood';

interface MoodSelectorProps {
  selectedMood?: MoodType;
  onMoodSelect?: (mood: MoodType) => void;
  label?: string;
  className?: string;
  autoSave?: boolean;
  showLabels?: boolean;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  label = 'Bagaimana perasaan Anda hari ini?',
  className = '',
  autoSave = false,
  showLabels = true
}) => {
  const [hoveredMood, setHoveredMood] = useState<MoodType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { currentMood, logMood, getTodaysMood } = useMoodTracker();

  // Use the mood from tracker if no external selectedMood provided
  const displayedMood = selectedMood || currentMood;

  useEffect(() => {
    // If autoSave is enabled and no selectedMood provided, check for today's mood
    if (autoSave && !selectedMood) {
      const todaysMood = getTodaysMood();
      // currentMood will be set by the hook
    }
  }, [autoSave, selectedMood, getTodaysMood]);

  const handleMoodSelect = (mood: MoodType) => {
    // Call external handler if provided
    if (onMoodSelect) {
      onMoodSelect(mood);
    }
    
    // Auto-save if enabled
    if (autoSave) {
      logMood(mood);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2000);
    }
  };

  return (
    <motion.div 
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Confirmation message */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-primary-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
          >
            ✨ Suasana hati tersimpan!
          </motion.div>
        )}
      </AnimatePresence>

      {label && showLabels && (
        <motion.h3 
          className="text-sm font-medium text-gray-700 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {label}
        </motion.h3>
      )}
      
      <div className="flex justify-center items-center">
        <div className="flex justify-between items-center gap-1 sm:gap-2 p-2 rounded-2xl bg-white shadow-lg border border-gray-100">
          {moodOptions.map((mood, index) => {
            const isSelected = displayedMood === mood.id;
            const isHovered = hoveredMood === mood.id;
            
            return (
              <motion.button
                key={mood.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMoodSelect(mood.id)}
                onMouseEnter={() => setHoveredMood(mood.id)}
                onMouseLeave={() => setHoveredMood(null)}
                className={`
                  group relative flex flex-col items-center justify-center
                  p-2 sm:p-3 rounded-xl transition-all duration-300 
                  focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2
                  ${isSelected ? 'shadow-md' : 'hover:shadow-sm'}
                `}
                style={{
                  backgroundColor: isSelected ? `${getMoodColor(mood.id)}20` : 
                                  isHovered ? `${getMoodColor(mood.id)}10` : 'transparent',
                }}
              >
                {/* Mood emoji with enhanced animations */}
                <motion.div 
                  className="text-2xl sm:text-3xl mb-1 cursor-pointer select-none"
                  animate={isSelected ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  transition={{ duration: 0.5 }}
                  style={{
                    filter: isSelected ? 'brightness(1.1) saturate(1.2)' : 
                            isHovered ? 'brightness(1.05)' : 'brightness(0.9)',
                  }}
                >
                  {mood.emoji}
                </motion.div>
                
                {/* Enhanced selection indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      className="absolute -bottom-1 h-1 rounded-full"
                      style={{ 
                        backgroundColor: getMoodColor(mood.id),
                        width: '60%'
                      }}
                    />
                  )}
                </AnimatePresence>
                
                {/* Enhanced hover label with better positioning */}
                <AnimatePresence>
                  {isHovered && !isSelected && showLabels && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-10"
                    >
                      <div className="px-3 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                        {mood.label}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Subtle ripple effect */}
                <motion.div 
                  className="absolute inset-0 rounded-xl overflow-hidden"
                  whileTap={{ backgroundColor: `${getMoodColor(mood.id)}30` }}
                  transition={{ duration: 0.1 }}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Enhanced selected mood label with animation */}
      <AnimatePresence>
        {displayedMood && showLabels && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-center pt-2"
          >
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                {moodOptions.find(m => m.id === displayedMood)?.emoji}
              </motion.span>
              Anda merasa{' '}
              <span 
                className="font-semibold"
                style={{ color: getMoodColor(displayedMood) }}
              >
                {moodOptions.find(m => m.id === displayedMood)?.label.toLowerCase()}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};