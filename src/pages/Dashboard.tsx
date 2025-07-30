import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../contexts/OnboardingContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CairnIcon } from '../components/ui/CairnIcon';
import { MoodSelector, type MoodType } from '../components/ui/MoodSelector';
import { BreathingCard } from '../components/ui/BreathingCard';
import { scrollToTop } from '../hooks/useScrollToTop';
import { SembalunBackground } from '../components/ui/SembalunBackground';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: 'breathing' | 'mindfulness' | 'sleep' | 'focus';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface UserStats {
  currentStreak: number;
  totalSessions: number;
  totalMinutes: number;
  todayCompleted: boolean;
}

const recommendedSessions: MeditationSession[] = [
  {
    id: 'morning-breath',
    title: 'Pernapasan Pagi',
    description: 'Mulai hari dengan napas yang tenang dan pikiran yang jernih',
    duration: 5,
    category: 'breathing',
    difficulty: 'beginner'
  },
  {
    id: 'midday-pause',
    title: 'Jeda Siang',
    description: 'Sejenak berhenti di tengah kesibukan untuk menemukan ketenangan',
    duration: 10,
    category: 'mindfulness',
    difficulty: 'beginner'
  },
  {
    id: 'evening-reflection',
    title: 'Refleksi Sore',
    description: 'Akhiri hari dengan rasa syukur dan kedamaian hati',
    duration: 15,
    category: 'mindfulness',
    difficulty: 'intermediate'
  },
  {
    id: 'night-calm',
    title: 'Ketenangan Malam',
    description: 'Lepaskan beban hari untuk tidur yang nyenyak',
    duration: 20,
    category: 'sleep',
    difficulty: 'beginner'
  }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const [userStats] = useState<UserStats>({
    currentStreak: 7,
    totalSessions: 23,
    totalMinutes: 189,
    todayCompleted: false
  });

  // Update time every minute for accurate greeting
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 11) return 'pagi';
    if (hour < 15) return 'siang'; 
    if (hour < 18) return 'sore';
    return 'malam';
  };

  // Get recommended session based on time and user goal
  const getRecommendedSession = (): MeditationSession => {
    const hour = currentTime.getHours();
    const userGoal = onboardingData?.selectedGoal;

    // Time-based recommendations
    if (hour < 11) return recommendedSessions[0]; // Morning
    if (hour < 15) return recommendedSessions[1]; // Midday
    if (hour < 18) return recommendedSessions[2]; // Evening
    
    // Night session, but check user goal
    if (userGoal === 'sleep') return recommendedSessions[3];
    return recommendedSessions[2]; // Default evening reflection
  };

  const recommendedSession = getRecommendedSession();
  const userName = 'Sahabat'; // Default, could be from user profile

  const quickAccessItems = [
    {
      id: 'meditation',
      title: 'Meditasi',
      icon: '🧘‍♀️',
      description: 'Sesi meditasi terpandu',
      color: 'var(--color-primary)',
      route: '/meditation'
    },
    {
      id: 'breathing',
      title: 'Napas',
      icon: '💨',
      description: 'Latihan pernapasan',
      color: 'var(--color-accent)',
      route: '/breathing'
    },
    {
      id: 'explore',
      title: 'Jelajah',
      icon: '🌟',
      description: 'Temukan teknik baru',
      color: 'var(--color-warm)',
      route: '/explore'
    },
    {
      id: 'profile',
      title: 'Profil',
      icon: '👤',
      description: 'Pengaturan & statistik',
      color: '#8B5CF6',
      route: '/profile'
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Sembalun Background */}
      <SembalunBackground 
        variant="default" 
        intensity="subtle" 
        animated={true}
        className="fixed inset-0 z-0"
      />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with greeting */}
        <div className="px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-heading text-gray-800 mb-1">
            Selamat {getGreeting()}, {userName} 🌅
          </h1>
          <p className="text-gray-600 font-body text-sm">
            Bagaimana kabar hatimu hari ini?
          </p>
        </div>
      </div>

      <div className="px-4 space-y-6 max-w-md mx-auto">
        
        {/* Daily mood check-in */}
        <Card className="card-appear hover-lift">
          <MoodSelector 
            selectedMood={selectedMood}
            onMoodSelect={setSelectedMood}
            label="Ceritakan perasaanmu hari ini"
          />
        </Card>

        {/* Streak counter with cairn */}
        <Card className="text-center card-appear hover-glow">
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <h3 className="font-heading text-gray-800 text-lg">Perjalanan Mindful</h3>
              <p className="text-gray-600 text-sm font-body">Konsistensimu membangun kedamaian</p>
            </div>
            <div className="flex flex-col items-center animate-float">
              <CairnIcon 
                progress={Math.min((userStats.currentStreak / 30) * 100, 100)} 
                size={48} 
                variant="artistic"
                className="text-primary mb-1 animate-color-shift" 
              />
              <span className="text-xs text-gray-500 font-body">
                {userStats.currentStreak} hari
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xl font-heading text-gray-700 mb-1">
                {userStats.currentStreak}
              </div>
              <div className="text-xs text-gray-500 font-body">Hari berturut</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-heading text-gray-700 mb-1">
                {userStats.totalSessions}
              </div>
              <div className="text-xs text-gray-500 font-body">Sesi selesai</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-heading text-gray-700 mb-1">
                {userStats.totalMinutes}
              </div>
              <div className="text-xs text-gray-500 font-body">Menit tenang</div>
            </div>
          </div>
        </Card>

        {/* Main 'Jeda Hari Ini' card */}
        <BreathingCard
          title="Jeda Hari Ini"
          description={`${recommendedSession.title} • ${recommendedSession.duration} menit`}
          isActive={false}
          className="relative overflow-hidden card-appear hover-lift animate-shimmer"
        >
          <div className="space-y-4">
            <p className="text-gray-600 font-body text-sm leading-relaxed">
              {recommendedSession.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${recommendedSession.category === 'breathing' ? 'var(--color-accent)' : 'var(--color-primary)'}15` }}
                >
                  <span className="text-lg">
                    {recommendedSession.category === 'breathing' ? '💨' :
                     recommendedSession.category === 'sleep' ? '🌙' :
                     recommendedSession.category === 'focus' ? '🎯' : '🧘‍♀️'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {recommendedSession.difficulty === 'beginner' ? 'Pemula' :
                     recommendedSession.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Direkomendasikan untuk {getGreeting()}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => {
                scrollToTop();
                navigate('/meditation', { state: { session: recommendedSession } });
              }}
              size="large"
              className="w-full relative overflow-hidden"
            >
              <span className="relative z-10">Mulai Jeda</span>
              
              {/* Epic breathing animation with warm gradient */}
              <div 
                className="absolute inset-0 rounded-xl animate-pulse opacity-30"
                style={{ 
                  animationDuration: '3s',
                  background: 'linear-gradient(45deg, rgba(169, 193, 217, 0.4) 0%, rgba(196, 108, 62, 0.3) 50%, rgba(106, 143, 111, 0.4) 100%)'
                }} 
              />
              
              {/* Subtle glow effect */}
              <div 
                className="absolute inset-0 rounded-xl animate-pulse opacity-20"
                style={{ 
                  animationDuration: '2s',
                  animationDelay: '0.5s',
                  background: 'radial-gradient(circle at center, rgba(196, 108, 62, 0.6) 0%, transparent 70%)'
                }} 
              />
            </Button>
          </div>
        </BreathingCard>

        {/* Quick access cards */}
        <div>
          <h3 className="font-heading text-gray-800 mb-4 px-1 animate-fade-in">Jelajahi Ketenangan</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickAccessItems.map((item, index) => (
              <Card
                key={item.id}
                className="cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 card-appear hover-lift hover-glow"
                padding="medium"
                onClick={() => {
                  scrollToTop();
                  navigate(item.route);
                }}
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <div className="text-center space-y-3">
                  <div 
                    className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center animate-gentle-bounce"
                    style={{ 
                      backgroundColor: `${item.color}15`,
                      animationDelay: `${index * 0.5}s` 
                    }}
                  >
                    <span className="text-2xl animate-scale-pulse">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-heading text-gray-800 text-sm mb-1">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 font-body text-xs leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Inspirational quote */}
        <Card className="text-center bg-gradient-to-br from-white/80 to-white/60 card-appear hover-lift">
          <div className="space-y-3">
            <div className="text-2xl animate-float">🌸</div>
            <blockquote className="font-body text-gray-700 text-sm leading-relaxed italic animate-fade-in">
              "Dalam ketenangan, kita menemukan kekuatan. Dalam kesabaran, kita menemukan kebijaksanaan."
            </blockquote>
            <p className="text-xs text-gray-500 font-body animate-fade-in" style={{ animationDelay: '0.5s' }}>
              — Pepatah Jawa
            </p>
          </div>
        </Card>

        {/* Today's achievements */}
        {userStats.todayCompleted && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <div className="flex-1">
                <h4 className="font-heading text-green-800 text-sm mb-1">
                  Luar biasa!
                </h4>
                <p className="text-green-700 font-body text-xs">
                  Kamu sudah menyelesaikan jeda hari ini. Tetap semangat!
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Development: Clear localStorage for testing */}
        {import.meta.env?.DEV && (
          <Card padding="small">
            <h4 className="font-heading text-gray-700 mb-3">Development Tools</h4>
            <p className="text-xs text-gray-600 mb-3">
              Onboarding sudah selesai. Gunakan tombol ini untuk reset dan melihat onboarding lagi.
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="small"
                onClick={() => {
                  const confirmation = confirm('Reset onboarding dan reload aplikasi?');
                  if (confirmation) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full"
              >
                🔄 Reset Onboarding
              </Button>
            </div>
          </Card>
        )}

        {/* Bottom spacing to prevent overlap with navigation */}
        <div className="h-4"></div>
      </div>
      </div>
    </div>
  );
};