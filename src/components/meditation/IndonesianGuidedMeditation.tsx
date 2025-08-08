import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Mountain, Waves, Wind, Leaf, Sun } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useMoodTracker } from '../../hooks/useMoodTracker';
import type { MoodType } from '../../types/mood';

interface IndonesianMeditationSession {
  id: string;
  title: string;
  titleIndonesian: string;
  description: string;
  descriptionIndonesian: string;
  duration: number;
  region: string;
  culturalElement: string;
  guidanceScript: GuideStep[];
  backgroundSound: 'mountain' | 'ocean' | 'forest' | 'village' | 'temple';
  wisdom: {
    quote: string;
    source: string;
    meaning: string;
  };
}

interface GuideStep {
  time: number; // seconds from start
  text: string;
  textIndonesian: string;
  instruction: 'breathe' | 'visualize' | 'observe' | 'reflect' | 'appreciate';
}

interface Props {
  className?: string;
  onSessionComplete?: (sessionData: any) => void;
}

const indonesianSessions: IndonesianMeditationSession[] = [
  {
    id: 'sembalun-sunrise',
    title: 'Sunrise at Sembalun Valley',
    titleIndonesian: 'Matahari Terbit di Lembah Sembalun',
    description: 'Experience the tranquil beauty of sunrise over Rinjani through mindful breathing',
    descriptionIndonesian: 'Rasakan keindahan matahari terbit di atas Rinjani melalui pernapasan sadar',
    duration: 10,
    region: 'Lombok',
    culturalElement: 'Sunrise ritual from Sasak tradition',
    backgroundSound: 'mountain',
    wisdom: {
      quote: "Seperti matahari yang terbit setiap hari, semangat kita harus selalu baru",
      source: "Pepatah Sasak",
      meaning: "Like the sun that rises every day, our spirit must always be renewed"
    },
    guidanceScript: [
      {
        time: 0,
        text: "Welcome to the Sembalun Valley. Close your eyes and imagine standing on the edge of this beautiful valley.",
        textIndonesian: "Selamat datang di Lembah Sembalun. Pejamkan mata dan bayangkan berdiri di tepi lembah yang indah ini.",
        instruction: 'visualize'
      },
      {
        time: 60,
        text: "Take a deep breath in, feeling the cool mountain air filling your lungs.",
        textIndonesian: "Tarik napas dalam, rasakan udara sejuk pegunungan memenuhi paru-paru Anda.",
        instruction: 'breathe'
      },
      {
        time: 120,
        text: "As you breathe out, imagine releasing any tension from your body.",
        textIndonesian: "Saat menghembuskan napas, bayangkan melepaskan ketegangan dari tubuh Anda.",
        instruction: 'breathe'
      },
      {
        time: 180,
        text: "In the distance, Mount Rinjani stands majestically, a symbol of strength and permanence.",
        textIndonesian: "Di kejauhan, Gunung Rinjani berdiri megah, simbol kekuatan dan kekekalan.",
        instruction: 'visualize'
      },
      {
        time: 300,
        text: "Feel the first rays of sunlight touching your face, bringing warmth and new energy.",
        textIndonesian: "Rasakan sinar matahari pertama menyentuh wajah Anda, membawa kehangatan dan energi baru.",
        instruction: 'observe'
      },
      {
        time: 450,
        text: "Like the Sasak people who have watched countless sunrises here, connect with this ancient wisdom.",
        textIndonesian: "Seperti masyarakat Sasak yang telah menyaksikan ribuan matahari terbit di sini, terhubunglah dengan kebijaksanaan kuno ini.",
        instruction: 'reflect'
      },
      {
        time: 540,
        text: "Take a moment to appreciate this gift of a new day, full of possibilities.",
        textIndonesian: "Luangkan waktu untuk menghargai karunia hari baru ini, penuh dengan kemungkinan.",
        instruction: 'appreciate'
      }
    ]
  },
  {
    id: 'bali-ocean-waves',
    title: 'Balinese Ocean Meditation',
    titleIndonesian: 'Meditasi Laut Bali',
    description: 'Find peace with the rhythmic sound of waves on Bali\'s sacred shores',
    descriptionIndonesian: 'Temukan kedamaian dengan suara ritmis ombak di pantai suci Bali',
    duration: 15,
    region: 'Bali',
    culturalElement: 'Hindu-Balinese water blessing ceremony',
    backgroundSound: 'ocean',
    wisdom: {
      quote: "Seperti air laut yang selalu kembali ke pantai, jiwa kita selalu kembali pada kedamaian",
      source: "Filosofi Tri Hita Karana Bali",
      meaning: "Like ocean water that always returns to shore, our soul always returns to peace"
    },
    guidanceScript: [
      {
        time: 0,
        text: "You are sitting on the warm sand of a sacred Balinese beach at sunset.",
        textIndonesian: "Anda duduk di pasir hangat pantai suci Bali saat matahari terbenam.",
        instruction: 'visualize'
      },
      {
        time: 90,
        text: "Listen to the gentle rhythm of the waves, like nature's own mantra.",
        textIndonesian: "Dengarkan ritme lembut ombak, seperti mantra alam sendiri.",
        instruction: 'observe'
      },
      {
        time: 240,
        text: "With each wave that reaches the shore, breathe in peace and serenity.",
        textIndonesian: "Dengan setiap ombak yang mencapai pantai, hirup kedamaian dan ketenangan.",
        instruction: 'breathe'
      },
      {
        time: 420,
        text: "As each wave retreats, let it carry away your worries and stress.",
        textIndonesian: "Saat setiap ombak surut, biarkan membawa pergi kekhawatiran dan stres Anda.",
        instruction: 'breathe'
      },
      {
        time: 600,
        text: "Feel the connection between yourself and the eternal dance of the ocean.",
        textIndonesian: "Rasakan koneksi antara diri Anda dan tarian kekal samudra.",
        instruction: 'reflect'
      },
      {
        time: 780,
        text: "In this moment, you are one with the sacred waters that have blessed this island for centuries.",
        textIndonesian: "Pada saat ini, Anda menyatu dengan air suci yang telah memberkati pulau ini selama berabad-abad.",
        instruction: 'appreciate'
      }
    ]
  },
  {
    id: 'java-forest-sanctuary',
    title: 'Java Forest Sanctuary',
    titleIndonesian: 'Tempat Suci Hutan Jawa',
    description: 'Deep meditation in the mystical forests of Central Java',
    descriptionIndonesian: 'Meditasi mendalam di hutan mistis Jawa Tengah',
    duration: 20,
    region: 'Jawa Tengah',
    culturalElement: 'Javanese spiritual retreat tradition',
    backgroundSound: 'forest',
    wisdom: {
      quote: "Di dalam keheningan hutan, kita menemukan suara hati yang paling jujur",
      source: "Kebijaksanaan Keraton Yogyakarta",
      meaning: "In the silence of the forest, we find the most honest voice of the heart"
    },
    guidanceScript: [
      {
        time: 0,
        text: "Enter the sacred forest sanctuary, where ancient trees have stood for generations.",
        textIndonesian: "Masuklah ke tempat suci hutan, di mana pohon-pohon kuno telah berdiri selama generasi.",
        instruction: 'visualize'
      },
      {
        time: 180,
        text: "Feel the soft earth beneath you, rich with the wisdom of countless seasons.",
        textIndonesian: "Rasakan tanah lembut di bawah Anda, kaya dengan kebijaksanaan dari musim yang tak terhitung.",
        instruction: 'observe'
      },
      {
        time: 360,
        text: "Breathe in the fresh, life-giving air filled with the essence of growing things.",
        textIndonesian: "Hirup udara segar pemberi kehidupan yang dipenuhi esensi hal-hal yang tumbuh.",
        instruction: 'breathe'
      },
      {
        time: 600,
        text: "Listen to the gentle symphony of nature - leaves rustling, birds calling, life flourishing.",
        textIndonesian: "Dengarkan simfoni lembut alam - dedaunan berdesir, burung berkicau, kehidupan berkembang.",
        instruction: 'observe'
      },
      {
        time: 900,
        text: "In this ancient space, generations of seekers have found inner peace. You are part of this legacy.",
        textIndonesian: "Di ruang kuno ini, generasi pencari telah menemukan kedamaian batin. Anda adalah bagian dari warisan ini.",
        instruction: 'reflect'
      },
      {
        time: 1080,
        text: "Feel your connection to all living things, as the Javanese philosophy of harmony teaches us.",
        textIndonesian: "Rasakan koneksi Anda dengan semua makhluk hidup, seperti yang diajarkan filosofi keharmonisan Jawa.",
        instruction: 'appreciate'
      }
    ]
  }
];

export const IndonesianGuidedMeditation: React.FC<Props> = ({
  className = '',
  onSessionComplete
}) => {
  const [selectedSession, setSelectedSession] = useState<IndonesianMeditationSession>(indonesianSessions[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const { logMood } = useMoodTracker();

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying && currentTime < selectedSession.duration * 60) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Check for next guidance step
          const nextStepIndex = selectedSession.guidanceScript.findIndex(
            step => step.time === newTime
          );
          if (nextStepIndex !== -1) {
            setCurrentStep(nextStepIndex);
          }
          
          // Check if session is complete
          if (newTime >= selectedSession.duration * 60) {
            handleSessionComplete();
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isPlaying, currentTime, selectedSession]);

  const handleSessionComplete = () => {
    setIsPlaying(false);
    setSessionCompleted(true);
    
    const sessionData = {
      sessionId: selectedSession.id,
      duration: selectedSession.duration,
      region: selectedSession.region,
      culturalElement: selectedSession.culturalElement,
      completedAt: new Date().toISOString(),
      type: 'indonesian-guided'
    };

    // Log positive mood after meditation
    logMood('calm', `Completed ${selectedSession.titleIndonesian} meditation`);
    
    onSessionComplete?.(sessionData);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentStep(0);
    setSessionCompleted(false);
  };

  const handleSessionSelect = (session: IndonesianMeditationSession) => {
    setSelectedSession(session);
    handleReset();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / (selectedSession.duration * 60)) * 100;
  const currentGuideStep = selectedSession.guidanceScript[currentStep];

  const getBackgroundIcon = (sound: string) => {
    switch (sound) {
      case 'mountain': return <Mountain className="w-8 h-8" />;
      case 'ocean': return <Waves className="w-8 h-8" />;
      case 'forest': return <Leaf className="w-8 h-8" />;
      case 'village': return <Sun className="w-8 h-8" />;
      case 'temple': return <Wind className="w-8 h-8" />;
      default: return <Mountain className="w-8 h-8" />;
    }
  };

  if (sessionCompleted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`max-w-2xl mx-auto ${className}`}
      >
        <Card variant="meditation" size="lg" className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
          >
            <Sun className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-heading font-bold mb-4 text-gray-800">
            Selamat! Meditasi Selesai ✨
          </h2>

          <p className="text-gray-600 mb-6">
            Anda telah menyelesaikan meditasi "{selectedSession.titleIndonesian}" 
            dari tradisi {selectedSession.region}
          </p>

          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6 mb-6 border-l-4 border-primary-400"
          >
            <p className="text-primary-700 font-medium italic text-lg mb-2">
              "{selectedSession.wisdom.quote}"
            </p>
            <cite className="text-primary-600 text-sm">
              — {selectedSession.wisdom.source}
            </cite>
            <p className="text-gray-600 text-sm mt-2 italic">
              {selectedSession.wisdom.meaning}
            </p>
          </motion.blockquote>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleReset}
              variant="meditation"
              size="lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Mulai Lagi
            </Button>
            <Button
              onClick={() => setSessionCompleted(false)}
              variant="outline"
              size="lg"
            >
              Pilih Sesi Lain
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Session Selection */}
      <Card className="p-6">
        <h3 className="text-xl font-heading font-semibold mb-4 text-gray-800">
          Pilih Meditasi Terpandu Indonesia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {indonesianSessions.map((session) => (
            <motion.button
              key={session.id}
              onClick={() => handleSessionSelect(session)}
              className={`p-4 rounded-xl text-left transition-all duration-300 ${
                selectedSession.id === session.id
                  ? 'bg-primary-100 border-2 border-primary-300'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center mb-3">
                <div className="text-primary-600 mr-3">
                  {getBackgroundIcon(session.backgroundSound)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {session.titleIndonesian}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {session.region} • {session.duration} menit
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {session.descriptionIndonesian}
              </p>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Current Session Display */}
      <Card variant="meditation" size="lg" className="text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="space-y-6"
        >
          {/* Session Header */}
          <div>
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
              <div className="text-primary-600">
                {getBackgroundIcon(selectedSession.backgroundSound)}
              </div>
            </div>
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
              {selectedSession.titleIndonesian}
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedSession.descriptionIndonesian}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
              <span>{selectedSession.region}</span>
              <span>•</span>
              <span>{selectedSession.duration} menit</span>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                className="text-primary-500 transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {formatTime(selectedSession.duration * 60 - currentTime)}
                </div>
                <div className="text-xs text-gray-500">tersisa</div>
              </div>
            </div>
          </div>

          {/* Current Guidance */}
          <AnimatePresence mode="wait">
            {currentGuideStep && isPlaying && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6 max-w-2xl mx-auto"
              >
                <p className="text-lg text-gray-700 font-medium mb-2">
                  {currentGuideStep.textIndonesian}
                </p>
                <p className="text-sm text-gray-500 italic">
                  {currentGuideStep.text}
                </p>
                <div className="mt-3 inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                  {currentGuideStep.instruction === 'breathe' && '💨 Bernapas'}
                  {currentGuideStep.instruction === 'visualize' && '👁️ Visualisasi'}
                  {currentGuideStep.instruction === 'observe' && '🧘 Mengamati'}
                  {currentGuideStep.instruction === 'reflect' && '💭 Merenungkan'}
                  {currentGuideStep.instruction === 'appreciate' && '🙏 Menghargai'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="flex justify-center items-center space-x-4">
            <Button
              onClick={handleReset}
              variant="ghost"
              size="icon"
              disabled={isPlaying}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            {!isPlaying ? (
              <Button
                onClick={handlePlay}
                variant="meditation"
                size="lg"
                className="px-8"
              >
                <Play className="w-6 h-6 mr-2" />
                {currentTime === 0 ? 'Mulai' : 'Lanjutkan'}
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                variant="meditation"
                size="lg"
                className="px-8"
              >
                <Pause className="w-6 h-6 mr-2" />
                Jeda
              </Button>
            )}
          </div>
        </motion.div>
      </Card>
    </div>
  );
};