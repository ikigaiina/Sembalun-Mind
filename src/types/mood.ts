// Shared mood types for the application
type MoodType = 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy' | 'anxious' | 'angry' | 'calm' | 'excited' | 'tired';

interface MoodEntry {
  id: string;
  mood: MoodType;
  timestamp: Date;
  note?: string;
  tags?: string[];
}

interface MoodStats {
  totalEntries: number;
  averageMood: number;
  streakDays: number;
  mostCommonMood?: MoodType;
  moodDistribution: Record<MoodType, number>;
  weeklyAverage: number[];
}

interface MoodOption {
  id: MoodType;
  emoji: string;
  label: string;
  color: string;
}

// Main 5 moods for primary selection
const primaryMoods: MoodOption[] = [
  { id: 'very-sad', emoji: '😭', label: 'Sangat sedih', color: '#DC2626' },
  { id: 'sad', emoji: '😔', label: 'Sedih', color: '#F59E0B' },
  { id: 'neutral', emoji: '😐', label: 'Biasa saja', color: '#6B7280' },
  { id: 'happy', emoji: '😊', label: 'Senang', color: '#10B981' },
  { id: 'very-happy', emoji: '😄', label: 'Sangat senang', color: '#059669' }
];

// Extended moods for detailed tracking
const extendedMoods: MoodOption[] = [
  { id: 'anxious', emoji: '😰', label: 'Cemas', color: '#F59E0B' },
  { id: 'angry', emoji: '😠', label: 'Marah', color: '#DC2626' },
  { id: 'calm', emoji: '😌', label: 'Tenang', color: '#06B6D4' },
  { id: 'excited', emoji: '🤩', label: 'Bersemangat', color: '#8B5CF6' },
  { id: 'tired', emoji: '😴', label: 'Lelah', color: '#6B7280' }
];

// All mood options combined
const moodOptions: MoodOption[] = [...primaryMoods, ...extendedMoods];

const getMoodColor = (mood: MoodType): string => {
  const moodOption = moodOptions.find(option => option.id === mood);
  return moodOption?.color || '#A0AEC0';
};

const getMoodEmoji = (mood: MoodType): string => {
  const moodOption = moodOptions.find(option => option.id === mood);
  return moodOption?.emoji || '😐';
};

const getMoodLabel = (mood: MoodType): string => {
  const moodOption = moodOptions.find(option => option.id === mood);
  return moodOption?.label || 'Tidak diketahui';
};

export type { 
  MoodType,
  MoodEntry, 
  MoodStats, 
  MoodOption
};

export { 
  moodOptions,
  primaryMoods,
  extendedMoods,
  getMoodColor, 
  getMoodEmoji, 
  getMoodLabel 
};