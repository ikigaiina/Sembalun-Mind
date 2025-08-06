import { supabase } from '../config/supabase'

export interface NotificationPreferences {
  daily_reminders: boolean
  achievement_alerts: boolean
  streak_warnings: boolean
  weekly_progress: boolean
  social_updates: boolean
  sound_enabled: boolean
  vibration_enabled: boolean
  quiet_hours: {
    enabled: boolean
    start_time: string
    end_time: string
  }
  reminder_times: string[]
}

export interface PushNotification {
  id?: string
  user_id: string
  title: string
  body: string
  type: 'reminder' | 'achievement' | 'streak' | 'progress' | 'social' | 'system'
  data?: Record<string, any>
  scheduled_for?: string
  sent_at?: string
  read_at?: string
  action_url?: string
  priority: 'low' | 'normal' | 'high'
  created_at?: string
}

export class SupabaseNotificationService {
  // Request notification permission
  static async requestPermission(): Promise<{ granted: boolean; error?: string }> {
    if (!('Notification' in window)) {
      return { granted: false, error: 'Notifications not supported' }
    }

    if (Notification.permission === 'granted') {
      return { granted: true }
    }

    if (Notification.permission === 'denied') {
      return { granted: false, error: 'Notifications denied by user' }
    }

    try {
      const permission = await Notification.requestPermission()
      return { granted: permission === 'granted' }
    } catch (error) {
      return { granted: false, error: 'Failed to request permission' }
    }
  }

  // Register service worker for push notifications
  static async registerServiceWorker(): Promise<{ registration: ServiceWorkerRegistration | null; error?: string }> {
    if (!('serviceWorker' in navigator)) {
      return { registration: null, error: 'Service Worker not supported' }
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      return { registration }
    } catch (error) {
      return { registration: null, error: 'Failed to register Service Worker' }
    }
  }

  // Subscribe to push notifications
  static async subscribeToPush(userId: string): Promise<{ subscription: PushSubscription | null; error?: string }> {
    try {
      const { registration } = await this.registerServiceWorker()
      if (!registration) {
        return { subscription: null, error: 'Service Worker registration failed' }
      }

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription()
      
      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
        if (!vapidPublicKey) {
          return { subscription: null, error: 'VAPID public key not configured' }
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        })
      }

      // Save subscription to database
      if (subscription && supabase) {
        await this.saveSubscription(userId, subscription)
      }

      return { subscription }
    } catch (error) {
      return { subscription: null, error: `Push subscription failed: ${error}` }
    }
  }

  // Save push subscription to database
  private static async saveSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    if (!supabase) return

    const subscriptionData = {
      user_id: userId,
      setting_key: 'push_subscription',
      setting_value: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys?.p256dh,
          auth: subscription.toJSON().keys?.auth
        },
        created_at: new Date().toISOString()
      }
    }

    await supabase
      .from('user_settings')
      .upsert([subscriptionData])
  }

  // Get user notification preferences
  static async getNotificationPreferences(userId: string): Promise<{
    data: NotificationPreferences | null
    error: any
  }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('user_id', userId)
        .eq('setting_key', 'notification_preferences')
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error
      }

      const defaultPreferences: NotificationPreferences = {
        daily_reminders: true,
        achievement_alerts: true,
        streak_warnings: true,
        weekly_progress: true,
        social_updates: false,
        sound_enabled: true,
        vibration_enabled: true,
        quiet_hours: {
          enabled: false,
          start_time: '22:00',
          end_time: '07:00'
        },
        reminder_times: ['09:00', '19:00']
      }

      return {
        data: data?.setting_value || defaultPreferences,
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Update notification preferences
  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    try {
      // Get current preferences
      const { data: current } = await this.getNotificationPreferences(userId)
      const updatedPreferences = { ...current, ...preferences }

      const { error } = await supabase
        .from('user_settings')
        .upsert([{
          user_id: userId,
          setting_key: 'notification_preferences',
          setting_value: updatedPreferences
        }])

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Schedule daily meditation reminder
  static async scheduleDailyReminder(
    userId: string,
    time: string,
    message?: string
  ): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    try {
      const notification: Omit<PushNotification, 'id' | 'created_at'> = {
        user_id: userId,
        title: 'Waktunya Meditasi 🧘‍♀️',
        body: message || 'Luangkan waktu sejenak untuk menenangkan pikiran dan merasakan kedamaian.',
        type: 'reminder',
        priority: 'normal',
        data: {
          action: 'start_meditation',
          reminder_type: 'daily'
        }
      }

      // In a real implementation, this would schedule the notification
      // For now, we'll store it as a template
      const { error } = await supabase
        .from('user_settings')
        .upsert([{
          user_id: userId,
          setting_key: `daily_reminder_${time}`,
          setting_value: {
            ...notification,
            scheduled_time: time,
            is_active: true
          }
        }])

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Send achievement notification
  static async sendAchievementNotification(
    userId: string,
    achievement: {
      title: string
      description: string
      icon: string
      points: number
    }
  ): Promise<{ error: any }> {
    try {
      const notification: Omit<PushNotification, 'id' | 'created_at'> = {
        user_id: userId,
        title: `🎉 Pencapaian Baru: ${achievement.title}`,
        body: `${achievement.description} (+${achievement.points} poin)`,
        type: 'achievement',
        priority: 'high',
        data: {
          achievement_title: achievement.title,
          points: achievement.points,
          icon: achievement.icon
        }
      }

      return await this.sendInstantNotification(notification)
    } catch (error) {
      return { error }
    }
  }

  // Send streak warning notification
  static async sendStreakWarning(
    userId: string,
    streakCount: number,
    lastSessionDate: string
  ): Promise<{ error: any }> {
    try {
      const daysSinceLastSession = Math.floor(
        (Date.now() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24)
      )

      let message = ''
      if (daysSinceLastSession === 1) {
        message = `Jangan biarkan streak ${streakCount} hari Anda terputus! Meditasi sekarang untuk melanjutkan perjalanan mindfulness.`
      } else {
        message = `Streak ${streakCount} hari Anda akan hilang jika tidak meditasi hari ini. Luangkan waktu sejenak untuk kedamaian batin.`
      }

      const notification: Omit<PushNotification, 'id' | 'created_at'> = {
        user_id: userId,
        title: '🔥 Jaga Streak Meditasi Anda!',
        body: message,
        type: 'streak',
        priority: 'high',
        data: {
          streak_count: streakCount,
          days_since_last: daysSinceLastSession
        }
      }

      return await this.sendInstantNotification(notification)
    } catch (error) {
      return { error }
    }
  }

  // Send weekly progress notification
  static async sendWeeklyProgress(
    userId: string,
    weeklyStats: {
      sessions: number
      minutes: number
      goal_sessions: number
      improvement: number
    }
  ): Promise<{ error: any }> {
    try {
      const { sessions, minutes, goal_sessions, improvement } = weeklyStats
      const completionRate = Math.round((sessions / goal_sessions) * 100)
      
      let message = ''
      if (completionRate >= 100) {
        message = `Luar biasa! Anda mencapai ${sessions} sesi (${minutes} menit) minggu ini. Tingkatkan ${improvement > 0 ? improvement + '%' : 'terus'} dari minggu lalu! 🌟`
      } else if (completionRate >= 70) {
        message = `Hebat! ${sessions} sesi (${minutes} menit) minggu ini. Hanya ${goal_sessions - sessions} sesi lagi untuk mencapai target! 💪`
      } else {
        message = `${sessions} sesi minggu ini. Mari tingkatkan konsistensi untuk mencapai target ${goal_sessions} sesi per minggu! 🎯`
      }

      const notification: Omit<PushNotification, 'id' | 'created_at'> = {
        user_id: userId,
        title: '📊 Laporan Mingguan Meditasi',
        body: message,
        type: 'progress',
        priority: 'normal',
        data: {
          weekly_sessions: sessions,
          weekly_minutes: minutes,
          completion_rate: completionRate,
          improvement: improvement
        }
      }

      return await this.sendInstantNotification(notification)
    } catch (error) {
      return { error }
    }
  }

  // Send instant notification
  private static async sendInstantNotification(
    notification: Omit<PushNotification, 'id' | 'created_at'>
  ): Promise<{ error: any }> {
    try {
      // Check if notifications are enabled for this user
      const { data: preferences } = await this.getNotificationPreferences(notification.user_id)
      if (!preferences) return { error: null }

      // Check notification type preferences
      const shouldSend = this.shouldSendNotification(notification.type, preferences)
      if (!shouldSend) return { error: null }

      // Check quiet hours
      if (this.isQuietHours(preferences.quiet_hours)) {
        return { error: null } // Skip during quiet hours
      }

      // Send browser notification if permission granted
      if (Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
          body: notification.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: `${notification.type}-${notification.user_id}`,
          requireInteraction: notification.priority === 'high',
          silent: !preferences.sound_enabled,
          vibrate: preferences.vibration_enabled ? [200, 100, 200] : []
        })

        // Handle notification click
        browserNotification.onclick = () => {
          window.focus()
          if (notification.action_url) {
            window.location.href = notification.action_url
          }
          browserNotification.close()
        }

        // Auto-close after 10 seconds for normal priority
        if (notification.priority !== 'high') {
          setTimeout(() => browserNotification.close(), 10000)
        }
      }

      // Store notification in database for history
      if (supabase) {
        await supabase
          .from('user_settings')
          .insert([{
            user_id: notification.user_id,
            setting_key: `notification_${Date.now()}`,
            setting_value: {
              ...notification,
              sent_at: new Date().toISOString()
            }
          }])
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Check if notification should be sent based on preferences
  private static shouldSendNotification(
    type: PushNotification['type'],
    preferences: NotificationPreferences
  ): boolean {
    switch (type) {
      case 'reminder':
        return preferences.daily_reminders
      case 'achievement':
        return preferences.achievement_alerts
      case 'streak':
        return preferences.streak_warnings
      case 'progress':
        return preferences.weekly_progress
      case 'social':
        return preferences.social_updates
      case 'system':
        return true // System notifications always send
      default:
        return false
    }
  }

  // Check if current time is within quiet hours
  private static isQuietHours(quietHours: NotificationPreferences['quiet_hours']): boolean {
    if (!quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = quietHours.start_time.split(':').map(Number)
    const [endHour, endMin] = quietHours.end_time.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime <= endTime) {
      // Same day quiet hours (e.g., 22:00 - 23:00)
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Overnight quiet hours (e.g., 22:00 - 07:00)
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  // Get notification history
  static async getNotificationHistory(userId: string, limit: number = 50): Promise<{
    data: PushNotification[]
    error: any
  }> {
    if (!supabase) {
      return { data: [], error: new Error('Supabase not available') }
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_key, setting_value, created_at')
        .eq('user_id', userId)
        .like('setting_key', 'notification_%')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      const notifications = data?.map(item => ({
        id: item.setting_key,
        created_at: item.created_at,
        ...item.setting_value
      })) || []

      return { data: notifications, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  // Mark notification as read
  static async markAsRead(userId: string, notificationId: string): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    try {
      // Get current notification
      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('user_id', userId)
        .eq('setting_key', notificationId)
        .single()

      if (fetchError) throw fetchError

      // Update with read timestamp
      const updatedNotification = {
        ...data.setting_value,
        read_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_settings')
        .update({ setting_value: updatedNotification })
        .eq('user_id', userId)
        .eq('setting_key', notificationId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Clear all notifications
  static async clearAllNotifications(userId: string): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', userId)
        .like('setting_key', 'notification_%')

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Utility function to convert VAPID key
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Test notification (for development)
  static async sendTestNotification(userId: string): Promise<{ error: any }> {
    const testNotification: Omit<PushNotification, 'id' | 'created_at'> = {
      user_id: userId,
      title: '🧪 Test Notification',
      body: 'Ini adalah notifikasi test untuk memastikan sistem berjalan dengan baik.',
      type: 'system',
      priority: 'normal',
      data: {
        test: true,
        timestamp: Date.now()
      }
    }

    return await this.sendInstantNotification(testNotification)
  }
}