import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CairnIcon } from '../ui';
import IndonesianCTA from '../ui/IndonesianCTA';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  text: string;
  achievement: string;
  timeUsing: string;
  verified: boolean;
  culturalBackground?: string;
}

interface SocialStats {
  totalUsers: number;
  indonesianUsers: number;
  averageRating: number;
  completionRate: number;
  moodImprovement: number;
}

interface AuthOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  indonesianFriendly: boolean;
  trustScore: number;
}

interface SocialProofAuthenticationProps {
  conversionReadiness: number;
  onComplete: (authenticated: boolean, method?: string, skipReason?: string) => void;
  onReturnLater?: () => void;
}

const INDONESIAN_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sari Wijaya',
    location: 'Jakarta, DKI Jakarta',
    avatar: '👩‍🏫',
    rating: 5,
    text: 'Sebagai guru yang stres tinggi, Sembalun membantu saya menemukan ketenangan. Meditasi dengan nuansa budaya Indonesia membuat saya lebih terhubung.',
    achievement: 'Konsisten 30 hari',
    timeUsing: '3 bulan',
    verified: true,
    culturalBackground: 'Jawa'
  },
  {
    id: '2',
    name: 'Ahmad Rizki',
    location: 'Bandung, Jawa Barat',
    avatar: '👨‍💼',
    rating: 5,
    text: 'Meditasi yang sesuai dengan nilai-nilai islami sangat membantu. Mood saya jadi lebih stabil dan fokus kerja meningkat drastis.',
    achievement: 'Peningkatan fokus 85%',
    timeUsing: '2 bulan',
    verified: true,
    culturalBackground: 'Sunda-Islam'
  },
  {
    id: '3',
    name: 'Made Astika',
    location: 'Denpasar, Bali',
    avatar: '🧘‍♂️',
    rating: 5,
    text: 'Menggabungkan wisdom Hindu-Bali dengan mindfulness modern. Aplikasi ini benar-benar memahami keberagaman spiritual Indonesia.',
    achievement: 'Tidur berkualitas 90%',
    timeUsing: '4 bulan',
    verified: true,
    culturalBackground: 'Hindu-Bali'
  },
  {
    id: '4',
    name: 'Putri Maharani',
    location: 'Surabaya, Jawa Timur',
    avatar: '👩‍🎓',
    rating: 4,
    text: 'Mahasiswa tingkat akhir yang tertolong banget sama guided meditation ini. Anxiety berkurang, skripsi jadi lancar!',
    achievement: 'Stress reduction 70%',
    timeUsing: '6 minggu',
    verified: true,
    culturalBackground: 'Jawa'
  },
  {
    id: '5',
    name: 'Bayu Setiawan',
    location: 'Medan, Sumatera Utara',
    avatar: '👨‍🍳',
    rating: 5,
    text: 'Kerja di restoran yang sibuk bikin stress. 5 menit meditasi Sembalun di break time langsung bikin fresh lagi.',
    achievement: 'Daily streak 45 hari',
    timeUsing: '2 bulan',
    verified: true,
    culturalBackground: 'Batak'
  },
  {
    id: '6',
    name: 'Dewi Sartika',
    location: 'Yogyakarta, DIY',
    avatar: '👩‍⚕️',
    rating: 5,
    text: 'Sebagai dokter, saya tau betapa pentingnya mental health. Sembalun memberikan solusi yang evidence-based dan culturally relevant.',
    achievement: 'Recommended to 15 patients',
    timeUsing: '5 bulan',
    verified: true,
    culturalBackground: 'Jawa'
  }
];

const SOCIAL_STATS: SocialStats = {
  totalUsers: 12847,
  indonesianUsers: 11250,
  averageRating: 4.8,
  completionRate: 87,
  moodImprovement: 76
};

const AUTH_OPTIONS: AuthOption[] = [
  {
    id: 'google',
    name: 'Google',
    icon: '🔍',
    description: 'Masuk dengan akun Google yang sudah Anda miliki',
    indonesianFriendly: true,
    trustScore: 95
  },
  {
    id: 'email',
    name: 'Email',
    icon: '📧',
    description: 'Daftar dengan alamat email Anda',
    indonesianFriendly: true,
    trustScore: 85
  },
  {
    id: 'phone',
    name: 'WhatsApp/SMS',
    icon: '📱',
    description: 'Verifikasi dengan nomor HP Anda',
    indonesianFriendly: true,
    trustScore: 90
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    description: 'Masuk dengan akun Facebook',
    indonesianFriendly: true,
    trustScore: 80
  }
];

export const SocialProofAuthentication: React.FC<SocialProofAuthenticationProps> = ({
  conversionReadiness,
  onComplete,
  onReturnLater
}) => {
  const [currentStep, setCurrentStep] = useState<'social-proof' | 'gentle-auth' | 'final-nudge'>('social-proof');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<string>('');
  const [showMoreStats, setShowMoreStats] = useState(false);
  const [userHesitating, setUserHesitating] = useState(false);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % INDONESIAN_TESTIMONIALS.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  // Detect hesitation (staying too long without action)
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserHesitating(true);
    }, 15000); // 15 seconds
    
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleAuthSelection = (method: string) => {
    setSelectedAuthMethod(method);
    // Simulate authentication process
    setTimeout(() => {
      onComplete(true, method);
    }, 1000);
  };

  const handleSkip = (reason: string) => {
    onComplete(false, undefined, reason);
  };

  const handleReturnLater = () => {
    if (onReturnLater) {
      onReturnLater();
    } else {
      onComplete(false, undefined, 'return_later');
    }
  };

  // Get testimonials filtered by cultural relevance
  const getRelevantTestimonials = () => {
    // Prioritize testimonials that match user's likely cultural background
    return INDONESIAN_TESTIMONIALS.sort((a, b) => {
      const aScore = a.verified ? 1 : 0;
      const bScore = b.verified ? 1 : 0;
      return bScore - aScore;
    });
  };

  const currentTestimonialData = getRelevantTestimonials()[currentTestimonial];

  // Social proof step
  if (currentStep === 'social-proof') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mb-4"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🇮🇩</span>
              </div>
            </motion.div>
            
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
              Bergabung dengan {SOCIAL_STATS.indonesianUsers.toLocaleString('id-ID')}+ Pengguna Indonesia
            </h2>
            <p className="text-gray-600">
              Mereka sudah merasakan manfaat meditasi yang disesuaikan dengan budaya Indonesia
            </p>
          </div>

          {/* Social statistics */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg"
            >
              <div className="text-2xl font-bold text-green-600">⭐ {SOCIAL_STATS.averageRating}</div>
              <div className="text-sm text-green-700">Rating rata-rata</div>
              <div className="text-xs text-green-600 mt-1">dari 1,200+ review</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg"
            >
              <div className="text-2xl font-bold text-blue-600">{SOCIAL_STATS.completionRate}%</div>
              <div className="text-sm text-blue-700">Menyelesaikan program</div>
              <div className="text-xs text-blue-600 mt-1">vs 23% apps lain</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
            >
              <div className="text-2xl font-bold text-purple-600">+{SOCIAL_STATS.moodImprovement}%</div>
              <div className="text-sm text-purple-700">Peningkatan mood</div>
              <div className="text-xs text-purple-600 mt-1">rata-rata pengguna</div>
            </motion.div>
          </div>

          {/* Rotating testimonials */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-primary-50 to-accent-50 p-6 rounded-xl"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{currentTestimonialData.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-800">{currentTestimonialData.name}</span>
                      {currentTestimonialData.verified && (
                        <span className="text-green-600 text-sm">✓ Terverifikasi</span>
                      )}
                      <div className="flex text-yellow-500 text-sm">
                        {'⭐'.repeat(currentTestimonialData.rating)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{currentTestimonialData.location}</div>
                    <blockquote className="text-gray-700 italic mb-3 leading-relaxed">
                      "{currentTestimonialData.text}"
                    </blockquote>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>🏆 {currentTestimonialData.achievement}</span>
                      <span>⏱️ {currentTestimonialData.timeUsing}</span>
                      {currentTestimonialData.culturalBackground && (
                        <span>🌸 {currentTestimonialData.culturalBackground}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Additional stats button */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowMoreStats(!showMoreStats)}
              className="text-primary-600 text-sm hover:text-primary-700 transition-colors"
            >
              {showMoreStats ? '👆 Sembunyikan detail' : '👇 Lihat statistik lengkap'}
            </button>

            <AnimatePresence>
              {showMoreStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 grid md:grid-cols-2 gap-4 text-sm"
                >
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium">📍 Pengguna by Region:</div>
                    <div className="text-gray-600 mt-1">
                      • Jakarta: 2,847 • Bandung: 1,523 • Surabaya: 1,205 • Medan: 892 • Yogya: 743
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium">🎯 Success Metrics:</div>
                    <div className="text-gray-600 mt-1">
                      • 94% improved sleep • 87% reduced anxiety • 82% better focus • 91% would recommend
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <IndonesianCTA
              onClick={() => setCurrentStep('gentle-auth')}
              size="large"
              variant="spiritual"
              className="w-full"
            >
              🤝 Bergabung dengan Komunitas
            </IndonesianCTA>

            <div className="flex space-x-3">
              <button
                onClick={handleReturnLater}
                className="flex-1 px-4 py-3 text-primary-600 border border-primary-200 rounded-xl font-medium hover:bg-primary-50 transition-colors"
              >
                📅 Kembali Nanti
              </button>
              
              <button
                onClick={() => handleSkip('social_proof_not_convincing')}
                className="flex-1 px-4 py-3 text-gray-500 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Lewati
              </button>
            </div>
          </div>

          {/* Testimonial indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {INDONESIAN_TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Gentle authentication step
  if (currentStep === 'gentle-auth') {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mb-4"
            >
              <CairnIcon size={56} className="text-primary-600 mx-auto" />
            </motion.div>
            
            <h2 className="text-xl font-heading font-bold text-gray-800 mb-2">
              Pilih Cara yang Nyaman untuk Anda
            </h2>
            <p className="text-gray-600 text-sm">
              Cukup satu klik untuk menyimpan progress dan bergabung dengan komunitas
            </p>
          </div>

          {/* Auth options */}
          <div className="space-y-3 mb-8">
            {AUTH_OPTIONS.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAuthSelection(option.id)}
                disabled={!!selectedAuthMethod}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  selectedAuthMethod === option.id
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                } disabled:opacity-50`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{option.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Masuk dengan {option.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {option.indonesianFriendly && (
                      <div className="text-xs text-green-600 mb-1">🇮🇩 Populer</div>
                    )}
                    <div className="text-xs text-gray-500">
                      {option.trustScore}% trust
                    </div>
                    {selectedAuthMethod === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-600 mt-1"
                      >
                        ⚡ Memproses...
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Security assurance */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-8">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              🔒 Keamanan Data Terjamin
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ Enkripsi end-to-end untuk semua data pribadi</li>
              <li>✓ Compliance dengan UU No. 27/2022 tentang PDP</li>
              <li>✓ Tidak ada spam, data tidak dijual ke pihak ketiga</li>
              <li>✓ Bisa hapus akun kapan saja</li>
            </ul>
          </div>

          {/* Hesitation detection */}
          <AnimatePresence>
            {userHesitating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6"
              >
                <h4 className="font-semibold text-yellow-800 mb-2">
                  🤔 Ada yang ingin ditanyakan?
                </h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Kami mengerti kekhawatiran Anda tentang privasi. Tim support Indonesia siap membantu!
                </p>
                <div className="flex space-x-3">
                  <button className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300">
                    💬 Chat Support
                  </button>
                  <button className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300">
                    📋 FAQ Privasi
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alternative actions */}
          <div className="space-y-3">
            <button
              onClick={handleReturnLater}
              className="w-full px-4 py-3 text-primary-600 border border-primary-200 rounded-xl font-medium hover:bg-primary-50 transition-colors"
            >
              📧 Email Link untuk Nanti
            </button>
            
            <button
              onClick={() => setCurrentStep('final-nudge')}
              className="w-full px-4 py-3 text-gray-500 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Masih ragu-ragu?
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Final nudge for very hesitant users
  return (
    <div className="max-w-lg mx-auto p-6">
      <Card className="p-8">
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🚪</span>
            </div>
          </motion.div>
          
          <h2 className="text-xl font-heading font-bold text-gray-800 mb-2">
            Sebelum Anda Pergi...
          </h2>
          <p className="text-gray-600 text-sm">
            Ingat progress yang sudah Anda capai hari ini?
          </p>
        </div>

        {/* Recap of what they'll lose */}
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-red-800 mb-3">⚠️ Yang Akan Hilang:</h4>
            <div className="space-y-2 text-sm text-red-700">
              <div>• Peningkatan mood +{Math.round(conversionReadiness * 0.7)}% yang sudah Anda rasakan</div>
              <div>• Personalisasi meditasi sesuai budaya Anda</div>
              <div>• Kesempatan bergabung dengan {SOCIAL_STATS.indonesianUsers.toLocaleString('id-ID')}+ pengguna Indonesia</div>
              <div>• Akses ke konten premium gratis (terbatas untuk early users)</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">💝 Penawaran Terakhir:</h4>
            <div className="text-sm text-blue-700">
              <div className="font-medium mb-2">Jika Anda daftar sekarang, dapatkan:</div>
              <ul className="space-y-1">
                <li>✓ 7 hari trial premium GRATIS</li>
                <li>✓ Konsultasi 1-on-1 dengan meditation coach</li>
                <li>✓ Akses komunitas WhatsApp eksklusif</li>
                <li>✓ Guarantee: tidak puas uang kembali</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Final actions */}
        <div className="space-y-4">
          <IndonesianCTA
            onClick={() => setCurrentStep('gentle-auth')}
            size="large"
            variant="spiritual"
            className="w-full relative overflow-hidden"
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <span className="relative">💎 Klaim Penawaran Terbatas</span>
          </IndonesianCTA>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSkip('email_reminder')}
              className="px-4 py-3 text-primary-600 border border-primary-200 rounded-xl font-medium hover:bg-primary-50 transition-colors text-sm"
            >
              📧 Email Reminder
            </button>
            
            <button
              onClick={() => handleSkip('final_exit')}
              className="px-4 py-3 text-gray-500 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              👋 Keluar
            </button>
          </div>
        </div>

        {/* Last social proof */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500">
            <div className="mb-2">⏰ {Math.floor(Math.random() * 15) + 5} orang mendaftar dalam 1 jam terakhir</div>
            <div className="flex items-center justify-center space-x-4">
              <span>"Keputusan terbaik tahun ini!" - Rina, Semarang</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SocialProofAuthentication;