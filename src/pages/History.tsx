import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Cairn } from '../components/ui/Cairn';
import { useSmartBack } from '../hooks/useNavigationHistory';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabaseClient';
import { Play, Calendar, Mountain, Sparkles } from 'lucide-react';

interface MeditationSession {
  id: string;
  userId: string;
  duration: number;
  type: string;
  completedAt: Date;
  completed: boolean;
}

export const History: React.FC = () => {
  const { goBack } = useSmartBack('/');
  const { user, isGuest } = useAuth();
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    currentStreak: 0,
    totalMinutes: 0,
    totalSessions: 0
  });

  useEffect(() => {
    if (isGuest || !user) {
      setLoading(false);
      return;
    }
    fetchUserSessions();
  }, [user, isGuest]);

  const fetchUserSessions = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not available');
        return;
      }
      
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const sessions = data || [];
      setSessions(sessions);
      
      // Calculate real stats
      const completedSessions = sessions.filter(s => s.completed);
      const totalMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0);
      const currentStreak = calculateStreak(completedSessions);
      
      setStats({
        currentStreak,
        totalMinutes,
        totalSessions: completedSessions.length
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (sessions: MeditationSession[]) => {
    if (sessions.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    const uniqueDays = new Set();
    
    for (const session of sessions) {
      const sessionDate = new Date(session.completedAt);
      sessionDate.setHours(0, 0, 0, 0);
      const dayString = sessionDate.toISOString().split('T')[0];
      
      if (!uniqueDays.has(dayString)) {
        uniqueDays.add(dayString);
        const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };

  if (loading) {
    return (
      <div>
        <Header title="Riwayat Meditasi" showBack={true} onBack={goBack} />
        <div className="px-4 py-6">
          <div className="animate-pulse space-y-4">
            <Card className="h-32" />
            <Card className="h-20" />
            <Card className="h-20" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state for new users
  if (isGuest || sessions.length === 0) {
    return (
      <div>
        <Header title="Riwayat Meditasi" showBack={true} onBack={goBack} />
        
        <div className="px-4 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-meditation-zen-100 to-meditation-calm-100 rounded-full flex items-center justify-center">
              <Mountain className="w-12 h-12 text-meditation-zen-600" />
            </div>
            
            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-4">
              {isGuest ? "Mulai Perjalanan Anda" : "Belum Ada Riwayat"}
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              {isGuest 
                ? "Daftar untuk mulai membangun riwayat meditasi dan melihat perkembangan spiritual Anda"
                : "Mulai sesi meditasi pertama Anda untuk membangun riwayat dan melihat perkembangan"
              }
            </p>

            <div className="space-y-4">
              {isGuest ? (
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => goBack()}
                  className="px-8"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Mulai Bermeditasi
                </Button>
              ) : (
                <Button 
                  variant="meditation" 
                  size="lg"
                  onClick={() => goBack()}
                  className="px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Mulai Sesi Pertama
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Riwayat Meditasi" showBack={true} onBack={goBack} />
      
      <div className="px-4 py-6 space-y-6">
        {/* Real Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Cairn progress={Math.min(stats.currentStreak * 10, 100)} size="large" />
              </div>
              <div>
                <h3 className="text-xl font-heading text-gray-800">
                  {stats.currentStreak > 0 
                    ? `Streak ${stats.currentStreak} Hari` 
                    : "Mulai Streak Anda"
                  }
                </h3>
                <p className="text-sm text-gray-600">
                  Total {stats.totalMinutes} menit dari {stats.totalSessions} sesi
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Real Sessions List */}
        <div className="space-y-4">
          <h3 className="font-heading text-gray-800">Sesi Terbaru</h3>
          {sessions.slice(0, 10).map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card padding="small">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${session.completed ? 'bg-meditation-zen-500' : 'bg-gray-300'}`}
                      ></div>
                      <h4 className="font-medium text-gray-800">{session.type}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(session.completedAt).toLocaleDateString('id-ID')} • {session.duration} menit
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Cairn progress={session.completed ? 100 : 0} size="small" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More Sessions */}
        {sessions.length >= 10 && (
          <div className="text-center">
            <Button variant="outline" onClick={() => {}}>
              Lihat Lebih Banyak
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};