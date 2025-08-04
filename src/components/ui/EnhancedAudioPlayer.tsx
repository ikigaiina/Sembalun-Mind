import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { AudioPlayer, audioService } from '../../services/audioService';
import type { AudioFile } from '../../types/content';

interface EnhancedAudioPlayerProps {
  audioFile?: AudioFile;
  isActive: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
  showAdvancedControls?: boolean;
  className?: string;
}

export const EnhancedAudioPlayer: React.FC<EnhancedAudioPlayerProps> = ({
  audioFile,
  isActive,
  onComplete,
  onError,
  showAdvancedControls = true,
  className = ''
}) => {
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    isLoading: false,
    error: null as string | null
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handlePlay = useCallback(async () => {
    if (!audioPlayerRef.current) return;
    
    try {
      await audioPlayerRef.current.play();
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('Play error:', error);
    }
  }, []);

  const handlePause = useCallback(() => {
    if (!audioPlayerRef.current) return;
    
    audioPlayerRef.current.pause();
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Initialize audio player
  useEffect(() => {
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new AudioPlayer(audioService);
      
      // Setup event listeners
      audioPlayerRef.current.onTimeUpdate = (currentTime, duration) => {
        if (!isDragging) {
          setPlayerState(prev => ({ ...prev, currentTime, duration }));
        }
      };
      
      audioPlayerRef.current.onEnded = () => {
        setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
        onComplete?.();
      };
      
      audioPlayerRef.current.onError = (error) => {
        setPlayerState(prev => ({ ...prev, error, isLoading: false }));
        onError?.(error);
      };
      
      audioPlayerRef.current.onLoadStart = () => {
        setPlayerState(prev => ({ ...prev, isLoading: true, error: null }));
      };
      
      audioPlayerRef.current.onCanPlay = () => {
        setPlayerState(prev => ({ ...prev, isLoading: false }));
      };
    }

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.destroy();
        audioPlayerRef.current = null;
      }
    };
  }, [isDragging, onComplete, onError]);

  // Load audio file
  useEffect(() => {
    if (audioFile && audioPlayerRef.current) {
      audioPlayerRef.current.load(audioFile);
    }
  }, [audioFile]);

  // Auto play/pause based on isActive
  useEffect(() => {
    if (!audioPlayerRef.current) return;

    if (isActive && !playerState.isPlaying && audioFile) {
      handlePlay();
    } else if (!isActive && playerState.isPlaying) {
      handlePause();
    }
  }, [isActive, audioFile, playerState.isPlaying, handlePlay, handlePause]);

  // Update player state
  useEffect(() => {
    if (audioPlayerRef.current) {
      const state = audioPlayerRef.current.getState();
      setPlayerState(prev => ({ ...prev, ...state }));
    }
  }, []);

  const handleStop = () => {
    if (!audioPlayerRef.current) return;
    
    audioPlayerRef.current.stop();
    setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
  };

  const handleSeek = (timeInSeconds: number) => {
    if (!audioPlayerRef.current) return;
    
    audioPlayerRef.current.seek(timeInSeconds);
    setPlayerState(prev => ({ ...prev, currentTime: timeInSeconds }));
  };

  const handleVolumeChange = (volume: number) => {
    if (!audioPlayerRef.current) return;
    
    audioPlayerRef.current.setVolume(volume);
    setPlayerState(prev => ({ ...prev, volume }));
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!audioPlayerRef.current) return;
    
    audioPlayerRef.current.setPlaybackRate(rate);
    setPlayerState(prev => ({ ...prev, playbackRate: rate }));
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(playerState.currentTime + seconds, playerState.duration));
    handleSeek(newTime);
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = playerState.duration > 0 
    ? (playerState.currentTime / playerState.duration) * 100 
    : 0;

  if (!audioFile) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <span className="text-2xl">🎵</span>
          <p className="text-sm mt-2">Tidak ada audio yang dimuat</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎧</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-gray-800 truncate">
                {audioFile.title}
              </h3>
              <p className="text-sm text-gray-500">
                {formatTime(audioFile.duration)} • {audioFile.format.toUpperCase()}
              </p>
            </div>
          </div>
          
          {showAdvancedControls && (
            <Button
              variant="outline"
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2"
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
          )}
        </div>
      </div>

      {/* Main Controls */}
      <div className="p-4 space-y-4">
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div 
            className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percentage = clickX / rect.width;
              const newTime = percentage * playerState.duration;
              handleSeek(newTime);
            }}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
            
            {/* Playhead */}
            <div 
              className="absolute top-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-sm transform -translate-y-1/2 cursor-grab"
              style={{ left: `calc(${progressPercentage}% - 8px)` }}
              onMouseDown={() => setIsDragging(true)}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(playerState.currentTime)}</span>
            <span>{formatTime(playerState.duration)}</span>
          </div>
        </div>

        {/* Play Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="small"
            onClick={() => handleSkip(-10)}
            disabled={playerState.isLoading}
            className="p-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
              <text x="2" y="16" fontSize="8" fill="currentColor">10</text>
            </svg>
          </Button>

          <Button
            variant={playerState.isPlaying ? "outline" : "primary"}
            size="large"
            onClick={playerState.isPlaying ? handlePause : handlePlay}
            disabled={playerState.isLoading}
            className="w-12 h-12 rounded-full"
          >
            {playerState.isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
            ) : playerState.isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </Button>

          <Button
            variant="outline"
            size="small"
            onClick={() => handleSkip(30)}
            disabled={playerState.isLoading}
            className="p-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 6v12l8.5-6L13 6zM4 18l8.5-6L4 6v12z"/>
              <text x="14" y="16" fontSize="8" fill="currentColor">30</text>
            </svg>
          </Button>
        </div>

        {/* Error Display */}
        {playerState.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{playerState.error}</p>
          </div>
        )}
      </div>

      {/* Advanced Controls */}
      {showAdvancedControls && isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          
          {/* Volume Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Volume</label>
              <span className="text-xs text-gray-500">{Math.round(playerState.volume * 100)}%</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={playerState.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            </div>
          </div>

          {/* Playback Speed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Kecepatan Putar</label>
              <span className="text-xs text-gray-500">{playerState.playbackRate}x</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[0.5, 0.75, 1, 1.25, 1.5].map(rate => (
                <Button
                  key={rate}
                  variant={playerState.playbackRate === rate ? "primary" : "outline"}
                  size="small"
                  onClick={() => handlePlaybackRateChange(rate)}
                  className="text-xs"
                >
                  {rate}x
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="small"
              onClick={handleStop}
              disabled={playerState.isLoading}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12"/>
              </svg>
              <span className="ml-2">Stop</span>
            </Button>

            {audioFile.isDownloaded && (
              <div className="flex items-center text-xs text-green-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Offline Ready
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};