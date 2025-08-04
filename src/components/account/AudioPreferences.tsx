import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import type { UserPreferences } from '../../types/auth';

interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  language: 'id' | 'en';
  accent?: string;
  description: string;
  sampleUrl?: string;
}

interface BackgroundSound {
  id: string;
  name: string;
  category: 'nature' | 'ambient' | 'instrumental' | 'white-noise';
  description: string;
  sampleUrl?: string;
  icon: string;
}

export const AudioPreferences: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testingAudio, setTestingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Load existing preferences
  useEffect(() => {
    if (userProfile?.preferences) {
      setPreferences(userProfile.preferences);
    }
  }, [userProfile]);

  const voiceOptions: VoiceOption[] = [
    {
      id: 'female-id-calm',
      name: 'Sari',
      gender: 'female',
      language: 'id',
      description: 'Calm and soothing Indonesian female voice',
      sampleUrl: '/audio/samples/sari-sample.mp3'
    },
    {
      id: 'male-id-warm',
      name: 'Adi',
      gender: 'male',
      language: 'id',
      description: 'Warm and gentle Indonesian male voice',
      sampleUrl: '/audio/samples/adi-sample.mp3'
    },
    {
      id: 'female-en-serene',
      name: 'Emma',
      gender: 'female',
      language: 'en',
      accent: 'American',
      description: 'Serene American English female voice',
      sampleUrl: '/audio/samples/emma-sample.mp3'
    },
    {
      id: 'male-en-mindful',
      name: 'David',
      gender: 'male',
      language: 'en',
      accent: 'British',
      description: 'Mindful British English male voice',
      sampleUrl: '/audio/samples/david-sample.mp3'
    }
  ];

  const backgroundSounds: BackgroundSound[] = [
    {
      id: 'forest-rain',
      name: 'Forest Rain',
      category: 'nature',
      description: 'Gentle rain falling in a peaceful forest',
      icon: '🌧️',
      sampleUrl: '/audio/background/forest-rain.mp3'
    },
    {
      id: 'ocean-waves',
      name: 'Ocean Waves',
      category: 'nature',
      description: 'Calming ocean waves on a quiet beach',
      icon: '🌊',
      sampleUrl: '/audio/background/ocean-waves.mp3'
    },
    {
      id: 'mountain-stream',
      name: 'Mountain Stream',
      category: 'nature',
      description: 'Babbling brook in serene mountains',
      icon: '🏔️',
      sampleUrl: '/audio/background/mountain-stream.mp3'
    },
    {
      id: 'singing-bowls',
      name: 'Singing Bowls',
      category: 'instrumental',
      description: 'Traditional Tibetan singing bowls',
      icon: '🎵',
      sampleUrl: '/audio/background/singing-bowls.mp3'
    },
    {
      id: 'ambient-space',
      name: 'Ambient Space',
      category: 'ambient',
      description: 'Ethereal space-like ambient tones',
      icon: '🌌',
      sampleUrl: '/audio/background/ambient-space.mp3'
    },
    {
      id: 'white-noise',
      name: 'White Noise',
      category: 'white-noise',
      description: 'Pure white noise for focus',
      icon: '📻',
      sampleUrl: '/audio/background/white-noise.mp3'
    }
  ];

  const endSoundOptions = [
    { value: 'bell', label: 'Meditation Bell', icon: '🔔' },
    { value: 'chime', label: 'Wind Chime', icon: '🎐' },
    { value: 'gong', label: 'Tibetan Gong', icon: '🥇' },
    { value: 'silent', label: 'Silent', icon: '🔇' }
  ];

  const qualityOptions = [
    { value: 'standard', label: 'Standard', description: '128 kbps - Good quality, smaller files' },
    { value: 'high', label: 'High', description: '256 kbps - Excellent quality' },
    { value: 'ultra', label: 'Ultra', description: '320 kbps - Premium quality, larger files' }
  ];

  // Storage limits for reference - this will be used in future feature
  // const storageLimits = [1, 2, 5, 10, 20];

  const handlePreferenceChange = (category: 'meditation' | 'notifications' | 'accessibility', key: string, value: unknown) => {
    setPreferences(prev => {
      if (!prev) return null;
      const newPreferences = { 
        ...prev, 
        [category]: { 
          ...prev[category], 
          [key]: value 
        } 
      };
      return newPreferences;
    });
  };

  const playAudioSample = async (sampleUrl: string, type: 'voice' | 'background' | 'notification') => {
    if (!audioRef.current || !sampleUrl) return;

    try {
      setTestingAudio(sampleUrl);
      audioRef.current.src = sampleUrl;
      
      // Apply current settings
      if (type === 'voice') {
        audioRef.current.playbackRate = 1; // Speed and pitch are no longer in the data model
        audioRef.current.volume = (preferences?.meditation.voiceVolume ?? 80) / 100;
      } else if (type === 'background') {
        audioRef.current.volume = (preferences?.meditation.musicVolume ?? 30) / 100;
      } else if (type === 'notification') {
        audioRef.current.volume = (preferences?.notifications.vibration ? 1 : 0) / 100;
      }

      await audioRef.current.play();
    } catch (err) {
      console.error('Failed to play audio sample:', err);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setTestingAudio(null);
  };

  const handleSave = async () => {
    if (!preferences) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile({
        preferences
      });
      setSuccess('Audio preferences saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setTestingAudio(null)} style={{ display: 'none' }} />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Audio Preferences
        </h3>
        <p className="text-gray-600">
          Customize your audio experience for guided meditations, background sounds, and notifications.
        </p>
      </div>

      {/* Voice Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Voice Settings</h4>
        
        <div className="space-y-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose your guide's voice
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {voiceOptions.map((voice) => (
                <div
                  key={voice.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    preferences?.meditation.preferredVoice === voice.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900">{voice.name}</h5>
                      <p className="text-sm text-gray-600">
                        {voice.gender} • {voice.language.toUpperCase()}
                        {voice.accent && ` • ${voice.accent}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePreferenceChange('meditation', 'preferredVoice', voice.id)}
                        className={`w-5 h-5 rounded-full border-2 ${
                          preferences?.meditation.preferredVoice === voice.id
                            ? 'bg-primary border-primary'
                            : 'border-gray-300'
                        }`}
                      >
                        {preferences?.meditation.preferredVoice === voice.id && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                        )}
                      </button>
                      {voice.sampleUrl && (
                        <button
                          onClick={() => testingAudio === voice.sampleUrl 
                            ? stopAudio() 
                            : playAudioSample(voice.sampleUrl!, 'voice')}
                          className="text-primary hover:text-primary/70"
                        >
                          {testingAudio === voice.sampleUrl ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{voice.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Volume: {preferences?.meditation.voiceVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences?.meditation.voiceVolume ?? 80}
                onChange={(e) => handlePreferenceChange('meditation', 'voiceVolume', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Sounds */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Background Sounds</h4>
        
        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Enable background sounds</div>
              <div className="text-sm text-gray-600">Play ambient sounds during meditation</div>
            </div>
            <button
              onClick={() => handlePreferenceChange('meditation', 'backgroundSounds', !preferences?.meditation.backgroundSounds)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences?.meditation.backgroundSounds ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences?.meditation.backgroundSounds ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences?.meditation.backgroundSounds && (
            <>
              {/* Sound Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose background sound
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {backgroundSounds.map((sound) => (
                    <div
                      key={sound.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        preferences?.meditation.selectedBackgroundSound === sound.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePreferenceChange('meditation', 'selectedBackgroundSound', sound.id)}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{sound.icon}</div>
                        <h5 className="font-medium text-gray-900 text-sm">{sound.name}</h5>
                        <p className="text-xs text-gray-600 mb-2">{sound.description}</p>
                        {sound.sampleUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (testingAudio === sound.sampleUrl) {
                                stopAudio();
                              } else {
                                playAudioSample(sound.sampleUrl!, 'background');
                              }
                            }}
                            className="text-primary hover:text-primary/70 text-xs"
                          >
                            {testingAudio === sound.sampleUrl ? 'Stop' : 'Preview'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Background Sound Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Volume: {preferences?.meditation.musicVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences?.meditation.musicVolume ?? 30}
                    onChange={(e) => handlePreferenceChange('meditation', 'musicVolume', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification Sounds */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Notification Sounds</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Session end sound
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {endSoundOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceChange('meditation', 'endingBell', option.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                    preferences?.meditation.endingBell ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Quality */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Audio Quality</h4>
        <div className="space-y-3">
          {qualityOptions.map((option) => (
            <div
              key={option.value}
              className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                preferences?.meditation.guidanceLevel === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePreferenceChange('meditation', 'guidanceLevel', option.value)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{option.label}</h5>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${
                  preferences?.meditation.guidanceLevel === option.value ? 'bg-primary border-primary' : 'border-gray-300'
                }`}>
                  {preferences?.meditation.guidanceLevel === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Preferences */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Download Preferences</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Auto-download content</div>
              <div className="text-sm text-gray-600">Automatically download new content for offline use</div>
            </div>
            <button
              onClick={() => handlePreferenceChange('meditation', 'autoAdvance', !preferences?.meditation.autoAdvance)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences?.meditation.autoAdvance ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences?.meditation.autoAdvance ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Audio Accessibility</h4>
        
        <div className="space-y-4">
          {Object.entries(preferences?.accessibility ?? {}).map(([key, value]) => {
            const labels = {
              audioDescriptions: {
                title: 'Audio descriptions',
                desc: 'Provide detailed audio descriptions for visual elements'
              },
              enhancedContrast: {
                title: 'Enhanced audio contrast',
                desc: 'Increase contrast between voice and background sounds'
              },
              reduceBackground: {
                title: 'Reduce background complexity',
                desc: 'Simplify background sounds for better focus'
              }
            };

            return (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{labels[key as keyof typeof labels].title}</div>
                  <div className="text-sm text-gray-600">{labels[key as keyof typeof labels].desc}</div>
                </div>
                <button
                  onClick={() => handlePreferenceChange('accessibility', key, !value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};