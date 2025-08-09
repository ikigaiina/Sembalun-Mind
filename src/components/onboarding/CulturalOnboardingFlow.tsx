import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Mountain, Crown, Waves, TreePine, Compass, Sun,
  Heart, Brain, Sunrise, Wind, Star, Sparkles, Play, CheckCircle, ArrowRight,
  User, Calendar, Clock, Target, Award, BookOpen, Leaf, Flame, Moon
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

// Onboarding Step Types
type OnboardingStep = 
  | 'welcome' 
  | 'cultural-interests' 
  | 'experience-level' 
  | 'meditation-goals' 
  | 'schedule-preferences' 
  | 'regional-exploration' 
  | 'personalization-summary'
  | 'completion';

// Regional Information
const indonesianRegions = [
  {
    id: 'sembalun',
    name: 'Sembalun Valley',
    description: 'Meditasi dengan energi gunung dan lembah yang tenang',
    icon: Mountain,
    color: 'emerald',
    specialties: ['Mountain Meditation', 'Sunrise Energy', 'Valley Winds'],
    culturalElements: ['Sasak Traditions', 'Rinjani Sacred Mountain', 'Highland Peace'],
    difficulty: 'beginner',
    wisdom: 'Gunung mengajarkan kita kesabaran, lembah mengajarkan kerendahan hati'
  },
  {
    id: 'java',
    name: 'Java Heritage',
    description: 'Kebijaksanaan keraton dan filosofi Jawa kuno',
    icon: Crown,
    color: 'amber',
    specialties: ['Royal Court Meditation', 'Ancient Wisdom', 'Philosophical Reflection'],
    culturalElements: ['Keraton Traditions', 'Wayang Philosophy', 'Javanese Wisdom'],
    difficulty: 'intermediate',
    wisdom: 'Sapa sing sabar, bakal pikoleh - Siapa yang sabar akan mendapat'
  },
  {
    id: 'bali',
    name: 'Balinese Harmony',
    description: 'Harmoni spiritual dengan energi pura dan samudra',
    icon: Waves,
    color: 'blue',
    specialties: ['Temple Harmony', 'Ocean Meditation', 'Sacred Geometry'],
    culturalElements: ['Pura Sacred Spaces', 'Tri Hita Karana', 'Balinese Hinduism'],
    difficulty: 'intermediate',
    wisdom: 'Tri Hita Karana - harmoni dengan Tuhan, sesama, dan alam'
  },
  {
    id: 'sumatra',
    name: 'Sumatra Wilderness',
    description: 'Koneksi mendalam dengan hutan tropis dan danau',
    icon: TreePine,
    color: 'green',
    specialties: ['Forest Meditation', 'Lake Reflection', 'Highland Serenity'],
    culturalElements: ['Minangkabau Wisdom', 'Batak Traditions', 'Nature Spirituality'],
    difficulty: 'intermediate',
    wisdom: 'Pohon yang berisi selalu menunduk - kebijaksanaan membawa kerendahan hati'
  },
  {
    id: 'sulawesi',
    name: 'Sulawesi Spirituality',
    description: 'Kebijaksanaan leluhur dan tradisi Toraja',
    icon: Compass,
    color: 'purple',
    specialties: ['Ancestral Wisdom', 'Cultural Ceremonies', 'Spiritual Guidance'],
    culturalElements: ['Toraja Traditions', 'Tongkonan Sacred Houses', 'Ancestral Connection'],
    difficulty: 'advanced',
    wisdom: 'Sipakatau, sipakalebbi, sipakainge - saling memanusiakan dan menghargai'
  },
  {
    id: 'nusa-tenggara',
    name: 'Nusa Tenggara Light',
    description: 'Energi matahari terbit dari timur Indonesia',
    icon: Sun,
    color: 'orange',
    specialties: ['Eastern Sunrise', 'Island Serenity', 'New Beginnings'],
    culturalElements: ['Eastern Wisdom', 'Island Culture', 'Maritime Spirituality'],
    difficulty: 'beginner',
    wisdom: 'Matahari terbit mengajarkan bahwa setiap hari adalah kesempatan baru'
  }
];

// Experience Levels
const experienceLevels = [
  {
    id: 'beginner',
    title: 'Pemula',
    description: 'Baru memulai perjalanan meditasi',
    icon: Leaf,
    features: ['Guided sessions 5-15 menit', 'Instruksi langkah demi langkah', 'Dasar-dasar mindfulness'],
    color: 'green',
    recommendedDuration: [5, 10, 15]
  },
  {
    id: 'intermediate',
    title: 'Menengah',
    description: 'Sudah familiar dengan meditasi dasar',
    icon: Flame,
    features: ['Sesi 10-25 menit', 'Teknik pernapasan lanjutan', 'Eksplorasi budaya mendalam'],
    color: 'orange',
    recommendedDuration: [15, 20, 25]
  },
  {
    id: 'advanced',
    title: 'Lanjutan',
    description: 'Praktisi berpengalaman mencari kedalaman spiritual',
    icon: Star,
    features: ['Sesi 20-45 menit', 'Meditasi mandiri', 'Filosofi spiritual mendalam'],
    color: 'purple',
    recommendedDuration: [25, 30, 45]
  }
];

// Meditation Goals
const meditationGoals = [
  {
    id: 'stress-relief',
    title: 'Mengurangi Stres',
    description: 'Mencari ketenangan dan mengelola tekanan hidup',
    icon: Heart,
    color: 'red',
    practices: ['Breathing exercises', 'Relaxation techniques', 'Mindful awareness']
  },
  {
    id: 'spiritual-growth',
    title: 'Pertumbuhan Spiritual',
    description: 'Memperdalam koneksi dengan diri dan alam semesta',
    icon: Sparkles,
    color: 'purple',
    practices: ['Traditional wisdom', 'Cultural practices', 'Philosophical reflection']
  },
  {
    id: 'cultural-exploration',
    title: 'Eksplorasi Budaya',
    description: 'Belajar tentang tradisi meditasi Indonesia',
    icon: Mountain,
    color: 'emerald',
    practices: ['Regional practices', 'Cultural history', 'Traditional wisdom']
  },
  {
    id: 'focus-concentration',
    title: 'Fokus & Konsentrasi',
    description: 'Meningkatkan kemampuan fokus dan kejernihan pikiran',
    icon: Target,
    color: 'blue',
    practices: ['Concentration exercises', 'Mindfulness training', 'Attention development']
  },
  {
    id: 'emotional-balance',
    title: 'Keseimbangan Emosi',
    description: 'Mengembangkan stabilitas emosi dan kesejahteraan',
    icon: Waves,
    color: 'teal',
    practices: ['Emotion regulation', 'Mindful awareness', 'Inner balance']
  },
  {
    id: 'better-sleep',
    title: 'Tidur Lebih Baik',
    description: 'Meningkatkan kualitas tidur dan relaksasi',
    icon: Moon,
    color: 'indigo',
    practices: ['Evening meditation', 'Relaxation techniques', 'Sleep preparation']
  }
];

// Schedule Preferences
const scheduleOptions = [
  {
    id: 'morning',
    title: 'Pagi Hari',
    description: 'Memulai hari dengan ketenangan',
    icon: Sunrise,
    timeRange: '06:00 - 10:00',
    benefits: ['Energi positif', 'Fokus sepanjang hari', 'Kedamaian pagi']
  },
  {
    id: 'afternoon',
    title: 'Siang Hari',
    description: 'Reset energi di tengah aktivitas',
    icon: Sun,
    timeRange: '12:00 - 16:00',
    benefits: ['Refreshing break', 'Stress relief', 'Energy renewal']
  },
  {
    id: 'evening',
    title: 'Sore Hari',
    description: 'Transisi menuju ketenangan malam',
    icon: Wind,
    timeRange: '17:00 - 20:00',
    benefits: ['Unwinding', 'Reflection time', 'Peaceful transition']
  },
  {
    id: 'night',
    title: 'Malam Hari',
    description: 'Persiapan tidur yang nyenyak',
    icon: Moon,
    timeRange: '20:00 - 23:00',
    benefits: ['Better sleep', 'Deep relaxation', 'End-day reflection']
  }
];

// User Preferences Interface
interface UserPreferences {
  culturalInterests: string[];
  experienceLevel: string;
  meditationGoals: string[];
  schedulePreferences: string[];
  preferredRegions: string[];
  sessionDuration: number;
  reminderEnabled: boolean;
  communitySharing: boolean;
}

interface Props {
  onComplete: (preferences: UserPreferences) => void;
  onSkip?: () => void;
}

export const CulturalOnboardingFlow: React.FC<Props> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [preferences, setPreferences] = useState<UserPreferences>({
    culturalInterests: [],
    experienceLevel: '',
    meditationGoals: [],
    schedulePreferences: [],
    preferredRegions: [],
    sessionDuration: 15,
    reminderEnabled: true,
    communitySharing: false
  });

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(() => {
    const stepOrder: OnboardingStep[] = [
      'welcome',
      'cultural-interests',
      'experience-level',
      'meditation-goals',
      'schedule-preferences',
      'regional-exploration',
      'personalization-summary',
      'completion'
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    const stepOrder: OnboardingStep[] = [
      'welcome',
      'cultural-interests',
      'experience-level',
      'meditation-goals',
      'schedule-preferences',
      'regional-exploration',
      'personalization-summary',
      'completion'
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    onComplete(preferences);
  }, [preferences, onComplete]);

  // Welcome Step
  const renderWelcomeStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="relative">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
          <Mountain className="w-16 h-16 text-emerald-600" />
        </div>
        <div className="absolute -top-2 -right-2 transform translate-x-1/2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-yellow-700" />
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-800 mb-4">
          Selamat Datang di Sembalun
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Mari kita personalisasi perjalanan meditasi budaya Indonesia Anda. 
          Dalam beberapa langkah sederhana, kami akan menyesuaikan pengalaman 
          sesuai dengan minat dan kebutuhan spiritual Anda.
        </p>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="text-2xl">🏔️</div>
          <div className="text-2xl">🏛️</div>
          <div className="text-2xl">🌊</div>
          <div className="text-2xl">🌲</div>
        </div>
        <p className="text-sm text-gray-700">
          Jelajahi 6 wilayah budaya Indonesia dengan 25+ praktik meditasi tradisional
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
        >
          Mulai Personalisasi
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        {onSkip && (
          <Button
            variant="ghost"
            size="lg"
            onClick={onSkip}
            className="text-gray-600 hover:text-gray-800"
          >
            Lewati untuk Sekarang
          </Button>
        )}
      </div>
    </motion.div>
  );

  // Cultural Interests Step
  const renderCulturalInterestsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
          Minat Budaya Anda
        </h2>
        <p className="text-gray-600">
          Pilih aspek budaya Indonesia yang paling menarik bagi Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { id: 'traditional-wisdom', title: 'Kebijaksanaan Tradisional', icon: BookOpen, color: 'purple' },
          { id: 'spiritual-practices', title: 'Praktik Spiritual', icon: Sparkles, color: 'indigo' },
          { id: 'regional-culture', title: 'Budaya Regional', icon: Mountain, color: 'emerald' },
          { id: 'ancient-philosophy', title: 'Filosofi Kuno', icon: Crown, color: 'amber' },
          { id: 'nature-connection', title: 'Koneksi Alam', icon: TreePine, color: 'green' },
          { id: 'meditation-history', title: 'Sejarah Meditasi', icon: Award, color: 'blue' }
        ].map((interest) => {
          const Icon = interest.icon;
          const isSelected = preferences.culturalInterests.includes(interest.id);
          
          return (
            <motion.div
              key={interest.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? `border-${interest.color}-300 bg-${interest.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  const newInterests = isSelected
                    ? preferences.culturalInterests.filter(i => i !== interest.id)
                    : [...preferences.culturalInterests, interest.id];
                  updatePreferences({ culturalInterests: newInterests });
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    isSelected 
                      ? `bg-${interest.color}-100` 
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      isSelected 
                        ? `text-${interest.color}-600` 
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      isSelected ? `text-${interest.color}-900` : 'text-gray-800'
                    }`}>
                      {interest.title}
                    </h3>
                  </div>
                  {isSelected && (
                    <CheckCircle className={`w-5 h-5 text-${interest.color}-600`} />
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  // Experience Level Step
  const renderExperienceLevelStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
          Tingkat Pengalaman Meditasi
        </h2>
        <p className="text-gray-600">
          Pilih tingkat yang paling sesuai dengan pengalaman Anda
        </p>
      </div>

      <div className="space-y-4">
        {experienceLevels.map((level) => {
          const Icon = level.icon;
          const isSelected = preferences.experienceLevel === level.id;
          
          return (
            <motion.div
              key={level.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all ${
                  isSelected 
                    ? `border-${level.color}-300 bg-${level.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updatePreferences({ experienceLevel: level.id })}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected 
                      ? `bg-${level.color}-100` 
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      isSelected 
                        ? `text-${level.color}-600` 
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-semibold ${
                        isSelected ? `text-${level.color}-900` : 'text-gray-800'
                      }`}>
                        {level.title}
                      </h3>
                      {isSelected && (
                        <CheckCircle className={`w-5 h-5 text-${level.color}-600`} />
                      )}
                    </div>
                    <p className={`text-sm mb-3 ${
                      isSelected ? `text-${level.color}-700` : 'text-gray-600'
                    }`}>
                      {level.description}
                    </p>
                    <div className="space-y-1">
                      {level.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? `bg-${level.color}-500` : 'bg-gray-400'
                          }`} />
                          <span className={`text-xs ${
                            isSelected ? `text-${level.color}-700` : 'text-gray-600'
                          }`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  // Meditation Goals Step
  const renderMeditationGoalsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
          Tujuan Meditasi Anda
        </h2>
        <p className="text-gray-600">
          Pilih satu atau lebih tujuan yang ingin Anda capai
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meditationGoals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = preferences.meditationGoals.includes(goal.id);
          
          return (
            <motion.div
              key={goal.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-5 cursor-pointer transition-all ${
                  isSelected 
                    ? `border-${goal.color}-300 bg-${goal.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  const newGoals = isSelected
                    ? preferences.meditationGoals.filter(g => g !== goal.id)
                    : [...preferences.meditationGoals, goal.id];
                  updatePreferences({ meditationGoals: newGoals });
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected 
                      ? `bg-${goal.color}-100` 
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      isSelected 
                        ? `text-${goal.color}-600` 
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${
                        isSelected ? `text-${goal.color}-900` : 'text-gray-800'
                      }`}>
                        {goal.title}
                      </h3>
                      {isSelected && (
                        <CheckCircle className={`w-5 h-5 text-${goal.color}-600`} />
                      )}
                    </div>
                    <p className={`text-sm ${
                      isSelected ? `text-${goal.color}-700` : 'text-gray-600'
                    }`}>
                      {goal.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  // Regional Exploration Step
  const renderRegionalExplorationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
          Jelajahi Budaya Nusantara
        </h2>
        <p className="text-gray-600">
          Pilih wilayah budaya Indonesia yang ingin Anda eksplorasi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {indonesianRegions.map((region) => {
          const Icon = region.icon;
          const isSelected = preferences.preferredRegions.includes(region.id);
          
          return (
            <motion.div
              key={region.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all ${
                  isSelected 
                    ? `border-${region.color}-300 bg-${region.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  const newRegions = isSelected
                    ? preferences.preferredRegions.filter(r => r !== region.id)
                    : [...preferences.preferredRegions, region.id];
                  updatePreferences({ preferredRegions: newRegions });
                }}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${
                    isSelected 
                      ? `bg-${region.color}-100` 
                      : 'bg-gray-100'
                  } flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 ${
                      isSelected 
                        ? `text-${region.color}-600` 
                        : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${
                      isSelected ? `text-${region.color}-900` : 'text-gray-800'
                    }`}>
                      {region.name}
                    </h3>
                    {isSelected && (
                      <CheckCircle className={`w-5 h-5 text-${region.color}-600`} />
                    )}
                  </div>
                  
                  <p className={`text-sm mb-3 ${
                    isSelected ? `text-${region.color}-700` : 'text-gray-600'
                  }`}>
                    {region.description}
                  </p>
                  
                  <div className={`text-xs px-2 py-1 rounded-full mb-3 ${
                    isSelected 
                      ? `bg-${region.color}-100 text-${region.color}-700` 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {region.difficulty.charAt(0).toUpperCase() + region.difficulty.slice(1)}
                  </div>

                  <div className="space-y-1">
                    {region.specialties.slice(0, 2).map((specialty, index) => (
                      <div key={index} className="flex items-center justify-center space-x-1">
                        <Star className={`w-3 h-3 ${
                          isSelected ? `text-${region.color}-500` : 'text-gray-400'
                        }`} />
                        <span className={`text-xs ${
                          isSelected ? `text-${region.color}-700` : 'text-gray-600'
                        }`}>
                          {specialty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  // Personalization Summary Step
  const renderPersonalizationSummary = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
          Ringkasan Personalisasi
        </h2>
        <p className="text-gray-600">
          Lihat pengaturan yang telah Anda pilih
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experience Level */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Tingkat Pengalaman
          </h3>
          {preferences.experienceLevel && (
            <div className="flex items-center space-x-3">
              {React.createElement(
                experienceLevels.find(l => l.id === preferences.experienceLevel)?.icon || Leaf,
                { className: "w-6 h-6 text-green-600" }
              )}
              <span className="font-medium">
                {experienceLevels.find(l => l.id === preferences.experienceLevel)?.title}
              </span>
            </div>
          )}
        </Card>

        {/* Meditation Goals */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600" />
            Tujuan Meditasi
          </h3>
          <div className="space-y-2">
            {preferences.meditationGoals.map(goalId => {
              const goal = meditationGoals.find(g => g.id === goalId);
              return goal ? (
                <div key={goalId} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full bg-${goal.color}-500`} />
                  <span className="text-sm">{goal.title}</span>
                </div>
              ) : null;
            })}
          </div>
        </Card>

        {/* Cultural Interests */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-emerald-600" />
            Minat Budaya
          </h3>
          <div className="text-sm text-gray-600">
            {preferences.culturalInterests.length} area minat dipilih
          </div>
        </Card>

        {/* Preferred Regions */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Mountain className="w-5 h-5 mr-2 text-amber-600" />
            Wilayah Pilihan
          </h3>
          <div className="space-y-2">
            {preferences.preferredRegions.slice(0, 3).map(regionId => {
              const region = indonesianRegions.find(r => r.id === regionId);
              return region ? (
                <div key={regionId} className="flex items-center space-x-2">
                  {React.createElement(region.icon, { className: `w-4 h-4 text-${region.color}-600` })}
                  <span className="text-sm">{region.name}</span>
                </div>
              ) : null;
            })}
            {preferences.preferredRegions.length > 3 && (
              <div className="text-xs text-gray-500">
                +{preferences.preferredRegions.length - 3} wilayah lainnya
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-2">
          🎉 Personalisasi Selesai!
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Berdasarkan pilihan Anda, kami telah menyiapkan pengalaman meditasi budaya 
          yang disesuaikan dengan minat dan kebutuhan spiritual Anda.
        </p>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Rekomendasi Personal</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Praktik Sesuai Level</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Konten Budaya</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Completion Step
  const renderCompletionStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="relative">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <div className="absolute -top-2 -right-2 transform translate-x-1/2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-4 h-4 text-yellow-700" />
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-800 mb-4">
          Selamat! Perjalanan Anda Dimulai
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Sembalun telah dipersonalisasi sesuai dengan preferensi spiritual dan 
          budaya Anda. Mulai jelajahi kekayaan tradisi meditasi Indonesia.
        </p>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 max-w-lg mx-auto">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {preferences.preferredRegions.length}
            </div>
            <div className="text-xs text-gray-600">Wilayah Dipilih</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {preferences.meditationGoals.length}
            </div>
            <div className="text-xs text-gray-600">Tujuan Aktif</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">25+</div>
            <div className="text-xs text-gray-600">Praktik Tersedia</div>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          Rekomendasi khusus sudah disiapkan untuk Anda!
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={handleComplete}
        className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
      >
        <Play className="w-5 h-5 mr-2" />
        Mulai Meditasi
      </Button>
    </motion.div>
  );

  // Navigation Controls
  const renderNavigationControls = () => {
    if (currentStep === 'welcome' || currentStep === 'completion') {
      return null;
    }

    const canProceed = () => {
      switch (currentStep) {
        case 'cultural-interests':
          return preferences.culturalInterests.length > 0;
        case 'experience-level':
          return preferences.experienceLevel !== '';
        case 'meditation-goals':
          return preferences.meditationGoals.length > 0;
        case 'regional-exploration':
          return preferences.preferredRegions.length > 0;
        default:
          return true;
      }
    };

    return (
      <div className="flex justify-between pt-6">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex items-center"
        >
          {currentStep === 'personalization-summary' ? 'Selesai' : 'Lanjut'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <AnimatePresence mode="wait">
            {currentStep === 'welcome' && renderWelcomeStep()}
            {currentStep === 'cultural-interests' && renderCulturalInterestsStep()}
            {currentStep === 'experience-level' && renderExperienceLevelStep()}
            {currentStep === 'meditation-goals' && renderMeditationGoalsStep()}
            {currentStep === 'regional-exploration' && renderRegionalExplorationStep()}
            {currentStep === 'personalization-summary' && renderPersonalizationSummary()}
            {currentStep === 'completion' && renderCompletionStep()}
          </AnimatePresence>

          {renderNavigationControls()}
        </Card>
      </div>
    </div>
  );
};