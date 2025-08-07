import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CairnIcon } from '../ui';
import IndonesianCTA from '../ui/IndonesianCTA';
import IndonesianWisdomQuote from '../ui/IndonesianWisdomQuote';
import { PrayerTimeNotification } from '../ui/PrayerTimeNotification';
import type { CulturalData } from '../onboarding/CulturalPersonalizationScreen';
import type { MoodType } from '../../types/mood';

export interface CulturalAdaptationContext {
  culturalData: CulturalData;
  currentMood?: MoodType;
  timeOfDay: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  location?: {
    region: string;
    timezone: string;
  };
  sessionHistory: {
    completedSessions: number;
    preferredTimes: string[];
    successfulTechniques: string[];
  };
  realTimeContext: {
    isHoliday?: boolean;
    weatherCondition?: string;
    socialContext?: 'alone' | 'with-family' | 'in-public';
  };
}

export interface AdaptationRule {
  id: string;
  priority: number;
  condition: (context: CulturalAdaptationContext) => boolean;
  adaptation: {
    uiChanges: UIAdaptation;
    contentChanges: ContentAdaptation;
    behaviorChanges: BehaviorAdaptation;
  };
  description: string;
}

interface UIAdaptation {
  colorScheme?: 'warm' | 'cool' | 'neutral' | 'high-contrast';
  typography?: 'formal' | 'casual' | 'traditional';
  iconSet?: 'universal' | 'islamic' | 'hindu' | 'javanese' | 'christian';
  layoutDensity?: 'compact' | 'comfortable' | 'spacious';
  navigationStyle?: 'bottom-tabs' | 'drawer' | 'top-tabs';
  animations?: 'full' | 'reduced' | 'none';
}

interface ContentAdaptation {
  language?: 'formal-id' | 'casual-id' | 'regional-dialect';
  wisdomSources?: string[];
  meditationStyles?: string[];
  audioPreferences?: {
    voiceGender: 'male' | 'female' | 'neutral';
    backgroundSounds: 'nature' | 'traditional' | 'minimal' | 'none';
    guidanceStyle: 'directive' | 'gentle' | 'questioning';
  };
  greeting?: string;
  motivationalMessages?: string[];
}

interface BehaviorAdaptation {
  sessionRecommendations?: {
    preferredDuration: number;
    suggestedTimes: string[];
    techniques: string[];
  };
  reminderSettings?: {
    frequency: 'high' | 'medium' | 'low' | 'off';
    timing: string[];
    style: 'gentle' | 'motivational' | 'cultural';
  };
  socialFeatures?: {
    communityVisibility: boolean;
    sharingPreferences: string[];
    familyIntegration: boolean;
  };
}

/**
 * REAL-TIME CULTURAL ADAPTATION ENGINE
 * 
 * This system continuously adapts the app based on:
 * 1. Cultural background and spiritual beliefs
 * 2. Real-time context (time, mood, location)
 * 3. Behavioral patterns and preferences
 * 4. Indonesian-specific cultural events and holidays
 */

const INDONESIAN_ADAPTATION_RULES: AdaptationRule[] = [
  // ISLAMIC USER ADAPTATIONS
  {
    id: 'islamic-prayer-integration',
    priority: 10, // Highest priority
    condition: (ctx) => ctx.culturalData.spiritualTradition === 'islam',
    adaptation: {
      uiChanges: {
        colorScheme: 'warm',
        iconSet: 'islamic',
        typography: 'formal'
      },
      contentChanges: {
        language: 'formal-id',
        wisdomSources: ['Al-Quran', 'Hadits', 'Kearifan Ulama Nusantara'],
        greeting: 'Assalamu\'alaikum, semoga berkah dalam setiap langkah',
        motivationalMessages: [
          'Setiap dzikir adalah kedekatan dengan Allah SWT',
          'Ketenangan jiwa adalah anugerah terbesar',
          'Sabar dan syukur adalah kunci kedamaian'
        ],
        audioPreferences: {
          voiceGender: 'male',
          backgroundSounds: 'minimal',
          guidanceStyle: 'gentle'
        }
      },
      behaviorAdaptation: {
        sessionRecommendations: {
          preferredDuration: 5, // Shorter sessions around prayer times
          suggestedTimes: ['05:30', '13:00', '18:30'], // After prayers
          techniques: ['dzikr-meditation', 'gratitude-reflection', 'breath-awareness']
        },
        reminderSettings: {
          frequency: 'medium',
          timing: ['after-fajr', 'after-dhuhr', 'after-maghrib'],
          style: 'cultural'
        }
      }
    },
    description: 'Islamic users get prayer-integrated experience with halal content'
  },

  // JAVANESE CULTURAL ADAPTATION
  {
    id: 'javanese-wisdom-integration',
    priority: 8,
    condition: (ctx) => ctx.culturalData.region?.includes('jawa') || ctx.culturalData.spiritualTradition === 'javanese',
    adaptation: {
      uiChanges: {
        colorScheme: 'neutral',
        iconSet: 'javanese',
        typography: 'traditional',
        layoutDensity: 'comfortable'
      },
      contentChanges: {
        language: 'formal-id',
        wisdomSources: ['Serat Centhini', 'Primbon', 'Kearifan Leluhur Jawa'],
        greeting: 'Sugeng rawuh, semoga panggah lan tentrem',
        motivationalMessages: [
          'Manunggaling kawulo Gusti - penyatuan diri dengan Yang Maha Kuasa',
          'Ngudi kasunyatan - mencari kebenaran sejati',
          'Sepi ing pamrih, rame ing gawe - tanpa pamrih namun aktif berbuat'
        ]
      },
      behaviorAdaptation: {
        sessionRecommendations: {
          preferredDuration: 10, // Longer contemplative sessions
          suggestedTimes: ['04:00', '18:00', '21:00'], // Traditional Javanese timing
          techniques: ['contemplative-meditation', 'ancestor-wisdom', 'nature-connection']
        }
      }
    },
    description: 'Javanese users get traditional wisdom and respectful language'
  },

  // BALINESE HINDU ADAPTATION
  {
    id: 'balinese-hindu-integration',
    priority: 8,
    condition: (ctx) => ctx.culturalData.region === 'bali' || ctx.culturalData.spiritualTradition === 'hindu',
    adaptation: {
      uiChanges: {
        colorScheme: 'warm',
        iconSet: 'hindu',
        typography: 'traditional'
      },
      contentChanges: {
        language: 'formal-id',
        wisdomSources: ['Bhagavad Gita', 'Upanishad', 'Kearifan Bali'],
        greeting: 'Om Swastyastu, semoga selalu dalam keharmonisan',
        motivationalMessages: [
          'Tri Hita Karana - harmoni dengan diri, sesama, dan alam',
          'Yoga adalah penyatuan jiwa individual dengan jiwa universal',
          'Dharma adalah jalan kebenaran dan kebajikan'
        ]
      },
      behaviorAdaptation: {
        sessionRecommendations: {
          preferredDuration: 12,
          suggestedTimes: ['05:00', '17:00', '20:00'], // Hindu prayer times
          techniques: ['pranayama-breathing', 'mantra-meditation', 'yoga-nidra']
        }
      }
    },
    description: 'Balinese Hindu users get dharma-based content and yoga integration'
  },

  // TIME-BASED ADAPTATIONS
  {
    id: 'morning-energy-adaptation',
    priority: 6,
    condition: (ctx) => ctx.timeOfDay === 'morning' && ctx.currentMood !== 'sad',
    adaptation: {
      uiChanges: {
        colorScheme: 'warm',
        animations: 'full'
      },
      contentChanges: {
        greeting: ctx => {
          const culturalGreeting = ctx.culturalData.spiritualTradition === 'islam' ? 'Assalamu\'alaikum' :
                                   ctx.culturalData.region === 'bali' ? 'Rahajeng semeng' :
                                   ctx.culturalData.region?.includes('jawa') ? 'Sugeng enjing' : 'Selamat pagi';
          return `${culturalGreeting}! Semangat memulai hari dengan hati yang tenang`;
        },
        meditationStyles: ['energizing-breath', 'morning-gratitude', 'intention-setting']
      },
      behaviorAdaptation: {
        sessionRecommendations: {
          preferredDuration: 8,
          techniques: ['morning-energy', 'gratitude-practice', 'goal-visualization']
        }
      }
    },
    description: 'Morning sessions focus on energy and intention setting'
  },

  // EVENING WIND-DOWN ADAPTATION
  {
    id: 'evening-relaxation-adaptation',
    priority: 6,
    condition: (ctx) => ctx.timeOfDay === 'evening' || ctx.timeOfDay === 'night',
    adaptation: {
      uiChanges: {
        colorScheme: 'cool',
        animations: 'reduced'
      },
      contentChanges: {
        greeting: 'Saatnya melepaskan beban hari ini dan mempersiapkan istirahat yang berkualitas',
        meditationStyles: ['body-scan-relaxation', 'gratitude-reflection', 'sleep-preparation']
      },
      behaviorAdaptation: {
        sessionRecommendations: {
          preferredDuration: 12,
          techniques: ['progressive-relaxation', 'bedtime-meditation', 'reflection']
        }
      }
    },
    description: 'Evening sessions focus on relaxation and reflection'
  },

  // MOOD-BASED ADAPTATIONS
  {
    id: 'stress-relief-adaptation',
    priority: 7,
    condition: (ctx) => ctx.currentMood === 'anxious' || ctx.currentMood === 'sad',
    adaptation: {
      uiChanges: {
        colorScheme: 'cool',
        animations: 'reduced',
        layoutDensity: 'comfortable'
      },
      contentChanges: {
        greeting: 'Tidak apa-apa merasa berat. Mari kita temukan ketenangan bersama.',
        meditationStyles: ['anxiety-relief', 'emotional-healing', 'self-compassion'],
        motivationalMessages: [
          'Setiap napas adalah kesempatan untuk memulai lagi',
          'Kamu lebih kuat dari yang kamu kira',
          'Ini akan berlalu, seperti awan di langit'
        ]
      },
      behaviorAdaptation: {
        sessionRecommendations: {
          preferredDuration: 6, // Shorter for overwhelmed users
          techniques: ['gentle-breathing', 'body-awareness', 'grounding-techniques']
        },
        reminderSettings: {
          frequency: 'low',
          style: 'gentle'
        }
      }
    },
    description: 'Stressed users get gentle, supportive experience'
  },

  // FAMILY CONTEXT ADAPTATION
  {
    id: 'family-supportive-adaptation',
    priority: 5,
    condition: (ctx) => ctx.culturalData.familyContext === 'family-supportive',
    adaptation: {
      uiChanges: {
        layoutDensity: 'spacious'
      },
      contentChanges: {
        motivationalMessages: [
          'Meditasi bersama keluarga memperkuat ikatan',
          'Contoh ketenangan dimulai dari diri sendiri',
          'Berbagi kedamaian adalah berbagi kasih'
        ]
      },
      behaviorAdaptation: {
        socialFeatures: {
          communityVisibility: true,
          sharingPreferences: ['family-progress', 'group-sessions'],
          familyIntegration: true
        }
      }
    },
    description: 'Family-supportive users get community and sharing features'
  },

  // LIMITED PRIVACY ADAPTATION  
  {
    id: 'limited-privacy-adaptation',
    priority: 7,
    condition: (ctx) => ctx.culturalData.familyContext === 'limited-privacy',
    adaptation: {
      uiChanges: {
        animations: 'none',
        layoutDensity: 'compact'
      },
      contentChanges: {
        audioPreferences: {
          voiceGender: 'neutral',
          backgroundSounds: 'none',
          guidanceStyle: 'questioning' // Internal focus
        }
      },
      behaviorAdaptation: {
        sessionRecommendations: {
          preferredDuration: 3, // Very short sessions
          techniques: ['silent-breathing', 'micro-meditation', 'mindful-moments']
        },
        socialFeatures: {
          communityVisibility: false,
          sharingPreferences: [],
          familyIntegration: false
        }
      }
    },
    description: 'Limited privacy users get discrete, silent meditation options'
  }
];

interface RealTimeCulturalAdapterProps {
  culturalContext: CulturalAdaptationContext;
  onAdaptationChange: (adaptations: AdaptationRule[]) => void;
  showDebugInfo?: boolean;
}

export const RealTimeCulturalAdapter: React.FC<RealTimeCulturalAdapterProps> = ({
  culturalContext,
  onAdaptationChange,
  showDebugInfo = false
}) => {
  const [activeAdaptations, setActiveAdaptations] = useState<AdaptationRule[]>([]);
  const [adaptationHistory, setAdaptationHistory] = useState<Array<{timestamp: Date, adaptation: string, reason: string}>>([]);

  // Calculate active adaptations based on current context
  const calculatedAdaptations = useMemo(() => {
    const applicable = INDONESIAN_ADAPTATION_RULES
      .filter(rule => rule.condition(culturalContext))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5); // Max 5 active adaptations to prevent conflicts

    return applicable;
  }, [culturalContext]);

  // Update adaptations when context changes
  useEffect(() => {
    if (JSON.stringify(calculatedAdaptations) !== JSON.stringify(activeAdaptations)) {
      setActiveAdaptations(calculatedAdaptations);
      onAdaptationChange(calculatedAdaptations);

      // Log adaptation changes
      const newAdaptations = calculatedAdaptations.filter(
        newAdapt => !activeAdaptations.find(oldAdapt => oldAdapt.id === newAdapt.id)
      );
      
      newAdaptations.forEach(adaptation => {
        setAdaptationHistory(prev => [...prev, {
          timestamp: new Date(),
          adaptation: adaptation.id,
          reason: adaptation.description
        }].slice(-10)); // Keep last 10 changes
      });
    }
  }, [calculatedAdaptations, activeAdaptations, onAdaptationChange]);

  // Get combined adaptations
  const combinedAdaptation = useMemo(() => {
    const combined = {
      uiChanges: {} as UIAdaptation,
      contentChanges: {} as ContentAdaptation,
      behaviorChanges: {} as BehaviorAdaptation
    };

    // Merge adaptations by priority
    activeAdaptations.forEach(adaptation => {
      Object.assign(combined.uiChanges, adaptation.adaptation.uiChanges);
      Object.assign(combined.contentChanges, adaptation.adaptation.contentChanges);
      Object.assign(combined.behaviorChanges, adaptation.adaptation.behaviorChanges);
    });

    return combined;
  }, [activeAdaptations]);

  // Generate current greeting
  const currentGreeting = useMemo(() => {
    const greetingAdaptation = activeAdaptations.find(a => a.adaptation.contentChanges.greeting);
    if (greetingAdaptation && typeof greetingAdaptation.adaptation.contentChanges.greeting === 'function') {
      return greetingAdaptation.adaptation.contentChanges.greeting(culturalContext);
    }
    return greetingAdaptation?.adaptation.contentChanges.greeting || 'Selamat datang di Sembalun';
  }, [activeAdaptations, culturalContext]);

  if (!showDebugInfo && activeAdaptations.length === 0) {
    return null; // Don't render if no adaptations and not debugging
  }

  return (
    <div className="space-y-6">
      {/* Real-time Adapted Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Cultural Greeting */}
        <Card className="p-6 text-center">
          <motion.p
            key={currentGreeting}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-lg ${
              combinedAdaptation.uiChanges.typography === 'formal' ? 'font-medium' : 
              combinedAdaptation.uiChanges.typography === 'traditional' ? 'font-heading' : ''
            }`}
          >
            {currentGreeting}
          </motion.p>
        </Card>

        {/* Cultural Components */}
        <AnimatePresence>
          {culturalContext.culturalData.spiritualTradition === 'islam' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <PrayerTimeNotification />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Adapted Wisdom Quote */}
        <IndonesianWisdomQuote
          culturalFilter={true}
          size="medium"
          showTranslation={combinedAdaptation.contentChanges.language !== 'regional-dialect'}
          wisdomSources={combinedAdaptation.contentChanges.wisdomSources}
        />

        {/* Adaptive CTAs */}
        <div className="flex flex-wrap gap-3 justify-center">
          <IndonesianCTA
            variant={culturalContext.culturalData.spiritualTradition === 'islam' ? 'spiritual' : 'respectful'}
            style="primary"
            culturalContext={culturalContext.culturalData}
            localization={combinedAdaptation.contentChanges.language === 'formal-id' ? 'formal' : 'casual'}
          >
            {combinedAdaptation.behaviorChanges.sessionRecommendations?.preferredDuration === 3 ? 
              'Mulai 3 Menit' : 
              combinedAdaptation.behaviorChanges.sessionRecommendations?.preferredDuration === 5 ?
              'Mulai 5 Menit' : 'Mulai Sekarang'
            }
          </IndonesianCTA>
        </div>
      </motion.div>

      {/* Debug Information */}
      {showDebugInfo && (
        <Card className="p-6 bg-gray-50">
          <h3 className="font-bold text-lg mb-4">🔧 Debug: Real-time Adaptations</h3>
          
          {/* Active Adaptations */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Active Adaptations ({activeAdaptations.length}):</h4>
            <div className="space-y-2">
              {activeAdaptations.map((adaptation, index) => (
                <div key={adaptation.id} className="flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                    P{adaptation.priority}
                  </span>
                  <span className="flex-1">{adaptation.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Context Information */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Current Context:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p>Spiritual: {culturalContext.culturalData.spiritualTradition || 'None'}</p>
                <p>Region: {culturalContext.culturalData.region || 'Unknown'}</p>
                <p>Family: {culturalContext.culturalData.familyContext || 'Unknown'}</p>
              </div>
              <div>
                <p>Time: {culturalContext.timeOfDay}</p>
                <p>Mood: {culturalContext.currentMood || 'Unknown'}</p>
                <p>Sessions: {culturalContext.sessionHistory.completedSessions}</p>
              </div>
            </div>
          </div>

          {/* Adaptation History */}
          {adaptationHistory.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recent Adaptations:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {adaptationHistory.reverse().map((entry, index) => (
                  <div key={index} className="text-xs text-gray-500">
                    <span className="font-mono">{entry.timestamp.toLocaleTimeString()}</span>
                    <span className="ml-2">{entry.adaptation}: {entry.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default RealTimeCulturalAdapter;