import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface WisdomQuote {
  id: string;
  indonesian: string;
  english?: string;
  javanese?: string;
  arabic?: string;
  sanskrit?: string;
  source: string;
  category: 'life' | 'meditation' | 'patience' | 'gratitude' | 'wisdom' | 'love' | 'nature' | 'spiritual';
  origin: 'javanese' | 'balinese' | 'sufi' | 'buddhist' | 'modern' | 'indigenous' | 'hindu';
  audioUrl?: string;
  culturalContext: string;
  backgroundInfo: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isFavorite?: boolean;
  timesViewed?: number;
  lastViewed?: Date;
}

interface PrayerTimeIntegration {
  currentPrayerWindow: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'between';
  nextPrayer: string;
  nextPrayerTime: string;
  recommendedQuotes: string[];
  spiritualMoment: boolean;
}

interface RegionalCustomization { // eslint-disable-line @typescript-eslint/no-unused-vars
  province: string;
  localWisdom: WisdomQuote[];
  dialectSupport: string[];
  culturalEvents: string[];
  localSaints: string[];
}

interface IndonesianWisdomQuotesProps {
  currentTime: Date;
  userLocation?: string;
  userPreferences?: {
    languages: string[];
    categories: string[];
    origins: string[];
    showTransliteration: boolean;
    playAudio: boolean;
  };
  onQuoteSelect?: (quote: WisdomQuote) => void;
  onFavoriteToggle?: (quote: WisdomQuote) => void;
  onShare?: (quote: WisdomQuote) => void;
}

const wisdomQuotes: WisdomQuote[] = [
  {
    id: 'sabar-1',
    indonesian: 'Kesabaran adalah kunci dari segala kebahagiaan',
    english: 'Patience is the key to all happiness',
    javanese: 'Sabar iku kuncine kabeh kabegjan',
    source: 'Pepatah Jawa',
    category: 'patience',
    origin: 'javanese',
    culturalContext: 'Traditional Javanese wisdom emphasizing the virtue of patience in daily life',
    backgroundInfo: 'This saying reflects the Javanese philosophy of accepting life\'s challenges with equanimity',
    tags: ['patience', 'happiness', 'traditional', 'daily-wisdom'],
    difficulty: 'beginner',
    isFavorite: false,
    timesViewed: 0
  },
  {
    id: 'syukur-1',
    indonesian: 'Bersyukurlah atas nikmat yang telah diberikan, maka akan ditambahkan nikmat yang lebih besar',
    english: 'Be grateful for the blessings given, and greater blessings will be added',
    arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    source: 'Al-Quran, Ibrahim 14:7',
    category: 'gratitude',
    origin: 'sufi',
    culturalContext: 'Islamic teaching about gratitude leading to increased blessings from Allah',
    backgroundInfo: 'This verse emphasizes the spiritual principle that gratitude attracts more divine favor',
    tags: ['gratitude', 'islamic', 'blessings', 'spiritual-growth'],
    difficulty: 'intermediate',
    audioUrl: '/audio/quran-ibrahim-14-7.mp3',
    isFavorite: true,
    timesViewed: 15
  },
  {
    id: 'cinta-1',
    indonesian: 'Cinta sejati dimulai dari mencintai diri sendiri dengan cara yang benar',
    english: 'True love begins with loving yourself in the right way',
    source: 'Rumi (adaptasi Indonesia)',
    category: 'love',
    origin: 'sufi',
    culturalContext: 'Sufi wisdom about self-love as foundation for universal love',
    backgroundInfo: 'Adapted from Rumi\'s teachings, emphasizing self-compassion in Indonesian Islamic context',
    tags: ['self-love', 'sufi', 'spirituality', 'inner-work'],
    difficulty: 'advanced',
    isFavorite: false,
    timesViewed: 8
  },
  {
    id: 'alam-1',
    indonesian: 'Seperti bambu yang lentur, kita harus bisa beradaptasi tanpa kehilangan akar',
    english: 'Like flexible bamboo, we must adapt without losing our roots',
    source: 'Filosofi Sunda',
    category: 'nature',
    origin: 'indigenous',
    culturalContext: 'Sundanese philosophy using bamboo as metaphor for resilience and adaptability',
    backgroundInfo: 'Bamboo represents strength through flexibility in Indonesian cultural wisdom',
    tags: ['adaptability', 'resilience', 'nature', 'sundanese', 'roots'],
    difficulty: 'intermediate',
    isFavorite: false,
    timesViewed: 12
  },
  {
    id: 'dharma-1',
    indonesian: 'Berbuat baik tanpa mengharapkan balasan adalah jalan menuju kedamaian sejati',
    english: 'Doing good without expecting return is the path to true peace',
    sanskrit: 'निष्काम कर्म परमो धर्मः',
    source: 'Bhagavad Gita (adaptasi Bali)',
    category: 'wisdom',
    origin: 'hindu',
    culturalContext: 'Hindu-Balinese interpretation of selfless action (Karma Yoga)',
    backgroundInfo: 'This reflects the Balinese Hindu concept of Tri Hita Karana - harmony through righteous action',
    tags: ['dharma', 'selfless-service', 'karma-yoga', 'balinese', 'peace'],
    difficulty: 'advanced',
    isFavorite: false,
    timesViewed: 5
  },
  {
    id: 'meditasi-1',
    indonesian: 'Dalam keheningan, kita menemukan suara hati yang paling jujur',
    english: 'In silence, we find the most honest voice of the heart',
    source: 'Kebijaksanaan Bugis',
    category: 'meditation',
    origin: 'indigenous',
    culturalContext: 'Bugis wisdom about the power of silent contemplation',
    backgroundInfo: 'Reflects the South Sulawesi tradition of seeking inner truth through quiet reflection',
    tags: ['silence', 'inner-voice', 'contemplation', 'bugis', 'heart-wisdom'],
    difficulty: 'intermediate',
    isFavorite: false,
    timesViewed: 20
  },
  {
    id: 'kehidupan-1',
    indonesian: 'Hidup seperti air yang mengalir, selalu mencari jalan tanpa melawan batu',
    english: 'Live like flowing water, always finding a way without fighting the stones',
    source: 'Tao Te Ching (adaptasi Jawa)',
    category: 'life',
    origin: 'javanese',
    culturalContext: 'Javanese adaptation of Taoist wisdom about wu wei (effortless action)',
    backgroundInfo: 'This shows how Chinese philosophy was integrated into Javanese spiritual thought',
    tags: ['flow', 'non-resistance', 'taoism', 'javanese', 'adaptation'],
    difficulty: 'advanced',
    isFavorite: true,
    timesViewed: 18
  },
  {
    id: 'waktu-1',
    indonesian: 'Waktu terbaik untuk menanam pohon adalah 20 tahun yang lalu. Waktu terbaik kedua adalah sekarang',
    english: 'The best time to plant a tree was 20 years ago. The second best time is now',
    source: 'Pepatah Tionghoa-Indonesia',
    category: 'wisdom',
    origin: 'modern',
    culturalContext: 'Chinese wisdom adapted into Indonesian context, emphasizing immediate action',
    backgroundInfo: 'Popular among Indonesian-Chinese community, represents starting spiritual practice now',
    tags: ['action', 'timing', 'chinese-indonesian', 'practical-wisdom', 'present-moment'],
    difficulty: 'beginner',
    isFavorite: false,
    timesViewed: 25
  }
];

const regionalWisdom: { [key: string]: WisdomQuote[] } = {
  'DKI Jakarta': [
    {
      id: 'betawi-1',
      indonesian: 'Kayak nasi uduk, enak kalo dicampur sama yang lain',
      english: 'Like nasi uduk, it\'s delicious when mixed with others',
      source: 'Filosofi Betawi',
      category: 'life',
      origin: 'indigenous',
      culturalContext: 'Betawi philosophy about unity in diversity using local food metaphor',
      backgroundInfo: 'Reflects Jakarta\'s multicultural harmony through beloved local dish',
      tags: ['unity', 'diversity', 'betawi', 'food-wisdom', 'harmony'],
      difficulty: 'beginner',
      timesViewed: 0
    }
  ],
  'Jawa Barat': [
    {
      id: 'sunda-1',
      indonesian: 'Hade ku nu hade, goreng ku nu goreng',
      english: 'Good by what is good, bad by what is wrong',
      source: 'Falsafah Sunda',
      category: 'wisdom',
      origin: 'indigenous',
      culturalContext: 'Sundanese moral philosophy about clear ethical standards',
      backgroundInfo: 'Traditional Sundanese teaching about maintaining moral clarity',
      tags: ['ethics', 'moral-clarity', 'sundanese', 'right-wrong'],
      difficulty: 'intermediate',
      timesViewed: 0
    }
  ],
  'Bali': [
    {
      id: 'bali-1',
      indonesian: 'Tri Hita Karana - harmoni dengan Tuhan, sesama, dan alam',
      english: 'Tri Hita Karana - harmony with God, fellow beings, and nature',
      sanskrit: 'त्रि हित करण',
      source: 'Filosofi Hindu Bali',
      category: 'spiritual',
      origin: 'hindu',
      culturalContext: 'Core Balinese Hindu philosophy of three-fold harmony',
      backgroundInfo: 'Foundation of Balinese worldview emphasizing balance in all relationships',
      tags: ['harmony', 'tri-hita-karana', 'balinese-hindu', 'balance', 'relationships'],
      difficulty: 'advanced',
      timesViewed: 0
    }
  ]
};

export const IndonesianWisdomQuotes: React.FC<IndonesianWisdomQuotesProps> = ({
  currentTime,
  userLocation = 'DKI Jakarta',
  userPreferences = {
    languages: ['indonesian', 'english'],
    categories: ['all'],
    origins: ['all'],
    showTransliteration: true,
    playAudio: false
  },
  onQuoteSelect,
  onFavoriteToggle,
  onShare
}) => {
  const [selectedQuote] = useState<WisdomQuote | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentQuoteIndex] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showDetails, setShowDetails] = useState(false);
  const [prayerTimeContext, setPrayerTimeContext] = useState<PrayerTimeIntegration | null>(null);

  // Get prayer time context
  useEffect(() => {
    const hour = currentTime.getHours();
    let prayerWindow: PrayerTimeIntegration['currentPrayerWindow'] = 'between';
    let nextPrayer = '';
    let nextPrayerTime = '';
    let recommendedQuotes: string[] = [];
    let spiritualMoment = false;

    // Prayer time calculations (approximate)
    if (hour >= 4 && hour < 6) {
      prayerWindow = 'fajr';
      nextPrayer = 'Dhuhr';
      nextPrayerTime = '12:00';
      recommendedQuotes = ['syukur-1', 'meditasi-1'];
      spiritualMoment = true;
    } else if (hour >= 12 && hour < 15) {
      prayerWindow = 'dhuhr';
      nextPrayer = 'Asr';
      nextPrayerTime = '15:00';
      recommendedQuotes = ['sabar-1', 'dharma-1'];
      spiritualMoment = true;
    } else if (hour >= 15 && hour < 18) {
      prayerWindow = 'asr';
      nextPrayer = 'Maghrib';
      nextPrayerTime = '18:00';
      recommendedQuotes = ['kehidupan-1', 'alam-1'];
      spiritualMoment = true;
    } else if (hour >= 18 && hour < 19) {
      prayerWindow = 'maghrib';
      nextPrayer = 'Isha';
      nextPrayerTime = '19:30';
      recommendedQuotes = ['syukur-1', 'cinta-1'];
      spiritualMoment = true;
    } else if (hour >= 19 && hour < 21) {
      prayerWindow = 'isha';
      nextPrayer = 'Fajr';
      nextPrayerTime = '04:30';
      recommendedQuotes = ['meditasi-1', 'sabar-1'];
      spiritualMoment = true;
    }

    setPrayerTimeContext({
      currentPrayerWindow: prayerWindow,
      nextPrayer,
      nextPrayerTime,
      recommendedQuotes,
      spiritualMoment
    });
  }, [currentTime]);

  // Get daily quote (changes based on date)
  const getDailyQuote = (): WisdomQuote => {
    const dateStr = currentTime.toDateString();
    const hash = dateStr.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % wisdomQuotes.length;
    return wisdomQuotes[index];
  };

  // Get time-appropriate quotes
  const getTimeAppropriateQuotes = (): WisdomQuote[] => {
    const hour = currentTime.getHours();
    
    if (hour < 6) return wisdomQuotes.filter(q => q.category === 'meditation' || q.category === 'spiritual');
    if (hour < 12) return wisdomQuotes.filter(q => q.category === 'gratitude' || q.category === 'wisdom');
    if (hour < 18) return wisdomQuotes.filter(q => q.category === 'life' || q.category === 'patience');
    return wisdomQuotes.filter(q => q.category === 'love' || q.category === 'nature');
  };

  // Get regional quotes
  const getRegionalQuotes = (): WisdomQuote[] => {
    return regionalWisdom[userLocation] || [];
  };

  const handleQuoteSelection = (quote: WisdomQuote) => {
    setSelectedQuote(quote);
    if (onQuoteSelect) onQuoteSelect(quote);
    
    // Update view count
    quote.timesViewed = (quote.timesViewed || 0) + 1;
    quote.lastViewed = new Date();
  };

  const handleFavoriteToggle = (quote: WisdomQuote) => {
    const newFavorites = favorites.includes(quote.id)
      ? favorites.filter(id => id !== quote.id)
      : [...favorites, quote.id];
    
    setFavorites(newFavorites);
    quote.isFavorite = newFavorites.includes(quote.id);
    
    if (onFavoriteToggle) onFavoriteToggle(quote);
  };

  const handleShare = (quote: WisdomQuote) => {
    if (onShare) {
      onShare(quote);
    } else {
      // Default share implementation
      if (navigator.share) {
        navigator.share({
          title: 'Hikmah dari Nusantara',
          text: `"${quote.indonesian}" - ${quote.source}`,
          url: window.location.href
        });
      }
    }
  };

  const playAudio = (quote: WisdomQuote) => {
    if (quote.audioUrl && userPreferences.playAudio) {
      const audio = new Audio(quote.audioUrl);
      audio.play();
    }
  };

  const dailyQuote = getDailyQuote();
  const timeAppropriateQuotes = getTimeAppropriateQuotes();
  const regionalQuotes = getRegionalQuotes();

  return (
    <div className="space-y-6">
      
      {/* Prayer Time Context */}
      {prayerTimeContext && prayerTimeContext.spiritualMoment && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🕌</div>
            <div>
              <h4 className="font-medium text-green-800">Waktu Spiritual</h4>
              <p className="text-sm text-green-700">
                Menjelang {prayerTimeContext.nextPrayer} ({prayerTimeContext.nextPrayerTime})
              </p>
              <p className="text-xs text-green-600 mt-1">
                Waktu yang baik untuk kontemplasi dan doa
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Daily Wisdom */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg text-gray-800">Hikmah Hari Ini</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFavoriteToggle(dailyQuote)}
                className={`p-2 rounded-lg transition-colors ${
                  favorites.includes(dailyQuote.id)
                    ? 'text-red-600 bg-red-50 hover:bg-red-100'
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <svg className="w-4 h-4" fill={favorites.includes(dailyQuote.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button
                onClick={() => handleShare(dailyQuote)}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="text-3xl mb-4">📜</div>
            
            <blockquote className="text-gray-800 font-body text-base leading-relaxed italic">
              "{dailyQuote.indonesian}"
            </blockquote>
            
            {userPreferences.languages.includes('english') && dailyQuote.english && (
              <blockquote className="text-gray-600 font-body text-sm leading-relaxed italic">
                "{dailyQuote.english}"
              </blockquote>
            )}
            
            {userPreferences.showTransliteration && dailyQuote.javanese && (
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-amber-800 font-body text-sm italic">
                  Jawa: "{dailyQuote.javanese}"
                </p>
              </div>
            )}
            
            {dailyQuote.sanskrit && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-purple-800 font-mono text-sm text-center">
                  {dailyQuote.sanskrit}
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>— {dailyQuote.source}</span>
              <span>•</span>
              <span className="capitalize">{dailyQuote.category.replace('-', ' ')}</span>
              {dailyQuote.audioUrl && (
                <>
                  <span>•</span>
                  <button
                    onClick={() => playAudio(dailyQuote)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 14l-4-4H6a2 2 0 00-2 2v0a2 2 0 002 2h2l4 4v-12z" />
                    </svg>
                    <span>Dengar</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <Button
            onClick={() => {
              setShowDetails(!showDetails);
              handleQuoteSelection(dailyQuote);
            }}
            variant="outline"
            size="small"
            className="w-full"
          >
            {showDetails ? 'Sembunyikan Detail' : 'Pelajari Lebih Lanjut'}
          </Button>

          {showDetails && (
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Konteks Budaya</h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {dailyQuote.culturalContext}
                </p>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Latar Belakang</h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {dailyQuote.backgroundInfo}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {dailyQuote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Regional Wisdom */}
      {regionalQuotes.length > 0 && (
        <Card>
          <h4 className="font-heading text-gray-800 mb-4">Kearifan Lokal {userLocation}</h4>
          <div className="space-y-3">
            {regionalQuotes.slice(0, 2).map((quote) => (
              <div
                key={quote.id}
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleQuoteSelection(quote)}
              >
                <p className="text-sm text-gray-700 italic mb-1">"{quote.indonesian}"</p>
                <p className="text-xs text-gray-500">— {quote.source}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Time-Appropriate Quotes */}
      <Card>
        <h4 className="font-heading text-gray-800 mb-4">
          Cocok untuk {currentTime.getHours() < 12 ? 'Pagi' : currentTime.getHours() < 18 ? 'Siang' : 'Malam'} Ini
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {timeAppropriateQuotes.slice(0, 3).map((quote) => (
            <div
              key={quote.id}
              className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-colors"
              onClick={() => handleQuoteSelection(quote)}
            >
              <div className="flex items-start space-x-3">
                <div className="text-lg">
                  {quote.category === 'meditation' ? '🧘' :
                   quote.category === 'gratitude' ? '🙏' :
                   quote.category === 'wisdom' ? '💡' :
                   quote.category === 'love' ? '❤️' :
                   quote.category === 'nature' ? '🌿' : '✨'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 italic mb-1">"{quote.indonesian}"</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">— {quote.source}</p>
                    <div className="flex items-center space-x-1">
                      {favorites.includes(quote.id) && (
                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                      <span className="text-xs text-gray-400 capitalize">
                        {quote.origin}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quote Collection Actions */}
      <Card padding="small">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            💝 {favorites.length} quotes tersimpan
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="small">
              Lihat Koleksi
            </Button>
            <Button size="small">
              Jelajahi Semua
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};