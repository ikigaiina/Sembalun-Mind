import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

interface NavigationHistoryState {
  path: string;
  timestamp: number;
  fromDashboard: boolean;
}

const NAVIGATION_HISTORY_KEY = 'sembalun-navigation-history';
const MAX_HISTORY_LENGTH = 10;

export const useNavigationHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousLocation = useRef<string>('');

  // Get navigation history from localStorage
  const getHistory = (): NavigationHistoryState[] => {
    try {
      const history = localStorage.getItem(NAVIGATION_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.warn('Error reading navigation history:', error);
      return [];
    }
  };

  // Save navigation history to localStorage
  const saveHistory = (history: NavigationHistoryState[]) => {
    try {
      // Keep only the most recent entries
      const trimmedHistory = history.slice(-MAX_HISTORY_LENGTH);
      localStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.warn('Error saving navigation history:', error);
    }
  };

  // Add current page to navigation history
  const addToHistory = (path: string, fromDashboard = false) => {
    const history = getHistory();
    const newEntry: NavigationHistoryState = {
      path,
      timestamp: Date.now(),
      fromDashboard
    };

    // Don't add duplicate consecutive entries
    const lastEntry = history[history.length - 1];
    if (lastEntry?.path !== path) {
      history.push(newEntry);
      saveHistory(history);
    }
  };

  // Get the previous page from history
  const getPreviousPage = (): string | null => {
    const history = getHistory();
    if (history.length < 2) return null;

    // Find the page before current page
    const currentPath = location.pathname;
    for (let i = history.length - 2; i >= 0; i--) {
      const entry = history[i];
      if (entry.path !== currentPath) {
        return entry.path;
      }
    }
    
    return null;
  };

  // Navigate back to previous page or fallback
  const navigateBack = (fallback = '/') => {
    const previousPage = getPreviousPage();
    
    if (previousPage) {
      navigate(previousPage);
    } else {
      // If no history, go to fallback (dashboard)
      navigate(fallback);
    }
  };

  // Check if we can go back
  const canGoBack = (): boolean => {
    return getPreviousPage() !== null;
  };

  // Get a smart back destination (previous page or appropriate fallback)
  const getBackDestination = (): string => {
    const previousPage = getPreviousPage();
    
    if (previousPage) {
      return previousPage;
    }

    // Smart fallback based on current page
    const currentPath = location.pathname;
    if (currentPath.startsWith('/meditation') || currentPath.includes('breathing')) {
      return '/explore'; // Meditation pages likely came from explore
    } else if (currentPath.startsWith('/profile') || currentPath.startsWith('/settings')) {
      return '/'; // Profile/settings likely came from dashboard
    } else {
      return '/'; // Default to dashboard
    }
  };

  // Clear navigation history
  const clearHistory = () => {
    try {
      localStorage.removeItem(NAVIGATION_HISTORY_KEY);
    } catch (error) {
      console.warn('Error clearing navigation history:', error);
    }
  };

  // Track page changes automatically
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Don't track if we're just changing hash or search params
    if (previousLocation.current !== currentPath) {
      // Determine if this navigation came from dashboard
      const fromDashboard = previousLocation.current === '/' || previousLocation.current === '/dashboard';
      addToHistory(currentPath, fromDashboard);
      previousLocation.current = currentPath;
    }
  }, [location.pathname]);

  return {
    navigateBack,
    canGoBack,
    getBackDestination,
    getPreviousPage,
    clearHistory,
    getHistory: () => getHistory()
  };
};

// Utility function for components that need simple back navigation
export const useSmartBack = (fallback = '/') => {
  const { navigateBack, canGoBack, getBackDestination } = useNavigationHistory();
  
  return {
    goBack: () => navigateBack(fallback),
    canGoBack: canGoBack(),
    backDestination: getBackDestination()
  };
};