import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  Crown, 
  Medal, 
  Gift, 
  Zap,
  Heart,
  Brain,
  Mountain,
  Sparkles,
  Users,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'meditation' | 'social' | 'learning' | 'wellness' | 'special';
  points: number;
  badge?: Badge;
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
  createdAt: Date;
}

interface UserLevel {
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
  perks: string[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  reward: {
    xp: number;
    coins: number;
    badges?: string[];
  };
  progress: number;
  maxProgress: number;
  expiresAt: Date;
  isActive: boolean;
  participants: number;
}

export const GamificationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'challenges' | 'leaderboard'>('overview');
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 12,
    xp: 2450,
    xpToNext: 550,
    title: 'Mindful Warrior',
    perks: ['2x XP on weekends', 'Access to exclusive content', 'Priority community support']
  });

  const badges: Badge[] = [
    {
      id: 'first_meditation',
      name: 'First Step',
      description: 'Complete your first meditation session',
      icon: <Star className="w-5 h-5" />,
      color: 'from-yellow-400 to-orange-500',
      rarity: 'common',
      requirement: 'Complete 1 meditation session',
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-15'),
      xpReward: 100
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Maintain a 30-day meditation streak',
      icon: <Flame className="w-5 h-5" />,
      color: 'from-red-400 to-pink-500',
      rarity: 'rare',
      requirement: 'Meditate for 30 consecutive days',
      progress: 23,
      maxProgress: 30,
      isUnlocked: false,
      xpReward: 500
    },
    {
      id: 'community_helper',
      name: 'Community Helper',
      description: 'Help 100 community members',
      icon: <Heart className="w-5 h-5" />,
      color: 'from-pink-400 to-rose-500',
      rarity: 'epic',
      requirement: 'Provide support to 100 community members',
      progress: 67,
      maxProgress: 100,
      isUnlocked: false,
      xpReward: 750
    },
    {
      id: 'meditation_master',
      name: 'Meditation Master',
      description: 'Complete 1000 meditation sessions',
      icon: <Crown className="w-5 h-5" />,
      color: 'from-purple-400 to-indigo-600',
      rarity: 'legendary',
      requirement: 'Complete 1000 meditation sessions',
      progress: 234,
      maxProgress: 1000,
      isUnlocked: false,
      xpReward: 2000
    },
    {
      id: 'cultural_explorer',
      name: 'Cultural Explorer',
      description: 'Experience all Indonesian cultural meditations',
      icon: <Mountain className="w-5 h-5" />,
      color: 'from-green-400 to-teal-500',
      rarity: 'rare',
      requirement: 'Complete all 6 cultural meditation styles',
      progress: 4,
      maxProgress: 6,
      isUnlocked: false,
      xpReward: 600
    },
    {
      id: 'siy_graduate',
      name: 'SIY Graduate',
      description: 'Master the Search Inside Yourself program',
      icon: <Brain className="w-5 h-5" />,
      color: 'from-blue-400 to-cyan-500',
      rarity: 'epic',
      requirement: 'Complete all SIY courses with 80% score',
      progress: 3,
      maxProgress: 5,
      isUnlocked: false,
      xpReward: 1000
    }
  ];

  const challenges: Challenge[] = [
    {
      id: 'daily_mindfulness',
      title: 'Daily Mindfulness',
      description: 'Complete a 10-minute meditation session today',
      type: 'daily',
      difficulty: 'easy',
      reward: { xp: 50, coins: 10 },
      progress: 0,
      maxProgress: 1,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true,
      participants: 1247
    },
    {
      id: 'weekly_consistency',
      title: 'Weekly Consistency',
      description: 'Meditate for 5 days this week',
      type: 'weekly',
      difficulty: 'medium',
      reward: { xp: 200, coins: 50, badges: ['consistent_practitioner'] },
      progress: 3,
      maxProgress: 5,
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      isActive: true,
      participants: 892
    },
    {
      id: 'monthly_explorer',
      title: 'Cultural Explorer',
      description: 'Try 3 different cultural meditation styles this month',
      type: 'monthly',
      difficulty: 'hard',
      reward: { xp: 500, coins: 150, badges: ['cultural_explorer'] },
      progress: 1,
      maxProgress: 3,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isActive: true,
      participants: 456
    },
    {
      id: 'ramadan_special',
      title: 'Ramadan Reflection',
      description: 'Complete 20 spiritual meditation sessions during Ramadan',
      type: 'seasonal',
      difficulty: 'expert',
      reward: { xp: 1000, coins: 300, badges: ['ramadan_devotee'] },
      progress: 8,
      maxProgress: 20,
      expiresAt: new Date('2024-04-10'),
      isActive: true,
      participants: 2134
    }
  ];

  const achievements: Achievement[] = [
    {
      id: 'first_week',
      title: 'First Week Complete',
      description: 'Successfully completed your first week of meditation',
      category: 'meditation',
      points: 100,
      isCompleted: true,
      progress: 7,
      maxProgress: 7,
      createdAt: new Date('2024-01-22')
    },
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Join 5 community meditation circles',
      category: 'social',
      points: 250,
      isCompleted: false,
      progress: 3,
      maxProgress: 5,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'knowledge_seeker',
      title: 'Knowledge Seeker',
      description: 'Complete 10 educational courses',
      category: 'learning',
      points: 500,
      isCompleted: false,
      progress: 4,
      maxProgress: 10,
      createdAt: new Date('2024-02-01')
    }
  ];

  const leaderboardData = [
    { rank: 1, name: 'Sari Mindful Master', level: 25, xp: 12450, streak: 156, avatar: '👑' },
    { rank: 2, name: 'Budi Zen Warrior', level: 23, xp: 11230, streak: 134, avatar: '🧘‍♂️' },
    { rank: 3, name: 'Indira Peace Seeker', level: 22, xp: 10890, streak: 128, avatar: '🌸' },
    { rank: 4, name: 'Ahmad Spiritual Guide', level: 21, xp: 9876, streak: 115, avatar: '🕌' },
    { rank: 5, name: 'Maya Lotus Bloom', level: 20, xp: 9234, streak: 98, avatar: '🪷' },
    { rank: 15, name: 'You', level: userLevel.level, xp: userLevel.xp, streak: 23, avatar: '⭐' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return '☀️';
      case 'weekly': return '📅';
      case 'monthly': return '🗓️';
      case 'seasonal': return '🌟';
      default: return '⚡';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gamification & Rewards
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your progress, earn badges, complete challenges, and compete with the community
          </p>
        </div>

        {/* User Level Card */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Level {userLevel.level}</h2>
                <p className="text-purple-100 text-lg">{userLevel.title}</p>
                <p className="text-purple-200 text-sm">{userLevel.xp} XP • {userLevel.xpToNext} to next level</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-2">{userLevel.xp.toLocaleString()}</div>
              <div className="text-purple-200 text-sm">Total Experience</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${(userLevel.xp / (userLevel.xp + userLevel.xpToNext)) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Current Perks:</h4>
            <div className="flex flex-wrap gap-2">
              {userLevel.perks.map((perk, index) => (
                <span key={index} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {perk}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { key: 'overview', label: 'Overview', icon: Trophy },
            { key: 'badges', label: 'Badges', icon: Medal },
            { key: 'challenges', label: 'Challenges', icon: Target },
            { key: 'leaderboard', label: 'Leaderboard', icon: Crown }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === key 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">23</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50">
                <Medal className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">Badges Earned</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-indigo-50">
                <Target className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">8</div>
                <div className="text-sm text-gray-600">Challenges Completed</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-yellow-50 to-amber-50">
                <TrendingUp className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">15th</div>
                <div className="text-sm text-gray-600">Leaderboard Rank</div>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Achievements</h3>
              <div className="space-y-4">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.isCompleted ? 'bg-green-100' : 'bg-gray-200'
                      }`}>
                        {achievement.isCompleted ? '✅' : '⏳'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{achievement.points}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Badge Collection</h2>
              <div className="text-gray-600">
                {badges.filter(b => b.isUnlocked).length} of {badges.length} unlocked
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <Card key={badge.id} className={`p-6 ${getRarityColor(badge.rarity)} ${!badge.isUnlocked ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${badge.color} text-white`}>
                      {badge.icon}
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        badge.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-800' :
                        badge.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
                        badge.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {badge.rarity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{badge.progress}/{badge.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{badge.requirement}</span>
                      <span className="text-sm font-semibold text-purple-600">+{badge.xpReward} XP</span>
                    </div>
                  </div>
                  {badge.unlockedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-xs text-green-600">
                        ✅ Unlocked {badge.unlockedAt.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {['daily', 'weekly', 'monthly', 'seasonal'].map(type => {
              const typeChallenges = challenges.filter(c => c.type === type);
              if (typeChallenges.length === 0) return null;
              
              return (
                <div key={type}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">{getChallengeTypeIcon(type)}</span>
                    {type.charAt(0).toUpperCase() + type.slice(1)} Challenges
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {typeChallenges.map((challenge) => (
                      <Card key={challenge.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">{challenge.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{challenge.progress}/{challenge.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <div className="text-purple-600 font-semibold">Rewards:</div>
                              <div className="text-gray-600">
                                {challenge.reward.xp} XP • {challenge.reward.coins} coins
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {challenge.participants.toLocaleString()} participants
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Expires: {challenge.expiresAt.toLocaleDateString()}
                          </div>
                        </div>
                        
                        <Button 
                          variant="primary" 
                          className="w-full mt-4"
                          disabled={challenge.progress >= challenge.maxProgress}
                        >
                          {challenge.progress >= challenge.maxProgress ? 'Completed' : 'Start Challenge'}
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Leaderboard</h2>
            <Card className="overflow-hidden">
              <div className="divide-y divide-gray-200">
                {leaderboardData.map((user, index) => (
                  <div key={user.rank} className={`p-6 flex items-center justify-between ${
                    user.name === 'You' ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.rank <= 3 ? (
                          user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'
                        ) : (
                          user.rank
                        )}
                      </div>
                      <div className="text-2xl">{user.avatar}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-600">Level {user.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{user.xp.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">XP</div>
                      <div className="text-xs text-orange-600 flex items-center">
                        <Flame className="w-3 h-3 mr-1" />
                        {user.streak} day streak
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};