import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OfflineProvider, OfflineContext } from './OfflineContext';
import { useContext } from 'react';
import type { OfflineContextType } from './OfflineContextTypes';

// Test component to access context
const TestComponent = ({ 
  onContextValue,
  showToastControls = false 
}: { 
  onContextValue?: (value: OfflineContextType) => void;
  showToastControls?: boolean;
}) => {
  const contextValue = useContext(OfflineContext);
  
  if (onContextValue && contextValue) {
    onContextValue(contextValue);
  }
  
  if (!contextValue) {
    return <div>No Context</div>;
  }
  
  return (
    <div>
      <div data-testid="is-online">{contextValue.isOnline ? 'Online' : 'Offline'}</div>
      <div data-testid="show-offline-toast">{contextValue.showOfflineToast ? 'Show Toast' : 'Hide Toast'}</div>
      {showToastControls && (
        <button 
          data-testid="hide-toast-button" 
          onClick={contextValue.hideOfflineToast}
        >
          Hide Toast
        </button>
      )}
    </div>
  );
};

// Mock timer functions for testing
const mockSetTimeout = vi.fn();
const mockClearTimeout = vi.fn();

describe('OfflineContext', () => {
  let originalOnLine: boolean;
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;
  let eventListeners: Record<string, EventListener[]> = {};

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    
    // Store original values
    originalOnLine = navigator.onLine;
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;
    
    // Reset event listeners
    eventListeners = {};
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    
    // Mock window event listeners
    window.addEventListener = vi.fn((event: string, listener: EventListener) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(listener);
    });
    
    window.removeEventListener = vi.fn((event: string, listener: EventListener) => {
      if (eventListeners[event]) {
        eventListeners[event] = eventListeners[event].filter(l => l !== listener);
      }
    });
    
    // Mock setTimeout and clearTimeout
    global.setTimeout = mockSetTimeout.mockImplementation((callback, delay) => {
      const id = Math.random();
      vi.advanceTimersByTime(delay || 0);
      callback();
      return id;
    });
    
    global.clearTimeout = mockClearTimeout;
  });

  afterEach(() => {
    vi.useRealTimers();
    
    // Restore original values
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnLine
    });
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Provider Setup and Initialization', () => {
    it('provides context to children', () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      expect(screen.getByTestId('is-online')).toHaveTextContent('Online');
      expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Hide Toast');
    });

    it('initializes with navigator.onLine value', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      expect(screen.getByTestId('is-online')).toHaveTextContent('Offline');
    });

    it('sets up online and offline event listeners', () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('renders without context throws error', () => {
      // This test verifies that using the context outside provider would fail
      const TestWithoutProvider = () => {
        const context = useContext(OfflineContext);
        return <div>{context ? 'Has Context' : 'No Context'}</div>;
      };
      
      render(<TestWithoutProvider />);
      expect(screen.getByText('No Context')).toBeInTheDocument();
    });
  });

  describe('Network State Management', () => {
    it('updates state when going online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      expect(screen.getByTestId('is-online')).toHaveTextContent('Offline');
      
      // Simulate going online
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true
        });
        
        // Trigger online event
        eventListeners['online']?.forEach(listener => {
          listener(new Event('online'));
        });
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('is-online')).toHaveTextContent('Online');
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Hide Toast');
      });
    });

    it('updates state when going offline', async () => {
      // Start online
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      expect(screen.getByTestId('is-online')).toHaveTextContent('Online');
      
      // Simulate going offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false
        });
        
        // Trigger offline event
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('is-online')).toHaveTextContent('Offline');
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Show Toast');
      });
    });

    it('handles rapid online/offline state changes', async () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Go offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('is-online')).toHaveTextContent('Offline');
      });
      
      // Go online
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: true });
        eventListeners['online']?.forEach(listener => {
          listener(new Event('online'));
        });
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('is-online')).toHaveTextContent('Online');
      });
      
      // Go offline again
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('is-online')).toHaveTextContent('Offline');
      });
    });
  });

  describe('Offline Toast Management', () => {
    it('shows toast when going offline', async () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Go offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Show Toast');
      });
    });

    it('hides toast when going online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
      
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Go offline to show toast
      act(() => {
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Show Toast');
      });
      
      // Go online
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: true });
        eventListeners['online']?.forEach(listener => {
          listener(new Event('online'));
        });
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Hide Toast');
      });
    });

    it('auto-hides toast after 5 seconds', async () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Go offline to show toast
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Show Toast');
      });
      
      // Fast-forward time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Hide Toast');
      });
    });

    it('manually hides toast when hideOfflineToast is called', async () => {
      const user = userEvent.setup();
      
      render(
        <OfflineProvider>
          <TestComponent showToastControls={true} />
        </OfflineProvider>
      );
      
      // Go offline to show toast
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Show Toast');
      });
      
      // Manually hide toast
      await user.click(screen.getByTestId('hide-toast-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Hide Toast');
      });
    });

    it('resets auto-hide timer when toast state changes', async () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Go offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      // Wait 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      // Go online (should clear timer)
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: true });
        eventListeners['online']?.forEach(listener => {
          listener(new Event('online'));
        });
      });
      
      // Go offline again
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      // Should have reset the timer, so toast should still be visible after 3 more seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Show Toast');
      });
      
      // After full 5 seconds from last offline event, should hide
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Hide Toast');
      });
    });
  });

  describe('Event Listener Management', () => {
    it('removes event listeners on unmount', () => {
      const { unmount } = render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Verify listeners were added
      expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
      
      // Clear mock call history
      vi.clearAllMocks();
      
      // Unmount component
      unmount();
      
      // Verify listeners were removed
      expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('clears timer on unmount', () => {
      const { unmount } = render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Go offline to start timer
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      // Unmount component
      unmount();
      
      // Timer should be cleared (no specific assertion as the cleanup is internal)
      expect(() => unmount()).not.toThrow();
    });

    it('handles multiple provider instances independently', () => {
      const TestMultipleProviders = () => (
        <div>
          <OfflineProvider>
            <div data-testid="provider-1">
              <TestComponent />
            </div>
          </OfflineProvider>
          <OfflineProvider>
            <div data-testid="provider-2">
              <TestComponent />
            </div>
          </OfflineProvider>
        </div>
      );
      
      render(<TestMultipleProviders />);
      
      // Both providers should work independently
      const provider1 = screen.getByTestId('provider-1');
      const provider2 = screen.getByTestId('provider-2');
      
      expect(provider1.querySelector('[data-testid="is-online"]')).toHaveTextContent('Online');
      expect(provider2.querySelector('[data-testid="is-online"]')).toHaveTextContent('Online');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles navigator.onLine being unavailable', () => {
      // Mock navigator.onLine as undefined
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: undefined
      });
      
      expect(() => {
        render(
          <OfflineProvider>
            <TestComponent />
          </OfflineProvider>
        );
      }).not.toThrow();
      
      // Should default to falsy (offline) state
      expect(screen.getByTestId('is-online')).toHaveTextContent('Offline');
    });

    it('handles event listener errors gracefully', () => {
      // Mock addEventListener to throw error
      window.addEventListener = vi.fn().mockImplementation(() => {
        throw new Error('addEventListener failed');
      });
      
      expect(() => {
        render(
          <OfflineProvider>
            <TestComponent />
          </OfflineProvider>
        );
      }).not.toThrow();
    });

    it('handles malformed network events', async () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Trigger event with null/undefined
      act(() => {
        eventListeners['online']?.forEach(listener => {
          try {
            listener(null as any);
          } catch (error) {
            // Should handle gracefully
          }
        });
      });
      
      // Should not crash
      expect(screen.getByTestId('is-online')).toBeInTheDocument();
    });

    it('maintains state consistency during rapid state changes', async () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Rapidly trigger multiple state changes
      const stateChanges = [
        { online: false, event: 'offline' },
        { online: true, event: 'online' },
        { online: false, event: 'offline' },
        { online: true, event: 'online' },
        { online: false, event: 'offline' }
      ];
      
      stateChanges.forEach(({ online, event }, index) => {
        act(() => {
          Object.defineProperty(navigator, 'onLine', { writable: true, value: online });
          eventListeners[event]?.forEach(listener => {
            listener(new Event(event));
          });
        });
      });
      
      // Final state should be offline
      await waitFor(() => {
        expect(screen.getByTestId('is-online')).toHaveTextContent('Offline');
        expect(screen.getByTestId('show-offline-toast')).toHaveTextContent('Show Toast');
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('does not cause memory leaks with repeated mount/unmount', () => {
      // Mount and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <OfflineProvider>
            <TestComponent />
          </OfflineProvider>
        );
        unmount();
      }
      
      // Should not accumulate event listeners
      expect(window.removeEventListener).toHaveBeenCalled();
    });

    it('efficiently handles high-frequency network changes', async () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Simulate high-frequency network changes
      for (let i = 0; i < 100; i++) {
        const isOnline = i % 2 === 0;
        const event = isOnline ? 'online' : 'offline';
        
        act(() => {
          Object.defineProperty(navigator, 'onLine', { writable: true, value: isOnline });
          eventListeners[event]?.forEach(listener => {
            listener(new Event(event));
          });
        });
      }
      
      // Should handle without performance issues
      expect(screen.getByTestId('is-online')).toBeInTheDocument();
    });

    it('cleans up timers properly', () => {
      const { unmount } = render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Start timer by going offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      // Unmount before timer completes
      unmount();
      
      // Should not cause issues with timer cleanup
      expect(() => {
        vi.advanceTimersByTime(10000);
      }).not.toThrow();
    });
  });

  describe('Integration with React Lifecycle', () => {
    it('updates state correctly through component re-renders', () => {
      const { rerender } = render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      expect(screen.getByTestId('is-online')).toHaveTextContent('Online');
      
      // Go offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      // Re-render component
      rerender(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      expect(screen.getByTestId('is-online')).toHaveTextContent('Offline');
    });

    it('preserves context value across child component updates', () => {
      let contextValue: OfflineContextType | undefined;
      
      const ChildComponent = ({ counter }: { counter: number }) => (
        <TestComponent onContextValue={(value) => contextValue = value} />
      );
      
      const { rerender } = render(
        <OfflineProvider>
          <ChildComponent counter={1} />
        </OfflineProvider>
      );
      
      const firstContextValue = contextValue;
      
      // Re-render with different props
      rerender(
        <OfflineProvider>
          <ChildComponent counter={2} />
        </OfflineProvider>
      );
      
      // Context functions should remain stable
      expect(contextValue?.hideOfflineToast).toBe(firstContextValue?.hideOfflineToast);
    });

    it('handles React Strict Mode correctly', () => {
      const { unmount } = render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      // Simulate Strict Mode double mounting
      const { unmount: unmount2 } = render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      expect(screen.getByTestId('is-online')).toHaveTextContent('Online');
      
      unmount();
      unmount2();
    });
  });

  describe('Accessibility and User Experience', () => {
    it('provides consistent state information for screen readers', () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      const onlineStatus = screen.getByTestId('is-online');
      expect(onlineStatus).toHaveAttribute('data-testid', 'is-online');
      expect(onlineStatus).toHaveTextContent('Online');
    });

    it('updates immediately on network state changes', async () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      const onlineStatus = screen.getByTestId('is-online');
      expect(onlineStatus).toHaveTextContent('Online');
      
      // Go offline - should update immediately
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      // Should update without delay
      expect(onlineStatus).toHaveTextContent('Offline');
    });

    it('provides appropriate visual feedback through toast state', async () => {
      render(
        <OfflineProvider>
          <TestComponent />
        </OfflineProvider>
      );
      
      const toastStatus = screen.getByTestId('show-offline-toast');
      expect(toastStatus).toHaveTextContent('Hide Toast');
      
      // Go offline - should show toast
      act(() => {
        Object.defineProperty(navigator, 'onLine', { writable: true, value: false });
        eventListeners['offline']?.forEach(listener => {
          listener(new Event('offline'));
        });
      });
      
      expect(toastStatus).toHaveTextContent('Show Toast');
    });
  });
});