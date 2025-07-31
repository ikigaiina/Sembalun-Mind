import { useState, useRef } from 'react';
import { Button } from './Button';

export type AmbientSound = 'rain' | 'forest' | 'silence';
export type SessionType = 'mindfulness' | 'breathing' | 'sleep' | 'focus';

interface AudioPlayerProps {
  sessionType: SessionType;
  isActive: boolean;
  onSoundChange?: (sound: AmbientSound) => void;
  className?: string;
}

const ambientSounds = [
  {
    id: 'silence' as AmbientSound,
    name: 'Keheningan',
    icon: '🤫',
    description: 'Suasana tenang tanpa suara latar'
  },
  {
    id: 'rain' as AmbientSound,
    name: 'Hujan',
    icon: '🌧️',
    description: 'Suara rintik hujan yang menenangkan'
  },
  {
    id: 'forest' as AmbientSound,
    name: 'Hutan',
    icon: '🌲',
    description: 'Suara alam dan burung berkicau'
  }
];

const sessionTypeLabels = {
  mindfulness: 'Mindfulness',
  breathing: 'Pernapasan',
  sleep: 'Tidur Nyenyak',
  focus: 'Fokus'
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  sessionType,
  isActive,
  onSoundChange,
  className = ''
}) => {
  const [selectedSound, setSelectedSound] = useState<AmbientSound>('silence');
  const [volume, setVolume] = useState(0.6);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle sound selection
  const handleSoundSelect = (sound: AmbientSound) => {
    setSelectedSound(sound);
    onSoundChange?.(sound);
    
    // TODO: In a real app, you would load actual audio files here
    // For now, we'll just simulate the audio playback
    if (sound !== 'silence') {
      console.log(`Playing ${sound} sounds at volume ${volume}`);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Get current sound info
  const currentSound = ambientSounds.find(sound => sound.id === selectedSound);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-gray-800 text-lg">
              Suasana Audio
            </h3>
            <p className="text-gray-600 font-body text-sm">
              Sesi {sessionTypeLabels[sessionType]}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </Button>
        </div>
      </div>

      {/* Expandable content */}
      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
        <div className="p-4 space-y-6">
          
          {/* Current selection display */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)15' }}
            >
              <span className="text-lg">{currentSound?.icon}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 text-sm">
                {currentSound?.name}
              </h4>
              <p className="text-gray-600 text-xs">
                {currentSound?.description}
              </p>
            </div>
            {selectedSound !== 'silence' && isActive && (
              <div className="flex items-center space-x-1">
                <div 
                  className="w-1 h-1 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <div 
                  className="w-1 h-1 rounded-full animate-pulse"
                  style={{ 
                    backgroundColor: 'var(--color-primary)',
                    animationDelay: '0.2s'
                  }}
                />
                <div 
                  className="w-1 h-1 rounded-full animate-pulse"
                  style={{ 
                    backgroundColor: 'var(--color-primary)',
                    animationDelay: '0.4s'
                  }}
                />
              </div>
            )}
          </div>

          {/* Ambient sound selection */}
          <div>
            <h4 className="font-heading text-gray-700 text-sm mb-3">
              Pilih Suara Latar
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {ambientSounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => handleSoundSelect(sound.id)}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                    hover:bg-gray-50 active:scale-98
                    ${selectedSound === sound.id 
                      ? 'bg-primary bg-opacity-5 border-2' 
                      : 'bg-white border-2 border-transparent'
                    }
                  `}
                  style={{
                    borderColor: selectedSound === sound.id ? 'var(--color-primary)' : 'transparent'
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: selectedSound === sound.id 
                        ? 'var(--color-primary)15' 
                        : 'var(--color-background)' 
                    }}
                  >
                    <span className="text-base">{sound.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800 text-sm">
                      {sound.name}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {sound.description}
                    </div>
                  </div>
                  {selectedSound === sound.id && (
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="var(--color-primary)" 
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Volume control */}
          {selectedSound !== 'silence' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-heading text-gray-700 text-sm">
                  Volume Audio
                </h4>
                <span className="text-xs text-gray-500 font-body">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                </svg>
                
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              </div>
            </div>
          )}

          {/* Audio status */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: isActive ? 'var(--color-primary)' : '#9CA3AF' 
                }}
              />
              <p className="text-xs text-gray-700 font-body">
                {isActive 
                  ? `Audio ${selectedSound === 'silence' ? 'tidak aktif' : 'sedang diputar'}`
                  : 'Audio akan diputar saat sesi dimulai'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Collapsed preview */}
      {!isExpanded && (
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{currentSound?.icon}</span>
              <div>
                <div className="font-medium text-gray-800 text-sm">
                  {currentSound?.name}
                </div>
                {selectedSound !== 'silence' && (
                  <div className="text-xs text-gray-500">
                    Volume {Math.round(volume * 100)}%
                  </div>
                )}
              </div>
            </div>
            
            {selectedSound !== 'silence' && isActive && (
              <div className="flex items-center space-x-1">
                <div 
                  className="w-1 h-1 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <div 
                  className="w-1 h-1 rounded-full animate-pulse"
                  style={{ 
                    backgroundColor: 'var(--color-primary)',
                    animationDelay: '0.2s'
                  }}
                />
                <div 
                  className="w-1 h-1 rounded-full animate-pulse"
                  style={{ 
                    backgroundColor: 'var(--color-primary)',
                    animationDelay: '0.4s'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};