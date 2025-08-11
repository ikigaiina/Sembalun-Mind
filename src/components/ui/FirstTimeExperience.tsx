import React from 'react';
import { motion } from 'framer-motion';
import { Play, Mountain, Sparkles, Heart, Wind } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface FirstTimeExperienceProps {
  onStartFirstSession: () => void;
  onExploreApp: () => void;
  isGuest?: boolean;
}

export const FirstTimeExperience: React.FC<FirstTimeExperienceProps> = ({
  onStartFirstSession,
  onExploreApp,
  isGuest = false
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-meditation-zen-50 via-white to-meditation-calm-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center"
      >
        <Card className="p-12 bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          {/* Animated Welcome Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-meditation-zen-100 to-meditation-calm-100 rounded-full flex items-center justify-center"
          >
            <Mountain className="w-16 h-16 text-meditation-zen-600" />
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-heading font-bold text-gray-800 mb-4">
              Selamat Datang di Sembalun
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              {isGuest 
                ? "Mulai perjalanan mindfulness Anda hari ini. Daftar untuk melihat perkembangan dan membangun kebiasaan meditasi yang konsisten."
                : "Ini adalah awal perjalanan mindfulness Anda. Mari mulai dengan sesi singkat untuk merasakan kedamaian batin."
              }
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wind className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Pernapasan Mindful</h3>
                <p className="text-sm text-gray-600">Teknik dasar untuk ketenangan batin</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Metta Meditation</h3>
                <p className="text-sm text-gray-600">Kultivasi cinta kasih universal</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Kesadaran Penuh</h3>
                <p className="text-sm text-gray-600">Hadir sepenuhnya di momen ini</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="space-y-4"
          >
            <Button
              variant="meditation"
              size="xl"
              onClick={onStartFirstSession}
              className="w-full"
            >
              <Play className="w-6 h-6 mr-3" />
              {isGuest ? "Coba Meditasi Gratis" : "Mulai Sesi Pertama"}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={onExploreApp}
              className="w-full"
            >
              Jelajahi Aplikasi Dulu
            </Button>
          </motion.div>

          {/* Inspiring Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 pt-8 border-t border-gray-200"
          >
            <p className="text-gray-500 italic">
              "Perjalanan seribu mil dimulai dengan satu langkah"
            </p>
            <p className="text-xs text-gray-400 mt-1">— Lao Tzu</p>
          </motion.div>
        </Card>
      </motion.div>

      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-meditation-zen-300 rounded-full opacity-20"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              delay: i * 3
            }}
          />
        ))}
      </div>
    </div>
  );
};