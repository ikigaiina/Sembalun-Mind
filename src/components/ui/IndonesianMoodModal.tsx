import React, { useState, useEffect } from 'react';
import { MeditationModal, INDONESIAN_COLORS } from './IndonesianModal';
import { MoodType } from './MoodSelector';

interface IndonesianMoodOption {
  id: MoodType;
  emoji: string;
  label: string;
  indonesianLabel: string;
  color: string;
  culturalElement: string;
  breathingPattern: string;
  guidance: string;
}

interface IndonesianMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodSelect: (mood: MoodType, reflection?: string) => void;
  selectedMood?: MoodType;
  darkMode?: boolean;
  showReflection?: boolean;
}

// Indonesian cultural mood mapping with local wisdom
const indonesianMoodOptions: IndonesianMoodOption[] = [
  { 
    id: 'very-sad', 
    emoji: '😢', 
    label: 'Sangat sedih', 
    indonesianLabel: 'Galau sekali',
    color: INDONESIAN_COLORS.primary.terracotta,
    culturalElement: 'Seperti hujan deras di musim penghujan',
    breathingPattern: 'Tarik napas dalam-dalam, hitung 1-2-3-4',
    guidance: 'Saatnya melepas beban dengan napas yang tenang'
  },
  { 
    id: 'sad', 
    emoji: '😔', 
    label: 'Sedih', 
    indonesianLabel: 'Sedang galau',
    color: '#F56565',
    culturalElement: 'Seperti awan mendung di langit sore',
    breathingPattern: 'Napas pelan-pelan seperti angin sepoi-sepoi',
    guidance: 'Biarkan perasaan ini mengalir seperti air sungai'
  },
  { 
    id: 'neutral', 
    emoji: '😐', 
    label: 'Biasa saja', 
    indonesianLabel: 'Standar aja',
    color: INDONESIAN_COLORS.neutral.stone,
    culturalElement: 'Seperti air tenang di danau pagi',
    breathingPattern: 'Napas alami seperti hembusan angin',
    guidance: 'Momen yang tepat untuk refleksi dan ketenangan'
  },
  { 
    id: 'happy', 
    emoji: '😊', 
    label: 'Senang', 
    indonesianLabel: 'Bahagia',
    color: INDONESIAN_COLORS.secondary.bamboo,
    culturalElement: 'Seperti matahari pagi yang hangat',
    breathingPattern: 'Napas ringan seperti tawa anak-anak',
    guidance: 'Syukuri momen indah ini dengan hati yang tenang'
  },
  { 
    id: 'very-happy', 
    emoji: '😄', 
    label: 'Sangat senang', 
    indonesianLabel: 'Sangat bahagia',
    color: INDONESIAN_COLORS.primary.green,
    culturalElement: 'Seperti pelangi setelah hujan',
    breathingPattern: 'Napas penuh energi seperti burung bernyanyi',
    guidance: 'Berbagi kebahagiaan ini dengan alam semesta'
  },
];

export const IndonesianMoodModal: React.FC<IndonesianMoodModalProps> = ({
  isOpen,
  onClose,
  onMoodSelect,
  selectedMood,
  darkMode = false,
  showReflection = true
}) => {
  const [currentMood, setCurrentMood] = useState<MoodType | null>(selectedMood || null);
  const [reflection, setReflection] = useState('');
  const [step, setStep] = useState<'select' | 'reflect' | 'breathe'>('select');
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingCount, setBreathingCount] = useState(0);

  const selectedMoodData = currentMood ? indonesianMoodOptions.find(m => m.id === currentMood) : null;

  // Breathing exercise timer
  useEffect(() => {
    if (breathingActive && step === 'breathe') {
      const interval = setInterval(() => {
        setBreathingCount(prev => {
          if (prev >= 8) { // 8 breaths complete
            setBreathingActive(false);
            return 0;
          }
          return prev + 1;
        });
      }, 4000); // 4 second breathing cycle

      return () => clearInterval(interval);
    }
  }, [breathingActive, step]);

  const handleMoodSelect = (mood: MoodType) => {
    setCurrentMood(mood);
    if (showReflection) {
      setStep('reflect');
    } else {
      onMoodSelect(mood);
      onClose();
    }
  };

  const handleReflectionComplete = () => {
    if (currentMood) {
      if (currentMood === 'very-sad' || currentMood === 'sad') {
        setStep('breathe');
        setBreathingActive(true);
      } else {
        onMoodSelect(currentMood, reflection);
        onClose();
      }
    }
  };

  const handleBreathingComplete = () => {
    if (currentMood) {
      onMoodSelect(currentMood, reflection);
      onClose();
    }
  };

  const resetModal = () => {
    setCurrentMood(null);
    setReflection('');
    setStep('select');
    setBreathingActive(false);
    setBreathingCount(0);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const renderMoodSelection = () => (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${INDONESIAN_COLORS.primary.green}, ${INDONESIAN_COLORS.secondary.bamboo})`,
              boxShadow: `0 8px 32px ${INDONESIAN_COLORS.primary.green}40`
            }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
          </div>
        </div>
        <h3 
          className="text-xl font-heading mb-2"
          style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.primary.green }}
        >
          Bagaimana perasaan Anda hari ini?
        </h3>
        <p 
          className="text-sm font-body"
          style={{ color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow }}
        >
          Pilih perasaan yang paling menggambarkan kondisi hati Anda saat ini
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
        {indonesianMoodOptions.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleMoodSelect(mood.id)}
            className="group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 text-left"
            style={{
              borderColor: currentMood === mood.id ? mood.color : `${mood.color}40`,
              backgroundColor: currentMood === mood.id 
                ? `${mood.color}15` 
                : darkMode ? 'rgba(0,0,0,0.2)' : 'white',
              boxShadow: currentMood === mood.id 
                ? `0 8px 24px ${mood.color}40` 
                : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-start space-x-4">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${mood.color}20` }}
              >
                {mood.emoji}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 
                    className="font-heading font-semibold"
                    style={{ color: mood.color }}
                  >
                    {mood.label}
                  </h4>
                  <span 
                    className="text-xs font-body px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${mood.color}20`,
                      color: mood.color
                    }}
                  >
                    {mood.indonesianLabel}
                  </span>
                </div>
                
                <p 
                  className="text-sm font-body mb-2"
                  style={{ color: darkMode ? '#FFFFFF60' : INDONESIAN_COLORS.neutral.shadow }}
                >
                  {mood.culturalElement}
                </p>
                
                <p 
                  className="text-xs font-body italic"
                  style={{ color: `${mood.color}80` }}
                >
                  {mood.breathingPattern}
                </p>
              </div>

              {/* Selection indicator */}
              {currentMood === mood.id && (
                <div 
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: mood.color }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderReflection = () => (
    <div className="p-8">
      <div className="text-center mb-6">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: selectedMoodData?.color }}
        >
          <span className="text-2xl">{selectedMoodData?.emoji}</span>
        </div>
        <h3 
          className="text-xl font-heading mb-2"
          style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.primary.green }}
        >
          Refleksi Perasaan
        </h3>
        <p 
          className="text-sm font-body"
          style={{ color: selectedMoodData?.color }}
        >
          {selectedMoodData?.guidance}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label 
            className="block text-sm font-body font-medium mb-3"
            style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.neutral.shadow }}
          >
            Ceritakan lebih lanjut tentang perasaan Anda (opsional)
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Tuliskan apa yang Anda rasakan hari ini..."
            className="w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 font-body"
            style={{
              borderColor: `${selectedMoodData?.color}40`,
              backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
              color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.neutral.shadow,
              focusRingColor: selectedMoodData?.color
            }}
            rows={4}
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setStep('select')}
            className="flex-1 py-3 px-6 rounded-2xl font-body font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : INDONESIAN_COLORS.neutral.sand,
              color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow,
              border: `1px solid ${selectedMoodData?.color}40`
            }}
          >
            Kembali
          </button>
          <button
            onClick={handleReflectionComplete}
            className="flex-1 py-3 px-6 rounded-2xl font-body font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${selectedMoodData?.color}, ${selectedMoodData?.color}CC)`,
              color: 'white',
              boxShadow: `0 4px 16px ${selectedMoodData?.color}40`
            }}
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );

  const renderBreathingExercise = () => (
    <div className="p-8 text-center">
      <div className="mb-8">
        <h3 
          className="text-xl font-heading mb-4"
          style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.primary.green }}
        >
          Latihan Pernapasan
        </h3>
        <p 
          className="text-sm font-body mb-6"
          style={{ color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow }}
        >
          Mari tenangkan pikiran dengan latihan pernapasan sederhana
        </p>
      </div>

      {/* Breathing animation circle */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div 
            className={`w-32 h-32 rounded-full flex items-center justify-center ${
              breathingActive ? 'animate-pulse' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, ${selectedMoodData?.color}, ${selectedMoodData?.color}CC)`,
              boxShadow: `0 0 40px ${selectedMoodData?.color}60`
            }}
          >
            <span className="text-4xl text-white">
              {selectedMoodData?.emoji}
            </span>
          </div>
          
          {/* Breathing guide rings */}
          {breathingActive && (
            <>
              <div 
                className="absolute inset-0 border-4 border-white opacity-30 rounded-full"
                style={{
                  animation: 'breatheRing 4s ease-in-out infinite'
                }}
              />
              <div 
                className="absolute inset-[-10px] border-2 border-white opacity-20 rounded-full"
                style={{
                  animation: 'breatheRing 4s ease-in-out infinite 0.5s'
                }}
              />
            </>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <p 
          className="font-body"
          style={{ color: selectedMoodData?.color }}
        >
          {selectedMoodData?.breathingPattern}
        </p>
        <p 
          className="text-sm font-body"
          style={{ color: darkMode ? '#FFFFFF60' : INDONESIAN_COLORS.neutral.shadow }}
        >
          Napas ke-{breathingCount + 1} dari 8
        </p>
      </div>

      {!breathingActive && breathingCount === 0 && (
        <button
          onClick={() => setBreathingActive(true)}
          className="py-3 px-8 rounded-2xl font-body font-medium transition-all duration-200 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${selectedMoodData?.color}, ${selectedMoodData?.color}CC)`,
            color: 'white',
            boxShadow: `0 4px 16px ${selectedMoodData?.color}40`
          }}
        >
          Mulai Latihan Pernapasan
        </button>
      )}

      {!breathingActive && breathingCount >= 8 && (
        <div className="space-y-4">
          <p 
            className="font-body"
            style={{ color: INDONESIAN_COLORS.primary.green }}
          >
            Latihan pernapasan selesai. Bagaimana perasaan Anda sekarang?
          </p>
          <button
            onClick={handleBreathingComplete}
            className="py-3 px-8 rounded-2xl font-body font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${INDONESIAN_COLORS.primary.green}, ${INDONESIAN_COLORS.secondary.bamboo})`,
              color: 'white',
              boxShadow: `0 4px 16px ${INDONESIAN_COLORS.primary.green}40`
            }}
          >
            Selesai
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes breatheRing {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
        }
      `}</style>
    </div>
  );

  return (
    <MeditationModal
      isOpen={isOpen}
      onClose={handleClose}
      onBack={step !== 'select' ? () => {
        if (step === 'reflect') setStep('select');
        if (step === 'breathe') setStep('reflect');
      } : undefined}
      title={
        step === 'select' ? undefined :
        step === 'reflect' ? 'Refleksi' :
        'Latihan Pernapasan'
      }
      size="medium"
      showHeader={step !== 'select'}
      showBackButton={step !== 'select'}
      gestureEnabled={true}
      darkMode={darkMode}
    >
      {step === 'select' && renderMoodSelection()}
      {step === 'reflect' && renderReflection()}
      {step === 'breathe' && renderBreathingExercise()}
    </MeditationModal>
  );
};