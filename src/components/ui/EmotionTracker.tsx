import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import type { EmotionType } from './EmotionWheel';

interface EmotionEntry {
  id: string;
  emotion: EmotionType;
  intensity: number; // 1-5 scale
  timestamp: Date;
  note?: string;
}

interface EmotionTrackerProps {
  onTrackEmotion?: (entry: EmotionEntry) => void;
}

const emotionLabels: Record<EmotionType, { name: string; emoji: string; color: string }> = {
  bahagia: { name: 'Bahagia', emoji: '😊', color: 'text-green-600' },
  sedih: { name: 'Sedih', emoji: '😢', color: 'text-blue-600' },
  marah: { name: 'Marah', emoji: '😠', color: 'text-red-600' },
  takut: { name: 'Takut', emoji: '😨', color: 'text-purple-600' },
  terkejut: { name: 'Terkejut', emoji: '😲', color: 'text-yellow-600' },
  jijik: { name: 'Jijik', emoji: '🤢', color: 'text-gray-600' }
};

export const EmotionTracker: React.FC<EmotionTrackerProps> = ({ onTrackEmotion }) => {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [intensity, setIntensity] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('sembalun-emotion-entries');
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries).map((entry: Omit<EmotionEntry, 'timestamp'> & { timestamp: string }) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setEntries(parsed);
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('sembalun-emotion-entries', JSON.stringify(entries));
  }, [entries]);

  const handleTrackEmotion = () => {
    if (!selectedEmotion) return;

    const newEntry: EmotionEntry = {
      id: Date.now().toString(),
      emotion: selectedEmotion,
      intensity,
      timestamp: new Date(),
      note: note.trim() || undefined
    };

    setEntries(prev => [newEntry, ...prev]);
    onTrackEmotion?.(newEntry);

    // Reset form
    setSelectedEmotion(null);
    setIntensity(3);
    setNote('');
  };

  const getTodayEntries = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return entries.filter(entry => entry.timestamp >= today);
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyEntries = entries.filter(entry => entry.timestamp >= weekAgo);
    const emotionCounts: Record<EmotionType, number> = {
      bahagia: 0, sedih: 0, marah: 0, takut: 0, terkejut: 0, jijik: 0
    };

    weeklyEntries.forEach(entry => {
      emotionCounts[entry.emotion]++;
    });

    return emotionCounts;
  };

  const todayEntries = getTodayEntries();
  const weeklyStats = getWeeklyStats();
  const mostFrequentEmotion = Object.entries(weeklyStats)
    .sort(([,a], [,b]) => b - a)[0];

  if (showHistory) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary">Riwayat Emosi</h3>
          <Button 
            onClick={() => setShowHistory(false)}
            variant="outline"
            className="text-sm"
          >
            Kembali
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <h4 className="font-semibold text-primary mb-2">Hari Ini</h4>
            <p className="text-2xl font-bold text-accent">{todayEntries.length}</p>
            <p className="text-sm text-gray-600">entri emosi</p>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold text-primary mb-2">Emosi Dominan Minggu Ini</h4>
            {mostFrequentEmotion && mostFrequentEmotion[1] > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xl">{emotionLabels[mostFrequentEmotion[0] as EmotionType].emoji}</span>
                <span className="font-medium">{emotionLabels[mostFrequentEmotion[0] as EmotionType].name}</span>
                <span className="text-sm text-gray-600">({mostFrequentEmotion[1]}x)</span>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Belum ada data</p>
            )}
          </Card>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {entries.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600">Belum ada entri emosi</p>
            </Card>
          ) : (
            entries.slice(0, 20).map((entry) => (
              <Card key={entry.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{emotionLabels[entry.emotion].emoji}</span>
                    <div>
                      <p className={`font-medium ${emotionLabels[entry.emotion].color}`}>
                        {emotionLabels[entry.emotion].name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Intensitas: {entry.intensity}/5</span>
                        <span>•</span>
                        <span>{entry.timestamp.toLocaleString('id-ID')}</span>
                      </div>
                      {entry.note && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{entry.note}"</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-primary mb-2">
            Catat Emosi Anda
          </h3>
          <p className="text-sm text-gray-600">
            Tracking emosi harian membantu memahami pola perasaan Anda
          </p>
        </div>

        {/* Emotion Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Emosi yang dirasakan:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(emotionLabels).map(([emotion, data]) => (
              <button
                key={emotion}
                onClick={() => setSelectedEmotion(emotion as EmotionType)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${selectedEmotion === emotion
                    ? 'border-accent bg-accent/10'
                    : 'border-gray-200 hover:border-accent/50'
                  }
                `}
              >
                <div className="text-2xl mb-1">{data.emoji}</div>
                <div className={`text-xs font-medium ${data.color}`}>
                  {data.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Selection */}
        {selectedEmotion && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Intensitas (1-5):
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setIntensity(level)}
                  className={`
                    w-10 h-10 rounded-full border-2 transition-all
                    ${intensity === level
                      ? 'border-accent bg-accent text-white'
                      : 'border-gray-300 hover:border-accent/50'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Optional Note */}
        {selectedEmotion && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (opsional):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Apa yang memicu perasaan ini?"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleTrackEmotion}
            disabled={!selectedEmotion}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50"
          >
            Catat Emosi
          </Button>
          
          <Button 
            onClick={() => setShowHistory(true)}
            variant="outline"
            className="w-full"
          >
            Lihat Riwayat & Statistik
          </Button>
        </div>

        {/* Today's Summary */}
        {todayEntries.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Hari ini: {todayEntries.length} entri emosi
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};