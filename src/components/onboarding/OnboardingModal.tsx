import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Play } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CulturalOnboardingFlow } from './CulturalOnboardingFlow';

interface UserPreferences {
  culturalInterests: string[];
  experienceLevel: string;
  meditationGoals: string[];
  schedulePreferences: string[];
  preferredRegions: string[];
  sessionDuration: number;
  reminderEnabled: boolean;
  communitySharing: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: UserPreferences) => void;
  showWelcomePrompt?: boolean;
}

export const OnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onComplete,
  showWelcomePrompt = true
}) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check if user has completed onboarding before
  useEffect(() => {
    const completed = localStorage.getItem('sembalun-onboarding-completed');
    setHasCompletedOnboarding(completed === 'true');
  }, []);

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleCompleteOnboarding = (preferences: UserPreferences) => {
    localStorage.setItem('sembalun-onboarding-completed', 'true');
    localStorage.setItem('sembalun-user-preferences', JSON.stringify(preferences));
    setHasCompletedOnboarding(true);
    onComplete(preferences);
    onClose();
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem('sembalun-onboarding-skipped', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl mx-auto"
          >
            {showOnboarding ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                >
                  <X className="w-5 h-5" />
                </Button>
                <CulturalOnboardingFlow
                  onComplete={handleCompleteOnboarding}
                  onSkip={handleSkipOnboarding}
                />
              </div>
            ) : (
              // Welcome prompt for onboarding
              showWelcomePrompt && (
                <Card className="p-8 bg-white relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="absolute top-4 right-4"
                  >
                    <X className="w-5 h-5" />
                  </Button>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                        <Sparkles className="w-12 h-12 text-emerald-600" />
                      </div>
                    </div>

                    <div>
                      <h1 className="text-2xl font-heading font-bold text-gray-800 mb-4">
                        {hasCompletedOnboarding 
                          ? 'Selamat Datang Kembali!' 
                          : 'Selamat Datang di Sembalun!'
                        }
                      </h1>
                      <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                        {hasCompletedOnboarding ? (
                          'Kami senang Anda kembali! Mulai sesi meditasi budaya Indonesia atau perbarui preferensi Anda.'
                        ) : (
                          'Mari personalisasi pengalaman meditasi budaya Indonesia Anda. Proses singkat ini akan membantu kami memberikan rekomendasi praktik yang paling sesuai.'
                        )}
                      </p>
                    </div>

                    {!hasCompletedOnboarding && (
                      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 max-w-md mx-auto">
                        <div className="flex items-center justify-center space-x-4 mb-4">
                          <div className="text-2xl">⏱️</div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-800">Hanya 3-5 menit</div>
                            <div className="text-sm text-gray-600">Setup cepat dan mudah</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div className="text-center">
                            <div className="text-lg mb-1">🎯</div>
                            <div>Tentukan Tujuan</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg mb-1">🏔️</div>
                            <div>Pilih Wilayah</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg mb-1">✨</div>
                            <div>Mulai Praktik</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {hasCompletedOnboarding ? (
                        <>
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={onClose}
                            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                          >
                            <Play className="w-5 h-5 mr-2" />
                            Mulai Meditasi
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={handleStartOnboarding}
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Perbarui Preferensi
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={handleStartOnboarding}
                            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                          >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Mulai Personalisasi
                          </Button>
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={handleSkipOnboarding}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Lewati untuk Sekarang
                          </Button>
                        </>
                      )}
                    </div>

                    {!hasCompletedOnboarding && (
                      <div className="text-sm text-gray-500">
                        💡 Tip: Personalisasi akan membantu Anda mendapatkan rekomendasi praktik yang lebih tepat dan bermakna
                      </div>
                    )}
                  </motion.div>
                </Card>
              )
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};