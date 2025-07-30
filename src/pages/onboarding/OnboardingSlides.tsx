import { useState, useRef } from 'react';
import { CairnIcon } from '../../components/ui/CairnIcon';

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
    title: "Temukan Jeda di Dunia yang Riuh",
    description: "Dalam kesibukan sehari-hari, berikan dirimu momen untuk bernapas dan menemukan ketenangan.",
    illustration: (
      <div className="relative w-48 h-48 mx-auto">
        {/* Misty hills illustration */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id="hillGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.1"/>
              </linearGradient>
              <linearGradient id="mistGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-background)" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="var(--color-background)" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            
            {/* Background hills */}
            <path d="M0,120 Q50,80 100,100 T200,90 L200,200 L0,200 Z" fill="url(#hillGradient1)"/>
            <path d="M0,140 Q60,100 120,120 T200,110 L200,200 L0,200 Z" fill="var(--color-accent)" fillOpacity="0.2"/>
            <path d="M0,160 Q80,120 160,140 T200,130 L200,200 L0,200 Z" fill="var(--color-primary)" fillOpacity="0.15"/>
            
            {/* Mist overlay */}
            <rect x="0" y="80" width="200" height="60" fill="url(#mistGradient)"/>
          </svg>
        </div>
        
        {/* Floating meditation icon */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
            <span className="text-lg">🧘‍♀️</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Pahami Emosi, Kenali Diri",
    description: "Jelajahi perasaan dan pikiran dengan lembut. Setiap emosi adalah guru yang membawa kebijaksanaan.",
    illustration: (
      <div className="relative w-48 h-48 mx-auto">
        {/* Heart and journal imagery */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Journal/book */}
            <div 
              className="w-20 h-24 rounded-lg shadow-lg transform rotate-12"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <div className="p-2">
                <div className="w-full h-1 bg-white bg-opacity-50 rounded mb-1"></div>
                <div className="w-3/4 h-1 bg-white bg-opacity-30 rounded mb-1"></div>
                <div className="w-full h-1 bg-white bg-opacity-30 rounded mb-1"></div>
                <div className="w-1/2 h-1 bg-white bg-opacity-30 rounded"></div>
              </div>
            </div>
            
            {/* Heart overlay */}
            <div className="absolute -top-2 -right-2 animate-pulse">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--color-warm)">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            
            {/* Floating emotion bubbles */}
            <div className="absolute -left-8 top-2 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <span className="text-2xl">😊</span>
            </div>
            <div className="absolute -right-8 bottom-2 animate-bounce" style={{ animationDelay: '1s' }}>
              <span className="text-2xl">💭</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Tumbuh Setiap Hari, Selangkah Demi Selangkah",
    description: "Seperti cairn yang dibangun batu demi batu, perjalanan mindfulness adalah proses yang indah dan berkelanjutan.",
    illustration: (
      <div className="relative w-48 h-48 mx-auto">
        {/* Cairn visual with growth animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <CairnIcon progress={100} size={80} className="text-primary animate-pulse" />
            
            {/* Growth rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-24 h-24 rounded-full border-2 opacity-30 animate-ping"
                style={{ borderColor: 'var(--color-primary)', animationDuration: '3s' }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-32 h-32 rounded-full border-2 opacity-20 animate-ping"
                style={{ 
                  borderColor: 'var(--color-accent)', 
                  animationDuration: '3s',
                  animationDelay: '1s'
                }}
              />
            </div>
            
            {/* Progress steps */}
            <div className="absolute -left-16 top-8">
              <div className="flex flex-col space-y-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ 
                        backgroundColor: 'var(--color-primary)',
                        animationDelay: `${step * 0.5}s`
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export const OnboardingSlides: React.FC<OnboardingSlidesProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
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
        handleNext();
      } else {
        // Swipe right - previous slide
        handlePrevious();
      }
    }
    
    setTouchStart(null);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={onSkip}
          className="text-gray-500 font-body text-sm hover:text-gray-700 transition-colors duration-200 px-4 py-2 rounded-lg"
        >
          Lewati
        </button>
      </div>

      {/* Slides container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="w-full flex-shrink-0 flex flex-col justify-center px-8 py-12">
              <div className="max-w-sm mx-auto text-center">
                
                {/* Illustration */}
                <div className="mb-12">
                  {slide.illustration}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-heading text-gray-800 mb-6 leading-tight">
                  {slide.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 font-body leading-relaxed text-base">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="p-8">
        <div className="max-w-sm mx-auto">
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className="w-2 h-2 rounded-full transition-all duration-200 hover:scale-125"
                style={{
                  backgroundColor: index === currentSlide 
                    ? 'var(--color-primary)' 
                    : 'rgba(107, 114, 128, 0.3)'
                }}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              className={`
                px-6 py-2 rounded-lg font-body text-sm transition-all duration-200
                ${currentSlide === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }
              `}
            >
              Kembali
            </button>
            
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-xl font-body font-medium text-white transition-all duration-200 hover:scale-105 shadow-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {currentSlide === slides.length - 1 ? 'Mulai' : 'Lanjut'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};