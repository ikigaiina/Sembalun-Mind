import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Mountain, Home, Users, Heart } from 'lucide-react';

interface MinangkabauMeditationProps {
  onComplete: () => void;
  onProgress: (progress: number) => void;
}

export const MinangkabauMeditation: React.FC<MinangkabauMeditationProps> = ({ 
  onComplete, 
  onProgress 
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [timeRemaining, setTimeRemaining] = React.useState(300); // 5 minutes

  const steps = [
    {
      title: "Pendahuluan - Kearifan Minangkabau",
      description: "Merangkul nilai-nilai luhur budaya Minangkabau dalam praktik meditasi",
      icon: <Mountain className="w-6 h-6" />,
      duration: 60
    },
    {
      title: "Meditasi Rumah Gadang",
      description: "Menghubungkan dengan arsitektur spiritual rumah tradisional Minangkabau",
      icon: <Home className="w-6 h-6" />,
      duration: 120
    },
    {
      title: "Kekeluargaan dan Gotong Royong",
      description: "Merangkul nilai silaturahmi dan kebersamaan dalam kesadaran",
      icon: <Users className="w-6 h-6" />,
      duration: 90
    },
    {
      title: "Penutup dengan Kasih Sayang",
      description: "Menutup sesi dengan penuh kasih sayang dan rasa syukur",
      icon: <Heart className="w-6 h-6" />,
      duration: 30
    }
  ];

  React.useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
        const progress = Math.round(((300 - timeRemaining) / 300) * 100);
        onProgress(progress);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      onComplete();
    }
  }, [timeRemaining, onComplete, onProgress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeRemaining(steps[currentStep + 1].duration);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTimeRemaining(steps[currentStep - 1].duration);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">
            Meditasi Kearifan Minangkabau
          </h1>
          <p className="text-amber-700">
            Menjalin koneksi dengan nilai-nilai luhur budaya Minangkabau
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-amber-700 mb-2">
            <span>Waktu tersisa: {formatTime(timeRemaining)}</span>
            <span>{Math.round(((300 - timeRemaining) / 300) * 100)}% selesai</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2.5">
            <div 
              className="bg-amber-600 h-2.5 rounded-full transition-all duration-1000" 
              style={{ width: `${((300 - timeRemaining) / 300) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <Card className="mb-6 p-6 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center mb-4">
            <div className="mr-3 p-2 bg-amber-100 rounded-lg text-amber-700">
              {steps[currentStep].icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-amber-900">
                {steps[currentStep].title}
              </h2>
              <p className="text-amber-700">
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          {/* Meditation Content */}
          <div className="prose max-w-none mb-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <p>
                  Selamat datang dalam perjalanan meditasi yang terinspirasi dari kearifan budaya Minangkabau. 
                  Budaya ini kaya akan nilai-nilai luhur yang dapat memperkaya praktik kesadaran kita.
                </p>
                <p>
                  Dalam sesi ini, kita akan menjalin koneksi dengan konsep "adat basandi syarak, syarak basandi kitabullah" 
                  yang mengajarkan keseimbangan antara tradisi dan spiritualitas.
                </p>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="italic text-amber-800">
                    "Nan katujuah nan kajadi, adat nan basandi syarak, syarak nan basandi kitabullah"
                  </p>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <p>
                  Rumah Gadang bukan sekadar tempat tinggal, tetapi manifestasi dari nilai-nilai spiritual dan filosofis 
                  masyarakat Minangkabau. Dalam meditasi ini, kita akan membayangkan struktur atap rumah gadang 
                  yang melengkung ke bawah, melambangkan sifat rendah hati dan kembali ke akar.
                </p>
                <p>
                  Tutup mata Anda dan rasakan koneksi dengan bentuk arsitektur ini. Bayangkan atap yang melengkung 
                  melambangkan perlindungan dan kehangatan keluarga.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Rasakan keseimbangan antara bumi dan langit</li>
                  <li>Sambut rasa aman dan harmoni seperti dalam rumah keluarga</li>
                  <li>Rasakan nilai-nilai kekeluargaan yang kuat</li>
                </ul>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p>
                  Nilai gotong royong dan silaturahmi sangat kuat dalam budaya Minangkabau. Dalam kesadaran ini, 
                  kita merangkul semangat kebersamaan dan saling peduli.
                </p>
                <p>
                  Bayangkan diri Anda dalam sebuah musyawarah yang penuh kasih sayang dan saling menghargai. 
                  Rasakan bagaimana keputusan diambil dengan melibatkan semua pihak dengan penuh kebijaksanaan.
                </p>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="font-medium text-amber-800">Refleksi:</p>
                  <p>
                    Bagaimana nilai-nilai kekeluargaan dan gotong royong dapat kita aplikasikan dalam kehidupan sehari-hari 
                    untuk menciptakan harmoni dan kedamaian?
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p>
                  Menutup sesi meditasi ini dengan penuh rasa syukur atas kebijaksanaan dan nilai-nilai luhur 
                  yang telah kita renungkan bersama.
                </p>
                <p>
                  Semoga praktik ini membawa kedamaian dalam hati dan semangat untuk menjalani kehidupan 
                  dengan penuh kasih sayang dan kebijaksanaan.
                </p>
                <div className="text-center py-4">
                  <Heart className="w-12 h-12 mx-auto text-amber-600 mb-2" />
                  <p className="text-amber-800 font-medium">Terima kasih telah bermeditasi</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-between">
            <Button 
              onClick={handlePrevious} 
              disabled={currentStep === 0}
              variant="outline"
            >
              Sebelumnya
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={currentStep === steps.length - 1}
            >
              Selanjutnya
            </Button>
          </div>
        </Card>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentStep ? 'bg-amber-600' : 'bg-amber-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};