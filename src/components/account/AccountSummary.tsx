import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const AccountSummary: React.FC = () => {
  const { user, userProfile, isGuest } = useAuth();

  if (isGuest || !user || !userProfile) {
    return null;
  }

  const accountAge = Math.floor((Date.now() - userProfile.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const signInMethod = user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email';
  
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-6 border border-primary/20">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/80 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{accountAge}</div>
          <div className="text-sm text-gray-600">Days with us</div>
        </div>
        
        <div className="bg-white/80 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{userProfile.progress.totalSessions}</div>
          <div className="text-sm text-gray-600">Sessions completed</div>
        </div>
        
        <div className="bg-white/80 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{userProfile.progress.totalMinutes}</div>
          <div className="text-sm text-gray-600">Minutes meditated</div>
        </div>
        
        <div className="bg-white/80 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{userProfile.progress.streak}</div>
          <div className="text-sm text-gray-600">Current streak</div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Signed in with {signInMethod}</span>
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.emailVerified 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {user.emailVerified ? 'Verified' : 'Unverified'}
        </span>
      </div>
    </div>
  );
};