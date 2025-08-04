import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getPersonalizedGreeting, getContextualWelcomeMessage, getUserPreferredLanguage } from '../../utils/user-display';
import { AuthModal } from './AuthModal';

interface WelcomeMessageProps {
  className?: string;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ className = '' }) => {
  const { user, userProfile, isGuest } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!user && !isGuest) return null;

  const getGreeting = () => {
    const language = getUserPreferredLanguage(userProfile);
    return getPersonalizedGreeting(user, userProfile, isGuest, language === 'en');
  };

  const getWelcomeMessage = () => {
    return getContextualWelcomeMessage(user, userProfile, isGuest);
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
            {getGreeting()}!
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
              <button 
                className="ml-1 underline hover:no-underline"
                onClick={() => setShowAuthModal(true)}
              >
                Create account
              </button> to keep your data.
            </p>
          </div>
        </div>
      )}
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signup"
      />
    </div>
  );
};