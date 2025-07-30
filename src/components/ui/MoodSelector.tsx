import { useState } from 'react';

export type MoodType = 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy';

interface MoodOption {
  id: MoodType;
  emoji: string;
  label: string;
  color: string;
}

interface MoodSelectorProps {
  selectedMood?: MoodType;
  onMoodSelect: (mood: MoodType) => void;
  label?: string;
  className?: string;
}

const moodOptions: MoodOption[] = [
  { id: 'very-sad', emoji: '😢', label: 'Sangat sedih', color: '#E53E3E' },
  { id: 'sad', emoji: '😔', label: 'Sedih', color: '#F56565' },
  { id: 'neutral', emoji: '😐', label: 'Biasa saja', color: '#A0AEC0' },
  { id: 'happy', emoji: '😊', label: 'Senang', color: '#48BB78' },
  { id: 'very-happy', emoji: '😄', label: 'Sangat senang', color: '#38A169' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  label = 'Bagaimana perasaan Anda hari ini?',
  className = ''
}) => {
  const [hoveredMood, setHoveredMood] = useState<MoodType | null>(null);

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <h3 className="text-sm font-medium text-gray-700 text-center">{label}</h3>
      )}
      
      <div className="flex justify-between items-center gap-2">
        {moodOptions.map((mood) => {
          const isSelected = selectedMood === mood.id;
          const isHovered = hoveredMood === mood.id;
          
          return (
            <button
              key={mood.id}
              onClick={() => onMoodSelect(mood.id)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              className="group relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: isSelected ? `${mood.color}15` : 'transparent',
                transform: isSelected ? 'scale(1.1)' : isHovered ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {/* Mood emoji */}
              <div 
                className="text-2xl mb-1 transition-all duration-300"
                style={{
                  filter: isSelected || isHovered ? 'brightness(1.1)' : 'brightness(0.8)',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {mood.emoji}
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div 
                  className="absolute -bottom-1 w-6 h-0.5 rounded-full transition-all duration-300"
                  style={{ backgroundColor: mood.color }}
                />
              )}
              
              {/* Hover label */}
              {isHovered && !isSelected && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 animate-fade-in">
                  {mood.label}
                  <div 
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"
                  />
                </div>
              )}
              
              {/* Ripple effect on click */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-active:opacity-20 group-active:bg-current transition-opacity duration-150" />
            </button>
          );
        })}
      </div>
      
      {/* Selected mood label */}
      {selectedMood && (
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Anda merasa{' '}
            <span 
              className="font-medium"
              style={{ color: moodOptions.find(m => m.id === selectedMood)?.color }}
            >
              {moodOptions.find(m => m.id === selectedMood)?.label.toLowerCase()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};