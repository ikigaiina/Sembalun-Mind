import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import type { MeditationSession, Course, SessionCategory, Difficulty, AmbientSound, InstructorProfile } from '../../types/content';
import { contentDatabase } from '../../services/contentDatabase';
import { siyContentService } from '../../services/siyContentService';

interface ContentLibraryProps {
  onSessionSelect: (session: MeditationSession) => void;
  onCourseSelect: (course: Course) => void;
  onAmbientSoundSelect?: (sound: AmbientSound) => void;
  userId?: string;
  className?: string;
  showPopulateButton?: boolean; // For development/admin
}

// Enhanced category configurations
const CATEGORY_CONFIGS = {
  'jeda-pagi': {
    name: 'Jeda Pagi',
    description: 'Memulai hari dengan ketenangan dan niat yang jelas',
    icon: '🌅',
    color: 'from-orange-100 to-yellow-100',
    primaryColor: '#F59E0B'
  },
  'napas-hiruk': {
    name: 'Napas di Tengah Hiruk',
    description: 'Menemukan ketenangan di tengah kesibukan hidup',
    icon: '🌊',
    color: 'from-blue-100 to-cyan-100',
    primaryColor: '#0891B2'
  },
  'pulang-diri': {
    name: 'Pulang ke Diri',
    description: 'Refleksi dan relaksasi untuk kembali pada diri sendiri',
    icon: '🌸',
    color: 'from-pink-100 to-purple-100',
    primaryColor: '#C026D3'
  },
  'tidur-dalam': {
    name: 'Tidur yang Dalam',
    description: 'Persiapan tidur nyenyak dan pemulihan alami',
    icon: '🌙',
    color: 'from-indigo-100 to-blue-100',
    primaryColor: '#4F46E5'
  },
  'fokus-kerja': {
    name: 'Fokus untuk Bekerja',
    description: 'Meningkatkan konsentrasi dan produktivitas',
    icon: '🎯',
    color: 'from-green-100 to-emerald-100',
    primaryColor: '#059669'
  },
  'relaksasi': {
    name: 'Relaksasi Mendalam',
    description: 'Melepaskan ketegangan tubuh dan pikiran',
    icon: '🍃',
    color: 'from-teal-100 to-green-100',
    primaryColor: '#0D9488'
  },
  'kecemasan': {
    name: 'Menenangkan Kecemasan',
    description: 'Mengelola kecemasan dan kekhawatiran',
    icon: '🦋',
    color: 'from-purple-100 to-pink-100',
    primaryColor: '#7C3AED'
  },
  'emosi': {
    name: 'Keseimbangan Emosi',
    description: 'Memahami dan mengelola emosi dengan bijak',
    icon: '💙',
    color: 'from-sky-100 to-blue-100',
    primaryColor: '#0284C7'
  },
  'spiritual': {
    name: 'Dimensi Spiritual',
    description: 'Memperdalam hubungan dengan diri dan alam semesta',
    icon: '✨',
    color: 'from-violet-100 to-purple-100',
    primaryColor: '#8B5CF6'
  },
  'siy-attention': {
    name: 'SIY: Latihan Perhatian',
    description: 'Search Inside Yourself - Membangun fondasi perhatian yang kuat',
    icon: '🎯',
    color: 'from-red-100 to-orange-100',
    primaryColor: '#EF4444'
  },
  'siy-awareness': {
    name: 'SIY: Kesadaran Diri',
    description: 'Search Inside Yourself - Mengembangkan kesadaran diri yang mendalam',
    icon: '🔍',
    color: 'from-amber-100 to-yellow-100',
    primaryColor: '#F59E0B'
  },
  'siy-regulation': {
    name: 'SIY: Pengaturan Diri',
    description: 'Search Inside Yourself - Menguasai regulasi emosi dan respons',
    icon: '⚖️',
    color: 'from-emerald-100 to-teal-100',
    primaryColor: '#10B981'
  },
  'siy-empathy': {
    name: 'SIY: Pengembangan Empati',
    description: 'Search Inside Yourself - Membangun empati dan koneksi manusiawi',
    icon: '🤝',
    color: 'from-rose-100 to-pink-100',
    primaryColor: '#F43F5E'
  },
  'siy-social': {
    name: 'SIY: Keterampilan Sosial',
    description: 'Search Inside Yourself - Mengembangkan komunikasi dan kolaborasi',
    icon: '🌟',
    color: 'from-cyan-100 to-blue-100',
    primaryColor: '#06B6D4'
  },
  'siy-happiness': {
    name: 'SIY: Kebahagiaan & Kasih Sayang',
    description: 'Search Inside Yourself - Memupuk kebahagiaan dan welas asih',
    icon: '😊',
    color: 'from-yellow-100 to-orange-100',
    primaryColor: '#F59E0B'
  },
  'siy-workplace': {
    name: 'SIY: Aplikasi Kerja',
    description: 'Search Inside Yourself - Menerapkan mindfulness dalam pekerjaan',
    icon: '💼',
    color: 'from-slate-100 to-gray-100',
    primaryColor: '#64748B'
  }
} as const;

type ViewMode = 'categories' | 'all' | 'courses' | 'ambient' | 'featured' | 'trending' | 'siy-modules';
type SortBy = 'newest' | 'popular' | 'duration' | 'difficulty' | 'rating';

export const ContentLibrary: React.FC<ContentLibraryProps> = ({
  onSessionSelect,
  onCourseSelect,
  onAmbientSoundSelect,
  className = '',
  showPopulateButton = false
}) => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>([]);
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [populatingData, setPopulatingData] = useState(false);
  const [populatingSIYData, setPopulatingSIYData] = useState(false);
  
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<SessionCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [sessionsData, coursesData, ambientData, instructorsData] = await Promise.all([
        contentDatabase.getSessions(),
        contentDatabase.getCourses(),
        contentDatabase.getAmbientSounds(),
        contentDatabase.getInstructors()
      ]);
      
      setSessions(sessionsData);
      setCourses(coursesData);
      setAmbientSounds(ambientData);
      setInstructors(instructorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateSampleData = async () => {
    try {
      setPopulatingData(true);
      const result = await contentDatabase.populateSampleData();
      
      if (result.success) {
        await loadContent(); // Reload content after populating
        alert(`Sample data populated successfully!\n\nCreated:\n- ${result.counts.sessions} sessions\n- ${result.counts.courses} courses\n- ${result.counts.instructors} instructors\n- ${result.counts.ambientSounds} ambient sounds\n- ${result.counts.scripts} scripts`);
      } else {
        alert(`Failed to populate sample data: ${result.message}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setPopulatingData(false);
    }
  };

  const handlePopulateSIYContent = async () => {
    try {
      setPopulatingSIYData(true);
      const result = await siyContentService.populateSIYContent();
      
      if (result.success) {
        await loadContent(); // Reload content after populating
        alert(`SIY content populated successfully!\n\nCreated:\n- ${result.counts.modules} modules\n- ${result.counts.exercises} exercises\n- ${result.counts.learningPaths} learning paths`);
      } else {
        alert(`Failed to populate SIY content: ${result.message}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setPopulatingSIYData(false);
    }
  };

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(session => {
      // Category filter
      if (selectedCategory !== 'all' && session.category !== selectedCategory) {
        return false;
      }
      
      // Difficulty filter
      if (selectedDifficulty !== 'all' && session.difficulty !== selectedDifficulty) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return session.title.toLowerCase().includes(term) ||
               session.description.toLowerCase().includes(term) ||
               session.tags.some(tag => tag.toLowerCase().includes(term));
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'popular':
          return b.completionCount - a.completionCount;
        case 'duration':
          return a.duration - b.duration;
        case 'difficulty': {
          const difficultyOrder = { 'pemula': 0, 'menengah': 1, 'lanjutan': 2 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        }
        case 'rating':
          return b.averageRating - a.averageRating;
        default:
          return 0;
      }
    });

  const SessionCard: React.FC<{ session: MeditationSession }> = ({ session }) => {
    const categoryConfig = CATEGORY_CONFIGS[session.category];
    
    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
        onClick={() => onSessionSelect(session)}
      >
        <div className="p-4">
          <div className="flex items-start space-x-4">
            {/* Session Icon */}
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200"
              style={{ 
                background: `linear-gradient(135deg, ${categoryConfig.primaryColor}15, ${categoryConfig.primaryColor}25)` 
              }}
            >
              {categoryConfig.icon}
            </div>
            
            {/* Session Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-heading text-gray-800 group-hover:text-primary transition-colors duration-200 truncate">
                  {session.title}
                </h3>
                {session.isPremium && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Premium
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {session.description}
              </p>
              
              {/* Session Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    ⏱️ {session.duration} menit
                  </span>
                  <span className="flex items-center">
                    📊 {session.difficulty}
                  </span>
                  {session.instructor && (
                    <span className="flex items-center">
                      👤 {session.instructor}
                    </span>
                  )}
                </div>
                
                {/* Completion & Rating */}
                <div className="flex items-center space-x-2">
                  {session.completionCount > 0 && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      {session.completionCount} selesai
                    </span>
                  )}
                  {session.averageRating > 0 && (
                    <span className="text-xs text-gray-500 flex items-center">
                      ⭐ {session.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Tags */}
              {session.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {session.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {session.tags.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{session.tags.length - 3} lainnya
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const categoryConfig = CATEGORY_CONFIGS[course.category];
    
    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
        onClick={() => onCourseSelect(course)}
      >
        <div className="p-4">
          <div className="flex items-start space-x-4">
            {/* Course Icon */}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200"
              style={{ 
                background: `linear-gradient(135deg, ${categoryConfig.primaryColor}15, ${categoryConfig.primaryColor}25)` 
              }}
            >
              📚
            </div>
            
            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-heading text-gray-800 group-hover:text-primary transition-colors duration-200">
                  {course.title}
                </h3>
                {course.isPremium && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Premium
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {course.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{course.sessions.length} sesi</span>
                  <span>⏱️ {course.estimatedDuration} menit</span>
                  <span>📊 {course.difficulty}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {course.enrollmentCount} terdaftar
                  </span>
                  {course.averageRating > 0 && (
                    <span className="text-xs text-gray-500 flex items-center">
                      ⭐ {course.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const CategoryCard: React.FC<{ 
    category: keyof typeof CATEGORY_CONFIGS;
    sessionCount: number;
  }> = ({ category, sessionCount }) => {
    const config = CATEGORY_CONFIGS[category];
    
    return (
      <Card 
        className={`cursor-pointer hover:shadow-lg transition-all duration-200 group bg-gradient-to-r ${config.color} border-0`}
        onClick={() => {
          setSelectedCategory(category);
          setViewMode('all');
        }}
      >
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
              {config.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg text-gray-800 group-hover:text-primary transition-colors duration-200">
                {config.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {config.description}
              </p>
              <p className="text-xs text-gray-500">
                {sessionCount} sesi tersedia
              </p>
            </div>
            <div className="text-gray-400 group-hover:text-primary transition-colors duration-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const AmbientSoundCard: React.FC<{ sound: AmbientSound }> = ({ sound }) => {
    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
        onClick={() => onAmbientSoundSelect?.(sound)}
      >
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200">
              {sound.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-heading text-gray-800 group-hover:text-primary transition-colors duration-200">
                  {sound.name}
                </h3>
                {sound.isPremium && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Premium
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {sound.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    ⏱️ {Math.round(sound.audioFile.duration / 60)} menit
                  </span>
                  <span className="flex items-center capitalize">
                    📂 {sound.category}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {sound.tags.slice(0, 2).map(tag => (
                    <span 
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const StatsCard: React.FC = () => {
    return (
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
        <h3 className="text-lg font-heading text-gray-800 mb-4">Statistik Konten</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{sessions.length}</div>
            <div className="text-sm text-gray-600">Sesi Meditasi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{courses.length}</div>
            <div className="text-sm text-gray-600">Kursus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{ambientSounds.length}</div>
            <div className="text-sm text-gray-600">Suara Ambient</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{instructors.length}</div>
            <div className="text-sm text-gray-600">Instruktur</div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadContent} variant="outline">
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Header & View Mode Selector */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading text-gray-800">
              Pustaka Meditasi
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Koleksi lengkap sesi meditasi dan konten wellness dalam Bahasa Indonesia
            </p>
          </div>
          
          {showPopulateButton && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="small"
                onClick={handlePopulateSampleData}
                disabled={populatingData}
                className="text-xs"
              >
                {populatingData ? 'Loading...' : 'Populate Sample Data'}
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handlePopulateSIYContent}
                disabled={populatingSIYData}
                className="text-xs"
              >
                {populatingSIYData ? 'Loading...' : 'Populate SIY Content'}
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={viewMode === 'categories' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setViewMode('categories')}
          >
            📂 Kategori
          </Button>
          <Button
            variant={viewMode === 'featured' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setViewMode('featured')}
          >
            ⭐ Pilihan
          </Button>
          <Button
            variant={viewMode === 'trending' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setViewMode('trending')}
          >
            🔥 Trending
          </Button>
          <Button
            variant={viewMode === 'all' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setViewMode('all')}
          >
            🎯 Semua Sesi
          </Button>
          <Button
            variant={viewMode === 'courses' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setViewMode('courses')}
          >
            📚 Kursus
          </Button>
          <Button
            variant={viewMode === 'ambient' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setViewMode('ambient')}
          >
            🎵 Suara Ambient
          </Button>
          <Button
            variant={viewMode === 'siy-modules' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setViewMode('siy-modules')}
          >
            🎯 Search Inside Yourself
          </Button>
        </div>
        
        {/* Stats Card */}
        {viewMode === 'categories' && <StatsCard />}
      </div>

      {/* Search & Filters */}
      {(viewMode === 'all' || viewMode === 'courses' || viewMode === 'featured' || viewMode === 'trending') && (
        <Card className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari meditasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Semua Level</option>
                <option value="pemula">Pemula</option>
                <option value="menengah">Menengah</option>
                <option value="lanjutan">Lanjutan</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="newest">Terbaru</option>
                <option value="popular">Terpopuler</option>
                <option value="duration">Durasi</option>
                <option value="difficulty">Level</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Content Display */}
      {viewMode === 'categories' && (
        <div className="grid gap-4">
          {Object.entries(CATEGORY_CONFIGS).map(([key]) => {
            const sessionCount = sessions.filter(s => s.category === key).length;
            return (
              <CategoryCard
                key={key}
                category={key as keyof typeof CATEGORY_CONFIGS}
                sessionCount={sessionCount}
              />
            );
          })}
        </div>
      )}

      {viewMode === 'all' && (
        <div className="space-y-4">
          {selectedCategory !== 'all' && (
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="small"
                onClick={() => {
                  setSelectedCategory('all');
                  setViewMode('categories');
                }}
              >
                ← Kembali ke Kategori
              </Button>
              <h3 className="text-lg font-heading text-gray-800">
                {CATEGORY_CONFIGS[selectedCategory as keyof typeof CATEGORY_CONFIGS]?.name}
              </h3>
            </div>
          )}
          
          {filteredSessions.length > 0 ? (
            <div className="space-y-3">
              {filteredSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-600">
                Tidak ada sesi yang sesuai dengan filter Anda
              </p>
            </Card>
          )}
        </div>
      )}

      {viewMode === 'courses' && (
        <div className="space-y-4">
          {courses.length > 0 ? (
            courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-gray-600">
                Kursus akan segera hadir!
              </p>
            </Card>
          )}
        </div>
      )}

      {viewMode === 'ambient' && (
        <div className="space-y-4">
          {ambientSounds.length > 0 ? (
            <div className="space-y-3">
              {ambientSounds.map(sound => (
                <AmbientSoundCard key={sound.id} sound={sound} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">🎵</div>
              <p className="text-gray-600">
                Suara ambient akan segera hadir!
              </p>
            </Card>
          )}
        </div>
      )}

      {viewMode === 'featured' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">⭐</span>
            <h3 className="text-lg font-heading text-gray-800">
              Sesi Pilihan Terbaru
            </h3>
          </div>
          
          {filteredSessions.filter(s => s.isNew).length > 0 ? (
            <div className="space-y-3">
              {filteredSessions
                .filter(s => s.isNew)
                .slice(0, 10)
                .map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-gray-600">
                Belum ada sesi pilihan yang tersedia
              </p>
            </Card>
          )}
        </div>
      )}

      {viewMode === 'trending' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">🔥</span>
            <h3 className="text-lg font-heading text-gray-800">
              Sesi Paling Populer
            </h3>
          </div>
          
          {filteredSessions.length > 0 ? (
            <div className="space-y-3">
              {filteredSessions
                .sort((a, b) => b.completionCount - a.completionCount)
                .slice(0, 10)
                .map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">🔥</div>
              <p className="text-gray-600">
                Belum ada data trending yang tersedia
              </p>
            </Card>
          )}
        </div>
      )}

      {viewMode === 'siy-modules' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">🎯</span>
            <h3 className="text-lg font-heading text-gray-800">
              Search Inside Yourself - Program Kecerdasan Emosional
            </h3>
          </div>
          
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <h4 className="font-heading text-gray-800 mb-3">Tentang Search Inside Yourself</h4>
            <p className="text-gray-700 mb-4">
              Search Inside Yourself adalah program pelatihan kecerdasan emosional berbasis mindfulness yang dikembangkan oleh Google. 
              Program ini menggabungkan praktik perhatian, kesadaran diri, dan regulasi emosi untuk meningkatkan wellbeing dan efektivitas hidup.
            </p>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium text-gray-800">LATIHAN PERHATIAN</div>
                <div className="text-sm text-gray-600">Membangun fondasi perhatian yang kuat</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-medium text-gray-800">KESADARAN DIRI</div>
                <div className="text-sm text-gray-600">Mengembangkan pemahaman diri yang mendalam</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl mb-2">⚖️</div>
                <div className="font-medium text-gray-800">PENGATURAN DIRI</div>
                <div className="text-sm text-gray-600">Menguasai regulasi emosi dan respons</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl mb-2">🤝</div>
                <div className="font-medium text-gray-800">EMPATI</div>
                <div className="text-sm text-gray-600">Membangun koneksi manusiawi yang dalam</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl mb-2">🌟</div>
                <div className="font-medium text-gray-800">KETERAMPILAN SOSIAL</div>
                <div className="text-sm text-gray-600">Komunikasi & kolaborasi yang efektif</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl mb-2">😊</div>
                <div className="font-medium text-gray-800">KEBAHAGIAAN</div>
                <div className="text-sm text-gray-600">Memupuk kebahagiaan & welas asih</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl mb-2">💼</div>
                <div className="font-medium text-gray-800">APLIKASI KERJA</div>
                <div className="text-sm text-gray-600">Mindfulness dalam lingkungan kerja</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Program ini dirancang berdasarkan penelitian neurosains dan psikologi positif terkini
              </p>
              {showPopulateButton && (
                <Button
                  variant="primary"
                  onClick={handlePopulateSIYContent}
                  disabled={populatingSIYData}
                >
                  {populatingSIYData ? 'Memuat...' : 'Mulai Program SIY'}
                </Button>
              )}
            </div>
          </Card>

          {/* SIY Category Cards */}
          <div className="grid gap-4">
            {(['siy-attention', 'siy-awareness', 'siy-regulation', 'siy-empathy', 'siy-social', 'siy-happiness', 'siy-workplace'] as const).map((category) => {
              const config = CATEGORY_CONFIGS[category];
              const sessionCount = sessions.filter(s => s.category === category).length;
              
              return (
                <Card 
                  key={category}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 group bg-gradient-to-r ${config.color} border-0`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setViewMode('all');
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg text-gray-800 group-hover:text-primary transition-colors duration-200">
                          {config.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {config.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sessionCount} modul tersedia
                        </p>
                      </div>
                      <div className="text-gray-400 group-hover:text-primary transition-colors duration-200">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Benefits Section */}
          <Card className="p-6">
            <h4 className="font-heading text-gray-800 mb-3">Manfaat Program SIY</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium text-gray-700">Manfaat Personal:</h5>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Meningkatkan fokus dan konsentrasi</li>
                  <li>• Mengurangi stres dan kecemasan</li>
                  <li>• Meningkatkan kesadaran emosional</li>
                  <li>• Mengembangkan resiliensi mental</li>
                  <li>• Membangun empati dan koneksi manusiawi</li>
                  <li>• Memupuk kebahagiaan dan welas asih</li>
                  <li>• Meningkatkan kepuasan hidup</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-gray-700">Manfaat Profesional:</h5>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Meningkatkan kemampuan komunikasi</li>
                  <li>• Mengembangkan kepemimpinan yang empati</li>
                  <li>• Menguasai keterampilan sosial</li>
                  <li>• Membangun tim yang lebih kohesif</li>
                  <li>• Mengelola konflik dengan bijaksana</li>
                  <li>• Menerapkan mindfulness dalam pekerjaan</li>
                  <li>• Meningkatkan kreativitas dan inovasi</li>
                  <li>• Meningkatkan performa kerja</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};