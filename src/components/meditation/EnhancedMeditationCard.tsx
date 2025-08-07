import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Heart, Clock, Users, Star, Headphones, Zap } from 'lucide-react';
import { GlassmorphicCard, GlassmorphicButton } from '../ui/GlassmorphicCard';
import { NeomorphicCard, NeomorphicButton } from '../ui/NeomorphicCard';

// 2025 Enhanced Meditation Card with Micro-interactions
interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'breathing' | 'mindfulness' | 'body-scan' | 'loving-kindness' | 'focus';
  instructor?: string;
  participants?: number;
  rating?: number;
  tags?: string[];
  thumbnail?: string;
  audioUrl?: string;
  isFavorite?: boolean;
}

interface EnhancedMeditationCardProps {
  session: MeditationSession;
  variant?: 'glassmorphic' | 'neomorphic' | 'minimal';
  onPlay?: (session: MeditationSession) => void;
  onFavorite?: (sessionId: string) => void;
  className?: string;
}

// 2025 Micro-interactions and animations
const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1], // Custom easing for meditation feel
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    }
  }
};

const breathingAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  }
};

const focusAnimation = {
  animate: {
    rotate: [0, 360],
  },
  transition: {
    duration: 20,
    repeat: Infinity,
    ease: "linear",
  }
};

// Type-specific icons and colors
const getTypeConfig = (type: MeditationSession['type']) => {
  const configs = {
    breathing: {
      icon: Headphones,
      color: 'breathing',
      gradient: 'from-blue-400/20 to-cyan-400/20',
      glowColor: 'blue',
      animation: breathingAnimation,
    },
    mindfulness: {
      icon: Heart,
      color: 'meditation',
      gradient: 'from-emerald-400/20 to-green-400/20',
      glowColor: 'emerald',
      animation: {},
    },
    'body-scan': {
      icon: Zap,
      color: 'calm',
      gradient: 'from-purple-400/20 to-indigo-400/20',
      glowColor: 'purple',
      animation: {},
    },
    'loving-kindness': {
      icon: Heart,
      color: 'meditation',
      gradient: 'from-pink-400/20 to-rose-400/20',
      glowColor: 'pink',
      animation: {},
    },
    focus: {
      icon: Zap,
      color: 'breathing',
      gradient: 'from-orange-400/20 to-yellow-400/20',
      glowColor: 'orange',
      animation: focusAnimation,
    }
  };
  
  return configs[type] || configs.mindfulness;
};

const EnhancedMeditationCard: React.FC<EnhancedMeditationCardProps> = ({
  session,
  variant = 'glassmorphic',
  onPlay,
  onFavorite,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const typeConfig = getTypeConfig(session.type);
  const IconComponent = typeConfig.icon;

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (onPlay) {
      onPlay(session);
    }
  };

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite(session.id);
    }
  };

  // Auto-hide details after delay
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showDetails && !isHovered) {
      timeout = setTimeout(() => setShowDetails(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showDetails, isHovered]);

  // Card component based on variant
  const CardComponent = variant === 'neomorphic' ? NeomorphicCard : GlassmorphicCard;
  const ButtonComponent = variant === 'neomorphic' ? NeomorphicButton : GlassmorphicButton;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={className}
    >
      <CardComponent
        variant={typeConfig.color}
        size="lg"
        interactive="meditation"
        glow={isHovered ? "meditation" : "none"}
        className="group relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className={`absolute inset-0 bg-gradient-to-br ${typeConfig.gradient} opacity-30`} />
        
        {/* Animated Background Element */}
        <motion.div
          className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-white/5"
          {...typeConfig.animation}
        />

        {/* Header */}
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-2 rounded-xl bg-white/10 backdrop-blur-sm"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconComponent className="w-6 h-6 text-current" />
            </motion.div>
            
            <div>
              <h3 className="font-semibold text-lg leading-tight line-clamp-1">
                {session.title}
              </h3>
              <p className="text-sm opacity-75 capitalize">
                {session.type.replace('-', ' ')} • {session.difficulty}
              </p>
            </div>
          </div>

          {/* Favorite Button */}
          <motion.button
            onClick={handleFavorite}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart 
              className={`w-5 h-5 ${session.isFavorite ? 'fill-current text-red-400' : 'text-current opacity-60'}`}
            />
          </motion.button>
        </div>

        {/* Description */}
        <p className="text-sm opacity-80 mb-4 line-clamp-2 leading-relaxed">
          {session.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between mb-6 text-sm opacity-75">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{session.duration} min</span>
            </div>
            
            {session.participants && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{session.participants}</span>
              </div>
            )}
            
            {session.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span>{session.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <ButtonComponent
            variant={typeConfig.color}
            size="md"
            onClick={handlePlay}
            className="flex-1 mr-3 group"
          >
            <motion.div
              className="flex items-center justify-center space-x-2"
              whileHover={{ x: 2 }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <span>{isPlaying ? 'Pause' : 'Start Session'}</span>
            </motion.div>
          </ButtonComponent>

          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: showDetails ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ⌄
            </motion.div>
          </motion.button>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              {session.instructor && (
                <p className="text-sm mb-2">
                  <span className="opacity-75">Instructor:</span> {session.instructor}
                </p>
              )}
              
              {session.tags && session.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {session.tags.map((tag, index) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-2 py-1 text-xs rounded-full bg-white/10 backdrop-blur-sm"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Playing Indicator */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-4"
            >
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardComponent>
    </motion.div>
  );
};

export default EnhancedMeditationCard;