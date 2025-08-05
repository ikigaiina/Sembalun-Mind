import type { GuidedScript, ScriptSegment, VoiceSettings } from '../types/content';

export interface SpeechSynthesisConfig {
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;

  // Event handlers
  public onStart?: () => void;
  public onEnd?: () => void;
  public onPause?: () => void;
  public onResume?: () => void;
  public onError?: (error: string) => void;
  public onSegmentStart?: (segment: ScriptSegment) => void;
  public onSegmentEnd?: (segment: ScriptSegment) => void;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Wait for voices to be loaded
    if (this.synthesis.getVoices().length === 0) {
      await new Promise<void>((resolve) => {
        this.synthesis.onvoiceschanged = () => {
          this.voices = this.synthesis.getVoices();
          resolve();
        };
      });
    } else {
      this.voices = this.synthesis.getVoices();
    }

    this.isInitialized = true;
  }

  /**
   * Get available voices, filtered for Indonesian if available
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    const indonesianVoices = this.voices.filter(voice => 
      voice.lang.startsWith('id') || 
      voice.name.toLowerCase().includes('indonesia')
    );
    
    return indonesianVoices.length > 0 ? indonesianVoices : this.voices;
  }

  /**
   * Get the best Indonesian voice or fallback
   */
  getBestIndonesianVoice(): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    
    // Prefer Indonesian voices
    const indonesianVoice = voices.find(voice => 
      voice.lang.startsWith('id') && voice.localService
    );
    if (indonesianVoice) return indonesianVoice;

    // Fallback to any Indonesian voice
    const anyIndonesian = voices.find(voice => voice.lang.startsWith('id'));
    if (anyIndonesian) return anyIndonesian;

    // Fallback to default voice
    return voices.find(voice => voice.default) || voices[0] || null;
  }

  /**
   * Create speech synthesis configuration
   */
  createConfig(voiceSettings?: VoiceSettings): SpeechSynthesisConfig {
    const defaultVoice = this.getBestIndonesianVoice();
    
    return {
      voice: defaultVoice || undefined,
      rate: voiceSettings?.speed || 1.0,
      pitch: voiceSettings?.pitch || 1.0,
      volume: voiceSettings?.volume || 1.0,
      lang: 'id-ID'
    };
  }

  /**
   * Speak a single text segment
   */
  async speak(
    text: string, 
    config?: Partial<SpeechSynthesisConfig>
  ): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        resolve();
        return;
      }

      // Stop any current speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      const finalConfig = { ...this.createConfig(), ...config };

      // Apply configuration
      if (finalConfig.voice) {
        utterance.voice = finalConfig.voice;
      }
      utterance.rate = finalConfig.rate;
      utterance.pitch = finalConfig.pitch;
      utterance.volume = finalConfig.volume;
      utterance.lang = finalConfig.lang;

      // Set up event listeners
      utterance.onstart = () => {
        this.onStart?.();
      };

      utterance.onend = () => {
        this.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        const errorMessage = `Speech synthesis error: ${event.error}`;
        this.onError?.(errorMessage);
        reject(new Error(errorMessage));
      };
      this.synthesis.speak(utterance);
    });
  }

  /**
   * Speak a guided script with timed segments
   */
  async speakScript(
    script: GuidedScript,
    onProgress?: (currentSegment: number, totalSegments: number) => void
  ): Promise<void> {
    await this.initialize();

    const config = this.createConfig(script.voiceSettings);
    
    for (let i = 0; i < script.segments.length; i++) {
      const segment = script.segments[i];
      
      try {
        this.onSegmentStart?.(segment);
        onProgress?.(i + 1, script.segments.length);

        // Handle different segment types
        if (segment.type === 'pause') {
          await this.pause(segment.duration || 2000);
        } else {
          await this.speak(segment.text, config);
        }

        this.onSegmentEnd?.(segment);
        
      } catch (error) {
        console.error(`Error speaking segment ${i}:`, error);
        // Continue with next segment on error
      }
    }
  }

  /**
   * Create a pause/silence
   */
  private async pause(durationMs: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, durationMs);
    });
  }

  /**
   * Pause current speech
   */
  pauseSpeech(): void {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
      this.onPause?.();
    }
  }

  /**
   * Resume paused speech
   */
  resumeSpeech(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
      this.onResume?.();
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  /**
   * Check if speech is paused
   */
  isPaused(): boolean {
    return this.synthesis.paused;
  }

  /**
   * Get speech synthesis state
   */
  getState(): {
    isAvailable: boolean;
    isSpeaking: boolean;
    isPaused: boolean;
    voicesCount: number;
    hasIndonesianVoice: boolean;
  } {
    return {
      isAvailable: 'speechSynthesis' in window,
      isSpeaking: this.synthesis.speaking,
      isPaused: this.synthesis.paused,
      voicesCount: this.voices.length,
      hasIndonesianVoice: this.voices.some(v => v.lang.startsWith('id'))
    };
  }
}

/**
 * Script Builder Helper Class
 */
export class ScriptBuilder {
  private segments: ScriptSegment[] = [];
  private currentId = 0;

  /**
   * Add instruction segment
   */
  addInstruction(text: string, duration?: number): ScriptBuilder {
    this.segments.push({
      id: `segment_${this.currentId++}`,
      timestamp: this.getTotalDuration(),
      text,
      type: 'instruction',
      duration
    });
    return this;
  }

  /**
   * Add breathing cue
   */
  addBreathing(text: string, duration?: number): ScriptBuilder {
    this.segments.push({
      id: `segment_${this.currentId++}`,
      timestamp: this.getTotalDuration(),
      text,
      type: 'breathing',
      duration
    });
    return this;
  }

  /**
   * Add visualization guidance
   */
  addVisualization(text: string, duration?: number): ScriptBuilder {
    this.segments.push({
      id: `segment_${this.currentId++}`,
      timestamp: this.getTotalDuration(),
      text,
      type: 'visualization',
      duration
    });
    return this;
  }

  /**
   * Add pause/silence
   */
  addPause(durationMs: number, description = 'Jeda hening'): ScriptBuilder {
    this.segments.push({
      id: `segment_${this.currentId++}`,
      timestamp: this.getTotalDuration(),
      text: description,
      type: 'pause',
      duration: durationMs
    });
    return this;
  }

  /**
   * Get total estimated duration
   */
  private getTotalDuration(): number {
    return this.segments.reduce((total, segment) => {
      if (segment.duration) {
        return total + segment.duration;
      }
      // Estimate ~150 words per minute for speech
      const wordCount = segment.text.split(' ').length;
      const estimatedMs = (wordCount / 150) * 60 * 1000;
      return total + estimatedMs;
    }, 0);
  }

  /**
   * Build the complete script
   */
  build(sessionId: string, language: 'id' | 'en' = 'id'): GuidedScript {
    return {
      id: `script_${sessionId}_${Date.now()}`,
      sessionId,
      content: this.segments.map(s => s.text).join('\n\n'),
      segments: this.segments,
      language,
      isTextToSpeechReady: true,
      voiceSettings: {
        voice: 'default',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0
      }
    };
  }

  /**
   * Clear all segments
   */
  clear(): ScriptBuilder {
    this.segments = [];
    this.currentId = 0;
    return this;
  }
}

// Singleton instances
export const textToSpeechService = new TextToSpeechService();
export const scriptBuilder = new ScriptBuilder();