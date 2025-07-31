import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useOnboarding } from '../hooks/useOnboarding';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, isGuest } = useAuth();
  const { resetOnboarding } = useOnboarding();

  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-heading text-gray-800 mb-2">Profil Saya</h1>
        <p className="text-gray-600 font-body">Kelola pengaturan dan lihat perkembangan meditasimu</p>
      </div>

      {/* Profile Summary */}
      <Card className="text-center">
        <div className="py-8">
          {!isGuest && userProfile?.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-primary"
            />
          ) : (
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          
          <h3 className="font-heading text-gray-800 text-xl mb-2">
            {isGuest ? 'Guest User' : userProfile?.displayName || user?.displayName || 'Sahabat'}
          </h3>
          
          <p className="text-gray-600 font-body text-sm mb-6">
            {isGuest 
              ? 'Exploring Sembalun as a guest' 
              : user?.email || 'Welcome to your mindfulness journey'}
          </p>

          {!isGuest && userProfile && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userProfile.progress.totalSessions}</div>
                <div className="text-xs text-gray-600">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userProfile.progress.totalMinutes}</div>
                <div className="text-xs text-gray-600">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userProfile.progress.streak}</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
            </div>
          )}
          
          <Button onClick={() => navigate('/settings')}>
            Account Settings
          </Button>
          
          {import.meta.env?.DEV && (
            <Button
              variant="outline"
              size="small"
              onClick={resetOnboarding}
              className="mt-4"
            >
              Reset Onboarding (Dev)
            </Button>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="font-heading text-gray-800 text-lg mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button 
            onClick={() => navigate('/history')}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Session History</div>
                <div className="text-sm text-gray-500">View your meditation progress</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button 
            onClick={() => navigate('/journal')}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Mindfulness Journal</div>
                <div className="text-sm text-gray-500">Record your thoughts and insights</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </Card>
    </div>
  );
};