import { useState, useEffect } from 'react';
import { CairnIcon } from './CairnIcon';
import { Button } from './Button';
import { Card } from './Card';

interface SessionCompleteProps {
  sessionType: string;
  duration: number; // in minutes
  onClose: () => void;
  onNewSession: () => void;
  onShare?: () => void;
  previousStreak?: number;
}

const encouragingMessages = [
  "Luar biasa! Kamu telah menyelesaikan perjalanan mindful hari ini.",
  "Setiap detik yang kamu habiskan untuk diri sendiri adalah investasi yang berharga.",
  "Kamu baru saja memberikan hadiah terbaik untuk jiwa dan ragamu.",
  "Dalam keheningan tadi, kamu menemukan kekuatan yang sesungguhnya.",
  "Seperti cairn yang kokoh, kedamaianmu semakin kuat dengan setiap sesi."
];

const reflectionPrompts = [
  "Apa yang berubah dalam dirimu setelah sesi ini?",
  "Perasaan apa yang muncul selama meditasi tadi?",
  "Bagaimana tubuhmu terasa sekarang dibanding sebelum sesi?",
  "Apa satu hal yang ingin kamu bawa dari sesi ini ke aktivitas selanjutnya?",
  "Apakah ada insight atau kesadaran baru yang muncul?"
];

export const SessionComplete: React.FC<SessionCompleteProps> = ({
  sessionType,
  duration,
  onClose,
  onNewSession,
  onShare,
  previousStreak = 0
}) => {
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  
  const newStreak = previousStreak + 1;
  const message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
  const reflectionPrompt = reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveReflection = () => {
    // TODO: Save reflection to local storage or backend
    console.log('Reflection saved:', reflectionText);
    setShowReflection(false);
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share behavior
      const shareText = `Aku baru saja menyelesaikan sesi ${sessionType} selama ${duration} menit di Sembalun 🧘‍♀️ #Mindfulness #Sembalun`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Sesi Meditasi Selesai - Sembalun',
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareText);
        alert('Teks berhasil disalin ke clipboard!');
      }
    }
  };

  if (showReflection) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <Card className="w-full max-w-md">
          <div className="space-y-6 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                <span className="text-2xl">💭</span>
              </div>
              <h2 className="text-xl font-heading text-gray-800">
                Momen Refleksi
              </h2>
              <p className="text-gray-600 font-body text-sm leading-relaxed">
                {reflectionPrompt}
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Tulis refleksimu di sini..."
                className="w-full p-4 border border-gray-200 rounded-xl resize-none font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                rows={5}
                style={{ borderColor: 'var(--color-primary)20' }}
              />
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReflection(false)}
                  className="flex-1"
                >
                  Lewati
                </Button>
                <Button
                  onClick={handleSaveReflection}
                  disabled={!reflectionText.trim()}
                  className="flex-1"
                >
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <Card className="w-full max-w-md">
        <div className="space-y-8 text-center">
          
          {/* Success animation and cairn */}
          <div className="relative">
            <div className={`transition-all duration-1500 ${isAnimating ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`}>
              <CairnIcon 
                progress={100} 
                size={80} 
                className="text-primary mx-auto mb-4" 
              />
              
              {/* Celebration animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-32 h-32 rounded-full border-2 opacity-20 animate-ping"
                  style={{ 
                    borderColor: 'var(--color-primary)',
                    animationDuration: '2s'
                  }}
                />
              </div>
              
              {/* Success checkmark */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Encouraging message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-heading text-gray-800">
              Sesi Selesai! 🌟
            </h1>
            <p className="text-gray-600 font-body leading-relaxed">
              {message}
            </p>
          </div>

          {/* Session stats */}
          <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-heading text-gray-800 mb-1">
                {duration}
              </div>
              <div className="text-xs text-gray-500 font-body">
                Menit tenang
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading text-gray-800 mb-1">
                {newStreak}
              </div>
              <div className="text-xs text-gray-500 font-body">
                Hari berturut
              </div>
            </div>
          </div>

          {/* Streak milestone celebration */}
          {newStreak % 7 === 0 && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">🏆</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-heading text-yellow-800 text-sm mb-1">
                    Pencapaian Mingguan!
                  </h4>
                  <p className="text-yellow-700 font-body text-xs">
                    Kamu telah konsisten selama {newStreak} hari berturut-turut!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowReflection(true)}
                className="flex-1"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">💭</span>
                  <span>Refleksi</span>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-1"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">✨</span>
                  <span>Bagikan</span>
                </div>
              </Button>
            </div>
            
            <Button
              onClick={onNewSession}
              className="w-full"
            >
              Sesi Baru
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Kembali ke Dashboard
            </Button>
          </div>

          {/* Motivational quote */}
          <div className="pt-4 border-t border-gray-100">
            <div className="space-y-2">
              <div className="text-lg">🌸</div>
              <blockquote className="text-gray-600 font-body text-xs italic leading-relaxed">
                "Seperti air yang mengalir perlahan mengukir batu, konsistensi kecil menghasilkan perubahan besar."
              </blockquote>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};