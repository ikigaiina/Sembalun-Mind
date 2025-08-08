import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, Calendar, Target, Award,
  Brain, Heart, Flame, Activity, Filter, Eye, EyeOff,
  Download, Share2, RefreshCw, Settings, Mountain, Trophy, BookOpen
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ComprehensiveProgressDashboard } from '../components/analytics/ComprehensiveProgressDashboard';
import { CulturalProgressTracker } from '../components/analytics/CulturalProgressTracker';
import { MeditationAnalytics } from '../components/analytics/MeditationAnalytics';
import { StreakTracker } from '../components/analytics/StreakTracker';
import { MoodPatternAnalysis } from '../components/analytics/MoodPatternAnalysis';
import { CulturalAchievementSystem } from '../components/achievements/CulturalAchievementSystem';
import { IndonesianWisdomCollection } from '../components/wisdom/IndonesianWisdomCollection';

interface Props {
  className?: string;
}

type AnalyticsView = 'overview' | 'meditation' | 'mood' | 'streaks' | 'cultural' | 'achievements' | 'wisdom';

export const Progress: React.FC<Props> = ({ className = '' }) => {
  const [currentView, setCurrentView] = useState<AnalyticsView>('overview');
  const [showAdvancedView, setShowAdvancedView] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  // Mock meditation session data - in real app would come from a context or hook
  const mockMeditationSessions = [
    { 
      id: '1', 
      type: 'guided' as const, 
      duration: 10, 
      completedAt: new Date(Date.now() - 86400000),
      rating: 5,
      mood: 'calm'
    },
    { 
      id: '2', 
      type: 'breathing' as const, 
      duration: 5, 
      completedAt: new Date(Date.now() - 172800000),
      rating: 4,
      mood: 'happy'
    },
    { 
      id: '3', 
      type: 'indonesian' as const, 
      duration: 15, 
      completedAt: new Date(Date.now() - 259200000),
      culturalElement: 'Sembalun Sunrise',
      rating: 5,
      mood: 'peaceful'
    }
  ];

  const navigationTabs = [
    { 
      id: 'overview', 
      label: 'Ringkasan', 
      icon: Activity, 
      description: 'Dashboard komprehensif' 
    },
    { 
      id: 'meditation', 
      label: 'Meditasi', 
      icon: Brain, 
      description: 'Analisis sesi meditasi' 
    },
    { 
      id: 'mood', 
      label: 'Pola Mood', 
      icon: Heart, 
      description: 'Analisis emosional mendalam' 
    },
    { 
      id: 'streaks', 
      label: 'Streak', 
      icon: Flame, 
      description: 'Konsistensi & pencapaian' 
    },
    { 
      id: 'cultural', 
      label: 'Budaya', 
      icon: Mountain, 
      description: 'Progress tradisi Indonesia' 
    },
    { 
      id: 'achievements', 
      label: 'Pencapaian', 
      icon: Trophy, 
      description: 'Sistem pencapaian budaya' 
    },
    { 
      id: 'wisdom', 
      label: 'Kebijaksanaan', 
      icon: BookOpen, 
      description: 'Koleksi wisdom Indonesia' 
    }
  ];

  const handleExportData = () => {
    // Mock export functionality
    console.log('Exporting progress data...');
    // In real app, this would generate and download a report
  };

  const handleShareProgress = () => {
    // Mock share functionality
    console.log('Sharing progress...');
    // In real app, this would generate a shareable link or image
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="p-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <h1 className="text-3xl font-heading font-bold mb-2">
                  Analisis Kemajuan
                </h1>
                <p className="text-indigo-100 text-lg">
                  Pantau perjalanan mindfulness dan pertumbuhan personal Anda
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedView(!showAdvancedView)}
                  className="text-white hover:bg-white/20 border border-white/30"
                >
                  {showAdvancedView ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showAdvancedView ? 'Sederhana' : 'Detail'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportData}
                  className="text-white hover:bg-white/20 border border-white/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareProgress}
                  className="text-white hover:bg-white/20 border border-white/30"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Bagikan
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-indigo-200">Sesi Bulan Ini</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-indigo-200">Hari Streak</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">4.2</div>
                <div className="text-sm text-indigo-200">Avg. Mood</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">75%</div>
                <div className="text-sm text-indigo-200">Konsistensi</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="p-2">
            <div className="flex flex-col sm:flex-row overflow-x-auto space-y-2 sm:space-y-0 sm:space-x-2">
              {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentView(tab.id as AnalyticsView)}
                    className={`
                      flex items-center justify-center space-x-2 px-4 py-3 rounded-lg 
                      text-sm font-medium transition-all duration-200 min-w-0 flex-1
                      ${currentView === tab.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Timeframe Selector (for applicable views) */}
        {(currentView === 'meditation' || currentView === 'overview') && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Periode Analisis:</span>
                <div className="flex rounded-lg overflow-hidden border border-gray-300">
                  {(['week', 'month', 'quarter'] as const).map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1 text-sm font-medium transition-colors ${
                        selectedTimeframe === timeframe
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {timeframe === 'week' ? '1M' :
                       timeframe === 'month' ? '1B' : '3B'}
                    </button>
                  ))}
                </div>
              </div>

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
          </motion.div>
        )}

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Overview Dashboard */}
            {currentView === 'overview' && (
              <motion.div variants={itemVariants}>
                <ComprehensiveProgressDashboard className="mb-6" />
              </motion.div>
            )}

            {/* Meditation Analytics */}
            {currentView === 'meditation' && (
              <motion.div variants={itemVariants}>
                <MeditationAnalytics 
                  sessions={mockMeditationSessions}
                  className="mb-6"
                />
              </motion.div>
            )}

            {/* Mood Pattern Analysis */}
            {currentView === 'mood' && (
              <motion.div variants={itemVariants}>
                <MoodPatternAnalysis className="mb-6" />
              </motion.div>
            )}

            {/* Streak Tracker */}
            {currentView === 'streaks' && (
              <motion.div variants={itemVariants}>
                <StreakTracker 
                  meditationSessions={mockMeditationSessions}
                  className="mb-6"
                />
              </motion.div>
            )}

            {/* Cultural Progress Tracker */}
            {currentView === 'cultural' && (
              <motion.div variants={itemVariants}>
                <CulturalProgressTracker 
                  className="mb-6"
                />
              </motion.div>
            )}

            {/* Cultural Achievement System */}
            {currentView === 'achievements' && (
              <motion.div variants={itemVariants}>
                <CulturalAchievementSystem 
                  className="mb-6"
                />
              </motion.div>
            )}

            {/* Indonesian Wisdom Collection */}
            {currentView === 'wisdom' && (
              <motion.div variants={itemVariants}>
                <IndonesianWisdomCollection 
                  className="mb-6"
                  onQuoteSelect={(quote) => {
                    console.log('Selected wisdom quote:', quote);
                    // Could trigger a modal or detailed view
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Quick Actions Footer */}
        <motion.div variants={itemVariants} className="mt-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Tingkatkan Praktik Anda
                </h3>
                <p className="text-gray-600 text-sm">
                  Gunakan insights ini untuk mengoptimalkan perjalanan mindfulness Anda
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Set Goal Baru
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Atur Reminder
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Mulai Meditasi
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bottom spacing for mobile navigation */}
        <div className="h-24 md:h-6"></div>
      </div>
    </motion.div>
  );
};