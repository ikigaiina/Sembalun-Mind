import { offlineStorageService } from './offlineStorageService';

export interface AudioBookmark {
  id: string;
  sessionId: string;
  title: string;
  timestamp: number; // seconds into the audio
  description?: string;
  tags: string[];
  isPrivate: boolean;
  createdAt: Date;
  lastAccessed?: Date;
  playCount: number;
  rating?: number; // 1-5 stars
  color?: string; // bookmark color/category
}

export interface BookmarkCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

export interface BookmarkPlaylist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  bookmarkIds: string[];
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
  coverImage?: string;
}

export interface BookmarkStats {
  totalBookmarks: number;
  mostUsedSessions: Array<{ sessionId: string; count: number; title: string }>;
  favoriteCategories: Array<{ category: string; count: number }>;
  averageTimestamp: number;
  recentBookmarks: AudioBookmark[];
}

export interface BookmarkExport {
  bookmarks: AudioBookmark[];
  playlists: BookmarkPlaylist[];
  categories: BookmarkCategory[];
  exportDate: Date;
  version: string;
}

export class AudioBookmarkService {
  private static instance: AudioBookmarkService;
  private bookmarksCache: Map<string, AudioBookmark[]> = new Map();
  private categoriesCache: BookmarkCategory[] = [];

  static getInstance(): AudioBookmarkService {
    if (!AudioBookmarkService.instance) {
      AudioBookmarkService.instance = new AudioBookmarkService();
    }
    return AudioBookmarkService.instance;
  }

  constructor() {
    this.initializeCategories();
  }

  private initializeCategories(): void {
    this.categoriesCache = [
      {
        id: 'insights',
        name: 'Insights',
        color: '#3B82F6',
        icon: '💡',
        description: 'Moments of clarity and understanding'
      },
      {
        id: 'calm',
        name: 'Calming',
        color: '#10B981',
        icon: '🌊',
        description: 'Peaceful and relaxing moments'
      },
      {
        id: 'motivation',
        name: 'Motivational',
        color: '#F59E0B',
        icon: '🔥',
        description: 'Inspiring and energizing moments'
      },
      {
        id: 'technique',
        name: 'Technique',
        color: '#8B5CF6',
        icon: '🎯',
        description: 'Important meditation techniques'
      },
      {
        id: 'personal',
        name: 'Personal',
        color: '#EF4444',
        icon: '❤️',
        description: 'Personally meaningful moments'
      }
    ];
  }

  async createBookmark(
    userId: string,
    sessionId: string,
    timestamp: number,
    bookmarkData: {
      title: string;
      description?: string;
      tags?: string[];
      color?: string;
      rating?: number;
    }
  ): Promise<string> {
    try {
      const bookmark: AudioBookmark = {
        id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        sessionId,
        title: bookmarkData.title,
        timestamp,
        description: bookmarkData.description,
        tags: bookmarkData.tags || [],
        isPrivate: true,
        createdAt: new Date(),
        playCount: 0,
        rating: bookmarkData.rating,
        color: bookmarkData.color || '#3B82F6'
      };

      // Save to storage
      await this.saveBookmarkToStorage(bookmark);
      
      // Update cache
      const userBookmarks = this.bookmarksCache.get(userId) || [];
      userBookmarks.push(bookmark);
      this.bookmarksCache.set(userId, userBookmarks);

      console.log('Audio bookmark created:', bookmark.id);
      return bookmark.id;
    } catch (error) {
      console.error('Error creating bookmark:', error);
      throw error;
    }
  }

  async getUserBookmarks(
    userId: string,
    sessionId?: string,
    limit?: number
  ): Promise<AudioBookmark[]> {
    try {
      // Check cache first
      let bookmarks = this.bookmarksCache.get(userId);
      
      if (!bookmarks) {
        // Load from storage
        bookmarks = await this.loadBookmarksFromStorage(userId);
        this.bookmarksCache.set(userId, bookmarks);
      }

      // Filter by session if provided
      if (sessionId) {
        bookmarks = bookmarks.filter(b => b.sessionId === sessionId);
      }

      // Sort by creation date (newest first)
      bookmarks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply limit if provided
      if (limit) {
        bookmarks = bookmarks.slice(0, limit);
      }

      return bookmarks;
    } catch (error) {
      console.error('Error getting user bookmarks:', error);
      return [];
    }
  }

  async getBookmarkById(userId: string, bookmarkId: string): Promise<AudioBookmark | null> {
    try {
      const bookmarks = await this.getUserBookmarks(userId);
      return bookmarks.find(b => b.id === bookmarkId) || null;
    } catch (error) {
      console.error('Error getting bookmark by ID:', error);
      return null;
    }
  }

  async updateBookmark(
    userId: string,
    bookmarkId: string,
    updates: Partial<AudioBookmark>
  ): Promise<void> {
    try {
      const bookmarks = this.bookmarksCache.get(userId) || [];
      const bookmarkIndex = bookmarks.findIndex(b => b.id === bookmarkId);
      
      if (bookmarkIndex === -1) {
        throw new Error('Bookmark not found');
      }

      // Update bookmark
      bookmarks[bookmarkIndex] = { ...bookmarks[bookmarkIndex], ...updates };
      
      // Save to storage
      await this.saveBookmarkToStorage(bookmarks[bookmarkIndex]);
      
      // Update cache
      this.bookmarksCache.set(userId, bookmarks);

      console.log('Bookmark updated:', bookmarkId);
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  }

  async deleteBookmark(userId: string, bookmarkId: string): Promise<void> {
    try {
      const bookmarks = this.bookmarksCache.get(userId) || [];
      const filteredBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
      
      // Update cache
      this.bookmarksCache.set(userId, filteredBookmarks);
      
      // Delete from storage
      await this.deleteBookmarkFromStorage(bookmarkId);

      console.log('Bookmark deleted:', bookmarkId);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  }

  async playBookmark(userId: string, bookmarkId: string): Promise<AudioBookmark> {
    try {
      const bookmark = await this.getBookmarkById(userId, bookmarkId);
      
      if (!bookmark) {
        throw new Error('Bookmark not found');
      }

      // Increment play count and update last accessed
      await this.updateBookmark(userId, bookmarkId, {
        playCount: bookmark.playCount + 1,
        lastAccessed: new Date()
      });

      return { ...bookmark, playCount: bookmark.playCount + 1, lastAccessed: new Date() };
    } catch (error) {
      console.error('Error playing bookmark:', error);
      throw error;
    }
  }

  async searchBookmarks(
    userId: string,
    query: string,
    filters?: {
      sessionId?: string;
      tags?: string[];
      category?: string;
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<AudioBookmark[]> {
    try {
      let bookmarks = await this.getUserBookmarks(userId);

      // Text search
      if (query) {
        const lowerQuery = query.toLowerCase();
        bookmarks = bookmarks.filter(bookmark =>
          bookmark.title.toLowerCase().includes(lowerQuery) ||
          bookmark.description?.toLowerCase().includes(lowerQuery) ||
          bookmark.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      }

      // Apply filters
      if (filters) {
        if (filters.sessionId) {
          bookmarks = bookmarks.filter(b => b.sessionId === filters.sessionId);
        }

        if (filters.tags && filters.tags.length > 0) {
          bookmarks = bookmarks.filter(b =>
            filters.tags!.some(tag => b.tags.includes(tag))
          );
        }

        if (filters.category) {
          bookmarks = bookmarks.filter(b => b.tags.includes(filters.category!));
        }

        if (filters.dateRange) {
          bookmarks = bookmarks.filter(b =>
            b.createdAt >= filters.dateRange!.start &&
            b.createdAt <= filters.dateRange!.end
          );
        }
      }

      return bookmarks;
    } catch (error) {
      console.error('Error searching bookmarks:', error);
      return [];
    }
  }

  async createBookmarkPlaylist(
    userId: string,
    playlistData: {
      name: string;
      description?: string;
      bookmarkIds: string[];
      isShared?: boolean;
    }
  ): Promise<string> {
    try {
      const playlist: BookmarkPlaylist = {
        id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        name: playlistData.name,
        description: playlistData.description,
        bookmarkIds: playlistData.bookmarkIds,
        isShared: playlistData.isShared || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.savePlaylistToStorage(playlist);
      console.log('Bookmark playlist created:', playlist.id);
      return playlist.id;
    } catch (error) {
      console.error('Error creating bookmark playlist:', error);
      throw error;
    }
  }

  async getUserPlaylists(userId: string): Promise<BookmarkPlaylist[]> {
    try {
      return await this.loadPlaylistsFromStorage();
    } catch (error) {
      console.error('Error getting user playlists:', error);
      return [];
    }
  }

  async getBookmarkStats(userId: string): Promise<BookmarkStats> {
    try {
      const bookmarks = await this.getUserBookmarks(userId);
      
      if (bookmarks.length === 0) {
        return {
          totalBookmarks: 0,
          mostUsedSessions: [],
          favoriteCategories: [],
          averageTimestamp: 0,
          recentBookmarks: []
        };
      }

      // Calculate most used sessions
      const sessionCounts = bookmarks.reduce((acc, bookmark) => {
        acc[bookmark.sessionId] = (acc[bookmark.sessionId] || 0) + bookmark.playCount;
        return acc;
      }, {} as Record<string, number>);

      const mostUsedSessions = Object.entries(sessionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([sessionId, count]) => ({
          sessionId,
          count,
          title: `Session ${sessionId}` // Would get actual title from session data
        }));

      // Calculate favorite categories
      const categoryCounts = bookmarks.reduce((acc, bookmark) => {
        bookmark.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      const favoriteCategories = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      // Calculate average timestamp
      const averageTimestamp = bookmarks.reduce((sum, bookmark) => sum + bookmark.timestamp, 0) / bookmarks.length;

      // Get recent bookmarks
      const recentBookmarks = bookmarks
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      return {
        totalBookmarks: bookmarks.length,
        mostUsedSessions,
        favoriteCategories,
        averageTimestamp,
        recentBookmarks
      };
    } catch (error) {
      console.error('Error getting bookmark stats:', error);
      return {
        totalBookmarks: 0,
        mostUsedSessions: [],
        favoriteCategories: [],
        averageTimestamp: 0,
        recentBookmarks: []
      };
    }
  }

  async exportBookmarks(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const [bookmarks, playlists] = await Promise.all([
        this.getUserBookmarks(userId),
        this.getUserPlaylists(userId)
      ]);

      const exportData: BookmarkExport = {
        bookmarks,
        playlists,
        categories: this.categoriesCache,
        exportDate: new Date(),
        version: '1.0'
      };

      if (format === 'json') {
        return JSON.stringify(exportData, null, 2);
      } else {
        return this.convertToCSV(bookmarks);
      }
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
      throw error;
    }
  }

  async importBookmarks(userId: string, importData: string, format: 'json' | 'csv' = 'json'): Promise<number> {
    try {
      let bookmarks: AudioBookmark[] = [];

      if (format === 'json') {
        const parsedData: BookmarkExport = JSON.parse(importData);
        bookmarks = parsedData.bookmarks || [];
      } else {
        bookmarks = this.parseCSV(importData, userId);
      }

      // Import bookmarks
      let importedCount = 0;
      for (const bookmark of bookmarks) {
        try {
          // Update user ID and create new ID
          bookmark.userId = userId;
          bookmark.id = `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          await this.saveBookmarkToStorage(bookmark);
          importedCount++;
        } catch (error) {
          console.error('Error importing bookmark:', error);
        }
      }

      // Clear cache to force reload
      this.bookmarksCache.delete(userId);

      console.log(`Imported ${importedCount} bookmarks`);
      return importedCount;
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      throw error;
    }
  }

  getBookmarkCategories(): BookmarkCategory[] {
    return this.categoriesCache;
  }

  async quickBookmark(
    userId: string,
    sessionId: string,
    timestamp: number,
    title: string = 'Quick Bookmark'
  ): Promise<string> {
    return await this.createBookmark(userId, sessionId, timestamp, {
      title,
      tags: ['quick'],
      color: '#10B981'
    });
  }

  // Private helper methods
  private async saveBookmarkToStorage(bookmark: AudioBookmark): Promise<void> {
    const key = `bookmark_${bookmark.id}`;
    await offlineStorageService.setSetting(key, bookmark);
  }

  private async loadBookmarksFromStorage(userId: string): Promise<AudioBookmark[]> {
    // This is a simplified implementation
    // In a real app, you'd have a proper index of user bookmarks
    const bookmarks: AudioBookmark[] = [];
    
    // Mock loading - would query actual storage
    for (let i = 0; i < 10; i++) {
      const key = `bookmark_user_${userId}_${i}`;
      const bookmark = await offlineStorageService.getSetting(key);
      if (bookmark) {
        bookmarks.push(bookmark);
      }
    }
    
    return bookmarks;
  }

  private async deleteBookmarkFromStorage(bookmarkId: string): Promise<void> {
    const key = `bookmark_${bookmarkId}`;
    await offlineStorageService.setSetting(key, null);
  }

  private async savePlaylistToStorage(playlist: BookmarkPlaylist): Promise<void> {
    const key = `playlist_${playlist.id}`;
    await offlineStorageService.setSetting(key, playlist);
  }

  private async loadPlaylistsFromStorage(): Promise<BookmarkPlaylist[]> {
    // Mock implementation - would query actual storage
    return [];
  }

  private convertToCSV(bookmarks: AudioBookmark[]): string {
    const rows = bookmarks.map(bookmark => [
      bookmark.id,
      bookmark.sessionId,
      bookmark.title,
      bookmark.timestamp.toString(),
      bookmark.description || '',
      bookmark.tags.join(';'),
      bookmark.createdAt.toISOString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private parseCSV(csvData: string, userId: string): AudioBookmark[] {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',');
      const createdAtDate = new Date(values[6]);
      return {
        id: `imported-${Date.now()}-${index}`,
        userId,
        sessionId: values[1] || '',
        title: values[2] || 'Imported Bookmark',
        timestamp: parseFloat(values[3]) || 0,
        description: values[4] || '',
        tags: values[5] ? values[5].split(';') : [],
        isPrivate: true,
        createdAt: isNaN(createdAtDate.getTime()) ? new Date() : createdAtDate,
        playCount: 0
      };
    });
  }
}

export const audioBookmarkService = AudioBookmarkService.getInstance();