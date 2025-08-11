import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, Heart, Timer, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BreathingVisualization3D from '../components/meditation/BreathingVisualization3D';
// VoiceUIIndicator removed for visual-only experience
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  BreathingVisualization, 
  ImmersiveBackgrounds, 
  ProgressAnimation 
} from '../components/visual';
import { useSmartBack } from '../hooks/useNavigationHistory';

// 2025 Enhanced Breathing Session with 3D Visualization
interface BreathingSessionData {
  duration: number;
  completedCycles: number;
  patternUsed: string;
  averageHeartRate?: number;
  stressLevel: 'low' | 'medium' | 'high';
}

export const BreathingSession: React.FC = () => {
  const navigate = useNavigate();
  const { goBack } = useSmartBack('/explore');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  // Audio features removed for visual-only experience
  const [sessionData, setSessionData] = useState<BreathingSessionData | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Session completion handler
  const handleSessionComplete = () => {
    const completedSession: BreathingSessionData = {
      duration: 5, // minutes
      completedCycles: 12,
      patternUsed: 'Coherent Breathing',
      averageHeartRate: 72,
      stressLevel: 'low',
    };
    
    setSessionData(completedSession);
    setSessionComplete(true);
    setSessionStarted(false);
  };

  // Audio features removed for visual-only experience

  const handleBackPress = () => {
    if (sessionStarted) {
      // Show confirmation dialog in real implementation
      setSessionStarted(false);
    } else {
      // Use smart back navigation instead of hardcoded dashboard
      goBack();
    }
  };

  // Auto-hide UI during session
  const [showUI, setShowUI] = useState(true);
  useEffect(() => {
    if (sessionStarted) {
      const timer = setTimeout(() => setShowUI(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionStarted]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Immersive Background */}
      <ImmersiveBackgrounds 
        variant="breathing_gradients"
        intensity={sessionStarted ? "immersive" : "subtle"}
        speed={sessionStarted ? "slow" : "very_slow"}
        colorScheme="breathing"
      />
      
      {/* Additional Background Animation for Session */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-meditation-focus-50 via-meditation-zen-50 to-meditation-calm-50 opacity-50"
        animate={sessionStarted ? {
          background: [
            'linear-gradient(135deg, #eff8ff 0%, #f0f9f2 50%, #f7f8fa 100%)',
            'linear-gradient(135deg, #def0ff 0%, #dcf1e1 50%, #eceef2 100%)',
            'linear-gradient(135deg, #eff8ff 0%, #f0f9f2 50%, #f7f8fa 100%)',
          ]
        } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header - Hidden during active session */}
      <AnimatePresence>
        {(!sessionStarted || showUI) && (
          <motion.header
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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

            <h1 className="text-fluid-xl font-heading font-semibold">
              Breathing Session
            </h1>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="backdrop-blur-md"
              >
                <Settings className="w-6 h-6" />
              </Button>
              
              {/* Audio controls removed for visual-only experience */}
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Audio features removed for visual-only meditation experience */}

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {!sessionComplete ? (
            <motion.div
              key="breathing-session"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl mx-auto px-6"
            >
              {/* Pre-session Instructions */}
              {!sessionStarted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <Card variant="meditation" size="lg" className="max-w-2xl mx-auto mb-8">
                    <h2 className="text-fluid-2xl font-heading font-bold mb-4">
                      Prepare for Your Breathing Session
                    </h2>
                    <div className="space-y-4 meditation-body text-left">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-meditation-zen-400 flex items-center justify-center text-white text-sm font-semibold mt-1">1</div>
                        <p>Find a comfortable seated position with your back straight</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-meditation-zen-400 flex items-center justify-center text-white text-sm font-semibold mt-1">2</div>
                        <p>Close your eyes or soften your gaze on the breathing visualization</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-meditation-zen-400 flex items-center justify-center text-white text-sm font-semibold mt-1">3</div>
                        <p>Follow the visual guide and breathe naturally with the rhythm</p>
                      </div>
                    </div>
                  </Card>

                  <Button
                    variant="meditation"
                    size="lg"
                    onClick={() => setSessionStarted(true)}
                    className="px-12"
                  >
                    Begin Breathing Session
                  </Button>
                </motion.div>
              )}

              {/* Enhanced Immersive Breathing Visualization */}
              <div className="relative flex items-center justify-center">
                {/* New Enhanced Breathing Visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <BreathingVisualization
                    theme="ocean"
                    size="large"
                    isActive={sessionStarted}
                    breathingPattern="coherent"
                    showInstructions={false}
                    showProgress={true}
                    enableRipples={true}
                    particleCount={12}
                  />
                </div>
                
                {/* Original 3D Visualization as overlay */}
                <div className="relative z-10 opacity-80">
                  <BreathingVisualization3D
                    autoStart={sessionStarted}
                    onSessionComplete={handleSessionComplete}
                  />
                </div>
              </div>

              {/* Session Controls - Shown briefly during session */}
              {sessionStarted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: showUI ? 1 : 0, y: showUI ? 0 : 20 }}
                  className="mt-8 text-center"
                  onMouseEnter={() => setShowUI(true)}
                  onMouseLeave={() => setTimeout(() => setShowUI(false), 2000)}
                >
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="calm"
                      onClick={() => setSessionStarted(false)}
                    >
                      Pause Session
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleBackPress}
                    >
                      End Session
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            // Session Complete Screen
            <motion.div
              key="session-complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl mx-auto px-6 text-center"
            >
              <Card variant="meditation" size="lg" glow="meditation">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                >
                  <Heart className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-fluid-2xl font-heading font-bold mb-4">
                  Session Complete! 🌱
                </h2>

                <p className="meditation-body text-lg mb-8 opacity-80">
                  Well done! You've completed a {sessionData?.duration}-minute breathing session.
                </p>

                {/* Session Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-meditation-zen-600">{sessionData?.completedCycles}</div>
                    <div className="text-sm opacity-75">Breathing Cycles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-meditation-focus-600">{sessionData?.duration} min</div>
                    <div className="text-sm opacity-75">Duration</div>
                  </div>
                  {sessionData?.averageHeartRate && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">{sessionData.averageHeartRate} bpm</div>
                        <div className="text-sm opacity-75">Avg Heart Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          <span className="text-2xl font-bold text-green-500 capitalize">{sessionData.stressLevel}</span>
                        </div>
                        <div className="text-sm opacity-75">Stress Level</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="meditation"
                    onClick={() => {
                      setSessionComplete(false);
                      setSessionData(null);
                      setSessionStarted(true);
                    }}
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    Another Session
                  </Button>
                  <Button
                    variant="calm"
                    onClick={goBack}
                  >
                    Return Home
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card variant="heavy" size="lg">
                <h3 className="text-xl font-bold mb-6">Session Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Visual Effects</span>
                    <Button variant="meditation" size="sm">
                      Enhanced
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Animation Speed</span>
                    <Button variant="ghost" size="sm">
                      Normal
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Session Duration</span>
                    <Button variant="ghost" size="sm">
                      5 min
                    </Button>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Button variant="calm" onClick={() => setShowSettings(false)}>
                    Done
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};