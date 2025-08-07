import React, { createContext, useState, useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';

// Modal types and configurations
export interface ModalConfig {
  id: string;
  type: ModalType;
  props?: Record<string, unknown>;
  persistent?: boolean;
  closable?: boolean;
  backdrop?: boolean;
  gestureEnabled?: boolean;
  animation?: ModalAnimation;
  priority?: number;
  onClose?: () => void;
  onOpen?: () => void;
}

export type ModalType = 
  | 'meditation-session'
  | 'breathing-guide'
  | 'achievement-celebration'
  | 'progress-insights'
  | 'community-room'
  | 'personalization'
  | 'cultural-wisdom'
  | 'mood-selector'
  | 'session-complete'
  | 'settings'
  | 'profile'
  | 'auth'
  | 'custom';

export type ModalAnimation = 
  | 'slide-up'
  | 'slide-down' 
  | 'slide-left'
  | 'slide-right'
  | 'fade'
  | 'zoom'
  | 'cultural-expand'
  | 'breathing-rhythm';

export interface ModalState {
  modals: ModalConfig[];
  activeModal: ModalConfig | null;
  modalHistory: string[];
  isAnimating: boolean;
}

export interface ModalContextType {
  // State
  modals: ModalConfig[];
  activeModal: ModalConfig | null;
  modalHistory: string[];
  isAnimating: boolean;
  
  // Actions
  openModal: (config: Omit<ModalConfig, 'id'> & { id?: string }) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, updates: Partial<ModalConfig>) => void;
  navigateModal: (direction: 'next' | 'previous') => void;
  
  // Utilities
  isModalOpen: (id: string) => boolean;
  getModal: (id: string) => ModalConfig | undefined;
  getActiveModalType: () => ModalType | null;
  canNavigateBack: () => boolean;
  canNavigateForward: () => boolean;
}

// Create default state
const createDefaultState = (): ModalState => ({
  modals: [],
  activeModal: null,
  modalHistory: [],
  isAnimating: false,
});

// Create context
export const ModalContext = createContext<ModalContextType | null>(null);

// Export the provider component only to satisfy React Fast Refresh
export { useModal } from '../hooks/useModal';

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [state, setState] = useState<ModalState>(createDefaultState);
  const modalIdCounter = useRef(0);

  // Generate unique modal ID
  const generateModalId = useCallback(() => {
    modalIdCounter.current += 1;
    return `modal_${Date.now()}_${modalIdCounter.current}`;
  }, []);

  // Open modal
  const openModal = useCallback((config: Omit<ModalConfig, 'id'> & { id?: string }): string => {
    const modalId = config.id || generateModalId();
    
    const newModal: ModalConfig = {
      id: modalId,
      persistent: false,
      closable: true,
      backdrop: true,
      gestureEnabled: true,
      animation: 'slide-up',
      priority: 0,
      ...config,
    };

    setState(prev => {
      // Close existing modal if not persistent
      const filteredModals = prev.modals.filter(modal => modal.persistent);
      
      // Add to history
      const newHistory = prev.activeModal 
        ? [...prev.modalHistory, prev.activeModal.id]
        : prev.modalHistory;

      // Call onOpen callback
      if (newModal.onOpen) {
        setTimeout(() => newModal.onOpen!(), 0);
      }

      return {
        ...prev,
        modals: [...filteredModals, newModal].sort((a, b) => (b.priority || 0) - (a.priority || 0)),
        activeModal: newModal,
        modalHistory: newHistory,
      };
    });

    return modalId;
  }, [generateModalId]);

  // Close modal
  const closeModal = useCallback((id?: string) => {
    setState(prev => {
      const modalToClose = id 
        ? prev.modals.find(m => m.id === id)
        : prev.activeModal;

      if (!modalToClose) return prev;

      // Call onClose callback
      if (modalToClose.onClose) {
        setTimeout(() => modalToClose.onClose!(), 0);
      }

      const filteredModals = prev.modals.filter(m => m.id !== modalToClose.id);
      
      // Determine new active modal
      let newActiveModal: ModalConfig | null = null;
      let newHistory = [...prev.modalHistory];

      if (modalToClose.id === prev.activeModal?.id) {
        // If closing active modal, check history
        if (newHistory.length > 0) {
          const previousModalId = newHistory.pop()!;
          newActiveModal = filteredModals.find(m => m.id === previousModalId) || null;
        } else {
          // Get highest priority modal
          newActiveModal = filteredModals.length > 0 
            ? filteredModals.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0]
            : null;
        }
      } else {
        newActiveModal = prev.activeModal;
        // Remove from history if exists
        newHistory = newHistory.filter(historyId => historyId !== modalToClose.id);
      }

      return {
        ...prev,
        modals: filteredModals,
        activeModal: newActiveModal,
        modalHistory: newHistory,
      };
    });
  }, []);

  // Close all modals
  const closeAllModals = useCallback(() => {
    setState(prev => {
      // Call onClose for all modals
      prev.modals.forEach(modal => {
        if (modal.onClose) {
          setTimeout(() => modal.onClose!(), 0);
        }
      });

      return createDefaultState();
    });
  }, []);

  // Update modal
  const updateModal = useCallback((id: string, updates: Partial<ModalConfig>) => {
    setState(prev => ({
      ...prev,
      modals: prev.modals.map(modal => 
        modal.id === id ? { ...modal, ...updates } : modal
      ),
      activeModal: prev.activeModal?.id === id 
        ? { ...prev.activeModal, ...updates }
        : prev.activeModal,
    }));
  }, []);

  // Navigate modal
  const navigateModal = useCallback((direction: 'next' | 'previous') => {
    setState(prev => {
      if (direction === 'previous' && prev.modalHistory.length > 0) {
        const newHistory = [...prev.modalHistory];
        const previousModalId = newHistory.pop()!;
        const previousModal = prev.modals.find(m => m.id === previousModalId);
        
        if (previousModal) {
          return {
            ...prev,
            activeModal: previousModal,
            modalHistory: newHistory,
          };
        }
      }
      
      // For 'next' direction, implement custom logic based on modal type
      // This would be extended based on specific navigation requirements
      
      return prev;
    });
  }, []);

  // Utility functions
  const isModalOpen = useCallback((id: string): boolean => {
    return state.modals.some(modal => modal.id === id);
  }, [state.modals]);

  const getModal = useCallback((id: string): ModalConfig | undefined => {
    return state.modals.find(modal => modal.id === id);
  }, [state.modals]);

  const getActiveModalType = useCallback((): ModalType | null => {
    return state.activeModal?.type || null;
  }, [state.activeModal]);

  const canNavigateBack = useCallback((): boolean => {
    return state.modalHistory.length > 0;
  }, [state.modalHistory]);

  const canNavigateForward = useCallback((): boolean => {
    // Implement forward navigation logic based on your requirements
    return false;
  }, []);

  // Memoized context value
  const contextValue = useMemo((): ModalContextType => ({
    modals: state.modals,
    activeModal: state.activeModal,
    modalHistory: state.modalHistory,
    isAnimating: state.isAnimating,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    navigateModal,
    isModalOpen,
    getModal,
    getActiveModalType,
    canNavigateBack,
    canNavigateForward,
  }), [
    state,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    navigateModal,
    isModalOpen,
    getModal,
    getActiveModalType,
    canNavigateBack,
    canNavigateForward,
  ]);

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;