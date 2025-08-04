import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import type { Course, MeditationSession, UserProgress } from '../../types/content';
import { contentDatabase } from '../../services/contentDatabase';
import { EnhancedAudioPlayer } from './EnhancedAudioPlayer';
import { GuidedScriptPlayer } from './GuidedScriptPlayer';

interface CoursePlayerProps {
  course: Course;
  userId: string;
  onSessionComplete: (sessionId: string) => void;
  onCourseComplete: () => void;
  onExit: () => void;
  className?: string;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  course,
  userId,
  onSessionComplete,
  onCourseComplete,
  onExit,
  className = ''
}) => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [currentSession, setCurrentSession] = useState<MeditationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const loadCourseData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load sessions for this course
      const sessionsPromises = course.sessions.map(sessionId => 
        contentDatabase.getSession(sessionId)
      );
      const sessionsResults = await Promise.all(sessionsPromises);
      const validSessions = sessionsResults.filter(Boolean) as MeditationSession[];
      
      // Load user progress
      const progress = await contentDatabase.getUserProgress(userId);
      const courseProgress = progress.filter(p => 
        course.sessions.includes(p.sessionId)
      );

      setSessions(validSessions);
      setUserProgress(courseProgress);

      // Set current session (first incomplete or first session)
      const firstIncompleteIndex = validSessions.findIndex(session => 
        !courseProgress.some(p => p.sessionId === session.id && p.completionPercentage >= 100)
      );
      const startIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;
      
      setCurrentSessionIndex(startIndex);
      setCurrentSession(validSessions[startIndex] || null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  }, [course.sessions, userId]);

  // Load course data
  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const getSessionProgress = (sessionId: string): UserProgress | null => {
    return userProgress.find(p => p.sessionId === sessionId) || null;
  };

  const isSessionCompleted = (sessionId: string): boolean => {
    const progress = getSessionProgress(sessionId);
    return progress ? progress.completionPercentage >= 100 : false;
  };

  const getCompletedSessionsCount = (): number => {
    return sessions.filter(session => isSessionCompleted(session.id)).length;
  };

  const getCourseProgressPercentage = (): number => {
    if (sessions.length === 0) return 0;
    return Math.round((getCompletedSessionsCount() / sessions.length) * 100);
  };

  const canAccessSession = (sessionIndex: number): boolean => {
    // First session is always accessible
    if (sessionIndex === 0) return true;
    
    // Can access if previous session is completed
    const previousSession = sessions[sessionIndex - 1];
    return previousSession ? isSessionCompleted(previousSession.id) : false;
  };

  const handleSessionSelect = (sessionIndex: number) => {
    if (!canAccessSession(sessionIndex)) return;
    
    setCurrentSessionIndex(sessionIndex);
    setCurrentSession(sessions[sessionIndex]);
    setIsSessionActive(false);
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
  };

  const handleSessionCompleted = async () => {
    if (!currentSession) return;

    try {
      // Update progress
      const progressData: UserProgress = {
        userId,
        sessionId: currentSession.id,
        courseId: course.id,
        completedAt: new Date(),
        totalTime: currentSession.duration * 60, // Convert to seconds
        completionPercentage: 100,
        streak: 1, // TODO: Calculate actual streak
        favorited: false,
        lastAccessedAt: new Date()
      };

      await contentDatabase.updateUserProgress(progressData);
      onSessionComplete(currentSession.id);

      // Update local state
      setUserProgress(prev => {
        const filtered = prev.filter(p => p.sessionId !== currentSession.id);
        return [...filtered, progressData];
      });

      // Check if course is completed
      const newCompletedCount = getCompletedSessionsCount() + 1;
      if (newCompletedCount >= sessions.length) {
        onCourseComplete();
        return;
      }

      // Move to next session
      const nextIndex = currentSessionIndex + 1;
      if (nextIndex < sessions.length) {
        setCurrentSessionIndex(nextIndex);
        setCurrentSession(sessions[nextIndex]);
        setIsSessionActive(false);
      }

    } catch (err) {
      console.error('Error updating progress:', err);
    }

    setIsSessionActive(false);
  };

  const SessionListItem: React.FC<{ 
    session: MeditationSession; 
    index: number;
    isActive: boolean;
    canAccess: boolean;
  }> = ({ session, index, isActive, canAccess }) => {
    const progress = getSessionProgress(session.id);
    const isCompleted = isSessionCompleted(session.id);

    return (
      <div 
        className={`
          flex items-center p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
          ${isActive 
            ? 'border-primary bg-primary bg-opacity-5' 
            : canAccess 
              ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50' 
              : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
          }
        `}
        onClick={() => canAccess && handleSessionSelect(index)}
      >
        {/* Session Number & Status */}
        <div className="flex items-center space-x-3">
          <div 
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${isCompleted 
                ? 'bg-green-500 text-white' 
                : isActive 
                  ? 'bg-primary text-white'
                  : canAccess 
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-400'
              }
            `}
          >
            {isCompleted ? '✓' : index + 1}
          </div>
          
          {!canAccess && !isCompleted && (
            <div className="text-gray-400">🔒</div>
          )}
        </div>

        {/* Session Info */}
        <div className="flex-1 min-w-0 ml-3">
          <h4 className={`font-medium truncate ${canAccess ? 'text-gray-800' : 'text-gray-500'}`}>
            {session.title}
          </h4>
          <p className={`text-sm truncate ${canAccess ? 'text-gray-600' : 'text-gray-400'}`}>
            {session.duration} menit • {session.difficulty}
          </p>
          
          {progress && progress.completionPercentage > 0 && progress.completionPercentage < 100 && (
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="ml-3">
          {isActive && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <Card className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat kursus...</p>
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
          <Button onClick={loadCourseData} variant="outline">
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Course Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-heading text-gray-800 mb-2">
              {course.title}
            </h1>
            <p className="text-gray-600 leading-relaxed">
              {course.description}
            </p>
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

        {/* Course Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress Kursus</span>
            <span className="font-medium text-gray-800">
              {getCompletedSessionsCount()} dari {sessions.length} sesi
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getCourseProgressPercentage()}%` }}
            />
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            {getCourseProgressPercentage()}% selesai
          </div>
        </div>

        {/* Course Metadata */}
        <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
          <span>👤 {course.instructor}</span>
          <span>⏱️ {course.estimatedDuration} menit total</span>
          <span>📊 {course.difficulty}</span>
          {course.averageRating > 0 && (
            <span>⭐ {course.averageRating.toFixed(1)}</span>
          )}
        </div>
      </Card>

      {/* Current Session Player */}
      {currentSession && isSessionActive && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-heading text-gray-800 mb-2">
                {currentSession.title}
              </h2>
              <p className="text-gray-600">
                Sesi {currentSessionIndex + 1} dari {sessions.length}
              </p>
            </div>

            {/* Audio Player */}
            {currentSession.audioFile && (
              <EnhancedAudioPlayer
                audioFile={currentSession.audioFile}
                isActive={isSessionActive}
                onComplete={handleSessionCompleted}
                showAdvancedControls={true}
              />
            )}

            {/* Guided Script Player */}
            {currentSession.guidedScript && (
              <GuidedScriptPlayer
                script={currentSession.guidedScript}
                isActive={isSessionActive}
                onComplete={handleSessionCompleted}
              />
            )}

            {/* Session Controls */}
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsSessionActive(false)}
              >
                Jeda
              </Button>
              
              <Button
                variant="primary"
                onClick={handleSessionCompleted}
              >
                Selesai Sesi
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Session Selection */}
      {!isSessionActive && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading text-gray-800">
                Sesi Kursus
              </h3>
              
              {currentSession && (
                <Button
                  variant="primary"
                  onClick={handleStartSession}
                  disabled={!canAccessSession(currentSessionIndex)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Mulai Sesi
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {sessions.map((session, index) => (
                <SessionListItem
                  key={session.id}
                  session={session}
                  index={index}
                  isActive={index === currentSessionIndex}
                  canAccess={canAccessSession(index)}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Course Objectives */}
      {course.objectives.length > 0 && (
        <Card className="p-6">
          <h4 className="font-heading text-gray-800 mb-3">Tujuan Kursus</h4>
          <ul className="space-y-2">
            {course.objectives.map((objective, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};