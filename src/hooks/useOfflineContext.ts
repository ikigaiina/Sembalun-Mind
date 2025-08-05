import { useContext } from 'react';
import { OfflineContext } from '../contexts/OfflineContext';
import type { OfflineContextType } from '../contexts/OfflineContextTypes';

/**
 * Hook to access offline context
 * @throws {Error} When used outside OfflineProvider
 */
export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  
  if (context === undefined) {
    throw new Error(
      'useOffline must be used within an OfflineProvider. ' +
      'Wrap your component tree with <OfflineProvider> to use offline features.'
    );
  }
  
  return context;
};