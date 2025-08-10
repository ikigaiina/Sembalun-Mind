import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Settings, BarChart3, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '../components/ui';
import { PersonalizedDashboard } from '../components/ui/PersonalizedDashboard';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';
import { useOnboarding } from '../hooks/useOnboarding';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CairnIcon } from '../components/ui/CairnIcon';
import { getUserDisplayName } from '../utils/user-display';
import { getTimeBasedGreeting } from '../utils/recommendations';
import { getSyncedProgress } from '../utils/progressSync';
import { useProgressScaling } from '../hooks/useProgressScaling';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, isGuest } = useAuth();
  const {
    shouldShowOnboarding,
    completeOnboarding,
    hideOnboardingModal,
    userPreferences
  } = useOnboarding();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
  
  const stats = scaledProgress;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <CairnIcon 
                    size={64} 
                    progress={stats.currentStreak * 10} 
                    className="text-primary-600" 
                  />
                  {stats.currentStreak > 0 && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                      🔥{stats.currentStreak}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-800">
                    {getTimeBasedGreeting()}, {getUserDisplayName(user, userProfile, isGuest)}!
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    {stats.completedToday 
                      ? "Anda telah menyelesaikan praktik hari ini! ✨" 
                      : "Siap untuk memulai perjalanan mindfulness hari ini?"
                    }
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{currentTime.toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        day: 'numeric',
                        month: 'long'
                      })}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{currentTime.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailedView(!showDetailedView)}
                  className="hidden sm:flex"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showDetailedView ? 'Simple' : 'Detailed'}
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

            {/* Enhanced Stats Row with Scaling Info */}
            {showDetailedView && !isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 mb-6"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
                    <div className="text-sm text-gray-600">Total Sessions</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalMinutes}</div>
                    <div className="text-sm text-gray-600">Minutes Practiced</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.scalingLevel}</div>
                    <div className="text-sm text-gray-600">Scaling Level</div>
                  </Card>
                </div>

                {/* Next Milestone Card */}
                {(() => {
                  const milestone = getNextMilestoneInfo();
                  return (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">Next Milestone</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          milestone.isCloseToCompletion 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {milestone.progress}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{milestone.description}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
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
                <Card className="p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Today's Adaptive Goals</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-600">{adaptiveGoals.dailyMinutes}m</div>
                      <div className="text-gray-600">Daily Target</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-600">{adaptiveGoals.weeklyGoal}m</div>
                      <div className="text-gray-600">Weekly Goal</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <div className="font-bold text-purple-600 text-xs">{adaptiveGoals.monthlyChallenge}</div>
                      <div className="text-gray-600">Monthly Challenge</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <PersonalizedDashboard />
            </div>

            {/* Sidebar with Quick Actions */}
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => navigate('/breathing')}
                  >
                    🌬️ Quick Breathing
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/meditation')}
                  >
                    🧘‍♀️ Start Meditation
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/journal')}
                  >
                    📝 Open Journal
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/explore')}
                  >
                    🔍 Explore Content
                  </Button>
                </div>
              </Card>

              {showDetailedView && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="p-4">
                    <h3 className="text-lg font-heading font-semibold text-gray-800 mb-3">
                      Today's Progress
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Morning Practice</span>
                        <span className={`text-sm font-medium ${
                          stats.completedToday ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {stats.completedToday ? '✅ Done' : '⏰ Pending'}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Smart Recommendations */}
                  <Card className="p-4">
                    <h3 className="text-lg font-heading font-semibold text-gray-800 mb-3">
                      Smart Recommendations
                    </h3>
                    <div className="space-y-2">
                      {recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="p-2 bg-blue-50 rounded-lg text-sm text-blue-800">
                          💡 {rec}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Scaling Insights */}
                  {(() => {
                    const insights = getScalingInsights();
                    return (
                      <Card className="p-4">
                        <h3 className="text-lg font-heading font-semibold text-gray-800 mb-3">
                          Progress Insights
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium text-purple-600">{insights.performanceCategory}</span>
                          </div>
                          {insights.unlockableFeatures.length > 0 && (
                            <div>
                              <span className="text-gray-600 block mb-1">Available Features:</span>
                              {insights.unlockableFeatures.slice(0, 2).map((feature, index) => (
                                <div key={index} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded mb-1">
                                  🔓 {feature}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })()}

                  <Card className="p-4">
                    <h3 className="text-lg font-heading font-semibold text-gray-800 mb-3">
                      Quick Links
                    </h3>
                    <div className="space-y-2">
                      {[
                        { name: 'Analytics', path: '/analytics', icon: '📊', requiresLevel: 3 },
                        { name: 'Community', path: '/community', icon: '👥', requiresLevel: 7 },
                        { name: 'Content Library', path: '/content-library', icon: '📚', requiresLevel: 0 }
                      ].map(({ name, path, icon, requiresLevel }) => {
                        const hasAccess = stats.scalingLevel >= requiresLevel;
                        return (
                          <button
                            key={name}
                            onClick={() => hasAccess ? navigate(path) : null}
                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left ${
                              hasAccess 
                                ? 'hover:bg-gray-50' 
                                : 'opacity-50 cursor-not-allowed bg-gray-50'
                            }`}
                            title={!hasAccess ? `Requires scaling level ${requiresLevel}` : ''}
                          >
                            <div className="flex items-center space-x-3">
                              <span>{icon}</span>
                              <span className="text-sm font-medium text-gray-700">{name}</span>
                              {!hasAccess && <span className="text-xs text-gray-500">🔒</span>}
                            </div>
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom padding for navigation */}
          <div className="h-6"></div>
        </div>
      </div>
      
      <OnboardingModal
        isOpen={shouldShowOnboarding}
        onClose={hideOnboardingModal}
        onComplete={completeOnboarding}
        showWelcomePrompt={true}
      />
    </DashboardLayout>
  );
};