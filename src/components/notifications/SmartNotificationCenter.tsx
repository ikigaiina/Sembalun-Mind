import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { smartNotificationService } from '../../services/smartNotificationService';
import type { SmartNotification } from '../../services/smartNotificationService';
import { 
  contextualMonitoringService 
} from '../../services/contextualMonitoringService';
import { 
  smartSchedulingService 
} from '../../services/smartSchedulingService';
import { 
  celebrationService 
} from '../../services/celebrationService';
import { 
  encouragementService 
} from '../../services/encouragementService';

interface SmartNotificationCenterProps {
  className?: string;
}

type Tab = 'all' | 'reminders' | 'achievements' | 'insights';

export const SmartNotificationCenter: React.FC<SmartNotificationCenterProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userNotifications = await smartNotificationService.getUserNotifications(user.uid, false, 20);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const initializeSmartFeatures = useCallback(async () => {
    if (!user) return;

    try {
      // Initialize smart scheduling
      await smartSchedulingService.analyzeOptimalTimes(user.uid);
      
      // Start contextual monitoring
      await contextualMonitoringService.monitorStressPatterns(user.uid);
      await contextualMonitoringService.monitorMoodPatterns(user.uid);
      
      // Check for celebrations
      await celebrationService.checkAndCreateCelebrations(user.uid);
      
      // Setup encouragement system
      await encouragementService.analyzeProgressPatterns(user.uid);
    } catch (error) {
      console.error('Error initializing smart features:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      initializeSmartFeatures();
    }
  }, [user, loadNotifications, initializeSmartFeatures]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await smartNotificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const triggerTestNotification = async () => {
    if (!user) return;

    try {
      // Test contextual notification
      await smartNotificationService.generateContextualNotification(user.uid, 'stress_detected');
      
      // Test achievement notification
      await celebrationService.createAchievementCelebration(user.uid, {
        id: 'test-achievement',
        title: 'Demo Achievement',
        description: 'Test achievement for demonstration',
        type: 'demo',
        rarity: 'common',
        points: 100
      });

      await loadNotifications();
      alert('Test notifications created!');
    } catch (error) {
      console.error('Error creating test notification:', error);
      alert('Error creating test notifications');
    }
  };

  const generateWeeklySummary = async () => {
    if (!user) return;

    try {
      const summary = await encouragementService.generateWeeklyProgressSummary(user.uid);
      alert(`Weekly summary generated! Primary message: ${summary.encouragement.primaryMessage}`);
      await loadNotifications();
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      alert('Error generating weekly summary');
    }
  };

  const getNotificationIcon = (type: string, category: string): string => {
    switch (category) {
      case 'meditation_reminder': return '🧘‍♀️';
      case 'stress_alert': return '🚨';
      case 'mood_check': return '💭';
      case 'celebration': return '🎉';
      case 'weekly_summary': return '📊';
      case 'goal_reminder': return '🎯';
      default: return '🔔';
    }
  };

  const getNotificationColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-300 bg-gray-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'reminders') return notification.category === 'meditation_reminder';
    if (activeTab === 'achievements') return notification.category === 'celebration';
    if (activeTab === 'insights') return notification.category === 'weekly_summary' || notification.category === 'mood_check';
    return true;
  });

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-bold text-gray-900">Smart Notifications</div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="text-3xl">🔔</div>
      </div>

      {/* Demo Controls */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-yellow-900 mb-2">🧪 Demo Controls</h4>
        <div className="flex space-x-2">
          <Button onClick={triggerTestNotification} size="small">
            Test Notifications
          </Button>
          <Button onClick={generateWeeklySummary} size="small" variant="outline">
            Generate Weekly Summary
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'all', label: 'All', icon: '📱' },
          { id: 'reminders', label: 'Reminders', icon: '⏰' },
          { id: 'achievements', label: 'Celebrations', icon: '🎉' },
          { id: 'insights', label: 'Insights', icon: '💡' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada notifikasi
          </h4>
          <p className="text-gray-600">
            Smart notifications akan muncul berdasarkan aktivitas dan pola Anda
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                notification.isRead ? 'bg-gray-50' : getNotificationColor(notification.priority)
              }`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">
                  {getNotificationIcon(notification.type, notification.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTime(notification.scheduledTime)}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                    {notification.message}
                  </p>
                  
                  {notification.personalizedContent?.motivationalTone && (
                    <div className="mt-2 text-xs text-blue-600">
                      Tone: {notification.personalizedContent.motivationalTone}
                    </div>
                  )}
                </div>
              </div>
              
              {notification.priority === 'high' || notification.priority === 'urgent' ? (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      notification.priority === 'urgent' 
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {notification.priority === 'urgent' ? 'Urgent' : 'High Priority'}
                    </span>
                    
                    {!notification.isRead && (
                      <Button 
                        size="small" 
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Features Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">🧠 Smart Features Active</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Intelligent reminder scheduling berdasarkan behavioral patterns</li>
          <li>• Contextual notifications untuk stress dan mood detection</li>
          <li>• Smart scheduling untuk optimal meditation times</li>
          <li>• Achievement celebrations dan milestone notifications</li>
          <li>• Weekly progress summaries dengan personalized encouragement</li>
        </ul>
      </div>
    </div>
  );
};