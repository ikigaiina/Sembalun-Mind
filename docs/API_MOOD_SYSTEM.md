# 🎭 Mood System API Documentation

## Overview

The Sembalun Mind mood system provides a comprehensive API for tracking, managing, and analyzing emotional states. This system supports 40+ mood types across 7 intelligent categories with advanced accessibility features and cultural context integration.

## 📊 Mood Type System

### TypeScript Interface

```typescript
type MoodType = 
  // Primary emotions (5)
  | 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy'
  // Anxious family (5)
  | 'anxious' | 'worried' | 'nervous' | 'stressed' | 'overwhelmed'
  // Angry family (5)  
  | 'angry' | 'frustrated' | 'irritated' | 'annoyed' | 'furious'
  // Calm family (5)
  | 'calm' | 'peaceful' | 'relaxed' | 'serene' | 'content'
  // Energetic family (5)
  | 'excited' | 'enthusiastic' | 'energetic' | 'motivated' | 'inspired'
  // Tired family (5)
  | 'tired' | 'exhausted' | 'drained' | 'sleepy' | 'weary'
  // Complex emotions (15)
  | 'confused' | 'lonely' | 'grateful' | 'hopeful' | 'disappointed'
  | 'proud' | 'embarrassed' | 'curious' | 'bored' | 'surprised'
  | 'loved' | 'confident' | 'insecure' | 'nostalgic' | 'optimistic';

interface MoodOption {
  id: MoodType;
  emoji: string;
  label: string;
  color: string;
}

interface MoodEntry {
  id: string;
  mood: MoodType;
  timestamp: Date;
  note?: string;
  tags?: string[];
}
```

## 🎯 Core API Functions

### Mood Utilities

#### `getMoodColor(mood: MoodType): string`
Returns the associated color for a given mood type.

```typescript
const color = getMoodColor('happy'); // Returns: '#065F46'
```

#### `getMoodEmoji(mood: MoodType): string`
Returns the emoji representation for a mood type.

```typescript
const emoji = getMoodEmoji('excited'); // Returns: '🤩'
```

#### `getMoodLabel(mood: MoodType): string`
Returns the human-readable label for a mood type.

```typescript
const label = getMoodLabel('anxious'); // Returns: 'Cemas'
```

#### `getMoodCategory(mood: MoodType): string`
Returns the category classification for a mood type.

```typescript
const category = getMoodCategory('frustrated'); // Returns: 'angry'
```

#### `getRelatedMoods(mood: MoodType): MoodType[]`
Returns related moods within the same category.

```typescript
const related = getRelatedMoods('happy'); 
// Returns: ['very-sad', 'sad', 'neutral', 'happy', 'very-happy']
```

## 🎨 Accessibility Color System

### WCAG 2.1 AA Compliant Colors

```typescript
interface AccessibleMoodColors {
  primary: string;      // 7:1+ contrast ratio
  background: string;   // Subtle background with opacity
  border: string;       // Border color with proper contrast
  hover: string;        // Hover state color
  selected: string;     // Selected state color
}

const ACCESSIBLE_MOOD_COLORS: Record<MoodType, AccessibleMoodColors> = {
  'very-sad': {
    primary: '#1E3A8A',      // Blue 800 - 7.04:1 contrast
    background: 'rgba(30, 58, 138, 0.08)',
    border: 'rgba(30, 58, 138, 0.24)',
    hover: 'rgba(30, 58, 138, 0.12)',
    selected: 'rgba(30, 58, 138, 0.16)',
  },
  'happy': {
    primary: '#065F46',      // Emerald 800 - 7.11:1 contrast
    background: 'rgba(6, 95, 70, 0.08)',
    border: 'rgba(6, 95, 70, 0.24)',
    hover: 'rgba(6, 95, 70, 0.12)',
    selected: 'rgba(6, 95, 70, 0.16)',
  }
  // ... additional colors for all mood types
};
```

## 🕒 Time-Based System

### Indonesian Time Periods

```typescript
const TIME_PERIODS = {
  morning: { 
    start: 5, 
    end: 11, 
    label: 'Pagi', 
    icon: '🌅', 
    description: 'Suasana hati pagi hari' 
  },
  afternoon: { 
    start: 12, 
    end: 17, 
    label: 'Sore', 
    icon: '☀️', 
    description: 'Suasana hati sore hari' 
  },
  evening: { 
    start: 18, 
    end: 23, 
    label: 'Malam', 
    icon: '🌙', 
    description: 'Suasana hati malam hari' 
  }
} as const;

type TimePeriod = keyof typeof TIME_PERIODS;
```

### Time Validation Functions

#### `getCurrentTimePeriod(): TimePeriod | null`
Returns the current time period or null if outside allowed times.

```typescript
const period = getCurrentTimePeriod(); 
// Returns: 'morning' | 'afternoon' | 'evening' | null
```

#### `getNextAllowedTime(): string`
Returns formatted string for next allowed check-in time.

```typescript
const nextTime = getNextAllowedTime(); 
// Returns: "Besok 05:00 (Pagi)" or "12:00 (Sore)"
```

## 📱 Modal Component API

### MoodSelectionModal Props

```typescript
interface MoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodSelect: (mood: MoodType, journalNote?: string) => void;
  currentMood?: MoodType | null;
}
```

### Usage Example

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

const handleMoodSelect = (mood: MoodType, journalNote?: string) => {
  setSelectedMood(mood);
  updateMoodPattern(mood, 'modal_selection');
  
  if (journalNote) {
    // Save journal entry with mood context
    saveJournalEntry({
      mood,
      content: journalNote,
      timestamp: new Date()
    });
  }
  
  setIsModalOpen(false);
};

return (
  <MoodSelectionModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onMoodSelect={handleMoodSelect}
    currentMood={selectedMood}
  />
);
```

## 🎯 Progressive Disclosure Logic

### Smart Mood Refinement

The system uses intelligent categorization to show related moods based on primary selection:

```typescript
// Example: Primary mood selection triggers context-aware refinement
const getContextualMoods = (primaryMood: MoodType): MoodType[] => {
  const category = getMoodCategory(primaryMood);
  
  switch (category) {
    case 'primary':
      if (primaryMood === 'happy' || primaryMood === 'very-happy') {
        return ['excited', 'enthusiastic', 'grateful', 'content', 'hopeful', 
                'proud', 'confident', 'optimistic', 'loved'];
      } else if (primaryMood === 'sad' || primaryMood === 'very-sad') {
        return ['anxious', 'worried', 'lonely', 'disappointed', 'tired', 
                'exhausted', 'confused', 'insecure'];
      }
      return ['confused', 'tired', 'bored', 'curious', 'calm', 'content'];
      
    default:
      return getRelatedMoods(primaryMood);
  }
};
```

## 📝 Journal Integration API

### Comprehensive Journaling Service

```typescript
interface JournalEntry {
  type: 'reflection' | 'gratitude' | 'goals' | 'experiences';
  title: string;
  content: string;
  mood?: {
    primary: MoodType;
    intensity: number;
    context: string;
  };
  tags: string[];
  language: 'id' | 'en';
  privacy: 'private' | 'shared';
  timestamp: Date;
}

class ComprehensiveJournalingService {
  static async saveEntry(entry: JournalEntry): Promise<{error: any}> {
    // Implementation for saving journal entries with mood context
  }
  
  static async getEntriesWithMood(mood: MoodType): Promise<JournalEntry[]> {
    // Get all entries associated with specific mood
  }
  
  static async analyzeMoodPatterns(): Promise<MoodAnalysis> {
    // Analyze mood trends and patterns over time
  }
}
```

## 📊 Analytics & Insights API

### Mood Statistics

```typescript
interface MoodStats {
  totalEntries: number;
  averageMood: number;
  streakDays: number;
  mostCommonMood?: MoodType;
  moodDistribution: Record<MoodType, number>;
  weeklyAverage: number[];
  categoryBreakdown: Record<string, number>;
  timePatternAnalysis: {
    morning: Record<MoodType, number>;
    afternoon: Record<MoodType, number>;
    evening: Record<MoodType, number>;
  };
}

interface MoodAnalysis {
  trends: {
    improving: boolean;
    stable: boolean;
    concerning: boolean;
  };
  insights: string[];
  recommendations: string[];
  culturalContext: {
    timePeriodPreferences: Record<TimePeriod, number>;
    journalCorrelation: number;
  };
}
```

## 🎨 Responsive Design API

### Breakpoint System

```typescript
const RESPONSIVE_BREAKPOINTS = {
  modal: {
    base: 'w-full max-w-sm mx-2',      // Mobile: 320px+
    sm: 'sm:mx-4 sm:max-w-md',         // Small: 384px
    md: 'md:max-w-lg',                 // Medium: 448px
  },
  moodGrid: {
    base: 'grid-cols-2 gap-2',         // Mobile: 2 columns
    sm: 'sm:grid-cols-3 sm:gap-3',     // Small+: 3 columns
    extended: 'grid-cols-2 sm:grid-cols-4', // Extended view
  },
  touchTargets: {
    primary: 'min-h-[60px] min-w-[60px]',   // Primary moods
    extended: 'min-h-[50px] min-w-[50px]',  // Extended moods
    buttons: 'min-h-[44px]',                // Action buttons
  }
};
```

## 🔧 Animation System API

### Motion Configuration

```typescript
const ANIMATIONS = {
  modal: {
    initial: { opacity: 0, scale: 0.96, y: 16 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 16 },
    transition: { 
      type: "spring", 
      duration: 0.4, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    }
  },
  moodButton: {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 30 
    }
  },
  selectedMood: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3 }
    }
  }
};
```

## 🛠️ Customization API

### Theme Integration

```typescript
interface MoodThemeCustomization {
  colorOverrides?: Partial<Record<MoodType, AccessibleMoodColors>>;
  sizeVariants?: {
    compact: boolean;
    touchOptimized: boolean;
  };
  culturalAdaptation?: {
    timeFormat: '12h' | '24h';
    language: 'id' | 'en';
    regionalPreferences: 'javanese' | 'balinese' | 'sundanese' | 'minangkabau';
  };
  accessibilityEnhanced?: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReaderOptimized: boolean;
  };
}

// Usage
const customTheme: MoodThemeCustomization = {
  sizeVariants: { compact: true, touchOptimized: true },
  culturalAdaptation: { 
    language: 'id', 
    regionalPreferences: 'javanese' 
  },
  accessibilityEnhanced: { 
    highContrast: true, 
    reducedMotion: false,
    screenReaderOptimized: true 
  }
};
```

## 🔗 Integration Examples

### React Hook Integration

```typescript
// Custom hook for mood management
const useMoodTracker = () => {
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  
  const logMood = useCallback(async (
    mood: MoodType, 
    note?: string
  ): Promise<{error: any}> => {
    const entry: MoodEntry = {
      id: generateId(),
      mood,
      timestamp: new Date(),
      note,
      tags: [getCurrentTimePeriod()?.toLowerCase() || 'general']
    };
    
    setCurrentMood(mood);
    setMoodHistory(prev => [entry, ...prev]);
    
    // Persist to storage
    return await saveMoodEntry(entry);
  }, []);
  
  const getMoodStats = useCallback((): MoodStats => {
    // Calculate statistics from mood history
    return calculateMoodStats(moodHistory);
  }, [moodHistory]);
  
  return {
    currentMood,
    moodHistory,
    logMood,
    getMoodStats,
    isAllowedTime: getCurrentTimePeriod() !== null
  };
};
```

### Supabase Integration

```typescript
// Database service for mood persistence
class MoodDatabaseService {
  static async saveMoodEntry(
    userId: string, 
    entry: MoodEntry
  ): Promise<{data?: any, error?: any}> {
    const { data, error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: userId,
        mood_type: entry.mood,
        notes: entry.note,
        tags: entry.tags,
        created_at: entry.timestamp.toISOString()
      });
      
    return { data, error };
  }
  
  static async getMoodHistory(
    userId: string,
    limit: number = 50
  ): Promise<{data?: MoodEntry[], error?: any}> {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    return { data, error };
  }
}
```

## 📋 Best Practices

### Implementation Guidelines

1. **Accessibility First**
   - Always use WCAG 2.1 AA compliant colors
   - Implement proper ARIA labels and roles
   - Ensure keyboard navigation support
   - Maintain minimum 44px touch targets

2. **Performance Optimization**
   - Lazy load extended mood options
   - Use React.memo for mood button components
   - Implement virtual scrolling for large mood lists
   - Cache mood statistics calculations

3. **Cultural Sensitivity**
   - Respect Indonesian time-based practices
   - Use appropriate cultural contexts in labels
   - Support both Indonesian and English languages
   - Consider regional variations in emotional expression

4. **Data Privacy**
   - Encrypt sensitive mood and journal data
   - Implement proper user consent mechanisms
   - Provide data export capabilities
   - Allow users to delete their mood history

5. **User Experience**
   - Provide immediate visual feedback on selection
   - Use progressive disclosure to avoid overwhelming users
   - Implement smart defaults based on user patterns
   - Offer contextual help and guidance

## 🔮 Future API Extensions

### Planned Enhancements

- **Voice Integration**: Voice-to-mood recognition API
- **Biometric Integration**: Heart rate and stress level correlation
- **Social Features**: Mood sharing with family/friends
- **AI Insights**: Predictive mood analysis and recommendations
- **Wearable Integration**: Smart watch and fitness tracker support

This API documentation provides comprehensive coverage of the mood system architecture, ensuring developers can effectively integrate and extend the mood tracking capabilities while maintaining accessibility, cultural authenticity, and user experience excellence.