import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * HOOK_NAME Custom Hook Template
 * 
 * This is a base template for creating custom React hooks in the Sembalun app.
 * Replace HOOK_NAME with your actual hook name (e.g., useMeditation, useAuth).
 * 
 * Features included:
 * - TypeScript support with proper interfaces
 * - State management patterns
 * - Effect cleanup
 * - Memoization strategies
 * - Error handling
 * - Loading states
 * - Ref management
 */

// TODO: Define your hook's options interface
interface HOOK_NAME_Options {
  /** Enable automatic data fetching */
  enabled?: boolean;
  /** Polling interval in milliseconds */
  pollingInterval?: number;
  /** Enable caching */
  cache?: boolean;
  /** Custom error handler */
  onError?: (error: Error) => void;
  /** Custom success handler */
  onSuccess?: (data: unknown) => void;
}

// TODO: Define your hook's return type
interface HOOK_NAME_Return {
  /** Main data */
  data: HOOK_DATA_TYPE | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Success state */
  isSuccess: boolean;
  /** Action functions */
  actions: {
    fetch: () => Promise<void>;
    clear: () => void;
    refresh: () => Promise<void>;
    // Add your custom actions here
  };
  /** Utility functions */
  utils: {
    retry: () => Promise<void>;
    reset: () => void;
  };
}

// TODO: Define your data type
interface HOOK_DATA_TYPE {
  id: string;
  name: string;
  value: unknown;
  timestamp: string;
  // Add your specific fields
}

/**
 * HOOK_NAME Custom Hook
 * 
 * TODO: Add detailed hook description
 * TODO: Document parameters and return values
 * TODO: Add usage examples
 * 
 * @param options - Configuration options for the hook
 * @returns Hook state and actions
 */
export const HOOK_NAME = (options: HOOK_NAME_Options = {}): HOOK_NAME_Return => {
  const {
    enabled = true,
    pollingInterval,
    cache = true,
    onError,
    onSuccess
  } = options;

  // TODO: Add your state variables
  const [data, setData] = useState<HOOK_DATA_TYPE | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // TODO: Add refs for cleanup and persistence
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const cacheRef = useRef<Map<string, HOOK_DATA_TYPE>>(new Map());

  // TODO: Add your data fetching function
  const fetchData = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      // TODO: Replace with your actual data fetching logic
      const response = await fetch('/api/data', { signal });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: HOOK_DATA_TYPE = await response.json();

      // Check if request was aborted
      if (signal.aborted) {
        return;
      }

      // Update cache if enabled
      if (cache) {
        cacheRef.current.set(result.id, result);
      }

      setData(result);
      setIsSuccess(true);
      retryCountRef.current = 0;

      // Call success handler
      onSuccess?.(result);

      console.log('HOOK_NAME: Data fetched successfully', result);

    } catch (err) {
      // Don't update state if request was aborted
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      
      setError(error);
      setIsSuccess(false);
      
      // Call error handler
      onError?.(error);

      console.error('HOOK_NAME: Error fetching data', error);

    } finally {
      setIsLoading(false);
    }
  }, [enabled, cache, onError, onSuccess]);

  // TODO: Add your action functions
  const clear = useCallback((): void => {
    setData(null);
    setError(null);
    setIsSuccess(false);
    setIsLoading(false);
    
    // Clear cache
    if (cache) {
      cacheRef.current.clear();
    }

    console.log('HOOK_NAME: Data cleared');
  }, [cache]);

  const refresh = useCallback(async (): Promise<void> => {
    // Clear cache before refreshing
    if (cache) {
      cacheRef.current.clear();
    }
    
    await fetchData();
  }, [fetchData, cache]);

  const retry = useCallback(async (): Promise<void> => {
    const maxRetries = 3;
    const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);

    if (retryCountRef.current >= maxRetries) {
      console.warn('HOOK_NAME: Max retries reached');
      return;
    }

    retryCountRef.current += 1;
    
    console.log(`HOOK_NAME: Retrying (${retryCountRef.current}/${maxRetries}) in ${retryDelay}ms`);
    
    setTimeout(() => {
      fetchData();
    }, retryDelay);
  }, [fetchData]);

  const reset = useCallback((): void => {
    clear();
    retryCountRef.current = 0;
    
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear polling
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }

    console.log('HOOK_NAME: Hook reset');
  }, [clear]);

  // TODO: Initial data fetch effect
  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    return () => {
      // Cleanup on unmount or when enabled changes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, enabled]);

  // TODO: Polling effect
  useEffect(() => {
    if (!enabled || !pollingInterval || isLoading) {
      return;
    }

    const startPolling = () => {
      pollingTimeoutRef.current = setTimeout(() => {
        fetchData().then(() => {
          if (enabled && pollingInterval) {
            startPolling();
          }
        });
      }, pollingInterval);
    };

    startPolling();

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [enabled, pollingInterval, isLoading, fetchData]);

  // TODO: Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
      
      console.log('HOOK_NAME: Cleanup completed');
    };
  }, []);

  // TODO: Return hook interface
  return {
    data,
    isLoading,
    error,
    isSuccess,
    actions: {
      fetch: fetchData,
      clear,
      refresh
    },
    utils: {
      retry,
      reset
    }
  };
};

// TODO: Export additional hook variations if needed

/**
 * Lightweight version of HOOK_NAME for simple use cases
 */
export const HOOK_NAME_Simple = (initialValue: HOOK_DATA_TYPE | null = null) => {
  const [data, setData] = useState<HOOK_DATA_TYPE | null>(initialValue);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return {
    data,
    isLoading,
    setData,
    setIsLoading
  };
};

/**
 * Hook for local storage persistence
 */
export const HOOK_NAME_Persistent = (key: string, options: HOOK_NAME_Options = {}) => {
  const hook = HOOK_NAME(options);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // TODO: Validate parsed data structure
        console.log(`HOOK_NAME_Persistent: Loaded from localStorage`, parsed);
      }
    } catch (error) {
      console.error(`HOOK_NAME_Persistent: Error loading from localStorage`, error);
    }
  }, [key]);

  // Save to localStorage when data changes
  useEffect(() => {
    if (hook.data) {
      try {
        localStorage.setItem(key, JSON.stringify(hook.data));
        console.log(`HOOK_NAME_Persistent: Saved to localStorage`);
      } catch (error) {
        console.error(`HOOK_NAME_Persistent: Error saving to localStorage`, error);
      }
    }
  }, [key, hook.data]);

  return hook;
};

// TODO: Export types for external use
export type {
  HOOK_NAME_Options,
  HOOK_NAME_Return,
  HOOK_DATA_TYPE
};

/**
 * Example Usage:
 * 
 * ```tsx
 * // Basic usage
 * const { data, isLoading, error, actions } = HOOK_NAME({
 *   enabled: true,
 *   pollingInterval: 30000, // Poll every 30 seconds
 *   onSuccess: (data) => console.log('Data loaded:', data),
 *   onError: (error) => console.error('Error:', error)
 * });
 * 
 * // In component
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return (
 *   <div>
 *     <div>{data?.name}</div>
 *     <button onClick={actions.refresh}>Refresh</button>
 *     <button onClick={actions.clear}>Clear</button>
 *   </div>
 * );
 * ```
 */