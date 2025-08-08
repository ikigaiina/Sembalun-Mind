import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CairnIcon } from '../ui';
import type { MoodType } from '../../types/mood';

export type CulturalRegion = 'jakarta' | 'bali' | 'jawa-tengah' | 'jawa-timur' | 'sumatra' | 'kalimantan' | 'sulawesi' | 'other';
export type SpiritualTradition = 'islam' | 'hindu' | 'buddha' | 'kristen' | 'javanese' | 'secular' | 'other';
export type FamilyContext = 'private-room' | 'shared-space' | 'limited-privacy' | 'family-supportive';
export type LanguagePreference = 'bahasa-formal' | 'bahasa-casual' | 'regional-dialect' | 'bilingual';

interface CulturalData {
  region?: CulturalRegion;
  spiritualTradition?: SpiritualTradition;
  familyContext?: FamilyContext;
  languagePreference?: LanguagePreference;
  prayerTimeIntegration?: boolean;
  culturalWisdomSources?: string[];
}

interface CulturalPersonalizationScreenProps {
  onComplete: (culturalData: CulturalData) => void;
  onSkip: () => void;
}

interface RegionOption {
  id: CulturalRegion;
  name: string;
  description: string;
  icon: string;
  greeting: string;
  wisdom: string;
}

interface SpiritualOption {
  id: SpiritualTradition;
  name: string;
  description: string;
  icon: string;
  wisdomSources: string[];
}

const regionOptions: RegionOption[] = [
  {
    id: 'jakarta',
    name: 'Jakarta & Sekitarnya',
    description: 'Budaya metropolitan dengan kearifan Betawi',
    icon: '🏙️',
    greeting: 'Selamat datang di Sembalun',
    wisdom: 'Temukan kedamaian di tengah hiruk pikuk ibu kota'
  },
  {
    id: 'bali',
    name: 'Bali',
    description: 'Harmoni spiritual Hindu-Bali dan alam',
    icon: '🏛️',
    greeting: 'Rahajeng rawuh ring Sembalun',
    wisdom: 'Tri Hita Karana - Harmoni dengan diri, sesama, dan alam'
  },
  {
    id: 'jawa-tengah',
    name: 'Jawa Tengah',
    description: 'Kearifan Jawa dan spiritualitas Kejawen',
    icon: '🎭',
    greeting: 'Sugeng rawuh wonten Sembalun',
    wisdom: 'Manunggaling kawulo Gusti - Penyatuan dengan Yang Maha Kuasa'
  },
  {
    id: 'jawa-timur',
    name: 'Jawa Timur',
    description: 'Perpaduan budaya Jawa dan Madura',
    icon: '⛰️',
    greeting: 'Sugeng rawuh nang Sembalun',
    wisdom: 'Ngudi kasunyatan - Mencari kebenaran sejati'
  },
  {
    id: 'sumatra',
    name: 'Sumatra',
    description: 'Kekayaan budaya Melayu dan Batak',
    icon: '🌿',
    greeting: 'Selamat datang ke Sembalun',
    wisdom: 'Adat basandi syarak, syarak basandi Kitabullah'
  },
  {
    id: 'other',
    name: 'Daerah Lainnya',
    description: 'Kearifan Nusantara yang beragam',
    icon: '🇮🇩',
    greeting: 'Selamat datang di Sembalun',
    wisdom: 'Bhinneka Tunggal Ika - Berbeda tapi tetap satu'
  }
];

const spiritualOptions: SpiritualOption[] = [
  {
    id: 'islam',
    name: 'Islam',
    description: 'Integrasi dengan waktu sholat dan dzikir',
    icon: '☪️',
    wisdomSources: ['Al-Quran', 'Hadits', 'Kearifan Ulama Nusantara']
  },
  {
    id: 'hindu',
    name: 'Hindu',
    description: 'Yoga, pranayama, dan filosofi Vedanta',
    icon: '🕉️',
    wisdomSources: ['Bhagavad Gita', 'Upanishad', 'Kearifan Bali']
  },
  {
    id: 'buddha',
    name: 'Buddha',
    description: 'Vipassana, mindfulness, dan Dharma',
    icon: '☸️',
    wisdomSources: ['Tripitaka', 'Dharma', 'Kearifan Sangha']
  },
  {
    id: 'kristen',
    name: 'Kristen',
    description: 'Meditasi kontemplatif dan doa hening',
    icon: '✝️',
    wisdomSources: ['Alkitab', 'Tradisi Kontemplatif', 'Kearifan Mistik']
  },
  {
    id: 'javanese',
    name: 'Kejawen',
    description: 'Spiritualitas Jawa dan kebijaksanaan leluhur',
    icon: '🎋',
    wisdomSources: ['Serat Centhini', 'Primbon', 'Kearifan Leluhur']
  },
  {
    id: 'secular',
    name: 'Spiritual Umum',
    description: 'Mindfulness universal tanpa afiliasi agama',
    icon: '🌟',
    wisdomSources: ['Filosofi Universal', 'Kearifan Alam', 'Humanisme']
  }
];

const familyContextOptions = [
  {
    id: 'private-room' as FamilyContext,
    name: 'Ruang Pribadi',
    description: 'Punya ruang tenang untuk meditasi sendiri',
    icon: '🚪'
  },
  {
    id: 'shared-space' as FamilyContext,
    name: 'Ruang Bersama',
    description: 'Berbagi ruang dengan keluarga, butuh fleksibilitas',
    icon: '🏠'
  },
  {
    id: 'family-supportive' as FamilyContext,
    name: 'Keluarga Mendukung',
    description: 'Keluarga ikut mendukung praktik mindfulness',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    id: 'limited-privacy' as FamilyContext,
    name: 'Privasi Terbatas',
    description: 'Lingkungan ramai, butuh teknik yang adaptif',
    icon: '🏢'
  }
];

export const CulturalPersonalizationScreen: React.FC<CulturalPersonalizationScreenProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState<'region' | 'spiritual' | 'family' | 'preferences'>('region');
  const [culturalData, setCulturalData] = useState<CulturalData>({});
  const [selectedRegion, setSelectedRegion] = useState<CulturalRegion | null>(null);
  const [selectedSpiritual, setSelectedSpiritual] = useState<SpiritualTradition | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<FamilyContext | null>(null);

  const handleRegionSelect = (region: CulturalRegion) => {
    setSelectedRegion(region);
    setCulturalData(prev => ({ ...prev, region }));
    
    setTimeout(() => {
      setCurrentStep('spiritual');
    }, 800);
  };

  const handleSpiritualSelect = (spiritual: SpiritualTradition) => {
    setSelectedSpiritual(spiritual);
    const spiritualOption = spiritualOptions.find(opt => opt.id === spiritual);
    
    setCulturalData(prev => ({
      ...prev,
      spiritualTradition: spiritual,
      culturalWisdomSources: spiritualOption?.wisdomSources || [],
      prayerTimeIntegration: spiritual === 'islam'
    }));
    
    setTimeout(() => {
      setCurrentStep('family');
    }, 800);
  };

  const handleFamilySelect = (family: FamilyContext) => {
    setSelectedFamily(family);
    setCulturalData(prev => ({ ...prev, familyContext: family }));
    
    setTimeout(() => {
      setCurrentStep('preferences');
    }, 800);
  };

  const handleComplete = () => {
    const finalCulturalData: CulturalData = {
      ...culturalData,
      languagePreference: 'bahasa-casual' // Default, can be customized later
    };
    
    onComplete(finalCulturalData);
  };

  const getCurrentRegionWisdom = () => {
    if (!selectedRegion) return '';
    const region = regionOptions.find(r => r.id === selectedRegion);
    return region?.wisdom || '';
  };

  const renderRegionStep = () => (
    <motion.div
      key="region"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 px-6 py-2"
    >
      <div className="max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <CairnIcon size={56} progress={25} className="text-primary-600 mx-auto mb-3" />
          </motion.div>
          <motion.h2 
            className="text-2xl font-heading font-bold text-gray-800 mb-3"
            animate={{ scale: [1, 1.01, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Dari mana asalmu?
          </motion.h2>
          <motion.p 
            className="text-gray-600 font-body text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Kami akan menyesuaikan konten dengan kearifan lokal daerahmu
          </motion.p>
        </motion.div>

        <div className="space-y-3">
          {regionOptions.map((region, index) => {
            const isSelected = selectedRegion === region.id;
            
            return (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`cursor-pointer transition-all duration-300 relative overflow-hidden rounded-2xl ${
                    isSelected ? 'scale-105 shadow-2xl' : 'hover:scale-102 hover:shadow-xl'
                  }`}
                  onClick={() => handleRegionSelect(region.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Enhanced Card Background */}
                  <div className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all duration-300 ${
                    isSelected ? 'border-primary-400 bg-gradient-to-r from-primary-50 to-accent-50' : 'border-white/50 hover:border-primary-200'
                  }`}>
                    
                    {/* Card Sparkles */}
                    {isSelected && (
                      <>
                        <motion.div
                          className="absolute top-2 right-2 text-yellow-400 text-sm"
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
                        
                        <motion.div
                          className="absolute bottom-2 left-2 text-pink-400 text-xs"
                          animate={{ 
                            scale: [0.8, 1.2, 0.8],
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity,
                            delay: 0.5
                          }}
                        >
                          🌟
                        </motion.div>
                      </>
                    )}
                    
                    {/* Shimmer Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatDelay: 4
                      }}
                    />
                    <div className="relative z-10 flex items-center space-x-4">
                      <motion.div 
                        className="flex-shrink-0 text-3xl"
                        animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {region.icon}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 transition-colors ${
                          isSelected ? 'text-primary-800' : 'text-gray-800'
                        }`}>{region.name}</h3>
                        <p className={`text-sm transition-colors ${
                          isSelected ? 'text-primary-600' : 'text-gray-600'
                        }`}>{region.description}</p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  const renderSpiritualStep = () => (
    <motion.div
      key="spiritual"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 px-6 py-2"
    >
      <div className="max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 3, -3, 0]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <CairnIcon size={56} progress={50} className="text-primary-600 mx-auto mb-3" />
          </motion.div>
          <motion.h2 
            className="text-2xl font-heading font-bold text-gray-800 mb-3"
            animate={{ scale: [1, 1.01, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Tradisi spiritual mana yang kamu ikuti?
          </motion.h2>
          <motion.p 
            className="text-gray-600 font-body text-sm leading-relaxed mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Kami akan menyesuaikan konten dengan nilai-nilai spiritualmu
          </motion.p>
          {getCurrentRegionWisdom() && (
            <div className="bg-primary-50 p-3 rounded-lg">
              <p className="text-primary-800 text-xs italic">
                "{getCurrentRegionWisdom()}"
              </p>
            </div>
          )}
        </motion.div>

        <div className="space-y-3">
          {spiritualOptions.map((spiritual, index) => {
            const isSelected = selectedSpiritual === spiritual.id;
            
            return (
              <motion.div
                key={spiritual.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`cursor-pointer transition-all duration-300 relative overflow-hidden rounded-2xl ${
                    isSelected ? 'scale-105 shadow-2xl' : 'hover:scale-102 hover:shadow-xl'
                  }`}
                  onClick={() => handleSpiritualSelect(spiritual.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Enhanced Spiritual Card Background */}
                  <div className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all duration-300 ${
                    isSelected ? 'border-accent-400 bg-gradient-to-r from-accent-50 to-meditation-zen-50' : 'border-white/50 hover:border-accent-200'
                  }`}>
                    
                    {/* Spiritual Card Sparkles */}
                    {isSelected && (
                      <>
                        <motion.div
                          className="absolute top-2 right-2 text-purple-400 text-sm"
                          animate={{ 
                            scale: [1, 1.4, 1],
                            rotate: [0, 12, -12, 0]
                          }}
                          transition={{ 
                            duration: 2.2, 
                            repeat: Infinity
                          }}
                        >
                          🕉️
                        </motion.div>
                        
                        <motion.div
                          className="absolute bottom-2 left-2 text-blue-400 text-xs"
                          animate={{ 
                            scale: [0.9, 1.3, 0.9],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{ 
                            duration: 2.8, 
                            repeat: Infinity,
                            delay: 0.3
                          }}
                        >
                          ☮️
                        </motion.div>
                      </>
                    )}
                    
                    {/* Spiritual Shimmer Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/30 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        repeatDelay: 5
                      }}
                    />
                    <div className="relative z-10 flex items-center space-x-4">
                      <motion.div 
                        className="flex-shrink-0 text-3xl"
                        animate={isSelected ? { 
                          scale: [1, 1.15, 1],
                          rotate: [0, 5, -5, 0]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {spiritual.icon}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 transition-colors ${
                          isSelected ? 'text-accent-800' : 'text-gray-800'
                        }`}>{spiritual.name}</h3>
                        <p className={`text-sm transition-colors mb-2 ${
                          isSelected ? 'text-accent-600' : 'text-gray-600'
                        }`}>{spiritual.description}</p>
                        {spiritual.id === 'islam' && (
                          <motion.p 
                            className={`text-xs transition-colors ${
                              isSelected ? 'text-primary-700' : 'text-primary-600'
                            }`}
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            ✨ Integrasi otomatis dengan jadwal sholat
                          </motion.p>
                        )}
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-accent-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  const renderFamilyStep = () => (
    <motion.div
      key="family"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 px-6 py-8"
    >
      <div className="max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <CairnIcon size={48} progress={75} className="text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-semibold text-gray-800 mb-2">
            Bagaimana lingkungan meditasimu?
          </h2>
          <p className="text-gray-600 font-body text-sm">
            Kami akan menyesuaikan durasi dan jenis meditasi dengan situasimu
          </p>
        </motion.div>

        <div className="space-y-3">
          {familyContextOptions.map((family, index) => {
            const isSelected = selectedFamily === family.id;
            
            return (
              <motion.div
                key={family.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`cursor-pointer transition-all duration-300 relative overflow-hidden rounded-2xl ${
                    isSelected ? 'scale-105 shadow-2xl' : 'hover:scale-102 hover:shadow-xl'
                  }`}
                  onClick={() => handleFamilySelect(family.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Enhanced Family Card Background */}
                  <div className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all duration-300 ${
                    isSelected ? 'border-meditation-zen-400 bg-gradient-to-r from-meditation-zen-50 to-green-50' : 'border-white/50 hover:border-meditation-zen-200'
                  }`}>
                    
                    {/* Family Card Sparkles */}
                    {isSelected && (
                      <>
                        <motion.div
                          className="absolute top-2 right-2 text-green-400 text-sm"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 8, -8, 0]
                          }}
                          transition={{ 
                            duration: 1.8, 
                            repeat: Infinity
                          }}
                        >
                          🏠
                        </motion.div>
                        
                        <motion.div
                          className="absolute bottom-2 left-2 text-emerald-400 text-xs"
                          animate={{ 
                            scale: [0.8, 1.1, 0.8],
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{ 
                            duration: 2.3, 
                            repeat: Infinity,
                            delay: 0.4
                          }}
                        >
                          🌿
                        </motion.div>
                      </>
                    )}
                    
                    {/* Family Shimmer Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/30 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ 
                        duration: 2.8, 
                        repeat: Infinity, 
                        repeatDelay: 6
                      }}
                    />
                    <div className="relative z-10 flex items-center space-x-4">
                      <motion.div 
                        className="flex-shrink-0 text-3xl"
                        animate={isSelected ? { 
                          scale: [1, 1.12, 1],
                          y: [0, -2, 0]
                        } : {}}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      >
                        {family.icon}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 transition-colors ${
                          isSelected ? 'text-meditation-zen-800' : 'text-gray-800'
                        }`}>{family.name}</h3>
                        <p className={`text-sm transition-colors ${
                          isSelected ? 'text-meditation-zen-600' : 'text-gray-600'
                        }`}>{family.description}</p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-meditation-zen-600 to-green-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  const renderPreferencesStep = () => (
    <motion.div
      key="preferences"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 px-6 py-8"
    >
      <div className="max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <CairnIcon size={48} progress={100} className="text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-semibold text-gray-800 mb-2">
            Siap memulai perjalanan?
          </h2>
          <p className="text-gray-600 font-body text-sm mb-6">
            Sembalun telah disesuaikan dengan preferensi budaya dan spiritualmu
          </p>
          
          {/* Cultural Summary */}
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 p-4 rounded-xl mb-6">
            <div className="space-y-2 text-left">
              {selectedRegion && (
                <div className="flex items-center space-x-2">
                  <span className="text-primary-600 font-medium text-sm">Daerah:</span>
                  <span className="text-gray-700 text-sm">
                    {regionOptions.find(r => r.id === selectedRegion)?.name}
                  </span>
                </div>
              )}
              {selectedSpiritual && (
                <div className="flex items-center space-x-2">
                  <span className="text-primary-600 font-medium text-sm">Spiritual:</span>
                  <span className="text-gray-700 text-sm">
                    {spiritualOptions.find(s => s.id === selectedSpiritual)?.name}
                  </span>
                </div>
              )}
              {selectedFamily && (
                <div className="flex items-center space-x-2">
                  <span className="text-primary-600 font-medium text-sm">Lingkungan:</span>
                  <span className="text-gray-700 text-sm">
                    {familyContextOptions.find(f => f.id === selectedFamily)?.name}
                  </span>
                </div>
              )}
              {culturalData.prayerTimeIntegration && (
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 text-sm">✓ Integrasi waktu sholat aktif</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          {/* Ultra Enhanced Spiritual Journey Button */}
          <motion.button
            onClick={handleComplete}
            className="relative w-full py-5 px-6 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-700 text-white font-bold text-lg shadow-2xl overflow-hidden border-2 border-purple-700"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 30%, #6366f1 70%, #4f46e5 100%)',
              textShadow: '0 2px 4px rgba(0,0,0,0.4)'
            }}
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 30px 40px -5px rgba(124, 58, 237, 0.5), 0 15px 20px -5px rgba(236, 72, 153, 0.3)",
              background: 'linear-gradient(135deg, #6d28d9 0%, #db2777 30%, #5b21b6 70%, #4338ca 100%)'
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {/* Enhanced Shimmer with Multiple Layers */}
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
            
            <motion.div
              className="absolute inset-0 bg-gradient-to-l from-transparent via-yellow-200/30 to-transparent"
              initial={{ x: '100%' }}
              animate={{ x: '-100%' }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatDelay: 6,
                ease: "linear",
                delay: 1.5
              }}
            />
            
            {/* Premium Sparkle Effects */}
            <motion.div
              className="absolute top-3 right-5 text-yellow-200 text-xl drop-shadow-lg"
              animate={{ 
                scale: [1, 1.4, 1],
                rotate: [0, 20, -20, 0],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity
              }}
            >
              ✨
            </motion.div>
            
            <motion.div
              className="absolute bottom-3 left-5 text-yellow-200 text-lg drop-shadow-lg"
              animate={{ 
                scale: [0.8, 1.5, 0.8],
                rotate: [0, -15, 15, 0],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                delay: 0.5
              }}
            >
              🌟
            </motion.div>
            
            <motion.div
              className="absolute top-1/2 left-8 text-pink-200 text-base drop-shadow-md"
              animate={{ 
                scale: [0.9, 1.3, 0.9],
                rotate: [0, 25, -25, 0],
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                delay: 1
              }}
            >
              💫
            </motion.div>
            
            <motion.div
              className="absolute top-1/3 right-8 text-purple-200 text-sm drop-shadow-md"
              animate={{ 
                scale: [0.7, 1.2, 0.7],
                rotate: [0, -30, 30, 0],
                y: [0, -5, 0]
              }}
              transition={{ 
                duration: 2.8, 
                repeat: Infinity,
                delay: 1.8
              }}
            >
              🔮
            </motion.div>
            
            <motion.div
              className="absolute bottom-1/3 right-12 text-indigo-200 text-xs"
              animate={{ 
                scale: [0.8, 1.1, 0.8],
                opacity: [0.5, 0.8, 0.5],
                rotate: [0, 360, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                delay: 0.8
              }}
            >
              🌙
            </motion.div>
            
            {/* Enhanced Button Content */}
            <div className="relative z-10 flex items-center justify-center space-x-3">
              <motion.div
                className="flex items-center space-x-1"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <motion.span
                  className="text-2xl drop-shadow-lg"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🧘‍♀️
                </motion.span>
                <motion.span
                  className="text-xl drop-shadow-sm"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                >
                  ✨
                </motion.span>
              </motion.div>
              
              <span className="font-bold tracking-wide drop-shadow-sm text-center leading-tight">
                Mulai Perjalanan<br/>
                <span className="text-yellow-100">Spiritual Saya</span>
              </span>
              
              <motion.div
                className="flex items-center"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.span
                  className="text-2xl font-bold drop-shadow-sm"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.div>
            </div>
            
            {/* Magical Glow Border */}
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-yellow-300/60"
              animate={{ 
                scale: [1, 1.02, 1],
                opacity: [0.4, 0.8, 0.4],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Inner Mystical Glow */}
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none" 
              style={{ 
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
                boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.3)' 
              }}
            />
          </motion.button>
          
          {/* Enhanced Skip Button */}
          <motion.button
            onClick={onSkip}
            className="relative w-full py-3 px-6 rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 font-semibold border-2 border-gray-200 hover:border-primary-300 shadow-lg overflow-hidden"
            whileHover={{ 
              scale: 1.02,
              backgroundColor: 'rgba(249, 250, 251, 0.9)'
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {/* Skip Button Shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-100/50 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatDelay: 6
              }}
            />
            
            <span className="relative z-10">Nanti Saja</span>
          </motion.button>
        </div>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            Data budaya dan spiritual kamu aman dan hanya digunakan untuk personalisasi konten
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-meditation-zen-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main floating circles */}
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.12, 0.05],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-8 w-40 h-40 rounded-full bg-gradient-to-br from-primary-400 to-accent-400"
        />
        
        <motion.div 
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.04, 0.1, 0.04],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-32 left-4 w-48 h-48 rounded-full bg-gradient-to-tl from-meditation-zen-400 to-primary-400"
        />
        
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full bg-gradient-to-r from-accent-400 to-pink-400"
        />
        
        {/* Floating Cultural Elements */}
        <motion.div
          className="absolute top-1/4 right-1/4 text-4xl opacity-20"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🏛️
        </motion.div>
        
        <motion.div
          className="absolute bottom-1/3 right-1/3 text-3xl opacity-15"
          animate={{ 
            y: [0, 12, 0],
            rotate: [0, -8, 8, 0],
            scale: [0.9, 1.2, 0.9]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          🕉️
        </motion.div>
        
        <motion.div
          className="absolute top-2/3 left-8 text-2xl opacity-25"
          animate={{ 
            y: [0, -8, 0],
            x: [0, 5, 0],
            rotate: [0, 15, -15, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
        >
          ☪️
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 right-8 text-2xl opacity-20"
          animate={{ 
            scale: [0.8, 1.3, 0.8],
            rotate: [0, 45, 90, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 9, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        >
          🎋
        </motion.div>
        
        {/* Floating Sparkles */}
        <motion.div
          className="absolute top-16 left-1/3 text-xl opacity-30"
          animate={{ 
            y: [0, -10, 0],
            scale: [1, 1.4, 1],
            rotate: [0, 20, -20, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            delay: 1.5
          }}
        >
          ✨
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 right-1/4 text-lg opacity-25"
          animate={{ 
            scale: [0.9, 1.5, 0.9],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -25, 25, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            delay: 0.8
          }}
        >
          🌟
        </motion.div>
        
        <motion.div
          className="absolute top-1/3 left-12 text-base opacity-20"
          animate={{ 
            y: [0, 8, 0],
            x: [0, -3, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            delay: 2.8
          }}
        >
          💫
        </motion.div>
      </div>

      <div className="relative z-10">
        {/* Header with step indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pt-8 pb-4"
        >
          <div className="max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (currentStep === 'spiritual' && selectedRegion) setCurrentStep('region');
                    else if (currentStep === 'family' && selectedSpiritual) setCurrentStep('spiritual');
                    else if (currentStep === 'preferences' && selectedFamily) setCurrentStep('family');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-lg"
                  disabled={currentStep === 'region'}
                >
                  ←
                </motion.button>
                <span className="text-sm font-medium text-gray-600">
                  Personalisasi Budaya
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded-lg hover:bg-gray-100"
              >
                Lewati
              </motion.button>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center space-x-2 mb-4">
              {['region', 'spiritual', 'family', 'preferences'].map((step, index) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    step === currentStep ? 'bg-primary-600 w-6' :
                    ['region', 'spiritual', 'family', 'preferences'].indexOf(currentStep) > index ? 'bg-primary-300' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {currentStep === 'region' && renderRegionStep()}
          {currentStep === 'spiritual' && renderSpiritualStep()}
          {currentStep === 'family' && renderFamilyStep()}
          {currentStep === 'preferences' && renderPreferencesStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export type { CulturalData, CulturalRegion, SpiritualTradition, FamilyContext, LanguagePreference };