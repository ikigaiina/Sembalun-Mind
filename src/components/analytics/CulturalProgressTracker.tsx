import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mountain, Sunrise, Moon, Wind, Waves, TreePine, Compass,
  Star, Award, Target, TrendingUp, Calendar, Clock, MapPin,
  BookOpen, Heart, Sparkles, ChevronRight, BarChart3, PieChart,
  Zap, Crown, Gem, Leaf, Sun
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface CulturalSession {
  id: string;
  type: 'indonesian' | 'regional' | 'traditional';
  region: 'sembalun' | 'java' | 'bali' | 'sumatra' | 'sulawesi' | 'nusa-tenggara';
  practice: string;
  culturalElement: string;
  duration: number;
  completedAt: Date;
  rating?: number;
  wisdomLearned?: string;
  reflection?: string;
  mood?: string;
}

interface RegionProgress {
  region: string;
  displayName: string;
  sessionsCompleted: number;
  practicesLearned: number;
  totalPractices: number;
  completionPercentage: number;
  specializations: string[];
  icon: React.ComponentType<any>;
  color: string;
  isUnlocked: boolean;
  nextUnlock?: string;
}

interface CulturalAchievement {
  id: string;
  title: string;
  description: string;
  category: 'explorer' | 'practitioner' | 'master' | 'wisdom-keeper';
  requirement: number;
  currentProgress: number;
  achieved: boolean;
  icon: string;
  reward?: string;
  culturalSignificance?: string;
}

interface CulturalInsight {
  type: 'wisdom' | 'pattern' | 'growth' | 'tradition';
  title: string;
  message: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface Props {
  className?: string;
}

// Mock cultural session data - in real app would come from a dedicated hook
const mockCulturalSessions: CulturalSession[] = [
  {
    id: '1',
    type: 'indonesian',
    region: 'sembalun',
    practice: 'Sunrise Mountain Meditation',
    culturalElement: 'Sembalun Valley Dawn Reflection',
    duration: 15,
    completedAt: new Date(Date.now() - 86400000),
    rating: 5,
    wisdomLearned: 'Keheningan pagi membawa kejernihan pikiran',
    reflection: 'Merasakan koneksi spiritual dengan alam',
    mood: 'peaceful'
  },
  {
    id: '2',
    type: 'regional',
    region: 'java',
    practice: 'Javanese Royal Court Meditation',
    culturalElement: 'Kraton Mindfulness Tradition',
    duration: 20,
    completedAt: new Date(Date.now() - 172800000),
    rating: 4,
    wisdomLearned: 'Kebijaksanaan hidup dalam ketenangan',
    mood: 'calm'
  },
  {
    id: '3',
    type: 'traditional',
    region: 'bali',
    practice: 'Balinese Temple Reflection',
    culturalElement: 'Pura Sacred Space Meditation',
    duration: 12,
    completedAt: new Date(Date.now() - 259200000),
    rating: 5,
    wisdomLearned: 'Harmoni antara diri dan alam semesta',
    mood: 'grateful'
  }
];

export const CulturalProgressTracker: React.FC<Props> = ({
  className = ''
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'regions' | 'achievements' | 'insights'>('overview');

  // Calculate regional progress data
  const regionProgress: RegionProgress[] = useMemo(() => {
    const regions = [
      {
        region: 'sembalun',
        displayName: 'Sembalun Valley',
        totalPractices: 8,
        specializations: ['Mountain Meditation', 'Dawn Reflection', 'Valley Winds'],
        icon: Mountain,
        color: 'emerald',
        isUnlocked: true
      },
      {
        region: 'java',
        displayName: 'Java Traditions',
        totalPractices: 12,
        specializations: ['Royal Court', 'Ancient Temples', 'Puppet Wisdom'],
        icon: Crown,
        color: 'amber',
        isUnlocked: true
      },
      {
        region: 'bali',
        displayName: 'Balinese Harmony',
        totalPractices: 10,
        specializations: ['Temple Sacred Space', 'Ocean Reflection', 'Rice Field Peace'],
        icon: Waves,
        color: 'blue',
        isUnlocked: true
      },
      {
        region: 'sumatra',
        displayName: 'Sumatra Wilderness',
        totalPractices: 6,
        specializations: ['Forest Meditation', 'Lake Reflection', 'Highland Peace'],
        icon: TreePine,
        color: 'green',
        isUnlocked: false,
        nextUnlock: 'Complete 5 Sembalun sessions'
      },
      {
        region: 'sulawesi',
        displayName: 'Sulawesi Spirituality',
        totalPractices: 8,
        specializations: ['Ancestral Wisdom', 'Island Breeze', 'Sacred Ceremonies'],
        icon: Compass,
        color: 'purple',
        isUnlocked: false,
        nextUnlock: 'Complete 8 Java sessions'
      },
      {
        region: 'nusa-tenggara',
        displayName: 'Nusa Tenggara Wisdom',
        totalPractices: 7,
        specializations: ['Eastern Sunrise', 'Island Meditation', 'Cultural Heritage'],
        icon: Sun,
        color: 'orange',
        isUnlocked: false,
        nextUnlock: 'Complete 6 Bali sessions'
      }
    ];

    return regions.map(region => {
      const regionSessions = mockCulturalSessions.filter(session => session.region === region.region);
      const sessionsCompleted = regionSessions.length;
      const practicesLearned = new Set(regionSessions.map(session => session.practice)).size;
      const completionPercentage = (practicesLearned / region.totalPractices) * 100;

      return {
        ...region,
        sessionsCompleted,
        practicesLearned,
        completionPercentage
      };
    });
  }, []);

  // Calculate cultural achievements
  const culturalAchievements: CulturalAchievement[] = useMemo(() => {
    const totalSessions = mockCulturalSessions.length;
    const regionsExplored = new Set(mockCulturalSessions.map(s => s.region)).size;
    const practicesLearned = new Set(mockCulturalSessions.map(s => s.practice)).size;
    const wisdomQuotes = mockCulturalSessions.filter(s => s.wisdomLearned).length;

    const achievements = [
      {
        id: 'cultural-explorer',
        title: 'Cultural Explorer',
        description: 'Jelajahi 3 wilayah budaya Indonesia',
        category: 'explorer' as const,
        requirement: 3,
        currentProgress: regionsExplored,
        icon: '🗺️',
        reward: 'Unlock Sumatra region',
        culturalSignificance: 'Menghargai keberagaman budaya Nusantara'
      },
      {
        id: 'wisdom-seeker',
        title: 'Wisdom Seeker',
        description: 'Kumpulkan 10 kutipan kebijaksaan',
        category: 'practitioner' as const,
        requirement: 10,
        currentProgress: wisdomQuotes,
        icon: '📚',
        reward: 'Special wisdom collection',
        culturalSignificance: 'Melestarikan kearifan lokal'
      },
      {
        id: 'practice-master',
        title: 'Practice Master',
        description: 'Kuasai 15 praktik meditasi tradisional',
        category: 'master' as const,
        requirement: 15,
        currentProgress: practicesLearned,
        icon: '🏆',
        reward: 'Master practitioner badge',
        culturalSignificance: 'Ahli dalam tradisi meditasi Indonesia'
      },
      {
        id: 'dedicated-practitioner',
        title: 'Dedicated Practitioner',
        description: 'Selesaikan 25 sesi meditasi budaya',
        category: 'practitioner' as const,
        requirement: 25,
        currentProgress: totalSessions,
        icon: '⭐',
        reward: 'Cultural dedication badge',
        culturalSignificance: 'Komitmen tinggi terhadap praktik budaya'
      },
      {
        id: 'harmony-keeper',
        title: 'Harmony Keeper',
        description: 'Praktik harian selama 30 hari berturut-turut',
        category: 'wisdom-keeper' as const,
        requirement: 30,
        currentProgress: 5, // Mock current streak
        icon: '🕯️',
        reward: 'Harmony keeper title',
        culturalSignificance: 'Menjaga keharmonian spiritual'
      },
      {
        id: 'nusantara-ambassador',
        title: 'Nusantara Ambassador',
        description: 'Jelajahi semua 6 wilayah budaya',
        category: 'wisdom-keeper' as const,
        requirement: 6,
        currentProgress: regionsExplored,
        icon: '👑',
        reward: 'Ambassador status',
        culturalSignificance: 'Duta budaya meditasi Indonesia'
      }
    ];

    return achievements.map(achievement => ({
      ...achievement,
      achieved: achievement.currentProgress >= achievement.requirement
    }));
  }, []);

  // Generate cultural insights
  const culturalInsights: CulturalInsight[] = useMemo(() => {
    const insights: CulturalInsight[] = [];

    // Most practiced region
    const regionCounts = mockCulturalSessions.reduce((acc, session) => {
      acc[session.region] = (acc[session.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPracticedRegion = Object.entries(regionCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostPracticedRegion) {
      insights.push({
        type: 'pattern',
        title: 'Wilayah Favorit',
        message: `Anda paling sering berlatih dengan tradisi ${mostPracticedRegion[0] === 'sembalun' ? 'Sembalun Valley' : 
          mostPracticedRegion[0] === 'java' ? 'Java' : 'Bali'}`,
        icon: MapPin,
        color: 'blue'
      });
    }

    // Progress growth
    const recentSessions = mockCulturalSessions.filter(
      session => Date.now() - session.completedAt.getTime() < 7 * 24 * 60 * 60 * 1000
    );

    if (recentSessions.length > 0) {
      insights.push({
        type: 'growth',
        title: 'Momentum Positif',
        message: `${recentSessions.length} sesi budaya dalam 7 hari terakhir - konsistensi yang luar biasa!`,
        icon: TrendingUp,
        color: 'green'
      });
    }

    // Wisdom collection
    const uniqueWisdom = new Set(mockCulturalSessions.filter(s => s.wisdomLearned).map(s => s.wisdomLearned)).size;
    if (uniqueWisdom > 0) {
      insights.push({
        type: 'wisdom',
        title: 'Kumpulan Kebijaksaan',
        message: `${uniqueWisdom} kutipan kebijaksaan Indonesia telah Anda pelajari`,
        icon: BookOpen,
        color: 'purple'
      });
    }

    // Traditional connection
    const traditionalSessions = mockCulturalSessions.filter(s => s.type === 'traditional').length;
    if (traditionalSessions > 0) {
      insights.push({
        type: 'tradition',
        title: 'Koneksi Tradisional',
        message: `Anda terhubung dengan ${traditionalSessions} praktik tradisional kuno`,
        icon: Heart,
        color: 'amber'
      });
    }

    return insights;
  }, []);

  const getAchievementColor = (category: string, achieved: boolean) => {
    if (!achieved) return 'text-gray-500 bg-gray-50';
    
    switch (category) {
      case 'explorer': return 'text-green-700 bg-green-100';
      case 'practitioner': return 'text-blue-700 bg-blue-100';
      case 'master': return 'text-purple-700 bg-purple-100';
      case 'wisdom-keeper': return 'text-amber-700 bg-amber-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const renderOverviewSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Key Cultural Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-emerald-600 font-medium">Sesi</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900">{mockCulturalSessions.length}</div>
          <div className="text-sm text-emerald-700">Praktik Budaya</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-500 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-amber-600 font-medium">Wilayah</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">
            {new Set(mockCulturalSessions.map(s => s.region)).size}
          </div>
          <div className="text-sm text-amber-700">Dijelajahi</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-purple-600 font-medium">Kebijaksaan</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {mockCulturalSessions.filter(s => s.wisdomLearned).length}
          </div>
          <div className="text-sm text-purple-700">Dipelajari</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Pencapaian</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {culturalAchievements.filter(a => a.achieved).length}
          </div>
          <div className="text-sm text-blue-700">Diraih</div>
        </Card>
      </div>

      {/* Regional Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Progress Regional</h3>
          <BarChart3 className="w-5 h-5 text-gray-500" />
        </div>

        <div className="space-y-4">
          {regionProgress.slice(0, 3).map((region) => {
            const Icon = region.icon;
            return (
              <div key={region.region} className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-${region.color}-100`}>
                  <Icon className={`w-6 h-6 text-${region.color}-600`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-800">{region.displayName}</h4>
                    <span className="text-sm font-semibold text-gray-600">
                      {region.practicesLearned}/{region.totalPractices}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`bg-${region.color}-500 h-2 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${region.completionPercentage}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(region.completionPercentage)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('regions')}
            className="text-blue-600 hover:text-blue-800"
          >
            Lihat Semua Wilayah
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  const renderRegionsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regionProgress.map((region) => {
          const Icon = region.icon;
          return (
            <Card 
              key={region.region} 
              className={`p-6 transition-all hover:shadow-lg ${
                region.isUnlocked 
                  ? `border-${region.color}-200 bg-gradient-to-br from-${region.color}-50 to-white`
                  : 'border-gray-200 bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  region.isUnlocked 
                    ? `bg-${region.color}-100`
                    : 'bg-gray-100'
                }`}>
                  <Icon className={`w-8 h-8 ${
                    region.isUnlocked 
                      ? `text-${region.color}-600`
                      : 'text-gray-400'
                  }`} />
                </div>
                {!region.isUnlocked && (
                  <div className="text-yellow-500">
                    <Star className="w-5 h-5" />
                  </div>
                )}
              </div>

              <h3 className={`text-lg font-semibold mb-2 ${
                region.isUnlocked ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {region.displayName}
              </h3>

              {region.isUnlocked ? (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-semibold">
                        {Math.round(region.completionPercentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`bg-${region.color}-500 h-2 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${region.completionPercentage}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{region.practicesLearned}</span> dari{' '}
                      <span className="font-medium">{region.totalPractices}</span> praktik
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{region.sessionsCompleted}</span> sesi diselesaikan
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700 mb-2">Spesialisasi:</div>
                    {region.specializations.map((spec, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-yellow-500" />
                        {spec}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">Wilayah Terkunci</p>
                  <p className="text-xs text-gray-400">{region.nextUnlock}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </motion.div>
  );

  const renderAchievementsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {culturalAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 transition-all hover:shadow-md ${
              achievement.achieved 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`text-2xl p-2 rounded-lg ${
                  achievement.achieved 
                    ? 'bg-green-100' 
                    : 'bg-gray-100 grayscale'
                }`}>
                  {achievement.icon}
                </div>
                {achievement.achieved && (
                  <div className="text-green-600">
                    <Award className="w-5 h-5" />
                  </div>
                )}
              </div>

              <h4 className={`font-semibold text-sm mb-1 ${
                achievement.achieved ? 'text-green-900' : 'text-gray-600'
              }`}>
                {achievement.title}
              </h4>

              <p className={`text-xs mb-3 ${
                achievement.achieved ? 'text-green-700' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span className="font-semibold">
                    {achievement.currentProgress}/{achievement.requirement}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <motion.div
                    className={`h-1.5 rounded-full ${
                      achievement.achieved ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min((achievement.currentProgress / achievement.requirement) * 100, 100)}%` 
                    }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              </div>

              {achievement.achieved && achievement.reward && (
                <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                  <div className="text-xs font-medium text-yellow-800">🎁 Reward:</div>
                  <div className="text-xs text-yellow-700">{achievement.reward}</div>
                </div>
              )}

              {achievement.culturalSignificance && (
                <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                  <div className="text-xs font-medium text-purple-800">🏛️ Makna Budaya:</div>
                  <div className="text-xs text-purple-700">{achievement.culturalSignificance}</div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderInsightsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {culturalInsights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className={`p-6 bg-gradient-to-r from-${insight.color}-50 to-white border-${insight.color}-200`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-${insight.color}-100`}>
                    <Icon className={`w-6 h-6 text-${insight.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-${insight.color}-900 mb-2`}>
                      {insight.title}
                    </h4>
                    <p className={`text-sm text-${insight.color}-700`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Cultural Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Sesi Budaya Terkini</h3>
          <Clock className="w-5 h-5 text-gray-500" />
        </div>

        <div className="space-y-4">
          {mockCulturalSessions.slice(0, 3).map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Mountain className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-800">{session.practice}</h5>
                <p className="text-sm text-gray-600">{session.culturalElement}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {session.completedAt.toLocaleDateString('id-ID')}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {session.duration} menit
                  </span>
                  {session.rating && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <div className="flex">
                        {Array.from({ length: session.rating }, (_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {session.wisdomLearned && (
                <div className="text-purple-600">
                  <BookOpen className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Mountain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold">Progress Budaya Indonesia</h2>
              <p className="text-emerald-100">Jelajahi kekayaan tradisi meditasi Nusantara</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {Math.round(
                (regionProgress.reduce((acc, region) => acc + region.completionPercentage, 0) / 
                 regionProgress.length)
              )}%
            </div>
            <div className="text-sm text-emerald-200">Kemajuan Keseluruhan</div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Card className="p-2">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Ringkasan', icon: Target },
            { id: 'regions', label: 'Wilayah', icon: MapPin },
            { id: 'achievements', label: 'Pencapaian', icon: Award },
            { id: 'insights', label: 'Wawasan', icon: Zap }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'overview' && renderOverviewSection()}
        {viewMode === 'regions' && renderRegionsSection()}
        {viewMode === 'achievements' && renderAchievementsSection()}
        {viewMode === 'insights' && renderInsightsSection()}
      </AnimatePresence>
    </div>
  );
};