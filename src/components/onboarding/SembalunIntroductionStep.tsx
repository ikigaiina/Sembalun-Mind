import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Card, CairnIcon } from '../ui';
import { Button } from '../ui/Button';
import { scrollToTop } from '../../hooks/useScrollToTop';

interface SembalunIntroductionStepProps {
  onContinue: () => void;
  onSkip?: () => void;
}

const introductionSlides = [
  {
    title: "Selamat Datang di Sembalun",
    subtitle: "Aplikasi Meditasi Indonesia",
    content: "Sembalun adalah aplikasi meditasi pertama yang dibuat khusus untuk masyarakat Indonesia, dengan memahami kearifan lokal dan keragaman budaya spiritual di nusantara.",
    icon: "🏔️",
    bgColor: "from-primary-50 to-primary-100"
  },
  {
    title: "Menghormati Tradisi Nusantara",
    subtitle: "Kearifan Lokal dalam Meditasi Modern",
    content: "Kami menggabungkan teknik mindfulness modern dengan nilai-nilai spiritual tradisional Indonesia - dari dzikir Islam, meditasi Buddha, hingga praktik kontemplasi Jawa.",
    icon: "🌺",
    bgColor: "from-accent-50 to-accent-100"
  },
  {
    title: "Dipersonalisasi untuk Anda",
    subtitle: "Setiap Perjalanan adalah Unik",
    content: "Dengan memahami latar belakang budaya, kepercayaan, dan preferensi personal Anda, Sembalun akan memberikan pengalaman meditasi yang benar-benar sesuai dengan diri Anda.",
    icon: "✨",
    bgColor: "from-meditation-zen-50 to-meditation-zen-100"
  },
  {
    title: "Waktunya Menemukan Ketenangan",
    subtitle: "Sembalun Menanti Perjalanan Anda",
    content: "Seperti keindahan Gunung Rinjani yang menenangkan jiwa, Sembalun hadir untuk membimbing Anda menemukan kedamaian batin melalui praktik meditasi yang penuh makna.",
    icon: "🌄",
    bgColor: "from-green-50 to-green-100"
  }
];

export const SembalunIntroductionStep: React.FC<SembalunIntroductionStepProps> = ({
  onContinue,
  onSkip
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [dragDirection, setDragDirection] = useState(0);
  const constraintsRef = useRef(null);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setTimeout(() => {
      if (currentSlide < introductionSlides.length - 1) {
        setCurrentSlide(prev => prev + 1);
      } else {
        setIsAutoPlaying(false);
      }
    }, 6000); // 6 seconds per slide (slower auto-advance)

    return () => clearTimeout(timer);
  }, [currentSlide, isAutoPlaying]);

  const handleSlideClick = () => {
    setIsAutoPlaying(false);
    if (currentSlide < introductionSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  };

  // Mobile swipe handlers
  const handleDragStart = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    const swipeVelocityThreshold = 500;
    
    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold) {
      if (info.offset.x > 0 && currentSlide > 0) {
        // Swipe right - go to previous slide
        setCurrentSlide(prev => prev - 1);
      } else if (info.offset.x < 0 && currentSlide < introductionSlides.length - 1) {
        // Swipe left - go to next slide
        setCurrentSlide(prev => prev + 1);
      }
    }
  }, [currentSlide]);

  const currentSlideData = introductionSlides[currentSlide];
  const isLastSlide = currentSlide === introductionSlides.length - 1;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto px-6 text-center">
        {/* Simple progress bar indicator */}
        <div className="mb-4">
            <div className="flex justify-center items-center space-x-1 text-xs text-gray-500 mb-2">
              <span>{currentSlide + 1}</span>
              <span>/</span>
              <span>{introductionSlides.length}</span>
            </div>
            <div className="w-24 mx-auto h-0.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentSlide + 1) / introductionSlides.length) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Slide content with animations and swipe support */}
          <div ref={constraintsRef} className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dragDirection > 0 ? 20 : -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                drag="x"
                dragConstraints={constraintsRef}
                dragElastic={0.1}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={handleSlideClick}
                className="cursor-pointer select-none"
                whileDrag={{ scale: 0.95 }}
              >
              {/* Enhanced Decorated Frame */}
              <motion.div 
                className={`relative bg-gradient-to-br ${currentSlideData.bgColor} rounded-3xl shadow-2xl mb-8 overflow-hidden`}
                style={{
                  background: `linear-gradient(135deg, ${currentSlideData.bgColor.includes('primary') ? 'rgba(99, 102, 241, 0.1)' : currentSlideData.bgColor.includes('accent') ? 'rgba(236, 72, 153, 0.1)' : currentSlideData.bgColor.includes('meditation') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(14, 165, 233, 0.1)'}, rgba(255, 255, 255, 0.2))`
                }}
                whileHover={{ scale: 1.02, y: -3 }}
                transition={{ duration: 0.3 }}
              >

                {/* Multiple Sparkle Layers */}
                <motion.div
                  className="absolute top-4 right-4 text-2xl z-20"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 15, -15, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: currentSlide * 0.2
                  }}
                >
                  ✨
                </motion.div>

                <motion.div
                  className="absolute top-4 left-4 text-xl opacity-80 z-20"
                  animate={{ 
                    scale: [0.8, 1.2, 0.8],
                    rotate: [0, -10, 10, 0]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    delay: currentSlide * 0.3
                  }}
                >
                  🌟
                </motion.div>

                <motion.div
                  className="absolute bottom-4 right-4 text-lg opacity-70 z-20"
                  animate={{ 
                    scale: [0.9, 1.4, 0.9],
                    opacity: [0.5, 0.9, 0.5]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    delay: currentSlide * 0.4
                  }}
                >
                  💫
                </motion.div>

                <motion.div
                  className="absolute bottom-4 left-4 text-lg opacity-60 z-20"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, 20, -20, 0]
                  }}
                  transition={{ 
                    duration: 2.8, 
                    repeat: Infinity,
                    delay: currentSlide * 0.1
                  }}
                >
                  🌸
                </motion.div>

                {/* Floating Nature Elements */}
                <motion.div
                  className="absolute top-1/4 right-8 text-base opacity-50 z-10"
                  animate={{ 
                    y: [0, -12, 0],
                    rotate: [0, 8, -8, 0],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    delay: 1
                  }}
                >
                  🍃
                </motion.div>

                <motion.div
                  className="absolute top-1/3 left-8 text-base opacity-50 z-10"
                  animate={{ 
                    y: [0, 10, 0],
                    x: [0, 5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    delay: 1.5
                  }}
                >
                  🦋
                </motion.div>

                <motion.div
                  className="absolute top-2/3 right-12 text-sm opacity-40 z-10"
                  animate={{ 
                    scale: [0.8, 1.2, 0.8],
                    rotate: [0, 360, 0],
                    opacity: [0.2, 0.6, 0.2]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity,
                    delay: 2
                  }}
                >
                  🌿
                </motion.div>

                {/* Enhanced Shimmer Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent z-5"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatDelay: 5,
                    ease: "linear"
                  }}
                />

                {/* Content Container with Glass Effect */}
                <div className="relative z-15 p-8 backdrop-blur-sm">
                  {/* Enhanced Icon with Multiple Glow Effects */}
                  <motion.div 
                    className="relative text-5xl mb-6 flex justify-center"
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Multiple Glow Layers */}
                    <motion.div
                      className="absolute inset-0 bg-yellow-300/20 rounded-full blur-2xl"
                      animate={{ 
                        scale: [0.8, 1.3, 0.8],
                        opacity: [0.3, 0.7, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-pink-300/15 rounded-full blur-xl"
                      animate={{ 
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0.5, 0.2]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: 0.5
                      }}
                    />
                    <span className="relative z-10 drop-shadow-2xl filter">
                      {currentSlideData.icon}
                    </span>
                  </motion.div>

                  {/* Enhanced Title with Gradient Text */}
                  <motion.h1 
                    className="text-3xl font-heading font-bold mb-3 text-center"
                    style={{
                      background: 'linear-gradient(135deg, #1f2937, #374151, #1f2937)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {currentSlideData.title}
                  </motion.h1>

                  {/* Enhanced Subtitle with Decorative Elements */}
                  <motion.h2 
                    className="text-lg font-body font-semibold text-primary-600 mb-5 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <span className="inline-block mr-2 text-pink-500">🌺</span>
                    {currentSlideData.subtitle}
                    <span className="inline-block ml-2 text-pink-500">🌺</span>
                  </motion.h2>

                  {/* Animated Decorative Divider */}
                  <motion.div
                    className="flex justify-center mb-5"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-primary-500 rounded-full"
                        animate={{ scaleX: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.div 
                        className="w-3 h-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                      <motion.div 
                        className="w-16 h-0.5 bg-gradient-to-r from-primary-500 via-pink-400 to-accent-400 rounded-full"
                        animate={{ scaleX: [0.9, 1.1, 0.9] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                      />
                      <motion.div 
                        className="w-3 h-3 bg-gradient-to-r from-accent-500 to-cyan-500 rounded-full"
                        animate={{ 
                          scale: [1, 1.4, 1],
                          rotate: [360, 180, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                      />
                      <motion.div 
                        className="w-8 h-0.5 bg-gradient-to-r from-accent-500 via-cyan-400 to-transparent rounded-full"
                        animate={{ scaleX: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.7 }}
                      />
                    </div>
                  </motion.div>

                  {/* Enhanced Content with Glass Background */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    {/* Glass Background Effect */}
                    <div className="absolute inset-0 bg-white/25 rounded-2xl backdrop-blur-md border border-white/30 shadow-inner"></div>
                    
                    <p className="relative text-gray-700 font-body leading-relaxed text-base text-center px-6 py-4 rounded-2xl">
                      {currentSlideData.content}
                    </p>
                  </motion.div>

                  {/* Bottom Animated Dots */}
                  <motion.div
                    className="flex justify-center mt-6 space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-400 via-pink-400 to-accent-400"
                        animate={{ 
                          scale: [0.8, 1.4, 0.8],
                          opacity: [0.4, 0.9, 0.4],
                          backgroundColor: [
                            'rgba(99, 102, 241, 0.6)',
                            'rgba(236, 72, 153, 0.6)',
                            'rgba(14, 165, 233, 0.6)',
                            'rgba(99, 102, 241, 0.6)'
                          ]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Enhanced Inner Shadow and Highlights */}
                <div 
                  className="absolute inset-0 rounded-3xl pointer-events-none z-10" 
                  style={{ 
                    boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.4), inset 0 -1px 3px rgba(0,0,0,0.1)' 
                  }}
                />
              </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>


          {/* Action buttons */}
          <div className="space-y-4">
            {isLastSlide ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Enhanced attractive button with high contrast */}
                <motion.button
                  onClick={() => {
                    scrollToTop(true);
                    onContinue();
                  }}
                  className="relative w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold text-lg shadow-2xl overflow-hidden group border-2 border-emerald-700"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 25px 35px -5px rgba(5, 150, 105, 0.4), 0 10px 15px -3px rgba(5, 150, 105, 0.2)",
                    background: 'linear-gradient(135deg, #047857 0%, #0f766e 50%, #0e7490 100%)'
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Bright shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      repeatDelay: 4,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Bright sparkle effects */}
                  <motion.div
                    className="absolute top-3 right-5 text-yellow-300 text-lg drop-shadow-md"
                    animate={{ 
                      scale: [1, 1.4, 1],
                      rotate: [0, 15, -15, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    ✨
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-3 left-5 text-yellow-300 text-base drop-shadow-md"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      rotate: [0, -15, 15, 0]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  >
                    🌟
                  </motion.div>
                  
                  {/* Additional sparkles */}
                  <motion.div
                    className="absolute top-1/2 left-8 text-yellow-200 text-sm"
                    animate={{ 
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      delay: 1
                    }}
                  >
                    💫
                  </motion.div>
                  
                  {/* Main text with high contrast */}
                  <div className="relative z-10 flex items-center justify-center space-x-3">
                    <motion.span
                      className="text-2xl drop-shadow-sm"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🧘‍♀️
                    </motion.span>
                    <span className="drop-shadow-sm tracking-wide">Mulai Perjalanan Meditasi Saya</span>
                    <motion.span
                      className="text-xl font-bold drop-shadow-sm"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </div>
                  
                  
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
                </motion.button>
                
                <motion.p 
                  className="text-sm text-gray-500 mt-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="inline-block mr-1">🌸</span>
                  Mari kita mulai dengan mengenal diri Anda lebih dalam
                  <span className="inline-block ml-1">🌸</span>
                </motion.p>
              </motion.div>
            ) : (
              <div className="flex space-x-4">
                {/* Enhanced Back Button - LEFT SIDE */}
                {currentSlide > 0 && (
                  <motion.button
                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                    className="relative flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-gray-500 via-gray-600 to-slate-600 text-white font-semibold shadow-lg overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #475569 100%)',
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 15px 25px -5px rgba(107, 114, 128, 0.3)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '100%' }}
                      animate={{ x: '-100%' }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        repeatDelay: 5
                      }}
                    />
                    
                    {/* Sparkle */}
                    <motion.div
                      className="absolute top-1 left-2 text-blue-200 text-sm"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, -10, 10, 0]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity 
                      }}
                    >
                      💫
                    </motion.div>
                    
                    <div className="relative z-10 flex items-center justify-center space-x-2">
                      <motion.span
                        animate={{ x: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ←
                      </motion.span>
                      <span className="drop-shadow-sm">Kembali</span>
                    </div>
                    
                    {/* Border glow */}
                    <motion.div
                      className="absolute inset-0 rounded-xl border border-gray-300/40"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    />
                  </motion.button>
                )}
                
                {/* Enhanced Continue Button - RIGHT SIDE */}
                <motion.button
                  onClick={handleSlideClick}
                  className="relative flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 15px 25px -5px rgba(37, 99, 235, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      repeatDelay: 4
                    }}
                  />
                  
                  {/* Sparkle */}
                  <motion.div
                    className="absolute top-1 right-2 text-yellow-200 text-sm"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity 
                    }}
                  >
                    ✨
                  </motion.div>
                  
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="drop-shadow-sm">Lanjutkan</span>
                    <motion.span
                      animate={{ x: [0, 2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </div>
                  
                  {/* Border glow */}
                  <motion.div
                    className="absolute inset-0 rounded-xl border border-blue-300/50"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile swipe instruction and auto-play indicator */}
          <div className="mt-4 space-y-2">
            {/* Mobile swipe hint */}
            <motion.div
              className="flex items-center justify-center text-xs text-gray-400"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="mr-2">💫</span>
              <span>Geser ke kiri/kanan atau ketuk untuk lanjut</span>
              <span className="ml-2">💫</span>
            </motion.div>
            
            {/* Auto-play indicator */}
            {isAutoPlaying && !isLastSlide && (
              <motion.div
                className="flex items-center justify-center text-xs text-gray-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="mr-2">Otomatis lanjut dalam 6 detik</span>
                <button 
                  onClick={() => setIsAutoPlaying(false)}
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  jeda
                </button>
              </motion.div>
            )}
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-400"
        />
        <motion.div 
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.015, 0.04, 0.015],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-20 -left-20 w-36 h-36 rounded-full bg-accent-400"
        />
      </div>
    </div>
  );
};

export default SembalunIntroductionStep;