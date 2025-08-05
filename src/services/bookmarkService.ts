import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
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

      const docRef = await addDoc(collection(db, 'user_bookmarks'), {
        ...bookmarkData,
        createdAt: Timestamp.fromDate(bookmarkData.createdAt)
      });

      return docRef.id;
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
      let q = query(
        collection(db, 'user_bookmarks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (category) {
        q = query(q, where('category', '==', category));
      }

      if (contentType) {
        q = query(q, where('contentType', '==', contentType));
      }

      q = query(q, limit(limit_count));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        lastAccessedAt: doc.data().lastAccessedAt?.toDate()
      })) as UserBookmark[];
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }

  async getFavoriteBookmarks(userId: string, limit_count: number = 20): Promise<UserBookmark[]> {
    try {
      const q = query(
        collection(db, 'user_bookmarks'),
        where('userId', '==', userId),
        where('isFavorite', '==', true),
        orderBy('lastAccessedAt', 'desc'),
        limit(limit_count)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        lastAccessedAt: doc.data().lastAccessedAt?.toDate()
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
      const docRef = doc(db, 'user_bookmarks', bookmarkId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  }

  async markBookmarkAccessed(bookmarkId: string): Promise<void> {
    try {
      const docRef = doc(db, 'user_bookmarks', bookmarkId);
      await updateDoc(docRef, {
        lastAccessedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error marking bookmark as accessed:', error);
    }
  }

  async toggleFavorite(bookmarkId: string, isFavorite: boolean): Promise<void> {
    try {
      const docRef = doc(db, 'user_bookmarks', bookmarkId);
      await updateDoc(docRef, { isFavorite });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  async deleteBookmark(bookmarkId: string): Promise<void> {
    try {
      const docRef = doc(db, 'user_bookmarks', bookmarkId);
      await deleteDoc(docRef);
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
      const q = query(
        collection(db, 'user_bookmarks'),
        where('userId', '==', userId),
        where('contentId', '==', contentId),
        where('contentType', '==', contentType),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        lastAccessedAt: doc.data().lastAccessedAt?.toDate()
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
      const q = query(
        collection(db, 'user_bookmarks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      let bookmarks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        lastAccessedAt: doc.data().lastAccessedAt?.toDate()
      })) as UserBookmark[];

      // Filter by search term (client-side filtering since Firestore has limited text search)
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
      const batch = writeBatch(db);
      
      for (const bookmarkId of bookmarkIds) {
        const docRef = doc(db, 'user_bookmarks', bookmarkId);
        batch.update(docRef, updates);
      }
      
      if (batch) {
        await batch.commit();
      }
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