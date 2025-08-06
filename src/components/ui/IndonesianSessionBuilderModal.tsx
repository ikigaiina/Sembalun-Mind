import React, { useState, useCallback } from 'react';
import { MeditationModal, INDONESIAN_COLORS } from './IndonesianModal';
import { SessionPhase } from './CustomSessionBuilder';
import { Plus, Trash2, Edit3, Play, Save, Clock, Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface IndonesianSessionBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: { name: string; phases: SessionPhase[]; totalDuration: number }) => void;
  onPreview?: (phases: SessionPhase[]) => void;
  initialPhases?: SessionPhase[];
  darkMode?: boolean;
}

// Indonesian meditation phase types with cultural elements
const INDONESIAN_PHASE_TYPES = [
  { 
    id: 'breathing', 
    label: 'Pernapasan', 
    indonesianLabel: 'Napas',
    color: INDONESIAN_COLORS.primary.green, 
    icon: '🌬️',
    culturalElement: 'Seperti angin sepoi-sepoi di pagi hari',
    guidance: 'Rasakan napas sebagai energi kehidupan'
  },
  { 
    id: 'mindfulness', 
    label: 'Kesadaran Penuh', 
    indonesianLabel: 'Sadar Penuh',
    color: INDONESIAN_COLORS.secondary.bamboo, 
    icon: '🧘‍♀️',
    culturalElement: 'Seperti ketenangan air danau di pegunungan',
    guidance: 'Hadir sepenuhnya di momen ini'
  },
  { 
    id: 'body_scan', 
    label: 'Pemindaian Tubuh', 
    indonesianLabel: 'Scan Tubuh',
    color: INDONESIAN_COLORS.secondary.teak, 
    icon: '🫸',
    culturalElement: 'Seperti menyapa setiap bagian tubuh dengan lembut',
    guidance: 'Rasakan setiap bagian tubuh dengan penuh kasih'
  },
  { 
    id: 'loving_kindness', 
    label: 'Cinta Kasih', 
    indonesianLabel: 'Metta',
    color: INDONESIAN_COLORS.primary.gold, 
    icon: '💝',
    culturalElement: 'Seperti kehangatan matahari pagi untuk semua makhluk',
    guidance: 'Kirimkan cinta kasih untuk diri dan sesama'
  },
  { 
    id: 'focus', 
    label: 'Konsentrasi', 
    indonesianLabel: 'Fokus',
    color: INDONESIAN_COLORS.primary.terracotta, 
    icon: '🎯',
    culturalElement: 'Seperti mata air jernih yang tak tergoyahkan',
    guidance: 'Pusatkan pikiran pada satu titik'
  },
  { 
    id: 'relaxation', 
    label: 'Relaksasi', 
    indonesianLabel: 'Santai',
    color: INDONESIAN_COLORS.secondary.sunrise, 
    icon: '🌊',
    culturalElement: 'Seperti ombak lembut di pantai sore',
    guidance: 'Lepaskan semua ketegangan dengan lembut'
  },
  { 
    id: 'transition', 
    label: 'Transisi', 
    indonesianLabel: 'Peralihan',
    color: INDONESIAN_COLORS.neutral.stone, 
    icon: '🔄',
    culturalElement: 'Seperti pergantian siang dan malam yang alami',
    guidance: 'Bersiap untuk fase selanjutnya'
  }
];

// Indonesian preset sessions with cultural wisdom
const INDONESIAN_PRESET_SESSIONS = [
  {
    name: 'Perjalanan Pemula',
    culturalName: 'Langkah Pertama',
    description: 'Sesi khusus untuk pemula yang ingin memulai meditasi',
    phases: [
      { 
        id: '1', 
        name: 'Pemusatan Diri', 
        duration: 3, 
        type: 'breathing' as const, 
        instruction: 'Pusatkan perhatian pada napas untuk menenangkan diri', 
        color: INDONESIAN_COLORS.primary.green, 
        guidance: 'guided' as const
      },
      { 
        id: '2', 
        name: 'Pernapasan Sadar', 
        duration: 10, 
        type: 'breathing' as const, 
        instruction: 'Lanjutkan dengan pernapasan yang penuh kesadaran', 
        color: INDONESIAN_COLORS.primary.green, 
        guidance: 'minimal' as const
      },
      { 
        id: '3', 
        name: 'Penutupan', 
        duration: 2, 
        type: 'relaxation' as const, 
        instruction: 'Kembali dengan lembut ke kesadaran sehari-hari', 
        color: INDONESIAN_COLORS.secondary.sunrise, 
        guidance: 'guided' as const
      }
    ]
  },
  {
    name: 'Fokus Mendalam',
    culturalName: 'Konsentrasi Batin',
    description: 'Untuk melatih konsentrasi dan fokus yang mendalam',
    phases: [
      { 
        id: '1', 
        name: 'Persiapan Batin', 
        duration: 4, 
        type: 'breathing' as const, 
        instruction: 'Siapkan pikiran untuk meditasi fokus yang mendalam', 
        color: INDONESIAN_COLORS.primary.green, 
        guidance: 'guided' as const
      },
      { 
        id: '2', 
        name: 'Fokus Satu Titik', 
        duration: 18, 
        type: 'focus' as const, 
        instruction: 'Pusatkan perhatian pada satu titik atau objek', 
        color: INDONESIAN_COLORS.primary.terracotta, 
        guidance: 'minimal' as const
      },
      { 
        id: '3', 
        name: 'Integrasi', 
        duration: 3, 
        type: 'mindfulness' as const, 
        instruction: 'Integrasikan keadaan fokus dengan kesadaran', 
        color: INDONESIAN_COLORS.secondary.bamboo, 
        guidance: 'guided' as const
      }
    ]
  },
  {
    name: 'Tubuh dan Jiwa',
    culturalName: 'Keselarasan Diri',
    description: 'Menyelaraskan tubuh dan pikiran dengan cinta kasih',
    phases: [
      { 
        id: '1', 
        name: 'Kesadaran Napas', 
        duration: 4, 
        type: 'breathing' as const, 
        instruction: 'Mulai dengan kesadaran penuh pada napas', 
        color: INDONESIAN_COLORS.primary.green, 
        guidance: 'guided' as const
      },
      { 
        id: '2', 
        name: 'Pemindaian Tubuh', 
        duration: 15, 
        type: 'body_scan' as const, 
        instruction: 'Pindai seluruh tubuh dengan kesadaran penuh', 
        color: INDONESIAN_COLORS.secondary.teak, 
        guidance: 'guided' as const
      },
      { 
        id: '3', 
        name: 'Cinta Kasih', 
        duration: 10, 
        type: 'loving_kindness' as const, 
        instruction: 'Kirimkan cinta kasih kepada diri sendiri dan orang lain', 
        color: INDONESIAN_COLORS.primary.gold, 
        guidance: 'guided' as const
      },
      { 
        id: '4', 
        name: 'Peristirahatan Akhir', 
        duration: 3, 
        type: 'relaxation' as const, 
        instruction: 'Beristirahat dalam kesadaran yang penuh damai', 
        color: INDONESIAN_COLORS.secondary.sunrise, 
        guidance: 'minimal' as const
      }
    ]
  }
];

export const IndonesianSessionBuilderModal: React.FC<IndonesianSessionBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onPreview,
  initialPhases = [],
  darkMode = false
}) => {
  const [sessionName, setSessionName] = useState('');
  const [phases, setPhases] = useState<SessionPhase[]>(initialPhases);
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'name' | 'presets' | 'build' | 'review'>('name');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addPhase = useCallback(() => {
    const newPhase: SessionPhase = {
      id: generateId(),
      name: 'Fase Baru',
      duration: 5,
      type: 'mindfulness' as const,
      instruction: '',
      color: INDONESIAN_COLORS.secondary.bamboo,
      guidance: 'guided' as const
    };
    setPhases(prev => [...prev, newPhase]);
    setEditingPhase(newPhase.id);
  }, []);

  const removePhase = useCallback((phaseId: string) => {
    setPhases(prev => prev.filter(phase => phase.id !== phaseId));
    if (editingPhase === phaseId) {
      setEditingPhase(null);
    }
  }, [editingPhase]);

  const updatePhase = useCallback((phaseId: string, updates: Partial<SessionPhase>) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId ? { ...phase, ...updates } : phase
    ));
  }, []);

  const movePhase = useCallback((phaseId: string, direction: 'up' | 'down') => {
    setPhases(prev => {
      const currentIndex = prev.findIndex(phase => phase.id === phaseId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newPhases = [...prev];
      [newPhases[currentIndex], newPhases[newIndex]] = [newPhases[newIndex], newPhases[currentIndex]];
      return newPhases;
    });
  }, []);

  const loadPreset = useCallback((presetIndex: number) => {
    const preset = INDONESIAN_PRESET_SESSIONS[presetIndex];
    setSessionName(preset.name);
    setPhases(preset.phases.map(phase => ({ ...phase, id: generateId() })) as SessionPhase[]);
    setSelectedPreset(presetIndex);
    setCurrentStep('build');
    setEditingPhase(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!sessionName.trim()) {
      alert('Mohon masukkan nama sesi');
      return;
    }

    if (phases.length === 0) {
      alert('Mohon tambahkan minimal satu fase');
      return;
    }

    const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
    onSave({
      name: sessionName,
      phases,
      totalDuration
    });
    
    // Reset form
    setSessionName('');
    setPhases([]);
    setEditingPhase(null);
    setCurrentStep('name');
    onClose();
  }, [sessionName, phases, onSave, onClose]);

  const handlePreview = useCallback(() => {
    if (phases.length === 0) {
      alert('Mohon tambahkan minimal satu fase untuk pratinjau');
      return;
    }
    
    if (onPreview) {
      onPreview(phases);
    }
  }, [phases, onPreview]);

  const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);

  const renderNameStep = () => (
    <div className="p-8">
      <div className="text-center mb-8">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: `linear-gradient(135deg, ${INDONESIAN_COLORS.primary.green}, ${INDONESIAN_COLORS.secondary.bamboo})`,
            boxShadow: `0 8px 32px ${INDONESIAN_COLORS.primary.green}40`
          }}
        >
          <Edit3 className="w-10 h-10 text-white" />
        </div>
        <h3 
          className="text-xl font-heading mb-2"
          style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.primary.green }}
        >
          Buat Sesi Meditasi Kustom
        </h3>
        <p 
          className="text-sm font-body"
          style={{ color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow }}
        >
          Rancang sesi meditasi sesuai dengan kebutuhan dan preferensi Anda
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label 
            className="block text-sm font-body font-medium mb-3"
            style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.neutral.shadow }}
          >
            Nama Sesi Meditasi
          </label>
          <Input
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Contoh: Meditasi Pagi Saya"
            className="w-full text-lg"
            style={{
              borderColor: INDONESIAN_COLORS.primary.green,
              backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white'
            }}
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep('presets')}
            className="flex-1 py-3 px-6 rounded-2xl font-body font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : INDONESIAN_COLORS.neutral.sand,
              color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow,
              border: `1px solid ${INDONESIAN_COLORS.primary.gold}40`
            }}
          >
            Pilih Template
          </button>
          <button
            onClick={() => setCurrentStep('build')}
            disabled={!sessionName.trim()}
            className="flex-1 py-3 px-6 rounded-2xl font-body font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${INDONESIAN_COLORS.primary.green}, ${INDONESIAN_COLORS.secondary.bamboo})`,
              color: 'white',
              boxShadow: `0 4px 16px ${INDONESIAN_COLORS.primary.green}40`
            }}
          >
            Buat dari Awal
          </button>
        </div>
      </div>
    </div>
  );

  const renderPresetsStep = () => (
    <div className="p-8">
      <div className="text-center mb-6">
        <h3 
          className="text-xl font-heading mb-2"
          style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.primary.green }}
        >
          Template Sesi Meditasi
        </h3>
        <p 
          className="text-sm font-body"
          style={{ color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow }}
        >
          Pilih template yang sesuai dengan kebutuhan Anda
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {INDONESIAN_PRESET_SESSIONS.map((preset, index) => (
          <button
            key={index}
            onClick={() => loadPreset(index)}
            className="w-full p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 focus:outline-none text-left"
            style={{
              borderColor: selectedPreset === index ? INDONESIAN_COLORS.primary.green : `${INDONESIAN_COLORS.primary.green}40`,
              backgroundColor: selectedPreset === index 
                ? `${INDONESIAN_COLORS.primary.green}15` 
                : darkMode ? 'rgba(0,0,0,0.2)' : 'white',
              boxShadow: selectedPreset === index 
                ? `0 8px 24px ${INDONESIAN_COLORS.primary.green}40` 
                : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 
                  className="font-heading font-semibold text-lg"
                  style={{ color: INDONESIAN_COLORS.primary.green }}
                >
                  {preset.name}
                </h4>
                <p 
                  className="text-sm font-body italic"
                  style={{ color: INDONESIAN_COLORS.primary.gold }}
                >
                  {preset.culturalName}
                </p>
              </div>
              <div className="text-right">
                <div 
                  className="text-sm font-body"
                  style={{ color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow }}
                >
                  {preset.phases.reduce((sum, phase) => sum + phase.duration, 0)} menit
                </div>
                <div 
                  className="text-xs font-body"
                  style={{ color: INDONESIAN_COLORS.secondary.bamboo }}
                >
                  {preset.phases.length} fase
                </div>
              </div>
            </div>
            
            <p 
              className="text-sm font-body mb-4"
              style={{ color: darkMode ? '#FFFFFF60' : INDONESIAN_COLORS.neutral.shadow }}
            >
              {preset.description}
            </p>
            
            {/* Phase visualization */}
            <div className="flex space-x-1">
              {preset.phases.map((phase, phaseIndex) => (
                <div
                  key={phaseIndex}
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: phase.color,
                    width: `${(phase.duration / preset.phases.reduce((sum, p) => sum + p.duration, 0)) * 100}%`
                  }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => setCurrentStep('name')}
          className="flex-1 py-3 px-6 rounded-2xl font-body font-medium transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : INDONESIAN_COLORS.neutral.sand,
            color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow,
            border: `1px solid ${INDONESIAN_COLORS.primary.gold}40`
          }}
        >
          Kembali
        </button>
      </div>
    </div>
  );

  const renderBuildStep = () => (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 
            className="text-xl font-heading"
            style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.primary.green }}
          >
            {sessionName || 'Sesi Meditasi Kustom'}
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" style={{ color: INDONESIAN_COLORS.neutral.shadow }} />
              <span 
                className="text-sm font-body"
                style={{ color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow }}
              >
                Total: {totalDuration} menit
              </span>
            </div>
            <div 
              className="text-sm font-body"
              style={{ color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow }}
            >
              {phases.length} fase
            </div>
          </div>
        </div>
        <Button
          onClick={addPhase}
          size="small"
          style={{
            backgroundColor: INDONESIAN_COLORS.primary.green,
            color: 'white'
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Fase
        </Button>
      </div>

      {phases.length === 0 ? (
        <div className="text-center py-12">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${INDONESIAN_COLORS.primary.green}20` }}
          >
            <Plus className="w-8 h-8" style={{ color: INDONESIAN_COLORS.primary.green }} />
          </div>
          <p 
            className="font-body"
            style={{ color: darkMode ? '#FFFFFF60' : INDONESIAN_COLORS.neutral.shadow }}
          >
            Belum ada fase. Klik "Tambah Fase" untuk memulai.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className="border rounded-2xl transition-all duration-200"
              style={{
                borderColor: editingPhase === phase.id ? INDONESIAN_COLORS.primary.green : `${INDONESIAN_COLORS.primary.green}40`,
                backgroundColor: editingPhase === phase.id 
                  ? `${INDONESIAN_COLORS.primary.green}10` 
                  : darkMode ? 'rgba(0,0,0,0.2)' : 'white'
              }}
            >
              <div className="p-4">
                {editingPhase === phase.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label 
                          className="block text-sm font-body font-medium mb-1"
                          style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.neutral.shadow }}
                        >
                          Nama Fase
                        </label>
                        <Input
                          value={phase.name}
                          onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                          placeholder="Nama fase..."
                        />
                      </div>
                      
                      <div>
                        <label 
                          className="block text-sm font-body font-medium mb-1"
                          style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.neutral.shadow }}
                        >
                          Durasi (menit)
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          value={phase.duration}
                          onChange={(e) => updatePhase(phase.id, { duration: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-body font-medium mb-2"
                        style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.neutral.shadow }}
                      >
                        Jenis Fase
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {INDONESIAN_PHASE_TYPES.map(type => (
                          <button
                            key={type.id}
                            onClick={() => {
                              updatePhase(phase.id, { 
                                type: type.id as SessionPhase['type'],
                                color: type.color
                              });
                            }}
                            className="p-3 rounded-xl border-2 transition-all duration-200 text-left"
                            style={{
                              borderColor: phase.type === type.id ? type.color : `${type.color}40`,
                              backgroundColor: phase.type === type.id ? `${type.color}15` : 'transparent'
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{type.icon}</span>
                              <div>
                                <div 
                                  className="text-sm font-body font-medium"
                                  style={{ color: type.color }}
                                >
                                  {type.label}
                                </div>
                                <div 
                                  className="text-xs font-body"
                                  style={{ color: darkMode ? '#FFFFFF60' : INDONESIAN_COLORS.neutral.shadow }}
                                >
                                  {type.indonesianLabel}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-body font-medium mb-1"
                        style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.neutral.shadow }}
                      >
                        Instruksi
                      </label>
                      <textarea
                        value={phase.instruction || ''}
                        onChange={(e) => updatePhase(phase.id, { instruction: e.target.value })}
                        placeholder="Tambahkan instruksi untuk fase ini..."
                        className="w-full p-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 font-body"
                        style={{
                          borderColor: `${INDONESIAN_COLORS.primary.green}40`,
                          backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'white',
                          color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.neutral.shadow
                        }}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => setEditingPhase(null)}
                        variant="outline"
                        size="small"
                      >
                        Selesai
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: phase.color }}
                        />
                        <span 
                          className="font-body font-medium"
                          style={{ color: darkMode ? '#FFFFFF' : INDONESIAN_COLORS.neutral.shadow }}
                        >
                          {index + 1}. {phase.name}
                        </span>
                      </div>
                      <div 
                        className="text-sm font-body"
                        style={{ color: phase.color }}
                      >
                        {phase.duration} menit • {INDONESIAN_PHASE_TYPES.find(t => t.id === phase.type)?.label}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {index > 0 && (
                        <Button
                          onClick={() => movePhase(phase.id, 'up')}
                          variant="outline"
                          size="small"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                      )}
                      {index < phases.length - 1 && (
                        <Button
                          onClick={() => movePhase(phase.id, 'down')}
                          variant="outline"
                          size="small"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => setEditingPhase(phase.id)}
                        variant="outline"
                        size="small"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => removePhase(phase.id)}
                        variant="outline"
                        size="small"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => setCurrentStep('name')}
          className="flex-1 py-3 px-6 rounded-2xl font-body font-medium transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : INDONESIAN_COLORS.neutral.sand,
            color: darkMode ? '#FFFFFF80' : INDONESIAN_COLORS.neutral.shadow,
            border: `1px solid ${INDONESIAN_COLORS.primary.gold}40`
          }}
        >
          Kembali
        </button>
        {phases.length > 0 && (
          <>
            <Button
              onClick={handlePreview}
              variant="outline"
            >
              <Play className="w-4 h-4 mr-2" />
              Pratinjau
            </Button>
            <Button
              onClick={handleSave}
              style={{
                background: `linear-gradient(135deg, ${INDONESIAN_COLORS.primary.green}, ${INDONESIAN_COLORS.secondary.bamboo})`,
                color: 'white'
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Sesi
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const getCurrentStepTitle = () => {
    switch (currentStep) {
      case 'name':
        return 'Nama Sesi';
      case 'presets':
        return 'Template Sesi';
      case 'build':
        return 'Rancang Sesi';
      case 'review':
        return 'Tinjauan';
      default:
        return 'Buat Sesi';
    }
  };

  return (
    <MeditationModal
      isOpen={isOpen}
      onClose={onClose}
      onBack={currentStep !== 'name' ? () => {
        if (currentStep === 'presets') setCurrentStep('name');
        if (currentStep === 'build') setCurrentStep(selectedPreset !== null ? 'presets' : 'name');
      } : undefined}
      title={getCurrentStepTitle()}
      size="large"
      showHeader={true}
      showBackButton={currentStep !== 'name'}
      gestureEnabled={true}
      darkMode={darkMode}
    >
      {currentStep === 'name' && renderNameStep()}
      {currentStep === 'presets' && renderPresetsStep()}
      {currentStep === 'build' && renderBuildStep()}
    </MeditationModal>
  );
};