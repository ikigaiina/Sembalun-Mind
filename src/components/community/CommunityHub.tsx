import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  category: string;
  culturalFocus?: string;
}

interface GroupChallenge {
  id: string;
  groupId: string;
  title: string;
  description: string;
  type: 'meditation_streak' | 'total_minutes' | 'consistency';
  duration: number;
  startDate: Date;
  endDate: Date;
  participants: string[];
  rewards: string[];
}

interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: Date;
  groupId?: string;
}

export const CommunityHub: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [challenges, setChallenges] = useState<GroupChallenge[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      // Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('community_groups')
        .select('*')
        .limit(10);
      
      if (groupsError) throw groupsError;
      
      // Fetch challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('group_challenges')
        .select('*')
        .limit(5);
      
      if (challengesError) throw challengesError;
      
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:users(display_name)
        `)
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (postsError) throw postsError;
      
      setGroups(groupsData || []);
      setChallenges(challengesData || []);
      setPosts(postsData?.map(post => ({
        ...post,
        userName: post.user?.display_name || 'Anonymous'
      })) || []);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert([
          {
            user_id: user.id,
            content: newPostContent,
            timestamp: new Date()
          }
        ])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setPosts(prev => [{
          ...data[0],
          userName: user.display_name || 'You'
        }, ...prev]);
        setNewPostContent('');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    
    try {
      // In real implementation, this would toggle like in database
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const isLiked = post.isLikedByUser;
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            isLikedByUser: !isLiked
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'streak': return '🔥';
      case 'session_count': return '💯';
      case 'course_completion': return '🎓';
      case 'challenge_win': return '🏆';
      default: return '⭐';
    }
  };

  const getMilestoneColor = (type: string) => {
    switch (type) {
      case 'streak': return 'bg-red-100 text-red-800';
      case 'session_count': return 'bg-blue-100 text-blue-800';
      case 'course_completion': return 'bg-green-100 text-green-800';
      case 'challenge_win': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-4">Loading community...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Community Hub</h1>
      
      {/* Create Post */}
      <Card className="mb-6 p-4">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Share your meditation journey with the community..."
          className="w-full p-3 border rounded-lg mb-3"
          rows={3}
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleCreatePost}
            disabled={!newPostContent.trim()}
          >
            Post to Community
          </Button>
        </div>
      </Card>
      
      {/* Challenges Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map(challenge => (
            <Card key={challenge.id} className="p-4">
              <h3 className="font-bold text-lg mb-2">{challenge.title}</h3>
              <p className="text-gray-600 mb-3">{challenge.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {challenge.duration} days challenge
                </span>
                <Button variant="outline" size="sm">
                  Join Challenge
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Groups Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Meditation Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groups.map(group => (
            <Card key={group.id} className="p-4">
              <h3 className="font-bold mb-2">{group.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{group.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {group.memberCount} members
                </span>
                <Button variant="outline" size="sm">
                  Join Group
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Community Feed */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Community Feed</h2>
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id} className="p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <span className="font-bold text-indigo-600">
                    {post.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">{post.userName}</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="mb-3">{post.content}</p>
              <div className="flex space-x-4 text-sm text-gray-500">
                <button className="flex items-center">
                  <span>❤️</span>
                  <span className="ml-1">{post.likes}</span>
                </button>
                <button className="flex items-center">
                  <span>💬</span>
                  <span className="ml-1">{post.comments}</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};