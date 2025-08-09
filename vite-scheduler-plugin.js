// Vite plugin to inject React Scheduler fix directly into the bundle
export default function schedulerFixPlugin() {
  return {
    name: 'scheduler-fix',
    generateBundle(options, bundle) {
      // Find the vendor libs bundle that contains React Scheduler
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk' && fileName.includes('vendor-libs')) {
          // Inject scheduler fix at the beginning of the bundle
          const schedulerFix = `
(function() {
  if (typeof globalThis === 'undefined') { globalThis = window; }
  var perf = globalThis.performance || { now: function() { return Date.now(); } };
  var sched = {
    unstable_now: function() { return perf.now(); },
    unstable_scheduleCallback: function(p, c, o) { 
      var t = (o && o.timeout) || 0; 
      var i = setTimeout(c, t); 
      return { cancel: function() { clearTimeout(i); } }; 
    },
    unstable_cancelCallback: function(t) { if (t && t.cancel) t.cancel(); },
    unstable_shouldYield: function() { return false; },
    unstable_requestPaint: function() {},
    unstable_runWithPriority: function(p, c) { return c(); },
    unstable_wrapCallback: function(c) { return c; },
    unstable_getCurrentPriorityLevel: function() { return 3; },
    unstable_ImmediatePriority: 1,
    unstable_UserBlockingPriority: 2,
    unstable_NormalPriority: 3,
    unstable_IdlePriority: 5,
    unstable_LowPriority: 4
  };
  globalThis.scheduler = sched;
  window.scheduler = sched;
})();
`;
          chunk.code = schedulerFix + chunk.code;
        }
      });
    }
  };
}