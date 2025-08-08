import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CairnIcon } from '../ui';
import IndonesianCTA from '../ui/IndonesianCTA';
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
  backgroundSound?: string;
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
    culturalContext: 'Indonesian stress relief with nature sounds',
    totalDuration: 300, // 5 minutes
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
        instruction: 'Rasakan kaki Anda terhubung dengan bumi, seperti akar pohon beringin yang kuat.',
        visualization: 'Bayangkan diri Anda di bawah pohon beringin rindang di pedesaan Jawa'
      },
      {
        id: 'breathing',
        name: 'Napas Gunung Sembalun',
        duration: 120,
        instruction: 'Bernapas dengan ritme gunung - dalam dan tenang seperti hembusan angin pegunungan.',
        breathingPattern: { inhale: 4, hold: 2, exhale: 6, pause: 2 },
        backgroundSound: 'mountain-breeze'
      },
      {
        id: 'release',
        name: 'Melepaskan Beban',
        duration: 90,
        instruction: 'Setiap napas keluar, lepaskan satu beban dari pundak Anda. Biarkan mengalir seperti air sungai.',
        visualization: 'Air sungai jernih membawa pergi semua kekhawatiran Anda'
      },
      {
        id: 'integration',
        name: 'Kembali dengan Tenang',
        duration: 30,
        instruction: 'Bawa ketenangan ini kembali ke hari Anda. Anda adalah gunung yang tegak, tenang dalam badai apapun.',
        backgroundSound: 'gentle-gamelan'
      }
    ]
  },
  focus: {
    goal: 'focus',
    culturalContext: 'Indonesian concentration with traditional wisdom',
    totalDuration: 300,
    guidance: {
      voice: 'male',
      language: 'id',
      tone: 'gentle'
    },
    phases: [
      {
        id: 'centering',
        name: 'Memusatkan Seperti Pemanah',
        duration: 45,
        instruction: 'Duduk tegak seperti pemanah Jawa yang akan melepaskan panah. Fokus pada satu titik.',
        visualization: 'Anda adalah pemanah yang tenang, memusatkan perhatian pada target'
      },
      {
        id: 'single-point',
        name: 'Satu Titik Cahaya',
        duration: 150,
        instruction: 'Fokuskan pikiran pada satu titik cahaya. Seperti lentera dalam kegelapan, biarkan fokus Anda menerangi.',
        breathingPattern: { inhale: 4, exhale: 4 }
      },
      {
        id: 'expansion',
        name: 'Memperluas Kesadaran',
        duration: 75,
        instruction: 'Dari satu titik fokus, perluas kesadaran seperti cahaya matahari yang menyebar perlahan.',
        visualization: 'Matahari terbit di atas sawah, menyebar cahaya dengan lembut'
      },
      {
        id: 'return',
        name: 'Kembali dengan Jernih',
        duration: 30,
        instruction: 'Bawa kejernihan ini ke aktivitas Anda. Pikiran yang terfokus adalah kekuatan sejati.',
        backgroundSound: 'temple-bell'
      }
    ]
  },
  sleep: {
    goal: 'sleep',
    culturalContext: 'Indonesian evening relaxation ritual',
    totalDuration: 300,
    guidance: {
      voice: 'female',
      language: 'id',
      tone: 'calming'
    },
    phases: [
      {
        id: 'evening-transition',
        name: 'Transisi Senja',
        duration: 60,
        instruction: 'Seperti matahari yang perlahan tenggelam, biarkan aktivitas hari ini juga perlahan mereda.',
        visualization: 'Senja keemasan di pantai, ombak tenang menyapa pantai'
      },
      {
        id: 'body-release',
        name: 'Melepaskan Tubuh',
        duration: 120,
        instruction: 'Mulai dari ujung kaki, lepaskan setiap ketegangan. Bayangkan air hangat mengalir melepaskan semua lelah.',
        breathingPattern: { inhale: 3, exhale: 7 },
        backgroundSound: 'night-crickets'
      },
      {
        id: 'mind-quieting',
        name: 'Menenangkan Pikiran',
        duration: 90,
        instruction: 'Biarkan pikiran seperti kolam tenang di malam hari. Jernih, dalam, dan damai.',
        visualization: 'Kolam teratai di malam bulan purnama, tenang sempurna'
      },
      {
        id: 'sleep-preparation',
        name: 'Bersiap Tidur Nyenyak',
        duration: 30,
        instruction: 'Tubuh dan pikiran siap beristirahat. Tidur adalah berkah, sambut dengan syukur.',
        backgroundSound: 'soft-rain'
      }
    ]
  },
  curious: {
    goal: 'curious',
    culturalContext: 'Indonesian mindfulness exploration',
    totalDuration: 300,
    guidance: {
      voice: 'female',
      language: 'id',
      tone: 'gentle'
    },
    phases: [
      {
        id: 'curiosity-opening',
        name: 'Membuka Rasa Ingin Tahu',
        duration: 45,
        instruction: 'Seperti anak kecil yang melihat dunia untuk pertama kali, buka mata hati Anda.',
        visualization: 'Anda berjalan di kebun raya, mengagumi setiap detail kehidupan'
      },
      {
        id: 'awareness-exploration',
        name: 'Menjelajahi Kesadaran',
        duration: 150,
        instruction: 'Amati napas tanpa mengubahnya. Amati pikiran tanpa menghakiminya. Jadi peneliti diri sendiri.',
        breathingPattern: { inhale: 4, exhale: 4 }
      },
      {
        id: 'wonder-cultivation',
        name: 'Menumbuhkan Kagum',
        duration: 75,
        instruction: 'Rasakan keajaiban tubuh yang bernapas, hati yang berdetak. Hidup ini adalah keajaiban.',
        visualization: 'Matahari terbit pertama yang Anda saksikan, rasa kagum yang murni'
      },
      {
        id: 'integration-wisdom',
        name: 'Mengintegrasikan Kebijaksanaan',
        duration: 30,
        instruction: 'Bawa rasa ingin tahu ini ke hari Anda. Setiap momen adalah guru, setiap napas adalah berkat.',
        backgroundSound: 'morning-birds'
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
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(300);
  const [meditationStarted, setMeditationStarted] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [insights, setInsights] = useState<Partial<MeditationInsights>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Timer management
  const startTimer = useCallback(() => {
    if (!currentSession) return;

    setIsPlaying(true);
    setMeditationStarted(true);
    startTimeRef.current = Date.now();
    
    // Set initial phase time
    setPhaseTimeRemaining(currentSession.phases[0].duration);
    setTotalTimeRemaining(currentSession.totalDuration);

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
  }, [currentSession, currentPhaseIndex]);

  const pauseTimer = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
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
    const completionRate = Math.min(100, (actualDuration / 300) * 100);
    
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
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
      <div className="max-w-lg mx-auto p-6">
        <Card className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4"
            >
              <CairnIcon size={56} className="text-primary-600 mx-auto" />
            </motion.div>
            
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
              🧘‍♀️ Pengalaman Meditasi 5 Menit
            </h2>
            <p className="text-gray-600">
              Pilih fokus meditasi yang paling sesuai dengan kebutuhan Anda saat ini
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(MEDITATION_SESSIONS).map(([goal, session]) => (
              <motion.button
                key={goal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedGoal(goal as PersonalizationGoal)}
                className="w-full p-4 text-left rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 capitalize">
                      {goal === 'stress' && '😌 Meredakan Stres'}
                      {goal === 'focus' && '🎯 Meningkatkan Fokus'}
                      {goal === 'sleep' && '😴 Persiapan Tidur'}
                      {goal === 'curious' && '🔍 Eksplorasi Mindfulness'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {session.culturalContext}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {Math.floor(session.totalDuration / 60)} menit
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.phases.length} tahap
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={onSkip}
              className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Lewati pengalaman ini →
            </button>
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

  // Meditation player interface
  return (
    <div className="max-w-lg mx-auto p-6">
      <Card className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              scale: isPlaying ? [1, 1.05, 1] : 1,
              rotate: isPlaying ? [0, 5, -5, 0] : 0
            }}
            transition={{ 
              duration: isPlaying ? 4 : 0,
              repeat: isPlaying ? Infinity : 0,
              ease: "easeInOut"
            }}
            className="mb-4"
          >
            <CairnIcon 
              size={64} 
              progress={totalTimeRemaining > 0 ? ((300 - totalTimeRemaining) / 300) * 100 : 100}
              className="text-primary-600 mx-auto" 
            />
          </motion.div>
          
          <h2 className="text-xl font-heading font-bold text-gray-800 mb-1">
            {currentSession?.guidance.tone === 'calming' && '🌸'}
            {currentSession?.guidance.tone === 'gentle' && '🕉️'}
            {currentSession?.guidance.tone === 'energizing' && '⚡'}
            {' '}
            {currentPhase?.name}
          </h2>
          <p className="text-gray-600 text-sm">
            {currentSession?.culturalContext}
          </p>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="text-4xl font-mono font-bold text-primary-600 mb-2">
            {formatTime(totalTimeRemaining)}
          </div>
          <div className="text-sm text-gray-500">
            Fase: {formatTime(phaseTimeRemaining)} | 
            Tahap {currentPhaseIndex + 1} dari {currentSession?.phases.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${totalTimeRemaining > 0 ? ((300 - totalTimeRemaining) / 300) * 100 : 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Phase indicators */}
          <div className="flex justify-between mt-2">
            {currentSession?.phases.map((phase, index) => (
              <div 
                key={phase.id}
                className={`text-xs ${
                  index === currentPhaseIndex 
                    ? 'text-primary-600 font-semibold' 
                    : index < currentPhaseIndex 
                      ? 'text-green-600' 
                      : 'text-gray-400'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Current Instruction */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 text-center"
          >
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-6 rounded-xl">
              <p className="text-gray-700 leading-relaxed">
                {currentPhase?.instruction}
              </p>
              
              {currentPhase?.breathingPattern && (
                <div className="mt-4 text-sm text-gray-600">
                  <span className="font-medium">Pola napas:</span>
                  <span className="ml-2">
                    Hirup {currentPhase.breathingPattern.inhale}s
                    {currentPhase.breathingPattern.hold && ` → Tahan ${currentPhase.breathingPattern.hold}s`}
                    → Hembuskan {currentPhase.breathingPattern.exhale}s
                    {currentPhase.breathingPattern.pause && ` → Jeda ${currentPhase.breathingPattern.pause}s`}
                  </span>
                </div>
              )}
              
              {currentPhase?.visualization && (
                <div className="mt-3 text-sm text-purple-700 italic">
                  💭 {currentPhase.visualization}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!meditationStarted ? (
            <IndonesianCTA
              onClick={startTimer}
              size="large"
              variant="spiritual"
              culturalContext={culturalData}
            >
              🧘‍♀️ Mulai Meditasi
            </IndonesianCTA>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isPlaying ? pauseTimer : startTimer}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
              >
                {isPlaying ? '⏸️ Jeda' : '▶️ Lanjut'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={completeSession}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
              >
                ⏹️ Selesai
              </motion.button>
            </>
          )}
        </div>

        {/* Skip option */}
        {!meditationStarted && (
          <div className="mt-6 text-center">
            <button 
              onClick={onSkip}
              className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Lewati pengalaman ini →
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FiveMinuteMeditationExperience;