import { useState, useEffect, useRef, useCallback } from 'react';

export type AmbientSound = 'rain' | 'forest' | 'silence' | 'ocean' | 'wind';

interface AudioSource {
  id: AmbientSound;
  url: string;
  name: string;
  icon: string;
  description: string;
}

// In a real app, these would be actual audio file URLs
const audioSources: AudioSource[] = [
  {
    id: 'silence',
    url: '',
    name: 'Keheningan',
    icon: '🤫',
    description: 'Suasana tenang tanpa suara latar'
  },
  {
    id: 'rain',
    url: 'data:audio/wav;base64,', // Placeholder - would be real rain audio
    name: 'Hujan',
    icon: '🌧️',
    description: 'Suara rintik hujan yang menenangkan'
  },
  {
    id: 'forest',
    url: 'data:audio/wav;base64,', // Placeholder - would be real forest audio
    name: 'Hutan',
    icon: '🌲',
    description: 'Suara alam dan burung berkicau'
  },
  {
    id: 'ocean',
    url: 'data:audio/wav;base64,', // Placeholder - would be real ocean audio
    name: 'Ombak',
    icon: '🌊',
    description: 'Deburan ombak yang tenang'
  },
  {
    id: 'wind',
    url: 'data:audio/wav;base64,', // Placeholder - would be real wind audio
    name: 'Angin',
    icon: '💨',
    description: 'Hembusan angin sepoi-sepoi'
  }
];

export const useBackgroundAudio = () => {
  const [selectedSound, setSelectedSound] = useState<AmbientSound>('silence');
  const [volume, setVolume] = useState(0.6);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  // Initialize Web Audio API
  const initializeAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = volume;
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        setError('Audio tidak didukung di browser ini');
      }
    }
  }, [volume]);

  // Create synthetic ambient sounds using Web Audio API
  const createSyntheticAudio = useCallback((soundType: AmbientSound): AudioBuffer | null => {
    if (!audioContextRef.current || soundType === 'silence') return null;

    const sampleRate = audioContextRef.current.sampleRate;
    const duration = 30; // 30 seconds loop
    const buffer = audioContextRef.current.createBuffer(2, sampleRate * duration, sampleRate);

    // Generate different synthetic sounds based on type
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      switch (soundType) {
        case 'rain':
          // Generate rain-like noise
          for (let i = 0; i < channelData.length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * 0.3 * Math.sin(i * 0.01);
          }
          break;
          
        case 'ocean':
          // Generate ocean wave sounds
          for (let i = 0; i < channelData.length; i++) {
            const wave1 = Math.sin(2 * Math.PI * 0.2 * i / sampleRate) * 0.4;
            const wave2 = Math.sin(2 * Math.PI * 0.1 * i / sampleRate) * 0.3;
            const noise = (Math.random() * 2 - 1) * 0.1;
            channelData[i] = wave1 + wave2 + noise;
          }
          break;
          
        case 'forest':
          // Generate forest ambience with birds
          for (let i = 0; i < channelData.length; i++) {
            let sample = (Math.random() * 2 - 1) * 0.15; // Base forest noise
            
            // Add occasional bird chirps
            if (Math.random() < 0.0001) {
              sample += Math.sin(2 * Math.PI * (800 + Math.random() * 400) * i / sampleRate) * 0.3;
            }
            
            channelData[i] = sample;
          }
          break;
          
        case 'wind':
          // Generate wind sounds
          for (let i = 0; i < channelData.length; i++) {
            const lowFreq = Math.sin(2 * Math.PI * 0.5 * i / sampleRate) * 0.3;
            const noise = (Math.random() * 2 - 1) * 0.2;
            channelData[i] = lowFreq + noise * Math.sin(i * 0.001);
          }
          break;
          
        default:
          // Silence
          channelData.fill(0);
      }
    }

    return buffer;
  }, []);

  // Play audio
  const play = useCallback(async () => {
    if (!audioContextRef.current || selectedSound === 'silence') {
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Stop any currently playing audio
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      }

      // Create or use cached audio buffer
      if (!audioBufferRef.current) {
        audioBufferRef.current = createSyntheticAudio(selectedSound);
      }

      if (audioBufferRef.current) {
        // Create new source node
        sourceNodeRef.current = audioContextRef.current.createBufferSource();
        sourceNodeRef.current.buffer = audioBufferRef.current;
        sourceNodeRef.current.loop = true;
        sourceNodeRef.current.connect(gainNodeRef.current!);
        
        // Start playing
        sourceNodeRef.current.start();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      setError('Gagal memutar audio');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSound, createSyntheticAudio]);

  // Stop audio
  const stop = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      } catch {
        // Source might already be stopped
      }
    }
    setIsPlaying(false);
  }, []);

  // Change sound
  const changeSound = useCallback(async (sound: AmbientSound) => {
    const wasPlaying = isPlaying;
    
    // Stop current audio
    stop();
    
    // Update sound selection
    setSelectedSound(sound);
    audioBufferRef.current = null; // Clear cached buffer
    
    // If was playing, start new sound
    if (wasPlaying && sound !== 'silence') {
      // Small delay to ensure clean transition
      setTimeout(() => {
        play();
      }, 100);
    }
  }, [isPlaying, stop, play]);

  // Update volume
  const setAudioVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current) {
      // Smooth volume transition
      gainNodeRef.current.gain.setTargetAtTime(newVolume, audioContextRef.current!.currentTime, 0.1);
    }
  }, []);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      initializeAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [initializeAudioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stop]);

  return {
    selectedSound,
    volume,
    isPlaying,
    isLoading,
    error,
    audioSources,
    play,
    stop,
    changeSound,
    setVolume: setAudioVolume,
    getCurrentSound: () => audioSources.find(source => source.id === selectedSound)
  };
};