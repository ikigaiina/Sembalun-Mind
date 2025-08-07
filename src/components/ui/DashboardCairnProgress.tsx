import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AestheticCairnProgress } from './AestheticCairnProgress';
import { Card } from './Card';
import { Button } from './Button';
import { Trophy, Star, Target, Calendar, TrendingUp } from 'lucide-react';

interface ProgressMetric {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  theme?: 'meditation' | 'breathing' | 'achievement' | 'default';
}

interface DashboardCairnProgressProps {
  className?: string;
  title?: string;
  metrics?: ProgressMetric[];
  showInsights?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Default meditation progress metrics
const DEFAULT_METRICS: ProgressMetric[] = [
  {
    id: 'daily-meditation',
    name: 'Meditasi Harian',
    current: 85,
    target: 100,
    unit: '%',
    trend: 'up',
    theme: 'meditation'
  },
  {
    id: 'breathing-mastery',
    name: 'Penguasaan Nafas',
    current: 62,
    target: 100,
    unit: '%',
    trend: 'up',
    theme: 'breathing'
  },
  {
    id: 'mindfulness-streak',
    name: 'Konsistensi Kesadaran',
    current: 73,
    target: 100,
    unit: '%',
    trend: 'stable',
    theme: 'achievement'
  },
  {
    id: 'weekly-goals',
    name: 'Target Mingguan',
    current: 45,
    target: 100,
    unit: '%',
    trend: 'up',
    theme: 'default'
  }
];

// Motivational insights based on progress
const getProgressInsight = (averageProgress: number): string => {
  if (averageProgress >= 90) return '🌟 Performa Luar Biasa! Anda sudah mencapai tingkat master.';
  if (averageProgress >= 75) return '🎯 Progress Sangat Baik! Terus pertahankan konsistensi.';
  if (averageProgress >= 60) return '⭐ Kemajuan Solid! Sedikit lagi menuju level ahli.';
  if (averageProgress >= 40) return '🚀 Terus Berkembang! Momentum Anda semakin baik.';
  if (averageProgress >= 25) return '💪 Langkah Awal yang Positif! Tetap semangat berlatih.';
  return '🌱 Mulai Perjalanan! Setiap langkah kecil sangat berarti.';
};

export const DashboardCairnProgress: React.FC<DashboardCairnProgressProps> = ({
  className = '',
  title = 'Progress Spiritualitas',
  metrics = DEFAULT_METRICS,
  showInsights = true,
  size = 'medium'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<ProgressMetric>(metrics[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  // Calculate overall progress
  const overallProgress = metrics.reduce((sum, metric) => 
    sum + (metric.current / metric.target * 100), 0
  ) / metrics.length;

  // Trigger celebration animation when progress increases
  useEffect(() => {
    setAnimationTrigger(prev => prev + 1);
  }, [selectedMetric.current]);

  // Card variants for animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    expanded: {
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  };

  // Metric card variants
  const metricVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: index * 0.1, duration: 0.4 }
    }),
    selected: {
      scale: 1.05,
      backgroundColor: 'rgba(106, 143, 111, 0.1)',
      transition: { duration: 0.2 }
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="expanded"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-heading font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-primary" />
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Perjalanan menuju kedamaian inner
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:text-primary-600"
          >
            {isExpanded ? 'Tutup' : 'Detail'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Cairn Display */}
          <div className="lg:col-span-2">
            <div className="flex flex-col items-center">
              <AestheticCairnProgress
                progress={(selectedMetric.current / selectedMetric.target) * 100}
                size={size}
                showLabel={true}
                label={selectedMetric.name}
                subtitle={`${selectedMetric.current}${selectedMetric.unit} dari ${selectedMetric.target}${selectedMetric.unit}`}
                animated={true}
                showPercentage={true}
                theme={selectedMetric.theme}
                showMilestones={true}
                milestones={[
                  { value: 25, label: 'Pemula' },
                  { value: 50, label: 'Berkembang' },
                  { value: 75, label: 'Mahir' },
                  { value: 100, label: 'Master' }
                ]}
                className="mb-4"
              />

              {/* Overall Progress Summary */}
              {showInsights && (
                <motion.div
                  className="text-center mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg w-full max-w-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Progress Keseluruhan
                  </div>
                  <div className="text-2xl font-bold text-primary mb-2">
                    {Math.round(overallProgress)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {getProgressInsight(overallProgress)}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Metrics Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
              <Star className="w-4 h-4 mr-2 text-accent" />
              Area Focus
            </h3>
            
            {metrics.map((metric, index) => {
              const progress = (metric.current / metric.target) * 100;
              const isSelected = selectedMetric.id === metric.id;
              
              return (
                <motion.div
                  key={metric.id}
                  variants={metricVariants}
                  initial="hidden"
                  animate={isSelected ? "selected" : "visible"}
                  custom={index}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-200 border
                    ${isSelected 
                      ? 'bg-primary/10 border-primary/30 shadow-sm' 
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }
                  `}
                  onClick={() => setSelectedMetric(metric)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {metric.name}
                    </span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">
                      {metric.current}{metric.unit} / {metric.target}{metric.unit}
                    </span>
                    <span className={`text-xs font-semibold ${
                      progress >= 80 ? 'text-green-600' : 
                      progress >= 60 ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <motion.div
                      className={`h-full rounded-full ${
                        progress >= 80 ? 'bg-green-500' : 
                        progress >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ delay: index * 0.2, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Statistics */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                    Statistik Mingguan
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sesi Selesai</span>
                      <span className="font-medium">24/30</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Waktu Total</span>
                      <span className="font-medium">4h 32m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rata-rata/Sesi</span>
                      <span className="font-medium">11m 20s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Streak</span>
                      <span className="font-medium text-green-600">7 hari</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                    Aksi Cepat
                  </h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Jadwal Sesi Baru
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Trophy className="w-4 h-4 mr-2" />
                      Lihat Pencapaian
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Analisis Progress
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
};

export default DashboardCairnProgress;