import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Settings, Heart, Clock, Star, Wind, Globe, Mountain } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import BreathingVisualization3D from '../components/meditation/BreathingVisualization3D';
import VoiceUIIndicator from '../components/ui/VoiceUIIndicator';
import { AdvancedMeditationTimer } from '../components/ui/AdvancedMeditationTimer';
import { IndonesianGuidedMeditation } from '../components/meditation/IndonesianGuidedMeditation';
import { EnhancedIndonesianMeditation } from '../components/meditation/EnhancedIndonesianMeditation';

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
  audioSettings?: {
    backgroundSound: string;
    volume: number;
    guidanceVolume: number;
  };
}

type MeditationState = 'setup' | 'active' | 'paused' | 'completed';
type MeditationMode = 'standard' | 'indonesian';

// Enhanced session data with 2025 meditation practices
const defaultSession: MeditationSession = {
  id: 'default',
  title: 'Mindful Awareness Practice',
  description: 'A gentle introduction to mindfulness meditation with breath awareness and present-moment attention',
  duration: 5,
  category: 'mindfulness',
  difficulty: 'beginner',
  instructor: 'Sarah Chen',
  tags: ['mindfulness', 'beginner', 'breath'],
  audioSettings: {
    backgroundSound: 'nature',
    volume: 0.3,
    guidanceVolume: 0.7
  }
};

// Enhanced duration options with meditation science backing
const durationOptions = [
  { 
    value: 3, 
    label: '3 minutes', 
    description: 'Quick Reset',
    benefits: 'Stress relief, mental clarity',
    icon: '⚡'
  },
  { 
    value: 5, 
    label: '5 minutes', 
    description: 'Foundation',
    benefits: 'Daily practice, habit building',
    icon: '🌱'
  },
  { 
    value: 10, 
    label: '10 minutes', 
    description: 'Standard',
    benefits: 'Deep relaxation, focus',
    icon: '🧘‍♀️'
  },
  { 
    value: 15, 
    label: '15 minutes', 
    description: 'Immersive',
    benefits: 'Anxiety reduction, creativity',
    icon: '🌊'
  },
  { 
    value: 20, 
    label: '20 minutes', 
    description: 'Transformative',
    benefits: 'Emotional balance, insight',
    icon: '✨'
  },
  { 
    value: 30, 
    label: '30 minutes', 
    description: 'Advanced',
    benefits: 'Deep states, spiritual growth',
    icon: '🌟'
  }
];

export const Meditation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get session from navigation state or use default
  const initialSession = location.state?.session as MeditationSession || defaultSession;
  
  const [session, setSession] = useState<MeditationSession>(initialSession);
  const [meditationState, setMeditationState] = useState<MeditationState>('setup');
  const [selectedDuration, setSelectedDuration] = useState(session.duration);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBreathingViz, setShowBreathingViz] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [meditationMode, setMeditationMode] = useState<MeditationMode>('standard');

  // Enhanced session state management
  useEffect(() => {
    setSession(prev => ({ ...prev, duration: selectedDuration }));
  }, [selectedDuration]);

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
      category: session.category,
      timestamp: new Date().toISOString(),
    };
    
    setSessionData(completedSession);
    setMeditationState('completed');
    setShowBreathingViz(false);
  };

  const handleNewSession = () => {
    setMeditationState('setup');
    setSessionData(null);
    setShowBreathingViz(false);
  };

  const handleBackPress = () => {
    if (meditationState === 'active') {
      setMeditationState('paused');
    } else {
      navigate('/');
    }
  };

  const handleVoiceToggle = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      setIsVoiceListening(true);
    }
  };

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
                Beautifully Done! ✨
              </h2>

              <p className="text-fluid-lg opacity-80 mb-8 meditation-body">
                You've completed a {sessionData?.duration}-minute {session.category} meditation session.
              </p>

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
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50"
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
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-meditation-zen-50 via-white to-meditation-calm-50"
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
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceToggle}
              className="backdrop-blur-md"
            >
              {isVoiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </Button>
          </div>
        </motion.header>

        {/* Voice UI Indicator */}
        <AnimatePresence>
          {isVoiceEnabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 flex justify-center mb-6"
            >
              <VoiceUIIndicator
                isListening={isVoiceListening}
                isGuiding={false}
                volume={0.4}
                onToggleListening={() => setIsVoiceListening(!isVoiceListening)}
                onToggleGuiding={handleVoiceToggle}
              />
            </motion.div>
          )}
        </AnimatePresence>

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
                      ? 'bg-orange-100 border-2 border-orange-300 shadow-lg'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center mb-3">
                    <Mountain className="w-8 h-8 text-orange-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Meditasi Nusantara</h4>
                      <p className="text-sm text-gray-600">Indonesian cultural meditation</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Guided meditation inspired by Indonesian wisdom traditions and natural landscapes
                  </p>
                </motion.button>
              </div>
            </Card>

            {/* Session Info Card - Only show in standard mode */}
            {meditationMode === 'standard' && (
              <Card variant="meditation" size="lg" glow="subtle">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-meditation-zen-100 to-meditation-zen-200 flex items-center justify-center shadow-lg">
                    <span className="text-4xl">
                      {session.category === 'breathing' ? '💨' :
                       session.category === 'sleep' ? '🌙' :
                       session.category === 'focus' ? '🎯' :
                       session.category === 'loving-kindness' ? '💖' :
                       session.category === 'body-scan' ? '✋' : '🧘‍♀️'}
                    </span>
                  </div>
                  
                  <div>
                    <h2 className="text-fluid-2xl font-heading font-bold mb-3 text-gray-800">
                      {session.title}
                    </h2>
                    <p className="text-gray-600 meditation-body text-lg leading-relaxed max-w-2xl mx-auto">
                      {session.description}
                    </p>
                    
                    {session.instructor && (
                      <p className="text-sm text-meditation-zen-600 mt-2 flex items-center justify-center">
                        <Star className="w-4 h-4 mr-1" />
                        Guided by {session.instructor}
                      </p>
                    )}
                  </div>
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
                        hover:scale-[1.02] active:scale-[0.98]
                        ${selectedDuration === option.value 
                          ? 'bg-meditation-zen-100/20 backdrop-blur-md border-2 border-meditation-zen-300 shadow-lg' 
                          : 'bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{option.icon}</span>
                        {selectedDuration === option.value && (
                          <div className="w-6 h-6 bg-meditation-zen-500 rounded-full flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-2">
                        <div className="font-bold text-lg text-gray-800 mb-1">
                          {option.label}
                        </div>
                        <div className="font-medium text-meditation-zen-600 text-sm">
                          {option.description}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        {option.benefits}
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
                <Card className="p-6 bg-gradient-to-r from-orange-50 to-amber-50">
                  <p className="text-gray-700 mb-4 text-center font-medium">
                    Anda akan diarahkan ke pengalaman meditasi Indonesia yang lengkap dengan panduan budaya Nusantara
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => setMeditationMode('indonesian')}
                      variant="default"
                      size="lg"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Mountain className="w-5 h-5 mr-2" />
                      Mulai Meditasi Nusantara
                    </Button>
                    <Button
                      onClick={() => setMeditationMode('standard')}
                      variant="outline"
                      size="lg"
                    >
                      Kembali ke Standard
                    </Button>
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <AdvancedMeditationTimer
            duration={session.duration * 60}
            onComplete={handleSessionComplete}
            variant={session.category}
          />
        </motion.div>

        {/* 3D Breathing Visualization for breathing sessions */}
        {showBreathingViz && session.category === 'breathing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-8"
          >
            <BreathingVisualization3D autoStart={true} />
          </motion.div>
        )}

        {/* Meditation Guidance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center max-w-2xl"
        >
          <p className="text-fluid-lg meditation-body leading-relaxed opacity-70">
            {session.category === 'breathing' 
              ? 'Follow your breath naturally. Let each inhale bring calm, each exhale release tension.'
              : session.category === 'mindfulness'
              ? 'Simply be present. Notice your thoughts without judgment, like clouds passing through the sky.'
              : session.category === 'loving-kindness'
              ? 'Send love and compassion to yourself, then extend it outward to others.'
              : session.category === 'body-scan'
              ? 'Slowly scan through your body, noticing each sensation with gentle awareness.'
              : 'Allow your mind to settle into this moment of peace and presence.'
            }
          </p>
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