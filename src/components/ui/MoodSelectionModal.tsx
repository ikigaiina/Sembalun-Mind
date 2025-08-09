import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, AlertCircle, BookOpen, Save } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import type { MoodType } from '../../types/mood';
import { moodOptions, primaryMoods, extendedMoods, getMoodColor, getMoodCategory, getRelatedMoods } from '../../types/mood';
import { comprehensiveJournalingService } from '../../services/comprehensiveJournalingService';

// WCAG 2.1 AA Compliant Color Palette
const ACCESSIBLE_MOOD_COLORS = {
  'very-sad': {
    primary: '#1E3A8A',
    background: 'rgba(30, 58, 138, 0.08)',
    border: 'rgba(30, 58, 138, 0.24)',
    hover: 'rgba(30, 58, 138, 0.12)',
    selected: 'rgba(30, 58, 138, 0.16)',
  },
  'sad': {
    primary: '#7C2D12',
    background: 'rgba(124, 45, 18, 0.08)',
    border: 'rgba(124, 45, 18, 0.24)',
    hover: 'rgba(124, 45, 18, 0.12)',
    selected: 'rgba(124, 45, 18, 0.16)',
  },
  'neutral': {
    primary: '#374151',
    background: 'rgba(55, 65, 81, 0.08)',
    border: 'rgba(55, 65, 81, 0.24)',
    hover: 'rgba(55, 65, 81, 0.12)',
    selected: 'rgba(55, 65, 81, 0.16)',
  },
  'happy': {
    primary: '#065F46',
    background: 'rgba(6, 95, 70, 0.08)',
    border: 'rgba(6, 95, 70, 0.24)',
    hover: 'rgba(6, 95, 70, 0.12)',
    selected: 'rgba(6, 95, 70, 0.16)',
  },
  'very-happy': {
    primary: '#92400E',
    background: 'rgba(146, 64, 14, 0.08)',
    border: 'rgba(146, 64, 14, 0.24)',
    hover: 'rgba(146, 64, 14, 0.12)',
    selected: 'rgba(146, 64, 14, 0.16)',
  },
  // Extended moods
  'excited': {
    primary: '#7C2D12',
    background: 'rgba(124, 45, 18, 0.08)',
    border: 'rgba(124, 45, 18, 0.24)',
    hover: 'rgba(124, 45, 18, 0.12)',
    selected: 'rgba(124, 45, 18, 0.16)',
  },
  'anxious': {
    primary: '#1E3A8A',
    background: 'rgba(30, 58, 138, 0.08)',
    border: 'rgba(30, 58, 138, 0.24)',
    hover: 'rgba(30, 58, 138, 0.12)',
    selected: 'rgba(30, 58, 138, 0.16)',
  },
  // Default fallback
  'default': {
    primary: '#374151',
    background: 'rgba(55, 65, 81, 0.08)',
    border: 'rgba(55, 65, 81, 0.24)',
    hover: 'rgba(55, 65, 81, 0.12)',
    selected: 'rgba(55, 65, 81, 0.16)',
  }
};

// Get accessible colors for mood
const getAccessibleMoodColors = (moodId: MoodType) => {
  return ACCESSIBLE_MOOD_COLORS[moodId] || ACCESSIBLE_MOOD_COLORS.default;
};

// Animation system with improved easing
const ANIMATIONS = {
  modal: {
    initial: { opacity: 0, scale: 0.96, y: 16 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 16 },
    transition: { type: "spring", duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  moodButton: {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 30 }
  },
  stagger: {
    duration: 0.3,
    staggerChildren: 0.05
  }
};

interface MoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodSelect: (mood: MoodType, journalNote?: string) => void;
  currentMood?: MoodType | null;
}

// Time periods for mood check-in
const TIME_PERIODS = {
  morning: { start: 5, end: 11, label: 'Pagi', icon: '🌅', description: 'Suasana hati pagi hari' },
  afternoon: { start: 12, end: 17, label: 'Sore', icon: '☀️', description: 'Suasana hati sore hari' },
  evening: { start: 18, end: 23, label: 'Malam', icon: '🌙', description: 'Suasana hati malam hari' }
} as const;

type TimePeriod = keyof typeof TIME_PERIODS;

const getCurrentTimePeriod = (): TimePeriod | null => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= TIME_PERIODS.morning.start && hour <= TIME_PERIODS.morning.end) {
    return 'morning';
  } else if (hour >= TIME_PERIODS.afternoon.start && hour <= TIME_PERIODS.afternoon.end) {
    return 'afternoon';
  } else if (hour >= TIME_PERIODS.evening.start && hour <= TIME_PERIODS.evening.end) {
    return 'evening';
  }
  
  return null;
};

const getNextAllowedTime = (): string => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < TIME_PERIODS.morning.start) {
    return `${TIME_PERIODS.morning.start.toString().padStart(2, '0')}:00 (${TIME_PERIODS.morning.label})`;
  } else if (hour > TIME_PERIODS.morning.end && hour < TIME_PERIODS.afternoon.start) {
    return `${TIME_PERIODS.afternoon.start.toString().padStart(2, '0')}:00 (${TIME_PERIODS.afternoon.label})`;
  } else if (hour > TIME_PERIODS.afternoon.end && hour < TIME_PERIODS.evening.start) {
    return `${TIME_PERIODS.evening.start.toString().padStart(2, '0')}:00 (${TIME_PERIODS.evening.label})`;
  } else {
    // After evening, next is morning
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `Besok ${TIME_PERIODS.morning.start.toString().padStart(2, '0')}:00 (${TIME_PERIODS.morning.label})`;
  }
};

export const MoodSelectionModal: React.FC<MoodSelectionModalProps> = ({
  isOpen,
  onClose,
  onMoodSelect,
  currentMood
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [showExtended, setShowExtended] = useState(false);
  const [showRefinement, setShowRefinement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [journalNote, setJournalNote] = useState('');
  const [showJournalForm, setShowJournalForm] = useState(false);
  
  const currentPeriod = getCurrentTimePeriod();
  const isAllowedTime = currentPeriod !== null;
  
  const currentPeriodInfo = currentPeriod ? TIME_PERIODS[currentPeriod] : null;

  // Reset selected mood when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMood(currentMood || null);
      setShowExtended(false);
      setJournalNote('');
      setShowJournalForm(false);
    }
  }, [isOpen, currentMood]);

  const handleMoodSelect = async (mood: MoodType) => {
    if (!isAllowedTime || isSubmitting) return;
    setSelectedMood(mood);
    
    // Show journal form after selecting mood
    if (!showJournalForm) {
      setShowJournalForm(true);
      return;
    }
  };

  const handleSaveMoodAndJournal = async () => {
    if (!selectedMood || !isAllowedTime || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Save to journal if there's a note
      if (journalNote.trim()) {
        await comprehensiveJournalingService.saveEntry({
          type: 'reflection',
          title: `Refleksi ${currentPeriodInfo?.label || 'Harian'}`,
          content: journalNote,
          mood: {
            primary: selectedMood,
            intensity: 5, // Default intensity
            context: currentPeriodInfo?.label || 'harian'
          },
          tags: ['mood-checkin', currentPeriodInfo?.label.toLowerCase() || 'daily'],
          language: 'id',
          privacy: 'private',
          timestamp: new Date()
        });
      }

      // Call the mood selection callback
      onMoodSelect(selectedMood, journalNote.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Error saving mood and journal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/90 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mood-modal-title"
        aria-describedby="mood-modal-description"
        onClick={onClose}
        style={{ touchAction: 'none' }} // Prevent mobile scroll interference
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-sm mx-2 sm:mx-4 sm:max-w-md md:max-w-lg my-4 sm:my-8"
          onClick={(e) => e.stopPropagation()}
          style={{ touchAction: 'auto' }} // Allow normal touch interactions within modal
        >
          <Card className="p-4 sm:p-6 bg-white shadow-2xl border-2 border-gray-300 ring-2 ring-blue-100/50 max-h-[90vh] overflow-y-auto">
            {/* Header with improved typography hierarchy */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {currentPeriodInfo && (
                  <span className="text-3xl" role="img" aria-label={currentPeriodInfo.label}>
                    {currentPeriodInfo.icon}
                  </span>
                )}
                <div>
                  <h2 
                    id="mood-modal-title"
                    className="text-xl leading-tight font-semibold text-gray-900"
                  >
                    {currentPeriodInfo ? currentPeriodInfo.description : 'Pilih Suasana Hati'}
                  </h2>
                  {currentPeriodInfo && (
                    <p 
                      id="mood-modal-description"
                      className="text-sm leading-normal font-medium text-gray-600 mt-0.5"
                    >
                      Periode {currentPeriodInfo.label} • {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] p-2 hover:bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Time Restriction Notice with enhanced accessibility */}
            {!isAllowedTime && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 p-3 bg-amber-50 border-2 border-amber-200 rounded-lg"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle 
                    className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" 
                    aria-hidden="true"
                  />
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm leading-tight font-semibold text-amber-800 mb-2">
                        Waktu Check-in Belum Tersedia
                      </h4>
                      <p className="text-xs leading-normal font-normal text-amber-700 mb-2">
                        Mood hanya bisa dicatat pada waktu berikut:
                      </p>
                    </div>
                    
                    <ul className="text-xs leading-relaxed font-normal text-amber-700 space-y-1" role="list">
                      <li className="flex items-center">
                        <span className="text-amber-600 mr-2" aria-hidden="true">•</span>
                        <span><strong>Pagi:</strong> 05:00 - 11:00</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-amber-600 mr-2" aria-hidden="true">•</span>
                        <span><strong>Sore:</strong> 12:00 - 17:00</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-amber-600 mr-2" aria-hidden="true">•</span>
                        <span><strong>Malam:</strong> 18:00 - 23:00</span>
                      </li>
                    </ul>
                    
                    <div className="flex items-center mt-3 p-2 bg-amber-100 rounded border border-amber-300">
                      <Clock className="w-4 h-4 text-amber-700 mr-2 flex-shrink-0" aria-hidden="true" />
                      <p className="text-xs leading-normal font-medium text-amber-800">
                        Waktu check-in berikutnya: <span className="font-semibold">{getNextAllowedTime()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Current Mood Display with enhanced accessibility */}
            {selectedMood && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-3 text-center"
                role="status"
                aria-live="polite"
              >
                <div 
                  className="inline-flex items-center space-x-4 rounded-2xl px-6 py-4 shadow-lg border-2 ring-1"
                  style={{
                    backgroundColor: getAccessibleMoodColors(selectedMood).background,
                    borderColor: getAccessibleMoodColors(selectedMood).border,
                    boxShadow: `0 4px 12px ${getAccessibleMoodColors(selectedMood).border}`
                  }}
                >
                  <motion.div
                    className="text-4xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3 }}
                    role="img"
                    aria-label={moodOptions.find(m => m.id === selectedMood)?.label}
                  >
                    {moodOptions.find(m => m.id === selectedMood)?.emoji}
                  </motion.div>
                  <div className="text-left">
                    <p className="text-xs leading-normal font-medium text-gray-600 mb-1">Mood Terpilih</p>
                    <p 
                      className="text-lg leading-tight font-semibold capitalize"
                      style={{ color: getAccessibleMoodColors(selectedMood).primary }}
                    >
                      {moodOptions.find(m => m.id === selectedMood)?.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Primary Moods - Only show if journal form is not shown */}
            {!showJournalForm && (
              <div className="mb-4">
                <h3 className="text-sm leading-tight font-semibold text-gray-900 mb-3">
                  {!selectedMood ? 'Pilih Suasana Hati Anda' : 'Sesuaikan pilihan Anda'}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {primaryMoods.map((mood, index) => {
                  const isSelected = selectedMood === mood.id;
                  
                  return (
                    <motion.button
                      key={mood.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={isAllowedTime ? ANIMATIONS.moodButton.hover : {}}
                      whileTap={isAllowedTime ? ANIMATIONS.moodButton.tap : {}}
                      onClick={() => handleMoodSelect(mood.id)}
                      disabled={!isAllowedTime || isSubmitting}
                      className={`
                        min-h-[60px] min-w-[60px] p-2 sm:p-3 rounded-lg transition-all duration-200 text-center
                        border-2 focus:ring-2 focus:ring-blue-500 focus:outline-none
                        ${isSelected 
                          ? `shadow-md` 
                          : 'bg-gray-50 border-transparent hover:shadow-sm'
                        }
                        ${!isAllowedTime || isSubmitting 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'cursor-pointer active:scale-95'
                        }
                      `}
                      style={{
                        backgroundColor: isSelected 
                          ? getAccessibleMoodColors(mood.id).selected
                          : undefined,
                        borderColor: isSelected 
                          ? getAccessibleMoodColors(mood.id).border
                          : 'transparent'
                      }}
                      aria-label={`Pilih mood ${mood.label}`}
                      aria-pressed={isSelected}
                    >
                      <div className="text-xl sm:text-2xl mb-1" role="img" aria-label={mood.label}>
                        {mood.emoji}
                      </div>
                      <p 
                        className="text-xs leading-tight font-semibold"
                        style={{ color: getAccessibleMoodColors(mood.id).primary }}
                      >
                        {mood.label}
                      </p>
                    </motion.button>
                  );
                })}
                </div>

                {/* Progressive Disclosure: Extended Moods Toggle */}
                <div className="mt-3 mb-3">
                  {!selectedMood ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExtended(!showExtended)}
                      disabled={!isAllowedTime}
                      className="w-full min-h-[44px] text-sm font-medium text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                      aria-expanded={showExtended}
                      aria-controls="extended-moods"
                    >
                      {showExtended ? 'Sembunyikan Pilihan Lainnya' : 'Lebih Banyak Pilihan'}
                    </Button>
                  ) : (
                    <div className="text-center space-y-3">
                      <p className="text-xs leading-normal text-gray-600">
                        Apakah pilihan ini sudah tepat, atau ingin lebih spesifik?
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRefinement(!showRefinement)}
                          disabled={!isAllowedTime}
                          className="flex-1 min-h-[40px] text-xs font-medium text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                        >
                          {showRefinement ? 'Sembunyikan' : 'Lebih Tepat?'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Journal Form - Show after mood selection */}
            {showJournalForm && selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  <h3 className="text-lg leading-tight font-semibold text-gray-900">Tulis Refleksi Anda</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-gray-600">
                    Ceritakan lebih lanjut tentang perasaan Anda hari ini. Apa yang membuat Anda merasa{' '}
                    <span 
                      className="font-semibold" 
                      style={{ color: getAccessibleMoodColors(selectedMood).primary }}
                    >
                      {moodOptions.find(m => m.id === selectedMood)?.label.toLowerCase()}
                    </span>
                    ?
                  </p>
                  
                  <textarea
                    value={journalNote}
                    onChange={(e) => setJournalNote(e.target.value)}
                    placeholder="Tuliskan refleksi, perasaan, atau pengalaman Anda hari ini..."
                    className="w-full h-24 p-3 text-sm leading-relaxed border-2 border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                    maxLength={500}
                    aria-label="Tulis refleksi harian Anda"
                  />
                  
                  <div className="flex justify-between items-center text-xs font-normal text-gray-500">
                    <span>Opsional - bisa dikosongkan</span>
                    <span 
                      className={journalNote.length > 450 ? 'text-amber-600 font-medium' : ''}
                      aria-live="polite"
                    >
                      {journalNote.length}/500
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Extended/Refinement Moods */}
            <AnimatePresence>
              {(showExtended || showRefinement) && (
                <motion.div
                  id="extended-moods"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <div className="mb-4">
                    {showRefinement && selectedMood && (
                      <div className="text-center">
                        <p className="text-xs leading-normal text-gray-600 mb-2">
                          Pilihan serupa dengan <span className="font-medium" style={{ color: getAccessibleMoodColors(selectedMood).primary }}>
                            {moodOptions.find(m => m.id === selectedMood)?.label}
                          </span>:
                        </p>
                        <p className="text-xs leading-normal text-blue-600 font-medium">
                          🎯 {getMoodCategory(selectedMood) === 'primary' ? 'Emosi terkait' : 'Variasi serupa'}
                        </p>
                      </div>
                    )}
                    {showExtended && !showRefinement && (
                      <div className="text-center mb-4">
                        <h4 className="text-sm leading-tight font-semibold text-gray-900 mb-2">
                          Pilihan Mood Tambahan
                        </h4>
                        <p className="text-xs leading-normal text-gray-600">
                          Ekspresikan perasaan Anda dengan lebih spesifik
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-4 sm:gap-3">
                    {(showRefinement && selectedMood 
                      ? extendedMoods.filter(mood => {
                          // Show related moods based on intelligent categorization
                          const relatedMoods = getRelatedMoods(selectedMood);
                          const selectedCategory = getMoodCategory(selectedMood);
                          
                          // If primary mood selected, show related emotions
                          if (selectedCategory === 'primary') {
                            if (selectedMood === 'very-happy' || selectedMood === 'happy') {
                              return ['excited', 'enthusiastic', 'grateful', 'content', 'hopeful', 'proud', 'confident', 'optimistic', 'loved'].includes(mood.id as string);
                            } else if (selectedMood === 'sad' || selectedMood === 'very-sad') {
                              return ['anxious', 'worried', 'lonely', 'disappointed', 'tired', 'exhausted', 'confused', 'insecure'].includes(mood.id as string);
                            } else if (selectedMood === 'neutral') {
                              return ['confused', 'tired', 'bored', 'curious', 'calm', 'content'].includes(mood.id as string);
                            }
                          }
                          
                          // Otherwise show same category moods
                          return relatedMoods.includes(mood.id as any);
                        })
                      : extendedMoods
                    ).slice(0, 12).map((mood, index) => { // Limit to 12 for better UX
                      const isSelected = selectedMood === mood.id;
                      
                      return (
                        <motion.button
                          key={mood.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={isAllowedTime ? ANIMATIONS.moodButton.hover : {}}
                          whileTap={isAllowedTime ? ANIMATIONS.moodButton.tap : {}}
                          onClick={() => handleMoodSelect(mood.id)}
                          disabled={!isAllowedTime || isSubmitting}
                          className={`
                            min-h-[50px] min-w-[50px] p-2 rounded-lg transition-all duration-200 text-center
                            border-2 focus:ring-2 focus:ring-blue-500 focus:outline-none
                            ${isSelected 
                              ? `shadow-sm` 
                              : 'bg-gray-50 border-transparent hover:shadow-sm'
                            }
                            ${!isAllowedTime || isSubmitting 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'cursor-pointer active:scale-95'
                            }
                          `}
                          style={{
                            backgroundColor: isSelected 
                              ? getAccessibleMoodColors(mood.id).selected
                              : undefined,
                            borderColor: isSelected 
                              ? getAccessibleMoodColors(mood.id).border
                              : 'transparent'
                          }}
                          aria-label={`Pilih mood ${mood.label}`}
                          aria-pressed={isSelected}
                        >
                          <div className="text-lg mb-0.5" role="img" aria-label={mood.label}>
                            {mood.emoji}
                          </div>
                          <p 
                            className="text-xs leading-tight font-medium"
                            style={{ color: getAccessibleMoodColors(mood.id).primary }}
                          >
                            {mood.label}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Helpful hints for better UX with enhanced visibility */}
            {selectedMood && !showJournalForm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg" role="img" aria-label="Tips">💡</span>
                  <p className="text-xs leading-relaxed text-center text-blue-800 font-medium">
                    Refleksi harian membantu memahami pola mood Anda
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons with enhanced mobile UX */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 min-h-[44px] text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                aria-label="Tutup modal pemilihan mood"
              >
                Tutup
              </Button>
              
              {showJournalForm ? (
                // Journal form buttons with improved spacing
                <div className="flex flex-col space-y-2 flex-1 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowJournalForm(false)}
                    className="flex-1 min-h-[44px] text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                    aria-label="Kembali ke pemilihan mood"
                  >
                    Kembali
                  </Button>
                  <Button
                    onClick={handleSaveMoodAndJournal}
                    disabled={isSubmitting}
                    className="flex-1 min-h-[44px] text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all duration-200"
                    isLoading={isSubmitting}
                    aria-label={isSubmitting ? 'Sedang menyimpan mood dan refleksi' : 'Simpan mood dan refleksi'}
                  >
                    <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              ) : (
                // Mood selection button - enhanced with better feedback
                selectedMood && isAllowedTime && (
                  <Button
                    onClick={() => handleMoodSelect(selectedMood)}
                    disabled={isSubmitting}
                    className="flex-1 min-h-[44px] text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all duration-200"
                    style={{
                      backgroundColor: getAccessibleMoodColors(selectedMood).primary,
                      borderColor: getAccessibleMoodColors(selectedMood).primary
                    }}
                    aria-label={`Lanjutkan dengan mood ${moodOptions.find(m => m.id === selectedMood)?.label}`}
                  >
                    Lanjutkan
                  </Button>
                )
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};