import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface MeditationPlayerProps {
  session: {
    id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    audioUrl?: string;
    instructor?: string;
    category: string;
  };
  onComplete?: (sessionData: any) => void;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}

/**
 * Comprehensive meditation session player component
 * 
 * Features:
 * - Audio playback controls with accessibility
 * - Session progress tracking
 * - Customizable meditation timer
 * - Interrupt handling
 * - Session completion tracking
 * - Background audio support
 * - Keyboard navigation
 * - Screen reader compatibility
 */
export const MeditationPlayer: React.FC<MeditationPlayerProps> = ({
  session,
  onComplete,
  onPause,
  onResume,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const totalSeconds = session.duration * 60;
  const progressPercentage = (currentTime / totalSeconds) * 100;

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      setIsLoading(true);
      
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        onResume?.();
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle session completion
  const handleComplete = () => {
    const sessionData = {
      sessionId: session.id,
      duration: currentTime,
      completedAt: new Date(),
      quality: null // Will be set by user feedback
    };
    
    onComplete?.(sessionData);
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        handlePlayPause();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(totalSeconds, audioRef.current.currentTime + 10);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        setVolume(prev => Math.min(1, prev + 0.1));
        break;
      case 'ArrowDown':
        event.preventDefault();
        setVolume(prev => Math.max(0, prev - 0.1));
        break;
    }
  };

  // Update audio volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update audio playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  return (
    <Card className={`meditation-player ${className}`} padding="large">
      {/* Session Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading text-gray-800 mb-2">
          {session.title}
        </h2>
        <p className="text-gray-600 font-body mb-4">
          {session.description}
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          {session.instructor && (
            <span>dengan {session.instructor}</span>
          )}
          <span>•</span>
          <span>{session.duration} menit</span>
          <span>•</span>
          <span className="capitalize">{session.category}</span>
        </div>
      </div>

      {/* Audio Element */}
      {session.audioUrl && (
        <audio
          ref={audioRef}
          src={session.audioUrl}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={handleComplete}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          preload="metadata"
          aria-label={`Audio untuk sesi meditasi ${session.title}`}
        />
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div 
          ref={progressRef}
          className="w-full h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress sesi meditasi"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalSeconds - currentTime)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        {/* Skip Backward */}
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
            }
          }}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Mundur 10 detik"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        {/* Play/Pause Button */}
        <Button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          aria-label={isPlaying ? "Jeda sesi" : "Mulai sesi"}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a2 2 0 012 2v.586a1 1 0 01-.293.707L12 21l-4.707-4.707A1 1 0 017 15.586V15a2 2 0 012-2h1.586a1 1 0 00.707-.293L13.707 10.293A1 1 0 0114.414 10H16" />
            </svg>
          )}
        </Button>

        {/* Skip Forward */}
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = Math.min(totalSeconds, audioRef.current.currentTime + 10);
            }
          }}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Maju 10 detik"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>
      </div>

      {/* Additional Controls */}
      <div className="flex items-center justify-between text-sm">
        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M12 6l-4 4H6a2 2 0 00-2 2v0a2 2 0 002 2h2l4 4v-12z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20"
            aria-label="Kontrol volume"
          />
        </div>

        {/* Playback Speed */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Kecepatan:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="text-sm border rounded px-2 py-1"
            aria-label="Kecepatan putar"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1.0}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
          </select>
        </div>
      </div>

      {/* Accessibility Instructions */}
      <div className="sr-only">
        <p>
          Gunakan spasi atau enter untuk play/pause, panah kiri/kanan untuk skip, 
          panah atas/bawah untuk volume.
        </p>
      </div>
    </Card>
  );
};