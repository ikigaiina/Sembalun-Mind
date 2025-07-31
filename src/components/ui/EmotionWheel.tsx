import React, { useState } from 'react';

export type EmotionType = 'bahagia' | 'sedih' | 'marah' | 'takut' | 'terkejut' | 'jijik';

interface EmotionCategory {
  id: EmotionType;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  bodyAwareness: string[];
}

interface EmotionWheelProps {
  onEmotionSelect?: (emotion: EmotionType) => void;
  selectedEmotion?: EmotionType | null;
}

const emotions: EmotionCategory[] = [
  {
    id: 'bahagia',
    name: 'Bahagia',
    emoji: '😊',
    color: 'text-green-600',
    bgColor: 'bg-green-100 hover:bg-green-200',
    description: 'Perasaan gembira, puas, dan penuh syukur. Energi positif mengalir dalam diri.',
    bodyAwareness: [
      'Wajah terasa rileks dan senyum alami',
      'Napas terasa ringan dan dalam',
      'Bahu dan otot tubuh tidak tegang',
      'Energi hangat di sekitar dada'
    ]
  },
  {
    id: 'sedih',
    name: 'Sedih',
    emoji: '😢',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
    description: 'Perasaan kehilangan, kecewa, atau duka. Emosi yang alami ketika menghadapi kesulitan.',
    bodyAwareness: [
      'Mata terasa berat atau berair',
      'Dada terasa sesak atau berat',
      'Napas pendek dan tidak teratur',
      'Bahu membungkuk ke depan'
    ]
  },
  {
    id: 'marah',
    name: 'Marah',
    emoji: '😠',
    color: 'text-red-600',
    bgColor: 'bg-red-100 hover:bg-red-200',
    description: 'Perasaan kesal, frustrasi, atau tidak setuju dengan situasi tertentu.',
    bodyAwareness: [
      'Rahang terasa kencang atau mengatup',
      'Tangan mengepal atau otot tegang',
      'Detak jantung meningkat',
      'Napas cepat dan dangkal'
    ]
  },
  {
    id: 'takut',
    name: 'Takut',
    emoji: '😨',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 hover:bg-purple-200',
    description: 'Perasaan cemas, khawatir, atau tidak aman menghadapi ketidakpastian.',
    bodyAwareness: [
      'Perut terasa mual atau bergejolak',
      'Otot tubuh tegang dan siaga',
      'Napas pendek atau tersendat',
      'Tangan atau kaki berkeringat'
    ]
  },
  {
    id: 'terkejut',
    name: 'Terkejut',
    emoji: '😲',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200',
    description: 'Perasaan kaget atau terkejut dengan kejadian yang tidak terduga.',
    bodyAwareness: [
      'Mata terbuka lebar secara refleks',
      'Napas tertahan sesaat',
      'Tubuh menegang atau melompat',
      'Jantung berdetak kencang'
    ]
  },
  {
    id: 'jijik',
    name: 'Jijik',
    emoji: '🤢',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
    description: 'Perasaan tidak suka atau menolak sesuatu yang tidak sesuai dengan nilai diri.',
    bodyAwareness: [
      'Hidung berkerut atau mengernyit',
      'Mulut terasa pahit atau mual',
      'Tubuh menjauh atau mundur',
      'Perut terasa tidak nyaman'
    ]
  }
];

export const EmotionWheel: React.FC<EmotionWheelProps> = ({
  onEmotionSelect,
  selectedEmotion
}) => {
  const [expandedEmotion, setExpandedEmotion] = useState<EmotionType | null>(null);

  const handleEmotionClick = (emotionId: EmotionType) => {
    if (expandedEmotion === emotionId) {
      setExpandedEmotion(null);
    } else {
      setExpandedEmotion(emotionId);
      onEmotionSelect?.(emotionId);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-semibold text-primary mb-2">
          Roda Emosi
        </h2>
        <p className="text-gray-600 text-sm">
          Sentuh emosi yang Anda rasakan saat ini untuk memahami diri lebih dalam
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {emotions.map((emotion) => (
          <div
            key={emotion.id}
            className={`
              relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer
              ${selectedEmotion === emotion.id 
                ? 'border-accent bg-accent/20 shadow-lg' 
                : 'border-gray-200 hover:border-accent/50'
              }
              ${emotion.bgColor}
            `}
            onClick={() => handleEmotionClick(emotion.id)}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{emotion.emoji}</div>
              <h3 className={`font-semibold text-lg ${emotion.color}`}>
                {emotion.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {expandedEmotion && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg transition-all duration-500">
          {(() => {
            const emotion = emotions.find(e => e.id === expandedEmotion);
            if (!emotion) return null;

            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{emotion.emoji}</span>
                  <h3 className={`text-xl font-semibold ${emotion.color}`}>
                    {emotion.name}
                  </h3>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {emotion.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">
                    Kesadaran Tubuh
                  </h4>
                  <div className="space-y-2">
                    {emotion.bodyAwareness.map((awareness, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{awareness}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-background rounded-lg">
                  <p className="text-sm text-gray-600 italic">
                    💡 Tip: Tidak ada emosi yang "salah". Setiap emosi memberi informasi penting tentang kebutuhan dan nilai-nilai kita.
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};