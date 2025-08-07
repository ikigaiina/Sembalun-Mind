import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersonalization } from '../../contexts/PersonalizationContext';
import type { CulturalData } from '../onboarding/CulturalPersonalizationScreen';

interface WisdomQuote {
  id: string;
  text: string;
  author: string;
  source: string;
  translation?: string;
  culturalContext: string;
  region?: string;
  spiritualTradition?: string;
  timeOfDay?: string[];
  mood?: string[];
}

interface IndonesianWisdomQuoteProps {
  className?: string;
  showTranslation?: boolean;
  autoRotate?: boolean;
  rotationInterval?: number;
  culturalFilter?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Expanded wisdom database with regional and spiritual diversity
const wisdomDatabase: WisdomQuote[] = [
  // Islamic/General Indonesian
  {
    id: 'islam-1',
    text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Sesungguhnya bersama kesulitan ada kemudahan',
    author: 'Al-Quran',
    source: 'QS. Ash-Sharh: 6',
    culturalContext: 'Memberikan harapan di saat sulit',
    spiritualTradition: 'islam',
    timeOfDay: ['morning', 'evening'],
    mood: ['sad', 'anxious', 'stressed']
  },
  {
    id: 'islam-2',
    text: 'Dan hanya kepada Tuhanmulah hendaknya kamu berharap.',
    author: 'Al-Quran',
    source: 'QS. Ash-Sharh: 8',
    culturalContext: 'Mengajak untuk bergantung hanya kepada Allah',
    spiritualTradition: 'islam',
    timeOfDay: ['morning', 'night'],
    mood: ['neutral', 'contemplative']
  },
  
  // Betawi (Jakarta)
  {
    id: 'betawi-1',
    text: 'Gak ada yang susah kalo dilakoni bareng-bareng.',
    author: 'Pepatah Betawi',
    source: 'Kearifan Rakyat Jakarta',
    culturalContext: 'Mengajarkan pentingnya gotong royong dalam menghadapi masalah',
    region: 'jakarta',
    timeOfDay: ['afternoon', 'evening'],
    mood: ['stressed', 'overwhelmed']
  },
  {
    id: 'betawi-2',
    text: 'Siape yang sabar, die yang dapat.',
    author: 'Pepatah Betawi',
    source: 'Kearifan Betawi',
    culturalContext: 'Mengajarkan kesabaran sebagai kunci keberhasilan',
    region: 'jakarta',
    timeOfDay: ['morning', 'afternoon'],
    mood: ['impatient', 'frustrated']
  },

  // Javanese (Central & East Java)
  {
    id: 'javanese-1',
    text: 'Sapa sing sabar bakal pikantuk.',
    translation: 'Siapa yang sabar akan mendapat',
    author: 'Pepatah Jawa',
    source: 'Kearifan Jawa',
    culturalContext: 'Filosofi kesabaran dalam budaya Jawa',
    region: 'jawa-tengah',
    spiritualTradition: 'javanese',
    timeOfDay: ['morning', 'evening'],
    mood: ['anxious', 'impatient']
  },
  {
    id: 'javanese-2',
    text: 'Manungsa mung saderma nglakoni.',
    translation: 'Manusia hanya sekedar menjalankan',
    author: 'Filosofi Kejawen',
    source: 'Serat Wedhatama',
    culturalContext: 'Mengajarkan kerendahan hati dan penyerahan kepada Tuhan',
    region: 'jawa-tengah',
    spiritualTradition: 'javanese',
    timeOfDay: ['morning', 'night'],
    mood: ['proud', 'ego']
  },
  {
    id: 'javanese-3',
    text: 'Sura dira jayadiningrat lebur dening pangastuti.',
    translation: 'Kekerasan dan kesombongan akan hancur oleh kata-kata yang lembut',
    author: 'R.M. Soewardi Soerjaningrat',
    source: 'Ajaran Ki Hajar Dewantara',
    culturalContext: 'Mengajarkan kekuatan kelembutan hati',
    region: 'jawa-tengah',
    timeOfDay: ['afternoon', 'evening'],
    mood: ['angry', 'frustrated']
  },

  // Balinese Hindu
  {
    id: 'balinese-1',
    text: 'Tri Hita Karana',
    translation: 'Tiga penyebab kebahagiaan: harmoni dengan Tuhan, sesama, dan alam',
    author: 'Filosofi Hindu Bali',
    source: 'Ajaran Leluhur Bali',
    culturalContext: 'Keseimbangan hidup dalam tiga dimensi',
    region: 'bali',
    spiritualTradition: 'hindu',
    timeOfDay: ['morning', 'evening'],
    mood: ['unbalanced', 'searching']
  },
  {
    id: 'balinese-2',
    text: 'Tat twam asi',
    translation: 'Engkau adalah aku, aku adalah engkau',
    author: 'Vedanta',
    source: 'Ajaran Hindu',
    culturalContext: 'Kesatuan semua makhluk dalam ketuhanan',
    region: 'bali',
    spiritualTradition: 'hindu',
    timeOfDay: ['morning', 'evening'],
    mood: ['lonely', 'disconnected']
  },

  // Sundanese (West Java)
  {
    id: 'sundanese-1',
    text: 'Silih asah, silih asih, silih asuh.',
    translation: 'Saling mengasah, saling mengasihi, saling mengasuh',
    author: 'Filosofi Sunda',
    source: 'Kearifan Sunda',
    culturalContext: 'Prinsip hidup bermasyarakat yang harmonis',
    region: 'jawa-barat',
    timeOfDay: ['morning', 'afternoon'],
    mood: ['isolated', 'community-need']
  },

  // Minangkabau (Sumatra)
  {
    id: 'minang-1',
    text: 'Adat basandi syarak, syarak basandi Kitabullah.',
    translation: 'Adat bersendi syariat, syariat bersendi Kitab Allah',
    author: 'Pepatah Minang',
    source: 'Falsafah Minangkabau',
    culturalContext: 'Keseimbangan tradisi dan agama dalam kehidupan',
    region: 'sumatra',
    spiritualTradition: 'islam',
    timeOfDay: ['morning', 'evening'],
    mood: ['confused', 'seeking-guidance']
  },

  // Universal Indonesian
  {
    id: 'universal-1',
    text: 'Berat sama dipikul, ringan sama dijinjing.',
    author: 'Pepatah Indonesia',
    source: 'Kearifan Nusantara',
    culturalContext: 'Semangat gotong royong dan kebersamaan',
    timeOfDay: ['afternoon', 'evening'],
    mood: ['overwhelmed', 'need-support']
  },
  {
    id: 'universal-2',
    text: 'Air tenang menghanyutkan.',
    author: 'Pepatah Indonesia',
    source: 'Kearifan Nusantara',
    culturalContext: 'Jangan meremehkan sesuatu yang tampak tenang',
    timeOfDay: ['morning', 'afternoon'],
    mood: ['overconfident', 'careless']
  },
  {
    id: 'universal-3',
    text: 'Seperti padi, semakin berisi semakin merunduk.',
    author: 'Pepatah Indonesia',
    source: 'Kearifan Nusantara',
    culturalContext: 'Kerendahan hati sebagai tanda kedewasaan',
    timeOfDay: ['morning', 'evening'],
    mood: ['proud', 'arrogant']
  },

  // Modern Indonesian Spirituality
  {
    id: 'modern-1',
    text: 'Ketenangan bukan berarti tidak ada badai, tapi ada kedamaian di tengah badai.',
    author: 'Refleksi Modern',
    source: 'Spiritualitas Kontemporer',
    culturalContext: 'Menemukan kedamaian internal meski situasi eksternal sulit',
    timeOfDay: ['morning', 'night'],
    mood: ['chaotic', 'stressed']
  },
  {
    id: 'modern-2',
    text: 'Hidup adalah tentang menerima yang tidak bisa diubah dan mengubah yang bisa diubah.',
    author: 'Kebijaksanaan Modern',
    source: 'Filosofi Kontemporer',
    culturalContext: 'Keseimbangan antara acceptance dan action',
    timeOfDay: ['afternoon', 'evening'],
    mood: ['frustrated', 'stuck']
  }
];

// Prayer time integration
const getPrayerTimeContext = () => {
  const hour = new Date().getHours();
  
  if (hour >= 4 && hour < 6) return 'subuh';
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 15) return 'dzuhur';
  if (hour >= 15 && hour < 18) return 'ashar';
  if (hour >= 18 && hour < 20) return 'maghrib';
  if (hour >= 20 || hour < 4) return 'isya';
  return 'general';
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const IndonesianWisdomQuote: React.FC<IndonesianWisdomQuoteProps> = ({
  className = '',
  showTranslation = true,
  autoRotate = true,
  rotationInterval = 30000, // 30 seconds
  culturalFilter = true,
  size = 'medium'
}) => {
  const { personalization } = usePersonalization();
  const [currentQuote, setCurrentQuote] = useState<WisdomQuote | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const sizeClasses = {
    small: 'p-3 text-sm',
    medium: 'p-4 text-base',
    large: 'p-6 text-lg'
  };

  const getFilteredQuotes = (): WisdomQuote[] => {
    let filtered = [...wisdomDatabase];
    
    if (!culturalFilter || !personalization?.culturalData) {
      return filtered;
    }

    const { culturalData } = personalization;
    const currentMood = personalization.mood;
    const timeOfDay = getTimeOfDay();
    const prayerTime = getPrayerTimeContext();

    // Filter by cultural preferences
    filtered = filtered.filter(quote => {
      // Spiritual tradition match
      if (quote.spiritualTradition && culturalData.spiritualTradition) {
        if (quote.spiritualTradition !== culturalData.spiritualTradition && 
            quote.spiritualTradition !== 'universal') {
          return false;
        }
      }

      // Regional match
      if (quote.region && culturalData.region) {
        if (quote.region !== culturalData.region) {
          return false;
        }
      }

      // Time appropriateness
      if (quote.timeOfDay && !quote.timeOfDay.includes(timeOfDay)) {
        return false;
      }

      // Mood relevance
      if (quote.mood && currentMood) {
        if (!quote.mood.includes(currentMood)) {
          return false;
        }
      }

      return true;
    });

    // If no quotes match strict criteria, fallback to broader selection
    if (filtered.length === 0) {
      filtered = wisdomDatabase.filter(quote => 
        !quote.spiritualTradition || 
        quote.spiritualTradition === culturalData.spiritualTradition ||
        !quote.region ||
        quote.region === culturalData.region
      );
    }

    // Final fallback to all quotes if still empty
    if (filtered.length === 0) {
      filtered = wisdomDatabase;
    }

    return filtered;
  };

  const selectRandomQuote = () => {
    const availableQuotes = getFilteredQuotes();
    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    return availableQuotes[randomIndex];
  };

  useEffect(() => {
    setCurrentQuote(selectRandomQuote());
  }, [personalization?.culturalData, personalization?.mood]);

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuote(selectRandomQuote());
        setIsVisible(true);
      }, 500);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotationInterval]);

  if (!currentQuote) return null;

  const isIslamic = currentQuote.spiritualTradition === 'islam';
  const hasTranslation = currentQuote.translation && showTranslation;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuote.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          y: isVisible ? 0 : 10, 
          scale: isVisible ? 1 : 0.95 
        }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-br from-white/80 to-primary-50/50 
          backdrop-blur-sm rounded-xl shadow-lg border border-white/20
          ${className}
        `}
      >
        {/* Cultural indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isIslamic && (
              <span className="text-green-600 text-lg">☪️</span>
            )}
            {currentQuote.region === 'bali' && currentQuote.spiritualTradition === 'hindu' && (
              <span className="text-orange-600 text-lg">🕉️</span>
            )}
            {currentQuote.region?.includes('jawa') && (
              <span className="text-amber-600 text-lg">🎭</span>
            )}
            {!currentQuote.spiritualTradition && !currentQuote.region && (
              <span className="text-blue-600 text-lg">🇮🇩</span>
            )}
            
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {currentQuote.region === 'jakarta' ? 'Betawi' :
               currentQuote.region === 'bali' ? 'Bali' :
               currentQuote.region?.includes('jawa') ? 'Jawa' :
               currentQuote.region === 'sumatra' ? 'Sumatra' :
               currentQuote.spiritualTradition === 'islam' ? 'Islam' :
               'Nusantara'}
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => {
                setCurrentQuote(selectRandomQuote());
                setIsVisible(true);
              }, 300);
            }}
            className="text-gray-400 hover:text-gray-600 text-sm p-1 rounded-full hover:bg-white/50"
          >
            🔄
          </motion.button>
        </div>

        {/* Main quote */}
        <div className="space-y-3">
          <blockquote className={`
            ${isIslamic && !hasTranslation ? 'text-right' : 'text-left'} 
            ${isIslamic ? 'font-arabic' : 'font-body'} 
            text-gray-800 leading-relaxed
            ${size === 'large' ? 'text-xl' : size === 'medium' ? 'text-base' : 'text-sm'}
          `}>
            "{currentQuote.text}"
          </blockquote>

          {/* Translation if available */}
          {hasTranslation && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 italic text-sm border-l-2 border-primary-200 pl-3"
            >
              "{currentQuote.translation}"
            </motion.p>
          )}

          {/* Attribution */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">
                — {currentQuote.author}
              </p>
              <p className="text-xs text-gray-500">
                {currentQuote.source}
              </p>
            </div>
            
            {/* Cultural context tooltip */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="group relative"
            >
              <span className="text-xs text-gray-400 cursor-help">ℹ️</span>
              <div className="
                invisible group-hover:visible absolute right-0 bottom-full mb-2 
                w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10
                opacity-0 group-hover:opacity-100 transition-all duration-200
              ">
                {currentQuote.culturalContext}
                <div className="absolute top-full right-4 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for getting contextual wisdom quotes
export const useIndonesianWisdom = () => {
  const { personalization } = usePersonalization();

  const getContextualQuote = (context?: 'morning' | 'evening' | 'stress' | 'focus' | 'sleep') => {
    const timeOfDay = getTimeOfDay();
    const prayerTime = getPrayerTimeContext();
    
    let filtered = wisdomDatabase.filter(quote => {
      if (context) {
        if (context === 'morning' || context === 'evening') {
          return quote.timeOfDay?.includes(context);
        }
        if (context === 'stress' || context === 'focus' || context === 'sleep') {
          return quote.mood?.includes(context);
        }
      }
      return true;
    });

    // Apply cultural filtering if available
    if (personalization?.culturalData) {
      const { culturalData } = personalization;
      filtered = filtered.filter(quote => {
        if (quote.spiritualTradition && culturalData.spiritualTradition) {
          return quote.spiritualTradition === culturalData.spiritualTradition;
        }
        if (quote.region && culturalData.region) {
          return quote.region === culturalData.region;
        }
        return true;
      });
    }

    return filtered[Math.floor(Math.random() * filtered.length)] || wisdomDatabase[0];
  };

  const getPrayerTimeQuote = () => {
    const prayerTime = getPrayerTimeContext();
    return getContextualQuote(prayerTime === 'subuh' || prayerTime === 'morning' ? 'morning' : 'evening');
  };

  return {
    getContextualQuote,
    getPrayerTimeQuote,
    wisdomDatabase: getFilteredQuotes()
  };
};

// Helper function for components
export const getFilteredQuotes = () => {
  const timeOfDay = getTimeOfDay();
  return wisdomDatabase.filter(quote => 
    !quote.timeOfDay || quote.timeOfDay.includes(timeOfDay)
  );
};

export default IndonesianWisdomQuote;