import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Clock, Users, Star, Headphones, Zap, Wind, TrendingUp, 
  Target, Moon, Brain, Sparkles, Calendar, MapPin, CloudRain, 
  Sun, Activity, Award, BookOpen, MessageCircle, Settings
} from 'lucide-react';
import { 
  Card,
  Button,
  CairnIcon,
  BreathingCard,
  MoodSelector,
  MoodHistory,
  MoodNoteModal
} from './index';
import IndonesianCTA, { useCulturalCTA } from './IndonesianCTA';
import IndonesianWisdomQuote from './IndonesianWisdomQuote';
import type { MoodType } from '../../types/mood';
import { moodOptions, getMoodColor } from '../../types/mood';
import { usePersonalization } from '../../contexts/PersonalizationContext';

interface PersonalizedDashboardProps {
  className?: string;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ 
  className = "" 
}) => {
  const { 
    personalization, 
    getPersonalizedRecommendations, 
    getPersonalizedQuote,
    getPersonalizedGreeting,
    getAdaptiveTheme,
    getDashboardLayout,
    getBehaviorInsights,
    getProgressInsights,
    getSmartSchedule,
    getContextualContent,
    isPersonalized,
    updateMoodPattern
  } = usePersonalization();

  const [selectedMood, setSelectedMood] = useState<MoodType>('happy');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [showMoodHistory, setShowMoodHistory] = useState(false);
  const [showMoodNote, setShowMoodNote] = useState(false);
  const [showHistoryToast, setShowHistoryToast] = useState(false);
  
  // Cultural CTA optimization
  const { getOptimalVariant, getOptimalLocalization } = useCulturalCTA(personalization?.culturalData);

  // Get all personalized data
  const greeting = getPersonalizedGreeting();
  const quote = getPersonalizedQuote();
  const theme = getAdaptiveTheme();
  const dashboardConfig = getDashboardLayout();
  const behaviorInsights = getBehaviorInsights();
  const progressInsights = getProgressInsights();
  const smartSchedule = getSmartSchedule();
  const contextualContent = getContextualContent();
  const recommendations = getPersonalizedRecommendations();

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    updateMoodPattern(mood, 'dashboard_selection');
  };
  
  const handleMoodNoteOpen = () => {
    setShowMoodNote(true);
  };
  
  const handleMoodNoteSave = (note: string, tags: string[]) => {
    // Update the current mood entry with note and tags if mood is already selected
    if (selectedMood) {
      updateMoodPattern(selectedMood, 'dashboard_note_added', { note, tags });
    }
    setShowMoodNote(false);
  };

  // Dynamic style based on user preferences
  const adaptiveStyles = useMemo(() => {
    if (!isPersonalized) return {};
    
    return {
      '--primary-color': theme.primaryColor,
      '--accent-color': theme.accentColor,
      '--font-size-base': `${theme.fontSize}px`,
      '--animation-speed': `${theme.animationSpeed}s`,
      background: `linear-gradient(135deg, ${theme.backgroundGradient.join(', ')})`
    } as React.CSSProperties;
  }, [theme, isPersonalized]);

  // Render different sections based on dashboard configuration
  const renderSection = (sectionKey: string) => {
    const section = dashboardConfig.sections[sectionKey as keyof typeof dashboardConfig.sections];
    if (!section?.enabled) return null;

    const sectionVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    };

    switch (sectionKey) {
      case 'mood':
        return (
          <motion.div
            key="mood-section"
            variants={sectionVariants}
            className={`mb-6 ${section.size === 'large' ? 'md:col-span-2 lg:col-span-3' : 'col-span-full'} max-w-2xl mx-auto w-full`}
          >
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 border-blue-100/50 shadow-lg overflow-visible">
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-800 mb-3">
                    Perasaan Hari Ini
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto">
                    Bagaimana kabar hati Anda hari ini?
                  </p>
                </motion.div>
              </div>
              
              {/* Current Mood Display with Clear Feedback */}
              <AnimatePresence>
                {selectedMood && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center mb-6"
                  >
                    <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-md border border-blue-200/50">
                      <motion.div
                        className="text-4xl"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        {moodOptions.find(m => m.id === selectedMood)?.emoji}
                      </motion.div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-600">Anda merasa</p>
                        <p 
                          className="text-lg font-semibold capitalize"
                          style={{ color: getMoodColor(selectedMood) }}
                        >
                          {moodOptions.find(m => m.id === selectedMood)?.label}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex justify-center mb-12 relative" style={{ minHeight: '120px' }}>
                <MoodSelector
                  selectedMood={selectedMood}
                  onMoodSelect={handleMoodSelect}
                  autoSave={true}
                  showLabels={false}
                  size="large"
                  label=""
                  className="w-full max-w-2xl"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={showMoodHistory ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newState = !showMoodHistory;
                      console.log('Toggling mood history:', newState);
                      setShowMoodHistory(newState);
                      
                      // Show feedback toast
                      if (newState) {
                        setShowHistoryToast(true);
                        setTimeout(() => setShowHistoryToast(false), 3000);
                      }
                    }}
                    className={`w-full sm:w-auto transition-all duration-300 hover:shadow-md px-6 py-3 font-medium ${
                      showMoodHistory 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' 
                        : 'text-blue-600 hover:bg-blue-50 border-blue-200'
                    }`}
                  >
                    <motion.div
                      animate={{ rotate: showMoodHistory ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                    </motion.div>
                    {showMoodHistory ? 'Sembunyikan' : 'Lihat'} Riwayat
                  </Button>
                </motion.div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMoodNoteOpen}
                  className="w-full sm:w-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-300 px-6 py-3 font-medium"
                  disabled={!selectedMood}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Tambah Catatan
                </Button>
              </div>
            </Card>
          </motion.div>
        );

      case 'recommendations':
        return (
          <motion.div
            key="recommendations-section"
            variants={sectionVariants}
            className="mb-6 max-w-4xl mx-auto w-full"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-accent-600" />
              <h2 className="text-xl font-heading font-semibold text-gray-800">
                Direkomendasikan untuk Anda
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((rec) => (
                <Card key={rec.id} className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-accent-400">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">
                        {rec.type === 'breathing' ? '🌬️' : 
                         rec.type === 'focus' ? '🎯' : 
                         rec.type === 'body-scan' ? '🧘‍♀️' : 
                         rec.type === 'loving-kindness' ? '💚' : '✨'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-gray-800 mb-2 group-hover:text-accent-700 transition-colors">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {rec.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{rec.duration} min</span>
                          </span>
                          <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">
                            {rec.difficulty}
                          </span>
                        </div>
                        <div className="text-xs text-accent-600 font-medium">
                          Prioritas {rec.priority}/5
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 italic">
                        {rec.reason}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        );

      case 'schedule':
        return (
          <motion.div
            key="schedule-section"
            variants={sectionVariants}
            className="mb-6 max-w-4xl mx-auto w-full"
          >
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-heading font-semibold text-gray-800">
                  Jadwal Pintar Hari Ini
                </h3>
              </div>
              <div className="space-y-3">
                {smartSchedule.slice(0, 6).map((schedule) => (
                  <div key={schedule.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-sm font-mono text-primary-600 min-w-[60px]">
                      {schedule.time}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{schedule.type}</div>
                      <div className="text-sm text-gray-600">{schedule.duration} menit • {schedule.reason}</div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      schedule.priority >= 4 ? 'bg-red-100 text-red-700' :
                      schedule.priority >= 3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      P{schedule.priority}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        );

      case 'progress':
        return (
          <motion.div
            key="progress-section"
            variants={sectionVariants}
            className="mb-6 max-w-4xl mx-auto w-full"
          >
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-accent-600" />
                <h3 className="text-lg font-heading font-semibold text-gray-800">
                  Perkembangan Anda
                </h3>
              </div>
              
              {/* Skill Progress */}
              <div className="space-y-4 mb-6">
                {Object.entries(progressInsights.skillProgress).map(([skill, progress]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium text-gray-700">{skill}</span>
                      <span className="text-gray-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              {behaviorInsights.achievements.milestones.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-3">Pencapaian Terkini</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {behaviorInsights.achievements.milestones.slice(0, 4).map((milestone) => (
                      <div key={milestone.name} className="flex items-center space-x-2 text-sm">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          milestone.achieved ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {milestone.achieved ? <Award className="w-3 h-3" /> : <span className="text-xs">{milestone.progress}%</span>}
                        </div>
                        <span className={milestone.achieved ? 'text-gray-800 font-medium' : 'text-gray-500'}>
                          {milestone.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        );

      case 'insights':
        return (
          <motion.div
            key="insights-section"
            variants={sectionVariants}
            className="mb-6 max-w-4xl mx-auto w-full"
          >
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-heading font-semibold text-gray-800">
                  Wawasan Personal
                </h3>
              </div>
              
              {/* Contextual Content */}
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">
                    Konteks saat ini: {contextualContent.timeOfDay}
                    {contextualContent.weather && ` • ${contextualContent.weather}`}
                  </span>
                </div>
                <p className="text-sm text-purple-700">
                  Berdasarkan pola Anda, ini adalah waktu yang baik untuk {contextualContent.recommendations[0]?.title.toLowerCase()}.
                </p>
              </div>

              {/* Personalized Tips */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 mb-2">Tips Personal Hari Ini:</h4>
                {progressInsights.personalizedTips.slice(0, 4).map((tip, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <Sparkles className="w-4 h-4 text-accent-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        );

      case 'community':
        return (
          <motion.div
            key="community-section"
            variants={sectionVariants}
            className="mb-6 max-w-4xl mx-auto w-full"
          >
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-heading font-semibold text-gray-800">
                  Komunitas
                </h3>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Fitur komunitas akan segera hadir!<br />
                  Berbagi perjalanan mindfulness dengan sesama praktisi.
                </p>
              </div>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
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

  if (!isPersonalized) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-meditation-zen-50 ${className}`}>
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <Card className="p-8">
            <CairnIcon size={64} className="text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-4">
              Selamat Datang di Sembalun
            </h2>
            <p className="text-gray-600 mb-6">
              Untuk mendapatkan pengalaman yang personal, silakan selesaikan proses onboarding terlebih dahulu.
            </p>
            <IndonesianCTA
              variant="spiritual"
              style="gradient"
              size="large"
              culturalContext={personalization?.culturalData}
              localization={getOptimalLocalization()}
            >
              Mulai Perjalanan Spiritual
            </IndonesianCTA>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen ${className}`}
      style={adaptiveStyles}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Personalized Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Personalized Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <p className="text-lg text-gray-700 font-body">
              {greeting}
            </p>
          </motion.div>

          <div className="flex justify-center items-center mb-4">
            <CairnIcon size={56} progress={behaviorInsights.patterns.completionTrends[0]?.rate || 75} className="text-primary-600 mr-3" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-800">
                {personalization?.goal === 'stress' ? 'Ruang Kedamaian Anda' :
                 personalization?.goal === 'focus' ? 'Pusat Konsentrasi' :
                 personalization?.goal === 'sleep' ? 'Ritual Malam Anda' :
                 'Eksplorasi Batin'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Streak: {behaviorInsights.achievements.streaks.current} hari • 
                Total: {behaviorInsights.patterns.completionTrends.length > 0 ? behaviorInsights.patterns.completionTrends[0].rate : 0} sesi
              </p>
            </div>
          </div>
          
          {/* Goal indicator */}
          {personalization?.goal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-4"
            >
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                {personalization.goal === 'stress' ? <Zap className="w-4 h-4" /> :
                 personalization.goal === 'focus' ? <Target className="w-4 h-4" /> :
                 personalization.goal === 'sleep' ? <Moon className="w-4 h-4" /> :
                 <Sparkles className="w-4 h-4" />}
                <span>
                  {personalization.goal === 'stress' ? 'Mengelola Stres' :
                   personalization.goal === 'focus' ? 'Meningkatkan Fokus' :
                   personalization.goal === 'sleep' ? 'Tidur Lebih Baik' :
                   'Eksplorasi Mindfulness'}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Mood Section - Always Full Width and Centered */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          {renderSection('mood')}
        </motion.div>

        {/* Other Dashboard Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid gap-6 ${
            dashboardConfig.layout === 'simple' ? 'grid-cols-1' :
            dashboardConfig.layout === 'detailed' ? 'grid-cols-1 md:grid-cols-2' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {Object.keys(dashboardConfig.sections)
            .filter(sectionKey => sectionKey !== 'mood') // Exclude mood section as it's rendered separately
            .sort((a, b) => {
              const sectionA = dashboardConfig.sections[a as keyof typeof dashboardConfig.sections];
              const sectionB = dashboardConfig.sections[b as keyof typeof dashboardConfig.sections];
              return sectionA.position - sectionB.position;
            })
            .map(sectionKey => renderSection(sectionKey))}
        </motion.div>

        {/* Mood History Section with Enhanced Visibility */}
        <AnimatePresence mode="wait">
          {showMoodHistory && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className="mt-8"
            >
              {/* Section Header */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-6"
              >
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Riwayat Perasaan Anda</span>
                </div>
              </motion.div>
              
              {/* History Component */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border-t-4 border-gradient-to-r from-blue-400 to-purple-500 pt-6"
              >
                <MoodHistory
                  showStats={true}
                  showChart={true}
                  showCalendar={true}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-blue-100/50"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indonesian Wisdom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <IndonesianWisdomQuote
            size="large"
            showTranslation={true}
            autoRotate={true}
            culturalFilter={true}
          />
        </motion.div>

        {/* Quick Actions based on prominent features */}
        {dashboardConfig.quickActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4 text-center">
                Aksi Cepat
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {dashboardConfig.quickActions.slice(0, 6).map((action, index) => (
                  <IndonesianCTA
                    key={index}
                    variant="respectful"
                    style="outline"
                    size="small"
                    culturalContext={personalization?.culturalData}
                    localization={getOptimalLocalization()}
                    className="text-primary-600 border-primary-300 hover:bg-primary-50"
                  >
                    {action}
                  </IndonesianCTA>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Bottom padding for navigation */}
        <div className="h-6"></div>
      </div>

      {/* History Toggle Toast */}
      <AnimatePresence>
        {showHistoryToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg font-medium flex items-center space-x-2"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              📊
            </motion.span>
            <span>Riwayat perasaan ditampilkan di bawah</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Note Modal */}
      <MoodNoteModal
        isOpen={showMoodNote}
        onClose={() => setShowMoodNote(false)}
        onSave={handleMoodNoteSave}
        selectedMood={selectedMood || 'neutral'}
      />
    </div>
  );
};