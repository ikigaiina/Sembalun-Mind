import React, { useState, useEffect } from 'react';
import { User, Brain, Heart, Clock, Target, Sliders, Save, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface PersonalizationProfile {
  goals: {
    primary: 'stress_relief' | 'better_sleep' | 'focus_improvement' | 'emotional_balance' | 'spiritual_growth';
    secondary: string[];
    customGoal?: string;
  };
  preferences: {
    sessionDuration: number; // minutes
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';
    voicePreference: 'male' | 'female' | 'neutral';
    language: 'id' | 'en';
    backgroundSounds: 'nature' | 'music' | 'silence' | 'white_noise';
    reminderFrequency: 'daily' | 'weekdays' | 'weekends' | 'custom' | 'none';
  };
  lifestyle: {
    sleepSchedule: {
      bedtime: string; // HH:mm
      wakeTime: string; // HH:mm
    };
    workSchedule: 'standard' | 'shift_work' | 'flexible' | 'remote' | 'student';
    stressLevel: number; // 1-10
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    availableTime: number; // minutes per day
  };
  interests: {
    categories: string[];
    techniques: string[];
    topics: string[];
  };
  adaptiveSettings: {
    autoAdjustDifficulty: boolean;
    personalizedRecommendations: boolean;
    adaptToMood: boolean;
    progressBasedSuggestions: boolean;
  };
}

interface RecommendationCard {
  id: string;
  type: 'session' | 'content' | 'schedule' | 'goal';
  title: string;
  description: string;
  reasoning: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
}

const Personalization: React.FC = () => {
  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [activeSection, setActiveSection] = useState<'goals' | 'preferences' | 'lifestyle' | 'interests' | 'adaptive'>('goals');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Mock data - in real app, fetch from personalization service
    setTimeout(() => {
      setProfile({
        goals: {
          primary: 'stress_relief',
          secondary: ['better_sleep', 'focus_improvement'],
          customGoal: 'Improve work-life balance'
        },
        preferences: {
          sessionDuration: 15,
          preferredTime: 'evening',
          voicePreference: 'female',
          language: 'id',
          backgroundSounds: 'nature',
          reminderFrequency: 'daily'
        },
        lifestyle: {
          sleepSchedule: {
            bedtime: '22:30',
            wakeTime: '06:30'
          },
          workSchedule: 'standard',
          stressLevel: 7,
          experienceLevel: 'intermediate',
          availableTime: 20
        },
        interests: {
          categories: ['mindfulness', 'stress_relief', 'sleep'],
          techniques: ['breathing', 'body_scan', 'loving_kindness'],
          topics: ['workplace_wellness', 'emotional_intelligence', 'self_compassion']
        },
        adaptiveSettings: {
          autoAdjustDifficulty: true,
          personalizedRecommendations: true,
          adaptToMood: true,
          progressBasedSuggestions: true
        }
      });

      setRecommendations([
        {
          id: '1',
          type: 'session',
          title: 'Try Evening Stress Relief Sessions',
          description: 'Based on your stress level and evening preference, we recommend stress relief sessions before bedtime.',
          reasoning: 'Your stress level is 7/10 and you prefer evening sessions',
          action: 'Start 10-minute evening routine',
          priority: 'high',
          estimatedImpact: 'May improve sleep quality by 30%'
        },
        {
          id: '2',
          type: 'schedule',
          title: 'Optimize Your Session Timing',
          description: 'Consider moving your sessions 1 hour before bedtime for better sleep preparation.',
          reasoning: 'Current bedtime: 22:30, optimal session time: 21:30',
          action: 'Adjust reminder to 21:30',
          priority: 'medium',
          estimatedImpact: 'Better transition to sleep'
        },
        {
          id: '3',
          type: 'content',
          title: 'Workplace Mindfulness Content',
          description: 'New workplace wellness content matches your interests and goals.',
          reasoning: 'Interested in workplace wellness + stress relief goal',
          action: 'Explore workplace series',
          priority: 'medium',
          estimatedImpact: 'Enhanced work-life balance'
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // In real app, save to personalization service
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasUnsavedChanges(false);
      
      // Generate new recommendations based on changes
      // This would be done by the AI service in real app
      
    } catch (error) {
      console.error('Error saving personalization:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section: keyof PersonalizationProfile, field: string, value: unknown) => {
    if (profile) {
      setProfile(prev => ({
        ...prev!,
        [section]: {
          ...prev![section],
          [field]: value
        }
      }));
      setHasUnsavedChanges(true);
    }
  };

  const handleArrayToggle = (section: keyof PersonalizationProfile, field: string, item: string) => {
    if (profile) {
      const currentArray = (profile[section] as Record<string, string[]>)[field];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      
      setProfile(prev => ({
        ...prev!,
        [section]: {
          ...prev![section],
          [field]: newArray
        }
      }));
      setHasUnsavedChanges(true);
    }
  };

  const sections = [
    { id: 'goals', label: 'Goals & Intentions', icon: Target },
    { id: 'preferences', label: 'Session Preferences', icon: Sliders },
    { id: 'lifestyle', label: 'Lifestyle & Schedule', icon: Clock },
    { id: 'interests', label: 'Interests & Topics', icon: Heart },
    { id: 'adaptive', label: 'AI Personalization', icon: Brain }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading your personalization settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalization</h1>
              <p className="text-gray-600">Customize your meditation experience with AI-powered recommendations</p>
            </div>
            
            {hasUnsavedChanges && (
              <Button
                variant="primary"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeSection === section.id
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* User Profile Summary */}
            {profile && (
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
                <User className="w-12 h-12 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Hello, {profile.goals.primary as string}!</h2>
                  <p className="text-gray-600">Your personalization journey starts here.</p>
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">AI Recommendations</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map(rec => (
                  <div key={rec.id} className={`p-4 border rounded-lg ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{rec.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <p className="text-xs text-gray-500 mb-3">{rec.reasoning}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <TrendingUp className="w-3 h-3" />
                        <span>{rec.estimatedImpact}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        {rec.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings Sections */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeSection === 'goals' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Goals & Intentions</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What is your primary meditation goal?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { id: 'stress_relief', label: 'Stress Relief', desc: 'Manage and reduce daily stress' },
                        { id: 'better_sleep', label: 'Better Sleep', desc: 'Improve sleep quality and rest' },
                        { id: 'focus_improvement', label: 'Focus & Concentration', desc: 'Enhance mental clarity' },
                        { id: 'emotional_balance', label: 'Emotional Balance', desc: 'Develop emotional intelligence' },
                        { id: 'spiritual_growth', label: 'Spiritual Growth', desc: 'Deepen spiritual connection' }
                      ].map(goal => (
                        <label key={goal.id} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="primaryGoal"
                            value={goal.id}
                            checked={profile?.goals.primary === goal.id}
                            onChange={(e) => handleInputChange('goals', 'primary', e.target.value)}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{goal.label}</div>
                            <div className="text-sm text-gray-500">{goal.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Secondary goals (optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['better_sleep', 'focus_improvement', 'emotional_balance', 'spiritual_growth', 'anxiety_management', 'self_compassion'].map(goal => (
                        <label key={goal} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={profile?.goals.secondary.includes(goal)}
                            onChange={() => handleArrayToggle('goals', 'secondary', goal)}
                          />
                          <span className="text-sm capitalize">{goal.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Goal (optional)
                    </label>
                    <Input
                      value={profile?.goals.customGoal || ''}
                      onChange={(e) => handleInputChange('goals', 'customGoal', e.target.value)}
                      placeholder="Describe your personal meditation goal..."
                    />
                  </div>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Session Preferences</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Session Duration
                      </label>
                      <select
                        value={profile?.preferences.sessionDuration}
                        onChange={(e) => handleInputChange('preferences', 'sessionDuration', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={20}>20 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time
                      </label>
                      <select
                        value={profile?.preferences.preferredTime}
                        onChange={(e) => handleInputChange('preferences', 'preferredTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="morning">Morning (6-11 AM)</option>
                        <option value="afternoon">Afternoon (12-5 PM)</option>
                        <option value="evening">Evening (6-9 PM)</option>
                        <option value="night">Night (10 PM+)</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Voice Preference
                      </label>
                      <select
                        value={profile?.preferences.voicePreference}
                        onChange={(e) => handleInputChange('preferences', 'voicePreference', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="female">Female Voice</option>
                        <option value="male">Male Voice</option>
                        <option value="neutral">No Preference</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Sounds
                      </label>
                      <select
                        value={profile?.preferences.backgroundSounds}
                        onChange={(e) => handleInputChange('preferences', 'backgroundSounds', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="nature">Nature Sounds</option>
                        <option value="music">Ambient Music</option>
                        <option value="white_noise">White Noise</option>
                        <option value="silence">Silence</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'lifestyle' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Lifestyle & Schedule</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bedtime
                      </label>
                      <Input
                        type="time"
                        value={profile?.lifestyle.sleepSchedule.bedtime}
                        onChange={(e) => handleInputChange('lifestyle', 'sleepSchedule', {
                          ...profile?.lifestyle.sleepSchedule,
                          bedtime: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wake Time
                      </label>
                      <Input
                        type="time"
                        value={profile?.lifestyle.sleepSchedule.wakeTime}
                        onChange={(e) => handleInputChange('lifestyle', 'sleepSchedule', {
                          ...profile?.lifestyle.sleepSchedule,
                          wakeTime: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Schedule
                      </label>
                      <select
                        value={profile?.lifestyle.workSchedule}
                        onChange={(e) => handleInputChange('lifestyle', 'workSchedule', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="standard">Standard (9-5)</option>
                        <option value="shift_work">Shift Work</option>
                        <option value="flexible">Flexible Hours</option>
                        <option value="remote">Remote Work</option>
                        <option value="student">Student</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Level
                      </label>
                      <select
                        value={profile?.lifestyle.experienceLevel}
                        onChange={(e) => handleInputChange('lifestyle', 'experienceLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Stress Level: {profile?.lifestyle.stressLevel}/10
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={profile?.lifestyle.stressLevel}
                        onChange={(e) => handleInputChange('lifestyle', 'stressLevel', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Time per Day (minutes)
                      </label>
                      <Input
                        type="number"
                        min="5"
                        max="120"
                        value={profile?.lifestyle.availableTime}
                        onChange={(e) => handleInputChange('lifestyle', 'availableTime', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'interests' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Interests & Topics</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Meditation Categories
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['mindfulness', 'stress_relief', 'sleep', 'focus', 'compassion', 'movement', 'spiritual', 'workplace'].map(category => (
                        <label key={category} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={profile?.interests.categories.includes(category)}
                            onChange={() => handleArrayToggle('interests', 'categories', category)}
                          />
                          <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Techniques
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['breathing', 'body_scan', 'loving_kindness', 'visualization', 'mantra', 'walking', 'noting', 'zen'].map(technique => (
                        <label key={technique} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={profile?.interests.techniques.includes(technique)}
                            onChange={() => handleArrayToggle('interests', 'techniques', technique)}
                          />
                          <span className="text-sm capitalize">{technique.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'adaptive' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">AI Personalization</h2>
                  
                  <div className="space-y-4">
                    {[
                      {
                        key: 'autoAdjustDifficulty',
                        label: 'Auto-adjust Difficulty',
                        description: 'Automatically adjust session difficulty based on your progress and feedback'
                      },
                      {
                        key: 'personalizedRecommendations',
                        label: 'Personalized Recommendations',
                        description: 'Receive AI-powered content recommendations based on your goals and progress'
                      },
                      {
                        key: 'adaptToMood',
                        label: 'Adapt to Mood',
                        description: 'Suggest content that matches your current emotional state and needs'
                      },
                      {
                        key: 'progressBasedSuggestions',
                        label: 'Progress-based Suggestions',
                        description: 'Get suggestions for next steps based on your meditation journey and achievements'
                      }
                    ].map(setting => (
                      <div key={setting.key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{setting.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={profile?.adaptiveSettings[setting.key as keyof typeof profile.adaptiveSettings] as boolean}
                            onChange={(e) => handleInputChange('adaptiveSettings', setting.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary peer-focus:ring-opacity-25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Personalization;