import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mountain, Sunrise, Wind, Waves, TreePine, Sun, Moon, Star,
  Clock, Heart, PlayCircle, PauseCircle, SkipForward, RotateCcw,
  Volume2, VolumeX, Settings, BookOpen, Compass, Award,
  ChevronLeft, ChevronRight, Leaf, Crown, Sparkles, Eye
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useMoodTracker } from '../../hooks/useMoodTracker';

interface RegionalPractice {
  id: string;
  region: 'sembalun' | 'java' | 'bali' | 'sumatra' | 'sulawesi' | 'nusa-tenggara';
  regionName: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  culturalElements: string[];
  wisdom: string;
  steps: string[];
  visualizations: string[];
  breathingPattern?: {
    inhale: number;
    hold: number;
    exhale: number;
    pause: number;
  };
  backgroundColor: string;
  icon: React.ComponentType<any>;
  isUnlocked: boolean;
  unlockRequirement?: string;
}

interface MeditationSession {
  practiceId: string;
  startTime: Date;
  duration: number;
  completed: boolean;
}

interface Props {
  className?: string;
  onComplete?: (session: MeditationSession) => void;
}

const regionalPractices: RegionalPractice[] = [
  {
    id: 'sembalun-sunrise',
    region: 'sembalun',
    regionName: 'Sembalun Valley',
    title: 'Meditasi Fajar Gunung Sembalun',
    description: 'Merasakan energi spiritual pagi hari di lembah Sembalun yang damai',
    duration: 15,
    difficulty: 'beginner',
    culturalElements: ['Sunrise reflection', 'Mountain energy', 'Valley winds', 'Sasak wisdom'],
    wisdom: 'Seperti matahari yang terbit setiap pagi, jiwa kita selalu dapat memulai yang baru',
    steps: [
      'Duduk menghadap arah timur dengan mata tertutup',
      'Rasakan kehangatan sinar fajar menyentuh wajah Anda',
      'Bernapas dalam-dalam, bayangkan udara segar pegunungan',
      'Dengarkan keheningan lembah yang penuh kedamaian',
      'Rasakan koneksi dengan alam sekitar'
    ],
    visualizations: [
      'Matahari perlahan terbit di balik puncak Rinjani',
      'Kabut tipis menyelimuti lembah hijau Sembalun',
      'Angin sepoi-sepoi membawa aroma bunga edelweiss',
      'Energi alam mengalir melalui seluruh tubuh'
    ],
    backgroundColor: 'from-orange-400 to-pink-500',
    icon: Sunrise,
    isUnlocked: true
  },
  {
    id: 'java-royal-court',
    region: 'java',
    regionName: 'Java Traditions',
    title: 'Meditasi Kraton Jawa',
    description: 'Praktik mindfulness ala keraton dengan kebijaksanaan raja-raja Jawa',
    duration: 20,
    difficulty: 'intermediate',
    culturalElements: ['Royal wisdom', 'Javanese philosophy', 'Palace serenity', 'Ancient traditions'],
    wisdom: 'Dalam keheningan hati, terdapat kebijaksanaan yang lebih berharga dari mahkota emas',
    steps: [
      'Duduk dengan postur yang tegak dan bermartabat',
      'Letakkan tangan di atas lutut dengan tenang',
      'Hayati filosofi "memayu hayuning bawono" - memperindah dunia',
      'Renungkan tanggung jawab terhadap diri dan sesama',
      'Rasakan kedamaian dalam dan kebijaksanaan leluhur'
    ],
    visualizations: [
      'Istana keraton yang megah dengan taman yang asri',
      'Gamelan yang dimainkan dengan lembut di kejauhan',
      'Batik motif parang yang mengalir seperti air',
      'Pusaka keris yang memancarkan aura spiritual'
    ],
    breathingPattern: { inhale: 4, hold: 4, exhale: 6, pause: 2 },
    backgroundColor: 'from-amber-500 to-yellow-600',
    icon: Crown,
    isUnlocked: true
  },
  {
    id: 'bali-temple-sacred',
    region: 'bali',
    regionName: 'Balinese Harmony',
    title: 'Meditasi Pura Suci',
    description: 'Harmonisasi diri di ruang sacral dengan tradisi Tri Hita Karana',
    duration: 18,
    difficulty: 'intermediate',
    culturalElements: ['Temple sanctity', 'Tri Hita Karana', 'Balinese rituals', 'Sacred geometry'],
    wisdom: 'Harmoni antara manusia, alam, dan Sang Hyang Widhi adalah kunci kedamaian sejati',
    steps: [
      'Duduk di area suci dengan sikap penuh hormat',
      'Ucapkan doa sederhana dalam hati',
      'Hayati konsep Tri Hita Karana dalam kehidupan',
      'Rasakan keseimbangan antara tubuh, pikiran, dan jiwa',
      'Bersyukur atas berkah yang telah diterima'
    ],
    visualizations: [
      'Gerbang candi bentar yang menjulang tinggi',
      'Asap dupa yang mengepul ke langit',
      'Air suci mengalir dari tempat persembahyangan',
      'Bunga frangipani yang harum menenangkan'
    ],
    breathingPattern: { inhale: 6, hold: 2, exhale: 6, pause: 2 },
    backgroundColor: 'from-blue-500 to-teal-600',
    icon: Waves,
    isUnlocked: true
  },
  {
    id: 'sumatra-forest-deep',
    region: 'sumatra',
    regionName: 'Sumatra Wilderness',
    title: 'Meditasi Hutan Rimba',
    description: 'Terhubung dengan energi primordial hutan hujan Sumatera',
    duration: 12,
    difficulty: 'beginner',
    culturalElements: ['Forest spirits', 'Minangkabau wisdom', 'Nature connection', 'Ancient trees'],
    wisdom: 'Hutan mengajarkan kita bahwa dalam keragaman terdapat kekuatan dan kedamaian',
    steps: [
      'Berdiri atau duduk di tengah alam yang rimbun',
      'Dengarkan simfoni alam: burung, serangga, angin',
      'Rasakan energi kehidupan yang mengalir di sekitar',
      'Bernapas selaras dengan ritme alam',
      'Biarkan pikiran mengalir seperti sungai di hutan'
    ],
    visualizations: [
      'Pohon-pohon tinggi yang menjulang ke langit',
      'Sinar matahari yang menembus dedaunan',
      'Suara gemericik air dari sungai kecil',
      'Aroma tanah basah dan daun-daunan segar'
    ],
    backgroundColor: 'from-green-600 to-emerald-700',
    icon: TreePine,
    isUnlocked: false,
    unlockRequirement: 'Complete 3 Sembalun sessions'
  },
  {
    id: 'sulawesi-ancestral',
    region: 'sulawesi',
    regionName: 'Sulawesi Spirituality',
    title: 'Meditasi Leluhur Toraja',
    description: 'Menghormati kebijaksanaan nenek moyang dengan spiritualitas Toraja',
    duration: 25,
    difficulty: 'advanced',
    culturalElements: ['Ancestral wisdom', 'Tongkonan architecture', 'Buffalo symbolism', 'Mountain spirits'],
    wisdom: 'Nenek moyang kita hidup dalam setiap napas yang kita ambil, dalam setiap keputusan yang kita buat',
    steps: [
      'Duduk dengan menghadap ke arah rumah adat Tongkonan',
      'Hormati arwah leluhur dengan doa sederhana',
      'Renungkan nilai-nilai Aluk To Dolo dalam hidup',
      'Rasakan koneksi dengan generasi sebelum kita',
      'Terima kebijaksanaan yang diwariskan turun temurun'
    ],
    visualizations: [
      'Atap Tongkonan yang melengkung seperti perahu',
      'Buffalo bercula besar simbol kemakmuran',
      'Pegunungan Toraja yang misterius',
      'Ritual adat yang sakral dan bermakna'
    ],
    breathingPattern: { inhale: 7, hold: 3, exhale: 7, pause: 3 },
    backgroundColor: 'from-purple-600 to-indigo-700',
    icon: Compass,
    isUnlocked: false,
    unlockRequirement: 'Complete 5 Java sessions'
  },
  {
    id: 'nusa-tenggara-sunrise',
    region: 'nusa-tenggara',
    regionName: 'Nusa Tenggara Wisdom',
    title: 'Meditasi Timur Terbit',
    description: 'Menyambut fajar dari pulau paling timur dengan kebijaksanaan lokal',
    duration: 16,
    difficulty: 'intermediate',
    culturalElements: ['Eastern sunrise', 'Island culture', 'Sea meditation', 'Traditional values'],
    wisdom: 'Dari timur datang cahaya, dari dalam diri datang kedamaian',
    steps: [
      'Posisikan diri menghadap ke timur dengan khidmat',
      'Sambut cahaya pertama hari dengan syukur',
      'Rasakan energi laut yang tenang namun kuat',
      'Hayati nilai-nilai gotong royong dalam hidup',
      'Berdoa untuk kedamaian dan persatuan'
    ],
    visualizations: [
      'Matahari terbit dari balik cakrawala laut',
      'Gelombang laut yang berirama menenangkan',
      'Perahu nelayan yang berlayar dengan damai',
      'Pantai pasir putih yang membentang luas'
    ],
    breathingPattern: { inhale: 5, hold: 3, exhale: 7, pause: 1 },
    backgroundColor: 'from-orange-500 to-red-500',
    icon: Sun,
    isUnlocked: false,
    unlockRequirement: 'Complete 4 Bali sessions'
  }
];

export const EnhancedIndonesianMeditation: React.FC<Props> = ({
  className = '',
  onComplete
}) => {
  const [currentPractice, setCurrentPractice] = useState<RegionalPractice | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showVisualizations, setShowVisualizations] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const { addMoodEntry } = useMoodTracker();

  // Filter practices based on selected region and unlock status
  const availablePractices = useMemo(() => {
    let filtered = regionalPractices;
    
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(practice => practice.region === selectedRegion);
    }
    
    return filtered;
  }, [selectedRegion]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  const startMeditation = (practice: RegionalPractice) => {
    if (!practice.isUnlocked) return;
    
    setCurrentPractice(practice);
    setTimeRemaining(practice.duration * 60);
    setSessionStartTime(new Date());
    setCurrentStep(0);
    setIsActive(true);
    setShowVisualizations(false);
  };

  const pauseResume = () => {
    setIsActive(!isActive);
  };

  const nextStep = () => {
    if (currentPractice && currentStep < currentPractice.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (!currentPractice || !sessionStartTime) return;
    
    const session: MeditationSession = {
      practiceId: currentPractice.id,
      startTime: sessionStartTime,
      duration: currentPractice.duration,
      completed: true
    };
    
    // Add positive mood entry after completing cultural meditation
    addMoodEntry('calm', 'Completed Indonesian cultural meditation');
    
    if (onComplete) {
      onComplete(session);
    }
    
    resetSession();
  };

  const resetSession = () => {
    setCurrentPractice(null);
    setIsActive(false);
    setCurrentStep(0);
    setTimeRemaining(0);
    setSessionStartTime(null);
    setShowVisualizations(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRegionIcon = (region: string) => {
    switch (region) {
      case 'sembalun': return Mountain;
      case 'java': return Crown;
      case 'bali': return Waves;
      case 'sumatra': return TreePine;
      case 'sulawesi': return Compass;
      case 'nusa-tenggara': return Sun;
      default: return Star;
    }
  };

  if (currentPractice) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentPractice.backgroundColor} ${className}`}>
        <div className="min-h-screen bg-black/20 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto">
            
            {/* Header */}
            <Card className="p-6 bg-white/90 backdrop-blur-md border-0 shadow-2xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSession}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{formatTime(timeRemaining)}</div>
                  <div className="text-sm text-gray-600">{currentPractice.regionName}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVisualizations(!showVisualizations)}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showVisualizations ? 'Sembunyikan' : 'Visualisasi'}
                </Button>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">
                  {currentPractice.title}
                </h2>
                <p className="text-gray-700">{currentPractice.description}</p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-white to-gray-100 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${100 - (timeRemaining / (currentPractice.duration * 60)) * 100}%` 
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </Card>

            {/* Main Content */}
            <AnimatePresence mode="wait">
              {showVisualizations ? (
                <motion.div
                  key="visualizations"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6 bg-white/90 backdrop-blur-md border-0 shadow-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      🌟 Visualisasi Meditasi
                    </h3>
                    <div className="space-y-4">
                      {currentPractice.visualizations.map((visualization, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.3 }}
                          className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                        >
                          <p className="text-gray-800 leading-relaxed">{visualization}</p>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="steps"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6 bg-white/90 backdrop-blur-md border-0 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Langkah {currentStep + 1} dari {currentPractice.steps.length}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {Math.round(((currentStep + 1) / currentPractice.steps.length) * 100)}%
                      </div>
                    </div>

                    <div className="min-h-[120px] flex items-center justify-center mb-6">
                      <p className="text-lg text-gray-800 text-center leading-relaxed">
                        {currentPractice.steps[currentStep]}
                      </p>
                    </div>

                    {/* Step Navigation */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousStep}
                        disabled={currentStep === 0}
                        className="flex items-center space-x-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Sebelumnya</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextStep}
                        disabled={currentStep === currentPractice.steps.length - 1}
                        className="flex items-center space-x-2"
                      >
                        <span>Selanjutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <Card className="p-4 bg-white/90 backdrop-blur-md border-0 shadow-2xl mt-6">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={pauseResume}
                  className="flex items-center space-x-2"
                >
                  {isActive ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                  <span>{isActive ? 'Jeda' : 'Lanjutkan'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleComplete}
                  className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                >
                  <Award className="w-6 h-6" />
                  <span>Selesai</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={resetSession}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-6 h-6" />
                  <span>Reset</span>
                </Button>
              </div>
            </Card>

            {/* Wisdom Quote */}
            <Card className="p-4 bg-white/80 backdrop-blur-md border-0 shadow-xl mt-4">
              <div className="text-center">
                <BookOpen className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700 italic">
                  "{currentPractice.wisdom}"
                </p>
              </div>
            </Card>

            {/* Breathing Pattern (if available) */}
            {currentPractice.breathingPattern && (
              <Card className="p-4 bg-white/80 backdrop-blur-md border-0 shadow-xl mt-4">
                <div className="text-center">
                  <Wind className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800 mb-1">Pola Pernapasan</p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span>Tarik: {currentPractice.breathingPattern.inhale}s</span>
                    <span>Tahan: {currentPractice.breathingPattern.hold}s</span>
                    <span>Buang: {currentPractice.breathingPattern.exhale}s</span>
                    <span>Jeda: {currentPractice.breathingPattern.pause}s</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-heading font-bold">Meditasi Budaya Indonesia</h2>
            <p className="text-emerald-100">Jelajahi praktik meditasi tradisional dari seluruh Nusantara</p>
          </div>
          <Mountain className="w-12 h-12 text-emerald-200" />
        </div>
      </Card>

      {/* Region Filter */}
      <Card className="p-4">
        <div className="flex items-center space-x-4 overflow-x-auto">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Pilih Wilayah:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedRegion('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedRegion === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua Wilayah
            </button>
            {Array.from(new Set(regionalPractices.map(p => p.region))).map((region) => {
              const practice = regionalPractices.find(p => p.region === region);
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedRegion === region
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {practice?.regionName}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Practice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availablePractices.map((practice, index) => {
          const Icon = practice.icon;
          
          return (
            <motion.div
              key={practice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`p-6 transition-all hover:shadow-lg cursor-pointer ${
                  practice.isUnlocked
                    ? 'hover:scale-105 transform'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => startMeditation(practice)}
              >
                <div className="relative">
                  {!practice.isUnlocked && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                      <div className="bg-yellow-500 text-white p-1 rounded-full">
                        <Star className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  <div className={`p-4 rounded-lg bg-gradient-to-br ${practice.backgroundColor} mb-4`}>
                    <Icon className="w-8 h-8 text-white mx-auto" />
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {practice.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {practice.description}
                    </p>

                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{practice.duration} menit</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(practice.difficulty)}`}>
                        {practice.difficulty === 'beginner' ? 'Pemula' :
                         practice.difficulty === 'intermediate' ? 'Menengah' : 'Mahir'}
                      </span>
                    </div>
                  </div>

                  {practice.isUnlocked ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {practice.culturalElements.slice(0, 2).map((element, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {element}
                          </span>
                        ))}
                      </div>
                      
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Mulai Meditasi
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">{practice.unlockRequirement}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="w-full"
                      >
                        🔒 Terkunci
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Cultural Elements Summary */}
      <Card className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Elemen Budaya dalam Meditasi
          </h3>
          <p className="text-gray-600">
            Setiap praktik mengintegrasikan kearifan lokal dan tradisi spiritual Indonesia
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <Sparkles className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-emerald-900">Kebijaksanaan Lokal</div>
            <div className="text-xs text-emerald-700">Filosofi tradisional</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Leaf className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-blue-900">Koneksi Alam</div>
            <div className="text-xs text-blue-700">Harmoni lingkungan</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-purple-900">Spiritualitas</div>
            <div className="text-xs text-purple-700">Kedamaian batin</div>
          </div>
          
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <Crown className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-amber-900">Warisan Leluhur</div>
            <div className="text-xs text-amber-700">Tradisi turun temurun</div>
          </div>
        </div>
      </Card>
    </div>
  );
};