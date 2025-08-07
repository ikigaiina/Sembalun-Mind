import React from 'react';
import { motion } from 'framer-motion';
import { CairnProgress } from './CairnProgress';

interface SembalunWelcomeProps {
  progress?: number;
  userName?: string;
}

export const SembalunWelcome: React.FC<SembalunWelcomeProps> = ({ 
  progress = 0,
  userName = "Sobat Mindful"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-center mb-12"
    >
      {/* Cairn Symbol with Progress */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.3,
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="relative"
        >
          {/* Ambient mountain glow */}
          <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-2xl transform scale-150 opacity-40" />
          
          {/* Cairn with enhanced styling */}
          <div className="relative bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/30 dark:to-gray-900/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl">
            <CairnProgress 
              progress={progress}
              size="large"
              showLabel={true}
              label="Perjalanan Mindfulness"
            />
          </div>
        </motion.div>
      </div>

      {/* Welcome Message with Lora Typography */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4 font-heading">
          Selamat Datang, {userName}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-body">
          Mari temukan kedamaian batin melalui perjalanan meditasi yang dipandu dengan kearifan Indonesia
        </p>
      </motion.div>

      {/* Indonesian Cultural Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-8 max-w-lg mx-auto"
      >
        <blockquote className="text-primary-600 dark:text-primary-400 font-medium italic text-lg font-heading">
          "Seperti tumpukan batu cairn yang menunjukkan jalan, 
          setiap langkah kecil membawa kita pada kedamaian sejati"
        </blockquote>
        <cite className="text-sm text-gray-500 dark:text-gray-500 mt-2 block">
          — Filosofi Sembalun
        </cite>
      </motion.div>
    </motion.div>
  );
};