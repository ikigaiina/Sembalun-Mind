import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import type { 
  SIYUserProfile,
  SIYModule,
  SIYInsight,
  SIYMilestone
} from '../../types/content';
import { siyContentService } from '../../services/siyContentService';

interface SIYProgressDashboardProps {
  userId: string;
  className?: string;
}

export const SIYProgressDashboard: React.FC<SIYProgressDashboardProps> = ({
  userId,
  className = ''
}) => {
  const [userProfile, setUserProfile] = useState<SIYUserProfile | null>(null);
  const [modules, setModules] = useState<SIYModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('month');

  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profile, allModules] = await Promise.all([
        siyContentService.getSIYUserProfile(userId),
        siyContentService.getSIYModules()
      ]);

      setUserProfile(profile);
      setModules(allModules);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const getOverallProgress = (): number => {
    if (!userProfile) return 0;
    const { attentionSkill, selfAwareness, emotionalRegulation } = userProfile.overallProgress;
    return Math.round((attentionSkill + selfAwareness + emotionalRegulation) / 3);
  };

  const getModuleProgress = (category: 'siy-attention' | 'siy-awareness' | 'siy-regulation'): number => {
    if (!userProfile) return 0;
    
    const categoryModules = modules.filter(m => m.category === category);
    const completedModules = categoryModules.filter(m => 
      userProfile.completedModules.includes(m.id)
    );
    
    return categoryModules.length > 0 
      ? Math.round((completedModules.length / categoryModules.length) * 100)
      : 0;
  };

  const getStreakData = () => {
    // This would typically come from actual usage data
    // For now, we'll simulate based on user profile
    if (!userProfile) return { current: 0, longest: 0 };
    
    return {
      current: 7, // Simulated current streak
      longest: 21 // Simulated longest streak
    };
  };

  const getRecentInsights = (): SIYInsight[] => {
    if (!userProfile) return [];
    
    return userProfile.insights
      .filter(insight => !insight.isRead)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);
  };

  const getRecentMilestones = (): SIYMilestone[] => {
    // This would come from actual progress data
    // For now, we'll return sample milestones
    return [
      {
        id: '1',
        type: 'first-completion',
        title: 'Latihan Pertama Selesai',
        description: 'Anda telah menyelesaikan latihan pernapasan 9-titik pertama kali',
        achievedAt: new Date(),
        badge: '🎯',
        points: 10
      },
      {
        id: '2',
        type: 'streak-achievement',
        title: 'Streak 7 Hari',
        description: 'Konsisten berlatih selama 7 hari berturut-turut',
        achievedAt: new Date(Date.now() - 86400000),
        badge: '🔥',
        points: 25
      }
    ];
  };

  const ProgressCircle: React.FC<{ progress: number; size?: 'small' | 'medium' | 'large' }> = ({ 
    progress, 
    size = 'medium' 
  }) => {
    const sizeClasses = {
      small: 'w-16 h-16',
      medium: 'w-20 h-20',
      large: 'w-24 h-24'
    };

    const radius = size === 'small' ? 28 : size === 'medium' ? 34 : 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;

    return (
      <div className={`${sizeClasses[size]} relative`}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            className="text-primary transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">{progress}%</span>
        </div>
      </div>
    );
  };

  const SkillRadar: React.FC = () => {
    if (!userProfile) return null;

    const skills = [
      { name: 'Perhatian', value: userProfile.overallProgress.attentionSkill },
      { name: 'Kesadaran Diri', value: userProfile.overallProgress.selfAwareness },
      { name: 'Regulasi Emosi', value: userProfile.overallProgress.emotionalRegulation },
      { name: 'Wellbeing', value: userProfile.overallProgress.overallWellbeing }
    ];

    return (
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">{skill.name}</span>
              <span className="font-medium text-gray-900">{skill.value}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${skill.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <Card className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat progress...</p>
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
          <Button onClick={loadProgressData} variant="outline">
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className={`${className}`}>
        <Card className="p-8 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-heading text-gray-800 mb-2">
            Mulai Perjalanan SIY Anda
          </h3>
          <p className="text-gray-600 mb-4">
            Belum ada progress SIY. Mulai dengan modul Latihan Perhatian untuk membangun fondasi praktik Anda.
          </p>
          <Button variant="primary">
            Mulai Latihan Pertama
          </Button>
        </Card>
      </div>
    );
  }

  const streakData = getStreakData();
  const recentInsights = getRecentInsights();
  const recentMilestones = getRecentMilestones();

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading text-gray-800">
            Progress SIY Anda
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Level: {userProfile.currentLevel} • 
            {userProfile.completedModules.length} dari {modules.length} modul selesai
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={selectedTimeframe === 'week' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setSelectedTimeframe('week')}
          >
            Minggu
          </Button>
          <Button
            variant={selectedTimeframe === 'month' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setSelectedTimeframe('month')}
          >
            Bulan
          </Button>
          <Button
            variant={selectedTimeframe === 'all' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setSelectedTimeframe('all')}
          >
            Semua
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <Card className="p-6 text-center">
          <ProgressCircle progress={getOverallProgress()} size="large" />
          <h3 className="font-medium text-gray-800 mt-3">Progress Keseluruhan</h3>
          <p className="text-xs text-gray-600 mt-1">Rata-rata semua skill</p>
        </Card>

        {/* Streak */}
        <Card className="p-6 text-center">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-primary">{streakData.current}</div>
          <h3 className="font-medium text-gray-800 mt-1">Hari Beruntun</h3>
          <p className="text-xs text-gray-600">Terpanjang: {streakData.longest} hari</p>
        </Card>

        {/* Total Practice Time */}
        <Card className="p-6 text-center">
          <div className="text-3xl mb-2">⏱️</div>
          <div className="text-2xl font-bold text-primary">42</div>
          <h3 className="font-medium text-gray-800 mt-1">Jam Latihan</h3>
          <p className="text-xs text-gray-600">Total waktu praktik</p>
        </Card>

        {/* Achievements */}
        <Card className="p-6 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-primary">{recentMilestones.length}</div>
          <h3 className="font-medium text-gray-800 mt-1">Pencapaian</h3>
          <p className="text-xs text-gray-600">Badge yang diraih</p>
        </Card>
      </div>

      {/* Skills Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Skill Development */}
        <Card className="p-6">
          <h3 className="text-lg font-heading text-gray-800 mb-4">Perkembangan Skill</h3>
          <SkillRadar />
        </Card>

        {/* Module Progress */}
        <Card className="p-6">
          <h3 className="text-lg font-heading text-gray-800 mb-4">Progress per Modul</h3>
          <div className="space-y-6">
            
            {/* Attention Training */}
            <div className="flex items-center space-x-4">
              <ProgressCircle progress={getModuleProgress('siy-attention')} size="small" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">Latihan Perhatian</h4>
                <p className="text-sm text-gray-600">Membangun fondasi perhatian</p>
              </div>
            </div>

            {/* Self-Awareness */}
            <div className="flex items-center space-x-4">
              <ProgressCircle progress={getModuleProgress('siy-awareness')} size="small" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">Kesadaran Diri</h4>
                <p className="text-sm text-gray-600">Mengembangkan pemahaman diri</p>
              </div>
            </div>

            {/* Self-Regulation */}
            <div className="flex items-center space-x-4">
              <ProgressCircle progress={getModuleProgress('siy-regulation')} size="small" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">Pengaturan Diri</h4>
                <p className="text-sm text-gray-600">Menguasai regulasi emosi</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Insights */}
        <Card className="p-6">
          <h3 className="text-lg font-heading text-gray-800 mb-4">Insight Terbaru</h3>
          {recentInsights.length > 0 ? (
            <div className="space-y-3">
              {recentInsights.map((insight) => (
                <div key={insight.id} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-500 mt-0.5">💡</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800">{insight.title}</h4>
                      <p className="text-sm text-blue-700 mt-1">{insight.description}</p>
                      <p className="text-xs text-blue-600 mt-2">
                        {insight.createdAt.toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Belum ada insight terbaru. Terus berlatih untuk mendapatkan pemahaman baru!
            </p>
          )}
        </Card>

        {/* Recent Milestones */}
        <Card className="p-6">
          <h3 className="text-lg font-heading text-gray-800 mb-4">Pencapaian Terbaru</h3>
          {recentMilestones.length > 0 ? (
            <div className="space-y-3">
              {recentMilestones.map((milestone) => (
                <div key={milestone.id} className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="text-2xl">{milestone.badge}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">{milestone.title}</h4>
                      <p className="text-sm text-green-700 mt-1">{milestone.description}</p>
                      <p className="text-xs text-green-600 mt-2">
                        +{milestone.points} poin • {milestone.achievedAt.toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Belum ada pencapaian. Mulai berlatih untuk meraih milestone pertama Anda!
            </p>
          )}
        </Card>
      </div>

      {/* Goals & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personal Goals */}
        <Card className="p-6">
          <h3 className="text-lg font-heading text-gray-800 mb-4">Tujuan Personal</h3>
          {userProfile.personalGoals.length > 0 ? (
            <ul className="space-y-2">
              {userProfile.personalGoals.map((goal, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-primary mt-1">🎯</span>
                  <span className="text-gray-700">{goal}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Belum ada tujuan yang ditetapkan. 
              <br />
              <Button variant="outline" size="small" className="mt-2">
                Tetapkan Tujuan
              </Button>
            </p>
          )}
        </Card>

        {/* Next Steps */}
        <Card className="p-6">
          <h3 className="text-lg font-heading text-gray-800 mb-4">Langkah Selanjutnya</h3>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800">Lanjutkan Latihan Harian</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Pertahankan konsistensi dengan latihan pernapasan 10 menit setiap hari
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800">Eksplorasi Kesadaran Diri</h4>
              <p className="text-sm text-purple-700 mt-1">
                Coba latihan pemetaan emosi untuk meningkatkan kesadaran diri
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Praktik STOP Technique</h4>
              <p className="text-sm text-green-700 mt-1">
                Terapkan teknik STOP dalam situasi menantang sehari-hari
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};