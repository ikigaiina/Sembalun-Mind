// Minimal polyfills for production compatibility
// Only add what's absolutely necessary and avoid conflicts

// 1. GlobalThis polyfill
if (typeof globalThis === 'undefined') {
  (window as any).globalThis = window;
}

// 2. Performance polyfill - only if missing
if (typeof performance === 'undefined') {
  (globalThis as any).performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    clearMarks: () => {},
    clearMeasures: () => {}
  };
} else if (!performance.now) {
  performance.now = () => Date.now();
}

// 3. MessageChannel polyfill - only if missing  
if (typeof MessageChannel === 'undefined') {
  (globalThis as any).MessageChannel = class MessageChannel {
    port1: any;
    port2: any;
    
    constructor() {
      this.port1 = {
        onmessage: null,
        postMessage: (data: any) => {
          if (this.port2.onmessage) {
            setTimeout(() => this.port2.onmessage({ data }), 0);
          }
        }
      };
      
      this.port2 = {
        onmessage: null,
        postMessage: (data: any) => {
          if (this.port1.onmessage) {
            setTimeout(() => this.port1.onmessage({ data }), 0);
          }
        }
      };
    }
  };
}

// Note: Scheduler polyfill is handled by scheduler-fix.js to avoid conflicts