// Shared types for onboarding components to prevent circular dependencies
// This file breaks the circular import chain that was causing 'C' variable initialization errors

import type { MoodType } from '../../types/mood';

// Core onboarding types
export type OnboardingStrategy = 'experience-first' | 'auth-first' | 'progressive-trust';
export type UserCommitmentLevel = 'curious' | 'interested' | 'committed' | 'loyal';
export type OnboardingStep = 'introduction' | 'cultural' | 'experience' | 'mood' | 'conversion' | 'social-auth' | 'complete';

// Cultural personalization types
export interface CulturalData {
  region?: string;
  language?: string;
  spiritualTradition?: 'islam' | 'kristen' | 'katolik' | 'hindu' | 'buddha' | 'kong-hu-cu' | 'kepercayaan-lokal' | 'tidak-ada';
  culturalBackground?: 'jawa' | 'sunda' | 'batak' | 'minang' | 'bali' | 'dayak' | 'papua' | 'betawi' | 'bugis' | 'other';
  meditationFamiliarity?: 'none' | 'basic' | 'familiar' | 'experienced';
  preferredLanguage?: 'bahasa-indonesia' | 'bahasa-daerah' | 'english' | 'mixed';
  culturalValues?: string[];
  lifeStage?: 'pelajar' | 'mahasiswa' | 'bekerja' | 'keluarga' | 'pensiun';
}

// Personalization goal types
export type PersonalizationGoal = 
  | 'stress-reduction'
  | 'focus-improvement' 
  | 'emotional-balance'
  | 'sleep-better'
  | 'spiritual-growth'
  | 'productivity'
  | 'relationships'
  | 'self-awareness';

// User engagement metrics
export interface UserEngagement {
  culturalRelevance: number;
  experienceCompletion: number;
  moodImprovement: number;
  valuePerceived: number;
}

// Experience-first flow state
export interface ExperienceFirstFlow {
  currentStep: OnboardingStep;
  stepProgress: number;
  totalSteps: number;
  userEngagement: UserEngagement;
  conversionReadiness: number;
}

// Indonesian user behavior patterns
export interface IndonesianUserBehavior {
  trustBuildingRequired: boolean;
  socialProofImportant: boolean;
  familyInfluenceHigh: boolean;
  valueBeforeCommitment: boolean;
  priceSensitive: boolean;
  dataConsciousBandwidth: boolean;
}

// Onboarding decision engine
export interface OnboardingDecisionEngine {
  strategy: OnboardingStrategy;
  deferAuthenticationUntil: 'value-demonstrated' | 'feature-engagement' | 'day-2-return';
  culturalTrustBuilders: string[];
  conversionOptimizationPoints: string[];
}

// Step data interface - unified to prevent conflicts
export interface OnboardingStepData {
  cultural?: CulturalData;
  experienceRating?: number;
  moodBefore?: MoodType;
  moodAfter?: MoodType;
  goal?: PersonalizationGoal;
  progressSaved?: boolean;
  socialProofSeen?: boolean;
  authenticatedUser?: boolean;
}

// Step configuration
export interface OnboardingStepConfig {
  order: number;
  title: string;
  subtitle: string;
  icon: string;
  duration: number; // seconds expected
  authRequired: boolean;
  valueProposition: string;
}

// Conversion metrics
export interface ConversionMetrics {
  culturalRelevance: number;
  experienceCompletion: number;
  moodImprovement: number;
  valuePerceived: number;
  conversionReadiness: number;
}

// Onboarding completion data
export interface OnboardingCompletionData {
  strategy: OnboardingStrategy;
  completedSteps: OnboardingStep[];
  stepData: OnboardingStepData;
  conversionMetrics: ConversionMetrics;
  completedAt: Date;
  totalTimeSpent: number;
}

// Component props interfaces
export interface OnboardingStepProps {
  onComplete: (data: OnboardingStepData) => void;
  onSkip?: () => void;
  culturalData?: CulturalData;
}

export interface OnboardingFlowProps {
  onStepComplete: (step: OnboardingStep, data: OnboardingStepData) => void;
  onFlowComplete: (finalData: OnboardingStepData & { strategy: OnboardingStrategy }) => void;
  culturalHints?: Partial<CulturalData>;
  initialStep?: OnboardingStep;
}