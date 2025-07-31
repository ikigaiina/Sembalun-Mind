import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';

export interface Session {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'meditation' | 'breathing' | 'visualization' | 'body-scan';
  category: 'Jeda Pagi' | 'Napas di Tengah Hiruk' | 'Pulang ke Diri' | 'Tidur yang Dalam';
  instructor?: string;
  difficulty: 'Pemula' | 'Menengah' | 'Lanjutan';
  isCompleted: boolean;
  isFavorite: boolean;
  thumbnail: string;
}

interface SessionLibraryProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
  showCategories?: boolean;
}

const SESSION_CATEGORIES = [
  {
    key: 'Jeda Pagi' as const,
    name: 'Jeda Pagi',
    description: 'Memulai hari dengan ketenangan',
    icon: '🌅',
    color: 'from-orange-100 to-yellow-100'
  },
  {
    key: 'Napas di Tengah Hiruk' as const,
    name: 'Napas di Tengah Hiruk',
    description: 'Reset mental di tengah aktivitas',
    icon: '🌊',
    color: 'from-blue-100 to-cyan-100'
  },
  {
    key: 'Pulang ke Diri' as const,
    name: 'Pulang ke Diri',
    description: 'Refleksi dan relaksasi sore',
    icon: '🌸',
    color: 'from-pink-100 to-purple-100'
  },
  {
    key: 'Tidur yang Dalam' as const,
    name: 'Tidur yang Dalam',
    description: 'Persiapan tidur nyenyak',
    icon: '🌙',
    color: 'from-indigo-100 to-blue-100'
  }
];

const getTypeIcon = (type: Session['type']) => {
  switch (type) {
    case 'meditation': return '🧘';
    case 'breathing': return '💨';
    case 'visualization': return '✨';
    case 'body-scan': return '🌿';
    default: return '🎯';
  }
};

const SessionCard: React.FC<{ 
  session: Session; 
  onClick: () => void;
  variant?: 'compact' | 'detailed';
}> = ({ session, onClick, variant = 'detailed' }) => {
  const isCompact = variant === 'compact';

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
      padding={isCompact ? 'small' : 'medium'}
      onClick={onClick}
    >
      <div className={`flex ${isCompact ? 'items-center space-x-3' : 'flex-col space-y-3'}`}>
        {/* Thumbnail and type indicator */}
        <div className={`flex items-center justify-center ${
          isCompact ? 'w-12 h-12' : 'w-16 h-16'
        } bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl text-2xl group-hover:scale-105 transition-transform duration-200`}>
          {session.thumbnail}
        </div>

        <div className="flex-1 min-w-0">
          {/* Session header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className={`font-heading text-gray-800 group-hover:text-primary transition-colors duration-200 ${
                isCompact ? 'text-sm' : 'text-base'
              }`}>
                {session.title}
              </h3>
              {!isCompact && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {session.description}
                </p>
              )}
            </div>
            
            {/* Favorite indicator */}
            {session.isFavorite && (
              <div className="text-red-500 ml-2">❤️</div>
            )}
          </div>

          {/* Session metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="flex items-center">
                {getTypeIcon(session.type)}
                <span className="ml-1 capitalize">{session.type}</span>
              </span>
              <span>•</span>
              <span>{session.duration}</span>
              {session.instructor && (
                <>
                  <span>•</span>
                  <span>{session.instructor}</span>
                </>
              )}
            </div>
            
            {/* Completion status */}
            {session.isCompleted && (
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                ✓ Selesai
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const SessionLibrary: React.FC<SessionLibraryProps> = ({ 
  sessions, 
  onSessionClick,
  showCategories = true 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  // Group sessions by category
  const sessionsByCategory = sessions.reduce((acc, session) => {
    if (!acc[session.category]) {
      acc[session.category] = [];
    }
    acc[session.category].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  // Filter sessions based on selected category and completion status
  const filteredSessions = selectedCategory === 'all' 
    ? sessions 
    : sessions.filter(session => session.category === selectedCategory);

  const visibleSessions = showCompleted 
    ? filteredSessions 
    : filteredSessions.filter(session => !session.isCompleted);

  if (showCategories) {
    return (
      <div className="space-y-6">
        {/* Category filter buttons */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setSelectedCategory('all')}
          >
            Semua
          </Button>
          {SESSION_CATEGORIES.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? 'primary' : 'outline'}
              size="small"
              onClick={() => setSelectedCategory(category.key)}
              className="whitespace-nowrap"
            >
              {category.icon} {category.name}
            </Button>
          ))}
        </div>

        {/* Toggle completed sessions */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading text-gray-800">
            {selectedCategory === 'all' ? 'Semua Sesi' : selectedCategory}
          </h3>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showCompleted ? 'Sembunyikan yang selesai' : 'Tampilkan yang selesai'}
          </button>
        </div>

        {/* Sessions list */}
        <div className="space-y-3">
          {visibleSessions.length > 0 ? (
            visibleSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => onSessionClick(session)}
                variant="compact"
              />
            ))
          ) : (
            <Card className="text-center py-8">
              <div className="text-4xl mb-3">🌸</div>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'Belum ada sesi tersedia' 
                  : `Belum ada sesi di kategori ${selectedCategory}`}
              </p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Show sessions grouped by category
  return (
    <div className="space-y-8">
      {SESSION_CATEGORIES.map((category) => {
        const categorySessions = sessionsByCategory[category.key] || [];
        if (categorySessions.length === 0) return null;

        return (
          <div key={category.key} className="space-y-4">
            {/* Category header */}
            <Card className={`bg-gradient-to-r ${category.color} border-0`}>
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{category.icon}</div>
                <div>
                  <h3 className="font-heading text-lg text-gray-800">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>
              </div>
            </Card>

            {/* Category sessions */}
            <div className="grid gap-3">
              {categorySessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => onSessionClick(session)}
                  variant="detailed"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};