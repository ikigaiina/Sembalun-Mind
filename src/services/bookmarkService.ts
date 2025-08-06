import { typedSupabase as supabase } from '../config/supabase';
import type { UserBookmark } from '../types/personalization';

export class BookmarkService {
  private static instance: BookmarkService;

  static getInstance(): BookmarkService {
    if (!BookmarkService.instance) {
      BookmarkService.instance = new BookmarkService();
    }
    return BookmarkService.instance;
  }

  async createBookmark(
    userId: string, 
    bookmark: Omit<UserBookmark, 'id' | 'userId' | 'createdAt' | 'lastAccessedAt'>
  ): Promise<string> {
    try {
      // Check if bookmark already exists
      const existingBookmark = await this.getBookmarkByContent(userId, bookmark.contentId, bookmark.contentType);
      if (existingBookmark) {
        throw new Error('Content sudah di-bookmark');
      }

      const bookmarkData: Omit<UserBookmark, 'id'> = {
        userId,
        ...bookmark,
        createdAt: new Date(),
        lastAccessedAt: undefined
      };

      const { data, error } = await supabase
        .from('user_bookmarks')
        .insert({
          user_id: bookmarkData.userId,
          content_id: bookmarkData.contentId,
          content_type: bookmarkData.contentType,
          title: bookmarkData.title,
          description: bookmarkData.description,
          category: bookmarkData.category,
          tags: bookmarkData.tags,
          notes: bookmarkData.notes,
          is_favorite: bookmarkData.isFavorite,
          created_at: bookmarkData.createdAt.toISOString(),
          last_accessed_at: bookmarkData.lastAccessedAt?.toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create bookmark');
      return data.id;
    } catch (error) {
      console.error('Error creating bookmark:', error);
      throw error;
    }
  }

  async getUserBookmarks(
    userId: string, 
    category?: string, 
    contentType?: string,
    limit_count: number = 50
  ): Promise<UserBookmark[]> {
    try {
      let queryBuilder = supabase
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit_count);

      if (category) {
        queryBuilder = queryBuilder.eq('category', category);
      }

      if (contentType) {
        queryBuilder = queryBuilder.eq('content_type', contentType);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        contentId: row.content_id,
        contentType: row.content_type,
        title: row.title,
        description: row.description,
        category: row.category,
        tags: row.tags,
        notes: row.notes,
        isFavorite: row.is_favorite,
        createdAt: new Date(row.created_at),
        lastAccessedAt: row.last_accessed_at ? new Date(row.last_accessed_at) : undefined
      })) as UserBookmark[];
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }

  async getFavoriteBookmarks(userId: string, limit_count: number = 20): Promise<UserBookmark[]> {
    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .order('last_accessed_at', { ascending: false })
        .limit(limit_count);

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        contentId: row.content_id,
        contentType: row.content_type,
        title: row.title,
        description: row.description,
        category: row.category,
        tags: row.tags,
        notes: row.notes,
        isFavorite: row.is_favorite,
        createdAt: new Date(row.created_at),
        lastAccessedAt: row.last_accessed_at ? new Date(row.last_accessed_at) : undefined
      })) as UserBookmark[];
    } catch (error) {
      console.error('Error fetching favorite bookmarks:', error);
      return [];
    }
  }

  async updateBookmark(
    bookmarkId: string, 
    updates: Partial<Pick<UserBookmark, 'notes' | 'tags' | 'isFavorite'>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .update({
          notes: updates.notes,
          tags: updates.tags,
          is_favorite: updates.isFavorite
        })
        .eq('id', bookmarkId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  }

  async markBookmarkAccessed(bookmarkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', bookmarkId);
      if (error) throw error;
    } catch (error) {
      console.error('Error marking bookmark as accessed:', error);
    }
  }

  async toggleFavorite(bookmarkId: string, isFavorite: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .update({ is_favorite: isFavorite })
        .eq('id', bookmarkId);
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  async deleteBookmark(bookmarkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('id', bookmarkId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  }

    async getBookmarkByContent(
    userId: string, 
    contentId: string, 
    contentType: string
  ): Promise<UserBookmark | null> {
    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const row = data[0];
      return {
        id: row.id,
        userId: row.user_id,
        contentId: row.content_id,
        contentType: row.content_type,
        title: row.title,
        description: row.description,
        category: row.category,
        tags: row.tags,
        notes: row.notes,
        isFavorite: row.is_favorite,
        createdAt: new Date(row.created_at),
        lastAccessedAt: row.last_accessed_at ? new Date(row.last_accessed_at) : undefined
      } as UserBookmark;
    } catch (error) {
      console.error('Error getting bookmark by content:', error);
      return null;
    }
  }

  async searchBookmarks(
    userId: string, 
    searchTerm: string, 
    tags?: string[]
  ): Promise<UserBookmark[]> {
    try {
      let queryBuilder = supabase
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Supabase has full-text search capabilities, but for simplicity and to match
      // the original client-side filtering logic, we'll fetch all and filter.
      // For large datasets, consider Supabase's text search features.
      const { data, error } = await queryBuilder;
      if (error) throw error;

      let bookmarks = data.map(row => ({
        id: row.id,
        userId: row.user_id,
        contentId: row.content_id,
        contentType: row.content_type,
        title: row.title,
        description: row.description,
        category: row.category,
        tags: row.tags,
        notes: row.notes,
        isFavorite: row.is_favorite,
        createdAt: new Date(row.created_at),
        lastAccessedAt: row.last_accessed_at ? new Date(row.last_accessed_at) : undefined
      })) as UserBookmark[];

      // Filter by search term (client-side filtering since Supabase has limited text search on multiple columns)
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        bookmarks = bookmarks.filter(bookmark => 
          bookmark.title.toLowerCase().includes(lowerSearchTerm) ||
          bookmark.description?.toLowerCase().includes(lowerSearchTerm) ||
          bookmark.notes?.toLowerCase().includes(lowerSearchTerm) ||
          bookmark.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
        );
      }

      // Filter by tags
      if (tags && tags.length > 0) {
        bookmarks = bookmarks.filter(bookmark =>
          tags.some(tag => bookmark.tags.includes(tag))
        );
      }

      return bookmarks;
    } catch (error) {
      console.error('Error searching bookmarks:', error);
      return [];
    }
  }

  async getBookmarksByCategory(userId: string): Promise<{ [category: string]: UserBookmark[] }> {
    try {
      const bookmarks = await this.getUserBookmarks(userId);
      const categorized: { [category: string]: UserBookmark[] } = {};

      bookmarks.forEach(bookmark => {
        if (!categorized[bookmark.category]) {
          categorized[bookmark.category] = [];
        }
        categorized[bookmark.category].push(bookmark);
      });

      return categorized;
    } catch (error) {
      console.error('Error getting bookmarks by category:', error);
      return {};
    }
  }

  async getMostAccessedBookmarks(userId: string, limit_count: number = 10): Promise<UserBookmark[]> {
    try {
      // Since Firestore doesn't have a direct way to order by access frequency,
      // we'll get all bookmarks and sort client-side based on lastAccessedAt
      const bookmarks = await this.getUserBookmarks(userId);
      
      return bookmarks
        .filter(bookmark => bookmark.lastAccessedAt)
        .sort((a, b) => {
          if (!a.lastAccessedAt) return 1;
          if (!b.lastAccessedAt) return -1;
          return b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime();
        })
        .slice(0, limit_count);
    } catch (error) {
      console.error('Error getting most accessed bookmarks:', error);
      return [];
    }
  }

  async getBookmarkStats(userId: string): Promise<{
    totalBookmarks: number;
    favoriteBookmarks: number;
    categoryCounts: { [category: string]: number };
    contentTypeCounts: { [contentType: string]: number };
    recentlyAdded: number; // last 7 days
    mostUsedTags: { tag: string; count: number }[];
  }> {
    try {
      const bookmarks = await this.getUserBookmarks(userId);
      
      const totalBookmarks = bookmarks.length;
      const favoriteBookmarks = bookmarks.filter(b => b.isFavorite).length;
      
      // Category counts
      const categoryCounts: { [category: string]: number } = {};
      bookmarks.forEach(bookmark => {
        categoryCounts[bookmark.category] = (categoryCounts[bookmark.category] || 0) + 1;
      });

      // Content type counts
      const contentTypeCounts: { [contentType: string]: number } = {};
      bookmarks.forEach(bookmark => {
        contentTypeCounts[bookmark.contentType] = (contentTypeCounts[bookmark.contentType] || 0) + 1;
      });

      // Recently added (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentlyAdded = bookmarks.filter(b => b.createdAt >= weekAgo).length;

      // Most used tags
      const tagCounts: { [tag: string]: number } = {};
      bookmarks.forEach(bookmark => {
        bookmark.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const mostUsedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalBookmarks,
        favoriteBookmarks,
        categoryCounts,
        contentTypeCounts,
        recentlyAdded,
        mostUsedTags
      };
    } catch (error) {
      console.error('Error getting bookmark stats:', error);
      return {
        totalBookmarks: 0,
        favoriteBookmarks: 0,
        categoryCounts: {},
        contentTypeCounts: {},
        recentlyAdded: 0,
        mostUsedTags: []
      };
    }
  }

  async bulkUpdateBookmarks(
    bookmarkIds: string[], 
    updates: Partial<Pick<UserBookmark, 'tags' | 'category' | 'isFavorite'>>
  ): Promise<void> {
    try {
      const updatePayload = {
        tags: updates.tags,
        category: updates.category,
        is_favorite: updates.isFavorite
      };

      const { error } = await supabase
        .from('user_bookmarks')
        .update(updatePayload)
        .in('id', bookmarkIds);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error bulk updating bookmarks:', error);
      throw error;
    }
  }

  async exportBookmarks(userId: string): Promise<UserBookmark[]> {
    try {
      return await this.getUserBookmarks(userId, undefined, undefined, 1000); // Get all bookmarks
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
      return [];
    }
  }

  async importBookmarks(userId: string, bookmarks: Omit<UserBookmark, 'id' | 'userId' | 'createdAt'>[]): Promise<number> {
    try {
      let importedCount = 0;
      
      for (const bookmark of bookmarks) {
        try {
          // Check if bookmark already exists
          const existing = await this.getBookmarkByContent(userId, bookmark.contentId, bookmark.contentType);
          if (!existing) {
            await this.createBookmark(userId, bookmark);
            importedCount++;
          }
        } catch (error) {
          console.warn('Error importing individual bookmark:', error);
        }
      }
      
      return importedCount;
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      return 0;
    }
  }

  // Helper method to suggest tags based on content
  suggestTags(title: string, description?: string, category?: string): string[] {
    const suggestedTags: string[] = [];
    const content = `${title} ${description || ''}`.toLowerCase();

    // Category-based tags
    if (category) {
      suggestedTags.push(category);
    }

    // Content-based tag suggestions
    const tagMap = {
      'stress': ['stress-relief', 'relaxation'],
      'sleep': ['sleep', 'bedtime'],
      'focus': ['focus', 'concentration'],
      'anxiety': ['anxiety', 'calm'],
      'breathing': ['breathing', 'pranayama'],
      'mindfulness': ['mindfulness', 'awareness'],
      'body': ['body-scan', 'physical'],
      'emotion': ['emotional', 'feelings'],
      'beginner': ['beginner', 'basics'],
      'advanced': ['advanced', 'expert'],
      'quick': ['quick', 'short'],
      'long': ['extended', 'deep']
    };

    Object.entries(tagMap).forEach(([keyword, tags]) => {
      if (content.includes(keyword)) {
        suggestedTags.push(...tags);
      }
    });

    // Remove duplicates and return
    return [...new Set(suggestedTags)];
  }
}

export const bookmarkService = BookmarkService.getInstance();