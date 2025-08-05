import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useOffline } from './useOffline';
import { OfflineContext } from '../contexts/OfflineContextTypes';
import type { OfflineContextType } from '../contexts/OfflineContextTypes';

// Mock OfflineContext
const mockOfflineContext: OfflineContextType = {
  isOnline: true,
  showOfflineToast: false,
  hideOfflineToast: vi.fn()
};

const createWrapper = (contextValue: OfflineContextType | undefined) => {
  return ({ children }: { children: React.ReactNode }) => (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

describe('useOffline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('returns offline context when used within OfflineProvider', () => {
      const wrapper = createWrapper(mockOfflineContext);
      const { result } = renderHook(() => useOffline(), { wrapper });
      
      expect(result.current).toBe(mockOfflineContext);
    });

    it('throws error when used outside OfflineProvider', () => {
      const wrapper = createWrapper(undefined);
      
      expect(() => {
        renderHook(() => useOffline(), { wrapper });
      }).toThrow('useOffline must be used within an OfflineProvider');
    });

    it('provides access to all context properties', () => {
      const wrapper = createWrapper(mockOfflineContext);
      const { result } = renderHook(() => useOffline(), { wrapper });
      
      expect(result.current.isOnline).toBe(true);
      expect(result.current.showOfflineToast).toBe(false);
      expect(typeof result.current.hideOfflineToast).toBe('function');
    });
  });

  describe('Context state variations', () => {
    it('handles online state correctly', () => {
      const onlineContext: OfflineContextType = {
        isOnline: true,
        showOfflineToast: false,
        hideOfflineToast: vi.fn()
      };
      
      const wrapper = createWrapper(onlineContext);
      const { result } = renderHook(() => useOffline(), { wrapper });
      
      expect(result.current.isOnline).toBe(true);
      expect(result.current.showOfflineToast).toBe(false);
    });

    it('handles offline state correctly', () => {
      const offlineContext: OfflineContextType = {
        isOnline: false,
        showOfflineToast: true,
        hideOfflineToast: vi.fn()
      };
      
      const wrapper = createWrapper(offlineContext);
      const { result } = renderHook(() => useOffline(), { wrapper });
      
      expect(result.current.isOnline).toBe(false);
      expect(result.current.showOfflineToast).toBe(true);
    });

    it('calls hideOfflineToast function correctly', () => {
      const hideToastMock = vi.fn();
      const contextWithMock: OfflineContextType = {
        isOnline: false,
        showOfflineToast: true,
        hideOfflineToast: hideToastMock
      };
      
      const wrapper = createWrapper(contextWithMock);
      const { result } = renderHook(() => useOffline(), { wrapper });
      
      result.current.hideOfflineToast();
      
      expect(hideToastMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling and edge cases', () => {
    it('handles null context value', () => {
      const wrapper = createWrapper(null as any);
      
      expect(() => {
        renderHook(() => useOffline(), { wrapper });
      }).toThrow('useOffline must be used within an OfflineProvider');
    });

    it('maintains referential stability', () => {
      const wrapper = createWrapper(mockOfflineContext);
      const { result, rerender } = renderHook(() => useOffline(), { wrapper });
      
      const firstResult = result.current;
      rerender();
      const secondResult = result.current;
      
      expect(firstResult).toBe(secondResult);
    });

    it('handles context changes properly', () => {
      let currentContext = { ...mockOfflineContext, isOnline: true };
      
      const DynamicWrapper = ({ children }: { children: React.ReactNode }) => (
        <OfflineContext.Provider value={currentContext}>
          {children}
        </OfflineContext.Provider>
      );
      
      const { result, rerender } = renderHook(() => useOffline(), { wrapper: DynamicWrapper });
      
      expect(result.current.isOnline).toBe(true);
      
      // Update context
      currentContext = { ...mockOfflineContext, isOnline: false, showOfflineToast: true };
      rerender();
      
      expect(result.current.isOnline).toBe(false);
      expect(result.current.showOfflineToast).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('works correctly with multiple consumers', () => {
      const wrapper = createWrapper(mockOfflineContext);
      
      const { result: result1 } = renderHook(() => useOffline(), { wrapper });
      const { result: result2 } = renderHook(() => useOffline(), { wrapper });
      
      expect(result1.current).toBe(result2.current);
      expect(result1.current.isOnline).toBe(result2.current.isOnline);
    });

    it('handles provider unmounting gracefully', () => {
      const wrapper = createWrapper(mockOfflineContext);
      const { result, unmount } = renderHook(() => useOffline(), { wrapper });
      
      expect(result.current.isOnline).toBe(true);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Type safety and validation', () => {
    it('ensures all required properties are present', () => {
      const wrapper = createWrapper(mockOfflineContext);
      const { result } = renderHook(() => useOffline(), { wrapper });
      
      // Verify all required properties exist
      expect(result.current).toHaveProperty('isOnline');
      expect(result.current).toHaveProperty('showOfflineToast');
      expect(result.current).toHaveProperty('hideOfflineToast');
      
      // Verify types
      expect(typeof result.current.isOnline).toBe('boolean');
      expect(typeof result.current.showOfflineToast).toBe('boolean');
      expect(typeof result.current.hideOfflineToast).toBe('function');
    });

    it('maintains context type consistency', () => {
      const contextWithAllStates: OfflineContextType[] = [
        { isOnline: true, showOfflineToast: false, hideOfflineToast: vi.fn() },
        { isOnline: false, showOfflineToast: true, hideOfflineToast: vi.fn() },
        { isOnline: false, showOfflineToast: false, hideOfflineToast: vi.fn() },
        { isOnline: true, showOfflineToast: true, hideOfflineToast: vi.fn() }
      ];
      
      contextWithAllStates.forEach((context) => {
        const wrapper = createWrapper(context);
        const { result } = renderHook(() => useOffline(), { wrapper });
        
        expect(result.current).toBe(context);
        expect(typeof result.current.isOnline).toBe('boolean');
        expect(typeof result.current.showOfflineToast).toBe('boolean');
        expect(typeof result.current.hideOfflineToast).toBe('function');
      });
    });
  });
});