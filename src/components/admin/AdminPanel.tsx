import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { contentDatabase } from '../../services/contentDatabase';
import type { MeditationSession, Course, InstructorProfile, AmbientSound } from '../../types/content';

interface AdminPanelProps {
  className?: string;
}

type AdminView = 'overview' | 'sessions' | 'courses' | 'instructors' | 'sounds' | 'analytics';

export const AdminPanel: React.FC<AdminPanelProps> = ({ className = '' }) => {
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalCourses: 0,
    totalInstructors: 0,
    sessionsByCategory: {} as Record<string, number>,
    sessionsByDifficulty: {} as Record<string, number>
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const contentStats = await contentDatabase.getContentStats();
      setStats(contentStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateData = async () => {
    try {
      setLoading(true);
      const result = await contentDatabase.populateSampleData();
      
      if (result.success) {
        await loadStats();
        alert(`Sample data populated successfully!\n\n${result.message}\n\nCreated:\n- ${result.counts.sessions} sessions\n- ${result.counts.courses} courses\n- ${result.counts.instructors} instructors\n- ${result.counts.ambientSounds} ambient sounds\n- ${result.counts.scripts} scripts`);
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const OverviewView: React.FC = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalSessions}</div>
          <div className="text-gray-600">Sesi Meditasi</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalCourses}</div>
          <div className="text-gray-600">Kursus</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalInstructors}</div>
          <div className="text-gray-600">Instruktur</div>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-heading text-gray-800 mb-4">Distribusi Kategori Sesi</h3>
        <div className="space-y-3">
          {Object.entries(stats.sessionsByCategory).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">{category.replace('-', ' ')}</span>
              <span className="font-medium">{count} sesi</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Difficulty Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-heading text-gray-800 mb-4">Distribusi Level Kesulitan</h3>
        <div className="space-y-3">
          {Object.entries(stats.sessionsByDifficulty).map(([difficulty, count]) => (
            <div key={difficulty} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">{difficulty}</span>
              <span className="font-medium">{count} sesi</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-heading text-gray-800 mb-4">Aksi Cepat</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={handlePopulateData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Populate Sample Data'}
          </Button>
          
          <Button
            variant="outline"
            onClick={loadStats}
            disabled={loading}
          >
            Refresh Stats
          </Button>
        </div>
      </Card>
    </div>
  );

  const SessionsView: React.FC = () => {
    const [sessions, setSessions] = useState<MeditationSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadSessions();
    }, []);

    const loadSessions = async () => {
      try {
        setLoading(true);
        const sessionsData = await contentDatabase.getSessions();
        setSessions(sessionsData);
      } catch (err) {
        console.error('Error loading sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading text-gray-800">Kelola Sesi Meditasi</h3>
          <div className="text-sm text-gray-600">{sessions.length} sesi total</div>
        </div>

        <div className="space-y-3">
          {sessions.map(session => (
            <Card key={session.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-1">{session.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{session.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>📂 {session.category}</span>
                    <span>⏱️ {session.duration} menit</span>
                    <span>📊 {session.difficulty}</span>
                    <span>👤 {session.instructor}</span>
                    <span>✅ {session.completionCount} selesai</span>
                    <span>⭐ {session.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {session.isNew && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Baru</span>
                  )}
                  {session.isPremium && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Premium</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const CoursesView: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadCourses();
    }, []);

    const loadCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await contentDatabase.getCourses();
        setCourses(coursesData);
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading text-gray-800">Kelola Kursus</h3>
          <div className="text-sm text-gray-600">{courses.length} kursus total</div>
        </div>

        <div className="space-y-3">
          {courses.map(course => (
            <Card key={course.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-1">{course.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>📂 {course.category}</span>
                    <span>⏱️ {course.estimatedDuration} menit</span>
                    <span>📊 {course.difficulty}</span>
                    <span>👤 {course.instructor}</span>
                    <span>📚 {course.sessions.length} sesi</span>
                    <span>👥 {course.enrollmentCount} terdaftar</span>
                    <span>⭐ {course.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {course.isPremium && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Premium</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const InstructorsView: React.FC = () => {
    const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadInstructors();
    }, []);

    const loadInstructors = async () => {
      try {
        setLoading(true);
        const instructorsData = await contentDatabase.getInstructors();
        setInstructors(instructorsData);
      } catch (err) {
        console.error('Error loading instructors:', err);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading text-gray-800">Kelola Instruktur</h3>
          <div className="text-sm text-gray-600">{instructors.length} instruktur total</div>
        </div>

        <div className="space-y-3">
          {instructors.map(instructor => (
            <Card key={instructor.id} className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-800">{instructor.name}</h4>
                    {instructor.isVerified && (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{instructor.bio}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                    <span>⭐ {instructor.rating.toFixed(1)}</span>
                    <span>📚 {instructor.totalSessions} sesi</span>
                    <span>🌐 {instructor.languages.join(', ')}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {instructor.specialties.slice(0, 3).map(specialty => (
                      <span 
                        key={specialty}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {specialty}
                      </span>
                    ))}
                    {instructor.specialties.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{instructor.specialties.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const SoundsView: React.FC = () => {
    const [sounds, setSounds] = useState<AmbientSound[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadSounds();
    }, []);

    const loadSounds = async () => {
      try {
        setLoading(true);
        const soundsData = await contentDatabase.getAmbientSounds();
        setSounds(soundsData);
      } catch (err) {
        console.error('Error loading sounds:', err);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading text-gray-800">Kelola Suara Ambient</h3>
          <div className="text-sm text-gray-600">{sounds.length} suara total</div>
        </div>

        <div className="space-y-3">
          {sounds.map(sound => (
            <Card key={sound.id} className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-xl">
                  {sound.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-800">{sound.name}</h4>
                    {sound.isPremium && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Premium</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{sound.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                    <span>📂 {sound.category}</span>
                    <span>⏱️ {Math.round(sound.audioFile.duration / 60)} menit</span>
                    <span>📦 {(sound.audioFile.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                    <span>🎵 {sound.audioFile.format}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {sound.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (loading && currentView === 'overview') {
    return (
      <div className={`${className}`}>
        <Card className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadStats} variant="outline">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading text-gray-800 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Kelola konten dan data aplikasi Sembalun</p>
      </div>

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={currentView === 'overview' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setCurrentView('overview')}
          >
            📊 Overview
          </Button>
          <Button
            variant={currentView === 'sessions' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setCurrentView('sessions')}
          >
            🎯 Sesi
          </Button>
          <Button
            variant={currentView === 'courses' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setCurrentView('courses')}
          >
            📚 Kursus
          </Button>
          <Button
            variant={currentView === 'instructors' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setCurrentView('instructors')}
          >
            👤 Instruktur
          </Button>
          <Button
            variant={currentView === 'sounds' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setCurrentView('sounds')}
          >
            🎵 Suara
          </Button>
        </div>
      </Card>

      {/* Content */}
      {currentView === 'overview' && <OverviewView />}
      {currentView === 'sessions' && <SessionsView />}
      {currentView === 'courses' && <CoursesView />}
      {currentView === 'instructors' && <InstructorsView />}
      {currentView === 'sounds' && <SoundsView />}
    </div>
  );
};