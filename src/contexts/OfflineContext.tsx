/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, type ReactNode } from 'react';

export interface OfflineContextType {
  isOnline: boolean;
  showOfflineToast: boolean;
  hideOfflineToast: () => void;
}

export const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-hide offline toast after 5 seconds
    if (showOfflineToast) {
      const timer = setTimeout(() => {
        setShowOfflineToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showOfflineToast]);

  const hideOfflineToast = () => {
    setShowOfflineToast(false);
  };

  return (
    <OfflineContext.Provider 
      value={{ 
        isOnline, 
        showOfflineToast, 
        hideOfflineToast 
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};