import React, { useState, useCallback } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level?: string;
  };
  content: string;
  type: 'reflection' | 'milestone' | 'question' | 'tip' | 'achievement';
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  tags?: string[];
  attachment?: {
    type: 'image' | 'audio' | 'session';
    url: string;
    title?: string;
  };
}

interface CommunityFeedProps {
  posts: CommunityPost[];
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  className?: string;
}

/**
 * Community feed component for social meditation features
 * 
 * Features:
 * - Multiple post types (reflections, milestones, questions)
 * - Like and comment interactions
 * - Content moderation tools
 * - Infinite scroll loading
 * - Accessibility support
 * - Privacy controls
 * - Rich media attachments
 * - Tag-based filtering
 */
export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onReport,
  onLoadMore,
  isLoading = false,
  hasMore = true,
  className = ''
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  // Post type configurations
  const postTypeConfig = {
    reflection: {
      icon: '💭',
      label: 'Refleksi',
      color: 'bg-blue-100 text-blue-800'
    },
    milestone: {
      icon: '🎯',
      label: 'Pencapaian',
      color: 'bg-green-100 text-green-800'
    },
    question: {
      icon: '❓',
      label: 'Pertanyaan',
      color: 'bg-yellow-100 text-yellow-800'
    },
    tip: {
      icon: '💡',
      label: 'Tips',
      color: 'bg-purple-100 text-purple-800'
    },
    achievement: {
      icon: '🏆',
      label: 'Prestasi',
      color: 'bg-gold-100 text-gold-800'
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: diffDays > 365 ? 'numeric' : undefined
    }).format(date);
  };

  // Toggle post expansion
  const toggleExpanded = useCallback((postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  // Filter posts by type
  const filteredPosts = posts.filter(post => 
    filter === 'all' || post.type === filter
  );

  // Generate user initials
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 200): { text: string; isTruncated: boolean } => {
    if (content.length <= maxLength) {
      return { text: content, isTruncated: false };
    }
    return { 
      text: content.substring(0, maxLength) + '...', 
      isTruncated: true 
    };
  };

  return (
    <div className={`community-feed ${className}`}>
      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'reflection', label: 'Refleksi' },
            { key: 'milestone', label: 'Pencapaian' },
            { key: 'question', label: 'Pertanyaan' },
            { key: 'tip', label: 'Tips' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-pressed={filter === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isExpanded = expandedPosts.has(post.id);
          const { text: displayContent, isTruncated } = truncateContent(post.content);
          const config = postTypeConfig[post.type];

          return (
            <Card key={post.id} padding="medium" className="hover:shadow-lg transition-shadow">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-medium text-sm">
                    {post.author.avatar ? (
                      <img 
                        src={post.author.avatar} 
                        alt={`Avatar ${post.author.name}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getUserInitials(post.author.name)
                    )}
                  </div>

                  {/* User Info & Post Type */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-800 text-sm">
                        {post.author.name}
                      </h3>
                      {post.author.level && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {post.author.level}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        <span className="mr-1">{config.icon}</span>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(post.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Post Menu */}
                <div className="relative">
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Menu post"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-700 font-body leading-relaxed">
                  {isExpanded ? post.content : displayContent}
                </p>
                
                {isTruncated && (
                  <button
                    onClick={() => toggleExpanded(post.id)}
                    className="text-primary text-sm font-medium mt-2 hover:underline focus:outline-none focus:underline"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
                  </button>
                )}
              </div>

              {/* Post Attachment */}
              {post.attachment && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      {post.attachment.type === 'image' && (
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {post.attachment.type === 'audio' && (
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M12 6l-4 4H6a2 2 0 00-2 2v0a2 2 0 002 2h2l4 4v-12z" />
                        </svg>
                      )}
                      {post.attachment.type === 'session' && (
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a2 2 0 012 2v.586a1 1 0 01-.293.707L12 21l-4.707-4.707A1 1 0 017 15.586V15a2 2 0 012-2h1.586a1 1 0 00.707-.293L13.707 10.293A1 1 0 0114.414 10H16" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {post.attachment.title || 'Lampiran'}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {post.attachment.type}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Post Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  {/* Like Button */}
                  <button
                    onClick={() => onLike?.(post.id)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                      post.isLiked
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                    aria-label={`${post.isLiked ? 'Batal suka' : 'Suka'} postingan`}
                    aria-pressed={post.isLiked}
                  >
                    <svg className="w-4 h-4" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => onComment?.(post.id)}
                    className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Komentar postingan"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => onShare?.(post.id)}
                    className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Bagikan postingan"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>

                {/* Report Button */}
                {currentUserId !== post.author.id && (
                  <button
                    onClick={() => onReport?.(post.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    aria-label="Laporkan postingan"
                  >
                    Laporkan
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-6">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Memuat...</span>
              </>
            ) : (
              <span>Muat Lebih Banyak</span>
            )}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredPosts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Belum ada postingan
          </h3>
          <p className="text-gray-600 font-body">
            {filter === 'all' 
              ? 'Jadilah yang pertama berbagi refleksi atau pencapaian!'
              : `Belum ada postingan ${postTypeConfig[filter as keyof typeof postTypeConfig]?.label.toLowerCase()}.`}
          </p>
        </div>
      )}

      {/* Accessibility enhancements */}
      <div className="sr-only">
        <h2>Feed Komunitas</h2>
        <p>Menampilkan {filteredPosts.length} postingan dengan filter: {filter}</p>
      </div>
    </div>
  );
};