import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { SembalunBackground } from '../../components/ui/SembalunBackground';

export type PersonalizationGoal = 'stress' | 'focus' | 'sleep' | 'curious';

interface GoalOption {
  id: PersonalizationGoal;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface PersonalizationScreenProps {
  onComplete: (goal: PersonalizationGoal) => void;
  onSkip: () => void;
}

const goalOptions: GoalOption[] = [
  {
    id: 'stress',
    title: 'Mengelola Stres',
    description: 'Temukan ketenangan di tengah tekanan hidup sehari-hari',
    icon: '🌱',
    color: 'var(--color-primary)'
  },
  {
    id: 'focus',
    title: 'Meningkatkan Fokus',
    description: 'Latih perhatian dan konsentrasi untuk produktivitas yang lebih baik',
    icon: '🎯',
    color: 'var(--color-accent)'
  },
  {
    id: 'sleep',
    title: 'Tidur Lebih Baik',
    description: 'Ciptakan ritual malam yang menenangkan untuk istirahat berkualitas',
    icon: '🌙',
    color: 'var(--color-warm)'
  },
  {
    id: 'curious',
    title: 'Hanya Ingin Tahu',
    description: 'Jelajahi dunia meditasi dan mindfulness dengan pikiran terbuka',
    icon: '✨',
    color: '#8B5CF6'
  }
];

export const PersonalizationScreen: React.FC<PersonalizationScreenProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const [selectedGoal, setSelectedGoal] = useState<PersonalizationGoal | null>(null);
  const [hoveredGoal, setHoveredGoal] = useState<PersonalizationGoal | null>(null);

  const handleGoalSelect = (goal: PersonalizationGoal) => {
    setSelectedGoal(goal);
    // Auto-advance after selection with a small delay for visual feedback
    setTimeout(() => {
      onComplete(goal);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Sembalun Background */}
      <SembalunBackground 
        variant="default" 
        intensity="subtle" 
        animated={true}
        className="fixed inset-0 z-0"
      />
      
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Skip button - fixed position top-right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onSkip}
          className="text-gray-500 font-body text-sm hover:text-gray-700 transition-colors duration-200 px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm"
        >
          Lewati
        </button>
      </div>

      {/* Header */}
      <div className="p-6 pt-16">
        <div className="max-w-sm mx-auto text-center">
          <h1 className="text-2xl font-heading text-gray-800 mb-4">
            Apa yang membawamu ke Sembalun?
          </h1>
          <p className="text-gray-600 font-body text-sm leading-relaxed">
            Pilih tujuan utamamu agar kami dapat memberikan pengalaman yang lebih personal
          </p>
        </div>
      </div>

      {/* Goals */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto space-y-4">
          {goalOptions.map((goal) => {
            const isSelected = selectedGoal === goal.id;
            const isHovered = hoveredGoal === goal.id;
            
            return (
              <Card 
                key={goal.id}
                className={`
                  cursor-pointer transition-all duration-300 transform-gpu
                  ${isSelected 
                    ? 'scale-105 shadow-xl ring-2 ring-primary ring-opacity-30' 
                    : isHovered 
                    ? 'scale-102 shadow-lg' 
                    : 'hover:scale-102 hover:shadow-lg'
                  }
                `}
                padding="medium"
                onClick={() => handleGoalSelect(goal.id)}
                onMouseEnter={() => setHoveredGoal(goal.id)}
                onMouseLeave={() => setHoveredGoal(null)}
                style={{
                  backgroundColor: isSelected 
                    ? `${goal.color}08` 
                    : 'rgba(255, 255, 255, 0.8)'
                }}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                    transition-all duration-300
                    ${isSelected ? 'scale-110' : ''}
                  `}
                  style={{
                    backgroundColor: `${goal.color}15`,
                    color: goal.color
                  }}>
                    <span className="text-2xl">{goal.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-heading text-gray-800 mb-2 transition-colors duration-300
                      ${isSelected ? 'font-semibold' : 'font-medium'}
                    `}>
                      {goal.title}
                    </h3>
                    <p className="text-gray-600 font-body text-sm leading-relaxed">
                      {goal.description}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div className={`
                    flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300
                    flex items-center justify-center
                    ${isSelected 
                      ? 'border-transparent scale-110' 
                      : 'border-gray-300'
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? goal.color : 'transparent'
                  }}>
                    {isSelected && (
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="white"
                        className="animate-fade-in"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    )}
                  </div>
                </div>

                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                  <div className={`
                    absolute inset-0 transition-opacity duration-300
                    ${isSelected ? 'opacity-10' : 'opacity-0'}
                  `}
                  style={{
                    background: `radial-gradient(circle at center, ${goal.color} 0%, transparent 70%)`
                  }} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="p-6 pb-12">
        <div className="max-w-sm mx-auto text-center">
          <p className="text-gray-500 font-body text-xs">
            Jangan khawatir, kamu bisa mengubah pilihan ini nanti di pengaturan
          </p>
        </div>
      </div>

      {/* Loading overlay for selected state */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-xs w-full shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${goalOptions.find(g => g.id === selectedGoal)?.color}15` }}>
                <span className="text-2xl">
                  {goalOptions.find(g => g.id === selectedGoal)?.icon}
                </span>
              </div>
              <p className="font-body text-gray-700 text-sm">
                Menyiapkan pengalaman untuk{' '}
                <span className="font-medium">
                  {goalOptions.find(g => g.id === selectedGoal)?.title.toLowerCase()}
                </span>
              </p>
              <div className="flex justify-center mt-4 space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      backgroundColor: goalOptions.find(g => g.id === selectedGoal)?.color,
                      animationDelay: `${i * 0.2}s`,
                      opacity: 0.6
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};