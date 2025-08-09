// Import polyfills FIRST before any React imports
import './polyfills'

// EMERGENCY: Final defensive scheduler check before React loads
if (typeof globalThis !== 'undefined' && typeof globalThis.scheduler === 'undefined') {
  (globalThis as any).scheduler = {
    unstable_now: () => performance.now(),
    unstable_scheduleCallback: (priority: any, callback: any, options?: any) => {
      const timeout = typeof options === 'object' && options !== null ? options.timeout : 0;
      const id = setTimeout(callback, timeout);
      return { cancel: () => clearTimeout(id) };
    },
    unstable_cancelCallback: (task: any) => { if (task && task.cancel) task.cancel(); },
    unstable_shouldYield: () => false,
    unstable_requestPaint: () => {},
    unstable_runWithPriority: (priority: any, callback: any) => callback(),
    unstable_wrapCallback: (callback: any) => callback,
    unstable_getCurrentPriorityLevel: () => 3,
    unstable_ImmediatePriority: 1,
    unstable_UserBlockingPriority: 2,
    unstable_NormalPriority: 3,
    unstable_IdlePriority: 5,
    unstable_LowPriority: 4
  };
}

import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler for scheduler issues
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('unstable_now')) {
    event.preventDefault();
    console.warn('Scheduler error caught and handled:', event.error);
    
    // Fix scheduler and retry
    if (typeof (globalThis as any).scheduler?.unstable_now === 'undefined') {
      (globalThis as any).scheduler = (globalThis as any).scheduler || {};
      (globalThis as any).scheduler.unstable_now = () => performance.now();
    }
    return true;
  }
});

// Initialize React 18 with createRoot API and error handling
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error('React failed to initialize:', error);
  
  // Fallback UI
  rootElement.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="font-size: 24px; margin-bottom: 16px;">🧘‍♀️</div>
      <h1 style="color: #374151; margin-bottom: 8px;">Sembalun Mind</h1>
      <p style="color: #6B7280;">Loading your mindfulness journey...</p>
      <div style="margin-top: 20px;">
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3B82F6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
          "
        >
          Retry
        </button>
      </div>
    </div>
  `;
}
