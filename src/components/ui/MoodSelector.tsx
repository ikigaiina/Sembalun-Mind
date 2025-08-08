import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMoodTracker } from '../../hooks/useMoodTracker';
import type { MoodType } from '../../types/mood';
import { moodOptions, primaryMoods, extendedMoods, getMoodColor } from '../../types/mood';
import { Plus } from 'lucide-react';

interface MoodSelectorProps {
  selectedMood?: MoodType;
  onMoodSelect?: (mood: MoodType) => void;
  label?: string;
  className?: string;
  autoSave?: boolean;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  label = 'Bagaimana perasaan Anda hari ini?',
  className = '',
  autoSave = false,
  showLabels = true,
  size = 'medium'
}) => {
  const [hoveredMood, setHoveredMood] = useState<MoodType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExtended, setShowExtended] = useState(false);
  const { currentMood, logMood, getTodaysMood } = useMoodTracker();

  // Use the mood from tracker if no external selectedMood provided
  const displayedMood = selectedMood || currentMood;

  // Size classes
  const sizeClasses = {
    small: {
      emoji: 'text-lg sm:text-xl',
      padding: 'p-1.5 sm:p-2',
      gap: 'gap-0.5 sm:gap-1'
    },
    medium: {
      emoji: 'text-2xl sm:text-3xl',
      padding: 'p-2 sm:p-3',
      gap: 'gap-1 sm:gap-2'
    },
    large: {
      emoji: 'text-3xl sm:text-4xl',
      padding: 'p-3 sm:p-4',
      gap: 'gap-2 sm:gap-3'
    }
  };

  useEffect(() => {
    // If autoSave is enabled and no selectedMood provided, check for today's mood
    if (autoSave && !selectedMood) {
      const todaysMood = getTodaysMood();
      // currentMood will be set by the hook
    }
  }, [autoSave, selectedMood, getTodaysMood]);

  const handleMoodSelect = async (mood: MoodType) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Call external handler if provided (this updates the UI immediately)
      if (onMoodSelect) {
        onMoodSelect(mood);
      }
      
      // Auto-save if enabled
      if (autoSave) {
        logMood(mood);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
      }
      
      console.log(`Mood selected and saved: ${mood}`);
    } catch (error) {
      console.error('Error saving mood:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Choose which moods to display
  const moodsToDisplay = showExtended ? moodOptions : primaryMoods;

  return (
    <motion.div 
      className={`space-y-6 ${className} relative`}
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
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg text-base font-medium flex items-center space-x-2"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              ✨
            </motion.span>
            <span>Suasana hati tersimpan!</span>
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
      
      {/* Primary Mood Selection */}
      <div className="flex justify-center items-center">
        <div className={`flex justify-between items-center ${sizeClasses[size].gap} p-2 rounded-2xl bg-white shadow-lg border border-gray-100 transition-all duration-300`}>
          {primaryMoods.map((mood, index) => {
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
                disabled={isSubmitting}
                className={`
                  group relative flex flex-col items-center justify-center
                  ${sizeClasses[size].padding} rounded-xl transition-all duration-300 
                  focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
                  ${isSelected ? 'shadow-lg transform scale-110 ring-2 ring-blue-400 ring-opacity-50' : 'hover:shadow-md hover:scale-105'}
                  ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                style={{
                  backgroundColor: isSelected ? `${getMoodColor(mood.id)}20` : 
                                  isHovered ? `${getMoodColor(mood.id)}10` : 'transparent',
                }}
              >
                {/* Mood emoji with enhanced animations */}
                <motion.div 
                  className={`${sizeClasses[size].emoji} mb-1 cursor-pointer select-none`}
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
                    <>
                      <motion.div 
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        exit={{ scaleX: 0, opacity: 0 }}
                        className="absolute -bottom-1 h-2 rounded-full shadow-md"
                        style={{ 
                          backgroundColor: getMoodColor(mood.id),
                          width: '80%'
                        }}
                      />
                      {/* Glow effect */}
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.3 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-0 rounded-xl blur-md"
                        style={{ 
                          backgroundColor: getMoodColor(mood.id)
                        }}
                      />
                    </>
                  )}
                </AnimatePresence>
                
                {/* Enhanced hover label with better positioning */}
                <AnimatePresence>
                  {isHovered && !isSelected && showLabels && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10"
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
          
          {/* More options button */}
          <motion.button
            onClick={() => setShowExtended(!showExtended)}
            className={`
              group relative flex flex-col items-center justify-center
              ${sizeClasses[size].padding} rounded-xl transition-all duration-300 
              focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
              hover:shadow-sm cursor-pointer bg-gray-50 hover:bg-gray-100
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className={`${sizeClasses[size].emoji} mb-1 cursor-pointer select-none text-gray-500`}
              animate={{ rotate: showExtended ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Plus className="w-6 h-6" />
            </motion.div>
            
            {/* Hover label */}
            <AnimatePresence>
              {hoveredMood === null && showLabels && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <div className="px-3 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                    {showExtended ? 'Sembunyikan' : 'Lebih banyak'}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Extended Mood Options */}
      <AnimatePresence>
        {showExtended && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex justify-center items-center mt-4">
              <div className={`flex flex-wrap justify-center items-center ${sizeClasses[size].gap} p-2 rounded-2xl bg-gray-50 border border-gray-100`}>
                {extendedMoods.map((mood, index) => {
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
                      disabled={isSubmitting}
                      className={`
                        group relative flex flex-col items-center justify-center
                        ${sizeClasses[size].padding} rounded-xl transition-all duration-300 
                        focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
                        ${isSelected ? 'shadow-lg transform scale-110 ring-2 ring-blue-400 ring-opacity-50' : 'hover:shadow-md hover:scale-105'}
                        ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                      style={{
                        backgroundColor: isSelected ? `${getMoodColor(mood.id)}20` : 
                                        isHovered ? `${getMoodColor(mood.id)}10` : 'transparent',
                      }}
                    >
                      <motion.div 
                        className={`${sizeClasses[size].emoji} mb-1 cursor-pointer select-none`}
                        animate={isSelected ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {mood.emoji}
                      </motion.div>
                      
                      {/* Enhanced selection indicator for extended moods */}
                      <AnimatePresence>
                        {isSelected && (
                          <>
                            <motion.div 
                              initial={{ scaleX: 0, opacity: 0 }}
                              animate={{ scaleX: 1, opacity: 1 }}
                              exit={{ scaleX: 0, opacity: 0 }}
                              className="absolute -bottom-1 h-2 rounded-full shadow-md"
                              style={{ 
                                backgroundColor: getMoodColor(mood.id),
                                width: '80%'
                              }}
                            />
                            {/* Glow effect for extended moods */}
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 0.3 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute inset-0 rounded-xl blur-md"
                              style={{ 
                                backgroundColor: getMoodColor(mood.id)
                              }}
                            />
                          </>
                        )}
                      </AnimatePresence>
                      
                      {/* Hover label */}
                      <AnimatePresence>
                        {isHovered && !isSelected && showLabels && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.8 }}
                            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10"
                          >
                            <div className="px-3 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                              {mood.label}
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced selected mood label with animation */}
      <AnimatePresence>
        {displayedMood && showLabels && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-center pt-4 pb-2"
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