import { typedSupabase as supabase } from '../config/supabase';
import { progressService } from './progressService';
import { smartNotificationService } from './smartNotificationService';
import { contextualMonitoringService } from './contextualMonitoringService';
import type { MeditationSession, MoodEntry } from '../types/progress';

interface TimeEffectivenessData {
  sessions: number;
  avgQuality: number;
  moodImprovement: number;
  completionRate: number;
}

type TimeEffectivenessAnalysis = { [timeSlot: string]: TimeEffectivenessData };

interface SchedulePerformanceResult {
  effectiveness: number;
  adherence: number;
  suggestedChanges: ScheduleChange[];
}

interface ScheduleChange {
  type: 'time' | 'frequency' | 'duration';
  current: string | number;
  suggested: string | number;
  reason: string;
  confidence: number;
}

interface PredictivePatterns {
  weekdayPreference: { [day: string]: number };
  timePreference: { [hour: string]: number };
  seasonalTrends: { [season: string]: number };
  consistencyScore: number;
  dayPatterns?: { [day: string]: unknown };
  timePatterns?: { [time: string]: unknown };
  keyFactors?: string[];
}

export interface OptimalTimeSlot {
  id: string;
  userId: string;
  timeSlot: string; // HH:MM format
  dayOfWeek: number; // 0-6, Sunday=0
  confidence: number; // 0-1 scale
  effectiveness: {
    moodImprovement: number;
    stressReduction: number;
    sessionQuality: number;
    completion: number;
  };
  basedOnSessions: number;
  environmental: {
    isQuietTime: boolean;
    naturalLight: boolean;
    lowActivity: boolean;
  };
  personalFactors: {
    energyLevel: 'low' | 'medium' | 'high';
    stressLevel: 'low' | 'medium' | 'high';
    availability: 'low' | 'medium' | 'high';
  };
  createdAt: Date;
  lastUpdated: Date;
}

export interface SmartSchedule {
  id: string;
  userId: string;
  scheduleType: 'daily' | 'weekly' | 'flexible' | 'intensive';
  timeSlots: OptimalTimeSlot[];
  adaptiveSettings: {
    autoAdjust: boolean;
    respectQuietHours: boolean;
    considerMoodPatterns: boolean;
    adaptToLifestyle: boolean;
  };
  personalPreferences: {
    preferredDuration: number; // minutes
    preferredTechniques: string[];
    minimumGap: number; // hours between sessions
    maxSessionsPerDay: number;
  };
  effectiveness: {
    adherenceRate: number; // 0-100%
    avgSessionQuality: number;
    moodImprovementRate: number;
    stressReductionRate: number;
  };
  nextRecommendations: ScheduleRecommendation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleRecommendation {
  recommendedTime: string;
  dayOfWeek?: number;
  duration: number;
  technique: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  contextualFactors: {
    weatherConsideration?: string;
    stressLevelPrediction?: string;
    energyLevelPrediction?: string;
  };
}

export interface CircadianAnalysis {
  userId: string;
  naturalRhythm: {
    morningType: 'early' | 'regular' | 'late';
    energyPeaks: string[]; // time slots
    lowEnergyPeriods: string[];
    optimalFocusTimes: string[];
  };
  sleepPattern: {
    averageBedtime: string;
    averageWakeTime: string;
    sleepQuality: number; // 1-5 scale
    consistency: number; // 0-1 scale
  };
  recommendations: {
    morningMeditation: ScheduleRecommendation;
    middayRefresh: ScheduleRecommendation;
    eveningWinddown: ScheduleRecommendation;
  };
  lastAnalyzed: Date;
}

export interface LifestylePattern {
  userId: string;
  workSchedule: {
    type: 'regular' | 'shift' | 'flexible' | 'irregular';
    workDays: number[]; // 0-6, days of week
    workHours: {
      start: string;
      end: string;
    };
    breakTimes: string[];
  };
  socialPatterns: {
    busyTimes: string[];
    quietTimes: string[];
    familyTime: string[];
  };
  activityLevel: {
    morningActivity: 'low' | 'medium' | 'high';
    afternoonActivity: 'low' | 'medium' | 'high';
    eveningActivity: 'low' | 'medium' | 'high';
  };
  stressPatterns: {
    stressfulTimes: string[];
    relaxedTimes: string[];
    peakStressDays: number[];
  };
}

export class SmartSchedulingService {
  private static instance: SmartSchedulingService;

  static getInstance(): SmartSchedulingService {
    if (!SmartSchedulingService.instance) {
      SmartSchedulingService.instance = new SmartSchedulingService();
    }
    return SmartSchedulingService.instance;
  }

  async analyzeOptimalTimes(userId: string): Promise<OptimalTimeSlot[]> {
    try {
      const sessions = await progressService.getMeditationSessions(userId, 100);
      const moods = await progressService.getMoodEntries(userId, 50);
      
      if (sessions.length < 5) {
        return this.generateDefaultTimeSlots(userId);
      }

      const timeAnalysis = this.analyzeSessionTimes(sessions, moods);
      const circadianAnalysis = await this.analyzeCircadianRhythm(userId, sessions);
      const lifestylePattern = await this.analyzeLifestylePattern(userId, sessions);

      const optimalSlots = this.calculateOptimalTimeSlots(
        timeAnalysis,
        circadianAnalysis,
        lifestylePattern
      );

      // Save to database
      for (const slot of optimalSlots) {
        const { error } = await supabase.from('optimal_time_slots').insert({
          user_id: slot.userId,
          time_slot: slot.timeSlot,
          day_of_week: slot.dayOfWeek,
          confidence: slot.confidence,
          effectiveness: slot.effectiveness,
          based_on_sessions: slot.basedOnSessions,
          environmental: slot.environmental,
          personal_factors: slot.personalFactors,
          created_at: slot.createdAt.toISOString(),
          last_updated: slot.lastUpdated.toISOString()
        });
        if (error) throw error;
      }

      return optimalSlots;
    } catch (error) {
      console.error('Error analyzing optimal times:', error);
      return this.generateDefaultTimeSlots(userId);
    }
  }

  async createSmartSchedule(
    userId: string,
    preferences: {
      scheduleType: SmartSchedule['scheduleType'];
      dailyDuration?: number;
      maxSessionsPerDay?: number;
      preferredTechniques?: string[];
    }
  ): Promise<SmartSchedule> {
    try {
      const optimalTimes = await this.analyzeOptimalTimes(userId);
      const circadian = await this.analyzeCircadianRhythm(userId);
      
      const schedule: Omit<SmartSchedule, 'id'> = {
        userId,
        scheduleType: preferences.scheduleType,
        timeSlots: optimalTimes.slice(0, preferences.maxSessionsPerDay || 3),
        adaptiveSettings: {
          autoAdjust: true,
          respectQuietHours: true,
          considerMoodPatterns: true,
          adaptToLifestyle: true
        },
        personalPreferences: {
          preferredDuration: preferences.dailyDuration || 15,
          preferredTechniques: preferences.preferredTechniques || ['mindfulness', 'breathing'],
          minimumGap: 4, // 4 hours between sessions
          maxSessionsPerDay: preferences.maxSessionsPerDay || 3
        },
        effectiveness: {
          adherenceRate: 0,
          avgSessionQuality: 0,
          moodImprovementRate: 0,
          stressReductionRate: 0
        },
        nextRecommendations: this.generateInitialRecommendations(optimalTimes, circadian),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { data, error } = await supabase.from('smart_schedules').insert({
        user_id: schedule.userId,
        schedule_type: schedule.scheduleType,
        time_slots: schedule.timeSlots,
        adaptive_settings: schedule.adaptiveSettings,
        personal_preferences: schedule.personalPreferences,
        effectiveness: schedule.effectiveness,
        next_recommendations: schedule.nextRecommendations,
        created_at: schedule.createdAt.toISOString(),
        updated_at: schedule.updatedAt.toISOString()
      }).select();

      if (error) throw error;
      if (!data) throw new Error('Failed to create smart schedule');
      const docRef = data[0];

      const savedSchedule = { id: docRef.id, ...schedule };

      // Schedule initial notifications
      await this.scheduleNotificationsForSchedule(savedSchedule);

      return savedSchedule;
    } catch (error) {
      console.error('Error creating smart schedule:', error);
      throw error;
    }
  }

  async adaptScheduleBasedOnPerformance(userId: string): Promise<SmartSchedule | null> {
    try {
      const currentSchedule = await this.getUserActiveSchedule(userId);
      if (!currentSchedule) return null;

      const recentSessions = await progressService.getMeditationSessions(userId, 30);
      const performanceAnalysis = this.analyzeSchedulePerformance(currentSchedule, recentSessions);

      if (performanceAnalysis.needsAdjustment) {
        const updatedSchedule = await this.adjustSchedule(currentSchedule, performanceAnalysis);
        return updatedSchedule;
      }

      return currentSchedule;
    } catch (error) {
      console.error('Error adapting schedule:', error);
      return null;
    }
  }

  async generateDynamicRecommendations(userId: string): Promise<ScheduleRecommendation[]> {
    try {
      const currentSchedule = await this.getUserActiveSchedule(userId);
      const recentMoods = await progressService.getMoodEntries(userId, 7);
      const currentEmotionalState = await contextualMonitoringService.detectEmotionalStates(userId);
      
      const recommendations: ScheduleRecommendation[] = [];

      // Context-aware recommendations
      if (currentEmotionalState.currentState === 'high_stress') {
        recommendations.push({
          recommendedTime: this.getNextAvailableTime(currentSchedule?.timeSlots || []),
          duration: 10,
          technique: 'breathing',
          reason: 'Stress relief needed - short breathing session dapat help immediately',
          priority: 'high',
          contextualFactors: {
            stressLevelPrediction: 'High stress detected, urgent intervention needed'
          }
        });
      }

      if (currentEmotionalState.currentState === 'low_energy') {
        recommendations.push({
          recommendedTime: this.getEnergyBoostTime(),
          duration: 8,
          technique: 'energizing_breath',
          reason: 'Energy boost needed - energizing breathwork dapat restore vitality',
          priority: 'medium',
          contextualFactors: {
            energyLevelPrediction: 'Low energy detected, energizing practice recommended'
          }
        });
      }

      // Proactive recommendations based on patterns
      const morningRecommendation = this.generateMorningRecommendation(recentMoods);
      if (morningRecommendation) recommendations.push(morningRecommendation);

      const eveningRecommendation = this.generateEveningRecommendation(recentMoods);
      if (eveningRecommendation) recommendations.push(eveningRecommendation);

      return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Error generating dynamic recommendations:', error);
      return [];
    }
  }

  async predictOptimalSchedule(userId: string, daysAhead: number = 7): Promise<{
    predictedSchedule: ScheduleRecommendation[];
    confidence: number;
    factors: string[];
  }> {
    try {
      const sessions = await progressService.getMeditationSessions(userId, 50);
      const moods = await progressService.getMoodEntries(userId, 30);
      const currentSchedule = await this.getUserActiveSchedule(userId);

      // Analyze patterns for prediction
      const patterns = this.analyzePredictivePatterns(sessions, moods);
      const predictedSchedule: ScheduleRecommendation[] = [];

      for (let day = 0; day < daysAhead; day++) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + day);
        
        const dayRecommendations = this.predictDaySchedule(
          targetDate,
          patterns,
          currentSchedule
        );
        
        predictedSchedule.push(...dayRecommendations);
      }

      const confidence = this.calculatePredictionConfidence(patterns, sessions.length);

      return {
        predictedSchedule,
        confidence,
        factors: [
          'Weekday preference patterns',
          'Time preference patterns', 
          'Seasonal meditation trends',
          `Consistency score: ${patterns.consistencyScore.toFixed(2)}`
        ]
      };
    } catch (error) {
      console.error('Error predicting optimal schedule:', error);
      return {
        predictedSchedule: [],
        confidence: 0,
        factors: []
      };
    }
  }

  async updateScheduleEffectiveness(scheduleId: string): Promise<void> {
    try {
      const schedule = await this.getScheduleById(scheduleId);
      if (!schedule) return;

      const recentSessions = await progressService.getMeditationSessions(schedule.userId, 30);
      const scheduledTimes = schedule.timeSlots.map(slot => slot.timeSlot);
      
      const effectiveness = this.calculateScheduleEffectiveness(
        scheduledTimes,
        recentSessions
      );

      const docRef = doc(db, 'smart_schedules', scheduleId);
      await updateDoc(docRef, {
        effectiveness,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating schedule effectiveness:', error);
    }
  }

  private analyzeSessionTimes(sessions: MeditationSession[], moods: MoodEntry[]): TimeEffectivenessAnalysis {
    const timeEffectiveness: { [timeSlot: string]: {
      sessions: number;
      avgQuality: number;
      moodImprovement: number;
      completionRate: number;
    } } = {};

    sessions.forEach(session => {
      const hour = new Date((session as any).createdAt || new Date()).getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!timeEffectiveness[timeSlot]) {
        timeEffectiveness[timeSlot] = {
          sessions: 0,
          avgQuality: 0,
          moodImprovement: 0,
          completionRate: 0
        };
      }

      const data = timeEffectiveness[timeSlot];
      data.sessions++;
      data.avgQuality = (data.avgQuality * (data.sessions - 1) + ((session as any).averageRating || 0)) / data.sessions;
      
      // Mood improvement tracking would require additional session data
      // if (session.moodBefore && session.moodAfter) {
      //   const improvement = session.moodAfter - session.moodBefore;
      //   data.moodImprovement = (data.moodImprovement * (data.sessions - 1) + improvement) / data.sessions;
      // }
      
      const completionRate = 1; // Assuming completed sessions have 100% completion rate
      data.completionRate = (data.completionRate * (data.sessions - 1) + completionRate) / data.sessions;
    });

    return timeEffectiveness;
  }

  private async analyzeCircadianRhythm(userId: string, sessions?: MeditationSession[]): Promise<CircadianAnalysis> {
    const userSessions = sessions || await progressService.getMeditationSessions(userId, 50);
    
    // Analyze natural patterns from session data
    const timeQuality: { [hour: number]: number[] } = {};
    const sessionTimes: number[] = [];

    userSessions.forEach(session => {
      const hour = new Date((session as any).createdAt || new Date()).getHours();
      sessionTimes.push(hour);
      
      if (!timeQuality[hour]) timeQuality[hour] = [];
      timeQuality[hour].push(((session as any).averageRating || 0));
    });

    // Determine morning type based on session times and quality
    const morningSessionsQuality = Object.entries(timeQuality)
      .filter(([hour]) => parseInt(hour) >= 6 && parseInt(hour) <= 10)
      .reduce((sum, [, qualities]) => sum + (qualities.reduce((a, b) => a + b, 0) / qualities.length), 0);

    const eveningSessionsQuality = Object.entries(timeQuality)
      .filter(([hour]) => parseInt(hour) >= 18 && parseInt(hour) <= 22)
      .reduce((sum, [, qualities]) => sum + (qualities.reduce((a, b) => a + b, 0) / qualities.length), 0);

    let morningType: CircadianAnalysis['naturalRhythm']['morningType'] = 'regular';
    if (morningSessionsQuality > eveningSessionsQuality + 0.5) morningType = 'early';
    else if (eveningSessionsQuality > morningSessionsQuality + 0.5) morningType = 'late';

    // Find energy peaks (times with highest quality scores)
    const energyPeaks = Object.entries(timeQuality)
      .sort(([,a], [,b]) => (b.reduce((sum, val) => sum + val, 0) / b.length) - (a.reduce((sum, val) => sum + val, 0) / a.length))
      .slice(0, 3)
      .map(([hour]) => `${hour.padStart(2, '0')}:00`);

    return {
      userId,
      naturalRhythm: {
        morningType,
        energyPeaks,
        lowEnergyPeriods: ['14:00', '16:00'], // Common low energy times
        optimalFocusTimes: energyPeaks
      },
      sleepPattern: {
        averageBedtime: morningType === 'early' ? '22:00' : morningType === 'late' ? '24:00' : '23:00',
        averageWakeTime: morningType === 'early' ? '06:00' : morningType === 'late' ? '08:00' : '07:00',
        sleepQuality: 4, // Would be calculated from sleep tracking if available
        consistency: 0.8
      },
      recommendations: {
        morningMeditation: {
          recommendedTime: morningType === 'early' ? '06:30' : morningType === 'late' ? '08:30' : '07:30',
          duration: 15,
          technique: 'mindfulness',
          reason: 'Morning practice untuk start the day with clarity',
          priority: 'high',
          contextualFactors: {}
        },
        middayRefresh: {
          recommendedTime: '12:30',
          duration: 10,
          technique: 'breathing',
          reason: 'Midday reset untuk maintain energy and focus',
          priority: 'medium',
          contextualFactors: {}
        },
        eveningWinddown: {
          recommendedTime: morningType === 'early' ? '20:30' : morningType === 'late' ? '22:30' : '21:30',
          duration: 20,
          technique: 'body_scan',
          reason: 'Evening practice untuk relax and prepare for sleep',
          priority: 'high',
          contextualFactors: {}
        }
      },
      lastAnalyzed: new Date()
    };
  }

  private async analyzeLifestylePattern(userId: string, sessions: MeditationSession[]): Promise<LifestylePattern> {
    // Analyze when user typically meditates to infer lifestyle
    const dayPatterns: { [day: number]: number[] } = {};
    
    sessions.forEach(session => {
      const date = new Date((session as any).createdAt);
      const day = date.getDay();
      const hour = date.getHours();
      
      if (!dayPatterns[day]) dayPatterns[day] = [];
      dayPatterns[day].push(hour);
    });

    // Infer work schedule
    const workDays = Object.keys(dayPatterns)
      .map(Number)
      .filter(day => day >= 1 && day <= 5); // Weekdays

    const workHourSessions = sessions.filter(session => {
      const hour = new Date((session as any).createdAt || new Date()).getHours();
      return hour >= 9 && hour <= 17;
    });

    return {
      userId,
      workSchedule: {
        type: workDays.length >= 4 ? 'regular' : 'flexible',
        workDays,
        workHours: {
          start: workHourSessions.length > 0 ? '09:00' : '08:00',
          end: workHourSessions.length > 0 ? '17:00' : '18:00'
        },
        breakTimes: ['12:00', '15:00']
      },
      socialPatterns: {
        busyTimes: ['09:00', '17:00', '19:00'],
        quietTimes: ['06:00', '22:00'],
        familyTime: ['18:00', '20:00']
      },
      activityLevel: {
        morningActivity: 'medium',
        afternoonActivity: 'high',
        eveningActivity: 'medium'
      },
      stressPatterns: {
        stressfulTimes: ['09:00', '14:00', '17:00'],
        relaxedTimes: ['07:00', '12:00', '21:00'],
        peakStressDays: [1, 3, 5] // Mon, Wed, Fri
      }
    };
  }

  private calculateOptimalTimeSlots(
    timeAnalysis: TimeEffectivenessAnalysis,
    circadian: CircadianAnalysis,
    lifestyle: LifestylePattern
  ): OptimalTimeSlot[] {
    const slots: OptimalTimeSlot[] = [];
    
    // Generate slots based on analysis
    const topTimes = Object.entries(timeAnalysis)
      .sort(([,a], [,b]) => b.avgQuality - a.avgQuality)
      .slice(0, 5);

    topTimes.forEach(([timeSlot, data]: [string, TimeEffectivenessData]) => {
      const hour = parseInt(timeSlot.split(':')[0]);
      
      slots.push({
        id: `${Date.now()}-${timeSlot}`,
        userId: circadian.userId,
        timeSlot,
        dayOfWeek: -1, // All days
        confidence: Math.min(0.9, data.sessions / 10),
        effectiveness: {
          moodImprovement: data.moodImprovement || 0,
          stressReduction: 0.5, // Would be calculated
          sessionQuality: data.avgQuality,
          completion: data.completionRate
        },
        basedOnSessions: data.sessions,
        environmental: {
          isQuietTime: hour < 8 || hour > 20,
          naturalLight: hour >= 6 && hour <= 18,
          lowActivity: hour < 9 || (hour >= 12 && hour <= 14) || hour > 19
        },
        personalFactors: this.assessPersonalFactors(hour, lifestyle),
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    });

    // Add circadian-based recommendations if not already included
    [circadian.recommendations.morningMeditation, circadian.recommendations.eveningWinddown]
      .forEach(rec => {
        if (!slots.some(slot => slot.timeSlot === rec.recommendedTime)) {
          slots.push({
            id: `${Date.now()}-${rec.recommendedTime}`,
            userId: circadian.userId,
            timeSlot: rec.recommendedTime,
            dayOfWeek: -1,
            confidence: 0.7,
            effectiveness: {
              moodImprovement: 0.5,
              stressReduction: 0.6,
              sessionQuality: 4,
              completion: 0.8
            },
            basedOnSessions: 0,
            environmental: {
              isQuietTime: true,
              naturalLight: rec.recommendedTime < '08:00' || rec.recommendedTime > '20:00' ? false : true,
              lowActivity: true
            },
            personalFactors: {
              energyLevel: rec.recommendedTime < '12:00' ? 'high' : 'medium',
              stressLevel: 'low',
              availability: 'high'
            },
            createdAt: new Date(),
            lastUpdated: new Date()
          });
        }
      });

    return slots.sort((a, b) => b.confidence - a.confidence).slice(0, 6);
  }

  private generateDefaultTimeSlots(userId: string): OptimalTimeSlot[] {
    const defaultTimes = ['07:00', '12:00', '19:00'];
    
    return defaultTimes.map((time, index) => ({
      id: `default-${Date.now()}-${index}`,
      userId,
      timeSlot: time,
      dayOfWeek: -1,
      confidence: 0.5,
      effectiveness: {
        moodImprovement: 0.5,
        stressReduction: 0.5,
        sessionQuality: 3.5,
        completion: 0.7
      },
      basedOnSessions: 0,
      environmental: {
        isQuietTime: time === '07:00' || time === '19:00',
        naturalLight: time !== '19:00',
        lowActivity: true
      },
      personalFactors: {
        energyLevel: time === '07:00' ? 'high' : time === '12:00' ? 'medium' : 'low',
        stressLevel: 'medium',
        availability: 'medium'
      },
      createdAt: new Date(),
      lastUpdated: new Date()
    }));
  }

  private generateInitialRecommendations(
    optimalTimes: OptimalTimeSlot[],
    circadian: CircadianAnalysis
  ): ScheduleRecommendation[] {
    return optimalTimes.slice(0, 3).map(slot => ({
      recommendedTime: slot.timeSlot,
      duration: 15,
      technique: this.suggestTechniqueForTime(slot.timeSlot),
      reason: `Optimal time based on ${slot.basedOnSessions > 0 ? 'your session history' : 'circadian rhythm analysis'}`,
      priority: slot.confidence > 0.7 ? 'high' : 'medium',
      contextualFactors: {}
    }));
  }

  private suggestTechniqueForTime(timeSlot: string): string {
    const hour = parseInt(timeSlot.split(':')[0]);
    
    if (hour >= 6 && hour <= 9) return 'mindfulness'; // Morning clarity
    if (hour >= 10 && hour <= 14) return 'breathing'; // Midday refresh
    if (hour >= 15 && hour <= 18) return 'stress_relief'; // Afternoon stress
    if (hour >= 19 && hour <= 22) return 'body_scan'; // Evening relaxation
    
    return 'mindfulness'; // Default
  }

  private assessPersonalFactors(hour: number, lifestyle: LifestylePattern): OptimalTimeSlot['personalFactors'] {
    let energyLevel: 'low' | 'medium' | 'high' = 'medium';
    let stressLevel: 'low' | 'medium' | 'high' = 'medium';
    let availability: 'low' | 'medium' | 'high' = 'medium';

    // Energy level based on time
    if (hour >= 7 && hour <= 10) energyLevel = 'high';
    else if (hour >= 14 && hour <= 16) energyLevel = 'low';
    else if (hour >= 19 && hour <= 22) energyLevel = 'medium';

    // Stress level based on lifestyle patterns
    if (lifestyle.stressPatterns.stressfulTimes.includes(`${hour.toString().padStart(2, '0')}:00`)) {
      stressLevel = 'high';
    } else if (lifestyle.stressPatterns.relaxedTimes.includes(`${hour.toString().padStart(2, '0')}:00`)) {
      stressLevel = 'low';
    }

    // Availability based on work schedule
    if (hour >= 9 && hour <= 17 && lifestyle.workSchedule.type === 'regular') {
      availability = 'low';
    } else if (lifestyle.socialPatterns.busyTimes.includes(`${hour.toString().padStart(2, '0')}:00`)) {
      availability = 'low';
    } else if (lifestyle.socialPatterns.quietTimes.includes(`${hour.toString().padStart(2, '0')}:00`)) {
      availability = 'high';
    }

    return { energyLevel, stressLevel, availability };
  }

  private async scheduleNotificationsForSchedule(schedule: SmartSchedule): Promise<void> {
    for (const slot of schedule.timeSlots) {
      // Schedule recurring notifications for each optimal time slot
      await smartNotificationService.createIntelligentReminder(
        schedule.userId,
        {
          optimalTime: slot.timeSlot,
          confidence: slot.confidence,
          daysSinceLastSession: 0,
          preferredTechnique: schedule.personalPreferences.preferredTechniques[0]
        }
      );
    }
  }

  private async getUserActiveSchedule(userId: string): Promise<SmartSchedule | null> {
    try {
      const q = query(
        collection(db, 'smart_schedules'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const data = snapshot.docs[0].data();
      return {
        id: snapshot.docs[0].id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as SmartSchedule;
    } catch (error) {
      console.error('Error fetching user schedule:', error);
      return null;
    }
  }

  private analyzeSchedulePerformance(schedule: SmartSchedule, sessions: MeditationSession[]): {
    needsAdjustment: boolean;
    adjustmentReasons: string[];
    suggestedChanges: ScheduleChange[];
  } {
    const scheduledTimes = schedule.timeSlots.map(slot => slot.timeSlot);
    let adherenceCount = 0;
    let totalQuality = 0;

    sessions.forEach(session => {
      const sessionTime = new Date((session as any).createdAt).getHours().toString().padStart(2, '0') + ':00';
      const isScheduledTime = scheduledTimes.some(time => 
        Math.abs(parseInt(time.split(':')[0]) - parseInt(sessionTime.split(':')[0])) <= 1
      );

      if (isScheduledTime) {
        adherenceCount++;
        totalQuality += ((session as any).averageRating || 0);
      }
    });

    const adherenceRate = sessions.length > 0 ? (adherenceCount / sessions.length) * 100 : 0;
    const avgQuality = adherenceCount > 0 ? totalQuality / adherenceCount : 0;

    const needsAdjustment = adherenceRate < 60 || avgQuality < 3.5;
    const adjustmentReasons = [];
    const suggestedChanges: ScheduleChange[] = [];

    if (adherenceRate < 60) {
      adjustmentReasons.push('Low adherence to scheduled times');
      suggestedChanges.push({
        type: 'time',
        current: 'Current scheduled times',
        suggested: 'More convenient time slots',
        reason: 'Low adherence to scheduled times',
        confidence: 0.8
      });
    }

    if (avgQuality < 3.5) {
      adjustmentReasons.push('Low session quality at scheduled times');
      suggestedChanges.push({
        type: 'time',
        current: 'Current scheduled times',
        suggested: 'Times when user is more focused',
        reason: 'Low session quality at scheduled times',
        confidence: 0.7
      });
    }

    return {
      needsAdjustment,
      adjustmentReasons,
      suggestedChanges
    };
  }

  private async adjustSchedule(
    schedule: SmartSchedule,
    performance: { needsAdjustment: boolean; adjustmentReasons: string[]; suggestedChanges: ScheduleChange[] }
  ): Promise<SmartSchedule> {
    // Re-analyze optimal times with recent data
    const newOptimalTimes = await this.analyzeOptimalTimes(schedule.userId);
    
    const updatedSchedule: SmartSchedule = {
      ...schedule,
      timeSlots: newOptimalTimes.slice(0, schedule.personalPreferences.maxSessionsPerDay),
      updatedAt: new Date()
    };

    // Update in database
    const { error } = await supabase.from('smart_schedules').update({
      time_slots: updatedSchedule.timeSlots,
      updated_at: updatedSchedule.updatedAt.toISOString()
    }).eq('id', schedule.id);
    if (error) throw error;

    return updatedSchedule;
  }

  private getNextAvailableTime(timeSlots: OptimalTimeSlot[]): string {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Find next time slot after current time
    const futureTimes = timeSlots
      .map(slot => parseInt(slot.timeSlot.split(':')[0]))
      .filter(hour => hour > currentHour)
      .sort((a, b) => a - b);

    if (futureTimes.length > 0) {
      return `${futureTimes[0].toString().padStart(2, '0')}:00`;
    }

    // If no time today, return first time tomorrow
    const firstTime = timeSlots.sort((a, b) => 
      parseInt(a.timeSlot.split(':')[0]) - parseInt(b.timeSlot.split(':')[0])
    )[0];

    return firstTime ? firstTime.timeSlot : '07:00';
  }

  private getEnergyBoostTime(): string {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Suggest immediate time for energy boost
    if (currentHour < 10) return `${(currentHour + 1).toString().padStart(2, '0')}:00`;
    if (currentHour >= 14 && currentHour <= 16) return `${currentHour.toString().padStart(2, '0')}:30`;
    
    return `${(currentHour + 1).toString().padStart(2, '0')}:00`;
  }

  private generateMorningRecommendation(recentMoods: MoodEntry[]): ScheduleRecommendation | null {
    if (recentMoods.length === 0) return null;

    const avgMorningMood = recentMoods
      .filter(mood => new Date((mood as any).createdAt).getHours() < 12)
      .reduce((sum, mood, _, arr) => sum + ((mood as any).overall || 3) / arr.length, 0);

    if (avgMorningMood < 3) {
      return {
        recommendedTime: '07:30',
        duration: 12,
        technique: 'gratitude',
        reason: 'Morning mood boost - gratitude practice dapat start your day positively',
        priority: 'medium',
        contextualFactors: {
          stressLevelPrediction: 'Morning meditation dapat prevent stress buildup'
        }
      };
    }

    return null;
  }

  private generateEveningRecommendation(recentMoods: MoodEntry[]): ScheduleRecommendation | null {
    if (recentMoods.length === 0) return null;

    const avgEveningStress = recentMoods
      .filter(mood => new Date((mood as any).createdAt).getHours() >= 17)
      .reduce((sum, mood, _, arr) => sum + (mood.stress || 3) / arr.length, 0);

    if (avgEveningStress >= 3.5) {
      return {
        recommendedTime: '20:30',
        duration: 18,
        technique: 'body_scan',
        reason: 'Evening stress relief - body scan dapat release tension dari hari ini',
        priority: 'high',
        contextualFactors: {
          stressLevelPrediction: 'High evening stress pattern detected'
        }
      };
    }

    return null;
  }

  private analyzePredictivePatterns(sessions: MeditationSession[], moods: MoodEntry[]): PredictivePatterns {
    // Analyze patterns for future prediction
    const dayPatterns: { [day: number]: { sessions: number; avgQuality: number } } = {};
    const timePatterns: { [hour: number]: { sessions: number; avgQuality: number } } = {};

    sessions.forEach(session => {
      const date = new Date((session as any).createdAt);
      const day = date.getDay();
      const hour = date.getHours();

      // Day patterns
      if (!dayPatterns[day]) dayPatterns[day] = { sessions: 0, avgQuality: 0 };
      dayPatterns[day].sessions++;
      dayPatterns[day].avgQuality = (dayPatterns[day].avgQuality * (dayPatterns[day].sessions - 1) + ((session as any).averageRating || 0)) / dayPatterns[day].sessions;

      // Time patterns
      if (!timePatterns[hour]) timePatterns[hour] = { sessions: 0, avgQuality: 0 };
      timePatterns[hour].sessions++;
      timePatterns[hour].avgQuality = (timePatterns[hour].avgQuality * (timePatterns[hour].sessions - 1) + ((session as any).averageRating || 0)) / timePatterns[hour].sessions;
    });

    return {
      weekdayPreference: {},
      timePreference: {},
      seasonalTrends: {},
      consistencyScore: 0.8,
      dayPatterns,
      timePatterns,
      keyFactors: [
        'Historical session timing',
        'Quality scores by time',
        'Day-of-week preferences',
        'Mood patterns'
      ]
    };
  }

  private predictDaySchedule(
    targetDate: Date,
    patterns: PredictivePatterns,
    currentSchedule: SmartSchedule | null
  ): ScheduleRecommendation[] {
    const dayOfWeek = targetDate.getDay();
    const recommendations: ScheduleRecommendation[] = [];

    // Use patterns to predict optimal times for this day
    const dayPattern = (patterns.dayPatterns as any)?.[dayOfWeek];
    
    if (dayPattern && (dayPattern as any).sessions > 0) {
      // Find best times for this day of week
      const bestTimes = Object.entries((patterns.timePatterns as any) || {})
        .filter(([, data]: [string, any]) => (data as any)?.sessions > 0)
        .sort(([, a], [, b]) => (b as any).avgQuality - (a as any).avgQuality)
        .slice(0, 2);

      bestTimes.forEach(([hour, data]: [string, any]) => {
        recommendations.push({
          recommendedTime: `${hour.padStart(2, '0')}:00`,
          dayOfWeek,
          duration: 15,
          technique: this.suggestTechniqueForTime(`${hour.padStart(2, '0')}:00`),
          reason: `Predicted optimal time based on your ${data.sessions} previous sessions on ${this.getDayName(dayOfWeek)}`,
          priority: data.avgQuality >= 4 ? 'high' : 'medium',
          contextualFactors: {}
        });
      });
    } else {
      // Use default schedule if no pattern for this day
      const defaultTimes = currentSchedule?.timeSlots || [];
      if (defaultTimes.length > 0) {
        recommendations.push({
          recommendedTime: defaultTimes[0].timeSlot,
          dayOfWeek,
          duration: 15,
          technique: 'mindfulness',
          reason: 'Based on your preferred schedule',
          priority: 'medium',
          contextualFactors: {}
        });
      }
    }

    return recommendations;
  }

  private calculatePredictionConfidence(patterns: PredictivePatterns, totalSessions: number): number {
    let confidence = 0.3; // Base confidence
    
    // Increase confidence based on data availability
    if (totalSessions >= 10) confidence += 0.2;
    if (totalSessions >= 25) confidence += 0.2;
    if (totalSessions >= 50) confidence += 0.2;
    
    // Increase confidence based on pattern consistency
    const dayConsistency = Object.values((patterns.dayPatterns as any) || {}).length / 7;
    confidence += dayConsistency * 0.1;

    return Math.min(0.9, confidence);
  }

  private calculateScheduleEffectiveness(
    scheduledTimes: string[],
    recentSessions: MeditationSession[]
  ): SmartSchedule['effectiveness'] {
    let adherenceCount = 0;
    let totalQuality = 0;
    let moodImprovements = 0;
    let stressReductions = 0;

    recentSessions.forEach(session => {
      const sessionTime = new Date((session as any).createdAt).getHours().toString().padStart(2, '0') + ':00';
      const isScheduledTime = scheduledTimes.some(time => 
        Math.abs(parseInt(time.split(':')[0]) - parseInt(sessionTime.split(':')[0])) <= 1
      );

      if (isScheduledTime) {
        adherenceCount++;
        totalQuality += ((session as any).averageRating || 0);
        
        if ((session as any).moodBefore && (session as any).moodAfter) {
          const moodChange = (session as any).moodAfter - (session as any).moodBefore;
          if (moodChange > 0) moodImprovements++;
        }
        
        if ((session as any).stressLevel && (session as any).stressLevel < 3) {
          stressReductions++;
        }
      }
    });

    const adherenceRate = recentSessions.length > 0 ? (adherenceCount / recentSessions.length) * 100 : 0;
    const avgSessionQuality = adherenceCount > 0 ? totalQuality / adherenceCount : 0;
    const moodImprovementRate = adherenceCount > 0 ? (moodImprovements / adherenceCount) * 100 : 0;
    const stressReductionRate = adherenceCount > 0 ? (stressReductions / adherenceCount) * 100 : 0;

    return {
      adherenceRate,
      avgSessionQuality,
      moodImprovementRate,
      stressReductionRate
    };
  }

  private async getScheduleById(scheduleId: string): Promise<SmartSchedule | null> {
    try {
      const q = query(
        collection(db, 'smart_schedules'),
        where('__name__', '==', scheduleId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const data = snapshot.docs[0].data();
      return {
        id: snapshot.docs[0].id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as SmartSchedule;
    } catch (error) {
      console.error('Error fetching schedule by ID:', error);
      return null;
    }
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || 'Unknown';
  }
}

export const smartSchedulingService = SmartSchedulingService.getInstance();