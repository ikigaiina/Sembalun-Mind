// React 19 scheduler polyfill for production builds
if (typeof globalThis.MessageChannel === 'undefined') {
  globalThis.MessageChannel = class MessageChannel {
    port1: MessagePort;
    port2: MessagePort;
    
    constructor() {
      this.port1 = new MessagePort();
      this.port2 = new MessagePort();
      
      // Connect the ports
      (this.port1 as any)._otherPort = this.port2;
      (this.port2 as any)._otherPort = this.port1;
    }
  };
  
  globalThis.MessagePort = class MessagePort extends EventTarget {
    onmessage: ((event: MessageEvent) => void) | null = null;
    
    postMessage(data: any) {
      const otherPort = (this as any)._otherPort;
      if (otherPort && otherPort.onmessage) {
        setTimeout(() => {
          otherPort.onmessage(new MessageEvent('message', { data }));
        }, 0);
      }
    }
    
    start() {}
    close() {}
  };
}

// Ensure performance.now exists
if (typeof globalThis.performance === 'undefined') {
  globalThis.performance = {
    now: () => Date.now()
  } as Performance;
}

// React scheduler compatibility
if (typeof globalThis.scheduler === 'undefined') {
  globalThis.scheduler = {
    postTask: (callback: () => void, options?: { priority?: string }) => {
      return new Promise(resolve => {
        setTimeout(() => {
          callback();
          resolve(undefined);
        }, 0);
      });
    },
    unstable_now: () => performance.now()
  };
}