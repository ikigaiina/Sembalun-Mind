import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface SessionControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  playbackSpeed: number;
  showBreathingGuide: boolean;
  ambientSoundEnabled: boolean;
  currentAmbientSound?: string;
  availableAmbientSounds?: { id: string; name: string; icon: string }[];
  onPlayPause: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;
  onBreathingGuideToggle: (enabled: boolean) => void;
  onAmbientSoundToggle: (enabled: boolean) => void;
  onAmbientSoundChange: (soundId: string) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  className?: string;
}

/**
 * Comprehensive meditation session controls
 * 
 * Features:
 * - Play/pause/stop controls
 * - Volume and speed adjustment
 * - Ambient sound selection
 * - Breathing guide toggle
 * - Skip forward/backward
 * - Keyboard shortcuts
 * - Accessibility support
 * - Visual feedback
 */
export const SessionControls: React.FC<SessionControlsProps> = ({
  isPlaying,
  isLoading,
  volume,
  playbackSpeed,
  showBreathingGuide,
  ambientSoundEnabled,
  currentAmbientSound,
  availableAmbientSounds = [
    { id: 'rain', name: 'Hujan', icon: '🌧️' },
    { id: 'ocean', name: 'Ombak Laut', icon: '🌊' },
    { id: 'forest', name: 'Hutan', icon: '🌲' },
    { id: 'birds', name: 'Kicau Burung', icon: '🐦' },
    { id: 'wind', name: 'Angin', icon: '💨' }
  ],
  onPlayPause,
  onStop,
  onVolumeChange,
  onSpeedChange,
  onBreathingGuideToggle,
  onAmbientSoundToggle,
  onAmbientSoundChange,
  onSkipForward,
  onSkipBackward,
  className = ''
}) => {
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [showAmbientPanel, setShowAmbientPanel] = useState(false);

  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1.0, label: '1.0x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2.0x' }
  ];

  // Handle keyboard shortcuts
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case ' ':
        event.preventDefault();
        onPlayPause();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onSkipBackward();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onSkipForward();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onVolumeChange(Math.min(1, volume + 0.1));
        break;
      case 'ArrowDown':
        event.preventDefault();
        onVolumeChange(Math.max(0, volume - 0.1));
        break;
      case 'Escape':
        event.preventDefault();
        onStop();
        break;
    }
  };

  return (
    <Card 
      className={`session-controls ${className}`} 
      padding="medium"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Primary Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {/* Skip Backward */}
        <button
          onClick={onSkipBackward}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Mundur 10 detik"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        {/* Play/Pause Button */}
        <Button
          onClick={onPlayPause}
          disabled={isLoading}
          className="w-14 h-14 rounded-full flex items-center justify-center"
          aria-label={isPlaying ? "Jeda sesi" : "Mulai sesi"}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a2 2 0 012 2v.586a1 1 0 01-.293.707L12 21l-4.707-4.707A1 1 0 017 15.586V15a2 2 0 012-2h1.586a1 1 0 00.707-.293L13.707 10.293A1 1 0 0114.414 10H16" />
            </svg>
          )}
        </Button>

        {/* Skip Forward */}
        <button
          onClick={onSkipForward}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Maju 10 detik"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>

        {/* Stop Button */}
        <button
          onClick={onStop}
          className="p-3 rounded-full bg-red-100 hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Hentikan sesi"
        >
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
          </svg>
        </button>
      </div>

      {/* Quick Toggles */}
      <div className="flex items-center justify-center space-x-6 mb-4">
        {/* Breathing Guide Toggle */}
        <button
          onClick={() => onBreathingGuideToggle(!showBreathingGuide)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
            showBreathingGuide 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          aria-pressed={showBreathingGuide}
        >
          <span className="text-sm">💨</span>
          <span className="text-sm font-medium">Panduan Napas</span>
        </button>

        {/* Ambient Sound Toggle */}
        <button
          onClick={() => {
            onAmbientSoundToggle(!ambientSoundEnabled);
            if (!ambientSoundEnabled) setShowAmbientPanel(true);
          }}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
            ambientSoundEnabled 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          aria-pressed={ambientSoundEnabled}
        >
          <span className="text-sm">🎵</span>
          <span className="text-sm font-medium">Suara Ambient</span>
        </button>

        {/* Advanced Controls Toggle */}
        <button
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-expanded={showAdvancedControls}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">Lanjutan</span>
        </button>
      </div>

      {/* Ambient Sound Panel */}
      {showAmbientPanel && ambientSoundEnabled && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Pilih Suara Ambient</h4>
            <button
              onClick={() => setShowAmbientPanel(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Tutup panel suara ambient"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {availableAmbientSounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => onAmbientSoundChange(sound.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  currentAmbientSound === sound.id
                    ? 'bg-primary text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                aria-pressed={currentAmbientSound === sound.id}
              >
                <span className="text-lg mb-1">{sound.icon}</span>
                <span className="text-xs font-medium text-center">{sound.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Controls */}
      {showAdvancedControls && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          {/* Volume Control */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Volume</span>
              <span className="text-sm text-gray-500">{Math.round(volume * 100)}%</span>
            </label>
            <div className="flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M12 6l-4 4H6a2 2 0 00-2 2v0a2 2 0 002 2h2l4 4v-12z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Kontrol volume"
              />
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6 8l4 4V6l-4 4z" />
              </svg>
            </div>
          </div>

          {/* Playback Speed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kecepatan Putar
            </label>
            <div className="flex space-x-2">
              {speedOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSpeedChange(option.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    playbackSpeed === option.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  aria-pressed={playbackSpeed === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        <p className="mb-1">Pintasan Keyboard:</p>
        <div className="flex justify-center space-x-4 flex-wrap">
          <span>Spasi: Play/Pause</span>
          <span>←/→: Skip</span>
          <span>↑/↓: Volume</span>
          <span>Esc: Stop</span>
        </div>
      </div>

      {/* Screen Reader Support */}
      <div className="sr-only">
        <div aria-live="polite">
          Status: {isPlaying ? 'Memutar' : 'Dijeda'}
          {ambientSoundEnabled && currentAmbientSound && `, Suara ambient: ${availableAmbientSounds.find(s => s.id === currentAmbientSound)?.name}`}
        </div>
      </div>
    </Card>
  );
};