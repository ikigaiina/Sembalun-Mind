import React, { useState, useCallback, useMemo } from 'react';
import { useAuth, useAuthStatus } from '../../hooks/useAuth';
import { AuthModal } from './AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  /** Allow guest users to access this route */
  allowGuest?: boolean;
  /** Show loading spinner while auth state is being determined */
  showLoadingSpinner?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Redirect callback when authentication is required */
  onAuthRequired?: () => void;
}

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

const AuthPrompt: React.FC<{ onShowModal: () => void }> = ({ onShowModal }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-heading">
        Sign in to Sembalun
      </h2>
      <p className="text-gray-600 mb-8">
        Create an account or sign in to save your progress and access personalized features.
      </p>
      <button
        onClick={onShowModal}
        className="bg-primary text-white px-8 py-3 rounded-2xl font-medium hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label="Open authentication modal"
      >
        Get Started
      </button>
    </div>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  requireAuth = true,
  allowGuest = false,
  showLoadingSpinner = true,
  loadingComponent,
  onAuthRequired
}) => {
  const { user, isGuest, loading } = useAuth();
  useAuthStatus(); // Keep for auth state synchronization
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Memoize auth check to prevent unnecessary re-calculations
  const isAuthorized = useMemo(() => {
    if (!requireAuth) return true;
    if (allowGuest && (user || isGuest)) return true;
    if (!allowGuest && user && !isGuest) return true;
    return false;
  }, [requireAuth, allowGuest, user, isGuest]);

  const handleAuthRequired = useCallback(() => {
    if (onAuthRequired) {
      onAuthRequired();
    } else {
      setShowAuthModal(true);
    }
  }, [onAuthRequired]);

  const handleCloseModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  // Show loading state while authentication is being determined
  if (loading && showLoadingSpinner) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // If auth is not required, always show children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If user is authorized, show children
  if (isAuthorized) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show authentication prompt
  return (
    <>
      <AuthPrompt onShowModal={handleAuthRequired} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseModal}
      />
    </>
  );
};