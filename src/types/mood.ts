// Shared mood types for the application - Expanded with richer emotional variety
type MoodType = 
  // Primary emotions
  | 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy'
  // Secondary emotions - Anxious family
  | 'anxious' | 'worried' | 'nervous' | 'stressed' | 'overwhelmed'
  // Secondary emotions - Angry family  
  | 'angry' | 'frustrated' | 'irritated' | 'annoyed' | 'furious'
  // Secondary emotions - Calm family
  | 'calm' | 'peaceful' | 'relaxed' | 'serene' | 'content'
  // Secondary emotions - Excited family
  | 'excited' | 'enthusiastic' | 'energetic' | 'motivated' | 'inspired'
  // Secondary emotions - Tired family
  | 'tired' | 'exhausted' | 'drained' | 'sleepy' | 'weary'
  // Complex emotions
  | 'confused' | 'lonely' | 'grateful' | 'hopeful' | 'disappointed'
  | 'proud' | 'embarrassed' | 'curious' | 'bored' | 'surprised'
  | 'loved' | 'confident' | 'insecure' | 'nostalgic' | 'optimistic';

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

// Extended moods for detailed tracking - Significantly enriched variety
const extendedMoods: MoodOption[] = [
  // Anxious family - emotional depth around anxiety
  { id: 'anxious', emoji: '😰', label: 'Cemas', color: '#F59E0B' },
  { id: 'worried', emoji: '😟', label: 'Khawatir', color: '#EAB308' },
  { id: 'nervous', emoji: '😬', label: 'Gugup', color: '#F97316' },
  { id: 'stressed', emoji: '😵', label: 'Stres', color: '#DC2626' },
  { id: 'overwhelmed', emoji: '🤯', label: 'Kewalahan', color: '#B91C1C' },
  
  // Angry family - various intensities of anger
  { id: 'angry', emoji: '😠', label: 'Marah', color: '#DC2626' },
  { id: 'frustrated', emoji: '😤', label: 'Frustasi', color: '#EF4444' },
  { id: 'irritated', emoji: '😒', label: 'Kesal', color: '#F97316' },
  { id: 'annoyed', emoji: '🙄', label: 'Jengkel', color: '#EA580C' },
  { id: 'furious', emoji: '😡', label: 'Murka', color: '#991B1B' },
  
  // Calm family - peaceful emotions
  { id: 'calm', emoji: '😌', label: 'Tenang', color: '#06B6D4' },
  { id: 'peaceful', emoji: '😇', label: 'Damai', color: '#0891B2' },
  { id: 'relaxed', emoji: '😎', label: 'Santai', color: '#0284C7' },
  { id: 'serene', emoji: '🧘', label: 'Khusyuk', color: '#0369A1' },
  { id: 'content', emoji: '😊', label: 'Puas', color: '#10B981' },
  
  // Excited family - high energy emotions
  { id: 'excited', emoji: '🤩', label: 'Bersemangat', color: '#8B5CF6' },
  { id: 'enthusiastic', emoji: '😍', label: 'Antusias', color: '#7C3AED' },
  { id: 'energetic', emoji: '⚡', label: 'Berenergi', color: '#6366F1' },
  { id: 'motivated', emoji: '💪', label: 'Termotivasi', color: '#4F46E5' },
  { id: 'inspired', emoji: '✨', label: 'Terinspirasi', color: '#7C2D12' },
  
  // Tired family - low energy states
  { id: 'tired', emoji: '😴', label: 'Lelah', color: '#6B7280' },
  { id: 'exhausted', emoji: '😵‍💫', label: 'Sangat lelah', color: '#4B5563' },
  { id: 'drained', emoji: '🫠', label: 'Terkuras', color: '#374151' },
  { id: 'sleepy', emoji: '🥱', label: 'Mengantuk', color: '#9CA3AF' },
  { id: 'weary', emoji: '😪', label: 'Letih', color: '#6B7280' },
  
  // Complex emotions - nuanced feelings
  { id: 'confused', emoji: '😕', label: 'Bingung', color: '#8B5A3C' },
  { id: 'lonely', emoji: '😞', label: 'Kesepian', color: '#7C2D12' },
  { id: 'grateful', emoji: '🙏', label: 'Bersyukur', color: '#059669' },
  { id: 'hopeful', emoji: '🌟', label: 'Penuh harap', color: '#0D9488' },
  { id: 'disappointed', emoji: '😮‍💨', label: 'Kecewa', color: '#7C2D12' },
  
  // Positive complex emotions
  { id: 'proud', emoji: '🥹', label: 'Bangga', color: '#7C2D12' },
  { id: 'embarrassed', emoji: '😳', label: 'Malu', color: '#F472B6' },
  { id: 'curious', emoji: '🤔', label: 'Penasaran', color: '#8B5CF6' },
  { id: 'bored', emoji: '😑', label: 'Bosan', color: '#9CA3AF' },
  { id: 'surprised', emoji: '😲', label: 'Terkejut', color: '#F59E0B' },
  
  // Social & self-awareness emotions
  { id: 'loved', emoji: '🥰', label: 'Merasa dicintai', color: '#EC4899' },
  { id: 'confident', emoji: '😏', label: 'Percaya diri', color: '#7C2D12' },
  { id: 'insecure', emoji: '😓', label: 'Tidak percaya diri', color: '#6B7280' },
  { id: 'nostalgic', emoji: '🥺', label: 'Nostalgia', color: '#A855F7' },
  { id: 'optimistic', emoji: '😌', label: 'Optimis', color: '#059669' }
];

// All mood options combined
const moodOptions: MoodOption[] = [...primaryMoods, ...extendedMoods];

const getMoodColor = (mood: MoodType): string => {
  const moodOption = moodOptions.find(option => option.id === mood);
  return moodOption?.color || '#6B7280'; // Default to neutral gray
};

// Get mood category for better organization
const getMoodCategory = (mood: MoodType): string => {
  const categories = {
    // Primary emotions
    primary: ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'],
    // Anxiety-based emotions
    anxious: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed'],
    // Anger-based emotions  
    angry: ['angry', 'frustrated', 'irritated', 'annoyed', 'furious'],
    // Calm-based emotions
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'content'],
    // High-energy emotions
    energetic: ['excited', 'enthusiastic', 'energetic', 'motivated', 'inspired'],
    // Low-energy emotions
    tired: ['tired', 'exhausted', 'drained', 'sleepy', 'weary'],
    // Complex emotions
    complex: ['confused', 'lonely', 'grateful', 'hopeful', 'disappointed', 'proud', 'embarrassed', 'curious', 'bored', 'surprised', 'loved', 'confident', 'insecure', 'nostalgic', 'optimistic']
  };
  
  for (const [category, moods] of Object.entries(categories)) {
    if (moods.includes(mood as any)) {
      return category;
    }
  }
  return 'unknown';
};

// Get related moods for better UX recommendations
const getRelatedMoods = (mood: MoodType): MoodType[] => {
  const category = getMoodCategory(mood);
  
  switch (category) {
    case 'anxious':
      return ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed'];
    case 'angry':
      return ['angry', 'frustrated', 'irritated', 'annoyed', 'furious'];
    case 'calm':
      return ['calm', 'peaceful', 'relaxed', 'serene', 'content'];
    case 'energetic':
      return ['excited', 'enthusiastic', 'energetic', 'motivated', 'inspired'];
    case 'tired':
      return ['tired', 'exhausted', 'drained', 'sleepy', 'weary'];
    default:
      return [mood]; // Return the mood itself if no category found
  }
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
  getMoodLabel,
  getMoodCategory,
  getRelatedMoods
};