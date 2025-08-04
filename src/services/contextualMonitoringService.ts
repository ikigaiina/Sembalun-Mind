import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { progressService } from './progressService';
import { smartNotificationService } from './smartNotificationService';

export interface StressPattern {
  userId: string;
  detectedAt: Date;
  stressLevel: number; // 1-5 scale
  triggers: string[];
  context: {
    timeOfDay: string;
    dayOfWeek: number;
    recentActivities: string[];
    environmentalFactors: string[];
  };
  recommendations: string[];
  severity: 'low' | 'moderate' | 'high' | 'severe';
}

export interface MoodPattern {
  userId: string;
  detectedAt: Date;
  moodState: {
    overall: number;
    energy: number;
    anxiety: number;
    happiness: number;
    stress: number;
    focus: number;
  };
  trend: 'improving' | 'declining' | 'stable' | 'fluctuating';
  duration: 'short_term' | 'medium_term' | 'long_term';
  triggers: string[];
  recommendations: string[];
}

export interface ContextualAlert {
  id: string;
  userId: string;
  type: 'stress_spike' | 'mood_decline' | 'anxiety_peak' | 'energy_crash' | 'focus_drop';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  pattern: StressPattern | MoodPattern;
  interventionSuggested: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  notificationSent: boolean;
  userResponded: boolean;
  effectiveness?: number; // 1-5 scale if user provides feedback
}

export interface WellbeingInsight {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  insights: {
    stressPatterns: string[];
    moodTrends: string[];
    effectiveTechniques: string[];
    optimalTimes: string[];
    riskFactors: string[];
  };
  recommendations: {
    immediate: string[];
    behavioral: string[];
    lifestyle: string[];
  };
  generatedAt: Date;
}

export class ContextualMonitoringService {
  private static instance: ContextualMonitoringService;

  static getInstance(): ContextualMonitoringService {
    if (!ContextualMonitoringService.instance) {
      ContextualMonitoringService.instance = new ContextualMonitoringService();
    }
    return ContextualMonitoringService.instance;
  }

  async monitorStressPatterns(userId: string): Promise<void> {
    try {
      const recentSessions = await progressService.getMeditationSessions(userId, 10);
      const recentMoods = await progressService.getMoodEntries(userId, 20);
      
      // Analyze stress patterns
      const stressPattern = this.analyzeStressLevels(recentSessions, recentMoods);
      
      if (stressPattern && this.shouldTriggerStressAlert(stressPattern)) {
        await this.createContextualAlert(userId, 'stress_spike', stressPattern);
      }

      // Check for chronic stress indicators
      const chronicStress = this.detectChronicStress(recentMoods);
      if (chronicStress) {
        await this.createContextualAlert(userId, 'stress_spike', chronicStress);
      }
    } catch (error) {
      console.error('Error monitoring stress patterns:', error);
    }
  }

  async monitorMoodPatterns(userId: string): Promise<void> {
    try {
      const recentMoods = await progressService.getMoodEntries(userId, 30);
      
      if (recentMoods.length < 3) return; // Need minimum data

      // Analyze mood trends
      const moodPattern = this.analyzeMoodTrends(recentMoods);
      
      if (this.shouldTriggerMoodAlert(moodPattern)) {
        const alertType = this.determineMoodAlertType(moodPattern);
        await this.createContextualAlert(userId, alertType, moodPattern);
      }

      // Check for concerning patterns
      const concerningPatterns = this.detectConcerningMoodPatterns(recentMoods);
      for (const pattern of concerningPatterns) {
        await this.createContextualAlert(userId, 'mood_decline', pattern);
      }
    } catch (error) {
      console.error('Error monitoring mood patterns:', error);
    }
  }

  async detectEmotionalStates(userId: string): Promise<{
    currentState: string;
    confidence: number;
    recommendations: string[];
  }> {
    try {
      const latestMood = await this.getLatestMoodEntry(userId);
      const recentSessions = await progressService.getMeditationSessions(userId, 5);
      
      if (!latestMood) {
        return {
          currentState: 'unknown',
          confidence: 0,
          recommendations: ['Lakukan mood check-in untuk mendapat insight yang lebih baik']
        };
      }

      const state = this.analyzeCurrentEmotionalState(latestMood, recentSessions);
      return state;
    } catch (error) {
      console.error('Error detecting emotional states:', error);
      return {
        currentState: 'unknown',
        confidence: 0,
        recommendations: []
      };
    }
  }

  async generateWellbeingInsights(userId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<WellbeingInsight> {
    try {
      const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const sessions = await progressService.getMeditationSessions(userId, 100);
      const moods = await progressService.getMoodEntries(userId, 100);
      
      const periodSessions = sessions.filter(s => (s as any).createdAt >= cutoffDate);
      const periodMoods = moods.filter(m => (m as any).createdAt >= cutoffDate);

      const insights = this.analyzeWellbeingData(periodSessions, periodMoods);
      
      return {
        userId,
        period,
        insights,
        recommendations: this.generateWellbeingRecommendations(insights),
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating wellbeing insights:', error);
      throw error;
    }
  }

  async createContextualIntervention(
    userId: string, 
    context: 'high_stress' | 'low_mood' | 'anxiety_spike' | 'fatigue',
    urgency: 'low' | 'medium' | 'high'
  ): Promise<void> {
    try {
      const intervention = this.designContextualIntervention(context, urgency);
      
      // Send immediate notification
      await smartNotificationService.generateContextualNotification(
        userId,
        this.mapContextToNotificationType(context)
      );

      // Log intervention for tracking
      await addDoc(collection(db, 'contextual_interventions'), {
        userId,
        context,
        urgency,
        intervention,
        createdAt: Timestamp.fromDate(new Date()),
        completed: false
      });
    } catch (error) {
      console.error('Error creating contextual intervention:', error);
      throw error;
    }
  }

  async trackInterventionEffectiveness(
    interventionId: string,
    userFeedback: {
      helpful: boolean;
      rating: number; // 1-5
      followedSuggestion: boolean;
      additionalNotes?: string;
    }
  ): Promise<void> {
    try {
      // Update intervention record with feedback
      const docRef = doc(db, 'contextual_interventions', interventionId);
      // In production, you'd update the document with feedback
      
      // Analyze effectiveness for future improvements
      await this.analyzeInterventionEffectiveness(userFeedback);
    } catch (error) {
      console.error('Error tracking intervention effectiveness:', error);
      throw error;
    }
  }

  private analyzeStressLevels(sessions: any[], moods: any[]): StressPattern | null {
    if (sessions.length === 0 && moods.length === 0) return null;

    // Get latest stress indicators
    const latestSession = sessions[0];
    const latestMood = moods[0];
    
    let stressLevel = 0;
    const triggers: string[] = [];

    if (latestSession?.stressLevel) {
      stressLevel = Math.max(stressLevel, latestSession.stressLevel);
    }

    if (latestMood?.stress) {
      stressLevel = Math.max(stressLevel, latestMood.stress);
    }

    // Analyze patterns in recent data
    const recentHighStress = moods.filter(m => 
      m.stress >= 4 && 
      (Date.now() - m.createdAt.getTime()) < (24 * 60 * 60 * 1000)
    );

    if (recentHighStress.length >= 2) {
      triggers.push('Multiple high stress episodes in 24h');
    }

    // Check for stress triggers
    if (latestSession && latestSession.quality < 3) {
      triggers.push('Difficulty in meditation focus');
    }

    if (moods.length >= 3) {
      const avgStress = moods.slice(0, 3).reduce((sum, m) => sum + (m.stress || 0), 0) / 3;
      if (avgStress >= 3.5) {
        triggers.push('Sustained elevated stress levels');
      }
    }

    if (stressLevel >= 4 || triggers.length > 0) {
      return {
        userId: sessions[0]?.userId || moods[0]?.userId,
        detectedAt: new Date(),
        stressLevel,
        triggers,
        context: {
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                    new Date().getHours() < 17 ? 'afternoon' : 'evening',
          dayOfWeek: new Date().getDay(),
          recentActivities: ['meditation_session'], // Would be more comprehensive
          environmentalFactors: []
        },
        recommendations: this.generateStressRecommendations(stressLevel, triggers),
        severity: this.determineSeverity(stressLevel, triggers.length)
      };
    }

    return null;
  }

  private analyzeMoodTrends(moods: any[]): MoodPattern {
    if (moods.length < 3) {
      throw new Error('Insufficient mood data for pattern analysis');
    }

    const latest = moods[0];
    const recent = moods.slice(0, 7); // Last week
    
    // Calculate trend
    const trend = this.calculateMoodTrend(recent);
    
    // Analyze mood components
    const moodState = {
      overall: latest.overall || 3,
      energy: latest.energy || 3,
      anxiety: latest.anxiety || 3,
      happiness: latest.happiness || 3,
      stress: latest.stress || 3,
      focus: latest.focus || 3
    };

    // Identify triggers
    const triggers = this.identifyMoodTriggers(recent);

    return {
      userId: latest.userId,
      detectedAt: new Date(),
      moodState,
      trend,
      duration: this.determineMoodDuration(recent),
      triggers,
      recommendations: this.generateMoodRecommendations(moodState, trend)
    };
  }

  private shouldTriggerStressAlert(pattern: StressPattern): boolean {
    return pattern.stressLevel >= 4 || 
           pattern.severity === 'high' || 
           pattern.severity === 'severe';
  }

  private shouldTriggerMoodAlert(pattern: MoodPattern): boolean {
    return pattern.moodState.overall <= 2 || 
           pattern.trend === 'declining' ||
           pattern.moodState.anxiety >= 4;
  }

  private determineMoodAlertType(pattern: MoodPattern): ContextualAlert['type'] {
    if (pattern.moodState.anxiety >= 4) return 'anxiety_peak';
    if (pattern.moodState.energy <= 2) return 'energy_crash';
    if (pattern.moodState.focus <= 2) return 'focus_drop';
    return 'mood_decline';
  }

  private async createContextualAlert(
    userId: string, 
    type: ContextualAlert['type'], 
    pattern: StressPattern | MoodPattern
  ): Promise<void> {
    try {
      const severity = this.determineAlertSeverity(type, pattern);
      const intervention = this.generateIntervention(type, severity);

      const alert: Omit<ContextualAlert, 'id'> = {
        userId,
        type,
        severity,
        detectedAt: new Date(),
        pattern,
        interventionSuggested: intervention,
        notificationSent: false,
        userResponded: false
      };

      const docRef = await addDoc(collection(db, 'contextual_alerts'), {
        ...alert,
        detectedAt: Timestamp.fromDate(alert.detectedAt)
      });

      // Send notification if severity warrants it
      if (severity === 'high' || severity === 'critical') {
        await smartNotificationService.generateContextualNotification(
          userId,
          this.mapAlertTypeToNotification(type)
        );
        
        // Update alert to mark notification as sent
        // await updateDoc(doc(db, 'contextual_alerts', docRef.id), {
        //   notificationSent: true
        // });
      }
    } catch (error) {
      console.error('Error creating contextual alert:', error);
      throw error;
    }
  }

  private detectChronicStress(moods: any[]): StressPattern | null {
    if (moods.length < 7) return null;

    const recentWeek = moods.slice(0, 7);
    const avgStress = recentWeek.reduce((sum, m) => sum + (m.stress || 0), 0) / recentWeek.length;
    const highStressDays = recentWeek.filter(m => (m.stress || 0) >= 4).length;

    if (avgStress >= 3.5 || highStressDays >= 4) {
      return {
        userId: moods[0].userId,
        detectedAt: new Date(),
        stressLevel: avgStress,
        triggers: [
          'Chronic stress pattern detected',
          `${highStressDays} high stress days in past week`
        ],
        context: {
          timeOfDay: 'multiple',
          dayOfWeek: -1, // Multiple days
          recentActivities: [],
          environmentalFactors: ['chronic_stress_pattern']
        },
        recommendations: [
          'Consider speaking with a healthcare professional',
          'Increase meditation frequency to daily practice',
          'Try longer meditation sessions (20+ minutes)',
          'Explore stress management techniques beyond meditation'
        ],
        severity: 'severe'
      };
    }

    return null;
  }

  private detectConcerningMoodPatterns(moods: any[]): MoodPattern[] {
    const patterns: MoodPattern[] = [];

    if (moods.length < 5) return patterns;

    // Check for sustained low mood
    const recent5 = moods.slice(0, 5);
    const avgMood = recent5.reduce((sum, m) => sum + (m.overall || 3), 0) / recent5.length;
    
    if (avgMood <= 2.5) {
      patterns.push({
        userId: moods[0].userId,
        detectedAt: new Date(),
        moodState: {
          overall: avgMood,
          energy: recent5.reduce((sum, m) => sum + (m.energy || 3), 0) / recent5.length,
          anxiety: recent5.reduce((sum, m) => sum + (m.anxiety || 3), 0) / recent5.length,
          happiness: recent5.reduce((sum, m) => sum + (m.happiness || 3), 0) / recent5.length,
          stress: recent5.reduce((sum, m) => sum + (m.stress || 3), 0) / recent5.length,
          focus: recent5.reduce((sum, m) => sum + (m.focus || 3), 0) / recent5.length
        },
        trend: 'declining',
        duration: 'medium_term',
        triggers: ['Sustained low mood pattern'],
        recommendations: [
          'Consider increasing meditation frequency',
          'Try loving-kindness meditation for mood boost',
          'Reach out to support network if needed'
        ]
      });
    }

    return patterns;
  }

  private async getLatestMoodEntry(userId: string): Promise<any> {
    const moods = await progressService.getMoodEntries(userId, 1);
    return moods[0] || null;
  }

  private analyzeCurrentEmotionalState(latestMood: any, recentSessions: any[]): {
    currentState: string;
    confidence: number;
    recommendations: string[];
  } {
    const mood = latestMood.overall || 3;
    const stress = latestMood.stress || 3;
    const anxiety = latestMood.anxiety || 3;
    const energy = latestMood.energy || 3;

    let state = '';
    let confidence = 0.7;
    const recommendations: string[] = [];

    // Determine emotional state
    if (stress >= 4) {
      state = 'high_stress';
      recommendations.push('Try breathing meditation untuk calm the nervous system');
      recommendations.push('Consider body scan untuk release physical tension');
    } else if (anxiety >= 4) {
      state = 'anxious';
      recommendations.push('Grounding techniques bisa membantu anxiety');
      recommendations.push('Mindfulness meditation for present moment awareness');
    } else if (mood <= 2) {
      state = 'low_mood';
      recommendations.push('Loving-kindness meditation untuk mood boost');
      recommendations.push('Gratitude practice bisa shift perspective');
    } else if (energy <= 2) {
      state = 'low_energy';
      recommendations.push('Energizing breath work untuk restore vitality');
      recommendations.push('Walking meditation untuk gentle energy boost');
    } else if (mood >= 4 && stress <= 2) {
      state = 'balanced';
      recommendations.push('Maintain balance dengan daily mindfulness practice');
      recommendations.push('Perfect time untuk deeper meditation techniques');
    } else {
      state = 'neutral';
      recommendations.push('Good foundation untuk build stronger meditation habit');
    }

    // Adjust confidence based on recent session data
    if (recentSessions.length > 0) {
      const avgQuality = recentSessions.reduce((sum, s) => sum + s.quality, 0) / recentSessions.length;
      if (avgQuality >= 4) confidence += 0.2;
      if (avgQuality <= 2) confidence -= 0.1;
    }

    return {
      currentState: state,
      confidence: Math.min(0.95, Math.max(0.3, confidence)),
      recommendations
    };
  }

  private analyzeWellbeingData(sessions: any[], moods: any[]): WellbeingInsight['insights'] {
    const stressPatterns = this.analyzeStressPatterns(moods);
    const moodTrends = this.analyzeMoodTrendsForInsights(moods);
    const effectiveTechniques = this.analyzeEffectiveTechniques(sessions);
    const optimalTimes = this.analyzeOptimalTimes(sessions, moods);
    const riskFactors = this.identifyRiskFactors(sessions, moods);

    return {
      stressPatterns,
      moodTrends,
      effectiveTechniques,
      optimalTimes,
      riskFactors
    };
  }

  private generateWellbeingRecommendations(insights: WellbeingInsight['insights']): WellbeingInsight['recommendations'] {
    const immediate: string[] = [];
    const behavioral: string[] = [];
    const lifestyle: string[] = [];

    // Immediate recommendations based on current patterns
    if (insights.stressPatterns.some(p => p.includes('high'))) {
      immediate.push('Practice breathing meditation 2x today');
      immediate.push('Take mindful breaks every 2 hours');
    }

    if (insights.moodTrends.some(t => t.includes('declining'))) {
      immediate.push('Try loving-kindness meditation');
      immediate.push('Connect with support network');
    }

    // Behavioral recommendations
    if (insights.effectiveTechniques.length > 0) {
      behavioral.push(`Focus on ${insights.effectiveTechniques[0]} - it works best for you`);
    }

    if (insights.optimalTimes.length > 0) {
      behavioral.push(`Schedule meditation at ${insights.optimalTimes[0]} for best results`);
    }

    behavioral.push('Build consistent daily practice, even if just 5 minutes');

    // Lifestyle recommendations
    if (insights.riskFactors.some(r => r.includes('inconsistent'))) {
      lifestyle.push('Create meditation environment di rumah');
      lifestyle.push('Set daily reminder untuk meditation time');
    }

    lifestyle.push('Consider meditation retreat atau workshop untuk deepen practice');

    return {
      immediate,
      behavioral,
      lifestyle
    };
  }

  private designContextualIntervention(context: string, urgency: string): ContextualAlert['interventionSuggested'] {
    const interventions = {
      high_stress: {
        immediate: [
          '4-7-8 breathing technique (4 napas masuk, 7 tahan, 8 buang)',
          'Progressive muscle relaxation mulai dari kaki ke kepala',
          'Mindful walking 5 menit di tempat yang tenang'
        ],
        shortTerm: [
          'Daily stress-relief meditation 15 menit',
          'Body scan meditation sebelum tidur',
          'Mindfulness breaks setiap 2 jam'
        ],
        longTerm: [
          'Explore stress management techniques',
          'Build stronger meditation habit',
          'Consider professional support if needed'
        ]
      },
      low_mood: {
        immediate: [
          'Loving-kindness meditation untuk diri sendiri',
          'Gratitude practice - tulis 3 hal yang disyukuri',
          'Gentle movement atau stretching mindful'
        ],
        shortTerm: [
          'Daily compassion meditation',
          'Connect dengan orang-orang tersayang',
          'Journaling untuk emotional processing'
        ],
        longTerm: [
          'Build support network',
          'Explore creative outlets',
          'Consider counseling if mood persists'
        ]
      },
      anxiety_spike: {
        immediate: [
          'Grounding technique: 5 hal yang dilihat, 4 yang didengar, 3 yang diraba',
          'Deep breathing dengan exhale lebih panjang dari inhale',
          'Mindful observation of present moment'
        ],
        shortTerm: [
          'Regular anxiety-relief meditation',
          'Build mindfulness throughout daily activities',
          'Create calming bedtime routine'
        ],
        longTerm: [
          'Learn anxiety management strategies',
          'Build resilience through consistent practice',
          'Professional support for persistent anxiety'
        ]
      },
      fatigue: {
        immediate: [
          'Energizing breath work (kapalabhati or bellows breath)',
          'Mindful stretching untuk wake up the body',
          'Brief walking meditation outdoor'
        ],
        shortTerm: [
          'Morning meditation routine untuk energy boost',
          'Midday energy restoration practice',
          'Better sleep hygiene with evening wind-down'
        ],
        longTerm: [
          'Optimize daily energy through meditation',
          'Balance activity and rest mindfully',
          'Address underlying fatigue causes'
        ]
      }
    };

    return interventions[context as keyof typeof interventions] || interventions.high_stress;
  }

  private mapContextToNotificationType(context: string): 'stress_detected' | 'mood_low' | 'energy_low' | 'anxiety_high' {
    const mapping = {
      high_stress: 'stress_detected' as const,
      low_mood: 'mood_low' as const,
      anxiety_spike: 'anxiety_high' as const,
      fatigue: 'energy_low' as const
    };

    return mapping[context as keyof typeof mapping] || 'stress_detected';
  }

  private determineAlertSeverity(type: ContextualAlert['type'], pattern: any): ContextualAlert['severity'] {
    if (type === 'anxiety_peak' && pattern.moodState?.anxiety >= 4.5) return 'critical';
    if (type === 'stress_spike' && pattern.stressLevel >= 4.5) return 'high';
    if (type === 'mood_decline' && pattern.moodState?.overall <= 1.5) return 'high';
    if (type === 'energy_crash' && pattern.moodState?.energy <= 1.5) return 'medium';
    return 'low';
  }

  private generateIntervention(type: ContextualAlert['type'], severity: ContextualAlert['severity']): ContextualAlert['interventionSuggested'] {
    // Map alert types to intervention contexts
    const contextMap = {
      stress_spike: 'high_stress',
      mood_decline: 'low_mood',
      anxiety_peak: 'anxiety_spike',
      energy_crash: 'fatigue',
      focus_drop: 'fatigue'
    };

    const context = contextMap[type] || 'high_stress';
    return this.designContextualIntervention(context, severity);
  }

  private mapAlertTypeToNotification(type: ContextualAlert['type']): 'stress_detected' | 'mood_low' | 'energy_low' | 'anxiety_high' {
    const mapping = {
      stress_spike: 'stress_detected' as const,
      mood_decline: 'mood_low' as const,
      anxiety_peak: 'anxiety_high' as const,
      energy_crash: 'energy_low' as const,
      focus_drop: 'energy_low' as const
    };

    return mapping[type] || 'stress_detected';
  }

  // Helper methods for pattern analysis
  private calculateMoodTrend(moods: any[]): MoodPattern['trend'] {
    if (moods.length < 3) return 'stable';

    const recent = moods.slice(0, 3).reduce((sum, m) => sum + (m.overall || 3), 0) / 3;
    const older = moods.slice(3, 6).reduce((sum, m) => sum + (m.overall || 3), 0) / Math.max(1, moods.slice(3, 6).length);

    const change = recent - older;
    if (change > 0.5) return 'improving';
    if (change < -0.5) return 'declining';
    
    // Check for fluctuation
    const variance = this.calculateVariance(moods.slice(0, 5).map(m => m.overall || 3));
    if (variance > 1) return 'fluctuating';
    
    return 'stable';
  }

  private determineMoodDuration(moods: any[]): MoodPattern['duration'] {
    const daysSpan = moods.length;
    if (daysSpan <= 3) return 'short_term';
    if (daysSpan <= 10) return 'medium_term';
    return 'long_term';
  }

  private identifyMoodTriggers(moods: any[]): string[] {
    const triggers: string[] = [];
    
    // Analyze patterns
    const weekendMoods = moods.filter(m => {
      const day = m.createdAt.getDay();
      return day === 0 || day === 6;
    });
    
    const weekdayMoods = moods.filter(m => {
      const day = m.createdAt.getDay();
      return day >= 1 && day <= 5;
    });

    if (weekendMoods.length > 0 && weekdayMoods.length > 0) {
      const weekendAvg = weekendMoods.reduce((sum, m) => sum + (m.overall || 3), 0) / weekendMoods.length;
      const weekdayAvg = weekdayMoods.reduce((sum, m) => sum + (m.overall || 3), 0) / weekdayMoods.length;
      
      if (weekdayAvg < weekendAvg - 0.5) {
        triggers.push('Weekday stress pattern');
      }
    }

    return triggers;
  }

  private generateStressRecommendations(stressLevel: number, triggers: string[]): string[] {
    const recommendations = [];
    
    if (stressLevel >= 4) {
      recommendations.push('Immediate stress relief: 4-7-8 breathing technique');
      recommendations.push('Body scan meditation untuk release tension');
    }
    
    if (triggers.includes('Multiple high stress episodes in 24h')) {
      recommendations.push('Consider shorter, more frequent meditation breaks');
      recommendations.push('Mindful transitions between activities');
    }
    
    recommendations.push('Daily stress-prevention meditation');
    recommendations.push('Identify and address stress triggers when possible');
    
    return recommendations;
  }

  private generateMoodRecommendations(moodState: any, trend: string): string[] {
    const recommendations = [];
    
    if (moodState.overall <= 2) {
      recommendations.push('Loving-kindness meditation untuk mood boost');
      recommendations.push('Gratitude practice - 3 things you\'re grateful for');
    }
    
    if (moodState.anxiety >= 4) {
      recommendations.push('Grounding techniques untuk anxiety relief');
      recommendations.push('Present moment awareness meditation');
    }
    
    if (trend === 'declining') {
      recommendations.push('Increase meditation frequency');
      recommendations.push('Connect with support network');
    }
    
    return recommendations;
  }

  private determineSeverity(stressLevel: number, triggerCount: number): StressPattern['severity'] {
    if (stressLevel >= 4.5 || triggerCount >= 3) return 'severe';
    if (stressLevel >= 4 || triggerCount >= 2) return 'high';
    if (stressLevel >= 3 || triggerCount >= 1) return 'moderate';
    return 'low';
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private analyzeStressPatterns(moods: any[]): string[] {
    const patterns: string[] = [];
    
    if (moods.length === 0) return patterns;
    
    const avgStress = moods.reduce((sum, m) => sum + (m.stress || 0), 0) / moods.length;
    if (avgStress >= 3.5) patterns.push('Elevated average stress levels');
    
    const highStressDays = moods.filter(m => (m.stress || 0) >= 4).length;
    if (highStressDays >= 3) patterns.push(`${highStressDays} high stress days detected`);
    
    return patterns;
  }

  private analyzeMoodTrendsForInsights(moods: any[]): string[] {
    const trends: string[] = [];
    
    if (moods.length < 3) return trends;
    
    const trend = this.calculateMoodTrend(moods);
    trends.push(`Overall mood trend: ${trend}`);
    
    const avgMood = moods.reduce((sum, m) => sum + (m.overall || 3), 0) / moods.length;
    if (avgMood >= 4) trends.push('Generally positive mood levels');
    if (avgMood <= 2.5) trends.push('Below average mood levels');
    
    return trends;
  }

  private analyzeEffectiveTechniques(sessions: any[]): string[] {
    if (sessions.length === 0) return [];
    
    const techniqueEffectiveness: { [technique: string]: number[] } = {};
    
    sessions.forEach(session => {
      if (session.techniques && session.quality) {
        session.techniques.forEach((technique: string) => {
          if (!techniqueEffectiveness[technique]) {
            techniqueEffectiveness[technique] = [];
          }
          techniqueEffectiveness[technique].push(session.quality);
        });
      }
    });
    
    return Object.entries(techniqueEffectiveness)
      .map(([technique, qualities]) => ({
        technique,
        avgQuality: qualities.reduce((sum, q) => sum + q, 0) / qualities.length
      }))
      .sort((a, b) => b.avgQuality - a.avgQuality)
      .slice(0, 3)
      .map(item => item.technique);
  }

  private analyzeOptimalTimes(sessions: any[], moods: any[]): string[] {
    if (sessions.length === 0) return [];
    
    const timeEffectiveness: { [hour: number]: number[] } = {};
    
    sessions.forEach(session => {
      if (session.moodBefore && session.moodAfter) {
        const hour = new Date(session.date).getHours();
        const improvement = session.moodAfter - session.moodBefore;
        
        if (!timeEffectiveness[hour]) {
          timeEffectiveness[hour] = [];
        }
        timeEffectiveness[hour].push(improvement);
      }
    });
    
    return Object.entries(timeEffectiveness)
      .map(([hour, improvements]) => ({
        hour: parseInt(hour),
        avgImprovement: improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length
      }))
      .sort((a, b) => b.avgImprovement - a.avgImprovement)
      .slice(0, 2)
      .map(item => `${item.hour.toString().padStart(2, '0')}:00`);
  }

  private identifyRiskFactors(sessions: any[], moods: any[]): string[] {
    const riskFactors = [];
    
    // Check consistency
    if (sessions.length < 7) {
      riskFactors.push('Inconsistent meditation practice');
    }
    
    // Check session quality
    if (sessions.length > 0) {
      const avgQuality = sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length;
      if (avgQuality < 3) {
        riskFactors.push('Below average session quality');
      }
    }
    
    // Check mood volatility
    if (moods.length >= 5) {
      const moodValues = moods.slice(0, 5).map(m => m.overall || 3);
      const variance = this.calculateVariance(moodValues);
      if (variance > 1.5) {
        riskFactors.push('High mood volatility');
      }
    }
    
    return riskFactors;
  }

  private async analyzeInterventionEffectiveness(feedback: any): Promise<void> {
    // This would analyze feedback patterns to improve future interventions
    console.log('Analyzing intervention effectiveness:', feedback);
  }
}

export const contextualMonitoringService = ContextualMonitoringService.getInstance();