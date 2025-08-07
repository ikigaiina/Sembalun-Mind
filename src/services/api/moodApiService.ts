import { supabase } from '../../config/supabaseClient';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy';
  energy_level: number; // 1-5 scale
  stress_level: number; // 1-5 scale (5 is highest stress)
  focus_level: number; // 1-5 scale
  anxiety_level: number; // 1-5 scale (5 is highest anxiety)
  gratitude_level: number; // 1-5 scale
  notes?: string;
  tags: string[];
  context: MoodContext;
  weather?: string;
  sleep_quality?: number; // 1-5 scale
  exercise_today?: boolean;
  meditation_before?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MoodContext {
  location?: 'home' | 'work' | 'commute' | 'outdoors' | 'social' | 'other';
  activity?: 'working' | 'relaxing' | 'socializing' | 'exercising' | 'eating' | 'traveling' | 'other';
  social_situation?: 'alone' | 'with_family' | 'with_friends' | 'with_colleagues' | 'in_crowd' | 'other';
  time_of_day?: 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night';
  special_events?: string[];
}

export interface MoodAnalytics {
  overview: MoodOverview;
  trends: MoodTrends;
  patterns: MoodPattern[];
  correlations: MoodCorrelation[];
  insights: MoodInsight[];
  predictions: MoodPrediction[];
}

export interface MoodOverview {
  total_entries: number;
  current_streak: number;
  average_mood: number;
  mood_distribution: { [mood: string]: number };
  average_energy: number;
  average_stress: number;
  average_focus: number;
  average_anxiety: number;
  average_gratitude: number;
  most_common_context: MoodContext;
  improvement_score: number; // Overall mood improvement over time
}

export interface MoodTrends {
  daily: DailyMoodTrend[];
  weekly: WeeklyMoodTrend[];
  monthly: MonthlyMoodTrend[];
  hourly: HourlyMoodPattern[];
}

export interface DailyMoodTrend {
  date: string;
  average_mood: number;
  energy_level: number;
  stress_level: number;
  focus_level: number;
  anxiety_level: number;
  gratitude_level: number;
  entries_count: number;
  dominant_mood: string;
}

export interface WeeklyMoodTrend {
  week_start: string;
  average_mood: number;
  mood_stability: number; // Lower variance = more stable
  energy_trend: 'improving' | 'declining' | 'stable';
  stress_trend: 'improving' | 'declining' | 'stable';
  entries_count: number;
  best_day: string;
  worst_day: string;
}

export interface MonthlyMoodTrend {
  month: string;
  average_mood: number;
  mood_volatility: number;
  improvement_from_previous: number;
  consistency_score: number; // How regularly user tracked mood
  milestone_achievements: string[];
}

export interface HourlyMoodPattern {
  hour: number;
  average_mood: number;
  average_energy: number;
  average_stress: number;
  entry_count: number;
  most_common_activity: string;
}

export interface MoodPattern {
  type: 'temporal' | 'contextual' | 'behavioral' | 'environmental';
  description: string;
  confidence: number; // 0-100
  impact: 'positive' | 'negative' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong';
  examples: string[];
  recommendations: string[];
}

export interface MoodCorrelation {
  factor: 'sleep_quality' | 'exercise' | 'meditation' | 'weather' | 'day_of_week' | 'time_of_day' | 'social_context';
  correlation_strength: number; // -1 to 1
  significance: 'low' | 'moderate' | 'high';
  description: string;
  positive_examples: string[];
  negative_examples: string[];
  actionable_insights: string[];
}

export interface MoodInsight {
  category: 'strength' | 'opportunity' | 'pattern' | 'warning' | 'achievement';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  action_items: string[];
  supporting_data: any;
}

export interface MoodPrediction {
  type: 'daily' | 'weekly' | 'situational';
  timeframe: string;
  predicted_mood: number;
  confidence: number;
  influencing_factors: string[];
  recommendations: string[];
  risk_factors: string[];
}

export interface MoodStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_entry_date: string;
  streak_type: 'tracking' | 'positive_mood' | 'improvement' | 'stability';
  milestones_reached: number[];
  created_at: string;
  updated_at: string;
}

export interface MoodChallenge {
  id: string;
  user_id: string;
  title: string;
  description: string;
  challenge_type: 'tracking_consistency' | 'mood_improvement' | 'stress_reduction' | 'gratitude_practice';
  target_value: number;
  current_value: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_completed: boolean;
  completed_at?: string;
  reward: {
    type: string;
    title: string;
    description: string;
    value?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface MoodExport {
  user_id: string;
  export_date: string;
  period: {
    start_date: string;
    end_date: string;
  };
  summary: MoodOverview;
  entries: MoodEntry[];
  analytics: MoodAnalytics;
  format: 'json' | 'csv' | 'pdf';
}

export class MoodApiService {
  private static instance: MoodApiService;

  static getInstance(): MoodApiService {
    if (!MoodApiService.instance) {
      MoodApiService.instance = new MoodApiService();
    }
    return MoodApiService.instance;
  }

  // Mood Entry Management
  async createMoodEntry(entryData: Omit<MoodEntry, 'id' | 'created_at' | 'updated_at'>): Promise<{ entry: MoodEntry | null; error: any }> {
    try {
      // Validate entry data
      this.validateMoodEntry(entryData);

      const { data, error } = await supabase
        .from('moods')
        .insert([{
          ...entryData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update mood tracking streak
      await this.updateMoodStreak(entryData.user_id);

      // Check for mood-based achievements
      await this.checkMoodAchievements(entryData.user_id, data);

      return { entry: data, error: null };
    } catch (error) {
      console.error('Error creating mood entry:', error);
      return { entry: null, error };
    }
  }

  async getUserMoodEntries(userId: string, limit: number = 100, offset: number = 0): Promise<{ entries: MoodEntry[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { entries: data || [], error: null };
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      return { entries: [], error };
    }
  }

  async updateMoodEntry(entryId: string, updates: Partial<MoodEntry>): Promise<{ entry: MoodEntry | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('moods')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      return { entry: data, error: null };
    } catch (error) {
      console.error('Error updating mood entry:', error);
      return { entry: null, error };
    }
  }

  async deleteMoodEntry(entryId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('moods')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      return { success: false, error };
    }
  }

  // Mood Analytics
  async getMoodAnalytics(userId: string, period: 'week' | 'month' | 'quarter' | 'year' | 'all' = 'month'): Promise<{ analytics: MoodAnalytics | null; error: any }> {
    try {
      const entries = await this.getMoodEntriesForPeriod(userId, period);
      
      if (entries.length === 0) {
        return { analytics: null, error: 'No mood data available for the selected period' };
      }

      const overview = this.calculateMoodOverview(entries);
      const trends = this.calculateMoodTrends(entries);
      const patterns = await this.identifyMoodPatterns(entries);
      const correlations = await this.calculateMoodCorrelations(entries);
      const insights = await this.generateMoodInsights(entries, patterns, correlations);
      const predictions = await this.generateMoodPredictions(entries, patterns);

      const analytics: MoodAnalytics = {
        overview,
        trends,
        patterns,
        correlations,
        insights,
        predictions
      };

      return { analytics, error: null };
    } catch (error) {
      console.error('Error getting mood analytics:', error);
      return { analytics: null, error };
    }
  }

  private async getMoodEntriesForPeriod(userId: string, period: string): Promise<MoodEntry[]> {
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
      case 'quarter': {
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        dateFilter = quarterAgo.toISOString();
        break;
      }
      case 'year': {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter = yearAgo.toISOString();
        break;
      }
    }

    let query = supabase
      .from('moods')
      .select('*')
      .eq('user_id', userId);

    if (dateFilter) {
      query = query.gte('created_at', dateFilter);
    }

    const { data } = await query.order('created_at', { ascending: true });
    return data || [];
  }

  private calculateMoodOverview(entries: MoodEntry[]): MoodOverview {
    if (entries.length === 0) {
      return {
        total_entries: 0,
        current_streak: 0,
        average_mood: 0,
        mood_distribution: {},
        average_energy: 0,
        average_stress: 0,
        average_focus: 0,
        average_anxiety: 0,
        average_gratitude: 0,
        most_common_context: {},
        improvement_score: 0
      };
    }

    const moodValues: { [key: string]: number } = {
      'very_sad': 1,
      'sad': 2,
      'neutral': 3,
      'happy': 4,
      'very_happy': 5
    };

    const total_entries = entries.length;
    const average_mood = entries.reduce((sum, e) => sum + moodValues[e.mood], 0) / total_entries;
    const average_energy = entries.reduce((sum, e) => sum + e.energy_level, 0) / total_entries;
    const average_stress = entries.reduce((sum, e) => sum + e.stress_level, 0) / total_entries;
    const average_focus = entries.reduce((sum, e) => sum + e.focus_level, 0) / total_entries;
    const average_anxiety = entries.reduce((sum, e) => sum + e.anxiety_level, 0) / total_entries;
    const average_gratitude = entries.reduce((sum, e) => sum + e.gratitude_level, 0) / total_entries;

    // Mood distribution
    const mood_distribution: { [mood: string]: number } = {};
    entries.forEach(entry => {
      mood_distribution[entry.mood] = (mood_distribution[entry.mood] || 0) + 1;
    });

    // Most common context
    const contextCount: { [key: string]: number } = {};
    entries.forEach(entry => {
      const location = entry.context.location || 'unknown';
      contextCount[location] = (contextCount[location] || 0) + 1;
    });
    const most_common_location = Object.entries(contextCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    // Current streak calculation (simplified)
    let current_streak = 0;
    const today = new Date();
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].created_at);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        current_streak++;
      } else {
        break;
      }
    }

    // Improvement score (compare first half vs second half)
    const midpoint = Math.floor(entries.length / 2);
    const firstHalf = entries.slice(0, midpoint);
    const secondHalf = entries.slice(midpoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, e) => sum + moodValues[e.mood], 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, e) => sum + moodValues[e.mood], 0) / secondHalf.length;
    const improvement_score = Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);

    return {
      total_entries,
      current_streak,
      average_mood: Math.round(average_mood * 10) / 10,
      mood_distribution,
      average_energy: Math.round(average_energy * 10) / 10,
      average_stress: Math.round(average_stress * 10) / 10,
      average_focus: Math.round(average_focus * 10) / 10,
      average_anxiety: Math.round(average_anxiety * 10) / 10,
      average_gratitude: Math.round(average_gratitude * 10) / 10,
      most_common_context: { location: most_common_location },
      improvement_score
    };
  }

  private calculateMoodTrends(entries: MoodEntry[]): MoodTrends {
    const daily = this.calculateDailyTrends(entries);
    const weekly = this.calculateWeeklyTrends(entries);
    const monthly = this.calculateMonthlyTrends(entries);
    const hourly = this.calculateHourlyPatterns(entries);

    return { daily, weekly, monthly, hourly };
  }

  private calculateDailyTrends(entries: MoodEntry[]): DailyMoodTrend[] {
    const dailyData: { [date: string]: MoodEntry[] } = {};
    const moodValues: { [key: string]: number } = {
      'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
    };

    entries.forEach(entry => {
      const date = new Date(entry.created_at).toISOString().split('T')[0];
      if (!dailyData[date]) dailyData[date] = [];
      dailyData[date].push(entry);
    });

    return Object.entries(dailyData).map(([date, dayEntries]) => {
      const avgMood = dayEntries.reduce((sum, e) => sum + moodValues[e.mood], 0) / dayEntries.length;
      const avgEnergy = dayEntries.reduce((sum, e) => sum + e.energy_level, 0) / dayEntries.length;
      const avgStress = dayEntries.reduce((sum, e) => sum + e.stress_level, 0) / dayEntries.length;
      const avgFocus = dayEntries.reduce((sum, e) => sum + e.focus_level, 0) / dayEntries.length;
      const avgAnxiety = dayEntries.reduce((sum, e) => sum + e.anxiety_level, 0) / dayEntries.length;
      const avgGratitude = dayEntries.reduce((sum, e) => sum + e.gratitude_level, 0) / dayEntries.length;

      const moodCounts: { [mood: string]: number } = {};
      dayEntries.forEach(e => {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      });
      const dominantMood = Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

      return {
        date,
        average_mood: Math.round(avgMood * 10) / 10,
        energy_level: Math.round(avgEnergy * 10) / 10,
        stress_level: Math.round(avgStress * 10) / 10,
        focus_level: Math.round(avgFocus * 10) / 10,
        anxiety_level: Math.round(avgAnxiety * 10) / 10,
        gratitude_level: Math.round(avgGratitude * 10) / 10,
        entries_count: dayEntries.length,
        dominant_mood: dominantMood
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private calculateWeeklyTrends(entries: MoodEntry[]): WeeklyMoodTrend[] {
    // Group entries by week
    const weeklyData: { [week: string]: MoodEntry[] } = {};
    const moodValues: { [key: string]: number } = {
      'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
    };

    entries.forEach(entry => {
      const entryDate = new Date(entry.created_at);
      const weekStart = new Date(entryDate);
      weekStart.setDate(entryDate.getDate() - entryDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) weeklyData[weekKey] = [];
      weeklyData[weekKey].push(entry);
    });

    return Object.entries(weeklyData).map(([weekStart, weekEntries]) => {
      const dailyAverages: { [day: string]: number } = {};
      
      weekEntries.forEach(entry => {
        const day = new Date(entry.created_at).toISOString().split('T')[0];
        if (!dailyAverages[day]) dailyAverages[day] = [];
        dailyAverages[day].push(moodValues[entry.mood]);
      });

      // Calculate daily averages for the week
      const dayAverages = Object.entries(dailyAverages).map(([day, moods]) => ({
        day,
        average: moods.reduce((sum, mood) => sum + mood, 0) / moods.length
      }));

      const weekAverage = dayAverages.reduce((sum, day) => sum + day.average, 0) / dayAverages.length;
      
      // Calculate mood stability (inverse of variance)
      const variance = dayAverages.reduce((sum, day) => 
        sum + Math.pow(day.average - weekAverage, 2), 0) / dayAverages.length;
      const mood_stability = Math.max(0, 100 - (variance * 25)); // Normalize to 0-100

      const bestDay = dayAverages.sort((a, b) => b.average - a.average)[0]?.day || '';
      const worstDay = dayAverages.sort((a, b) => a.average - b.average)[0]?.day || '';

      // Simple trend calculation
      const firstHalf = dayAverages.slice(0, Math.ceil(dayAverages.length / 2));
      const secondHalf = dayAverages.slice(Math.ceil(dayAverages.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.average, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.average, 0) / secondHalf.length;
      
      const getTrend = (first: number, second: number) => {
        const change = ((second - first) / first) * 100;
        return change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable';
      };

      // Calculate energy and stress trends
      const energyFirst = firstHalf.reduce((sum, _, i) => {
        const dayEntries = weekEntries.filter(e => 
          new Date(e.created_at).toISOString().split('T')[0] === firstHalf[i]?.day
        );
        return sum + (dayEntries.reduce((s, e) => s + e.energy_level, 0) / dayEntries.length || 0);
      }, 0) / firstHalf.length;

      const energySecond = secondHalf.reduce((sum, _, i) => {
        const dayEntries = weekEntries.filter(e => 
          new Date(e.created_at).toISOString().split('T')[0] === secondHalf[i]?.day
        );
        return sum + (dayEntries.reduce((s, e) => s + e.energy_level, 0) / dayEntries.length || 0);
      }, 0) / secondHalf.length;

      return {
        week_start: weekStart,
        average_mood: Math.round(weekAverage * 10) / 10,
        mood_stability: Math.round(mood_stability),
        energy_trend: getTrend(energyFirst, energySecond),
        stress_trend: 'stable', // Simplified for now
        entries_count: weekEntries.length,
        best_day: bestDay,
        worst_day: worstDay
      };
    }).sort((a, b) => new Date(a.week_start).getTime() - new Date(b.week_start).getTime());
  }

  private calculateMonthlyTrends(entries: MoodEntry[]): MonthlyMoodTrend[] {
    const monthlyData: { [month: string]: MoodEntry[] } = {};
    const moodValues: { [key: string]: number } = {
      'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
    };

    entries.forEach(entry => {
      const date = new Date(entry.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) monthlyData[monthKey] = [];
      monthlyData[monthKey].push(entry);
    });

    return Object.entries(monthlyData).map(([month, monthEntries]) => {
      const avgMood = monthEntries.reduce((sum, e) => sum + moodValues[e.mood], 0) / monthEntries.length;
      
      // Calculate volatility (standard deviation)
      const variance = monthEntries.reduce((sum, e) => 
        sum + Math.pow(moodValues[e.mood] - avgMood, 2), 0) / monthEntries.length;
      const mood_volatility = Math.sqrt(variance);

      // Calculate consistency score (how regularly user tracked mood)
      const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
      const uniqueDays = new Set(monthEntries.map(e => 
        new Date(e.created_at).toISOString().split('T')[0]
      ));
      const consistency_score = (uniqueDays.size / daysInMonth) * 100;

      return {
        month,
        average_mood: Math.round(avgMood * 10) / 10,
        mood_volatility: Math.round(mood_volatility * 10) / 10,
        improvement_from_previous: 0, // Would calculate from previous month
        consistency_score: Math.round(consistency_score),
        milestone_achievements: [] // Would check for achievements
      };
    }).sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateHourlyPatterns(entries: MoodEntry[]): HourlyMoodPattern[] {
    const hourlyData: { [hour: number]: MoodEntry[] } = {};
    const moodValues: { [key: string]: number } = {
      'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
    };

    entries.forEach(entry => {
      const hour = new Date(entry.created_at).getHours();
      if (!hourlyData[hour]) hourlyData[hour] = [];
      hourlyData[hour].push(entry);
    });

    const patterns: HourlyMoodPattern[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourEntries = hourlyData[hour] || [];
      
      if (hourEntries.length === 0) {
        patterns.push({
          hour,
          average_mood: 0,
          average_energy: 0,
          average_stress: 0,
          entry_count: 0,
          most_common_activity: 'unknown'
        });
        continue;
      }

      const avgMood = hourEntries.reduce((sum, e) => sum + moodValues[e.mood], 0) / hourEntries.length;
      const avgEnergy = hourEntries.reduce((sum, e) => sum + e.energy_level, 0) / hourEntries.length;
      const avgStress = hourEntries.reduce((sum, e) => sum + e.stress_level, 0) / hourEntries.length;

      // Find most common activity
      const activityCount: { [activity: string]: number } = {};
      hourEntries.forEach(entry => {
        const activity = entry.context.activity || 'unknown';
        activityCount[activity] = (activityCount[activity] || 0) + 1;
      });
      const most_common_activity = Object.entries(activityCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';

      patterns.push({
        hour,
        average_mood: Math.round(avgMood * 10) / 10,
        average_energy: Math.round(avgEnergy * 10) / 10,
        average_stress: Math.round(avgStress * 10) / 10,
        entry_count: hourEntries.length,
        most_common_activity
      });
    }

    return patterns;
  }

  private async identifyMoodPatterns(entries: MoodEntry[]): Promise<MoodPattern[]> {
    const patterns: MoodPattern[] = [];

    // Temporal patterns
    const timePatterns = this.analyzeTemporalPatterns(entries);
    patterns.push(...timePatterns);

    // Contextual patterns
    const contextPatterns = this.analyzeContextualPatterns(entries);
    patterns.push(...contextPatterns);

    return patterns;
  }

  private analyzeTemporalPatterns(entries: MoodEntry[]): MoodPattern[] {
    const patterns: MoodPattern[] = [];
    const moodValues: { [key: string]: number } = {
      'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
    };

    // Day of week pattern
    const dayOfWeekMoods: { [day: number]: number[] } = {};
    entries.forEach(entry => {
      const dayOfWeek = new Date(entry.created_at).getDay();
      if (!dayOfWeekMoods[dayOfWeek]) dayOfWeekMoods[dayOfWeek] = [];
      dayOfWeekMoods[dayOfWeek].push(moodValues[entry.mood]);
    });

    const dayAverages = Object.entries(dayOfWeekMoods).map(([day, moods]) => ({
      day: parseInt(day),
      average: moods.reduce((sum, mood) => sum + mood, 0) / moods.length
    }));

    const bestDay = dayAverages.sort((a, b) => b.average - a.average)[0];
    const worstDay = dayAverages.sort((a, b) => a.average - b.average)[0];

    if (bestDay && worstDay && Math.abs(bestDay.average - worstDay.average) > 0.5) {
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      patterns.push({
        type: 'temporal',
        description: `Mood Anda cenderung lebih baik pada hari ${dayNames[bestDay.day]} dan lebih rendah pada hari ${dayNames[worstDay.day]}`,
        confidence: 75,
        impact: 'positive',
        strength: 'moderate',
        examples: [`Rata-rata mood ${dayNames[bestDay.day]}: ${bestDay.average.toFixed(1)}`],
        recommendations: [`Rencanakan aktivitas menyenangkan pada hari ${dayNames[worstDay.day]}`]
      });
    }

    return patterns;
  }

  private analyzeContextualPatterns(entries: MoodEntry[]): MoodPattern[] {
    const patterns: MoodPattern[] = [];
    const moodValues: { [key: string]: number } = {
      'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
    };

    // Location pattern
    const locationMoods: { [location: string]: number[] } = {};
    entries.forEach(entry => {
      const location = entry.context.location || 'unknown';
      if (!locationMoods[location]) locationMoods[location] = [];
      locationMoods[location].push(moodValues[entry.mood]);
    });

    const locationAverages = Object.entries(locationMoods)
      .filter(([, moods]) => moods.length >= 3) // Only consider locations with sufficient data
      .map(([location, moods]) => ({
        location,
        average: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
        count: moods.length
      }));

    const bestLocation = locationAverages.sort((a, b) => b.average - a.average)[0];
    const worstLocation = locationAverages.sort((a, b) => a.average - b.average)[0];

    if (bestLocation && worstLocation && Math.abs(bestLocation.average - worstLocation.average) > 0.5) {
      patterns.push({
        type: 'contextual',
        description: `Mood Anda cenderung lebih baik di ${bestLocation.location} dibandingkan di ${worstLocation.location}`,
        confidence: 70,
        impact: 'positive',
        strength: 'moderate',
        examples: [`Rata-rata mood di ${bestLocation.location}: ${bestLocation.average.toFixed(1)}`],
        recommendations: [`Habiskan lebih banyak waktu di ${bestLocation.location} ketika mood sedang turun`]
      });
    }

    return patterns;
  }

  private async calculateMoodCorrelations(entries: MoodEntry[]): Promise<MoodCorrelation[]> {
    const correlations: MoodCorrelation[] = [];
    const moodValues: { [key: string]: number } = {
      'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
    };

    // Sleep quality correlation
    const sleepMoodPairs = entries
      .filter(e => e.sleep_quality !== undefined)
      .map(e => ({ sleep: e.sleep_quality!, mood: moodValues[e.mood] }));

    if (sleepMoodPairs.length >= 5) {
      const correlation = this.calculateCorrelation(
        sleepMoodPairs.map(p => p.sleep),
        sleepMoodPairs.map(p => p.mood)
      );

      correlations.push({
        factor: 'sleep_quality',
        correlation_strength: correlation,
        significance: Math.abs(correlation) > 0.5 ? 'high' : Math.abs(correlation) > 0.3 ? 'moderate' : 'low',
        description: `Kualitas tidur ${correlation > 0.3 ? 'berkorelasi positif' : correlation < -0.3 ? 'berkorelasi negatif' : 'memiliki korelasi lemah'} dengan mood`,
        positive_examples: correlation > 0.3 ? ['Tidur berkualitas meningkatkan mood'] : [],
        negative_examples: correlation < -0.3 ? ['Kurang tidur menurunkan mood'] : [],
        actionable_insights: correlation > 0.3 ? ['Prioritaskan tidur yang cukup untuk mood yang lebih baik'] : []
      });
    }

    // Exercise correlation
    const exerciseMoodPairs = entries.map(e => ({
      exercise: e.exercise_today ? 1 : 0,
      mood: moodValues[e.mood]
    }));

    if (exerciseMoodPairs.length >= 10) {
      const correlation = this.calculateCorrelation(
        exerciseMoodPairs.map(p => p.exercise),
        exerciseMoodPairs.map(p => p.mood)
      );

      correlations.push({
        factor: 'exercise',
        correlation_strength: correlation,
        significance: Math.abs(correlation) > 0.4 ? 'high' : Math.abs(correlation) > 0.2 ? 'moderate' : 'low',
        description: `Olahraga ${correlation > 0.2 ? 'meningkatkan' : 'memiliki efek minimal pada'} mood`,
        positive_examples: correlation > 0.2 ? ['Hari dengan olahraga umumnya mood lebih baik'] : [],
        negative_examples: [],
        actionable_insights: correlation > 0.2 ? ['Jadwalkan olahraga rutin untuk meningkatkan mood'] : []
      });
    }

    return correlations;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private async generateMoodInsights(
    entries: MoodEntry[],
    patterns: MoodPattern[],
    correlations: MoodCorrelation[]
  ): Promise<MoodInsight[]> {
    const insights: MoodInsight[] = [];

    // Analyze consistency
    const daysWithEntries = new Set(entries.map(e => 
      new Date(e.created_at).toISOString().split('T')[0]
    )).size;
    
    const totalDays = Math.ceil(
      (Date.now() - new Date(entries[0]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const consistencyRate = (daysWithEntries / Math.max(totalDays, 1)) * 100;

    if (consistencyRate > 80) {
      insights.push({
        category: 'strength',
        title: 'Konsistensi Tracking Luar Biasa',
        description: `Anda telah mencatat mood dengan konsistensi ${consistencyRate.toFixed(0)}%`,
        confidence: 95,
        priority: 'high',
        action_items: ['Pertahankan kebiasaan tracking yang baik ini'],
        supporting_data: { consistency_rate: consistencyRate }
      });
    } else if (consistencyRate < 50) {
      insights.push({
        category: 'opportunity',
        title: 'Tingkatkan Konsistensi Tracking',
        description: 'Tracking mood yang lebih rutin akan memberikan insights yang lebih akurat',
        confidence: 80,
        priority: 'medium',
        action_items: [
          'Set reminder harian untuk mencatat mood',
          'Mulai dengan target 3x seminggu'
        ],
        supporting_data: { consistency_rate: consistencyRate }
      });
    }

    // Strong positive correlations
    const strongPositiveCorrelations = correlations.filter(c => 
      c.correlation_strength > 0.4 && c.significance === 'high'
    );

    strongPositiveCorrelations.forEach(correlation => {
      insights.push({
        category: 'pattern',
        title: `${correlation.factor} Sangat Mempengaruhi Mood`,
        description: correlation.description,
        confidence: 85,
        priority: 'high',
        action_items: correlation.actionable_insights,
        supporting_data: { correlation: correlation.correlation_strength }
      });
    });

    return insights;
  }

  private async generateMoodPredictions(
    entries: MoodEntry[],
    patterns: MoodPattern[]
  ): Promise<MoodPrediction[]> {
    const predictions: MoodPrediction[] = [];

    // Simple daily prediction based on day of week pattern
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay();

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const moodValues: { [key: string]: number } = {
      'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
    };

    // Calculate average mood for tomorrow's day of week
    const tomorrowDayEntries = entries.filter(e => 
      new Date(e.created_at).getDay() === tomorrowDay
    );

    if (tomorrowDayEntries.length >= 3) {
      const avgMood = tomorrowDayEntries.reduce((sum, e) => 
        sum + moodValues[e.mood], 0) / tomorrowDayEntries.length;

      predictions.push({
        type: 'daily',
        timeframe: `Besok (${dayNames[tomorrowDay]})`,
        predicted_mood: Math.round(avgMood * 10) / 10,
        confidence: Math.min(90, tomorrowDayEntries.length * 10),
        influencing_factors: ['Pola hari dalam seminggu', 'Data historis'],
        recommendations: avgMood < 3 ? [
          'Rencanakan aktivitas yang meningkatkan mood',
          'Prioritaskan self-care'
        ] : [
          'Manfaatkan mood positif untuk produktivitas',
          'Pertahankan rutinitas yang baik'
        ],
        risk_factors: avgMood < 3 ? ['Hari yang cenderung mood rendah'] : []
      });
    }

    return predictions;
  }

  // Mood Streaks
  private async updateMoodStreak(userId: string): Promise<void> {
    try {
      const { data: streak, error } = await supabase
        .from('mood_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', 'tracking')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const today = new Date().toISOString().split('T')[0];

      if (!streak) {
        // Create new streak
        const newStreak = {
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_entry_date: today,
          streak_type: 'tracking',
          milestones_reached: []
        };

        await supabase.from('mood_streaks').insert([newStreak]);
      } else {
        const lastEntryDate = new Date(streak.last_entry_date);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          // Same day, no update needed
          return;
        } else if (daysDiff === 1) {
          // Consecutive day, increment streak
          const newCurrentStreak = streak.current_streak + 1;
          const newLongestStreak = Math.max(streak.longest_streak, newCurrentStreak);
          
          await supabase
            .from('mood_streaks')
            .update({
              current_streak: newCurrentStreak,
              longest_streak: newLongestStreak,
              last_entry_date: today,
              updated_at: new Date().toISOString()
            })
            .eq('id', streak.id);
        } else {
          // Streak broken, start new
          await supabase
            .from('mood_streaks')
            .update({
              current_streak: 1,
              last_entry_date: today,
              updated_at: new Date().toISOString()
            })
            .eq('id', streak.id);
        }
      }
    } catch (error) {
      console.error('Error updating mood streak:', error);
    }
  }

  async getMoodStreak(userId: string): Promise<{ streak: MoodStreak | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mood_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', 'tracking')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { streak: data, error: null };
    } catch (error) {
      console.error('Error fetching mood streak:', error);
      return { streak: null, error };
    }
  }

  // Helper methods
  private validateMoodEntry(entry: Omit<MoodEntry, 'id' | 'created_at' | 'updated_at'>): void {
    if (!['very_sad', 'sad', 'neutral', 'happy', 'very_happy'].includes(entry.mood)) {
      throw new Error('Invalid mood value');
    }

    if (entry.energy_level < 1 || entry.energy_level > 5) {
      throw new Error('Energy level must be between 1 and 5');
    }

    if (entry.stress_level < 1 || entry.stress_level > 5) {
      throw new Error('Stress level must be between 1 and 5');
    }

    if (entry.focus_level < 1 || entry.focus_level > 5) {
      throw new Error('Focus level must be between 1 and 5');
    }

    if (entry.anxiety_level < 1 || entry.anxiety_level > 5) {
      throw new Error('Anxiety level must be between 1 and 5');
    }

    if (entry.gratitude_level < 1 || entry.gratitude_level > 5) {
      throw new Error('Gratitude level must be between 1 and 5');
    }
  }

  private async checkMoodAchievements(userId: string, entry: MoodEntry): Promise<void> {
    // This would integrate with the achievement system
    // For now, just a placeholder
    console.log(`Checking mood achievements for user ${userId}`);
  }

  // Data Export
  async exportMoodData(userId: string, startDate: string, endDate: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<{ export: MoodExport | null; error: any }> {
    try {
      const { data: entries, error: entriesError } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (entriesError) throw entriesError;

      const { analytics } = await this.getMoodAnalytics(userId, 'all');

      const exportData: MoodExport = {
        user_id: userId,
        export_date: new Date().toISOString(),
        period: { start_date: startDate, end_date: endDate },
        summary: analytics?.overview || {} as MoodOverview,
        entries: entries || [],
        analytics: analytics || {} as MoodAnalytics,
        format
      };

      return { export: exportData, error: null };
    } catch (error) {
      console.error('Error exporting mood data:', error);
      return { export: null, error };
    }
  }

  // Real-time subscriptions
  subscribeToMoodEntries(userId: string, callback: (entry: MoodEntry) => void): () => void {
    const subscription = supabase
      .channel('user_moods')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'moods',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as MoodEntry);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
}

export const moodApiService = MoodApiService.getInstance();