import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, Heart, Brain, Compass, Flower } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CairnProgress } from '../ui/CairnProgress';

interface SIYPracticeProps {
  className?: string;
}

type PracticeStage = 'awareness' | 'attention' | 'compassion' | 'wisdom' | 'action';

interface PracticeStep {
  id: PracticeStage;
  title: string;
  indonesianTitle: string;
  description: string;
  indonesianDescription: string;
  icon: React.ReactNode;
  duration: number;
  culturalWisdom: string;
  culturalSource: string;
  progress: number;
}

const practiceSteps: PracticeStep[] = [
  {
    id: 'awareness',
    title: 'Mindful Awareness',
    indonesianTitle: 'Kesadaran Penuh',
    description: 'Develop present-moment awareness through mindful observation',
    indonesianDescription: 'Kembangkan kesadaran saat ini melalui pengamatan penuh perhatian',
    icon: <Brain className="w-6 h-6" />,
    duration: 5,
    culturalWisdom: "Air yang tenang menggambarkan pikiran yang damai",
    culturalSource: "Pepatah Jawa",
    progress: 20
  },
  {
    id: 'attention',
    title: 'Focused Attention',
    indonesianTitle: 'Perhatian Terfokus',
    description: 'Train your attention like a mountain climber focuses on each step',
    indonesianDescription: 'Latih perhatian Anda seperti pendaki gunung fokus pada setiap langkah',
    icon: <Mountain className="w-6 h-6" />,
    duration: 10,
    culturalWisdom: "Seperti cahaya puncak Rinjani, fokus yang jernih menerangi jalan",
    culturalSource: "Filosofi Sembalun",
    progress: 40
  },
  {
    id: 'compassion',
    title: 'Self-Compassion',
    indonesianTitle: 'Welas Asih Diri',
    description: 'Cultivate kindness towards yourself and others',
    indonesianDescription: 'Kembangkan kebaikan hati terhadap diri sendiri dan orang lain',
    icon: <Heart className="w-6 h-6" />,
    duration: 8,
    culturalWisdom: "Seperti bambu yang lentur, hati yang bijak tidak mudah patah",
    culturalSource: "Kebijaksanaan Sunda",
    progress: 60
  },
  {
    id: 'wisdom',
    title: 'Emotional Wisdom',
    indonesianTitle: 'Kebijaksanaan Emosi',
    description: 'Understand and navigate your emotional landscape',
    indonesianDescription: 'Pahami dan navigasi lanskap emosional Anda',
    icon: <Flower className="w-6 h-6" />,
    duration: 12,
    culturalWisdom: "Bagaikan teratai yang tumbuh dari lumpur, kebijaksanaan muncul dari kesulitan",
    culturalSource: "Filosofi Bali",
    progress: 80
  },
  {
    id: 'action',
    title: 'Mindful Action',
    indonesianTitle: 'Tindakan Sadar',
    description: 'Apply mindfulness in daily life and relationships',
    indonesianDescription: 'Terapkan mindfulness dalam kehidupan sehari-hari dan hubungan',
    icon: <Compass className="w-6 h-6" />,
    duration: 15,
    culturalWisdom: "Gunung tidak pernah bertemu gunung, tetapi manusia bertemu manusia",
    culturalSource: "Pepatah Minang",
    progress: 100
  }
];

export const SIYIndonesianPractice: React.FC<SIYPracticeProps> = ({ 
  className = "" 
}) => {
  const [currentStage, setCurrentStage] = useState<PracticeStage>('awareness');
  const [isActive, setIsActive] = useState(false);
  const [completedStages, setCompletedStages] = useState<PracticeStage[]>([]);

  const currentStep = practiceSteps.find(step => step.id === currentStage);
  const overallProgress = Math.round((completedStages.length / practiceSteps.length) * 100);

  const handleStartPractice = () => {
    setIsActive(true);
  };

  const handleCompleteStage = () => {
    if (currentStep && !completedStages.includes(currentStep.id)) {
      setCompletedStages([...completedStages, currentStep.id]);
    }
    
    const currentIndex = practiceSteps.findIndex(step => step.id === currentStage);
    const nextIndex = (currentIndex + 1) % practiceSteps.length;
    setCurrentStage(practiceSteps[nextIndex].id);
    setIsActive(false);
  };

  const stageVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut" 
      }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      transition: { 
        duration: 0.4 
      }
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-heading font-bold text-gray-800 dark:text-gray-200 mb-4">
          Search Inside Yourself
        </h2>
        <h3 className="text-2xl font-heading font-medium text-primary-600 dark:text-primary-400 mb-2">
          Cari di Dalam Diri Anda
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-body">
          Perjalanan mindfulness yang terinspirasi dari kearifan Nusantara dan metodologi Google
        </p>
      </motion.div>

      {/* Overall Progress with Cairn Symbol */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex justify-center mb-12"
      >
        <Card variant="glassmorphic" className="p-6">
          <CairnProgress 
            progress={overallProgress}
            size="medium"
            showLabel={true}
            label={`Progres Keseluruhan: ${overallProgress}%`}
          />
        </Card>
      </motion.div>

      {/* Practice Stages Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8"
      >
        {practiceSteps.map((step, index) => (
          <motion.button
            key={step.id}
            onClick={() => setCurrentStage(step.id)}
            className={`p-3 rounded-xl transition-all duration-300 ${
              currentStage === step.id
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : completedStages.includes(step.id)
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col items-center text-center">
              {step.icon}
              <span className="text-xs mt-2 font-medium">
                {step.indonesianTitle}
              </span>
              {completedStages.includes(step.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 bg-green-500 rounded-full mt-1"
                />
              )}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Current Practice Stage */}
      <AnimatePresence mode="wait">
        {currentStep && (
          <motion.div
            key={currentStep.id}
            variants={stageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card variant="neomorphic" size="lg" className="mb-8">
              <div className="text-center">
                {/* Stage Icon */}
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-primary-600 dark:text-primary-400">
                    {currentStep.icon}
                  </div>
                </motion.div>

                {/* Stage Title */}
                <h3 className="text-2xl font-heading font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {currentStep.indonesianTitle}
                </h3>
                <h4 className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {currentStep.title}
                </h4>

                {/* Stage Description */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto font-body">
                  {currentStep.indonesianDescription}
                </p>

                {/* Cultural Wisdom */}
                <motion.blockquote
                  className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-6 mb-6 border-l-4 border-primary-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-primary-700 dark:text-primary-300 font-medium italic text-lg font-heading mb-2">
                    "{currentStep.culturalWisdom}"
                  </p>
                  <cite className="text-primary-600 dark:text-primary-400 text-sm">
                    — {currentStep.culturalSource}
                  </cite>
                </motion.blockquote>

                {/* Practice Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!isActive ? (
                    <Button
                      onClick={handleStartPractice}
                      variant="meditation"
                      size="lg"
                      className="min-w-[200px]"
                    >
                      Mulai Praktik ({currentStep.duration} menit)
                    </Button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="animate-pulse mb-4">
                        <div className="w-16 h-16 bg-primary-200 dark:bg-primary-800 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 bg-primary-600 dark:bg-primary-400 rounded-full animate-ping" />
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Praktik sedang berlangsung...
                      </p>
                      <Button
                        onClick={handleCompleteStage}
                        variant="calm"
                        size="lg"
                      >
                        Selesai & Lanjut
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Card variant="glassmorphic" className="p-6">
          <h4 className="text-lg font-heading font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Perjalanan Mindfulness Anda
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {completedStages.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tahap Selesai
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                {practiceSteps.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Tahap
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {overallProgress}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Progres
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                5
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Kearifan Nusantara
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};