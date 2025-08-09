import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Heart, Star, Quote, Mountain, Sunrise, Wind, Waves, 
  TreePine, Sun, Crown, Compass, Eye, Sparkles, Copy, Share2,
  Filter, Search, Calendar, MapPin, Award, Bookmark, BookmarkCheck
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

// Regional Wisdom Categories
export type WisdomRegion = 'sembalun' | 'java' | 'bali' | 'sumatra' | 'sulawesi' | 'nusa-tenggara' | 'universal';
export type WisdomCategory = 'meditation' | 'life-philosophy' | 'nature' | 'spirituality' | 'mindfulness' | 'harmony';

// Comprehensive Indonesian Wisdom Collection
interface WisdomQuote {
  id: string;
  text: string;
  translation?: string;
  region: WisdomRegion;
  category: WisdomCategory;
  source: string;
  culturalContext: string;
  practicalApplication: string;
  relatedPractices: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isUnlocked: boolean;
  unlockedAt?: Date;
  isFavorited: boolean;
  shareCount: number;
  meditationRelevance: string;
  icon: string;
}

// Extensive wisdom collection from Indonesian cultural traditions
const indonesianWisdomCollection: WisdomQuote[] = [
  // Sembalun Valley Wisdom
  {
    id: 'sembalun-1',
    text: 'Gunung mengajarkan kita kesabaran, lembah mengajarkan kita kerendahan hati',
    region: 'sembalun',
    category: 'nature',
    source: 'Kearifan Lokal Sembalun',
    culturalContext: 'Masyarakat Sembalun hidup di antara gunung dan lembah, mengembangkan filosofi keseimbangan antara aspirasi tinggi dan kerendahan hati.',
    practicalApplication: 'Dalam meditasi, gunakan visualisasi gunung untuk menumbuhkan kesabaran, dan lembah untuk melatih kerendahan hati.',
    relatedPractices: ['Sunrise Mountain Meditation', 'Valley Wind Breathing'],
    difficulty: 'beginner',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 14),
    isFavorited: true,
    shareCount: 12,
    meditationRelevance: 'Membantu menyeimbangkan ambisi dan ketenangan inner',
    icon: '⛰️'
  },
  {
    id: 'sembalun-2',
    text: 'Di puncak Rinjani, jiwa menemukan ketenangan yang sejati',
    region: 'sembalun',
    category: 'spirituality',
    source: 'Tradisi Pendakian Spiritual Sembalun',
    culturalContext: 'Gunung Rinjani dianggap suci oleh masyarakat lokal, menjadi tempat untuk mencari pencerahan spiritual.',
    practicalApplication: 'Visualisasi berada di puncak gunung untuk mencapai state meditatif yang mendalam.',
    relatedPractices: ['Peak Consciousness Meditation'],
    difficulty: 'advanced',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 10),
    isFavorited: false,
    shareCount: 8,
    meditationRelevance: 'Mencapai tingkat kesadaran tinggi melalui visualisasi spiritual',
    icon: '🏔️'
  },
  {
    id: 'sembalun-3',
    text: 'Sembalun membisikkan rahasia harmoni antara langit dan bumi',
    region: 'sembalun',
    category: 'harmony',
    source: 'Filosofi Alamiah Sembalun',
    culturalContext: 'Sembalun Valley dikenal sebagai tempat di mana langit dan bumi bertemu, melambangkan harmoni kosmik.',
    practicalApplication: 'Meditasi dengan fokus pada koneksi antara chakra atas (langit) dan bawah (bumi).',
    relatedPractices: ['Sky-Earth Connection Meditation'],
    difficulty: 'intermediate',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 3,
    meditationRelevance: 'Menyeimbangkan energi spiritual dan grounding',
    icon: '🌌'
  },

  // Javanese Wisdom
  {
    id: 'java-1',
    text: 'Sapa sing sabar, bakal pikoleh',
    translation: 'Siapa yang sabar, akan mendapat (hasil)',
    region: 'java',
    category: 'life-philosophy',
    source: 'Pepatah Jawa Kuno',
    culturalContext: 'Filosofi Jawa menekankan kesabaran sebagai kunci kesuksesan dalam hidup dan spiritual.',
    practicalApplication: 'Gunakan dalam meditasi mindfulness untuk mengembangkan kesabaran terhadap proses internal.',
    relatedPractices: ['Javanese Court Meditation', 'Patience Cultivation'],
    difficulty: 'beginner',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 12),
    isFavorited: true,
    shareCount: 15,
    meditationRelevance: 'Mengembangkan kesabaran dan persistent dalam praktik',
    icon: '🎭'
  },
  {
    id: 'java-2', 
    text: 'Sepi ing pamrih, rame ing gawe',
    translation: 'Sunyi dari pamrih, rajin dalam berkarya',
    region: 'java',
    category: 'spirituality',
    source: 'Ajaran Kejawen Sri Sultan Hamengkubuwono',
    culturalContext: 'Konsep spiritual Jawa tentang bekerja tanpa ego dan pamrih, fokus pada service kepada yang lebih tinggi.',
    practicalApplication: 'Praktik meditasi dengan letting go attachment terhadap hasil, fokus pada proses pure.',
    relatedPractices: ['Selfless Service Meditation', 'Ego Dissolution'],
    difficulty: 'advanced',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 7,
    meditationRelevance: 'Melepaskan ego dan expectation dalam praktik spiritual',
    icon: '👑'
  },
  {
    id: 'java-3',
    text: 'Ojo dumeh, tetep andhap asor',
    translation: 'Jangan sombong, tetap rendah hati',
    region: 'java',
    category: 'mindfulness',
    source: 'Etika Jawa Tradisional',
    culturalContext: 'Kerendahan hati adalah fondasi karakter Jawa, menjaga keseimbangan inner meskipun memiliki kemampuan.',
    practicalApplication: 'Meditasi self-reflection untuk mengecek ego dan mempertahankan humility.',
    relatedPractices: ['Humility Meditation', 'Inner Balance'],
    difficulty: 'intermediate',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 8),
    isFavorited: false,
    shareCount: 9,
    meditationRelevance: 'Menjaga keseimbangan dan kerendahan hati dalam spiritual progress',
    icon: '🙏'
  },

  // Balinese Wisdom
  {
    id: 'bali-1',
    text: 'Tri Hita Karana - harmoni dengan Tuhan, sesama, dan alam',
    region: 'bali',
    category: 'harmony',
    source: 'Filosofi Hindu-Bali',
    culturalContext: 'Konsep fundamental Bali tentang tiga harmoni yang harus dijaga untuk mencapai kebahagiaan sejati.',
    practicalApplication: 'Meditasi dengan tiga fokus: koneksi spiritual, compassion untuk sesama, dan awareness terhadap alam.',
    relatedPractices: ['Triple Harmony Meditation', 'Balinese Temple Meditation'],
    difficulty: 'intermediate',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 9),
    isFavorited: true,
    shareCount: 18,
    meditationRelevance: 'Mengintegrasikan tiga dimensi harmoni dalam praktik spiritual',
    icon: '🏛️'
  },
  {
    id: 'bali-2',
    text: 'Tat twam asi - engkau adalah aku, aku adalah engkau',
    region: 'bali',
    category: 'spirituality',
    source: 'Upanishad - Tradisi Hindu Bali',
    culturalContext: 'Konsep non-dualitas dalam spiritual Bali, mengajarkan kesatuan antara self dan universal consciousness.',
    practicalApplication: 'Meditasi loving-kindness dengan visualisasi unity consciousness dan dissolving boundaries.',
    relatedPractices: ['Unity Meditation', 'Self-Other Dissolution'],
    difficulty: 'advanced',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 5,
    meditationRelevance: 'Mencapai non-dual awareness dan universal compassion',
    icon: '🕉️'
  },
  {
    id: 'bali-3',
    text: 'Rwa bhineda - keseimbangan dalam dualitas',
    region: 'bali',
    category: 'meditation',
    source: 'Filosofi Keseimbangan Bali',
    culturalContext: 'Konsep Bali tentang menerima dan menyeimbangkan opposites dalam hidup sebagai path menuju wisdom.',
    practicalApplication: 'Meditasi dengan mengobservasi dan menyeimbangkan polarities: terang-gelap, senang-sedih, dll.',
    relatedPractices: ['Balance Meditation', 'Polarity Integration'],
    difficulty: 'intermediate',
    isUnlocked: false,
    isFavorited: true,
    shareCount: 11,
    meditationRelevance: 'Mengintegrasikan dan menyeimbangkan aspects berlawanan dalam diri',
    icon: '⚖️'
  },

  // Sumatran Wisdom
  {
    id: 'sumatra-1',
    text: 'Adat bersendi syarak, syarak bersendi Kitabullah',
    translation: 'Adat bersandar pada syariat, syariat bersandar pada Al-Quran',
    region: 'sumatra',
    category: 'spirituality',
    source: 'Filosofi Minangkabau',
    culturalContext: 'Integrasi antara tradisi lokal dan spirituality Islam dalam budaya Minangkabau.',
    practicalApplication: 'Meditasi dengan menggabungkan wisdom tradisional dan prinsip spiritual yang lebih tinggi.',
    relatedPractices: ['Integrated Wisdom Meditation', 'Cultural-Spiritual Harmony'],
    difficulty: 'advanced',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 4,
    meditationRelevance: 'Mengintegrasikan tradisi local dengan universal spiritual principles',
    icon: '📖'
  },
  {
    id: 'sumatra-2',
    text: 'Buah yang berisi selalu menunduk',
    region: 'sumatra',
    category: 'life-philosophy',
    source: 'Pepatah Melayu Sumatra',
    culturalContext: 'Filosofi tentang humility - semakin berisi ilmu dan wisdom, semakin rendah hati.',
    practicalApplication: 'Refleksi meditasi tentang relationship antara knowledge dan humility.',
    relatedPractices: ['Humility Cultivation', 'Wisdom Integration'],
    difficulty: 'beginner',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 6,
    meditationRelevance: 'Mengembangkan humility seiring dengan pertumbuhan spiritual',
    icon: '🌾'
  },
  {
    id: 'sumatra-3',
    text: 'Air tenang menghanyutkan',
    region: 'sumatra',
    category: 'mindfulness',
    source: 'Kearifan Suku Batak',
    culturalContext: 'Peringatan bahwa ketenangan surface bisa menyembunyikan kekuatan dalam yang powerful.',
    practicalApplication: 'Meditasi mindfulness untuk mengobservasi still mind yang powerful di balik ketenangan.',
    relatedPractices: ['Still Water Meditation', 'Inner Power Awareness'],
    difficulty: 'intermediate',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 8,
    meditationRelevance: 'Mengakses inner power melalui ketenangan mendalam',
    icon: '🌊'
  },

  // Sulawesi Wisdom
  {
    id: 'sulawesi-1',
    text: 'Sipakatau, sipakalebbi, sipakainge',
    translation: 'Saling memanusiakan, menghargai, mengingatkan',
    region: 'sulawesi',
    category: 'harmony',
    source: 'Filosofi Suku Bugis-Makassar',
    culturalContext: 'Tiga prinsip fundamental dalam hubungan antar manusia dalam budaya Sulawesi.',
    practicalApplication: 'Loving-kindness meditation dengan tiga aspek: humanizing others, appreciating, dan gentle reminding.',
    relatedPractices: ['Triple Compassion Meditation', 'Social Harmony Practice'],
    difficulty: 'intermediate',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 10,
    meditationRelevance: 'Mengembangkan compassion dan harmoni social dalam praktik',
    icon: '🤝'
  },
  {
    id: 'sulawesi-2',
    text: 'Tongkonan adalah pusat kehidupan spiritual',
    region: 'sulawesi',
    category: 'spirituality',
    source: 'Tradisi Toraja',
    culturalContext: 'Tongkonan (rumah adat Toraja) melambangkan center spiritual dan connection dengan ancestors.',
    practicalApplication: 'Visualisasi sacred space sebagai center untuk spiritual practice dan ancestral connection.',
    relatedPractices: ['Sacred Space Meditation', 'Ancestral Connection'],
    difficulty: 'advanced',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 3,
    meditationRelevance: 'Menciptakan dan mengakses sacred space untuk spiritual practice',
    icon: '🏠'
  },
  {
    id: 'sulawesi-3',
    text: 'Leluhur adalah guide untuk kehidupan',
    region: 'sulawesi',
    category: 'spirituality',
    source: 'Kepercayaan Animisme Sulawesi',
    culturalContext: 'Respect dan connection dengan ancestors sebagai source wisdom dan guidance.',
    practicalApplication: 'Meditasi dengan meminta guidance dari inner wisdom yang direpresentasikan sebagai ancestral knowledge.',
    relatedPractices: ['Ancestral Guidance Meditation', 'Inner Wisdom Access'],
    difficulty: 'advanced',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 7,
    meditationRelevance: 'Mengakses inner wisdom melalui connection dengan lineage spiritual',
    icon: '👴'
  },

  // Nusa Tenggara Wisdom
  {
    id: 'nusa-tenggara-1',
    text: 'Matahari terbit mengajarkan kita tentang harapan baru',
    region: 'nusa-tenggara',
    category: 'nature',
    source: 'Kearifan Lokal Flores',
    culturalContext: 'Sebagai wilayah timur Indonesia, matahari terbit memiliki makna spiritual khusus tentang renewal dan hope.',
    practicalApplication: 'Sunrise meditation dengan fokus pada renewal energy dan fresh perspective.',
    relatedPractices: ['Sunrise Renewal Meditation', 'Hope Cultivation'],
    difficulty: 'beginner',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 5,
    meditationRelevance: 'Mengakses energy renewal dan optimisme melalui natural cycles',
    icon: '🌅'
  },
  {
    id: 'nusa-tenggara-2',
    text: 'Pulau-pulau kecil, kebijaksanaan besar',
    region: 'nusa-tenggara',
    category: 'life-philosophy',
    source: 'Filosofi Maritime Nusa Tenggara',
    culturalContext: 'Meskipun secara geographic kecil, pulau-pulau memiliki wisdom yang profound tentang kehidupan.',
    practicalApplication: 'Meditasi tentang finding profound wisdom dalam simple dan small things.',
    relatedPractices: ['Small Wonders Meditation', 'Hidden Wisdom Practice'],
    difficulty: 'intermediate',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 4,
    meditationRelevance: 'Menemukan profound insight dalam simplicity dan small moments',
    icon: '🏝️'
  },
  {
    id: 'nusa-tenggara-3',
    text: 'Laut menghubungkan, bukan memisahkan',
    region: 'nusa-tenggara',
    category: 'harmony',
    source: 'Filosofi Bahari Nusa Tenggara',
    culturalContext: 'Perspektif maritime tentang laut sebagai connector antar pulau, bukan barrier.',
    practicalApplication: 'Meditasi tentang connection dan unity meskipun ada apparent separation atau differences.',
    relatedPractices: ['Ocean Unity Meditation', 'Connection Across Distance'],
    difficulty: 'intermediate',
    isUnlocked: false,
    isFavorited: false,
    shareCount: 6,
    meditationRelevance: 'Merasakan connection dan unity beyond apparent separations',
    icon: '🌊'
  },

  // Universal Indonesian Wisdom
  {
    id: 'universal-1',
    text: 'Bhinneka Tunggal Ika - berbeda tetapi tetap satu',
    region: 'universal',
    category: 'harmony',
    source: 'Semboyan Nasional Indonesia',
    culturalContext: 'Prinsip fundamental Indonesia tentang unity dalam diversity.',
    practicalApplication: 'Meditasi tentang celebrating differences sambil merasakan underlying unity.',
    relatedPractices: ['Unity in Diversity Meditation', 'Inclusive Awareness'],
    difficulty: 'intermediate',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 5),
    isFavorited: true,
    shareCount: 25,
    meditationRelevance: 'Mengintegrasikan diverse aspects of self dalam unified awareness',
    icon: '🇮🇩'
  },
  {
    id: 'universal-2',
    text: 'Gotong royong - kekuatan dalam kebersamaan',
    region: 'universal',
    category: 'harmony',
    source: 'Budaya Komunal Indonesia',
    culturalContext: 'Nilai fundamental Indonesia tentang mutual aid dan community cooperation.',
    practicalApplication: 'Meditasi loving-kindness dengan fokus pada interconnectedness dan mutual support.',
    relatedPractices: ['Community Meditation', 'Mutual Support Visualization'],
    difficulty: 'beginner',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 6),
    isFavorited: false,
    shareCount: 14,
    meditationRelevance: 'Mengembangkan sense of interconnectedness dan community support',
    icon: '🤲'
  }
];

interface Props {
  className?: string;
  onQuoteSelect?: (quote: WisdomQuote) => void;
}

export const IndonesianWisdomCollection: React.FC<Props> = ({ 
  className = '', 
  onQuoteSelect 
}) => {
  const [selectedRegion, setSelectedRegion] = useState<WisdomRegion | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<WisdomCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  // Filter wisdom quotes
  const filteredWisdom = useMemo(() => {
    let filtered = indonesianWisdomCollection;

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(w => w.region === selectedRegion);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(w => w.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w => 
        w.text.toLowerCase().includes(query) ||
        w.translation?.toLowerCase().includes(query) ||
        w.source.toLowerCase().includes(query) ||
        w.culturalContext.toLowerCase().includes(query)
      );
    }

    if (showOnlyFavorites) {
      filtered = filtered.filter(w => w.isFavorited);
    }

    if (showOnlyUnlocked) {
      filtered = filtered.filter(w => w.isUnlocked);
    }

    return filtered.sort((a, b) => {
      // Favorites first, then unlocked, then by share count
      if (a.isFavorited && !b.isFavorited) return -1;
      if (!a.isFavorited && b.isFavorited) return 1;
      if (a.isUnlocked && !b.isUnlocked) return -1;
      if (!a.isUnlocked && b.isUnlocked) return 1;
      return b.shareCount - a.shareCount;
    });
  }, [selectedRegion, selectedCategory, searchQuery, showOnlyFavorites, showOnlyUnlocked]);

  // Statistics
  const stats = useMemo(() => {
    const total = indonesianWisdomCollection.length;
    const unlocked = indonesianWisdomCollection.filter(w => w.isUnlocked).length;
    const favorited = indonesianWisdomCollection.filter(w => w.isFavorited).length;
    const totalShares = indonesianWisdomCollection.reduce((sum, w) => sum + w.shareCount, 0);
    
    const regionStats = indonesianWisdomCollection.reduce((acc, w) => {
      acc[w.region] = (acc[w.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, unlocked, favorited, totalShares, regionStats };
  }, []);

  // Get region color
  const getRegionColor = (region: WisdomRegion) => {
    const colors = {
      sembalun: 'emerald',
      java: 'amber', 
      bali: 'blue',
      sumatra: 'green',
      sulawesi: 'purple',
      'nusa-tenggara': 'orange',
      universal: 'red'
    };
    return colors[region];
  };

  // Get category icon
  const getCategoryIcon = (category: WisdomCategory) => {
    const icons = {
      meditation: Heart,
      'life-philosophy': BookOpen,
      nature: TreePine,
      spirituality: Sparkles,
      mindfulness: Eye,
      harmony: Sun
    };
    return icons[category];
  };

  const renderWisdomCard = (wisdom: WisdomQuote, index: number) => {
    const CategoryIcon = getCategoryIcon(wisdom.category);
    const regionColor = getRegionColor(wisdom.region);
    
    return (
      <motion.div
        key={wisdom.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => onQuoteSelect?.(wisdom)}
        className="cursor-pointer group"
      >
        <Card className={`p-6 transition-all duration-300 hover:shadow-lg relative overflow-hidden ${
          !wisdom.isUnlocked 
            ? 'opacity-60 bg-gray-50 border-gray-200' 
            : `border-${regionColor}-200 bg-gradient-to-br from-${regionColor}-50 to-white hover:shadow-xl`
        }`}>
          {/* Lock/Unlock Status */}
          <div className="absolute top-4 right-4">
            {wisdom.isUnlocked ? (
              <div className="flex items-center space-x-2">
                {wisdom.isFavorited && (
                  <BookmarkCheck className="w-5 h-5 text-yellow-500" />
                )}
                <div className={`w-8 h-8 rounded-full bg-${regionColor}-100 flex items-center justify-center`}>
                  <span className="text-lg">{wisdom.icon}</span>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>

          {/* Quote Text */}
          <div className="pr-16 mb-4">
            <div className="flex items-start space-x-2 mb-3">
              <Quote className={`w-6 h-6 text-${regionColor}-500 flex-shrink-0 mt-1`} />
              <div className="flex-1">
                <p className={`text-lg font-medium leading-relaxed ${
                  wisdom.isUnlocked ? `text-${regionColor}-900` : 'text-gray-500'
                }`}>
                  {wisdom.isUnlocked ? wisdom.text : '••••••••••••••••••'}
                </p>
                {wisdom.translation && wisdom.isUnlocked && (
                  <p className={`text-sm italic text-${regionColor}-700 mt-2`}>
                    "{wisdom.translation}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            {/* Region and Category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg bg-${regionColor}-100`}>
                  <CategoryIcon className={`w-4 h-4 text-${regionColor}-600`} />
                </div>
                <div>
                  <div className={`text-sm font-medium text-${regionColor}-800`}>
                    {wisdom.region === 'universal' ? 'Indonesia' : 
                     wisdom.region.charAt(0).toUpperCase() + wisdom.region.slice(1)}
                  </div>
                  <div className={`text-xs text-${regionColor}-600`}>
                    {wisdom.category.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </div>
                </div>
              </div>

              {/* Difficulty and Stats */}
              {wisdom.isUnlocked && (
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full bg-${regionColor}-100 text-${regionColor}-700 font-medium mb-1`}>
                    {wisdom.difficulty.charAt(0).toUpperCase() + wisdom.difficulty.slice(1)}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Share2 className="w-3 h-3" />
                    <span>{wisdom.shareCount}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Source */}
            <div className={`text-sm text-${regionColor}-700`}>
              <span className="font-medium">Sumber:</span> {wisdom.isUnlocked ? wisdom.source : '•••••••'}
            </div>

            {/* Cultural Context (truncated) */}
            {wisdom.isUnlocked && (
              <div className={`text-sm text-${regionColor}-600`}>
                <span className="font-medium">Konteks:</span> {
                  wisdom.culturalContext.length > 100 
                    ? wisdom.culturalContext.substring(0, 100) + '...'
                    : wisdom.culturalContext
                }
              </div>
            )}

            {/* Meditation Relevance */}
            {wisdom.isUnlocked && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <Heart className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-xs font-medium text-purple-800">Relevansi Meditasi</span>
                </div>
                <p className="text-sm text-purple-700">{wisdom.meditationRelevance}</p>
              </div>
            )}

            {/* Unlock Date */}
            {wisdom.isUnlocked && wisdom.unlockedAt && (
              <div className="text-xs text-gray-500 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Terbuka sejak {wisdom.unlockedAt.toLocaleDateString('id-ID')}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderStatsCard = () => (
    <Card className="p-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold">Koleksi Kebijaksanaan Indonesia</h2>
            <p className="text-indigo-100">Warisan kearifan lokal Nusantara</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">{stats.unlocked}</div>
          <div className="text-sm text-indigo-200">Terbuka</div>
        </div>
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">{stats.favorited}</div>
          <div className="text-sm text-indigo-200">Favorit</div>
        </div>
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">{stats.totalShares}</div>
          <div className="text-sm text-indigo-200">Dibagikan</div>
        </div>
        <div className="text-center p-4 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">{Object.keys(stats.regionStats).length}</div>
          <div className="text-sm text-indigo-200">Wilayah</div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {renderStatsCard()}

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kebijaksanaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Region and Category Filters */}
            <div className="flex flex-wrap gap-2">
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as WisdomRegion | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Semua Wilayah</option>
                <option value="sembalun">Sembalun</option>
                <option value="java">Jawa</option>
                <option value="bali">Bali</option>
                <option value="sumatra">Sumatra</option>
                <option value="sulawesi">Sulawesi</option>
                <option value="nusa-tenggara">Nusa Tenggara</option>
                <option value="universal">Universal</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as WisdomCategory | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Semua Kategori</option>
                <option value="meditation">Meditasi</option>
                <option value="life-philosophy">Filosofi Hidup</option>
                <option value="nature">Alam</option>
                <option value="spirituality">Spiritualitas</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="harmony">Harmoni</option>
              </select>
            </div>

            {/* Toggle Filters */}
            <div className="flex items-center space-x-2">
              <Button
                variant={showOnlyFavorites ? "primary" : "ghost"}
                size="sm"
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              >
                <Star className="w-4 h-4 mr-1" />
                Favorit
              </Button>
              <Button
                variant={showOnlyUnlocked ? "primary" : "ghost"}
                size="sm"
                onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Terbuka
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Wisdom Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`${selectedRegion}-${selectedCategory}-${searchQuery}-${showOnlyFavorites}-${showOnlyUnlocked}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredWisdom.map((wisdom, index) => 
            renderWisdomCard(wisdom, index)
          )}
        </motion.div>
      </AnimatePresence>

      {filteredWisdom.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <BookOpen className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Tidak Ada Kebijaksanaan Ditemukan
          </h3>
          <p className="text-gray-500">
            Coba ubah filter atau lanjutkan praktik meditasi untuk membuka kebijaksanaan baru!
          </p>
        </Card>
      )}
    </div>
  );
};