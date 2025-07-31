import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface StopStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  instruction: string;
  duration: number; // in seconds
  icon: string;
  color: string;
  bgGradient: string;
}

interface StopTechniqueProps {
  onComplete?: () => void;
  onStepChange?: (step: number) => void;
}

const stopSteps: StopStep[] = [
  {
    id: 1,
    title: 'STOP',
    subtitle: 'Berhenti Sejenak',
    description: 'Berhenti sejenak dan sadari apa yang sedang terjadi',
    instruction: 'Hentikan segala aktivitas. Sadari bahwa Anda sedang merasakan emosi yang kuat. Ini adalah langkah pertama menuju kesadaran diri.',
    duration: 10,
    icon: '✋',
    color: 'text-red-600',
    bgGradient: 'from-red-50 to-red-100'
  },
  {
    id: 2,
    title: 'TAKE A BREATH',
    subtitle: 'Ambil Napas',
    description: 'Ambil napas dalam-dalam untuk menenangkan',
    instruction: 'Tarik napas perlahan melalui hidung selama 4 detik, tahan 2 detik, lalu hembuskan melalui mulut selama 6 detik. Rasakan tubuh mulai rileks.',
    duration: 30,
    icon: '🫁',
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  },
  {
    id: 3,
    title: 'OBSERVE',
    subtitle: 'Amati Perasaan',
    description: 'Amati perasaan dan sensasi dalam tubuh tanpa menghakimi',
    instruction: 'Perhatikan apa yang Anda rasakan - di mana dalam tubuh Anda merasakan emosi ini? Apa yang dikatakan pikiran Anda? Terima semua ini tanpa menghakimi.',
    duration: 45,
    icon: '👁️',
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-purple-100'
  },
  {
    id: 4,
    title: 'PROCEED',
    subtitle: 'Lanjutkan dengan Bijak',
    description: 'Lanjutkan dengan kesadaran penuh dan pilihan bijak',
    instruction: 'Sekarang dengan kesadaran yang lebih jernih, pilih respons terbaik. Apa tindakan yang paling bijak berdasarkan nilai-nilai Anda?',
    duration: 20,
    icon: '🎯',
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-green-100'
  }
];

export const StopTechnique: React.FC<StopTechniqueProps> = ({
  onComplete,
  onStepChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: number;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Move to next step or complete
            if (currentStep < stopSteps.length - 1) {
              const nextStep = currentStep + 1;
              setCurrentStep(nextStep);
              onStepChange?.(nextStep);
              return stopSteps[nextStep].duration;
            } else {
              setIsActive(false);
              setIsCompleted(true);
              onComplete?.();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, currentStep, onComplete, onStepChange]);

  const startTechnique = () => {
    setCurrentStep(0);
    setTimeRemaining(stopSteps[0].duration);
    setIsActive(true);
    setIsCompleted(false);
    onStepChange?.(0);
  };

  const pauseTechnique = () => {
    setIsActive(!isActive);
  };

  const resetTechnique = () => {
    setIsActive(false);
    setCurrentStep(0);
    setTimeRemaining(0);
    setIsCompleted(false);
  };

  const skipToStep = (stepIndex: number) => {
    if (!isActive) {
      setCurrentStep(stepIndex);
      setTimeRemaining(stopSteps[stepIndex].duration);
      onStepChange?.(stepIndex);
    }
  };

  const currentStepData = stopSteps[currentStep];

  if (isCompleted) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="text-center space-y-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-heading font-semibold text-primary">
            Selamat!
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Anda telah menyelesaikan teknik STOP. Bagaimana perasaan Anda sekarang? 
            Semoga Anda merasa lebih tenang dan memiliki perspektif yang lebih jernih.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={startTechnique}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Ulangi Teknik STOP
            </Button>
            <Button 
              onClick={resetTechnique}
              variant="outline"
              className="w-full"
            >
              Kembali ke Awal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-semibold text-primary mb-2">
          Teknik STOP
        </h2>
        <p className="text-gray-600 text-sm">
          Teknik sederhana untuk mengelola emosi dan meningkatkan kesadaran diri
        </p>
      </div>

      {!isActive && timeRemaining === 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stopSteps.map((step, index) => (
              <div
                key={step.id}
                className={`
                  p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${currentStep === index 
                    ? 'border-accent bg-accent/10 shadow-md' 
                    : 'border-gray-200 hover:border-accent/50'
                  }
                  bg-gradient-to-br ${step.bgGradient}
                `}
                onClick={() => skipToStep(index)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <h3 className={`font-semibold text-lg ${step.color}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentStepData.icon}</span>
                <h3 className={`text-xl font-semibold ${currentStepData.color}`}>
                  {currentStepData.title}
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {currentStepData.description}
              </p>
              <div className="bg-background rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  {currentStepData.instruction}
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={startTechnique}
            className="w-full bg-accent hover:bg-accent/90 text-white py-3"
          >
            Mulai Teknik STOP
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`
            bg-gradient-to-br ${currentStepData.bgGradient} 
            rounded-2xl p-8 text-center border border-gray-200
          `}>
            <div className="text-6xl mb-4">{currentStepData.icon}</div>
            <h3 className={`text-2xl font-semibold mb-2 ${currentStepData.color}`}>
              {currentStepData.title}
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              {currentStepData.subtitle}
            </p>
            
            <div className="text-4xl font-bold text-primary mb-4">
              {timeRemaining}s
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${((currentStepData.duration - timeRemaining) / currentStepData.duration) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-700 leading-relaxed text-center">
              {currentStepData.instruction}
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={pauseTechnique}
              variant="outline"
              className="flex-1"
            >
              {isActive ? 'Jeda' : 'Lanjut'}
            </Button>
            <Button 
              onClick={resetTechnique}
              variant="outline"
              className="flex-1"
            >
              Reset
            </Button>
          </div>

          <div className="flex justify-center gap-2">
            {stopSteps.map((_, index) => (
              <div
                key={index}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${index === currentStep 
                    ? 'bg-accent' 
                    : index < currentStep 
                      ? 'bg-green-400' 
                      : 'bg-gray-300'
                  }
                `}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};