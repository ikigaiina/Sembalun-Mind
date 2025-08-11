import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Award, 
  TrendingUp, 
  Calendar, 
  Heart, 
  BookOpen, 
  BarChart3,
  Clock,
  Target,
  Zap,
  Star,
  Shield,
  Bell,
  Download,
  Share2,
  Edit2,
  ChevronRight
} from 'lucide-react';
import { DashboardLayout } from '../components/ui/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useOnboarding } from '../hooks/useOnboarding';
import { ProfilePictureUpload } from '../components/account/ProfilePictureUpload';
import { AccountSummary } from '../components/account/AccountSummary';
import { DefaultProfilePicture } from '../components/ui/DefaultProfilePicture';
import { ProfileSyncStatus } from '../components/ui/ProfileSyncStatus';
import { getUserDisplayName } from '../utils/user-display';
import { CairnIcon } from '../components/ui/CairnIcon';
import { getSyncedProgress } from '../utils/progressSync';
import { useProgressScaling } from '../hooks/useProgressScaling';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, isGuest, updateUserProfile } = useAuth();
  const { resetOnboarding, userPreferences } = useOnboarding();

  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements' | 'settings'>('overview');
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  const handleProfilePictureSuccess = async (url: string) => {
    try {
      await updateUserProfile({ photoURL: url });
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  // Enhanced progress with scaling capabilities
  const {
    scaledProgress,
    getNextMilestoneInfo,
    getScalingInsights,
    checkFeatureAccess,
    recommendations,
    adaptiveGoals,
    isLoading
  } = useProgressScaling();
  
  const stats = {
    ...scaledProgress,
    favoriteTime: userPreferences?.schedulePreferences?.[0] ?? 'morning'
  };

  // Real achievements based on actual user progress
  const achievements = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        id: 'first_session',
        name: 'Langkah Pertama',
        description: 'Menyelesaikan sesi meditasi pertama',
        earned: stats.totalSessions >= 1,
        earnedDate: stats.totalSessions >= 1 ? userProfile?.createdAt?.toISOString().split('T')[0] : undefined,
        icon: '🌱',
        rarity: 'common'
      },
      {
        id: 'three_day_streak',
        name: 'Konsisten 3 Hari',
        description: 'Bermeditasi selama 3 hari berturut-turut',
        earned: stats.currentStreak >= 3,
        progress: stats.currentStreak < 3 ? Math.round((stats.currentStreak / 3) * 100) : undefined,
        icon: '🔥',
        rarity: 'common'
      },
      {
        id: 'week_streak',
        name: 'Seminggu Penuh',
        description: 'Bermeditasi selama 7 hari berturut-turut',
        earned: stats.currentStreak >= 7,
        progress: stats.currentStreak < 7 ? Math.round((stats.currentStreak / 7) * 100) : undefined,
        icon: '⭐',
        rarity: 'rare'
      },
      {
        id: 'hour_total',
        name: 'Satu Jam Perjalanan',
        description: 'Total 60 menit waktu meditasi',
        earned: stats.totalMinutes >= 60,
        progress: stats.totalMinutes < 60 ? Math.round((stats.totalMinutes / 60) * 100) : undefined,
        icon: '⏰',
        rarity: 'common'
      },
      {
        id: 'ten_sessions',
        name: 'Dedikasi Konsisten',
        description: 'Menyelesaikan 10 sesi meditasi',
        earned: stats.totalSessions >= 10,
        progress: stats.totalSessions < 10 ? Math.round((stats.totalSessions / 10) * 100) : undefined,
        icon: '💯',
        rarity: 'rare'
      }
    ].filter(achievement => 
      achievement.earned || (achievement.progress && achievement.progress > 0)
    );
  }, [stats, userProfile?.createdAt]);

  const quickActions = [
    {
      title: 'Session History',
      description: 'View your meditation progress',
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      bgColor: 'bg-blue-100',
      action: () => navigate('/history')
    },
    {
      title: 'Mindfulness Journal',
      description: 'Record your thoughts and insights',
      icon: <BookOpen className="w-5 h-5 text-green-600" />,
      bgColor: 'bg-green-100',
      action: () => navigate('/journal')
    },
    {
      title: 'Progress Analytics',
      description: 'Detailed insights and trends',
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      bgColor: 'bg-purple-100',
      action: () => navigate('/analytics')
    },
    {
      title: 'Account Settings',
      description: 'Manage your preferences',
      icon: <Settings className="w-5 h-5 text-gray-600" />,
      bgColor: 'bg-gray-100',
      action: () => navigate('/settings')
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {!isGuest ? (
                    <div className="relative">
                      <ProfilePictureUpload
                        onSuccess={handleProfilePictureSuccess}
                        onError={(error) => console.error('Profile picture error:', error)}
                      />
                      <div className="absolute -bottom-2 -right-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {stats.level.charAt(0)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <DefaultProfilePicture size={80} />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-800">
                    {getUserDisplayName(user, userProfile, isGuest)}
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    {isGuest 
                      ? 'Exploring Sembalun as a guest' 
                      : `${stats.level} • ${stats.totalSessions} sessions completed`
                    }
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>{stats.currentStreak} day streak</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{stats.mindfulnessScore}/10 mindfulness score</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailedStats(!showDetailedStats)}
                  className="hidden sm:flex"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showDetailedStats ? 'Simple' : 'Detailed'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </Card>
              <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-2xl font-bold text-green-600">{stats.totalMinutes}</div>
                <div className="text-sm text-gray-600">Minutes Practiced</div>
              </Card>
              <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </Card>
              <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </Card>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex space-x-1 bg-white rounded-2xl p-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {activeTab === 'overview' && (
              <>
                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="text-lg font-heading font-semibold text-gray-800 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={action.action}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 text-left group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            {action.icon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{action.title}</div>
                            <div className="text-sm text-gray-500">{action.description}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </motion.button>
                    ))}
                  </div>
                </Card>

                {/* Profile Sync Status */}
                {!isGuest && <ProfileSyncStatus />}

                {/* Account Summary */}
                {!isGuest && <AccountSummary />}
              </>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* Enhanced Statistics with Scaling */}
                <Card className="p-6">
                  <h3 className="text-lg font-heading font-semibold text-gray-800 mb-6">Detailed Statistics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Session Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Sessions</span>
                          <span className="font-medium">{stats.totalSessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Average Length</span>
                          <span className="font-medium">{stats.averageSessionLength} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Completion Rate</span>
                          <span className="font-medium">{stats.completionRate}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Streak Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Streak</span>
                          <span className="font-medium text-orange-600">{stats.currentStreak} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Longest Streak</span>
                          <span className="font-medium">{stats.longestStreak} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Practice Days</span>
                          <span className="font-medium">{stats.totalDays} days</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Progress Overview</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Level</span>
                          <span className="font-medium text-purple-600">{stats.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Scaling Level</span>
                          <span className="font-medium text-blue-600">{stats.scalingLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Mindfulness Score</span>
                          <span className="font-medium">{stats.mindfulnessScore}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Favorite Time</span>
                          <span className="font-medium capitalize">{stats.favoriteTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Scaling Insights Card */}
                {!isLoading && (() => {
                  const insights = getScalingInsights();
                  return (
                    <Card className="p-6">
                      <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">Scaling Insights</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Performance Category</span>
                            <span className="font-medium text-purple-600">{insights.performanceCategory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Current Scaling Level</span>
                            <span className="font-medium text-blue-600">{insights.scalingLevel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Scaling Status</span>
                            <span className={`font-medium ${insights.isScaling ? 'text-green-600' : 'text-gray-600'}`}>
                              {insights.isScaling ? '🚀 Scaling' : '🌱 Growing'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-700 text-sm">Unlocked Features</h5>
                          {insights.unlockableFeatures.length > 0 ? (
                            <div className="space-y-1">
                              {insights.unlockableFeatures.map((feature, index) => (
                                <div key={index} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                  🔓 {feature}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">Keep practicing to unlock new features!</div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })()}

                {/* Next Milestone Card */}
                {!isLoading && (() => {
                  const milestone = getNextMilestoneInfo();
                  return (
                    <Card className="p-6">
                      <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">Next Milestone</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-700 capitalize">{milestone.type} Goal</span>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          milestone.isCloseToCompletion 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {milestone.progress}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            milestone.isCloseToCompletion 
                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                              : 'bg-gradient-to-r from-blue-400 to-blue-600'
                          }`}
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                    </Card>
                  );
                })()}

                {/* Adaptive Goals Card */}
                {!isLoading && (
                  <Card className="p-6">
                    <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">Adaptive Goals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{adaptiveGoals.dailyMinutes}m</div>
                        <div className="text-sm text-gray-600">Daily Target</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{adaptiveGoals.weeklyGoal}m</div>
                        <div className="text-sm text-gray-600">Weekly Goal</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-sm font-medium text-purple-600 mb-2">Monthly Challenge</div>
                          <div className="text-xs text-gray-700">{adaptiveGoals.monthlyChallenge}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Personalized Recommendations */}
                {!isLoading && (
                  <Card className="p-6">
                    <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">Personalized Recommendations</h3>
                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 flex items-start space-x-2">
                          <span className="text-lg">💡</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'achievements' && (
              <Card className="p-6">
                <h3 className="text-lg font-heading font-semibold text-gray-800 mb-6">Achievements</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        achievement.earned 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        {achievement.earned && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <h4 className={`font-medium mb-1 ${
                        achievement.earned ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        {achievement.name}
                      </h4>
                      
                      <p className={`text-sm mb-3 ${
                        achievement.earned ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>

                      {!achievement.earned && achievement.progress && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-green-600">
                          Earned on {new Date(achievement.date).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-heading font-semibold text-gray-800 mb-6">Account Settings</h3>
                  
                  <div className="space-y-4">
                    {[
                      { icon: Bell, title: 'Notifications', description: 'Manage your notification preferences', action: () => navigate('/settings#notifications') },
                      { icon: Shield, title: 'Privacy & Security', description: 'Control your privacy settings', action: () => navigate('/settings#privacy') },
                      { icon: Download, title: 'Export Data', description: 'Download your meditation data', action: () => console.log('Export data') },
                      { icon: Share2, title: 'Share Progress', description: 'Share your achievements', action: () => console.log('Share progress') },
                    ].map((setting, index) => (
                      <button
                        key={index}
                        onClick={setting.action}
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <setting.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{setting.title}</div>
                            <div className="text-sm text-gray-500">{setting.description}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </Card>

                {import.meta.env?.DEV && (
                  <Card className="p-6">
                    <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">Developer Options</h3>
                    <Button
                      variant="outline"
                      onClick={resetOnboarding}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Reset Onboarding
                    </Button>
                  </Card>
                )}
              </div>
            )}
          </motion.div>

          {/* Bottom padding for navigation */}
          <div className="h-6"></div>
        </div>
      </div>
    </DashboardLayout>
  );
};