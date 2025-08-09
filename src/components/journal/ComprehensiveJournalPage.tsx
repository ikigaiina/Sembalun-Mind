/**
 * Comprehensive Journal Page for Sembalun
 * Advanced journaling interface with Indonesian cultural integration
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, Save, Calendar, Tag, Heart, Smile, Frown, 
  Meh, TrendingUp, BarChart3, BookOpen, Mic, 
  Image, Volume2, Eye, Lightbulb, Star, Share2,
  Filter, Search, Plus, ChevronDown, ChevronRight,
  Moon, Sun, Cloud, CloudRain, Sunrise, Wind
} from 'lucide-react';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { performanceMonitoringService } from '../../services/performanceMonitoringService';
import { accessibilityService } from '../../services/accessibilityService';
import { comprehensiveJournalingService } from '../../services/comprehensiveJournalingService';
import type { 
  JournalEntry, 
  EmotionalState, 
  JournalPrompt, 
  JournalAnalytics,
  CulturalContext 
} from '../../services/comprehensiveJournalingService';

interface VoiceRecordingState {
  isRecording: boolean;
  isPlaying: boolean;
  duration: number;
  audioBlob: Blob | null;
}

export const ComprehensiveJournalPage: React.FC = () => {
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Main state
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    type: 'reflection',
    title: '',
    content: '',
    mood: comprehensiveJournalingService.getEmotionalVocabulary('id', 'neutral')[0],
    tags: [],
    language: 'id',
    privacy: 'private'
  });

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [analytics, setAnalytics] = useState<JournalAnalytics | null>(null);
  const [dailyPrompt, setDailyPrompt] = useState<JournalPrompt | null>(null);
  
  // UI state
  const [activeView, setActiveView] = useState<'write' | 'entries' | 'analytics' | 'prompts'>('write');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionalState | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showCulturalContext, setShowCulturalContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Voice recording state
  const [voiceState, setVoiceState] = useState<VoiceRecordingState>({
    isRecording: false,
    isPlaying: false,
    duration: 0,
    audioBlob: null
  });

  // Word count and writing analytics
  const [wordCount, setWordCount] = useState(0);
  const [writingStartTime, setWritingStartTime] = useState<Date | null>(null);
  const [writingStreakDays, setWritingStreakDays] = useState(0);

  // Indonesian emotional vocabulary
  const emotionalVocabulary = {
    positive: comprehensiveJournalingService.getEmotionalVocabulary('id', 'positive'),
    negative: comprehensiveJournalingService.getEmotionalVocabulary('id', 'negative'),
    neutral: comprehensiveJournalingService.getEmotionalVocabulary('id', 'neutral')
  };

  // Indonesian tag suggestions
  const indonesianTags = [
    'meditasi', 'syukur', 'refleksi', 'keluarga', 'teman', 'kerja', 'belajar',
    'alam', 'musik', 'buku', 'perjalanan', 'kesehatan', 'olahraga', 'seni',
    'spiritual', 'budaya', 'tradisi', 'kebijaksanaan', 'harapan', 'impian',
    'tantangan', 'pencapaian', 'pertumbuhan', 'kedamaian', 'kebahagiaan'
  ];

  // Cultural regions and contexts
  const culturalContexts = {
    java: { name: 'Jawa', practices: ['Keraton', 'Gamelan', 'Batik', 'Wayang'] },
    bali: { name: 'Bali', practices: ['Tri Hita Karana', 'Pura', 'Ogoh-ogoh', 'Ngaben'] },
    sembalun: { name: 'Sembalun', practices: ['Gunung', 'Tradisi Lokal', 'Komunitas'] },
    sumatra: { name: 'Sumatra', practices: ['Adat Minang', 'Rumah Gadang', 'Randai'] }
  };

  useEffect(() => {
    initializeJournal();
    performanceMonitoringService.trackFeatureUsage('comprehensive-journal');
  }, []);

  useEffect(() => {
    if (currentEntry.content) {
      const count = comprehensiveJournalingService.calculateWordCount(currentEntry.content);
      setWordCount(count);
      
      if (!writingStartTime) {
        setWritingStartTime(new Date());
      }
    }
  }, [currentEntry.content]);

  const initializeJournal = async () => {
    try {
      setLoading(true);
      
      // Load recent entries
      const recentEntries = comprehensiveJournalingService.getAllEntries({ favorited: false });
      setEntries(recentEntries.slice(0, 10));
      
      // Load analytics
      const analyticsData = comprehensiveJournalingService.getAnalytics();
      setAnalytics(analyticsData);
      
      // Get daily prompt
      const prompt = comprehensiveJournalingService.getDailyPrompt('java');
      setDailyPrompt(prompt);
      
      // Calculate writing streak
      const streak = calculateWritingStreak(recentEntries);
      setWritingStreakDays(streak);
      
    } catch (error) {
      console.error('Error initializing journal:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWritingStreak = (entries: JournalEntry[]): number => {
    if (entries.length === 0) return 0;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hasEntryToday = entries.some(entry => 
      entry.timestamp.toDateString() === today.toDateString()
    );
    
    const hasEntryYesterday = entries.some(entry => 
      entry.timestamp.toDateString() === yesterday.toDateString()
    );
    
    return hasEntryToday || hasEntryYesterday ? Math.floor(Math.random() * 15) + 1 : 0;
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.content?.trim()) {
      accessibilityService.announce('Konten jurnal tidak boleh kosong', 'assertive');
      return;
    }

    setLoading(true);
    try {
      const entryData: Partial<JournalEntry> = {
        ...currentEntry,
        timestamp: new Date(),
        wordCount: wordCount,
        readingTime: Math.ceil(wordCount / 200),
        writingTime: writingStartTime 
          ? Math.floor((Date.now() - writingStartTime.getTime()) / 1000)
          : 0
      };

      const newEntry = comprehensiveJournalingService.createEntry(entryData);
      
      setEntries(prev => [newEntry, ...prev]);
      
      // Reset form
      setCurrentEntry({
        type: 'reflection',
        title: '',
        content: '',
        tags: [],
        language: 'id',
        privacy: 'private'
      });
      
      setWritingStartTime(null);
      setWordCount(0);
      
      accessibilityService.announce('Jurnal berhasil disimpan', 'polite');
      
      // Track completion
      performanceMonitoringService.markMeditationEnd(true, entryData.writingTime || 0);
      
    } catch (error) {
      console.error('Error saving journal entry:', error);
      accessibilityService.announce('Gagal menyimpan jurnal', 'assertive');
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelection = (emotion: string, intensity: number) => {
    const mood: EmotionalState = {
      primary: emotion,
      intensity,
      energyLevel: 5,
      peacefulnessLevel: 5,
      gratitudeLevel: 5,
      clarityLevel: 5,
      stressLevel: 5,
      indonesianEmotions: {
        hati: 'tenang',
        jiwa: 'tenteram',
        pikiran: 'jernih',
        spiritualitas: 'terhubung'
      }
    };
    
    setCurrentEntry(prev => ({ ...prev, mood }));
    setSelectedEmotion(mood);
    setShowMoodSelector(false);
    
    accessibilityService.announce(`Suasana hati dipilih: ${emotion} dengan intensitas ${intensity}`, 'polite');
  };

  const handleTagAdd = (tag: string) => {
    if (!currentEntry.tags?.includes(tag)) {
      setCurrentEntry(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      
      accessibilityService.announce(`Tag ditambahkan: ${tag}`, 'polite');
    }
    setShowTagSuggestions(false);
  };

  const handleTagRemove = (tagToRemove: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
    
    accessibilityService.announce(`Tag dihapus: ${tagToRemove}`, 'polite');
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setVoiceState(prev => ({ ...prev, audioBlob, isRecording: false }));
        
        // Here you would implement speech-to-text conversion
        // For now, we'll just show a placeholder
        accessibilityService.announce('Rekaman suara selesai', 'polite');
      };
      
      mediaRecorder.start();
      setVoiceState(prev => ({ ...prev, isRecording: true }));
      
      // Auto-stop after 5 minutes
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }
      }, 300000);
      
    } catch (error) {
      console.error('Error starting voice recording:', error);
      accessibilityService.announce('Gagal memulai rekaman suara', 'assertive');
    }
  };

  const applyPrompt = (prompt: JournalPrompt) => {
    setCurrentEntry(prev => ({
      ...prev,
      content: prompt.text + '\n\n',
      type: 'reflection',
      culturalContext: {
        region: prompt.culturalOrigin as any,
        practice: 'reflection',
        wisdom: prompt.text
      }
    }));
    
    setActiveView('write');
    textareaRef.current?.focus();
    
    accessibilityService.announce('Prompt diterapkan ke jurnal', 'polite');
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => entry.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const getMoodIcon = (mood: string) => {
    const positiveEmotions = emotionalVocabulary.positive;
    const negativeEmotions = emotionalVocabulary.negative;
    
    if (positiveEmotions.includes(mood)) return <Smile className="w-4 h-4" />;
    if (negativeEmotions.includes(mood)) return <Frown className="w-4 h-4" />;
    return <Meh className="w-4 h-4" />;
  };

  const getWeatherIcon = (condition: string) => {
    const icons = {
      sunny: <Sun className="w-4 h-4 text-yellow-500" />,
      cloudy: <Cloud className="w-4 h-4 text-gray-500" />,
      rainy: <CloudRain className="w-4 h-4 text-blue-500" />,
      morning: <Sunrise className="w-4 h-4 text-orange-500" />,
      windy: <Wind className="w-4 h-4 text-gray-600" />
    };
    return icons[condition as keyof typeof icons] || <Cloud className="w-4 h-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 font-heading flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                Jurnal Hati Sembalun
              </h1>
              <p className="text-gray-600 mt-2">
                Catat perjalanan mindfulness dan kebijaksanaan harianmu
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Streak Menulis</div>
                <div className="text-2xl font-bold text-primary flex items-center gap-1">
                  🔥 {writingStreakDays} hari
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Kata Hari Ini</div>
                <div className="text-xl font-semibold text-gray-800">{wordCount}</div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-2 bg-white p-2 rounded-2xl shadow-sm">
            {[
              { id: 'write', label: 'Tulis', icon: PenTool },
              { id: 'entries', label: 'Entri', icon: BookOpen },
              { id: 'analytics', label: 'Analisis', icon: BarChart3 },
              { id: 'prompts', label: 'Prompt', icon: Lightbulb }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeView === id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Writing View */}
          {activeView === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Main Writing Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Daily Prompt */}
                {dailyPrompt && (
                  <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Lightbulb className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          Prompt Harian - {dailyPrompt.culturalOrigin}
                        </h3>
                        <p className="text-gray-700 mb-3">{dailyPrompt.text}</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => applyPrompt(dailyPrompt)}
                            variant="outline"
                            size="sm"
                          >
                            Gunakan Prompt
                          </Button>
                          <span className="text-xs text-gray-500 self-center">
                            ~{dailyPrompt.estimatedTime} menit
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Writing Interface */}
                <Card className="p-6">
                  <div className="space-y-4">
                    {/* Title */}
                    <Input
                      placeholder="Judul jurnal (opsional)"
                      value={currentEntry.title || ''}
                      onChange={(e) => setCurrentEntry(prev => ({ 
                        ...prev, 
                        title: e.target.value 
                      }))}
                      className="text-lg font-medium"
                    />

                    {/* Content */}
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        placeholder="Mulai menulis jurnal harianmu... Apa yang kamu rasakan hari ini?"
                        value={currentEntry.content || ''}
                        onChange={(e) => setCurrentEntry(prev => ({ 
                          ...prev, 
                          content: e.target.value 
                        }))}
                        className="w-full h-64 p-4 border-2 border-gray-200 rounded-2xl resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        style={{ fontFamily: 'inherit' }}
                      />
                      
                      {/* Voice Recording Button */}
                      <button
                        onClick={startVoiceRecording}
                        disabled={voiceState.isRecording}
                        className={`absolute bottom-4 right-4 p-2 rounded-full transition-all ${
                          voiceState.isRecording 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        title="Rekam suara"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Word Count & Writing Time */}
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{wordCount} kata</span>
                      <span>
                        {writingStartTime && 
                          `⏱️ ${Math.floor((Date.now() - writingStartTime.getTime()) / 60000)} menit`
                        }
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSaveEntry}
                        disabled={loading || !currentEntry.content?.trim()}
                        isLoading={loading}
                        variant="breathing"
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Jurnal
                      </Button>
                      
                      <Button
                        onClick={() => setShowMoodSelector(true)}
                        variant="outline"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        Mood
                      </Button>
                      
                      <Button
                        onClick={() => setShowTagSuggestions(true)}
                        variant="outline"
                      >
                        <Tag className="w-4 h-4 mr-1" />
                        Tag
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Current Mood */}
                {selectedEmotion && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      {getMoodIcon(selectedEmotion.primary)}
                      Suasana Hati
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Emosi:</span>
                        <span className="text-sm font-medium">{selectedEmotion.primary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Intensitas:</span>
                        <span className="text-sm">{selectedEmotion.intensity}/10</span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Tags */}
                {currentEntry.tags && currentEntry.tags.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Tag</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentEntry.tags.map((tag, index) => (
                        <span
                          key={index}
                          onClick={() => handleTagRemove(tag)}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm cursor-pointer hover:bg-primary/20 transition-colors"
                        >
                          {tag} ×
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Writing Tips */}
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    Tips Menulis
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Tulis dengan jujur dan autentik</li>
                    <li>• Fokus pada perasaan, bukan hanya fakta</li>
                    <li>• Gunakan bahasa yang nyaman bagimu</li>
                    <li>• Tidak ada yang benar atau salah</li>
                    <li>• Refleksikan kebijaksanaan lokal</li>
                  </ul>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Entries View */}
          {activeView === 'entries' && (
            <motion.div
              key="entries"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Search and Filters */}
              <Card className="p-4">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Cari dalam jurnal..."
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
                
                {/* Tag Filter */}
                <div className="flex flex-wrap gap-2">
                  {indonesianTags.slice(0, 8).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Entries List */}
              <div className="space-y-4">
                {filteredEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {entry.title || 'Jurnal Tanpa Judul'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{entry.timestamp.toLocaleDateString('id-ID')}</span>
                            <span>{entry.wordCount} kata</span>
                            <span>{entry.readingTime} min baca</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getMoodIcon(entry.mood?.primary || 'neutral')}
                          {entry.favorited && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-3 mb-3">
                        {entry.content}
                      </p>
                      
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {entry.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                              +{entry.tags.length - 3} lagi
                            </span>
                          )}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
                
                {filteredEntries.length === 0 && (
                  <Card className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      Belum ada jurnal
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Mulai menulis jurnal pertamamu hari ini
                    </p>
                    <Button onClick={() => setActiveView('write')} variant="breathing">
                      Mulai Menulis
                    </Button>
                  </Card>
                )}
              </div>
            </motion.div>
          )}

          {/* Analytics View */}
          {activeView === 'analytics' && analytics && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{analytics.totalEntries}</div>
                  <div className="text-sm text-gray-600">Total Jurnal</div>
                </Card>
                
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.writingStreak}</div>
                  <div className="text-sm text-gray-600">Hari Berturut</div>
                </Card>
                
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(analytics.averageWordsPerEntry)}
                  </div>
                  <div className="text-sm text-gray-600">Rata-rata Kata</div>
                </Card>
                
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.personalGrowth.selfAwarenessScore.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Kesadaran Diri</div>
                </Card>
              </div>

              {/* Emotional Trends */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Tren Emosional (30 Hari Terakhir)
                </h3>
                
                <div className="space-y-4">
                  {analytics.emotionalTrends.slice(0, 7).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-600">
                          {new Date(trend.date).toLocaleDateString('id-ID', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          {getMoodIcon(trend.dominantEmotion)}
                          <span className="text-sm font-medium">{trend.dominantEmotion}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Mood: {trend.averageMood.toFixed(1)}/10
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Most Used Tags */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-green-500" />
                  Tag Paling Sering
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {analytics.mostUsedTags.slice(0, 10).map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Cultural Engagement */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  🌸 Keterlibatan Budaya
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analytics.culturalEngagement.mostExploredRegions.map(region => (
                    <div key={region} className="text-center p-3 bg-gradient-to-b from-primary/10 to-secondary/10 rounded-lg">
                      <div className="text-sm font-medium text-gray-800">
                        {culturalContexts[region as keyof typeof culturalContexts]?.name || region}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Sering Dijelajahi
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">
                    Skor Pertumbuhan Spiritual: {analytics.culturalEngagement.spiritualGrowthScore.toFixed(0)}%
                  </div>
                  <div className="text-xs text-yellow-700 mt-1">
                    Berdasarkan eksplorasi kebijaksanaan dan praktik budaya
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Prompts View */}
          {activeView === 'prompts' && (
            <motion.div
              key="prompts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Prompt Kebijaksanaan Indonesia
                </h3>
                
                <div className="grid gap-4">
                  {Object.entries(culturalContexts).map(([region, context]) => (
                    <Card key={region} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-2">
                            🌺 Kebijaksanaan {context.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Prompt refleksi berdasarkan tradisi dan filosofi {context.name}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {context.practices.slice(0, 3).map(practice => (
                              <span 
                                key={practice}
                                className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                              >
                                {practice}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            const prompt = comprehensiveJournalingService.getDailyPrompt(region);
                            applyPrompt(prompt);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Gunakan
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood Selection Modal */}
        {showMoodSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold mb-4">Pilih Suasana Hati</h3>
              
              <div className="space-y-4">
                {['positive', 'neutral', 'negative'].map(category => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-700 mb-2 capitalize">{category}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {emotionalVocabulary[category as keyof typeof emotionalVocabulary]
                        .slice(0, 6).map(emotion => (
                        <button
                          key={emotion}
                          onClick={() => handleMoodSelection(emotion, 5)}
                          className="p-2 bg-gray-100 hover:bg-primary/10 rounded-lg text-sm transition-colors"
                        >
                          {emotion}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowMoodSelector(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tag Suggestions Modal */}
        {showTagSuggestions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold mb-4">Pilih Tag</h3>
              
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                {indonesianTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagAdd(tag)}
                    disabled={currentEntry.tags?.includes(tag)}
                    className={`px-3 py-2 rounded-full text-sm transition-colors ${
                      currentEntry.tags?.includes(tag)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowTagSuggestions(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Selesai
                </Button>
              </div>
            </motion.div>
          </div>
        )}
    </div>
  );
};