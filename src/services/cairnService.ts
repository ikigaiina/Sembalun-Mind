import { typedSupabase as supabase } from '../config/supabase';
import type { CairnProgress, CairnMilestone, CairnReward } from '../types/progress';

export interface CairnTemplate {
  id: string;
  title: string;
  description: string;
  cairnType: 'daily' | 'weekly' | 'monthly' | 'milestone' | 'achievement';
  targetValue: number;
  unit: 'sessions' | 'minutes' | 'days' | 'courses' | 'streaks';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'consistency' | 'duration' | 'variety' | 'mindfulness' | 'progress';
  duration?: number; // in days
  prerequisites?: string[];
  milestones: Omit<CairnMilestone, 'id' | 'completedAt' | 'isCompleted'>[];
  rewards: Omit<CairnReward, 'id' | 'earnedAt'>[];
}

export class CairnService {
  private static instance: CairnService;

  static getInstance(): CairnService {
    if (!CairnService.instance) {
      CairnService.instance = new CairnService();
    }
    return CairnService.instance;
  }

  private readonly cairnTemplates: CairnTemplate[] = [
    // Daily Cairns
    {
      id: 'daily_meditation_streak',
      title: 'Ketenangan Harian',
      description: 'Bermeditasi setiap hari selama seminggu berturut-turut',
      cairnType: 'daily',
      targetValue: 7,
      unit: 'days',
      difficulty: 'easy',
      category: 'consistency',
      duration: 7,
      milestones: [
        { title: '3 Hari', description: 'Meditasi 3 hari berturut-turut', threshold: 3 },
        { title: '5 Hari', description: 'Meditasi 5 hari berturut-turut', threshold: 5 },
        { title: '7 Hari', description: 'Satu minggu penuh meditasi', threshold: 7 }
      ],
      rewards: [
        { type: 'badge', title: 'Konsisten Pemula', description: 'Badge untuk konsistensi 7 hari' }
      ]
    },
    {
      id: 'daily_10min_sessions',
      title: 'Sepuluh Menit Setiap Hari',
      description: 'Bermeditasi minimal 10 menit setiap hari selama seminggu',
      cairnType: 'daily',
      targetValue: 70,
      unit: 'minutes',
      difficulty: 'medium',
      category: 'duration',
      duration: 7,
      milestones: [
        { title: '30 Menit', description: '30 menit total meditasi', threshold: 30 },
        { title: '50 Menit', description: '50 menit total meditasi', threshold: 50 },
        { title: '70 Menit', description: '70 menit total meditasi', threshold: 70 }
      ],
      rewards: [
        { type: 'badge', title: 'Durasi Konsisten', description: 'Badge untuk konsistensi durasi' }
      ]
    },

    // Weekly Cairns
    {
      id: 'weekly_variety_explorer',
      title: 'Penjelajah Teknik',
      description: 'Coba 5 teknik meditasi berbeda dalam seminggu',
      cairnType: 'weekly',
      targetValue: 5,
      unit: 'sessions',
      difficulty: 'medium',
      category: 'variety',
      duration: 7,
      milestones: [
        { title: '2 Teknik', description: 'Mencoba 2 teknik berbeda', threshold: 2 },
        { title: '4 Teknik', description: 'Mencoba 4 teknik berbeda', threshold: 4 },
        { title: '5 Teknik', description: 'Menguasai 5 teknik berbeda', threshold: 5 }
      ],
      rewards: [
        { type: 'content_unlock', title: 'Teknik Lanjutan', description: 'Akses ke teknik meditasi lanjutan', value: 'advanced_techniques' }
      ]
    },
    {
      id: 'weekly_mindful_moments',
      title: 'Momen Penuh Kesadaran',
      description: 'Catat 15 sesi meditasi dalam seminggu',
      cairnType: 'weekly',
      targetValue: 15,
      unit: 'sessions',
      difficulty: 'hard',
      category: 'consistency',
      duration: 7,
      milestones: [
        { title: '5 Sesi', description: '5 sesi meditasi', threshold: 5 },
        { title: '10 Sesi', description: '10 sesi meditasi', threshold: 10 },
        { title: '15 Sesi', description: '15 sesi meditasi', threshold: 15 }
      ],
      rewards: [
        { type: 'badge', title: 'Praktisi Aktif', description: 'Badge untuk aktivitas tinggi' }
      ]
    },

    // Monthly Cairns
    {
      id: 'monthly_meditation_master',
      title: 'Master Meditasi Bulanan',
      description: 'Bermeditasi setiap hari selama sebulan penuh',
      cairnType: 'monthly',
      targetValue: 30,
      unit: 'days',
      difficulty: 'hard',
      category: 'consistency',
      duration: 30,
      milestones: [
        { title: '1 Minggu', description: '7 hari berturut-turut', threshold: 7 },
        { title: '2 Minggu', description: '14 hari berturut-turut', threshold: 14 },
        { title: '3 Minggu', description: '21 hari berturut-turut', threshold: 21 },
        { title: '1 Bulan', description: '30 hari penuh meditasi', threshold: 30 }
      ],
      rewards: [
        { type: 'certificate', title: 'Sertifikat Master Konsistensi', description: 'Sertifikat untuk konsistensi 30 hari' },
        { type: 'content_unlock', title: 'Kelas Master', description: 'Akses ke kelas meditasi master', value: 'master_classes' }
      ]
    },
    {
      id: 'monthly_hour_collector',
      title: 'Kolektor Jam Meditasi',
      description: 'Kumpulkan 10 jam meditasi dalam sebulan',
      cairnType: 'monthly',
      targetValue: 600,
      unit: 'minutes',
      difficulty: 'expert',
      category: 'duration',
      duration: 30,
      milestones: [
        { title: '2 Jam', description: '120 menit total meditasi', threshold: 120 },
        { title: '5 Jam', description: '300 menit total meditasi', threshold: 300 },
        { title: '8 Jam', description: '480 menit total meditasi', threshold: 480 },
        { title: '10 Jam', description: '600 menit total meditasi', threshold: 600 }
      ],
      rewards: [
        { type: 'badge', title: 'Dedikasi Luar Biasa', description: 'Badge untuk dedikasi ekstrem' },
        { type: 'feature_unlock', title: 'Analytics Pro', description: 'Akses ke analytics lanjutan', value: 'pro_analytics' }
      ]
    },

    // Milestone Cairns
    {
      id: 'milestone_first_course',
      title: 'Wisudawan Pertama',
      description: 'Selesaikan kursus SIY pertama Anda',
      cairnType: 'milestone',
      targetValue: 1,
      unit: 'courses',
      difficulty: 'medium',
      category: 'progress',
      milestones: [
        { title: 'Kursus Pertama', description: 'Menyelesaikan kursus pertama', threshold: 1 }
      ],
      rewards: [
        { type: 'certificate', title: 'Sertifikat Kursus Pertama', description: 'Sertifikat penyelesaian kursus pertama' },
        { type: 'content_unlock', title: 'Kursus Lanjutan', description: 'Akses ke kursus tingkat lanjut', value: 'intermediate_courses' }
      ]
    },
    {
      id: 'milestone_hundred_sessions',
      title: 'Centurion Meditasi',
      description: 'Capai 100 sesi meditasi',
      cairnType: 'milestone',
      targetValue: 100,
      unit: 'sessions',
      difficulty: 'hard',
      category: 'progress',
      milestones: [
        { title: '10 Sesi', description: '10 sesi meditasi', threshold: 10 },
        { title: '25 Sesi', description: '25 sesi meditasi', threshold: 25 },
        { title: '50 Sesi', description: '50 sesi meditasi', threshold: 50 },
        { title: '75 Sesi', description: '75 sesi meditasi', threshold: 75 },
        { title: '100 Sesi', description: '100 sesi meditasi', threshold: 100 }
      ],
      rewards: [
        { type: 'badge', title: 'Centurion', description: 'Badge untuk 100 sesi meditasi' },
        { type: 'content_unlock', title: 'Konten Eksklusif', description: 'Akses ke konten eksklusif', value: 'exclusive_content' }
      ]
    },

    // Achievement Cairns
    {
      id: 'achievement_mindfulness_ninja',
      title: 'Ninja Kesadaran',
      description: 'Bermeditasi setiap hari selama 100 hari berturut-turut',
      cairnType: 'achievement',
      targetValue: 100,
      unit: 'streaks',
      difficulty: 'expert',
      category: 'consistency',
      milestones: [
        { title: '30 Hari', description: '30 hari berturut-turut', threshold: 30 },
        { title: '60 Hari', description: '60 hari berturut-turut', threshold: 60 },
        { title: '100 Hari', description: '100 hari berturut-turut', threshold: 100 }
      ],
      rewards: [
        { type: 'badge', title: 'Ninja Kesadaran', description: 'Badge legendaris untuk konsistensi luar biasa' },
        { type: 'certificate', title: 'Master of Mindfulness', description: 'Sertifikat master kesadaran' },
        { type: 'feature_unlock', title: 'Mentor Mode', description: 'Akses untuk menjadi mentor', value: 'mentor_features' }
      ]
    }
  ];

  async initializeUserCairns(userId: string): Promise<void> {
    try {
      // Check if user already has cairns
      const { data: existingCairns, error: existingError } = await supabase
        .from('cairn_progress')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (existingError) throw existingError;
      if (existingCairns && existingCairns.length > 0) {
        return; // User already has cairns initialized
      }

      const cairnsToInsert = [];

      // Initialize with easy daily and weekly cairns
      const beginner_cairns = this.cairnTemplates.filter(template => 
        (template.cairnType === 'daily' || template.cairnType === 'weekly') && 
        template.difficulty === 'easy'
      );

      beginner_cairns.forEach(template => {
        const cairn: Omit<CairnProgress, 'id'> = {
          userId,
          cairnType: template.cairnType,
          title: template.title,
          description: template.description,
          targetValue: template.targetValue,
          currentValue: 0,
          unit: template.unit,
          startDate: new Date(),
          endDate: template.duration ? new Date(Date.now() + template.duration * 24 * 60 * 60 * 1000) : undefined,
          isCompleted: false,
          difficulty: template.difficulty,
          category: template.category,
          rewards: template.rewards.map(reward => ({
            ...reward,
            id: `reward_${Date.now()}_${Math.random()}`
          })),
          milestones: template.milestones.map(milestone => ({
            ...milestone,
            id: `milestone_${Date.now()}_${Math.random()}`,
            isCompleted: false
          })),
          syncStatus: 'synced',
          lastModified: new Date(),
          version: 1
        };

        cairnsToInsert.push({
          user_id: cairn.userId,
          cairn_type: cairn.cairnType,
          title: cairn.title,
          description: cairn.description,
          target_value: cairn.targetValue,
          current_value: cairn.currentValue,
          unit: cairn.unit,
          start_date: cairn.startDate.toISOString(),
          end_date: cairn.endDate ? cairn.endDate.toISOString() : null,
          is_completed: cairn.isCompleted,
          difficulty: cairn.difficulty,
          category: cairn.category,
          rewards: cairn.rewards,
          milestones: cairn.milestones,
          sync_status: cairn.syncStatus,
          last_modified: cairn.lastModified.toISOString(),
          version: cairn.version
        });
      });

      if (cairnsToInsert.length > 0) {
        const { error } = await supabase.from('cairn_progress').insert(cairnsToInsert);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error initializing user cairns:', error);
      throw error;
    }
  }

  async getUserCairns(userId: string, includeCompleted: boolean = false): Promise<CairnProgress[]> {
    try {
      let queryBuilder = supabase
        .from('cairn_progress')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (!includeCompleted) {
        queryBuilder = queryBuilder.eq('is_completed', false);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        cairnType: row.cairn_type,
        title: row.title,
        description: row.description,
        targetValue: row.target_value,
        currentValue: row.current_value,
        unit: row.unit,
        startDate: new Date(row.start_date),
        endDate: row.end_date ? new Date(row.end_date) : undefined,
        isCompleted: row.is_completed,
        difficulty: row.difficulty,
        category: row.category,
        rewards: row.rewards,
        milestones: row.milestones,
        syncStatus: row.sync_status,
        lastModified: new Date(row.last_modified),
        version: row.version,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined
      })) as CairnProgress[];
    } catch (error) {
      console.error('Error fetching user cairns:', error);
      return [];
    }
  }

  async updateCairnProgress(
    cairnId: string, 
    increment: number, 
    activityData?: { sessionId?: string; courseId?: string; streakData?: any }
  ): Promise<{ milestoneReached?: CairnMilestone; completed?: boolean; rewards?: CairnReward[] }> {
    try {
      const { data: cairnData, error: fetchError } = await supabase
        .from('cairn_progress')
        .select('*')
        .eq('id', cairnId)
        .single();

      if (fetchError) throw fetchError;
      if (!cairnData) throw new Error('Cairn not found');

      const cairn: CairnProgress = {
        id: cairnData.id,
        userId: cairnData.user_id,
        cairnType: cairnData.cairn_type,
        title: cairnData.title,
        description: cairnData.description,
        targetValue: cairnData.target_value,
        currentValue: cairnData.current_value,
        unit: cairnData.unit,
        startDate: new Date(cairnData.start_date),
        endDate: cairnData.end_date ? new Date(cairnData.end_date) : undefined,
        isCompleted: cairnData.is_completed,
        difficulty: cairnData.difficulty,
        category: cairnData.category,
        rewards: cairnData.rewards,
        milestones: cairnData.milestones,
        syncStatus: cairnData.sync_status,
        lastModified: new Date(cairnData.last_modified),
        version: cairnData.version,
        completedAt: cairnData.completed_at ? new Date(cairnData.completed_at) : undefined
      };

      const oldValue = cairn.currentValue;
      const newValue = Math.min(cairn.targetValue, oldValue + increment);
      
      let milestoneReached: CairnMilestone | undefined;
      let completed = false;
      const rewards: CairnReward[] = [];

      // Check for milestone completion
      for (const milestone of cairn.milestones) {
        if (!milestone.isCompleted && newValue >= milestone.threshold && oldValue < milestone.threshold) {
          milestone.isCompleted = true;
          milestone.completedAt = new Date();
          milestoneReached = milestone;
          
          if (milestone.reward) {
            milestone.reward.earnedAt = new Date();
            rewards.push(milestone.reward);
          }
          break;
        }
      }

      // Check for cairn completion
      if (newValue >= cairn.targetValue && !cairn.isCompleted) {
        cairn.isCompleted = true;
        cairn.completedAt = new Date();
        completed = true;

        // Add cairn completion rewards
        cairn.rewards.forEach(reward => {
          reward.earnedAt = new Date();
          rewards.push(reward);
        });

        // Auto-suggest next cairns
        await this.suggestNextCairns(cairn.userId, cairn);
      }

      // Update cairn
      const updateData = {
        current_value: newValue,
        is_completed: cairn.isCompleted,
        completed_at: cairn.completedAt ? cairn.completedAt.toISOString() : null,
        milestones: cairn.milestones.map(m => ({
          ...m,
          completedAt: m.completedAt ? m.completedAt.toISOString() : null
        })),
        rewards: cairn.rewards.map(r => ({
          ...r,
          earnedAt: r.earnedAt ? r.earnedAt.toISOString() : null
        })),
        last_modified: new Date().toISOString(),
        version: cairn.version + 1
      };

      const { error: updateError } = await supabase
        .from('cairn_progress')
        .update(updateData)
        .eq('id', cairnId);

      if (updateError) throw updateError;

      return { milestoneReached, completed, rewards };
    } catch (error) {
      console.error('Error updating cairn progress:', error);
      throw error;
    }
  }

  private async suggestNextCairns(userId: string, completedCairn: CairnProgress): Promise<void> {
    try {
      // Get user's current cairns to avoid duplicates
      const currentCairns = await this.getUserCairns(userId, false);
      const currentCairnTypes = new Set(currentCairns.map(c => c.title));

      // Determine next difficulty level
      let nextDifficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'easy';
      switch (completedCairn.difficulty) {
        case 'easy':
          nextDifficulty = 'medium';
          break;
        case 'medium':
          nextDifficulty = 'hard';
          break;
        case 'hard':
          nextDifficulty = 'expert';
          break;
        case 'expert':
          nextDifficulty = 'expert'; // Stay at expert level
          break;
      }

      // Find suitable next cairns
      const nextCairns = this.cairnTemplates.filter(template => 
        template.difficulty === nextDifficulty &&
        template.category === completedCairn.category &&
        !currentCairnTypes.has(template.title)
      );

      // Add 1-2 suggested cairns
      const cairnsToInsert = [];

      cairnsToAdd.forEach(template => {
        const cairn: Omit<CairnProgress, 'id'> = {
          userId,
          cairnType: template.cairnType,
          title: template.title,
          description: template.description,
          targetValue: template.targetValue,
          currentValue: 0,
          unit: template.unit,
          startDate: new Date(),
          endDate: template.duration ? new Date(Date.now() + template.duration * 24 * 60 * 60 * 1000) : undefined,
          isCompleted: false,
          difficulty: template.difficulty,
          category: template.category,
          rewards: template.rewards.map(reward => ({
            ...reward,
            id: `reward_${Date.now()}_${Math.random()}`
          })),
          milestones: template.milestones.map(milestone => ({
            ...milestone,
            id: `milestone_${Date.now()}_${Math.random()}`,
            isCompleted: false
          })),
          syncStatus: 'synced',
          lastModified: new Date(),
          version: 1
        };

        cairnsToInsert.push({
          user_id: cairn.userId,
          cairn_type: cairn.cairnType,
          title: cairn.title,
          description: cairn.description,
          target_value: cairn.targetValue,
          current_value: cairn.currentValue,
          unit: cairn.unit,
          start_date: cairn.startDate.toISOString(),
          end_date: cairn.endDate ? cairn.endDate.toISOString() : null,
          is_completed: cairn.isCompleted,
          difficulty: cairn.difficulty,
          category: cairn.category,
          rewards: cairn.rewards,
          milestones: cairn.milestones,
          sync_status: cairn.syncStatus,
          last_modified: cairn.lastModified.toISOString(),
          version: cairn.version
        });
      });

      if (cairnsToInsert.length > 0) {
        const { error } = await supabase.from('cairn_progress').insert(cairnsToInsert);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error suggesting next cairns:', error);
    }
  }

  async getCairnTemplates(difficulty?: 'easy' | 'medium' | 'hard' | 'expert', category?: string): Promise<CairnTemplate[]> {
    let filtered = this.cairnTemplates;

    if (difficulty) {
      filtered = filtered.filter(template => template.difficulty === difficulty);
    }

    if (category) {
      filtered = filtered.filter(template => template.category === category);
    }

    return filtered;
  }

  async createCustomCairn(userId: string, cairnData: Partial<CairnProgress>): Promise<string> {
    try {
      const cairn: Omit<CairnProgress, 'id'> = {
        userId,
        cairnType: cairnData.cairnType || 'milestone',
        title: cairnData.title || 'Custom Cairn',
        description: cairnData.description || 'Custom meditation goal',
        targetValue: cairnData.targetValue || 1,
        currentValue: 0,
        unit: cairnData.unit || 'sessions',
        startDate: new Date(),
        endDate: cairnData.endDate,
        isCompleted: false,
        difficulty: cairnData.difficulty || 'medium',
        category: cairnData.category || 'progress',
        rewards: cairnData.rewards || [],
        milestones: cairnData.milestones || [],
        syncStatus: 'synced',
        lastModified: new Date(),
        version: 1
      };

      const { data, error } = await supabase
        .from('cairn_progress')
        .insert({
          user_id: cairn.userId,
          cairn_type: cairn.cairnType,
          title: cairn.title,
          description: cairn.description,
          target_value: cairn.targetValue,
          current_value: cairn.currentValue,
          unit: cairn.unit,
          start_date: cairn.startDate.toISOString(),
          end_date: cairn.endDate ? cairn.endDate.toISOString() : null,
          is_completed: cairn.isCompleted,
          difficulty: cairn.difficulty,
          category: cairn.category,
          rewards: cairn.rewards,
          milestones: cairn.milestones,
          sync_status: cairn.syncStatus,
          last_modified: cairn.lastModified.toISOString(),
          version: cairn.version
        })
        .select('id')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create custom cairn');
      return data.id;
    } catch (error) {
      console.error('Error creating custom cairn:', error);
      throw error;
    }
  }

  async getUserCairnStats(userId: string): Promise<{
    totalCairns: number;
    completedCairns: number;
    activeCairns: number;
    totalRewards: number;
    completionRate: number;
    currentLevel: string;
  }> {
    try {
      const { data: allCairnsData, error } = await supabase
        .from('cairn_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const allCairns = allCairnsData.map(row => ({
        id: row.id,
        userId: row.user_id,
        cairnType: row.cairn_type,
        title: row.title,
        description: row.description,
        targetValue: row.target_value,
        currentValue: row.current_value,
        unit: row.unit,
        startDate: new Date(row.start_date),
        endDate: row.end_date ? new Date(row.end_date) : undefined,
        isCompleted: row.is_completed,
        difficulty: row.difficulty,
        category: row.category,
        rewards: row.rewards,
        milestones: row.milestones,
        syncStatus: row.sync_status,
        lastModified: new Date(row.last_modified),
        version: row.version,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined
      })) as CairnProgress[];

      const completedCairns = allCairns.filter(c => c.isCompleted);
      const activeCairns = allCairns.filter(c => !c.isCompleted);
      
      const totalRewards = allCairns.reduce((sum, cairn) => 
        sum + cairn.rewards.filter(r => r.earnedAt).length, 0);

      const completionRate = allCairns.length > 0 
        ? Math.round((completedCairns.length / allCairns.length) * 100)
        : 0;

      // Determine user level based on completed cairns
      let currentLevel = 'Pemula';
      if (completedCairns.length >= 20) currentLevel = 'Master';
      else if (completedCairns.length >= 10) currentLevel = 'Ahli';
      else if (completedCairns.length >= 5) currentLevel = 'Menengah';

      return {
        totalCairns: allCairns.length,
        completedCairns: completedCairns.length,
        activeCairns: activeCairns.length,
        totalRewards,
        completionRate,
        currentLevel
      };
    } catch (error) {
      console.error('Error getting cairn stats:', error);
      return {
        totalCairns: 0,
        completedCairns: 0,
        activeCairns: 0,
        totalRewards: 0,
        completionRate: 0,
        currentLevel: 'Pemula'
      };
    }
  }
}

export const cairnService = CairnService.getInstance();