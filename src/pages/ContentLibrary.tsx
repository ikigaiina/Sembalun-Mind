import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Clock, Star, Play, Download, Bookmark, Share } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EnhancedAudioPlayer } from '../components/ui/EnhancedAudioPlayer';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'guided' | 'music' | 'nature' | 'course' | 'story';
  category: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  plays: number;
  isBookmarked: boolean;
  isPremium: boolean;
  audioUrl?: string;
  imageUrl: string;
  instructor?: string;
  tags: string[];
  language: 'id' | 'en';
  createdAt: Date;
  updatedAt: Date;
}

interface ContentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  itemCount: number;
}

const ContentLibrary: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'duration' | 'rating'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [playingContent, setPlayingContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    
    try {
      // Try to get from cache first
      let cachedContent = ContentCacheManager.getCachedMeditationSessions();
      
      if (cachedContent) {
        console.log('📦 Loading content from cache');
        setContent(cachedContent);
        setFilteredContent(cachedContent);
      } else {
        console.log('🔄 Loading fresh content');
        // Mock data - in real app, fetch from content service
        const mockCategories: ContentCategory[] = [
      { id: 'mindfulness', name: 'Mindfulness', description: 'Present moment awareness', icon: '🧘‍♀️', color: '#10B981', itemCount: 45 },
      { id: 'sleep', name: 'Sleep', description: 'Better rest and dreams', icon: '😴', color: '#3B82F6', itemCount: 32 },
      { id: 'stress', name: 'Stress Relief', description: 'Calm your mind', icon: '🌿', color: '#10B981', itemCount: 28 },
      { id: 'focus', name: 'Focus', description: 'Improve concentration', icon: '🎯', color: '#F59E0B', itemCount: 38 },
      { id: 'emotional', name: 'Emotional Wellness', description: 'Process emotions', icon: '💖', color: '#EC4899', itemCount: 24 },
      { id: 'movement', name: 'Movement', description: 'Mindful movement', icon: '🤸‍♀️', color: '#8B5CF6', itemCount: 18 },
      { id: 'cultural', name: 'Cultural Wisdom', description: 'Indonesian traditions', icon: '🏛️', color: '#D97706', itemCount: 16 },
      { id: 'siy', name: 'Search Inside Yourself', description: 'Emotional intelligence', icon: '🎯', color: '#2563EB', itemCount: 22 },
      { id: 'seasonal', name: 'Seasonal Content', description: 'Special occasions', icon: '🎉', color: '#DC2626', itemCount: 8 },
      { id: 'interactive', name: 'Interactive', description: 'Engaging experiences', icon: '🎮', color: '#7C3AED', itemCount: 12 }
    ];

    const mockContent: ContentItem[] = [
      {
        id: '1',
        title: 'Meditasi Pagi: Memulai Hari dengan Kesadaran',
        description: 'Sesi meditasi 10 menit untuk memulai hari dengan penuh kesadaran dan energi positif.',
        type: 'guided',
        category: 'mindfulness',
        duration: 10,
        difficulty: 'beginner',
        rating: 4.8,
        plays: 12480,
        isBookmarked: true,
        isPremium: false,
        audioUrl: '/audio/morning-meditation.mp3',
        imageUrl: '/images/morning-meditation.jpg',
        instructor: 'Dr. Sari Mindful',
        tags: ['pagi', 'energi', 'kesadaran', 'pemula'],
        language: 'id',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'Suara Alam: Hujan Tropis',
        description: 'Rekaman alami suara hujan tropis untuk relaksasi dan fokus mendalam.',
        type: 'nature',
        category: 'sleep',
        duration: 30,
        difficulty: 'beginner',
        rating: 4.6,
        plays: 8932,
        isBookmarked: false,
        isPremium: false,
        audioUrl: '/audio/tropical-rain.mp3',
        imageUrl: '/images/tropical-rain.jpg',
        tags: ['alam', 'hujan', 'relaksasi', 'tidur'],
        language: 'id',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: '3',
        title: 'Breathing for Stress Relief',
        description: 'Advanced breathing techniques to manage stress and anxiety effectively.',
        type: 'guided',
        category: 'stress',
        duration: 15,
        difficulty: 'intermediate',
        rating: 4.9,
        plays: 15643,
        isBookmarked: true,
        isPremium: true,
        audioUrl: '/audio/stress-breathing.mp3',
        imageUrl: '/images/stress-relief.jpg',
        instructor: 'Dr. Michael Breathe',
        tags: ['breathing', 'stress', 'anxiety', 'intermediate'],
        language: 'en',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08')
      },
      {
        id: '4',
        title: 'Cerita Pengantar Tidur: Hutan Ajaib',
        description: 'Cerita menenangkan tentang perjalanan melalui hutan ajaib untuk membantu tidur.',
        type: 'story',
        category: 'sleep',
        duration: 25,
        difficulty: 'beginner',
        rating: 4.7,
        plays: 6789,
        isBookmarked: false,
        isPremium: true,
        audioUrl: '/audio/magical-forest.mp3',
        imageUrl: '/images/magical-forest.jpg',
        instructor: 'Narrasi Mimpi',
        tags: ['cerita', 'tidur', 'hutan', 'relaksasi'],
        language: 'id',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05')
      },
      {
        id: '5',
        title: 'Fokus Deep Work: 45 Menit',
        description: 'Musik instrumental yang dirancang khusus untuk sesi deep work dan produktivitas.',
        type: 'music',
        category: 'focus',
        duration: 45,
        difficulty: 'beginner',
        rating: 4.5,
        plays: 11234,
        isBookmarked: true,
        isPremium: false,
        audioUrl: '/audio/deep-work-music.mp3',
        imageUrl: '/images/deep-work.jpg',
        tags: ['musik', 'fokus', 'produktivitas', 'kerja'],
        language: 'id',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03')
      },
      // Additional diverse content
      {
        id: '6',
        title: 'Meditasi Ramadan: Refleksi Spiritual',
        description: 'Meditasi khusus untuk bulan suci Ramadan dengan nilai-nilai spiritual Islam.',
        type: 'guided',
        category: 'seasonal',
        duration: 15,
        difficulty: 'intermediate',
        rating: 4.9,
        plays: 8500,
        isBookmarked: false,
        isPremium: true,
        audioUrl: '/audio/ramadan-meditation.mp3',
        imageUrl: '/images/ramadan-meditation.jpg',
        instructor: 'Ustaz Ahmad Mindful',
        tags: ['ramadan', 'islam', 'spiritual', 'refleksi'],
        language: 'id',
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },
      {
        id: '7',
        title: 'SIY: Emotional Intelligence untuk Pemimpin',
        description: 'Program Search Inside Yourself untuk mengembangkan kecerdasan emosi dan kepemimpinan.',
        type: 'course',
        category: 'siy',
        duration: 30,
        difficulty: 'advanced',
        rating: 4.8,
        plays: 3200,
        isBookmarked: true,
        isPremium: true,
        audioUrl: '/audio/siy-leadership.mp3',
        imageUrl: '/images/siy-leadership.jpg',
        instructor: 'Dr. Sarah Leadership',
        tags: ['siy', 'leadership', 'emotional-intelligence', 'pemimpin'],
        language: 'id',
        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-04-01')
      },
      {
        id: '8',
        title: 'Tantangan Napas 21 Hari',
        description: 'Program interaktif 21 hari untuk menguasai berbagai teknik pernapasan.',
        type: 'course',
        category: 'interactive',
        duration: 14,
        difficulty: 'intermediate',
        rating: 4.7,
        plays: 5600,
        isBookmarked: false,
        isPremium: true,
        audioUrl: '/audio/breathing-challenge.mp3',
        imageUrl: '/images/breathing-challenge.jpg',
        instructor: 'Master Breath Indonesia',
        tags: ['tantangan', 'napas', 'interaktif', '21-hari'],
        language: 'id',
        createdAt: new Date('2024-05-15'),
        updatedAt: new Date('2024-05-15')
      }
    ];

        setCategories(mockCategories);
        setContent(mockContent);
        setFilteredContent(mockContent);
        
        // Cache the content for future use
        // ContentCacheManager.cacheMeditationSessions(mockContent, 10 * 60 * 1000);
        
        // Preload images
        // const imageUrls = mockContent.map(item => item.imageUrl);
        // ImageCache.preloadImages(imageUrls);
      }
      
      // Load user favorites from localStorage
      const savedFavorites = localStorage.getItem('sembalun-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortContent = useCallback(() => {
    let filtered = [...content];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(item => item.difficulty === selectedDifficulty);
    }

    // Apply language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(item => item.language === selectedLanguage);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return b.plays - a.plays;
        case 'duration':
          return a.duration - b.duration;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredContent(filtered);
  }, [content, searchQuery, selectedCategory, selectedType, selectedDifficulty, selectedLanguage, sortBy]);

  useEffect(() => {
    filterAndSortContent();
  }, [filterAndSortContent]);

  const handlePlay = (item: ContentItem) => {
    setPlayingContent(item);
  };

  const handleBookmark = (itemId: string) => {
    setContent(prev => prev.map(item => 
      item.id === itemId ? { ...item, isBookmarked: !item.isBookmarked } : item
    ));
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guided': return '🧘‍♀️';
      case 'music': return '🎵';
      case 'nature': return '🌿';
      case 'story': return '📖';
      case 'course': return '🎓';
      default: return '🎧';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading content library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Library</h1>
          <p className="text-gray-600">Discover guided meditations, music, and courses</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'duration' | 'rating')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="duration">Duration</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="guided">Guided</option>
                    <option value="music">Music</option>
                    <option value="nature">Nature</option>
                    <option value="story">Story</option>
                    <option value="course">Course</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Languages</option>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  selectedCategory === category.id
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <h3 className="font-medium text-sm">{category.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{category.itemCount} items</p>
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'} found
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContent.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  {item.isPremium && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                      Premium
                    </div>
                  )}
                  <button
                    onClick={() => handlePlay(item)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 rounded-t-lg group"
                  >
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(item.type)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBookmark(item.id)}
                      className={`p-1 rounded-full transition-colors duration-200 ${
                        item.isBookmarked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                  {item.instructor && (
                    <p className="text-xs text-gray-500 mb-2">by {item.instructor}</p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(item.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="primary"
                      onClick={() => handlePlay(item)}
                      className="text-sm py-2 px-4"
                    >
                      Play
                    </Button>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <Share className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedType('all');
                setSelectedDifficulty('all');
                setSelectedLanguage('all');
              }}
            >
              Bersihkan semua filter
            </Button>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {playingContent && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <EnhancedAudioPlayer
            title={playingContent.title}
            artist={playingContent.instructor || 'Unknown'}
            audioUrl={playingContent.audioUrl || ''}
            onClose={() => setPlayingContent(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ContentLibrary;