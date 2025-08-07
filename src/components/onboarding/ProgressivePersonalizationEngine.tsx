import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CairnIcon } from '../ui';
import IndonesianCTA from '../ui/IndonesianCTA';
import type { CulturalData } from './CulturalPersonalizationScreen';

export type PersonalizationLayer = 'essential' | 'cultural' | 'behavioral' | 'advanced';
export type CollectionTiming = 'immediate' | 'after-value' | 'progressive' | 'optional';

interface PersonalizationQuestion {
  id: string;
  layer: PersonalizationLayer;
  timing: CollectionTiming;
  question: string;
  impact: 'high' | 'medium' | 'low';
  culturalSensitivity: 'none' | 'medium' | 'high';
  options: string[];
  skipAllowed: boolean;
  reasoning: string;
}

interface ProgressivePersonalizationStrategy {
  totalQuestions: number;
  layerDistribution: Record<PersonalizationLayer, number>;
  timingStrategy: Record<CollectionTiming, PersonalizationQuestion[]>;
  culturalAdaptations: Record<string, any>;
  conversionOptimization: {
    maxQuestionsBeforeValue: number;
    culturalTrustBuilders: string[];
    skipStrategies: string[];
  };
}

/**
 * PROGRESSIVE PERSONALIZATION ENGINE FOR INDONESIAN USERS
 * 
 * Research-based approach:
 * - Maximum 3 questions before showing value
 * - Cultural questions only after trust is established
 * - Always provide skip options with gentle language
 * - Use Indonesian context and examples
 */

const INDONESIAN_PERSONALIZATION_QUESTIONS: PersonalizationQuestion[] = [
  // LAYER 1: ESSENTIAL (Ask immediately - max 3 questions)
  {
    id: 'goal',
    layer: 'essential',
    timing: 'immediate',
    question: 'Apa tujuan utama kamu bermeditasi?',
    impact: 'high',
    culturalSensitivity: 'none',
    options: [
      '🧘‍♀️ Mengurangi stres dan kecemasan',
      '🎯 Meningkatkan fokus dan konsentrasi', 
      '😴 Tidur lebih nyenyak',
      '🌟 Mengeksplorasi mindfulness',
      '🤲 Mendekatkan diri pada Tuhan',
      '❤️ Mengatur emosi lebih baik'
    ],
    skipAllowed: false, // Essential for content recommendation
    reasoning: 'Critical for content personalization, culturally neutral'
  },
  {
    id: 'experience',
    layer: 'essential',
    timing: 'immediate',
    question: 'Seberapa berpengalaman kamu dengan meditasi?',
    impact: 'high',
    culturalSensitivity: 'none',
    options: [
      '🆕 Baru pertama kali (pemula total)',
      '🌱 Pernah coba beberapa kali',
      '📚 Sudah praktik secara rutin',
      '🧘‍♂️ Berpengalaman (>1 tahun)',
      '🏆 Sangat berpengalaman (mengajar)'
    ],
    skipAllowed: true,
    reasoning: 'Essential for difficulty level, no cultural barriers'
  },
  {
    id: 'time-availability',
    layer: 'essential', 
    timing: 'immediate',
    question: 'Berapa lama waktu yang biasanya kamu punya untuk meditasi?',
    impact: 'high',
    culturalSensitivity: 'none',
    options: [
      '⚡ 3-5 menit (cepat)',
      '🕐 5-10 menit (standar)',
      '🕕 10-20 menit (nyaman)',
      '🕘 20+ menit (mendalam)',
      '📅 Bervariasi setiap hari'
    ],
    skipAllowed: true,
    reasoning: 'Essential for session length, universally relevant'
  },

  // LAYER 2: CULTURAL (Ask after showing value - after first successful session)
  {
    id: 'spiritual-background',
    layer: 'cultural',
    timing: 'after-value',
    question: 'Tradisi spiritual mana yang paling dekat dengan kamu?',
    impact: 'high',
    culturalSensitivity: 'high',
    options: [
      '☪️ Islam - saya ingin integrasi dengan sholat dan dzikir',
      '🕉️ Hindu - saya tertarik yoga dan filosofi Vedanta',
      '☸️ Buddha - saya ingin memperdalam vipassana dan dharma',
      '✝️ Kristen - saya suka meditasi kontemplatif',
      '🎋 Kejawen - saya menghargai kebijaksanaan leluhur',
      '🌟 Spiritual umum - saya terbuka pada semua ajaran',
      '🤔 Belum yakin - saya masih mengeksplorasi'
    ],
    skipAllowed: true,
    reasoning: 'High cultural sensitivity but high impact - ask after trust building'
  },
  {
    id: 'regional-culture',
    layer: 'cultural',
    timing: 'after-value',
    question: 'Dari daerah mana kamu berasal? (untuk menyesuaikan konten lokal)',
    impact: 'medium',
    culturalSensitivity: 'medium',
    options: [
      '🏙️ Jakarta & sekitarnya (Betawi)',
      '🏛️ Bali (Hindu-Bali)',
      '🎭 Jawa Tengah (Kejawen)',
      '⛰️ Jawa Timur',
      '🌿 Sumatra (Melayu/Batak)',
      '🌺 Kalimantan',
      '🦋 Sulawesi',
      '🏝️ Nusa Tenggara',
      '🗺️ Lainnya'
    ],
    skipAllowed: true,
    reasoning: 'Adds cultural relevance but not essential for core experience'
  },

  // LAYER 3: BEHAVIORAL (Ask progressively during usage)
  {
    id: 'preferred-time',
    layer: 'behavioral',
    timing: 'progressive',
    question: 'Kapan waktu terbaik kamu untuk bermeditasi?',
    impact: 'medium',
    culturalSensitivity: 'low',
    options: [
      '🌅 Pagi hari (04:00-08:00) - setelah subuh/saat fresh',
      '☀️ Siang hari (08:00-15:00) - break dari aktivitas',
      '🌇 Sore hari (15:00-18:00) - sebelum maghrib/pulang kerja',
      '🌙 Malam hari (18:00-22:00) - setelah sholat maghrib/isya',
      '🌛 Larut malam (22:00+) - sebelum tidur',
      '📅 Waktu fleksibel - sesuai kebutuhan'
    ],
    skipAllowed: true,
    reasoning: 'Behavioral pattern for smart scheduling - collect during usage'
  },
  {
    id: 'family-context',
    layer: 'behavioral',
    timing: 'progressive',
    question: 'Bagaimana situasi lingkungan saat kamu meditasi?',
    impact: 'medium',
    culturalSensitivity: 'medium',
    options: [
      '🚪 Ruang pribadi - saya punya tempat tenang',
      '🏠 Ruang keluarga - perlu menyesuaikan dengan aktivitas rumah',
      '👨‍👩‍👧‍👦 Keluarga mendukung - mereka ikut praktik mindfulness',
      '🏢 Tempat kerja/publik - butuh teknik yang tidak mencolok',
      '🎧 Pakai headphone - lingkungan bising tapi bisa adaptasi'
    ],
    skipAllowed: true,
    reasoning: 'Affects session type and audio guidance - important but not urgent'
  },

  // LAYER 4: ADVANCED (Optional, ask much later for optimization)
  {
    id: 'mood-patterns',
    layer: 'advanced',
    timing: 'optional',
    question: 'Kapan kamu biasanya merasa paling stres atau cemas?',
    impact: 'low',
    culturalSensitivity: 'low',
    options: [
      '🏃‍♂️ Pagi hari - sebelum mulai aktivitas',
      '💼 Siang hari - saat puncak pekerjaan',
      '🚗 Sore hari - pulang kerja/macet',
      '👨‍👩‍👧‍👦 Malam hari - urusan keluarga',
      '😴 Sebelum tidur - pikiran tidak bisa tenang',
      '📅 Tidak ada pola khusus'
    ],
    skipAllowed: true,
    reasoning: 'Advanced optimization - only for engaged users'
  }
];

interface ProgressivePersonalizationEngineProps {
  onStrategyComplete: (strategy: ProgressivePersonalizationStrategy) => void;
  culturalContext?: Partial<CulturalData>;
}

export const ProgressivePersonalizationEngine: React.FC<ProgressivePersonalizationEngineProps> = ({
  onStrategyComplete,
  culturalContext
}) => {
  const [currentLayer, setCurrentLayer] = useState<PersonalizationLayer>('essential');
  const [analysis, setAnalysis] = useState<ProgressivePersonalizationStrategy | null>(null);

  useEffect(() => {
    // Calculate the progressive personalization strategy
    const strategy: ProgressivePersonalizationStrategy = {
      totalQuestions: INDONESIAN_PERSONALIZATION_QUESTIONS.length,
      
      layerDistribution: {
        essential: INDONESIAN_PERSONALIZATION_QUESTIONS.filter(q => q.layer === 'essential').length,
        cultural: INDONESIAN_PERSONALIZATION_QUESTIONS.filter(q => q.layer === 'cultural').length,
        behavioral: INDONESIAN_PERSONALIZATION_QUESTIONS.filter(q => q.layer === 'behavioral').length,
        advanced: INDONESIAN_PERSONALIZATION_QUESTIONS.filter(q => q.layer === 'advanced').length,
      },
      
      timingStrategy: {
        immediate: INDONESIAN_PERSONALIZATION_QUESTIONS.filter(q => q.timing === 'immediate'),
        'after-value': INDONESIAN_PERSONALIZATION_QUESTIONS.filter(q => q.timing === 'after-value'),
        progressive: INDONESIAN_PERSONALIZATION_QUESTIONS.filter(q => q.timing === 'progressive'),
        optional: INDONESIAN_PERSONALIZATION_QUESTIONS.filter(q => q.timing === 'optional'),
      },
      
      culturalAdaptations: {
        islamicUsers: {
          prayerTimeIntegration: true,
          dzikrRecommendations: true,
          halalContentFilter: true,
          qiblaDirection: true
        },
        javaneseUsers: {
          traditionWisdom: true,
          respectedLanguage: true,
          ancestralValues: true
        },
        baliUsers: {
          hinduPhilosophy: true,
          triHitaKarana: true,
          templeScheduleAware: true
        }
      },
      
      conversionOptimization: {
        maxQuestionsBeforeValue: 3,
        culturalTrustBuilders: [
          'Pertanyaan hanya untuk membuat pengalaman lebih personal',
          'Data kamu aman dan tidak akan dibagikan',
          'Kamu bisa skip pertanyaan yang tidak nyaman',
          'Semakin personal, semakin efektif meditasinya'
        ],
        skipStrategies: [
          'Nanti saja - kamu bisa setting kapan saja',
          'Skip dulu - fokus ke meditasi',
          'Opsional - tidak wajib dijawab',
          'Bisa diatur nanti di pengaturan'
        ]
      }
    };

    setAnalysis(strategy);
    onStrategyComplete(strategy);
  }, [onStrategyComplete]);

  const renderLayerVisualization = (layer: PersonalizationLayer, questions: PersonalizationQuestion[]) => {
    const layerConfig = {
      essential: { color: 'red', name: 'WAJIB', desc: 'Diperlukan untuk pengalaman dasar' },
      cultural: { color: 'orange', name: 'BUDAYA', desc: 'Setelah pengguna merasakan value' },
      behavioral: { color: 'blue', name: 'PERILAKU', desc: 'Dikumpulkan secara bertahap' },
      advanced: { color: 'purple', name: 'LANJUTAN', desc: 'Opsional untuk optimasi' }
    };

    const config = layerConfig[layer];
    const colorClasses = {
      red: 'bg-red-50 border-red-200 text-red-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700', 
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700'
    };

    return (
      <div className={`border-2 rounded-xl p-6 ${colorClasses[config.color]}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">
              LAYER {['essential', 'cultural', 'behavioral', 'advanced'].indexOf(layer) + 1}: {config.name}
            </h3>
            <p className="text-sm opacity-80">{config.desc}</p>
          </div>
          <div className={`px-3 py-1 rounded-full bg-white bg-opacity-50 text-sm font-medium`}>
            {questions.length} pertanyaan
          </div>
        </div>

        <div className="space-y-3">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white bg-opacity-50 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm flex-1">{q.question}</h4>
                <div className="flex space-x-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    q.impact === 'high' ? 'bg-red-100 text-red-700' :
                    q.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {q.impact}
                  </span>
                  {q.skipAllowed && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      skippable
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-xs opacity-70 mb-2">
                Contoh opsi: "{q.options[0]}", "{q.options[1]}", ...
              </div>
              
              <div className="text-xs italic opacity-60">
                💡 {q.reasoning}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!analysis) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <CairnIcon size={48} className="text-primary-600 mx-auto" />
          </motion.div>
          <p className="text-gray-600">Menganalisis strategi personalisasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
            🎯 PROGRESSIVE PERSONALIZATION STRATEGY
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Strategi pengumpulan data personal yang dioptimalkan untuk pengguna Indonesia - 
            membangun kepercayaan sambil mengumpulkan insight yang diperlukan.
          </p>
        </div>

        {/* Strategy Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {Object.entries(analysis.layerDistribution).map(([layer, count]) => (
            <div key={layer} className="text-center">
              <div className="text-2xl font-bold text-primary-600">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{layer}</div>
            </div>
          ))}
        </div>

        {/* Key Principles */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-6 rounded-xl mb-8">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            🧠 PRINSIP KUNCI UX RESEARCH:
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-primary-700 mb-2">✅ Indonesian User Behavior:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• High-context culture: butuh waktu membangun trust</li>
                <li>• Community-oriented: social proof penting</li>
                <li>• Spiritual diversity: personalisasi budaya critical</li>
                <li>• Privacy conscious: transparansi penggunaan data</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-accent-700 mb-2">📊 Conversion Optimization:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Max 3 pertanyaan sebelum show value</li>
                <li>• Cultural questions setelah trust building</li>
                <li>• Always provide skip options</li>
                <li>• Progressive disclosure based on engagement</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Layer Visualization */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
            📋 4-LAYER PROGRESSIVE STRATEGY
          </h3>

          {Object.entries(analysis.timingStrategy).map(([timing, questions]) => {
            const layerTypes = [...new Set(questions.map(q => q.layer))];
            return layerTypes.map(layer => 
              renderLayerVisualization(layer, questions.filter(q => q.layer === layer))
            );
          }).flat()}
        </div>

        {/* Implementation Timeline */}
        <div className="mt-8 bg-gray-50 p-6 rounded-xl">
          <h3 className="font-bold text-lg text-gray-800 mb-4">⏰ TIMELINE IMPLEMENTASI:</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <span className="font-medium">IMMEDIATE (0-30 detik):</span>
                <span className="text-gray-600 ml-2">3 pertanyaan essential - goal, experience, time</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <span className="font-medium">AFTER VALUE (post-session 1):</span>
                <span className="text-gray-600 ml-2">2 pertanyaan cultural - spiritual & regional</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <span className="font-medium">PROGRESSIVE (day 2-7):</span>
                <span className="text-gray-600 ml-2">2 pertanyaan behavioral - timing & context</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <span className="font-medium">OPTIONAL (week 2+):</span>
                <span className="text-gray-600 ml-2">1 pertanyaan advanced - mood patterns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cultural Trust Builders */}
        <div className="mt-8 bg-blue-50 p-6 rounded-xl">
          <h3 className="font-bold text-lg text-blue-800 mb-4">🤝 CULTURAL TRUST BUILDERS</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.conversionOptimization.culturalTrustBuilders.map((builder, index) => (
              <div key={index} className="flex items-center space-x-2 text-blue-700 text-sm">
                <span className="text-blue-500">✓</span>
                <span>{builder}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skip Strategies */}
        <div className="mt-6 bg-green-50 p-6 rounded-xl">
          <h3 className="font-bold text-lg text-green-800 mb-4">🔄 SKIP STRATEGIES (Indonesian UX)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.conversionOptimization.skipStrategies.map((strategy, index) => (
              <div key={index} className="flex items-center space-x-2 text-green-700 text-sm">
                <span className="text-green-500">→</span>
                <span>{strategy}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export type { PersonalizationLayer, PersonalizationQuestion, ProgressivePersonalizationStrategy };
export default ProgressivePersonalizationEngine;