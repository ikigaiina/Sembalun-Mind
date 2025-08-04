import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface TimeSlot {
  time: string;
  enabled: boolean;
}

interface ScheduleDay {
  dayOfWeek: number;
  name: string;
  enabled: boolean;
  timeSlots: TimeSlot[];
}

interface MeditationSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  preferredTimes: string[];
  duration: number;
  reminderSettings: {
    enabled: boolean;
    advanceMinutes: number;
    sound: boolean;
    vibration: boolean;
  };
  flexibilityWindow: number; // minutes before/after preferred time
  scheduleWeek: ScheduleDay[];
  adaptiveScheduling: boolean; // AI-powered schedule adjustments
  goalTracking: {
    weeklyGoal: number; // minutes per week
    dailyStreak: number;
    weeklyStreak: number;
    longestStreak: number;
  };
}

export const MeditationScheduleSetup: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [schedule, setSchedule] = useState<MeditationSchedule>({
    enabled: true,
    frequency: 'daily',
    preferredTimes: ['07:00'],
    duration: 10,
    reminderSettings: {
      enabled: true,
      advanceMinutes: 10,
      sound: true,
      vibration: true
    },
    flexibilityWindow: 30,
    adaptiveScheduling: false,
    scheduleWeek: [
      { dayOfWeek: 1, name: 'Monday', enabled: true, timeSlots: [{ time: '07:00', enabled: true }] },
      { dayOfWeek: 2, name: 'Tuesday', enabled: true, timeSlots: [{ time: '07:00', enabled: true }] },
      { dayOfWeek: 3, name: 'Wednesday', enabled: true, timeSlots: [{ time: '07:00', enabled: true }] },
      { dayOfWeek: 4, name: 'Thursday', enabled: true, timeSlots: [{ time: '07:00', enabled: true }] },
      { dayOfWeek: 5, name: 'Friday', enabled: true, timeSlots: [{ time: '07:00', enabled: true }] },
      { dayOfWeek: 6, name: 'Saturday', enabled: true, timeSlots: [{ time: '08:00', enabled: true }] },
      { dayOfWeek: 0, name: 'Sunday', enabled: true, timeSlots: [{ time: '08:00', enabled: true }] }
    ],
    goalTracking: {
      weeklyGoal: 70, // 10 minutes * 7 days
      dailyStreak: 0,
      weeklyStreak: 0,
      longestStreak: 0
    }
  });

  // Load existing schedule from user profile
  useEffect(() => {
    if (userProfile?.meditationSchedule) {
      setSchedule(prev => ({ 
        ...prev, 
        ...userProfile.meditationSchedule,
        frequency: userProfile.meditationSchedule?.frequency || 'daily'
      }));
    }
  }, [userProfile]);

  const predefinedSchedules = [
    {
      name: 'Morning Mindfulness',
      description: 'Start each day with intention',
      icon: '🌅',
      schedule: {
        frequency: 'daily' as const,
        preferredTimes: ['07:00'],
        duration: 10,
        scheduleWeek: schedule.scheduleWeek.map(day => ({
          ...day,
          timeSlots: [{ time: day.dayOfWeek === 0 || day.dayOfWeek === 6 ? '08:00' : '07:00', enabled: true }]
        }))
      }
    },
    {
      name: 'Lunch Break Reset',
      description: 'Recharge during midday',
      icon: '☀️',
      schedule: {
        frequency: 'daily' as const,
        preferredTimes: ['12:00'],
        duration: 5,
        scheduleWeek: schedule.scheduleWeek.map(day => ({
          ...day,
          enabled: day.dayOfWeek >= 1 && day.dayOfWeek <= 5, // Weekdays only
          timeSlots: [{ time: '12:00', enabled: true }]
        }))
      }
    },
    {
      name: 'Evening Wind-down',
      description: 'Relax before bedtime',
      icon: '🌙',
      schedule: {
        frequency: 'daily' as const,
        preferredTimes: ['21:00'],
        duration: 15,
        scheduleWeek: schedule.scheduleWeek.map(day => ({
          ...day,
          timeSlots: [{ time: '21:00', enabled: true }]
        }))
      }
    },
    {
      name: 'Weekend Warrior',
      description: 'Longer sessions on weekends',
      icon: '🏖️',
      schedule: {
        frequency: 'weekly' as const,
        preferredTimes: ['09:00'],
        duration: 20,
        scheduleWeek: schedule.scheduleWeek.map(day => ({
          ...day,
          enabled: day.dayOfWeek === 0 || day.dayOfWeek === 6, // Weekends only
          timeSlots: [{ time: '09:00', enabled: true }]
        }))
      }
    }
  ];

  const durations = [5, 10, 15, 20, 30, 45, 60];
  const reminderTimes = [5, 10, 15, 30, 60];
  const flexibilityOptions = [0, 15, 30, 60, 120];

  const handleSchedulePreset = (preset: typeof predefinedSchedules[0]) => {
    setSchedule(prev => ({
      ...prev,
      ...preset.schedule,
      goalTracking: {
        ...prev.goalTracking,
        weeklyGoal: calculateWeeklyGoal(preset.schedule.scheduleWeek, preset.schedule.duration)
      }
    }));
  };

  const calculateWeeklyGoal = (weekSchedule: ScheduleDay[], duration: number) => {
    const enabledDays = weekSchedule.filter(day => day.enabled).length;
    return enabledDays * duration;
  };

  const handleDayToggle = (dayIndex: number) => {
    setSchedule(prev => {
      const newScheduleWeek = [...prev.scheduleWeek];
      newScheduleWeek[dayIndex] = {
        ...newScheduleWeek[dayIndex],
        enabled: !newScheduleWeek[dayIndex].enabled
      };
      
      return {
        ...prev,
        scheduleWeek: newScheduleWeek,
        goalTracking: {
          ...prev.goalTracking,
          weeklyGoal: calculateWeeklyGoal(newScheduleWeek, prev.duration)
        }
      };
    });
  };

  const handleTimeChange = (dayIndex: number, timeSlotIndex: number, newTime: string) => {
    setSchedule(prev => {
      const newScheduleWeek = [...prev.scheduleWeek];
      newScheduleWeek[dayIndex].timeSlots[timeSlotIndex].time = newTime;
      return { ...prev, scheduleWeek: newScheduleWeek };
    });
  };

  const addTimeSlot = (dayIndex: number) => {
    setSchedule(prev => {
      const newScheduleWeek = [...prev.scheduleWeek];
      newScheduleWeek[dayIndex].timeSlots.push({ time: '19:00', enabled: true });
      return { ...prev, scheduleWeek: newScheduleWeek };
    });
  };

  const removeTimeSlot = (dayIndex: number, timeSlotIndex: number) => {
    setSchedule(prev => {
      const newScheduleWeek = [...prev.scheduleWeek];
      newScheduleWeek[dayIndex].timeSlots.splice(timeSlotIndex, 1);
      return { ...prev, scheduleWeek: newScheduleWeek };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile({
        meditationSchedule: schedule
      });
      setSuccess('Meditation schedule saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const getScheduleSummary = () => {
    const enabledDays = schedule.scheduleWeek.filter(day => day.enabled).length;
    const totalSessions = schedule.scheduleWeek.reduce((sum, day) => 
      sum + (day.enabled ? day.timeSlots.length : 0), 0
    );
    
    return {
      enabledDays,
      totalSessions,
      weeklyGoal: schedule.goalTracking.weeklyGoal
    };
  };

  const summary = getScheduleSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-purple/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Meditation Schedule Setup
        </h3>
        <p className="text-gray-600">
          Create a personalized meditation schedule that fits your lifestyle and helps you build a consistent practice.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Quick Setup</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predefinedSchedules.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleSchedulePreset(preset)}
              className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-200 text-left"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{preset.icon}</span>
                <div>
                  <h5 className="font-medium text-gray-900">{preset.name}</h5>
                  <p className="text-sm text-gray-600">{preset.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Schedule Settings</h4>
        
        <div className="space-y-6">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Default session duration: {schedule.duration} minutes
            </label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {durations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSchedule(prev => ({ 
                    ...prev, 
                    duration,
                    goalTracking: {
                      ...prev.goalTracking,
                      weeklyGoal: calculateWeeklyGoal(prev.scheduleWeek, duration)
                    }
                  }))}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                    schedule.duration === duration
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {duration}m
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Schedule */}
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Weekly Schedule</h5>
            <div className="space-y-3">
              {schedule.scheduleWeek.map((day, dayIndex) => (
                <div key={day.dayOfWeek} className="flex items-center space-x-4 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleDayToggle(dayIndex)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        day.enabled ? 'bg-primary border-primary' : 'border-gray-300'
                      }`}
                    >
                      {day.enabled && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className="font-medium text-gray-900 min-w-0">{day.name}</span>
                  </div>
                  
                  {day.enabled && (
                    <div className="flex items-center space-x-2">
                      {day.timeSlots.map((timeSlot, timeIndex) => (
                        <div key={timeIndex} className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={timeSlot.time}
                            onChange={(e) => handleTimeChange(dayIndex, timeIndex, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          {day.timeSlots.length > 1 && (
                            <button
                              onClick={() => removeTimeSlot(dayIndex, timeIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addTimeSlot(dayIndex)}
                        className="text-primary hover:text-primary/70 text-sm"
                      >
                        + Add time
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Reminder Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Enable reminders</div>
              <div className="text-sm text-gray-600">Get notified when it's time to meditate</div>
            </div>
            <button
              onClick={() => setSchedule(prev => ({
                ...prev,
                reminderSettings: { ...prev.reminderSettings, enabled: !prev.reminderSettings.enabled }
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                schedule.reminderSettings.enabled ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  schedule.reminderSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {schedule.reminderSettings.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Remind me {schedule.reminderSettings.advanceMinutes} minutes before
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {reminderTimes.map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => setSchedule(prev => ({
                        ...prev,
                        reminderSettings: { ...prev.reminderSettings, advanceMinutes: minutes }
                      }))}
                      className={`p-2 rounded-lg border-2 transition-all duration-200 text-sm ${
                        schedule.reminderSettings.advanceMinutes === minutes
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Sound notification</span>
                  <button
                    onClick={() => setSchedule(prev => ({
                      ...prev,
                      reminderSettings: { ...prev.reminderSettings, sound: !prev.reminderSettings.sound }
                    }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      schedule.reminderSettings.sound ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        schedule.reminderSettings.sound ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Vibration</span>
                  <button
                    onClick={() => setSchedule(prev => ({
                      ...prev,
                      reminderSettings: { ...prev.reminderSettings, vibration: !prev.reminderSettings.vibration }
                    }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      schedule.reminderSettings.vibration ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        schedule.reminderSettings.vibration ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Advanced Settings</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Flexibility window: ±{schedule.flexibilityWindow} minutes
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Allow meditation sessions within this time range of scheduled time
            </p>
            <div className="grid grid-cols-5 gap-2">
              {flexibilityOptions.map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setSchedule(prev => ({ ...prev, flexibilityWindow: minutes }))}
                  className={`p-2 rounded-lg border-2 transition-all duration-200 text-sm ${
                    schedule.flexibilityWindow === minutes
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {minutes === 0 ? 'Strict' : `±${minutes}m`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Adaptive scheduling</div>
              <div className="text-sm text-gray-600">AI adjusts schedule based on your patterns (Coming soon)</div>
            </div>
            <button
              disabled
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 opacity-50 cursor-not-allowed"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Schedule Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.enabledDays}</div>
            <div className="text-sm text-gray-600">Days per week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.totalSessions}</div>
            <div className="text-sm text-gray-600">Sessions per week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.weeklyGoal}</div>
            <div className="text-sm text-gray-600">Minutes per week</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? 'Saving...' : 'Save Schedule'}
        </Button>
      </div>
    </div>
  );
};