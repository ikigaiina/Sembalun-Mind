import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Heart, 
  Sparkles, 
  TrendingUp,
  Clock,
  Tag,
  Edit3,
  Save,
  MoreHorizontal
} from 'lucide-react';
import { DashboardLayout } from '../components/ui/DashboardLayout';
import { ComprehensiveJournalPage } from '../components/journal/ComprehensiveJournalPage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useMoodTracker } from '../hooks/useMoodTracker';
import { getUserDisplayName } from '../utils/user-display';
import { useProgressScaling } from '../hooks/useProgressScaling';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  date: Date;
  lastEdited: Date;
  wordCount: number;
}

export const Journal: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, isGuest } = useAuth();
  const { currentMood } = useMoodTracker();
  
  // Enhanced progress with scaling capabilities for personalized insights
  const {
    scaledProgress,
    getNextMilestoneInfo,
    getScalingInsights,
    recommendations,
    adaptiveGoals,
    isLoading
  } = useProgressScaling();
  
  const [showComprehensive, setShowComprehensive] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Dynamic journal entries based on user status
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Initialize journal entries based on user progress and status
  React.useEffect(() => {
    if (isGuest || !userProfile || isLoading) {
      // Guest users and users without progress start with empty journal
      setJournalEntries([]);
      return;
    }

    // Only show sample entries if user has some meditation experience
    const userProgress = scaledProgress;
    const hasExperience = userProgress?.totalSessions > 0 || userProgress?.totalMinutes > 0;

    if (hasExperience && userProgress?.scalingLevel >= 2) {
      // Only show sample entries for users with some experience (scaling level 2+)
      setJournalEntries([
        {
          id: '1',
          title: 'First Meditation Reflection',
          content: 'Hari ini saya mencoba meditasi pertama kali. Pernapasan yang dalam membantu saya merasa lebih tenang...',
          mood: 'calm',
          tags: ['first-time', 'meditation', 'breathing'],
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          lastEdited: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          wordCount: 45
        }
      ]);
    } else {
      // New users start with empty journal to encourage first entry
      setJournalEntries([]);
    }
  }, [isGuest, userProfile, scaledProgress, isLoading]);

  const stats = {
    totalEntries: journalEntries.length,
    thisWeek: journalEntries.filter(entry => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return entry.date >= weekAgo;
    }).length,
    averageWordsPerEntry: journalEntries.length > 0 ? Math.round(
      journalEntries.reduce((acc, entry) => acc + entry.wordCount, 0) / journalEntries.length
    ) : 0,
    longestStreak: scaledProgress.longestStreak,
    scalingLevel: scaledProgress.scalingLevel,
    mindfulnessScore: scaledProgress.mindfulnessScore
  };

  const handleCreateEntry = () => {
    setShowNewEntryModal(true);
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const filteredEntries = journalEntries.filter(entry => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by date range
    const now = new Date();
    switch (selectedFilter) {
      case 'today':
        return entry.date.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entry.date >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entry.date >= monthAgo;
      default:
        return true;
    }
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-800">
                    Jurnal Mindfulness
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    Catat perjalanan spiritual dan wawasan batin Anda
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>{stats.totalEntries} entries</span>
                    <span>{stats.thisWeek} this week</span>
                    <span>{stats.averageWordsPerEntry} avg words</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComprehensive(!showComprehensive)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {showComprehensive ? 'Simple View' : 'Full Features'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateEntry}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Entry
                </Button>
              </div>
            </div>

            {/* Enhanced Stats Cards with Scaling Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </Card>
              <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
                <div className="text-sm text-gray-600">This Week</div>
              </Card>
              <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="text-2xl font-bold text-purple-600">{stats.scalingLevel}</div>
                <div className="text-sm text-gray-600">Scaling Level</div>
              </Card>
              <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="text-2xl font-bold text-orange-600">{stats.mindfulnessScore.toFixed(1)}/10</div>
                <div className="text-sm text-gray-600">Mindfulness Score</div>
              </Card>
            </div>

            {/* Smart Insights Panel */}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-semibold text-gray-800">
                      Smart Insights for Your Journal
                    </h3>
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Personalized Recommendations */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 text-sm">Writing Suggestions</h4>
                      {recommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="p-2 bg-blue-50 rounded-lg text-xs text-blue-800">
                          💡 {rec}
                        </div>
                      ))}
                    </div>

                    {/* Next Milestone */}
                    {(() => {
                      const milestone = getNextMilestoneInfo();
                      return (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700 text-sm">Next Goal</h4>
                          <div className="p-2 bg-green-50 rounded-lg">
                            <div className="text-xs text-green-800 mb-1">{milestone.description}</div>
                            <div className="w-full bg-green-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                            <div className="text-xs text-green-700 mt-1">{milestone.progress}% complete</div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Adaptive Goals */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700 text-sm">Today's Focus</h4>
                      <div className="p-2 bg-purple-50 rounded-lg text-xs">
                        <div className="text-purple-800 mb-1">
                          📝 Write for {adaptiveGoals.dailyMinutes} minutes today
                        </div>
                        <div className="text-purple-700">
                          {adaptiveGoals.monthlyChallenge}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {showComprehensive ? (
            <ComprehensiveJournalPage />
          ) : (
            <>
              {/* Search and Filter Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <Card className="flex-1 p-3">
                    <div className="flex items-center space-x-3">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search entries, tags, or content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </Card>
                  
                  <div className="flex items-center space-x-2">
                    {/* Filter Buttons */}
                    {['all', 'today', 'week', 'month'].map((filter) => (
                      <Button
                        key={filter}
                        variant={selectedFilter === filter ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedFilter(filter as any)}
                        className="capitalize"
                      >
                        {filter}
                      </Button>
                    ))}
                    
                    {/* View Mode Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                    >
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Today's Quick Entry */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Card className="p-6 bg-gradient-to-r from-amber-100 to-orange-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-semibold text-gray-800">
                      Quick Reflection
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date().toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-800 mb-1">Gratitude</h4>
                        <p className="text-xs text-gray-600">What are you grateful for today?</p>
                      </div>
                    </Card>
                    
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-800 mb-1">Insight</h4>
                        <p className="text-xs text-gray-600">Any new realizations?</p>
                      </div>
                    </Card>
                    
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-800 mb-1">Progress</h4>
                        <p className="text-xs text-gray-600">How did you grow today?</p>
                      </div>
                    </Card>
                  </div>
                </Card>
              </motion.div>

              {/* Journal Entries */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-heading font-semibold text-gray-800">
                    Recent Entries ({filteredEntries.length})
                  </h3>
                </div>

                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4, shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      >
                        <Card 
                          className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
                          onClick={() => handleViewEntry(entry)}
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-heading font-semibold text-gray-800 text-lg mb-2">
                                  {entry.title}
                                </h4>
                                <p className="text-gray-600 text-sm line-clamp-3">
                                  {entry.content}
                                </p>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{entry.date.toLocaleDateString('id-ID')}</span>
                                </span>
                                <span>{entry.wordCount} words</span>
                              </div>
                              
                              {entry.mood && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {entry.mood}
                                </span>
                              )}
                            </div>
                            
                            {entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {entry.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                                  >
                                    <Tag className="w-2 h-2 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card className="p-12 text-center">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        {searchQuery ? 'No matching entries found' : 'No entries yet'}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {searchQuery 
                          ? `Try adjusting your search terms or filters`
                          : 'Start your mindfulness journey by writing your first journal entry'
                        }
                      </p>
                      {!searchQuery && (
                        <Button onClick={handleCreateEntry}>
                          <Plus className="w-4 h-4 mr-2" />
                          Write Your First Entry
                        </Button>
                      )}
                    </Card>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* Bottom padding for navigation */}
          <div className="h-6"></div>
        </div>
      </div>
    </DashboardLayout>
  );
};