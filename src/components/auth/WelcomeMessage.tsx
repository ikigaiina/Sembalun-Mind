import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface WelcomeMessageProps {
  className?: string;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ className = '' }) => {
  const { user, userProfile, isGuest } = useAuth();

  if (!user && !isGuest) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDisplayName = () => {
    if (isGuest) return 'Guest';
    return userProfile?.displayName || user?.displayName || 'there';
  };

  const getWelcomeMessage = () => {
    if (isGuest) {
      return 'Explore Sembalun as a guest. Sign up to save your progress!';
    }
    
    const totalSessions = userProfile?.progress?.totalSessions || 0;
    const streak = userProfile?.progress?.streak || 0;
    
    if (totalSessions === 0) {
      return 'Welcome to your mindfulness journey!';
    }
    
    if (streak > 0) {
      return `${streak} day streak! Keep up the great work.`;
    }
    
    return 'Ready for your next session?';
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-3">
        {!isGuest && userProfile?.photoURL ? (
          <img
            src={userProfile.photoURL}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        <div>
          <h2 className="text-xl font-semibold text-gray-900 font-heading">
            {getGreeting()}, {getDisplayName()}!
          </h2>
          <p className="text-gray-600 text-sm">
            {getWelcomeMessage()}
          </p>
        </div>
      </div>
      
      {isGuest && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700">
              <strong>Guest mode:</strong> Your progress won't be saved. 
              <button className="ml-1 underline hover:no-underline">
                Create account
              </button> to keep your data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};