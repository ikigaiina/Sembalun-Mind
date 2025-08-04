import React, { useState, useEffect } from 'react';
import { Play, Clock, Users, Star, BookOpen, Award, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SIYModulePlayer } from '../components/ui/SIYModulePlayer';
import { SIYProgressDashboard } from '../components/ui/SIYProgressDashboard';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  studentsCount: number;
  lessonsCount: number;
  category: string;
  thumbnail: string;
  isPremium: boolean;
  isEnrolled: boolean;
  progress: number; // 0-100
  price?: number;
  tags: string[];
  modules: CourseModule[];
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  isCompleted: boolean;
  isLocked: boolean;
  order: number;
  type: 'video' | 'audio' | 'reading' | 'exercise' | 'quiz';
  content?: {
    videoUrl?: string;
    audioUrl?: string;
    text?: string;
    exercises?: any[];
    quiz?: any;
  };
}

interface CourseCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  courseCount: number;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [viewMode, setViewMode] = useState<'browse' | 'course' | 'lesson'>('browse');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, fetch from courses service
    const mockCategories: CourseCategory[] = [
      { id: 'siy', name: 'Search Inside Yourself', description: 'Emotional Intelligence through Mindfulness', icon: '🧠', color: '#10B981', courseCount: 8 },
      { id: 'mindfulness', name: 'Mindfulness Basics', description: 'Foundation of mindful living', icon: '🧘‍♀️', color: '#3B82F6', courseCount: 12 },
      { id: 'stress', name: 'Stress Management', description: 'Tools for handling stress', icon: '🌿', color: '#10B981', courseCount: 6 },
      { id: 'sleep', name: 'Better Sleep', description: 'Improve your sleep quality', icon: '😴', color: '#8B5CF6', courseCount: 4 },
      { id: 'workplace', name: 'Workplace Wellness', description: 'Mindfulness at work', icon: '💼', color: '#F59E0B', courseCount: 5 },
      { id: 'relationships', name: 'Mindful Relationships', description: 'Connecting mindfully', icon: '💕', color: '#EC4899', courseCount: 3 }
    ];

    const mockCourses: Course[] = [
      {
        id: 'siy-foundations',
        title: 'Search Inside Yourself: Foundations',
        description: 'Learn the fundamentals of emotional intelligence through mindfulness. This comprehensive course covers self-awareness, self-regulation, motivation, empathy, and social skills.',
        instructor: 'Dr. Daniel Goleman',
        duration: 12,
        difficulty: 'beginner',
        rating: 4.9,
        studentsCount: 15420,
        lessonsCount: 24,
        category: 'siy',
        thumbnail: '/images/siy-foundations.jpg',
        isPremium: true,
        isEnrolled: true,
        progress: 45,
        price: 299000,
        tags: ['emotional intelligence', 'self-awareness', 'mindfulness', 'workplace'],
        modules: [
          {
            id: 'intro',
            title: 'Introduction to Emotional Intelligence',
            description: 'Understanding the foundation of emotional intelligence and its impact on personal and professional success.',
            duration: 45,
            isCompleted: true,
            isLocked: false,
            order: 1,
            type: 'video',
            content: {
              videoUrl: '/videos/siy-intro.mp4'
            }
          },
          {
            id: 'self-awareness',
            title: 'Developing Self-Awareness',
            description: 'Learn techniques to become more aware of your emotions, thoughts, and reactions.',
            duration: 60,
            isCompleted: true,
            isLocked: false,
            order: 2,
            type: 'video',
            content: {
              videoUrl: '/videos/siy-self-awareness.mp4'
            }
          },
          {
            id: 'mindful-listening',
            title: 'Mindful Listening Practice',
            description: 'Practice deep listening skills that enhance empathy and understanding.',
            duration: 30,
            isCompleted: false,
            isLocked: false,
            order: 3,
            type: 'exercise',
            content: {
              exercises: [
                {
                  title: 'Partner Listening Exercise',
                  description: 'Practice listening without judgment',
                  duration: 15
                }
              ]
            }
          },
          {
            id: 'emotional-regulation',
            title: 'Emotional Self-Regulation',
            description: 'Master techniques for managing difficult emotions and maintaining emotional balance.',
            duration: 50,
            isCompleted: false,
            isLocked: false,
            order: 4,
            type: 'video'
          },
          {
            id: 'empathy-building',
            title: 'Building Empathy',
            description: 'Develop deeper empathy through mindfulness practices.',
            duration: 40,
            isCompleted: false,
            isLocked: true,
            order: 5,
            type: 'video'
          }
        ]
      },
      {
        id: 'mindfulness-101',
        title: 'Mindfulness 101: A Beginner\'s Guide',
        description: 'Start your mindfulness journey with this comprehensive introductory course. Learn basic meditation techniques, breathing exercises, and daily mindfulness practices.',
        instructor: 'Sarah Mindful',
        duration: 8,
        difficulty: 'beginner',
        rating: 4.7,
        studentsCount: 23450,
        lessonsCount: 16,
        category: 'mindfulness',
        thumbnail: '/images/mindfulness-101.jpg',
        isPremium: false,
        isEnrolled: false,
        progress: 0,
        tags: ['meditation', 'breathing', 'beginner', 'daily practice'],
        modules: []
      },
      {
        id: 'stress-mastery',
        title: 'Stress Mastery Through Mindfulness',
        description: 'Transform your relationship with stress using proven mindfulness techniques. Learn to respond rather than react to stressful situations.',
        instructor: 'Dr. Calm Stress',
        duration: 6,
        difficulty: 'intermediate',
        rating: 4.8,
        studentsCount: 8920,
        lessonsCount: 12,
        category: 'stress',
        thumbnail: '/images/stress-mastery.jpg',
        isPremium: true,
        isEnrolled: false,
        progress: 0,
        price: 199000,
        tags: ['stress relief', 'anxiety', 'coping skills', 'resilience'],
        modules: []
      },
      {
        id: 'sleep-sanctuary',
        title: 'Sleep Sanctuary: Mindful Rest',
        description: 'Improve your sleep quality with mindfulness-based techniques. Learn bedtime routines, relaxation methods, and sleep hygiene practices.',
        instructor: 'Luna Dreams',
        duration: 4,
        difficulty: 'beginner',
        rating: 4.6,
        studentsCount: 12350,
        lessonsCount: 8,
        category: 'sleep',
        thumbnail: '/images/sleep-sanctuary.jpg',
        isPremium: true,
        isEnrolled: true,
        progress: 75,
        price: 149000,
        tags: ['sleep', 'relaxation', 'bedtime', 'rest'],
        modules: []
      }
    ];

    setCategories(mockCategories);
    setCourses(mockCourses);
    setIsLoading(false);
  }, []);

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const handleEnrollCourse = (courseId: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, isEnrolled: true, progress: 0 }
        : course
    ));
  };

  const handleStartCourse = (course: Course) => {
    setSelectedCourse(course);
    setViewMode('course');
  };

  const handleStartLesson = (module: CourseModule) => {
    setActiveModule(module);
    setViewMode('lesson');
  };

  const handleCompleteModule = (moduleId: string) => {
    if (selectedCourse) {
      const updatedModules = selectedCourse.modules.map(module => {
        if (module.id === moduleId) {
          return { ...module, isCompleted: true };
        }
        // Unlock next module
        if (module.order === selectedCourse.modules.find(m => m.id === moduleId)!.order + 1) {
          return { ...module, isLocked: false };
        }
        return module;
      });

      const updatedCourse = { ...selectedCourse, modules: updatedModules };
      const completedModules = updatedModules.filter(m => m.isCompleted).length;
      const progress = Math.round((completedModules / updatedModules.length) * 100);
      updatedCourse.progress = progress;

      setSelectedCourse(updatedCourse);
      setCourses(prev => prev.map(course => 
        course.id === updatedCourse.id ? updatedCourse : course
      ));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (hours: number) => {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'lesson' && activeModule && selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-900">
        <SIYModulePlayer
          module={{
            id: activeModule.id,
            title: activeModule.title,
            description: activeModule.description,
            type: activeModule.type,
            duration: activeModule.duration,
            content: activeModule.content || {},
            isCompleted: activeModule.isCompleted,
            order: activeModule.order
          }}
          course={{
            id: selectedCourse.id,
            title: selectedCourse.title,
            instructor: selectedCourse.instructor,
            progress: selectedCourse.progress
          }}
          onComplete={() => handleCompleteModule(activeModule.id)}
          onNext={() => {
            const nextModule = selectedCourse.modules
              .find(m => m.order === activeModule.order + 1 && !m.isLocked);
            if (nextModule) {
              setActiveModule(nextModule);
            } else {
              setViewMode('course');
            }
          }}
          onPrevious={() => {
            const prevModule = selectedCourse.modules
              .find(m => m.order === activeModule.order - 1);
            if (prevModule) {
              setActiveModule(prevModule);
            }
          }}
          onClose={() => {
            setViewMode('course');
          }}
        />
      </div>
    );
  }

  if (viewMode === 'course' && selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Course Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button
              variant="outline"
              onClick={() => setViewMode('browse')}
              className="mb-4"
            >
              ← Back to Courses
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${getDifficultyColor(selectedCourse.difficulty)}`}>
                  {selectedCourse.difficulty}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedCourse.title}</h1>
                <p className="text-gray-600 mb-6">{selectedCourse.description}</p>

                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(selectedCourse.duration)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{selectedCourse.lessonsCount} lessons</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{selectedCourse.studentsCount.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{selectedCourse.rating}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600">Instructor: <span className="font-medium text-gray-900">{selectedCourse.instructor}</span></p>
                </div>

                {/* Course Achievements */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Achievements</h3>
                  <div className="space-y-3">
                    {[ // Mock achievements
                      { id: '1', name: 'Course Starter', description: 'Started the course', icon: '🚀' },
                      { id: '2', name: 'Module Master', description: 'Completed 5 modules', icon: '🌟' },
                      { id: '3', name: 'Course Completer', description: 'Finished the entire course', icon: '🏆' },
                    ].map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-yellow-500" />
                        <div>
                          <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <img
                    src={selectedCourse.thumbnail}
                    alt={selectedCourse.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  
                  {selectedCourse.isEnrolled ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Progress</span>
                          <span className="text-sm text-gray-900">{selectedCourse.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${selectedCourse.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <Button variant="primary" className="w-full">
                        Continue Learning
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedCourse.isPremium && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            Rp {selectedCourse.price?.toLocaleString('id-ID')}
                          </div>
                        </div>
                      )}
                      <Button 
                        variant="primary" 
                        className="w-full"
                        onClick={() => handleEnrollCourse(selectedCourse.id)}
                      >
                        {selectedCourse.isPremium ? 'Purchase Course' : 'Enroll Free'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {selectedCourse.isEnrolled && (
            <div className="mb-8">
              <SIYProgressDashboard
                currentModule={selectedCourse.modules.find(m => !m.isCompleted && !m.isLocked)?.title || 'Course Complete'}
                overallProgress={selectedCourse.progress}
                sessionsCompleted={selectedCourse.modules.filter(m => m.isCompleted).length}
                totalSessions={selectedCourse.modules.length}
                streakDays={0}
                insights={[
                  'Great progress on emotional awareness',
                  'Keep practicing mindful listening',
                  'Ready for advanced techniques'
                ]}
                achievements={[]}
                onContinueModule={() => {
                  const nextModule = selectedCourse.modules.find(m => !m.isCompleted && !m.isLocked);
                  if (nextModule) {
                    handleStartLesson(nextModule);
                  }
                }}
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Modules</h2>
            
            <div className="space-y-4">
              {selectedCourse.modules.map((module) => (
                <div
                  key={module.id}
                  className={`p-4 border rounded-lg ${
                    module.isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : module.isLocked 
                        ? 'bg-gray-50 border-gray-200 opacity-60' 
                        : 'bg-white border-gray-200 hover:border-primary cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!module.isLocked && selectedCourse.isEnrolled) {
                      handleStartLesson(module);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        module.isCompleted 
                          ? 'bg-green-500 text-white' 
                          : module.isLocked 
                            ? 'bg-gray-400 text-white' 
                            : 'bg-primary text-white'
                      }`}>
                        {module.isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : module.isLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="capitalize">{module.type}</span>
                          <span>{module.duration} minutes</span>
                        </div>
                      </div>
                    </div>

                    {!module.isLocked && selectedCourse.isEnrolled && (
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
          <p className="text-gray-600">Structured learning paths for your mindfulness journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-primary'
              }`}
            >
              All Courses
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-primary'
                }`}
              >
                {category.icon} {category.name} ({category.courseCount})
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {course.isPremium && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                    Premium
                  </div>
                )}
                {course.isEnrolled && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Enrolled
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                <p className="text-xs text-gray-500 mb-4">by {course.instructor}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessonsCount} lessons</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{course.studentsCount.toLocaleString()}</span>
                  </div>
                </div>

                {course.isEnrolled && course.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs text-gray-900">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    {course.isPremium && !course.isEnrolled && (
                      <span className="text-lg font-bold text-gray-900">
                        Rp {course.price?.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (course.isEnrolled) {
                        handleStartCourse(course);
                      } else {
                        handleEnrollCourse(course.id);
                      }
                    }}
                    className="text-sm py-2 px-4"
                  >
                    {course.isEnrolled 
                      ? course.progress > 0 
                        ? 'Continue' 
                        : 'Start Course'
                      : course.isPremium 
                        ? 'Purchase' 
                        : 'Enroll Free'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;