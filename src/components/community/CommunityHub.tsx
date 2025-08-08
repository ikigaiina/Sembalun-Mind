import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Heart, MessageCircle, Share2, TrendingUp, Award,
  Clock, Eye, Star, Filter, Plus, Send, BookOpen, Globe,
  MapPin, Calendar, Smile, ThumbsUp, Flag, Settings, ChevronRight
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    level: 'pemula' | 'menengah' | 'lanjutan';
    region?: string;
  };
  content: string;
  type: 'experience' | 'tip' | 'question' | 'achievement' | 'wisdom';
  timestamp: number;
  likes: number;
  comments: number;
  isLiked: boolean;
  tags: string[];
  culturalRegion?: string;
  meditationDuration?: number;
  practiceType?: string;
  isAnonymous?: boolean;
}

interface Props {
  className?: string;
}

export const CommunityHub: React.FC<Props> = ({
  className = ''
}) => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'sharing' | 'wisdom' | 'groups'>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<CommunityPost['type']>('experience');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [showNewPost, setShowNewPost] = useState(false);

  // Initialize with sample community posts (no audio content)
  useEffect(() => {
    const samplePosts: CommunityPost[] = [
      {
        id: '1',
        author: {
          name: 'Sari M.',
          level: 'menengah',
          region: 'Java'
        },
        content: 'Pagi ini meditasi dengan teknik pernapasan Jawa di halaman rumah. Suara alam dan ketenangan pagi membuat sesi jadi sangat bermakna. Ada yang punya pengalaman serupa?',
        type: 'experience',
        timestamp: Date.now() - 3600000,
        likes: 12,
        comments: 5,
        isLiked: false,
        tags: ['pagi', 'alam', 'pernapasan'],
        culturalRegion: 'java',
        meditationDuration: 20,
        practiceType: 'breathing'
      },
      {
        id: '2',
        author: {
          name: 'Anonymous',
          level: 'pemula'
        },
        content: 'Baru mulai meditasi minggu ini. Masih susah fokus, pikiran sering mengembara. Ada tips untuk pemula seperti saya?',
        type: 'question',
        timestamp: Date.now() - 7200000,
        likes: 8,
        comments: 12,
        isLiked: true,
        tags: ['pemula', 'fokus', 'tips'],
        isAnonymous: true
      },
      {
        id: '3',
        author: {
          name: 'Wayan K.',
          level: 'lanjutan',
          region: 'Bali'
        },
        content: 'Seperti kata pepatah Bali: "Rahayu" - semoga selamat dan bahagia. Dalam meditasi, kita belajar menemukan kebahagiaan sejati dari dalam. Mari berbagi energi positif! 🙏',
        type: 'wisdom',
        timestamp: Date.now() - 10800000,
        likes: 25,
        comments: 8,
        isLiked: false,
        tags: ['kebijaksanaan', 'bali', 'filosofi'],
        culturalRegion: 'bali'
      },
      {
        id: '4',
        author: {
          name: 'Ahmad R.',
          level: 'menengah',
          region: 'Sembalun'
        },
        content: 'Hari ke-30 berturut-turut meditasi! Berkat konsistensi dan dukungan komunitas ini. Terima kasih semua! 🌟',
        type: 'achievement',
        timestamp: Date.now() - 14400000,
        likes: 33,
        comments: 15,
        isLiked: true,
        tags: ['streak', '30hari', 'konsistensi'],
        culturalRegion: 'sembalun'
      }
    ];

    setPosts(samplePosts);
  }, []);

  const handleLike = (postId: string) => {
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

  const handleNewPost = () => {
    if (!newPost.trim()) return;

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: {
        name: userProfile?.displayName || user?.email?.split('@')[0] || 'Anonim',
        level: 'pemula',
        region: 'Indonesia'
      },
      content: newPost,
      type: postType,
      timestamp: Date.now(),
      likes: 0,
      comments: 0,
      isLiked: false,
      tags: [],
      culturalRegion: selectedRegion === 'all' ? undefined : selectedRegion
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setShowNewPost(false);
  };

  const getPostTypeIcon = (type: CommunityPost['type']) => {
    switch (type) {
      case 'experience': return <Heart className="w-4 h-4" />;
      case 'tip': return <TrendingUp className="w-4 h-4" />;
      case 'question': return <MessageCircle className="w-4 h-4" />;
      case 'achievement': return <Award className="w-4 h-4" />;
      case 'wisdom': return <BookOpen className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getPostTypeLabel = (type: CommunityPost['type']) => {
    switch (type) {
      case 'experience': return 'Pengalaman';
      case 'tip': return 'Tips';
      case 'question': return 'Pertanyaan';
      case 'achievement': return 'Pencapaian';
      case 'wisdom': return 'Kebijaksanaan';
      default: return 'Umum';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
  };

  const filteredPosts = selectedRegion === 'all' 
    ? posts 
    : posts.filter(post => post.culturalRegion === selectedRegion);

  const renderFeed = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="all">Semua Wilayah</option>
          <option value="sembalun">Sembalun</option>
          <option value="java">Java</option>
          <option value="bali">Bali</option>
          <option value="sumatra">Sumatra</option>
        </select>
      </div>

      {/* New Post Button */}
      <Button
        onClick={() => setShowNewPost(true)}
        variant="primary"
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Bagikan Pengalaman Anda
      </Button>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-md transition-shadow">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {post.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">
                        {post.isAnonymous ? 'Anonymous' : post.author.name}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.author.level === 'pemula' ? 'bg-green-100 text-green-700' :
                        post.author.level === 'menengah' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {post.author.level}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{getTimeAgo(post.timestamp)}</span>
                      {post.author.region && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {post.author.region}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                    post.type === 'experience' ? 'bg-pink-100 text-pink-700' :
                    post.type === 'tip' ? 'bg-blue-100 text-blue-700' :
                    post.type === 'question' ? 'bg-yellow-100 text-yellow-700' :
                    post.type === 'achievement' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {getPostTypeIcon(post.type)}
                    <span>{getPostTypeLabel(post.type)}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-800 leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Post Metadata */}
              {(post.meditationDuration || post.practiceType || post.culturalRegion) && (
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                  {post.meditationDuration && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.meditationDuration} menit
                    </span>
                  )}
                  {post.practiceType && (
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">
                      {post.practiceType}
                    </span>
                  )}
                  {post.culturalRegion && (
                    <span className="capitalize bg-accent-100 text-accent-700 px-2 py-1 rounded-full">
                      {post.culturalRegion}
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 text-sm transition-colors ${
                      post.isLiked 
                        ? 'text-red-600' 
                        : 'text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </button>

                  <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan</span>
                  </button>
                </div>

                <Button variant="ghost" size="sm" className="text-primary-600">
                  Balas
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSharing = () => (
    <div className="text-center py-12">
      <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Fitur Berbagi</h3>
      <p className="text-gray-600 mb-6">
        Berbagi progres dan pencapaian meditasi dengan komunitas
      </p>
      <Button variant="outline" disabled>
        Segera Hadir
      </Button>
    </div>
  );

  const renderWisdom = () => (
    <div className="space-y-6">
      {/* Wisdom Collection */}
      <Card className="p-6">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Koleksi Kebijaksanaan Nusantara
          </h3>
          <p className="text-gray-600 mb-6">
            Kumpulan quote dan petuah bijak dari berbagai daerah di Indonesia
          </p>
          
          <div className="space-y-4">
            {[
              {
                text: 'Air beriak tanda tak dalam',
                origin: 'Pepatah Melayu',
                meaning: 'Orang yang benar-benar bijak tidak perlu pamer'
              },
              {
                text: 'Sedia payung sebelum hujan', 
                origin: 'Pepatah Indonesia',
                meaning: 'Bersiaplah sebelum masalah datang'
              },
              {
                text: 'Dimana bumi dipijak, disitu langit dijunjung',
                origin: 'Pepatah Minang',
                meaning: 'Hormati adat dan budaya tempat kita berada'
              }
            ].map((wisdom, index) => (
              <div key={index} className="p-4 bg-amber-50 rounded-lg text-left">
                <blockquote className="text-amber-900 font-medium mb-2 italic">
                  "{wisdom.text}"
                </blockquote>
                <div className="text-sm">
                  <div className="text-amber-700 font-medium">{wisdom.origin}</div>
                  <div className="text-amber-600 mt-1">{wisdom.meaning}</div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="mt-6">
            <BookOpen className="w-4 h-4 mr-2" />
            Jelajahi Lebih Banyak
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderGroups = () => (
    <div className="text-center py-12">
      <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Grup Komunitas</h3>
      <p className="text-gray-600 mb-6">
        Bergabung dengan grup berdasarkan minat dan lokasi
      </p>
      <Button variant="outline" disabled>
        Segera Hadir
      </Button>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-2">
              Komunitas Sembalun
            </h2>
            <p className="text-gray-600">
              Berbagi pengalaman meditasi dan belajar bersama
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">1,247</div>
            <div className="text-sm text-gray-600">Anggota</div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Card className="p-1">
        <div className="flex space-x-1">
          {[
            { id: 'feed', label: 'Feed', icon: Globe },
            { id: 'sharing', label: 'Berbagi', icon: Share2 },
            { id: 'wisdom', label: 'Wisdom', icon: BookOpen },
            { id: 'groups', label: 'Grup', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderFeed()}
          </motion.div>
        )}

        {activeTab === 'sharing' && (
          <motion.div
            key="sharing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              {renderSharing()}
            </Card>
          </motion.div>
        )}

        {activeTab === 'wisdom' && (
          <motion.div
            key="wisdom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderWisdom()}
          </motion.div>
        )}

        {activeTab === 'groups' && (
          <motion.div
            key="groups"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              {renderGroups()}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowNewPost(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Bagikan dengan Komunitas
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Postingan
                    </label>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value as any)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="experience">Pengalaman</option>
                      <option value="tip">Tips</option>
                      <option value="question">Pertanyaan</option>
                      <option value="achievement">Pencapaian</option>
                      <option value="wisdom">Kebijaksanaan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Isi Postingan
                    </label>
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Bagikan pengalaman atau pemikiran Anda..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowNewPost(false)}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleNewPost}
                      disabled={!newPost.trim()}
                      className="flex-1"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Bagikan
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};