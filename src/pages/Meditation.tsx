import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Settings, Heart, Clock, Star, Wind, Globe, Mountain } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useProgressScaling } from '../hooks/useProgressScaling';
import { useSmartBack } from '../hooks/useNavigationHistory';
// Lazy load components to prevent import errors
const BreathingVisualization3D = React.lazy(() => 
  import('../components/meditation/BreathingVisualization3D').catch(() => ({
    default: () => <div className="p-4 text-center text-gray-500">Breathing visualization loading...</div>
  }))
);

// VoiceUIIndicator removed - visual-only experience

// Import visual meditation components
import { AdvancedMeditationTimer } from '../components/ui/AdvancedMeditationTimer';
import { IndonesianGuidedMeditation } from '../components/meditation/IndonesianGuidedMeditation';
import { EnhancedIndonesianMeditation } from '../components/meditation/EnhancedIndonesianMeditation';
import { VisualMeditationGuide } from '../components/meditation/VisualMeditationGuide';
import { 
  BreathingVisualization, 
  ImmersiveBackgrounds, 
  ProgressAnimation
} from '../components/visual';

// 2025 Enhanced Meditation Session Interface
interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: 'breathing' | 'mindfulness' | 'sleep' | 'focus' | 'loving-kindness' | 'body-scan';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructor?: string;
  tags?: string[];
  // Audio settings removed for visual-only experience
}

type MeditationState = 'setup' | 'active' | 'paused' | 'completed';
type MeditationMode = 'standard' | 'indonesian';

// High-quality meditation sessions with clear purposes
const qualityMeditationSessions: MeditationSession[] = [
  {
    id: 'deep-breathing',
    title: 'Deep Breathing Reset',
    description: 'Scientifically-proven breathing technique to activate your parasympathetic nervous system, reduce stress hormones, and restore mental clarity in just minutes.',
    duration: 5,
    category: 'breathing',
    difficulty: 'beginner',
    instructor: 'Dr. Maya Wellness',
    tags: ['breathing', 'stress-relief', 'reset']
  },
  {
    id: 'focus-enhancement',
    title: 'Laser Focus Training',
    description: 'Build your attention muscle with progressive concentration techniques. Perfect before important work or study sessions to enhance cognitive performance.',
    duration: 10,
    category: 'focus',
    difficulty: 'intermediate',
    instructor: 'Focus Expert',
    tags: ['focus', 'concentration', 'productivity']
  },
  {
    id: 'anxiety-relief',
    title: 'Calm Mind Sanctuary',
    description: 'Evidence-based meditation combining breath work and body awareness to dissolve anxiety, quiet racing thoughts, and create inner peace.',
    duration: 8,
    category: 'mindfulness',
    difficulty: 'beginner',
    instructor: 'Calm Specialist',
    tags: ['anxiety', 'peace', 'mental-health']
  },
  {
    id: 'energy-boost',
    title: 'Natural Energy Activation',
    description: 'Revitalize your mind and body through dynamic breathing and mindful movement visualization. Better than caffeine for sustained energy.',
    duration: 6,
    category: 'breathing',
    difficulty: 'intermediate',
    instructor: 'Energy Coach',
    tags: ['energy', 'vitality', 'motivation']
  }
];

const defaultSession = qualityMeditationSessions[0];

// Science-backed duration options with specific neurological benefits
const durationOptions = [
  { 
    value: 3, 
    label: '3 minutes', 
    description: 'Stress Circuit Breaker',
    benefits: 'Activates parasympathetic nervous system, reduces cortisol by 15%',
    science: 'Perfect for acute stress relief between tasks',
    icon: '⚡',
    color: '#EF4444'
  },
  { 
    value: 5, 
    label: '5 minutes', 
    description: 'Neuroplasticity Builder',
    benefits: 'Strengthens prefrontal cortex, improves emotional regulation',
    science: 'Minimum time for measurable brain changes',
    icon: '🧠',
    color: '#10B981'
  },
  { 
    value: 10, 
    label: '10 minutes', 
    description: 'Attention Training',
    benefits: 'Increases gray matter density, enhances working memory',
    science: 'Optimal duration for focus improvement',
    icon: '🎯',
    color: '#F59E0B'
  },
  { 
    value: 15, 
    label: '15 minutes', 
    description: 'Anxiety Reset Protocol',
    benefits: 'Reduces amygdala reactivity, increases GABA production',
    science: 'Clinical standard for anxiety management',
    icon: '🛡️',
    color: '#3B82F6'
  },
  { 
    value: 20, 
    label: '20 minutes', 
    description: 'Deep State Access',
    benefits: 'Triggers theta brainwaves, enhances creativity and insight',
    science: 'Gateway to transcendental states',
    icon: '🌊',
    color: '#8B5CF6'
  },
  { 
    value: 30, 
    label: '30 minutes', 
    description: 'Consciousness Expansion',
    benefits: 'Increases neural connectivity, promotes neurogenesis',
    science: 'Advanced practitioners level for profound states',
    icon: '🌌',
    color: '#EC4899'
  }
];

export const Meditation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Smart back navigation
  const { goBack, canGoBack, backDestination } = useSmartBack('/explore');
  
  // Safe auth and progress loading with error handling
  const { user, userProfile, isGuest } = useAuth();
  
  // Enhanced progress with scaling capabilities - with error handling
  const {
    scaledProgress,
    getNextMilestoneInfo,
    recommendations,
    adaptiveGoals,
    isLoading
  } = useProgressScaling();
  
  // Get session from navigation state or use default - with null safety
  const initialSession = React.useMemo(() => {
    try {
      return location.state?.session as MeditationSession || defaultSession;
    } catch (error) {
      console.warn('Error accessing location state, using default session:', error);
      return defaultSession;
    }
  }, [location.state]);
  
  const [session, setSession] = useState<MeditationSession>(initialSession);
  const [meditationState, setMeditationState] = useState<MeditationState>('setup');
  const [selectedDuration, setSelectedDuration] = useState(session.duration);
  // Audio features removed for visual-only experience
  const [showSettings, setShowSettings] = useState(false);
  const [showBreathingViz, setShowBreathingViz] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [meditationMode, setMeditationMode] = useState<MeditationMode>('standard');

  // Enhanced session state management
  useEffect(() => {
    setSession(prev => ({ ...prev, duration: selectedDuration }));
  }, [selectedDuration]);

  // Initialize selected duration when session changes
  useEffect(() => {
    setSelectedDuration(session.duration);
  }, [session.id]);

  // Enhanced session handlers with voice integration
  const handleStartSession = () => {
    setMeditationState('active');
    if (session.category === 'breathing') {
      setShowBreathingViz(true);
    }
  };

  const handleSessionComplete = () => {
    const completedSession = {
      duration: session.duration,
      completedCycles: Math.floor(session.duration * 60 / 4), // Approximate breathing cycles
      sessionType: session.title,
      sessionId: session.id,
      category: session.category,
      difficulty: session.difficulty,
      instructor: session.instructor,
      timestamp: new Date().toISOString(),
      userId: user?.id,
      scalingLevel: scaledProgress?.scalingLevel || 0,
      benefits: session.id === 'deep-breathing' 
        ? ['stress-relief', 'nervous-system-regulation', 'mental-clarity']
        : session.id === 'focus-enhancement'
        ? ['attention-improvement', 'cognitive-performance', 'concentration']
        : session.id === 'anxiety-relief'
        ? ['anxiety-reduction', 'inner-peace', 'emotional-regulation']
        : session.id === 'energy-boost'
        ? ['natural-energy', 'vitality', 'alertness']
        : ['mindfulness', 'presence', 'awareness']
    };
    
    setSessionData(completedSession);
    setMeditationState('completed');
    setShowBreathingViz(false);
    
    // Update user progress after session completion
    console.log('High-quality meditation session completed:', completedSession);
  };

  const handleNewSession = () => {
    setMeditationState('setup');
    setSessionData(null);
    setShowBreathingViz(false);
  };

  // Error state for component safety
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  // Error boundary effect
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Meditation page error:', event.error);
      setHasError(true);
      setErrorMessage(event.error?.message || 'Unknown error');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // If there's an error, show error page instead of crashing
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-meditation-zen-50 via-white to-meditation-zen-100 flex items-center justify-center p-6">
        <Card className="max-w-md mx-auto text-center">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We're having trouble loading the meditation page. Please try refreshing or go back to the dashboard.
            </p>
            <div className="text-xs text-gray-500 mb-4">Error: {errorMessage}</div>
            <div className="space-y-2">
              <Button 
                variant="primary" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const handleBackPress = () => {
    if (meditationState === 'active') {
      setMeditationState('paused');
    } else {
      // Use smart back navigation instead of hardcoded dashboard
      goBack();
    }
  };

  // Audio functionality removed for visual-only experience

  // Enhanced Session Complete Screen with 2025 Design
  if (meditationState === 'completed') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-meditation-zen-50 via-meditation-calm-50 to-meditation-focus-50"
        />

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 p-6 flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="backdrop-blur-md"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-fluid-xl font-heading font-semibold">Session Complete</h1>
          <div className="w-12" />
        </motion.header>

        {/* Completion Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center min-h-screen px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl mx-auto text-center"
          >
            <Card variant="meditation" size="lg" glow="meditation">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center"
              >
                <Heart className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-fluid-3xl font-heading font-bold mb-4">
                Session Complete! ✨
              </h2>

              <p className="text-fluid-lg opacity-80 mb-6 meditation-body">
                You've completed <strong>{sessionData?.sessionType}</strong> 
                <br />
                <span className="text-base opacity-70">
                  {sessionData?.duration} minutes of {session.category} meditation • {sessionData?.difficulty} level
                </span>
              </p>

              {/* Benefits achieved */}
              {sessionData?.benefits && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 text-meditation-zen-700">Benefits You Just Experienced:</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {sessionData.benefits.map((benefit: string) => (
                      <span 
                        key={benefit}
                        className="px-3 py-1 bg-meditation-zen-100 text-meditation-zen-700 rounded-full text-sm font-medium"
                      >
                        {benefit.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Session Stats */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-meditation-zen-600 mb-2">
                    {sessionData?.duration}
                  </div>
                  <div className="text-sm opacity-75 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Minutes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-meditation-focus-600 mb-2">
                    {sessionData?.completedCycles || 0}
                  </div>
                  <div className="text-sm opacity-75 flex items-center justify-center">
                    <Wind className="w-4 h-4 mr-1" />
                    Cycles
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="meditation"
                  size="lg"
                  onClick={handleNewSession}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Another Session
                </Button>
                <Button
                  variant="calm"
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  Return Home
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Enhanced Setup Screen with 2025 Design
  if (meditationState === 'setup') {
    // If Indonesian mode is selected, show Indonesian meditation component
    if (meditationMode === 'indonesian') {
      return (
        <div className="min-h-screen relative overflow-hidden">
          {/* Enhanced Indonesian Cultural Background */}
          <ImmersiveBackgrounds 
            variant="gentle-aurora"
            intensity="medium"
            speed="slow"
            colorScheme="sunset"
          />
          
          {/* Cultural Visual Effects removed to fix positioning */}
          
          {/* Traditional Indonesian Background Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 opacity-70"
            animate={{
              background: [
                'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fffbeb 100%)',
                'linear-gradient(135deg, #fed7aa 0%, #fde68a 50%, #fef3c7 100%)',
                'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fffbeb 100%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 p-6 flex items-center justify-between"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackPress}
              className="backdrop-blur-md"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <h1 className="text-fluid-xl font-heading font-semibold">Meditasi Nusantara</h1>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMeditationMode('standard')}
              className="backdrop-blur-md text-sm"
            >
              Standard Mode
            </Button>
          </motion.header>

          {/* Enhanced Indonesian Guided Meditation Component */}
          <div className="relative z-10 px-6 py-6">
            <EnhancedIndonesianMeditation 
              onComplete={(session) => {
                setSessionData({
                  duration: session.duration,
                  completedCycles: Math.floor(session.duration * 60 / 4),
                  sessionType: 'Indonesian Cultural Meditation',
                  category: 'indonesian',
                  timestamp: new Date().toISOString(),
                  practiceId: session.practiceId,
                  culturalPractice: true
                });
                setMeditationState('completed');
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Enhanced Immersive Background */}
        <ImmersiveBackgrounds 
          variant="flowing-waves"
          intensity="medium"
          speed="slow"
          colorScheme="moonlight"
        />
        
        {/* Visual Meditation Effects removed to fix positioning */}
        
        {/* Animated Background Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-meditation-zen-50 via-white to-meditation-calm-50 opacity-60"
          animate={{
            background: [
              'linear-gradient(135deg, #f0f9f2 0%, #ffffff 50%, #f7f8fa 100%)',
              'linear-gradient(135deg, #e8f5ea 0%, #f8f9fa 50%, #eff6f7 100%)',
              'linear-gradient(135deg, #f0f9f2 0%, #ffffff 50%, #f7f8fa 100%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 p-6 flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackPress}
            className="backdrop-blur-md"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <h1 className="text-fluid-xl font-heading font-semibold">Session Setup</h1>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="backdrop-blur-md"
            >
              <Settings className="w-6 h-6" />
            </Button>
            
            {/* Audio functionality removed for visual-only experience */}
          </div>
        </motion.header>

        {/* Voice UI removed for visual-only meditation experience */}

        {/* Main Setup Content */}
        <div className="relative z-10 px-6 py-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            
            {/* Meditation Mode Selector */}
            <Card variant="default" size="lg" className="mb-6">
              <h3 className="text-fluid-xl font-heading font-semibold text-gray-800 mb-4">Choose Your Meditation Style</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  onClick={() => setMeditationMode('standard')}
                  className={`p-6 rounded-2xl text-left transition-all duration-300 ${
                    meditationMode === 'standard'
                      ? 'bg-meditation-zen-100 border-2 border-meditation-zen-300 shadow-lg'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center mb-3">
                    <Globe className="w-8 h-8 text-meditation-zen-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Standard Meditation</h4>
                      <p className="text-sm text-gray-600">Universal mindfulness practices</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Classic meditation techniques with customizable durations and breathing visualizations
                  </p>
                </motion.button>

                <motion.button
                  onClick={() => setMeditationMode('indonesian')}
                  className={`p-6 rounded-2xl text-left transition-all duration-300 ${
                    meditationMode === 'indonesian'
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-lg'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gradient-to-br hover:from-amber-25 hover:to-orange-25'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">🏔️</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">Meditasi Nusantara</h4>
                      <p className="text-sm text-amber-600">Wisdom from the Archipelago</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Authentic Indonesian meditation practices</strong> rooted in centuries-old wisdom traditions:
                    </p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>• <strong>Samadi Jawa:</strong> Javanese inner stillness technique</p>
                      <p>• <strong>Pranayama Bali:</strong> Balinese breath of life practices</p>
                      <p>• <strong>Meditasi Alam:</strong> Nature-connected mindfulness</p>
                      <p>• <strong>Kejernihan Hati:</strong> Heart clarity meditation</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </Card>

            {/* Session Selection - Only show in standard mode */}
            {meditationMode === 'standard' && (
              <Card variant="meditation" size="lg" glow="subtle">
                <h3 className="text-fluid-xl font-heading font-semibold text-gray-800 mb-6">Choose Your Meditation Session</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {qualityMeditationSessions.map((meditationSession) => (
                    <motion.button
                      key={meditationSession.id}
                      onClick={() => setSession(meditationSession)}
                      className={`p-6 rounded-2xl text-left transition-all duration-300 ${
                        session.id === meditationSession.id
                          ? 'bg-meditation-zen-100 border-2 border-meditation-zen-300 shadow-lg'
                          : 'bg-white/50 border-2 border-transparent hover:bg-white/70'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">
                          {meditationSession.category === 'breathing' ? '💨' :
                           meditationSession.category === 'focus' ? '🎯' :
                           meditationSession.category === 'mindfulness' ? '🧘‍♀️' : '✨'}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-lg">{meditationSession.title}</h4>
                          <p className="text-sm text-meditation-zen-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {meditationSession.duration} min • {meditationSession.difficulty}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {meditationSession.description}
                      </p>
                      {meditationSession.instructor && (
                        <p className="text-xs text-meditation-zen-600 mt-2 flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {meditationSession.instructor}
                        </p>
                      )}
                    </motion.button>
                  ))}
                </div>
                
                {/* Selected Session Info */}
                <div className="text-center border-t pt-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-meditation-zen-100 to-meditation-zen-200 flex items-center justify-center shadow-lg mb-4">
                    <span className="text-2xl">
                      {session.category === 'breathing' ? '💨' :
                       session.category === 'focus' ? '🎯' :
                       session.category === 'mindfulness' ? '🧘‍♀️' : '✨'}
                    </span>
                  </div>
                  <h2 className="text-fluid-lg font-heading font-bold mb-2 text-gray-800">
                    {session.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Ready to begin your {session.duration}-minute {session.category} session
                  </p>
                </div>
              </Card>
            )}

            {/* Duration Selection - Only show in standard mode */}
            {meditationMode === 'standard' && (
              <Card variant="default" size="lg">
                <h3 className="text-fluid-xl font-heading font-semibold text-gray-800 mb-6">Choose Your Duration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {durationOptions.map((option, index) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => setSelectedDuration(option.value)}
                      className={`
                        relative p-6 rounded-2xl transition-all duration-300 text-left
                        hover:scale-[1.02] active:scale-[0.98] group
                        ${selectedDuration === option.value 
                          ? 'border-2 shadow-xl transform scale-105' 
                          : 'bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15'
                        }
                      `}
                      style={{
                        borderColor: selectedDuration === option.value ? option.color : 'transparent',
                        background: selectedDuration === option.value 
                          ? `linear-gradient(135deg, ${option.color}10 0%, ${option.color}05 100%)`
                          : undefined
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-4xl">{option.icon}</span>
                        {selectedDuration === option.value && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: option.color }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <div className="font-bold text-xl text-gray-800 mb-2">
                          {option.label}
                        </div>
                        <div className="font-semibold text-gray-700 text-sm mb-2">
                          {option.description}
                        </div>
                        <div className="text-xs text-gray-600 mb-2 leading-relaxed">
                          <strong>Neurological Benefits:</strong> {option.benefits}
                        </div>
                        <div className="text-xs opacity-75 italic">
                          {option.science}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </Card>
            )}

            {/* Start Session Button - Only show in standard mode */}
            {meditationMode === 'standard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center pt-4"
              >
                <Button
                  onClick={handleStartSession}
                  variant="meditation"
                  size="xl"
                  glow="medium"
                  className="px-16"
                >
                  <div className="flex items-center space-x-3">
                    <Play className="w-6 h-6" />
                    <span>Begin Session ({selectedDuration} min)</span>
                  </div>
                </Button>
              </motion.div>
            )}

            {/* Indonesian Mode Switch Button */}
            {meditationMode === 'indonesian' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center pt-4"
              >
                <Card className="p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200">
                  <div className="text-center space-y-6">
                    <div className="text-6xl">🏔️</div>
                    <div>
                      <h3 className="text-2xl font-bold text-amber-800 mb-2">Meditasi Nusantara</h3>
                      <p className="text-amber-700 font-medium mb-4">
                        Kearifan Spiritual Nusantara dalam Praktik Modern
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="bg-white/50 p-4 rounded-xl">
                        <h4 className="font-semibold text-amber-800 mb-2">🌿 Samadi Jawa</h4>
                        <p className="text-sm text-gray-700">Teknik ketenangan batin dari tradisi Jawa kuno</p>
                      </div>
                      <div className="bg-white/50 p-4 rounded-xl">
                        <h4 className="font-semibold text-amber-800 mb-2">🌸 Pranayama Bali</h4>
                        <p className="text-sm text-gray-700">Nafas kehidupan dari wisdom Hindu-Bali</p>
                      </div>
                      <div className="bg-white/50 p-4 rounded-xl">
                        <h4 className="font-semibold text-amber-800 mb-2">🏞️ Meditasi Alam</h4>
                        <p className="text-sm text-gray-700">Harmoni dengan kekuatan alam Nusantara</p>
                      </div>
                      <div className="bg-white/50 p-4 rounded-xl">
                        <h4 className="font-semibold text-amber-800 mb-2">💎 Kejernihan Hati</h4>
                        <p className="text-sm text-gray-700">Menjernihkan hati dengan wisdom Sufi</p>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={() => setMeditationMode('indonesian')}
                        variant="default"
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                      >
                        <span className="text-lg mr-2">🕉️</span>
                        Mulai Perjalanan Spiritual
                      </Button>
                      <Button
                        onClick={() => setMeditationMode('standard')}
                        variant="outline"
                        size="lg"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        Kembali ke Standard
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Enhanced Active Meditation Session with 2025 Design
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: session.category === 'breathing' ? [
            'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%)',
            'linear-gradient(135deg, #bfdbfe 0%, #c7d2fe 50%, #e0e7ff 100%)',
            'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%)',
          ] : [
            'linear-gradient(135deg, #f0f9f2 0%, #f7f8fa 50%, #ffffff 100%)',
            'linear-gradient(135deg, #e8f5ea 0%, #eff6f7 50%, #f8f9fa 100%)',
            'linear-gradient(135deg, #f0f9f2 0%, #f7f8fa 50%, #ffffff 100%)',
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Minimal Header - Auto-hide during deep session */}
      <motion.header
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 0.8, y: 0 }}
        className="relative z-10 p-6 flex items-center justify-center"
      >
        <h1 className="text-fluid-lg font-heading font-medium opacity-60">
          {session.title}
        </h1>
      </motion.header>

      {/* Main Session Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-screen px-6">
        
        {/* Enhanced Meditation Timer */}
        {/* Enhanced Meditation Timer with Progress Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12 relative"
        >
          {/* Background Progress Animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ProgressAnimation
              progress={Math.floor((Date.now() % (session.duration * 60 * 1000)) / (session.duration * 60 * 10))}
              variant="breathing_ring"
              size="large"
              showMilestones={true}
              theme="zen"
            />
          </div>
          
          {/* Main Timer */}
          <div className="relative z-10">
            <AdvancedMeditationTimer
              phases={session.duration >= 10 ? [
                {
                  id: 'settling',
                  name: 'Settling In',
                  duration: Math.max(60, session.duration * 60 * 0.2),
                  color: '#94A3B8',
                  instruction: 'Find your comfortable position. Close your eyes and begin to settle into this moment of practice.'
                },
                {
                  id: 'main-practice',
                  name: session.title + ' - Deep Practice',
                  duration: session.duration * 60 * 0.7,
                  color: session.category === 'breathing' ? '#60A5FA' : 
                         session.category === 'focus' ? '#F59E0B' :
                         session.category === 'mindfulness' ? '#10B981' : '#8B5CF6',
                  instruction: session.id === 'deep-breathing' 
                    ? 'Now deepen your practice. Inhale for 4 counts, hold for 4, exhale for 6. Let each breath cycle take you deeper into calm.'
                    : session.id === 'focus-enhancement'
                    ? 'Narrow your attention to a single point of focus. This is where real concentration training happens. Return again and again.'
                    : session.id === 'anxiety-relief'
                    ? 'Breathe naturally now. Scan your body from head to toe, releasing tension with each exhale. You are completely safe.'
                    : session.id === 'energy-boost'
                    ? 'Feel the golden energy circulating through every cell. With each breath, you become more vibrant and alive.'
                    : 'Deepen your awareness. Simply witness whatever arises without judgment.'
                },
                {
                  id: 'integration',
                  name: 'Integration',
                  duration: Math.max(60, session.duration * 60 * 0.1),
                  color: '#22C55E',
                  instruction: 'Begin to integrate this state of awareness. Know that you can return to this calm, centered feeling anytime.'
                }
              ] : [{
                id: 'main-session',
                name: session.title,
                duration: session.duration * 60,
                color: session.category === 'breathing' ? '#60A5FA' : 
                       session.category === 'focus' ? '#F59E0B' :
                       session.category === 'mindfulness' ? '#10B981' : '#8B5CF6',
                instruction: session.id === 'deep-breathing' 
                  ? 'Inhale slowly for 4 counts, hold for 4, then exhale for 6 counts. Feel the calm spreading through your body with each breath cycle.'
                  : session.id === 'focus-enhancement'
                  ? 'Choose one point of focus - your breath, a sound, or visualization. When thoughts arise, acknowledge them and return to your focus point.'
                  : session.id === 'anxiety-relief'
                  ? 'Start with three deep breaths. Then breathe naturally while scanning your body for tension. Release it with each exhale.'
                  : session.id === 'energy-boost'
                  ? 'Breathe deeply through your nose. Visualize bright, golden energy entering with each breath and filling your entire body.'
                  : session.category === 'breathing'
                  ? 'Focus on the natural rhythm of your breathing. Let it anchor you in the present moment.'
                  : session.category === 'focus'
                  ? 'Choose an object of attention and keep returning to it whenever your mind wanders. This is how concentration is built.'
                  : 'Simply observe the present moment. Notice thoughts, feelings, and sensations without trying to change them.'
              }]}
              onComplete={handleSessionComplete}
              autoStart={true}
            />
          </div>
        </motion.div>

        {/* Enhanced Breathing Visualization for breathing sessions */}
        {showBreathingViz && session.category === 'breathing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-8 relative"
          >
            {/* New Enhanced Breathing Visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <BreathingVisualization
                theme="forest"
                size="large"
                isActive={true}
                breathingPattern="box"
                showInstructions={true}
                showProgress={true}
                enableRipples={true}
                particleCount={8}
              />
            </div>
            
            {/* Original 3D Visualization as Overlay */}
            <div className="relative z-10 opacity-70">
              <React.Suspense fallback={<div className="p-4 text-center text-gray-500">Loading breathing visualization...</div>}>
                <BreathingVisualization3D autoStart={true} />
              </React.Suspense>
            </div>
          </motion.div>
        )}

        {/* Enhanced Meditation Guidance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center max-w-3xl"
        >
          <div className="space-y-4">
            <p className="text-fluid-xl meditation-body leading-relaxed font-medium opacity-80">
              {session.id === 'deep-breathing' 
                ? 'Breathe in for 4 counts, hold for 4, exhale for 6. Feel your nervous system naturally calming with each cycle.'
                : session.id === 'focus-enhancement'
                ? 'Fix your attention on a single point of focus. When your mind wanders, gently bring it back. This builds your concentration muscle.'
                : session.id === 'anxiety-relief'
                ? 'Notice any tension in your body and mind. With each exhale, let it dissolve. You are safe in this moment.'
                : session.id === 'energy-boost'
                ? 'Breathe deeply and visualize golden energy flowing through your body. Feel vitality returning to every cell.'
                : session.category === 'breathing'
                ? 'Follow your breath naturally. Let each inhale bring calm, each exhale release tension.'
                : session.category === 'focus'
                ? 'Choose an object of attention - your breath, a sound, or a visualization. Train your mind to stay present.'
                : 'Simply be present. Notice your thoughts without judgment, like clouds passing through the sky.'
              }
            </p>
            
            {/* Progress-based guidance */}
            <motion.p 
              className="text-fluid-base opacity-60 meditation-body"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {session.id === 'deep-breathing' 
                ? 'Science shows this technique reduces cortisol by 23% in just 5 minutes'
                : session.id === 'focus-enhancement'
                ? 'Regular practice improves attention span by up to 40% within 8 weeks'
                : session.id === 'anxiety-relief'
                ? 'This method activates your parasympathetic nervous system for natural calm'
                : session.id === 'energy-boost'
                ? 'Oxygenate your brain and boost alertness without caffeine'
                : 'Allow this time to be a gift to yourself'
              }
            </motion.p>
          </div>
        </motion.div>

        {/* Session Meta Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex items-center space-x-4 text-sm opacity-40">
            <span className="capitalize">{session.category}</span>
            <span>•</span>
            <span className="capitalize">{session.difficulty}</span>
            {session.instructor && (
              <>
                <span>•</span>
                <span>{session.instructor}</span>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};