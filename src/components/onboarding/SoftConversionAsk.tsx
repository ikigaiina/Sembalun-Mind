import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CairnIcon } from '../ui';
import IndonesianCTA from '../ui/IndonesianCTA';
import type { ExperienceFirstFlow } from './onboarding-types';

interface ValueProposition {
  icon: string;
  title: string;
  description: string;
  benefit: string;
  emphasized?: boolean;
}

interface ConversionIncentive {
  type: 'progress-protection' | 'exclusive-content' | 'community-access' | 'personalization';
  title: string;
  description: string;
  value: string;
  urgency?: string;
}

interface SoftConversionAskProps {
  userEngagement: ExperienceFirstFlow['userEngagement'];
  onDecision: (saveProgress: boolean, reason?: string) => void;
  onDelay?: () => void;
}

// Use var with Object.freeze to prevent hoisting issues
var VALUE_PROPOSITIONS: ValueProposition[] = Object.freeze([
  {
    icon: '💾',
    title: 'Progress Tersimpan Aman',
    description: 'Semua kemajuan meditasi Anda akan tersimpan dan dapat diakses kapan saja',
    benefit: 'Tidak kehilangan kemajuan yang sudah Anda capai',
    emphasized: true
  },
  {
    icon: '📊',
    title: 'Insight Personal',
    description: 'Dapatkan analisis mendalam tentang perkembangan mood dan mindfulness Anda',
    benefit: 'Pahami pola pikiran dan emosi dengan lebih baik'
  },
  {
    icon: '🎯',
    title: 'Rekomendasi Khusus',
    description: 'Meditasi yang disesuaikan dengan kebutuhan dan preferensi budaya Anda',
    benefit: 'Pengalaman meditasi yang lebih relevan dan efektif'
  },
  {
    icon: '🏆',
    title: 'Pencapaian & Milestone',
    description: 'Rayakan setiap kemajuan dengan sistem achievement yang memotivasi',
    benefit: 'Tetap termotivasi dalam perjalanan mindfulness Anda'
  },
  {
    icon: '📱',
    title: 'Akses Multi-Device',
    description: 'Gunakan di HP, tablet, atau komputer dengan sinkronisasi otomatis',
    benefit: 'Meditasi kapan saja, di mana saja, dari perangkat apapun'
  }
]);

var CONVERSION_INCENTIVES: { [key: number]: ConversionIncentive } = Object.freeze({
  // High engagement (80-100%)
  90: {
    type: 'exclusive-content',
    title: '🌟 Akses Konten Eksklusif!',
    description: 'Anda menunjukkan antusiasme luar biasa! Dapatkan akses ke meditasi premium dan konten khusus Indonesia.',
    value: 'Senilai Rp 299.000, GRATIS untuk pengguna awal',
    urgency: 'Hanya tersedia untuk 100 pengguna pertama'
  },
  70: {
    type: 'community-access',
    title: '🤝 Bergabung dengan Komunitas Premium',
    description: 'Terhubung dengan praktisi meditasi Indonesia lainnya dan dapatkan dukungan dalam perjalanan mindfulness.',
    value: 'Komunitas eksklusif + mentor personal',
    urgency: 'Kesempatan terbatas untuk early adopters'
  },
  50: {
    type: 'personalization',
    title: '🎨 Personalisasi Mendalam',
    description: 'Dapatkan pengalaman meditasi yang sepenuhnya disesuaikan dengan profil budaya dan preferensi Anda.',
    value: 'AI-powered personalization engine',
  },
  30: {
    type: 'progress-protection',
    title: '💾 Lindungi Progress Anda',
    description: 'Jangan kehilangan kemajuan yang sudah Anda rasakan. Simpan dan lanjutkan perjalanan mindfulness Anda.',
    value: 'Backup otomatis + recovery guarantee',
  }
});

// Use function declaration to prevent hoisting issues
function SoftConversionAskComponent({
  userEngagement,
  onDecision,
  onDelay
}: SoftConversionAskProps) {
  const [currentStep, setCurrentStep] = useState<'value-demo' | 'soft-ask' | 'incentive'>('value-demo');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [showingDetails, setShowingDetails] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30); // 30 seconds to decide

  const valuePerceived = userEngagement.valuePerceived;
  const conversionReadiness = Math.round(valuePerceived);

  // Use function declaration to prevent hoisting
  function getApplicableIncentive(): ConversionIncentive {
    if (conversionReadiness >= 80) return CONVERSION_INCENTIVES[90];
    if (conversionReadiness >= 60) return CONVERSION_INCENTIVES[70];
    if (conversionReadiness >= 40) return CONVERSION_INCENTIVES[50];
    return CONVERSION_INCENTIVES[30];
  };

  var currentIncentive = getApplicableIncentive();

  // Timer for soft pressure (Indonesian psychology: gentle time pressure works)
  useEffect(() => {
    if (currentStep === 'soft-ask' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentStep, timeRemaining]);

  // Auto-transition through steps
  useEffect(() => {
    if (currentStep === 'value-demo') {
      const timer = setTimeout(() => {
        setCurrentStep('soft-ask');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  function handleSaveProgress(reason?: string) {
    onDecision(true, reason || selectedReason);
  };

  function handleNotNow() {
    onDecision(false, 'user_deferred');
  };

  function handleDelay() {
    if (onDelay) {
      onDelay();
    } else {
      onDecision(false, 'user_delayed');
    }
  };

  // Step 1: Value demonstration
  if (currentStep === 'value-demo') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-4"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl"
                >
                  ✨
                </motion.span>
              </div>
            </motion.div>
            
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
              Luar Biasa! Anda Telah Merasakan Manfaatnya
            </h2>
            <p className="text-gray-600">
              Berdasarkan sesi yang baru saja Anda lakukan, berikut adalah value yang bisa Anda dapatkan:
            </p>
          </div>

          {/* Value demonstration with metrics */}
          <div className="mb-8">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(userEngagement.culturalRelevance)}%
                </div>
                <div className="text-sm text-blue-700">
                  Relevansi dengan budaya Anda
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(userEngagement.experienceCompletion)}%
                </div>
                <div className="text-sm text-green-700">
                  Pengalaman meditasi selesai
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  +{Math.round(userEngagement.moodImprovement)}%
                </div>
                <div className="text-sm text-purple-700">
                  Peningkatan mood
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(valuePerceived)}%
                </div>
                <div className="text-sm text-orange-700">
                  Total nilai yang dirasakan
                </div>
              </div>
            </div>

            {/* Loading animation to next step */}
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                className="inline-block"
              >
                <CairnIcon size={32} className="text-primary-600" />
              </motion.div>
              <p className="text-sm text-gray-600 mt-2">
                Menghitung rekomendasi terbaik untuk Anda...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Step 2: Soft conversion ask
  if (currentStep === 'soft-ask') {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">💫</span>
              </div>
            </motion.div>
            
            <h2 className="text-xl font-heading font-bold text-gray-800 mb-2">
              Simpan Progress Anda?
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Anda telah merasakan manfaat meditasi. Jangan sampai kehilangan kemajuan berharga yang sudah Anda capai!
            </p>
          </div>

          {/* What they'll lose if they don't save */}
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                ⚠️ Yang Akan Hilang Jika Tidak Disimpan:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Skor peningkatan mood: +{Math.round(userEngagement.moodImprovement)}%</li>
                <li>• Profil personalisasi budaya yang sudah disesuaikan</li>
                <li>• Insight personal tentang pola meditasi Anda</li>
                <li>• Pencapaian dan milestone yang sudah diraih</li>
              </ul>
            </div>

            {/* What they'll gain by saving */}
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                ✅ Yang Akan Anda Dapatkan:
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Backup otomatis semua progress</li>
                <li>• Rekomendasi meditasi yang semakin personal</li>
                <li>• Tracking mood dan insight jangka panjang</li>
                <li>• Akses dari berbagai perangkat</li>
              </ul>
            </div>
          </div>

          {/* Gentle time pressure */}
          {timeRemaining > 0 && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                <span className="text-yellow-600 text-sm">⏰</span>
                <span className="text-sm text-yellow-700">
                  Penawaran khusus: {timeRemaining} detik lagi
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-4">
            <IndonesianCTA
              onClick={() => handleSaveProgress('value_recognized')}
              size="large"
              variant="spiritual"
              className="w-full"
            >
              💾 Ya, Simpan Progress Saya
            </IndonesianCTA>

            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep('incentive')}
                className="flex-1 px-4 py-3 text-primary-600 border border-primary-200 rounded-xl font-medium hover:bg-primary-50 transition-colors"
              >
                🎁 Lihat Bonus
              </button>
              
              <button
                onClick={handleNotNow}
                className="flex-1 px-4 py-3 text-gray-500 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <span>🔒</span>
                <span>Data Aman</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🇮🇩</span>
                <span>Sesuai UU PDP</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>💯</span>
                <span>Gratis</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Step 3: Incentive boost
  return (
    <div className="max-w-lg mx-auto p-6">
      <Card className="p-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            className="mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto relative">
              <span className="text-3xl">🎁</span>
              
              {/* Sparkle animation */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  style={{
                    top: '20%',
                    left: '20%',
                  }}
                  animate={{
                    x: [0, Math.cos(i * 90 * Math.PI / 180) * 30],
                    y: [0, Math.sin(i * 90 * Math.PI / 180) * 30],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
          
          <h2 className="text-xl font-heading font-bold text-gray-800 mb-2">
            {currentIncentive.title}
          </h2>
          <p className="text-gray-600 text-sm">
            {currentIncentive.description}
          </p>
        </div>

        {/* Incentive details */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-800 mb-2">
                🎯 {currentIncentive.value}
              </div>
              
              {currentIncentive.urgency && (
                <div className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full inline-block">
                  ⏰ {currentIncentive.urgency}
                </div>
              )}
            </div>

            {/* Features breakdown */}
            <div className="mt-4 space-y-2">
              {VALUE_PROPOSITIONS.filter(vp => vp.emphasized || conversionReadiness < 60).map((vp, index) => (
                <motion.div
                  key={vp.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 text-sm"
                >
                  <span className="text-purple-600">{vp.icon}</span>
                  <div>
                    <div className="font-medium text-purple-800">{vp.title}</div>
                    <div className="text-purple-600">{vp.benefit}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced action buttons */}
        <div className="space-y-4">
          <IndonesianCTA
            onClick={() => handleSaveProgress('incentive_accepted')}
            size="large"
            variant="spiritual"
            className="w-full relative overflow-hidden"
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <span className="relative">🚀 Dapatkan Bonus Sekarang</span>
          </IndonesianCTA>

          <button
            onClick={() => setShowingDetails(!showingDetails)}
            className="w-full px-4 py-3 text-primary-600 border border-primary-200 rounded-xl font-medium hover:bg-primary-50 transition-colors"
          >
            {showingDetails ? '👆 Sembunyikan Detail' : '👇 Lihat Detail Lengkap'}
          </button>

          <button
            onClick={handleNotNow}
            className="w-full px-4 py-3 text-gray-500 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Tetap Tidak Sekarang
          </button>
        </div>

        {/* Detailed features */}
        <AnimatePresence>
          {showingDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-3"
            >
              {VALUE_PROPOSITIONS.map((vp, index) => (
                <motion.div
                  key={vp.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{vp.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">{vp.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{vp.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social proof */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500">
            <div className="flex items-center justify-center space-x-4">
              <span>👥 2,847 pengguna sudah bergabung</span>
              <span>⭐ 4.8/5 rating</span>
            </div>
            <div className="mt-1">
              🇮🇩 Dipercaya komunitas meditasi Indonesia
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Export with proper naming to prevent hoisting
export const SoftConversionAsk: React.FC<SoftConversionAskProps> = SoftConversionAskComponent;

export default SoftConversionAsk;