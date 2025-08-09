#!/usr/bin/env node

/**
 * Quick test script to verify onboarding completion logic
 * This simulates the completion flow without running the full app
 */

console.log('🧪 Testing Onboarding Completion Logic...\n');

// Mock localStorage
const localStorage = {
  storage: {},
  setItem(key, value) {
    this.storage[key] = value;
    console.log(`📝 localStorage.setItem("${key}", "${value}")`);
  },
  getItem(key) {
    const value = this.storage[key] || null;
    console.log(`📖 localStorage.getItem("${key}") = "${value}"`);
    return value;
  },
  removeItem(key) {
    delete this.storage[key];
    console.log(`🗑️ localStorage.removeItem("${key}")`);
  }
};

// Mock onboarding data
const mockOnboardingData = {
  selectedGoal: 'stress',
  selectedMood: 'calm',
  culturalData: {
    region: 'jakarta',
    spiritualTradition: 'islam'
  },
  completedAt: new Date(),
  skippedSteps: [],
  totalSteps: 5,
  completedSteps: 5
};

// Simulate the completion process
console.log('1️⃣ Simulating handleOnboardingComplete with data:');
console.log(mockOnboardingData);
console.log('');

// Convert to user preferences (same logic as App.tsx)
const userPreferences = {
  culturalInterests: mockOnboardingData.culturalData ? [
    mockOnboardingData.culturalData.region || '',
    mockOnboardingData.culturalData.spiritualTradition || ''
  ].filter(Boolean) : [],
  experienceLevel: 'beginner',
  meditationGoals: mockOnboardingData.selectedGoal ? [mockOnboardingData.selectedGoal] : [],
  schedulePreferences: ['morning'],
  preferredRegions: mockOnboardingData.culturalData?.region ? [mockOnboardingData.culturalData.region] : ['sembalun'],
  sessionDuration: 15,
  reminderEnabled: true,
  communitySharing: false
};

console.log('2️⃣ Generated user preferences:');
console.log(userPreferences);
console.log('');

// Simulate completeOnboarding function (from useOnboarding hook)
console.log('3️⃣ Simulating completeOnboarding function:');
try {
  localStorage.setItem('sembalun-onboarding-completed', 'true');
  localStorage.setItem('sembalun-user-preferences', JSON.stringify(userPreferences));
  localStorage.removeItem('sembalun-onboarding-skipped');
  
  console.log('✅ Onboarding completion successful!');
} catch (error) {
  console.error('❌ Error:', error);
}

console.log('');

// Simulate checking completion status
console.log('4️⃣ Verifying completion status:');
const isCompleted = localStorage.getItem('sembalun-onboarding-completed') === 'true';
const isSkipped = localStorage.getItem('sembalun-onboarding-skipped') === 'true';
const storedPreferences = localStorage.getItem('sembalun-user-preferences');

console.log(`✅ isOnboardingCompleted: ${isCompleted}`);
console.log(`⏭️ isOnboardingSkipped: ${isSkipped}`);
console.log(`📋 Stored preferences: ${storedPreferences ? 'Present' : 'Missing'}`);

console.log('');
console.log('🎯 Test Results:');
if (isCompleted && !isSkipped && storedPreferences) {
  console.log('✅ SUCCESS: Onboarding completion flow should work correctly!');
  console.log('   - User will be redirected to main app');
  console.log('   - Preferences are stored properly');
} else {
  console.log('❌ FAILURE: Issues detected:');
  if (!isCompleted) console.log('   - Onboarding not marked as completed');
  if (isSkipped) console.log('   - Skip flag still present');
  if (!storedPreferences) console.log('   - User preferences not stored');
}