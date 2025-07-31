import { useState, useEffect, useCallback } from 'react';

interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string; // Format: "HH:MM"
  breathingReminder: boolean;
  streakReminder: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  dailyReminder: true,
  reminderTime: "20:00", // 8 PM default
  breathingReminder: true,
  streakReminder: true
};

const STORAGE_KEY = 'sembalun-notification-settings';

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  // Check if notifications are supported
  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse notification settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  // Request permission
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        saveSettings({ ...settings, enabled: true });
        return true;
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
    
    return false;
  };

  // Show a gentle meditation reminder
  const showMeditationReminder = useCallback(() => {
    if (!isSupported || permission !== 'granted' || !settings.enabled) return;

    const messages = [
      "🧘‍♀️ Waktu untuk sedikit ketenangan. Yuk, meditasi sebentar?",
      "🌸 Ambil napas dalam-dalam. Sembalun siap menemanimu bermeditasi.",
      "☯️ Moment untuk diri sendiri. Mari bermeditasi bersama Sembalun.",
      "🍃 Saatnya melepas beban. Ayo luangkan waktu untuk meditasi.",
      "🌅 Hati butuh kedamaian. Yuk, mulai sesi meditasi singkat."
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const notification = new Notification('Sembalun - Pengingat Lembut', {
      body: randomMessage,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'meditation-reminder',
      silent: true, // Gentle, no sound
      requireInteraction: false,
      data: {
        type: 'meditation-reminder',
        timestamp: Date.now()
      }
    });

    // Auto-close after 10 seconds (gentle approach)
    setTimeout(() => {
      notification.close();
    }, 10000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, [isSupported, permission, settings.enabled]);

  // Show breathing exercise reminder
  const showBreathingReminder = () => {
    if (!isSupported || permission !== 'granted' || !settings.enabled || !settings.breathingReminder) return;

    const notification = new Notification('Sembalun - Latihan Pernapasan', {
      body: "💨 Yuk, lakukan latihan pernapasan 3 menit untuk menyegarkan pikiran.",
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'breathing-reminder',
      silent: true,
      requireInteraction: false,
      data: {
        type: 'breathing-reminder',
        timestamp: Date.now()
      }
    });

    setTimeout(() => {
      notification.close();
    }, 8000);

    notification.onclick = () => {
      window.focus();
      // Could navigate to breathing session
      notification.close();
    };
  };

  // Show streak congratulation
  const showStreakCelebration = (days: number) => {
    if (!isSupported || permission !== 'granted' || !settings.enabled || !settings.streakReminder) return;

    let message = "🎉 Luar biasa! ";
    if (days === 1) {
      message += "Kamu telah memulai perjalanan mindfulness!";
    } else if (days === 7) {
      message += `Streak 7 hari! Konsistensi yang menakjubkan.`;
    } else if (days === 30) {
      message += `Sebulan konsisten bermeditasi! Kamu luar biasa.`;
    } else if (days % 7 === 0) {
      message += `${days} hari berturut-turut! Tetap semangat!`;
    } else {
      message += `Hari ke-${days} bermeditasi! Terus pertahankan!`;
    }

    const notification = new Notification('Sembalun - Pencapaian', {
      body: message,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'streak-celebration',
      silent: true,
      requireInteraction: false,
      data: {
        type: 'streak-celebration',
        days,
        timestamp: Date.now()
      }
    });

    setTimeout(() => {
      notification.close();
    }, 12000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  // Schedule daily reminder
  const scheduleDailyReminder = useCallback(() => {
    if (!settings.enabled || !settings.dailyReminder) return;

    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // If reminder time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      showMeditationReminder();
      // Schedule next day
      setTimeout(scheduleDailyReminder, 24 * 60 * 60 * 1000);
    }, timeUntilReminder);
  }, [settings.enabled, settings.dailyReminder, settings.reminderTime, showMeditationReminder]);

  // Initialize daily reminders when enabled
  useEffect(() => {
    if (settings.enabled && settings.dailyReminder && permission === 'granted') {
      scheduleDailyReminder();
    }
  }, [settings.enabled, settings.dailyReminder, settings.reminderTime, permission, scheduleDailyReminder]);

  // Disable notifications
  const disable = () => {
    saveSettings({ ...settings, enabled: false });
  };

  // Update specific setting
  const updateSetting = <K extends keyof NotificationSettings>(
    key: K, 
    value: NotificationSettings[K]
  ) => {
    saveSettings({ ...settings, [key]: value });
  };

  return {
    settings,
    permission,
    isSupported,
    requestPermission,
    disable,
    updateSetting,
    showMeditationReminder,
    showBreathingReminder,
    showStreakCelebration,
    canShowNotifications: isSupported && permission === 'granted' && settings.enabled
  };
};