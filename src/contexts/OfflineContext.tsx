import { useState, useEffect, useCallback, useMemo, useRef, useContext, type ReactNode } from 'react';
import { OfflineContext, type OfflineContextType } from './OfflineContextTypes';

// Re-export for external use
export { OfflineContext, type OfflineContextType };

interface OfflineProviderProps {
  children: ReactNode;
  /** Duration in milliseconds to show offline toast (default: 5000) */
  toastDuration?: number;
  /** Callback when online status changes */
  onStatusChange?: (isOnline: boolean) => void;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({
  children,
  toastDuration = 5000,
  onStatusChange
}) => {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with current online status, fallback to true if not available
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);

  // Keep callback ref up to date
  onStatusChangeRef.current = onStatusChange;

  // Handle online status change
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setShowOfflineToast(false);
    
    // Clear toast timer if exists
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    
    onStatusChangeRef.current?.(true);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setShowOfflineToast(true);
    onStatusChangeRef.current?.(false);
  }, []);

  // Setup online/offline event listeners
  useEffect(() => {
    // Early return if not in browser environment
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      // Clear any pending toast timer
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [handleOnline, handleOffline]);

  // Handle toast auto-hide timer
  useEffect(() => {
    if (showOfflineToast) {
      // Clear any existing timer
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      
      // Set new timer
      toastTimerRef.current = setTimeout(() => {
        setShowOfflineToast(false);
        toastTimerRef.current = null;
      }, toastDuration);
    }

    // Cleanup function for this effect
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [showOfflineToast, toastDuration]);

  const hideOfflineToast = useCallback(() => {
    setShowOfflineToast(false);
    
    // Clear timer if exists
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo((): OfflineContextType => ({
    isOnline,
    showOfflineToast,
    hideOfflineToast,
  }), [isOnline, showOfflineToast, hideOfflineToast]);

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

// Hook moved to separate file: src/hooks/useOfflineContext.ts