import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Edit3, Play, Save, Clock, Palette } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';

export interface SessionPhase {
  id: string;
  name: string;
  duration: number; // in minutes
  type: 'breathing' | 'mindfulness' | 'body_scan' | 'loving_kindness' | 'focus' | 'relaxation' | 'transition';
  instruction?: string;
  color: string;
  sound?: string;
  guidance?: string;
}

interface CustomSessionBuilderProps {
  initialPhases?: SessionPhase[];
  onSave: (session: { name: string; phases: SessionPhase[]; totalDuration: number }) => void;
  onPreview?: (phases: SessionPhase[]) => void;
}

const PHASE_TYPES = [
  { id: 'breathing', label: 'Breathing', color: '#3B82F6', icon: '💨' },
  { id: 'mindfulness', label: 'Mindfulness', color: '#10B981', icon: '🧘‍♀️' },
  { id: 'body_scan', label: 'Body Scan', color: '#8B5CF6', icon: '🫸' },
  { id: 'loving_kindness', label: 'Loving Kindness', color: '#F59E0B', icon: '💝' },
  { id: 'focus', label: 'Focus', color: '#EF4444', icon: '🎯' },
  { id: 'relaxation', label: 'Relaxation', color: '#06B6D4', icon: '🌊' },
  { id: 'transition', label: 'Transition', color: '#6B7280', icon: '🔄' }
];

const PRESET_SESSIONS = [
  {
    name: 'Beginner\'s Journey',
    phases: [
      { id: '1', name: 'Centering', duration: 2, type: 'breathing', instruction: 'Focus on your breath to center yourself', color: '#3B82F6', guidance: 'guided' },
      { id: '2', name: 'Mindful Breathing', duration: 8, type: 'breathing', instruction: 'Continue with mindful breathing', color: '#3B82F6', guidance: 'minimal' },
      { id: '3', name: 'Closing', duration: 2, type: 'relaxation', instruction: 'Gently return to awareness', color: '#06B6D4', guidance: 'guided' }
    ]
  },
  {
    name: 'Deep Focus',
    phases: [
      { id: '1', name: 'Preparation', duration: 3, type: 'breathing' as const, instruction: 'Prepare your mind for focused meditation', color: '#3B82F6', guidance: 'guided' },
      { id: '2', name: 'Single-Point Focus', duration: 15, type: 'focus' as const, instruction: 'Focus on a single point or object', color: '#EF4444', guidance: 'minimal' },
      { id: '3', name: 'Integration', duration: 2, type: 'mindfulness' as const, instruction: 'Integrate your focused state', color: '#10B981', guidance: 'guided' }
    ]
  },
  {
    name: 'Body & Mind',
    phases: [
      { id: '1', name: 'Breath Awareness', duration: 3, type: 'breathing' as const, instruction: 'Begin with breath awareness', color: '#3B82F6', guidance: 'guided' },
      { id: '2', name: 'Body Scan', duration: 12, type: 'body_scan' as const, instruction: 'Systematically scan your entire body', color: '#8B5CF6', guidance: 'guided' },
      { id: '3', name: 'Loving Kindness', duration: 8, type: 'loving_kindness', instruction: 'Send loving kindness to yourself and others', color: '#F59E0B', guidance: 'guided' },
      { id: '4', name: 'Final Rest', duration: 2, type: 'relaxation' as const, instruction: 'Rest in peaceful awareness', color: '#06B6D4', guidance: 'minimal' }
    ]
  }
];

export const CustomSessionBuilder: React.FC<CustomSessionBuilderProps> = ({
  initialPhases = [],
  onSave,
  onPreview
}) => {
  const [sessionName, setSessionName] = useState('');
  const [phases, setPhases] = useState<SessionPhase[]>(initialPhases);
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addPhase = useCallback(() => {
    const newPhase: SessionPhase = {
      id: generateId(),
      name: 'New Phase',
      duration: 5,
      type: 'mindfulness' as const,
      instruction: '',
      color: '#10B981',
      guidance: 'guided'
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

  const loadPreset = useCallback((preset: typeof PRESET_SESSIONS[0]) => {
    setSessionName(preset.name);
    setPhases(preset.phases.map(phase => ({ ...phase, id: generateId() })) as SessionPhase[]);
    setShowPresets(false);
    setEditingPhase(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!sessionName.trim()) {
      alert('Please enter a session name');
      return;
    }

    if (phases.length === 0) {
      alert('Please add at least one phase');
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
  }, [sessionName, phases, onSave]);

  const handlePreview = useCallback(() => {
    if (phases.length === 0) {
      alert('Please add at least one phase to preview');
      return;
    }
    
    if (onPreview) {
      onPreview(phases);
    }
  }, [phases, onPreview]);

  const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-heading text-gray-900 mb-4 flex items-center">
            <Edit3 className="w-5 h-5 mr-2" />
            Custom Session Builder
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Name
              </label>
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name..."
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-body">
                    Total: {totalDuration} minutes
                  </span>
                </div>
                <div className="text-sm text-gray-600 font-body">
                  {phases.length} phase{phases.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <Button
                onClick={() => setShowPresets(!showPresets)}
                variant="outline"
                size="small"
              >
                Load Preset
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Preset Sessions */}
      {showPresets && (
        <Card>
          <div className="p-4">
            <h3 className="font-heading text-gray-900 mb-4">Preset Sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRESET_SESSIONS.map((preset, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors duration-200"
                  onClick={() => loadPreset(preset)}
                >
                  <h4 className="font-medium text-gray-900 mb-2">{preset.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {preset.phases.reduce((sum, phase) => sum + phase.duration, 0)} minutes • {preset.phases.length} phases
                  </p>
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
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Phase Builder */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-gray-900">Session Phases</h3>
            <Button onClick={addPhase} size="small">
              <Plus className="w-4 h-4 mr-2" />
              Add Phase
            </Button>
          </div>

          {phases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-body">No phases added yet. Click "Add Phase" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className={`
                    border rounded-lg transition-all duration-200
                    ${editingPhase === phase.id ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div className="p-4">
                    {editingPhase === phase.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phase Name
                            </label>
                            <Input
                              value={phase.name}
                              onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                              placeholder="Phase name..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Duration (minutes)
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phase Type
                            </label>
                            <select
                              value={phase.type}
                              onChange={(e) => {
                                const selectedType = PHASE_TYPES.find(t => t.id === e.target.value);
                                updatePhase(phase.id, { 
                                  type: e.target.value as SessionPhase['type'],
                                  color: selectedType?.color || phase.color
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              {PHASE_TYPES.map(type => (
                                <option key={type.id} value={type.id}>
                                  {type.icon} {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Guidance Level
                            </label>
                            <select
                              value={phase.guidance}
                              onChange={(e) => updatePhase(phase.id, { guidance: e.target.value as SessionPhase['guidance'] })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              <option value="guided">Guided</option>
                              <option value="minimal">Minimal</option>
                              <option value="silent">Silent</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Instructions
                          </label>
                          <textarea
                            value={phase.instruction || ''}
                            onChange={(e) => updatePhase(phase.id, { instruction: e.target.value })}
                            placeholder="Add instructions for this phase..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Palette className="w-4 h-4 inline mr-1" />
                            Phase Color
                          </label>
                          <div className="flex space-x-2">
                            {PHASE_TYPES.map(type => (
                              <button
                                key={type.id}
                                onClick={() => updatePhase(phase.id, { color: type.color })}
                                className={`
                                  w-8 h-8 rounded-full border-2 transition-all duration-200
                                  ${phase.color === type.color ? 'border-gray-800 scale-110' : 'border-gray-300'}
                                `}
                                style={{ backgroundColor: type.color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            onClick={() => setEditingPhase(null)}
                            variant="outline"
                            size="small"
                          >
                            Done
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
                            <span className="font-medium text-gray-900">
                              {index + 1}. {phase.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 font-body">
                            {phase.duration} min • {PHASE_TYPES.find(t => t.id === phase.type)?.label}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {index > 0 && (
                            <Button
                              onClick={() => movePhase(phase.id, 'up')}
                              variant="outline"
                              size="small"
                            >
                              ↑
                            </Button>
                          )}
                          {index < phases.length - 1 && (
                            <Button
                              onClick={() => movePhase(phase.id, 'down')}
                              variant="outline"
                              size="small"
                            >
                              ↓
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
        </div>
      </Card>

      {/* Actions */}
      {phases.length > 0 && (
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 font-body">
                Ready to save your custom session?
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!sessionName.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Session
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};