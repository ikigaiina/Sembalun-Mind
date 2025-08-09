import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CairnIcon } from '../ui';
import IndonesianCTA from '../ui/IndonesianCTA';
import { scrollToTop } from '../../hooks/useScrollToTop';
import type { MoodType } from '../../types/mood';

interface MoodOption {
  mood: MoodType;
  emoji: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface MoodInsights {
  improvement: number;
  category: 'significant' | 'moderate' | 'slight' | 'maintained';
  message: string;
  recommendations: string[];
  culturalWisdom: string;
}

interface InstantMoodTrackingProps {
  onComplete: (before: MoodType, after: MoodType, insights: MoodInsights) => void;
  onSkip?: () => void;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    mood: 'very-sad',
    emoji: '😢',
    label: 'Sangat Sedih',
    description: 'Merasa sangat down dan butuh dukungan',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200 hover:border-blue-400'
  },
  {
    mood: 'sad',
    emoji: '😔',
    label: 'Sedih',
    description: 'Merasa sedikit sedih atau melankolis',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200 hover:border-indigo-400'
  },
  {
    mood: 'neutral',
    emoji: '😐',
    label: 'Biasa Saja',
    description: 'Perasaan netral, tidak terlalu baik atau buruk',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200 hover:border-gray-400'
  },
  {
    mood: 'happy',
    emoji: '😊',
    label: 'Senang',
    description: 'Merasa baik dan positif',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200 hover:border-green-400'
  },
  {
    mood: 'very-happy',
    emoji: '😄',
    label: 'Sangat Senang',
    description: 'Merasa luar biasa baik dan bersemangat',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200 hover:border-yellow-400'
  }
];

// Extended mood options including anxiety, calmness, etc.
const EXTENDED_MOOD_OPTIONS: MoodOption[] = [
  ...MOOD_OPTIONS,
  {
    mood: 'anxious' as MoodType,
    emoji: '😰',
    label: 'Cemas',
    description: 'Merasa khawatir atau gelisah',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200 hover:border-orange-400'
  },
  {
    mood: 'calm' as MoodType,
    emoji: '😌',
    label: 'Tenang',
    description: 'Merasa damai dan rileks',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200 hover:border-teal-400'
  },
  {
    mood: 'energetic' as MoodType,
    emoji: '⚡',
    label: 'Berenergi',
    description: 'Merasa bersemangat dan penuh tenaga',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-400'
  },
  {
    mood: 'angry' as MoodType,
    emoji: '😠',
    label: 'Marah',
    description: 'Merasa kesal atau frustrasi',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200 hover:border-red-400'
  }
];

const CULTURAL_WISDOM = {
  'very-sad': "\"Setelah kesulitan, pasti ada kemudahan.\" - Al-Qur'an. Kesedihan ini akan berlalu, seperti malam yang berganti siang.",
  'sad': "\"Air yang jernih berasal dari mata air yang dalam.\" Kesedihan mengajarkan kita untuk menghargai kebahagiaan.",
  'neutral': "\"Ketenangan adalah kekuatan terbesar.\" Dalam keseimbangan, kita menemukan kedamaian sejati.",
  'happy': "\"Kebahagiaan yang dibagi akan berlipat ganda.\" Bagikan kebahagiaan Anda dengan orang lain.",
  'very-happy': "\"Bersyukurlah, maka nikmat-Ku akan Aku tambahkan.\" Syukur adalah kunci kebahagiaan berkelanjutan.",
  'anxious': "\"Dan barangsiapa bertawakal kepada Allah, niscaya Allah akan mencukupkan (keperluan)nya.\" Serahkan kekhawatiran pada Yang Mahakuasa.",
  'calm': "\"Dalam ketenangan hati, kita menemukan kebijaksanaan sejati.\" Pertahankan kedamaian ini.",
  'energetic': "\"Semangat yang terarah adalah kekuatan yang luar biasa.\" Gunakan energi ini untuk kebaikan.",
  'angry': "\"Kemarahan adalah bara api yang membakar pemiliknya.\" Mari ubah amarah menjadi kekuatan untuk berubah."
};

export const InstantMoodTracking: React.FC<InstantMoodTrackingProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState<'before' | 'after' | 'insights'>('before');
  const [moodBefore, setMoodBefore] = useState<MoodType | null>(null);
  const [moodAfter, setMoodAfter] = useState<MoodType | null>(null);
  const [insights, setInsights] = useState<MoodInsights | null>(null);
  const [showingAnimation, setShowingAnimation] = useState(false);

  // Calculate insights when both moods are selected
  useEffect(() => {
    if (moodBefore && moodAfter && currentStep === 'insights') {
      calculateInsights(moodBefore, moodAfter);
    }
  }, [moodBefore, moodAfter, currentStep]);

  const calculateInsights = (before: MoodType, after: MoodType) => {
    const moodValues = {
      'very-sad': 1,
      'sad': 2,
      'neutral': 3,
      'happy': 4,
      'very-happy': 5,
      'anxious': 1.5,
      'calm': 4.5,
      'energetic': 4.2,
      'angry': 1.8
    };

    const beforeValue = moodValues[before] || 3;
    const afterValue = moodValues[after] || 3;
    const improvement = ((afterValue - beforeValue) / beforeValue) * 100;

    let category: MoodInsights['category'];
    let message: string;
    
    if (improvement >= 50) {
      category = 'significant';
      message = '🌟 Luar biasa! Anda mengalami peningkatan mood yang signifikan. Meditasi benar-benar memberikan dampak positif untuk Anda.';
    } else if (improvement >= 20) {
      category = 'moderate';
      message = '✨ Bagus sekali! Ada peningkatan mood yang terasa. Terus praktikkan meditasi untuk hasil yang lebih maksimal.';
    } else if (improvement >= 5) {
      category = 'slight';
      message = '🌱 Ada sedikit perubahan positif. Dengan konsistensi, perubahan ini akan semakin terasa.';
    } else {
      category = 'maintained';
      message = improvement < -10 
        ? '🤗 Tidak apa-apa, setiap perjalanan berbeda. Yang penting Anda sudah mencoba. Cobalah teknik yang berbeda next time.'
        : '😌 Anda berhasil mempertahankan mood yang baik. Meditasi membantu menjaga keseimbangan emosi Anda.';
    }

    const recommendations = getRecommendations(before, after, category);
    const culturalWisdom = CULTURAL_WISDOM[after] || CULTURAL_WISDOM[before] || CULTURAL_WISDOM['neutral'];

    setInsights({
      improvement: Math.round(improvement),
      category,
      message,
      recommendations,
      culturalWisdom
    });
  };

  const getRecommendations = (before: MoodType, after: MoodType, category: MoodInsights['category']): string[] => {
    const base = [
      'Lakukan meditasi secara rutin, idealnya di waktu yang sama setiap hari',
      'Catat mood Anda sebelum dan sesudah meditasi untuk melihat pola',
      'Variasikan teknik meditasi sesuai dengan mood dan kebutuhan Anda'
    ];

    if (category === 'significant') {
      return [
        'Teknik yang Anda gunakan sangat cocok! Jadikan ini sebagai rutinitas harian',
        'Bagikan pengalaman positif ini dengan teman atau keluarga',
        ...base
      ];
    } else if (category === 'moderate') {
      return [
        'Coba perpanjang durasi meditasi secara bertahap',
        'Eksplorasi teknik meditasi lain yang mungkin lebih cocok',
        ...base
      ];
    } else if (before === 'anxious' || before === 'angry') {
      return [
        'Untuk emosi yang intens, coba teknik pernapasan 4-7-8',
        'Meditasi walking bisa membantu melepaskan energi negatif',
        'Jangan ragu untuk mencari dukungan profesional jika diperlukan',
        ...base
      ];
    } else {
      return [
        'Setiap sesi adalah pembelajaran. Tetap sabar dengan prosesnya',
        'Coba meditasi di lingkungan yang berbeda (alam, ruangan tenang)',
        ...base
      ];
    }
  };

  const handleMoodSelect = (mood: MoodType) => {
    if (currentStep === 'before') {
      setMoodBefore(mood);
      setShowingAnimation(true);
      
      // Show transition animation
      setTimeout(() => {
        setShowingAnimation(false);
        setCurrentStep('after');
      }, 2000);
    } else if (currentStep === 'after') {
      setMoodAfter(mood);
      setCurrentStep('insights');
    }
  };

  const handleComplete = () => {
    if (moodBefore && moodAfter && insights) {
      // Scroll to top before completing
      scrollToTop(true);
      
      onComplete(moodBefore, moodAfter, insights);
    }
  };

  // Animation transition screen
  if (showingAnimation) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "linear" }}
                className="w-16 h-16 mx-auto"
              >
                <CairnIcon size={64} className="text-primary-600" />
              </motion.div>
              
              {/* Sparkle effects */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0',
                  }}
                  animate={{
                    x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
                    y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                />
              ))}
            </div>
          </motion.div>

          <motion.h3 
            className="text-xl font-semibold text-gray-800 mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🧘‍♀️ Silakan lakukan meditasi singkat...
          </motion.h3>
          
          <p className="text-gray-600 mb-6">
            Luangkan waktu sejenak untuk merasakan pernapasan Anda. Amati sensasi tubuh dan pikiran tanpa menghakimi.
          </p>

          <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 italic">
              "Dalam keheningan, kita mendengar suara kebijaksanaan yang sejati."
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Insights display
  if (currentStep === 'insights' && insights) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-2xl">💫</span>
            </motion.div>
            
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
              Insight Mood Anda
            </h2>
            <p className="text-gray-600">
              Berikut adalah perubahan mood yang Anda alami
            </p>
          </div>

          {/* Mood comparison */}
          <div className="mb-8">
            <div className="flex items-center justify-between bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {EXTENDED_MOOD_OPTIONS.find(opt => opt.mood === moodBefore)?.emoji}
                </div>
                <div className="text-sm text-gray-600">Sebelum</div>
                <div className="font-medium">
                  {EXTENDED_MOOD_OPTIONS.find(opt => opt.mood === moodBefore)?.label}
                </div>
              </div>
              
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="px-4"
              >
                <span className="text-2xl">→</span>
              </motion.div>
              
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {EXTENDED_MOOD_OPTIONS.find(opt => opt.mood === moodAfter)?.emoji}
                </div>
                <div className="text-sm text-gray-600">Sesudah</div>
                <div className="font-medium">
                  {EXTENDED_MOOD_OPTIONS.find(opt => opt.mood === moodAfter)?.label}
                </div>
              </div>
            </div>
            
            {/* Improvement indicator */}
            <div className="text-center mt-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                insights.improvement >= 20 ? 'bg-green-100 text-green-700' :
                insights.improvement >= 5 ? 'bg-yellow-100 text-yellow-700' :
                insights.improvement >= -5 ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {insights.improvement > 0 && '↗️'} 
                {insights.improvement < 0 && '↘️'} 
                {insights.improvement === 0 && '➡️'} 
                <span className="ml-1">
                  {insights.improvement > 0 ? '+' : ''}{insights.improvement}% perubahan
                </span>
              </div>
            </div>
          </div>

          {/* Main message */}
          <div className="mb-6 text-center">
            <p className="text-gray-700 leading-relaxed">
              {insights.message}
            </p>
          </div>

          {/* Cultural wisdom */}
          <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
              🌸 Kearifan Lokal
            </h4>
            <p className="text-purple-700 text-sm italic leading-relaxed">
              {insights.culturalWisdom}
            </p>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-800 mb-4">💡 Rekomendasi untuk Anda:</h4>
            <div className="space-y-2">
              {insights.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-primary-600 font-semibold text-sm">
                    {index + 1}.
                  </span>
                  <span className="text-gray-700 text-sm">
                    {recommendation}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Complete button */}
          <div className="text-center">
            <IndonesianCTA
              onClick={handleComplete}
              size="large"
              variant="spiritual"
            >
              ✨ Lanjutkan Perjalanan
            </IndonesianCTA>
          </div>
        </Card>
      </div>
    );
  }

  // Mood selection screen
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
            💫 Pelacakan Mood Real-Time
          </h2>
          <p className="text-gray-600">
            {currentStep === 'before' 
              ? 'Bagaimana perasaan Anda saat ini, sebelum meditasi?'
              : 'Dan sekarang, bagaimana perasaan Anda setelah meditasi singkat tadi?'
            }
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${
              currentStep === 'before' ? 'bg-primary-600' : 'bg-green-500'
            }`} />
            <div className="w-8 h-0.5 bg-gray-300" />
            <div className={`w-3 h-3 rounded-full ${
              currentStep === 'after' ? 'bg-primary-600' : 'bg-gray-300'
            }`} />
            <div className="w-8 h-0.5 bg-gray-300" />
            <div className={`w-3 h-3 rounded-full ${
              currentStep === 'insights' ? 'bg-primary-600' : 'bg-gray-300'
            }`} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span>Sebelum</span>
            <span>Sesudah</span>
            <span>Insight</span>
          </div>
        </div>

        {/* Mood options */}
        <div className="space-y-3 mb-8">
          {EXTENDED_MOOD_OPTIONS.map((option) => (
            <motion.button
              key={option.mood}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleMoodSelect(option.mood)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${option.borderColor} ${option.bgColor}`}
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1">
                  <h3 className={`font-semibold ${option.color}`}>
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {option.description}
                  </p>
                </div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="text-gray-400"
                >
                  →
                </motion.div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Skip option */}
        <div className="text-center">
          <button 
            onClick={onSkip}
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Lewati pelacakan mood →
          </button>
        </div>
      </Card>
    </div>
  );
};

export default InstantMoodTracking;