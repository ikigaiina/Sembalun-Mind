import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Type, Zap, Moon, Sun, Accessibility, Eye, Volume2 } from 'lucide-react';
import { GlassmorphicCard, GlassmorphicButton } from '../components/ui/GlassmorphicCard';
import { NeomorphicCard, NeomorphicButton, NeomorphicInput } from '../components/ui/NeomorphicCard';
import EnhancedMeditationCard from '../components/meditation/EnhancedMeditationCard';
import BreathingVisualization3D from '../components/meditation/BreathingVisualization3D';

// 2025 Design System Demonstration Page
const DesignSystemDemo: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<'glassmorphic' | 'neomorphic'>('glassmorphic');

  // Sample meditation session data
  const sampleSession = {
    id: '1',
    title: 'Morning Mindfulness',
    description: 'Start your day with clarity and intention through guided mindfulness meditation.',
    duration: 10,
    difficulty: 'beginner' as const,
    type: 'mindfulness' as const,
    instructor: 'Sarah Chen',
    participants: 1247,
    rating: 4.8,
    tags: ['morning', 'mindfulness', 'beginner'],
    isFavorite: true,
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const colorPalette = {
    primary: '#6A8F6F',
    accent: '#A9C1D9',
    background: '#E1E8F0',
    warm: '#C56C3E',
    meditation: {
      zen: '#7C9885',
      focus: '#6B9BD1',
      calm: '#A8B8C8',
      energy: '#D4A574',
      healing: '#85A887',
    }
  };

  return (
    <div className={`min-h-screen p-8 transition-all duration-500 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <motion.header 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Sembalun Design System 2025
          </h1>
          <p className="text-xl opacity-80 max-w-3xl mx-auto meditation-body">
            Comprehensive UI/UX design system implementing cutting-edge 2025 trends including 
            Neomorphism 2.0, Enhanced Glassmorphism, Variable Fonts, and 3D Elements
          </p>
        </motion.header>

        {/* Controls */}
        <motion.div 
          className="flex justify-center items-center space-x-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GlassmorphicButton
            variant={darkMode ? "calm" : "meditation"}
            onClick={toggleDarkMode}
            className="flex items-center space-x-2"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{darkMode ? 'Light' : 'Dark'} Mode</span>
          </GlassmorphicButton>
          
          <GlassmorphicButton
            variant="breathing"
            onClick={() => setCurrentVariant(currentVariant === 'glassmorphic' ? 'neomorphic' : 'glassmorphic')}
            className="flex items-center space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>{currentVariant === 'glassmorphic' ? 'Switch to Neomorphic' : 'Switch to Glassmorphic'}</span>
          </GlassmorphicButton>
        </motion.div>

        {/* Design System Sections */}
        <div className="space-y-16">
          
          {/* Color Palette Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center mb-8">
              <Palette className="w-8 h-8 mr-4 text-emerald-600" />
              <h2 className="text-4xl font-bold">2025 Color Palette</h2>
            </div>
            
            <GlassmorphicCard variant="meditation" size="lg" className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Primary Colors */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Primary Colors</h3>
                  <div className="space-y-3">
                    {Object.entries(colorPalette).filter(([key]) => key !== 'meditation').map(([name, color]) => (
                      <div key={name} className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-xl shadow-md border-2 border-white/20"
                          style={{ backgroundColor: color }}
                        />
                        <div>
                          <div className="font-medium capitalize">{name}</div>
                          <div className="text-sm opacity-75 font-mono">{color}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Meditation Colors */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Meditation Colors</h3>
                  <div className="space-y-3">
                    {Object.entries(colorPalette.meditation).map(([name, color]) => (
                      <div key={name} className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-xl shadow-md border-2 border-white/20"
                          style={{ backgroundColor: color }}
                        />
                        <div>
                          <div className="font-medium capitalize">{name}</div>
                          <div className="text-sm opacity-75 font-mono">{color}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Glassmorphism Demo */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Glassmorphism Effects</h3>
                  <div className="space-y-3">
                    <div className="relative p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                      <div className="text-sm font-medium">Light Glass Effect</div>
                      <div className="text-xs opacity-75 mt-1">10% opacity, blur-md</div>
                    </div>
                    <div className="relative p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30">
                      <div className="text-sm font-medium">Heavy Glass Effect</div>
                      <div className="text-xs opacity-75 mt-1">20% opacity, blur-lg</div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassmorphicCard>
          </motion.section>

          {/* Typography Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center mb-8">
              <Type className="w-8 h-8 mr-4 text-blue-600" />
              <h2 className="text-4xl font-bold">2025 Variable Typography</h2>
            </div>
            
            <GlassmorphicCard variant="breathing" size="lg" className="p-8">
              <div className="space-y-8">
                <div>
                  <h1 className="text-6xl font-bold mb-2">Display Heading</h1>
                  <p className="text-sm opacity-75">Playfair Display Variable - Font variation: weight 500, optical size 36</p>
                </div>
                
                <div>
                  <h2 className="text-4xl font-semibold mb-2">Section Heading</h2>
                  <p className="text-sm opacity-75">Playfair Display Variable - Font variation: weight 400, optical size 24</p>
                </div>
                
                <div className="meditation-body">
                  <p className="text-lg mb-4">
                    This is meditation body text optimized for calm reading. It uses Source Serif 4 Variable 
                    with enhanced line height (1.8), letter spacing (0.015em), and word spacing (0.05em) 
                    for a peaceful reading experience during meditation sessions.
                  </p>
                  <p className="text-sm opacity-75">Source Serif 4 Variable - Font variation: weight 400, optical size 12</p>
                </div>
                
                <div className="meditation-wisdom">
                  <p className="text-2xl mb-2">
                    "In the midst of movement and chaos, keep stillness inside of you."
                  </p>
                  <p className="text-sm opacity-75">Wisdom Quote Style - Italic, centered, enhanced spacing</p>
                </div>
              </div>
            </GlassmorphicCard>
          </motion.section>

          {/* Component Showcase */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center mb-8">
              <Zap className="w-8 h-8 mr-4 text-purple-600" />
              <h2 className="text-4xl font-bold">Interactive Components</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Glassmorphic Components */}
              <GlassmorphicCard variant="meditation" size="lg" className="p-6">
                <h3 className="text-2xl font-bold mb-6">Glassmorphism Components</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <GlassmorphicButton variant="meditation" size="md">
                      Meditation
                    </GlassmorphicButton>
                    <GlassmorphicButton variant="breathing" size="md">
                      Breathing
                    </GlassmorphicButton>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Session Duration</label>
                    <input 
                      type="text" 
                      placeholder="10 minutes"
                      className="w-full h-12 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-4 text-base transition-all duration-200 focus:bg-white/15 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  
                  <GlassmorphicCard variant="breathing" size="sm" glow="subtle">
                    <div className="text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <div className="font-semibold">Focus Mode</div>
                      <div className="text-sm opacity-75">Enhanced concentration</div>
                    </div>
                  </GlassmorphicCard>
                </div>
              </GlassmorphicCard>

              {/* Neomorphic Components */}
              <NeomorphicCard variant="meditation" size="lg" className="p-6">
                <h3 className="text-2xl font-bold mb-6">Neomorphism Components</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <NeomorphicButton variant="meditation" size="md">
                      Start Session
                    </NeomorphicButton>
                    <NeomorphicButton variant="breathing" size="md">
                      Breathe
                    </NeomorphicButton>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <NeomorphicInput 
                      variant="meditation"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <NeomorphicCard variant="breathing" size="sm">
                    <div className="text-center">
                      <Volume2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-semibold">Audio Guide</div>
                      <div className="text-sm opacity-75">Guided meditation</div>
                    </div>
                  </NeomorphicCard>
                </div>
              </NeomorphicCard>
            </div>
          </motion.section>

          {/* Enhanced Meditation Card Demo */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-8">Enhanced Meditation Card</h2>
            <div className="max-w-2xl">
              <EnhancedMeditationCard 
                session={sampleSession}
                variant={currentVariant}
                onPlay={(session) => console.log('Playing:', session)}
                onFavorite={(id) => console.log('Favorited:', id)}
              />
            </div>
          </motion.section>

          {/* 3D Breathing Visualization */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-4xl font-bold mb-8">3D Breathing Visualization</h2>
            <BreathingVisualization3D />
          </motion.section>

          {/* Accessibility Features */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center mb-8">
              <Accessibility className="w-8 h-8 mr-4 text-green-600" />
              <h2 className="text-4xl font-bold">Accessibility Features</h2>
            </div>
            
            <GlassmorphicCard variant="calm" size="lg" className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
                    <Accessibility className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">WCAG 2.2 AA</h3>
                  <p className="text-sm opacity-75">Full compliance with latest accessibility standards</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Enhanced Focus</h3>
                  <p className="text-sm opacity-75">Improved focus states and keyboard navigation</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Volume2 className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Screen Reader</h3>
                  <p className="text-sm opacity-75">Optimized for screen readers and assistive technology</p>
                </div>
              </div>
            </GlassmorphicCard>
          </motion.section>
        </div>

        {/* Footer */}
        <motion.footer 
          className="text-center mt-16 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-lg opacity-75">
            Sembalun Design System 2025 - Comprehensive UI/UX with cutting-edge trends
          </p>
          <p className="text-sm opacity-60 mt-2">
            Neomorphism 2.0 • Enhanced Glassmorphism • Variable Fonts • 3D Elements • Voice UI Ready
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default DesignSystemDemo;