import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Heart, Mountain, Sunrise, Leaf, Waves } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface WisdomQuote {
  id: string;
  quote: string;
  translation: string;
  source: string;
  region: string;
  category: 'mindfulness' | 'compassion' | 'wisdom' | 'resilience' | 'nature' | 'community';
  icon: React.ReactNode;
  backgroundColor: string;
  textColor: string;
}

interface Props {
  className?: string;
  category?: 'mindfulness' | 'compassion' | 'wisdom' | 'resilience' | 'nature' | 'community' | 'random';
  autoRotate?: boolean;
  rotateInterval?: number; // in milliseconds
}

const indonesianWisdom: WisdomQuote[] = [
  {
    id: 'sembalun-mountain',
    quote: "Seperti cahaya puncak Rinjani, fokus yang jernih menerangi jalan",
    translation: "Like the light from Rinjani's peak, clear focus illuminates the path",
    source: "Filosofi Sembalun",
    region: "Lombok, Nusa Tenggara Barat",
    category: 'mindfulness',
    icon: <Mountain className="w-6 h-6" />,
    backgroundColor: 'from-blue-50 to-indigo-50',
    textColor: 'text-blue-700'
  },
  {
    id: 'javanese-water',
    quote: "Air yang tenang menggambarkan pikiran yang damai",
    translation: "Calm water reflects a peaceful mind",
    source: "Pepatah Jawa",
    region: "Jawa Tengah",
    category: 'mindfulness',
    icon: <Waves className="w-6 h-6" />,
    backgroundColor: 'from-teal-50 to-cyan-50',
    textColor: 'text-teal-700'
  },
  {
    id: 'balinese-lotus',
    quote: "Bagaikan teratai yang tumbuh dari lumpur, kebijaksanaan muncul dari kesulitan",
    translation: "Like a lotus growing from mud, wisdom emerges from difficulty",
    source: "Filosofi Bali - Tri Hita Karana",
    region: "Bali",
    category: 'wisdom',
    icon: <Leaf className="w-6 h-6" />,
    backgroundColor: 'from-emerald-50 to-green-50',
    textColor: 'text-emerald-700'
  },
  {
    id: 'sundanese-bamboo',
    quote: "Seperti bambu yang lentur, hati yang bijak tidak mudah patah",
    translation: "Like flexible bamboo, a wise heart does not easily break",
    source: "Kebijaksanaan Sunda",
    region: "Jawa Barat",
    category: 'resilience',
    icon: <Leaf className="w-6 h-6" />,
    backgroundColor: 'from-green-50 to-lime-50',
    textColor: 'text-green-700'
  },
  {
    id: 'minang-mountain',
    quote: "Gunung tidak pernah bertemu gunung, tetapi manusia bertemu manusia",
    translation: "Mountains never meet mountains, but humans meet humans",
    source: "Pepatah Minang",
    region: "Sumatera Barat",
    category: 'community',
    icon: <Heart className="w-6 h-6" />,
    backgroundColor: 'from-rose-50 to-pink-50',
    textColor: 'text-rose-700'
  },
  {
    id: 'sasak-sunrise',
    quote: "Seperti matahari yang terbit setiap hari, semangat kita harus selalu baru",
    translation: "Like the sun that rises every day, our spirit must always be renewed",
    source: "Pepatah Sasak",
    region: "Lombok, Nusa Tenggara Barat",
    category: 'resilience',
    icon: <Sunrise className="w-6 h-6" />,
    backgroundColor: 'from-orange-50 to-amber-50',
    textColor: 'text-orange-700'
  },
  {
    id: 'yogyakarta-forest',
    quote: "Di dalam keheningan hutan, kita menemukan suara hati yang paling jujur",
    translation: "In the silence of the forest, we find the most honest voice of the heart",
    source: "Kebijaksanaan Keraton Yogyakarta",
    region: "Yogyakarta",
    category: 'mindfulness',
    icon: <Leaf className="w-6 h-6" />,
    backgroundColor: 'from-green-50 to-emerald-50',
    textColor: 'text-green-700'
  },
  {
    id: 'batak-lake',
    quote: "Air danau yang jernih mencerminkan langit, hati yang bersih mencerminkan kebenaran",
    translation: "Clear lake water reflects the sky, a pure heart reflects truth",
    source: "Filosofi Batak Toba",
    region: "Sumatera Utara",
    category: 'wisdom',
    icon: <Waves className="w-6 h-6" />,
    backgroundColor: 'from-blue-50 to-sky-50',
    textColor: 'text-blue-700'
  },
  {
    id: 'bugis-sea',
    quote: "Layar yang mengembang bukan karena angin kuat, tetapi karena tahu arah",
    translation: "Sails expand not because of strong wind, but because they know the direction",
    source: "Kebijaksanaan Bugis",
    region: "Sulawesi Selatan",
    category: 'wisdom',
    icon: <Waves className="w-6 h-6" />,
    backgroundColor: 'from-indigo-50 to-blue-50',
    textColor: 'text-indigo-700'
  },
  {
    id: 'dayak-river',
    quote: "Sungai mengalir tidak tergesa, tetapi selalu sampai ke laut",
    translation: "Rivers flow without haste, but always reach the sea",
    source: "Kebijaksanaan Dayak",
    region: "Kalimantan",
    category: 'resilience',
    icon: <Waves className="w-6 h-6" />,
    backgroundColor: 'from-cyan-50 to-teal-50',
    textColor: 'text-cyan-700'
  },
  {
    id: 'betawi-city',
    quote: "Seperti lentera di malam hari, kebaikan hati menerangi kegelapan",
    translation: "Like a lantern in the night, kindness of heart illuminates darkness",
    source: "Pepatah Betawi",
    region: "Jakarta",
    category: 'compassion',
    icon: <Heart className="w-6 h-6" />,
    backgroundColor: 'from-yellow-50 to-orange-50',
    textColor: 'text-yellow-700'
  },
  {
    id: 'toraja-highland',
    quote: "Di atas gunung tinggi, napas menjadi berharga, di dalam hidup sulit, ketenangan menjadi mulia",
    translation: "On high mountains, breath becomes precious, in difficult life, tranquility becomes noble",
    source: "Filosofi Toraja",
    region: "Sulawesi Selatan",
    category: 'mindfulness',
    icon: <Mountain className="w-6 h-6" />,
    backgroundColor: 'from-purple-50 to-violet-50',
    textColor: 'text-purple-700'
  }
];

export const IndonesianWisdomDisplay: React.FC<Props> = ({
  className = '',
  category = 'random',
  autoRotate = false,
  rotateInterval = 15000
}) => {
  const [currentQuote, setCurrentQuote] = useState<WisdomQuote>(indonesianWisdom[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter quotes by category
  const filteredQuotes = category === 'random' 
    ? indonesianWisdom 
    : indonesianWisdom.filter(quote => quote.category === category);

  // Get random quote from filtered quotes
  const getRandomQuote = () => {
    const availableQuotes = filteredQuotes.filter(quote => quote.id !== currentQuote.id);
    if (availableQuotes.length === 0) return filteredQuotes[0];
    
    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    return availableQuotes[randomIndex];
  };

  // Handle quote change with animation
  const changeQuote = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentQuote(getRandomQuote());
      setIsAnimating(false);
    }, 300);
  };

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      changeQuote();
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, currentQuote]);

  // Initialize with random quote
  useEffect(() => {
    if (filteredQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      setCurrentQuote(filteredQuotes[randomIndex]);
    }
  }, [category]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'mindfulness': return <Mountain className="w-5 h-5" />;
      case 'compassion': return <Heart className="w-5 h-5" />;
      case 'wisdom': return <Leaf className="w-5 h-5" />;
      case 'resilience': return <Sunrise className="w-5 h-5" />;
      case 'nature': return <Leaf className="w-5 h-5" />;
      case 'community': return <Heart className="w-5 h-5" />;
      default: return <Mountain className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'mindfulness': return 'bg-blue-100 text-blue-700';
      case 'compassion': return 'bg-rose-100 text-rose-700';
      case 'wisdom': return 'bg-emerald-100 text-emerald-700';
      case 'resilience': return 'bg-orange-100 text-orange-700';
      case 'nature': return 'bg-green-100 text-green-700';
      case 'community': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuote.id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Card className={`bg-gradient-to-r ${currentQuote.backgroundColor} border-0 shadow-lg`}>
            <div className="text-center space-y-6">
              {/* Quote Icon */}
              <motion.div
                className={`w-16 h-16 mx-auto rounded-full ${currentQuote.backgroundColor} flex items-center justify-center shadow-md`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <div className={currentQuote.textColor}>
                  {currentQuote.icon}
                </div>
              </motion.div>

              {/* Indonesian Quote */}
              <blockquote className={`text-xl md:text-2xl font-heading font-bold leading-relaxed ${currentQuote.textColor}`}>
                "{currentQuote.quote}"
              </blockquote>

              {/* English Translation */}
              <p className="text-gray-600 italic text-lg leading-relaxed">
                "{currentQuote.translation}"
              </p>

              {/* Source and Region */}
              <div className="space-y-3">
                <div className={`inline-block px-4 py-2 rounded-full ${getCategoryColor(currentQuote.category)} text-sm font-medium`}>
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(currentQuote.category)}
                    <span className="capitalize">{currentQuote.category}</span>
                  </div>
                </div>
                
                <div className="text-center space-y-1">
                  <p className={`font-semibold ${currentQuote.textColor}`}>
                    — {currentQuote.source}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {currentQuote.region}
                  </p>
                </div>
              </div>

              {/* Refresh Button */}
              <motion.div
                className="pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={changeQuote}
                  variant="ghost"
                  size="sm"
                  disabled={isAnimating}
                  className="group"
                >
                  <motion.div
                    animate={{ rotate: isAnimating ? 360 : 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isAnimating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
                  </motion.div>
                  <span className="text-sm">
                    {isAnimating ? 'Memuat...' : 'Kebijaksanaan Lain'}
                  </span>
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Quote Count Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-4"
      >
        <p className="text-xs text-gray-500">
          {filteredQuotes.length} kebijaksanaan Nusantara
          {category !== 'random' && (
            <span className="ml-1">
              dalam kategori <span className="font-medium capitalize">{category}</span>
            </span>
          )}
        </p>
      </motion.div>
    </div>
  );
};