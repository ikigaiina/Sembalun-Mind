import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Wind, Mountain, Waves, Leaf, Sun } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface BreathingTechnique {
  id: string;
  name: string;
  nameIndonesian: string;
  description: string;
  descriptionIndonesian: string;
  culturalOrigin: string;
  region: string;
  pattern: {
    inhale: number;    // seconds
    hold: number;      // seconds  
    exhale: number;    // seconds
    holdEmpty: number; // seconds
  };
  cycles: number;
  totalDuration: number; // minutes
  benefits: string[];
  benefitsIndonesian: string[];
  culturalStory: string;
  visualization: string;
  visualizationIndonesian: string;
  icon: React.ReactNode;
  backgroundColor: string;
  borderColor: string;
}

interface Props {
  className?: string;
  onComplete?: (sessionData: any) => void;
}

const indonesianBreathingTechniques: BreathingTechnique[] = [
  {
    id: 'rinjani-mountain-breath',
    name: 'Rinjani Mountain Breath',
    nameIndonesian: 'Napas Gunung Rinjani',
    description: 'Deep mountain breathing inspired by the majestic peaks of Mount Rinjani',
    descriptionIndonesian: 'Teknik pernapasan dalam yang terinspirasi dari kemegahan Gunung Rinjani',
    culturalOrigin: 'Sasak Mountain Wisdom',
    region: 'Lombok, Nusa Tenggara Barat',
    pattern: { inhale: 4, hold: 4, exhale: 6, holdEmpty: 2 },
    cycles: 12,
    totalDuration: 5,
    benefits: ['Increases lung capacity', 'Reduces altitude stress', 'Builds endurance', 'Calms the mind'],
    benefitsIndonesian: ['Meningkatkan kapasitas paru-paru', 'Mengurangi stres ketinggian', 'Membangun daya tahan', 'Menenangkan pikiran'],
    culturalStory: 'Para pendaki Sasak menggunakan teknik ini untuk menyesuaikan diri dengan udara tipis pegunungan sambil menghormati kekuatan spiritual Rinjani.',
    visualization: 'Imagine standing at the peak of Rinjani, breathing in the pure mountain air as the sun rises over the caldera lake.',
    visualizationIndonesian: 'Bayangkan berdiri di puncak Rinjani, menghirup udara murni pegunungan saat matahari terbit di atas danau kaldera.',
    icon: <Mountain className="w-6 h-6" />,
    backgroundColor: 'from-blue-50 to-indigo-100',
    borderColor: 'border-blue-200'
  },
  {
    id: 'bali-ocean-rhythm',
    name: 'Bali Ocean Rhythm',
    nameIndonesian: 'Ritme Samudra Bali',
    description: 'Rhythmic breathing that follows the natural flow of Balinese ocean waves',
    descriptionIndonesian: 'Pernapasan ritmis yang mengikuti aliran alami ombak laut Bali',
    culturalOrigin: 'Balinese Hindu Water Ceremony',
    region: 'Bali',
    pattern: { inhale: 6, hold: 2, exhale: 8, holdEmpty: 2 },
    cycles: 10,
    totalDuration: 7,
    benefits: ['Regulates nervous system', 'Promotes emotional balance', 'Connects with nature', 'Reduces anxiety'],
    benefitsIndonesian: ['Mengatur sistem saraf', 'Menyeimbangkan emosi', 'Terhubung dengan alam', 'Mengurangi kecemasan'],
    culturalStory: 'Teknik ini berasal dari ritual penyucian air Hindu-Bali, di mana napas diselaraskan dengan ritme ombak laut yang suci.',
    visualization: 'Feel yourself sitting on warm Balinese sand, your breath naturally syncing with the endless rhythm of ocean waves.',
    visualizationIndonesian: 'Rasakan diri Anda duduk di pasir hangat Bali, napas Anda secara alami sinkron dengan ritme ombak laut yang tak berujung.',
    icon: <Waves className="w-6 h-6" />,
    backgroundColor: 'from-teal-50 to-cyan-100',
    borderColor: 'border-teal-200'
  },
  {
    id: 'javanese-forest-harmony',
    name: 'Javanese Forest Harmony',
    nameIndonesian: 'Harmoni Hutan Jawa',
    description: 'Balanced breathing technique from ancient Javanese meditation traditions',
    descriptionIndonesian: 'Teknik pernapasan seimbang dari tradisi meditasi Jawa kuno',
    culturalOrigin: 'Kejawen Spiritual Practice',
    region: 'Jawa Tengah',
    pattern: { inhale: 4, hold: 4, exhale: 4, holdEmpty: 4 },
    cycles: 16,
    totalDuration: 8,
    benefits: ['Achieves perfect balance', 'Harmonizes energy', 'Deepens meditation', 'Connects with ancestors'],
    benefitsIndonesian: ['Mencapai keseimbangan sempurna', 'Menyelaraskan energi', 'Memperdalam meditasi', 'Terhubung dengan leluhur'],
    culturalStory: 'Praktik ini diwariskan turun-temurun oleh para penghayat Kejawen sebagai cara untuk mencapai keseimbangan sempurna antara jiwa dan raga.',
    visualization: 'Envision yourself in a sacred Javanese forest grove, where ancient trees stand as silent witnesses to your balanced breath.',
    visualizationIndonesian: 'Bayangkan diri Anda di hutan suci Jawa, di mana pohon-pohon tua berdiri sebagai saksi bisu pernapasan seimbang Anda.',
    icon: <Leaf className="w-6 h-6" />,
    backgroundColor: 'from-green-50 to-emerald-100',
    borderColor: 'border-green-200'
  },
  {
    id: 'sundanese-sunrise-breath',
    name: 'Sundanese Sunrise Breath',
    nameIndonesian: 'Napas Fajar Sunda',
    description: 'Energizing breath work that welcomes the new day like Sundanese farmers',
    descriptionIndonesian: 'Teknik pernapasan yang memberi energi untuk menyambut hari baru seperti petani Sunda',
    culturalOrigin: 'Sundanese Agricultural Wisdom',
    region: 'Jawa Barat',
    pattern: { inhale: 3, hold: 1, exhale: 4, holdEmpty: 1 },
    cycles: 20,
    totalDuration: 6,
    benefits: ['Boosts morning energy', 'Connects with earth cycles', 'Increases vitality', 'Promotes gratitude'],
    benefitsIndonesian: ['Meningkatkan energi pagi', 'Terhubung dengan siklus bumi', 'Meningkatkan vitalitas', 'Mendorong rasa syukur'],
    culturalStory: 'Para petani Sunda melakukan ritual pernapasan ini saat fajar untuk menyelaraskan energi mereka dengan siklus alam dan mengucap syukur atas hari baru.',
    visualization: 'Picture yourself in rolling Sundanese rice terraces as the first golden rays of sun illuminate the morning mist.',
    visualizationIndonesian: 'Bayangkan diri Anda di terasering Sunda yang berbukit saat sinar emas pertama matahari menerangi kabut pagi.',
    icon: <Sun className="w-6 h-6" />,
    backgroundColor: 'from-yellow-50 to-orange-100',
    borderColor: 'border-yellow-200'
  },
  {
    id: 'minangkabau-highland-wind',
    name: 'Minangkabau Highland Wind',
    nameIndonesian: 'Angin Dataran Tinggi Minang',
    description: 'Cooling breath technique inspired by the highland winds of West Sumatra',
    descriptionIndonesian: 'Teknik pernapasan menyejukkan yang terinspirasi dari angin dataran tinggi Sumatera Barat',
    culturalOrigin: 'Minangkabau Highland Tradition',
    region: 'Sumatera Barat',
    pattern: { inhale: 5, hold: 3, exhale: 7, holdEmpty: 3 },
    cycles: 14,
    totalDuration: 9,
    benefits: ['Cools the body', 'Reduces internal heat', 'Calms temperament', 'Increases patience'],
    benefitsIndonesian: ['Mendinginkan tubuh', 'Mengurangi panas dalam', 'Menenangkan temperamen', 'Meningkatkan kesabaran'],
    culturalStory: 'Teknik ini dikembangkan oleh masyarakat Minangkabau untuk menghadapi iklim panas dengan memanfaatkan kekuatan angin sejuk dataran tinggi.',
    visualization: 'Feel the cool highland breeze of Minangkabau flowing through you, carrying the wisdom of ancient volcanic peaks.',
    visualizationIndonesian: 'Rasakan angin sejuk dataran tinggi Minangkabau mengalir melalui diri Anda, membawa kebijaksanaan puncak-puncak vulkanis kuno.',
    icon: <Wind className="w-6 h-6" />,
    backgroundColor: 'from-indigo-50 to-purple-100',
    borderColor: 'border-indigo-200'
  }
];

export const IndonesianBreathingExercise: React.FC<Props> = ({
  className = '',
  onComplete
}) => {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>(indonesianBreathingTechniques[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('inhale');
  const [phaseCount, setPhaseCount] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Calculate phase duration based on current phase
  const getPhaseDuration = (phase: string) => {
    switch (phase) {
      case 'inhale': return selectedTechnique.pattern.inhale * 1000;
      case 'hold': return selectedTechnique.pattern.hold * 1000;
      case 'exhale': return selectedTechnique.pattern.exhale * 1000;
      case 'holdEmpty': return selectedTechnique.pattern.holdEmpty * 1000;
      default: return 1000;
    }
  };

  // Get phase instruction text
  const getPhaseInstruction = (phase: string) => {
    switch (phase) {
      case 'inhale': return { en: 'Breathe In', id: 'Tarik Napas' };
      case 'hold': return { en: 'Hold', id: 'Tahan' };
      case 'exhale': return { en: 'Breathe Out', id: 'Hembuskan' };
      case 'holdEmpty': return { en: 'Pause', id: 'Jeda' };
      default: return { en: 'Ready', id: 'Siap' };
    }
  };

  // Breathing cycle effect
  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      setPhaseCount(prev => prev + 1);

      // Move to next phase
      if (currentPhase === 'inhale') {
        setCurrentPhase('hold');
      } else if (currentPhase === 'hold') {
        setCurrentPhase('exhale');
      } else if (currentPhase === 'exhale') {
        setCurrentPhase('holdEmpty');
      } else {
        // Complete one cycle
        setCurrentPhase('inhale');
        setCurrentCycle(prev => {
          const newCycle = prev + 1;
          if (newCycle >= selectedTechnique.cycles) {
            handleSessionComplete();
          }
          return newCycle;
        });
      }
    }, getPhaseDuration(currentPhase));

    return () => clearTimeout(timer);
  }, [isActive, currentPhase, phaseCount, selectedTechnique]);

  // Total time tracking
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
    setCurrentCycle(0);
    setPhaseCount(0);
    setCurrentPhase('inhale');
    setTotalTime(0);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setCurrentCycle(0);
    setPhaseCount(0);
    setTotalTime(0);
    setSessionCompleted(false);
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    setSessionCompleted(true);

    const sessionData = {
      technique: selectedTechnique.id,
      techniqueName: selectedTechnique.nameIndonesian,
      region: selectedTechnique.region,
      cyclesCompleted: selectedTechnique.cycles,
      totalTime: Math.floor(totalTime / 60), // minutes
      culturalOrigin: selectedTechnique.culturalOrigin,
      completedAt: new Date().toISOString(),
      type: 'indonesian-breathing'
    };

    onComplete?.(sessionData);
  };

  const handleTechniqueSelect = (technique: BreathingTechnique) => {
    if (isActive) return; // Don't change during active session
    setSelectedTechnique(technique);
    handleReset();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentCycle / selectedTechnique.cycles) * 100;

  if (sessionCompleted) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <Card className="text-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
          >
            <Wind className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-heading font-bold mb-4 text-gray-800">
            Latihan Selesai! 🌬️
          </h2>

          <p className="text-gray-600 mb-6">
            Anda telah menyelesaikan "{selectedTechnique.nameIndonesian}" 
            dengan {selectedTechnique.cycles} siklus pernapasan
          </p>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-6">
            <p className="text-amber-800 italic text-lg mb-2">
              "{selectedTechnique.culturalStory}"
            </p>
            <p className="text-amber-700 text-sm">
              — {selectedTechnique.culturalOrigin}, {selectedTechnique.region}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleReset}
              variant="default"
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Ulangi Latihan
            </Button>
            <Button
              onClick={() => setSessionCompleted(false)}
              variant="outline"
              size="lg"
            >
              Pilih Teknik Lain
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Technique Selection */}
      <Card className="p-6">
        <h3 className="text-xl font-heading font-semibold mb-4 text-gray-800">
          Pilih Teknik Pernapasan Indonesia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indonesianBreathingTechniques.map((technique) => (
            <motion.button
              key={technique.id}
              onClick={() => handleTechniqueSelect(technique)}
              disabled={isActive}
              className={`p-4 rounded-xl text-left transition-all duration-300 ${
                selectedTechnique.id === technique.id
                  ? `bg-gradient-to-r ${technique.backgroundColor} border-2 ${technique.borderColor}`
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              } ${isActive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              whileHover={!isActive ? { scale: 1.02 } : {}}
              whileTap={!isActive ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center mb-3">
                <div className="text-gray-700 mr-3">
                  {technique.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {technique.nameIndonesian}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {technique.region}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {technique.pattern.inhale}-{technique.pattern.hold}-{technique.pattern.exhale}-{technique.pattern.holdEmpty} • {technique.cycles} siklus
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {technique.descriptionIndonesian}
              </p>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Main Breathing Interface */}
      <Card className={`bg-gradient-to-r ${selectedTechnique.backgroundColor} border-0`}>
        <div className="text-center space-y-6">
          {/* Technique Header */}
          <div>
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <div className="text-gray-700">
                {selectedTechnique.icon}
              </div>
            </div>
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
              {selectedTechnique.nameIndonesian}
            </h2>
            <p className="text-gray-600 mb-2">
              {selectedTechnique.descriptionIndonesian}
            </p>
            <div className="text-sm text-gray-500">
              {selectedTechnique.culturalOrigin} • {selectedTechnique.region}
            </div>
          </div>

          {/* Breathing Circle */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full bg-white/30 backdrop-blur-md border-4 border-white/50"
              animate={{
                scale: isActive ? (
                  currentPhase === 'inhale' ? 1.2 :
                  currentPhase === 'hold' ? 1.2 :
                  currentPhase === 'exhale' ? 0.8 : 0.8
                ) : 1
              }}
              transition={{
                duration: getPhaseDuration(currentPhase) / 1000,
                ease: currentPhase === 'inhale' ? 'easeIn' : 
                      currentPhase === 'exhale' ? 'easeOut' : 'linear'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {isActive ? getPhaseDuration(currentPhase) / 1000 : selectedTechnique.pattern.inhale}
                </div>
                <div className="text-lg text-gray-700">
                  {isActive ? getPhaseInstruction(currentPhase).id : 'Siap'}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Siklus {currentCycle + 1}/{selectedTechnique.cycles}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <motion.div
              className="bg-white/60 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Visualization Text */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-md mx-auto"
            >
              <p className="text-gray-700 italic text-sm leading-relaxed">
                {selectedTechnique.visualizationIndonesian}
              </p>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex justify-center items-center space-x-4">
            <Button
              onClick={handleReset}
              variant="ghost"
              size="icon"
              disabled={!isActive && currentCycle === 0}
              className="bg-white/20 hover:bg-white/30 text-gray-700"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            {!isActive ? (
              <Button
                onClick={handleStart}
                variant="default"
                size="lg"
                className="bg-white/90 hover:bg-white text-gray-800 px-8"
              >
                <Play className="w-6 h-6 mr-2" />
                {currentCycle === 0 ? 'Mulai' : 'Lanjutkan'}
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                variant="default"
                size="lg"
                className="bg-white/90 hover:bg-white text-gray-800 px-8"
              >
                <Pause className="w-6 h-6 mr-2" />
                Jeda
              </Button>
            )}
          </div>

          {/* Session Stats */}
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-bold">{formatTime(totalTime)}</div>
              <div>Waktu</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{currentCycle}</div>
              <div>Siklus</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{Math.round(progress)}%</div>
              <div>Progres</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Benefits and Cultural Info */}
      <Card className="p-6">
        <h4 className="text-lg font-heading font-semibold mb-4 text-gray-800">
          Manfaat & Makna Budaya
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Manfaat:</h5>
            <ul className="space-y-1 text-sm text-gray-600">
              {selectedTechnique.benefitsIndonesian.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Latar Belakang Budaya:</h5>
            <p className="text-sm text-gray-600 leading-relaxed">
              {selectedTechnique.culturalStory}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};