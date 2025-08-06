import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface CulturalBadge {
  id: string;
  name: string;
  indonesianName: string;
  description: string;
  category: 'historical' | 'natural' | 'cultural' | 'spiritual' | 'modern';
  difficulty: 'bronze' | 'silver' | 'gold' | 'diamond';
  icon: string;
  culturalBackground: string;
  requirements: BadgeRequirement[];
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  dateEarned?: Date;
  rarity: number; // 1-100, lower is rarer
}

interface BadgeRequirement {
  type: 'streak' | 'sessions' | 'minutes' | 'technique' | 'time' | 'mood' | 'community';
  value: number | string;
  description: string;
  completed: boolean;
}

interface FestivalChallenge {
  id: string;
  name: string;
  description: string;
  festival: string;
  startDate: Date;
  endDate: Date;
  participants: number;
  userRank?: number;
  theme: string;
  dailyGoals: FestivalDailyGoal[];
  rewards: CulturalBadge[];
  isActive: boolean;
  userParticipating: boolean;
}

interface FestivalDailyGoal {
  day: number;
  title: string;
  description: string;
  meditationType: string;
  completed: boolean;
  completedAt?: Date;
}

interface VirtualGarden {
  id: string;
  name: string;
  region: string;
  level: number;
  maxLevel: number;
  experience: number;
  expToNextLevel: number;
  unlockedFeatures: GardenFeature[];
  availableFeatures: GardenFeature[];
  theme: 'bali' | 'java' | 'sumatra' | 'lombok' | 'candi';
  ambientSounds: string[];
  visualElements: string[];
}

interface GardenFeature {
  id: string;
  name: string;
  type: 'structure' | 'plant' | 'sound' | 'animal' | 'decoration';
  cost: number;
  description: string;
  icon: string;
  culturalSignificance: string;
  unlocked: boolean;
}

interface IndonesianAchievementSystemProps {
  userStats: {
    totalSessions: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    techniques: string[];
    moods: string[];
    communityParticipation: number;
  };
  onBadgeClick: (badge: CulturalBadge) => void;
  onGardenSelect: (garden: VirtualGarden) => void;
  onJoinChallenge: (challenge: FestivalChallenge) => void;
}

const culturalBadges: CulturalBadge[] = [
  {
    id: 'borobudur-mindfulness',
    name: 'Borobudur Mindfulness',
    indonesianName: 'Kesadaran Borobudur',
    description: 'Complete 108 minutes of meditation, honoring the sacred number of Buddha',
    category: 'historical',
    difficulty: 'gold',
    icon: '🏛️',
    culturalBackground: 'Borobudur temple has 108 Buddha statues, a sacred number in Buddhism representing spiritual completion',
    requirements: [
      { type: 'minutes', value: 108, description: 'Meditate for 108 total minutes', completed: false },
      { type: 'technique', value: 'buddhist-breathing', description: 'Use Buddhist breathing technique', completed: false }
    ],
    unlocked: false,
    progress: 67,
    maxProgress: 108,
    rarity: 25
  },
  {
    id: 'garuda-pancasila',
    name: 'Garuda Pancasila',
    indonesianName: 'Garuda Pancasila',
    description: 'Embody the five principles through diverse meditation practices',
    category: 'modern',
    difficulty: 'diamond',
    icon: '🦅',
    culturalBackground: 'Pancasila represents Indonesia\'s five founding principles of unity and harmony',
    requirements: [
      { type: 'technique', value: 5, description: 'Master 5 different meditation techniques', completed: false },
      { type: 'community', value: 5, description: 'Participate in 5 community sessions', completed: false },
      { type: 'streak', value: 30, description: 'Maintain 30-day meditation streak', completed: false }
    ],
    unlocked: false,
    progress: 3,
    maxProgress: 5,
    rarity: 5
  },
  {
    id: 'tanah-lot-sunset',
    name: 'Tanah Lot Sunset',
    indonesianName: 'Senja Tanah Lot',
    description: 'Complete 20 evening meditation sessions during sunset hours',
    category: 'natural',
    difficulty: 'silver',
    icon: '🌅',
    culturalBackground: 'Tanah Lot temple is famous for its stunning sunset views and spiritual significance',
    requirements: [
      { type: 'sessions', value: 20, description: 'Complete 20 evening sessions', completed: false },
      { type: 'time', value: '17:00-19:00', description: 'Meditate during sunset hours', completed: false }
    ],
    unlocked: false,
    progress: 12,
    maxProgress: 20,
    rarity: 40
  },
  {
    id: 'batik-pattern',
    name: 'Batik Pattern',
    indonesianName: 'Pola Batik',
    description: 'Create beautiful meditation patterns like traditional batik artisans',
    category: 'cultural',
    difficulty: 'bronze',
    icon: '🎨',
    culturalBackground: 'Batik represents the patience and mindfulness required in traditional Indonesian art',
    requirements: [
      { type: 'sessions', value: 7, description: 'Complete sessions for 7 consecutive days', completed: true }
    ],
    unlocked: true,
    progress: 7,
    maxProgress: 7,
    dateEarned: new Date('2024-01-15'),
    rarity: 70
  },
  {
    id: 'komodo-strength',
    name: 'Komodo Strength',
    indonesianName: 'Kekuatan Komodo',
    description: 'Build inner strength through consistent practice like the mighty Komodo dragon',
    category: 'natural',
    difficulty: 'gold',
    icon: '🦎',
    culturalBackground: 'Komodo dragons represent strength, patience, and ancient wisdom of Indonesian nature',
    requirements: [
      { type: 'streak', value: 50, description: 'Maintain 50-day streak', completed: false },
      { type: 'minutes', value: 500, description: 'Complete 500 total minutes', completed: false }
    ],
    unlocked: false,
    progress: 23,
    maxProgress: 50,
    rarity: 15
  },
  {
    id: 'melati-putih',
    name: 'Melati Putih',
    indonesianName: 'Melati Putih',
    description: 'Pure and fragrant like the national flower, achieve inner purity',
    category: 'cultural',
    difficulty: 'silver',
    icon: '🌺',
    culturalBackground: 'Melati (jasmine) symbolizes purity, grace, and spiritual beauty in Indonesian culture',
    requirements: [
      { type: 'mood', value: 'peaceful', description: 'Complete 15 sessions in peaceful mood', completed: false },
      { type: 'technique', value: 'purity-meditation', description: 'Master purity meditation technique', completed: false }
    ],
    unlocked: false,
    progress: 8,
    maxProgress: 15,
    rarity: 30
  }
];

const festivalChallenges: FestivalChallenge[] = [
  {
    id: 'ramadan-reflection-2024',
    name: 'Ramadan Reflection Journey',
    description: 'A spiritual journey through the holy month with daily meditation themes',
    festival: 'Ramadan',
    startDate: new Date('2024-03-11'),
    endDate: new Date('2024-04-09'),
    participants: 12847,
    userRank: 234,
    theme: 'Syukur dan Perenungan',
    dailyGoals: [
      {
        day: 1,
        title: 'Niat Suci',
        description: 'Begin with pure intention for spiritual growth',
        meditationType: 'intention-setting',
        completed: true,
        completedAt: new Date('2024-03-11T19:30:00')
      },
      {
        day: 15,
        title: 'Syukur Berlimpah',
        description: 'Gratitude meditation for daily blessings',
        meditationType: 'gratitude',
        completed: false
      }
    ],
    rewards: [culturalBadges[0]], // Borobudur badge as reward
    isActive: true,
    userParticipating: true
  },
  {
    id: 'kartini-empowerment-2024',
    name: 'Kartini Day Empowerment',
    description: 'Celebrate women\'s strength and wisdom through meditation',
    festival: 'Hari Kartini',
    startDate: new Date('2024-04-21'),
    endDate: new Date('2024-04-21'),
    participants: 5623,
    theme: 'Kekuatan Perempuan Indonesia',
    dailyGoals: [
      {
        day: 1,
        title: 'Inner Strength',
        description: 'Discover the power within yourself',
        meditationType: 'empowerment',
        completed: false
      }
    ],
    rewards: [],
    isActive: false,
    userParticipating: false
  }
];

const virtualGardens: VirtualGarden[] = [
  {
    id: 'bali-garden',
    name: 'Taman Bali',
    region: 'Bali',
    level: 12,
    maxLevel: 20,
    experience: 2340,
    expToNextLevel: 160,
    theme: 'bali',
    unlockedFeatures: [
      {
        id: 'pura-mini',
        name: 'Pura Mini',
        type: 'structure',
        cost: 100,
        description: 'Small Hindu temple for daily prayers',
        icon: '🏛️',
        culturalSignificance: 'Sacred space for Hindu meditation and prayer',
        unlocked: true
      },
      {
        id: 'frangipani-tree',
        name: 'Pohon Kamboja',
        type: 'plant',
        cost: 50,
        description: 'Sacred frangipani tree with white flowers',
        icon: '🌸',
        culturalSignificance: 'Symbol of devotion and immortality in Balinese culture',
        unlocked: true
      }
    ],
    availableFeatures: [
      {
        id: 'gamelan-pavilion',
        name: 'Pavilion Gamelan',
        type: 'structure',
        cost: 200,
        description: 'Traditional music pavilion for meditation',
        icon: '🎵',
        culturalSignificance: 'Sacred space for traditional music meditation',
        unlocked: false
      }
    ],
    ambientSounds: ['gamelan-morning', 'temple-bells', 'tropical-birds'],
    visualElements: ['lotus-pond', 'stone-statues', 'incense-smoke']
  },
  {
    id: 'java-forest',
    name: 'Hutan Jawa',
    region: 'Jawa',
    level: 8,
    maxLevel: 20,
    experience: 1560,
    expToNextLevel: 240,
    theme: 'java',
    unlockedFeatures: [
      {
        id: 'bamboo-grove',
        name: 'Rumpun Bambu',
        type: 'plant',
        cost: 75,
        description: 'Peaceful bamboo grove for contemplation',
        icon: '🎋',
        culturalSignificance: 'Symbol of flexibility and strength in Javanese culture',
        unlocked: true
      }
    ],
    availableFeatures: [
      {
        id: 'hidden-waterfall',
        name: 'Air Terjun Tersembunyi',
        type: 'structure',
        cost: 300,
        description: 'Secret waterfall for deep meditation',
        icon: '💧',
        culturalSignificance: 'Sacred water source for purification rituals',
        unlocked: false
      }
    ],
    ambientSounds: ['bamboo-wind', 'forest-birds', 'water-stream'],
    visualElements: ['morning-mist', 'fireflies', 'moss-stones']
  }
];

export const IndonesianAchievementSystem: React.FC<IndonesianAchievementSystemProps> = ({
  userStats,
  onBadgeClick,
  onGardenSelect,
  onJoinChallenge
}) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'challenges' | 'gardens'>('badges');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredBadges = culturalBadges.filter(badge => 
    selectedCategory === 'all' || badge.category === selectedCategory
  );

  const activeChallenges = festivalChallenges.filter(challenge => challenge.isActive);
  const upcomingChallenges = festivalChallenges.filter(challenge => !challenge.isActive);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return 'text-amber-600 bg-amber-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'diamond': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'historical': return '🏛️';
      case 'natural': return '🌿';
      case 'cultural': return '🎨';
      case 'spiritual': return '🙏';
      case 'modern': return '🏙️';
      default: return '🏆';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'badges', label: 'Lencana', icon: '🏆' },
          { id: 'challenges', label: 'Tantangan', icon: '🎯' },
          { id: 'gardens', label: 'Taman', icon: '🌺' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div>
          {/* Category Filter */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'Semua', icon: '🏆' },
              { id: 'historical', label: 'Sejarah', icon: '🏛️' },
              { id: 'natural', label: 'Alam', icon: '🌿' },
              { id: 'cultural', label: 'Budaya', icon: '🎨' },
              { id: 'spiritual', label: 'Spiritual', icon: '🙏' },
              { id: 'modern', label: 'Modern', icon: '🏙️' }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* Badge Grid */}
          <div className="space-y-4">
            {filteredBadges.map((badge) => (
              <Card
                key={badge.id}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  badge.unlocked ? '' : 'opacity-75'
                }`}
                onClick={() => onBadgeClick(badge)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`text-3xl ${badge.unlocked ? '' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-800">{badge.indonesianName}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(badge.difficulty)}`}>
                        {badge.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                    
                    {/* Progress Bar */}
                    {!badge.unlocked && badge.progress > 0 && (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{badge.progress}/{badge.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          badge.unlocked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {badge.unlocked ? '✓ Terbuka' : `${Math.round((badge.progress / badge.maxProgress) * 100)}% selesai`}
                        </span>
                        <span className="text-xs text-gray-500">
                          Rarity: {badge.rarity}%
                        </span>
                      </div>
                      
                      {badge.dateEarned && (
                        <span className="text-xs text-gray-500">
                          {badge.dateEarned.toLocaleDateString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          
          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <div>
              <h3 className="font-heading text-lg text-gray-800 mb-4">Tantangan Aktif</h3>
              {activeChallenges.map((challenge) => (
                <Card key={challenge.id} className="mb-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{challenge.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>👥 {challenge.participants.toLocaleString()} peserta</span>
                          {challenge.userRank && (
                            <span>🏆 Peringkat #{challenge.userRank}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl">🌙</div>
                    </div>
                    
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Progress Harian</span>
                        <span>{challenge.dailyGoals.filter(g => g.completed).length}/{challenge.dailyGoals.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ 
                            width: `${(challenge.dailyGoals.filter(g => g.completed).length / challenge.dailyGoals.length) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Today's Goal */}
                    {challenge.userParticipating && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-purple-700">Hari ini:</span>
                          <span className="text-sm text-purple-600">{challenge.dailyGoals[14]?.title}</span>
                        </div>
                        <p className="text-xs text-purple-600">{challenge.dailyGoals[14]?.description}</p>
                      </div>
                    )}
                    
                    {!challenge.userParticipating && (
                      <Button
                        onClick={() => onJoinChallenge(challenge)}
                        size="small"
                        className="w-full"
                      >
                        Bergabung Tantangan
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Upcoming Challenges */}
          {upcomingChallenges.length > 0 && (
            <div>
              <h3 className="font-heading text-lg text-gray-800 mb-4">Tantangan Mendatang</h3>
              {upcomingChallenges.map((challenge) => (
                <Card key={challenge.id} className="mb-4 opacity-75">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">📅</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{challenge.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{challenge.description}</p>
                      <span className="text-xs text-gray-500">
                        {challenge.startDate.toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gardens Tab */}
      {activeTab === 'gardens' && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg text-gray-800 mb-4">Taman Meditasi Virtual</h3>
          
          {virtualGardens.map((garden) => (
            <Card
              key={garden.id}
              className="cursor-pointer transition-all duration-200 hover:scale-105"
              onClick={() => onGardenSelect(garden)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{garden.name}</h4>
                    <p className="text-sm text-purple-600">{garden.region}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        Level {garden.level}/{garden.maxLevel}
                      </span>
                      <span className="text-xs text-gray-500">
                        {garden.unlockedFeatures.length} fitur terbuka
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl">
                    {garden.theme === 'bali' ? '🌺' : 
                     garden.theme === 'java' ? '🎋' : 
                     garden.theme === 'sumatra' ? '🌲' : '🏔️'}
                  </div>
                </div>
                
                {/* Experience Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Pengalaman</span>
                    <span>{garden.experience} / {garden.experience + garden.expToNextLevel}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      style={{ 
                        width: `${(garden.experience / (garden.experience + garden.expToNextLevel)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                
                {/* Featured Elements */}
                <div className="flex space-x-2">
                  {garden.unlockedFeatures.slice(0, 3).map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <span>{feature.icon}</span>
                      <span>{feature.name}</span>
                    </div>
                  ))}
                  {garden.availableFeatures.length > 0 && (
                    <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      +{garden.availableFeatures.length} tersedia
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};