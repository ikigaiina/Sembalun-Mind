import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Star, Crown, Gem, Mountain, Sunrise, Wind, Waves, TreePine, Sun,
  BookOpen, Heart, Compass, Target, TrendingUp, Calendar, Clock, 
  MapPin, Sparkles, Zap, Trophy, Medal, Shield, Flame, Leaf, Eye,
  Users, Share2, Lock, UnlockKeyhole, ChevronRight, Plus, Check
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

// Achievement Categories
export type AchievementCategory = 
  | 'explorer' 
  | 'practitioner' 
  | 'master' 
  | 'wisdom-keeper' 
  | 'cultural-ambassador'
  | 'streak-warrior'
  | 'mindful-soul';

// Achievement Tiers
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// Indonesian Wisdom Quotes by Region
const indonesianWisdom = {
  sembalun: [
    "Gunung mengajarkan kita kesabaran, lembah mengajarkan kita kerendahan hati",
    "Di puncak Rinjani, jiwa menemukan ketenangan yang sejati",
    "Sembalun membisikkan rahasia harmoni antara langit dan bumi"
  ],
  java: [
    "Sapa sing sabar, bakal pikoleh", // Siapa yang sabar, akan mendapat
    "Ojo dumeh, tetep andhap asor", // Jangan sombong, tetap rendah hati  
    "Sepi ing pamrih, rame ing gawe" // Tanpa pamrih, rajin bekerja
  ],
  bali: [
    "Tri Hita Karana - harmoni dengan Tuhan, sesama, dan alam",
    "Tat twam asi - engkau adalah aku, aku adalah engkau",
    "Rwa bhineda - keseimbangan dalam dualitas"
  ],
  sumatra: [
    "Adat bersendi syarak, syarak bersendi Kitabullah",
    "Buah yang berisi selalu menunduk",
    "Air tenang menghanyutkan"
  ],
  sulawesi: [
    "Sipakatau, sipakalebbi, sipakainge", // Saling memanusiakan, menghargai, mengingatkan
    "Tongkonan adalah pusat kehidupan spiritual",
    "Leluhur adalah guide untuk kehidupan"
  ],
  'nusa-tenggara': [
    "Matahari terbit mengajarkan kita tentang harapan baru",
    "Pulau-pulau kecil, kebijaksanaan besar", 
    "Laut menghubungkan, bukan memisahkan"
  ]
};

// Cultural Achievement Interface
interface CulturalAchievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  requirement: {
    type: 'sessions' | 'regions' | 'practices' | 'streak' | 'wisdom' | 'hours' | 'community';
    value: number;
    specificRegions?: string[];
    specificPractices?: string[];
  };
  currentProgress: number;
  achieved: boolean;
  achievedAt?: Date;
  icon: string;
  badgeColor: string;
  reward: {
    type: 'wisdom-quote' | 'region-unlock' | 'practice-unlock' | 'badge' | 'title' | 'feature';
    value: string;
    description: string;
  };
  culturalSignificance: string;
  indonesianWisdom: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Mock user progress data
const mockUserProgress = {
  totalSessions: 15,
  regionsExplored: ['sembalun', 'java', 'bali'],
  practicesCompleted: ['sunrise-meditation', 'javanese-court', 'bali-temple', 'mountain-reflection'],
  currentStreak: 7,
  longestStreak: 12,
  totalHours: 8.5,
  wisdomQuotesCollected: 5,
  communityShares: 2,
  lastSessionDate: new Date(),
  achievementPoints: 350
};

// Comprehensive Achievement Definitions
const culturalAchievements: CulturalAchievement[] = [
  // Explorer Category
  {
    id: 'first-steps',
    title: 'Langkah Pertama',
    description: 'Selesaikan sesi meditasi budaya pertama Anda',
    category: 'explorer',
    tier: 'bronze',
    requirement: { type: 'sessions', value: 1 },
    currentProgress: mockUserProgress.totalSessions,
    achieved: mockUserProgress.totalSessions >= 1,
    achievedAt: mockUserProgress.totalSessions >= 1 ? new Date(Date.now() - 86400000 * 14) : undefined,
    icon: '👣',
    badgeColor: 'bg-orange-500',
    reward: {
      type: 'wisdom-quote',
      value: indonesianWisdom.sembalun[0],
      description: 'Kutipan kebijaksanaan Sembalun pertama'
    },
    culturalSignificance: 'Memulai perjalanan spiritual dengan tradisi Indonesia',
    indonesianWisdom: 'Perjalanan seribu mil dimulai dari satu langkah',
    points: 50,
    rarity: 'common'
  },
  {
    id: 'island-explorer',
    title: 'Penjelajah Nusantara',
    description: 'Jelajahi 3 wilayah budaya Indonesia yang berbeda',
    category: 'explorer',
    tier: 'silver',
    requirement: { type: 'regions', value: 3 },
    currentProgress: mockUserProgress.regionsExplored.length,
    achieved: mockUserProgress.regionsExplored.length >= 3,
    achievedAt: mockUserProgress.regionsExplored.length >= 3 ? new Date(Date.now() - 86400000 * 7) : undefined,
    icon: '🗺️',
    badgeColor: 'bg-emerald-500',
    reward: {
      type: 'region-unlock',
      value: 'sumatra',
      description: 'Buka wilayah Sumatra Wilderness'
    },
    culturalSignificance: 'Menghargai keberagaman budaya meditasi Indonesia',
    indonesianWisdom: 'Bhinneka Tunggal Ika - berbeda namun tetap satu',
    points: 150,
    rarity: 'uncommon'
  },
  {
    id: 'archipelago-master',
    title: 'Penguasa Nusantara',
    description: 'Kuasai semua 6 wilayah budaya Indonesia',
    category: 'explorer',
    tier: 'platinum',
    requirement: { type: 'regions', value: 6 },
    currentProgress: mockUserProgress.regionsExplored.length,
    achieved: false,
    icon: '👑',
    badgeColor: 'bg-purple-600',
    reward: {
      type: 'title',
      value: 'Penguasa Nusantara',
      description: 'Gelar istimewa untuk penjelajah sejati'
    },
    culturalSignificance: 'Mencapai pemahaman mendalam tentang semua tradisi Indonesia',
    indonesianWisdom: 'Dari Sabang sampai Merauke, satu jiwa satu rasa',
    points: 500,
    rarity: 'legendary'
  },

  // Practitioner Category
  {
    id: 'dedicated-soul',
    title: 'Jiwa Berdedikasi',
    description: 'Selesaikan 10 sesi meditasi budaya',
    category: 'practitioner',
    tier: 'bronze',
    requirement: { type: 'sessions', value: 10 },
    currentProgress: mockUserProgress.totalSessions,
    achieved: mockUserProgress.totalSessions >= 10,
    achievedAt: mockUserProgress.totalSessions >= 10 ? new Date(Date.now() - 86400000 * 5) : undefined,
    icon: '🧘',
    badgeColor: 'bg-blue-500',
    reward: {
      type: 'practice-unlock',
      value: 'advanced-breathing',
      description: 'Teknik pernapasan lanjutan'
    },
    culturalSignificance: 'Komitmen terhadap praktik spiritual rutin',
    indonesianWisdom: 'Tetes demi tetes, lama-lama menjadi bukit',
    points: 100,
    rarity: 'common'
  },
  {
    id: 'wisdom-collector',
    title: 'Pengumpul Kebijaksanaan',
    description: 'Kumpulkan 15 kutipan kebijaksanaan Indonesia',
    category: 'practitioner',
    tier: 'gold',
    requirement: { type: 'wisdom', value: 15 },
    currentProgress: mockUserProgress.wisdomQuotesCollected,
    achieved: false,
    icon: '📚',
    badgeColor: 'bg-indigo-500',
    reward: {
      type: 'feature',
      value: 'wisdom-journal',
      description: 'Jurnal kebijaksanaan pribadi'
    },
    culturalSignificance: 'Melestarikan kearifan lokal Indonesia',
    indonesianWisdom: 'Ilmu itu lebih berharga dari harta',
    points: 300,
    rarity: 'rare'
  },

  // Streak Warrior Category
  {
    id: 'weekly-warrior',
    title: 'Pejuang Mingguan',
    description: 'Berlatih meditasi selama 7 hari berturut-turut',
    category: 'streak-warrior',
    tier: 'bronze',
    requirement: { type: 'streak', value: 7 },
    currentProgress: mockUserProgress.currentStreak,
    achieved: mockUserProgress.currentStreak >= 7,
    achievedAt: mockUserProgress.currentStreak >= 7 ? new Date(Date.now() - 86400000 * 1) : undefined,
    icon: '🔥',
    badgeColor: 'bg-red-500',
    reward: {
      type: 'badge',
      value: 'streak-flame',
      description: 'Lencana api untuk konsistensi'
    },
    culturalSignificance: 'Disiplin dan konsistensi dalam spiritual',
    indonesianWisdom: 'Konsisten dalam kebaikan adalah kunci kesuksesan',
    points: 150,
    rarity: 'uncommon'
  },
  {
    id: 'monthly-master',
    title: 'Master Bulanan',
    description: 'Berlatih meditasi selama 30 hari berturut-turut',
    category: 'streak-warrior',
    tier: 'gold',
    requirement: { type: 'streak', value: 30 },
    currentProgress: mockUserProgress.longestStreak,
    achieved: false,
    icon: '⚡',
    badgeColor: 'bg-yellow-500',
    reward: {
      type: 'title',
      value: 'Master Konsistensi',
      description: 'Gelar untuk dedikasi luar biasa'
    },
    culturalSignificance: 'Pencapaian tingkat dedikasi spiritual tinggi',
    indonesianWisdom: 'Air yang mengalir terus akan melubangi batu',
    points: 400,
    rarity: 'epic'
  },

  // Master Category
  {
    id: 'cultural-master',
    title: 'Master Budaya',
    description: 'Kuasai 20 praktik meditasi tradisional',
    category: 'master',
    tier: 'platinum',
    requirement: { type: 'practices', value: 20 },
    currentProgress: mockUserProgress.practicesCompleted.length,
    achieved: false,
    icon: '🏆',
    badgeColor: 'bg-purple-700',
    reward: {
      type: 'title',
      value: 'Master Budaya Indonesia',
      description: 'Pengakuan sebagai ahli meditasi budaya'
    },
    culturalSignificance: 'Menguasai warisan spiritual Indonesia',
    indonesianWisdom: 'Guru adalah lilin yang menerangi jalan murid',
    points: 600,
    rarity: 'legendary'
  },

  // Wisdom Keeper Category
  {
    id: 'time-devotee',
    title: 'Penyembah Waktu',
    description: 'Habiskan 20 jam dalam meditasi budaya',
    category: 'wisdom-keeper',
    tier: 'silver',
    requirement: { type: 'hours', value: 20 },
    currentProgress: mockUserProgress.totalHours,
    achieved: false,
    icon: '⏰',
    badgeColor: 'bg-teal-500',
    reward: {
      type: 'practice-unlock',
      value: 'extended-meditation',
      description: 'Sesi meditasi diperpanjang'
    },
    culturalSignificance: 'Dedikasi waktu untuk pertumbuhan spiritual',
    indonesianWisdom: 'Waktu adalah guru yang terbaik',
    points: 250,
    rarity: 'uncommon'
  },

  // Cultural Ambassador Category
  {
    id: 'community-sharer',
    title: 'Berbagi Komunitas',
    description: 'Bagikan pengalaman meditasi dengan komunitas',
    category: 'cultural-ambassador',
    tier: 'bronze',
    requirement: { type: 'community', value: 5 },
    currentProgress: mockUserProgress.communityShares,
    achieved: false,
    icon: '🤝',
    badgeColor: 'bg-green-500',
    reward: {
      type: 'feature',
      value: 'community-features',
      description: 'Fitur komunitas advanced'
    },
    culturalSignificance: 'Menyebarkan praktik spiritual kepada orang lain',
    indonesianWisdom: 'Berbagi kebaikan adalah ibadah',
    points: 200,
    rarity: 'rare'
  }
];

// Achievement Statistics
interface AchievementStats {
  totalAchievements: number;
  achievedCount: number;
  totalPoints: number;
  earnedPoints: number;
  completionPercentage: number;
  rarityBreakdown: Record<string, { achieved: number; total: number }>;
  categoryBreakdown: Record<AchievementCategory, { achieved: number; total: number }>;
}

interface Props {
  className?: string;
}

export const CulturalAchievementSystem: React.FC<Props> = ({ className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<AchievementTier | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'progress'>('grid');
  const [showAchievedOnly, setShowAchievedOnly] = useState(false);

  // Calculate achievement statistics
  const achievementStats: AchievementStats = useMemo(() => {
    const achieved = culturalAchievements.filter(a => a.achieved);
    const totalPoints = culturalAchievements.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = achieved.reduce((sum, a) => sum + a.points, 0);
    
    const rarityBreakdown: Record<string, { achieved: number; total: number }> = {};
    const categoryBreakdown: Record<AchievementCategory, { achieved: number; total: number }> = {} as any;

    culturalAchievements.forEach(achievement => {
      // Rarity breakdown
      if (!rarityBreakdown[achievement.rarity]) {
        rarityBreakdown[achievement.rarity] = { achieved: 0, total: 0 };
      }
      rarityBreakdown[achievement.rarity].total++;
      if (achievement.achieved) {
        rarityBreakdown[achievement.rarity].achieved++;
      }

      // Category breakdown
      if (!categoryBreakdown[achievement.category]) {
        categoryBreakdown[achievement.category] = { achieved: 0, total: 0 };
      }
      categoryBreakdown[achievement.category].total++;
      if (achievement.achieved) {
        categoryBreakdown[achievement.category].achieved++;
      }
    });

    return {
      totalAchievements: culturalAchievements.length,
      achievedCount: achieved.length,
      totalPoints,
      earnedPoints,
      completionPercentage: Math.round((achieved.length / culturalAchievements.length) * 100),
      rarityBreakdown,
      categoryBreakdown
    };
  }, []);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    let filtered = culturalAchievements;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    if (selectedTier !== 'all') {
      filtered = filtered.filter(a => a.tier === selectedTier);
    }

    if (showAchievedOnly) {
      filtered = filtered.filter(a => a.achieved);
    }

    return filtered.sort((a, b) => {
      // Achieved achievements first, then by rarity and tier
      if (a.achieved && !b.achieved) return -1;
      if (!a.achieved && b.achieved) return 1;
      
      const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
      const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
      
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      
      return tierOrder[b.tier] - tierOrder[a.tier];
    });
  }, [selectedCategory, selectedTier, showAchievedOnly]);

  // Get tier color
  const getTierColor = (tier: AchievementTier) => {
    const colors = {
      bronze: 'from-orange-400 to-orange-600',
      silver: 'from-gray-300 to-gray-500',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-purple-400 to-purple-600',
      diamond: 'from-cyan-400 to-blue-600'
    };
    return colors[tier];
  };

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-600',
      uncommon: 'text-green-600',
      rare: 'text-blue-600',
      epic: 'text-purple-600',
      legendary: 'text-yellow-600'
    };
    return colors[rarity as keyof typeof colors] || 'text-gray-600';
  };

  // Get category icon
  const getCategoryIcon = (category: AchievementCategory) => {
    const icons = {
      explorer: Compass,
      practitioner: Heart,
      master: Crown,
      'wisdom-keeper': BookOpen,
      'cultural-ambassador': Users,
      'streak-warrior': Flame,
      'mindful-soul': Sparkles
    };
    return icons[category];
  };

  const renderAchievementCard = (achievement: CulturalAchievement, index: number) => {
    const Icon = getCategoryIcon(achievement.category);
    const progressPercentage = Math.min((achievement.currentProgress / achievement.requirement.value) * 100, 100);
    
    return (
      <motion.div
        key={achievement.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card className={`p-6 transition-all duration-300 hover:shadow-lg relative overflow-hidden ${
          achievement.achieved 
            ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          {/* Achievement Badge */}
          <div className="absolute -top-2 -right-2">
            {achievement.achieved ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center opacity-50">
                <Lock className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`text-4xl p-3 rounded-xl bg-gradient-to-r ${getTierColor(achievement.tier)} ${
                achievement.achieved ? 'shadow-lg' : 'grayscale opacity-60'
              }`}>
                <span className="filter drop-shadow-md">{achievement.icon}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon className={`w-5 h-5 ${achievement.achieved ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)} bg-gray-100`}>
                  {achievement.rarity.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${achievement.achieved ? 'text-green-700' : 'text-gray-500'}`}>
                {achievement.points}
              </div>
              <div className="text-xs text-gray-500">Points</div>
            </div>
          </div>

          {/* Title and Description */}
          <div className="mb-4">
            <h3 className={`text-lg font-bold mb-2 ${
              achievement.achieved ? 'text-green-900' : 'text-gray-700'
            }`}>
              {achievement.title}
            </h3>
            <p className={`text-sm mb-2 ${
              achievement.achieved ? 'text-green-700' : 'text-gray-600'
            }`}>
              {achievement.description}
            </p>
            
            {/* Tier Badge */}
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTierColor(achievement.tier)} text-white`}>
              {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold">
                {achievement.currentProgress}/{achievement.requirement.value}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  achievement.achieved ? 'bg-green-500' : 'bg-blue-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
          </div>

          {/* Indonesian Wisdom */}
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center mb-2">
              <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-xs font-medium text-purple-800">Kebijaksanaan Indonesia</span>
            </div>
            <p className="text-sm text-purple-700 italic">{achievement.indonesianWisdom}</p>
          </div>

          {/* Reward */}
          {achievement.achieved && achievement.reward && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <div className="flex items-center mb-2">
                <Trophy className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-xs font-medium text-yellow-800">Reward Diraih</span>
              </div>
              <p className="text-sm text-yellow-700">{achievement.reward.description}</p>
            </motion.div>
          )}

          {/* Cultural Significance */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <Mountain className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-xs font-medium text-blue-800">Makna Budaya</span>
            </div>
            <p className="text-xs text-blue-700">{achievement.culturalSignificance}</p>
          </div>

          {/* Achievement Date */}
          {achievement.achieved && achievement.achievedAt && (
            <div className="mt-3 text-center">
              <div className="text-xs text-green-600 font-medium">
                Diraih pada {achievement.achievedAt.toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  const renderStatsOverview = () => (
    <Card className="p-6 bg-gradient-to-r from-purple-600 to-indigo-700 text-white mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold">Sistem Pencapaian Budaya</h2>
            <p className="text-purple-100">Merayakan perjalanan spiritual Indonesia Anda</p>
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">
            {achievementStats.completionPercentage}%
          </div>
          <div className="text-sm text-purple-200">Selesai</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">{achievementStats.achievedCount}</div>
          <div className="text-sm text-purple-200">Pencapaian Diraih</div>
        </div>
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">{achievementStats.earnedPoints}</div>
          <div className="text-sm text-purple-200">Poin Diperoleh</div>
        </div>
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">{Object.values(achievementStats.rarityBreakdown).reduce((sum, r) => sum + r.achieved, 0)}</div>
          <div className="text-sm text-purple-200">Badge Koleksi</div>
        </div>
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">{achievementStats.totalAchievements - achievementStats.achievedCount}</div>
          <div className="text-sm text-purple-200">Tersisa</div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {renderStatsOverview()}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as AchievementCategory | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Semua Kategori</option>
              <option value="explorer">Penjelajah</option>
              <option value="practitioner">Praktisi</option>
              <option value="master">Master</option>
              <option value="wisdom-keeper">Penjaga Kebijaksanaan</option>
              <option value="cultural-ambassador">Duta Budaya</option>
              <option value="streak-warrior">Pejuang Konsistensi</option>
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as AchievementTier | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Semua Tingkat</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={showAchievedOnly ? "primary" : "ghost"}
              size="sm"
              onClick={() => setShowAchievedOnly(!showAchievedOnly)}
            >
              {showAchievedOnly ? 'Semua' : 'Diraih Saja'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Achievements Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`${selectedCategory}-${selectedTier}-${showAchievedOnly}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAchievements.map((achievement, index) => 
            renderAchievementCard(achievement, index)
          )}
        </motion.div>
      </AnimatePresence>

      {filteredAchievements.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Award className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Tidak Ada Pencapaian Ditemukan
          </h3>
          <p className="text-gray-500">
            Coba ubah filter atau mulai berlatih untuk membuka pencapaian baru!
          </p>
        </Card>
      )}
    </div>
  );
};