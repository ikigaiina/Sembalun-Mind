import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Clock, User, Heart, Target, Moon, Brain, Sparkles, Zap } from 'lucide-react';
import { 
  Card,
  Button,
  DashboardLayout,
  CairnIcon,
  BreathingCard,
  MoodSelector,
  MoodHistory
} from '../components/ui';
import { CourseCard, type Course } from '../components/ui/CourseCard';
import { SessionLibrary, type Session } from '../components/ui/SessionLibrary';
import type { MoodType } from '../types/mood';
import { 
  getPersonalizedRecommendations, 
  getTimeBasedGreeting, 
  getTimeBasedRecommendation
} from '../utils/recommendations';
import { useAuth } from '../hooks/useAuth';
import { getUserDisplayName } from '../utils/user-display';
import { usePersonalization } from '../contexts/PersonalizationContext';

interface FilterOptions {
  duration: 'all' | 'short' | 'medium' | 'long';
  difficulty: 'all' | 'Pemula' | 'Menengah' | 'Lanjutan';
  type: 'all' | 'meditation' | 'breathing' | 'visualization' | 'body-scan';
  category: 'all' | string;
}

const SAMPLE_COURSES: Course[] = [
  {
    id: '1',
    title: 'Ketenangan Hutan',
    description: 'Meditasi dengan suara alam untuk mengatasi stres sehari-hari',
    duration: '12 menit',
    sessionCount: 7,
    difficulty: 'Pemula',
    category: 'Stres',
    progress: 60,
    thumbnail: '🌲',
    isStarted: true
  },
  {
    id: '2',
    title: 'Tidur Nyenyak Bersama Bulan',
    description: 'Panduan tidur dengan visualisasi malam yang tenang',
    duration: '25 menit',
    sessionCount: 5,
    difficulty: 'Pemula',
    category: 'Tidur',
    progress: 0,
    thumbnail: '🌙',
    isStarted: false
  },
  {
    id: '3',
    title: 'Fokus Seperti Gunung',
    description: 'Meningkatkan konsentrasi dengan meditasi mindfulness',
    duration: '15 menit',
    sessionCount: 10,
    difficulty: 'Menengah',
    category: 'Fokus',
    progress: 30,
    thumbnail: '⛰️',
    isStarted: true
  }
];

const SAMPLE_SESSIONS: Session[] = [
  {
    id: '1',
    title: 'Napas Pagi 5 Menit',
    description: 'Mulai hari dengan teknik pernapasan yang menenangkan',
    duration: '5 menit',
    category: 'Jeda Pagi',
    type: 'breathing',
    difficulty: 'Pemula',
    isCompleted: false,
    isFavorite: true,
    thumbnail: '🌅',
    instructor: 'Ibu Sari Dewi'
  },
  {
    id: '2',
    title: 'Reset Tengah Hari',
    description: 'Segarkan pikiran di tengah aktivitas padat',
    duration: '3 menit',
    category: 'Napas di Tengah Hiruk',
    type: 'meditation',
    difficulty: 'Pemula',
    isCompleted: true,
    isFavorite: false,
    thumbnail: '🌊',
    instructor: 'Andi Wijaya'
  },
  {
    id: '3',
    title: 'Refleksi Sore',
    description: 'Merenung dan menghargai pencapaian hari ini',
    duration: '8 menit',
    category: 'Pulang ke Diri',
    type: 'meditation',
    difficulty: 'Menengah',
    isCompleted: false,
    isFavorite: false,
    thumbnail: '🌸',
    instructor: 'Sari Indah'
  },
  {
    id: '4',
    title: 'Persiapan Tidur',
    description: 'Relaksasi mendalam untuk tidur yang nyenyak',
    duration: '10 menit',
    category: 'Tidur yang Dalam',
    type: 'visualization',
    difficulty: 'Pemula',
    isCompleted: false,
    isFavorite: true,
    thumbnail: '🌙',
    instructor: 'Dewi Lestari'
  },
  {
    id: '5',
    title: 'Body Scan Pagi',
    description: 'Menyadari tubuh dan melepaskan ketegangan',
    duration: '12 menit',
    category: 'Jeda Pagi',
    type: 'body-scan',
    difficulty: 'Menengah',
    isCompleted: true,
    isFavorite: false,
    thumbnail: '🌿',
    instructor: 'Raka Pratama'
  },
  {
    id: '6',
    title: 'Napas Saat Stres',
    description: 'Teknik cepat untuk mengatasi kecemasan',
    duration: '4 menit',
    category: 'Napas di Tengah Hiruk',
    type: 'breathing',
    difficulty: 'Pemula',
    isCompleted: false,
    isFavorite: true,
    thumbnail: '💨',
    instructor: 'Nina Kartika'
  }
];

const CATEGORIES = [
  { name: 'Tidur', icon: '😴', color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Fokus', icon: '🎯', color: 'bg-blue-100 text-blue-800' },
  { name: 'Pemula', icon: '🌱', color: 'bg-green-100 text-green-800' },
  { name: 'Kecemasan', icon: '🌸', color: 'bg-pink-100 text-pink-800' },
  { name: 'Stres', icon: '🌊', color: 'bg-cyan-100 text-cyan-800' },
  { name: 'Kebahagiaan', icon: '☀️', color: 'bg-yellow-100 text-yellow-800' }
];

const FilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}> = ({ isOpen, onClose, filters, onFiltersChange }) => {
  if (!isOpen) return null;

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <Card className="w-full max-w-md mx-4 mb-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading text-gray-800">Filter & Urutkan</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Duration Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durasi</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'Semua' },
                { value: 'short', label: '< 5 menit' },
                { value: 'medium', label: '5-15 menit' },
                { value: 'long', label: '> 15 menit' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('duration', option.value)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    filters.duration === option.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Kesulitan</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'Semua' },
                { value: 'Pemula', label: 'Pemula' },
                { value: 'Menengah', label: 'Menengah' },
                { value: 'Lanjutan', label: 'Lanjutan' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('difficulty', option.value)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    filters.difficulty === option.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Sesi</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'Semua' },
                { value: 'meditation', label: 'Meditasi' },
                { value: 'breathing', label: 'Pernapasan' },
                { value: 'visualization', label: 'Visualisasi' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('type', option.value)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    filters.type === option.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button 
            variant="control" 
            onClick={() => onFiltersChange({ duration: 'all', difficulty: 'all', type: 'all', category: 'all' })}
            className="flex-1"
          >
            Reset
          </Button>
          <Button 
            onClick={onClose} 
            variant="breathing"
            className="flex-1"
          >
            Terapkan
          </Button>
        </div>
      </Card>
    </div>
  );
};

export const Explore: React.FC = () => {
  const { user, userProfile, isGuest } = useAuth();
  const navigate = useNavigate();
  
  // Personalization hooks
  const { 
    personalization, 
    getPersonalizedRecommendations, 
    getPersonalizedQuote,
    getPersonalizedGreeting,
    isPersonalized 
  } = usePersonalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'sessions'>('courses');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType>('happy');
  const [showMoodHistory, setShowMoodHistory] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    duration: 'all',
    difficulty: 'all',
    type: 'all',
    category: 'all'
  });

  // Helper function to parse duration in minutes
  const parseDurationMinutes = (duration: string): number => {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    return SAMPLE_COURSES.filter(course => {
      // Text search
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          course.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Difficulty filter
      if (filters.difficulty !== 'all' && course.difficulty !== filters.difficulty) {
        return false;
      }

      // Duration filter
      if (filters.duration !== 'all') {
        const minutes = parseDurationMinutes(course.duration);
        switch (filters.duration) {
          case 'short':
            if (minutes >= 5) return false;
            break;
          case 'medium':
            if (minutes < 5 || minutes > 15) return false;
            break;
          case 'long':
            if (minutes <= 15) return false;
            break;
        }
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Filter sessions based on search and filters
  const filteredSessions = useMemo(() => {
    return SAMPLE_SESSIONS.filter(session => {
      // Text search
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          session.title.toLowerCase().includes(searchLower) ||
          session.description.toLowerCase().includes(searchLower) ||
          session.category.toLowerCase().includes(searchLower) ||
          session.instructor?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.type !== 'all' && session.type !== filters.type) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty !== 'all' && session.difficulty !== filters.difficulty) {
        return false;
      }

      // Duration filter
      if (filters.duration !== 'all') {
        const minutes = parseDurationMinutes(session.duration);
        switch (filters.duration) {
          case 'short':
            if (minutes >= 5) return false;
            break;
          case 'medium':
            if (minutes < 5 || minutes > 15) return false;
            break;
          case 'long':
            if (minutes <= 15) return false;
            break;
        }
      }

      return true;
    });
  }, [searchQuery, filters]);

  const hasActiveFilters = Object.values(filters).some(filter => filter !== 'all');

  // Get personalized recommendations
  const recommendations = useMemo(() => {
    if (isPersonalized) {
      const personalizedRecs = getPersonalizedRecommendations();
      return {
        recommendedCourses: SAMPLE_COURSES.filter(course => 
          personalizedRecs?.some(rec => rec.type === course.category.toLowerCase())
        ) || [],
        recommendedSessions: SAMPLE_SESSIONS.filter(session =>
          personalizedRecs?.some(rec => rec.type === session.type)
        ) || [],
        dailyRecommendation: personalizedRecs?.[0] || null
      };
    }
    
    // Create a user profile object for recommendations if user is logged in but not personalized
    if (userProfile) {
      const userRecs = getPersonalizedRecommendations(SAMPLE_COURSES, SAMPLE_SESSIONS, userProfile);
      return userRecs || { recommendedCourses: [], recommendedSessions: [], dailyRecommendation: null };
    }
    // For guests, return empty recommendations
    return { recommendedCourses: [], recommendedSessions: [], dailyRecommendation: null };
  }, [userProfile, isPersonalized, getPersonalizedRecommendations]);

  // Personalized content based on user goals
  const personalizedContent = useMemo(() => {
    if (!isPersonalized || !personalization?.goal) {
      return {
        greeting: "Jelajahi dunia mindfulness",
        subtitle: "Temukan berbagai praktik yang sesuai dengan kebutuhanmu",
        goalFilter: null
      };
    }

    const goalConfig = {
      stress: {
        greeting: "Temukan Ketenangan",
        subtitle: "Praktik khusus untuk mengelola stres dan menemukan kedamaian",
        filter: 'Stres',
        icon: Zap
      },
      focus: {
        greeting: "Tingkatkan Fokus",
        subtitle: "Latihan konsentrasi dan kejernihan pikiran",
        filter: 'Fokus',
        icon: Target
      },
      sleep: {
        greeting: "Tidur Lebih Baik",
        subtitle: "Ritual dan praktik untuk istirahat berkualitas",
        filter: 'Tidur',
        icon: Moon
      },
      curious: {
        greeting: "Eksplorasi Mindfulness",
        subtitle: "Jelajahi berbagai teknik meditasi dan kesadaran",
        filter: null,
        icon: Sparkles
      }
    };

    return goalConfig[personalization.goal];
  }, [personalization, isPersonalized]);

  const handleSessionClick = (session: Session) => {
    // Navigate to appropriate page based on session type
    switch (session.type) {
      case 'breathing':
        navigate('/breathing', { 
          state: { 
            sessionId: session.id,
            sessionTitle: session.title,
            sessionDuration: session.duration,
            sessionDescription: session.description
          } 
        });
        break;
      case 'meditation':
      case 'visualization':
      case 'body-scan':
        navigate('/meditation', { 
          state: { 
            session: {
              id: session.id,
              title: session.title,
              description: session.description,
              duration: parseInt(session.duration) || 10, // Parse duration string to number
              category: session.type as 'breathing' | 'mindfulness' | 'sleep' | 'focus',
              difficulty: session.difficulty.toLowerCase() as 'beginner' | 'intermediate' | 'advanced'
            }
          } 
        });
        break;
      default:
        // Fallback to meditation page
        navigate('/meditation', { 
          state: { 
            session: {
              id: session.id,
              title: session.title,
              description: session.description,
              duration: parseInt(session.duration) || 10, // Parse duration string to number
              category: session.type as 'breathing' | 'mindfulness' | 'sleep' | 'focus',
              difficulty: session.difficulty.toLowerCase() as 'beginner' | 'intermediate' | 'advanced'
            }
          } 
        });
    }
  };

  const handleCourseClick = (course: Course) => {
    // Navigate to meditation page for courses
    navigate('/meditation', { 
      state: { 
        session: {
          id: course.id,
          title: course.title,
          description: course.description,
          duration: parseInt(course.duration) || 15, // Parse duration string to number
          category: 'mindfulness' as const, // Default category for courses
          difficulty: course.difficulty.toLowerCase() as 'beginner' | 'intermediate' | 'advanced'
        }
      } 
    });
  };

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    console.log('Mood selected:', mood);
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
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-meditation-zen-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          
          {/* Header with Sembalun branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center items-center mb-4">
              <CairnIcon size={48} progress={85} className="text-primary-600 mr-3" />
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-800">
                  {getTimeBasedGreeting()}, {getUserDisplayName(user, userProfile, isGuest)}! 👋
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {getTimeBasedRecommendation()}
                </p>
              </div>
            </div>

            {/* User progress indicators */}
            <div className="flex items-center justify-center space-x-4 sm:space-x-6 text-xs">
              <div className="flex items-center space-x-1">
                <span>🔥</span>
                <span className="text-primary-600 font-medium">
                  {userProfile?.progress?.streak || userProfile?.currentStreak || 0} hari
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⏱️</span>
                <span className="text-primary-600 font-medium">
                  {userProfile?.progress?.totalMinutes || userProfile?.totalMeditationMinutes || 0} menit
                </span>
              </div>
            </div>
          </motion.div>

          {/* Mood Selector Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <Card className="p-4">
              <h2 className="text-base font-heading font-semibold text-gray-800 mb-3 text-center">
                Bagaimana perasaan Anda hari ini?
              </h2>
              <MoodSelector
                selectedMood={selectedMood}
                onMoodSelect={handleMoodSelect}
                showLabels={false}
                className="mb-3"
              />
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoodHistory(!showMoodHistory)}
                  className="text-primary-600 hover:bg-primary-50 text-xs"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {showMoodHistory ? 'Sembunyikan' : 'Lihat'} Riwayat
                </Button>
              </div>
            </Card>
          </motion.section>

          {/* Mood History Section */}
          <AnimatePresence>
            {showMoodHistory && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <MoodHistory
                  showStats={true}
                  showChart={false}
                  showCalendar={true}
                />
              </motion.section>
            )}
          </AnimatePresence>

          {/* Search and Filter Bar */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <div className="flex gap-3">
              <Card className="flex-1 p-3">
                <div className="flex items-center space-x-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari sesi, topik, atau pemandu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 text-sm"
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
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowFilterModal(true)}
                className={`px-4 ${hasActiveFilters ? 'border-primary-300 text-primary-600 bg-primary-50' : ''}`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filter
                {hasActiveFilters && <span className="w-2 h-2 bg-primary-500 rounded-full ml-1" />}
              </Button>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            variants={itemVariants}
            className="flex space-x-1 bg-white rounded-2xl p-1 mb-6 shadow-sm"
          >
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'courses'
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Kursus ({filteredCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'sessions'
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sesi ({filteredSessions.length})
            </button>
          </motion.div>

          {/* Search Results Indicator */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-gray-600 mb-4 text-center"
            >
              Hasil untuk "<span className="font-medium text-primary-600">{searchQuery}</span>"
            </motion.div>
          )}

          {/* Quick Practice Section (only show if no search/filters) */}
          {!searchQuery && !hasActiveFilters && (
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              <h2 className="text-lg font-heading font-semibold text-gray-800 mb-4 text-center">
                Praktik Cepat
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BreathingCard
                  title="Napas 5 Menit"
                  description="Teknik pernapasan cepat untuk menenangkan pikiran"
                  duration={3000}
                  isActive={false}
                  onClick={() => navigate('/breathing')}
                />
                <BreathingCard
                  title="Reset Energi"
                  description="Bangkitkan semangat dengan latihan pernapasan energi"
                  duration={2000}
                  isActive={false}
                  onClick={() => navigate('/meditation')}
                />
              </div>
            </motion.section>
          )}

          {/* Daily Recommendation (only show if no search/filters) */}
      {!searchQuery && !hasActiveFilters && recommendations?.dailyRecommendation && (
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">⭐</div>
              <div>
                <h2 className="text-lg font-heading text-gray-800">Rekomendasi Hari Ini</h2>
                <p className="text-sm text-gray-600">Dipilih khusus untukmu</p>
              </div>
            </div>
            
            {'sessionCount' in (recommendations?.dailyRecommendation || {}) ? (
              <CourseCard 
                course={recommendations?.dailyRecommendation as Course}
                onClick={() => handleCourseClick(recommendations?.dailyRecommendation as Course)}
                variant="compact"
              />
            ) : (
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/50"
                onClick={() => handleSessionClick(recommendations?.dailyRecommendation as Session)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center text-2xl">
                    {(recommendations?.dailyRecommendation as Session)?.thumbnail}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-gray-800 mb-1">
                      {recommendations?.dailyRecommendation?.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {(recommendations?.dailyRecommendation as Session)?.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{recommendations?.dailyRecommendation?.duration}</span>
                      <span className="text-primary font-medium">
                        {(recommendations?.dailyRecommendation as Session)?.category}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </Card>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'courses' ? (
        <div className="space-y-6">
          {/* Recommended Courses (only show if no search/filters) */}
          {!searchQuery && !hasActiveFilters && recommendations?.recommendedCourses?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-heading text-gray-800 mb-4">
                <span className="mr-2">🎯</span>
                Direkomendasikan Untukmu
              </h2>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {recommendations?.recommendedCourses?.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onClick={() => handleCourseClick(course)}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Featured Courses (only show if no search/filters and no recommendations) */}
          {!searchQuery && !hasActiveFilters && (!recommendations?.recommendedCourses || recommendations.recommendedCourses.length === 0) && (
            <div className="mb-6">
              <h2 className="text-lg font-heading text-gray-800 mb-4">Kursus Unggulan</h2>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {SAMPLE_COURSES.slice(0, 3).map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onClick={() => handleCourseClick(course)}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Courses */}
          <div className="space-y-4">
            <h2 className="text-lg font-heading text-gray-800">
              {searchQuery || hasActiveFilters ? 'Hasil Pencarian' : 'Semua Kursus'}
            </h2>
            <div className="grid gap-4">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onClick={() => handleCourseClick(course)}
                  />
                ))
              ) : (
                <Card className="text-center py-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-600">
                    {searchQuery 
                      ? `Tidak ada kursus yang cocok dengan "${searchQuery}"`
                      : 'Tidak ada kursus yang sesuai dengan filter'
                    }
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Categories Grid (only show if no search/filters) */}
          {!searchQuery && !hasActiveFilters && (
            <div className="mb-6">
              <h2 className="text-lg font-heading text-gray-800 mb-4">Kategori</h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <Card 
                    key={category.name}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 text-center"
                    padding="small"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, category: category.name }));
                      setActiveTab('sessions');
                    }}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${category.color}`}>
                      {category.name}
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recommended Sessions (only show if no search/filters) */}
          {!searchQuery && !hasActiveFilters && recommendations?.recommendedSessions?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-heading text-gray-800 mb-4">
                <span className="mr-2">✨</span>
                Cocok Untukmu
              </h2>
              <div className="space-y-3">
                {recommendations?.recommendedSessions?.slice(0, 3).map((session) => (
                  <Card 
                    key={session.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200"
                    padding="small"
                    onClick={() => handleSessionClick(session)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center text-2xl">
                        {session.thumbnail}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-gray-800 mb-1">
                          {session.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {session.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{session.duration}</span>
                          <span className="text-primary font-medium">{session.category}</span>
                        </div>
                      </div>
                      {session.isFavorite && (
                        <div className="text-red-500">❤️</div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Sessions */}
          <div>
            {filteredSessions.length > 0 ? (
              <SessionLibrary
                sessions={filteredSessions}
                onSessionClick={handleSessionClick}
                showCategories={!searchQuery && !hasActiveFilters}
              />
            ) : (
              <Card className="text-center py-8">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-600">
                  {searchQuery 
                    ? `Tidak ada sesi yang cocok dengan "${searchQuery}"`
                    : 'Tidak ada sesi yang sesuai dengan filter'
                  }
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

          {/* Filter Modal */}
          <FilterModal
            isOpen={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filters={filters}
            onFiltersChange={setFilters}
          />

          {/* Bottom padding for navigation */}
          <div className="h-6"></div>
        </div>
      </div>
    </DashboardLayout>
  );
};