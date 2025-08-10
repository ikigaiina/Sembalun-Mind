import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Brain, 
  Heart, 
  Eye, 
  Waves, 
  Zap, 
  Target, 
  Headphones, 
  Smartphone,
  Activity,
  Wind,
  Sun,
  Moon,
  Sparkles,
  Mic
} from 'lucide-react';

interface BiometricData {
  heartRate: number;
  brainwaves: {
    alpha: number;
    beta: number;
    theta: number;
    delta: number;
  };
  stressLevel: number;
  breathingRate: number;
}

interface MeditationMode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  requiresDevice?: string;
  isPremium: boolean;
  difficulty: 'pemula' | 'menengah' | 'lanjutan' | 'master';
  duration: number[];
  category: 'immersive' | 'biometric' | 'ai-guided' | 'social' | 'therapeutic';
}

export const AdvancedMeditationModes: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [biometricData, setBiometricData] = useState<BiometricData>({
    heartRate: 72,
    brainwaves: { alpha: 45, beta: 30, theta: 15, delta: 10 },
    stressLevel: 3.2,
    breathingRate: 16
  });
  const [isConnectedToDevice, setIsConnectedToDevice] = useState(false);

  const meditationModes: MeditationMode[] = [
    {
      id: 'vr_nature',
      title: 'VR Nature Immersion',
      description: 'Meditasi dalam lingkungan alam virtual yang realistis dengan teknologi VR',
      icon: <Eye className="w-6 h-6" />,
      color: 'from-green-400 to-emerald-600',
      features: ['360° Nature Environments', 'Spatial Audio', 'Hand Tracking', 'Weather Effects'],
      requiresDevice: 'VR Headset (Quest, Pico)',
      isPremium: true,
      difficulty: 'menengah',
      duration: [15, 30, 45, 60],
      category: 'immersive'
    },
    {
      id: 'ar_chakra',
      title: 'AR Chakra Visualization',
      description: 'Visualisasi chakra dengan Augmented Reality untuk meditasi energi yang mendalam',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-400 to-indigo-600',
      features: ['3D Chakra Models', 'Color Therapy', 'Energy Visualization', 'Sound Frequencies'],
      requiresDevice: 'AR-enabled Smartphone',
      isPremium: true,
      difficulty: 'lanjutan',
      duration: [20, 30, 45],
      category: 'immersive'
    },
    {
      id: 'biometric_adaptive',
      title: 'Biometric Adaptive Meditation',
      description: 'Meditasi yang beradaptasi real-time berdasarkan data biometrik Anda',
      icon: <Activity className="w-6 h-6" />,
      color: 'from-red-400 to-pink-600',
      features: ['Heart Rate Monitoring', 'Stress Level Detection', 'Adaptive Content', 'Progress Tracking'],
      requiresDevice: 'Heart Rate Monitor, Smartwatch',
      isPremium: true,
      difficulty: 'menengah',
      duration: [10, 15, 20, 30],
      category: 'biometric'
    },
    {
      id: 'brainwave_sync',
      title: 'Brainwave Synchronization',
      description: 'Sinkronisasi gelombang otak dengan teknologi neurofeedback untuk meditasi optimal',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-blue-400 to-cyan-600',
      features: ['EEG Monitoring', 'Binaural Beats', 'Neurofeedback', 'Cognitive Enhancement'],
      requiresDevice: 'EEG Headband (Muse, NeuroSky)',
      isPremium: true,
      difficulty: 'master',
      duration: [20, 30, 45, 60],
      category: 'biometric'
    },
    {
      id: 'ai_personal_coach',
      title: 'AI Personal Meditation Coach',
      description: 'Pelatih meditasi AI yang memberikan panduan personal berdasarkan kemajuan Anda',
      icon: <Mic className="w-6 h-6" />,
      color: 'from-yellow-400 to-orange-600',
      features: ['Voice Interaction', 'Personalized Guidance', 'Progress Analysis', 'Adaptive Sessions'],
      isPremium: true,
      difficulty: 'pemula',
      duration: [5, 10, 15, 20, 30],
      category: 'ai-guided'
    },
    {
      id: 'breathwork_advanced',
      title: 'Advanced Breathwork Therapy',
      description: 'Teknik pernapasan terapeutik dengan monitoring CO2 dan feedback real-time',
      icon: <Wind className="w-6 h-6" />,
      color: 'from-teal-400 to-blue-600',
      features: ['CO2 Monitoring', 'Breathing Patterns', 'Therapeutic Protocols', 'Medical Integration'],
      requiresDevice: 'CO2 Sensor, Chest Strap',
      isPremium: true,
      difficulty: 'lanjutan',
      duration: [15, 25, 35, 45],
      category: 'therapeutic'
    },
    {
      id: 'social_meditation',
      title: 'Social Meditation Circles',
      description: 'Meditasi bersama dalam grup virtual dengan sinkronisasi energi kolektif',
      icon: <Target className="w-6 h-6" />,
      color: 'from-pink-400 to-rose-600',
      features: ['Group Sessions', 'Energy Sync', 'Collective Intention', 'Community Challenges'],
      isPremium: false,
      difficulty: 'menengah',
      duration: [20, 30, 45, 60],
      category: 'social'
    },
    {
      id: 'sound_therapy',
      title: 'Immersive Sound Therapy',
      description: 'Terapi suara 3D dengan frekuensi penyembuhan dan instrumen tradisional Indonesia',
      icon: <Headphones className="w-6 h-6" />,
      color: 'from-indigo-400 to-purple-600',
      features: ['3D Spatial Audio', 'Healing Frequencies', 'Traditional Instruments', 'Chakra Tuning'],
      requiresDevice: 'High-quality Headphones',
      isPremium: true,
      difficulty: 'pemula',
      duration: [10, 20, 30, 45],
      category: 'therapeutic'
    },
    {
      id: 'circadian_sync',
      title: 'Circadian Rhythm Synchronization',
      description: 'Meditasi yang disesuaikan dengan ritme sirkadian untuk optimasi tidur dan energi',
      icon: <Sun className="w-6 h-6" />,
      color: 'from-amber-400 to-yellow-600',
      features: ['Light Therapy Integration', 'Circadian Analysis', 'Sleep Optimization', 'Energy Balancing'],
      requiresDevice: 'Light Therapy Device',
      isPremium: true,
      difficulty: 'menengah',
      duration: [15, 25, 35],
      category: 'therapeutic'
    },
    {
      id: 'micro_meditation',
      title: 'AI Micro-Meditation Moments',
      description: 'Sesi meditasi mikro yang dipicu AI berdasarkan pola stres dan aktivitas harian',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-green-400 to-teal-600',
      features: ['Smart Triggers', 'Context Awareness', 'Micro-sessions', 'Stress Intervention'],
      isPremium: false,
      difficulty: 'pemula',
      duration: [1, 2, 3, 5],
      category: 'ai-guided'
    }
  ];

  // Simulate biometric data updates
  useEffect(() => {
    if (isConnectedToDevice) {
      const interval = setInterval(() => {
        setBiometricData(prev => ({
          ...prev,
          heartRate: 65 + Math.random() * 20,
          stressLevel: Math.max(1, Math.min(10, prev.stressLevel + (Math.random() - 0.5) * 0.5)),
          breathingRate: 12 + Math.random() * 8,
          brainwaves: {
            alpha: Math.max(10, Math.min(60, prev.brainwaves.alpha + (Math.random() - 0.5) * 10)),
            beta: Math.max(10, Math.min(50, prev.brainwaves.beta + (Math.random() - 0.5) * 8)),
            theta: Math.max(5, Math.min(30, prev.brainwaves.theta + (Math.random() - 0.5) * 5)),
            delta: Math.max(5, Math.min(25, prev.brainwaves.delta + (Math.random() - 0.5) * 3))
          }
        }));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isConnectedToDevice]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'pemula': return 'bg-green-100 text-green-800';
      case 'menengah': return 'bg-yellow-100 text-yellow-800';
      case 'lanjutan': return 'bg-orange-100 text-orange-800';
      case 'master': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'immersive': return '🥽';
      case 'biometric': return '📊';
      case 'ai-guided': return '🤖';
      case 'social': return '👥';
      case 'therapeutic': return '🩺';
      default: return '🧘';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Meditation Modes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Jelajahi teknologi meditasi terdepan dengan AI, VR/AR, biometrik, dan terapi suara untuk pengalaman spiritual yang revolusioner
          </p>
        </div>

        {/* Biometric Dashboard */}
        {isConnectedToDevice && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Real-time Biometric Data
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{Math.round(biometricData.heartRate)}</div>
                <div className="text-sm text-gray-600">BPM</div>
              </div>
              <div className="text-center">
                <Brain className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{Math.round(biometricData.brainwaves.alpha)}</div>
                <div className="text-sm text-gray-600">Alpha Waves</div>
              </div>
              <div className="text-center">
                <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{biometricData.stressLevel.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Stress Level</div>
              </div>
              <div className="text-center">
                <Wind className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{Math.round(biometricData.breathingRate)}</div>
                <div className="text-sm text-gray-600">Breaths/min</div>
              </div>
            </div>
          </Card>
        )}

        {/* Device Connection */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Device Integration</h3>
              <p className="text-gray-600">Connect your wearable devices for enhanced meditation experience</p>
            </div>
            <Button
              onClick={() => setIsConnectedToDevice(!isConnectedToDevice)}
              variant={isConnectedToDevice ? "outline" : "primary"}
              className="flex items-center space-x-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isConnectedToDevice ? 'Disconnect' : 'Connect Device'}</span>
            </Button>
          </div>
          {isConnectedToDevice && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">Connected: Apple Watch Series 8, Muse 2 Headband</span>
              </div>
            </div>
          )}
        </Card>

        {/* Meditation Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meditationModes.map((mode) => (
            <Card key={mode.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              {/* Header with Gradient */}
              <div className={`h-32 bg-gradient-to-r ${mode.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center mb-2">
                    {mode.icon}
                    <span className="ml-2 text-sm font-medium">{getCategoryIcon(mode.category)}</span>
                  </div>
                  <h3 className="text-xl font-bold">{mode.title}</h3>
                </div>
                <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
                  {mode.isPremium && (
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      PREMIUM
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(mode.difficulty)}`}>
                    {mode.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  {mode.description}
                </p>

                {mode.requiresDevice && (
                  <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center text-amber-800">
                      <Smartphone className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium">Requires: {mode.requiresDevice}</span>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Duration Options:</h4>
                  <div className="flex flex-wrap gap-1">
                    {mode.duration.map((duration, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {duration}m
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button 
                    variant="primary" 
                    className="flex-1 mr-2"
                    onClick={() => setSelectedMode(mode.id)}
                  >
                    Start Session
                  </Button>
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Technology Integration Info */}
        <Card className="mt-8 p-8 bg-gradient-to-r from-gray-50 to-slate-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Technology Integration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">AI & Machine Learning</h3>
              <p className="text-sm text-gray-600">
                Personalisasi content dan guidance berdasarkan pola meditasi dan progress individual
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Biometric Integration</h3>
              <p className="text-sm text-gray-600">
                Real-time monitoring dan adaptive sessions berdasarkan data kesehatan
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Immersive Technologies</h3>
              <p className="text-sm text-gray-600">
                VR/AR experiences untuk meditasi yang lebih mendalam dan engaging
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};