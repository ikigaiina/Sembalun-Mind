import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { bookmarkService } from '../../services/bookmarkService';
import type { UserBookmark } from '../../types/personalization';

interface BookmarkManagerProps {
  className?: string;
}

export const BookmarkManager: React.FC<BookmarkManagerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [stats, setStats] = useState<{
    totalBookmarks: number;
    favoriteBookmarks: number;
    recentlyAdded: number;
    categoryCounts: Record<string, number>;
    contentTypeCounts: Record<string, number>;
    mostUsedTags: Array<{tag: string; count: number}>;
  } | null>(null);
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);

  const loadStats = useCallback(async () => {
    if (!user) return;

    try {
      const bookmarkStats = await bookmarkService.getBookmarkStats(user.uid);
      setStats(bookmarkStats);
    } catch (error) {
      console.error('Error loading bookmark stats:', error);
    }
  }, [user]);

  const loadBookmarks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let userBookmarks;
      
      if (showFavoritesOnly) {
        userBookmarks = await bookmarkService.getFavoriteBookmarks(user.uid);
      } else {
        userBookmarks = await bookmarkService.getUserBookmarks(
          user.uid,
          selectedCategory !== 'all' ? selectedCategory : undefined,
          selectedContentType !== 'all' ? selectedContentType : undefined
        );
      }

      if (searchTerm) {
        userBookmarks = await bookmarkService.searchBookmarks(user.uid, searchTerm);
      }

      setBookmarks(userBookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [user, showFavoritesOnly, selectedCategory, selectedContentType, searchTerm]);

  useEffect(() => {
    if (user) {
      loadBookmarks();
      loadStats();
    }
  }, [user, loadBookmarks, loadStats]);

  const handleToggleFavorite = async (bookmarkId: string, currentStatus: boolean) => {
    try {
      await bookmarkService.toggleFavorite(bookmarkId, !currentStatus);
      setBookmarks(prev => prev.map(bookmark => 
        bookmark.id === bookmarkId 
          ? { ...bookmark, isFavorite: !currentStatus }
          : bookmark
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (window.confirm('Yakin ingin menghapus bookmark ini?')) {
      try {
        await bookmarkService.deleteBookmark(bookmarkId);
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
        await loadStats(); // Refresh stats
      } catch (error) {
        console.error('Error deleting bookmark:', error);
      }
    }
  };

  const handleBookmarkClick = async (bookmark: UserBookmark) => {
    // Mark as accessed
    await bookmarkService.markBookmarkAccessed(bookmark.id);
    
    // In a real app, this would navigate to the content
    console.log('Accessing bookmark:', bookmark.title);
  };

  const handleBulkAction = async (action: 'favorite' | 'unfavorite' | 'delete' | 'categorize') => {
    if (selectedBookmarks.length === 0) return;

    try {
      switch (action) {
        case 'favorite':
          await bookmarkService.bulkUpdateBookmarks(selectedBookmarks, { isFavorite: true });
          break;
        case 'unfavorite':
          await bookmarkService.bulkUpdateBookmarks(selectedBookmarks, { isFavorite: false });
          break;
        case 'delete':
          if (window.confirm(`Yakin ingin menghapus ${selectedBookmarks.length} bookmark?`)) {
            for (const bookmarkId of selectedBookmarks) {
              await bookmarkService.deleteBookmark(bookmarkId);
            }
          }
          break;
      }
      
      setSelectedBookmarks([]);
      await loadBookmarks();
      await loadStats();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    const icons = {
      session: '🧘',
      course: '📚',
      article: '📝',
      technique: '🎯',
      quote: '💭'
    };
    return icons[contentType as keyof typeof icons] || '📄';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      breathing: 'bg-blue-100 text-blue-800',
      mindfulness: 'bg-green-100 text-green-800',
      body_scan: 'bg-purple-100 text-purple-800',
      loving_kindness: 'bg-pink-100 text-pink-800',
      stress_relief: 'bg-orange-100 text-orange-800',
      siy: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Bookmark Saya</h3>
          <p className="text-gray-600">
            {stats?.totalBookmarks || 0} konten tersimpan
          </p>
        </div>
        <div className="text-3xl">🔖</div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalBookmarks}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.favoriteBookmarks}</div>
            <div className="text-sm text-yellow-600">Favorit</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.recentlyAdded}</div>
            <div className="text-sm text-green-600">Baru (7h)</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.categoryCounts).length}
            </div>
            <div className="text-sm text-purple-600">Kategori</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Cari bookmark..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadBookmarks()}
            />
          </div>
          <Button onClick={loadBookmarks} variant="outline">
            🔍 Cari
          </Button>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              showFavoritesOnly
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⭐ Favorit Saja
          </button>

          {/* Category filters */}
          {stats && Object.keys(stats.categoryCounts).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category} ({stats.categoryCounts[category]})
            </button>
          ))}

          {/* Content type filters */}
          {stats && Object.keys(stats.contentTypeCounts).map(contentType => (
            <button
              key={contentType}
              onClick={() => setSelectedContentType(selectedContentType === contentType ? 'all' : contentType)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedContentType === contentType
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getContentTypeIcon(contentType)} {contentType}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selectedBookmarks.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                {selectedBookmarks.length} bookmark dipilih
              </span>
              <div className="flex space-x-2">
                <Button
                  size="small"
                  onClick={() => handleBulkAction('favorite')}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  ⭐ Favoritkan
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  🗑️ Hapus
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => setSelectedBookmarks([])}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔖</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Tidak ada hasil' : 'Belum ada bookmark'}
          </h4>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Coba ubah kata kunci pencarian'
              : 'Mulai bookmark konten favorit Anda'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {/* Checkbox for bulk selection */}
                <input
                  type="checkbox"
                  checked={selectedBookmarks.includes(bookmark.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBookmarks(prev => [...prev, bookmark.id]);
                    } else {
                      setSelectedBookmarks(prev => prev.filter(id => id !== bookmark.id));
                    }
                  }}
                  className="mt-1"
                />

                {/* Content icon */}
                <div className="text-2xl flex-shrink-0">
                  {getContentTypeIcon(bookmark.contentType)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 
                      className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleBookmarkClick(bookmark)}
                    >
                      {bookmark.title}
                    </h4>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                      <button
                        onClick={() => handleToggleFavorite(bookmark.id, bookmark.isFavorite)}
                        className={`text-lg ${bookmark.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                      >
                        ⭐
                      </button>
                      <button
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {bookmark.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {bookmark.description}
                    </p>
                  )}

                  {/* Tags and category */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(bookmark.category)}`}>
                      {bookmark.category}
                    </span>
                    
                    {bookmark.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    
                    {bookmark.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{bookmark.tags.length - 3} lagi
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {bookmark.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 italic">
                        💭 {bookmark.notes}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Disimpan: {formatDate(bookmark.createdAt)}</span>
                    {bookmark.lastAccessedAt && (
                      <span>Terakhir diakses: {formatDate(bookmark.lastAccessedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Most Used Tags */}
      {stats && stats.mostUsedTags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Tag Populer</h4>
          <div className="flex flex-wrap gap-2">
            {stats.mostUsedTags.slice(0, 10).map((tagInfo, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors"
                onClick={() => {
                  setSearchTerm(tagInfo.tag);
                  loadBookmarks();
                }}
              >
                #{tagInfo.tag} ({tagInfo.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};