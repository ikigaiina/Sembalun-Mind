import { typedSupabase as supabase } from '../config/supabase';
import type { 
  MeditationSession, 
  Course, 
  UserProgress, 
  AmbientSound, 
  GuidedScript,
  SessionCategory,
  Difficulty,
  InstructorProfile,
  UserContentInteractions,
  AnalyticsData
} from '../types/content';
import { sampleContentGenerator } from './sampleContentGenerator';

export class ContentDatabase {
  
  // Collections
  private readonly SESSIONS_COLLECTION = 'meditation_sessions';
  private readonly COURSES_COLLECTION = 'courses';
  private readonly SCRIPTS_COLLECTION = 'guided_scripts';
  private readonly AMBIENT_SOUNDS_COLLECTION = 'ambient_sounds';
  private readonly USER_PROGRESS_COLLECTION = 'user_progress';
  private readonly INSTRUCTORS_COLLECTION = 'instructors';
  // private readonly CONTENT_SERIES_COLLECTION = 'content_series';
  private readonly USER_INTERACTIONS_COLLECTION = 'user_interactions';
  private readonly ANALYTICS_COLLECTION = 'analytics';

  /**
   * MEDITATION SESSIONS
   */
  
  async getSessions(
    category?: SessionCategory,
    difficulty?: Difficulty,
    limit_count?: number
  ): Promise<MeditationSession[]> {
    try {
      let queryBuilder = supabase.from(this.SESSIONS_COLLECTION).select('*');
      
      if (category) {
        queryBuilder = queryBuilder.eq('category', category);
      }
      
      if (difficulty) {
        queryBuilder = queryBuilder.eq('difficulty', difficulty);
      }
      
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
      
      if (limit_count) {
        queryBuilder = queryBuilder.limit(limit_count);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        audioUrl: row.audio_url,
        duration: row.duration,
        category: row.category,
        difficulty: row.difficulty,
        instructor: row.instructor,
        tags: row.tags,
        isPremium: row.is_premium,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        thumbnailUrl: row.thumbnail_url,
        completionCount: row.completion_count,
        averageRating: row.average_rating,
        isNew: row.is_new
      })) as MeditationSession[];
      
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw new Error('Failed to fetch meditation sessions');
    }
  }

  async getSession(sessionId: string): Promise<MeditationSession | null> {
    try {
      const { data, error } = await supabase
        .from(this.SESSIONS_COLLECTION)
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        audioUrl: data.audio_url,
        duration: data.duration,
        category: data.category,
        difficulty: data.difficulty,
        instructor: data.instructor,
        tags: data.tags,
        isPremium: data.is_premium,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        thumbnailUrl: data.thumbnail_url,
        completionCount: data.completion_count,
        averageRating: data.average_rating,
        isNew: data.is_new
      } as MeditationSession;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw new Error('Failed to fetch meditation session');
    }
  }

  async createSession(sessionData: Omit<MeditationSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(this.SESSIONS_COLLECTION)
        .insert({
          title: sessionData.title,
          description: sessionData.description,
          audio_url: sessionData.audioUrl,
          duration: sessionData.duration,
          category: sessionData.category,
          difficulty: sessionData.difficulty,
          instructor: sessionData.instructor,
          tags: sessionData.tags,
          is_premium: sessionData.isPremium,
          created_at: now,
          updated_at: now,
          thumbnail_url: sessionData.thumbnailUrl,
          completion_count: sessionData.completionCount,
          average_rating: sessionData.averageRating,
          is_new: sessionData.isNew
        })
        .select('id')
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to create session');
      return data.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create meditation session');
    }
  }

  async updateSession(sessionId: string, updates: Partial<MeditationSession>): Promise<void> {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from(this.SESSIONS_COLLECTION)
        .update({
          title: updates.title,
          description: updates.description,
          audio_url: updates.audioUrl,
          duration: updates.duration,
          category: updates.category,
          difficulty: updates.difficulty,
          instructor: updates.instructor,
          tags: updates.tags,
          is_premium: updates.isPremium,
          updated_at: now,
          thumbnail_url: updates.thumbnailUrl,
          completion_count: updates.completionCount,
          average_rating: updates.averageRating,
          is_new: updates.isNew
        })
        .eq('id', sessionId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update meditation session');
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.SESSIONS_COLLECTION)
        .delete()
        .eq('id', sessionId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete meditation session');
    }
  }

  /**
   * COURSES
   */

  async getCourses(category?: SessionCategory, difficulty?: Difficulty): Promise<Course[]> {
    try {
      let queryBuilder = supabase.from(this.COURSES_COLLECTION).select('*');
      
      if (category) {
        queryBuilder = queryBuilder.eq('category', category);
      }
      
      if (difficulty) {
        queryBuilder = queryBuilder.eq('difficulty', difficulty);
      }
      
      queryBuilder = queryBuilder.order('created_at', { ascending: false });

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        thumbnailUrl: row.thumbnail_url,
        instructor: row.instructor,
        duration: row.duration,
        sessionCount: row.session_count,
        category: row.category,
        difficulty: row.difficulty,
        isPremium: row.is_premium,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        tags: row.tags,
        averageRating: row.average_rating,
        completionCount: row.completion_count,
        isNew: row.is_new
      })) as Course[];
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  async getCourse(courseId: string): Promise<Course | null> {
    try {
      const { data, error } = await supabase
        .from(this.COURSES_COLLECTION)
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnail_url,
        instructor: data.instructor,
        duration: data.duration,
        sessionCount: data.session_count,
        category: data.category,
        difficulty: data.difficulty,
        isPremium: data.is_premium,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        tags: data.tags,
        averageRating: data.average_rating,
        completionCount: data.completion_count,
        isNew: data.is_new
      } as Course;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw new Error('Failed to fetch course');
    }
  }

  async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(this.COURSES_COLLECTION)
        .insert({
          title: courseData.title,
          description: courseData.description,
          thumbnail_url: courseData.thumbnailUrl,
          instructor: courseData.instructor,
          duration: courseData.duration,
          session_count: courseData.sessionCount,
          category: courseData.category,
          difficulty: courseData.difficulty,
          is_premium: courseData.isPremium,
          created_at: now,
          updated_at: now,
          tags: courseData.tags,
          average_rating: courseData.averageRating,
          completion_count: courseData.completionCount,
          is_new: courseData.isNew
        })
        .select('id')
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to create course');
      return data.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw new Error('Failed to create course');
    }
  }

  /**
   * GUIDED SCRIPTS
   */

  async getScript(sessionId: string): Promise<GuidedScript | null> {
    try {
      const { data, error } = await supabase
        .from(this.SCRIPTS_COLLECTION)
        .select('*')
        .eq('session_id', sessionId)
        .limit(1);
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const row = data[0];
      return {
        id: row.id,
        sessionId: row.session_id,
        scriptText: row.script_text,
        language: row.language,
        version: row.version
      } as GuidedScript;
      
    } catch (error) {
      console.error('Error fetching script:', error);
      throw new Error('Failed to fetch guided script');
    }
  }

  async createScript(scriptData: Omit<GuidedScript, 'id'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from(this.SCRIPTS_COLLECTION)
        .insert({
          session_id: scriptData.sessionId,
          script_text: scriptData.scriptText,
          language: scriptData.language,
          version: scriptData.version
        })
        .select('id')
        .single();
      if (error) throw error;
      if (!data) throw new Error('Failed to create script');
      return data.id;
    } catch (error) {
      console.error('Error creating script:', error);
      throw new Error('Failed to create guided script');
    }
  }

  /**
   * AMBIENT SOUNDS
   */

  async getAmbientSounds(): Promise<AmbientSound[]> {
    try {
      const { data, error } = await supabase
        .from(this.AMBIENT_SOUNDS_COLLECTION)
        .select('*')
        .order('name');
      
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        name: row.name,
        audioUrl: row.audio_url,
        thumbnailUrl: row.thumbnail_url,
        category: row.category,
        duration: row.duration,
        isPremium: row.is_premium
      })) as AmbientSound[];
      
    } catch (error) {
      console.error('Error fetching ambient sounds:', error);
      throw new Error('Failed to fetch ambient sounds');
    }
  }

  /**
   * USER PROGRESS
   */

  async getUserProgress(userId: string, sessionId?: string): Promise<UserProgress[]> {
    try {
      let queryBuilder = supabase
        .from(this.USER_PROGRESS_COLLECTION)
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false });
      
      if (sessionId) {
        queryBuilder = queryBuilder.eq('session_id', sessionId);
      }
      
      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(row => ({
        userId: row.user_id,
        sessionId: row.session_id,
        completed: row.completed,
        progress: row.progress,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        lastAccessedAt: new Date(row.last_accessed_at),
        notes: row.notes,
        rating: row.rating,
        feedback: row.feedback
      })) as UserProgress[];
      
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw new Error('Failed to fetch user progress');
    }
  }

  async updateUserProgress(progressData: UserProgress): Promise<void> {
    try {
      const progressId = `${progressData.userId}_${progressData.sessionId}`;
      const now = new Date().toISOString();

      const updatePayload = {
        completed: progressData.completed,
        progress: progressData.progress,
        completed_at: progressData.completedAt ? progressData.completedAt.toISOString() : null,
        last_accessed_at: now,
        notes: progressData.notes,
        rating: progressData.rating,
        feedback: progressData.feedback
      };

      const { error: updateError } = await supabase
        .from(this.USER_PROGRESS_COLLECTION)
        .update(updatePayload)
        .eq('user_id', progressData.userId)
        .eq('session_id', progressData.sessionId);

      if (updateError) {
        // If update fails (e.g., record not found), try inserting
        const insertPayload = {
          id: progressId,
          user_id: progressData.userId,
          session_id: progressData.sessionId,
          ...updatePayload
        };
        const { error: insertError } = await supabase.from(this.USER_PROGRESS_COLLECTION).insert(insertPayload);
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw new Error('Failed to update user progress');
    }
  }

  /**
   * BATCH OPERATIONS
   */

  async bulkCreateSessions(sessions: Omit<MeditationSession, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
    try {
      const now = new Date().toISOString();
      const sessionsToInsert = sessions.map(sessionData => ({
        title: sessionData.title,
        description: sessionData.description,
        audio_url: sessionData.audioUrl,
        duration: sessionData.duration,
        category: sessionData.category,
        difficulty: sessionData.difficulty,
        instructor: sessionData.instructor,
        tags: sessionData.tags,
        is_premium: sessionData.isPremium,
        created_at: now,
        updated_at: now,
        thumbnail_url: sessionData.thumbnailUrl,
        completion_count: sessionData.completionCount,
        average_rating: sessionData.averageRating,
        is_new: sessionData.isNew
      }));

      const { data, error } = await supabase
        .from(this.SESSIONS_COLLECTION)
        .insert(sessionsToInsert)
        .select('id');
      
      if (error) throw error;
      return data ? data.map(row => row.id) : [];
      
    } catch (error) {
      console.error('Error bulk creating sessions:', error);
      throw new Error('Failed to bulk create sessions');
    }
  }

  /**
   * SEARCH AND FILTERING
   */

  async searchSessions(
    searchTerm: string,
    filters?: {
      category?: SessionCategory;
      difficulty?: Difficulty;
      tags?: string[];
      instructor?: string;
    }
  ): Promise<MeditationSession[]> {
    try {
      let queryBuilder = supabase.from(this.SESSIONS_COLLECTION).select('*');
      
      if (filters?.category) {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }
      
      if (filters?.difficulty) {
        queryBuilder = queryBuilder.eq('difficulty', filters.difficulty);
      }
      
      if (filters?.instructor) {
        queryBuilder = queryBuilder.eq('instructor', filters.instructor);
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        queryBuilder = queryBuilder.contains('tags', filters.tags);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      const sessions = data.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        audioUrl: row.audio_url,
        duration: row.duration,
        category: row.category,
        difficulty: row.difficulty,
        instructor: row.instructor,
        tags: row.tags,
        isPremium: row.is_premium,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        thumbnailUrl: row.thumbnail_url,
        completionCount: row.completion_count,
        averageRating: row.average_rating,
        isNew: row.is_new
      })) as MeditationSession[];

      // Client-side filtering for title/description search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return sessions.filter(session => 
          session.title.toLowerCase().includes(term) ||
          session.description.toLowerCase().includes(term)
        );
      }

      return sessions;
      
    } catch (error) {
      console.error('Error searching sessions:', error);
      throw new Error('Failed to search sessions');
    }
  }

  /**
   * INSTRUCTORS
   */

  async getInstructors(): Promise<InstructorProfile[]> {
    try {
      const { data, error } = await supabase
        .from(this.INSTRUCTORS_COLLECTION)
        .select('*')
        .order('name');
      
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        name: row.name,
        bio: row.bio,
        avatarUrl: row.avatar_url,
        specialties: row.specialties,
        socialLinks: row.social_links,
        joinedAt: new Date(row.joined_at)
      })) as InstructorProfile[];
      
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw new Error('Failed to fetch instructors');
    }
  }

  async getInstructor(instructorId: string): Promise<InstructorProfile | null> {
    try {
      const { data, error } = await supabase
        .from(this.INSTRUCTORS_COLLECTION)
        .select('*')
        .eq('id', instructorId)
        .single();
      
      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        bio: data.bio,
        avatarUrl: data.avatar_url,
        specialties: data.specialties,
        socialLinks: data.social_links,
        joinedAt: new Date(data.joined_at)
      } as InstructorProfile;
    } catch (error) {
      console.error('Error fetching instructor:', error);
      throw new Error('Failed to fetch instructor');
    }
  }

  /**
   * USER INTERACTIONS
   */

  async getUserInteractions(userId: string, sessionId?: string): Promise<UserContentInteractions[]> {
    try {
      let queryBuilder = supabase
        .from(this.USER_INTERACTIONS_COLLECTION)
        .select('*')
        .eq('user_id', userId);
      
      if (sessionId) {
        queryBuilder = queryBuilder.eq('session_id', sessionId);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(row => ({
        userId: row.user_id,
        sessionId: row.session_id,
        liked: row.liked,
        completed: row.completed,
        rating: row.rating,
        notes: row.notes,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      })) as UserContentInteractions[];
      
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      throw new Error('Failed to fetch user interactions');
    }
  }

  async updateUserInteraction(interactionData: UserContentInteractions): Promise<void> {
    try {
      const now = new Date().toISOString();
      const updatePayload = {
        liked: interactionData.liked,
        completed: interactionData.completed,
        rating: interactionData.rating,
        notes: interactionData.notes,
        updated_at: now
      };

      const { error } = await supabase
        .from(this.USER_INTERACTIONS_COLLECTION)
        .update(updatePayload)
        .eq('user_id', interactionData.userId)
        .eq('session_id', interactionData.sessionId);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error updating user interaction:', error);
      throw new Error('Failed to update user interaction');
    }
  }

  /**
   * ANALYTICS
   */

  async logAnalyticsEvent(eventData: AnalyticsData): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.ANALYTICS_COLLECTION)
        .insert({
          event_name: eventData.eventName,
          user_id: eventData.userId,
          properties: eventData.properties,
          timestamp: new Date().toISOString()
        });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging analytics event:', error);
      // Don't throw error for analytics - it shouldn't break user experience
    }
  }

  async getContentStats(): Promise<{
    totalSessions: number;
    totalCourses: number;
    totalInstructors: number;
    sessionsByCategory: Record<string, number>;
    sessionsByDifficulty: Record<string, number>;
  }> {
    try {
      const [{ count: totalSessions, error: sessionsError }, { count: totalCourses, error: coursesError }, { count: totalInstructors, error: instructorsError }] = await Promise.all([
        supabase.from(this.SESSIONS_COLLECTION).select('id', { count: 'exact', head: true }),
        supabase.from(this.COURSES_COLLECTION).select('id', { count: 'exact', head: true }),
        supabase.from(this.INSTRUCTORS_COLLECTION).select('id', { count: 'exact', head: true })
      ]);

      if (sessionsError) throw sessionsError;
      if (coursesError) throw coursesError;
      if (instructorsError) throw instructorsError;

      const { data: sessionsData, error: sessionsDataError } = await supabase.from(this.SESSIONS_COLLECTION).select('category, difficulty');
      if (sessionsDataError) throw sessionsDataError;

      const sessionsByCategory: Record<string, number> = {};
      const sessionsByDifficulty: Record<string, number> = {};

      sessionsData.forEach(session => {
        sessionsByCategory[session.category] = (sessionsByCategory[session.category] || 0) + 1;
        sessionsByDifficulty[session.difficulty] = (sessionsByDifficulty[session.difficulty] || 0) + 1;
      });

      return {
        totalSessions: totalSessions || 0,
        totalCourses: totalCourses || 0,
        totalInstructors: totalInstructors || 0,
        sessionsByCategory,
        sessionsByDifficulty
      };
      
    } catch (error) {
      console.error('Error fetching content stats:', error);
      throw new Error('Failed to fetch content statistics');
    }
  }

  /**
   * SAMPLE DATA POPULATION
   */

  async populateSampleData(): Promise<{
    success: boolean;
    message: string;
    counts: {
      sessions: number;
      courses: number;
      instructors: number;
      ambientSounds: number;
      scripts: number;
    };
  }> {
    try {
      const sampleContent = sampleContentGenerator.generateCompleteContent();
      
      // Add instructors
      const { error: instructorsError } = await supabase.from(this.INSTRUCTORS_COLLECTION).insert(
        sampleContent.instructors.map(i => ({
          name: i.name,
          bio: i.bio,
          avatar_url: i.avatarUrl,
          specialties: i.specialties,
          social_links: i.socialLinks,
          joined_at: i.joinedAt.toISOString()
        }))
      );
      if (instructorsError) throw instructorsError;

      // Add sessions
      const { error: sessionsError } = await supabase.from(this.SESSIONS_COLLECTION).insert(
        sampleContent.sessions.map(s => ({
          title: s.title,
          description: s.description,
          audio_url: s.audioUrl,
          duration: s.duration,
          category: s.category,
          difficulty: s.difficulty,
          instructor: s.instructor,
          tags: s.tags,
          is_premium: s.isPremium,
          created_at: s.createdAt.toISOString(),
          updated_at: s.updatedAt.toISOString(),
          thumbnail_url: s.thumbnailUrl,
          completion_count: s.completionCount,
          average_rating: s.averageRating,
          is_new: s.isNew
        }))
      );
      if (sessionsError) throw sessionsError;

      // Add courses
      const { error: coursesError } = await supabase.from(this.COURSES_COLLECTION).insert(
        sampleContent.courses.map(c => ({
          title: c.title,
          description: c.description,
          thumbnail_url: c.thumbnailUrl,
          instructor: c.instructor,
          duration: c.duration,
          session_count: c.sessionCount,
          category: c.category,
          difficulty: c.difficulty,
          is_premium: c.isPremium,
          created_at: c.createdAt.toISOString(),
          updated_at: c.updatedAt.toISOString(),
          tags: c.tags,
          average_rating: c.averageRating,
          completion_count: c.completionCount,
          is_new: c.isNew
        }))
      );
      if (coursesError) throw coursesError;

      // Add ambient sounds
      const { error: ambientSoundsError } = await supabase.from(this.AMBIENT_SOUNDS_COLLECTION).insert(
        sampleContent.ambientSounds.map(a => ({
          name: a.name,
          audio_url: a.audioUrl,
          thumbnail_url: a.thumbnailUrl,
          category: a.category,
          duration: a.duration,
          is_premium: a.isPremium
        }))
      );
      if (ambientSoundsError) throw ambientSoundsError;

      // Add scripts
      const { error: scriptsError } = await supabase.from(this.SCRIPTS_COLLECTION).insert(
        sampleContent.scripts.map(s => ({
          session_id: s.sessionId,
          script_text: s.scriptText,
          language: s.language,
          version: s.version
        }))
      );
      if (scriptsError) throw scriptsError;

      return {
        success: true,
        message: 'Sample data populated successfully',
        counts: {
          sessions: sampleContent.sessions.length,
          courses: sampleContent.courses.length,
          instructors: sampleContent.instructors.length,
          ambientSounds: sampleContent.ambientSounds.length,
          scripts: sampleContent.scripts.length
        }
      };
      
    } catch (error) {
      console.error('Error populating sample data:', error);
      return {
        success: false,
        message: `Failed to populate sample data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        counts: {
          sessions: 0,
          courses: 0,
          instructors: 0,
          ambientSounds: 0,
          scripts: 0
        }
      };
    }
  }

  /**
   * Clear all content (useful for development)
   */
  async clearAllContent(): Promise<void> {
    try {
      const collections = [
        this.SESSIONS_COLLECTION,
        this.COURSES_COLLECTION,
        this.INSTRUCTORS_COLLECTION,
        this.AMBIENT_SOUNDS_COLLECTION,
        this.SCRIPTS_COLLECTION
      ];

      for (const collectionName of collections) {
        const { error } = await supabase.from(collectionName).delete().neq('id', '' as any); // Delete all rows
        if (error) throw error;
      }

      console.log('All content cleared successfully');
      
    } catch (error) {
      console.error('Error clearing content:', error);
      throw new Error('Failed to clear content');
    }
  }

  /**
   * Get content by featured status
   */
  async getFeaturedSessions(limit_count: number = 10): Promise<MeditationSession[]> {
    try {
      const { data, error } = await supabase
        .from(this.SESSIONS_COLLECTION)
        .select('*')
        .eq('is_new', true)
        .order('average_rating', { ascending: false })
        .limit(limit_count);
      
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        audioUrl: row.audio_url,
        duration: row.duration,
        category: row.category,
        difficulty: row.difficulty,
        instructor: row.instructor,
        tags: row.tags,
        isPremium: row.is_premium,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        thumbnailUrl: row.thumbnail_url,
        completionCount: row.completion_count,
        averageRating: row.average_rating,
        isNew: row.is_new
      })) as MeditationSession[];
      
    } catch (error) {
      console.error('Error fetching featured sessions:', error);
      throw new Error('Failed to fetch featured sessions');
    }
  }

  /**
   * Get trending sessions based on completion count
   */
  async getTrendingSessions(limit_count: number = 10): Promise<MeditationSession[]> {
    try {
      const { data, error } = await supabase
        .from(this.SESSIONS_COLLECTION)
        .select('*')
        .order('completion_count', { ascending: false })
        .limit(limit_count);
      
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        audioUrl: row.audio_url,
        duration: row.duration,
        category: row.category,
        difficulty: row.difficulty,
        instructor: row.instructor,
        tags: row.tags,
        isPremium: row.is_premium,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        thumbnailUrl: row.thumbnail_url,
        completionCount: row.completion_count,
        averageRating: row.average_rating,
        isNew: row.is_new
      })) as MeditationSession[];
      
    } catch (error) {
      console.error('Error fetching trending sessions:', error);
      throw new Error('Failed to fetch trending sessions');
    }
  }
}

// Singleton instance
export const contentDatabase = new ContentDatabase();