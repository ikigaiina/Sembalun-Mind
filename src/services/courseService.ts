import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CourseProgress, Certificate } from '../types/progress';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'siy' | 'breathing' | 'mindfulness' | 'advanced';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // in minutes
  modules: CourseModule[];
  prerequisites?: string[];
  certificateTemplate?: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
  order: number;
  duration: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'text' | 'meditation' | 'exercise';
  content: string;
  duration: number;
  order: number;
  requirements?: {
    completePrevious: boolean;
    minimumTime?: number;
    quiz?: boolean;
  };
}

export class CourseService {
  private static instance: CourseService;

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  // Sample courses data - in production, this would come from Firestore
  private readonly sampleCourses: Course[] = [
    {
      id: 'siy_foundations',
      title: 'Search Inside Yourself - Fondasi',
      description: 'Kursus dasar SIY untuk membangun fondasi kecerdasan emosional melalui meditasi',
      category: 'siy',
      level: 'beginner',
      duration: 480, // 8 hours
      skills: ['Mindfulness', 'Emotional Intelligence', 'Self-Awareness', 'Meditation Basics'],
      modules: [
        {
          id: 'module_1',
          title: 'Pengenalan SIY',
          description: 'Memahami konsep dasar Search Inside Yourself',
          order: 1,
          duration: 120,
          lessons: [
            {
              id: 'lesson_1_1',
              title: 'Apa itu Search Inside Yourself?',
              description: 'Pengenalan filosofi dan metodologi SIY',
              type: 'video',
              content: 'video_intro_siy.mp4',
              duration: 15,
              order: 1
            },
            {
              id: 'lesson_1_2',
              title: 'Kecerdasan Emosional dan Neurosains',
              description: 'Dasar ilmiah kecerdasan emosional',
              type: 'text',
              content: 'Memahami bagaimana otak memproses emosi...',
              duration: 20,
              order: 2
            },
            {
              id: 'lesson_1_3',
              title: 'Meditasi Pernapasan Dasar',
              description: 'Praktik meditasi fokus pernapasan',
              type: 'meditation',
              content: 'guided_breathing_basic.mp3',
              duration: 10,
              order: 3
            }
          ]
        },
        {
          id: 'module_2',
          title: 'Membangun Kesadaran Diri',
          description: 'Mengembangkan kemampuan introspeksi dan self-awareness',
          order: 2,
          duration: 180,
          lessons: [
            {
              id: 'lesson_2_1',
              title: 'Mindfulness dalam Kehidupan Sehari-hari',
              description: 'Menerapkan kesadaran penuh dalam aktivitas harian',
              type: 'video',
              content: 'video_daily_mindfulness.mp4',
              duration: 25,
              order: 1
            },
            {
              id: 'lesson_2_2',
              title: 'Body Scan Meditation',
              description: 'Teknik pemindaian tubuh untuk meningkatkan kesadaran',
              type: 'meditation',
              content: 'guided_body_scan.mp3',
              duration: 20,
              order: 2
            },
            {
              id: 'lesson_2_3',
              title: 'Jurnal Refleksi Diri',
              description: 'Praktik menulis untuk introspeksi',
              type: 'exercise',
              content: 'Latihan menulis refleksi harian...',
              duration: 15,
              order: 3
            }
          ]
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-12-01')
    },
    {
      id: 'breathing_mastery',
      title: 'Penguasaan Teknik Pernapasan',
      description: 'Kursus komprehensif berbagai teknik pernapasan untuk meditasi dan kesehatan',
      category: 'breathing',
      level: 'intermediate',
      duration: 300, // 5 hours
      skills: ['Breathing Techniques', 'Stress Reduction', 'Focus Enhancement', 'Energy Management'],
      modules: [
        {
          id: 'breathing_module_1',
          title: 'Fondasi Pernapasan Sadar',
          description: 'Memahami anatomi dan fisiologi pernapasan',
          order: 1,
          duration: 100,
          lessons: [
            {
              id: 'breathing_lesson_1_1',
              title: 'Anatomi Sistem Pernapasan',
              description: 'Memahami cara kerja sistem pernapasan',
              type: 'text',
              content: 'Sistem pernapasan terdiri dari...',
              duration: 15,
              order: 1
            },
            {
              id: 'breathing_lesson_1_2',
              title: 'Pernapasan Perut vs Dada',
              description: 'Perbedaan dan manfaat masing-masing teknik',
              type: 'video',
              content: 'video_breathing_types.mp4',
              duration: 20,
              order: 2
            }
          ]
        }
      ],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-12-01')
    }
  ];

  async getUserCourseProgress(userId: string): Promise<CourseProgress[]> {
    try {
      const q = query(
        collection(db, 'course_progress'),
        where('userId', '==', userId),
        orderBy('lastAccessedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startedAt: doc.data().startedAt.toDate(),
        lastAccessedAt: doc.data().lastAccessedAt.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
        lastModified: doc.data().lastModified.toDate()
      })) as CourseProgress[];
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return [];
    }
  }

  async startCourse(userId: string, courseId: string): Promise<string> {
    try {
      // Check if course already started
      const existingQuery = query(
        collection(db, 'course_progress'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );

      const existingSnapshot = await getDocs(existingQuery);
      if (!existingSnapshot.empty) {
        return existingSnapshot.docs[0].id;
      }

      // Get course info
      const course = this.sampleCourses.find(c => c.id === courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Create new course progress
      const courseProgress: Omit<CourseProgress, 'id'> = {
        userId,
        courseId,
        courseTitle: course.title,
        progress: 0,
        isCompleted: false,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        timeSpent: 0,
        completedLessons: [],
        certificates: [],
        syncStatus: 'synced',
        lastModified: new Date(),
        version: 1
      };

      const docRef = await addDoc(collection(db, 'course_progress'), {
        ...courseProgress,
        startedAt: Timestamp.fromDate(courseProgress.startedAt),
        lastAccessedAt: Timestamp.fromDate(courseProgress.lastAccessedAt),
        completedAt: null,
        lastModified: Timestamp.fromDate(courseProgress.lastModified)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error starting course:', error);
      throw error;
    }
  }

  async updateLessonProgress(
    userId: string, 
    courseId: string, 
    moduleId: string, 
    lessonId: string, 
    timeSpent: number
  ): Promise<{ progressUpdated: boolean; courseCompleted: boolean; certificate?: Certificate }> {
    try {
      // Get current progress
      const progressQuery = query(
        collection(db, 'course_progress'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );

      const progressSnapshot = await getDocs(progressQuery);
      if (progressSnapshot.empty) {
        throw new Error('Course progress not found');
      }

      const progressDoc = progressSnapshot.docs[0];
      const progress = {
        id: progressDoc.id,
        ...progressDoc.data(),
        startedAt: progressDoc.data().startedAt.toDate(),
        lastAccessedAt: progressDoc.data().lastAccessedAt.toDate(),
        completedAt: progressDoc.data().completedAt?.toDate(),
        lastModified: progressDoc.data().lastModified.toDate()
      } as CourseProgress;

      // Get course info
      const course = this.sampleCourses.find(c => c.id === courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Update completed lessons if not already completed
      const lessonKey = `${moduleId}_${lessonId}`;
      let progressUpdated = false;
      
      if (!progress.completedLessons.includes(lessonKey)) {
        progress.completedLessons.push(lessonKey);
        progressUpdated = true;
      }

      // Update time spent
      progress.timeSpent += timeSpent;
      progress.lastAccessedAt = new Date();
      progress.lastModified = new Date();
      progress.version += 1;

      // Calculate total progress
      const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
      progress.progress = Math.round((progress.completedLessons.length / totalLessons) * 100);

      // Check if course is completed
      let courseCompleted = false;
      let certificate: Certificate | undefined;

      if (progress.progress === 100 && !progress.isCompleted) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
        courseCompleted = true;

        // Generate certificate
        certificate = await this.generateCertificate(userId, course, progress.timeSpent);
        progress.certificates = [certificate];
      }

      // Update progress in Firestore
      await updateDoc(progressDoc.ref, {
        ...progress,
        startedAt: Timestamp.fromDate(progress.startedAt),
        lastAccessedAt: Timestamp.fromDate(progress.lastAccessedAt),
        completedAt: progress.completedAt ? Timestamp.fromDate(progress.completedAt) : null,
        lastModified: Timestamp.fromDate(progress.lastModified)
      });

      return { progressUpdated, courseCompleted, certificate };
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw error;
    }
  }

  private async generateCertificate(userId: string, course: Course, timeSpent: number): Promise<Certificate> {
    const certificate: Certificate = {
      id: `cert_${Date.now()}_${Math.random()}`,
      courseId: course.id,
      userId,
      title: `Sertifikat Penyelesaian: ${course.title}`,
      description: `Sertifikat ini diberikan atas penyelesaian kursus ${course.title} dengan total waktu belajar ${Math.round(timeSpent / 60)} menit.`,
      issuedAt: new Date(),
      verificationCode: this.generateVerificationCode(),
      skills: course.skills,
      completionTime: timeSpent
    };

    // In a real implementation, you might generate a PDF certificate here
    // and upload it to Firebase Storage
    // certificate.certificateUrl = await this.generateCertificatePDF(certificate);

    return certificate;
  }

  private generateVerificationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async getCourseById(courseId: string): Promise<Course | null> {
    // In a real implementation, this would fetch from Firestore
    return this.sampleCourses.find(c => c.id === courseId) || null;
  }

  async getAvailableCourses(userId: string): Promise<Course[]> {
    try {
      // Get user's completed courses to filter prerequisites
      const userProgress = await this.getUserCourseProgress(userId);
      const completedCourses = new Set(
        userProgress
          .filter(p => p.isCompleted)
          .map(p => p.courseId)
      );

      // Filter courses based on prerequisites
      return this.sampleCourses.filter(course => {
        if (!course.prerequisites || course.prerequisites.length === 0) {
          return true;
        }
        
        return course.prerequisites.every(prereq => completedCourses.has(prereq));
      });
    } catch (error) {
      console.error('Error getting available courses:', error);
      return this.sampleCourses;
    }
  }

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      const courseProgresses = await this.getUserCourseProgress(userId);
      const certificates: Certificate[] = [];

      courseProgresses.forEach(progress => {
        certificates.push(...progress.certificates);
      });

      return certificates.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
    } catch (error) {
      console.error('Error getting user certificates:', error);
      return [];
    }
  }

  async getCourseStats(userId: string): Promise<{
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalCertificates: number;
    totalStudyTime: number; // in minutes
    averageProgress: number;
  }> {
    try {
      const [userProgress, certificates] = await Promise.all([
        this.getUserCourseProgress(userId),
        this.getUserCertificates(userId)
      ]);

      const completedCourses = userProgress.filter(p => p.isCompleted).length;
      const inProgressCourses = userProgress.filter(p => !p.isCompleted && p.progress > 0).length;
      const totalStudyTime = Math.round(
        userProgress.reduce((sum, p) => sum + p.timeSpent, 0) / 60
      );
      const averageProgress = userProgress.length > 0 
        ? Math.round(userProgress.reduce((sum, p) => sum + p.progress, 0) / userProgress.length)
        : 0;

      return {
        totalCourses: userProgress.length,
        completedCourses,
        inProgressCourses,
        totalCertificates: certificates.length,
        totalStudyTime,
        averageProgress
      };
    } catch (error) {
      console.error('Error getting course stats:', error);
      return {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalCertificates: 0,
        totalStudyTime: 0,
        averageProgress: 0
      };
    }
  }

  async searchCourses(query: string, category?: string, level?: string): Promise<Course[]> {
    let filtered = this.sampleCourses;

    if (category) {
      filtered = filtered.filter(course => course.category === category);
    }

    if (level) {
      filtered = filtered.filter(course => course.level === level);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(lowerQuery) ||
        course.description.toLowerCase().includes(lowerQuery) ||
        course.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  }

  // Method to be called when a meditation session is completed as part of a course
  async updateCourseFromSession(
    userId: string, 
    sessionId: string, 
    courseId?: string, 
    moduleId?: string, 
    lessonId?: string
  ): Promise<void> {
    if (!courseId || !moduleId || !lessonId) return;

    try {
      // This would typically be called from the meditation session completion
      await this.updateLessonProgress(userId, courseId, moduleId, lessonId, 600); // 10 minutes default
    } catch (error) {
      console.error('Error updating course from session:', error);
    }
  }
}

export const courseService = CourseService.getInstance();