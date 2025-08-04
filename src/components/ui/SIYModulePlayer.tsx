import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import type { 
  SIYModule, 
  SIYExercise, 
  SIYInstruction,
  SIYInteractiveElement
} from '../../types/content';
import { siyContentService } from '../../services/siyContentService';

interface SIYModulePlayerProps {
  module: SIYModule;
  userId: string;
  onExerciseComplete: (exerciseId: string) => void;
  onModuleComplete: () => void;
  onExit: () => void;
  className?: string;
}

export const SIYModulePlayer: React.FC<SIYModulePlayerProps> = ({
  module,
  userId,
  onExerciseComplete,
  onModuleComplete,
  onExit,
  className = ''
}) => {
  const [exercises, setExercises] = useState<SIYExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<SIYExercise | null>(null);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interactiveResponses, setInteractiveResponses] = useState<Record<string, string | number | string[]>>({});
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [exerciseTimer, setExerciseTimer] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const loadExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const exercisesData = await siyContentService.getSIYExercises(module.id);
      setExercises(exercisesData);
      
      if (exercisesData.length > 0) {
        setCurrentExercise(exercisesData[0]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setIsLoading(false);
    }
  }, [module.id]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  // Timer logic for exercise tracking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isExerciseActive && !isPaused && exerciseTimer !== null) {
      interval = setInterval(() => {
        setExerciseTimer(prev => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          }
          return null;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isExerciseActive, isPaused, exerciseTimer]);

  const handleStartExercise = () => {
    if (currentExercise) {
      setIsExerciseActive(true);
      setCurrentInstructionIndex(0);
      // Set timer for first instruction if it has a duration
      const firstInstruction = currentExercise.instructions[0];
      if (firstInstruction?.duration) {
        setExerciseTimer(firstInstruction.duration);
      }
    }
  };

  const handleNextInstruction = () => {
    if (!currentExercise) return;

    const nextIndex = currentInstructionIndex + 1;
    if (nextIndex < currentExercise.instructions.length) {
      setCurrentInstructionIndex(nextIndex);
      const nextInstruction = currentExercise.instructions[nextIndex];
      if (nextInstruction?.duration) {
        setExerciseTimer(nextInstruction.duration);
      }
    } else {
      // Move to reflection phase
      handleExerciseCompleted();
    }
  };

  const handlePreviousInstruction = () => {
    if (currentInstructionIndex > 0) {
      const prevIndex = currentInstructionIndex - 1;
      setCurrentInstructionIndex(prevIndex);
      const prevInstruction = currentExercise?.instructions[prevIndex];
      if (prevInstruction?.duration) {
        setExerciseTimer(prevInstruction.duration);
      }
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleExerciseCompleted = async () => {
    if (!currentExercise) return;

    try {
      // Save progress and responses
      await siyContentService.updateSIYProgress(userId, currentExercise.id, module.id, {
        completionCount: 1,
        totalTimeSpent: currentExercise.duration * 60,
        averageRating: 0, // Could be collected from user
        lastCompleted: new Date(),
        measurements: [],
        insights: [],
        milestones: [],
        personalNotes: [reflectionNotes],
        skillLevel: 'developing',
        streak: 1
      });

      onExerciseComplete(currentExercise.id);

      // Move to next exercise or complete module
      const nextIndex = currentExerciseIndex + 1;
      if (nextIndex < exercises.length) {
        setCurrentExerciseIndex(nextIndex);
        setCurrentExercise(exercises[nextIndex]);
        setIsExerciseActive(false);
        setCurrentInstructionIndex(0);
        setExerciseTimer(null);
        setReflectionNotes('');
        setInteractiveResponses({});
      } else {
        onModuleComplete();
      }

    } catch (err) {
      console.error('Error completing exercise:', err);
    }
  };

  const handleInteractiveResponse = (elementId: string, value: string | number | string[]) => {
    setInteractiveResponses(prev => ({
      ...prev,
      [elementId]: value
    }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const InstructionRenderer: React.FC<{ instruction: SIYInstruction }> = ({ instruction }) => {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-heading text-gray-800 mb-2">
            {instruction.title}
          </h3>
          <div className="text-sm text-gray-500 mb-4">
            Langkah {instruction.step} dari {currentExercise?.instructions.length}
          </div>
        </div>

        <Card className="p-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            {instruction.content}
          </p>

          {instruction.breathingPattern && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="text-sm font-medium text-blue-800 mb-1">Pola Pernapasan:</div>
              <div className="text-blue-700">{instruction.breathingPattern}</div>
            </div>
          )}

          {instruction.bodyPosture && (
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <div className="text-sm font-medium text-green-800 mb-1">Postur Tubuh:</div>
              <div className="text-green-700">{instruction.bodyPosture}</div>
            </div>
          )}

          {instruction.visualCues && instruction.visualCues.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg mb-4">
              <div className="text-sm font-medium text-purple-800 mb-2">Fokus Perhatian:</div>
              <ul className="space-y-1">
                {instruction.visualCues.map((cue, index) => (
                  <li key={index} className="text-purple-700 text-sm">• {cue}</li>
                ))}
              </ul>
            </div>
          )}

          {exerciseTimer !== null && (
            <div className="text-center">
              <div className="text-3xl font-mono text-primary mb-2">
                {formatTime(exerciseTimer)}
              </div>
              <div className="text-sm text-gray-600">Waktu tersisa untuk langkah ini</div>
            </div>
          )}
        </Card>
      </div>
    );
  };

  const InteractiveElementRenderer: React.FC<{ element: SIYInteractiveElement }> = ({ element }) => {
    const value = interactiveResponses[element.id] || '';

    switch (element.type) {
      case 'text-input':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.title}
            </label>
            <p className="text-sm text-gray-600">{element.description}</p>
            <textarea
              value={value as string}
              onChange={(e) => handleInteractiveResponse(element.id, e.target.value)}
              placeholder={element.placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              required={element.required}
            />
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.title}
            </label>
            <p className="text-sm text-gray-600">{element.description}</p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{element.min}</span>
              <input
                type="range"
                min={element.min}
                max={element.max}
                value={value as number || element.min}
                onChange={(e) => handleInteractiveResponse(element.id, parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">{element.max}</span>
            </div>
            <div className="text-center text-lg font-medium text-primary">
              {value || element.min}
            </div>
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.title}
            </label>
            <p className="text-sm text-gray-600">{element.description}</p>
            <div className="space-y-2">
              {element.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValue = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleInteractiveResponse(element.id, [...currentValue, option]);
                      } else {
                        handleInteractiveResponse(element.id, currentValue.filter((v: string) => v !== option));
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              Interactive element type "{element.type}" not yet implemented
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <Card className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat modul SIY...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadExercises} variant="outline">
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Module Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-heading text-gray-800 mb-2">
              {module.title}
            </h1>
            <p className="text-gray-600 leading-relaxed mb-4">
              {module.description}
            </p>
            
            {/* Module Progress */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Latihan {currentExerciseIndex + 1} dari {exercises.length}</span>
              <span>⏱️ {module.estimatedDuration} menit</span>
              <span>📊 {module.difficulty}</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="small"
            onClick={onExit}
            className="ml-4"
          >
            Keluar
          </Button>
        </div>

        {/* Scientific Background */}
        {module.scientificBackground && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Latar Belakang Ilmiah:</h4>
            <p className="text-sm text-blue-700">{module.scientificBackground}</p>
          </div>
        )}
      </Card>

      {/* Exercise Player */}
      {currentExercise && isExerciseActive && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-heading text-gray-800 mb-2">
                {currentExercise.title}
              </h2>
              <p className="text-gray-600">
                {currentExercise.description}
              </p>
            </div>

            {/* Current Instruction */}
            {currentExercise.instructions[currentInstructionIndex] && (
              <InstructionRenderer 
                instruction={currentExercise.instructions[currentInstructionIndex]} 
              />
            )}

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={handlePreviousInstruction}
                disabled={currentInstructionIndex === 0}
              >
                ← Sebelumnya
              </Button>
              
              <Button
                variant="outline"
                onClick={handlePauseResume}
              >
                {isPaused ? '▶️ Lanjut' : '⏸️ Jeda'}
              </Button>
              
              <Button
                variant="primary"
                onClick={handleNextInstruction}
              >
                {currentInstructionIndex === currentExercise.instructions.length - 1 
                  ? 'Selesai' 
                  : 'Lanjut →'
                }
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Exercise Selection */}
      {!isExerciseActive && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading text-gray-800">
                Latihan dalam Modul Ini
              </h3>
              
              {currentExercise && (
                <Button
                  variant="primary"
                  onClick={handleStartExercise}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Mulai Latihan
                </Button>
              )}
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div 
                  key={exercise.id}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${index === currentExerciseIndex
                      ? 'border-primary bg-primary bg-opacity-5' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => {
                    setCurrentExerciseIndex(index);
                    setCurrentExercise(exercise);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${index === currentExerciseIndex
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700'
                      }
                    `}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-1">
                        {exercise.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {exercise.description}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>⏱️ {exercise.duration} menit</span>
                        <span>📊 {exercise.difficulty}</span>
                        <span className="capitalize">🎯 {exercise.type.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Interactive Elements */}
      {currentExercise && !isExerciseActive && currentExercise.interactiveElements && (
        <Card className="p-6">
          <h4 className="font-heading text-gray-800 mb-4">Refleksi dan Interaksi</h4>
          <div className="space-y-6">
            {currentExercise.interactiveElements.map((element) => (
              <InteractiveElementRenderer key={element.id} element={element} />
            ))}
          </div>
        </Card>
      )}

      {/* Reflection Prompts */}
      {currentExercise && !isExerciseActive && currentExercise.reflectionPrompts && (
        <Card className="p-6">
          <h4 className="font-heading text-gray-800 mb-4">Pertanyaan Refleksi</h4>
          <div className="space-y-3 mb-4">
            {currentExercise.reflectionPrompts.map((prompt, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{prompt}</p>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Catatan Refleksi Pribadi
            </label>
            <textarea
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              placeholder="Tuliskan refleksi dan insight dari latihan ini..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        </Card>
      )}

      {/* Module Objectives */}
      {module.objectives.length > 0 && (
        <Card className="p-6">
          <h4 className="font-heading text-gray-800 mb-3">Tujuan Modul</h4>
          <ul className="space-y-2">
            {module.objectives.map((objective, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Tips */}
      {module.tips.length > 0 && (
        <Card className="p-6">
          <h4 className="font-heading text-gray-800 mb-3">Tips untuk Praktik</h4>
          <ul className="space-y-2">
            {module.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};