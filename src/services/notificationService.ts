/**
 * Smart Notification Service with Indonesian Cultural Integration
 * Provides personalized meditation reminders and insights
 */

export interface NotificationPreferences {
  enabled: boolean;
  meditationReminders: boolean;
  wisdomQuotes: boolean;
  streakReminders: boolean;
  achievements: boolean;
  culturalEvents: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // 'HH:MM' format
    end: string;   // 'HH:MM' format
  };
  frequency: 'daily' | 'twice-daily' | 'custom';
  customTimes: string[]; // Array of 'HH:MM' strings
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationData {
  id: string;
  type: 'meditation' | 'wisdom' | 'streak' | 'achievement' | 'cultural';
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  scheduledTime?: Date;
  culturalContext?: {
    region: string;
    practice: string;
    wisdom?: string;
  };
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private preferences: NotificationPreferences;
  private indonesianWisdom: string[] = [
    "Hati yang tenang seperti air danau yang jernih - Indonesian Wisdom",
    "Setiap napas adalah kesempatan untuk memulai yang baru",
    "Ketenangan batin adalah kekuatan sejati",
    "Seperti bambu yang lentur, jiwa yang fleksibel tidak mudah patah",
    "Meditasi adalah jembatan antara kebisingan dan keheningan",
    "Dalam keheningan, kita menemukan jawaban yang dicari hati",
    "Pikiran yang jernih seperti langit pagi di Sembalun",
    "Setiap detik meditasi adalah investasi untuk kebahagiaan",
  ];

  private culturalEvents: Record<string, string> = {
    'Hari Raya Nyepi': 'Hari yang sempurna untuk meditasi dan introspeksi mendalam',
    'Bulan Ramadan': 'Waktu refleksi spiritual dan mindfulness dalam ibadah',
    'Hari Kartini': 'Meditasi untuk memberdayakan kekuatan batin wanita Indonesia',
    'Hari Kemerdekaan': 'Refleksi atas kemerdekaan batin dan spiritual',
  };

  constructor() {
    this.preferences = this.loadPreferences();
    this.initializeNotifications();
  }

  private loadPreferences(): NotificationPreferences {
    const stored = localStorage.getItem('notificationPreferences');
    return stored ? JSON.parse(stored) : {
      enabled: false,
      meditationReminders: true,
      wisdomQuotes: true,
      streakReminders: true,
      achievements: true,
      culturalEvents: true,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00'
      },
      frequency: 'daily',
      customTimes: ['07:00', '19:00'],
      soundEnabled: true,
      vibrationEnabled: true
    };
  }

  private savePreferences(): void {
    localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    
    if (permission === 'granted') {
      this.preferences.enabled = true;
      this.savePreferences();
      await this.setupServiceWorkerNotifications();
      return true;
    }

    return false;
  }

  private async setupServiceWorkerNotifications(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Set up push notification subscription if supported
        if ('PushManager' in window) {
          const subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            // Note: This would require a VAPID key from the server
            console.log('Push notifications available but not configured');
          }
        }
      } catch (error) {
        console.error('Error setting up service worker notifications:', error);
      }
    }
  }

  private async initializeNotifications(): Promise<void> {
    if (this.preferences.enabled) {
      await this.scheduleRecurringNotifications();
    }
  }

  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
    
    if (this.preferences.enabled) {
      this.scheduleRecurringNotifications();
    } else {
      this.clearAllScheduledNotifications();
    }
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  private isInQuietHours(time: Date = new Date()): boolean {
    if (!this.preferences.quietHours.enabled) return false;

    const currentTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = this.preferences.quietHours;

    // Handle quiet hours that span midnight
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    return currentTime >= start && currentTime <= end;
  }

  private getRandomWisdom(): string {
    return this.indonesianWisdom[Math.floor(Math.random() * this.indonesianWisdom.length)];
  }

  private getCulturalEventMessage(): string | null {
    const today = new Date();
    const dateKey = `${today.getMonth() + 1}-${today.getDate()}`;
    
    // Simple cultural event detection (could be enhanced with proper calendar)
    const specialDates: Record<string, string> = {
      '3-11': this.culturalEvents['Hari Raya Nyepi'],
      '4-21': this.culturalEvents['Hari Kartini'],
      '8-17': this.culturalEvents['Hari Kemerdekaan'],
    };

    return specialDates[dateKey] || null;
  }

  async showNotification(notification: NotificationData): Promise<void> {
    if (!this.preferences.enabled || this.permission !== 'granted') {
      return;
    }

    if (this.isInQuietHours()) {
      // Queue for later if in quiet hours
      this.scheduleNotification(notification, new Date(Date.now() + 8 * 60 * 60 * 1000)); // 8 hours later
      return;
    }

    try {
      const options: NotificationOptions = {
        body: notification.body,
        icon: notification.icon || '/icon-192.svg',
        badge: notification.badge || '/icon-192.svg',
        tag: notification.tag || notification.id,
        data: notification.data,
        silent: !this.preferences.soundEnabled,
        vibrate: this.preferences.vibrationEnabled ? [200, 100, 200] : [],
        requireInteraction: notification.type === 'achievement' || notification.type === 'cultural',
      };

      const systemNotification = new Notification(notification.title, options);
      
      systemNotification.onclick = () => {
        window.focus();
        systemNotification.close();
        
        // Navigate to relevant page based on notification type
        this.handleNotificationClick(notification);
      };

      // Auto-close after 8 seconds for non-critical notifications
      if (!options.requireInteraction) {
        setTimeout(() => {
          systemNotification.close();
        }, 8000);
      }

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private handleNotificationClick(notification: NotificationData): void {
    const routes: Record<string, string> = {
      'meditation': '/meditation',
      'wisdom': '/wisdom',
      'streak': '/progress',
      'achievement': '/achievements',
      'cultural': '/cultural'
    };

    const route = routes[notification.type] || '/';
    if (window.location.pathname !== route) {
      window.location.href = route;
    }
  }

  async scheduleNotification(notification: NotificationData, scheduledTime: Date): Promise<void> {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      await this.showNotification(notification);
      return;
    }

    setTimeout(async () => {
      await this.showNotification(notification);
    }, delay);
  }

  private async scheduleRecurringNotifications(): Promise<void> {
    this.clearAllScheduledNotifications();

    if (this.preferences.meditationReminders) {
      await this.scheduleMeditationReminders();
    }

    if (this.preferences.wisdomQuotes) {
      await this.scheduleWisdomQuotes();
    }

    if (this.preferences.streakReminders) {
      await this.scheduleStreakReminders();
    }
  }

  private async scheduleMeditationReminders(): Promise<void> {
    const times = this.preferences.frequency === 'custom' 
      ? this.preferences.customTimes
      : this.getDefaultReminderTimes();

    times.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledDate = new Date();
      scheduledDate.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduledDate < new Date()) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      const notification: NotificationData = {
        id: `meditation-${time}`,
        type: 'meditation',
        title: 'Waktunya Meditasi 🧘‍♀️',
        body: 'Berikan waktu sejenak untuk ketenangan batin Anda',
        tag: 'meditation-reminder',
        culturalContext: {
          region: 'Indonesia',
          practice: 'mindfulness'
        }
      };

      this.scheduleNotification(notification, scheduledDate);
    });
  }

  private async scheduleWisdomQuotes(): Promise<void> {
    // Schedule daily wisdom quote at 9 AM
    const scheduledDate = new Date();
    scheduledDate.setHours(9, 0, 0, 0);

    if (scheduledDate < new Date()) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    const culturalEvent = this.getCulturalEventMessage();
    const wisdom = culturalEvent || this.getRandomWisdom();

    const notification: NotificationData = {
      id: 'daily-wisdom',
      type: 'wisdom',
      title: 'Kebijaksanaan Hari Ini ✨',
      body: wisdom,
      tag: 'wisdom-quote',
    };

    this.scheduleNotification(notification, scheduledDate);
  }

  private async scheduleStreakReminders(): Promise<void> {
    // Get user's last meditation session
    const lastSession = localStorage.getItem('lastMeditationSession');
    if (!lastSession) return;

    const lastSessionDate = new Date(lastSession);
    const now = new Date();
    const hoursSinceLastSession = (now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60);

    // Remind after 20 hours if no session today
    if (hoursSinceLastSession >= 20) {
      const notification: NotificationData = {
        id: 'streak-reminder',
        type: 'streak',
        title: 'Jangan Putuskan Streak Anda! 🔥',
        body: 'Satu sesi meditasi singkat dapat mempertahankan momentum Anda',
        tag: 'streak-reminder',
      };

      await this.showNotification(notification);
    }
  }

  private getDefaultReminderTimes(): string[] {
    switch (this.preferences.frequency) {
      case 'daily':
        return ['08:00'];
      case 'twice-daily':
        return ['08:00', '20:00'];
      default:
        return this.preferences.customTimes;
    }
  }

  async showAchievementNotification(achievement: { title: string; description: string; badge: string }): Promise<void> {
    const notification: NotificationData = {
      id: `achievement-${Date.now()}`,
      type: 'achievement',
      title: `🎉 Pencapaian Baru: ${achievement.title}`,
      body: achievement.description,
      tag: 'achievement',
      data: { achievement }
    };

    await this.showNotification(notification);
  }

  async showCulturalEventNotification(event: string, message: string): Promise<void> {
    const notification: NotificationData = {
      id: `cultural-${Date.now()}`,
      type: 'cultural',
      title: `🌸 ${event}`,
      body: message,
      tag: 'cultural-event',
      culturalContext: {
        region: 'Indonesia',
        practice: 'cultural-awareness'
      }
    };

    await this.showNotification(notification);
  }

  private clearAllScheduledNotifications(): void {
    // Clear any existing timeouts (in a real implementation, you'd track these)
    // This is a simplified approach
    console.log('Clearing scheduled notifications');
  }

  async testNotification(): Promise<void> {
    if (await this.requestPermission()) {
      const notification: NotificationData = {
        id: 'test-notification',
        type: 'meditation',
        title: 'Test Notification',
        body: 'Notifikasi berfungsi dengan baik! 🎉',
      };

      await this.showNotification(notification);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default NotificationService;