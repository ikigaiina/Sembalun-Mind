import { supabase } from '../../config/supabaseClient';

export interface UserProgress {
  id: string;
  user_id: string;
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  last_session_date?: string;
  level: number;
  experience_points: number;
  achievements: string[];
  favorite_categories: string[];
  completed_programs: string[];
  weekly_goal: number;
  monthly_goal: number;
  created_at: string;
  updated_at: string;
}

export interface StreakData {
  id: string;
  user_id: string;
  type: 'meditation' | 'mood_tracking' | 'journaling' | 'mindfulness';
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_history: StreakSnapshot[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StreakSnapshot {
  date: string;
  streak_count: number;
  activity_type: string;
  notes?: string;
}

export interface ProgressAnalytics {
  overview: ProgressOverview;
  trends: ProgressTrends;
  comparisons: ProgressComparisons;
  predictions: ProgressPredictions;
  insights: ProgressInsights;
}

export interface ProgressOverview {
  totalSessions: number;
  totalMinutes: number;
  currentLevel: number;
  experiencePoints: number;
  nextLevelXP: number;
  progressToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionLength: number;
  consistency: number;
  achievement_count: number;
}

export interface ProgressTrends {
  daily: DailyTrend[];
  weekly: WeeklyTrend[];
  monthly: MonthlyTrend[];
  yearly: YearlyTrend[];
}

export interface DailyTrend {
  date: string;
  sessions: number;
  minutes: number;
  streak: number;
  mood_average?: number;
}

export interface WeeklyTrend {
  week_start: string;
  sessions: number;
  minutes: number;
  consistency: number;
  average_rating: number;
  goal_achievement: number;
}

export interface MonthlyTrend {
  month: string;
  sessions: number;
  minutes: number;
  streak_days: number;
  achievements_earned: number;
  consistency_score: number;
}

export interface YearlyTrend {
  year: string;
  sessions: number;
  minutes: number;
  achievements: number;
  level_progression: number;
  consistency: number;
}

export interface ProgressComparisons {
  vs_last_week: ComparisonData;
  vs_last_month: ComparisonData;
  vs_last_year: ComparisonData;
  vs_community_average: ComparisonData;
}

export interface ComparisonData {
  sessions: { current: number; previous: number; change: number; percentage: number };
  minutes: { current: number; previous: number; change: number; percentage: number };
  consistency: { current: number; previous: number; change: number; percentage: number };
  quality: { current: number; previous: number; change: number; percentage: number };
}

export interface ProgressPredictions {
  next_level_estimate: string;
  next_achievement_estimate: string;
  weekly_goal_prediction: { likelihood: number; estimated_date: string };
  monthly_goal_prediction: { likelihood: number; sessions_needed: number };
  streak_milestone_prediction: { next_milestone: number; estimated_date: string };
}

export interface ProgressInsights {
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  patterns: InsightPattern[];
  milestones: ProgressMilestone[];
}

export interface InsightPattern {
  type: 'temporal' | 'behavioral' | 'performance' | 'consistency';
  description: string;
  confidence: number;
  action_items: string[];
}

export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  category: string;
  target_value: number;
  current_value: number;
  progress_percentage: number;
  estimated_completion: string;
  reward: string;
}

export interface LevelSystem {
  current_level: number;
  experience_points: number;
  points_to_next_level: number;
  level_title: string;
  level_description: string;
  level_benefits: string[];
  next_level_preview: {
    level: number;
    title: string;
    benefits: string[];
    xp_required: number;
  };
}

export class ProgressApiService {
  private static instance: ProgressApiService;

  static getInstance(): ProgressApiService {
    if (!ProgressApiService.instance) {
      ProgressApiService.instance = new ProgressApiService();
    }
    return ProgressApiService.instance;
  }

  // Core Progress Management
  async getUserProgress(userId: string): Promise<{ progress: UserProgress | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (!data) {
        // Create default progress if none exists
        const defaultProgress = await this.createDefaultProgress(userId);
        return { progress: defaultProgress.progress, error: defaultProgress.error };
      }

      return { progress: data, error: null };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return { progress: null, error };
    }
  }

  async updateProgress(userId: string, updates: Partial<UserProgress>): Promise<{ progress: UserProgress | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { progress: data, error: null };
    } catch (error) {
      console.error('Error updating progress:', error);
      return { progress: null, error };
    }
  }

  async createDefaultProgress(userId: string): Promise<{ progress: UserProgress | null; error: any }> {
    try {
      const defaultProgress: Omit<UserProgress, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        total_sessions: 0,
        total_minutes: 0,
        current_streak: 0,
        longest_streak: 0,
        level: 1,
        experience_points: 0,
        achievements: [],
        favorite_categories: [],
        completed_programs: [],
        weekly_goal: 7, // 7 sessions per week
        monthly_goal: 30 // 30 sessions per month
      };

      const { data, error } = await supabase
        .from('user_progress')
        .insert([defaultProgress])
        .select()
        .single();

      if (error) throw error;

      return { progress: data, error: null };
    } catch (error) {
      console.error('Error creating default progress:', error);
      return { progress: null, error };
    }
  }

  // Streak Management
  async updateStreak(userId: string, activityType: 'meditation' | 'mood_tracking' | 'journaling' | 'mindfulness', date: string = new Date().toISOString()): Promise<{ streak: StreakData | null; error: any }> {
    try {
      // Get existing streak
      const { data: existingStreak, error: fetchError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('type', activityType)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const activityDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      activityDate.setHours(0, 0, 0, 0);

      let streakData: StreakData;

      if (!existingStreak) {
        // Create new streak
        streakData = {
          id: '',
          user_id: userId,
          type: activityType,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: date,
          streak_history: [{
            date,
            streak_count: 1,
            activity_type: activityType
          }],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('streaks')
          .insert([streakData])
          .select()
          .single();

        if (error) throw error;
        return { streak: data, error: null };
      }

      // Update existing streak
      const lastActivity = new Date(existingStreak.last_activity_date);
      lastActivity.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((activityDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day, no streak change
        return { streak: existingStreak, error: null };
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        existingStreak.current_streak += 1;
        existingStreak.longest_streak = Math.max(existingStreak.longest_streak, existingStreak.current_streak);
      } else if (daysDiff > 1) {
        // Streak broken, start new
        existingStreak.current_streak = 1;
      }

      existingStreak.last_activity_date = date;
      existingStreak.is_active = daysDiff <= 1;
      existingStreak.updated_at = new Date().toISOString();

      // Add to history
      existingStreak.streak_history.push({
        date,
        streak_count: existingStreak.current_streak,
        activity_type: activityType
      });

      // Keep only last 365 days of history
      if (existingStreak.streak_history.length > 365) {
        existingStreak.streak_history = existingStreak.streak_history.slice(-365);
      }

      const { data, error } = await supabase
        .from('streaks')
        .update(existingStreak)
        .eq('id', existingStreak.id)
        .select()
        .single();

      if (error) throw error;

      return { streak: data, error: null };
    } catch (error) {
      console.error('Error updating streak:', error);
      return { streak: null, error };
    }
  }

  async getUserStreaks(userId: string): Promise<{ streaks: StreakData[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return { streaks: data || [], error: null };
    } catch (error) {
      console.error('Error fetching user streaks:', error);
      return { streaks: [], error };
    }
  }

  // Experience & Levels
  async addExperience(userId: string, points: number, source: string): Promise<{ levelUp: boolean; newLevel?: number; error: any }> {
    try {
      const { progress, error: progressError } = await this.getUserProgress(userId);
      if (progressError || !progress) {
        throw new Error('Could not fetch user progress');
      }

      const newXP = progress.experience_points + points;
      const currentLevel = progress.level;
      const newLevel = this.calculateLevel(newXP);
      const levelUp = newLevel > currentLevel;

      const updates: Partial<UserProgress> = {
        experience_points: newXP,
        level: newLevel
      };

      const { error: updateError } = await this.updateProgress(userId, updates);
      if (updateError) throw updateError;

      // Log XP gain
      await this.logExperienceGain(userId, points, source, levelUp ? newLevel : undefined);

      return { levelUp, newLevel: levelUp ? newLevel : undefined, error: null };
    } catch (error) {
      console.error('Error adding experience:', error);
      return { levelUp: false, error };
    }
  }

  private calculateLevel(experiencePoints: number): number {
    // Level progression: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 300 XP, etc.
    // Formula: XP required = (level - 1) * 100 + (level - 1) * (level - 2) * 50
    let level = 1;
    let requiredXP = 0;

    while (experiencePoints >= requiredXP) {
      level++;
      requiredXP = (level - 1) * 100 + (level - 1) * (level - 2) * 50;
    }

    return level - 1;
  }

  private getXPForLevel(level: number): number {
    if (level <= 1) return 0;
    return (level - 1) * 100 + (level - 1) * (level - 2) * 50;
  }

  async getLevelSystem(userId: string): Promise<{ levelSystem: LevelSystem | null; error: any }> {
    try {
      const { progress, error } = await this.getUserProgress(userId);
      if (error || !progress) {
        throw new Error('Could not fetch user progress');
      }

      const currentLevel = progress.level;
      const currentXP = progress.experience_points;
      const currentLevelXP = this.getXPForLevel(currentLevel);
      const nextLevelXP = this.getXPForLevel(currentLevel + 1);
      const pointsToNextLevel = nextLevelXP - currentXP;

      const levelTitles: { [key: number]: string } = {
        1: 'Pemula',
        2: 'Pelajar',
        3: 'Praktisi',
        4: 'Penggemar',
        5: 'Ahli',
        10: 'Master',
        15: 'Sage',
        20: 'Guru'
      };

      const levelDescriptions: { [key: number]: string } = {
        1: 'Memulai perjalanan mindfulness',
        2: 'Mulai memahami dasar-dasar meditasi',
        3: 'Konsisten dalam berlatih',
        4: 'Menunjukkan dedikasi tinggi',
        5: 'Menguasai berbagai teknik',
        10: 'Pemahaman mendalam tentang mindfulness',
        15: 'Kebijaksanaan dalam praktik',
        20: 'Inspirasi bagi praktisi lain'
      };

      const getLevelTitle = (level: number): string => {
        const titles = Object.keys(levelTitles).map(Number).sort((a, b) => b - a);
        return levelTitles[titles.find(l => level >= l) || 1] || 'Praktisi';
      };

      const levelSystem: LevelSystem = {
        current_level: currentLevel,
        experience_points: currentXP,
        points_to_next_level: pointsToNextLevel,
        level_title: getLevelTitle(currentLevel),
        level_description: levelDescriptions[currentLevel] || 'Praktisi mindfulness yang berdedikasi',
        level_benefits: this.getLevelBenefits(currentLevel),
        next_level_preview: {
          level: currentLevel + 1,
          title: getLevelTitle(currentLevel + 1),
          benefits: this.getLevelBenefits(currentLevel + 1),
          xp_required: pointsToNextLevel
        }
      };

      return { levelSystem, error: null };
    } catch (error) {
      console.error('Error getting level system:', error);
      return { levelSystem: null, error };
    }
  }

  private getLevelBenefits(level: number): string[] {
    const benefits: string[] = [];
    
    if (level >= 2) benefits.push('Akses ke sesi guided premium');
    if (level >= 3) benefits.push('Custom meditation timer');
    if (level >= 5) benefits.push('Advanced progress analytics');
    if (level >= 7) benefits.push('Exclusive mindfulness content');
    if (level >= 10) benefits.push('Master class series');
    if (level >= 15) benefits.push('Mentor program access');
    if (level >= 20) benefits.push('Community leader status');

    return benefits;
  }

  // Comprehensive Analytics
  async getProgressAnalytics(userId: string, period: 'week' | 'month' | 'year' | 'all' = 'all'): Promise<{ analytics: ProgressAnalytics | null; error: any }> {
    try {
      const [progress, sessions, streaks] = await Promise.all([
        this.getUserProgress(userId),
        this.getSessionsForPeriod(userId, period),
        this.getUserStreaks(userId)
      ]);

      if (progress.error || !progress.progress) {
        throw new Error('Could not fetch user progress');
      }

      // Calculate overview
      const overview = await this.calculateOverview(progress.progress, sessions, streaks.streaks);
      
      // Calculate trends
      const trends = await this.calculateTrends(sessions, period);
      
      // Calculate comparisons
      const comparisons = await this.calculateComparisons(userId, sessions);
      
      // Generate predictions
      const predictions = await this.generatePredictions(progress.progress, sessions, streaks.streaks);
      
      // Generate insights
      const insights = await this.generateInsights(progress.progress, sessions, streaks.streaks, trends);

      const analytics: ProgressAnalytics = {
        overview,
        trends,
        comparisons,
        predictions,
        insights
      };

      return { analytics, error: null };
    } catch (error) {
      console.error('Error getting progress analytics:', error);
      return { analytics: null, error };
    }
  }

  private async getSessionsForPeriod(userId: string, period: string): Promise<any[]> {
    let dateFilter = '';
    const now = new Date();

    switch (period) {
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = weekAgo.toISOString();
        break;
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = monthAgo.toISOString();
        break;
      }
      case 'year': {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter = yearAgo.toISOString();
        break;
      }
    }

    let query = supabase
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', userId);

    if (dateFilter) {
      query = query.gte('completed_at', dateFilter);
    }

    const { data } = await query.order('completed_at', { ascending: false });
    return data || [];
  }

  private async calculateOverview(progress: UserProgress, sessions: any[], streaks: StreakData[]): Promise<ProgressOverview> {
    const totalSessions = progress.total_sessions;
    const totalMinutes = progress.total_minutes;
    const averageSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;
    
    // Calculate consistency (percentage of days with sessions in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = sessions.filter(s => new Date(s.completed_at) >= thirtyDaysAgo);
    const uniqueDays = new Set(recentSessions.map(s => new Date(s.completed_at).toDateString()));
    const consistency = (uniqueDays.size / 30) * 100;

    const nextLevelXP = this.getXPForLevel(progress.level + 1);
    const progressToNextLevel = nextLevelXP > 0 
      ? ((progress.experience_points - this.getXPForLevel(progress.level)) / (nextLevelXP - this.getXPForLevel(progress.level))) * 100
      : 100;

    return {
      totalSessions,
      totalMinutes,
      currentLevel: progress.level,
      experiencePoints: progress.experience_points,
      nextLevelXP,
      progressToNextLevel: Math.min(100, Math.max(0, progressToNextLevel)),
      currentStreak: progress.current_streak,
      longestStreak: progress.longest_streak,
      averageSessionLength: Math.round(averageSessionLength * 10) / 10,
      consistency: Math.round(consistency),
      achievement_count: progress.achievements.length
    };
  }

  private async calculateTrends(sessions: any[], period: string): Promise<ProgressTrends> {
    // Implement trend calculations
    const daily = this.calculateDailyTrends(sessions);
    const weekly = this.calculateWeeklyTrends(sessions);
    const monthly = this.calculateMonthlyTrends(sessions);
    const yearly = this.calculateYearlyTrends(sessions);

    return { daily, weekly, monthly, yearly };
  }

  private calculateDailyTrends(sessions: any[]): DailyTrend[] {
    const dailyData: { [date: string]: DailyTrend } = {};

    sessions.forEach(session => {
      const date = new Date(session.completed_at).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          sessions: 0,
          minutes: 0,
          streak: 0
        };
      }

      dailyData[date].sessions += 1;
      dailyData[date].minutes += session.duration_minutes;
    });

    return Object.values(dailyData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days
  }

  private calculateWeeklyTrends(sessions: any[]): WeeklyTrend[] {
    const weeklyData: { [week: string]: WeeklyTrend } = {};

    sessions.forEach(session => {
      const sessionDate = new Date(session.completed_at);
      const weekStart = new Date(sessionDate);
      weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week_start: weekKey,
          sessions: 0,
          minutes: 0,
          consistency: 0,
          average_rating: 0,
          goal_achievement: 0
        };
      }

      weeklyData[weekKey].sessions += 1;
      weeklyData[weekKey].minutes += session.duration_minutes;
      
      if (session.quality_rating) {
        const current = weeklyData[weekKey].average_rating;
        const count = weeklyData[weekKey].sessions;
        weeklyData[weekKey].average_rating = ((current * (count - 1)) + session.quality_rating) / count;
      }
    });

    return Object.values(weeklyData)
      .sort((a, b) => new Date(a.week_start).getTime() - new Date(b.week_start).getTime())
      .slice(-12); // Last 12 weeks
  }

  private calculateMonthlyTrends(sessions: any[]): MonthlyTrend[] {
    const monthlyData: { [month: string]: MonthlyTrend } = {};

    sessions.forEach(session => {
      const date = new Date(session.completed_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          sessions: 0,
          minutes: 0,
          streak_days: 0,
          achievements_earned: 0,
          consistency_score: 0
        };
      }

      monthlyData[monthKey].sessions += 1;
      monthlyData[monthKey].minutes += session.duration_minutes;
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }

  private calculateYearlyTrends(sessions: any[]): YearlyTrend[] {
    const yearlyData: { [year: string]: YearlyTrend } = {};

    sessions.forEach(session => {
      const year = new Date(session.completed_at).getFullYear().toString();

      if (!yearlyData[year]) {
        yearlyData[year] = {
          year,
          sessions: 0,
          minutes: 0,
          achievements: 0,
          level_progression: 0,
          consistency: 0
        };
      }

      yearlyData[year].sessions += 1;
      yearlyData[year].minutes += session.duration_minutes;
    });

    return Object.values(yearlyData)
      .sort((a, b) => a.year.localeCompare(b.year));
  }

  private async calculateComparisons(userId: string, currentSessions: any[]): Promise<ProgressComparisons> {
    // Implement comparison calculations
    const vs_last_week = await this.compareWithPreviousPeriod(userId, currentSessions, 'week');
    const vs_last_month = await this.compareWithPreviousPeriod(userId, currentSessions, 'month');
    const vs_last_year = await this.compareWithPreviousPeriod(userId, currentSessions, 'year');
    const vs_community_average = await this.compareWithCommunityAverage(currentSessions);

    return {
      vs_last_week,
      vs_last_month,
      vs_last_year,
      vs_community_average
    };
  }

  private async compareWithPreviousPeriod(userId: string, currentSessions: any[], period: 'week' | 'month' | 'year'): Promise<ComparisonData> {
    // Simplified comparison logic
    const currentPeriodSessions = currentSessions.length;
    const currentPeriodMinutes = currentSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    
    // This would typically fetch previous period data from database
    const previousPeriodSessions = Math.floor(currentPeriodSessions * 0.8); // Mock data
    const previousPeriodMinutes = Math.floor(currentPeriodMinutes * 0.8);

    return {
      sessions: {
        current: currentPeriodSessions,
        previous: previousPeriodSessions,
        change: currentPeriodSessions - previousPeriodSessions,
        percentage: previousPeriodSessions > 0 ? ((currentPeriodSessions - previousPeriodSessions) / previousPeriodSessions) * 100 : 0
      },
      minutes: {
        current: currentPeriodMinutes,
        previous: previousPeriodMinutes,
        change: currentPeriodMinutes - previousPeriodMinutes,
        percentage: previousPeriodMinutes > 0 ? ((currentPeriodMinutes - previousPeriodMinutes) / previousPeriodMinutes) * 100 : 0
      },
      consistency: {
        current: 75, // Mock data
        previous: 65,
        change: 10,
        percentage: 15.4
      },
      quality: {
        current: 4.2, // Mock data
        previous: 3.8,
        change: 0.4,
        percentage: 10.5
      }
    };
  }

  private async compareWithCommunityAverage(sessions: any[]): Promise<ComparisonData> {
    // Mock community comparison data
    return {
      sessions: {
        current: sessions.length,
        previous: 12, // Community average
        change: sessions.length - 12,
        percentage: sessions.length > 0 ? ((sessions.length - 12) / 12) * 100 : 0
      },
      minutes: {
        current: sessions.reduce((sum, s) => sum + s.duration_minutes, 0),
        previous: 180, // Community average minutes
        change: sessions.reduce((sum, s) => sum + s.duration_minutes, 0) - 180,
        percentage: 25.5
      },
      consistency: {
        current: 75,
        previous: 60, // Community average
        change: 15,
        percentage: 25
      },
      quality: {
        current: 4.2,
        previous: 3.9, // Community average
        change: 0.3,
        percentage: 7.7
      }
    };
  }

  private async generatePredictions(progress: UserProgress, sessions: any[], streaks: StreakData[]): Promise<ProgressPredictions> {
    // Generate predictions based on current trends
    const sessionsPerWeek = sessions.length > 0 ? sessions.length / 4 : 0; // Assuming month data
    const xpPerSession = 10; // Average XP per session

    const xpToNextLevel = this.getXPForLevel(progress.level + 1) - progress.experience_points;
    const sessionsToNextLevel = Math.ceil(xpToNextLevel / xpPerSession);
    const weeksToNextLevel = sessionsPerWeek > 0 ? Math.ceil(sessionsToNextLevel / sessionsPerWeek) : 0;

    const nextLevelDate = new Date();
    nextLevelDate.setDate(nextLevelDate.getDate() + (weeksToNextLevel * 7));

    return {
      next_level_estimate: weeksToNextLevel > 0 ? nextLevelDate.toLocaleDateString('id-ID') : 'Tidak dapat diprediksi',
      next_achievement_estimate: 'Dalam 2 minggu',
      weekly_goal_prediction: {
        likelihood: sessionsPerWeek >= progress.weekly_goal ? 95 : Math.min(90, (sessionsPerWeek / progress.weekly_goal) * 100),
        estimated_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID')
      },
      monthly_goal_prediction: {
        likelihood: sessionsPerWeek * 4 >= progress.monthly_goal ? 90 : Math.min(85, (sessionsPerWeek * 4 / progress.monthly_goal) * 100),
        sessions_needed: Math.max(0, progress.monthly_goal - sessions.length)
      },
      streak_milestone_prediction: {
        next_milestone: Math.ceil((progress.current_streak + 1) / 10) * 10,
        estimated_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID')
      }
    };
  }

  private async generateInsights(progress: UserProgress, sessions: any[], streaks: StreakData[], trends: ProgressTrends): Promise<ProgressInsights> {
    const strengths: string[] = [];
    const areas_for_improvement: string[] = [];
    const recommendations: string[] = [];
    const patterns: InsightPattern[] = [];
    const milestones: ProgressMilestone[] = [];

    // Analyze strengths
    if (progress.current_streak >= 7) {
      strengths.push('Konsistensi yang luar biasa dengan streak ' + progress.current_streak + ' hari');
    }
    if (sessions.length >= 20) {
      strengths.push('Frekuensi meditasi yang tinggi bulan ini');
    }

    // Areas for improvement
    if (progress.current_streak < 3) {
      areas_for_improvement.push('Konsistensi harian perlu ditingkatkan');
    }
    if (sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / sessions.length < 10) {
      areas_for_improvement.push('Durasi sesi rata-rata bisa diperpanjang');
    }

    // Recommendations
    if (progress.current_streak === 0) {
      recommendations.push('Mulai dengan sesi pendek 5-10 menit setiap hari');
    }
    if (sessions.length > 0) {
      const favoriteTime = this.getMostFrequentSessionTime(sessions);
      recommendations.push(`Waktu terbaik Anda untuk bermeditasi adalah ${favoriteTime}`);
    }

    // Generate milestones
    const nextSessionMilestone = Math.ceil(progress.total_sessions / 10) * 10;
    milestones.push({
      id: 'sessions',
      title: `${nextSessionMilestone} Sesi Total`,
      description: `Capai ${nextSessionMilestone} sesi meditasi`,
      category: 'practice',
      target_value: nextSessionMilestone,
      current_value: progress.total_sessions,
      progress_percentage: (progress.total_sessions / nextSessionMilestone) * 100,
      estimated_completion: 'Dalam 2 minggu',
      reward: 'Badge Dedication'
    });

    return {
      strengths,
      areas_for_improvement,
      recommendations,
      patterns,
      milestones
    };
  }

  private getMostFrequentSessionTime(sessions: any[]): string {
    const timeSlots: { [key: string]: number } = {
      'pagi': 0,
      'siang': 0,
      'sore': 0,
      'malam': 0
    };

    sessions.forEach(session => {
      const hour = new Date(session.completed_at).getHours();
      if (hour < 6) timeSlots['malam']++;
      else if (hour < 12) timeSlots['pagi']++;
      else if (hour < 18) timeSlots['siang']++;
      else timeSlots['sore']++;
    });

    return Object.entries(timeSlots).sort(([,a], [,b]) => b - a)[0][0];
  }

  // Helper methods
  private async logExperienceGain(userId: string, points: number, source: string, newLevel?: number): Promise<void> {
    try {
      await supabase.from('experience_log').insert([{
        user_id: userId,
        points_gained: points,
        source,
        new_level: newLevel,
        created_at: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error logging experience gain:', error);
    }
  }

  // Real-time subscriptions
  subscribeToProgressChanges(userId: string, callback: (progress: UserProgress) => void): () => void {
    const subscription = supabase
      .channel('progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as UserProgress);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
}

export const progressApiService = ProgressApiService.getInstance();