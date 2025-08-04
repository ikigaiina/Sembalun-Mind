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
   * Generate Indonesian meditation instructors
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
      }
    ];
  }

  /**
   * Generate sample meditation sessions
   */
  generateMeditationSessions(): MeditationSession[] {
    const instructors = this.generateInstructors();
    const sessions: MeditationSession[] = [];

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

    return sessions;
  }

  /**
   * Generate sample courses
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