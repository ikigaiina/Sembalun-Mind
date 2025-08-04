import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Share2, Users, Calendar, MapPin, Award, Flame, TrendingUp, Plus, Filter, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    badges: string[];
  };
  content: string;
  type: 'text' | 'achievement' | 'question' | 'inspiration';
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  tags: string[];
  achievement?: {
    name: string;
    description: string;
    icon: string;
  };
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  category: 'beginner' | 'advanced' | 'workplace' | 'general';
  image: string;
  recentActivity: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'workshop' | 'discussion' | 'challenge';
  date: Date;
  duration: number; // minutes
  participants: number;
  isJoined: boolean;
  host: {
    name: string;
    avatar: string;
  };
  location: 'online' | 'hybrid' | string;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  points: number;
  streak: number;
  badges: string[];
}

const Community: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'events' | 'leaderboard'>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, fetch from community service
    const mockPosts: CommunityPost[] = [
      {
        id: '1',
        author: {
          id: 'user1',
          name: 'Sarah Mindful',
          avatar: '/avatars/sarah.jpg',
          level: 12,
          badges: ['🧘‍♀️', '🔥', '⭐']
        },
        content: 'Just completed my 30-day meditation streak! The journey has been incredible. I\'ve noticed such a difference in my stress levels and overall well-being. Thank you to this amazing community for the support! 🙏',
        type: 'achievement',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 24,
        comments: 8,
        shares: 3,
        isLiked: false,
        tags: ['streak', 'achievement', 'gratitude'],
        achievement: {
          name: '30-Day Streak Master',
          description: 'Complete 30 consecutive days of meditation',
          icon: '🔥'
        }
      },
      {
        id: '2',
        author: {
          id: 'user2',
          name: 'Ahmad Peaceful',
          avatar: '/avatars/ahmad.jpg',
          level: 8,
          badges: ['🌿', '💚']
        },
        content: 'Does anyone have tips for maintaining focus during longer meditation sessions? I can do 10 minutes fine, but struggle with 20+ minutes. My mind keeps wandering...',
        type: 'question',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 12,
        comments: 15,
        shares: 2,
        isLiked: true,
        tags: ['help', 'focus', 'beginner']
      },
      {
        id: '3',
        author: {
          id: 'user3',
          name: 'Dr. Maya Zen',
          avatar: '/avatars/maya.jpg',
          level: 25,
          badges: ['👨‍🏫', '🎯', '⚡', '🏆']
        },
        content: '"The present moment is the only time over which we have dominion." - Thich Nhat Hanh\n\nThis quote has been my anchor this week. Whenever I catch my mind racing about the future or dwelling on the past, I come back to this truth. What quotes inspire your practice?',
        type: 'inspiration',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        likes: 45,
        comments: 23,
        shares: 12,
        isLiked: true,
        tags: ['inspiration', 'quotes', 'mindfulness']
      }
    ];

    const mockGroups: CommunityGroup[] = [
      {
        id: 'beginners',
        name: 'Mindfulness Beginners',
        description: 'A supportive space for those just starting their mindfulness journey',
        memberCount: 2840,
        isJoined: true,
        category: 'beginner',
        image: '/groups/beginners.jpg',
        recentActivity: '5 new posts today'
      },
      {
        id: 'workplace',
        name: 'Workplace Mindfulness',
        description: 'Bringing mindfulness to professional environments',
        memberCount: 1560,
        isJoined: false,
        category: 'workplace',
        image: '/groups/workplace.jpg',
        recentActivity: '3 new posts today'
      },
      {
        id: 'advanced',
        name: 'Advanced Practitioners',
        description: 'Deep discussions and advanced techniques for experienced meditators',
        memberCount: 890,
        isJoined: true,
        category: 'advanced',
        image: '/groups/advanced.jpg',
        recentActivity: '2 new posts today'
      }
    ];

    const mockEvents: CommunityEvent[] = [
      {
        id: 'meditation-circle',
        title: 'Weekly Community Meditation Circle',
        description: 'Join our guided group meditation session. All levels welcome!',
        type: 'meditation',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 45,
        participants: 23,
        isJoined: true,
        host: {
          name: 'Dr. Maya Zen',
          avatar: '/avatars/maya.jpg'
        },
        location: 'online'
      },
      {
        id: 'mindful-eating',
        title: 'Mindful Eating Workshop',
        description: 'Learn to bring awareness and presence to your meals',
        type: 'workshop',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        duration: 90,
        participants: 12,
        isJoined: false,
        host: {
          name: 'Chef Mindful',
          avatar: '/avatars/chef.jpg'
        },
        location: 'Jakarta Community Center'
      }
    ];

    const mockLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        user: { id: 'user1', name: 'Sarah Mindful', avatar: '/avatars/sarah.jpg' },
        points: 2450,
        streak: 45,
        badges: ['🏆', '🔥', '⭐', '🧘‍♀️']
      },
      {
        rank: 2,
        user: { id: 'user2', name: 'Dr. Maya Zen', avatar: '/avatars/maya.jpg' },
        points: 2380,
        streak: 38,
        badges: ['👨‍🏫', '🎯', '⚡', '🏆']
      },
      {
        rank: 3,
        user: { id: 'user3', name: 'Ahmad Peaceful', avatar: '/avatars/ahmad.jpg' },
        points: 2120,
        streak: 32,
        badges: ['🌿', '💚', '🔥']
      }
    ];

    setPosts(mockPosts);
    setGroups(mockGroups);
    setEvents(mockEvents);
    setLeaderboard(mockLeaderboard);
    setIsLoading(false);
  }, []);

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { 
            ...group, 
            isJoined: !group.isJoined,
            memberCount: group.isJoined ? group.memberCount - 1 : group.memberCount + 1
          }
        : group
    ));
  };

  const handleJoinEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            isJoined: !event.isJoined,
            participants: event.isJoined ? event.participants - 1 : event.participants + 1
          }
        : event
    ));
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post: CommunityPost = {
        id: Date.now().toString(),
        author: {
          id: 'current-user',
          name: 'You',
          avatar: '/avatars/default.jpg',
          level: 5,
          badges: ['🌟']
        },
        content: newPost,
        type: 'text',
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        tags: []
      };
      
      setPosts(prev => [post, ...prev]);
      setNewPost('');
      setShowCreatePost(false);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'question': return '❓';
      case 'inspiration': return '💡';
      default: return '💬';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('id-ID');
  };

  const tabs = [
    { id: 'feed', label: 'Feed', icon: MessageCircle },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
              <p className="text-gray-600">Connect with fellow mindfulness practitioners</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8 mt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'feed' | 'groups' | 'events' | 'leaderboard')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {posts.map(post => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
                    {/* Post Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{post.author.name}</h3>
                          <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                            Level {post.author.level}
                          </span>
                          <div className="flex space-x-1">
                            {post.author.badges.map((badge, index) => (
                              <span key={index} className="text-sm">{badge}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{getPostTypeIcon(post.type)}</span>
                          <span>{formatTimestamp(post.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Achievement Badge */}
                    {post.achievement && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{post.achievement.icon}</span>
                          <div>
                            <h4 className="font-medium text-yellow-800">{post.achievement.name}</h4>
                            <p className="text-sm text-yellow-600">{post.achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                    </div>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center space-x-2 transition-colors duration-200 ${
                            post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span className="text-sm">{post.likes}</span>
                        </button>

                        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors duration-200">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">{post.comments}</span>
                        </button>

                        <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors duration-200">
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm">{post.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {['#30daystreak', '#mindfulmonday', '#gratitudepractice', '#workplacewellness'].map((tag, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-primary cursor-pointer hover:underline">{tag}</span>
                      <span className="text-xs text-gray-500">{120 - index * 20} posts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Community Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Members</span>
                    <span className="text-sm font-medium">12,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Today</span>
                    <span className="text-sm font-medium">1,280</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Posts This Week</span>
                    <span className="text-sm font-medium">456</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div>
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => (
                <div key={group.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img
                    src={group.image}
                    alt={group.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{group.memberCount.toLocaleString()} members</span>
                      <span className="capitalize">{group.category}</span>
                    </div>

                    <p className="text-xs text-gray-500 mb-4">{group.recentActivity}</p>

                    <Button
                      variant={group.isJoined ? 'outline' : 'primary'}
                      onClick={() => handleJoinGroup(group.id)}
                      className="w-full"
                    >
                      {group.isJoined ? 'Joined' : 'Join Group'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">
                        {event.type === 'meditation' ? '🧘‍♀️' : 
                         event.type === 'workshop' ? '🎓' : 
                         event.type === 'discussion' ? '💬' : '🏆'}
                      </span>
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date.toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.duration} minutes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{event.participants} participants</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <img
                        src={event.host.avatar}
                        alt={event.host.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600">Hosted by {event.host.name}</span>
                    </div>
                  </div>

                  <Button
                    variant={event.isJoined ? 'outline' : 'primary'}
                    onClick={() => handleJoinEvent(event.id)}
                  >
                    {event.isJoined ? 'Joined' : 'Join Event'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Community Leaderboard</h2>
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {entry.rank}
                    </div>
                    
                    <img
                      src={entry.user.avatar}
                      alt={entry.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{entry.user.name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {entry.badges.map((badge, badgeIndex) => (
                            <span key={badgeIndex} className="text-sm">{badge}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{entry.points.toLocaleString()} pts</div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>{entry.streak} day streak</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share with Community</h3>
            
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind? Share your meditation insights, ask questions, or inspire others..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />

            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreatePost(false);
                  setNewPost('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreatePost}
                disabled={!newPost.trim()}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;