import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Brain, Wind, Sun, Moon, Zap, Target, Sparkles,
  Mountain, Waves, Leaf, Clock, Star, ArrowRight
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { MoodType } from '../../types/mood';
import { useMoodTracker } from '../../hooks/useMoodTracker';

interface MeditationRecommendation {
  id: string;
  title: string;
  titleIndonesian: string;
  description: string;
  descriptionIndonesian: string;
  duration: number;
  type: 'guided' | 'breathing' | 'mindfulness' | 'sleep' | 'focus' | 'loving-kindness';
  culturalElement?: string;
  benefits: string[];
  benefitsIndonesian: string[];
  moodMatch: MoodType[];
  intensity: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
  gradient: string;
  onSelect: () => void;
}

interface Props {
  className?: string;
  currentMood?: MoodType;
  onRecommendationSelect?: (recommendation: MeditationRecommendation) => void;
}

export const MoodBasedRecommendations: React.FC<Props> = ({
  className = '',
  currentMood,
  onRecommendationSelect
}) => {
  const { getMoodHistory, getRecentMoods } = useMoodTracker();
  
  // Get user's mood patterns
  const moodHistory = getMoodHistory();
  const recentMoods = getRecentMoods(7); // Last 7 days
  
  // Define meditation recommendations
  const allRecommendations: MeditationRecommendation[] = [
    {
      id: 'calm-ocean-breathing',
      title: 'Calm Ocean Breathing',
      titleIndonesian: 'Pernapasan Samudera Tenang',
      description: 'Soothing breathing exercise inspired by gentle ocean waves',
      descriptionIndonesian: 'Latihan pernapasan menenangkan yang terinspirasi ombak laut yang tenang',
      duration: 5,
      type: 'breathing',
      culturalElement: 'Balinese Ocean Ritual',
      benefits: ['Reduces anxiety', 'Promotes relaxation', 'Lowers heart rate'],
      benefitsIndonesian: ['Mengurangi kecemasan', 'Meningkatkan relaksasi', 'Menurunkan detak jantung'],
      moodMatch: ['anxious', 'stressed', 'overwhelmed'],
      intensity: 'low',
      icon: <Waves className="w-6 h-6" />,
      gradient: 'from-blue-400 to-cyan-500',
      onSelect: () => {}
    },
    {
      id: 'energy-mountain-meditation',
      title: 'Energy Mountain Meditation',
      titleIndonesian: 'Meditasi Gunung Energi',
      description: 'Energizing meditation to boost mood and vitality',
      descriptionIndonesian: 'Meditasi pembangkit energi untuk meningkatkan mood dan vitalitas',
      duration: 8,
      type: 'guided',
      culturalElement: 'Rinjani Peak Wisdom',
      benefits: ['Increases energy', 'Improves mood', 'Builds confidence'],
      benefitsIndonesian: ['Meningkatkan energi', 'Memperbaiki mood', 'Membangun kepercayaan diri'],
      moodMatch: ['sad', 'tired', 'unmotivated'],
      intensity: 'medium',
      icon: <Mountain className="w-6 h-6" />,
      gradient: 'from-green-400 to-emerald-500',
      onSelect: () => {}
    },
    {
      id: 'gratitude-heart-meditation',
      title: 'Gratitude Heart Meditation',
      titleIndonesian: 'Meditasi Hati Bersyukur',
      description: 'Heart-opening practice to cultivate gratitude and joy',
      descriptionIndonesian: 'Praktik membuka hati untuk menumbuhkan rasa syukur dan kegembiraan',
      duration: 10,
      type: 'loving-kindness',
      culturalElement: 'Javanese Gratitude Practice',
      benefits: ['Increases happiness', 'Cultivates gratitude', 'Opens the heart'],
      benefitsIndonesian: ['Meningkatkan kebahagiaan', 'Menumbuhkan rasa syukur', 'Membuka hati'],
      moodMatch: ['happy', 'grateful', 'content'],
      intensity: 'low',
      icon: <Heart className="w-6 h-6" />,
      gradient: 'from-pink-400 to-rose-500',
      onSelect: () => {}
    },
    {
      id: 'focus-clarity-session',
      title: 'Focus & Clarity Session',
      titleIndonesian: 'Sesi Fokus & Kejernihan',
      description: 'Concentration practice to enhance mental clarity',
      descriptionIndonesian: 'Praktik konsentrasi untuk meningkatkan kejernihan mental',
      duration: 12,
      type: 'focus',
      culturalElement: 'Sundanese Concentration Technique',
      benefits: ['Improves focus', 'Enhances clarity', 'Reduces mental fog'],
      benefitsIndonesian: ['Meningkatkan fokus', 'Meningkatkan kejernihan', 'Mengurangi kabut mental'],
      moodMatch: ['confused', 'distracted', 'overwhelmed'],
      intensity: 'high',
      icon: <Target className="w-6 h-6" />,
      gradient: 'from-purple-400 to-indigo-500',
      onSelect: () => {}
    },
    {
      id: 'peaceful-sleep-preparation',
      title: 'Peaceful Sleep Preparation',
      titleIndonesian: 'Persiapan Tidur Damai',
      description: 'Gentle meditation to prepare for restful sleep',
      descriptionIndonesian: 'Meditasi lembut untuk mempersiapkan tidur yang nyenyak',
      duration: 15,
      type: 'sleep',
      culturalElement: 'Traditional Lullaby Wisdom',
      benefits: ['Improves sleep quality', 'Reduces racing thoughts', 'Promotes deep rest'],
      benefitsIndonesian: ['Meningkatkan kualitas tidur', 'Mengurangi pikiran berputar', 'Mendorong istirahat mendalam'],
      moodMatch: ['anxious', 'restless', 'tired'],
      intensity: 'low',
      icon: <Moon className="w-6 h-6" />,
      gradient: 'from-indigo-400 to-purple-500',
      onSelect: () => {}
    },
    {
      id: 'confidence-building-meditation',
      title: 'Confidence Building Meditation',
      titleIndonesian: 'Meditasi Membangun Kepercayaan Diri',
      description: 'Empowering practice to boost self-confidence',
      descriptionIndonesian: 'Praktik pemberdayaan untuk meningkatkan kepercayaan diri',
      duration: 7,
      type: 'guided',
      culturalElement: 'Warrior Spirit Tradition',
      benefits: ['Builds confidence', 'Reduces self-doubt', 'Strengthens inner voice'],
      benefitsIndonesian: ['Membangun kepercayaan diri', 'Mengurangi keraguan diri', 'Memperkuat suara batin'],
      moodMatch: ['insecure', 'doubtful', 'unmotivated'],
      intensity: 'medium',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-yellow-400 to-orange-500',
      onSelect: () => {}
    },
    {
      id: 'mindful-awareness-practice',
      title: 'Mindful Awareness Practice',
      titleIndonesian: 'Praktik Kesadaran Penuh',
      description: 'Present-moment awareness meditation for balance',
      descriptionIndonesian: 'Meditasi kesadaran saat ini untuk keseimbangan',
      duration: 6,
      type: 'mindfulness',
      culturalElement: 'Ancient Mindfulness Teaching',
      benefits: ['Increases awareness', 'Promotes balance', 'Reduces reactivity'],
      benefitsIndonesian: ['Meningkatkan kesadaran', 'Mendorong keseimbangan', 'Mengurangi reaktivitas'],
      moodMatch: ['neutral', 'calm', 'balanced'],
      intensity: 'medium',
      icon: <Brain className="w-6 h-6" />,
      gradient: 'from-teal-400 to-blue-500',
      onSelect: () => {}
    }
  ];

  // Smart recommendation algorithm
  const getPersonalizedRecommendations = useMemo(() => {
    let recommendations = [...allRecommendations];

    // Filter by current mood if provided
    if (currentMood) {
      recommendations = recommendations.filter(rec => 
        rec.moodMatch.includes(currentMood)
      );
    }

    // Analyze mood patterns from history
    const moodPatterns = recentMoods.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<MoodType, number>);

    // If no direct mood match, use pattern analysis
    if (recommendations.length === 0 && Object.keys(moodPatterns).length > 0) {
      const dominantMood = Object.entries(moodPatterns)
        .sort(([,a], [,b]) => b - a)[0][0] as MoodType;
      
      recommendations = allRecommendations.filter(rec => 
        rec.moodMatch.includes(dominantMood)
      );
    }

    // If still no matches, provide balanced recommendations
    if (recommendations.length === 0) {
      recommendations = allRecommendations.slice(0, 3);
    }

    // Sort by intensity and user preference patterns
    return recommendations
      .sort((a, b) => {
        // Prefer lower intensity for anxious/stressed moods
        if (currentMood && ['anxious', 'stressed', 'overwhelmed'].includes(currentMood)) {
          if (a.intensity !== b.intensity) {
            return a.intensity === 'low' ? -1 : 1;
          }
        }
        
        // Prefer higher intensity for low-energy moods
        if (currentMood && ['sad', 'tired', 'unmotivated'].includes(currentMood)) {
          if (a.intensity !== b.intensity) {
            return a.intensity === 'high' ? -1 : 1;
          }
        }
        
        return 0;
      })
      .slice(0, 4); // Limit to top 4 recommendations
  }, [currentMood, recentMoods, allRecommendations]);

  const handleRecommendationSelect = (recommendation: MeditationRecommendation) => {
    onRecommendationSelect?.(recommendation);
  };

  const getMoodAnalysis = () => {
    if (recentMoods.length === 0) {
      return {
        message: "Belum ada data mood untuk analisis",
        suggestion: "Mulai dengan mencatat mood Anda hari ini"
      };
    }

    const moodCounts = recentMoods.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<MoodType, number>);

    const dominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as MoodType;

    const moodMessages = {
      happy: "Anda sedang dalam periode yang positif! Mari pertahankan energi ini.",
      sad: "Sepertinya Anda mengalami masa yang berat. Meditasi dapat membantu.",
      anxious: "Tingkat kecemasan tampak tinggi. Fokus pada teknik pernapasan yang menenangkan.",
      calm: "Anda dalam keseimbangan yang baik. Pertahankan dengan praktik mindfulness.",
      excited: "Energi Anda tinggi! Mari arahkan dengan fokus yang tepat.",
      angry: "Ada ketegangan yang perlu dilepaskan. Meditasi dapat membantu meredakan.",
      tired: "Anda tampak memerlukan pemulihan. Pilih sesi yang lebih lembut.",
      stressed: "Stres terdeteksi. Prioritaskan relaksasi dan pernapasan dalam.",
      grateful: "Rasa syukur Anda tinggi! Pertahankan dengan loving-kindness meditation.",
      confused: "Clarity meditation dapat membantu menjernihkan pikiran Anda."
    };

    return {
      message: moodMessages[dominantMood] || "Analisis mood menunjukkan variasi yang sehat.",
      suggestion: `Berdasarkan pola ${recentMoods.length} hari terakhir`
    };
  };

  const moodAnalysis = getMoodAnalysis();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mood Analysis Card */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-heading font-semibold text-gray-800">
              Rekomendasi Personal
            </h3>
            <p className="text-sm text-gray-600">
              {moodAnalysis.suggestion}
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-4">
          <p className="text-purple-800 font-medium">
            {moodAnalysis.message}
          </p>
        </div>

        {currentMood && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Mood saat ini:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium capitalize">
              {currentMood}
            </span>
          </div>
        )}
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getPersonalizedRecommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleRecommendationSelect(recommendation)}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${recommendation.gradient} text-white`}>
                      {recommendation.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 leading-tight">
                        {recommendation.titleIndonesian}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{recommendation.duration} menit</span>
                        <span>•</span>
                        <span className="capitalize">{recommendation.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Intensity Badge */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    recommendation.intensity === 'low' ? 'bg-green-100 text-green-700' :
                    recommendation.intensity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {recommendation.intensity === 'low' ? 'Ringan' :
                     recommendation.intensity === 'medium' ? 'Sedang' : 'Intensif'}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {recommendation.descriptionIndonesian}
                </p>

                {/* Cultural Element */}
                {recommendation.culturalElement && (
                  <div className="flex items-center space-x-2 text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                    <Leaf className="w-3 h-3" />
                    <span>{recommendation.culturalElement}</span>
                  </div>
                )}

                {/* Benefits */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Manfaat:</h5>
                  <div className="flex flex-wrap gap-1">
                    {recommendation.benefitsIndonesian.slice(0, 3).map((benefit, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group hover:bg-primary-50 hover:border-primary-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRecommendationSelect(recommendation);
                  }}
                >
                  <span>Mulai Sesi</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* No Recommendations Message */}
      {getPersonalizedRecommendations.length === 0 && (
        <Card className="p-8 text-center">
          <Star className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Sedang Menganalisis Pola Mood
          </h3>
          <p className="text-gray-600">
            Catat mood Anda secara teratur untuk mendapatkan rekomendasi yang lebih personal.
          </p>
        </Card>
      )}
    </div>
  );
};