import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Clock, Target, Zap, Heart, Brain, Mountain, Sunrise, 
  Wind, Waves, TreePine, Crown, Compass, Sun, Filter, ChevronRight,
  Star, Award, Lock, TrendingUp, Calendar, User, RefreshCw, 
  CheckCircle, AlertCircle, Info, BookOpen, Play, Pause
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCulturalRecommendations } from '../../hooks/useCulturalRecommendations';

interface Props {
  className?: string;
  onPracticeSelect?: (practiceId: string) => void;
}

type ViewMode = 'recommendations' | 'by-mood' | 'upcoming-unlocks' | 'all-practices';
type CategoryFilter = 'all' | 'perfect-match' | 'mood-booster' | 'cultural-growth' | 'variety-exploration' | 'stress-relief';

const categoryLabels = {
  'perfect-match': 'Cocok Sempurna',
  'mood-booster': 'Peningkat Mood',
  'cultural-growth': 'Eksplorasi Budaya',
  'variety-exploration': 'Variasi Praktik',
  'stress-relief': 'Penghilang Stres'
};

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

const urgencyColors = {
  high: 'border-red-300 bg-red-50',
  medium: 'border-yellow-300 bg-yellow-50',
  low: 'border-gray-300 bg-gray-50'
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

export const CulturalPracticeRecommendations: React.FC<Props> = ({
  className = '',
  onPracticeSelect
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('recommendations');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedMood, setSelectedMood] = useState<string>('stressed');

  const {
    getRecommendations,
    getRecommendationsByCategory,
    getRecommendationsForMood,
    getUpcomingUnlocks,
    allPractices
  } = useCulturalRecommendations();

  // Get filtered recommendations
  const recommendations = useMemo(() => {
    if (viewMode === 'by-mood') {
      return getRecommendationsForMood(selectedMood as any);
    } else {
      const recs = getRecommendations(8);
      if (categoryFilter === 'all') return recs;
      return recs.filter(rec => rec.category === categoryFilter);
    }
  }, [viewMode, categoryFilter, selectedMood, getRecommendations, getRecommendationsForMood]);

  const categorizedRecommendations = useMemo(() => {
    return getRecommendationsByCategory();
  }, [getRecommendationsByCategory]);

  const upcomingUnlocks = useMemo(() => {
    return getUpcomingUnlocks();
  }, [getUpcomingUnlocks]);

  const getCategoryIcon = (category: string) => {
    const icons = {
      'perfect-match': Target,
      'mood-booster': Heart,
      'cultural-growth': Mountain,
      'variety-exploration': Sparkles,
      'stress-relief': Brain
    };
    return icons[category as keyof typeof icons] || Star;
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return AlertCircle;
      case 'medium': return Info;
      default: return CheckCircle;
    }
  };

  const renderRecommendationCard = (recommendation: any, index: number) => {
    const { practice, score, reason, category, urgency } = recommendation;
    const RegionIcon = regionIcons[practice.region];
    const CategoryIcon = getCategoryIcon(category);
    const UrgencyIcon = getUrgencyIcon(urgency);
    const regionColor = regionColors[practice.region];

    return (
      <motion.div
        key={practice.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => onPracticeSelect?.(practice.id)}
        className="cursor-pointer group"
      >
        <Card className={`p-6 transition-all duration-300 hover:shadow-lg ${urgencyColors[urgency as keyof typeof urgencyColors]}`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl bg-${regionColor}-100`}>
                <RegionIcon className={`w-8 h-8 text-${regionColor}-600`} />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <CategoryIcon className={`w-4 h-4 text-${regionColor}-600`} />
                  <span className="text-xs font-medium text-gray-600">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600">
                  {practice.title}
                </h3>
              </div>
            </div>
            
            {/* Score and Urgency */}
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <UrgencyIcon className={`w-4 h-4 ${
                  urgency === 'high' ? 'text-red-500' : 
                  urgency === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`} />
                <span className="text-sm font-bold text-gray-700">{score.score}%</span>
              </div>
              <div className="text-xs text-gray-500">Match Score</div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4">{practice.description}</p>

          {/* Recommendation Reason */}
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="text-xs font-medium text-indigo-800">Mengapa Direkomendasikan</span>
            </div>
            <p className="text-sm text-indigo-700">{reason}</p>
          </div>

          {/* Practice Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{practice.duration} menit</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[practice.difficulty]}`}>
                {practice.difficulty === 'beginner' ? 'Pemula' : 
                 practice.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'}
              </span>
            </div>
          </div>

          {/* Cultural Context */}
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center mb-1">
              <BookOpen className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-xs font-medium text-purple-800">Konteks Budaya</span>
            </div>
            <p className="text-xs text-purple-700">
              {practice.culturalContext.length > 100 
                ? `${practice.culturalContext.substring(0, 100)}...`
                : practice.culturalContext}
            </p>
          </div>

          {/* Wisdom Quote */}
          <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center mb-1">
              <Star className="w-4 h-4 text-amber-600 mr-2" />
              <span className="text-xs font-medium text-amber-800">Kebijaksanaan</span>
            </div>
            <p className="text-sm italic text-amber-700">"{practice.wisdom}"</p>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-2 mb-4">
            <div className="text-xs font-medium text-gray-700 mb-2">Score Breakdown:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Mood Match:</span>
                <span className="font-semibold">{score.reasoning.moodMatch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Match:</span>
                <span className="font-semibold">{score.reasoning.timeMatch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span className="font-semibold">{score.reasoning.difficultyMatch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Variety:</span>
                <span className="font-semibold">{score.reasoning.varietyBonus}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            size="sm"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Mulai Praktik
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </motion.div>
    );
  };

  const renderUpcomingUnlocksCard = (unlock: any, index: number) => {
    const { practice, progress, nextSteps } = unlock;
    const RegionIcon = regionIcons[practice.region];
    const regionColor = regionColors[practice.region];

    return (
      <motion.div
        key={practice.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className="p-6 border-gray-300 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden opacity-90">
          <div className="absolute top-4 right-4">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-xl bg-gray-100`}>
              <RegionIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">{practice.title}</h3>
              <p className="text-sm text-gray-500">
                {practice.region.charAt(0).toUpperCase() + practice.region.slice(1)} • {practice.difficulty}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">{practice.description}</p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress to Unlock</span>
              <span className="font-semibold text-gray-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-indigo-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-2">Next Steps:</div>
            {nextSteps.map((step, stepIndex) => (
              <div key={stepIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderStatsOverview = () => (
    <Card className="p-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold">Rekomendasi Praktik Budaya</h2>
            <p className="text-indigo-100">Praktik yang dipersonalisasi untuk perjalanan spiritual Anda</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">{recommendations.length}</div>
          <div className="text-sm text-indigo-200">Rekomendasi</div>
        </div>
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">
            {recommendations.filter(r => r.urgency === 'high').length}
          </div>
          <div className="text-sm text-indigo-200">Prioritas Tinggi</div>
        </div>
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">
            {Object.keys(categorizedRecommendations).length}
          </div>
          <div className="text-sm text-indigo-200">Kategori</div>
        </div>
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">{upcomingUnlocks.length}</div>
          <div className="text-sm text-indigo-200">Akan Terbuka</div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {renderStatsOverview()}

      {/* Navigation Tabs */}
      <Card className="p-2">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'recommendations', label: 'Rekomendasi', icon: Target },
            { id: 'by-mood', label: 'Berdasarkan Mood', icon: Heart },
            { id: 'upcoming-unlocks', label: 'Akan Terbuka', icon: Lock },
            { id: 'all-practices', label: 'Semua Praktik', icon: BookOpen }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id as ViewMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {viewMode === 'recommendations' && (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Semua Kategori</option>
                <option value="perfect-match">Cocok Sempurna</option>
                <option value="mood-booster">Peningkat Mood</option>
                <option value="cultural-growth">Eksplorasi Budaya</option>
                <option value="stress-relief">Penghilang Stres</option>
                <option value="variety-exploration">Variasi Praktik</option>
              </select>
            </div>
          )}

          {viewMode === 'by-mood' && (
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-gray-500" />
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="stressed">Stres</option>
                <option value="anxious">Cemas</option>
                <option value="sad">Sedih</option>
                <option value="angry">Marah</option>
                <option value="neutral">Netral</option>
                <option value="happy">Senang</option>
                <option value="calm">Tenang</option>
                <option value="energized">Berenergi</option>
              </select>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {viewMode === 'recommendations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => renderRecommendationCard(rec, index))}
            </div>
          )}

          {viewMode === 'by-mood' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => renderRecommendationCard(rec, index))}
            </div>
          )}

          {viewMode === 'upcoming-unlocks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingUnlocks.map((unlock, index) => renderUpcomingUnlocksCard(unlock, index))}
            </div>
          )}

          {viewMode === 'all-practices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPractices.map((practice, index) => (
                <motion.div
                  key={practice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onPracticeSelect?.(practice.id)}
                  className="cursor-pointer"
                >
                  <Card className={`p-4 transition-all hover:shadow-md ${
                    practice.isUnlocked ? 'border-gray-200' : 'border-gray-300 bg-gray-50 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {React.createElement(regionIcons[practice.region], {
                          className: `w-6 h-6 ${
                            practice.isUnlocked 
                              ? `text-${regionColors[practice.region]}-600` 
                              : 'text-gray-400'
                          }`
                        })}
                        <div>
                          <h4 className={`font-semibold text-sm ${
                            practice.isUnlocked ? 'text-gray-800' : 'text-gray-500'
                          }`}>
                            {practice.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {practice.region.charAt(0).toUpperCase() + practice.region.slice(1)}
                          </p>
                        </div>
                      </div>
                      {!practice.isUnlocked && <Lock className="w-4 h-4 text-gray-400" />}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{practice.duration}min</span>
                      <span>•</span>
                      <span>{practice.difficulty}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {(recommendations.length === 0 && viewMode !== 'upcoming-unlocks' && viewMode !== 'all-practices') && (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Sparkles className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Tidak Ada Rekomendasi Ditemukan
          </h3>
          <p className="text-gray-500">
            Coba ubah filter atau selesaikan lebih banyak praktik untuk mendapatkan rekomendasi baru!
          </p>
        </Card>
      )}
    </div>
  );
};