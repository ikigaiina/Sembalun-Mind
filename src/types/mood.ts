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
  mostCommonMood: MoodType;
  moodDistribution: Record<MoodType, number>;
}

interface MoodOption {
  id: MoodType;
  emoji: string;
  label: string;
  color: string;
}

const moodOptions: MoodOption[] = [
  { id: 'very-sad', emoji: '😢', label: 'Sangat sedih', color: '#E53E3E' },
  { id: 'sad', emoji: '😔', label: 'Sedih', color: '#F56565' },
  { id: 'neutral', emoji: '😐', label: 'Biasa saja', color: '#A0AEC0' },
  { id: 'happy', emoji: '😊', label: 'Senang', color: '#48BB78' },
  { id: 'very-happy', emoji: '😄', label: 'Sangat senang', color: '#38A169' },
  { id: 'anxious', emoji: '😰', label: 'Cemas', color: '#ED8936' },
  { id: 'angry', emoji: '😠', label: 'Marah', color: '#E53E3E' },
  { id: 'calm', emoji: '😌', label: 'Tenang', color: '#4299E1' },
  { id: 'excited', emoji: '🤩', label: 'Bersemangat', color: '#9F7AEA' },
  { id: 'tired', emoji: '😴', label: 'Lelah', color: '#718096' }
];

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
  getMoodColor, 
  getMoodEmoji, 
  getMoodLabel 
};