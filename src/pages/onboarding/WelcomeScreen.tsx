import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CairnIcon, Card, BreathingCard } from '../../components/ui';
import { Button } from '../../components/ui/Button';
import { type PersonalizationGoal } from './PersonalizationScreen';

interface WelcomeScreenProps {
  onComplete: () => void;
  selectedGoal?: PersonalizationGoal;
}

const goalMessages = {
  stress: {
    emoji: '🌱',
    title: 'Selamat Datang di Perjalanan Ketenangan',
    message: 'Mari kita mulai dengan latihan pernapasan yang akan membantumu menemukan kedamaian di tengah kesibukan.',
    suggestion: 'Mulai dengan sesi "Pernapasan Mindful" 5 menit setiap hari'
  },
  focus: {
    emoji: '🎯',
    title: 'Waktunya Mengasah Fokus',
    message: 'Dengan latihan yang konsisten, kamu akan merasakan peningkatan konsentrasi dan kejernihan pikiran.',
    suggestion: 'Coba sesi "Konsentrasi Terarah" untuk memulai perjalananmu'
  },
  sleep: {
    emoji: '🌙',
    title: 'Menuju Tidur yang Berkualitas',
    message: 'Ritual malam yang tenang akan membantumu mendapatkan istirahat yang lebih dalam dan menyegarkan.',
    suggestion: 'Mulai dengan "Body Scan" sebelum tidur untuk relaksasi total'
  },
  curious: {
    emoji: '✨',
    title: 'Selamat Datang, Penjelajah Batin',
    message: 'Perjalanan mindfulness ini akan membuka pintu menuju pemahaman diri yang lebih dalam.',
    suggestion: 'Eksplorasi berbagai teknik meditasi untuk menemukan yang cocok untukmu'
  }
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onComplete, 
  selectedGoal = 'curious' 
}) => {
  const [cairnProgress, setCairnProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  
  const goalInfo = goalMessages[selectedGoal];

  useEffect(() => {
    // Animate cairn building
    const progressTimer = setTimeout(() => {
      const progressInterval = setInterval(() => {
        setCairnProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setShowContent(true);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
    }, 500);

    return () => clearTimeout(progressTimer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-primary-50 via-accent-50 to-meditation-zen-50">
      {/* Enhanced Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-16 right-8 w-32 h-32 rounded-full bg-primary-400"
        />
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 left-12 w-24 h-24 rounded-full bg-accent-400"
        />
        <motion.div 
          animate={{
            rotate: [0, 360],
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-meditation-zen-400"
        />
      </div>

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-md mx-auto text-center">
          
          {/* Main illustration with enhanced animations */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative inline-block">
              {/* Goal emoji background */}
              <motion.div 
                animate={showContent ? {
                  scale: 1.5,
                  opacity: 0.15,
                } : {
                  scale: 1,
                  opacity: 0
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-primary-400"
              />
              
              {/* Cairn icon with breathing effect */}
              <motion.div 
                className="relative z-10 mb-4"
                animate={showContent ? {
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <CairnIcon 
                  progress={cairnProgress} 
                  size={80} 
                  className="text-primary-600 mx-auto"
                />
              </motion.div>
              
              {/* Goal emoji with bounce animation */}
              <motion.div 
                className="absolute -top-2 -right-2 text-3xl"
                initial={{ scale: 0, opacity: 0 }}
                animate={showContent ? {
                  scale: [0, 1.2, 1],
                  opacity: 1
                } : {}}
                transition={{
                  duration: 0.6,
                  delay: 1,
                  ease: "easeOut"
                }}
              >
                {goalInfo.emoji}
              </motion.div>
            </div>
          </motion.div>

          {/* Welcome content with enhanced animations */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                {/* Title */}
                <motion.h1 
                  className="text-2xl font-heading text-gray-800 mb-4 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {goalInfo.title}
                </motion.h1>

                {/* Message */}
                <motion.p 
                  className="text-gray-600 font-body leading-relaxed mb-6 text-base"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {goalInfo.message}
                </motion.p>

                {/* Enhanced suggestion card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mb-6"
                >
                  <Card className="bg-white/70 backdrop-blur-sm border border-primary-100">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mt-0.5">
                        <span className="text-lg">{goalInfo.emoji}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-body text-sm text-gray-700 leading-relaxed">
                          <span className="font-semibold text-primary-700">Saran untuk memulai:</span><br />
                          {goalInfo.suggestion}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Sample breathing exercise */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mb-6"
                >
                  <BreathingCard
                    title="Coba Sekarang"
                    description="Latihan pernapasan 3 menit untuk merasakan ketenangan"
                    duration={4000}
                    isActive={showBreathing}
                    onClick={() => setShowBreathing(!showBreathing)}
                  />
                </motion.div>

                {/* Action button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mb-6"
                >
                  <Button
                    onClick={onComplete}
                    size="large"
                    className="w-full bg-primary-600 text-white hover:bg-primary-700 shadow-lg"
                  >
                    Mulai Perjalanan Saya
                  </Button>
                </motion.div>

                {/* Enhanced Stats preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="mt-8"
                >
                  <Card className="bg-white/50 backdrop-blur-sm border border-gray-100">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-heading text-gray-700 mb-1">0</div>
                        <div className="text-xs text-gray-500 font-body">Hari berturut</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-heading text-gray-700 mb-1">0</div>
                        <div className="text-xs text-gray-500 font-body">Sesi selesai</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-heading text-gray-700 mb-1">0</div>
                        <div className="text-xs text-gray-500 font-body">Menit meditasi</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Loading state */}
          <AnimatePresence>
            {!showContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.p 
                  className="text-gray-500 font-body text-sm mb-4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Menyiapkan pengalaman meditasi personalmu...
                </motion.p>
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary-400"
                      animate={{
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Floating elements */}
      <AnimatePresence>
        {showContent && (
          <>
            <motion.div 
              initial={{ opacity: 0, scale: 0, x: -50, y: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
              className="absolute top-32 left-8"
            >
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shadow-lg backdrop-blur-sm"
              >
                <span className="text-sm">🧘‍♀️</span>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0, x: 50, y: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              transition={{ delay: 2.5, duration: 0.8, ease: "easeOut" }}
              className="absolute bottom-32 right-12"
            >
              <motion.div 
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, -3, 3, 0]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center shadow-lg backdrop-blur-sm"
              >
                <span className="text-sm">💚</span>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3, duration: 0.8, ease: "easeOut" }}
              className="absolute top-1/2 right-8"
            >
              <motion.div 
                animate={{ 
                  y: [0, -6, 0],
                  x: [0, 3, -3, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                className="w-6 h-6 rounded-full bg-meditation-zen-100 flex items-center justify-center shadow-md backdrop-blur-sm"
              >
                <span className="text-xs">✨</span>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};