import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { progressService } from '../../services/progressService';
import type { MoodEntry } from '../../types/progress';

interface MoodTrackerProps {
  sessionId?: string;
  onComplete?: (moodEntry: MoodEntry) => void;
  className?: string;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  sessionId,
  onComplete,
  className = ''
}) => {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState<Partial<MoodEntry>>({
    energy: 3,
    stress: 3,
    focus: 3,
    happiness: 3,
    anxiety: 3,
    gratitude: 3,
    notes: '',
    tags: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const moodCategories = [
    {
      key: 'energy' as keyof MoodEntry,
      label: 'Energi',
      icon: '⚡',
      lowLabel: 'Sangat Lelah',
      highLabel: 'Sangat Berenergi',
      color: 'orange'
    },
    {
      key: 'stress' as keyof MoodEntry,
      label: 'Stres',
      icon: '😰',
      lowLabel: 'Sangat Tenang',
      highLabel: 'Sangat Stres',
      color: 'red',
      reverse: true
    },
    {
      key: 'focus' as keyof MoodEntry,
      label: 'Fokus',
      icon: '🎯',
      lowLabel: 'Sangat Buyar',
      highLabel: 'Sangat Fokus',
      color: 'blue'
    },
    {
      key: 'happiness' as keyof MoodEntry,
      label: 'Kebahagiaan',
      icon: '😊',
      lowLabel: 'Sangat Sedih',
      highLabel: 'Sangat Bahagia',
      color: 'yellow'
    },
    {
      key: 'anxiety' as keyof MoodEntry,
      label: 'Kecemasan',
      icon: '😟',
      lowLabel: 'Sangat Tenang',
      highLabel: 'Sangat Cemas',
      color: 'purple',
      reverse: true
    },
    {
      key: 'gratitude' as keyof MoodEntry,
      label: 'Rasa Syukur',
      icon: '🙏',
      lowLabel: 'Tidak Bersyukur',
      highLabel: 'Sangat Bersyukur',
      color: 'green'
    }
  ];

  const commonTags = [
    'Tenang', 'Rileks', 'Damai', 'Fokus', 'Jernih',
    'Bahagia', 'Syukur', 'Positif', 'Optimis', 'Percaya Diri',
    'Lelah', 'Stres', 'Cemas', 'Khawatir', 'Gelisah',
    'Sedih', 'Kesal', 'Marah', 'Frustasi', 'Bingung',
    'Semangat', 'Antusias', 'Termotivasi', 'Inspirasi', 'Kreatif'
  ];

  const handleMoodChange = (category: keyof MoodEntry, value: number) => {
    setCurrentMood(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const moodEntry: Omit<MoodEntry, 'id' | 'syncStatus' | 'lastModified' | 'version'> = {
        userId: user.uid,
        timestamp: new Date(),
        energy: currentMood.energy!,
        stress: currentMood.stress!,
        focus: currentMood.focus!,
        happiness: currentMood.happiness!,
        anxiety: currentMood.anxiety!,
        gratitude: currentMood.gratitude!,
        notes: currentMood.notes || '',
        tags: selectedTags,
        sessionId
      };

      const id = await progressService.createMoodEntry(moodEntry);
      
      if (onComplete) {
        onComplete({ ...moodEntry, id, syncStatus: 'synced', lastModified: new Date(), version: 1 });
      }

      // Reset form
      setCurrentMood({
        energy: 3,
        stress: 3,
        focus: 3,
        happiness: 3,
        anxiety: 3,
        gratitude: 3,
        notes: '',
        tags: []
      });
      setSelectedTags([]);

    } catch (error) {
      console.error('Error saving mood entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodColor = (category: string, value: number, reverse: boolean = false) => {
    const intensity = reverse ? 6 - value : value;
    const colors = {
      orange: ['bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500'],
      red: ['bg-red-100', 'bg-red-200', 'bg-red-300', 'bg-red-400', 'bg-red-500'],
      blue: ['bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500'],
      yellow: ['bg-yellow-100', 'bg-yellow-200', 'bg-yellow-300', 'bg-yellow-400', 'bg-yellow-500'],
      purple: ['bg-purple-100', 'bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500'],
      green: ['bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500']
    };
    return colors[category as keyof typeof colors]?.[intensity - 1] || 'bg-gray-200';
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Bagaimana perasaan Anda saat ini?
        </h3>
        <p className="text-gray-600">
          Catat suasana hati Anda untuk melacak perkembangan kesejahteraan mental
        </p>
      </div>

      {/* Mood Sliders */}
      <div className="space-y-6 mb-6">
        {moodCategories.map((category) => (
          <div key={category.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium text-gray-900">{category.label}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                getMoodColor(category.color, currentMood[category.key] as number, category.reverse)
              }`}>
                {currentMood[category.key] as number}/5
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 w-20 text-left">
                  {category.lowLabel}
                </span>
                <div className="flex-1 flex justify-center">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentMood[category.key] as number}
                    onChange={(e) => handleMoodChange(category.key, parseInt(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${category.color}`}
                  />
                </div>
                <span className="text-xs text-gray-500 w-20 text-right">
                  {category.highLabel}
                </span>
              </div>
              
              {/* Mood level indicators */}
              <div className="flex justify-between text-xs text-gray-400 px-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <span
                    key={num}
                    className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all ${
                      currentMood[category.key] === num
                        ? `border-${category.color}-500 ${getMoodColor(category.color, num, category.reverse)}`
                        : 'border-gray-200 bg-gray-100 hover:border-gray-300'
                    }`}
                    onClick={() => handleMoodChange(category.key, num)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mood Tags */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Tag perasaan (opsional):</h4>
        <div className="flex flex-wrap gap-2">
          {commonTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block font-medium text-gray-900 mb-2">
          Catatan tambahan:
        </label>
        <textarea
          value={currentMood.notes}
          onChange={(e) => setCurrentMood(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Ceritakan lebih detail tentang perasaan Anda saat ini..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Menyimpan...' : '💾 Simpan Mood'}
      </Button>

      <style>{`
        .slider-orange::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
        }
        .slider-red::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
        }
        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider-yellow::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #eab308;
          cursor: pointer;
        }
        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
        }
        .slider-green::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};