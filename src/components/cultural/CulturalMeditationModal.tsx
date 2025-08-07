import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface CulturalLocation {
  id: string;
  name: string;
  region: string;
  description: string;
  ambientSound: string;
  visualTheme: string;
  culturalContext: string;
  icon: string;
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'sunset' | 'evening' | 'night';
  spiritualTradition: 'hindu' | 'buddhist' | 'islamic' | 'javanese' | 'balinese' | 'indigenous';
}

interface CulturalBreathingPattern {
  id: string;
  name: string;
  localName: string;
  description: string;
  pattern: {
    inhale: number;
    hold1: number;
    exhale: number;
    hold2: number;
  };
  culturalOrigin: string;
  bestTime: string;
  spiritualBenefit: string;
  icon: string;
}

interface IndonesianMood {
  id: string;
  indonesian: string;
  english: string;
  emotion: 'positive' | 'reflective' | 'challenging' | 'peaceful';
  icon: string;
  description: string;
  recommendedMeditation: string[];
}

interface CulturalMeditationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (config: CulturalSessionConfig) => void;
  currentTime: Date;
  userRegion?: string;
}

interface CulturalSessionConfig {
  location: CulturalLocation;
  breathingPattern: CulturalBreathingPattern;
  mood: IndonesianMood;
  duration: number;
  includeWisdom: boolean;
  gamelanLayer: boolean;
}

const culturalLocations: CulturalLocation[] = [
  {
    id: 'borobudur-dawn',
    name: 'Candi Borobudur',
    region: 'Jawa Tengah',
    description: 'Menyaksikan fajar menyingsing di atas stupa-stupa kuno',
    ambientSound: 'temple-dawn-birds',
    visualTheme: 'ancient-temple-sunrise',
    culturalContext: 'Buddhist meditation at the world\'s largest Buddhist temple',
    icon: '🏛️',
    timeOfDay: 'dawn',
    spiritualTradition: 'buddhist'
  },
  {
    id: 'tanah-lot-sunset',
    name: 'Pura Tanah Lot',
    region: 'Bali',
    description: 'Ketenangan di tepi laut dengan pura suci di atas batu karang',
    ambientSound: 'ocean-waves-temple-bells',
    visualTheme: 'balinese-temple-ocean',
    culturalContext: 'Hindu Balinese spiritual practice by the sacred sea temple',
    icon: '🌊',
    timeOfDay: 'sunset',
    spiritualTradition: 'hindu'
  },
  {
    id: 'bamboo-forest-java',
    name: 'Hutan Bambu Jawa',
    region: 'Jawa Barat',
    description: 'Keheningan di antara rumpun bambu yang berdesir pelan',
    ambientSound: 'bamboo-wind-forest',
    visualTheme: 'javanese-bamboo-grove',
    culturalContext: 'Traditional Javanese forest meditation for inner peace',
    icon: '🎋',
    timeOfDay: 'morning',
    spiritualTradition: 'javanese'
  },
  {
    id: 'sumatra-rainforest',
    name: 'Hutan Hujan Sumatra',
    region: 'Sumatra',
    description: 'Meditasi dalam harmoni dengan alam liar Sumatra',
    ambientSound: 'rainforest-birds-water',
    visualTheme: 'sumatra-tropical-forest',
    culturalContext: 'Indigenous wisdom of Sumatran forest spirituality',
    icon: '🌲',
    timeOfDay: 'afternoon',
    spiritualTradition: 'indigenous'
  },
  {
    id: 'mosque-evening',
    name: 'Masjid Istiqlal',
    region: 'Jakarta',
    description: 'Kontemplasi spiritual menjelang waktu Maghrib',
    ambientSound: 'mosque-ambience-evening',
    visualTheme: 'modern-mosque-interior',
    culturalContext: 'Islamic contemplative practice in Indonesia\'s largest mosque',
    icon: '🕌',
    timeOfDay: 'evening',
    spiritualTradition: 'islamic'
  }
];

const culturalBreathingPatterns: CulturalBreathingPattern[] = [
  {
    id: 'napas-subuh',
    name: 'Napas Subuh',
    localName: 'Pernapasan Fajar',
    description: 'Teknik pernapasan untuk memulai hari dengan ketenangan',
    pattern: { inhale: 4, hold1: 4, exhale: 6, hold2: 2 },
    culturalOrigin: 'Traditional Indonesian dawn practice',
    bestTime: 'Sebelum atau sesudah Subuh',
    spiritualBenefit: 'Membersihkan pikiran dan mempersiapkan hati untuk hari baru',
    icon: '🌅'
  },
  {
    id: 'pranayama-jawa',
    name: 'Pranayama Jawa',
    localName: 'Napas Keseimbangan',
    description: 'Teknik pernapasan Jawa untuk keseimbangan energi',
    pattern: { inhale: 6, hold1: 2, exhale: 6, hold2: 2 },
    culturalOrigin: 'Javanese mystical breathing tradition',
    bestTime: 'Pagi atau sore hari',
    spiritualBenefit: 'Menyeimbangkan energi dalam tubuh dan pikiran',
    icon: '⚖️'
  },
  {
    id: 'napas-bali',
    name: 'Napas Tri Sandhya',
    localName: 'Pernapasan Tiga Waktu',
    description: 'Pernapasan Bali untuk tiga waktu suci',
    pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
    culturalOrigin: 'Balinese Hindu daily prayer breathing',
    bestTime: 'Pagi, siang, dan sore',
    spiritualBenefit: 'Menghubungkan diri dengan siklus kosmis',
    icon: '🌸'
  },
  {
    id: 'napas-ombak',
    name: 'Napas Ombak Laut',
    localName: 'Rytme Gelombang',
    description: 'Mengikuti irama ombak laut Indonesia',
    pattern: { inhale: 5, hold1: 3, exhale: 7, hold2: 3 },
    culturalOrigin: 'Coastal Indonesian maritime meditation',
    bestTime: 'Kapan saja, terutama saat stress',
    spiritualBenefit: 'Mengembalikan ketenangan seperti laut yang dalam',
    icon: '🌊'
  }
];

const indonesianMoods: IndonesianMood[] = [
  {
    id: 'bahagia',
    indonesian: 'Bahagia',
    english: 'Joyful',
    emotion: 'positive',
    icon: '😊',
    description: 'Hati dipenuhi kegembiraan dan sukacita',
    recommendedMeditation: ['gratitude', 'loving-kindness', 'celebration']
  },
  {
    id: 'tenteram',
    indonesian: 'Tenteram',
    english: 'Peaceful',
    emotion: 'peaceful',
    icon: '😌',
    description: 'Damai dan tenang dalam jiwa',
    recommendedMeditation: ['mindfulness', 'nature-sounds', 'gentle-breathing']
  },
  {
    id: 'galau',
    indonesian: 'Galau',
    english: 'Restless',
    emotion: 'challenging',
    icon: '😔',
    description: 'Perasaan gelisah dan tidak tenang',
    recommendedMeditation: ['centering', 'grounding', 'emotional-balance']
  },
  {
    id: 'syukur',
    indonesian: 'Bersyukur',
    english: 'Grateful',
    emotion: 'positive',
    icon: '🙏',
    description: 'Hati dipenuhi rasa terima kasih',
    recommendedMeditation: ['gratitude', 'appreciation', 'blessing-count']
  },
  {
    id: 'perenungan',
    indonesian: 'Perenungan',
    english: 'Contemplative',
    emotion: 'reflective',
    icon: '🤔',
    description: 'Mood untuk merenungkan hidup dan makna',
    recommendedMeditation: ['reflection', 'wisdom', 'philosophical']
  },
  {
    id: 'lelah',
    indonesian: 'Lelah',
    english: 'Tired',
    emotion: 'challenging',
    icon: '😴',
    description: 'Kelelahan fisik dan mental',
    recommendedMeditation: ['restorative', 'energy-renewal', 'body-scan']
  }
];

export const CulturalMeditationModal: React.FC<CulturalMeditationModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
  currentTime,
  userRegion = 'Jakarta' // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  const [selectedLocation, setSelectedLocation] = useState<CulturalLocation | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<CulturalBreathingPattern | null>(null);
  const [selectedMood, setSelectedMood] = useState<IndonesianMood | null>(null);
  const [duration, setDuration] = useState(10);
  const [includeWisdom, setIncludeWisdom] = useState(true);
  const [gamelanLayer, setGamelanLayer] = useState(true);
  const [step, setStep] = useState<'location' | 'breathing' | 'mood' | 'config' | 'intention'>('location');

  // Get time-appropriate recommendations
  const getTimeBasedRecommendations = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return culturalLocations.filter(l => l.timeOfDay === 'dawn');
    if (hour < 11) return culturalLocations.filter(l => l.timeOfDay === 'morning');
    if (hour < 15) return culturalLocations.filter(l => l.timeOfDay === 'afternoon');
    if (hour < 18) return culturalLocations.filter(l => l.timeOfDay === 'sunset');
    if (hour < 21) return culturalLocations.filter(l => l.timeOfDay === 'evening');
    return culturalLocations.filter(l => l.timeOfDay === 'night');
  };

  const handleStartSession = () => {
    if (!selectedLocation || !selectedPattern || !selectedMood) return;

    const config: CulturalSessionConfig = {
      location: selectedLocation,
      breathingPattern: selectedPattern,
      mood: selectedMood,
      duration,
      includeWisdom,
      gamelanLayer
    };

    onStartSession(config);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading text-gray-800">
              Meditasi Budaya Nusantara
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-2 mt-4">
            {['location', 'breathing', 'mood', 'config', 'intention'].map((s, index) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  ['location', 'breathing', 'mood', 'config', 'intention'].indexOf(step) >= index
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Step 1: Location Selection */}
          {step === 'location' && (
            <div>
              <h3 className="font-heading text-lg mb-4">Pilih Lokasi Spiritual</h3>
              <p className="text-gray-600 text-sm mb-6">
                Waktu sekarang: {currentTime.toLocaleTimeString('id-ID')} - 
                Cocok untuk meditasi {getTimeBasedRecommendations()[0]?.timeOfDay}
              </p>
              
              <div className="space-y-3">
                {culturalLocations.map((location) => (
                  <Card
                    key={location.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedLocation?.id === location.id
                        ? 'border-2 border-purple-400 bg-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{location.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{location.name}</h4>
                        <p className="text-xs text-purple-600 mb-1">{location.region}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{location.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {location.timeOfDay}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {location.spiritualTradition}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => setStep('breathing')}
                disabled={!selectedLocation}
                className="w-full mt-6"
              >
                Lanjut ke Teknik Pernapasan
              </Button>
            </div>
          )}

          {/* Step 2: Breathing Pattern */}
          {step === 'breathing' && (
            <div>
              <h3 className="font-heading text-lg mb-4">Teknik Pernapasan Nusantara</h3>
              
              <div className="space-y-3">
                {culturalBreathingPatterns.map((pattern) => (
                  <Card
                    key={pattern.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedPattern?.id === pattern.id
                        ? 'border-2 border-purple-400 bg-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPattern(pattern)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{pattern.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{pattern.name}</h4>
                        <p className="text-xs text-purple-600 mb-1">{pattern.localName}</p>
                        <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                        <div className="text-xs text-gray-500">
                          <div>Pola: {pattern.pattern.inhale}-{pattern.pattern.hold1}-{pattern.pattern.exhale}-{pattern.pattern.hold2}</div>
                          <div className="mt-1">Waktu terbaik: {pattern.bestTime}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep('location')}
                  className="flex-1"
                >
                  Kembali
                </Button>
                <Button
                  onClick={() => setStep('mood')}
                  disabled={!selectedPattern}
                  className="flex-1"
                >
                  Lanjut
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Mood Selection */}
          {step === 'mood' && (
            <div>
              <h3 className="font-heading text-lg mb-4">Bagaimana Perasaan Anda?</h3>
              <p className="text-gray-600 text-sm mb-6">
                Ceritakan suasana hati Anda hari ini untuk rekomendasi yang tepat
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {indonesianMoods.map((mood) => (
                  <Card
                    key={mood.id}
                    className={`cursor-pointer transition-all duration-200 text-center ${
                      selectedMood?.id === mood.id
                        ? 'border-2 border-purple-400 bg-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedMood(mood)}
                  >
                    <div className="text-2xl mb-2">{mood.icon}</div>
                    <h4 className="font-medium text-gray-800 text-sm">{mood.indonesian}</h4>
                    <p className="text-xs text-gray-500 mb-2">{mood.english}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{mood.description}</p>
                  </Card>
                ))}
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep('breathing')}
                  className="flex-1"
                >
                  Kembali
                </Button>
                <Button
                  onClick={() => setStep('config')}
                  disabled={!selectedMood}
                  className="flex-1"
                >
                  Lanjut
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Configuration */}
          {step === 'config' && (
            <div>
              <h3 className="font-heading text-lg mb-4">Pengaturan Sesi</h3>
              
              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Durasi Meditasi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        duration === d
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {d} menit
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={includeWisdom}
                    onChange={(e) => setIncludeWisdom(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Hikmah Harian</div>
                    <div className="text-xs text-gray-500">Kata bijak Indonesia di akhir sesi</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={gamelanLayer}
                    onChange={(e) => setGamelanLayer(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Musik Gamelan</div>
                    <div className="text-xs text-gray-500">Lapisan musik tradional Indonesia</div>
                  </div>
                </label>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep('mood')}
                  className="flex-1"
                >
                  Kembali
                </Button>
                <Button
                  onClick={() => setStep('intention')}
                  className="flex-1"
                >
                  Lanjut
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Intention Setting */}
          {step === 'intention' && selectedLocation && selectedPattern && selectedMood && (
            <div>
              <h3 className="font-heading text-lg mb-4">Niat untuk Sesi Ini</h3>
              
              {/* Summary */}
              <Card className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <h4 className="font-medium text-gray-800 mb-3">Ringkasan Sesi Anda:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>{selectedLocation.icon}</span>
                    <span>{selectedLocation.name}, {selectedLocation.region}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{selectedPattern.icon}</span>
                    <span>{selectedPattern.name} ({selectedPattern.pattern.inhale}-{selectedPattern.pattern.hold1}-{selectedPattern.pattern.exhale}-{selectedPattern.pattern.hold2})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{selectedMood.icon}</span>
                    <span>Suasana hati: {selectedMood.indonesian}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>⏰</span>
                    <span>{duration} menit</span>
                  </div>
                </div>
              </Card>

              {/* Intention setting */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-4">
                  Luangkan sejenak untuk menetapkan niat. Apa yang ingin Anda capai dari sesi meditasi ini?
                </p>
                
                <div className="space-y-3">
                  {[
                    'Menemukan ketenangan dalam diri',
                    'Melepaskan beban pikiran',
                    'Bersyukur atas berkah hari ini',
                    'Mencari keseimbangan hidup',
                    'Menghubungkan diri dengan alam'
                  ].map((intention, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-purple-600">🙏</span>
                      <span className="text-sm text-gray-700">{intention}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('config')}
                  className="flex-1"
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleStartSession}
                  className="flex-1"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(219, 39, 119, 1) 100%)' 
                  }}
                >
                  🌸 Mulai Meditasi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};