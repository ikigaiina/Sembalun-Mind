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

      const docRef = await addDoc(collection(db, 'personal_notes'), {
        ...noteData,
        createdAt: Timestamp.fromDate(noteData.createdAt),
        updatedAt: Timestamp.fromDate(noteData.updatedAt)
      });

      return docRef.id;
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
      let q = query(
        collection(db, 'personal_notes'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limit_count)
      );

      if (relatedContentType) {
        q = query(q, where('relatedContentType', '==', relatedContentType));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
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
      const docRef = doc(db, 'personal_notes', noteId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      const docRef = doc(db, 'personal_notes', noteId);
      await deleteDoc(docRef);
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

      const docRef = await addDoc(collection(db, 'reflections'), {
        ...reflectionData,
        createdAt: Timestamp.fromDate(reflectionData.createdAt)
      });

      return docRef.id;
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
      let q = query(
        collection(db, 'reflections'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit_count)
      );

      if (sessionId) {
        q = query(q, where('sessionId', '==', sessionId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
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