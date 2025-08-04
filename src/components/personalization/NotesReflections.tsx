import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { notesService } from '../../services/notesService';
import type { PersonalNote, Reflection } from '../../types/personalization';

interface NotesReflectionsProps {
  className?: string;
}

export const NotesReflections: React.FC<NotesReflectionsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'notes' | 'reflections'>('notes');
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showCreateReflection, setShowCreateReflection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [stats, setStats] = useState<{
    totalNotes: number;
    notesThisWeek: number;
    privateNotes: number;
    averageMood: number;
  } | null>(null);
  const [insights, setInsights] = useState<{
    totalReflections: number;
    averageMoodChange: number;
    commonInsights: string[];
    gratitudePhrases: string[];
  } | null>(null);

  const [newNote, setNewNote] = useState<Partial<PersonalNote>>({
    title: '',
    content: '',
    mood: 3,
    tags: [],
    isPrivate: true
  });

  const [newReflection, setNewReflection] = useState<Partial<Reflection>>({
    title: '',
    content: '',
    insights: [],
    gratitude: [],
    challenges: [],
    improvements: [],
    moodBefore: 3,
    moodAfter: 3
  });

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (activeTab === 'notes') {
        const [userNotes, notesStats] = await Promise.all([
          notesService.getUserNotes(user.uid),
          notesService.getNotesStats(user.uid)
        ]);
        setNotes(userNotes);
        setStats(notesStats);
      } else {
        const [userReflections, reflectionInsights] = await Promise.all([
          notesService.getUserReflections(user.uid),
          notesService.getReflectionInsights(user.uid)
        ]);
        setReflections(userReflections);
        setInsights(reflectionInsights);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleCreateNote = async () => {
    if (!user || !newNote.title || !newNote.content) {
      alert('Mohon lengkapi judul dan konten catatan');
      return;
    }

    try {
      await notesService.createNote(user.uid, {
        title: newNote.title,
        content: newNote.content,
        mood: newNote.mood,
        tags: newNote.tags || [],
        isPrivate: newNote.isPrivate || true
      });

      setNewNote({
        title: '',
        content: '',
        mood: 3,
        tags: [],
        isPrivate: true
      });
      setShowCreateNote(false);
      await loadData();
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Gagal membuat catatan. Silakan coba lagi.');
    }
  };

  const handleCreateReflection = async () => {
    if (!user || !newReflection.title || !newReflection.content) {
      alert('Mohon lengkapi judul dan konten refleksi');
      return;
    }

    try {
      await notesService.createReflection(user.uid, {
        title: newReflection.title!,
        content: newReflection.content!,
        insights: newReflection.insights || [],
        gratitude: newReflection.gratitude || [],
        challenges: newReflection.challenges || [],
        improvements: newReflection.improvements || [],
        moodBefore: newReflection.moodBefore,
        moodAfter: newReflection.moodAfter
      });

      setNewReflection({
        title: '',
        content: '',
        insights: [],
        gratitude: [],
        challenges: [],
        improvements: [],
        moodBefore: 3,
        moodAfter: 3
      });
      setShowCreateReflection(false);
      await loadData();
    } catch (error) {
      console.error('Error creating reflection:', error);
      alert('Gagal membuat refleksi. Silakan coba lagi.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Yakin ingin menghapus catatan ini?')) {
      try {
        await notesService.deleteNote(noteId);
        await loadData();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>, type: 'note' | 'reflection' | 'insights' | 'gratitude' | 'challenges' | 'improvements') => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const newTag = e.currentTarget.value.trim();
      
      if (type === 'note') {
        setNewNote(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag]
        }));
      } else {
        setNewReflection(prev => ({
          ...prev,
          [type]: [...(prev[type as keyof Partial<Reflection>] as string[] || []), newTag]
        }));
      }
      
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tag: string, type: 'note' | 'insights' | 'gratitude' | 'challenges' | 'improvements') => {
    if (type === 'note') {
      setNewNote(prev => ({
        ...prev,
        tags: prev.tags?.filter(t => t !== tag) || []
      }));
    } else {
      setNewReflection(prev => ({
        ...prev,
        [type]: prev[type]?.filter((t: string) => t !== tag) || []
      }));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodEmoji = (mood: number) => {
    const moodEmojis = ['😢', '😔', '😐', '😊', '😄'];
    return moodEmojis[mood - 1] || '😐';
  };

  const searchAndFilter = async () => {
    if (!user) return;

    try {
      if (activeTab === 'notes') {
        const filteredNotes = await notesService.searchNotes(user.uid, searchTerm, selectedTags);
        setNotes(filteredNotes);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const applyReflectionTemplate = useCallback((templateIndex: number) => {
    const templates = notesService.getReflectionTemplates();
    const template = templates[templateIndex];
    
    setNewReflection(prev => ({
      ...prev,
      title: template.title + ' - ' + new Date().toLocaleDateString('id-ID')
    }));
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
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
          <h3 className="text-xl font-semibold text-gray-900">Catatan & Refleksi</h3>
          <p className="text-gray-600">Dokumentasi perjalanan meditasi Anda</p>
        </div>
        <div className="text-3xl">📝</div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'notes'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>📝</span>
          <span>Catatan</span>
        </button>
        <button
          onClick={() => setActiveTab('reflections')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'reflections'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>🤔</span>
          <span>Refleksi</span>
        </button>
      </div>

      {/* Stats Cards */}
      {(stats || insights) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {activeTab === 'notes' && stats && (
            <>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalNotes}</div>
                <div className="text-sm text-blue-600">Total Catatan</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.notesThisWeek}</div>
                <div className="text-sm text-green-600">Minggu Ini</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.privateNotes}</div>
                <div className="text-sm text-purple-600">Privat</div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{getMoodEmoji(Math.round(stats.averageMood))}</div>
                <div className="text-sm text-yellow-600">Rata-rata Mood</div>
              </div>
            </>
          )}
          
          {activeTab === 'reflections' && insights && (
            <>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{insights.totalReflections}</div>
                <div className="text-sm text-blue-600">Total Refleksi</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {insights.averageMoodChange > 0 ? '+' : ''}{insights.averageMoodChange}
                </div>
                <div className="text-sm text-green-600">Perubahan Mood</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{insights.commonInsights.length}</div>
                <div className="text-sm text-purple-600">Insight Unik</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{insights.gratitudePhrases.length}</div>
                <div className="text-sm text-orange-600">Rasa Syukur</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        {activeTab === 'notes' ? (
          <Button
            onClick={() => setShowCreateNote(true)}
            className="flex-1"
          >
            ➕ Buat Catatan Baru
          </Button>
        ) : (
          <Button
            onClick={() => setShowCreateReflection(true)}
            className="flex-1"
          >
            ✨ Buat Refleksi Baru
          </Button>
        )}
        
        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm('');
            setSelectedTags([]);
            loadData();
          }}
        >
          🔄 Refresh
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Cari catatan atau refleksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchAndFilter()}
          />
        </div>
        <Button onClick={searchAndFilter} variant="outline">
          🔍 Cari
        </Button>
      </div>

      {/* Content List */}
      {activeTab === 'notes' ? (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada catatan
              </h4>
              <p className="text-gray-600 mb-4">
                Mulai dokumentasikan perjalanan meditasi Anda
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{note.title}</h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mb-2">
                      <span>{formatDate(note.createdAt)}</span>
                      {note.mood && (
                        <span className="flex items-center space-x-1">
                          <span>Mood:</span>
                          <span>{getMoodEmoji(note.mood)}</span>
                        </span>
                      )}
                      {note.isPrivate && <span className="text-blue-600">🔒 Privat</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    🗑️
                  </button>
                </div>
                
                <p className="text-gray-700 mb-3">{note.content}</p>
                
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reflections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada refleksi
              </h4>
              <p className="text-gray-600 mb-4">
                Mulai refleksikan pengalaman meditasi Anda
              </p>
            </div>
          ) : (
            reflections.map((reflection) => (
              <div key={reflection.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{reflection.title}</h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mb-2">
                      <span>{formatDate(reflection.createdAt)}</span>
                      {reflection.moodBefore && reflection.moodAfter && (
                        <span className="flex items-center space-x-1">
                          <span>Mood:</span>
                          <span>{getMoodEmoji(reflection.moodBefore)}</span>
                          <span>→</span>
                          <span>{getMoodEmoji(reflection.moodAfter)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{reflection.content}</p>
                
                {/* Insights, Gratitude, Challenges, Improvements */}
                <div className="grid md:grid-cols-2 gap-4">
                  {reflection.insights.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">💡 Insight</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {reflection.insights.map((insight, index) => (
                          <li key={index}>• {insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {reflection.gratitude.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">🙏 Rasa Syukur</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {reflection.gratitude.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {reflection.challenges.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">⚡ Tantangan</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {reflection.challenges.map((challenge, index) => (
                          <li key={index}>• {challenge}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {reflection.improvements.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">🚀 Perbaikan</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {reflection.improvements.map((improvement, index) => (
                          <li key={index}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Note Modal */}
      {showCreateNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Buat Catatan Baru</h3>
            
            <div className="space-y-4">
              <Input
                label="Judul"
                value={newNote.title || ''}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Judul catatan..."
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konten</label>
                <textarea
                  value={newNote.content || ''}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Tulis catatan Anda di sini..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood (1-5): {getMoodEmoji(newNote.mood || 3)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newNote.mood || 3}
                  onChange={(e) => setNewNote(prev => ({ ...prev, mood: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (tekan Enter untuk menambah)
                </label>
                <Input
                  placeholder="Tambah tag..."
                  onKeyPress={(e) => handleTagInput(e, 'note')}
                />
                {newNote.tags && newNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newNote.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => removeTag(tag, 'note')}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newNote.isPrivate || false}
                  onChange={(e) => setNewNote(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Buat catatan privat</span>
              </label>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button onClick={handleCreateNote} className="flex-1">
                💾 Simpan Catatan
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateNote(false);
                  setNewNote({
                    title: '',
                    content: '',
                    mood: 3,
                    tags: [],
                    isPrivate: true
                  });
                }}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Reflection Modal */}
      {showCreateReflection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Buat Refleksi Baru</h3>
              
              {/* Template Buttons */}
              <div className="flex space-x-2">
                {notesService.getReflectionTemplates().map((template, index) => (
                  <Button
                    key={index}
                    size="small"
                    variant="outline"
                    onClick={() => applyReflectionTemplate(index)}
                  >
                    📋 {template.title}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <Input
                label="Judul"
                value={newReflection.title || ''}
                onChange={(e) => setNewReflection(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Judul refleksi..."
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konten Refleksi</label>
                <textarea
                  value={newReflection.content || ''}
                  onChange={(e) => setNewReflection(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Tulis refleksi Anda di sini..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              {/* Mood Before/After */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood Sebelum: {getMoodEmoji(newReflection.moodBefore || 3)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newReflection.moodBefore || 3}
                    onChange={(e) => setNewReflection(prev => ({ ...prev, moodBefore: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood Sesudah: {getMoodEmoji(newReflection.moodAfter || 3)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newReflection.moodAfter || 3}
                    onChange={(e) => setNewReflection(prev => ({ ...prev, moodAfter: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 }))}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Categories */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Insights */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💡 Insights (tekan Enter)
                  </label>
                  <Input
                    placeholder="Apa yang saya pelajari..."
                    onKeyPress={(e) => handleTagInput(e, 'insights')}
                  />
                  {newReflection.insights && newReflection.insights.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {newReflection.insights.map((insight, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                          <span className="text-sm text-blue-700">• {insight}</span>
                          <button
                            onClick={() => removeTag(insight, 'insights')}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Gratitude */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🙏 Rasa Syukur (tekan Enter)
                  </label>
                  <Input
                    placeholder="Apa yang saya syukuri..."
                    onKeyPress={(e) => handleTagInput(e, 'gratitude')}
                  />
                  {newReflection.gratitude && newReflection.gratitude.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {newReflection.gratitude.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                          <span className="text-sm text-green-700">• {item}</span>
                          <button
                            onClick={() => removeTag(item, 'gratitude')}
                            className="text-green-500 hover:text-green-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Challenges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ⚡ Tantangan (tekan Enter)
                  </label>
                  <Input
                    placeholder="Kesulitan yang dihadapi..."
                    onKeyPress={(e) => handleTagInput(e, 'challenges')}
                  />
                  {newReflection.challenges && newReflection.challenges.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {newReflection.challenges.map((challenge, index) => (
                        <div key={index} className="flex items-center justify-between bg-orange-50 px-3 py-2 rounded">
                          <span className="text-sm text-orange-700">• {challenge}</span>
                          <button
                            onClick={() => removeTag(challenge, 'challenges')}
                            className="text-orange-500 hover:text-orange-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Improvements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🚀 Perbaikan (tekan Enter)
                  </label>
                  <Input
                    placeholder="Yang bisa diperbaiki..."
                    onKeyPress={(e) => handleTagInput(e, 'improvements')}
                  />
                  {newReflection.improvements && newReflection.improvements.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {newReflection.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded">
                          <span className="text-sm text-purple-700">• {improvement}</span>
                          <button
                            onClick={() => removeTag(improvement, 'improvements')}
                            className="text-purple-500 hover:text-purple-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button onClick={handleCreateReflection} className="flex-1">
                ✨ Simpan Refleksi
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateReflection(false);
                  setNewReflection({
                    title: '',
                    content: '',
                    insights: [],
                    gratitude: [],
                    challenges: [],
                    improvements: [],
                    moodBefore: 3,
                    moodAfter: 3
                  });
                }}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};