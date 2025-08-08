import { useState, useEffect, useCallback } from 'react';
import { useMoodTracker } from './useMoodTracker';

interface OfflineSession {
  id: string;
  type: 'guided' | 'breathing' | 'cultural';
  title: string;
  description: string;
  duration: number;
  steps: OfflineSessionStep[];
  culturalRegion?: string;
  difficulty: 'pemula' | 'menengah' | 'lanjutan';
  timestamp: number;
  completed?: boolean;
  notes?: string;
}

interface OfflineSessionStep {
  id: string;
  type: 'instruction' | 'breathing' | 'reflection' | 'wisdom';
  duration: number;
  title: string;
  content: string;
  breathingPattern?: {
    inhale: number;
    hold: number;
    exhale: number;
    pause: number;
  };
  wisdomQuote?: {
    text: string;
    author: string;
    translation?: string;
  };
}

interface OfflineData {
  sessions: OfflineSession[];
  userProgress: {
    completedSessions: string[];
    totalOfflineMinutes: number;
    lastSync: number;
  };
  culturalContent: {
    wisdomQuotes: any[];
    breathingTechniques: any[];
    regionalPractices: any[];
  };
}

const OFFLINE_STORAGE_KEY = 'sembalun-offline-data';
const MAX_OFFLINE_SESSIONS = 50;

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { saveMoodEntry } = useMoodTracker();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline data on mount
  useEffect(() => {
    const loadOfflineData = () => {
      try {
        const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setOfflineData(data);
        } else {
          initializeOfflineData();
        }
      } catch (error) {
        console.error('Error loading offline data:', error);
        initializeOfflineData();
      }
    };

    loadOfflineData();
  }, []);

  // Initialize default offline data
  const initializeOfflineData = useCallback(() => {
    const defaultData: OfflineData = {
      sessions: [
        {
          id: 'sembalun-sunrise-offline',
          type: 'cultural',
          title: 'Meditasi Fajar Sembalun (Offline)',
          description: 'Meditasi pagi yang terinspirasi dari keindahan fajar di Gunung Rinjani, Sembalun',
          duration: 15,
          culturalRegion: 'sembalun',
          difficulty: 'pemula',
          timestamp: Date.now(),
          steps: [
            {
              id: 'intro',
              type: 'instruction',
              duration: 2,
              title: 'Persiapan',
              content: 'Duduklah dengan nyaman menghadap arah timur jika memungkinkan. Tutup mata dan rasakan udara segar pegunungan Sembalun mengalir dalam tubuh Anda.'
            },
            {
              id: 'breathing-1',
              type: 'breathing',
              duration: 5,
              title: 'Napas Pegunungan',
              content: 'Bernapaslah dengan ritme yang tenang seperti angin pegunungan yang sejuk.',
              breathingPattern: { inhale: 4, hold: 2, exhale: 6, pause: 2 }
            },
            {
              id: 'wisdom',
              type: 'wisdom',
              duration: 3,
              title: 'Kebijaksanaan Sasak',
              content: 'Renungkan kebijaksanaan ini dalam hati Anda.',
              wisdomQuote: {
                text: 'Seperti fajar yang menyinari puncak Rinjani, kedamaian jiwa dimulai dari dalam diri',
                author: 'Kebijaksanaan Sasak',
                translation: 'Seperti fajar yang menyinari puncak Rinjani, kedamaian jiwa dimulai dari dalam diri'
              }
            },
            {
              id: 'reflection',
              type: 'reflection',
              duration: 5,
              title: 'Refleksi Diri',
              content: 'Bayangkan diri Anda di puncak Sembalun, merasakan ketenangan dan kejernihan pikiran. Rasakan energi positif mengalir ke seluruh tubuh.'
            }
          ]
        },
        {
          id: 'java-court-offline',
          type: 'cultural',
          title: 'Meditasi Keraton Jawa (Offline)',
          description: 'Praktik meditasi yang terinspirasi dari kebijaksanaan keraton Jawa',
          duration: 20,
          culturalRegion: 'java',
          difficulty: 'menengah',
          timestamp: Date.now(),
          steps: [
            {
              id: 'intro',
              type: 'instruction',
              duration: 3,
              title: 'Posisi Sila',
              content: 'Duduklah dalam posisi sila dengan punggung tegak. Letakkan tangan dalam mudra yang nyaman di atas lutut.'
            },
            {
              id: 'breathing-1',
              type: 'breathing',
              duration: 7,
              title: 'Napas Pranamasadar',
              content: 'Ikuti pola napas yang dalam dan terukur, seperti yang diajarkan dalam tradisi keraton.',
              breathingPattern: { inhale: 6, hold: 3, exhale: 8, pause: 1 }
            },
            {
              id: 'wisdom',
              type: 'wisdom',
              duration: 4,
              title: 'Kebijaksanaan Jawa',
              content: 'Hayati pesan luhur ini dalam batin Anda.',
              wisdomQuote: {
                text: 'Menguasai diri sendiri adalah kemenangan yang tertinggi',
                author: 'Serat Wedhatama',
                translation: 'Menguasai diri sendiri adalah kemenangan yang tertinggi'
              }
            },
            {
              id: 'reflection',
              type: 'reflection',
              duration: 6,
              title: 'Kontemplasi Budi Luhur',
              content: 'Kontemplasikan nilai-nilai budi pekerti luhur. Rasakan keseimbangan antara pikiran, perasaan, dan tindakan.'
            }
          ]
        },
        {
          id: 'basic-breathing-offline',
          type: 'breathing',
          title: 'Teknik Napas Dasar (Offline)',
          description: 'Latihan pernapasan fundamental untuk pemula',
          duration: 10,
          difficulty: 'pemula',
          timestamp: Date.now(),
          steps: [
            {
              id: 'intro',
              type: 'instruction',
              duration: 1,
              title: 'Persiapan',
              content: 'Duduklah dengan nyaman, punggung tegak, dan tutup mata perlahan.'
            },
            {
              id: 'breathing-basic',
              type: 'breathing',
              duration: 8,
              title: 'Pernapasan 4-4-4',
              content: 'Ikuti pola pernapasan sederhana ini dengan tenang.',
              breathingPattern: { inhale: 4, hold: 4, exhale: 4, pause: 0 }
            },
            {
              id: 'closing',
              type: 'instruction',
              duration: 1,
              title: 'Penutup',
              content: 'Buka mata perlahan dan rasakan ketenangan yang telah Anda ciptakan.'
            }
          ]
        }
      ],
      userProgress: {
        completedSessions: [],
        totalOfflineMinutes: 0,
        lastSync: Date.now()
      },
      culturalContent: {
        wisdomQuotes: [
          {
            text: 'Seperti air yang mengalir tenang, jiwa yang damai membawa kebahagiaan',
            author: 'Kebijaksanaan Nusantara',
            region: 'general'
          },
          {
            text: 'Gunung tinggi dimulai dari tanah yang kokoh',
            author: 'Petuah Jawa',
            region: 'java'
          }
        ],
        breathingTechniques: [
          {
            name: 'Napas Segitiga',
            pattern: { inhale: 3, hold: 3, exhale: 3, pause: 0 },
            description: 'Teknik pernapasan dasar untuk keseimbangan'
          },
          {
            name: 'Napas Persegi',
            pattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
            description: 'Teknik untuk fokus dan konsentrasi'
          }
        ],
        regionalPractices: [
          { region: 'sembalun', focus: 'Kebersihan jiwa dan pikiran' },
          { region: 'java', focus: 'Keseimbangan dan kebijaksanaan' },
          { region: 'bali', focus: 'Harmoni dan keselarasan' }
        ]
      }
    };

    setOfflineData(defaultData);
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(defaultData));
  }, []);

  // Download sessions for offline use
  const downloadSessionsForOffline = useCallback(async (sessionIds: string[] = []) => {
    if (!isOnline) {
      throw new Error('Cannot download sessions while offline');
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Simulate downloading process with progress
      const steps = sessionIds.length || 10;
      for (let i = 0; i <= steps; i++) {
        setDownloadProgress((i / steps) * 100);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Update offline data with new sessions
      const updatedData = offlineData ? {
        ...offlineData,
        userProgress: {
          ...offlineData.userProgress,
          lastSync: Date.now()
        }
      } : null;

      if (updatedData) {
        setOfflineData(updatedData);
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedData));
      }

      setDownloadProgress(100);
      return { success: true, message: 'Sesi berhasil diunduh untuk mode offline' };
    } catch (error) {
      console.error('Error downloading sessions:', error);
      return { success: false, message: 'Gagal mengunduh sesi' };
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(0), 1000);
    }
  }, [isOnline, offlineData]);

  // Get offline sessions
  const getOfflineSessions = useCallback(() => {
    return offlineData?.sessions || [];
  }, [offlineData]);

  // Start offline session
  const startOfflineSession = useCallback((sessionId: string) => {
    const session = offlineData?.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }, [offlineData]);

  // Complete offline session
  const completeOfflineSession = useCallback(async (
    sessionId: string, 
    completionData: {
      actualDuration: number;
      mood?: string;
      notes?: string;
      rating?: number;
    }
  ) => {
    if (!offlineData) return;

    try {
      // Update session completion
      const updatedData = {
        ...offlineData,
        userProgress: {
          ...offlineData.userProgress,
          completedSessions: [...offlineData.userProgress.completedSessions, sessionId],
          totalOfflineMinutes: offlineData.userProgress.totalOfflineMinutes + completionData.actualDuration
        }
      };

      // Mark session as completed
      updatedData.sessions = updatedData.sessions.map(session => 
        session.id === sessionId 
          ? { ...session, completed: true, notes: completionData.notes }
          : session
      );

      setOfflineData(updatedData);
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedData));

      // Save mood entry if provided
      if (completionData.mood) {
        await saveMoodEntry(
          completionData.mood as any,
          {
            sessionId,
            type: 'offline_meditation',
            duration: completionData.actualDuration,
            rating: completionData.rating
          }
        );
      }

      // Store for sync when back online
      const pendingSync = JSON.parse(localStorage.getItem('sembalun-pending-sync') || '[]');
      pendingSync.push({
        type: 'session_completion',
        sessionId,
        completionData,
        timestamp: Date.now()
      });
      localStorage.setItem('sembalun-pending-sync', JSON.stringify(pendingSync));

      return { success: true };
    } catch (error) {
      console.error('Error completing offline session:', error);
      return { success: false, error: 'Gagal menyelesaikan sesi' };
    }
  }, [offlineData, saveMoodEntry]);

  // Sync offline data when back online
  const syncOfflineData = useCallback(async () => {
    if (!isOnline || !offlineData) return;

    try {
      const pendingSync = JSON.parse(localStorage.getItem('sembalun-pending-sync') || '[]');
      
      if (pendingSync.length === 0) {
        return { success: true, synced: 0 };
      }

      // Here you would sync with your backend
      // For now, we'll just clear the pending sync
      localStorage.removeItem('sembalun-pending-sync');
      
      const updatedData = {
        ...offlineData,
        userProgress: {
          ...offlineData.userProgress,
          lastSync: Date.now()
        }
      };

      setOfflineData(updatedData);
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedData));

      return { success: true, synced: pendingSync.length };
    } catch (error) {
      console.error('Error syncing offline data:', error);
      return { success: false, error: 'Gagal menyinkronkan data' };
    }
  }, [isOnline, offlineData]);

  // Get offline stats
  const getOfflineStats = useCallback(() => {
    if (!offlineData) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        totalMinutes: 0,
        lastSync: null,
        availableForDownload: 0
      };
    }

    return {
      totalSessions: offlineData.sessions.length,
      completedSessions: offlineData.userProgress.completedSessions.length,
      totalMinutes: offlineData.userProgress.totalOfflineMinutes,
      lastSync: new Date(offlineData.userProgress.lastSync),
      availableForDownload: Math.max(0, MAX_OFFLINE_SESSIONS - offlineData.sessions.length)
    };
  }, [offlineData]);

  // Clear offline data
  const clearOfflineData = useCallback(() => {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
    localStorage.removeItem('sembalun-pending-sync');
    setOfflineData(null);
    initializeOfflineData();
  }, [initializeOfflineData]);

  return {
    isOnline,
    offlineData,
    isDownloading,
    downloadProgress,
    
    // Actions
    downloadSessionsForOffline,
    getOfflineSessions,
    startOfflineSession,
    completeOfflineSession,
    syncOfflineData,
    clearOfflineData,
    
    // Stats
    getOfflineStats
  };
};