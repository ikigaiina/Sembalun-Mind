import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as typeof navigator & { standalone?: boolean }).standalone ||
                          document.referrer.includes('android-app://');
    
    setIsInstalled(isAppInstalled);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      // Prevent default browser install prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(event);
      
      // Show custom install prompt after a delay (gentle approach)
      setTimeout(() => {
        if (!isAppInstalled) {
          setShowInstallPrompt(true);
        }
      }, 10000); // Show after 10 seconds of usage
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    try {
      // Show the browser's install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user's choice
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
        return true;
      }
    } catch (error) {
      console.log('Error showing install prompt:', error);
    }
    
    return false;
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    localStorage.setItem('sembalun-install-dismissed', Date.now().toString());
  };

  // Check if install prompt was recently dismissed
  useEffect(() => {
    const dismissedTime = localStorage.getItem('sembalun-install-dismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) { // Don't show for 24 hours after dismissal
        setShowInstallPrompt(false);
      }
    }
  }, []);

  return {
    canInstall: !!deferredPrompt,
    showInstallPrompt,
    isInstalled,
    promptInstall,
    dismissInstallPrompt
  };
};