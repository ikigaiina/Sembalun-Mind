import { typedSupabase as supabase } from '../config/supabase';
import type { PersonalNote, Reflection } from '../types/personalization';

export class NotesService {
  private static instance: NotesService;

  static getInstance(): NotesService {
    if (!NotesService.instance) {
      NotesService.instance = new NotesService();
    }
    return NotesService.instance;
  }

  // Personal Notes Management
  async createNote(
    userId: string, 
    note: Omit<PersonalNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const noteData: Omit<PersonalNote, 'id'> = {
        userId,
        ...note,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { data, error } = await supabase
        .from('personal_notes')
        .insert({
          user_id: noteData.userId,
          title: noteData.title,
          content: noteData.content,
          mood: noteData.mood,
          tags: noteData.tags,
          is_private: noteData.isPrivate,
          related_content_type: noteData.relatedContentType,
          related_content_id: noteData.relatedContentId,
          created_at: noteData.createdAt.toISOString(),
          updated_at: noteData.updatedAt.toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create note');
      return data.id;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  async getUserNotes(
    userId: string, 
    relatedContentType?: string,
    limit_count: number = 50
  ): Promise<PersonalNote[]> {
    try {
      let queryBuilder = supabase
        .from('personal_notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit_count);

      if (relatedContentType) {
        queryBuilder = queryBuilder.eq('related_content_type', relatedContentType);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        content: row.content,
        mood: row.mood,
        tags: row.tags,
        isPrivate: row.is_private,
        relatedContentType: row.related_content_type,
        relatedContentId: row.related_content_id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      })) as PersonalNote[];
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  }

  async updateNote(
    noteId: string, 
    updates: Partial<Pick<PersonalNote, 'title' | 'content' | 'mood' | 'tags' | 'isPrivate'>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('personal_notes')
        .update({
          title: updates.title,
          content: updates.content,
          mood: updates.mood,
          tags: updates.tags,
          is_private: updates.isPrivate,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('personal_notes')
        .delete()
        .eq('id', noteId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  async searchNotes(userId: string, searchTerm: string, tags?: string[]): Promise<PersonalNote[]> {
    try {
      const notes = await this.getUserNotes(userId);
      
      let filteredNotes = notes;
      
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredNotes = filteredNotes.filter(note =>
          note.title.toLowerCase().includes(lowerSearchTerm) ||
          note.content.toLowerCase().includes(lowerSearchTerm) ||
          note.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
        );
      }

      if (tags && tags.length > 0) {
        filteredNotes = filteredNotes.filter(note =>
          tags.some(tag => note.tags.includes(tag))
        );
      }

      return filteredNotes;
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  }

  // Reflections Management
  async createReflection(
    userId: string, 
    reflection: Omit<Reflection, 'id' | 'userId' | 'createdAt'>
  ): Promise<string> {
    try {
      const reflectionData: Omit<Reflection, 'id'> = {
        userId,
        ...reflection,
        createdAt: new Date()
      };

      const { data, error } = await supabase
        .from('reflections')
        .insert({
          user_id: reflectionData.userId,
          session_id: reflectionData.sessionId,
          mood_before: reflectionData.moodBefore,
          mood_after: reflectionData.moodAfter,
          insights: reflectionData.insights,
          gratitude: reflectionData.gratitude,
          challenges: reflectionData.challenges,
          improvements: reflectionData.improvements,
          created_at: reflectionData.createdAt.toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create reflection');
      return data.id;
    } catch (error) {
      console.error('Error creating reflection:', error);
      throw error;
    }
  }

  async getUserReflections(
    userId: string, 
    sessionId?: string,
    limit_count: number = 30
  ): Promise<Reflection[]> {
    try {
      let queryBuilder = supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit_count);

      if (sessionId) {
        queryBuilder = queryBuilder.eq('session_id', sessionId);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        sessionId: row.session_id,
        moodBefore: row.mood_before,
        moodAfter: row.mood_after,
        insights: row.insights,
        gratitude: row.gratitude,
        challenges: row.challenges,
        improvements: row.improvements,
        createdAt: new Date(row.created_at)
      })) as Reflection[];
    } catch (error) {
      console.error('Error fetching reflections:', error);
      return [];
    }
  }

  async getReflectionInsights(userId: string): Promise<{
    totalReflections: number;
    averageMoodChange: number;
    commonInsights: string[];
    commonChallenges: string[];
    improvementTrends: string[];
    gratitudePhrases: string[];
  }> {
    try {
      const reflections = await this.getUserReflections(userId, undefined, 100);
      
      const totalReflections = reflections.length;
      
      // Calculate average mood change
      const moodChanges = reflections
        .filter(r => r.moodBefore && r.moodAfter)
        .map(r => (r.moodAfter! - r.moodBefore!));
      const averageMoodChange = moodChanges.length > 0 
        ? moodChanges.reduce((sum, change) => sum + change, 0) / moodChanges.length 
        : 0;

      // Extract common insights
      const allInsights = reflections.flatMap(r => r.insights);
      const insightCounts = this.countFrequency(allInsights);
      const commonInsights = Object.entries(insightCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([insight]) => insight);

      // Extract common challenges
      const allChallenges = reflections.flatMap(r => r.challenges);
      const challengeCounts = this.countFrequency(allChallenges);
      const commonChallenges = Object.entries(challengeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([challenge]) => challenge);

      // Extract improvement trends
      const allImprovements = reflections.flatMap(r => r.improvements);
      const improvementCounts = this.countFrequency(allImprovements);
      const improvementTrends = Object.entries(improvementCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([improvement]) => improvement);

      // Extract gratitude phrases
      const allGratitude = reflections.flatMap(r => r.gratitude);
      const gratitudeCounts = this.countFrequency(allGratitude);
      const gratitudePhrases = Object.entries(gratitudeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([gratitude]) => gratitude);

      return {
        totalReflections,
        averageMoodChange: Math.round(averageMoodChange * 100) / 100,
        commonInsights,
        commonChallenges,
        improvementTrends,
        gratitudePhrases
      };
    } catch (error) {
      console.error('Error getting reflection insights:', error);
      return {
        totalReflections: 0,
        averageMoodChange: 0,
        commonInsights: [],
        commonChallenges: [],
        improvementTrends: [],
        gratitudePhrases: []
      };
    }
  }

  private countFrequency(items: string[]): { [key: string]: number } {
    const frequency: { [key: string]: number } = {};
    items.forEach(item => {
      if (item && item.trim()) {
        frequency[item] = (frequency[item] || 0) + 1;
      }
    });
    return frequency;
  }

  async getNotesStats(userId: string): Promise<{
    totalNotes: number;
    privateNotes: number;
    notesThisWeek: number;
    averageMood: number;
    topTags: string[];
    contentTypeBreakdown: { [contentType: string]: number };
  }> {
    try {
      const notes = await this.getUserNotes(userId);
      
      const totalNotes = notes.length;
      const privateNotes = notes.filter(n => n.isPrivate).length;
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const notesThisWeek = notes.filter(n => n.createdAt >= weekAgo).length;
      
      const moodNotes = notes.filter(n => n.mood);
      const averageMood = moodNotes.length > 0 
        ? moodNotes.reduce((sum, n) => sum + (n.mood || 0), 0) / moodNotes.length
        : 0;

      const allTags = notes.flatMap(n => n.tags);
      const tagCounts = this.countFrequency(allTags);
      const topTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);

      const contentTypeBreakdown: { [contentType: string]: number } = {};
      notes.forEach(note => {
        if (note.relatedContentType) {
          contentTypeBreakdown[note.relatedContentType] = 
            (contentTypeBreakdown[note.relatedContentType] || 0) + 1;
        }
      });

      return {
        totalNotes,
        privateNotes,
        notesThisWeek,
        averageMood: Math.round(averageMood * 10) / 10,
        topTags,
        contentTypeBreakdown
      };
    } catch (error) {
      console.error('Error getting notes stats:', error);
      return {
        totalNotes: 0,
        privateNotes: 0,
        notesThisWeek: 0,
        averageMood: 0,
        topTags: [],
        contentTypeBreakdown: {}
      };
    }
  }

  // Quick reflection templates
  getReflectionTemplates(): {
    title: string;
    prompts: {
      insights: string[];
      gratitude: string[];
      challenges: string[];
      improvements: string[];
    };
  }[] {
    return [
      {
        title: 'Refleksi Sesi Meditasi',
        prompts: {
          insights: [
            'Apa yang saya pelajari tentang diri saya hari ini?',
            'Bagaimana perasaan saya sebelum dan sesudah meditasi?',
            'Pola pikiran apa yang saya sadari?'
          ],
          gratitude: [
            'Apa yang saya syukuri hari ini?',
            'Siapa orang yang membuat hari saya lebih baik?',
            'Momen kecil apa yang membawa kebahagiaan?'
          ],
          challenges: [
            'Kesulitan apa yang saya hadapi hari ini?',
            'Emosi apa yang sulit saya kelola?',
            'Situasi apa yang membuat saya stres?'
          ],
          improvements: [
            'Apa yang bisa saya lakukan lebih baik besok?',
            'Kebiasaan apa yang ingin saya kembangkan?',
            'Bagaimana saya bisa lebih mindful?'
          ]
        }
      },
      {
        title: 'Refleksi Mingguan',
        prompts: {
          insights: [
            'Apa pencapaian terbesar saya minggu ini?',
            'Bagaimana perkembangan praktik meditasi saya?',
            'Apa yang saya pelajari tentang keseimbangan hidup?'
          ],
          gratitude: [
            'Apa momen terbaik minggu ini?',
            'Dukungan apa yang saya terima?',
            'Progress apa yang patut disyukuri?'
          ],
          challenges: [
            'Apa tantangan terbesar minggu ini?',
            'Di mana saya merasa terjebak atau stagnan?',
            'Apa yang menghambat praktik meditasi saya?'
          ],
          improvements: [
            'Apa fokus utama untuk minggu depan?',
            'Strategi apa yang ingin saya coba?',
            'Bagaimana saya bisa lebih konsisten?'
          ]
        }
      }
    ];
  }
}

export const notesService = NotesService.getInstance();