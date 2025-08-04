import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import type { GuidedScript, ScriptSegment } from '../../types/content';
import { textToSpeechService } from '../../services/textToSpeechService';

interface GuidedScriptPlayerProps {
  script: GuidedScript;
  isActive: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const GuidedScriptPlayer: React.FC<GuidedScriptPlayerProps> = ({
  script,
  isActive,
  onComplete,
  onError,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentSegment, setCurrentSegment] = useState<ScriptSegment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handlePlay = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await textToSpeechService.speakScript(
        script,
        (current, total) => {
          const progressPercent = (current / total) * 100;
          setProgress(progressPercent);
        }
      );
      
      // Script completed
      setIsPlaying(false);
      onComplete?.();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [script, onComplete]);

  const handleStop = useCallback(() => {
    textToSpeechService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegmentIndex(0);
    setCurrentSegment(null);
    setProgress(0);
  }, []);

  // Initialize TTS service
  useEffect(() => {
    textToSpeechService.onStart = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };

    textToSpeechService.onEnd = () => {
      setIsPlaying(false);
    };

    textToSpeechService.onPause = () => {
      setIsPaused(true);
    };

    textToSpeechService.onResume = () => {
      setIsPaused(false);
    };

    textToSpeechService.onError = (errorMessage) => {
      setError(errorMessage);
      setIsPlaying(false);
      setIsLoading(false);
      onError?.(errorMessage);
    };

    textToSpeechService.onSegmentStart = (segment) => {
      setCurrentSegment(segment);
      const index = script.segments.findIndex(s => s.id === segment.id);
      setCurrentSegmentIndex(index);
    };

    textToSpeechService.onSegmentEnd = () => {
      // Update progress
      const newProgress = ((currentSegmentIndex + 1) / script.segments.length) * 100;
      setProgress(newProgress);
    };

    return () => {
      textToSpeechService.stop();
    };
  }, [script, currentSegmentIndex, onError]);

  // Auto play/stop based on isActive
  useEffect(() => {
    if (isActive && !isPlaying && !isPaused) {
      handlePlay();
    } else if (!isActive && (isPlaying || isPaused)) {
      handleStop();
    }
  }, [isActive, handlePlay, handleStop, isPlaying, isPaused]);

  const handlePause = () => {
    textToSpeechService.pauseSpeech();
  };

  const handleResume = () => {
    textToSpeechService.resumeSpeech();
  };

  const getSegmentIcon = (type: ScriptSegment['type']): string => {
    switch (type) {
      case 'instruction': return '💬';
      case 'breathing': return '🫁';
      case 'visualization': return '✨';
      case 'pause': return '⏸️';
      default: return '🎯';
    }
  };

  const getSegmentTypeLabel = (type: ScriptSegment['type']): string => {
    switch (type) {
      case 'instruction': return 'Instruksi';
      case 'breathing': return 'Pernapasan';
      case 'visualization': return 'Visualisasi';
      case 'pause': return 'Jeda Hening';
      default: return 'Panduan';
    }
  };

  const ttsState = textToSpeechService.getState();

  if (!ttsState.isAvailable) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center">
          <div className="text-2xl mb-2">🔇</div>
          <p className="text-sm text-gray-600 mb-3">
            Text-to-speech tidak tersedia di browser ini
          </p>
          <p className="text-xs text-gray-500">
            Gunakan Chrome, Firefox, atau Safari untuk fitur suara panduan
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-gray-800">
              Panduan Suara
            </h3>
            <p className="text-sm text-gray-600">
              {script.segments.length} segmen • {script.language === 'id' ? 'Bahasa Indonesia' : 'English'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {!ttsState.hasIndonesianVoice && (
              <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Suara Indonesia tidak tersedia
              </div>
            )}
            
            {ttsState.voicesCount > 0 && (
              <div className="text-xs text-gray-500">
                {ttsState.voicesCount} suara tersedia
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-800 font-medium">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Segmen {currentSegmentIndex + 1}</span>
            <span>dari {script.segments.length}</span>
          </div>
        </div>
      </div>

      {/* Current Segment Display */}
      {currentSegment && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
              <span className="text-lg">{getSegmentIcon(currentSegment.type)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-800">
                  {getSegmentTypeLabel(currentSegment.type)}
                </span>
                {currentSegment.duration && (
                  <span className="text-xs text-gray-500">
                    ({Math.round(currentSegment.duration / 1000)}s)
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {currentSegment.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-4">
        <div className="flex items-center justify-center space-x-4">
          
          {/* Main Play/Pause Button */}
          <Button
            variant={isPlaying ? "outline" : "primary"}
            size="large"
            onClick={isPaused ? handleResume : isPlaying ? handlePause : handlePlay}
            disabled={isLoading}
            className="w-14 h-14 rounded-full"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
            ) : isPaused ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </Button>

          {/* Stop Button */}
          <Button
            variant="outline"
            size="medium"
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            className="p-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12"/>
            </svg>
          </Button>
        </div>

        {/* Status Display */}
        <div className="mt-4 text-center">
          {error ? (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          ) : isLoading ? (
            <p className="text-sm text-gray-600">Mempersiapkan panduan suara...</p>
          ) : isPlaying ? (
            <p className="text-sm text-green-600">Panduan sedang berjalan</p>
          ) : isPaused ? (
            <p className="text-sm text-orange-600">Panduan dijeda</p>
          ) : (
            <p className="text-sm text-gray-600">Siap untuk memulai panduan</p>
          )}
        </div>
      </div>

      {/* Script Preview */}
      <div className="border-t border-gray-100">
        <details className="group">
          <summary className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Lihat Skrip Lengkap
              </span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="transform group-open:rotate-180 transition-transform duration-200"
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </summary>
          
          <div className="px-4 pb-4 space-y-3 max-h-60 overflow-y-auto">
            {script.segments.map((segment, index) => (
              <div 
                key={segment.id}
                className={`flex items-start space-x-3 p-2 rounded-lg transition-colors duration-200 ${
                  currentSegment?.id === segment.id ? 'bg-primary bg-opacity-5' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {getSegmentTypeLabel(segment.type)}
                    </span>
                    <span className="text-xs">{getSegmentIcon(segment.type)}</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {segment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </Card>
  );
};