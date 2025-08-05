import { createContext } from 'react';

export interface OfflineContextType {
  isOnline: boolean;
  showOfflineToast: boolean;
  hideOfflineToast: () => void;
}

export const OfflineContext = createContext<OfflineContextType | undefined>(undefined);