import { Card } from './Card';
import { Button } from './Button';

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  sessionCount: number;
  difficulty: 'Pemula' | 'Menengah' | 'Lanjutan';
  category: string;
  progress: number;
  thumbnail: string;
  isStarted: boolean;
  natureImagery?: string;
}

interface CourseCardProps {
  course: Course;
  onClick: () => void;
  variant?: 'default' | 'compact';
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  onClick, 
  variant = 'default' 
}) => {
  const isCompact = variant === 'compact';
  
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 40) return 'bg-blue-500';
    return 'bg-primary';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Pemula': return 'bg-green-100 text-green-800';
      case 'Menengah': return 'bg-yellow-100 text-yellow-800';
      case 'Lanjutan': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-xl transition-all duration-300 group ${
        isCompact ? 'min-w-52' : 'min-w-64'
      }`} 
      onClick={onClick}
    >
      {/* Nature-inspired thumbnail with gradient overlay */}
      <div className="relative mb-4 overflow-hidden rounded-2xl">
        <div className={`${isCompact ? 'h-24' : 'h-32'} flex items-center justify-center text-5xl bg-gradient-to-br from-blue-50 to-green-50 group-hover:from-blue-100 group-hover:to-green-100 transition-all duration-300`}>
          {course.thumbnail}
        </div>
        
        {/* Difficulty badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
        </div>

        {/* Progress indicator overlay for started courses */}
        {course.isStarted && course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
            <div 
              className={`h-full ${getProgressColor(course.progress)} transition-all duration-500`}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Course content */}
      <div className="space-y-3">
        <div>
          <h3 className={`font-heading text-gray-800 mb-2 group-hover:text-primary transition-colors duration-200 ${
            isCompact ? 'text-base' : 'text-lg'
          }`}>
            {course.title}
          </h3>
          <p className={`text-gray-600 ${isCompact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'}`}>
            {course.description}
          </p>
        </div>

        {/* Course meta info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <span className="mr-1">⏱️</span>
              {course.duration}
            </span>
            <span className="flex items-center">
              <span className="mr-1">📚</span>
              {course.sessionCount} sesi
            </span>
          </div>
          <span className="text-primary font-medium">{course.category}</span>
        </div>

        {/* Progress bar for started courses */}
        {course.isStarted && course.progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progress</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(course.progress)}`}
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action button */}
        <Button 
          variant={course.isStarted ? "secondary" : "primary"} 
          size="small" 
          className="w-full group-hover:shadow-lg transition-all duration-200"
        >
          {course.isStarted ? (
            course.progress > 0 ? 'Lanjutkan' : 'Mulai Lagi'
          ) : (
            'Mulai Kursus'
          )}
        </Button>
      </div>
    </Card>
  );
};