import React from 'react';
import { useOffline } from '../../hooks/useOfflineContext';

export const OfflineToast: React.FC = () => {
  const { showOfflineToast, hideOfflineToast } = useOffline();

  if (!showOfflineToast) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
      <div className="bg-white shadow-lg rounded-xl border border-orange-100 px-4 py-3 mx-4 max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg 
              className="w-5 h-5 text-orange-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              Mode Offline
            </p>
            <p className="text-xs text-gray-600">
              Meditasi tetap bisa dilanjutkan
            </p>
          </div>
          <button
            onClick={hideOfflineToast}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};