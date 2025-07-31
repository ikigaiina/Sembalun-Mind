import { useEffect, useState } from 'react';
import { CairnIcon } from '../../components/ui/CairnIcon';
import { Button } from '../../components/ui/Button';
import { type PersonalizationGoal } from './PersonalizationScreen';

interface WelcomeScreenProps {
  onComplete: () => void;
  selectedGoal?: PersonalizationGoal;
}

const goalMessages = {
  stress: {
    emoji: '🌱',
    title: 'Selamat Datang di Perjalanan Ketenangan',
    message: 'Mari kita mulai dengan latihan pernapasan yang akan membantumu menemukan kedamaian di tengah kesibukan.',
    suggestion: 'Mulai dengan sesi "Pernapasan Mindful" 5 menit setiap hari'
  },
  focus: {
    emoji: '🎯',
    title: 'Waktunya Mengasah Fokus',
    message: 'Dengan latihan yang konsisten, kamu akan merasakan peningkatan konsentrasi dan kejernihan pikiran.',
    suggestion: 'Coba sesi "Konsentrasi Terarah" untuk memulai perjalananmu'
  },
  sleep: {
    emoji: '🌙',
    title: 'Menuju Tidur yang Berkualitas',
    message: 'Ritual malam yang tenang akan membantumu mendapatkan istirahat yang lebih dalam dan menyegarkan.',
    suggestion: 'Mulai dengan "Body Scan" sebelum tidur untuk relaksasi total'
  },
  curious: {
    emoji: '✨',
    title: 'Selamat Datang, Penjelajah Batin',
    message: 'Perjalanan mindfulness ini akan membuka pintu menuju pemahaman diri yang lebih dalam.',
    suggestion: 'Eksplorasi berbagai teknik meditasi untuk menemukan yang cocok untukmu'
  }
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onComplete, 
  selectedGoal = 'curious' 
}) => {
  const [cairnProgress, setCairnProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  
  const goalInfo = goalMessages[selectedGoal];

  useEffect(() => {
    // Animate cairn building
    const progressTimer = setTimeout(() => {
      const progressInterval = setInterval(() => {
        setCairnProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setShowContent(true);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
    }, 500);

    return () => clearTimeout(progressTimer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-16 right-8 w-32 h-32 rounded-full opacity-5 animate-pulse"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        <div 
          className="absolute bottom-20 left-12 w-24 h-24 rounded-full opacity-5 animate-pulse"
          style={{ 
            backgroundColor: 'var(--color-accent)',
            animationDelay: '1s'
          }}
        />
      </div>

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-sm mx-auto text-center">
          
          {/* Main illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              {/* Goal emoji background */}
              <div 
                className={`
                  absolute inset-0 rounded-full transition-all duration-1000
                  ${showContent ? 'scale-150 opacity-20' : 'scale-100 opacity-0'}
                `}
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              
              {/* Cairn icon */}
              <div className="relative z-10 mb-4">
                <CairnIcon 
                  progress={cairnProgress} 
                  size={80} 
                  className="text-primary mx-auto"
                />
              </div>
              
              {/* Goal emoji */}
              <div className={`
                absolute -top-2 -right-2 text-3xl transition-all duration-500
                ${showContent ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
              `}>
                {goalInfo.emoji}
              </div>
            </div>
          </div>

          {/* Welcome content */}
          <div className={`
            transition-all duration-700 ease-out
            ${showContent 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform translate-y-4'
            }
          `}>
            {/* Title */}
            <h1 className="text-2xl font-heading text-gray-800 mb-4 leading-tight">
              {goalInfo.title}
            </h1>

            {/* Message */}
            <p className="text-gray-600 font-body leading-relaxed mb-6 text-base">
              {goalInfo.message}
            </p>

            {/* Suggestion card */}
            <div 
              className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-gray-100"
            >
              <div className="flex items-start space-x-3">
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}
                >
                  <span className="text-sm">{goalInfo.emoji}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-body text-sm text-gray-700 leading-relaxed">
                    <span className="font-medium">Saran untuk memulai:</span><br />
                    {goalInfo.suggestion}
                  </p>
                </div>
              </div>
            </div>

            {/* Action button */}
            <Button
              onClick={onComplete}
              size="large"
              className="w-full mb-4"
            >
              Mulai Perjalanan Saya
            </Button>

            {/* Stats preview */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200 border-opacity-50">
              <div className="text-center">
                <div className="text-xl font-heading text-gray-700 mb-1">0</div>
                <div className="text-xs text-gray-500 font-body">Hari berturut</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-heading text-gray-700 mb-1">0</div>
                <div className="text-xs text-gray-500 font-body">Sesi selesai</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-heading text-gray-700 mb-1">0</div>
                <div className="text-xs text-gray-500 font-body">Menit meditasi</div>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {!showContent && (
            <div className="animate-fade-in">
              <p className="text-gray-500 font-body text-sm mb-4">
                Menyiapkan pengalaman meditasi personalmu...
              </p>
              <div className="flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      animationDelay: `${i * 0.3}s`,
                      opacity: 0.6
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating elements */}
      {showContent && (
        <>
          <div className="absolute top-32 left-8 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}>
            <div className="w-6 h-6 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
              <span className="text-xs">🧘‍♀️</span>
            </div>
          </div>
          <div className="absolute bottom-32 right-12 animate-bounce" style={{ animationDelay: '3s', animationDuration: '3s' }}>
            <div className="w-6 h-6 rounded-full bg-accent bg-opacity-10 flex items-center justify-center">
              <span className="text-xs">💚</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};