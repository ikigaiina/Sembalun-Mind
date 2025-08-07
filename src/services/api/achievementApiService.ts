import { supabase } from '../../config/supabaseClient';
import { progressApiService } from './progressApiService';
import { meditationApiService } from './meditationApiService';

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: 'streak' | 'milestone' | 'skill' | 'consistency' | 'exploration' | 'mastery' | 'special';
  title: string;
  description: string;
  icon: string;
  badge_color: string;
  unlocked_at: string;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  points: number;
  is_claimed: boolean;
  claimed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AchievementRequirement {
  type: 'sessions_count' | 'streak_days' | 'total_minutes' | 'course_completion' | 'mood_tracking' | 'consistency_score' | 'level_reached' | 'technique_variety';
  value: number;
  description: string;
  current_value?: number;
  completed?: boolean;
}

export interface AchievementReward {
  id: string;
  type: 'badge' | 'content_unlock' | 'feature_access' | 'certificate' | 'discount' | 'experience_points' | 'custom_avatar';
  title: string;
  description: string;
  value?: string;
  expires_at?: string;
  is_claimed: boolean;
  claimed_at?: string;
}

export interface AchievementTemplate {
  id: string;
  title: string;
  description: string;
  achievement_type: Achievement['achievement_type'];
  icon: string;
  badge_color: string;
  requirements: Omit<AchievementRequirement, 'current_value' | 'completed'>[];
  rewards: Omit<AchievementReward, 'id' | 'is_claimed' | 'claimed_at'>[];
  rarity: Achievement['rarity'];
  category: string;
  points: number;
  is_active: boolean;
  prerequisites?: string[]; // Other achievement IDs that must be completed first
  hidden_until_unlocked?: boolean;
}

export interface AchievementProgress {
  achievement_id: string;
  title: string;
  description: string;
  category: string;
  rarity: Achievement['rarity'];
  overall_progress: number;
  requirements: AchievementRequirement[];
  estimated_completion: string;
  next_milestone?: {
    description: string;
    target: number;
    current: number;
    progress: number;
  };
}

export interface AchievementStats {
  total_earned: number;
  total_points: number;
  unclaimed_rewards: number;
  completion_rate: number;
  rarity_breakdown: { [rarity: string]: number };
  category_breakdown: { [category: string]: number };
  recent_achievements: Achievement[];
  next_achievements: AchievementProgress[];
  milestones_reached: number;
  level_achievements: number;
}

export interface PersonalizedGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'custom';
  target_type: 'sessions' | 'minutes' | 'streak' | 'consistency' | 'mood_improvement';
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_completed: boolean;
  completed_at?: string;
  reward: AchievementReward;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  auto_generated: boolean;
  created_at: string;
  updated_at: string;
}

export class AchievementApiService {
  private static instance: AchievementApiService;
  
  // Achievement templates - in production, these would be stored in database
  private readonly achievementTemplates: AchievementTemplate[] = [
    // Beginner Achievements
    {
      id: 'first_meditation',
      title: 'Langkah Pertama',
      description: 'Menyelesaikan sesi meditasi pertama',
      achievement_type: 'milestone',
      icon: '🌱',
      badge_color: '#10B981',
      requirements: [
        { type: 'sessions_count', value: 1, description: 'Selesaikan 1 sesi meditasi' }
      ],
      rewards: [
        {
          type: 'experience_points',
          title: '50 XP Bonus',
          description: 'Bonus experience points untuk memulai',
          value: '50'
        },
        {
          type: 'content_unlock',
          title: 'Panduan Pemula',
          description: 'Akses ke panduan meditasi untuk pemula',
          value: 'beginner_guide'
        }
      ],
      rarity: 'common',
      category: 'milestone',
      points: 50,
      is_active: true
    },
    {
      id: 'week_streak',
      title: 'Konsistensi Seminggu',
      description: 'Bermeditasi selama 7 hari berturut-turut',
      achievement_type: 'streak',
      icon: '🔥',
      badge_color: '#F59E0B',
      requirements: [
        { type: 'streak_days', value: 7, description: 'Streak 7 hari berturut-turut' }
      ],
      rewards: [
        {
          type: 'badge',
          title: 'Badge Konsistensi',
          description: 'Badge khusus untuk pencapaian streak pertama'
        },
        {
          type: 'feature_access',
          title: 'Custom Timer',
          description: 'Akses ke pengatur waktu meditasi kustom',
          value: 'custom_timer'
        }
      ],
      rarity: 'uncommon',
      category: 'consistency',
      points: 100,
      is_active: true
    },
    {
      id: 'month_streak',
      title: 'Master Konsistensi',
      description: 'Bermeditasi selama 30 hari berturut-turut',
      achievement_type: 'streak',
      icon: '👑',
      badge_color: '#8B5CF6',
      requirements: [
        { type: 'streak_days', value: 30, description: 'Streak 30 hari berturut-turut' }
      ],
      rewards: [
        {
          type: 'certificate',
          title: 'Sertifikat Master Konsistensi',
          description: 'Sertifikat resmi untuk pencapaian luar biasa'
        },
        {
          type: 'discount',
          title: 'Diskon Premium 25%',
          description: 'Potongan harga untuk upgrade premium',
          value: '25_percent_off',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      rarity: 'epic',
      category: 'consistency',
      points: 500,
      is_active: true,
      prerequisites: ['week_streak']
    },
    {
      id: 'hundred_sessions',
      title: 'Centurion',
      description: 'Menyelesaikan 100 sesi meditasi',
      achievement_type: 'milestone',
      icon: '💯',
      badge_color: '#EF4444',
      requirements: [
        { type: 'sessions_count', value: 100, description: '100 sesi meditasi selesai' }
      ],
      rewards: [
        {
          type: 'custom_avatar',
          title: 'Avatar Centurion',
          description: 'Avatar eksklusif untuk pencapaian 100 sesi',
          value: 'centurion_avatar'
        },
        {
          type: 'content_unlock',
          title: 'Master Class Collection',
          description: 'Akses ke koleksi kelas master',
          value: 'master_classes'
        }
      ],
      rarity: 'rare',
      category: 'milestone',
      points: 300,
      is_active: true
    },
    {
      id: 'technique_explorer',
      title: 'Penjelajah Teknik',
      description: 'Mencoba 5 teknik meditasi berbeda',
      achievement_type: 'exploration',
      icon: '🧭',
      badge_color: '#06B6D4',
      requirements: [
        { type: 'technique_variety', value: 5, description: 'Coba 5 teknik berbeda' }
      ],
      rewards: [
        {
          type: 'content_unlock',
          title: 'Teknik Rahasia',
          description: 'Akses ke teknik meditasi advanced',
          value: 'secret_techniques'
        }
      ],
      rarity: 'uncommon',
      category: 'exploration',
      points: 150,
      is_active: true
    },
    {
      id: 'perfect_week',
      title: 'Minggu Sempurna',
      description: 'Konsistensi 100% dalam seminggu dengan minimal 5 sesi',
      achievement_type: 'consistency',
      icon: '⭐',
      badge_color: '#10B981',
      requirements: [
        { type: 'sessions_count', value: 5, description: 'Minimal 5 sesi dalam seminggu' },
        { type: 'consistency_score', value: 100, description: 'Konsistensi 100%' }
      ],
      rewards: [
        {
          type: 'experience_points',
          title: '200 XP Bonus',
          description: 'Bonus besar untuk pencapaian sempurna',
          value: '200'
        }
      ],
      rarity: 'rare',
      category: 'consistency',
      points: 250,
      is_active: true
    },
    {
      id: 'ten_hours',
      title: 'Dedikasi 10 Jam',
      description: 'Menghabiskan total 10 jam untuk meditasi',
      achievement_type: 'milestone',
      icon: '⏰',
      badge_color: '#F97316',
      requirements: [
        { type: 'total_minutes', value: 600, description: '600 menit (10 jam) total meditasi' }
      ],
      rewards: [
        {
          type: 'feature_access',
          title: 'Advanced Analytics',
          description: 'Akses ke analisis mendalam progress Anda',
          value: 'advanced_analytics'
        }
      ],
      rarity: 'uncommon',
      category: 'milestone',
      points: 200,
      is_active: true
    },
    {
      id: 'mindfulness_sage',
      title: 'Sage Mindfulness',
      description: 'Mencapai level 10 dan menguasai semua teknik dasar',
      achievement_type: 'mastery',
      icon: '🧘‍♂️',
      badge_color: '#DC2626',
      requirements: [
        { type: 'level_reached', value: 10, description: 'Capai level 10' },
        { type: 'technique_variety', value: 8, description: 'Kuasai 8 teknik berbeda' },
        { type: 'total_minutes', value: 1200, description: '20 jam total meditasi' }
      ],
      rewards: [
        {
          type: 'certificate',
          title: 'Master of Mindfulness',
          description: 'Sertifikat master tertinggi'
        },
        {
          type: 'feature_access',
          title: 'Mentor Program',
          description: 'Akses untuk menjadi mentor bagi pemula',
          value: 'mentor_program'
        }
      ],
      rarity: 'legendary',
      category: 'mastery',
      points: 1000,
      is_active: true,
      prerequisites: ['hundred_sessions', 'month_streak'],
      hidden_until_unlocked: true
    }
  ];

  static getInstance(): AchievementApiService {
    if (!AchievementApiService.instance) {
      AchievementApiService.instance = new AchievementApiService();
    }
    return AchievementApiService.instance;
  }

  // Achievement Management
  async getUserAchievements(userId: string): Promise<{ achievements: Achievement[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;

      return { achievements: data || [], error: null };
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return { achievements: [], error };
    }
  }

  async checkAndUnlockAchievements(userId: string): Promise<{ newAchievements: Achievement[]; error: Error | null }> {
    try {
      // Get user's current achievements
      const { achievements: existingAchievements } = await this.getUserAchievements(userId);
      const existingIds = new Set(existingAchievements.map(a => a.id));

      // Get user data for requirement checking
      const [progressResult, sessionsResult, streaksResult] = await Promise.all([
        progressApiService.getUserProgress(userId),
        meditationApiService.getUserSessions(userId, 1000),
        progressApiService.getUserStreaks(userId)
      ]);

      if (progressResult.error || !progressResult.progress) {
        throw new Error('Could not fetch user progress');
      }

      const userProgress = progressResult.progress;
      const sessions = sessionsResult.sessions || [];
      const streaks = streaksResult.streaks || [];

      const newAchievements: Achievement[] = [];

      // Check each achievement template
      for (const template of this.achievementTemplates) {
        if (!template.is_active || existingIds.has(template.id)) continue;

        // Check prerequisites
        if (template.prerequisites && !template.prerequisites.every(id => existingIds.has(id))) {
          continue;
        }

        // Check requirements
        const requirementResults = await this.checkRequirements(
          template.requirements,
          { userProgress, sessions, streaks }
        );

        if (requirementResults.every(r => r.completed)) {
          const newAchievement = await this.unlockAchievement(userId, template);
          if (newAchievement) {
            newAchievements.push(newAchievement);
          }
        }
      }

      return { newAchievements, error: null };
    } catch (error) {
      console.error('Error checking achievements:', error);
      return { newAchievements: [], error };
    }
  }

  private async checkRequirements(
    requirements: Omit<AchievementRequirement, 'current_value' | 'completed'>[],
    data: {
      userProgress: { total_sessions: number; total_minutes: number; level: number };
      sessions: { type: string; completed_at: string; duration_minutes: number }[];
      streaks: { type: string; current_streak: number }[];
    }
  ): Promise<AchievementRequirement[]> {
    const results: AchievementRequirement[] = [];

    for (const req of requirements) {
      let currentValue = 0;
      let completed = false;

      switch (req.type) {
        case 'sessions_count': {
          currentValue = data.userProgress.total_sessions;
          completed = currentValue >= req.value;
          break;
        }

        case 'streak_days': {
          const meditationStreak = data.streaks.find((s: { type: string; current_streak: number }) => s.type === 'meditation');
          currentValue = meditationStreak ? meditationStreak.current_streak : 0;
          completed = currentValue >= req.value;
          break;
        }

        case 'total_minutes': {
          currentValue = data.userProgress.total_minutes;
          completed = currentValue >= req.value;
          break;
        }

        case 'level_reached': {
          currentValue = data.userProgress.level;
          completed = currentValue >= req.value;
          break;
        }

        case 'technique_variety': {
          const uniqueTypes = new Set(data.sessions.map((s: { type: string }) => s.type));
          currentValue = uniqueTypes.size;
          completed = currentValue >= req.value;
          break;
        }

        case 'consistency_score': {
          // Calculate weekly consistency
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const weekSessions = data.sessions.filter((s: { completed_at: string }) => 
            new Date(s.completed_at) >= weekAgo
          );
          const uniqueDays = new Set(weekSessions.map((s: { completed_at: string }) => 
            new Date(s.completed_at).toDateString()
          ));
          currentValue = (uniqueDays.size / 7) * 100;
          completed = currentValue >= req.value;
          break;
        }

        default:
          completed = false;
      }

      results.push({
        ...req,
        current_value: currentValue,
        completed
      });
    }

    return results;
  }

  private async unlockAchievement(userId: string, template: AchievementTemplate): Promise<Achievement | null> {
    try {
      const achievement: Omit<Achievement, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        achievement_type: template.achievement_type,
        title: template.title,
        description: template.description,
        icon: template.icon,
        badge_color: template.badge_color,
        unlocked_at: new Date().toISOString(),
        requirements: template.requirements.map(req => ({
          ...req,
          current_value: req.value,
          completed: true
        })),
        rewards: template.rewards.map(reward => ({
          ...reward,
          id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          is_claimed: false
        })),
        rarity: template.rarity,
        category: template.category,
        points: template.points,
        is_claimed: false
      };

      const { data, error } = await supabase
        .from('achievements')
        .insert([achievement])
        .select()
        .single();

      if (error) throw error;

      // Award experience points
      await progressApiService.addExperience(userId, template.points, `Achievement: ${template.title}`);

      return data;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return null;
    }
  }

  async claimReward(userId: string, achievementId: string, rewardId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Get achievement
      const { data: achievement, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !achievement) {
        throw new Error('Achievement not found');
      }

      // Find reward
      const reward = achievement.rewards.find((r: AchievementReward) => r.id === rewardId);
      if (!reward || reward.is_claimed) {
        throw new Error('Reward not available or already claimed');
      }

      // Check if reward is still valid
      if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
        throw new Error('Reward has expired');
      }

      // Update reward as claimed
      const updatedRewards = achievement.rewards.map((r: AchievementReward) => 
        r.id === rewardId ? { ...r, is_claimed: true, claimed_at: new Date().toISOString() } : r
      );

      const { error: updateError } = await supabase
        .from('achievements')
        .update({ 
          rewards: updatedRewards,
          updated_at: new Date().toISOString()
        })
        .eq('id', achievementId);

      if (updateError) throw updateError;

      // Apply reward effects
      await this.applyRewardEffects(userId, reward);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error claiming reward:', error);
      return { success: false, error };
    }
  }

  private async applyRewardEffects(userId: string, reward: AchievementReward): Promise<void> {
    try {
      switch (reward.type) {
        case 'experience_points': {
          if (reward.value) {
            const points = parseInt(reward.value);
            await progressApiService.addExperience(userId, points, `Reward: ${reward.title}`);
          }
          break;
        }

        case 'content_unlock': {
          // Update user preferences to unlock content
          // This would integrate with content management system
          console.log(`Unlocked content: ${reward.value} for user ${userId}`);
          break;
        }

        case 'feature_access': {
          // Enable feature access in user preferences
          // This would integrate with feature flag system
          console.log(`Enabled feature: ${reward.value} for user ${userId}`);
          break;
        }

        case 'discount': {
          // Create discount record
          await supabase.from('user_discounts').insert([{
            user_id: userId,
            discount_code: reward.value,
            title: reward.title,
            description: reward.description,
            expires_at: reward.expires_at,
            is_used: false,
            created_at: new Date().toISOString()
          }]);
          break;
        }

        case 'certificate': {
          // Generate certificate
          await supabase.from('user_certificates').insert([{
            user_id: userId,
            certificate_type: reward.value || 'achievement',
            title: reward.title,
            description: reward.description,
            issued_at: new Date().toISOString()
          }]);
          break;
        }

        case 'custom_avatar': {
          // Unlock avatar option
          await supabase.from('user_avatars').insert([{
            user_id: userId,
            avatar_id: reward.value,
            unlocked_at: new Date().toISOString()
          }]);
          break;
        }
      }
    } catch (error) {
      console.error('Error applying reward effects:', error);
    }
  }

  // Achievement Progress & Stats
  async getAchievementProgress(userId: string): Promise<{ progress: AchievementProgress[]; error: Error | null }> {
    try {
      const { achievements: existingAchievements } = await this.getUserAchievements(userId);
      const existingIds = new Set(existingAchievements.map(a => a.id));

      // Get user data
      const [progressResult, sessionsResult, streaksResult] = await Promise.all([
        progressApiService.getUserProgress(userId),
        meditationApiService.getUserSessions(userId, 1000),
        progressApiService.getUserStreaks(userId)
      ]);

      if (progressResult.error || !progressResult.progress) {
        throw new Error('Could not fetch user progress');
      }

      const userProgress = progressResult.progress;
      const sessions = sessionsResult.sessions || [];
      const streaks = streaksResult.streaks || [];

      const progressList: AchievementProgress[] = [];

      for (const template of this.achievementTemplates) {
        if (!template.is_active || existingIds.has(template.id)) continue;
        if (template.hidden_until_unlocked && template.prerequisites && 
            !template.prerequisites.every(id => existingIds.has(id))) continue;

        const requirementResults = await this.checkRequirements(
          template.requirements,
          { userProgress, sessions, streaks }
        );

        const overallProgress = requirementResults.length > 0
          ? (requirementResults.reduce((sum, req) => 
              sum + Math.min(100, ((req.current_value || 0) / req.value) * 100), 0
            ) / requirementResults.length)
          : 0;

        // Find next milestone
        const incompleteReq = requirementResults.find(r => !r.completed);
        const nextMilestone = incompleteReq ? {
          description: incompleteReq.description,
          target: incompleteReq.value,
          current: incompleteReq.current_value || 0,
          progress: Math.min(100, ((incompleteReq.current_value || 0) / incompleteReq.value) * 100)
        } : undefined;

        progressList.push({
          achievement_id: template.id,
          title: template.title,
          description: template.description,
          category: template.category,
          rarity: template.rarity,
          overall_progress: Math.round(overallProgress),
          requirements: requirementResults,
          estimated_completion: this.estimateCompletion(requirementResults, sessions),
          next_milestone: nextMilestone
        });
      }

      // Sort by progress (closest to completion first)
      progressList.sort((a, b) => b.overall_progress - a.overall_progress);

      return { progress: progressList, error: null };
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return { progress: [], error };
    }
  }

  async getAchievementStats(userId: string): Promise<{ stats: AchievementStats | null; error: Error | null }> {
    try {
      const { achievements } = await this.getUserAchievements(userId);
      const { progress } = await this.getAchievementProgress(userId);

      const total_earned = achievements.length;
      const total_points = achievements.reduce((sum, a) => sum + a.points, 0);
      const unclaimed_rewards = achievements.reduce(
        (sum, a) => sum + a.rewards.filter((r: AchievementReward) => !r.is_claimed).length, 0
      );

      const totalPossible = this.achievementTemplates.filter(t => t.is_active).length;
      const completion_rate = totalPossible > 0 ? (total_earned / totalPossible) * 100 : 0;

      // Rarity breakdown
      const rarity_breakdown: { [rarity: string]: number } = {};
      achievements.forEach(a => {
        rarity_breakdown[a.rarity] = (rarity_breakdown[a.rarity] || 0) + 1;
      });

      // Category breakdown
      const category_breakdown: { [category: string]: number } = {};
      achievements.forEach(a => {
        category_breakdown[a.category] = (category_breakdown[a.category] || 0) + 1;
      });

      // Recent achievements (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recent_achievements = achievements
        .filter(a => new Date(a.unlocked_at) >= weekAgo)
        .slice(0, 5);

      // Next achievements (highest progress)
      const next_achievements = progress
        .filter(p => p.overall_progress > 0 && p.overall_progress < 100)
        .slice(0, 5);

      const milestones_reached = achievements.filter(a => a.achievement_type === 'milestone').length;
      const level_achievements = achievements.filter(a => 
        a.requirements.some(r => r.type === 'level_reached')
      ).length;

      const stats: AchievementStats = {
        total_earned,
        total_points,
        unclaimed_rewards,
        completion_rate: Math.round(completion_rate),
        rarity_breakdown,
        category_breakdown,
        recent_achievements,
        next_achievements,
        milestones_reached,
        level_achievements
      };

      return { stats, error: null };
    } catch (error) {
      console.error('Error getting achievement stats:', error);
      return { stats: null, error };
    }
  }

  private estimateCompletion(requirements: AchievementRequirement[], sessions: { completed_at: string; duration_minutes: number }[]): string {
    // Simple estimation based on current progress rate
    const incompleteReqs = requirements.filter(r => !r.completed);
    if (incompleteReqs.length === 0) return 'Selesai';

    // For simplicity, estimate based on session frequency
    const recentSessions = sessions.filter(s => {
      const sessionDate = new Date(s.completed_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });

    const sessionsPerWeek = recentSessions.length;
    if (sessionsPerWeek === 0) return 'Tidak dapat diprediksi';

    // Rough estimation - this could be more sophisticated
    const avgProgressNeeded = incompleteReqs.reduce((sum, req) => {
      const remaining = req.value - (req.current_value || 0);
      return sum + remaining;
    }, 0) / incompleteReqs.length;

    const weeksToComplete = Math.ceil(avgProgressNeeded / Math.max(1, sessionsPerWeek));
    
    if (weeksToComplete <= 1) return 'Minggu ini';
    if (weeksToComplete <= 4) return `${weeksToComplete} minggu`;
    if (weeksToComplete <= 12) return `${Math.ceil(weeksToComplete / 4)} bulan`;
    return 'Lebih dari 3 bulan';
  }

  // Personalized Goals
  async getPersonalizedGoals(userId: string): Promise<{ goals: PersonalizedGoal[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('personalized_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { goals: data || [], error: null };
    } catch (error) {
      console.error('Error fetching personalized goals:', error);
      return { goals: [], error };
    }
  }

  async generatePersonalizedGoals(userId: string): Promise<{ goals: PersonalizedGoal[]; error: Error | null }> {
    try {
      // Get user data to analyze patterns
      const [progressResult, sessionsResult, achievementsResult] = await Promise.all([
        progressApiService.getUserProgress(userId),
        meditationApiService.getUserSessions(userId, 100),
        this.getUserAchievements(userId)
      ]);

      if (progressResult.error || !progressResult.progress) {
        throw new Error('Could not fetch user progress');
      }

      const userProgress = progressResult.progress;
      const sessions = sessionsResult.sessions || [];
      const achievements = achievementsResult.achievements || [];

      const suggestedGoals: Omit<PersonalizedGoal, 'id' | 'created_at' | 'updated_at'>[] = [];

      // Generate goals based on user's current state
      if (userProgress.current_streak < 7) {
        suggestedGoals.push({
          user_id: userId,
          title: 'Bangun Kebiasaan Konsisten',
          description: 'Bermeditasi setiap hari selama 7 hari berturut-turut',
          category: 'weekly',
          target_type: 'streak',
          target_value: 7,
          current_value: userProgress.current_streak,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          is_completed: false,
          reward: {
            id: '',
            type: 'experience_points',
            title: '150 XP Bonus',
            description: 'Bonus untuk membangun kebiasaan konsisten',
            value: '150',
            is_claimed: false
          },
          difficulty: 'medium',
          auto_generated: true
        });
      }

      if (sessions.length < 20) {
        suggestedGoals.push({
          user_id: userId,
          title: 'Explorer Pemula',
          description: 'Selesaikan 20 sesi meditasi dalam bulan ini',
          category: 'monthly',
          target_type: 'sessions',
          target_value: 20,
          current_value: sessions.length,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          is_completed: false,
          reward: {
            id: '',
            type: 'content_unlock',
            title: 'Teknik Lanjutan',
            description: 'Akses ke koleksi teknik meditasi lanjutan',
            value: 'advanced_techniques',
            is_claimed: false
          },
          difficulty: 'easy',
          auto_generated: true
        });
      }

      // Save generated goals
      const savedGoals: PersonalizedGoal[] = [];
      for (const goalData of suggestedGoals) {
        const { data, error } = await supabase
          .from('personalized_goals')
          .insert([goalData])
          .select()
          .single();

        if (!error && data) {
          savedGoals.push(data);
        }
      }

      return { goals: savedGoals, error: null };
    } catch (error) {
      console.error('Error generating personalized goals:', error);
      return { goals: [], error };
    }
  }

  async updateGoalProgress(goalId: string, newValue: number): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { data: goal, error: fetchError } = await supabase
        .from('personalized_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (fetchError || !goal) {
        throw new Error('Goal not found');
      }

      const updates: any = {
        current_value: newValue,
        updated_at: new Date().toISOString()
      };

      // Check if goal is completed
      if (newValue >= goal.target_value && !goal.is_completed) {
        updates.is_completed = true;
        updates.completed_at = new Date().toISOString();
        
        // Award the goal reward
        if (goal.reward.type === 'experience_points' && goal.reward.value) {
          await progressApiService.addExperience(
            goal.user_id, 
            parseInt(goal.reward.value), 
            `Goal: ${goal.title}`
          );
        }
      }

      const { error: updateError } = await supabase
        .from('personalized_goals')
        .update(updates)
        .eq('id', goalId);

      if (updateError) throw updateError;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return { success: false, error };
    }
  }

  // Utility methods
  getAchievementTemplates(): AchievementTemplate[] {
    return this.achievementTemplates.filter(t => t.is_active);
  }

  // Real-time subscriptions
  subscribeToAchievements(userId: string, callback: (achievement: Achievement) => void): () => void {
    const subscription = supabase
      .channel('user_achievements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Achievement);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
}

export const achievementApiService = AchievementApiService.getInstance();