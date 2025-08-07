import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CairnIcon, MoodSelector, BreathingCard } from '../../components/ui';
import IndonesianCTA, { IndonesianCTAVariants, useCulturalCTA } from '../../components/ui/IndonesianCTA';
import type { MoodType } from '../../types/mood';

export type PersonalizationGoal = 'stress' | 'focus' | 'sleep' | 'curious';

interface GoalOption {
  id: PersonalizationGoal;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface PersonalizationScreenProps {
  onComplete: (goal: PersonalizationGoal, mood?: MoodType) => void;
  onSkip: () => void;
}

const goalOptions: GoalOption[] = [
  {
    id: 'stress',
    title: 'Mengelola Stres',
    description: 'Temukan ketenangan di tengah tekanan hidup sehari-hari',
    icon: '🌱',
    color: '#6A8F6F'
  },
  {
    id: 'focus',
    title: 'Meningkatkan Fokus',
    description: 'Latih perhatian dan konsentrasi untuk produktivitas yang lebih baik',
    icon: '🎯',
    color: '#A9C1D9'
  },
  {
    id: 'sleep',
    title: 'Tidur Lebih Baik',
    description: 'Ciptakan ritual malam yang menenangkan untuk istirahat berkualitas',
    icon: '🌙',
    color: '#C56C3E'
  },
  {
    id: 'curious',
    title: 'Hanya Ingin Tahu',
    description: 'Jelajahi dunia meditasi dan mindfulness dengan pikiran terbuka',
    icon: '✨',
    color: '#7C9885'
  }
];

export const PersonalizationScreen: React.FC<PersonalizationScreenProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const [selectedGoal, setSelectedGoal] = useState<PersonalizationGoal | null>(null);
  const [hoveredGoal, setHoveredGoal] = useState<PersonalizationGoal | null>(null);
  const [currentMood, setCurrentMood] = useState<MoodType | undefined>(undefined);
  const [showMoodStep, setShowMoodStep] = useState(false);
  const [showBreathingDemo, setShowBreathingDemo] = useState(false);
  
  // Get cultural CTA optimization
  const { getOptimalVariant, getOptimalLocalization } = useCulturalCTA();

  const handleGoalSelect = (goal: PersonalizationGoal) => {
    setSelectedGoal(goal);
    // Show mood step after goal selection
    setTimeout(() => {
      setShowMoodStep(true);
    }, 500);
  };

  const handleMoodSelect = (mood: MoodType) => {
    setCurrentMood(mood);
    // Show immediate visual feedback
    setTimeout(() => {
      setShowBreathingDemo(true);
    }, 800); // Slightly longer delay to show selection feedback
  };

  const handleComplete = () => {
    onComplete(selectedGoal!, currentMood);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-meditation-zen-50">
      {/* Enhanced Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-8 w-32 h-32 rounded-full bg-primary-400"
        />
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.02, 0.06, 0.02],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-32 left-12 w-24 h-24 rounded-full bg-accent-400"
        />
      </div>

      <div className="relative z-10">
        {/* Enhanced Header with CairnIcon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 pt-12"
        >
          <div className="max-w-sm mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex justify-center mb-6"
            >
              <CairnIcon size={64} progress={40} className="text-primary-600" />
            </motion.div>
            
            <motion.h1 
              className="text-2xl font-heading font-bold text-gray-800 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Apa yang membawamu ke Sembalun?
            </motion.h1>
            
            <motion.p 
              className="text-gray-600 font-body text-sm leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Mari kita personalisasi perjalanan mindfulness-mu
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced Skip button */}
        <div className="flex justify-end px-6 -mt-4">
          <IndonesianCTA
            variant="gentle"
            style="outline"
            size="small"
            onClick={onSkip}
            localization={getOptimalLocalization()}
            className="!bg-transparent border-none !text-gray-500 hover:!text-gray-700 hover:!bg-gray-100"
          >
            Lewati
          </IndonesianCTA>
        </div>

        <AnimatePresence mode="wait">
          {/* Goal Selection Step */}
          {!showMoodStep && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 px-6 py-8"
            >
              <div className="max-w-sm mx-auto space-y-4">
                {goalOptions.map((goal, index) => {
                  const isSelected = selectedGoal === goal.id;
                  const isHovered = hoveredGoal === goal.id;
                  
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className={`
                          cursor-pointer transition-all duration-300 transform-gpu
                          ${isSelected 
                            ? 'scale-105 shadow-xl ring-2 ring-primary-300 ring-opacity-50' 
                            : isHovered 
                            ? 'scale-102 shadow-lg' 
                            : 'hover:scale-102 hover:shadow-lg'
                          }
                        `}
                        padding="medium"
                        onClick={() => handleGoalSelect(goal.id)}
                        onMouseEnter={() => setHoveredGoal(goal.id)}
                        onMouseLeave={() => setHoveredGoal(null)}
                        style={{
                          backgroundColor: isSelected 
                            ? `${goal.color}08` 
                            : 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <div className="flex items-start space-x-4">
                          {/* Enhanced Icon */}
                          <motion.div 
                            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                              backgroundColor: `${goal.color}15`,
                              color: goal.color
                            }}
                            animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            <span className="text-2xl">{goal.icon}</span>
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className={`
                              font-heading text-gray-800 mb-2 transition-colors duration-300
                              ${isSelected ? 'font-semibold' : 'font-medium'}
                            `}>
                              {goal.title}
                            </h3>
                            <p className="text-gray-600 font-body text-sm leading-relaxed">
                              {goal.description}
                            </p>
                          </div>

                          {/* Enhanced Selection indicator */}
                          <motion.div 
                            className={`
                              flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300
                              flex items-center justify-center
                              ${isSelected 
                                ? 'border-transparent' 
                                : 'border-gray-300'
                              }
                            `}
                            style={{
                              backgroundColor: isSelected ? goal.color : 'transparent'
                            }}
                            animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <AnimatePresence>
                              {isSelected && (
                                <motion.svg 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  width="12" 
                                  height="12" 
                                  viewBox="0 0 24 24" 
                                  fill="white"
                                >
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>

                        {/* Enhanced Ripple effect */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                          <motion.div 
                            className="absolute inset-0"
                            style={{
                              background: `radial-gradient(circle at center, ${goal.color} 0%, transparent 70%)`
                            }}
                            animate={isSelected ? { opacity: [0, 0.1, 0] } : { opacity: 0 }}
                            transition={{ duration: 1, repeat: isSelected ? Infinity : 0 }}
                          />
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Mood Selection Step */}
          {showMoodStep && !showBreathingDemo && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 px-6 py-8"
            >
              <div className="max-w-sm mx-auto">
                <Card className="p-6 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                  >
                    <h2 className="text-xl font-heading font-semibold text-gray-800 mb-2">
                      Bagaimana perasaanmu saat ini?
                    </h2>
                    <p className="text-gray-600 font-body text-sm">
                      Ini akan membantu kami merekomendasikan sesi yang tepat
                    </p>
                  </motion.div>
                  
                  <MoodSelector
                    selectedMood={currentMood}
                    onMoodSelect={handleMoodSelect}
                    showLabels={true}
                    autoSave={false}
                    label=""
                  />
                  
                  {/* Enhanced visual feedback for mood selection */}
                  {currentMood && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="mt-4 text-center"
                    >
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 rounded-full">
                        <span className="text-sm text-primary-700 font-medium">
                          ✨ Pilihan tersimpan
                        </span>
                      </div>
                    </motion.div>
                  )}
                </Card>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <IndonesianCTA
                    variant="gentle"
                    style="outline"
                    size="medium"
                    onClick={() => setShowBreathingDemo(true)}
                    localization={getOptimalLocalization()}
                    className="!bg-transparent border-none !text-primary-600 hover:!text-primary-700"
                  >
                    Lanjutkan tanpa memilih mood
                  </IndonesianCTA>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Breathing Demo Step */}
          {showBreathingDemo && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 px-6 py-8"
            >
              <div className="max-w-sm mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-xl font-heading font-semibold text-gray-800 mb-2">
                    Coba latihan singkat ini
                  </h2>
                  <p className="text-gray-600 font-body text-sm mb-4">
                    Sebelum memulai, mari rasakan manfaat pernapasan mindful
                  </p>
                </motion.div>
                
                <div className="mb-8">
                  <BreathingCard
                    title="Pernapasan Pengantar"
                    description="Latihan pernapasan 4 detik untuk menenangkan pikiran sebelum memulai"
                    duration={4000}
                    isActive={false}
                    onClick={() => {}}
                  />
                </div>
                
                <div className="space-y-4">
                  <IndonesianCTA
                    variant={getOptimalVariant('start')}
                    style="gradient"
                    size="full"
                    localization={getOptimalLocalization()}
                    onClick={handleComplete}
                  >
                    Mulai Perjalanan Saya
                  </IndonesianCTA>
                  
                  <IndonesianCTAVariants.GentleSkip 
                    style="outline"
                    size="full"
                    onClick={onSkip}
                    localization={getOptimalLocalization()}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Bottom hint */}
        {!showMoodStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-6 pb-12"
          >
            <div className="max-w-sm mx-auto text-center">
              <p className="text-gray-500 font-body text-xs">
                Jangan khawatir, kamu bisa mengubah pilihan ini nanti di pengaturan
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};