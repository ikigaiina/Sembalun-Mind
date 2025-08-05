import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
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
      let q = query(collection(db, this.SESSIONS_COLLECTION));
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      if (difficulty) {
        q = query(q, where('difficulty', '==', difficulty));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      if (limit_count) {
        q = query(q, limit(limit_count));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as MeditationSession[];
      
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw new Error('Failed to fetch meditation sessions');
    }
  }

  async getSession(sessionId: string): Promise<MeditationSession | null> {
    try {
      const docRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate()
        } as MeditationSession;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw new Error('Failed to fetch meditation session');
    }
  }

  async createSession(sessionData: Omit<MeditationSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, this.SESSIONS_COLLECTION), {
        ...sessionData,
        createdAt: now,
        updatedAt: now
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create meditation session');
    }
  }

  async updateSession(sessionId: string, updates: Partial<MeditationSession>): Promise<void> {
    try {
      const docRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update meditation session');
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.SESSIONS_COLLECTION, sessionId));
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
      let q = query(collection(db, this.COURSES_COLLECTION));
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      if (difficulty) {
        q = query(q, where('difficulty', '==', difficulty));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Course[];
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  async getCourse(courseId: string): Promise<Course | null> {
    try {
      const docRef = doc(db, this.COURSES_COLLECTION, courseId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate()
        } as Course;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw new Error('Failed to fetch course');
    }
  }

  async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, this.COURSES_COLLECTION), {
        ...courseData,
        createdAt: now,
        updatedAt: now
      });
      
      return docRef.id;
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
      const q = query(
        collection(db, this.SCRIPTS_COLLECTION), 
        where('sessionId', '==', sessionId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as GuidedScript;
      
    } catch (error) {
      console.error('Error fetching script:', error);
      throw new Error('Failed to fetch guided script');
    }
  }

  async createScript(scriptData: Omit<GuidedScript, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.SCRIPTS_COLLECTION), scriptData);
      return docRef.id;
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
      const q = query(collection(db, this.AMBIENT_SOUNDS_COLLECTION), orderBy('name'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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
      let q = query(
        collection(db, this.USER_PROGRESS_COLLECTION),
        where('userId', '==', userId)
      );
      
      if (sessionId) {
        q = query(q, where('sessionId', '==', sessionId));
      }
      
      q = query(q, orderBy('lastAccessedAt', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate(),
        lastAccessedAt: doc.data().lastAccessedAt?.toDate()
      })) as UserProgress[];
      
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw new Error('Failed to fetch user progress');
    }
  }

  async updateUserProgress(progressData: UserProgress): Promise<void> {
    try {
      const progressId = `${progressData.userId}_${progressData.sessionId}`;
      const docRef = doc(db, this.USER_PROGRESS_COLLECTION, progressId);
      
      await updateDoc(docRef, {
        ...progressData,
        lastAccessedAt: Timestamp.now(),
        completedAt: progressData.completedAt ? Timestamp.fromDate(progressData.completedAt) : null
      });
      
    } catch {
      // If document doesn't exist, create it
      try {
        const docRef = doc(db, this.USER_PROGRESS_COLLECTION, `${progressData.userId}_${progressData.sessionId}`);
        await updateDoc(docRef, {
          ...progressData,
          lastAccessedAt: Timestamp.now(),
          completedAt: progressData.completedAt ? Timestamp.fromDate(progressData.completedAt) : null
        });
      } catch (createError) {
        console.error('Error creating user progress:', createError);
        throw new Error('Failed to update user progress');
      }
    }
  }

  /**
   * BATCH OPERATIONS
   */

  async bulkCreateSessions(sessions: Omit<MeditationSession, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
    try {
      const batch = writeBatch(db);
      const ids: string[] = [];
      const now = Timestamp.now();

      sessions.forEach(sessionData => {
        const docRef = doc(collection(db, this.SESSIONS_COLLECTION));
        batch.set(docRef, {
          ...sessionData,
          createdAt: now,
          updatedAt: now
        });
        ids.push(docRef.id);
      });

      await batch.commit();
      return ids;
      
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
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - for production, consider using Algolia or similar
      
      let q = query(collection(db, this.SESSIONS_COLLECTION));
      
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters?.difficulty) {
        q = query(q, where('difficulty', '==', filters.difficulty));
      }
      
      if (filters?.instructor) {
        q = query(q, where('instructor', '==', filters.instructor));
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filters.tags));
      }

      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
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
      const q = query(collection(db, this.INSTRUCTORS_COLLECTION), orderBy('name'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinedAt: doc.data().joinedAt?.toDate()
      })) as InstructorProfile[];
      
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw new Error('Failed to fetch instructors');
    }
  }

  async getInstructor(instructorId: string): Promise<InstructorProfile | null> {
    try {
      const docRef = doc(db, this.INSTRUCTORS_COLLECTION, instructorId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          joinedAt: docSnap.data().joinedAt?.toDate()
        } as InstructorProfile;
      }
      
      return null;
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
      let q = query(
        collection(db, this.USER_INTERACTIONS_COLLECTION),
        where('userId', '==', userId)
      );
      
      if (sessionId) {
        q = query(q, where('sessionId', '==', sessionId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as UserContentInteractions[];
      
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      throw new Error('Failed to fetch user interactions');
    }
  }

  async updateUserInteraction(interactionData: UserContentInteractions): Promise<void> {
    try {
      const interactionId = `${interactionData.userId}_${interactionData.sessionId}`;
      const docRef = doc(db, this.USER_INTERACTIONS_COLLECTION, interactionId);
      
      await setDoc(docRef, {
        ...interactionData,
        updatedAt: Timestamp.now()
      }, { merge: true });
      
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
      await addDoc(collection(db, this.ANALYTICS_COLLECTION), {
        ...eventData,
        timestamp: Timestamp.now()
      });
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
      const [sessionsSnapshot, coursesSnapshot, instructorsSnapshot] = await Promise.all([
        getDocs(collection(db, this.SESSIONS_COLLECTION)),
        getDocs(collection(db, this.COURSES_COLLECTION)),
        getDocs(collection(db, this.INSTRUCTORS_COLLECTION))
      ]);

      const sessions = sessionsSnapshot.docs.map(doc => doc.data());
      
      const sessionsByCategory: Record<string, number> = {};
      const sessionsByDifficulty: Record<string, number> = {};

      sessions.forEach(session => {
        sessionsByCategory[session.category] = (sessionsByCategory[session.category] || 0) + 1;
        sessionsByDifficulty[session.difficulty] = (sessionsByDifficulty[session.difficulty] || 0) + 1;
      });

      return {
        totalSessions: sessionsSnapshot.size,
        totalCourses: coursesSnapshot.size,
        totalInstructors: instructorsSnapshot.size,
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
      
      // Use batches for efficient writes
      const batch = writeBatch(db);
      
      // Add instructors
      sampleContent.instructors.forEach(instructor => {
        const docRef = doc(collection(db, this.INSTRUCTORS_COLLECTION));
        batch.set(docRef, {
          ...instructor,
          joinedAt: Timestamp.fromDate(instructor.joinedAt)
        });
      });

      // Add sessions
      sampleContent.sessions.forEach(session => {
        const docRef = doc(collection(db, this.SESSIONS_COLLECTION));
        batch.set(docRef, {
          ...session,
          createdAt: Timestamp.fromDate(session.createdAt),
          updatedAt: Timestamp.fromDate(session.updatedAt)
        });
      });

      // Add courses
      sampleContent.courses.forEach(course => {
        const docRef = doc(collection(db, this.COURSES_COLLECTION));
        batch.set(docRef, {
          ...course,
          createdAt: Timestamp.fromDate(course.createdAt),
          updatedAt: Timestamp.fromDate(course.updatedAt)
        });
      });

      // Add ambient sounds
      sampleContent.ambientSounds.forEach(sound => {
        const docRef = doc(collection(db, this.AMBIENT_SOUNDS_COLLECTION));
        batch.set(docRef, sound);
      });

      // Add scripts
      sampleContent.scripts.forEach(script => {
        const docRef = doc(collection(db, this.SCRIPTS_COLLECTION));
        batch.set(docRef, script);
      });

      await batch.commit();

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

      const batch = writeBatch(db);
      
      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      }

      await batch.commit();
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
      const q = query(
        collection(db, this.SESSIONS_COLLECTION),
        where('isNew', '==', true),
        orderBy('averageRating', 'desc'),
        limit(limit_count)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
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
      const q = query(
        collection(db, this.SESSIONS_COLLECTION),
        orderBy('completionCount', 'desc'),
        limit(limit_count)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as MeditationSession[];
      
    } catch (error) {
      console.error('Error fetching trending sessions:', error);
      throw new Error('Failed to fetch trending sessions');
    }
  }
}

// Singleton instance
export const contentDatabase = new ContentDatabase();