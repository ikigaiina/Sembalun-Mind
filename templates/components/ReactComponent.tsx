import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

/**
 * COMPONENT_NAME Component Template
 * 
 * This is a base template for creating new React components in the Sembalun app.
 * Replace COMPONENT_NAME with your actual component name.
 * 
 * Features included:
 * - TypeScript support with proper interfaces
 * - Standard React hooks (useState, useEffect)
 * - Error boundary compatibility
 * - Accessibility considerations
 * - Indonesian language support
 * - Consistent styling with design tokens
 */

// TODO: Define your component's props interface
interface COMPONENT_NAME_Props {
  /** Required prop example */
  title: string;
  /** Optional prop example */
  description?: string;
  /** Callback prop example */
  onAction?: (data: unknown) => void;
  /** Style customization */
  className?: string;
  /** Children components */
  children?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
}

// TODO: Define internal state interface if needed
interface COMPONENT_NAME_State {
  isExpanded: boolean;
  selectedItem: string | null;
  formData: Record<string, unknown>;
}

/**
 * COMPONENT_NAME Component
 * 
 * TODO: Add detailed component description
 * TODO: Document usage examples
 * TODO: List dependencies and requirements
 */
export const COMPONENT_NAME: React.FC<COMPONENT_NAME_Props> = ({
  title,
  description,
  onAction,
  className = '',
  children,
  isLoading = false,
  error = null
}) => {
  // TODO: Add your component state
  const [state, setState] = useState<COMPONENT_NAME_State>({
    isExpanded: false,
    selectedItem: null,
    formData: {}
  });

  // TODO: Add your side effects
  useEffect(() => {
    // Example: Data fetching, subscriptions, cleanup
    console.log('COMPONENT_NAME mounted');
    
    // Cleanup function
    return () => {
      console.log('COMPONENT_NAME unmounted');
    };
  }, []);

  // TODO: Add your event handlers
  const handleAction = () => {
    try {
      // Your logic here
      onAction?.({ 
        timestamp: new Date().toISOString(),
        component: 'COMPONENT_NAME'
      });
    } catch (err) {
      console.error('Error in COMPONENT_NAME action:', err);
    }
  };

  const handleToggleExpanded = () => {
    setState(prev => ({
      ...prev,
      isExpanded: !prev.isExpanded
    }));
  };

  // TODO: Add loading state
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <Card>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card>
      </div>
    );
  }

  // TODO: Add error state
  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">⚠️</span>
            </div>
            <div>
              <h4 className="font-heading text-red-800 text-sm">Terjadi Kesalahan</h4>
              <p className="text-red-700 font-body text-xs">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // TODO: Replace with your component JSX
  return (
    <div className={`component-name ${className}`}>
      <Card>
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-gray-800 text-lg">
              {title}
            </h3>
            <Button
              variant="ghost"
              size="small"
              onClick={handleToggleExpanded}
              aria-label={state.isExpanded ? 'Tutup' : 'Buka'}
            >
              <span className={`transform transition-transform ${
                state.isExpanded ? 'rotate-180' : 'rotate-0'
              }`}>
                ▼
              </span>
            </Button>
          </div>
          
          {description && (
            <p className="text-gray-600 font-body text-sm mt-2">
              {description}
            </p>
          )}
        </div>

        {/* Expandable Content */}
        {state.isExpanded && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            {/* TODO: Add your expandable content */}
            <div className="text-center text-gray-500 font-body text-sm">
              Konten komponen akan ditampilkan di sini
            </div>
            
            {children}
          </div>
        )}

        {/* Action Section */}
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            size="small"
            onClick={handleAction}
          >
            Aksi Utama
          </Button>
        </div>
      </Card>
    </div>
  );
};

// TODO: Add display name for debugging
COMPONENT_NAME.displayName = 'COMPONENT_NAME';

// TODO: Export any related types
export type { COMPONENT_NAME_Props, COMPONENT_NAME_State };

/**
 * Example Usage:
 * 
 * ```tsx
 * <COMPONENT_NAME
 *   title="Judul Komponen"
 *   description="Deskripsi komponen"
 *   onAction={(data) => console.log(data)}
 *   className="my-custom-class"
 * >
 *   <p>Konten anak komponen</p>
 * </COMPONENT_NAME>
 * ```
 */