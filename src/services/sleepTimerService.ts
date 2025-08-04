import { offlineStorageService } from './offlineStorageService';

export interface SleepTimerConfig {
  id: string;
  userId: string;
  duration: number; // minutes
  fadeOutDuration: number; // seconds
  autoStopEnabled: boolean;
  gentleWakeEnabled: boolean;
  postTimerAction: 'stop' | 'pause' | 'next_session' | 'repeat';
  customMessage?: string;
  vibrationEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface TimerPreset {
  id: string;
  name: string;
  duration: number; // minutes
  fadeOutDuration: number; // seconds
  description: string;
  icon: string;
  isDefault: boolean;
}

export interface SleepTimerState {
  isRunning: boolean;
  timeRemaining: number; // seconds
  totalDuration: number; // seconds
  currentPhase: 'countdown' | 'fadeout' | 'completed';
  startTime?: Date;
  endTime?: Date;
  timerId?: number;
  audioContext?: AudioContext;
  gainNode?: GainNode;
}

export interface TimerStats {
  totalSessions: number;
  averageDuration: number; // minutes
  mostUsedPreset: string;
  totalSleepTime: number; // hours
  completionRate: number; // percentage
  recentSessions: Array<{
    date: Date;
    duration: number;
    completed: boolean;
  }>;
}

export class SleepTimerService {
  private static instance: SleepTimerService;
  private timerState: SleepTimerState | null = null;
  private fadeOutInterval: number | null = null;
  private callbacks: {
    onTick?: (timeRemaining: number) => void;
    onPhaseChange?: (phase: string) => void;
    onComplete?: () => void;
    onCancel?: () => void;
  } = {};
  private audioElement: HTMLAudioElement | null = null;

  static getInstance(): SleepTimerService {
    if (!SleepTimerService.instance) {
      SleepTimerService.instance = new SleepTimerService();
    }
    return SleepTimerService.instance;
  }

  async startTimer(
    config: SleepTimerConfig,
    audioElement?: HTMLAudioElement
  ): Promise<void> {
    try {
      if (this.timerState?.isRunning) {
        await this.stopTimer();
      }

      this.audioElement = audioElement || null;
      
      const totalSeconds = config.duration * 60;
      
      this.timerState = {
        isRunning: true,
        timeRemaining: totalSeconds,
        totalDuration: totalSeconds,
        currentPhase: 'countdown',
        startTime: new Date(),
        endTime: new Date(Date.now() + totalSeconds * 1000)
      };

      // Setup audio context for smooth fade-out
      if (this.audioElement) {
        await this.setupAudioContext();
      }

      // Start countdown
      this.startCountdown(config);
      
      // Save timer session
      await this.saveTimerSession(config, 'started');

      console.log(`Sleep timer started: ${config.duration} minutes`);
    } catch (error) {
      console.error('Error starting sleep timer:', error);
      throw error;
    }
  }

  async stopTimer(): Promise<void> {
    try {
      if (!this.timerState?.isRunning) return;

      // Clear intervals
      if (this.timerState.timerId) {
        clearInterval(this.timerState.timerId);
      }
      if (this.fadeOutInterval) {
        clearInterval(this.fadeOutInterval);
      }

      // Reset audio
      await this.resetAudio();

      // Save session as cancelled
      await this.saveTimerSession(null, 'cancelled');

      const wasRunning = this.timerState.isRunning;
      this.timerState = null;

      if (wasRunning && this.callbacks.onCancel) {
        this.callbacks.onCancel();
      }

      console.log('Sleep timer stopped');
    } catch (error) {
      console.error('Error stopping sleep timer:', error);
      throw error;
    }
  }

  async pauseTimer(): Promise<void> {
    try {
      if (!this.timerState?.isRunning) return;

      this.timerState.isRunning = false;
      
      if (this.timerState.timerId) {
        clearInterval(this.timerState.timerId);
      }

      console.log('Sleep timer paused');
    } catch (error) {
      console.error('Error pausing sleep timer:', error);
      throw error;
    }
  }

  async resumeTimer(): Promise<void> {
    try {
      if (!this.timerState || this.timerState.isRunning) return;

      this.timerState.isRunning = true;
      this.startCountdown();

      console.log('Sleep timer resumed');
    } catch (error) {
      console.error('Error resuming sleep timer:', error);
      throw error;
    }
  }

  async addTime(minutes: number): Promise<void> {
    try {
      if (!this.timerState?.isRunning) return;

      const additionalSeconds = minutes * 60;
      this.timerState.timeRemaining += additionalSeconds;
      this.timerState.totalDuration += additionalSeconds;
      
      if (this.timerState.endTime) {
        this.timerState.endTime = new Date(this.timerState.endTime.getTime() + additionalSeconds * 1000);
      }

      console.log(`Added ${minutes} minutes to sleep timer`);
    } catch (error) {
      console.error('Error adding time to timer:', error);
      throw error;
    }
  }

  getTimerState(): SleepTimerState | null {
    return this.timerState;
  }

  setCallbacks(callbacks: {
    onTick?: (timeRemaining: number) => void;
    onPhaseChange?: (phase: string) => void;
    onComplete?: () => void;
    onCancel?: () => void;
  }): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  async getTimerPresets(): Promise<TimerPreset[]> {
    const defaultPresets: TimerPreset[] = [
      {
        id: 'preset-5min',
        name: '5 Menit',
        duration: 5,
        fadeOutDuration: 30,
        description: 'Timer singkat untuk power nap',
        icon: '☕',
        isDefault: true
      },
      {
        id: 'preset-10min',
        name: '10 Menit',
        duration: 10,
        fadeOutDuration: 60,
        description: 'Timer sedang untuk relaksasi',
        icon: '🌙',
        isDefault: true
      },
      {
        id: 'preset-15min',
        name: '15 Menit',
        duration: 15,
        fadeOutDuration: 60,
        description: 'Timer standar untuk istirahat',
        icon: '😴',
        isDefault: true
      },
      {
        id: 'preset-30min',
        name: '30 Menit',
        duration: 30,
        fadeOutDuration: 120,
        description: 'Timer panjang untuk tidur siang',
        icon: '🛌',
        isDefault: true
      },
      {
        id: 'preset-60min',
        name: '1 Jam',
        duration: 60,
        fadeOutDuration: 180,
        description: 'Timer ekstended untuk tidur nyenyak',
        icon: '💤',
        isDefault: true
      },
      {
        id: 'preset-90min',
        name: '90 Menit',
        duration: 90,
        fadeOutDuration: 300,
        description: 'Satu siklus tidur penuh',
        icon: '🌌',
        isDefault: true
      }
    ];

    try {
      // Load custom presets from storage
      const customPresets = await offlineStorageService.getSetting('sleepTimerCustomPresets') || [];
      return [...defaultPresets, ...customPresets];
    } catch (error) {
      console.error('Error loading timer presets:', error);
      return defaultPresets;
    }
  }

  async createCustomPreset(preset: Omit<TimerPreset, 'id' | 'isDefault'>): Promise<string> {
    try {
      const customPreset: TimerPreset = {
        ...preset,
        id: `custom-preset-${Date.now()}`,
        isDefault: false
      };

      const customPresets = await offlineStorageService.getSetting('sleepTimerCustomPresets') || [];
      customPresets.push(customPreset);
      
      await offlineStorageService.setSetting('sleepTimerCustomPresets', customPresets);
      
      console.log('Custom timer preset created:', customPreset.id);
      return customPreset.id;
    } catch (error) {
      console.error('Error creating custom preset:', error);
      throw error;
    }
  }

  async deleteCustomPreset(presetId: string): Promise<void> {
    try {
      const customPresets = await offlineStorageService.getSetting('sleepTimerCustomPresets') || [];
      const filteredPresets = customPresets.filter((p: TimerPreset) => p.id !== presetId);
      
      await offlineStorageService.setSetting('sleepTimerCustomPresets', filteredPresets);
      
      console.log('Custom timer preset deleted:', presetId);
    } catch (error) {
      console.error('Error deleting custom preset:', error);
      throw error;
    }
  }

  async getTimerStats(userId: string): Promise<TimerStats> {
    try {
      const sessions = await this.getTimerSessions(userId);
      
      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          averageDuration: 0,
          mostUsedPreset: '',
          totalSleepTime: 0,
          completionRate: 0,
          recentSessions: []
        };
      }

      const completedSessions = sessions.filter(s => s.completed);
      const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
      const averageDuration = totalDuration / sessions.length;
      
      // Calculate most used preset
      const presetCounts = sessions.reduce((acc, session) => {
        const preset = session.preset || 'custom';
        acc[preset] = (acc[preset] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostUsedPreset = Object.entries(presetCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || '';

      const completionRate = sessions.length > 0 
        ? (completedSessions.length / sessions.length) * 100 
        : 0;

      const recentSessions = sessions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7)
        .map(s => ({
          date: s.date,
          duration: s.duration,
          completed: s.completed
        }));

      return {
        totalSessions: sessions.length,
        averageDuration,
        mostUsedPreset,
        totalSleepTime: totalDuration / 60, // Convert to hours
        completionRate,
        recentSessions
      };
    } catch (error) {
      console.error('Error getting timer stats:', error);
      return {
        totalSessions: 0,
        averageDuration: 0,
        mostUsedPreset: '',
        totalSleepTime: 0,
        completionRate: 0,
        recentSessions: []
      };
    }
  }

  async getSleepInsights(userId: string): Promise<{
    optimalDuration: number;
    bestTimes: string[];
    recommendations: string[];
  }> {
    try {
      const sessions = await this.getTimerSessions(userId);
      const completedSessions = sessions.filter(s => s.completed);
      
      if (completedSessions.length < 3) {
        return {
          optimalDuration: 15,
          bestTimes: ['afternoon', 'evening'],
          recommendations: [
            'Gunakan timer 10-15 menit untuk power nap yang efektif',
            'Hindari tidur siang terlalu lama (>30 menit) agar tidak mengganggu tidur malam',
            'Cobalah meditasi sebelum menggunakan sleep timer untuk relaksasi maksimal'
          ]
        };
      }

      // Calculate optimal duration based on successful sessions
      const successfulDurations = completedSessions.map(s => s.duration);
      const optimalDuration = successfulDurations.reduce((sum, d) => sum + d, 0) / successfulDurations.length;

      // Analyze best times (mock analysis)
      const bestTimes = ['afternoon', 'evening']; // Would analyze actual usage patterns

      const recommendations = this.generateSleepRecommendations(completedSessions);

      return {
        optimalDuration: Math.round(optimalDuration),
        bestTimes,
        recommendations
      };
    } catch (error) {
      console.error('Error getting sleep insights:', error);
      return {
        optimalDuration: 15,
        bestTimes: ['afternoon'],
        recommendations: ['Use 15-minute timer for optimal rest']
      };
    }
  }

  // Private methods
  private startCountdown(config?: SleepTimerConfig): void {
    if (!this.timerState) return;

    this.timerState.timerId = window.setInterval(() => {
      if (!this.timerState?.isRunning) return;

      this.timerState.timeRemaining--;

      // Notify tick callback
      if (this.callbacks.onTick) {
        this.callbacks.onTick(this.timerState.timeRemaining);
      }

      // Check if fade-out phase should start
      const fadeOutDuration = config?.fadeOutDuration || 60;
      if (this.timerState.timeRemaining <= fadeOutDuration && this.timerState.currentPhase === 'countdown') {
        this.startFadeOut(fadeOutDuration);
      }

      // Check if timer completed
      if (this.timerState.timeRemaining <= 0) {
        this.completeTimer();
      }
    }, 1000);
  }

  private startFadeOut(fadeOutDuration: number): void {
    if (!this.timerState) return;

    this.timerState.currentPhase = 'fadeout';
    
    if (this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange('fadeout');
    }

    if (this.timerState.gainNode && this.audioElement) {
      const fadeSteps = fadeOutDuration;
      const volumeStep = 1 / fadeSteps;
      
      this.fadeOutInterval = window.setInterval(() => {
        if (!this.timerState?.gainNode) return;
        
        const currentGain = this.timerState.gainNode.gain.value;
        const newGain = Math.max(0, currentGain - volumeStep);
        
        this.timerState.gainNode.gain.setValueAtTime(newGain, this.timerState.gainNode.context.currentTime);
        
        if (newGain <= 0) {
          this.clearFadeOutInterval();
        }
      }, 1000);
    }

    console.log(`Started gentle fade-out: ${fadeOutDuration} seconds`);
  }

  private completeTimer(): void {
    if (!this.timerState) return;

    this.timerState.currentPhase = 'completed';
    this.timerState.isRunning = false;

    // Clear intervals
    if (this.timerState.timerId) {
      clearInterval(this.timerState.timerId);
    }
    this.clearFadeOutInterval();

    // Stop audio
    if (this.audioElement) {
      this.audioElement.pause();
    }

    // Save completed session
    this.saveTimerSession(null, 'completed');

    // Notify completion
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete();
    }

    if (this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange('completed');
    }

    console.log('Sleep timer completed');
  }

  private clearFadeOutInterval(): void {
    if (this.fadeOutInterval) {
      clearInterval(this.fadeOutInterval);
      this.fadeOutInterval = null;
    }
  }

  private async setupAudioContext(): Promise<void> {
    if (!this.audioElement || !this.timerState) return;

    try {
      if (!this.timerState.audioContext) {
        this.timerState.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const source = this.timerState.audioContext.createMediaElementSource(this.audioElement);
      this.timerState.gainNode = this.timerState.audioContext.createGain();
      
      source.connect(this.timerState.gainNode);
      this.timerState.gainNode.connect(this.timerState.audioContext.destination);
      
      // Set initial volume to 1.0
      this.timerState.gainNode.gain.setValueAtTime(1.0, this.timerState.audioContext.currentTime);
    } catch (error) {
      console.error('Error setting up audio context:', error);
    }
  }

  private async resetAudio(): Promise<void> {
    if (this.timerState?.gainNode) {
      this.timerState.gainNode.gain.setValueAtTime(1.0, this.timerState.gainNode.context.currentTime);
    }
  }

  private async saveTimerSession(config: SleepTimerConfig | null, status: 'started' | 'completed' | 'cancelled'): Promise<void> {
    try {
      const sessions = await this.getTimerSessions(config?.userId || 'anonymous');
      
      const session = {
        id: `timer-session-${Date.now()}`,
        date: new Date(),
        duration: config?.duration || (this.timerState ? (this.timerState.totalDuration - this.timerState.timeRemaining) / 60 : 0),
        preset: config?.id || 'custom',
        completed: status === 'completed',
        status
      };

      sessions.push(session);
      
      // Keep only last 50 sessions
      const recentSessions = sessions.slice(-50);
      
      await offlineStorageService.setSetting(`sleepTimerSessions_${config?.userId || 'anonymous'}`, recentSessions);
    } catch (error) {
      console.error('Error saving timer session:', error);
    }
  }

  private async getTimerSessions(userId: string): Promise<any[]> {
    try {
      return await offlineStorageService.getSetting(`sleepTimerSessions_${userId}`) || [];
    } catch (error) {
      console.error('Error getting timer sessions:', error);
      return [];
    }
  }

  private generateSleepRecommendations(sessions: any[]): string[] {
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    
    const recommendations = [
      'Konsisten menggunakan sleep timer membantu mengatur pola istirahat yang sehat'
    ];

    if (avgDuration > 30) {
      recommendations.push('Pertimbangkan mengurangi durasi timer untuk menghindari deep sleep dan grogginess');
    } else if (avgDuration < 10) {
      recommendations.push('Timer yang lebih panjang (15-20 menit) mungkin memberikan istirahat yang lebih optimal');
    }

    recommendations.push('Gunakan fade-out yang lembut untuk transisi yang natural dari meditasi ke istirahat');
    
    return recommendations;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

export const sleepTimerService = SleepTimerService.getInstance();