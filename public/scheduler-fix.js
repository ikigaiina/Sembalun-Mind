// CRITICAL: React Scheduler Fix - Must run before any React code
// This script runs immediately when loaded, before module loading

(function() {
  'use strict';
  
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Ensure performance.now exists
  if (typeof performance === 'undefined' || !performance.now) {
    window.performance = window.performance || {};
    window.performance.now = window.performance.now || function() {
      return Date.now();
    };
  }
  
  // Create the comprehensive scheduler object that React is trying to access
  const schedulerShim = {
    unstable_now: function() {
      return window.performance.now();
    },
    unstable_scheduleCallback: function(priority, callback, options) {
      var timeout = typeof options === 'object' && options !== null ? options.timeout : 0;
      var id = setTimeout(callback, timeout);
      return { cancel: function() { clearTimeout(id); } };
    },
    unstable_cancelCallback: function(task) {
      if (task && task.cancel) task.cancel();
    },
    unstable_shouldYield: function() { return false; },
    unstable_requestPaint: function() {},
    unstable_runWithPriority: function(priority, callback) { return callback(); },
    unstable_wrapCallback: function(callback) { return callback; },
    unstable_getCurrentPriorityLevel: function() { return 3; },
    unstable_ImmediatePriority: 1,
    unstable_UserBlockingPriority: 2,
    unstable_NormalPriority: 3,
    unstable_IdlePriority: 5,
    unstable_LowPriority: 4,
    // Additional properties React might look for
    postTask: function(callback, options) {
      var priority = options && options.priority || 'user-blocking';
      var timeout = 0;
      var id = setTimeout(callback, timeout);
      return { cancel: function() { clearTimeout(id); } };
    }
  };
  
  // AGGRESSIVE: Set on ALL possible global locations
  window.scheduler = schedulerShim;
  window.Scheduler = schedulerShim; // Capital S version
  
  if (typeof globalThis !== 'undefined') {
    globalThis.scheduler = schedulerShim;
    globalThis.Scheduler = schedulerShim;
  }
  
  if (typeof global !== 'undefined') {
    global.scheduler = schedulerShim;
    global.Scheduler = schedulerShim;
  }
  
  // React namespace - create aggressively
  window.React = window.React || {};
  window.React.unstable_Scheduler = schedulerShim;
  window.React.Scheduler = schedulerShim;
  
  if (typeof globalThis !== 'undefined') {
    globalThis.React = globalThis.React || {};
    globalThis.React.unstable_Scheduler = schedulerShim;
    globalThis.React.Scheduler = schedulerShim;
  }
  
  // Additional React internal locations
  if (typeof window.ReactInternals === 'undefined') {
    window.ReactInternals = {};
  }
  window.ReactInternals.Scheduler = schedulerShim;
  
  // Intercept any attempts to override
  Object.defineProperty(window, 'scheduler', {
    get: function() { return schedulerShim; },
    set: function(newValue) {
      // Allow setting but ensure unstable_now exists
      if (newValue && typeof newValue.unstable_now === 'undefined') {
        newValue.unstable_now = schedulerShim.unstable_now;
      }
      return newValue;
    },
    configurable: true
  });
  
  // MessageChannel polyfill for React concurrent features
  if (typeof MessageChannel === 'undefined') {
    window.MessageChannel = function MessageChannel() {
      var self = this;
      this.port1 = {
        onmessage: null,
        postMessage: function(data) {
          if (self.port2.onmessage) {
            setTimeout(function() { self.port2.onmessage({ data: data }); }, 0);
          }
        }
      };
      
      this.port2 = {
        onmessage: null,
        postMessage: function(data) {
          if (self.port1.onmessage) {
            setTimeout(function() { self.port1.onmessage({ data: data }); }, 0);
          }
        }
      };
    };
  }
  
  // Patch any existing scheduler module exports attempt
  if (typeof module !== 'undefined' && module.exports) {
    if (typeof module.exports.unstable_now === 'undefined') {
      module.exports.unstable_now = schedulerShim.unstable_now;
    }
  }
  
  // Only log in development
  if (typeof window !== 'undefined' && window.location && 
      (window.location.hostname === 'localhost' || window.location.hostname.includes('dev'))) {
    console.log('✅ React Scheduler polyfill loaded');
  }
})();