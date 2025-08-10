import type { 
  MeditationSession, 
  Course, 
  AmbientSound, 
  GuidedScript,
  InstructorProfile
} from '../types/content';
import { ScriptBuilder } from './textToSpeechService';

export class SampleContentGenerator {
  
  /**
   * Generate comprehensive Indonesian meditation instructors with SIY expertise
   */
  generateInstructors(): InstructorProfile[] {
    return [
      {
        id: 'instructor_1',
        name: 'Ibu Sari Dewi',
        bio: 'Praktisi meditasi dengan pengalaman 15 tahun, mengajar mindfulness dalam bahasa Indonesia yang mudah dipahami.',
        profileImageUrl: '/images/instructors/sari-dewi.jpg',
        credentials: ['Certified Mindfulness Teacher', 'Traditional Indonesian Meditation Master'],
        specialties: ['jeda-pagi', 'pulang-diri', 'spiritual'],
        languages: ['id'],
        experience: '15 tahun mengajar meditasi di berbagai komunitas di Indonesia',
        socialLinks: {
          instagram: '@saridewi.mindful'
        },
        isVerified: true,
        rating: 4.8,
        totalSessions: 25,
        joinedAt: new Date('2020-01-15')
      },
      {
        id: 'instructor_2',
        name: 'Pak Budi Hartono',
        bio: 'Ahli meditasi napas dan relaksasi, memadukan teknik tradisional dengan pendekatan modern.',
        profileImageUrl: '/images/instructors/budi-hartono.jpg',
        credentials: ['Breathwork Specialist', 'Yoga Alliance RYT-500'],
        specialties: ['napas-hiruk', 'relaksasi', 'fokus-kerja'],
        languages: ['id', 'en'],
        experience: '10 tahun sebagai terapis holistik dan instruktur meditasi',
        socialLinks: {
          website: 'www.budihartono-meditation.com'
        },
        isVerified: true,
        rating: 4.7,
        totalSessions: 20,
        joinedAt: new Date('2021-03-20')
      },
      {
        id: 'instructor_3',
        name: 'Mbak Indira Putri',
        bio: 'Spesialis meditasi untuk ketenangan emosi dan tidur nyenyak, dengan suara yang menenangkan.',
        profileImageUrl: '/images/instructors/indira-putri.jpg',
        credentials: ['Sleep Meditation Specialist', 'Emotional Wellness Coach'],
        specialties: ['tidur-dalam', 'emosi', 'kecemasan'],
        languages: ['id'],
        experience: '8 tahun membantu ribuan orang mengatasi insomnia dan kecemasan',
        isVerified: true,
        rating: 4.9,
        totalSessions: 18,
        joinedAt: new Date('2021-08-10')
      },
      {
        id: 'instructor_4',
        name: 'Dr. Ravi Mindfulness',
        bio: 'Certified Search Inside Yourself teacher dan neuroscientist. Mengintegrasikan sains dengan praktik kontemplasi.',
        profileImageUrl: '/images/instructors/ravi-mindfulness.jpg',
        credentials: ['Search Inside Yourself Certified Teacher', 'Ph.D. Neuroscience', 'MBSR Instructor'],
        specialties: ['siy-attention', 'siy-awareness', 'siy-regulation', 'siy-empathy'],
        languages: ['id', 'en'],
        experience: '12 tahun research neuroscience meditasi dan 8 tahun mengajar SIY',
        socialLinks: {
          website: 'www.ravimindfulness.com',
          instagram: '@ravimindfulness'
        },
        isVerified: true,
        rating: 4.9,
        totalSessions: 35,
        joinedAt: new Date('2020-05-15')
      },
      {
        id: 'instructor_5',
        name: 'Mbak Dewi Cultural Wisdom',
        bio: 'Ahli meditasi berbasis budaya Indonesia. Mengintegrasikan kearifan lokal dengan praktik mindfulness modern.',
        profileImageUrl: '/images/instructors/dewi-cultural.jpg',
        credentials: ['Cultural Meditation Specialist', 'Indonesian Philosophy M.A.', 'Interfaith Dialogue Facilitator'],
        specialties: ['spiritual', 'siy-empathy', 'siy-social'],
        languages: ['id'],
        experience: '15 tahun mempelajari dan mengajar kearifan tradisional Indonesia',
        socialLinks: {
          instagram: '@dewibudaya'
        },
        isVerified: true,
        rating: 4.8,
        totalSessions: 28,
        joinedAt: new Date('2019-11-01')
      },
      {
        id: 'instructor_6',
        name: 'Pak Ahmad Workplace Mindfulness',
        bio: 'Executive coach dan leadership trainer. Spesialis menerapkan mindfulness di lingkungan kerja Indonesia.',
        profileImageUrl: '/images/instructors/ahmad-workplace.jpg',
        credentials: ['Executive Coach ICF', 'Leadership Development Specialist', 'Workplace Mindfulness Trainer'],
        specialties: ['siy-workplace', 'siy-social', 'fokus-kerja'],
        languages: ['id', 'en'],
        experience: '10 tahun sebagai executive coach di perusahaan multinasional',
        socialLinks: {
          website: 'www.mindfulleadership.id',
          instagram: '@ahmadworkplacemind'
        },
        isVerified: true,
        rating: 4.7,
        totalSessions: 22,
        joinedAt: new Date('2021-01-10')
      }
    ];
  }

  /**
   * Generate comprehensive meditation sessions with SIY content and enhanced diversity
   */
  generateMeditationSessions(): MeditationSession[] {
    const instructors = this.generateInstructors();
    const sessions: MeditationSession[] = [];

    // Add comprehensive SIY content
    sessions.push(...this.generateSIYSessions(instructors));
    sessions.push(...this.generateCulturalAdaptedSessions(instructors));
    sessions.push(...this.generateAdvancedSessions(instructors));
    sessions.push(...this.generateSeasonalContent(instructors));
    sessions.push(...this.generateSpecialtyContent(instructors));
    sessions.push(...this.generateInteractiveContent(instructors));

    // Jeda Pagi (Morning Break) Sessions
    sessions.push({
      id: 'session_jeda_pagi_1',
      title: 'Menyambut Fajar dengan Syukur',
      description: 'Memulai hari dengan rasa syukur dan niat positif. Sesi singkat untuk mengatur hati sebelum memulai aktivitas.',
      category: 'jeda-pagi',
      duration: 5,
      difficulty: 'pemula',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_jeda_pagi_1',
        title: 'Menyambut Fajar dengan Syukur',
        url: '/audio/sessions/jeda-pagi-syukur.mp3',
        duration: 300,
        fileSize: 4.8 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['pagi', 'syukur', 'niat', 'pemula'],
      thumbnailUrl: '/images/thumbnails/sunrise-gratitude.jpg',
      backgroundColor: '#FED7AA',
      isNew: true,
      isPremium: false,
      completionCount: 1250,
      averageRating: 4.8,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    });

    sessions.push({
      id: 'session_jeda_pagi_2',
      title: 'Napas Pagi yang Menyegarkan',
      description: 'Teknik pernapasan sederhana untuk membangkitkan energi dan fokus di pagi hari.',
      category: 'jeda-pagi',
      duration: 8,
      difficulty: 'pemula',
      instructor: instructors[1].name,
      audioFile: {
        id: 'audio_jeda_pagi_2',
        title: 'Napas Pagi yang Menyegarkan',
        url: '/audio/sessions/napas-pagi-segar.mp3',
        duration: 480,
        fileSize: 7.2 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['pernapasan', 'energi', 'fokus'],
      thumbnailUrl: '/images/thumbnails/morning-breath.jpg',
      backgroundColor: '#FEF3C7',
      completionCount: 980,
      averageRating: 4.6,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    });

    // Napas Hiruk (Breath in Chaos) Sessions
    sessions.push({
      id: 'session_napas_hiruk_1',
      title: 'Tenang di Tengah Kebisingan',
      description: 'Menemukan ketenangan internal meskipun berada di lingkungan yang bising dan sibuk.',
      category: 'napas-hiruk',
      duration: 10,
      difficulty: 'menengah',
      instructor: instructors[1].name,
      audioFile: {
        id: 'audio_napas_hiruk_1',
        title: 'Tenang di Tengah Kebisingan',
        url: '/audio/sessions/tenang-kebisingan.mp3',
        duration: 600,
        fileSize: 9.1 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['ketenangan', 'fokus', 'bising', 'kantor'],
      thumbnailUrl: '/images/thumbnails/calm-chaos.jpg',
      backgroundColor: '#BFDBFE',
      completionCount: 756,
      averageRating: 4.7,
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25')
    });

    // Pulang Diri (Return to Self) Sessions
    sessions.push({
      id: 'session_pulang_diri_1',
      title: 'Kembali ke Rumah Hati',
      description: 'Refleksi mendalam untuk kembali mengenal diri sendiri setelah hari yang panjang.',
      category: 'pulang-diri',
      duration: 15,
      difficulty: 'menengah',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_pulang_diri_1',
        title: 'Kembali ke Rumah Hati',
        url: '/audio/sessions/rumah-hati.mp3',
        duration: 900,
        fileSize: 13.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['refleksi', 'diri', 'hati', 'malam'],
      thumbnailUrl: '/images/thumbnails/return-home.jpg',
      backgroundColor: '#F3E8FF',
      isPremium: true,
      completionCount: 534,
      averageRating: 4.9,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    });

    // Tidur Dalam (Deep Sleep) Sessions
    sessions.push({
      id: 'session_tidur_dalam_1',
      title: 'Lelap dengan Hujan Malam',
      description: 'Meditasi tidur dengan suara hujan yang menenangkan untuk tidur yang lebih nyenyak.',
      category: 'tidur-dalam',
      duration: 20,
      difficulty: 'pemula',
      instructor: instructors[2].name,
      audioFile: {
        id: 'audio_tidur_dalam_1',
        title: 'Lelap dengan Hujan Malam',
        url: '/audio/sessions/tidur-hujan.mp3',
        duration: 1200,
        fileSize: 18 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['tidur', 'hujan', 'relaksasi', 'insomnia'],
      thumbnailUrl: '/images/thumbnails/rain-sleep.jpg',
      backgroundColor: '#C7D2FE',
      completionCount: 2100,
      averageRating: 4.8,
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-05')
    });

    // Fokus Kerja (Work Focus) Sessions
    sessions.push({
      id: 'session_fokus_kerja_1',
      title: 'Konsentrasi Maksimal 25 Menit',
      description: 'Meditasi untuk meningkatkan konsentrasi sebelum sesi kerja intensif menggunakan teknik Pomodoro.',
      category: 'fokus-kerja',
      duration: 5,
      difficulty: 'pemula',
      instructor: instructors[1].name,
      audioFile: {
        id: 'audio_fokus_kerja_1',
        title: 'Konsentrasi Maksimal 25 Menit',
        url: '/audio/sessions/fokus-pomodoro.mp3',
        duration: 300,
        fileSize: 4.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['produktivitas', 'konsentrasi', 'pomodoro', 'kerja'],
      thumbnailUrl: '/images/thumbnails/work-focus.jpg',
      backgroundColor: '#A7F3D0',
      completionCount: 1400,
      averageRating: 4.5,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10')
    });

    // Relaksasi (Relaxation) Sessions
    sessions.push({
      id: 'session_relaksasi_1',
      title: 'Lepaskan Ketegangan Tubuh',
      description: 'Relaksasi progresif untuk melepaskan ketegangan dari ujung kaki hingga kepala.',
      category: 'relaksasi',
      duration: 12,
      difficulty: 'pemula',
      instructor: instructors[1].name,
      audioFile: {
        id: 'audio_relaksasi_1',
        title: 'Lepaskan Ketegangan Tubuh',
        url: '/audio/sessions/relaksasi-progresif.mp3',
        duration: 720,
        fileSize: 10.8 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['relaksasi', 'ketegangan', 'tubuh', 'progresif'],
      thumbnailUrl: '/images/thumbnails/body-relaxation.jpg',
      backgroundColor: '#A7F3D0',
      completionCount: 890,
      averageRating: 4.6,
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    });

    // Kecemasan (Anxiety) Sessions
    sessions.push({
      id: 'session_kecemasan_1',
      title: 'Tenangkan Pikiran yang Gelisah',
      description: 'Teknik mindfulness untuk mengatasi kecemasan dan pikiran yang berputar-putar.',
      category: 'kecemasan',
      duration: 10,
      difficulty: 'menengah',
      instructor: instructors[2].name,
      audioFile: {
        id: 'audio_kecemasan_1',
        title: 'Tenangkan Pikiran yang Gelisah',
        url: '/audio/sessions/tenang-cemas.mp3',
        duration: 600,
        fileSize: 9 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['kecemasan', 'pikiran', 'mindfulness', 'gelisah'],
      thumbnailUrl: '/images/thumbnails/calm-anxiety.jpg',
      backgroundColor: '#DDD6FE',
      completionCount: 670,
      averageRating: 4.7,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20')
    });

    // Emosi (Emotions) Sessions
    sessions.push({
      id: 'session_emosi_1',
      title: 'Menerima dan Melepas Emosi',
      description: 'Belajar mengamati emosi tanpa menghakimi dan melepaskannya dengan bijaksana.',
      category: 'emosi',
      duration: 15,
      difficulty: 'lanjutan',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_emosi_1',
        title: 'Menerima dan Melepas Emosi',
        url: '/audio/sessions/emosi-lepas.mp3',
        duration: 900,
        fileSize: 13.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['emosi', 'penerimaan', 'pelepasan', 'bijaksana'],
      thumbnailUrl: '/images/thumbnails/emotional-release.jpg',
      backgroundColor: '#BFDBFE',
      isPremium: true,
      completionCount: 445,
      averageRating: 4.8,
      createdAt: new Date('2024-02-25'),
      updatedAt: new Date('2024-02-25')
    });

    // Spiritual Sessions
    sessions.push({
      id: 'session_spiritual_1',
      title: 'Bersatu dengan Alam Semesta',
      description: 'Meditasi spiritual untuk merasakan koneksi dengan alam semesta dan kehidupan yang lebih besar.',
      category: 'spiritual',
      duration: 25,
      difficulty: 'lanjutan',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_spiritual_1',
        title: 'Bersatu dengan Alam Semesta',
        url: '/audio/sessions/spiritual-alam.mp3',
        duration: 1500,
        fileSize: 22.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['spiritual', 'alam', 'koneksi', 'kesadaran'],
      thumbnailUrl: '/images/thumbnails/spiritual-universe.jpg',
      backgroundColor: '#E9D5FF',
      isPremium: true,
      completionCount: 280,
      averageRating: 4.9,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    });

    // Sort sessions by newest first
    return sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Generate Search Inside Yourself (SIY) specific sessions
   */
  private generateSIYSessions(instructors: InstructorProfile[]): MeditationSession[] {
    const siySessions: MeditationSession[] = [];

    // SIY Attention Training Sessions
    siySessions.push({
      id: 'siy_attention_1',
      title: 'SIY: Latihan Perhatian Dasar - Napas Sadar',
      description: 'Membangun fondasi perhatian melalui kesadaran napas. Langkah pertama dalam mengembangkan emotional intelligence.',
      category: 'siy-attention',
      duration: 12,
      difficulty: 'pemula',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_siy_attention_1',
        title: 'SIY: Latihan Perhatian Dasar',
        url: '/audio/siy/siy-attention-basic.mp3',
        duration: 720,
        fileSize: 10.8 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['siy', 'perhatian', 'napas', 'emotional-intelligence', 'dasar'],
      thumbnailUrl: '/images/thumbnails/siy-attention.jpg',
      backgroundColor: '#E0F2FE',
      isNew: true,
      isPremium: false,
      completionCount: 850,
      averageRating: 4.8,
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10')
    });

    siySessions.push({
      id: 'siy_attention_2',
      title: 'SIY: Meta-Perhatian - Kesadaran akan Kesadaran',
      description: 'Mengembangkan kemampuan untuk memperhatikan kualitas perhatian kita sendiri. Kunci untuk self-awareness.',
      category: 'siy-attention',
      duration: 15,
      difficulty: 'menengah',
      instructor: instructors[1].name,
      audioFile: {
        id: 'audio_siy_attention_2',
        title: 'SIY: Meta-Perhatian',
        url: '/audio/siy/siy-meta-attention.mp3',
        duration: 900,
        fileSize: 13.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['siy', 'meta-perhatian', 'kesadaran', 'self-awareness'],
      thumbnailUrl: '/images/thumbnails/siy-meta-attention.jpg',
      backgroundColor: '#F0F9FF',
      completionCount: 620,
      averageRating: 4.7,
      createdAt: new Date('2024-03-12'),
      updatedAt: new Date('2024-03-12')
    });

    // SIY Self-Awareness Sessions
    siySessions.push({
      id: 'siy_awareness_1',
      title: 'SIY: Kesadaran Tubuh Emosional',
      description: 'Belajar merasakan emosi melalui sensasi tubuh. Foundation untuk emotional intelligence.',
      category: 'siy-awareness',
      duration: 18,
      difficulty: 'menengah',
      instructor: instructors[2].name,
      audioFile: {
        id: 'audio_siy_awareness_1',
        title: 'SIY: Kesadaran Tubuh Emosional',
        url: '/audio/siy/siy-emotional-body.mp3',
        duration: 1080,
        fileSize: 16.2 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['siy', 'emosi', 'tubuh', 'kesadaran', 'self-awareness'],
      thumbnailUrl: '/images/thumbnails/siy-emotional-body.jpg',
      backgroundColor: '#FEF3E2',
      isPremium: true,
      completionCount: 480,
      averageRating: 4.9,
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15')
    });

    siySessions.push({
      id: 'siy_awareness_2',
      title: 'SIY: Pemetaan Nilai dan Tujuan Hidup',
      description: 'Refleksi mendalam untuk memahami nilai-nilai core dan tujuan hidup yang autentik.',
      category: 'siy-awareness',
      duration: 25,
      difficulty: 'lanjutan',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_siy_awareness_2',
        title: 'SIY: Pemetaan Nilai dan Tujuan',
        url: '/audio/siy/siy-values-mapping.mp3',
        duration: 1500,
        fileSize: 22.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['siy', 'nilai', 'tujuan', 'refleksi', 'autentik'],
      thumbnailUrl: '/images/thumbnails/siy-values.jpg',
      backgroundColor: '#F3E8FF',
      isPremium: true,
      completionCount: 320,
      averageRating: 4.9,
      createdAt: new Date('2024-03-18'),
      updatedAt: new Date('2024-03-18')
    });

    // SIY Self-Regulation Sessions
    siySessions.push({
      id: 'siy_regulation_1',
      title: 'SIY: Teknik STOP untuk Regulasi Emosi',
      description: 'Belajar teknik STOP (Stop, Take a breath, Observe, Proceed) untuk mengelola reaksi emosional.',
      category: 'siy-regulation',
      duration: 10,
      difficulty: 'pemula',
      instructor: instructors[1].name,
      audioFile: {
        id: 'audio_siy_regulation_1',
        title: 'SIY: Teknik STOP',
        url: '/audio/siy/siy-stop-technique.mp3',
        duration: 600,
        fileSize: 9 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['siy', 'stop', 'regulasi', 'emosi', 'praktis'],
      thumbnailUrl: '/images/thumbnails/siy-stop.jpg',
      backgroundColor: '#FEE2E2',
      completionCount: 950,
      averageRating: 4.6,
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-03-20')
    });

    siySessions.push({
      id: 'siy_regulation_2',
      title: 'SIY: Membangun Resiliensi Mental',
      description: 'Praktik untuk mengembangkan ketahanan mental dan kemampuan recovery dari stres.',
      category: 'siy-regulation',
      duration: 20,
      difficulty: 'menengah',
      instructor: instructors[2].name,
      audioFile: {
        id: 'audio_siy_regulation_2',
        title: 'SIY: Resiliensi Mental',
        url: '/audio/siy/siy-resilience.mp3',
        duration: 1200,
        fileSize: 18 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['siy', 'resiliensi', 'ketahanan', 'mental', 'recovery'],
      thumbnailUrl: '/images/thumbnails/siy-resilience.jpg',
      backgroundColor: '#DCFCE7',
      isPremium: true,
      completionCount: 580,
      averageRating: 4.8,
      createdAt: new Date('2024-03-22'),
      updatedAt: new Date('2024-03-22')
    });

    // SIY Empathy Development Sessions
    siySessions.push({
      id: 'siy_empathy_1',
      title: 'SIY: Loving-Kindness untuk Diri Sendiri',
      description: 'Mengembangkan kasih sayang pada diri sendiri sebagai fondasi empati yang sehat.',
      category: 'siy-empathy',
      duration: 15,
      difficulty: 'pemula',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_siy_empathy_1',
        title: 'SIY: Loving-Kindness Diri',
        url: '/audio/siy/siy-self-compassion.mp3',
        duration: 900,
        fileSize: 13.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['siy', 'loving-kindness', 'kasih-sayang', 'empati', 'diri'],
      thumbnailUrl: '/images/thumbnails/siy-self-compassion.jpg',
      backgroundColor: '#FDF2F8',
      completionCount: 720,
      averageRating: 4.7,
      createdAt: new Date('2024-03-25'),
      updatedAt: new Date('2024-03-25')
    });

    siySessions.push({
      id: 'siy_empathy_2',
      title: 'SIY: Empati Lintas Budaya Indonesia',
      description: 'Praktik empati yang mempertimbangkan keragaman budaya Indonesia. Memahami perspektif berbeda.',
      category: 'siy-empathy',
      duration: 22,
      difficulty: 'lanjutan',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_siy_empathy_2',
        title: 'SIY: Empati Lintas Budaya',
        url: '/audio/siy/siy-cultural-empathy.mp3',
        duration: 1320,
        fileSize: 19.8 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['siy', 'empati', 'budaya', 'indonesia', 'perspektif'],
      thumbnailUrl: '/images/thumbnails/siy-cultural-empathy.jpg',
      backgroundColor: '#F0FDF4',
      isPremium: true,
      completionCount: 380,
      averageRating: 4.9,
      createdAt: new Date('2024-03-28'),
      updatedAt: new Date('2024-03-28')
    });

    // SIY Social Skills Sessions
    siySessions.push({
      id: 'siy_social_1',
      title: 'SIY: Komunikasi Mindful dalam Budaya Indonesia',
      description: 'Menerapkan mindfulness dalam komunikasi dengan mempertimbangkan norma sosial Indonesia.',
      category: 'siy-social',
      duration: 16,
      difficulty: 'menengah',
      instructor: instructors[1].name,
      audioFile: {
        id: 'audio_siy_social_1',
        title: 'SIY: Komunikasi Mindful',
        url: '/audio/siy/siy-mindful-communication.mp3',
        duration: 960,
        fileSize: 14.4 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['siy', 'komunikasi', 'mindful', 'sosial', 'budaya'],
      thumbnailUrl: '/images/thumbnails/siy-communication.jpg',
      backgroundColor: '#E0F7FA',
      completionCount: 640,
      averageRating: 4.6,
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-04-01')
    });

    // SIY Happiness Sessions
    siySessions.push({
      id: 'siy_happiness_1',
      title: 'SIY: Kultivasi Kebahagiaan Berkelanjutan',
      description: 'Praktik-praktik untuk mengembangkan kebahagiaan yang autentik dan berkelanjutan.',
      category: 'siy-happiness',
      duration: 20,
      difficulty: 'menengah',
      instructor: instructors[2].name,
      audioFile: {
        id: 'audio_siy_happiness_1',
        title: 'SIY: Kebahagiaan Berkelanjutan',
        url: '/audio/siy/siy-sustainable-happiness.mp3',
        duration: 1200,
        fileSize: 18 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['siy', 'kebahagiaan', 'berkelanjutan', 'kultivasi', 'autentik'],
      thumbnailUrl: '/images/thumbnails/siy-happiness.jpg',
      backgroundColor: '#FFF9C4',
      isPremium: true,
      completionCount: 420,
      averageRating: 4.8,
      createdAt: new Date('2024-04-05'),
      updatedAt: new Date('2024-04-05')
    });

    // SIY Workplace Application Sessions
    siySessions.push({
      id: 'siy_workplace_1',
      title: 'SIY: Leadership Mindful di Lingkungan Kerja',
      description: 'Menerapkan prinsip SIY untuk kepemimpinan yang efektif dan penuh kesadaran.',
      category: 'siy-workplace',
      duration: 18,
      difficulty: 'lanjutan',
      instructor: instructors[1].name,
      audioFile: {
        id: 'audio_siy_workplace_1',
        title: 'SIY: Leadership Mindful',
        url: '/audio/siy/siy-mindful-leadership.mp3',
        duration: 1080,
        fileSize: 16.2 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['siy', 'leadership', 'kerja', 'mindful', 'kepemimpinan'],
      thumbnailUrl: '/images/thumbnails/siy-leadership.jpg',
      backgroundColor: '#F3E5F5',
      isPremium: true,
      completionCount: 290,
      averageRating: 4.9,
      createdAt: new Date('2024-04-08'),
      updatedAt: new Date('2024-04-08')
    });

    return siySessions;
  }

  /**
   * Generate culturally adapted sessions for Indonesian personas
   */
  private generateCulturalAdaptedSessions(instructors: InstructorProfile[]): MeditationSession[] {
    const culturalSessions: MeditationSession[] = [];

    // Islamic-adapted Sessions
    culturalSessions.push({
      id: 'cultural_islamic_1',
      title: 'Meditasi Islami: Dzikir dan Kontemplasi',
      description: 'Menggabungkan dzikir dengan teknik mindfulness untuk kedamaian spiritual yang mendalam.',
      category: 'spiritual',
      duration: 20,
      difficulty: 'menengah',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_cultural_islamic_1',
        title: 'Dzikir dan Kontemplasi',
        url: '/audio/cultural/islamic-dzikir-meditation.mp3',
        duration: 1200,
        fileSize: 18 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['islam', 'dzikir', 'spiritual', 'kontemplasi', 'religious'],
      thumbnailUrl: '/images/thumbnails/islamic-meditation.jpg',
      backgroundColor: '#E8F5E8',
      completionCount: 890,
      averageRating: 4.8,
      createdAt: new Date('2024-04-10'),
      updatedAt: new Date('2024-04-10')
    });

    culturalSessions.push({
      id: 'cultural_islamic_2',
      title: 'Shalat sebagai Meditasi Bergerak',
      description: 'Memahami dan merasakan dimensi meditatif dalam gerakan dan bacaan shalat.',
      category: 'spiritual',
      duration: 15,
      difficulty: 'pemula',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_cultural_islamic_2',
        title: 'Shalat Meditatif',
        url: '/audio/cultural/prayer-meditation.mp3',
        duration: 900,
        fileSize: 13.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['islam', 'shalat', 'prayer', 'spiritual', 'movement'],
      thumbnailUrl: '/images/thumbnails/prayer-meditation.jpg',
      backgroundColor: '#F0F9FF',
      completionCount: 1200,
      averageRating: 4.9,
      createdAt: new Date('2024-04-12'),
      updatedAt: new Date('2024-04-12')
    });

    // Javanese Cultural Sessions
    culturalSessions.push({
      id: 'cultural_javanese_1',
      title: 'Semedi Jawa: Keheningan yang Bermakna',
      description: 'Praktik meditasi tradisional Jawa dengan fokus pada keheningan batin dan kebijaksanaan.',
      category: 'spiritual',
      duration: 25,
      difficulty: 'lanjutan',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_cultural_javanese_1',
        title: 'Semedi Jawa',
        url: '/audio/cultural/javanese-semedi.mp3',
        duration: 1500,
        fileSize: 22.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['jawa', 'semedi', 'tradisional', 'kebijaksanaan', 'keheningan'],
      thumbnailUrl: '/images/thumbnails/javanese-meditation.jpg',
      backgroundColor: '#FEF7CD',
      isPremium: true,
      completionCount: 340,
      averageRating: 4.9,
      createdAt: new Date('2024-04-15'),
      updatedAt: new Date('2024-04-15')
    });

    culturalSessions.push({
      id: 'cultural_javanese_2',
      title: 'Filosofi Jawa dalam Kehidupan Sehari-hari',
      description: 'Menerapkan prinsip-prinsip kebijaksanaan Jawa seperti "nrimo" dan "sabar" dalam praktik mindfulness.',
      category: 'pulang-diri',
      duration: 18,
      difficulty: 'menengah',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_cultural_javanese_2',
        title: 'Filosofi Jawa Mindfulness',
        url: '/audio/cultural/javanese-philosophy.mp3',
        duration: 1080,
        fileSize: 16.2 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['jawa', 'filosofi', 'nrimo', 'sabar', 'mindfulness'],
      thumbnailUrl: '/images/thumbnails/javanese-philosophy.jpg',
      backgroundColor: '#F5F3FF',
      completionCount: 520,
      averageRating: 4.7,
      createdAt: new Date('2024-04-18'),
      updatedAt: new Date('2024-04-18')
    });

    // Balinese Cultural Sessions
    culturalSessions.push({
      id: 'cultural_balinese_1',
      title: 'Tri Hita Karana: Harmoni dengan Alam, Sesama, dan Tuhan',
      description: 'Meditasi berdasarkan filosofi Bali tentang keharmonisan dalam tiga hubungan fundamental.',
      category: 'spiritual',
      duration: 22,
      difficulty: 'menengah',
      instructor: instructors[2].name,
      audioFile: {
        id: 'audio_cultural_balinese_1',
        title: 'Tri Hita Karana',
        url: '/audio/cultural/balinese-harmony.mp3',
        duration: 1320,
        fileSize: 19.8 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['bali', 'tri-hita-karana', 'harmoni', 'alam', 'spiritual'],
      thumbnailUrl: '/images/thumbnails/balinese-harmony.jpg',
      backgroundColor: '#E0F2F1',
      isPremium: true,
      completionCount: 410,
      averageRating: 4.8,
      createdAt: new Date('2024-04-20'),
      updatedAt: new Date('2024-04-20')
    });

    // Minangkabau Cultural Sessions
    culturalSessions.push({
      id: 'cultural_minangkabau_1',
      title: 'Kearifan Minangkabau: Silaturahmi dan Gotong Royong',
      description: 'Meditasi berdasarkan nilai-nilai luhur budaya Minangkabau tentang kekeluargaan dan kebersamaan.',
      category: 'spiritual',
      duration: 18,
      difficulty: 'menengah',
      instructor: instructors[4].name,
      audioFile: {
        id: 'audio_cultural_minangkabau_1',
        title: 'Kearifan Minangkabau',
        url: '/audio/cultural/minangkabau-wisdom.mp3',
        duration: 1080,
        fileSize: 16.2 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['minangkabau', 'silaturahmi', 'gotong-royong', 'keluarga', 'kebijaksanaan'],
      thumbnailUrl: '/images/thumbnails/minangkabau-meditation.jpg',
      backgroundColor: '#FEF3E2',
      completionCount: 320,
      averageRating: 4.7,
      createdAt: new Date('2024-05-01'),
      updatedAt: new Date('2024-05-01')
    });

    return culturalSessions;
  }

  /**
   * Generate advanced and specialized sessions
   */
  private generateAdvancedSessions(instructors: InstructorProfile[]): MeditationSession[] {
    const advancedSessions: MeditationSession[] = [];

    // Advanced Breathing Techniques
    advancedSessions.push({
      id: 'advanced_breathing_1',
      title: 'Teknik Napas 4-7-8 untuk Sistem Saraf',
      description: 'Teknik pernapasan lanjutan untuk mengaktifkan respons relaksasi sistem saraf parasimpatik.',
      category: 'napas-hiruk',
      duration: 12,
      difficulty: 'lanjutan',
      instructor: instructors[1].name,
      audioFile: {
        id: 'audio_advanced_breathing_1',
        title: 'Teknik Napas 4-7-8',
        url: '/audio/advanced/breathing-4-7-8.mp3',
        duration: 720,
        fileSize: 10.8 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['napas', '4-7-8', 'sistem-saraf', 'parasimpatik', 'lanjutan'],
      thumbnailUrl: '/images/thumbnails/advanced-breathing.jpg',
      backgroundColor: '#E1F5FE',
      isPremium: true,
      completionCount: 280,
      averageRating: 4.6,
      createdAt: new Date('2024-04-22'),
      updatedAt: new Date('2024-04-22')
    });

    // Trauma-Informed Practices
    advancedSessions.push({
      id: 'trauma_informed_1',
      title: 'Healing Trauma dengan Mindfulness',
      description: 'Praktik mindfulness yang aman dan trauma-informed untuk penyembuhan emosional.',
      category: 'emosi',
      duration: 30,
      difficulty: 'lanjutan',
      instructor: instructors[2].name,
      audioFile: {
        id: 'audio_trauma_informed_1',
        title: 'Healing Trauma Mindfulness',
        url: '/audio/advanced/trauma-healing.mp3',
        duration: 1800,
        fileSize: 27 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['trauma', 'healing', 'penyembuhan', 'emosi', 'aman'],
      thumbnailUrl: '/images/thumbnails/trauma-healing.jpg',
      backgroundColor: '#FDF2F8',
      isPremium: true,
      completionCount: 150,
      averageRating: 4.9,
      createdAt: new Date('2024-04-25'),
      updatedAt: new Date('2024-04-25')
    });

    // Extended Practice Sessions
    advancedSessions.push({
      id: 'extended_practice_1',
      title: 'Retreat Mini: 45 Menit Meditasi Mendalam',
      description: 'Sesi meditasi extended untuk praktisi yang sudah berpengalaman. Kombinasi berbagai teknik.',
      category: 'spiritual',
      duration: 45,
      difficulty: 'lanjutan',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_extended_practice_1',
        title: 'Retreat Mini 45 Menit',
        url: '/audio/advanced/mini-retreat-45min.mp3',
        duration: 2700,
        fileSize: 40.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['retreat', 'extended', 'mendalam', '45-menit', 'lanjutan'],
      thumbnailUrl: '/images/thumbnails/mini-retreat.jpg',
      backgroundColor: '#F3E5F5',
      isPremium: true,
      completionCount: 95,
      averageRating: 4.9,
      createdAt: new Date('2024-04-28'),
      updatedAt: new Date('2024-04-28')
    });

    return advancedSessions;
  }

  /**
   * Generate seasonal and event-based content
   */
  private generateSeasonalContent(instructors: InstructorProfile[]): MeditationSession[] {
    const seasonalSessions: MeditationSession[] = [];

    // Ramadan Special Content
    seasonalSessions.push({
      id: 'seasonal_ramadan_1',
      title: 'Meditasi Ramadan: Refleksi dan Kontemplasi',
      description: 'Meditasi khusus untuk bulan suci Ramadan, menggabungkan nilai-nilai spiritual Islam dengan praktik mindfulness.',
      category: 'spiritual',
      duration: 15,
      difficulty: 'menengah',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_seasonal_ramadan_1',
        title: 'Meditasi Ramadan',
        url: '/audio/seasonal/ramadan-reflection.mp3',
        duration: 900,
        fileSize: 13.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['ramadan', 'islam', 'spiritual', 'puasa', 'refleksi'],
      thumbnailUrl: '/images/thumbnails/ramadan-meditation.jpg',
      backgroundColor: '#E8F5E8',
      isNew: true,
      completionCount: 650,
      averageRating: 4.9,
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15')
    });

    // New Year Intention Setting
    seasonalSessions.push({
      id: 'seasonal_newyear_1',
      title: 'Niat Tahun Baru: Merancang Perjalanan Hidup',
      description: 'Meditasi untuk merefleksikan tahun yang telah berlalu dan menetapkan niat positif untuk tahun mendatang.',
      category: 'pulang-diri',
      duration: 20,
      difficulty: 'menengah',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_seasonal_newyear_1',
        title: 'Niat Tahun Baru',
        url: '/audio/seasonal/new-year-intention.mp3',
        duration: 1200,
        fileSize: 18 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['tahun-baru', 'niat', 'refleksi', 'planning'],
      thumbnailUrl: '/images/thumbnails/new-year-intention.jpg',
      backgroundColor: '#FEF3C7',
      completionCount: 450,
      averageRating: 4.7,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    });

    // Indonesia Independence Day
    seasonalSessions.push({
      id: 'seasonal_independence_1',
      title: 'Meditasi Kemerdekaan: Syukur dan Patriotisme',
      description: 'Refleksi mendalam tentang makna kemerdekaan dan rasa syukur sebagai bangsa Indonesia.',
      category: 'spiritual',
      duration: 17,
      difficulty: 'pemula',
      instructor: instructors[4].name,
      audioFile: {
        id: 'audio_seasonal_independence_1',
        title: 'Meditasi Kemerdekaan',
        url: '/audio/seasonal/independence-gratitude.mp3',
        duration: 1020,
        fileSize: 15.3 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['kemerdekaan', 'indonesia', 'patriotisme', 'syukur'],
      thumbnailUrl: '/images/thumbnails/independence-meditation.jpg',
      backgroundColor: '#FEE2E2',
      completionCount: 380,
      averageRating: 4.8,
      createdAt: new Date('2024-08-17'),
      updatedAt: new Date('2024-08-17')
    });

    return seasonalSessions;
  }

  /**
   * Generate specialty content for specific needs
   */
  private generateSpecialtyContent(instructors: InstructorProfile[]): MeditationSession[] {
    const specialtySessions: MeditationSession[] = [];

    // Pregnancy and Motherhood
    specialtySessions.push({
      id: 'specialty_pregnancy_1',
      title: 'Meditasi Kehamilan: Bonding dengan Sang Buah Hati',
      description: 'Meditasi khusus untuk ibu hamil, menciptakan koneksi emosional dengan janin dan mengurangi kecemasan.',
      category: 'emosi',
      duration: 18,
      difficulty: 'pemula',
      instructor: instructors[2].name,
      audioFile: {
        id: 'audio_specialty_pregnancy_1',
        title: 'Meditasi Kehamilan',
        url: '/audio/specialty/pregnancy-bonding.mp3',
        duration: 1080,
        fileSize: 16.2 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['kehamilan', 'bonding', 'ibu', 'janin', 'kecemasan'],
      thumbnailUrl: '/images/thumbnails/pregnancy-meditation.jpg',
      backgroundColor: '#FDF2F8',
      isPremium: true,
      completionCount: 220,
      averageRating: 4.9,
      createdAt: new Date('2024-04-10'),
      updatedAt: new Date('2024-04-10')
    });

    // Senior Citizens
    specialtySessions.push({
      id: 'specialty_seniors_1',
      title: 'Meditasi Usia Emas: Kebijaksanaan dan Ketenangan',
      description: 'Praktik meditasi yang disesuaikan untuk lansia, fokus pada penerimaan, kebijaksanaan, dan kedamaian batin.',
      category: 'spiritual',
      duration: 22,
      difficulty: 'pemula',
      instructor: instructors[0].name,
      audioFile: {
        id: 'audio_specialty_seniors_1',
        title: 'Meditasi Usia Emas',
        url: '/audio/specialty/seniors-wisdom.mp3',
        duration: 1320,
        fileSize: 19.8 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['lansia', 'kebijaksanaan', 'penerimaan', 'kedamaian'],
      thumbnailUrl: '/images/thumbnails/seniors-meditation.jpg',
      backgroundColor: '#F0FDF4',
      completionCount: 180,
      averageRating: 4.8,
      createdAt: new Date('2024-04-20'),
      updatedAt: new Date('2024-04-20')
    });

    // Students and Academic Stress
    specialtySessions.push({
      id: 'specialty_students_1',
      title: 'Meditasi Pelajar: Fokus dan Mengatasi Stres Ujian',
      description: 'Khusus untuk siswa dan mahasiswa, membantu meningkatkan konsentrasi dan mengurangi kecemasan saat ujian.',
      category: 'fokus-kerja',
      duration: 12,
      difficulty: 'pemula',
      instructor: instructors[1].name,
      audioFile: {
        id: 'audio_specialty_students_1',
        title: 'Meditasi Pelajar',
        url: '/audio/specialty/student-focus.mp3',
        duration: 720,
        fileSize: 10.8 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['pelajar', 'ujian', 'konsentrasi', 'stres-akademik'],
      thumbnailUrl: '/images/thumbnails/student-meditation.jpg',
      backgroundColor: '#E0F7FA',
      completionCount: 890,
      averageRating: 4.6,
      createdAt: new Date('2024-05-01'),
      updatedAt: new Date('2024-05-01')
    });

    return specialtySessions;
  }

  /**
   * Generate interactive and gamified content
   */
  private generateInteractiveContent(instructors: InstructorProfile[]): MeditationSession[] {
    const interactiveSessions: MeditationSession[] = [];

    // Breathing Challenge
    interactiveSessions.push({
      id: 'interactive_breathing_1',
      title: 'Tantangan Napas 21 Hari: Perjalanan Transformasi',
      description: 'Program interaktif 21 hari dengan berbagai teknik pernapasan yang progressif dan trackable.',
      category: 'napas-hiruk',
      duration: 14,
      difficulty: 'menengah',
      instructor: instructors[1].name,
      audioFile: {
        id: 'audio_interactive_breathing_1',
        title: 'Tantangan Napas 21 Hari',
        url: '/audio/interactive/21-day-breathing.mp3',
        duration: 840,
        fileSize: 12.6 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['tantangan', '21-hari', 'napas', 'tracking', 'progressive'],
      thumbnailUrl: '/images/thumbnails/breathing-challenge.jpg',
      backgroundColor: '#E1F5FE',
      isNew: true,
      isPremium: true,
      completionCount: 1200,
      averageRating: 4.7,
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-05-15')
    });

    // Mindful Storytelling
    interactiveSessions.push({
      id: 'interactive_story_1',
      title: 'Cerita Interaktif: Petualangan Kesadaran',
      description: 'Meditasi naratif interaktif di mana Anda menjadi bagian dari cerita dan membuat pilihan mindful.',
      category: 'pulang-diri',
      duration: 25,
      difficulty: 'menengah',
      instructor: instructors[2].name,
      audioFile: {
        id: 'audio_interactive_story_1',
        title: 'Petualangan Kesadaran',
        url: '/audio/interactive/mindful-story.mp3',
        duration: 1500,
        fileSize: 22.5 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['interaktif', 'cerita', 'pilihan', 'naratif'],
      thumbnailUrl: '/images/thumbnails/interactive-story.jpg',
      backgroundColor: '#F3E5F5',
      isPremium: true,
      completionCount: 340,
      averageRating: 4.8,
      createdAt: new Date('2024-05-20'),
      updatedAt: new Date('2024-05-20')
    });

    // Virtual Nature Walk
    interactiveSessions.push({
      id: 'interactive_nature_1',
      title: 'Jalan Virtual di Alam Indonesia',
      description: 'Meditasi berjalan virtual melalui keindahan alam Indonesia dengan soundscape yang realistis.',
      category: 'spiritual',
      duration: 30,
      difficulty: 'pemula',
      instructor: instructors[4].name,
      audioFile: {
        id: 'audio_interactive_nature_1',
        title: 'Jalan Virtual Alam',
        url: '/audio/interactive/virtual-nature-walk.mp3',
        duration: 1800,
        fileSize: 27 * 1024 * 1024,
        format: 'mp3'
      },
      tags: ['virtual', 'alam', 'jalan', 'indonesia', 'soundscape'],
      thumbnailUrl: '/images/thumbnails/virtual-nature.jpg',
      backgroundColor: '#F0FDF4',
      completionCount: 680,
      averageRating: 4.9,
      createdAt: new Date('2024-05-25'),
      updatedAt: new Date('2024-05-25')
    });

    return interactiveSessions;
  }

  /**
   * Generate comprehensive courses including full SIY program
   */
  generateCourses(): Course[] {
    const instructors = this.generateInstructors();
    
    return [
      {
        id: 'course_pemula_1',
        title: 'Meditasi untuk Pemula: 7 Hari Menuju Ketenangan',
        description: 'Kursus komprehensif untuk memulai perjalanan meditasi Anda',
        longDescription: 'Dalam 7 hari, Anda akan belajar dasar-dasar meditasi mindfulness, teknik pernapasan, dan cara menciptakan rutinitas meditasi harian yang berkelanjutan. Setiap sesi dirancang khusus untuk pemula dengan guidance yang jelas dan praktis.',
        category: 'jeda-pagi',
        difficulty: 'pemula',
        instructor: instructors[0].name,
        sessions: ['session_jeda_pagi_1', 'session_jeda_pagi_2', 'session_relaksasi_1'],
        estimatedDuration: 75,
        thumbnailUrl: '/images/courses/beginner-meditation.jpg',
        backgroundImageUrl: '/images/courses/bg-beginner.jpg',
        tags: ['pemula', 'dasar', '7-hari', 'rutinitas'],
        objectives: [
          'Memahami prinsip dasar meditasi mindfulness',
          'Menguasai teknik pernapasan yang benar',
          'Membuat rutinitas meditasi harian',
          'Mengatasi hambatan umum dalam meditasi'
        ],
        isPremium: false,
        completionRate: 78,
        enrollmentCount: 3200,
        averageRating: 4.7,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: 'course_tidur_1',
        title: 'Program Tidur Nyenyak: 14 Hari Mengatasi Insomnia',
        description: 'Program komprehensif untuk mengatasi masalah tidur dengan meditasi',
        longDescription: 'Program 14 hari yang dirancang khusus untuk mengatasi insomnia dan meningkatkan kualitas tidur. Kombinasi teknik relaksasi, meditasi tidur, dan sleep hygiene dalam bahasa Indonesia yang mudah dipahami.',
        category: 'tidur-dalam',
        difficulty: 'menengah',
        instructor: instructors[2].name,
        sessions: ['session_tidur_dalam_1', 'session_relaksasi_1'],
        estimatedDuration: 210,
        thumbnailUrl: '/images/courses/sleep-program.jpg',
        backgroundImageUrl: '/images/courses/bg-sleep.jpg',
        tags: ['tidur', 'insomnia', '14-hari', 'kualitas'],
        objectives: [
          'Mengatasi insomnia dan masalah tidur',
          'Menciptakan rutinitas tidur yang sehat',
          'Menguasai teknik relaksasi untuk tidur',
          'Meningkatkan kualitas tidur secara alami'
        ],
        isPremium: true,
        completionRate: 85,
        enrollmentCount: 1800,
        averageRating: 4.9,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      },
      {
        id: 'course_siy_foundation',
        title: 'Search Inside Yourself: Foundation Program',
        description: 'Program lengkap SIY untuk mengembangkan emotional intelligence',
        longDescription: 'Program 8 minggu yang komprehensif berdasarkan kurikulum Search Inside Yourself dari Google. Mengembangkan attention, self-awareness, self-regulation, empathy, dan social skills melalui praktik mindfulness yang terbukti secara ilmiah.',
        category: 'siy-attention',
        difficulty: 'menengah',
        instructor: instructors[3].name, // Dr. Ravi Mindfulness
        sessions: [
          'siy_attention_1', 'siy_attention_2', 
          'siy_awareness_1', 'siy_awareness_2',
          'siy_regulation_1', 'siy_regulation_2',
          'siy_empathy_1', 'siy_empathy_2',
          'siy_social_1', 'siy_happiness_1'
        ],
        estimatedDuration: 480, // 8 hours total
        thumbnailUrl: '/images/courses/siy-foundation.jpg',
        backgroundImageUrl: '/images/courses/bg-siy-foundation.jpg',
        tags: ['siy', 'emotional-intelligence', '8-minggu', 'google', 'mindfulness'],
        objectives: [
          'Mengembangkan keterampilan perhatian dan fokus',
          'Meningkatkan kesadaran diri dan emosional',
          'Belajar meregulasi emosi dengan efektif',
          'Mengembangkan empati dan keterampilan sosial',
          'Menerapkan SIY di lingkungan kerja dan personal'
        ],
        isPremium: true,
        completionRate: 78,
        enrollmentCount: 2400,
        averageRating: 4.8,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01')
      },
      {
        id: 'course_cultural_wisdom',
        title: 'Kearifan Budaya Indonesia dalam Mindfulness',
        description: 'Mengintegrasikan nilai-nilai budaya Indonesia dengan praktik mindfulness',
        longDescription: 'Program 6 minggu yang mengeksplorasi kearifan tradisional Indonesia dan mengintegrasikannya dengan praktik mindfulness modern. Mencakup perspektif Islam, Jawa, Bali, dan budaya Nusantara lainnya.',
        category: 'spiritual',
        difficulty: 'menengah',
        instructor: instructors[4].name, // Mbak Dewi Cultural Wisdom
        sessions: [
          'cultural_islamic_1', 'cultural_islamic_2',
          'cultural_javanese_1', 'cultural_javanese_2',
          'cultural_balinese_1', 'cultural_minangkabau_1'
        ],
        estimatedDuration: 360, // 6 hours total
        thumbnailUrl: '/images/courses/cultural-wisdom.jpg',
        backgroundImageUrl: '/images/courses/bg-cultural.jpg',
        tags: ['budaya', 'indonesia', 'kearifan', 'tradisional', 'nusantara'],
        objectives: [
          'Memahami kearifan tradisional Indonesia',
          'Mengintegrasikan nilai budaya dengan mindfulness',
          'Menghargai keragaman spiritual Nusantara',
          'Mengembangkan identitas spiritual yang autentik',
          'Membangun jembatan antara tradisi dan modernitas'
        ],
        isPremium: true,
        completionRate: 82,
        enrollmentCount: 1600,
        averageRating: 4.9,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },
      {
        id: 'course_workplace_mindfulness',
        title: 'Mindful Leadership untuk Pemimpin Indonesia',
        description: 'Program khusus untuk mengembangkan kepemimpinan mindful di konteks budaya Indonesia',
        longDescription: 'Program 10 minggu untuk para pemimpin yang ingin mengembangkan keterampilan kepemimpinan dengan basis mindfulness. Disesuaikan dengan konteks budaya dan tantangan kepemimpinan di Indonesia.',
        category: 'siy-workplace',
        difficulty: 'lanjutan',
        instructor: instructors[5].name, // Pak Ahmad Workplace Mindfulness
        sessions: [
          'siy_workplace_1', 'siy_regulation_2',
          'siy_social_1', 'siy_empathy_2'
        ],
        estimatedDuration: 600, // 10 hours total
        thumbnailUrl: '/images/courses/mindful-leadership.jpg',
        backgroundImageUrl: '/images/courses/bg-leadership.jpg',
        tags: ['leadership', 'kepemimpinan', 'workplace', 'mindful', 'indonesia'],
        objectives: [
          'Mengembangkan self-awareness sebagai pemimpin',
          'Belajar komunikasi yang efektif dan empatis',
          'Mengelola konflik dengan pendekatan mindful',
          'Membangun tim yang harmonis dan produktif',
          'Mengintegrasikan nilai budaya Indonesia dalam kepemimpinan'
        ],
        isPremium: true,
        completionRate: 75,
        enrollmentCount: 890,
        averageRating: 4.7,
        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-04-01')
      },
      {
        id: 'course_advanced_practice',
        title: 'Praktik Lanjutan: Deepening Your Practice',
        description: 'Program untuk praktisi berpengalaman yang ingin memperdalam praktik meditasi',
        longDescription: 'Program 12 minggu untuk praktisi yang sudah memiliki fondasi kuat dalam meditasi. Mencakup praktik-praktik lanjutan, retreat mini, dan pengembangan spiritual yang mendalam.',
        category: 'spiritual',
        difficulty: 'lanjutan',
        instructor: instructors[0].name, // Ibu Sari Dewi
        sessions: [
          'advanced_breathing_1', 'trauma_informed_1',
          'extended_practice_1', 'session_spiritual_1'
        ],
        estimatedDuration: 720, // 12 hours total
        thumbnailUrl: '/images/courses/advanced-practice.jpg',
        backgroundImageUrl: '/images/courses/bg-advanced.jpg',
        tags: ['lanjutan', 'deepening', 'spiritual', 'advanced', 'retreat'],
        objectives: [
          'Memperdalam kualitas kesadaran dalam meditasi',
          'Mengeksplorasi dimensi spiritual yang lebih dalam',
          'Mengintegrasikan praktik dalam kehidupan sehari-hari',
          'Mengembangkan kemampuan guidance untuk orang lain',
          'Memahami aspek terapeutik dari meditasi'
        ],
        isPremium: true,
        completionRate: 68,
        enrollmentCount: 450,
        averageRating: 4.9,
        createdAt: new Date('2024-04-15'),
        updatedAt: new Date('2024-04-15')
      }
    ];
  }

  /**
   * Generate ambient sounds
   */
  generateAmbientSounds(): AmbientSound[] {
    return [
      {
        id: 'ambient_hujan_1',
        name: 'Hujan Tropis Indonesia',
        description: 'Suara hujan tropis yang tenang, direkam di hutan Indonesia',
        icon: '🌧️',
        audioFile: {
          id: 'audio_ambient_hujan_1',
          title: 'Hujan Tropis Indonesia',
          url: '/audio/ambient/hujan-tropis.mp3',
          duration: 3600, // 1 hour loop
          fileSize: 54 * 1024 * 1024,
          format: 'mp3'
        },
        category: 'nature',
        tags: ['hujan', 'tropis', 'alam', 'tidur'],
        isPremium: false
      },
      {
        id: 'ambient_laut_1',
        name: 'Ombak Pantai Bali',
        description: 'Suara ombak yang menenangkan dari pantai-pantai indah Bali',
        icon: '🌊',
        audioFile: {
          id: 'audio_ambient_laut_1',
          title: 'Ombak Pantai Bali',
          url: '/audio/ambient/ombak-bali.mp3',
          duration: 3600,
          fileSize: 52 * 1024 * 1024,
          format: 'mp3'
        },
        category: 'nature',
        tags: ['laut', 'ombak', 'bali', 'pantai'],
        isPremium: false
      },
      {
        id: 'ambient_hutan_1',
        name: 'Hutan Pagi Jawa',
        description: 'Suara burung dan alam hutan di pagi hari',
        icon: '🌲',
        audioFile: {
          id: 'audio_ambient_hutan_1',
          title: 'Hutan Pagi Jawa',
          url: '/audio/ambient/hutan-pagi.mp3',
          duration: 3600,
          fileSize: 58 * 1024 * 1024,
          format: 'mp3'
        },
        category: 'nature',
        tags: ['hutan', 'burung', 'pagi', 'jawa'],
        isPremium: true
      },
      {
        id: 'ambient_gamelan_1',
        name: 'Gamelan Meditasi',
        description: 'Nada-nada gamelan yang lembut untuk meditasi mendalam',
        icon: '🎵',
        audioFile: {
          id: 'audio_ambient_gamelan_1',
          title: 'Gamelan Meditasi',
          url: '/audio/ambient/gamelan-meditasi.mp3',
          duration: 2400, // 40 minutes
          fileSize: 36 * 1024 * 1024,
          format: 'mp3'
        },
        category: 'instrumental',
        tags: ['gamelan', 'tradisional', 'indonesia', 'budaya'],
        isPremium: true
      },
      {
        id: 'ambient_kota_1',
        name: 'Kafe Jakarta Sore',
        description: 'Suasana kafe di Jakarta dengan percakapan lembut dan musik background',
        icon: '☕',
        audioFile: {
          id: 'audio_ambient_kota_1',
          title: 'Kafe Jakarta Sore',
          url: '/audio/ambient/kafe-jakarta.mp3',
          duration: 3600,
          fileSize: 55 * 1024 * 1024,
          format: 'mp3'
        },
        category: 'urban',
        tags: ['kafe', 'jakarta', 'kota', 'fokus'],
        isPremium: false
      }
    ];
  }

  /**
   * Generate guided scripts for sessions
   */
  generateGuidedScripts(): GuidedScript[] {
    const scriptBuilder = new ScriptBuilder();
    const scripts: GuidedScript[] = [];

    // Script for morning gratitude session
    const morningScript = scriptBuilder
      .clear()
      .addInstruction('Selamat pagi, selamat datang di sesi meditasi pagi hari.')
      .addInstruction('Duduklah dengan nyaman, punggung tegak, mata perlahan tertutup.')
      .addPause(3000)
      .addBreathing('Tarik napas dalam-dalam... dan hembuskan perlahan.')
      .addBreathing('Sekali lagi, tarik napas... rasakan udara segar masuk ke paru-paru.')
      .addPause(2000)
      .addInstruction('Sekarang, mari kita mulai dengan rasa syukur.')
      .addInstruction('Pikirkan tiga hal yang Anda syukuri hari ini.')
      .addPause(10000)
      .addInstruction('Rasakan kehangatan rasa syukur mengalir di dalam hati.')
      .addVisualization('Bayangkan cahaya hangat menyinari hari Anda.')
      .addPause(5000)
      .addInstruction('Niatkan hari ini dengan penuh kesadaran dan kebaikan.')
      .addPause(3000)
      .addInstruction('Perlahan, buka mata Anda. Selamat menjalani hari!')
      .build('session_jeda_pagi_1');

    scripts.push(morningScript);

    // Script for breath in chaos session
    const chaosScript = scriptBuilder
      .clear()
      .addInstruction('Mari kita temukan ketenangan di tengah hiruk pikuk kehidupan.')
      .addInstruction('Tidak peduli di mana Anda berada, fokuslah pada suara ini.')
      .addPause(2000)
      .addBreathing('Mulai dengan napas yang tenang dan teratur.')
      .addBreathing('Tarik napas selama 4 hitungan... 1, 2, 3, 4.')
      .addBreathing('Tahan sejenak... lalu hembuskan selama 6 hitungan.')
      .addPause(3000)
      .addInstruction('Sekarang, perhatikan suara-suara di sekitar Anda.')
      .addInstruction('Jangan melawan atau menolaknya. Terimalah sebagai bagian dari kehidupan.')
      .addPause(5000)
      .addVisualization('Bayangkan diri Anda seperti batu karang di tengah ombak.')
      .addVisualization('Ombak datang dan pergi, namun Anda tetap kokoh dan tenang.')
      .addPause(8000)
      .addInstruction('Kembali ke napas. Ini adalah jangkar ketenangan Anda.')
      .addPause(5000)
      .addInstruction('Anda telah menemukan ketenangan. Bawalah ini dalam aktivitas Anda.')
      .build('session_napas_hiruk_1');

    scripts.push(chaosScript);

    // Script for sleep session
    const sleepScript = scriptBuilder
      .clear()
      .addInstruction('Selamat malam, saatnya untuk beristirahat dengan tenang.')
      .addInstruction('Berbaringlah dengan nyaman, tutup mata perlahan.')
      .addPause(3000)
      .addInstruction('Lepaskan semua beban hari ini dari pundak Anda.')
      .addPause(5000)
      .addBreathing('Napas menjadi semakin lambat dan dalam.')
      .addBreathing('Setiap helaan napas membawa Anda semakin dalam ke relaksasi.')
      .addPause(10000)
      .addVisualization('Bayangkan hujan lembut turun di luar jendela.')
      .addVisualization('Setiap tetes hujan membawa ketenangan yang mendalam.')
      .addPause(15000)
      .addInstruction('Mulai dari ujung jari kaki, rasakan relaksasi mengalir ke seluruh tubuh.')
      .addInstruction('Kaki terasa ringan... tungkai relaks... perut tenang...')
      .addPause(20000)
      .addInstruction('Biarkan pikiran mengalir seperti awan yang berlalu.')
      .addPause(30000)
      .addInstruction('Selamat tidur yang nyenyak dan bermimpi indah.')
      .build('session_tidur_dalam_1');

    scripts.push(sleepScript);

    return scripts;
  }

  /**
   * Generate complete sample content package
   */
  generateCompleteContent(): {
    instructors: InstructorProfile[];
    sessions: MeditationSession[];
    courses: Course[];
    ambientSounds: AmbientSound[];
    scripts: GuidedScript[];
  } {
    return {
      instructors: this.generateInstructors(),
      sessions: this.generateMeditationSessions(),
      courses: this.generateCourses(),
      ambientSounds: this.generateAmbientSounds(),
      scripts: this.generateGuidedScripts()
    };
  }
}

// Singleton instance
export const sampleContentGenerator = new SampleContentGenerator();