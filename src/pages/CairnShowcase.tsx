import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AestheticCairnLogo, 
  AestheticCairnProgress, 
  DashboardCairnProgress, 
  CairnIcon,
  MeditationCairnTimer,
  BreathingCairnSession,
  Card, 
  Button 
} from '../components/ui';
import { ArrowLeft, Play, Pause, Settings, Sparkles, Mountain, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CairnShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [demoProgress, setDemoProgress] = useState(75);
  const [activeDemo, setActiveDemo] = useState<string>('logo');

  // Demo sections
  const demoSections = [
    { id: 'logo', name: 'Logo Aesthetic', icon: Mountain },
    { id: 'progress', name: 'Progress Components', icon: Sparkles },
    { id: 'timer', name: 'Meditation Timer', icon: Play },
    { id: 'breathing', name: 'Breathing Session', icon: Wind },
    { id: 'dashboard', name: 'Dashboard Integration', icon: Settings }
  ];

  const handleProgressChange = (value: number) => {
    setDemoProgress(value);
  };

  const renderDemoSection = () => {
    switch (activeDemo) {
      case 'logo':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-gray-800 dark:text-gray-100 mb-4">
                Aesthetic Cairn Logo Variations
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Logo cairn yang didesain ulang dengan estetika modern, menggunakan gradien yang harmonis dan animasi yang halus untuk mencerminkan perjalanan spiritual pengguna.
              </p>
            </div>

            {/* Progress Control */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={demoProgress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                  className="w-48 slider"
                />
                <span className="text-sm font-mono text-primary">{demoProgress}%</span>
              </div>
            </div>

            {/* Logo Size Variations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { size: 80, label: 'Small (80px)' },
                { size: 120, label: 'Medium (120px)' },
                { size: 160, label: 'Large (160px)' },
                { size: 200, label: 'X-Large (200px)' }
              ].map((variant) => (
                <Card key={variant.size} className="p-6 text-center">
                  <AestheticCairnLogo
                    size={variant.size}
                    progress={demoProgress}
                    animated={true}
                    showWaves={demoProgress > 50}
                  />
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {variant.label}
                  </p>
                </Card>
              ))}
            </div>

            {/* Icon Variations */}
            <div className="mt-12">
              <h4 className="text-lg font-heading font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
                Icon Variations
              </h4>
              <div className="flex justify-center items-center space-x-8">
                {[16, 24, 32, 48, 64].map((size) => (
                  <div key={size} className="text-center">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <CairnIcon 
                        size={size} 
                        progress={demoProgress}
                        className="text-primary mx-auto"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{size}px</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-gray-800 dark:text-gray-100 mb-4">
                Progress Components
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Komponen progress yang interaktif dengan animasi milestone dan celebrasi pencapaian.
              </p>
            </div>

            {/* Theme Variations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { theme: 'default' as const, label: 'Default' },
                { theme: 'meditation' as const, label: 'Meditation' },
                { theme: 'breathing' as const, label: 'Breathing' },
                { theme: 'achievement' as const, label: 'Achievement' }
              ].map((variant) => (
                <Card key={variant.theme} className="p-4">
                  <AestheticCairnProgress
                    progress={demoProgress}
                    size="medium"
                    showLabel={true}
                    label={`${variant.label} Progress`}
                    subtitle={`${demoProgress}% selesai`}
                    animated={true}
                    showPercentage={true}
                    theme={variant.theme}
                  />
                </Card>
              ))}
            </div>

            {/* Size Variations */}
            <div className="mt-12">
              <h4 className="text-lg font-heading font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
                Size Variations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { size: 'small' as const, label: 'Small' },
                  { size: 'medium' as const, label: 'Medium' },
                  { size: 'large' as const, label: 'Large' },
                  { size: 'xl' as const, label: 'Extra Large' }
                ].map((variant) => (
                  <Card key={variant.size} className="p-4">
                    <AestheticCairnProgress
                      progress={demoProgress}
                      size={variant.size}
                      showLabel={true}
                      label={variant.label}
                      animated={true}
                      theme="meditation"
                    />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'timer':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-gray-800 dark:text-gray-100 mb-4">
                Meditation Timer with Cairn
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Timer meditasi yang menggunakan cairn sebagai indikator progress dengan animasi pernapasan.
              </p>
            </div>

            <Card className="p-8 max-w-2xl mx-auto">
              <MeditationCairnTimer
                duration={300} // 5 minutes for demo
                autoStart={false}
                showMilestones={true}
                onComplete={() => console.log('Meditation completed!')}
                onProgress={(progress) => console.log('Progress:', progress)}
              />
            </Card>
          </div>
        );

      case 'breathing':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-gray-800 dark:text-gray-100 mb-4">
                Breathing Session with Cairn
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Sesi pernapasan dengan cairn yang beranimasi mengikuti pola nafas pengguna.
              </p>
            </div>

            <Card className="overflow-hidden">
              <BreathingCairnSession
                duration={3} // 3 minutes for demo
                onComplete={(data) => console.log('Breathing session completed:', data)}
                className="min-h-[600px]"
              />
            </Card>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-gray-800 dark:text-gray-100 mb-4">
                Dashboard Cairn Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Integrasi cairn dalam dashboard dengan berbagai metrik dan insight pengguna.
              </p>
            </div>

            <DashboardCairnProgress
              className="max-w-4xl mx-auto"
              title="Progress Spiritualitas"
              showInsights={true}
              size="large"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
                  Cairn Design Showcase
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Desain baru logo cairn dengan estetika modern
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              🎨 New Aesthetic Design
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {demoSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeDemo === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveDemo(section.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 whitespace-nowrap text-sm font-medium transition-colors
                    ${isActive 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeDemo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderDemoSection()}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <Mountain className="w-4 h-4" />
              <span>Sembalun Cairn Design System</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Desain cairn yang menggambarkan perjalanan spiritual dengan estetika modern dan animasi yang harmonis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CairnShowcase;