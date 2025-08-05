import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { CustomMeditationSession, MeditationSegment } from '../../types/personalization';

interface CustomSessionBuilderProps {
  className?: string;
  onSessionCreated?: (session: CustomMeditationSession) => void;
}

export const CustomSessionBuilder: React.FC<CustomSessionBuilderProps> = ({ 
  className = '',
  onSessionCreated 
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [sessionData, setSessionData] = useState<Partial<CustomMeditationSession>>({
    title: '',
    description: '',
    duration: 600, // 10 minutes default
    techniques: [],
    backgroundMusic: '',
    voiceGuidance: '',
    structure: [],
    difficulty: 'beginner',
    tags: [],
    isPublic: false
  });

  const [currentSegment, setCurrentSegment] = useState<Partial<MeditationSegment>>({
    type: 'breathing',
    duration: 120,
    instructions: '',
    order: 1
  });

  const segmentTypes = [
    {
      value: 'breathing',
      label: 'Pernapasan',
      icon: '🌬️',
      description: 'Fokus pada napas untuk ketenangan'
    },
    {
      value: 'body_scan',
      label: 'Body Scan',
      icon: '🧘',
      description: 'Pemindaian tubuh untuk relaksasi'
    },
    {
      value: 'mindfulness',
      label: 'Mindfulness',
      icon: '🎯',
      description: 'Kesadaran penuh pada momen ini'
    },
    {
      value: 'loving_kindness',
      label: 'Loving Kindness',
      icon: '❤️',
      description: 'Meditasi cinta kasih dan belas kasih'
    },
    {
      value: 'visualization',
      label: 'Visualisasi',
      icon: '🌟',
      description: 'Membayangkan tempat atau situasi damai'
    },
    {
      value: 'silence',
      label: 'Keheningan',
      icon: '🤫',
      description: 'Momen hening tanpa instruksi'
    }
  ];

  const backgroundMusics = [
    { value: '', label: 'Tanpa Musik' },
    { value: 'nature_sounds', label: 'Suara Alam' },
    { value: 'tibetan_bowls', label: 'Tibetan Singing Bowls' },
    { value: 'ambient_music', label: 'Musik Ambient' },
    { value: 'rain_sounds', label: 'Suara Hujan' },
    { value: 'ocean_waves', label: 'Gelombang Laut' },
    { value: 'forest_sounds', label: 'Suara Hutan' }
  ];

  const voiceOptions = [
    { value: '', label: 'Tanpa Suara' },
    { value: 'female_calm', label: 'Suara Wanita - Tenang' },
    { value: 'male_deep', label: 'Suara Pria - Dalam' },
    { value: 'female_warm', label: 'Suara Wanita - Hangat' },
    { value: 'male_gentle', label: 'Suara Pria - Lembut' }
  ];

  const commonTechniques = [
    'Pernapasan 4-7-8',
    'Box Breathing',
    'Body Scan Progresif',
    'Mindful Observation',
    'Loving Kindness',
    'Visualization',
    'Mantra Repetition',
    'Present Moment Awareness'
  ];

  const addSegment = () => {
    if (!currentSegment.type || !currentSegment.duration || !currentSegment.instructions) {
      alert('Mohon lengkapi semua field segment');
      return;
    }

    const newSegment: MeditationSegment = {
      id: `segment_${Date.now()}`,
      type: currentSegment.type as 'breathing' | 'body_scan' | 'mindfulness' | 'loving_kindness' | 'visualization' | 'silence',
      duration: currentSegment.duration,
      instructions: currentSegment.instructions,
      voiceNote: currentSegment.voiceNote,
      order: (sessionData.structure?.length || 0) + 1
    };

    setSessionData(prev => ({
      ...prev,
      structure: [...(prev.structure || []), newSegment],
      duration: (prev.duration || 0) + newSegment.duration
    }));

    // Reset current segment
    setCurrentSegment({
      type: 'breathing',
      duration: 120,
      instructions: '',
      order: (sessionData.structure?.length || 0) + 2
    });
  };

  const removeSegment = (segmentId: string) => {
    setSessionData(prev => {
      const newStructure = prev.structure?.filter(s => s.id !== segmentId) || [];
      const newDuration = newStructure.reduce((sum, s) => sum + s.duration, 0);
      
      // Reorder segments
      const reorderedStructure = newStructure.map((segment, index) => ({
        ...segment,
        order: index + 1
      }));

      return {
        ...prev,
        structure: reorderedStructure,
        duration: newDuration
      };
    });
  };

  const moveSegment = (segmentId: string, direction: 'up' | 'down') => {
    setSessionData(prev => {
      const structure = [...(prev.structure || [])];
      const segmentIndex = structure.findIndex(s => s.id === segmentId);
      
      if (segmentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? segmentIndex - 1 : segmentIndex + 1;
      if (newIndex < 0 || newIndex >= structure.length) return prev;
      
      // Swap segments
      [structure[segmentIndex], structure[newIndex]] = [structure[newIndex], structure[segmentIndex]];
      
      // Update order
      structure.forEach((segment, index) => {
        segment.order = index + 1;
      });
      
      return { ...prev, structure };
    });
  };

  const handleTechniqueToggle = (technique: string) => {
    setSessionData(prev => ({
      ...prev,
      techniques: prev.techniques?.includes(technique)
        ? prev.techniques.filter(t => t !== technique)
        : [...(prev.techniques || []), technique]
    }));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const newTag = e.currentTarget.value.trim();
      if (!sessionData.tags?.includes(newTag)) {
        setSessionData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag]
        }));
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tag: string) => {
    setSessionData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const saveSession = async () => {
    if (!user || !sessionData.title || !sessionData.structure?.length) {
      alert('Mohon lengkapi judul dan tambahkan minimal satu segment');
      return;
    }

    try {
      const customSession: CustomMeditationSession = {
        id: `custom_${Date.now()}`,
        userId: user.uid,
        title: sessionData.title!,
        description: sessionData.description || '',
        duration: sessionData.duration || 0,
        techniques: sessionData.techniques || [],
        backgroundMusic: sessionData.backgroundMusic,
        voiceGuidance: sessionData.voiceGuidance,
        structure: sessionData.structure || [],
        difficulty: sessionData.difficulty || 'beginner',
        tags: sessionData.tags || [],
        isPublic: sessionData.isPublic || false,
        likesCount: 0,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // In a real app, this would save to Firestore
      console.log('Saving custom session:', customSession);
      
      if (onSessionCreated) {
        onSessionCreated(customSession);
      }

      // Reset form
      setSessionData({
        title: '',
        description: '',
        duration: 600,
        techniques: [],
        backgroundMusic: '',
        voiceGuidance: '',
        structure: [],
        difficulty: 'beginner',
        tags: [],
        isPublic: false
      });
      setStep(1);

      alert('Sesi meditasi custom berhasil dibuat!');
    } catch (error) {
      console.error('Error saving custom session:', error);
      alert('Gagal menyimpan sesi. Silakan coba lagi.');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getSegmentIcon = (type: string) => {
    return segmentTypes.find(st => st.value === type)?.icon || '🎯';
  };

  const nextStep = () => setStep(Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Buat Sesi Meditasi Custom</h3>
          <p className="text-gray-600">Rancang sesi meditasi sesuai kebutuhan Anda</p>
        </div>
        <div className="text-3xl">🛠️</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Langkah {step} dari {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {step === 1 && 'Info Dasar'}
            {step === 2 && 'Struktur Sesi'}
            {step === 3 && 'Audio & Musik'}
            {step === 4 && 'Review & Simpan'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <Input
              label="Judul Sesi"
              value={sessionData.title || ''}
              onChange={(e) => setSessionData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Misal: Sesi Relaksasi Malam"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              value={sessionData.description || ''}
              onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Jelaskan tujuan dan manfaat sesi ini..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level Kesulitan
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map(level => (
                <label
                  key={level}
                  className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    sessionData.difficulty === level
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={sessionData.difficulty === level}
                    onChange={(e) => setSessionData(prev => ({ ...prev, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert' }))}
                    className="sr-only"
                  />
                  <span className="font-medium capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teknik yang Digunakan
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonTechniques.map(technique => (
                <label
                  key={technique}
                  className={`flex items-center p-2 border rounded-lg cursor-pointer transition-all ${
                    sessionData.techniques?.includes(technique)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sessionData.techniques?.includes(technique) || false}
                    onChange={() => handleTechniqueToggle(technique)}
                    className="sr-only"
                  />
                  <span className="text-sm">{technique}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (tekan Enter untuk menambah)
            </label>
            <Input
              placeholder="Misal: relaksasi, tidur, stres"
              onKeyPress={handleTagInput}
            />
            {sessionData.tags && sessionData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {sessionData.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Session Structure */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Struktur Sesi</h4>
            <p className="text-gray-600 mb-6">
              Bangun sesi Anda dengan menambahkan segment-segment meditasi
            </p>
          </div>

          {/* Add Segment Form */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <h5 className="font-medium text-gray-900">Tambah Segment Baru</h5>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Segment
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {segmentTypes.map(type => (
                  <label
                    key={type.value}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      currentSegment.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="segmentType"
                      value={type.value}
                      checked={currentSegment.type === type.value}
                      onChange={(e) => setCurrentSegment(prev => ({ ...prev, type: e.target.value as 'breathing' | 'body_scan' | 'mindfulness' | 'loving_kindness' | 'visualization' | 'silence' }))}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi (detik)
                </label>
                <Input
                  type="number"
                  value={currentSegment.duration || ''}
                  onChange={(e) => setCurrentSegment(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  min="30"
                  max="1800"
                  placeholder="120"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {currentSegment.duration ? formatDuration(currentSegment.duration) : ''}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instruksi untuk Segment Ini
              </label>
              <textarea
                value={currentSegment.instructions || ''}
                onChange={(e) => setCurrentSegment(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Misal: Tarik napas dalam-dalam, tahan selama 4 detik, lalu buang napas perlahan..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <Button onClick={addSegment} className="w-full">
              ➕ Tambah Segment
            </Button>
          </div>

          {/* Current Structure */}
          {sessionData.structure && sessionData.structure.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-4">
                Struktur Sesi ({formatDuration(sessionData.duration || 0)})
              </h5>
              <div className="space-y-3">
                {sessionData.structure.map((segment, index) => (
                  <div
                    key={segment.id}
                    className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="text-2xl">{getSegmentIcon(segment.type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h6 className="font-medium text-gray-900">
                          {segmentTypes.find(st => st.value === segment.type)?.label || segment.type}
                        </h6>
                        <div className="text-sm text-gray-500">
                          {formatDuration(segment.duration)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {segment.instructions}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveSegment(segment.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ⬆️
                      </button>
                      <button
                        onClick={() => moveSegment(segment.id, 'down')}
                        disabled={index === sessionData.structure!.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => removeSegment(segment.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Audio & Music */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Audio</h4>
            <p className="text-gray-600 mb-6">
              Pilih musik latar dan panduan suara untuk sesi Anda
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Musik Latar Belakang
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {backgroundMusics.map(music => (
                <label
                  key={music.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    sessionData.backgroundMusic === music.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="backgroundMusic"
                    value={music.value}
                    checked={sessionData.backgroundMusic === music.value}
                    onChange={(e) => setSessionData(prev => ({ ...prev, backgroundMusic: e.target.value }))}
                    className="sr-only"
                  />
                  <span className="font-medium">{music.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Panduan Suara
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {voiceOptions.map(voice => (
                <label
                  key={voice.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    sessionData.voiceGuidance === voice.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="voiceGuidance"
                    value={voice.value}
                    checked={sessionData.voiceGuidance === voice.value}
                    onChange={(e) => setSessionData(prev => ({ ...prev, voiceGuidance: e.target.value }))}
                    className="sr-only"
                  />
                  <span className="font-medium">{voice.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={sessionData.isPublic || false}
                onChange={(e) => setSessionData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">Bagikan dengan komunitas</span>
                <p className="text-sm text-gray-600">
                  Pengguna lain dapat melihat dan menggunakan sesi ini
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Step 4: Review & Save */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Review Sesi</h4>
            <p className="text-gray-600 mb-6">
              Periksa kembali detail sesi sebelum menyimpan
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <h5 className="text-xl font-bold text-gray-900 mb-2">{sessionData.title}</h5>
            <p className="text-gray-600 mb-4">{sessionData.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatDuration(sessionData.duration || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Durasi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {sessionData.structure?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Segments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {sessionData.techniques?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Teknik</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 capitalize">
                  {sessionData.difficulty}
                </div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Musik Latar: </span>
                <span className="text-gray-600">
                  {backgroundMusics.find(m => m.value === sessionData.backgroundMusic)?.label || 'Tanpa Musik'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Panduan Suara: </span>
                <span className="text-gray-600">
                  {voiceOptions.find(v => v.value === sessionData.voiceGuidance)?.label || 'Tanpa Suara'}
                </span>
              </div>
              {sessionData.tags && sessionData.tags.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Tags: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sessionData.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Structure Preview */}
          {sessionData.structure && sessionData.structure.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Struktur Sesi</h5>
              <div className="space-y-2">
                {sessionData.structure.map((segment, index) => (
                  <div key={segment.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="text-lg">{getSegmentIcon(segment.type)}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {segmentTypes.find(st => st.value === segment.type)?.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDuration(segment.duration)} - {segment.instructions.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-8 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 1}
        >
          ← Sebelumnya
        </Button>

        {step < totalSteps ? (
          <Button
            onClick={nextStep}
            disabled={
              (step === 1 && !sessionData.title) ||
              (step === 2 && (!sessionData.structure || sessionData.structure.length === 0))
            }
          >
            Selanjutnya →
          </Button>
        ) : (
          <Button
            onClick={saveSession}
            className="bg-green-500 hover:bg-green-600"
          >
            ✨ Simpan Sesi
          </Button>
        )}
      </div>
    </div>
  );
};