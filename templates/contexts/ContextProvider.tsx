import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  useCallback,
  ReactNode,
  PropsWithChildren
} from 'react';

/**
 * CONTEXT_NAME Context Template
 * 
 * This is a base template for creating new React contexts in the Sembalun app.
 * Replace CONTEXT_NAME with your actual context name (e.g., MeditationContext, UserContext).
 * 
 * Features included:
 * - TypeScript support with strict typing
 * - useReducer for complex state management
 * - Context provider with error boundaries
 * - Custom hook for context consumption
 * - Local storage persistence
 * - Action creators with type safety
 * - Performance optimizations
 */

// TODO: Define your context state interface
interface CONTEXT_NAME_State {
  /** Main data */
  data: CONTEXT_DATA_TYPE | null;
  /** Loading states */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** User preferences */
  preferences: CONTEXT_PREFERENCES_TYPE;
  /** UI state */
  ui: {
    isExpanded: boolean;
    selectedTab: string;
    searchQuery: string;
  };
  /** Metadata */
  metadata: {
    lastUpdated: string | null;
    version: string;
  };
}

// TODO: Define your data types
interface CONTEXT_DATA_TYPE {
  id: string;
  name: string;
  value: unknown;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// TODO: Define your preferences type
interface CONTEXT_PREFERENCES_TYPE {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'id';
  notifications: boolean;
  autoSave: boolean;
}

// TODO: Define action types
type CONTEXT_NAME_Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: CONTEXT_DATA_TYPE | null }
  | { type: 'UPDATE_DATA'; payload: Partial<CONTEXT_DATA_TYPE> }
  | { type: 'SET_PREFERENCES'; payload: Partial<CONTEXT_PREFERENCES_TYPE> }
  | { type: 'SET_UI_STATE'; payload: Partial<CONTEXT_NAME_State['ui']> }
  | { type: 'RESET_STATE' }
  | { type: 'INITIALIZE'; payload: Partial<CONTEXT_NAME_State> };

// TODO: Define context interface
interface CONTEXT_NAME_ContextType {
  /** Current state */
  state: CONTEXT_NAME_State;
  /** Action dispatchers */
  actions: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setData: (data: CONTEXT_DATA_TYPE | null) => void;
    updateData: (updates: Partial<CONTEXT_DATA_TYPE>) => void;
    setPreferences: (preferences: Partial<CONTEXT_PREFERENCES_TYPE>) => void;
    setUIState: (ui: Partial<CONTEXT_NAME_State['ui']>) => void;
    resetState: () => void;
    // Add your custom actions here
  };
  /** Utility functions */
  utils: {
    refresh: () => Promise<void>;
    save: () => Promise<void>;
    load: () => Promise<void>;
  };
}

// TODO: Define initial state
const initialState: CONTEXT_NAME_State = {
  data: null,
  isLoading: false,
  error: null,
  preferences: {
    theme: 'auto',
    language: 'id',
    notifications: true,
    autoSave: true
  },
  ui: {
    isExpanded: false,
    selectedTab: 'main',
    searchQuery: ''
  },
  metadata: {
    lastUpdated: null,
    version: '1.0.0'
  }
};

// TODO: Define reducer function
const CONTEXT_NAME_Reducer = (
  state: CONTEXT_NAME_State, 
  action: CONTEXT_NAME_Action
): CONTEXT_NAME_State => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'SET_DATA':
      return {
        ...state,
        data: action.payload,
        error: null,
        isLoading: false,
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString()
        }
      };

    case 'UPDATE_DATA':
      if (!state.data) {
        return state;
      }
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload,
          updatedAt: new Date().toISOString()
        },
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString()
        }
      };

    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };

    case 'SET_UI_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload
        }
      };

    case 'RESET_STATE':
      return {
        ...initialState,
        metadata: {
          ...initialState.metadata,
          lastUpdated: new Date().toISOString()
        }
      };

    case 'INITIALIZE':
      return {
        ...state,
        ...action.payload,
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString()
        }
      };

    default:
      return state;
  }
};

// Create the context
const CONTEXT_NAME_Context = createContext<CONTEXT_NAME_ContextType | undefined>(undefined);

// TODO: Provider component props
interface CONTEXT_NAME_ProviderProps {
  children: ReactNode;
  /** Initial state override */
  initialState?: Partial<CONTEXT_NAME_State>;
  /** Enable persistence to localStorage */
  persist?: boolean;
  /** Custom storage key for persistence */
  storageKey?: string;
}

/**
 * CONTEXT_NAME Provider Component
 * 
 * TODO: Add detailed provider description
 * TODO: Document initialization and persistence behavior
 */
export const CONTEXT_NAME_Provider: React.FC<CONTEXT_NAME_ProviderProps> = ({
  children,
  initialState: initialOverride,
  persist = true,
  storageKey = 'sembalun-CONTEXT_NAME'
}) => {
  // Initialize state with overrides
  const [state, dispatch] = useReducer(
    CONTEXT_NAME_Reducer,
    initialOverride ? { ...initialState, ...initialOverride } : initialState
  );

  // TODO: Action creators
  const actions = {
    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    setData: useCallback((data: CONTEXT_DATA_TYPE | null) => {
      dispatch({ type: 'SET_DATA', payload: data });
    }, []),

    updateData: useCallback((updates: Partial<CONTEXT_DATA_TYPE>) => {
      dispatch({ type: 'UPDATE_DATA', payload: updates });
    }, []),

    setPreferences: useCallback((preferences: Partial<CONTEXT_PREFERENCES_TYPE>) => {
      dispatch({ type: 'SET_PREFERENCES', payload: preferences });
    }, []),

    setUIState: useCallback((ui: Partial<CONTEXT_NAME_State['ui']>) => {
      dispatch({ type: 'SET_UI_STATE', payload: ui });
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
    }, [])
  };

  // TODO: Utility functions
  const utils = {
    refresh: useCallback(async (): Promise<void> => {
      try {
        actions.setLoading(true);
        actions.setError(null);

        // TODO: Replace with actual data fetching logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData: CONTEXT_DATA_TYPE = {
          id: 'mock-id',
          name: 'Mock Data',
          value: 'Mock Value',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        actions.setData(mockData);
        console.log('CONTEXT_NAME: Data refreshed successfully');

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        actions.setError(errorMessage);
        console.error('CONTEXT_NAME: Error refreshing data', error);
      }
    }, [actions]),

    save: useCallback(async (): Promise<void> => {
      if (!persist) return;

      try {
        const dataToSave = {
          data: state.data,
          preferences: state.preferences,
          ui: state.ui,
          metadata: state.metadata
        };

        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        console.log('CONTEXT_NAME: State saved to localStorage');

      } catch (error) {
        console.error('CONTEXT_NAME: Error saving to localStorage', error);
        actions.setError('Gagal menyimpan data ke penyimpanan lokal');
      }
    }, [persist, storageKey, state, actions]),

    load: useCallback(async (): Promise<void> => {
      if (!persist) return;

      try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return;

        const parsed = JSON.parse(stored);
        
        // TODO: Add data validation here
        if (parsed && typeof parsed === 'object') {
          dispatch({ type: 'INITIALIZE', payload: parsed });
          console.log('CONTEXT_NAME: State loaded from localStorage');
        }

      } catch (error) {
        console.error('CONTEXT_NAME: Error loading from localStorage', error);
        actions.setError('Gagal memuat data dari penyimpanan lokal');
      }
    }, [persist, storageKey, actions])
  };

  // TODO: Load persisted state on mount
  useEffect(() => {
    if (persist) {
      utils.load();
    }
  }, [persist, utils.load]);

  // TODO: Auto-save state changes
  useEffect(() => {
    if (persist && state.preferences.autoSave) {
      const saveTimeout = setTimeout(() => {
        utils.save();
      }, 1000); // Debounce saves

      return () => clearTimeout(saveTimeout);
    }
  }, [persist, state, utils.save]);

  // TODO: Cleanup effect
  useEffect(() => {
    return () => {
      console.log('CONTEXT_NAME: Provider cleanup');
    };
  }, []);

  // Create context value
  const contextValue: CONTEXT_NAME_ContextType = {
    state,
    actions,
    utils
  };

  return (
    <CONTEXT_NAME_Context.Provider value={contextValue}>
      {children}
    </CONTEXT_NAME_Context.Provider>
  );
};

/**
 * Custom hook to use the CONTEXT_NAME context
 * 
 * @returns Context value with state, actions, and utilities
 * @throws Error if used outside of provider
 */
export const useCONTEXT_NAME = (): CONTEXT_NAME_ContextType => {
  const context = useContext(CONTEXT_NAME_Context);
  
  if (context === undefined) {
    throw new Error('useCONTEXT_NAME must be used within a CONTEXT_NAME_Provider');
  }
  
  return context;
};

/**
 * Hook for accessing only the state (read-only)
 */
export const useCONTEXT_NAME_State = (): CONTEXT_NAME_State => {
  const { state } = useCONTEXT_NAME();
  return state;
};

/**
 * Hook for accessing only the actions
 */
export const useCONTEXT_NAME_Actions = () => {
  const { actions } = useCONTEXT_NAME();
  return actions;
};

/**
 * Hook for accessing specific state properties (optimized for re-renders)
 */
export const useCONTEXT_NAME_Selector = <T>(
  selector: (state: CONTEXT_NAME_State) => T
): T => {
  const { state } = useCONTEXT_NAME();
  return selector(state);
};

// TODO: Export types for external use
export type {
  CONTEXT_NAME_State,
  CONTEXT_DATA_TYPE,
  CONTEXT_PREFERENCES_TYPE,
  CONTEXT_NAME_Action,
  CONTEXT_NAME_ContextType,
  CONTEXT_NAME_ProviderProps
};

/**
 * Example Usage:
 * 
 * ```tsx
 * // 1. Wrap your app with the provider
 * function App() {
 *   return (
 *     <CONTEXT_NAME_Provider persist={true} storageKey="my-context">
 *       <MyComponent />
 *     </CONTEXT_NAME_Provider>
 *   );
 * }
 * 
 * // 2. Use the hook in components
 * function MyComponent() {
 *   const { state, actions, utils } = useCONTEXT_NAME();
 *   
 *   return (
 *     <div>
 *       {state.isLoading ? (
 *         <div>Loading...</div>
 *       ) : (
 *         <div>
 *           <h1>{state.data?.name}</h1>
 *           <button onClick={actions.resetState}>Reset</button>
 *           <button onClick={utils.refresh}>Refresh</button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * 
 * // 3. Use selectors for optimized re-renders
 * function OptimizedComponent() {
 *   const isLoading = useCONTEXT_NAME_Selector(state => state.isLoading);
 *   const dataName = useCONTEXT_NAME_Selector(state => state.data?.name);
 *   
 *   return <div>{isLoading ? 'Loading...' : dataName}</div>;
 * }
 * ```
 */