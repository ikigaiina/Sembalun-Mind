/**
 * Supabase Realtime Service
 * Handles real-time subscriptions, presence, and live features
 */

import { supabase } from '../config/supabaseClient';
import type { 
  RealtimeSubscriptionConfig, 
  PresenceState,
  RealtimePayload 
} from '../types/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export class SupabaseRealtimeService {
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  private presenceChannel: RealtimeChannel | null = null;
  private isInitialized = false;

  // Initialize realtime service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up presence tracking
      await this.initializePresence();
      this.isInitialized = true;
      console.log('Realtime service initialized');
    } catch (error) {
      console.error('Failed to initialize realtime service:', error);
      throw error;
    }
  }

  // Initialize user presence tracking
  private async initializePresence(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user for presence tracking');
      return;
    }

    this.presenceChannel = supabase.channel('user-presence', {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    // Track presence state changes
    this.presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = this.presenceChannel!.presenceState();
        console.log('Presence state synced:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user presence
          await this.presenceChannel!.track({
            user_id: user.id,
            username: user.user_metadata?.display_name || user.email?.split('@')[0],
            status: 'online',
            joined_at: new Date().toISOString()
          } as PresenceState);
        }
      });
  }

  // Subscribe to table changes
  subscribeToTable<T = any>(config: RealtimeSubscriptionConfig<T>): string {
    const subscriptionId = `${config.table}-${Date.now()}`;
    
    const channel = supabase
      .channel(subscriptionId)
      .on(
        'postgres_changes',
        {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table,
          filter: config.filter
        },
        (payload: RealtimePayload<T>) => {
          console.log(`Realtime update for ${config.table}:`, payload);
          config.callback(payload);
        }
      )
      .subscribe((status) => {
        console.log(`Subscription ${subscriptionId} status:`, status);
      });

    this.subscriptions.set(subscriptionId, channel);
    return subscriptionId;
  }

  // Subscribe to user's own data changes
  subscribeToUserData<T = any>(
    table: string,
    callback: (payload: RealtimePayload<T>) => void,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
  ): string | null {
    const { data: { user } } = supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user for user data subscription');
      return null;
    }

    return this.subscribeToTable({
      table,
      event,
      filter: `user_id=eq.${user.id}`,
      callback
    });
  }

  // Subscribe to meditation sessions
  subscribeToMeditationSessions(
    callback: (payload: RealtimePayload) => void
  ): string | null {
    return this.subscribeToUserData('meditation_sessions', callback);
  }

  // Subscribe to achievements
  subscribeToAchievements(
    callback: (payload: RealtimePayload) => void
  ): string | null {
    return this.subscribeToUserData('achievements', callback);
  }

  // Subscribe to notifications
  subscribeToNotifications(
    callback: (payload: RealtimePayload) => void
  ): string | null {
    return this.subscribeToUserData('notifications', callback);
  }

  // Update user presence
  async updatePresence(
    status: 'online' | 'meditating' | 'away' | 'offline',
    activity?: string,
    sessionData?: any
  ): Promise<void> {
    if (!this.presenceChannel) {
      console.warn('Presence channel not initialized');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user for presence update');
      return;
    }

    try {
      await this.presenceChannel.track({
        user_id: user.id,
        username: user.user_metadata?.display_name || user.email?.split('@')[0],
        status,
        activity,
        session_data: sessionData,
        last_updated: new Date().toISOString()
      } as PresenceState);

      // Also update database presence
      await supabase.rpc('update_user_presence', {
        status_param: status,
        activity_param: activity,
        session_data_param: sessionData
      });
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  }

  // Unsubscribe from all subscriptions
  unsubscribeAll(): void {
    this.subscriptions.forEach((channel, id) => {
      supabase.removeChannel(channel);
      console.log(`Unsubscribed from ${id}`);
    });
    this.subscriptions.clear();

    // Remove presence channel
    if (this.presenceChannel) {
      supabase.removeChannel(this.presenceChannel);
      this.presenceChannel = null;
    }

    this.isInitialized = false;
    console.log('All realtime subscriptions removed');
  }

  // Clean up on user sign out
  async cleanup(): Promise<void> {
    // Update presence to offline
    await this.updatePresence('offline');
    
    // Unsubscribe from all channels
    this.unsubscribeAll();
  }
}

// Export singleton instance
export const realtimeService = new SupabaseRealtimeService();