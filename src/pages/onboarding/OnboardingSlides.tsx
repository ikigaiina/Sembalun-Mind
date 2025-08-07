import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CairnIcon, BreathingCard, MoodSelector, Card } from '../../components/ui';
import type { MoodType } from '../../types/mood';

interface Slide {
  id: number;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

interface OnboardingSlidesProps {
  onComplete: () => void;
  onSkip: () => void;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Selamat Datang di Sembalun",
    description: "Temukan ketenangan dalam dunia yang riuh melalui praktik mindfulness yang dirancang khusus untuk kehidupan Indonesia modern.",
    illustration: (
      <motion.div 
        className="relative w-full max-w-sm mx-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Enhanced Sembalun Hills illustration */}
        <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 via-accent-100 to-meditation-zen-100 p-6">
          {/* Animated background hills */}
          <motion.div 
            className="absolute inset-0"
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              background: `
                radial-gradient(circle at 20% 80%, rgba(106, 143, 111, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(169, 193, 217, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(197, 108, 62, 0.08) 0%, transparent 50%)
              `
            }}
          />
          
          {/* Floating CairnIcon */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <CairnIcon size={64} progress={75} className="text-primary-600" />
          </motion.div>
          
          {/* Floating mindfulness icons */}
          <motion.div 
            className="absolute top-4 left-6"
            animate={{ 
              y: [0, -8, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <span className="text-2xl">🌸</span>
          </motion.div>
          
          <motion.div 
            className="absolute top-8 right-8"
            animate={{ 
              y: [0, -6, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          >
            <span className="text-xl">🧘‍♀️</span>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-6 left-8"
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.4, 0.9, 0.4]
            }}
            transition={{ 
              duration: 3.5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          >
            <span className="text-lg">✨</span>
          </motion.div>
        </div>
      </motion.div>
    )
  },
  {
    id: 2,
    title: "Coba Latihan Pernapasan",
    description: "Mari rasakan langsung manfaat pernapasan mindful. Sentuh kartu di bawah untuk memulai sesi pernapasan singkat.",
    illustration: (
      <motion.div 
        className="relative w-full max-w-sm mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Interactive BreathingCard Demo */}
        <div className="mb-4">
          <BreathingCard
            title="Pernapasan Tenang"
            description="Latihan 4 detik untuk merasakan ketenangan instant"
            duration={4000}
            isActive={false}
            onClick={() => {}}
          />
        </div>
        
        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 bg-primary-50 border border-primary-200">
            <div className="text-center">
              <div className="text-2xl mb-2">💡</div>
              <p className="text-sm text-gray-700 font-body">
                <span className="font-semibold">Tips:</span> Ikuti panduan visual dan bernapas dengan perlahan. 
                Rasakan bagaimana tubuh dan pikiran mulai tenang.
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    )
  },
  {
    id: 3,
    title: "Kenali Perasaanmu",
    description: "Mengidentifikasi emosi adalah langkah pertama dalam perjalanan mindfulness. Mari eksplorasi bagaimana perasaanmu hari ini.",
    illustration: (
      <motion.div 
        className="relative w-full max-w-sm mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Interactive MoodSelector Demo */}
        <div className="mb-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <h3 className="font-heading font-semibold text-gray-800 mb-2">
                Bagaimana perasaanmu?
              </h3>
              <p className="text-sm text-gray-600 font-body">
                Pilih emoji yang mewakili perasaanmu
              </p>
            </div>
            
            <MoodSelector
              selectedMood={undefined}
              onMoodSelect={(mood) => {
                // Provide visual feedback and update state
                console.log('Selected mood:', mood);
              }}
              showLabels={true}
              className="mb-4"
              label="Pilih emoji yang mewakili perasaanmu"
            />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center space-x-2 text-xs text-gray-500">
                <span>✓</span>
                <span>Tidak ada jawaban yang salah</span>
              </div>
            </motion.div>
          </Card>
        </div>
        
        {/* Emotional awareness tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Card className="p-4 bg-accent-50 border border-accent-200">
            <div className="flex items-start space-x-3">
              <span className="text-lg">🌱</span>
              <div>
                <p className="text-sm text-gray-700 font-body leading-relaxed">
                  <span className="font-semibold text-accent-700">Ingat:</span> Setiap emosi valid dan membawa pesan. 
                  Mindfulness membantu kita menerima perasaan tanpa menghakimi.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    )
  },
  {
    id: 4,
    title: "Perjalanan Dimulai dari Sini",
    description: "Seperti cairn yang dibangun batu demi batu, perjalanan mindfulness adalah proses yang indah dan berkelanjutan. Mari mulai bersama!",
    illustration: (
      <motion.div 
        className="relative w-full max-w-sm mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Enhanced Cairn growth visualization */}
        <div className="relative h-48 flex items-center justify-center">
          {/* Animated cairn with breathing effect */}
          <motion.div 
            className="relative"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <CairnIcon size={80} progress={100} className="text-primary-600" />
            
            {/* Glowing rings */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-24 h-24 rounded-full border-2 border-primary-400" />
            </motion.div>
            
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.8, 1],
                opacity: [0.2, 0.05, 0.2]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <div className="w-32 h-32 rounded-full border-2 border-accent-400" />
            </motion.div>
          </motion.div>
          
          {/* Progress steps visualization */}
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
            <div className="flex flex-col space-y-3">
              {[
                { icon: "🌱", label: "Mulai" },
                { icon: "🌸", label: "Tumbuh" },
                { icon: "🌳", label: "Berkembang" }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.3 + 0.5 }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                  >
                    <span className="text-sm">{step.icon}</span>
                  </motion.div>
                  <span className="text-xs text-gray-600 font-medium">
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Achievement preview */}
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
            <motion.div
              className="bg-white rounded-lg shadow-lg p-3 border-l-4 border-primary-400"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 }}
            >
              <div className="text-center">
                <div className="text-lg mb-1">🏆</div>
                <div className="text-xs font-semibold text-gray-700">Pencapaian</div>
                <div className="text-xs text-gray-500">menunggumu!</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
  }
];

export const OnboardingSlides: React.FC<OnboardingSlidesProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe left - next slide
        setSwipeDirection('left');
        handleNext();
      } else {
        // Swipe right - previous slide
        setSwipeDirection('right');
        handlePrevious();
      }
    }
    
    setTouchStart(null);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        onComplete();
      }
      setIsTransitioning(false);
      setSwipeDirection(null);
    }, 300);
  };

  const handlePrevious = () => {
    if (isTransitioning || currentSlide === 0) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(currentSlide - 1);
      setIsTransitioning(false);
      setSwipeDirection(null);
    }, 300);
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-meditation-zen-50 relative overflow-hidden">
      {/* Enhanced Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.02, 0.06, 0.02],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-300"
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.02, 0.05, 0.02],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent-300"
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Enhanced Skip button */}
        <div className="flex justify-end p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSkip}
            className="text-gray-500 font-body text-sm hover:text-gray-700 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/50 backdrop-blur-sm"
          >
            Lewati
          </motion.button>
        </div>

        {/* Enhanced Slides container */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ 
                opacity: 0, 
                x: swipeDirection === 'left' ? 100 : swipeDirection === 'right' ? -100 : 0,
                scale: 0.95
              }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: {
                  duration: 0.5,
                  ease: "easeOut"
                }
              }}
              exit={{ 
                opacity: 0, 
                x: swipeDirection === 'left' ? -100 : 100,
                scale: 0.95,
                transition: {
                  duration: 0.3,
                  ease: "easeIn"
                }
              }}
              className="w-full h-full flex flex-col justify-center px-8 py-12"
            >
              <div className="max-w-sm mx-auto text-center">
                
                {/* Enhanced Illustration */}
                <motion.div 
                  className="mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  {slides[currentSlide].illustration}
                </motion.div>

                {/* Enhanced Title */}
                <motion.h2 
                  className="text-2xl sm:text-3xl font-heading font-bold text-gray-800 mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {slides[currentSlide].title}
                </motion.h2>

                {/* Enhanced Description */}
                <motion.p 
                  className="text-gray-600 font-body leading-relaxed text-base max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  {slides[currentSlide].description}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Enhanced Bottom navigation */}
        <motion.div 
          className="p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="max-w-sm mx-auto">
            
            {/* Enhanced Progress dots with CairnIcon integration */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              <div className="flex space-x-2">
                {slides.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className="relative"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: index === currentSlide 
                          ? '#6A8F6F' 
                          : 'rgba(107, 114, 128, 0.3)'
                      }}
                      animate={index === currentSlide ? {
                        scale: [1, 1.2, 1]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: index === currentSlide ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                    />
                    {index === currentSlide && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary-400 opacity-30"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center space-x-2 ml-4">
                <CairnIcon size={16} progress={(currentSlide + 1) / slides.length * 100} className="text-primary-600" />
                <span className="text-xs text-gray-500 font-medium">
                  {currentSlide + 1}/{slides.length}
                </span>
              </div>
            </div>

            {/* Enhanced Navigation buttons */}
            <div className="flex justify-between items-center">
              <motion.button
                onClick={handlePrevious}
                disabled={currentSlide === 0}
                whileHover={currentSlide > 0 ? { scale: 1.05 } : {}}
                whileTap={currentSlide > 0 ? { scale: 0.95 } : {}}
                className={`
                  px-6 py-3 rounded-xl font-body text-sm font-medium transition-all duration-200
                  ${currentSlide === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-gray-800 bg-white/70 hover:bg-white/90 backdrop-blur-sm shadow-sm'
                  }
                `}
              >
                Kembali
              </motion.button>
              
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isTransitioning}
                className="px-8 py-3 rounded-xl font-body font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-all duration-200 shadow-lg backdrop-blur-sm"
              >
                {isTransitioning ? (
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Loading...</span>
                  </div>
                ) : (
                  currentSlide === slides.length - 1 ? 'Mulai Perjalanan' : 'Lanjut'
                )}
              </motion.button>
            </div>

            {/* Swipe hint */}
            {currentSlide === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.6 }}
                className="text-center mt-6"
              >
                <p className="text-xs text-gray-500 font-body">
                  Geser kiri atau kanan untuk navigasi
                </p>
                <motion.div
                  animate={{ x: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="inline-block mt-1"
                >
                  <span className="text-lg">👆</span>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};