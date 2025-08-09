import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Mountain, Crown, Waves, TreePine, Compass, Sun, Heart, Target, 
  Sparkles, Play, BookOpen, Calendar, User, Award, Clock, TrendingUp,
  Star, ChevronRight, Sunrise, Wind, Leaf, Flame, Moon
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useOnboarding } from '../../hooks/useOnboarding';

interface Props {
  className?: string;
}

// Regional icons mapping
const regionIcons = {
  sembalun: Mountain,
  java: Crown,
  bali: Waves,
  sumatra: TreePine,
  sulawesi: Compass,
  'nusa-tenggara': Sun
};

const regionColors = {
  sembalun: 'emerald',
  java: 'amber',
  bali: 'blue',
  sumatra: 'green',
  sulawesi: 'purple',
  'nusa-tenggara': 'orange'
};

// Experience level icons
const experienceLevelIcons = {
  beginner: Leaf,
  intermediate: Flame,
  advanced: Star
};

// Goal icons
const goalIcons = {
  'stress-relief': Heart,
  'spiritual-growth': Sparkles,
  'cultural-exploration': Mountain,
  'focus-concentration': Target,
  'emotional-balance': Waves,
  'better-sleep': Moon
};

export const PersonalizedWelcomeDashboard: React.FC<Props> = ({
  className = ''
}) => {
  const {
    isOnboardingCompleted,
    userPreferences,
    getPersonalizedRecommendations,
    shouldShowWelcomeBack,
    getOnboardingStats
  } = useOnboarding();

  const recommendations = useMemo(() => {
    return getPersonalizedRecommendations();
  }, [getPersonalizedRecommendations]);

  const onboardingStats = useMemo(() => {
    return getOnboardingStats();
  }, [getOnboardingStats]);

  if (!isOnboardingCompleted || !userPreferences) {
    return null;
  }

  const {
    experienceLevel,
    meditationGoals,
    preferredRegions,
    culturalInterests,
    sessionDuration
  } = userPreferences;

  // Personalized greeting based on time and preferences
  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Sore';
    
    if (shouldShowWelcomeBack()) {
      return `${timeGreeting}! Selamat datang kembali 🌅`;
    }
    
    const primaryRegion = preferredRegions[0];
    const regionName = primaryRegion === 'sembalun' ? 'Sembalun' : 
                     primaryRegion === 'java' ? 'Java' : 
                     primaryRegion === 'bali' ? 'Bali' : 
                     primaryRegion === 'sumatra' ? 'Sumatra' :
                     primaryRegion === 'sulawesi' ? 'Sulawesi' : 'Nusa Tenggara';

    return `${timeGreeting}! Mari jelajahi keindahan ${regionName} 🏔️`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Personalized Header */}
      <Card className="p-6 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-heading font-bold mb-2">
              {getPersonalizedGreeting()}
            </h1>
            <p className="text-emerald-100 mb-4">
              {recommendations.personalizedMessage}
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">
              {onboardingStats.totalPreferences}
            </div>
            <div className="text-sm text-emerald-200">Preferensi Aktif</div>
          </div>
        </motion.div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Play className="w-4 h-4 mr-2" />
            Mulai Sekarang
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Jadwal Sesi
          </Button>
        </div>
      </Card>

      {/* Personal Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Experience Level */}
        <Card className="p-5">
          <div className="flex items-center space-x-3 mb-4">
            {React.createElement(experienceLevelIcons[experienceLevel as keyof typeof experienceLevelIcons], {
              className: "w-8 h-8 text-emerald-600"
            })}
            <div>
              <h3 className="font-semibold text-gray-800">Tingkat Pengalaman</h3>
              <p className="text-sm text-gray-600 capitalize">{experienceLevel}</p>
            </div>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-lg font-bold text-emerald-800">
              {recommendations.suggestedDuration} menit
            </div>
            <div className="text-xs text-emerald-600">Sesi Disarankan</div>
          </div>
        </Card>

        {/* Active Goals */}
        <Card className="p-5">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Tujuan Aktif</h3>
              <p className="text-sm text-gray-600">{meditationGoals.length} tujuan dipilih</p>
            </div>
          </div>
          <div className="space-y-2">
            {meditationGoals.slice(0, 2).map((goal, index) => (
              <div key={goal} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs text-gray-700 capitalize">
                  {goal.replace('-', ' ')}
                </span>
              </div>
            ))}
            {meditationGoals.length > 2 && (
              <div className="text-xs text-gray-500">+{meditationGoals.length - 2} lainnya</div>
            )}
          </div>
        </Card>

        {/* Cultural Focus */}
        <Card className="p-5">
          <div className="flex items-center space-x-3 mb-4">
            <Mountain className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Fokus Budaya</h3>
              <p className="text-sm text-gray-600">{preferredRegions.length} wilayah dipilih</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {preferredRegions.slice(0, 3).map((region) => {
              const RegionIcon = regionIcons[region as keyof typeof regionIcons];
              const regionColor = regionColors[region as keyof typeof regionColors];
              
              return (
                <div key={region} className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-1 rounded-lg bg-${regionColor}-100 flex items-center justify-center`}>
                    <RegionIcon className={`w-4 h-4 text-${regionColor}-600`} />
                  </div>
                  <div className="text-xs text-gray-600 capitalize">
                    {region === 'nusa-tenggara' ? 'N.Tenggara' : region}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recommended Practices */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Rekomendasi untuk Anda
              </h2>
              <p className="text-sm text-gray-600">
                Praktik yang disesuaikan dengan preferensi Anda
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
          >
            Lihat Semua
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.suggestedPractices.slice(0, 3).map((practiceId, index) => (
            <motion.div
              key={practiceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-emerald-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Mountain className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      Meditasi Fajar Sembalun
                    </h4>
                    <p className="text-xs text-gray-600">
                      {recommendations.suggestedDuration} menit • {recommendations.suggestedTimeOfDay}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">Cocok untuk Anda</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:text-emerald-800 p-1"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Progress Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Focus */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Fokus Hari Ini</h3>
              <p className="text-sm text-gray-600">Berdasarkan tujuan Anda</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {meditationGoals.slice(0, 2).map((goal, index) => (
              <div key={goal} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {goal.replace('-', ' ')}
                  </span>
                </div>
                <span className="text-xs text-gray-500">Aktif</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Statistik Cepat</h3>
              <p className="text-sm text-gray-600">Ringkasan profil Anda</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-800">
                {culturalInterests.length}
              </div>
              <div className="text-xs text-purple-600">Minat Budaya</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-800">
                {sessionDuration}
              </div>
              <div className="text-xs text-purple-600">Menit per Sesi</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Motivational Message */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-amber-100 rounded-lg flex-shrink-0">
            <BookOpen className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">
              Kebijaksanaan Hari Ini
            </h3>
            <p className="text-amber-800 mb-4 italic">
              "Perjalanan seribu mil dimulai dari satu langkah. Setiap sesi meditasi adalah langkah menuju ketenangan jiwa."
            </p>
            <div className="text-sm text-amber-700">
              Tetap semangat dalam perjalanan spiritual Anda! 🌟
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};