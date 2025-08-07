import { useState, useEffect } from 'react';
import type { MoodType, MoodEntry, MoodStats } from '../types/mood';
import { getMoodColor } from '../types/mood';

// Re-exports removed to prevent module conflicts - import directly from '../types/mood'


const STORAGE_KEY = 'sembalun_mood_history';

// Mood to numeric value mapping for calculations
const moodValues: Record<MoodType, number> = {
  'very-sad': 1,
  'sad': 2,
  'neutral': 3,
  'happy': 4,
  'very-happy': 5,
  'anxious': 2,
  'angry': 1,
  'calm': 4,
  'excited': 5,
  'tired': 2,
};

export const useMoodTracker = () => {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [loading, setLoading] = useState(true);

  // Load mood history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const entries = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
        setMoodHistory(entries);
        
        // Set current mood if today's entry exists
        const today = new Date().toDateString();
        const todayEntry = entries.find((entry: MoodEntry) => 
          entry.timestamp.toDateString() === today
        );
        if (todayEntry) {
          setCurrentMood(todayEntry.mood);
        }
      }
    } catch (error) {
      console.error('Failed to load mood history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save mood history to localStorage
  const saveMoodHistory = (entries: MoodEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save mood history:', error);
    }
  };

  // Add or update today's mood entry
  const logMood = (mood: MoodType, note?: string, tags?: string[]) => {
    const now = new Date();
    const today = now.toDateString();
    
    setCurrentMood(mood);
    
    setMoodHistory((prev) => {
      // Check if there's already an entry for today
      const existingIndex = prev.findIndex(
        (entry) => entry.timestamp.toDateString() === today
      );
      
      const newEntry: MoodEntry = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `mood_${Date.now()}`,
        mood,
        timestamp: now,
        note,
        tags,
      };
      
      let updatedHistory: MoodEntry[];
      if (existingIndex >= 0) {
        // Update existing entry
        updatedHistory = [...prev];
        updatedHistory[existingIndex] = newEntry;
      } else {
        // Add new entry
        updatedHistory = [...prev, newEntry].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
      }
      
      saveMoodHistory(updatedHistory);
      return updatedHistory;
    });
  };

  // Get mood statistics
  const getMoodStats = (): MoodStats => {
    if (moodHistory.length === 0) {
      return {
        averageMood: 0,
        totalEntries: 0,
        streakDays: 0,
        moodDistribution: {} as Record<MoodType, number>,
        weeklyAverage: [],
      };
    }

    // Calculate average mood
    const averageMood = moodHistory.reduce((sum, entry) => 
      sum + moodValues[entry.mood], 0) / moodHistory.length;

    // Calculate mood distribution
    const moodDistribution = moodHistory.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<MoodType, number>);

    // Fill missing moods with 0
    Object.keys(moodValues).forEach(mood => {
      if (!(mood in moodDistribution)) {
        moodDistribution[mood as MoodType] = 0;
      }
    });

    // Calculate streak days (consecutive days with mood entries)
    let streakDays = 0;
    const sortedHistory = [...moodHistory].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    let currentDate = new Date();
    for (const entry of sortedHistory) {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor(
        (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diffDays === streakDays) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate weekly averages for the last 7 weeks
    const weeklyAverage: number[] = [];
    const now = new Date();
    
    for (let week = 0; week < 7; week++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (week * 7) - 6);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (week * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekEntries = moodHistory.filter(entry => 
        entry.timestamp >= weekStart && entry.timestamp <= weekEnd
      );
      
      if (weekEntries.length > 0) {
        const weekAvg = weekEntries.reduce((sum, entry) => 
          sum + moodValues[entry.mood], 0) / weekEntries.length;
        weeklyAverage.unshift(weekAvg);
      } else {
        weeklyAverage.unshift(0);
      }
    }

    return {
      averageMood,
      totalEntries: moodHistory.length,
      streakDays,
      moodDistribution,
      weeklyAverage,
    };
  };

  // Get mood entries for a specific date range
  const getMoodsByDateRange = (startDate: Date, endDate: Date): MoodEntry[] => {
    return moodHistory.filter(entry => 
      entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  };

  // Get today's mood entry
  const getTodaysMood = (): MoodEntry | null => {
    const today = new Date().toDateString();
    return moodHistory.find(entry => 
      entry.timestamp.toDateString() === today
    ) || null;
  };

  // Delete mood entry
  const deleteMoodEntry = (entryId: string) => {
    setMoodHistory(prev => {
      const updated = prev.filter(entry => entry.id !== entryId);
      saveMoodHistory(updated);
      
      // Update current mood if deleting today's entry
      const today = new Date().toDateString();
      const deletedEntry = prev.find(entry => entry.id === entryId);
      if (deletedEntry && deletedEntry.timestamp.toDateString() === today) {
        setCurrentMood(null);
      }
      
      return updated;
    });
  };

  return {
    moodHistory,
    currentMood,
    loading,
    logMood,
    getMoodStats,
    getMoodsByDateRange,
    getTodaysMood,
    deleteMoodEntry,
  };
};