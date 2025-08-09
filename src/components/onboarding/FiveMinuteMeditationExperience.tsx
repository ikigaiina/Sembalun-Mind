import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CairnIcon } from '../ui';
import type { CulturalData } from './CulturalPersonalizationScreen';
import type { PersonalizationGoal } from '../../types/onboarding';

interface MeditationPhase {
  id: string;
  name: string;
  duration: number; // in seconds
  instruction: string;
  breathingPattern?: {
    inhale: number;
    hold?: number;
    exhale: number;
    pause?: number;
  };
  visualization?: string;
}

interface MeditationSession {
  goal: PersonalizationGoal;
  culturalContext: string;
  phases: MeditationPhase[];
  totalDuration: number;
  guidance: {
    voice: 'male' | 'female';
    language: 'id' | 'jv' | 'su'; // Indonesian, Javanese, Sundanese
    tone: 'gentle' | 'energizing' | 'calming';
  };
}

interface FiveMinuteMeditationExperienceProps {
  culturalData?: CulturalData;
  onComplete: (rating: number, goal: PersonalizationGoal, insights: MeditationInsights) => void;
  onSkip?: () => void;
}

interface MeditationInsights {
  heartRateVariability?: number;
  focusScore: number;
  calmingEffect: number;
  culturalResonance: number;
  preferredPhase: string;
  completionRate: number;
  enjoymentLevel: number;
}

const MEDITATION_SESSIONS: { [key in PersonalizationGoal]: MeditationSession } = {
  stress: {
    goal: 'stress',
    culturalContext: 'Ketenangan sejenak dengan alam Nusantara',
    totalDuration: 60, // 1 minute
    guidance: {
      voice: 'female',
      language: 'id',
      tone: 'calming'
    },
    phases: [
      {
        id: 'grounding',
        name: 'Mendasar dengan Alam',
        duration: 60,
        instruction: 'Rasakan tubuh Anda duduk dengan tenang. Bayangkan akar pohon beringin tua yang tumbuh dari telapak kaki Anda, menghubungkan jiwa dengan kedamaian bumi Nusantara. Bernapaslah perlahan, ikuti ritme alam yang tenang.',
        visualization: 'Anda duduk di bawah pohon beringin rindang di halaman rumah tradisional Jawa, angin sepoi-sepoi membawa ketenangan',
        breathingPattern: { inhale: 3, hold: 1, exhale: 4, pause: 1 }
      }
    ]
  },
  focus: {
    goal: 'focus',
    culturalContext: 'Kejernihan pikiran dengan kebijaksanaan tradisional',
    totalDuration: 60, // 1 minute
    guidance: {
      voice: 'male',
      language: 'id',
      tone: 'gentle'
    },
    phases: [
      {
        id: 'single-point-focus',
        name: 'Satu Titik Kedamaian',
        duration: 60,
        instruction: 'Duduk tegak dengan lembut. Fokuskan pikiran pada napas yang masuk dan keluar seperti angin lembut di atas sawah. Satu napas, satu fokus, satu kedamaian.',
        visualization: 'Lentera kecil di ruang tenang, cahayanya stabil dan menenangkan, seperti fokus pikiran Anda',
        breathingPattern: { inhale: 3, exhale: 4 }
      }
    ]
  },
  sleep: {
    goal: 'sleep',
    culturalContext: 'Ritual ketenangan senja Nusantara',
    totalDuration: 60, // 1 minute
    guidance: {
      voice: 'female',
      language: 'id',
      tone: 'calming'
    },
    phases: [
      {
        id: 'evening-peace',
        name: 'Kedamaian Senja',
        duration: 60,
        instruction: 'Tutup mata perlahan. Rasakan tubuh yang mulai rileks seperti senja yang turun dengan lembut. Setiap napas membawa ketenangan lebih dalam, mempersiapkan jiwa untuk istirahat yang nyenyak.',
        visualization: 'Senja keemasan di teras rumah, ketenangan malam yang menyelimuti, tubuh dan pikiran bersiap untuk tidur damai',
        breathingPattern: { inhale: 2, exhale: 5 }
      }
    ]
  },
  curious: {
    goal: 'curious',
    culturalContext: 'Eksplorasi kesadaran dengan rasa ingin tahu',
    totalDuration: 60, // 1 minute
    guidance: {
      voice: 'female',
      language: 'id',
      tone: 'gentle'
    },
    phases: [
      {
        id: 'mindful-curiosity',
        name: 'Keingintahuan yang Sadar',
        duration: 60,
        instruction: 'Dengan mata tertutup, jadilah pengamat yang penuh kasih sayang terhadap diri sendiri. Amati napas seperti merasakan ritme alam yang lembut. Tidak menghakimi, hanya mengamati dengan rasa ingin tahu yang penuh cinta.',
        visualization: 'Anda seperti anak kecil yang mengamati kupu-kupu di taman, penuh kagum dan keingintahuan murni',
        breathingPattern: { inhale: 3, exhale: 3 }
      }
    ]
  }
};

export const FiveMinuteMeditationExperience: React.FC<FiveMinuteMeditationExperienceProps> = ({
  culturalData,
  onComplete,
  onSkip
}) => {
  const [selectedGoal, setSelectedGoal] = useState<PersonalizationGoal | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(60);
  const [meditationStarted, setMeditationStarted] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [insights, setInsights] = useState<Partial<MeditationInsights>>({});
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'pause' | 'exhale' | 'rest'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentSession = selectedGoal ? MEDITATION_SESSIONS[selectedGoal] : null;
  const currentPhase = currentSession?.phases[currentPhaseIndex];

  // Auto-suggest goal based on cultural data
  useEffect(() => {
    if (culturalData && !selectedGoal) {
      // Intelligent goal suggestion based on cultural context
      if (culturalData.familyContext === 'limited-privacy') {
        setSelectedGoal('stress'); // Quick stress relief for busy environments
      } else if (culturalData.spiritualTradition === 'islam' && culturalData.region?.includes('jawa')) {
        setSelectedGoal('focus'); // Focus meditation aligns with prayer practices
      } else if (culturalData.lifestyle === 'student' || culturalData.lifestyle === 'working') {
        setSelectedGoal('curious'); // Exploration for learning mindset
      } else {
        setSelectedGoal('stress'); // Default to stress relief
      }
    }
  }, [culturalData, selectedGoal]);

  // Smooth breathing animation logic with millisecond precision
  const startBreathingAnimation = useCallback(() => {
    if (!currentPhase?.breathingPattern || !isPlaying) return;

    const pattern = currentPhase.breathingPattern;
    
    const runBreathingCycle = () => {
      // Inhale phase - smooth countdown
      setBreathingPhase('inhale');
      let inhaleStart = Date.now();
      let inhaleDuration = pattern.inhale * 1000;
      
      const inhaleUpdate = () => {
        const elapsed = Date.now() - inhaleStart;
        const remaining = Math.max(0, inhaleDuration - elapsed);
        const remainingSeconds = Math.ceil(remaining / 1000);
        
        setBreathingTimer(remainingSeconds);
        
        if (remaining > 0 && isPlaying) {
          requestAnimationFrame(inhaleUpdate);
        } else if (isPlaying) {
          // Move to pause or exhale
          if (pattern.pause) {
            startPause();
          } else {
            startExhale();
          }
        }
      };
      
      const startPause = () => {
        setBreathingPhase('pause');
        let pauseStart = Date.now();
        let pauseDuration = (pattern.pause || 1) * 1000;
        
        const pauseUpdate = () => {
          const elapsed = Date.now() - pauseStart;
          const remaining = Math.max(0, pauseDuration - elapsed);
          const remainingSeconds = Math.ceil(remaining / 1000);
          
          setBreathingTimer(remainingSeconds);
          
          if (remaining > 0 && isPlaying) {
            requestAnimationFrame(pauseUpdate);
          } else if (isPlaying) {
            startExhale();
          }
        };
        
        requestAnimationFrame(pauseUpdate);
      };
      
      const startExhale = () => {
        setBreathingPhase('exhale');
        let exhaleStart = Date.now();
        let exhaleDuration = pattern.exhale * 1000;
        
        const exhaleUpdate = () => {
          const elapsed = Date.now() - exhaleStart;
          const remaining = Math.max(0, exhaleDuration - elapsed);
          const remainingSeconds = Math.ceil(remaining / 1000);
          
          setBreathingTimer(remainingSeconds);
          
          if (remaining > 0 && isPlaying) {
            requestAnimationFrame(exhaleUpdate);
          } else if (isPlaying) {
            // Move to rest or next cycle
            if (pattern.pause) {
              startRest();
            } else {
              runBreathingCycle();
            }
          }
        };
        
        requestAnimationFrame(exhaleUpdate);
      };
      
      const startRest = () => {
        setBreathingPhase('rest');
        let restStart = Date.now();
        let restDuration = (pattern.pause || 1) * 1000;
        
        const restUpdate = () => {
          const elapsed = Date.now() - restStart;
          const remaining = Math.max(0, restDuration - elapsed);
          const remainingSeconds = Math.ceil(remaining / 1000);
          
          setBreathingTimer(remainingSeconds);
          
          if (remaining > 0 && isPlaying) {
            requestAnimationFrame(restUpdate);
          } else if (isPlaying) {
            runBreathingCycle(); // Continue cycle
          }
        };
        
        requestAnimationFrame(restUpdate);
      };
      
      requestAnimationFrame(inhaleUpdate);
    };

    runBreathingCycle();
  }, [currentPhase, isPlaying]);

  // Timer management
  const startTimer = useCallback(() => {
    if (!currentSession) return;

    setIsPlaying(true);
    
    // Only set initial values if this is the first start (not resume)
    if (!meditationStarted) {
      setMeditationStarted(true);
      startTimeRef.current = Date.now();
      
      // Set initial phase time
      setPhaseTimeRemaining(currentSession.phases[0].duration);
      setTotalTimeRemaining(currentSession.totalDuration);
    }

    // Main timer countdown
    timerRef.current = setInterval(() => {
      setTotalTimeRemaining(prev => {
        if (prev <= 1) {
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Phase timer countdown
    phaseTimerRef.current = setInterval(() => {
      setPhaseTimeRemaining(prev => {
        if (prev <= 1) {
          nextPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentSession, currentPhaseIndex, meditationStarted]);

  const pauseTimer = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    // Don't reset breathing state - keep current phase and timer for resume
  }, []);

  const nextPhase = useCallback(() => {
    if (!currentSession) return;

    const nextIndex = currentPhaseIndex + 1;
    if (nextIndex < currentSession.phases.length) {
      setCurrentPhaseIndex(nextIndex);
      setPhaseTimeRemaining(currentSession.phases[nextIndex].duration);
    }
  }, [currentSession, currentPhaseIndex]);

  const completeSession = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);

    // Calculate insights
    const actualDuration = (Date.now() - startTimeRef.current) / 1000;
    const completionRate = Math.min(100, (actualDuration / 60) * 100);
    
    const sessionInsights: MeditationInsights = {
      focusScore: Math.random() * 20 + 70, // Simulated score 70-90
      calmingEffect: Math.random() * 25 + 65, // Simulated score 65-90
      culturalResonance: culturalData ? Math.random() * 15 + 80 : Math.random() * 20 + 60,
      preferredPhase: currentSession?.phases[Math.floor(Math.random() * currentSession.phases.length)].name || '',
      completionRate,
      enjoymentLevel: Math.random() * 20 + 75
    };

    setInsights(sessionInsights);
    setShowCompletionForm(true);
  }, [currentSession, culturalData]);

  const handleRating = useCallback((rating: number) => {
    if (!selectedGoal || !insights) return;

    const finalInsights: MeditationInsights = {
      ...insights,
      enjoymentLevel: rating * 20 // Convert 1-5 rating to 0-100 scale
    } as MeditationInsights;

    onComplete(rating, selectedGoal, finalInsights);
  }, [selectedGoal, insights, onComplete]);

  // Start breathing animation when meditation starts
  useEffect(() => {
    if (meditationStarted && isPlaying && currentPhase?.breathingPattern) {
      startBreathingAnimation();
    }
  }, [meditationStarted, isPlaying, startBreathingAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, []);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Goal selection screen
  if (!selectedGoal) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-neutral-50 to-stone-100 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Floating background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gentle ripples */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`ripple-${i}`}
              className="absolute rounded-full border border-stone-200/20"
              style={{
                width: `${300 + i * 200}px`,
                height: `${300 + i * 200}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.05, 0.15, 0.05],
              }}
              transition={{
                duration: 12 + i * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 3
              }}
            />
          ))}
          
          {/* Soft mist effect */}
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={`mist-${i}`}
              className="absolute rounded-full bg-stone-100/30 blur-3xl"
              style={{
                width: `${200 + i * 150}px`,
                height: `${100 + i * 75}px`,
                left: `${20 + i * 40}%`,
                top: `${60 + i * 10}%`,
              }}
              animate={{
                x: [0, 30, 0],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 20 + i * 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 5
              }}
            />
          ))}
        </div>

        <Card className="p-6 max-w-lg w-full relative bg-white/60 backdrop-blur-sm border-stone-100 shadow-xl">
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-4 relative"
            >
              {/* Gentle aura for icon */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-stone-200/30 blur-xl"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="w-14 h-14 mx-auto relative z-10 flex items-center justify-center">
                <motion.div
                  className="w-8 h-8 rounded-full bg-stone-300/50"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.6, 0.8, 0.6]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-xl font-light text-stone-700 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Ketenangan Sejenak
            </motion.h2>
            <motion.p 
              className="text-stone-500 text-sm font-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Satu menit untuk jiwa yang tenang
            </motion.p>
          </div>

          <div className="space-y-3">
            {Object.entries(MEDITATION_SESSIONS).map(([goal, session], index) => (
              <motion.button
                key={goal}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedGoal(goal as PersonalizationGoal)}
                className="w-full p-4 text-left rounded-xl border-2 border-green-100 hover:border-green-300 hover:bg-green-50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-700 text-base mb-1">
                      {goal === 'stress' && '🍃 Ketenangan dengan Alam'}
                      {goal === 'focus' && '🧘‍♀️ Kejernihan Pikiran'}
                      {goal === 'sleep' && '🌙 Kedamaian Senja'}
                      {goal === 'curious' && '🌱 Kesadaran Penuh'}
                    </h3>
                    <p className="text-xs text-gray-500 italic">
                      {session.culturalContext}
                    </p>
                  </div>
                  <div className="text-center px-3">
                    <div className="text-lg font-light text-green-600">
                      1
                    </div>
                    <div className="text-xs text-gray-400">
                      menit
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-4 text-center">
            <motion.button 
              onClick={onSkip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
            >
              Lewati dan lanjutkan →
            </motion.button>
          </div>
        </Card>
      </div>
    );
  }

  // Completion form
  if (showCompletionForm) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-2xl">✨</span>
            </motion.div>
            
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
              Meditasi Selesai!
            </h2>
            <p className="text-gray-600">
              Bagaimana perasaan Anda setelah sesi meditasi ini?
            </p>
          </div>

          {/* Insights Display */}
          <div className="space-y-4 mb-8">
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">📊 Insight Sesi Anda:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fokus</span>
                  <span className="font-medium text-blue-600">{Math.round(insights.focusScore || 0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ketenangan</span>
                  <span className="font-medium text-green-600">{Math.round(insights.calmingEffect || 0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Relevansi</span>
                  <span className="font-medium text-purple-600">{Math.round(insights.culturalResonance || 0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Selesai</span>
                  <span className="font-medium text-indigo-600">{Math.round(insights.completionRate || 0)}%</span>
                </div>
              </div>
            </div>

            {insights.preferredPhase && (
              <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                <span className="font-medium">💡 Fase favorit: </span>
                <span className="text-gray-700">{insights.preferredPhase}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-800 mb-4 text-center">
              Berikan rating pengalaman Anda:
            </h4>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <motion.button
                  key={rating}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRating(rating)}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg hover:shadow-lg transition-shadow"
                >
                  ⭐
                </motion.button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Kurang</span>
              <span>Sangat Baik</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Meditation player interface - single page layout
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col p-4 relative overflow-hidden">
      {/* Animation Section - Centered in reduced top space */}
      <div className="flex-1 flex items-center justify-center min-h-0" style={{ flex: '0.8' }}>
        {currentPhase?.breathingPattern && meditationStarted && isPlaying ? (
          // Breathing Animation - Only when playing
          <motion.div
            className="w-24 h-24 rounded-full border-2 border-stone-300/40 bg-stone-100/30 backdrop-blur-sm flex items-center justify-center"
            animate={{
              scale: breathingPhase === 'inhale' ? [1, 1.15] :
                    breathingPhase === 'exhale' ? [1.15, 1] :
                    1,
              borderColor: breathingPhase === 'inhale' ? 'rgba(168, 162, 158, 0.6)' :
                         breathingPhase === 'exhale' ? 'rgba(120, 113, 108, 0.6)' :
                         'rgba(214, 211, 209, 0.4)'
            }}
            transition={{
              duration: breathingPhase === 'inhale' ? currentPhase.breathingPattern.inhale :
                       breathingPhase === 'exhale' ? currentPhase.breathingPattern.exhale :
                       2,
              ease: [0.4, 0, 0.6, 1]
            }}
          >
            <motion.div 
              className="w-3 h-3 rounded-full bg-stone-400/70"
              animate={{
                scale: breathingPhase === 'inhale' ? [1, 1.5] :
                      breathingPhase === 'exhale' ? [1.5, 1] :
                      1,
                opacity: breathingPhase === 'pause' ? [0.7, 1, 0.7] : 0.8
              }}
              transition={{
                duration: breathingPhase === 'inhale' ? currentPhase.breathingPattern.inhale :
                         breathingPhase === 'exhale' ? currentPhase.breathingPattern.exhale :
                         1,
                ease: "easeInOut",
                repeat: breathingPhase === 'pause' ? Infinity : 0
              }}
            />
          </motion.div>
        ) : (
          // Static Circle when not started or paused
          <div className="w-24 h-24 rounded-full border-2 border-stone-300/30 bg-stone-100/20 backdrop-blur-sm flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-stone-400/50" />
          </div>
        )}
      </div>

      {/* Content Section - Fixed at bottom */}
      <div className="flex-shrink-0">
        <div className="max-w-sm mx-auto w-full bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-stone-200/50">
          {/* Phase Title */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-light text-stone-700 mb-1">
              {currentPhase?.name || 'Ketenangan Sejenak'}
            </h2>
            <p className="text-stone-500 text-sm font-light">
              {currentSession?.culturalContext || 'Satu menit untuk jiwa yang tenang'}
            </p>
          </div>

          {/* Timer - Always Visible */}
          <div className="text-center mb-4">
            <motion.div 
              className="text-3xl font-light text-stone-700 mb-1"
              animate={{ opacity: isPlaying ? [0.9, 1, 0.9] : 1 }}
              transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
            >
              {formatTime(totalTimeRemaining)}
            </motion.div>
            
            {/* Progress Bar */}
            <div className="w-full h-1 bg-stone-200/40 rounded-full overflow-hidden mb-1">
              <motion.div 
                className="h-full bg-stone-400/60 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${totalTimeRemaining > 0 ? ((60 - totalTimeRemaining) / 60) * 100 : 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            <div className="text-xs text-stone-400 font-light mb-3">
              Waktu tersisa untuk kedamaian
            </div>
          </div>

          {/* Breathing Instructions - Only when active and playing */}
          {currentPhase?.breathingPattern && meditationStarted && isPlaying && (
            <AnimatePresence mode="wait">
              <motion.div
                key={breathingPhase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-4"
              >
                <div className="text-base font-light text-stone-600 mb-1">
                  {breathingPhase === 'inhale' && 'Hirup perlahan'}
                  {breathingPhase === 'exhale' && 'Hembuskan lembut'}
                  {breathingPhase === 'pause' && 'Tahan sejenak'}
                  {breathingPhase === 'rest' && 'Istirahat'}
                </div>
                
                <div className="text-xl font-light text-stone-700 mb-1">
                  {breathingTimer}
                </div>
                
                <div className="text-xs text-stone-400 font-light">
                  {breathingPhase === 'inhale' && 'Rasakan udara masuk'}
                  {breathingPhase === 'exhale' && 'Lepaskan ketegangan'}
                  {breathingPhase === 'pause' && 'Nikmati ketenangan'}
                  {breathingPhase === 'rest' && 'Bersiap napas berikutnya'}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Instruction Text - Only when not started */}
          {!meditationStarted && currentPhase?.instruction && (
            <div className="text-center mb-4">
              <p className="text-stone-600 text-sm font-light leading-relaxed">
                {currentPhase.instruction}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-3 mb-3">
            {!meditationStarted ? (
              <motion.button
                onClick={startTimer}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 bg-stone-400/80 text-white rounded-xl font-light text-sm shadow-md hover:shadow-lg hover:bg-stone-500/80 transition-all duration-300"
              >
                Mulai Ketenangan
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={isPlaying ? pauseTimer : startTimer}
                  className="px-5 py-2.5 bg-stone-300/70 text-stone-700 rounded-xl font-light text-sm shadow-md hover:bg-stone-400/70 hover:text-white transition-all duration-300"
                >
                  {isPlaying ? 'Istirahat' : 'Lanjut'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={completeSession}
                  className="px-5 py-2.5 bg-stone-400/80 text-white rounded-xl font-light text-sm shadow-md hover:bg-stone-500/80 transition-all duration-300"
                >
                  Selesai
                </motion.button>
              </>
            )}
          </div>

          {/* Skip option - Only when not started */}
          {!meditationStarted && (
            <div className="text-center">
              <button 
                onClick={onSkip}
                className="text-stone-400 text-xs hover:text-stone-600 transition-colors font-light"
              >
                Lewati dan lanjutkan →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiveMinuteMeditationExperience;