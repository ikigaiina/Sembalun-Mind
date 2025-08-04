import { useContext } from 'react';
import { OfflineContext, type OfflineContextType } from '../contexts/OfflineContextTypes';

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};