import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { progressService } from './progressService';

export interface MeditationGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'frequency' | 'duration' | 'quality' | 'consistency' | 'technique' | 'wellbeing';
  type: 'daily' | 'weekly' | 'monthly' | 'milestone' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., 'sessions', 'minutes', 'days', 'points'
  progress: number; // 0-100%
  status: 'active' | 'completed' | 'paused' | 'failed';
  priority: 'high' | 'medium' | 'low';
  deadline?: Date;
  startDate: Date;
  completedDate?: Date;
  isRepeating: boolean;
  streak: number;
  bestStreak: number;
  rewards: {
    points: number;
    badge?: string;
    unlock?: string;
  };
  milestones: GoalMilestone[];
  adjustmentHistory: GoalAdjustment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalMilestone {
  id: string;
  percentage: number; // 25, 50, 75, 100
  title: string;
  description: string;
  reward: {
    points: number;
    badge?: string;
    message: string;
  };
  isReached: boolean;
  reachedDate?: Date;
}

export interface GoalAdjustment {
  id: string;
  date: Date;
  type: 'target_increase' | 'target_decrease' | 'deadline_extend' | 'deadline_shorten' | 'pause' | 'resume';
  oldValue: any;
  newValue: any;
  reason: string;
  autoAdjusted: boolean;
}

export interface GoalSuggestion {
  id: string;
  category: 'frequency' | 'duration' | 'quality' | 'consistency' | 'technique' | 'wellbeing';
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  type: 'daily' | 'weekly' | 'monthly' | 'milestone';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string; // e.g., "2-3 weeks"
  benefits: string[];
  prerequisites?: string[];
}

export interface GoalInsight {
  goalId: string;
  type: 'on_track' | 'ahead' | 'behind' | 'stagnant' | 'at_risk';
  message: string;
  suggestion: string;
  urgency: 'low' | 'medium' | 'high';
  actionRequired: boolean;
}

export class GoalTrackingService {
  private static instance: GoalTrackingService;

  static getInstance(): GoalTrackingService {
    if (!GoalTrackingService.instance) {
      GoalTrackingService.instance = new GoalTrackingService();
    }
    return GoalTrackingService.instance;
  }

  async createGoal(userId: string, goalData: Omit<MeditationGoal, 'id' | 'userId' | 'currentValue' | 'progress' | 'status' | 'streak' | 'bestStreak' | 'milestones' | 'adjustmentHistory' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const milestones = this.generateMilestones(goalData.targetValue, goalData.unit);
      
      const goal: Omit<MeditationGoal, 'id'> = {
        userId,
        ...goalData,
        currentValue: 0,
        progress: 0,
        status: 'active',
        streak: 0,
        bestStreak: 0,
        milestones,
        adjustmentHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'meditation_goals'), {
        ...goal,
        startDate: Timestamp.fromDate(goal.startDate),
        deadline: goal.deadline ? Timestamp.fromDate(goal.deadline) : null,
        createdAt: Timestamp.fromDate(goal.createdAt),
        updatedAt: Timestamp.fromDate(goal.updatedAt)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  async updateGoalProgress(goalId: string, incrementValue: number, sessionData?: any): Promise<{
    goal: MeditationGoal;
    milestonesReached: GoalMilestone[];
    goalCompleted: boolean;
  }> {
    try {
      const goals = await this.getUserGoals(''); // We would need userId in practice
      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found');

      const newCurrentValue = goal.currentValue + incrementValue;
      const newProgress = Math.min(100, (newCurrentValue / goal.targetValue) * 100);
      
      // Check for milestone achievements
      const milestonesReached: GoalMilestone[] = [];
      const updatedMilestones = goal.milestones.map(milestone => {
        if (!milestone.isReached && newProgress >= milestone.percentage) {
          milestone.isReached = true;
          milestone.reachedDate = new Date();
          milestonesReached.push(milestone);
        }
        return milestone;
      });

      // Update streak
      let newStreak = goal.streak;
      let newBestStreak = goal.bestStreak;
      
      if (this.isStreakApplicable(goal.type) && sessionData) {
        if (this.isConsecutiveDay(sessionData.date)) {
          newStreak += 1;
          newBestStreak = Math.max(newBestStreak, newStreak);
        } else {
          newStreak = 1; // Reset streak but count current day
        }
      }

      // Check if goal is completed
      const goalCompleted = newProgress >= 100 && goal.status !== 'completed';
      const newStatus = goalCompleted ? 'completed' : goal.status;

      const updatedGoal: MeditationGoal = {
        ...goal,
        currentValue: newCurrentValue,
        progress: newProgress,
        status: newStatus,
        streak: newStreak,
        bestStreak: newBestStreak,
        milestones: updatedMilestones,
        completedDate: goalCompleted ? new Date() : goal.completedDate,
        updatedAt: new Date()
      };

      // Update in database
      const docRef = doc(db, 'meditation_goals', goalId);
      await updateDoc(docRef, {
        currentValue: updatedGoal.currentValue,
        progress: updatedGoal.progress,
        status: updatedGoal.status,
        streak: updatedGoal.streak,
        bestStreak: updatedGoal.bestStreak,
        milestones: updatedGoal.milestones,
        completedDate: updatedGoal.completedDate ? Timestamp.fromDate(updatedGoal.completedDate) : null,
        updatedAt: Timestamp.fromDate(updatedGoal.updatedAt)
      });

      return {
        goal: updatedGoal,
        milestonesReached,
        goalCompleted
      };
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  async adjustGoal(goalId: string, adjustment: Omit<GoalAdjustment, 'id' | 'date' | 'autoAdjusted'>): Promise<void> {
    try {
      const goals = await this.getUserGoals(''); // We would need userId in practice
      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found');

      const adjustmentRecord: GoalAdjustment = {
        id: Date.now().toString(),
        date: new Date(),
        ...adjustment,
        autoAdjusted: false
      };

      const updatedAdjustmentHistory = [...goal.adjustmentHistory, adjustmentRecord];
      
      // Apply the adjustment
      const updatedGoal = { ...goal };
      
      switch (adjustment.type) {
        case 'target_increase':
        case 'target_decrease':
          updatedGoal.targetValue = adjustment.newValue;
          updatedGoal.progress = (updatedGoal.currentValue / updatedGoal.targetValue) * 100;
          break;
        case 'deadline_extend':
        case 'deadline_shorten':
          updatedGoal.deadline = adjustment.newValue;
          break;
        case 'pause':
          updatedGoal.status = 'paused';
          break;
        case 'resume':
          updatedGoal.status = 'active';
          break;
      }

      updatedGoal.adjustmentHistory = updatedAdjustmentHistory;
      updatedGoal.updatedAt = new Date();

      // Update in database
      const docRef = doc(db, 'meditation_goals', goalId);
      await updateDoc(docRef, {
        targetValue: updatedGoal.targetValue,
        progress: updatedGoal.progress,
        deadline: updatedGoal.deadline ? Timestamp.fromDate(updatedGoal.deadline) : null,
        status: updatedGoal.status,
        adjustmentHistory: updatedGoal.adjustmentHistory,
        updatedAt: Timestamp.fromDate(updatedGoal.updatedAt)
      });
    } catch (error) {
      console.error('Error adjusting goal:', error);
      throw error;
    }
  }

  async getUserGoals(userId: string, status?: 'active' | 'completed' | 'paused' | 'failed'): Promise<MeditationGoal[]> {
    try {
      const constraints = [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      ];

      if (status) {
        constraints.splice(1, 0, where('status', '==', status));
      }

      const q = query(collection(db, 'meditation_goals'), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
        deadline: doc.data().deadline?.toDate(),
        completedDate: doc.data().completedDate?.toDate(),
        milestones: doc.data().milestones.map((m: any) => ({
          ...m,
          reachedDate: m.reachedDate?.toDate()
        })),
        adjustmentHistory: doc.data().adjustmentHistory.map((a: any) => ({
          ...a,
          date: a.date.toDate()
        })),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as MeditationGoal[];
    } catch (error) {
      console.error('Error fetching user goals:', error);
      return [];
    }
  }

  async analyzeGoalProgress(userId: string): Promise<GoalInsight[]> {
    try {
      const activeGoals = await this.getUserGoals(userId, 'active');
      const insights: GoalInsight[] = [];

      for (const goal of activeGoals) {
        const insight = this.generateGoalInsight(goal);
        if (insight) insights.push(insight);
      }

      return insights.sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      });
    } catch (error) {
      console.error('Error analyzing goal progress:', error);
      return [];
    }
  }

  async suggestGoals(userId: string): Promise<GoalSuggestion[]> {
    try {
      const sessions = await progressService.getMeditationSessions(userId, 50);
      const currentGoals = await this.getUserGoals(userId, 'active');
      
      const suggestions: GoalSuggestion[] = [];
      
      // Analyze user's current patterns
      const avgSessionsPerWeek = this.calculateWeeklyAverage(sessions);
      const avgDuration = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length 
        : 0;
      const hasConsistencyGoal = currentGoals.some(g => g.category === 'consistency');
      const hasDurationGoal = currentGoals.some(g => g.category === 'duration');

      // Suggest consistency goal if not exists
      if (!hasConsistencyGoal && avgSessionsPerWeek < 5) {
        suggestions.push({
          id: 'consistency-weekly',
          category: 'consistency',
          title: 'Meditasi Rutin Mingguan',
          description: 'Bangun habit meditasi dengan target mingguan yang konsisten',
          targetValue: Math.min(7, Math.ceil(avgSessionsPerWeek * 1.5)),
          unit: 'sessions per week',
          type: 'weekly',
          difficulty: avgSessionsPerWeek < 2 ? 'beginner' : 'intermediate',
          estimatedTime: '3-4 minggu',
          benefits: [
            'Membangun habit yang kuat',
            'Meningkatkan konsistensi',
            'Mengurangi stress secara berkelanjutan'
          ]
        });
      }

      // Suggest duration goal if sessions are short
      if (!hasDurationGoal && avgDuration < 15) {
        suggestions.push({
          id: 'duration-increase',
          category: 'duration',
          title: 'Perpanjang Durasi Meditasi',
          description: 'Secara bertahap tingkatkan durasi sesi meditasi',
          targetValue: 20,
          unit: 'minutes per session',
          type: 'milestone',
          difficulty: avgDuration < 5 ? 'beginner' : 'intermediate',
          estimatedTime: '4-6 minggu',
          benefits: [
            'Manfaat meditasi yang lebih mendalam',
            'Konsentrasi yang lebih baik',
            'Ketenangan yang lebih lama'
          ]
        });
      }

      // Quality improvement goal
      const avgQuality = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length 
        : 0;
      
      if (avgQuality < 4) {
        suggestions.push({
          id: 'quality-improvement',
          category: 'quality',
          title: 'Tingkatkan Kualitas Meditasi',
          description: 'Fokus pada peningkatan kualitas pengalaman meditasi',
          targetValue: 4,
          unit: 'average quality score',
          type: 'milestone',
          difficulty: 'intermediate',
          estimatedTime: '2-3 minggu',
          benefits: [
            'Pengalaman meditasi yang lebih memuaskan',
            'Konsentrasi yang lebih dalam',
            'Hasil yang lebih optimal'
          ]
        });
      }

      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('Error suggesting goals:', error);
      return [];
    }
  }

  async autoAdjustGoals(userId: string): Promise<{ adjusted: MeditationGoal[]; insights: string[] }> {
    try {
      const activeGoals = await this.getUserGoals(userId, 'active');
      const sessions = await progressService.getMeditationSessions(userId, 30);
      
      const adjustedGoals: MeditationGoal[] = [];
      const insights: string[] = [];

      for (const goal of activeGoals) {
        const shouldAdjust = this.shouldAutoAdjustGoal(goal, sessions);
        
        if (shouldAdjust.adjust) {
          try {
            await this.adjustGoal(goal.id, {
              type: shouldAdjust.adjustmentType!,
              oldValue: shouldAdjust.oldValue,
              newValue: shouldAdjust.newValue,
              reason: shouldAdjust.reason!
            });
            
            adjustedGoals.push(goal);
            insights.push(`${goal.title}: ${shouldAdjust.reason}`);
          } catch (error) {
            console.error(`Error auto-adjusting goal ${goal.id}:`, error);
          }
        }
      }

      return { adjusted: adjustedGoals, insights };
    } catch (error) {
      console.error('Error auto-adjusting goals:', error);
      return { adjusted: [], insights: [] };
    }
  }

  private generateMilestones(targetValue: number, unit: string): GoalMilestone[] {
    const percentages = [25, 50, 75, 100];
    return percentages.map((percentage, index) => ({
      id: `milestone-${percentage}`,
      percentage,
      title: `${percentage}% Complete`,
      description: `Mencapai ${Math.round(targetValue * (percentage / 100))} ${unit}`,
      reward: {
        points: percentage === 100 ? 100 : 25,
        badge: percentage === 100 ? 'Goal Achiever' : undefined,
        message: percentage === 100 
          ? 'Selamat! Anda telah menyelesaikan goal ini!' 
          : `Bagus! Anda sudah ${percentage}% menuju target!`
      },
      isReached: false
    }));
  }

  private generateGoalInsight(goal: MeditationGoal): GoalInsight | null {
    const now = new Date();
    const timeElapsed = goal.deadline 
      ? (now.getTime() - goal.startDate.getTime()) / (goal.deadline.getTime() - goal.startDate.getTime())
      : 0.5; // Default to halfway if no deadline

    const progressRatio = goal.progress / 100;
    const expectedProgress = timeElapsed * 100;

    let type: GoalInsight['type'];
    let urgency: GoalInsight['urgency'] = 'low';
    let message = '';
    let suggestion = '';
    let actionRequired = false;

    if (progressRatio >= timeElapsed + 0.2) {
      type = 'ahead';
      message = `Anda berada di depan jadwal! Progress ${goal.progress}% vs target ${Math.round(expectedProgress)}%`;
      suggestion = 'Pertahankan momentum yang bagus ini atau pertimbangkan untuk menaikkan target';
    } else if (progressRatio >= timeElapsed - 0.1) {
      type = 'on_track';
      message = `Progress Anda sesuai jadwal (${goal.progress}%)`;
      suggestion = 'Terus konsisten dengan rutinitas saat ini';
    } else if (progressRatio >= timeElapsed - 0.3) {
      type = 'behind';
      urgency = 'medium';
      message = `Anda sedikit tertinggal dari jadwal. Progress ${goal.progress}% vs target ${Math.round(expectedProgress)}%`;
      suggestion = 'Tingkatkan frekuensi atau intensitas untuk mengejar target';
      actionRequired = true;
    } else {
      type = 'at_risk';
      urgency = 'high';
      message = `Goal berisiko tidak tercapai. Progress hanya ${goal.progress}%`;
      suggestion = 'Pertimbangkan untuk menyesuaikan target atau mengubah strategi';
      actionRequired = true;
    }

    // Check for stagnant goals
    if (goal.updatedAt.getTime() < now.getTime() - (7 * 24 * 60 * 60 * 1000)) {
      type = 'stagnant';
      urgency = 'medium';
      message = 'Goal ini tidak ada progress dalam 1 minggu terakhir';
      suggestion = 'Kembali fokus pada goal ini atau pertimbangkan untuk pause sementara';
      actionRequired = true;
    }

    return {
      goalId: goal.id,
      type,
      message,
      suggestion,
      urgency,
      actionRequired
    };
  }

  private shouldAutoAdjustGoal(goal: MeditationGoal, recentSessions: any[]): {
    adjust: boolean;
    adjustmentType?: GoalAdjustment['type'];
    oldValue?: any;
    newValue?: any;
    reason?: string;
  } {
    const now = new Date();
    
    // Check if goal deadline is approaching and progress is low
    if (goal.deadline && goal.progress < 50) {
      const daysLeft = Math.ceil((goal.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 7 && goal.progress < 30) {
        return {
          adjust: true,
          adjustmentType: 'deadline_extend',
          oldValue: goal.deadline,
          newValue: new Date(goal.deadline.getTime() + (14 * 24 * 60 * 60 * 1000)), // Extend 2 weeks
          reason: 'Deadline diperpanjang karena progress masih rendah'
        };
      }
    }

    // Check if user is consistently exceeding expectations
    if (goal.progress > 80 && goal.type === 'weekly') {
      const weeklyAverage = this.calculateWeeklyAverage(recentSessions);
      if (weeklyAverage > goal.targetValue * 1.5) {
        return {
          adjust: true,
          adjustmentType: 'target_increase',
          oldValue: goal.targetValue,
          newValue: Math.ceil(goal.targetValue * 1.3),
          reason: 'Target dinaikkan karena performa melebihi ekspektasi'
        };
      }
    }

    return { adjust: false };
  }

  private calculateWeeklyAverage(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));
    
    const recentSessions = sessions.filter(s => 
      new Date(s.date) >= fourWeeksAgo
    );
    
    return recentSessions.length / 4; // Average per week
  }

  private isStreakApplicable(goalType: string): boolean {
    return goalType === 'daily' || goalType === 'weekly';
  }

  private isConsecutiveDay(sessionDate: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const sessionDay = new Date(sessionDate);
    sessionDay.setHours(0, 0, 0, 0);
    
    return sessionDay.getTime() === yesterday.getTime();
  }

  async deleteGoal(goalId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'meditation_goals', goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  getGoalCategories(): { [key: string]: string } {
    return {
      frequency: 'Frekuensi',
      duration: 'Durasi',
      quality: 'Kualitas',
      consistency: 'Konsistensi',
      technique: 'Teknik',
      wellbeing: 'Wellbeing'
    };
  }

  getGoalTypes(): { [key: string]: string } {
    return {
      daily: 'Harian',
      weekly: 'Mingguan',
      monthly: 'Bulanan',
      milestone: 'Milestone',
      custom: 'Custom'
    };
  }
}

export const goalTrackingService = GoalTrackingService.getInstance();