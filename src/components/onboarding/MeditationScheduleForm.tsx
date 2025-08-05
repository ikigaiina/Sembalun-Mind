import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { MeditationSchedule } from '../../types/auth';

interface MeditationScheduleFormProps {
  onSuccess?: () => void;
}

const PREFERRED_TIMES = [
  { id: 'morning', label: 'Morning', desc: '6:00 - 10:00 AM', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', desc: '12:00 - 5:00 PM', icon: '☀️' },
  { id: 'evening', label: 'Evening', desc: '6:00 - 9:00 PM', icon: '🌆' },
  { id: 'night', label: 'Night', desc: '9:00 PM - 12:00 AM', icon: '🌙' },
];

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', full: 'Sunday' },
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' },
];

export const MeditationScheduleForm: React.FC<MeditationScheduleFormProps> = ({ onSuccess }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<MeditationSchedule>({
    preferredTimes: ['morning'],
    duration: 10,
    frequency: 'daily',
    reminders: {
      enabled: true,
      times: ['07:00'],
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    },
    quietHours: {
      start: '22:00',
      end: '07:00',
    },
  });

  useEffect(() => {
    if (userProfile?.schedule) {
      setFormData(userProfile.schedule);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile({
        schedule: formData,
      });
      setSuccess('Schedule saved successfully!');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferredTimeToggle = (timeId: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes?.includes(timeId)
        ? prev.preferredTimes.filter(t => t !== timeId)
        : [...(prev.preferredTimes || []), timeId]
    }));
  };

  const handleReminderDayToggle = (dayId: number) => {
    setFormData(prev => ({
      ...prev,
      reminders: {
        ...prev.reminders!,
        daysOfWeek: prev.reminders?.daysOfWeek?.includes(dayId)
          ? prev.reminders.daysOfWeek.filter(d => d !== dayId)
          : [...(prev.reminders?.daysOfWeek || []), dayId]
      }
    }));
  };

  const addReminderTime = () => {
    const newTime = '07:00'; // Default time
    setFormData(prev => ({
      ...prev,
      reminders: {
        ...prev.reminders!,
        times: [...(prev.reminders?.times || []), newTime]
      }
    }));
  };

  const updateReminderTime = (index: number, time: string) => {
    setFormData(prev => ({
      ...prev,
      reminders: {
        ...prev.reminders!,
        times: prev.reminders?.times?.map((t, i) => i === index ? time : t) || []
      }
    }));
  };

  const removeReminderTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reminders: {
        ...prev.reminders!,
        times: prev.reminders?.times?.filter((_, i) => i !== index) || []
      }
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 font-heading mb-2">
          Create Your Practice Schedule
        </h2>
        <p className="text-gray-600">
          Set up your meditation routine with personalized reminders and preferences.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            When do you prefer to meditate? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PREFERRED_TIMES.map((time) => (
              <div
                key={time.id}
                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                  formData.preferredTimes?.includes(time.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePreferredTimeToggle(time.id)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{time.icon}</div>
                  <h3 className="font-medium text-gray-900 mb-1">{time.label}</h3>
                  <p className="text-xs text-gray-600">{time.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Duration
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={25}>25 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'weekly' | 'custom' }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">
              Meditation Reminders
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.reminders?.enabled || false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  reminders: {
                    ...prev.reminders!,
                    enabled: e.target.checked
                  }
                }))}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">Enable reminders</span>
            </label>
          </div>

          {formData.reminders?.enabled && (
            <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Reminder Times
                </label>
                <div className="space-y-3">
                  {formData.reminders.times?.map((time, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateReminderTime(index, e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {(formData.reminders?.times?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => removeReminderTime(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {(formData.reminders?.times?.length || 0) < 3 && (
                    <button
                      type="button"
                      onClick={addReminderTime}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      + Add another time
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Reminder Days
                </label>
                <div className="flex space-x-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleReminderDayToggle(day.id)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                        formData.reminders?.daysOfWeek?.includes(day.id)
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      title={day.full}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Quiet Hours (No notifications during this time)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start time</label>
              <input
                type="time"
                value={formData.quietHours?.start || '22:00'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  quietHours: {
                    ...prev.quietHours!,
                    start: e.target.value
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End time</label>
              <input
                type="time"
                value={formData.quietHours?.end || '07:00'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  quietHours: {
                    ...prev.quietHours!,
                    end: e.target.value
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
};