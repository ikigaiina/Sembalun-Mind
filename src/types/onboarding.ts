// Shared onboarding types
export type PersonalizationGoal = 'stress' | 'focus' | 'sleep' | 'anxiety' | 'confidence' | 'spiritual' | 'general';

export interface UserProfile {
  name: string;
  email?: string;
  age?: number;
  experience?: 'none' | 'beginner' | 'intermediate' | 'advanced';
  goals?: PersonalizationGoal[];
}

export interface OnboardingData {
  profile: UserProfile;
  goal: PersonalizationGoal;
  experience: 'none' | 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: number;
  preferences: {
    language: 'id' | 'en';
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    audioReminders: boolean;
    vibrations: boolean;
  };
  personalityTraits?: {
    introvert: boolean;
    extrovert: boolean;
    analytical: boolean;
    creative: boolean;
    emotional: boolean;
    practical: boolean;
  };
  culturalPreferences?: {
    region?: 'jawa' | 'bali' | 'sumatra' | 'kalimantan' | 'sulawesi' | 'ntt' | 'maluku' | 'papua';
    tradition?: 'islam' | 'hindu' | 'buddha' | 'kristen' | 'katolik' | 'spiritual';
    language?: 'indonesia' | 'jawa' | 'sunda' | 'bali' | 'batak' | 'minang';
  };
  availableTimes?: string[];
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  motivations?: string[];
}