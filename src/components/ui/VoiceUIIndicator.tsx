import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Headphones } from 'lucide-react';
import { GlassmorphicCard, GlassmorphicButton } from './GlassmorphicCard';

// 2025 Voice UI Component for Meditation Guidance
interface VoiceUIIndicatorProps {
  isListening?: boolean;
  isProcessing?: boolean;
  isGuiding?: boolean;
  volume?: number;
  onToggleListening?: () => void;
  onToggleGuiding?: () => void;
  className?: string;
}

// Voice state types
type VoiceState = 'idle' | 'listening' | 'processing' | 'guiding' | 'error';

const VoiceUIIndicator: React.FC<VoiceUIIndicatorProps> = ({
  isListening = false,
  isProcessing = false,
  isGuiding = false,
  volume = 0,
  onToggleListening,
  onToggleGuiding,
  className,
}) => {
  const [currentState, setCurrentState] = useState<VoiceState>('idle');
  const [audioLevels, setAudioLevels] = useState<number[]>([0, 0, 0, 0, 0]);

  // Determine current voice state
  useEffect(() => {
    if (isProcessing) {
      setCurrentState('processing');
    } else if (isListening) {
      setCurrentState('listening');
    } else if (isGuiding) {
      setCurrentState('guiding');
    } else {
      setCurrentState('idle');
    }
  }, [isListening, isProcessing, isGuiding]);

  // Simulate audio levels for visualization
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentState === 'listening' || currentState === 'guiding') {
      interval = setInterval(() => {
        setAudioLevels(prev => prev.map(() => Math.random() * (volume + 0.3)));
      }, 100);
    } else {
      setAudioLevels([0, 0, 0, 0, 0]);
    }

    return () => clearInterval(interval);
  }, [currentState, volume]);

  // State-specific configurations
  const stateConfig = {
    idle: {
      color: 'text-gray-400',
      bgColor: 'bg-gray-100/10',
      icon: Mic,
      pulse: false,
      message: 'Voice guidance available',
    },
    listening: {
      color: 'text-green-400',
      bgColor: 'bg-green-100/20',
      icon: Mic,
      pulse: true,
      message: 'Listening...',
    },
    processing: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-100/20',
      icon: Headphones,
      pulse: true,
      message: 'Processing...',
    },
    guiding: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-100/20',
      icon: Volume2,
      pulse: true,
      message: 'Guiding meditation...',
    },
    error: {
      color: 'text-red-400',
      bgColor: 'bg-red-100/20',
      icon: MicOff,
      pulse: false,
      message: 'Voice unavailable',
    },
  };

  const config = stateConfig[currentState];
  const IconComponent = config.icon;

  // Waveform visualization component
  const WaveformBars = () => (
    <div className="flex items-center justify-center space-x-1 h-8">
      {audioLevels.map((level, index) => (
        <motion.div
          key={index}
          className={`w-1 rounded-full ${config.bgColor}`}
          animate={{
            height: Math.max(4, level * 24),
            opacity: level > 0.1 ? 1 : 0.3,
          }}
          transition={{
            duration: 0.1,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );

  return (
    <div className={className}>
      <GlassmorphicCard 
        variant="meditation" 
        size="sm" 
        className="text-center relative overflow-hidden"
      >
        {/* Background pulse effect */}
        <AnimatePresence>
          {config.pulse && (
            <motion.div
              className={`absolute inset-0 ${config.bgColor} rounded-xl`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0.3, 0.6, 0.3], 
                scale: [0.95, 1.05, 0.95] 
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="relative z-10 p-4">
          {/* Icon and status */}
          <div className="flex flex-col items-center mb-3">
            <motion.div
              className={`p-3 rounded-full bg-white/10 backdrop-blur-sm mb-2 ${config.color}`}
              animate={config.pulse ? {
                scale: [1, 1.1, 1],
                rotate: currentState === 'processing' ? [0, 360] : 0,
              } : {}}
              transition={{
                duration: config.pulse ? 2 : 0,
                repeat: config.pulse ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <IconComponent className="w-6 h-6" />
            </motion.div>

            <motion.p 
              className={`text-sm font-medium ${config.color}`}
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{
                duration: 2,
                repeat: config.pulse ? Infinity : 0,
              }}
            >
              {config.message}
            </motion.p>
          </div>

          {/* Waveform visualization */}
          {(currentState === 'listening' || currentState === 'guiding') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <WaveformBars />
            </motion.div>
          )}

          {/* Control buttons */}
          <div className="flex justify-center space-x-2">
            <GlassmorphicButton
              variant="meditation"
              size="sm"
              onClick={onToggleListening}
              className={`${currentState === 'listening' ? 'ring-2 ring-green-400/50' : ''}`}
            >
              {currentState === 'listening' ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </GlassmorphicButton>

            <GlassmorphicButton
              variant="breathing"
              size="sm"
              onClick={onToggleGuiding}
              className={`${currentState === 'guiding' ? 'ring-2 ring-blue-400/50' : ''}`}
            >
              {currentState === 'guiding' ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </GlassmorphicButton>
          </div>

          {/* Voice guidance hints */}
          <AnimatePresence>
            {currentState === 'listening' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 text-xs opacity-75 text-center"
              >
                Say "start meditation" or "breathe with me"
              </motion.div>
            )}
            
            {currentState === 'guiding' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 text-xs opacity-75 text-center"
              >
                Voice guidance active
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accessibility announcement */}
        <div className="sr-only" aria-live="polite">
          {currentState === 'listening' && 'Voice listening activated'}
          {currentState === 'processing' && 'Processing voice command'}
          {currentState === 'guiding' && 'Voice guidance started'}
          {currentState === 'idle' && 'Voice controls ready'}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

// Voice Commands Helper Component
interface VoiceCommandsHelpProps {
  isVisible: boolean;
  onClose: () => void;
}

export const VoiceCommandsHelp: React.FC<VoiceCommandsHelpProps> = ({ isVisible, onClose }) => {
  const commands = [
    { phrase: '"Start meditation"', action: 'Begin a meditation session' },
    { phrase: '"Breathe with me"', action: 'Start breathing exercise' },
    { phrase: '"Set timer for 10 minutes"', action: 'Set meditation timer' },
    { phrase: '"Play nature sounds"', action: 'Enable background audio' },
    { phrase: '"Pause session"', action: 'Pause current session' },
    { phrase: '"End meditation"', action: 'Stop current session' },
    { phrase: '"Show my progress"', action: 'Display progress stats' },
    { phrase: '"Help"', action: 'Show voice commands' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full"
          >
            <GlassmorphicCard variant="meditation" size="lg">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center">Voice Commands</h3>
                <div className="space-y-3">
                  {commands.map((command, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-start text-sm"
                    >
                      <span className="font-medium text-green-400 flex-1 mr-3">
                        {command.phrase}
                      </span>
                      <span className="opacity-75 text-right flex-1">
                        {command.action}
                      </span>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <GlassmorphicButton onClick={onClose} variant="calm">
                    Got it
                  </GlassmorphicButton>
                </div>
              </div>
            </GlassmorphicCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceUIIndicator;