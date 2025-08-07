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
      className="flex-1 px-6 py-8"
    >
      <div className="max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <CairnIcon size={48} progress={25} className="text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-semibold text-gray-800 mb-2">
            Dari mana asalmu?
          </h2>
          <p className="text-gray-600 font-body text-sm">
            Kami akan menyesuaikan konten dengan kearifan lokal daerahmu
          </p>
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
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected ? 'scale-105 shadow-xl ring-2 ring-primary-300' : 'hover:scale-102 hover:shadow-lg'
                  }`}
                  padding="medium"
                  onClick={() => handleRegionSelect(region.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 text-2xl">
                      {region.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">{region.name}</h3>
                      <p className="text-sm text-gray-600">{region.description}</p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </Card>
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
      className="flex-1 px-6 py-8"
    >
      <div className="max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <CairnIcon size={48} progress={50} className="text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-semibold text-gray-800 mb-2">
            Tradisi spiritual mana yang kamu ikuti?
          </h2>
          <p className="text-gray-600 font-body text-sm mb-4">
            Kami akan menyesuaikan konten dengan nilai-nilai spiritualmu
          </p>
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
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected ? 'scale-105 shadow-xl ring-2 ring-primary-300' : 'hover:scale-102 hover:shadow-lg'
                  }`}
                  padding="medium"
                  onClick={() => handleSpiritualSelect(spiritual.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 text-2xl">
                      {spiritual.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">{spiritual.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{spiritual.description}</p>
                      {spiritual.id === 'islam' && (
                        <p className="text-xs text-primary-600">
                          ✨ Integrasi otomatis dengan jadwal sholat
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </Card>
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
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected ? 'scale-105 shadow-xl ring-2 ring-primary-300' : 'hover:scale-102 hover:shadow-lg'
                  }`}
                  padding="medium"
                  onClick={() => handleFamilySelect(family.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 text-2xl">
                      {family.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">{family.name}</h3>
                      <p className="text-sm text-gray-600">{family.description}</p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </Card>
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🌟 Mulai Perjalanan Spiritual Saya
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSkip}
            className="w-full bg-white text-gray-700 font-medium py-3 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Nanti Saja
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-meditation-zen-50">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-8 w-32 h-32 rounded-full bg-primary-400"
        />
      </div>

      <div className="relative z-10">
        {/* Header with step indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 pt-12"
        >
          <div className="max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (currentStep === 'spiritual' && selectedRegion) setCurrentStep('region');
                    else if (currentStep === 'family' && selectedSpiritual) setCurrentStep('spiritual');
                    else if (currentStep === 'preferences' && selectedFamily) setCurrentStep('family');
                  }}
                  className="text-gray-500 hover:text-gray-700"
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
            <div className="flex justify-center space-x-2 mb-6">
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